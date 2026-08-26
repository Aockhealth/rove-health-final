/**
 * Phase Calculation Unit Tests
 * 
 * Tests for shared/cycle/phase.ts - the canonical phase calculation module.
 * Run with: npx jest shared/cycle/__tests__/phase.test.ts
 */

import {
    calculatePhase,
    calculateSmartPhase,
    calculatePhaseLegacy,
    formatDate,
    parseLocalDate,
    daysBetween,
    normalizeToLocalMidnight,
    findStreakStart,
    getRelevantPeriodStart,
    isInFertileWindow,
    getOvulationDay,
    computeFertileWindowRadius,
    deriveRecentCycleLengths,
    deriveObservedCycleLength,
    resolveCycleSettings,
    stalePeriodEndMarkersAfter,
    MAX_TRUSTED_SETTINGS_ANCHOR_LATE_DAYS,
    type CycleSettings,
    type DailyLog,
    type PhaseResult,
    DEFAULT_CYCLE_LENGTH,
    DEFAULT_PERIOD_LENGTH,
    DEFAULT_LUTEAL_LENGTH
} from '../phase';

// ============================================================================
// TEST DATA
// ============================================================================

const createSettings = (overrides: Partial<CycleSettings> = {}): CycleSettings => ({
    last_period_start: '2026-01-01',
    cycle_length_days: 28,
    period_length_days: 5,
    ...overrides
});

const createLog = (date: string, is_period: boolean): DailyLog => ({
    date,
    is_period
});

// ============================================================================
// HELPER FUNCTION TESTS
// ============================================================================

describe('Helper functions', () => {
    describe('formatDate', () => {
        it('formats date correctly', () => {
            const d = new Date(2026, 0, 15); // Jan 15, 2026
            expect(formatDate(d)).toBe('2026-01-15');
        });

        it('pads single-digit months and days', () => {
            const d = new Date(2026, 0, 5); // Jan 5, 2026
            expect(formatDate(d)).toBe('2026-01-05');
        });
    });

    describe('parseLocalDate', () => {
        it('parses YYYY-MM-DD to local midnight', () => {
            const d = parseLocalDate('2026-01-15');
            expect(d.getFullYear()).toBe(2026);
            expect(d.getMonth()).toBe(0); // January
            expect(d.getDate()).toBe(15);
            expect(d.getHours()).toBe(0);
            expect(d.getMinutes()).toBe(0);
        });
    });

    describe('daysBetween', () => {
        it('calculates days correctly', () => {
            const start = new Date(2026, 0, 1);
            const end = new Date(2026, 0, 10);
            expect(daysBetween(start, end)).toBe(9);
        });

        it('returns 0 for same day', () => {
            const d = new Date(2026, 0, 1);
            expect(daysBetween(d, d)).toBe(0);
        });

        it('handles negative difference', () => {
            const start = new Date(2026, 0, 10);
            const end = new Date(2026, 0, 1);
            expect(daysBetween(start, end)).toBe(-9);
        });
    });

    describe('normalizeToLocalMidnight', () => {
        it('does not mutate input', () => {
            const original = new Date(2026, 0, 15, 14, 30);
            const normalized = normalizeToLocalMidnight(original);
            expect(original.getHours()).toBe(14);
            expect(normalized.getHours()).toBe(0);
        });
    });
});

// ============================================================================
// BOUNDARY CASE TESTS
// ============================================================================

