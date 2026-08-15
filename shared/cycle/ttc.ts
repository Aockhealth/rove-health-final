/**
 * TTC (Trying To Conceive) Ovulation Detection
 *
 * Combines two independent biomarkers into a single ovulation read:
 *
 *  - **OPK** (ovulation test strip) is the *early warning*. A "peak" reading
 *    means an LH surge was detected and ovulation typically follows within
 *    24-36 hours. It predicts, ahead of time, that the fertile window is
 *    closing.
 *  - **BBT** (basal body temperature) is the *after-the-fact confirmation*.
 *    Temperature steps up slightly and stays up once ovulation has actually
 *    happened, so a sustained rise above a rolling baseline confirms ovulation
 *    a few days late.
 *
 * When both agree we report high confidence. When only one is logged we still
 * give a best-effort answer at lower confidence, and when neither is logged we
 * fall back to the same date math the rest of the app already uses — so TTC
 * mode is useful from day one, before the user has logged any biomarker.
 *
 * Pure functions, no I/O — same style as ./phase.ts, so mobile, frontend and
 * backend can all share it.
 *
 * @module shared/cycle/ttc
 */

import {
    DEFAULT_CYCLE_LENGTH,
    DEFAULT_LUTEAL_LENGTH,
    FERTILE_WINDOW_AFTER,
    FERTILE_WINDOW_BEFORE,
    daysBetween,
    formatDate,
    getOvulationDay,
    normalizeToLocalMidnight,
    parseLocalDate,
    type CycleSettings,
    type DailyLog,
} from './phase';

// ============================================================================
// TYPES
// ============================================================================

export type OpkResult = 'negative' | 'low' | 'high' | 'peak';

export interface TtcDailyLog extends DailyLog {
    bbt_celsius?: number | null;
    opk_result?: OpkResult | null;
}

export type OvulationStatus =
    | 'insufficient_data'
    | 'monitoring'
    | 'fertile_window'
    | 'ovulation_likely'
    | 'ovulation_confirmed';

/**
 * A pattern suggesting this cycle may not have produced an ovulation at all.
 * Common with PCOS, which affects roughly 1 in 5 women in India — and the case
 * where confidently drawing a fertile window on the calendar is actively
 * misleading, because there may not be one this cycle.
 */
export interface AnovulatorySignal {
    detected: boolean;
    /** Machine-readable reasons, for messaging and analytics. */
    reasons: AnovulatoryReason[];
    /** Plain-language summary safe to show directly to the user. */
    note: string;
}

export type AnovulatoryReason =
    | 'persistent_opk_highs_no_peak'
    | 'no_thermal_shift_late_in_cycle'
    | 'cycle_overdue_no_signals';

export interface OvulationSignal {
    method: 'date_math' | 'opk_only' | 'bbt_only' | 'combined';
    status: OvulationStatus;
    /** Ovulation the BBT rise has already confirmed happened. */
    confirmedDate: string | null;
    /** Best estimate of ovulation when it hasn't been confirmed yet. */
    predictedDate: string | null;
    fertileWindowStart: string | null;
    fertileWindowEnd: string | null;
    /** Baseline temperature the sustained rise is measured against, if computed. */
    coverline: number | null;
    opkPeakDate: string | null;
    confidence: 'low' | 'medium' | 'high';
    explanation: string;
    anovulatory: AnovulatorySignal | null;
}

export interface BbtReading {
    date: string;
    value: number;
}

export interface OpkReading {
    date: string;
    value: OpkResult;
}

export interface ThermalShift {
    /** Baseline the three elevated readings had to clear. */
    coverline: number;
    /** First of the three consecutive elevated readings. */
    riseStartDate: string;
    /** Ovulation is placed the day before the rise begins. */
    ovulationDate: string;
    /** Third elevated reading — the day the rise became a confirmation. */
    confirmedOnDate: string;
}

