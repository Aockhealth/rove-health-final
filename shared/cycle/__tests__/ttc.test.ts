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
    contributingSignalsFromMethod,
    currentCoverline,
    detectAnovulatoryPattern,
    detectOvulation,
    detectThermalShift,
    findOpkPeak,
    hasNsaidWithinWindow,
    partialRiseLength,
    BASELINE_READINGS,
    COVERLINE_OFFSET_C,
    MIN_BASELINE_READINGS,
    PERIOVULATORY_NSAID_WINDOW_DAYS,
    type BbtReading,
    type OpkResult,
    type TtcDailyLog,
} from '../ttc';
import { parseLocalDate, type CycleSettings } from '../phase';
import type { MucusReading } from '../mucus';

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

type Entry = {
    day: number;
    bbt?: number;
    opk?: OpkResult | string;
    disruptors?: string[];
    sleepMinutes?: number;
    wakeTime?: string;
    nsaid?: boolean;
};

const buildLogs = (entries: Entry[]): Record<string, TtcDailyLog> => {
    const logs: Record<string, TtcDailyLog> = {};
    for (const entry of entries) {
        const date = day(entry.day);
        logs[date] = {
            ...(logs[date] ?? { date }),
            ...(entry.bbt !== undefined ? { bbt_celsius: entry.bbt } : {}),
            ...(entry.opk !== undefined ? { opk_result: entry.opk as OpkResult } : {}),
            ...(entry.disruptors !== undefined ? { disruptors: entry.disruptors } : {}),
            ...(entry.sleepMinutes !== undefined ? { sleep_minutes: entry.sleepMinutes } : {}),
            ...(entry.wakeTime !== undefined ? { bbt_wake_time: entry.wakeTime } : {}),
            ...(entry.nsaid !== undefined ? { nsaid_taken: entry.nsaid } : {}),
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
const classicBbtCycleEntries = (): Entry[] => [
    ...baselineTemps(1, 13),
    { day: 14, bbt: 36.7 },
    { day: 15, bbt: 36.72 },
    { day: 16, bbt: 36.68 },
];
const classicBbtCycle = (): Record<string, TtcDailyLog> => buildLogs(classicBbtCycleEntries());

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
        expect(shift!.coverline).toBeCloseTo(36.55, 5);
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

    it('does not confirm a rise that clears the old 0.05°C epsilon but not the current 0.15°C clinical threshold', () => {
        // Baseline high is 36.4; a 0.1°C rise would have confirmed under the
        // old epsilon-above-max rule but falls short of Sensiplan/TCOYF-aligned
        // COVERLINE_OFFSET_C, so it should read as noise, not a shift.
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.5),
            reading(15, 36.5),
            reading(16, 36.5),
        ];
        expect(detectThermalShift(readings)).toBeNull();
    });
});

// ============================================================================
// BBT EXCLUSION FILTERING (preprocessing before baseline/rise detection)
// ============================================================================