describe('Boundary cases', () => {
    const settings = createSettings({ last_period_start: '2026-01-01' });

    it('returns day 1 on period start date', () => {
        const result = calculatePhase(parseLocalDate('2026-01-01'), settings, {});
        expect(result.day).toBe(1);
        expect(result.phase).toBe('Menstrual');
    });

    it('returns day 28 on last day of 28-day cycle', () => {
        const result = calculatePhase(parseLocalDate('2026-01-28'), settings, {});
        expect(result.day).toBe(28);
        expect(result.phase).toBe('Luteal');
    });

    it('wraps correctly to day 1 when new cycle would start (without late check)', () => {
        // Day 29 should be day 1 of new cycle IF period is on time
        // But with late period detection, this becomes latePeriod=true
        const futureSettings = createSettings({ last_period_start: '2025-12-01' });
        const result = calculatePhase(parseLocalDate('2025-12-29'), futureSettings, {});
        // This is day 29, past cycle length, so should be late period
        expect(result.latePeriod).toBe(true);
    });

    it('handles period length = 1', () => {
        const shortPeriod = createSettings({ period_length_days: 1 });
        const day1 = calculatePhase(parseLocalDate('2026-01-01'), shortPeriod, {});
        const day2 = calculatePhase(parseLocalDate('2026-01-02'), shortPeriod, {});

        expect(day1.phase).toBe('Menstrual');
        expect(day2.phase).toBe('Follicular');
    });

    it('handles short cycle (21 days)', () => {
        const shortCycle = createSettings({ cycle_length_days: 21 });
        const ovulationDay = 21 - 14; // Day 7

        const result = calculatePhase(parseLocalDate('2026-01-07'), shortCycle, {});
        expect(result.phase).toBe('Ovulatory');
    });

    it('handles long cycle (45 days)', () => {
        const longCycle = createSettings({ cycle_length_days: 45 });
        const ovulationDay = 45 - 14; // Day 31

        const result = calculatePhase(parseLocalDate('2026-01-31'), longCycle, {});
        expect(result.phase).toBe('Ovulatory');
    });
});

// ============================================================================
// LATE PERIOD TESTS
// ============================================================================

describe('Late period handling', () => {
    it('returns Luteal with latePeriod=true when past cycle length', () => {
        const settings = createSettings({ last_period_start: '2026-01-01' });
        // Day 30 of a 28-day cycle
        const result = calculatePhase(parseLocalDate('2026-01-30'), settings, {});

        expect(result.phase).toBe('Luteal');
        expect(result.latePeriod).toBe(true);
        expect(result.day).toBe(30); // Actual days, not wrapped
    });

    it('does NOT wrap to Menstrual day 1 when period is late', () => {
        const settings = createSettings({ last_period_start: '2026-01-01' });
        // Day 35 of a 28-day cycle
        const result = calculatePhase(parseLocalDate('2026-02-04'), settings, {});

        expect(result.phase).toBe('Luteal');
        expect(result.day).toBe(35);
        expect(result.latePeriod).toBe(true);
    });

    it('correctly updates phase once new period is logged', () => {
        const settings = createSettings({ last_period_start: '2026-01-01' });
        const logs: Record<string, DailyLog> = {
            '2026-02-01': createLog('2026-02-01', true)
        };

        const result = calculatePhase(parseLocalDate('2026-02-01'), settings, logs);

        expect(result.phase).toBe('Menstrual');
        expect(result.day).toBe(1);
        expect(result.latePeriod).toBe(false);
    });
});

// ============================================================================
// DST TRANSITION TESTS
// ============================================================================

describe('DST transitions', () => {
    // Note: These tests may behave differently depending on the system timezone
    // For thorough testing, run in a timezone that observes DST

    it('maintains correct day count in March (spring forward)', () => {
        // March 8, 2026 - typical US DST spring forward date
        const settings = createSettings({ last_period_start: '2026-03-01' });

        const day1 = calculatePhase(parseLocalDate('2026-03-01'), settings, {});
        const day10 = calculatePhase(parseLocalDate('2026-03-10'), settings, {});

        expect(day1.day).toBe(1);
        expect(day10.day).toBe(10);
    });

    it('maintains correct day count in November (fall back)', () => {
        // November 1, 2026 - typical US DST fall back date
        const settings = createSettings({ last_period_start: '2026-11-01' });

        const day1 = calculatePhase(parseLocalDate('2026-11-01'), settings, {});
        const day10 = calculatePhase(parseLocalDate('2026-11-10'), settings, {});

        expect(day1.day).toBe(1);
        expect(day10.day).toBe(10);
    });
});

// ============================================================================
// LEAP YEAR TESTS
// ============================================================================

