import type { Phase, CycleSettings, CalendarDay, Consistency, Appearance, Sensation } from './type';

// Date Formatting
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Date Checks
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// Calendar Generation
export const getCalendarDays = (currentMonth: Date): CalendarDay[] => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const days: CalendarDay[] = [];
  const startPadding = firstDayOfMonth.getDay();

  for (let i = 0; i < startPadding; i++) {
    const d = new Date(year, month, 0 - i);
    days.unshift({ date: d, isPadding: true });
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isPadding: false });
  }

  return days;
};

// Phase Helpers
export const getPhaseColor = (phase: Phase): string => {
  switch (phase) {
    case "Menstrual":
      return "bg-rose-200/40 text-gray-900 hover:bg-rose-200/60";
    case "Follicular":
      return "bg-teal-200/40 text-gray-900 hover:bg-teal-200/60";
    case "Ovulatory":
      return "bg-amber-200/40 text-gray-900 hover:bg-amber-200/60";
    case "Luteal":
      return "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/60";
    default:
      return "bg-gray-100/50 text-gray-400";
  }
};

export const getPhaseDot = (phase: Phase): string => {
  switch (phase) {
    case "Menstrual": return "bg-rose-400";
    case "Follicular": return "bg-teal-400";
    case "Ovulatory": return "bg-amber-400";
    case "Luteal": return "bg-indigo-400";
    default: return "bg-gray-400";
  }
};

// Period Start Calculation
export const getRelevantPeriodStart = (
  targetDate: Date,
  cycleSettings: CycleSettings,
  monthLogs: Record<string, any>
): string | null => {
  const dateStr = formatDate(targetDate);

  const safeGlobalStart = (() => {
    if (!cycleSettings.last_period_start) return null;

    const last = new Date(cycleSettings.last_period_start);
    last.setHours(0, 0, 0, 0);

    const check = new Date(targetDate);
    check.setHours(0, 0, 0, 0);

    return last <= check ? cycleSettings.last_period_start : null;
  })();

  // PAST DATES
  if (isPastDate(targetDate)) {
    if (monthLogs[dateStr]?.is_period) {
      let current = new Date(targetDate);
      let firstDay = dateStr;

      while (true) {
        current.setDate(current.getDate() - 1);
        const prevStr = formatDate(current);
        if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
        else break;
      }
      return firstDay;
    }

    const logDates = Object.keys(monthLogs).sort().reverse();
    for (const d of logDates) {
      if (d < dateStr && monthLogs[d]?.is_period) {
        let current = new Date(d);
        let firstDay = d;

        while (true) {
          current.setDate(current.getDate() - 1);
          const prevStr = formatDate(current);
          if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
          else break;
        }
        return firstDay;
      }
    }

    // Backcasting from global start
    if (cycleSettings.last_period_start) {
      const globalStart = new Date(cycleSettings.last_period_start);
      globalStart.setHours(0, 0, 0, 0);
      const cycleLen = cycleSettings.cycle_length_days || 28;

      if (targetDate < globalStart) {
        const diffTime = globalStart.getTime() - targetDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const cyclesBack = Math.ceil(diffDays / cycleLen);

        const simulatedStart = new Date(globalStart);
        simulatedStart.setDate(globalStart.getDate() - (cyclesBack * cycleLen));
        return formatDate(simulatedStart);
      }
    }

    return null;
  }

  // TODAY / FUTURE
  if (monthLogs[dateStr]?.is_period) {
    let current = new Date(targetDate);
    let firstDay = dateStr;

    while (true) {
      current.setDate(current.getDate() - 1);
      const prevStr = formatDate(current);
      if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
      else break;
    }
    return firstDay;
  }

  const logDates = Object.keys(monthLogs).sort().reverse();
  for (const d of logDates) {
    if (d < dateStr && monthLogs[d]?.is_period) {
      let current = new Date(d);
      let firstDay = d;

      while (true) {
        current.setDate(current.getDate() - 1);
        const prevStr = formatDate(current);
        if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
        else break;
      }
      return firstDay;
    }
  }

  return safeGlobalStart;
};

// Current Day Calculation
export const getCurrentDay = (
  date: Date,
  cycleSettings: CycleSettings,
  monthLogs: Record<string, any>
): number => {
  const startStr = getRelevantPeriodStart(date, cycleSettings, monthLogs);
  if (!startStr) return 1;

  const start = new Date(startStr);
  start.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const diffTime = checkDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (isPastDate(date)) {
    return diffDays + 1;
  }

  const cycleLength = cycleSettings.cycle_length_days || 28;
  let dayInCycle = (diffDays % cycleLength) + 1;
  if (dayInCycle <= 0) dayInCycle += cycleLength;
  return dayInCycle;
};

// Phase Calculation
export const getPhaseForDate = (
  date: Date,
  cycleSettings: CycleSettings,
  monthLogs: Record<string, any>
): Phase => {
  const dateStr = formatDate(date);
  const log = monthLogs[dateStr];
  if (log?.is_period) return "Menstrual";

  const startStr = getRelevantPeriodStart(date, cycleSettings, monthLogs);
  if (!startStr) return "Follicular";

  const start = new Date(startStr);
  start.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const diffTime = checkDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const cycleLength = cycleSettings.cycle_length_days || 28;
  let dayInCycle = (diffDays % cycleLength) + 1;
  if (dayInCycle <= 0) dayInCycle += cycleLength;

  const periodLength = cycleSettings.period_length_days || 5;
  const ovulationDay = cycleLength - 14;

  if (dayInCycle <= periodLength) return "Menstrual";
  if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) return "Ovulatory";
  if (dayInCycle > ovulationDay + 1) return "Luteal";

  return "Follicular";
};

// MPIQ Derived Discharge
export const deriveCervicalDischarge = (
  consistency: Consistency | null,
  appearance: Appearance | null,
  sensation: Sensation | null
): string | null => {
  if (consistency === "Stretchy" || sensation === "Slippery") {
    return "Egg White";
  } else if (sensation === "Wet" || appearance === "Clear") {
    return "Watery";
  } else if (consistency === "Creamy") {
    return "Creamy";
  } else if (consistency === "Tacky") {
    return "Sticky";
  } else if (sensation === "Dry") {
    return "Dry";
  }
  return null;
};

// Toggle Helper
export const toggleItem = (
  item: string,
  list: string[],
  setList: (list: string[]) => void
): void => {
  if (list.includes(item)) {
    setList(list.filter(i => i !== item));
  } else {
    setList([...list, item]);
  }
};