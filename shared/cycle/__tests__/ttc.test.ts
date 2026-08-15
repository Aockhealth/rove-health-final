/**
 * TTC Ovulation Detection Unit Tests
 *
 * Tests for shared/cycle/ttc.ts — BBT + OPK ovulation detection.
 * Run with: npx jest shared/cycle/__tests__/ttc.test.ts
 */

import {
    addDays,
    collectCycleReadings,
    computeCoverline,
    currentCoverline,
    detectAnovulatoryPattern,
    detectOvulation,
    detectThermalShift,
    findOpkPeak,
    partialRiseLength,
    BASELINE_READINGS,
    COVERLINE_OFFSET_C,
    MIN_BASELINE_READINGS,
    type BbtReading,
    type OpkResult,
    type TtcDailyLog,
} from '../ttc';
import { parseLocalDate, type CycleSettings } from '../phase';

// ============================================================================
// TEST DATA
// ============================================================================

const CYCLE_START = '2026-01-01';

/** Cycle day 1 is the first day of the period, i.e. CYCLE_START itself. */
const day = (n: number): string => addDays(CYCLE_START, n - 1);
const onDay = (n: number): Date => parseLocalDate(day(n));

const settings = (overrides: Partial<CycleSettings> = {}): CycleSettings => ({
    last_period_start: CYCLE_START,
    cycle_length_days: 28,
    period_length_days: 5,
    ...overrides,
});

type Entry = { day: number; bbt?: number; opk?: OpkResult | string };

const buildLogs = (entries: Entry[]): Record<string, TtcDailyLog> => {
    const logs: Record<string, TtcDailyLog> = {};
    for (const entry of entries) {
        const date = day(entry.day);
        logs[date] = {
            ...(logs[date] ?? { date }),
            ...(entry.bbt !== undefined ? { bbt_celsius: entry.bbt } : {}),
            ...(entry.opk !== undefined ? { opk_result: entry.opk as OpkResult } : {}),
        };
    }
    return logs;
};

/** A flat pre-ovulatory baseline: alternating 36.35 / 36.40. */
const baselineTemps = (fromDay: number, toDay: number): Entry[] => {
    const entries: Entry[] = [];
    for (let d = fromDay; d <= toDay; d++) {
        entries.push({ day: d, bbt: d % 2 === 0 ? 36.4 : 36.35 });
    }
    return entries;
};

/** A textbook cycle: flat through day 13, then three days up. */
const classicBbtCycle = (): Record<string, TtcDailyLog> =>
    buildLogs([
        ...baselineTemps(1, 13),
        { day: 14, bbt: 36.7 },
        { day: 15, bbt: 36.72 },
        { day: 16, bbt: 36.68 },
    ]);

const reading = (d: number, value: number): BbtReading => ({ date: day(d), value });

// ============================================================================
// HELPERS
// ============================================================================

describe('helpers', () => {
    describe('addDays', () => {
        it('moves forward and backward across a month boundary', () => {
            expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
            expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
        });
    });

    describe('computeCoverline', () => {
        it('sits just above the highest baseline reading', () => {
            const baseline = [reading(1, 36.3), reading(2, 36.45), reading(3, 36.4), reading(4, 36.35)];
            expect(computeCoverline(baseline)).toBeCloseTo(36.45 + COVERLINE_OFFSET_C, 5);
        });

        it('refuses to guess from too few readings', () => {
            const baseline = Array.from({ length: MIN_BASELINE_READINGS - 1 }, (_, i) =>
                reading(i + 1, 36.4)
            );
            expect(computeCoverline(baseline)).toBeNull();
        });
    });

    describe('findOpkPeak', () => {
        it('returns the last peak when several are logged', () => {
            const peak = findOpkPeak([
                { date: day(12), value: 'high' },
                { date: day(13), value: 'peak' },
                { date: day(14), value: 'peak' },
                { date: day(15), value: 'negative' },
            ]);
            expect(peak).toBe(day(14));
        });

        it('returns null when no peak was ever reached', () => {
            expect(findOpkPeak([{ date: day(12), value: 'high' }])).toBeNull();
        });
    });

    describe('collectCycleReadings', () => {
        it('ignores out-of-range temperatures and unknown OPK values', () => {
            const logs = buildLogs([
                { day: 1, bbt: 36.4, opk: 'negative' },
                { day: 2, bbt: 98.6 }, // Fahrenheit typed into a Celsius field
                { day: 3, opk: 'positive' }, // not one of the four graded values
            ]);
            const { bbt, opk } = collectCycleReadings(CYCLE_START, onDay(5), logs);
            expect(bbt).toEqual([{ date: day(1), value: 36.4 }]);
            expect(opk).toEqual([{ date: day(1), value: 'negative' }]);
        });

        it('stops at the target date', () => {
            const logs = buildLogs([...baselineTemps(1, 20)]);
            const { bbt } = collectCycleReadings(CYCLE_START, onDay(10), logs);
            expect(bbt).toHaveLength(10);
            expect(bbt[bbt.length - 1].date).toBe(day(10));
        });
    });
});