describe('Leap years', () => {
    // 2024 was a leap year

    it('correctly calculates across Feb 29', () => {
        const settings = createSettings({
            last_period_start: '2024-02-25',
            cycle_length_days: 28
        });

        // Feb 29 should be day 5
        const result = calculatePhase(parseLocalDate('2024-02-29'), settings, {});
        expect(result.day).toBe(5);
    });

    it('handles period starting on Feb 29', () => {
        const settings = createSettings({
            last_period_start: '2024-02-29',
            cycle_length_days: 28
        });

        const day1 = calculatePhase(parseLocalDate('2024-02-29'), settings, {});
        const day2 = calculatePhase(parseLocalDate('2024-03-01'), settings, {});

        expect(day1.day).toBe(1);
        expect(day2.day).toBe(2);
    });

    it('handles cycle spanning Feb 28 → Mar 1 in leap year', () => {
        const settings = createSettings({
            last_period_start: '2024-02-01',
            cycle_length_days: 28
        });

        // Feb 29 is day 29, which should trigger late period
        const result = calculatePhase(parseLocalDate('2024-02-29'), settings, {});
        expect(result.day).toBe(29);
        expect(result.latePeriod).toBe(true);
    });
});

// ============================================================================
// NO DATA HANDLING TESTS
// ============================================================================

describe('No data handling', () => {
    it('returns null phase when no logs and no valid settings', () => {
        const emptySettings: CycleSettings = {
            last_period_start: '', // Empty
            cycle_length_days: 28,
            period_length_days: 5
        };

        const result = calculatePhase(new Date(), emptySettings, {});
        expect(result.phase).toBeNull();
        expect(result.dataSource).toBe('none');
    });

    it('returns medium confidence when only settings exist', () => {
        const settings = createSettings();
        const result = calculatePhase(parseLocalDate('2026-01-15'), settings, {});

        expect(result.confidence).toBe('medium');
        expect(result.dataSource).toBe('settings');
    });

    it('returns high confidence when logs exist', () => {
        const settings = createSettings();
        const logs: Record<string, DailyLog> = {
            '2026-01-01': createLog('2026-01-01', true)
        };

        const result = calculatePhase(parseLocalDate('2026-01-01'), settings, logs);

        expect(result.confidence).toBe('high');
        expect(result.dataSource).toBe('logs');
    });
});

// ============================================================================
// EXPLICIT OVERRIDE TESTS
// ============================================================================

describe('Explicit overrides', () => {
    it('respects is_period=true override', () => {
        const settings = createSettings({ last_period_start: '2026-01-01' });
        // Day 15 would normally be Follicular
        const logs: Record<string, DailyLog> = {
            '2026-01-15': createLog('2026-01-15', true)
        };

        const result = calculatePhase(parseLocalDate('2026-01-15'), settings, logs);
        expect(result.phase).toBe('Menstrual');
    });

    it('respects is_period=false to end period early', () => {
        const settings = createSettings({
            last_period_start: '2026-01-01',
            period_length_days: 5
        });
        // Day 3 would normally be Menstrual, but user ended period
        const logs: Record<string, DailyLog> = {
            '2026-01-03': createLog('2026-01-03', false)
        };

        const result = calculatePhase(parseLocalDate('2026-01-03'), settings, logs);
        expect(result.phase).toBe('Follicular');
    });

    it('prioritizes logs over settings for period start', () => {
        const settings = createSettings({ last_period_start: '2026-01-01' });
        const logs: Record<string, DailyLog> = {
            '2026-01-05': createLog('2026-01-05', true),
            '2026-01-06': createLog('2026-01-06', true)
        };

        // Checking day 6 - should find streak starting at 5
        const result = calculatePhase(parseLocalDate('2026-01-06'), settings, logs);
        expect(result.day).toBe(2); // Day 2 of streak starting Jan 5
    });

    it('ignores stale is_period=false from a previous cycle', () => {
        // Scenario: Previous "End Period Here" left is_period=false on Jan 29.
        // New period starts Jan 28 (logged). Jan 29 should be Menstrual (day 2),
        // NOT Follicular from the stale false entry.
        const settings = createSettings({
            last_period_start: '2026-01-28',
            period_length_days: 5
        });
        const logs: Record<string, DailyLog> = {
            '2026-01-28': createLog('2026-01-28', true),
            '2026-01-29': createLog('2026-01-29', false), // Stale from old cycle
        };

        const result = calculatePhase(parseLocalDate('2026-01-29'), settings, logs);
        // The false entry is NOT adjacent to a continuous period streak from Jan 28
        // (Jan 28 IS true, but the next day is false — this IS adjacent, so should be respected)
        // Actually: Jan 28 true → Jan 29 false. The chain from Jan 28 (true) reaches Jan 29.
        // This is a VALID "End Period Here" scenario, so should be Follicular.
        expect(result.phase).toBe('Follicular');
    });

    it('ignores stale is_period=false when no adjacent period streak exists', () => {
        // Scenario: Old "End Period Here" left is_period=false on Feb 3.
        // New period starts Feb 1 via logs. Feb 2 has no log. Feb 3 has false.
        // Since there's a gap (Feb 2 has no is_period=true), the false on Feb 3 is stale.
        const settings = createSettings({
            last_period_start: '2026-01-01',
            period_length_days: 5
        });
        const logs: Record<string, DailyLog> = {
            '2026-02-01': createLog('2026-02-01', true),
            '2026-02-03': createLog('2026-02-03', false), // Stale — gap on Feb 2
        };

        const result = calculatePhase(parseLocalDate('2026-02-03'), settings, logs);
        // Feb 3 is day 3 of cycle starting Feb 1. No continuous true chain from Feb 1 to Feb 2.
        // So the false entry is stale and should be ignored → Menstrual.
        expect(result.phase).toBe('Menstrual');
    });

    it('respects is_period=false when adjacent to continuous period streak', () => {
        // Valid "End Period Here": User logged Jan 1, 2, 3 as period, then ended.
        // Jan 4 gets is_period=false — this is valid and should be Follicular.
        const settings = createSettings({
            last_period_start: '2026-01-01',
            period_length_days: 5
        });
        const logs: Record<string, DailyLog> = {
            '2026-01-01': createLog('2026-01-01', true),
            '2026-01-02': createLog('2026-01-02', true),
            '2026-01-03': createLog('2026-01-03', true),
            '2026-01-04': createLog('2026-01-04', false), // Valid "End Period Here"
        };

        const result = calculatePhase(parseLocalDate('2026-01-04'), settings, logs);
        expect(result.phase).toBe('Follicular');
    });
});