export interface DetectOvulationOptions {
    /**
     * Whether the user flagged PCOS in onboarding. Only softens the thresholds
     * for the anovulatory hint and the wording — it never fabricates a signal
     * the logged data doesn't support.
     */
    hasPcos?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Ovulation typically follows an LH surge by 24-36 hours. */
export const OVULATION_AFTER_PEAK_DAYS = 1;

/** Standard "3 over 6" rule: three elevated readings over a six-reading baseline. */
export const BASELINE_READINGS = 6;
export const SUSTAINED_RISE_READINGS = 3;

/**
 * Real users skip mornings. Six prior readings is the textbook baseline, but
 * requiring exactly six would silently refuse to confirm ovulation for anyone
 * logging imperfectly — so accept a shorter baseline down to this floor.
 */
export const MIN_BASELINE_READINGS = 4;

/** Coverline sits just above the highest baseline reading (0.05°C ≈ 0.1°F). */
export const COVERLINE_OFFSET_C = 0.05;

/**
 * The three elevated readings must be genuinely consecutive days, not three
 * scattered readings across a fortnight, so cap the calendar span they cover.
 */
export const MAX_RISE_SPAN_DAYS = 5;

/** Persistent OPK highs with no peak start to look anovulatory at this count. */
export const OPK_HIGHS_WITHOUT_PEAK_THRESHOLD = 4;
export const OPK_HIGHS_WITHOUT_PEAK_THRESHOLD_PCOS = 3;

/** Don't call a missing thermal shift meaningful until BBT is well sampled. */
export const MIN_BBT_READINGS_FOR_ANOVULATORY_HINT = 10;

/** Days past expected ovulation before a missing shift is worth mentioning. */
export const ANOVULATORY_GRACE_DAYS = 7;

/** Cap the day-by-day walk so a bad cycleStart can't spin. */
const MAX_CYCLE_SCAN_DAYS = 200;

// ============================================================================
// HELPERS
// ============================================================================

const round2 = (n: number): number => Math.round(n * 100) / 100;

export const addDays = (dateStr: string, days: number): string => {
    const d = parseLocalDate(dateStr);
    d.setDate(d.getDate() + days);
    return formatDate(d);
};

const isValidBbt = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 34 && value <= 40;

const OPK_VALUES: OpkResult[] = ['negative', 'low', 'high', 'peak'];
const isValidOpk = (value: unknown): value is OpkResult =>
    typeof value === 'string' && (OPK_VALUES as string[]).includes(value);

/**
 * Walk the cycle day by day and pull out the two biomarker series, in date
 * order, skipping days with nothing logged and ignoring out-of-range garbage.
 */
export function collectCycleReadings(
    cycleStart: string,
    targetDate: Date,
    cycleLogs: Record<string, TtcDailyLog>
): { bbt: BbtReading[]; opk: OpkReading[] } {
    const bbt: BbtReading[] = [];
    const opk: OpkReading[] = [];

    const end = normalizeToLocalMidnight(targetDate);
    const cursor = parseLocalDate(cycleStart);

    let scanned = 0;
    while (cursor <= end && scanned < MAX_CYCLE_SCAN_DAYS) {
        const dateStr = formatDate(cursor);
        const log = cycleLogs[dateStr];
        if (log) {
            if (isValidBbt(log.bbt_celsius)) bbt.push({ date: dateStr, value: log.bbt_celsius });
            if (isValidOpk(log.opk_result)) opk.push({ date: dateStr, value: log.opk_result });
        }
        cursor.setDate(cursor.getDate() + 1);
        scanned++;
    }

    return { bbt, opk };
}

/**
 * The coverline for a candidate rise: just above the highest of the preceding
 * baseline readings. Returns null when there isn't enough baseline to trust.
 */
export function computeCoverline(baseline: BbtReading[]): number | null {
    if (baseline.length < MIN_BASELINE_READINGS) return null;
    const highest = Math.max(...baseline.map((r) => r.value));
    return round2(highest + COVERLINE_OFFSET_C);
}

/**
 * Find the first sustained temperature rise in the cycle: three consecutive
 * readings at or above a coverline built from the six readings before them.
 *
 * Only one ovulation happens per cycle, so the *earliest* qualifying rise is
 * the real one — a later run of warm days is just the luteal phase staying up.
 */
export function detectThermalShift(readings: BbtReading[]): ThermalShift | null {
    for (let i = MIN_BASELINE_READINGS; i + SUSTAINED_RISE_READINGS - 1 < readings.length; i++) {
        const baseline = readings.slice(Math.max(0, i - BASELINE_READINGS), i);
        const coverline = computeCoverline(baseline);
        if (coverline === null) continue;

        const rise = readings.slice(i, i + SUSTAINED_RISE_READINGS);
        if (!rise.every((r) => r.value >= coverline)) continue;

        // Three readings spread over half a month aren't "three days in a row".
        const span = daysBetween(parseLocalDate(rise[0].date), parseLocalDate(rise[rise.length - 1].date));
        if (span > MAX_RISE_SPAN_DAYS) continue;

        return {
            coverline,
            riseStartDate: rise[0].date,
            ovulationDate: addDays(rise[0].date, -1),
            confirmedOnDate: rise[rise.length - 1].date,
        };
    }

    return null;
}

/**
 * The most recent peak reading in the cycle. If a user logs several peaks in a
 * row, ovulation follows the last one.
 */
export function findOpkPeak(readings: OpkReading[]): string | null {
    for (let i = readings.length - 1; i >= 0; i--) {
        if (readings[i].value === 'peak') return readings[i].date;
    }
    return null;
}

/**
 * How many trailing readings are already above their baseline, when that run is
 * too short to confirm ovulation. Lets the app say "your temperature has
 * started to rise" on day one or two of a rise instead of staying silent.
 */
export function partialRiseLength(readings: BbtReading[]): number {
    for (let run = SUSTAINED_RISE_READINGS - 1; run >= 1; run--) {
        const riseStart = readings.length - run;
        if (riseStart < MIN_BASELINE_READINGS) continue;

        const coverline = computeCoverline(
            readings.slice(Math.max(0, riseStart - BASELINE_READINGS), riseStart)
        );
        if (coverline === null) continue;

        if (readings.slice(riseStart).every((r) => r.value >= coverline)) return run;
    }
    return 0;
}

/**
 * The most recent coverline the chart can draw, independent of whether a rise
 * was confirmed — Insights needs a line to draw even mid-cycle. Readings that
 * are part of an in-progress rise are excluded from the baseline, otherwise the
 * rise would drag its own coverline up behind it.
 */
export function currentCoverline(readings: BbtReading[]): number | null {
    if (readings.length < MIN_BASELINE_READINGS) return null;

    const shift = detectThermalShift(readings);
    if (shift) return shift.coverline;

    const baselineEnd = readings.length - partialRiseLength(readings);
    return computeCoverline(readings.slice(Math.max(0, baselineEnd - BASELINE_READINGS), baselineEnd));
}

// ============================================================================
// ANOVULATORY / PCOS-AWARE DETECTION
// ============================================================================

/**
 * Look for the shapes an anovulatory cycle makes in the data.
 *
 * Deliberately conservative: every reason requires actual logged evidence, so
 * a user who simply hasn't logged anything never gets told her cycle looks
 * anovulatory. The PCOS flag only lowers the OPK threshold (persistently
 * elevated LH is characteristic of PCOS, so highs-without-a-peak carry more
 * weight there) and warms the wording — it never invents a signal.
 */
export function detectAnovulatoryPattern(params: {
    bbt: BbtReading[];
    opk: OpkReading[];
    thermalShift: ThermalShift | null;
    opkPeakDate: string | null;
    dayInCycle: number;
    expectedOvulationDay: number;
    cycleLength: number;
    hasPcos: boolean;
}): AnovulatorySignal | null {
    const {
        bbt,
        opk,
        thermalShift,
        opkPeakDate,
        dayInCycle,
        expectedOvulationDay,
        cycleLength,
        hasPcos,
    } = params;

    // Ovulation is established this cycle — nothing to warn about.
    if (thermalShift) return null;

    const reasons: AnovulatoryReason[] = [];
    const pastExpectedOvulation = dayInCycle > expectedOvulationDay + ANOVULATORY_GRACE_DAYS;

    const highCount = opk.filter((r) => r.value === 'high').length;
    const highThreshold = hasPcos
        ? OPK_HIGHS_WITHOUT_PEAK_THRESHOLD_PCOS
        : OPK_HIGHS_WITHOUT_PEAK_THRESHOLD;
    if (!opkPeakDate && highCount >= highThreshold) {
        reasons.push('persistent_opk_highs_no_peak');
    }

    if (bbt.length >= MIN_BBT_READINGS_FOR_ANOVULATORY_HINT && pastExpectedOvulation) {
        reasons.push('no_thermal_shift_late_in_cycle');
    }

    // A cycle running well past its expected length with neither biomarker
    // showing anything only counts when the user was actually logging.
    const hasSomeData = bbt.length >= MIN_BASELINE_READINGS || opk.length >= 3;
    if (hasSomeData && !opkPeakDate && dayInCycle > cycleLength + ANOVULATORY_GRACE_DAYS) {
        reasons.push('cycle_overdue_no_signals');
    }

    if (reasons.length === 0) return null;

    return {
        detected: true,
        reasons,
        note: buildAnovulatoryNote(reasons, hasPcos),
    };
}

function buildAnovulatoryNote(reasons: AnovulatoryReason[], hasPcos: boolean): string {
    const lead = reasons.includes('persistent_opk_highs_no_peak')
        ? 'Your tests have stayed high without reaching a clear peak'
        : reasons.includes('no_thermal_shift_late_in_cycle')
          ? 'Your temperatures haven’t shown a sustained rise yet this cycle'
          : 'This cycle is running longer than expected with no ovulation signs yet';

    const context = hasPcos
        ? 'This is common with PCOS and can mean ovulation is delayed, or that this cycle didn’t release an egg.'
        : 'That can mean ovulation is delayed this cycle, or that this cycle didn’t release an egg.';

    return `${lead}. ${context} It’s worth mentioning to your doctor if it keeps happening.`;
}

// ============================================================================
// MAIN DETECTOR
// ============================================================================

const emptySignal = (explanation: string): OvulationSignal => ({
    method: 'date_math',
    status: 'insufficient_data',
    confirmedDate: null,
    predictedDate: null,
    fertileWindowStart: null,
    fertileWindowEnd: null,
    coverline: null,
    opkPeakDate: null,
    confidence: 'low',
    explanation,
    anovulatory: null,
});

/**
 * Combine BBT and OPK into one ovulation read for `targetDate`, falling back
 * to date math when neither biomarker has been logged.
 *
 * @param cycleStart  First day of the current cycle (YYYY-MM-DD).
 * @param targetDate  The day being asked about — usually today.
 * @param cycleLogs   Daily logs keyed by YYYY-MM-DD, covering at least this cycle.
 * @param settings    Cycle length / luteal length used for the date-math fallback.
 */
export function detectOvulation(
    cycleStart: string,
    targetDate: Date,
    cycleLogs: Record<string, TtcDailyLog>,
    settings: CycleSettings,
    options: DetectOvulationOptions = {}
): OvulationSignal {
    try {
        if (!cycleStart) {
            return emptySignal(
                'Log the first day of your period to start tracking your fertile window.'
            );
        }

        const target = normalizeToLocalMidnight(targetDate);
        const targetStr = formatDate(target);
        const start = parseLocalDate(cycleStart);
        const daysIn = daysBetween(start, target);

        if (daysIn < 0) {
            return emptySignal(
                'Log the first day of your period to start tracking your fertile window.'
            );
        }

        const cycleLength = settings.cycle_length_days || DEFAULT_CYCLE_LENGTH;
        const lutealLength = settings.luteal_length_days || DEFAULT_LUTEAL_LENGTH;
        const expectedOvulationDay = getOvulationDay(cycleLength, lutealLength);
        const dayInCycle = daysIn + 1;

        const { bbt, opk } = collectCycleReadings(cycleStart, target, cycleLogs);
        const thermalShift = detectThermalShift(bbt);
        const opkPeakDate = findOpkPeak(opk);
        const coverline = thermalShift ? thermalShift.coverline : currentCoverline(bbt);

        const anovulatory = detectAnovulatoryPattern({
            bbt,
            opk,
            thermalShift,
            opkPeakDate,
            dayInCycle,
            expectedOvulationDay,
            cycleLength,
            hasPcos: options.hasPcos === true,
        });

        // Date-math fallback, always computed — it backs the fertile window
        // whenever the biomarkers haven't said anything yet.
        const predictedByDate = addDays(cycleStart, expectedOvulationDay - 1);

        const method: OvulationSignal['method'] =
            thermalShift && opkPeakDate
                ? 'combined'
                : thermalShift
                  ? 'bbt_only'
                  : opkPeakDate
                    ? 'opk_only'
                    : 'date_math';

        // --- Confirmed by temperature -------------------------------------
        // Readings are only collected up to `target`, so a shift found here has
        // already completed on or before today.
        if (thermalShift) {
            const opkPredicted = opkPeakDate ? addDays(opkPeakDate, OVULATION_AFTER_PEAK_DAYS) : null;
            const signalsAgree =
                opkPredicted !== null &&
                Math.abs(
                    daysBetween(parseLocalDate(opkPredicted), parseLocalDate(thermalShift.ovulationDate))
                ) <= 3;

            let explanation: string;
            let confidence: OvulationSignal['confidence'];

            if (opkPredicted && signalsAgree) {
                explanation =
                    'Your temperature stayed up for three days after your test peaked — two signals agreeing that you ovulated around ' +
                    `${friendlyDate(thermalShift.ovulationDate)}.`;
                confidence = 'high';
            } else if (opkPredicted) {
                explanation =
                    `Your temperature rise points to ovulation around ${friendlyDate(thermalShift.ovulationDate)}, ` +
                    `while your test peaked on ${friendlyDate(opkPeakDate as string)}. Temperature confirms ovulation after the fact, so we’ve gone with it.`;
                confidence = 'medium';
            } else {
                explanation =
                    `Your temperature stayed above its baseline for three days, which confirms you ovulated around ${friendlyDate(thermalShift.ovulationDate)}. ` +
                    'Adding ovulation tests would let us catch the fertile window before it opens, not just after.';
                confidence = 'medium';
            }

            return {
                method,
                status: 'ovulation_confirmed',
                confirmedDate: thermalShift.ovulationDate,
                predictedDate: null,
                fertileWindowStart: addDays(thermalShift.ovulationDate, -FERTILE_WINDOW_BEFORE),
                fertileWindowEnd: addDays(thermalShift.ovulationDate, FERTILE_WINDOW_AFTER),
                coverline,
                opkPeakDate,
                confidence,
                explanation,
                anovulatory: null,
            };
        }

        // --- Predicted by an LH surge -------------------------------------
        if (opkPeakDate) {
            const predicted = addDays(opkPeakDate, OVULATION_AFTER_PEAK_DAYS);
            const daysSincePeak = daysBetween(parseLocalDate(opkPeakDate), target);
            const awaitingConfirmation = bbt.length > 0;

            const explanation =
                daysSincePeak <= 2
                    ? 'Your test peaked, so ovulation is likely in the next day or so — this is your most fertile stretch.'
                    : `Your test peaked on ${friendlyDate(opkPeakDate)}, so you most likely ovulated around ${friendlyDate(predicted)}. ` +
                      (awaitingConfirmation
                          ? 'Keep logging your morning temperature and we’ll confirm it.'
                          : 'Logging your morning temperature would let us confirm it.');

            return {
                method,
                status: 'ovulation_likely',
                confirmedDate: null,
                predictedDate: predicted,
                fertileWindowStart: addDays(predicted, -FERTILE_WINDOW_BEFORE),
                fertileWindowEnd: addDays(predicted, FERTILE_WINDOW_AFTER),
                coverline,
                opkPeakDate,
                confidence: 'medium',
                explanation,
                anovulatory,
            };
        }

        // --- Nothing confirmed yet: anovulatory hint outranks a date guess --
        // Drawing a confident fertile window on a cycle that looks anovulatory
        // is worse than admitting we don't know.
        if (anovulatory) {
            return {
                method,
                status: 'monitoring',
                confirmedDate: null,
                predictedDate: null,
                fertileWindowStart: null,
                fertileWindowEnd: null,
                coverline,
                opkPeakDate: null,
                confidence: 'low',
                explanation: anovulatory.note,
                anovulatory,
            };
        }

        // --- Date-math fertile window --------------------------------------
        const windowStart = addDays(predictedByDate, -FERTILE_WINDOW_BEFORE);
        const windowEnd = addDays(predictedByDate, FERTILE_WINDOW_AFTER);
        const inWindow = targetStr >= windowStart && targetStr <= windowEnd;

        const hasHighOpk = opk.some((r) => r.value === 'high');
        const loggingSomething = bbt.length > 0 || opk.length > 0;

        if (inWindow || hasHighOpk) {
            const explanation = hasHighOpk
                ? 'Your test is reading high, so your body is building toward ovulation. Test daily now to catch the peak.'
                : `Based on your cycle length, ovulation is expected around ${friendlyDate(predictedByDate)}. ` +
                  (loggingSomething
                      ? 'Keep logging — your own readings will sharpen this.'
                      : 'Logging a morning temperature and an ovulation test will confirm it.');

            return {
                method,
                status: 'fertile_window',
                confirmedDate: null,
                predictedDate: predictedByDate,
                fertileWindowStart: windowStart,
                fertileWindowEnd: windowEnd,
                coverline,
                opkPeakDate: null,
                confidence: hasHighOpk ? 'medium' : 'low',
                explanation,
                anovulatory: null,
            };
        }

        // --- Outside the window, quietly watching ---------------------------
        const beforeWindow = targetStr < windowStart;
        const risingDays = partialRiseLength(bbt);
        const explanation = beforeWindow
            ? `Your fertile window is expected to open around ${friendlyDate(windowStart)}.`
            : risingDays > 0
              ? `Your temperature has started to rise — ${SUSTAINED_RISE_READINGS - risingDays} more elevated reading${
                    SUSTAINED_RISE_READINGS - risingDays === 1 ? '' : 's'
                } will confirm ovulation.`
              : 'No ovulation signs today. Keep logging your morning temperature and ovulation tests.';

        return {
            method,
            status: 'monitoring',
            confirmedDate: null,
            predictedDate: beforeWindow ? predictedByDate : null,
            fertileWindowStart: beforeWindow ? windowStart : null,
            fertileWindowEnd: beforeWindow ? windowEnd : null,
            coverline,
            opkPeakDate: null,
            confidence: 'low',
            explanation,
            anovulatory: null,
        };
    } catch (err) {
        // Never let a fertility card crash the dashboard.
        console.error('detectOvulation error:', err);
        return emptySignal('We couldn’t read your fertility data for today.');
    }
}

/** "2026-08-15" -> "15 Aug" — matches how dates read elsewhere in the app. */
function friendlyDate(dateStr: string): string {
    const d = parseLocalDate(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
}