// ============================================================================
// THERMAL SHIFT
// ============================================================================

describe('detectThermalShift', () => {
    it('finds a three-day sustained rise over a six-reading baseline', () => {
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.7),
            reading(15, 36.72),
            reading(16, 36.68),
        ];
        const shift = detectThermalShift(readings);
        expect(shift).not.toBeNull();
        expect(shift!.riseStartDate).toBe(day(14));
        // Ovulation is placed the day before the temperature steps up.
        expect(shift!.ovulationDate).toBe(day(13));
        expect(shift!.confirmedOnDate).toBe(day(16));
        expect(shift!.coverline).toBeCloseTo(36.45, 5);
    });

    it('does not confirm on two elevated readings', () => {
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.7),
            reading(15, 36.72),
        ];
        expect(detectThermalShift(readings)).toBeNull();
    });

    it('does not confirm when one of the three dips back under the coverline', () => {
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.7),
            reading(15, 36.4),
            reading(16, 36.7),
        ];
        expect(detectThermalShift(readings)).toBeNull();
    });

    it('returns the first rise, not a later luteal one', () => {
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.7),
            reading(15, 36.72),
            reading(16, 36.68),
            reading(17, 36.75),
            reading(18, 36.8),
            reading(19, 36.78),
        ];
        expect(detectThermalShift(readings)!.ovulationDate).toBe(day(13));
    });

    it('needs more than a couple of readings to say anything', () => {
        expect(detectThermalShift([reading(1, 36.3), reading(2, 36.9), reading(3, 36.9)])).toBeNull();
    });
});

// ============================================================================
// NO DATA — DATE-MATH FALLBACK
// ============================================================================

describe('detectOvulation with no biomarker data', () => {
    it('falls back to date math inside the expected fertile window', () => {
        const result = detectOvulation(CYCLE_START, onDay(12), {}, settings());
        expect(result.method).toBe('date_math');
        expect(result.status).toBe('fertile_window');
        expect(result.predictedDate).toBe(day(14));
        expect(result.fertileWindowStart).toBe(day(9));
        expect(result.fertileWindowEnd).toBe(day(15));
        expect(result.confidence).toBe('low');
        expect(result.anovulatory).toBeNull();
    });

    it('reports monitoring before the window opens, with the opening date', () => {
        const result = detectOvulation(CYCLE_START, onDay(3), {}, settings());
        expect(result.status).toBe('monitoring');
        expect(result.fertileWindowStart).toBe(day(9));
        expect(result.explanation).toContain('expected to open');
    });

    it('reports monitoring after the window closes', () => {
        const result = detectOvulation(CYCLE_START, onDay(20), {}, settings());
        expect(result.status).toBe('monitoring');
        expect(result.fertileWindowStart).toBeNull();
        expect(result.anovulatory).toBeNull();
    });

    it('shifts the window with a longer cycle length', () => {
        const result = detectOvulation(CYCLE_START, onDay(21), {}, settings({ cycle_length_days: 35 }));
        expect(result.predictedDate).toBe(day(21));
        expect(result.status).toBe('fertile_window');
    });

    it('returns insufficient_data without a cycle start', () => {
        const result = detectOvulation('', onDay(12), {}, settings());
        expect(result.status).toBe('insufficient_data');
        expect(result.predictedDate).toBeNull();
    });

    it('returns insufficient_data when the target predates the cycle', () => {
        const result = detectOvulation(CYCLE_START, parseLocalDate('2025-12-20'), {}, settings());
        expect(result.status).toBe('insufficient_data');
    });
});