// ============================================================================
// FERTILITY HELPER TESTS
// ============================================================================

describe('Spotty logging / gap tolerance', () => {
    it('findStreakStart bridges a short gap in logged period days', () => {
        // Logged Jul 19, 20, skipped 21-22, logged 23 again — same real period.
        const logs: Record<string, DailyLog> = {
            '2026-07-19': createLog('2026-07-19', true),
            '2026-07-20': createLog('2026-07-20', true),
            '2026-07-23': createLog('2026-07-23', true),
        };

        expect(findStreakStart('2026-07-23', logs)).toBe('2026-07-19');
    });

    it('findStreakStart stops once the gap exceeds tolerance', () => {
        const logs: Record<string, DailyLog> = {
            '2026-07-01': createLog('2026-07-01', true),
            '2026-07-10': createLog('2026-07-10', true), // 8-day gap — not the same streak
        };

        expect(findStreakStart('2026-07-10', logs)).toBe('2026-07-10');
    });

    it('does not fabricate a new cycle when a period is logged with a mid-streak gap', () => {
        // Reproduces the reported bug: logging Jul 19, 20, (gap), 23 should not
        // reset the cycle anchor to Jul 23 and flip Jul 24 to Follicular.
        const settings = createSettings({ last_period_start: '2026-06-26', cycle_length_days: 28 });
        const logs: Record<string, DailyLog> = {
            '2026-07-19': createLog('2026-07-19', true),
            '2026-07-20': createLog('2026-07-20', true),
            '2026-07-23': createLog('2026-07-23', true),
        };

        const { start, source } = getRelevantPeriodStart(parseLocalDate('2026-07-24'), settings, logs);
        expect(source).toBe('logs');
        expect(start).toBe('2026-07-19');
    });
});

