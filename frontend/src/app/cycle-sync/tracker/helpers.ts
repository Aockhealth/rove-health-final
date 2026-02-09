import { calculatePhase, getRelevantPeriodStart as getRelevantPeriodStartCanonical, type DailyLog } from "@shared/cycle/phase";
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
  const result = getRelevantPeriodStartCanonical(
    targetDate,
    cycleSettings,
    monthLogs as Record<string, DailyLog>
  );
  return result.start;
};

// Current Day Calculation
export const getCurrentDay = (
  date: Date,
  cycleSettings: CycleSettings,
  monthLogs: Record<string, any>
): number => {
  const result = calculatePhase(date, cycleSettings, monthLogs as Record<string, DailyLog>);
  return result.day || 0;
};

// Phase Calculation
export const getPhaseForDate = (
  date: Date,
  cycleSettings: CycleSettings,
  monthLogs: Record<string, any>
): Phase => {
  const result = calculatePhase(date, cycleSettings, monthLogs as Record<string, DailyLog>);
  return result.phase;
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
