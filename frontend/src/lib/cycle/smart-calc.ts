
/**
 * Shared Cycle Calculation Logic
 * Centralizes the "Smart Logic" used in the Tracker to be used across the app (Home, Plan).
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

    // Safety limit to prevent infinite loops (though unlikely)
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

    // 1. If today is logged as period, find the start of THIS streak
    if (monthLogs[dateStr]?.is_period) {
        return findStreakStart(dateStr, monthLogs);
    }

    // 2. If recent past has period logs, find the start of THAT streak
    // We check backwards from yesterday
    const targetTime = targetDate.getTime();

    // Get all logged dates, sort descending
    const loggedDates = Object.keys(monthLogs).filter(d => monthLogs[d]?.is_period).sort().reverse();

    for (const dStr of loggedDates) {
        // Only look at dates strictly before target
        if (dStr < dateStr) {
            return findStreakStart(dStr, monthLogs);
        }
    }

    // 3. Fallback to Settings if no relevant recent logs found
    if (settings.last_period_start) {
        // Ensure settings start isn't in the future relative to target (unlikely but safe)
        if (settings.last_period_start <= dateStr) {
            return settings.last_period_start;
        }
    }

    return null;
}

/**
 * Main Smart Phase Calculator
 * Returns the Phase and Day in Cycle, respecting explicit "End Period" logs.
 */
export function calculateSmartPhase(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog> = {}
): { phase: Phase, day: number } {
    const dateStr = formatDate(targetDate);

    // 1. Explicit OVERRIDE: If logged as period = Menstrual
    if (monthLogs[dateStr]?.is_period === true) {
        // Calculate day based on streak
        const streakStart = findStreakStart(dateStr, monthLogs);
        const start = new Date(streakStart);
        const diff = Math.floor((targetDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return { phase: "Menstrual", day: diff + 1 };
    }

    // 2. Explicit END: If logged as NOT period, force non-menstrual if within window?
    // Actually, the logic below handles it: if is_period is false, we fall through.
    const isExplicitlyNotPeriod = monthLogs[dateStr] && monthLogs[dateStr].is_period === false;

    // 3. Calculate Day in Cycle based on "Relevant Start"
    const relevantStart = getRelevantPeriodStart(targetDate, settings, monthLogs);

    // Default fallback if no start found
    if (!relevantStart) return { phase: "Menstrual", day: 1 };

    const start = new Date(relevantStart);
    start.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0); // Ensure target is midnight

    const diffTime = targetDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const cycleLength = settings.cycle_length_days || 28;
    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle += cycleLength;

    // 4. Determine Phase
    const periodLength = settings.period_length_days || 5;
    const ovulationDay = cycleLength - 14;

    // Menstrual Logic:
    // If day <= periodLength AND we haven't explicitly said "No Period" -> Menstrual
    if (dayInCycle <= periodLength && !isExplicitlyNotPeriod) {
        return { phase: "Menstrual", day: dayInCycle };
    }

    // If explicit "No Period" (Day 3 logged as false), we consider it Follicular?
    // OR if simply day > periodLength

    // Ovulatory
    if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) {
        return { phase: "Ovulatory", day: dayInCycle };
    }

    // Luteal
    if (dayInCycle > ovulationDay + 1) {
        return { phase: "Luteal", day: dayInCycle };
    }

    // Default to Follicular (e.g. Day 3 with explicit "No Period", or Day 6-12)
    return { phase: "Follicular", day: dayInCycle };
}
