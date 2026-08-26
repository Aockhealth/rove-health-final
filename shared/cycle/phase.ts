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
    daysLate: number;              // days past the expected start; 0 when due today or not late
    confidence: 'low' | 'medium' | 'high';
    dataSource: 'logs' | 'settings' | 'none';
    /**
     * True when the only anchor available is a `settings` date so old that the
     * day/daysLate numbers derived from it have stopped meaning anything (see
     * MAX_TRUSTED_SETTINGS_ANCHOR_LATE_DAYS). The numbers are still returned so
     * nothing downstream has to handle a null, but UI must not assert them at
     * the user -- "Day 452, 423 days late" is noise, not information. Prompt
     * her to log a period instead.
     */
    staleAnchor: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const DEFAULT_LUTEAL_LENGTH = 14;

// Ovulation window: ±1 day around ovulation for "Ovulatory" phase
export const OVULATION_PHASE_WINDOW = 1;

/**
 * Ovulation day is normally `cycleLength - lutealLength`, but on a short cycle
 * (or whenever a personalized luteal length approaches the cycle length) that
 * lands inside the period days, and the phases in between stop existing --
 * an 18-day cycle used to report only Menstrual and Luteal, so Follicular and
 * Ovulatory content was unreachable for the whole cycle.
 *
 * The gap has to clear the period AND the ±OVULATION_PHASE_WINDOW ovulatory
 * band with at least one day left over, or Follicular is still squeezed to
 * nothing: Follicular days are those with
 * `periodLength < day < ovulationDay - OVULATION_PHASE_WINDOW`, so one exists
 * only when `ovulationDay >= periodLength + OVULATION_PHASE_WINDOW + 2`.
 */
export const MIN_DAYS_BETWEEN_PERIOD_AND_OVULATION = OVULATION_PHASE_WINDOW + 2;

/**
 * How many days past an expected period start a `settings`-sourced anchor
 * stays worth quoting. Beyond this the user has logged no period at all for
 * roughly three cycles and the anchor is almost certainly a stale onboarding
 * value, not a real 100-day cycle -- see PhaseResult.staleAnchor.
 */
export const MAX_TRUSTED_SETTINGS_ANCHOR_LATE_DAYS = 90;

// Fertility window: wider range for fertility tracking. These are the
// population defaults — used as-is until she has enough cycle history to
// personalize (see computeFertileWindowRadius below).
export const FERTILE_WINDOW_BEFORE = 5;  // Days before ovulation
export const FERTILE_WINDOW_AFTER = 1;   // Days after ovulation

// Need at least this many recent cycle lengths logged before trusting her
// own variability over the population default.
export const MIN_CYCLES_FOR_PERSONAL_VARIANCE = 3;
// SD assumed for a new user with no cycle history yet — deliberately wide.
export const POPULATION_SIGMA_DAYS = 4;
// A cycle-length SD floor: even a handful of identical-looking cycles
// shouldn't collapse the window to near-zero width.
export const MIN_SIGMA_DAYS = 1.5;
// Above this SD, a window is false precision, not a helpful estimate —
// callers should stop drawing one and switch to "test daily" messaging.
export const MAX_USABLE_SIGMA_DAYS = 5;
// How many recent cycles to look at when estimating her own variability.
export const CYCLE_HISTORY_LOOKBACK = 6;

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

// Spotty logging (e.g. a user skipping a day or two mid-period) shouldn't be
// mistaken for the start of a brand-new cycle. Tolerate this many consecutive
// unlogged/non-period days before deciding the streak has actually ended.
export const STREAK_GAP_TOLERANCE_DAYS = 2;

/**
 * Finds the actual start date of a period streak given a date within that streak.
 * Walks backwards day by day checking logs, tolerating short gaps (see
 * STREAK_GAP_TOLERANCE_DAYS) so spotty logging doesn't fragment one real
 * period into a phantom new cycle.
 */