describe('collectCycleReadings excludes noisy BBT readings', () => {
    it('excludes a reading logged alongside illness', () => {
        const logs = buildLogs([...baselineTemps(1, 5), { day: 6, bbt: 37.2, disruptors: ['Illness'] }]);
        const { bbt } = collectCycleReadings(CYCLE_START, onDay(6), logs);
        expect(bbt.some((r) => r.date === day(6))).toBe(false);
    });

    it('excludes a reading logged alongside alcohol', () => {
        const logs = buildLogs([...baselineTemps(1, 5), { day: 6, bbt: 36.6, disruptors: ['Alcohol'] }]);
        const { bbt } = collectCycleReadings(CYCLE_START, onDay(6), logs);
        expect(bbt.some((r) => r.date === day(6))).toBe(false);
    });

    it('excludes a reading taken after under 4 hours of sleep', () => {
        const logs = buildLogs([...baselineTemps(1, 5), { day: 6, bbt: 36.6, sleepMinutes: 180 }]);
        const { bbt } = collectCycleReadings(CYCLE_START, onDay(6), logs);
        expect(bbt.some((r) => r.date === day(6))).toBe(false);
    });

    it('excludes a reading taken far from her rolling wake-time average this cycle', () => {
        const logs = buildLogs([
            { day: 1, bbt: 36.35, wakeTime: '06:30' },
            { day: 2, bbt: 36.4, wakeTime: '06:40' },
            { day: 3, bbt: 36.35, wakeTime: '06:35' },
            { day: 4, bbt: 36.4, wakeTime: '09:15' }, // ~160 min off her ~06:35 average
        ]);
        const { bbt } = collectCycleReadings(CYCLE_START, onDay(4), logs);
        expect(bbt.map((r) => r.date)).toEqual([day(1), day(2), day(3)]);
    });

    it('keeps a clean reading with a consistent wake time and no disruptors', () => {
        const logs = buildLogs([
            { day: 1, bbt: 36.35, wakeTime: '06:30', sleepMinutes: 420 },
            { day: 2, bbt: 36.4, wakeTime: '06:35', sleepMinutes: 430 },
        ]);
        const { bbt } = collectCycleReadings(CYCLE_START, onDay(2), logs);
        expect(bbt.map((r) => r.date)).toEqual([day(1), day(2)]);
    });

    it('does not misread a rise as confirmed when the first elevated reading was a fever', () => {
        const logs = buildLogs([
            ...baselineTemps(1, 13),
            { day: 14, bbt: 37.4, disruptors: ['Illness'] }, // excluded — not a real rise start
            { day: 15, bbt: 36.72 },
            { day: 16, bbt: 36.68 },
        ]);
        const result = detectOvulation(CYCLE_START, onDay(16), logs, settings());
        // Only 2 valid elevated readings remain (15, 16) — one short of the
        // 3 needed to confirm, so this must not read as a thermal shift.
        expect(result.status).not.toBe('ovulation_confirmed');
    });
});

// ============================================================================
// PERIOVULATORY NSAID FLAG
// ============================================================================

describe('hasNsaidWithinWindow', () => {
    it('is true when logged on the center date itself', () => {
        const logs = buildLogs([{ day: 14, nsaid: true }]);
        expect(hasNsaidWithinWindow(logs, day(14))).toBe(true);
    });

    it('is true within the window on either side', () => {
        const logs = buildLogs([{ day: 14 - PERIOVULATORY_NSAID_WINDOW_DAYS, nsaid: true }]);
        expect(hasNsaidWithinWindow(logs, day(14))).toBe(true);
    });

    it('is false outside the window', () => {
        const logs = buildLogs([{ day: 14 - PERIOVULATORY_NSAID_WINDOW_DAYS - 1, nsaid: true }]);
        expect(hasNsaidWithinWindow(logs, day(14))).toBe(false);
    });

    it('is false with no NSAID logged at all', () => {
        expect(hasNsaidWithinWindow({}, day(14))).toBe(false);
    });
});

describe('detectOvulation periovulatoryNsaidFlag', () => {
    it('fires when NSAID use falls within the periovulatory window of a confirmed cycle', () => {
        const logs = buildLogs([
            ...classicBbtCycleEntries(),
            { day: 13, nsaid: true }, // the confirmed ovulation date itself (rise starts day 14, so ovulation = day 13)
        ]);
        const result = detectOvulation(CYCLE_START, onDay(16), logs, settings());
        expect(result.status).toBe('ovulation_confirmed');
        expect(result.periovulatoryNsaidFlag).toBe(true);
    });

    it('does not fire when NSAID use falls well outside the window', () => {
        const logs = buildLogs([...classicBbtCycleEntries(), { day: 1, nsaid: true }]);
        const result = detectOvulation(CYCLE_START, onDay(16), logs, settings());
        expect(result.periovulatoryNsaidFlag).toBe(false);
    });

    it('is false when nothing is logged', () => {
        const result = detectOvulation(CYCLE_START, onDay(12), {}, settings());
        expect(result.periovulatoryNsaidFlag).toBe(false);
    });
});