describe('Fertility helpers', () => {
    describe('isInFertileWindow', () => {
        it('returns true in fertile window', () => {
            // 28-day cycle, ovulation day 14, fertile window days 9-16
            expect(isInFertileWindow(12, 28)).toBe(true);
            expect(isInFertileWindow(14, 28)).toBe(true);
            expect(isInFertileWindow(15, 28)).toBe(true);
        });

        it('returns false outside fertile window', () => {
            expect(isInFertileWindow(5, 28)).toBe(false);
            expect(isInFertileWindow(20, 28)).toBe(false);
        });
    });

    describe('getOvulationDay', () => {
        it('calculates correctly for 28-day cycle', () => {
            expect(getOvulationDay(28)).toBe(14);
        });

        it('calculates correctly for 35-day cycle', () => {
            expect(getOvulationDay(35)).toBe(21);
        });

        it('respects custom luteal length', () => {
            expect(getOvulationDay(28, 12)).toBe(16);
        });
    });

    describe('computeFertileWindowRadius', () => {
        it('falls back to the wide population SD with fewer than 3 cycles logged', () => {
            expect(computeFertileWindowRadius([])).toEqual({
                before: 9, // 5 + ceil(4)
                after: 3,  // 1 + ceil(4/2)
                sigma: 4,
                tooIrregularForWindow: false,
            });
            // Two cycles isn't enough to trust over the population default either.
            const withTwo = computeFertileWindowRadius([28, 30]);
            expect(withTwo.sigma).toBe(4);
        });

        it('narrows for a regular personal history, down to the SD floor', () => {
            const radius = computeFertileWindowRadius([28, 29, 27, 28, 29, 28]);
            expect(radius.sigma).toBe(1.5); // real SD (~0.69) is below the 1.5 floor
            expect(radius.before).toBe(7);  // 5 + ceil(1.5)
            expect(radius.after).toBe(2);   // 1 + ceil(0.75)
            expect(radius.tooIrregularForWindow).toBe(false);
        });

        it('flags a highly irregular history as too wide to draw a window for', () => {
            const radius = computeFertileWindowRadius([24, 50, 28, 60, 32]);
            expect(radius.sigma).toBeGreaterThan(5);
            expect(radius.tooIrregularForWindow).toBe(true);
        });

        it('ignores non-finite/non-positive noise in the input', () => {
            const withJunk = computeFertileWindowRadius([28, NaN, -5, 0, 29, 27, 28, 29, 28]);
            const clean = computeFertileWindowRadius([28, 29, 27, 28, 29, 28]);
            expect(withJunk).toEqual(clean);
        });
    });

    describe('deriveRecentCycleLengths', () => {
        it('derives cycle lengths from consecutive logged period starts', () => {
            const logs: Record<string, DailyLog> = {};
            // Three 28-day cycles: Jan 1, Jan 29, Feb 26.
            for (const d of ['2026-01-01', '2026-01-02', '2026-01-29', '2026-01-30', '2026-02-26', '2026-02-27']) {
                logs[d] = createLog(d, true);
            }
            const lengths = deriveRecentCycleLengths(parseLocalDate('2026-03-10'), logs);
            expect(lengths).toEqual([28, 28]);
        });

        it('returns an empty array with no logged periods', () => {
            expect(deriveRecentCycleLengths(parseLocalDate('2026-03-10'), {})).toEqual([]);
        });
    });

    describe('isInFertileWindow with recentCycleLengths', () => {
        it('widens the window once history is passed, vs. the untouched fixed default', () => {
            // Day 17 sits outside the old fixed window (9..15) but inside the
            // population-SD-widened one (5..17). Omitting the 4th argument
            // entirely must keep the exact old behavior — passing `[]`
            // explicitly is what opts into widening.
            expect(isInFertileWindow(17, 28)).toBe(false);
            expect(isInFertileWindow(17, 28, DEFAULT_LUTEAL_LENGTH, [])).toBe(true);
        });

        it('never returns true when the personal history is too irregular to trust', () => {
            // Even a day that would otherwise sit inside a naive window is
            // excluded once tooIrregularForWindow fires — there's no window.
            expect(isInFertileWindow(14, 28, DEFAULT_LUTEAL_LENGTH, [24, 50, 28, 60, 32])).toBe(false);
        });
    });
});

// ============================================================================
// LEGACY ADAPTER TESTS
// ============================================================================

