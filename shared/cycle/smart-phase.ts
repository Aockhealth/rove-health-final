/**
 * Shared Cycle Calculation Logic
 * Centralizes the "Smart Logic" for phase calculation.
 * Used by both frontend and backend.
 */

export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export interface CycleSettings {
    last_period_start: string;
    cycle_length_days: number;
    period_length_days: number;
}

export interface DailyLog {
    date: string;
    is_period?: boolean;
}

const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Finds the actual start date of a period streak given a date within that streak.
 * Walks backwards day by day checking logs.
 */
export function findStreakStart(targetDateStr: string, monthLogs: Record<string, DailyLog>): string {
    const [y, m, d] = targetDateStr.split('-').map(Number);
    let cur = new Date(y, m - 1, d);
    cur.setHours(0, 0, 0, 0);
    let first = targetDateStr;

    let lookback = 0;
    while (lookback < 45) {
        cur.setDate(cur.getDate() - 1);
        const prevStr = formatDate(cur);
        if (monthLogs[prevStr]?.is_period) {
            first = prevStr;
        } else {
            break;
        }
        lookback++;
    }
    return first;
}

/**
 * Determines the relevant period start date for a given target date.
 * Checks logs first, then falls back to settings.
 */
export function getRelevantPeriodStart(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog>
): string | null {
    const dateStr = formatDate(targetDate);

    if (monthLogs[dateStr]?.is_period) {
        return findStreakStart(dateStr, monthLogs);
    }

    const loggedDates = Object.keys(monthLogs).filter(d => monthLogs[d]?.is_period).sort().reverse();

    for (const dStr of loggedDates) {
        if (dStr < dateStr) {
            return findStreakStart(dStr, monthLogs);
        }
    }

    if (settings.last_period_start) {
        if (settings.last_period_start <= dateStr) {
            return settings.last_period_start;
        }
    }

    return null;
}

/**
 * Main Smart Phase Calculator
 * Returns the Phase and Day in Cycle, respecting explicit period logs.
 */
export function calculateSmartPhase(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog> = {}
): { phase: Phase, day: number } {
    const dateStr = formatDate(targetDate);

    // 1. Explicit OVERRIDE: If logged as period = Menstrual
    if (monthLogs[dateStr]?.is_period === true) {
        const streakStart = findStreakStart(dateStr, monthLogs);
        const start = new Date(streakStart);
        const diff = Math.floor((targetDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return { phase: "Menstrual", day: diff + 1 };
    }

    // 2. Explicit END: If logged as NOT period
    const isExplicitlyNotPeriod = monthLogs[dateStr] && monthLogs[dateStr].is_period === false;

    // 3. Calculate Day in Cycle based on "Relevant Start"
    const relevantStart = getRelevantPeriodStart(targetDate, settings, monthLogs);

    if (!relevantStart) return { phase: "Menstrual", day: 1 };

    const start = new Date(relevantStart);
    start.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const cycleLength = settings.cycle_length_days || 28;
    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle += cycleLength;

    // 4. Determine Phase
    const periodLength = settings.period_length_days || 5;
    const ovulationDay = cycleLength - 14;

    if (dayInCycle <= periodLength && !isExplicitlyNotPeriod) {
        return { phase: "Menstrual", day: dayInCycle };
    }

    if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) {
        return { phase: "Ovulatory", day: dayInCycle };
    }

    if (dayInCycle > ovulationDay + 1) {
        return { phase: "Luteal", day: dayInCycle };
    }

    return { phase: "Follicular", day: dayInCycle };
}