// ============================================================================
// CERVICAL MUCUS (coincident signal — sharpens confidence, never confirms)
// ============================================================================

describe('detectOvulation with mucus readings', () => {
    const mucus = (d: number): MucusReading => ({
        date: day(d),
        vaginalFluid: 'Stretchy',
        appearance: 'Clear',
        sensation: 'Wet',
    });

    it('lifts a bare date-math guess from low to medium confidence', () => {
        const withMucus = detectOvulation(CYCLE_START, onDay(13), {}, settings(), {
            mucusReadings: [mucus(13)],
        });
        expect(withMucus.status).toBe('fertile_window');
        expect(withMucus.confidence).toBe('medium');
        expect(withMucus.explanation).toContain('egg-white mucus');

        const withoutMucus = detectOvulation(CYCLE_START, onDay(13), {}, settings());
        expect(withoutMucus.confidence).toBe('low');
    });

    it('never promotes status on its own — coincident, not confirming', () => {
        const result = detectOvulation(CYCLE_START, onDay(13), {}, settings(), {
            mucusReadings: [mucus(13)],
        });
        expect(result.status).not.toBe('ovulation_confirmed');
        expect(result.status).not.toBe('ovulation_likely');
        expect(result.confirmedDate).toBeNull();
    });

    it('ignores a peak-quality reading well outside the fertile window', () => {
        const result = detectOvulation(CYCLE_START, onDay(13), {}, settings(), {
            mucusReadings: [mucus(1)],
        });
        expect(result.confidence).toBe('low');
    });
});

// ============================================================================
// NO DATA — DATE-MATH FALLBACK
// ============================================================================

