/**
 * Canonical Phase Calculation Module
 * Single Source of Truth for all cycle phase calculations.
 * 
 * @module shared/cycle/phase
 */

// ============================================================================
// TYPES
// ============================================================================

export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export interface CycleSettings {
    last_period_start: string;
    cycle_length_days: number;
    period_length_days: number;
    luteal_length_days?: number; // Optional: defaults to 14
}

export interface DailyLog {
    date: string;
    is_period?: boolean;
}

export interface PhaseResult {
    phase: Phase | null;           // null = insufficient data
    day: number;                   // 0 if no data
    latePeriod: boolean;           // true if past expected cycle length without new period
    confidence: 'low' | 'medium' | 'high';
    dataSource: 'logs' | 'settings' | 'none';
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const DEFAULT_LUTEAL_LENGTH = 14;

// Ovulation window: ±1 day around ovulation for "Ovulatory" phase
export const OVULATION_PHASE_WINDOW = 1;

// Fertility window: wider range for fertility tracking
export const FERTILE_WINDOW_BEFORE = 5;  // Days before ovulation
export const FERTILE_WINDOW_AFTER = 1;   // Days after ovulation

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format a Date object to YYYY-MM-DD string in local time.
 */
export const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Normalize a date to local midnight WITHOUT mutating the input.
 */
export const normalizeToLocalMidnight = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Parse a YYYY-MM-DD string to a Date object at local midnight.
 */
export const parseLocalDate = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
};

/**
 * Calculate days between two dates (ignoring time).
 */
export const daysBetween = (start: Date, end: Date): number => {
    const s = normalizeToLocalMidnight(start);
    const e = normalizeToLocalMidnight(end);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};

// ============================================================================
// PERIOD STREAK DETECTION
// ============================================================================

/**
 * Finds the actual start date of a period streak given a date within that streak.
 * Walks backwards day by day checking logs.
 */