// ============================================================================
// BBT ONLY
// ============================================================================

describe('detectOvulation with BBT only', () => {
    it('confirms ovulation once the rise is sustained', () => {
        const result = detectOvulation(CYCLE_START, onDay(16), classicBbtCycle(), settings());
        expect(result.method).toBe('bbt_only');
        expect(result.status).toBe('ovulation_confirmed');
        expect(result.confirmedDate).toBe(day(13));
        expect(result.predictedDate).toBeNull();
        expect(result.confidence).toBe('medium');
        expect(result.coverline).toBeCloseTo(36.45, 5);
        expect(result.opkPeakDate).toBeNull();
    });

    it('holds off on day two of the rise and reports it as in progress', () => {
        const result = detectOvulation(CYCLE_START, onDay(15), classicBbtCycle(), settings());
        expect(result.status).not.toBe('ovulation_confirmed');
        expect(result.confirmedDate).toBeNull();
    });

    it('says the temperature is rising once the window has passed', () => {
        const logs = buildLogs([
            ...baselineTemps(1, 16),
            { day: 17, bbt: 36.7 },
            { day: 18, bbt: 36.72 },
        ]);
        const result = detectOvulation(CYCLE_START, onDay(18), logs, settings());
        expect(result.status).toBe('monitoring');
        expect(result.explanation).toContain('started to rise');
    });

    it('keeps the confirmation available on later days in the cycle', () => {
        const result = detectOvulation(CYCLE_START, onDay(24), classicBbtCycle(), settings());
        expect(result.status).toBe('ovulation_confirmed');
        expect(result.confirmedDate).toBe(day(13));
    });
});

// ============================================================================
// OPK ONLY
// ============================================================================

describe('detectOvulation with OPK only', () => {
    const opkCycle = buildLogs([
        { day: 10, opk: 'negative' },
        { day: 11, opk: 'low' },
        { day: 12, opk: 'high' },
        { day: 13, opk: 'peak' },
    ]);

    it('calls ovulation likely the day after the surge', () => {
        const result = detectOvulation(CYCLE_START, onDay(14), opkCycle, settings());
        expect(result.method).toBe('opk_only');
        expect(result.status).toBe('ovulation_likely');
        expect(result.opkPeakDate).toBe(day(13));
        expect(result.predictedDate).toBe(day(14));
        expect(result.confirmedDate).toBeNull();
        expect(result.confidence).toBe('medium');
    });

    it('nudges toward temperature logging once the surge has passed', () => {
        const result = detectOvulation(CYCLE_START, onDay(18), opkCycle, settings());
        expect(result.status).toBe('ovulation_likely');
        expect(result.explanation).toContain('temperature');
    });

    it('treats a high reading as fertile even outside the predicted window', () => {
        const logs = buildLogs([
            { day: 18, opk: 'high' },
            { day: 19, opk: 'high' },
        ]);
        const result = detectOvulation(CYCLE_START, onDay(19), logs, settings());
        expect(result.status).toBe('fertile_window');
        expect(result.confidence).toBe('medium');
    });
});

// ============================================================================
// BOTH SIGNALS
// ============================================================================