describe('Legacy adapters', () => {
    describe('calculateSmartPhase', () => {
        it('returns phase and day without null', () => {
            const settings = createSettings({ last_period_start: '' });
            const result = calculateSmartPhase(new Date(), settings, {});

            expect(result.phase).toBe('Menstrual'); // Fallback
            expect(result.day).toBe(1);
        });
    });

    describe('calculatePhaseLegacy', () => {
        it('works with old 4-param signature', () => {
            const result = calculatePhaseLegacy(
                parseLocalDate('2026-01-05'),
                '2026-01-01',
                28,
                5
            );

            expect(result.phase).toBe('Menstrual');
            expect(result.day).toBe(5);
        });

        it('preserves late-period day count and phase', () => {
            const result = calculatePhaseLegacy(
                parseLocalDate('2026-02-04'), // Day 35 from 2026-01-01
                '2026-01-01',
                28,
                5
            );

            expect(result.phase).toBe('Luteal');
            expect(result.day).toBe(35);
        });
    });

    // ========================================================================
    // OBSERVED CYCLE LENGTH  (the app learning her real cycle)
    // ========================================================================
    describe('deriveObservedCycleLength / resolveCycleSettings', () => {
        /** Logs period days for `periodLength` days from each start. */
        const logCycles = (starts: string[], periodLength = 4): Record<string, DailyLog> => {
            const logs: Record<string, DailyLog> = {};
            for (const start of starts) {
                const cursor = parseLocalDate(start);
                for (let i = 0; i < periodLength; i++) {
                    logs[formatDate(cursor)] = { date: formatDate(cursor), is_period: true };
                    cursor.setDate(cursor.getDate() + 1);
                }
            }
            return logs;
        };

        it('returns null until there are enough completed cycles to measure', () => {
            const logs = logCycles(['2026-01-01', '2026-02-04']); // 1 completed cycle
            expect(deriveObservedCycleLength(parseLocalDate('2026-02-20'), logs)).toBeNull();
        });

        it('measures her real cycle length from logged period starts', () => {
            // 34-day cycles, logged honestly, by someone whose settings say 28.
            const logs = logCycles(['2026-01-01', '2026-02-04', '2026-03-10', '2026-04-13']);
            expect(deriveObservedCycleLength(parseLocalDate('2026-04-20'), logs)).toBe(34);
        });

        it('uses the median so one skipped-log gap cannot drag the number', () => {
            // 30, 30, 58 (a missed period read as one long cycle), 30
            const logs = logCycles(['2026-01-01', '2026-01-31', '2026-03-02', '2026-04-29', '2026-05-29']);
            const observed = deriveObservedCycleLength(parseLocalDate('2026-06-10'), logs);
            expect(observed).toBe(30);
        });

        it('ignores implausible cycle lengths entirely', () => {
            // Two 8-day "cycles" from mis-tapped dates — below MIN_PLAUSIBLE.
            const logs = logCycles(['2026-01-01', '2026-01-09', '2026-01-17'], 2);
            expect(deriveObservedCycleLength(parseLocalDate('2026-02-01'), logs)).toBeNull();
        });

        it('predicts from her logs, not the number she typed at onboarding', () => {
            const stored: CycleSettings = {
                last_period_start: '2026-01-01',
                cycle_length_days: 28,      // what she guessed during onboarding
                period_length_days: 4,
            };
            const logs = logCycles(['2026-01-01', '2026-02-04', '2026-03-10', '2026-04-13']);
            const resolved = resolveCycleSettings(parseLocalDate('2026-04-20'), stored, logs);

            expect(resolved.cycle_length_days).toBe(34);
            // Never writes back over what she typed.
            expect(stored.cycle_length_days).toBe(28);

            // On day 30 the old 28-day setting called her 2 days late; with her
            // real 34-day cycle she is simply mid-luteal.
            const staleRead = calculatePhase(parseLocalDate('2026-05-12'), stored, logs);
            const trueRead = calculatePhase(parseLocalDate('2026-05-12'), resolved, logs);
            expect(staleRead.latePeriod).toBe(true);
            expect(trueRead.latePeriod).toBe(false);
        });
    });

    // ========================================================================
    // SHORT CYCLES  (all four phases must stay reachable)
    // ========================================================================
    describe('phase reachability on short cycles', () => {
        const phasesAcrossCycle = (cycleLength: number, periodLength = 5): Set<string> => {
            const settings: CycleSettings = {
                last_period_start: '2026-01-01',
                cycle_length_days: cycleLength,
                period_length_days: periodLength,
            };
            const seen = new Set<string>();
            for (let d = 0; d < cycleLength; d++) {
                const date = parseLocalDate('2026-01-01');
                date.setDate(date.getDate() + d);
                const { phase } = calculatePhase(date, settings, {});
                if (phase) seen.add(phase);
            }
            return seen;
        };

        it.each([28, 22, 20, 18, 16])(
            'reaches all four phases on a %i-day cycle',
            (cycleLength) => {
                const seen = phasesAcrossCycle(cycleLength);
                expect([...seen].sort()).toEqual(['Follicular', 'Luteal', 'Menstrual', 'Ovulatory']);
            }
        );

        it('keeps ovulation clear of the period even when luteal >= cycle length', () => {
            const settings: CycleSettings = {
                last_period_start: '2026-01-01',
                cycle_length_days: 21,
                period_length_days: 5,
                luteal_length_days: 21,
            };
            const seen = new Set<string>();
            for (let d = 0; d < 21; d++) {
                const date = parseLocalDate('2026-01-01');
                date.setDate(date.getDate() + d);
                const { phase } = calculatePhase(date, settings, {});
                if (phase) seen.add(phase);
            }
            expect(seen.has('Ovulatory')).toBe(true);
            expect(seen.has('Follicular')).toBe(true);
        });

        it('never places ovulation inside the period days', () => {
            for (let cycleLength = 15; cycleLength <= 40; cycleLength++) {
                expect(getOvulationDay(cycleLength, 14, 5)).toBeGreaterThan(5);
            }
        });
    });

    // ========================================================================
    // STALE SETTINGS ANCHOR
    // ========================================================================
    describe('staleAnchor', () => {
        const settings: CycleSettings = {
            last_period_start: '2025-06-01',
            cycle_length_days: 28,
            period_length_days: 5,
        };

        it('flags an abandoned onboarding date instead of asserting the count', () => {
            const result = calculatePhase(parseLocalDate('2026-08-26'), settings, {});
            expect(result.dataSource).toBe('settings');
            expect(result.staleAnchor).toBe(true);
            // The numbers are still there for callers that want them...
            expect(result.daysLate).toBeGreaterThan(MAX_TRUSTED_SETTINGS_ANCHOR_LATE_DAYS);
            // ...but UI is expected to show the prompt, not "423 days late".
        });

        it('does not flag an ordinary late period', () => {
            const recent: CycleSettings = { ...settings, last_period_start: '2026-07-20' };
            const result = calculatePhase(parseLocalDate('2026-08-26'), recent, {});
            expect(result.latePeriod).toBe(true);
            expect(result.staleAnchor).toBe(false);
        });

        it('never flags a cycle anchored to real logged period days', () => {
            const logs: Record<string, DailyLog> = {
                '2025-06-01': { date: '2025-06-01', is_period: true },
            };
            const result = calculatePhase(parseLocalDate('2026-08-26'), settings, logs);
            expect(result.dataSource).toBe('logs');
            expect(result.staleAnchor).toBe(false);
        });
    });


    // ========================================================================
    // NO PHASE HOLES  (a period must never appear to resume after it ended)
    // ========================================================================
    describe('explicit not-period days end the period rather than punching a hole', () => {
        const settings: CycleSettings = {
            last_period_start: '2026-08-05',
            cycle_length_days: 28,
            period_length_days: 5,
        };
        const phasesFrom = (logs: Record<string, DailyLog>, days: number[]): string[] =>
            days.map((d) => {
                const date = parseLocalDate(`2026-08-${String(d).padStart(2, '0')}`);
                return calculatePhase(date, settings, logs).phase ?? '-';
            });

        it('does not resume Menstrual after an explicitly non-period day', () => {
            // Day 1 logged, day 2 explicitly not-period (un-marked, or "End
            // Period Here"), days 3+ unlogged. Days 3+ used to project as
            // Menstrual off the untouched 5-day average, rendering
            // Menstrual / Follicular / Menstrual / Menstrual on the calendar.
            const logs: Record<string, DailyLog> = {
                '2026-08-26': { date: '2026-08-26', is_period: true },
                '2026-08-27': { date: '2026-08-27', is_period: false },
            };
            expect(phasesFrom(logs, [26, 27, 28, 29])).toEqual([
                'Menstrual', 'Follicular', 'Follicular', 'Follicular',
            ]);
        });

        it('still projects a full period when nothing says it ended', () => {
            const logs: Record<string, DailyLog> = {
                '2026-08-26': { date: '2026-08-26', is_period: true },
            };
            expect(phasesFrom(logs, [26, 27, 28, 29])).toEqual([
                'Menstrual', 'Menstrual', 'Menstrual', 'Menstrual',
            ]);
        });

        it('treats a cleared day as no data, not as an end-of-period signal', () => {
            // Un-marking a day writes null (-> undefined here), which must read
            // as silence. Only "End Period Here" writes false. If these two
            // ever collapse back into one value, an accidental tap-and-untap
            // silently truncates her period again.
            const cleared: Record<string, DailyLog> = {
                '2026-08-26': { date: '2026-08-26', is_period: true },
                '2026-08-27': { date: '2026-08-27', is_period: undefined },
            };
            expect(phasesFrom(cleared, [26, 27, 28, 29])).toEqual([
                'Menstrual', 'Menstrual', 'Menstrual', 'Menstrual',
            ]);

            const ended: Record<string, DailyLog> = {
                '2026-08-26': { date: '2026-08-26', is_period: true },
                '2026-08-27': { date: '2026-08-27', is_period: false },
            };
            expect(phasesFrom(ended, [27])).toEqual(['Follicular']);
        });

        it('never overrides a day she explicitly logged as bleeding', () => {
            // A stray un-marked day mid-streak must not un-Menstrual the real
            // logged days around it.
            const logs: Record<string, DailyLog> = {
                '2026-08-26': { date: '2026-08-26', is_period: true },
                '2026-08-27': { date: '2026-08-27', is_period: false },
                '2026-08-28': { date: '2026-08-28', is_period: true },
                '2026-08-29': { date: '2026-08-29', is_period: true },
            };
            expect(phasesFrom(logs, [26, 28, 29])).toEqual([
                'Menstrual', 'Menstrual', 'Menstrual',
            ]);
        });
    });


    // ========================================================================
    // STALE END-OF-PERIOD MARKERS
    // ========================================================================
    describe('stalePeriodEndMarkersAfter', () => {
        it('finds markers that would block a period she is starting now', () => {
            // "My period started today" must project forward. A leftover
            // marker on day 2 used to end it immediately, so the calendar
            // showed one red day and nothing after it.
            const logs: Record<string, DailyLog> = {
                '2026-08-27': { date: '2026-08-27', is_period: false },
            };
            expect(stalePeriodEndMarkersAfter('2026-08-26', 5, logs)).toEqual(['2026-08-27']);
        });

        it('finds a whole leftover End-Period trail inside the period window', () => {
            const logs: Record<string, DailyLog> = {};
            for (let d = 27; d <= 31; d++) {
                logs[`2026-08-${d}`] = { date: `2026-08-${d}`, is_period: false };
            }
            // Only the days inside one typical period length — 27, 28, 29, 30.
            expect(stalePeriodEndMarkersAfter('2026-08-26', 5, logs)).toEqual([
                '2026-08-27', '2026-08-28', '2026-08-29', '2026-08-30',
            ]);
        });

        it('never reports a day she actually logged as bleeding', () => {
            const logs: Record<string, DailyLog> = {
                '2026-08-27': { date: '2026-08-27', is_period: true },
                '2026-08-28': { date: '2026-08-28', is_period: false },
            };
            expect(stalePeriodEndMarkersAfter('2026-08-26', 5, logs)).toEqual(['2026-08-28']);
        });

        it('reports nothing when there is nothing in the way', () => {
            expect(stalePeriodEndMarkersAfter('2026-08-26', 5, {})).toEqual([]);
        });

        it('clearing them lets the period project the full length', () => {
            const settings: CycleSettings = {
                last_period_start: '2026-08-05',
                cycle_length_days: 28,
                period_length_days: 5,
            };
            const logs: Record<string, DailyLog> = {
                '2026-08-26': { date: '2026-08-26', is_period: true },
                '2026-08-27': { date: '2026-08-27', is_period: false },
            };
            const phaseOn = (d: number) =>
                calculatePhase(parseLocalDate(`2026-08-${d}`), settings, logs).phase;

            expect(phaseOn(27)).toBe('Follicular'); // blocked

            for (const d of stalePeriodEndMarkersAfter('2026-08-26', 5, logs)) {
                logs[d] = { date: d, is_period: undefined };
            }
            expect([27, 28, 29, 30].map(phaseOn)).toEqual([
                'Menstrual', 'Menstrual', 'Menstrual', 'Menstrual',
            ]);
        });
    });

});