export function findStreakStart(
    targetDateStr: string,
    monthLogs: Record<string, DailyLog>
): string {
    let cur = parseLocalDate(targetDateStr);
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
 * Priority: explicit period logs > settings.last_period_start
 */
export function getRelevantPeriodStart(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog>
): { start: string | null; source: 'logs' | 'settings' | 'none' } {
    const target = normalizeToLocalMidnight(targetDate);
    const dateStr = formatDate(target);

    // 1. If target date is logged as period, find streak start
    if (monthLogs[dateStr]?.is_period) {
        return { start: findStreakStart(dateStr, monthLogs), source: 'logs' };
    }

    // 2. Find most recent logged period before target date
    const loggedDates = Object.keys(monthLogs)
        .filter(d => monthLogs[d]?.is_period)
        .sort()
        .reverse();

    for (const dStr of loggedDates) {
        if (dStr < dateStr) {
            return { start: findStreakStart(dStr, monthLogs), source: 'logs' };
        }
    }

    // 3. Fall back to settings
    if (settings.last_period_start && settings.last_period_start <= dateStr) {
        return { start: settings.last_period_start, source: 'settings' };
    }

    return { start: null, source: 'none' };
}

// ============================================================================
// MAIN PHASE CALCULATOR
// ============================================================================

/**
 * Main Phase Calculator - Single Source of Truth
 * 
 * Returns the phase, day in cycle, and metadata about data quality.
 * DOES NOT mutate input dates.
 */
export function calculatePhase(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog> = {}
): PhaseResult {
    try {
        const target = normalizeToLocalMidnight(targetDate);
        const today = normalizeToLocalMidnight(new Date());
        const dateStr = formatDate(target);

        // 1. Explicit OVERRIDE: If logged as period = Menstrual
        if (monthLogs[dateStr]?.is_period === true) {
            const streakStart = findStreakStart(dateStr, monthLogs);
            const start = parseLocalDate(streakStart);
            const diff = daysBetween(start, target);
            return {
                phase: "Menstrual",
                day: Math.max(diff + 1, 1),
                latePeriod: false,
                confidence: 'high',
                dataSource: 'logs'
            };
        }

        // 2. Find relevant period start
        const { start: relevantStart, source } = getRelevantPeriodStart(target, settings, monthLogs);

        // 3. Handle no data
        if (!relevantStart) {
            return {
                phase: null,
                day: 0,
                latePeriod: false,
                confidence: 'low',
                dataSource: 'none'
            };
        }

        const start = parseLocalDate(relevantStart);
        const diffDays = daysBetween(start, target);

        // Guard: if diffDays is negative (timezone edge case), treat as day 1
        if (diffDays < 0) {
            return {
                phase: "Menstrual",
                day: 1,
                latePeriod: false,
                confidence: 'low',
                dataSource: source
            };
        }

        const cycleLength = settings.cycle_length_days || DEFAULT_CYCLE_LENGTH;
        const periodLength = settings.period_length_days || DEFAULT_PERIOD_LENGTH;
        const lutealLength = settings.luteal_length_days || DEFAULT_LUTEAL_LENGTH;
        const ovulationDay = cycleLength - lutealLength;

        // 4. Check for late period (past expected cycle length, no new period logged)
        const isLate = diffDays >= cycleLength && target <= today;

        // 5. Calculate day in cycle
        let dayInCycle: number;
        if (isLate) {
            // Don't wrap around - show actual days since last period
            dayInCycle = diffDays + 1;
        } else {
            dayInCycle = (diffDays % cycleLength) + 1;
            if (dayInCycle <= 0) dayInCycle += cycleLength;
        }

        // 5b. Forward-period anchoring: if there's a FUTURE logged period within
        //     one cycle, anchor backwards from it instead. This prevents editing
        //     an old period from cascading through months with their own anchors.
        if (!isLate && source !== 'none') {
            const futurePeriodDates = Object.keys(monthLogs)
                .filter(d => monthLogs[d]?.is_period && d > dateStr)
                .sort();

            if (futurePeriodDates.length > 0) {
                const nextPeriodStr = findStreakStart(futurePeriodDates[0], monthLogs);
                const nextStart = parseLocalDate(nextPeriodStr);
                const daysToNext = daysBetween(target, nextStart);
                // If the next period is within one cycle AND anchor gives a valid position
                if (daysToNext > 0 && daysToNext <= cycleLength) {
                    // Recalculate dayInCycle counting backwards from the future period
                    dayInCycle = cycleLength - daysToNext + 1;
                }
            }
        }

        // 6. Explicit END: If logged as NOT period, only respect it if the false entry
        //    is adjacent to the current period streak. This prevents stale "End Period Here"
        //    entries from a previous cycle from overriding the new cycle's menstrual prediction.
        let isExplicitlyNotPeriod = monthLogs[dateStr]?.is_period === false;

        if (isExplicitlyNotPeriod && dayInCycle <= periodLength && !isLate && source === 'logs') {
            // Check: is there a continuous chain of is_period:true from relevantStart
            // up to the day before this date? If not, this false entry is stale.
            let hasAdjacentPeriodStreak = false;

            // Walk backwards from the day before to see if we reach relevantStart via is_period:true
            let walker = new Date(target);
            walker.setDate(walker.getDate() - 1);
            let valid = true;
            while (formatDate(walker) >= relevantStart) {
                const wStr = formatDate(walker);
                if (wStr === relevantStart) {
                    // Reached the start — it must be a logged period day
                    hasAdjacentPeriodStreak = monthLogs[wStr]?.is_period === true;
                    break;
                }
                if (monthLogs[wStr]?.is_period !== true) {
                    // Gap found — the false entry is NOT adjacent to a continuous period streak
                    valid = false;
                    break;
                }
                walker.setDate(walker.getDate() - 1);
            }

            if (!valid || !hasAdjacentPeriodStreak) {
                // The is_period:false is stale (from a previous cycle), ignore it
                isExplicitlyNotPeriod = false;
            }
        }

        // Final safety: ensure dayInCycle is always >= 1
        dayInCycle = Math.max(dayInCycle, 1);

        // 7. Determine phase
        let phase: Phase;

        if (isLate) {
            // Late period: stay in Luteal, don't wrap to Menstrual
            phase = "Luteal";
        } else if (dayInCycle <= periodLength && !isExplicitlyNotPeriod) {
            phase = "Menstrual";
        } else if (dayInCycle >= ovulationDay - OVULATION_PHASE_WINDOW &&
            dayInCycle <= ovulationDay + OVULATION_PHASE_WINDOW) {
            phase = "Ovulatory";
        } else if (dayInCycle > ovulationDay + OVULATION_PHASE_WINDOW) {
            phase = "Luteal";
        } else {
            phase = "Follicular";
        }

        // 8. Determine confidence
        const confidence: 'low' | 'medium' | 'high' =
            source === 'logs' ? 'high' :
                source === 'settings' ? 'medium' : 'low';

        return {
            phase,
            day: dayInCycle,
            latePeriod: isLate,
            confidence,
            dataSource: source
        };
    } catch (err) {
        // Safety fallback: never crash the app due to phase calculation
        console.error("calculatePhase error:", err);
        return {
            phase: null,
            day: 0,
            latePeriod: false,
            confidence: 'low',
            dataSource: 'none'
        };
    }
}

// ============================================================================
// FERTILITY HELPERS
// ============================================================================

/**
 * Check if a given day is within the fertile window.
 */
export function isInFertileWindow(
    dayInCycle: number,
    cycleLength: number,
    lutealLength: number = DEFAULT_LUTEAL_LENGTH
): boolean {
    const ovulationDay = cycleLength - lutealLength;
    return dayInCycle >= ovulationDay - FERTILE_WINDOW_BEFORE &&
        dayInCycle <= ovulationDay + FERTILE_WINDOW_AFTER;
}

/**
 * Calculate ovulation day for a given cycle.
 */
export function getOvulationDay(
    cycleLength: number,
    lutealLength: number = DEFAULT_LUTEAL_LENGTH
): number {
    return cycleLength - lutealLength;
}

// ============================================================================
// BACKWARD COMPATIBILITY - Re-export as calculateSmartPhase
// ============================================================================

/**
 * @deprecated Use calculatePhase instead. This alias exists for backward compatibility.
 */
export function calculateSmartPhase(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog> = {}
): { phase: Phase; day: number } {
    const result = calculatePhase(targetDate, settings, monthLogs);
    return {
        phase: result.phase || "Menstrual", // Fallback for backward compat
        day: result.day || 1
    };
}

// ============================================================================
// LEGACY ADAPTER - Old 4-param signature
// ============================================================================

/**
 * Legacy adapter for old 4-parameter signature.
 * @deprecated Use calculatePhase with CycleSettings object instead.
 */
export function calculatePhaseLegacy(
    targetDate: Date,
    lastPeriodStart: string,
    cycleLength: number = DEFAULT_CYCLE_LENGTH,
    periodLength: number = DEFAULT_PERIOD_LENGTH
): { phase: Phase; day: number } {
    const settings: CycleSettings = {
        last_period_start: lastPeriodStart,
        cycle_length_days: cycleLength,
        period_length_days: periodLength
    };
    const result = calculatePhase(targetDate, settings, {});
    return {
        phase: result.phase || "Menstrual",
        day: result.day || 1
    };
}