describe('detectOvulation with both signals', () => {
    it('reports high confidence when the two agree', () => {
        const logs = {
            ...classicBbtCycle(),
            ...buildLogs([
                { day: 11, opk: 'high' },
                { day: 12, opk: 'peak' },
            ]),
        };
        const result = detectOvulation(CYCLE_START, onDay(16), logs, settings());
        expect(result.method).toBe('combined');
        expect(result.status).toBe('ovulation_confirmed');
        expect(result.confidence).toBe('high');
        expect(result.confirmedDate).toBe(day(13));
        expect(result.opkPeakDate).toBe(day(12));
    });

    it('drops to medium confidence and prefers BBT when they disagree', () => {
        const logs = {
            ...classicBbtCycle(),
            ...buildLogs([{ day: 5, opk: 'peak' }]),
        };
        const result = detectOvulation(CYCLE_START, onDay(16), logs, settings());
        expect(result.method).toBe('combined');
        expect(result.status).toBe('ovulation_confirmed');
        // Temperature confirms after the fact, so it wins the tie-break.
        expect(result.confirmedDate).toBe(day(13));
        expect(result.confidence).toBe('medium');
        expect(result.opkPeakDate).toBe(day(5));
    });

    it('lets the OPK surge lead before the temperature has caught up', () => {
        const logs = {
            ...buildLogs([...baselineTemps(1, 13), { day: 13, opk: 'peak' }]),
        };
        const result = detectOvulation(CYCLE_START, onDay(13), logs, settings());
        expect(result.status).toBe('ovulation_likely');
        expect(result.predictedDate).toBe(day(14));
    });
});

// ============================================================================
// GAPPY LOGGING
// ============================================================================

describe('detectOvulation with gappy logging', () => {
    it('still confirms when readings skip days but the rise is tight', () => {
        const logs = buildLogs([
            { day: 1, bbt: 36.35 },
            { day: 2, bbt: 36.4 },
            { day: 4, bbt: 36.38 },
            { day: 5, bbt: 36.35 },
            { day: 7, bbt: 36.4 },
            { day: 8, bbt: 36.36 },
            { day: 14, bbt: 36.7 },
            { day: 16, bbt: 36.72 },
            { day: 18, bbt: 36.68 },
        ]);
        const result = detectOvulation(CYCLE_START, onDay(18), logs, settings());
        expect(result.status).toBe('ovulation_confirmed');
        expect(result.confirmedDate).toBe(day(13));
    });

    it('refuses to call three readings spread over a fortnight a sustained rise', () => {
        const logs = buildLogs([
            ...baselineTemps(1, 8),
            { day: 12, bbt: 36.7 },
            { day: 19, bbt: 36.72 },
            { day: 26, bbt: 36.68 },
        ]);
        const result = detectOvulation(CYCLE_START, onDay(26), logs, settings());
        expect(result.status).not.toBe('ovulation_confirmed');
        expect(result.confirmedDate).toBeNull();
    });

    it('works from a short baseline when the user started logging late', () => {
        const logs = buildLogs([
            { day: 8, bbt: 36.35 },
            { day: 9, bbt: 36.4 },
            { day: 10, bbt: 36.38 },
            { day: 11, bbt: 36.36 },
            { day: 12, bbt: 36.7 },
            { day: 13, bbt: 36.72 },
            { day: 14, bbt: 36.7 },
        ]);
        const result = detectOvulation(CYCLE_START, onDay(14), logs, settings());
        expect(result.status).toBe('ovulation_confirmed');
        expect(result.confirmedDate).toBe(day(11));
    });
});

// ============================================================================
// ANOVULATORY / PCOS-AWARE DETECTION
// ============================================================================