export function findStreakStart(
    targetDateStr: string,
    monthLogs: Record<string, DailyLog>,
    maxGapDays: number = STREAK_GAP_TOLERANCE_DAYS
): string {
    let cur = parseLocalDate(targetDateStr);
    let first = targetDateStr;
    let gap = 0;

    let lookback = 0;
    while (lookback < 45) {
        cur.setDate(cur.getDate() - 1);
        const prevStr = formatDate(cur);
        if (monthLogs[prevStr]?.is_period) {
            first = prevStr;
            gap = 0;
        } else {
            gap++;
            if (gap > maxGapDays) break;
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
                daysLate: 0,
                confidence: 'high',
                dataSource: 'logs',
                staleAnchor: false
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
                daysLate: 0,
                confidence: 'low',
                dataSource: 'none',
                staleAnchor: false
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
                daysLate: 0,
                confidence: 'low',
                dataSource: source,
                staleAnchor: false
            };
        }

        const cycleLength = settings.cycle_length_days || DEFAULT_CYCLE_LENGTH;
        const periodLength = settings.period_length_days || DEFAULT_PERIOD_LENGTH;
        const lutealLength = settings.luteal_length_days || DEFAULT_LUTEAL_LENGTH;
        // Floored -- see getOvulationDay. Uses the *settings* period length
        // rather than the observed one below, so the phase boundaries stay
        // stable within a cycle even as she logs her way through her period.
        const ovulationDay = getOvulationDay(cycleLength, lutealLength, periodLength);

        // 4. Check for late period (past expected cycle length, no new period logged)
        const isLate = diffDays >= cycleLength && target <= today;

        // A `settings` anchor that is months stale is an abandoned onboarding
        // value, not a real cycle -- see MAX_TRUSTED_SETTINGS_ANCHOR_LATE_DAYS.
        // Flagged rather than nulled so callers keep a phase to render, but
        // must not quote the day/daysLate numbers at the user.
        const staleAnchor =
            source === 'settings' &&
            isLate &&
            diffDays - cycleLength > MAX_TRUSTED_SETTINGS_ANCHOR_LATE_DAYS;

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
        //
        //     But only when the forward anchor isn't already a fresh, real log:
        //     when `source === 'logs'` and we're still within a single cycle of
        //     it, that forward calculation is already grounded in what actually
        //     happened and produces one coherent phase progression for the
        //     month. Running the backward projection on top of it anyway was
        //     producing a second, contradictory phase window (e.g. a fake
        //     second "Ovulatory" block) purely from projecting off an unrelated
        //     future period — logged data wins outright here, not just for the
        //     Menstrual-specific case guarded below.
        const hasFreshLoggedAnchor = source === 'logs' && diffDays < cycleLength;
        if (!isLate && source !== 'none' && !hasFreshLoggedAnchor) {
            const futurePeriodDates = Object.keys(monthLogs)
                .filter(d => monthLogs[d]?.is_period && d > dateStr)
                .sort();

            if (futurePeriodDates.length > 0) {
                const nextPeriodStr = findStreakStart(futurePeriodDates[0], monthLogs);
                const nextStart = parseLocalDate(nextPeriodStr);
                const daysToNext = daysBetween(target, nextStart);
                // If the next period is within one cycle AND anchor gives a valid position
                if (daysToNext > 0 && daysToNext <= cycleLength) {
                    const backwardDayInCycle = cycleLength - daysToNext + 1;
                    // Only ever use this to correctly show Luteal ("approaching
                    // the next period") — never to invent a Menstrual day that
                    // was never logged. Without this guard, any unlogged day
                    // exactly one cycle-length before a real future period gets
                    // labeled Menstrual purely from projection, overriding what
                    // the actual logged period (counted forward) already say
                    // is Follicular. Logged data wins; a backward projection
                    // never gets to claim a period happened.
                    if (backwardDayInCycle > periodLength) {
                        dayInCycle = backwardDayInCycle;
                    }
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

        // 6b. Observed period length wins over the settings average.
        //     settings.period_length_days is only an average, so a user whose period
        //     actually ran 4 days was still shown "Period Day 5" on day 5 — the
        //     prediction overrode their own logs. When this cycle is anchored to logged
        //     period days and that streak has visibly ended, trust the streak instead.
        //
        //     Note the tradeoff: logs alone can't distinguish "period is over" from
        //     "she hasn't logged today yet", so a period still in progress reads as
        //     ended until today is logged. It self-corrects on the next log, and
        //     over-reporting a period the user never recorded is the worse error.
        let effectivePeriodLength = periodLength;
        if (source === 'logs' && monthLogs[relevantStart]?.is_period === true) {
            let streak = 0;
            const walker = parseLocalDate(relevantStart);
            while (monthLogs[formatDate(walker)]?.is_period === true) {
                streak++;
                walker.setDate(walker.getDate() + 1);
            }
            // `walker` is now the first non-period day after the streak. Only trust the
            // observed length once that day has actually arrived, AND only when it was
            // explicitly logged as not-period ("End Period Here") — an unlogged day is
            // silence, not a signal that the period ended, and must not shorten it.
            if (
                streak > 0 &&
                monthLogs[formatDate(walker)]?.is_period === false &&
                normalizeToLocalMidnight(walker) <= today
            ) {
                effectivePeriodLength = streak;
            }
        }

        // Final safety: ensure dayInCycle is always >= 1
        dayInCycle = Math.max(dayInCycle, 1);

        // 7. Determine phase
        let phase: Phase;

        if (isLate) {
            // Late period: stay in Luteal, don't wrap to Menstrual
            phase = "Luteal";
        } else if (dayInCycle <= effectivePeriodLength && !isExplicitlyNotPeriod) {
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
            // Single source of truth for "how late". Derived from diffDays, not dayInCycle,
            // which is diffDays + 1 — computing it from the latter is an off-by-one that had
            // Tracker and Insights reporting different numbers for the same day.
            daysLate: isLate ? diffDays - cycleLength : 0,
            confidence,
            dataSource: source,
            staleAnchor
        };
    } catch (err) {
        // Safety fallback: never crash the app due to phase calculation
        console.error("calculatePhase error:", err);
        return {
            phase: null,
            day: 0,
            latePeriod: false,
            daysLate: 0,
            confidence: 'low',
            dataSource: 'none',
            staleAnchor: false
        };
    }
}

// ============================================================================
// FERTILITY HELPERS
// ============================================================================

export interface FertileWindowRadius {
    before: number;
    after: number;
    /** The SD this radius was computed from — population default when data is thin. */
    sigma: number;
    /**
     * True when her own cycles vary too much for a window to mean anything.
     * Callers should stop drawing one and switch to "test daily" messaging
     * instead of widening it further.
     */
    tooIrregularForWindow: boolean;
}

/**
 * How wide the fertile window should be, personalized from her own recent
 * cycle-length variability instead of one fixed number for everyone.
 *
 * Widens asymmetrically — sperm survival means the window has to extend
 * further *before* ovulation than after, never symmetrically — and falls
 * back to a deliberately wide population SD until she has logged enough
 * cycles of her own to trust.
 */
export function computeFertileWindowRadius(recentCycleLengths: number[]): FertileWindowRadius {
    const lengths = recentCycleLengths.filter((n) => Number.isFinite(n) && n > 0);

    let sigma: number;
    if (lengths.length < MIN_CYCLES_FOR_PERSONAL_VARIANCE) {
        sigma = POPULATION_SIGMA_DAYS;
    } else {
        const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
        sigma = Math.max(MIN_SIGMA_DAYS, Math.sqrt(variance));
    }

    return {
        before: FERTILE_WINDOW_BEFORE + Math.ceil(sigma),
        after: FERTILE_WINDOW_AFTER + Math.ceil(sigma / 2),
        sigma,
        tooIrregularForWindow: sigma > MAX_USABLE_SIGMA_DAYS,
    };
}

/** One completed cycle inferred from logged period starts: `start` is the
 * cycle's own first day, `length` is how many days until the *next* period
 * start (i.e. this cycle's length, not the gap before it). */
export interface CycleHistoryEntry {
    start: string;
    length: number;
}

/**
 * Recent cycles (newest first), derived purely from logged period days — no
 * BBT/OPK needed, so this works identically in Cycle Sync and TTC mode.
 * Best-effort: returns however many cycles the available log history
 * actually covers, down to zero.
 */
export function deriveRecentCycleHistory(
    referenceDate: Date,
    monthLogs: Record<string, DailyLog>,
    maxCycles: number = CYCLE_HISTORY_LOOKBACK
): CycleHistoryEntry[] {
    const emptySettings: CycleSettings = {
        last_period_start: '',
        cycle_length_days: DEFAULT_CYCLE_LENGTH,
        period_length_days: DEFAULT_PERIOD_LENGTH,
    };

    const periodStarts: string[] = [];
    const seen = new Set<string>();
    let cursor = normalizeToLocalMidnight(referenceDate);
    let scanned = 0;

    // Walk backward one found period streak at a time (not day by day), so
    // this stays cheap even over a long log history.
    while (periodStarts.length <= maxCycles && scanned < 400) {
        scanned++;
        const { start } = getRelevantPeriodStart(cursor, emptySettings, monthLogs);
        if (!start || seen.has(start)) break;
        seen.add(start);
        periodStarts.push(start);

        cursor = parseLocalDate(start);
        cursor.setDate(cursor.getDate() - 1);
    }

    const history: CycleHistoryEntry[] = [];
    for (let i = 0; i < periodStarts.length - 1; i++) {
        const length = daysBetween(parseLocalDate(periodStarts[i + 1]), parseLocalDate(periodStarts[i]));
        if (length > 0) history.push({ start: periodStarts[i + 1], length });
    }
    return history.slice(0, maxCycles);
}

/**
 * Cycle lengths outside this range are almost certainly a logging artefact
 * (a mis-tapped date, a skipped period read as one long cycle) rather than a
 * real cycle, and must not be allowed to drag the observed average.
 */
export const MIN_PLAUSIBLE_CYCLE_LENGTH = 21;
export const MAX_PLAUSIBLE_CYCLE_LENGTH = 60;

/** Need at least this many completed cycles before her logs outrank the number she typed at onboarding. */
export const MIN_CYCLES_FOR_OBSERVED_LENGTH = 2;

/**
 * Her real cycle length, measured from logged period starts.
 *
 * `cycle_length_days` in the settings row is only ever written by the manual
 * Cycle Settings form, so before this existed a woman could log three honest
 * 34-day cycles and still be counted down to day 28 forever -- every
 * prediction (next period, "late by N", ovulation day, all four phase
 * boundaries) ran off a number her own history contradicted. This derives the
 * real one so predictions follow what actually happened.
 *
 * Median, not mean: one skipped-log 60-day "cycle" shouldn't drag the number
 * the whole app predicts from. Returns null until there's enough history,
 * leaving the stored setting in charge.
 */
export function deriveObservedCycleLength(
    referenceDate: Date,
    monthLogs: Record<string, DailyLog>,
    maxCycles: number = CYCLE_HISTORY_LOOKBACK
): number | null {
    const lengths = deriveRecentCycleLengths(referenceDate, monthLogs, maxCycles)
        .filter((n) => n >= MIN_PLAUSIBLE_CYCLE_LENGTH && n <= MAX_PLAUSIBLE_CYCLE_LENGTH);

    if (lengths.length < MIN_CYCLES_FOR_OBSERVED_LENGTH) return null;

    const sorted = [...lengths].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

    return Math.round(median);
}

/**
 * The cycle settings the app should actually predict from: whatever is stored,
 * with `cycle_length_days` replaced by her observed length once her logs can
 * support one (see deriveObservedCycleLength).
 *
 * Deliberately does NOT write back to the settings row. The stored value is
 * hers -- she typed it -- so this corrects the prediction without overwriting
 * her input, and the moment she edits Cycle Settings by hand that value is
 * still exactly what she left there.
 */
export function resolveCycleSettings(
    referenceDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog>
): CycleSettings {
    const observed = deriveObservedCycleLength(referenceDate, monthLogs);
    return observed === null ? settings : { ...settings, cycle_length_days: observed };
}

/**
 * Recent cycle lengths only (see deriveRecentCycleHistory) — kept as a thin
 * wrapper since computeFertileWindowRadius and older callers just want the
 * numbers, not the dates.
 */
export function deriveRecentCycleLengths(
    referenceDate: Date,
    monthLogs: Record<string, DailyLog>,
    maxCycles: number = CYCLE_HISTORY_LOOKBACK
): number[] {
    return deriveRecentCycleHistory(referenceDate, monthLogs, maxCycles).map((c) => c.length);
}

/**
 * Check if a given day is within the fertile window.
 *
 * Pass `recentCycleLengths` (see deriveRecentCycleLengths) to widen the
 * window for her own observed cycle variability instead of using the same
 * fixed range for everyone. Omitting it keeps the old fixed-window behavior.
 */
export function isInFertileWindow(
    dayInCycle: number,
    cycleLength: number,
    lutealLength: number = DEFAULT_LUTEAL_LENGTH,
    recentCycleLengths?: number[],
    periodLength: number = DEFAULT_PERIOD_LENGTH
): boolean {
    const ovulationDay = getOvulationDay(cycleLength, lutealLength, periodLength);
    const radius = recentCycleLengths
        ? computeFertileWindowRadius(recentCycleLengths)
        : { before: FERTILE_WINDOW_BEFORE, after: FERTILE_WINDOW_AFTER, sigma: 0, tooIrregularForWindow: false };

    if (radius.tooIrregularForWindow) return false;

    return dayInCycle >= ovulationDay - radius.before &&
        dayInCycle <= ovulationDay + radius.after;
}

/**
 * Calculate ovulation day for a given cycle.
 *
 * Floored so ovulation always sits at least
 * MIN_DAYS_BETWEEN_PERIOD_AND_OVULATION days after the last period day. The
 * raw `cycleLength - lutealLength` collapses on short cycles: at 18 days with
 * the population luteal of 14 it lands on day 4, inside the period, which
 * erased Follicular and Ovulatory entirely (they became unreachable, so the
 * phase-keyed Guide/Nourish/Move content was too). Also guards the case where
 * a personalized luteal length meets or exceeds the cycle length.
 */
export function getOvulationDay(
    cycleLength: number,
    lutealLength: number = DEFAULT_LUTEAL_LENGTH,
    periodLength: number = DEFAULT_PERIOD_LENGTH
): number {
    const raw = cycleLength - lutealLength;
    return Math.max(periodLength + MIN_DAYS_BETWEEN_PERIOD_AND_OVULATION, raw);
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