describe('detectOvulation with no biomarker data', () => {
    it('falls back to date math inside the expected fertile window', () => {
        // With no cycle history logged, the window uses the population SD
        // fallback (sigma=4), not the old fixed -5/+1 — see phase.ts's
        // computeFertileWindowRadius. before = 5+ceil(4) = 9, after = 1+ceil(4/2) = 3.
        const result = detectOvulation(CYCLE_START, onDay(12), {}, settings());
        expect(result.method).toBe('date_math');
        expect(result.status).toBe('fertile_window');
        expect(result.predictedDate).toBe(day(14));
        expect(result.fertileWindowStart).toBe(day(5));
        expect(result.fertileWindowEnd).toBe(day(17));
        expect(result.confidence).toBe('low');
        expect(result.anovulatory).toBeNull();
    });

    it('reports monitoring before the window opens, with the opening date', () => {
        const result = detectOvulation(CYCLE_START, onDay(3), {}, settings());
        expect(result.status).toBe('monitoring');
        expect(result.fertileWindowStart).toBe(day(5));
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
// VARIANCE-AWARE FERTILE WINDOW (recentCycleLengths)
// ============================================================================

describe('detectOvulation with recentCycleLengths', () => {
    it('narrows the window for a regular history instead of the wide population default', () => {
        // SD of [28,29,27,28,29,28] is well under 1.5, so the floor kicks in:
        // before = 5+ceil(1.5) = 7, after = 1+ceil(0.75) = 2 — tighter than the
        // population-default 9/3 used when no history is passed at all.
        const result = detectOvulation(CYCLE_START, onDay(12), {}, settings(), {
            recentCycleLengths: [28, 29, 27, 28, 29, 28],
        });
        expect(result.status).toBe('fertile_window');
        expect(result.fertileWindowStart).toBe(day(7));
        expect(result.fertileWindowEnd).toBe(day(16));
    });

    it('stops drawing a window at all for a highly irregular history', () => {
        // SD of [24,50,28,60,32] is well over the 5-day usable ceiling.
        const result = detectOvulation(CYCLE_START, onDay(12), {}, settings(), {
            recentCycleLengths: [24, 50, 28, 60, 32],
        });
        expect(result.status).toBe('monitoring');
        expect(result.fertileWindowStart).toBeNull();
        expect(result.fertileWindowEnd).toBeNull();
        expect(result.explanation).toContain('Test daily');
    });

    it('fewer than 3 logged cycles still falls back to the population default, not her partial data', () => {
        const withTwoCycles = detectOvulation(CYCLE_START, onDay(12), {}, settings(), {
            recentCycleLengths: [28, 29],
        });
        const withNoHistory = detectOvulation(CYCLE_START, onDay(12), {}, settings());
        expect(withTwoCycles.fertileWindowStart).toBe(withNoHistory.fertileWindowStart);
        expect(withTwoCycles.fertileWindowEnd).toBe(withNoHistory.fertileWindowEnd);
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
        expect(result.coverline).toBeCloseTo(36.55, 5);
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
// LH BAND READINGS (graded strip, replaces/augments the legacy OPK dropdown)
// ============================================================================

describe('detectOvulation with LH band readings', () => {
    const bandReading = (d: number, bandLevel: number) => ({
        date: day(d),
        testTime: `${day(d)}T09:00:00Z`,
        bandLevel,
    });

    it('predicts ovulation from a band-derived peak with no personal baseline yet (first cycle)', () => {
        // Only 2 readings ever logged — below the 3-reading minimum for a
        // personal baseline, so the absolute floor alone decides.
        const result = detectOvulation(CYCLE_START, onDay(14), {}, settings(), {
            lhReadings: [bandReading(12, 2), bandReading(13, 4)],
        });
        expect(result.method).toBe('opk_only');
        expect(result.status).toBe('ovulation_likely');
        expect(result.opkPeakDate).toBe(day(13));
        expect(result.predictedDate).toBe(day(14));
    });

    it('takes priority over a disagreeing legacy OPK dropdown entry', () => {
        const logs = buildLogs([{ day: 11, opk: 'peak' }]); // legacy dropdown says day 11
        const result = detectOvulation(CYCLE_START, onDay(14), logs, settings(), {
            lhReadings: [bandReading(10, 0), bandReading(13, 4)], // band data says day 13
        });
        expect(result.opkPeakDate).toBe(day(13));
    });

    it('falls back to the legacy OPK dropdown when no LH band data is logged', () => {
        const logs = buildLogs([{ day: 11, opk: 'peak' }]);
        const result = detectOvulation(CYCLE_START, onDay(14), logs, settings());
        expect(result.opkPeakDate).toBe(day(11));
    });

    it("uses her personal baseline across all logged cycles, not just this cycle's readings", () => {
        // A chronically elevated (PCOS-like) baseline of 2, built from a
        // prior cycle. This cycle: one reading only +1 above baseline (not
        // a surge) and one genuinely +2 above it (a real surge).
        const priorCycle = [bandReading(-25, 2), bandReading(-24, 2), bandReading(-23, 2)];
        const thisCycle = [bandReading(11, 3), bandReading(12, 4)];
        const result = detectOvulation(CYCLE_START, onDay(14), {}, settings(), {
            lhReadings: [...priorCycle, ...thisCycle],
        });
        expect(result.opkPeakDate).toBe(day(12));
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
        expect(currentCoverline(readings)).toBeCloseTo(36.55, 5);
    });

    it('excludes an in-progress rise from its own baseline', () => {
        const readings = [
            ...baselineTemps(1, 13).map((e) => reading(e.day, e.bbt!)),
            reading(14, 36.7),
            reading(15, 36.72),
        ];
        expect(partialRiseLength(readings)).toBe(2);
        expect(currentCoverline(readings)).toBeCloseTo(36.55, 5);
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
        expect(currentCoverline(readings)).toBeCloseTo(36.55, 5);
    });
});

describe('contributingSignalsFromMethod', () => {
    it('maps each method to its contributing signal list', () => {
        expect(contributingSignalsFromMethod('combined')).toEqual(['bbt', 'opk_or_lh']);
        expect(contributingSignalsFromMethod('bbt_only')).toEqual(['bbt']);
        expect(contributingSignalsFromMethod('opk_only')).toEqual(['opk_or_lh']);
        expect(contributingSignalsFromMethod('date_math')).toEqual([]);
    });
});