describe('anovulatory pattern detection', () => {
    it('flags persistent OPK highs that never reach a peak', () => {
        const logs = buildLogs([
            { day: 12, opk: 'high' },
            { day: 14, opk: 'high' },
            { day: 16, opk: 'high' },
            { day: 18, opk: 'high' },
        ]);
        const result = detectOvulation(CYCLE_START, onDay(19), logs, settings());
        expect(result.anovulatory?.detected).toBe(true);
        expect(result.anovulatory?.reasons).toContain('persistent_opk_highs_no_peak');
        // The point of the flag: do NOT draw a confident fertile window.
        expect(result.status).toBe('monitoring');
        expect(result.fertileWindowStart).toBeNull();
        expect(result.confidence).toBe('low');
        expect(result.explanation).toContain('doctor');
    });

    it('lowers the OPK threshold when the user reported PCOS', () => {
        const logs = buildLogs([
            { day: 12, opk: 'high' },
            { day: 14, opk: 'high' },
            { day: 16, opk: 'high' },
        ]);
        const withoutPcos = detectOvulation(CYCLE_START, onDay(17), logs, settings());
        const withPcos = detectOvulation(CYCLE_START, onDay(17), logs, settings(), { hasPcos: true });

        expect(withoutPcos.anovulatory).toBeNull();
        expect(withoutPcos.status).toBe('fertile_window');

        expect(withPcos.anovulatory?.detected).toBe(true);
        expect(withPcos.status).toBe('monitoring');
        expect(withPcos.anovulatory?.note).toContain('PCOS');
    });

    it('flags a well-logged cycle with no thermal shift well past expected ovulation', () => {
        const logs = buildLogs(baselineTemps(1, 22));
        const result = detectOvulation(CYCLE_START, onDay(22), logs, settings());
        expect(result.anovulatory?.reasons).toContain('no_thermal_shift_late_in_cycle');
        expect(result.status).toBe('monitoring');
    });

    it('stays quiet when the user simply has not logged anything', () => {
        const result = detectOvulation(CYCLE_START, onDay(25), {}, settings());
        expect(result.anovulatory).toBeNull();
    });

    it('stays quiet when only a few temperatures were logged', () => {
        const logs = buildLogs(baselineTemps(1, 5));
        const result = detectOvulation(CYCLE_START, onDay(22), logs, settings());
        expect(result.anovulatory).toBeNull();
    });

    it('never flags a cycle where ovulation was confirmed', () => {
        const logs = {
            ...classicBbtCycle(),
            ...buildLogs([
                { day: 8, opk: 'high' },
                { day: 9, opk: 'high' },
                { day: 10, opk: 'high' },
                { day: 11, opk: 'high' },
            ]),
        };
        const result = detectOvulation(CYCLE_START, onDay(20), logs, settings(), { hasPcos: true });
        expect(result.status).toBe('ovulation_confirmed');
        expect(result.anovulatory).toBeNull();
    });

    it('flags an overdue cycle with data but no signals', () => {
        const signal = detectAnovulatoryPattern({
            bbt: [],
            opk: [
                { date: day(10), value: 'negative' },
                { date: day(12), value: 'negative' },
                { date: day(14), value: 'negative' },
            ],
            thermalShift: null,
            opkPeakDate: null,
            dayInCycle: 40,
            expectedOvulationDay: 14,
            cycleLength: 28,
            hasPcos: false,
        });
        expect(signal?.reasons).toContain('cycle_overdue_no_signals');
    });
});

// ============================================================================
// CHART SUPPORT
// ============================================================================

describe('coverline for charting', () => {
    it('returns the confirmed coverline once a shift is found', () => {
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.7),
            reading(15, 36.72),
            reading(16, 36.68),
        ];
        expect(currentCoverline(readings)).toBeCloseTo(36.45, 5);
    });

    it('excludes an in-progress rise from its own baseline', () => {
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.7),
            reading(15, 36.72),
        ];
        expect(partialRiseLength(readings)).toBe(2);
        expect(currentCoverline(readings)).toBeCloseTo(36.45, 5);
    });

    it('is null before there is enough data to draw one', () => {
        expect(currentCoverline([reading(1, 36.4), reading(2, 36.4)])).toBeNull();
    });

    it('uses at most the last six readings as the baseline', () => {
        const readings = [
            reading(1, 37.0), // an early outlier that must not raise the coverline
            ...baselineTemps(2, 9).map((e) => reading(e.day, e.bbt!)),
        ];
        expect(readings.length).toBeGreaterThan(BASELINE_READINGS);
        expect(currentCoverline(readings)).toBeCloseTo(36.45, 5);
    });
});
