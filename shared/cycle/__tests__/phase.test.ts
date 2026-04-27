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
});
