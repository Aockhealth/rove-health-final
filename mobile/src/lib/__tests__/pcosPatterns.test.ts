/**
 * Tests for summarizePcosPatterns — mobile/src/lib/ttcCycleHistory.ts.
 */

import { summarizePcosPatterns, type TtcHistoryCycle } from '../ttcCycleHistory';
import type { OvulationSignal, AnovulatoryReason } from '@shared/cycle/ttc';

const baseSignal: OvulationSignal = {
    method: 'date_math',
    status: 'monitoring',
    confirmedDate: null,
    predictedDate: null,
    fertileWindowStart: null,
    fertileWindowEnd: null,
    coverline: null,
    opkPeakDate: null,
    confidence: 'low',
    explanation: '',
    anovulatory: null,
    periovulatoryNsaidFlag: false,
};

const cycleWithReasons = (reasons: AnovulatoryReason[] | null, isOngoing = false): TtcHistoryCycle => ({
    cycleStart: '2026-01-01',
    cycleEnd: '2026-01-30',
    isOngoing,
    cycleLengthDays: 30,
    bbtPeak: null,
    lhPeakGrade: null,
    signal: {
        ...baseSignal,
        anovulatory: reasons ? { detected: true, reasons, note: '' } : null,
    },
});

describe('summarizePcosPatterns', () => {
    it('returns nothing with fewer than 2 scored cycles', () => {
        const cycles = [cycleWithReasons(['persistent_opk_highs_no_peak'])];
        expect(summarizePcosPatterns(cycles)).toEqual([]);
    });

    it('counts a reason across multiple cycles and reports it out of the scored total', () => {
        const cycles = [
            cycleWithReasons(['persistent_opk_highs_no_peak']),
            cycleWithReasons(['persistent_opk_highs_no_peak']),
            cycleWithReasons(null),
        ];
        const result = summarizePcosPatterns(cycles);
        expect(result).toHaveLength(1);
        expect(result[0].reason).toBe('persistent_opk_highs_no_peak');
        expect(result[0].count).toBe(2);
        expect(result[0].totalCycles).toBe(3);
        expect(result[0].body).toContain('2 of your last 3 cycles');
    });

    it('ignores ongoing cycles both for the count and the denominator', () => {
        const cycles = [
            cycleWithReasons(['cycle_overdue_no_signals']),
            cycleWithReasons(['cycle_overdue_no_signals']),
            cycleWithReasons(['cycle_overdue_no_signals'], true), // ongoing — excluded
        ];
        const result = summarizePcosPatterns(cycles);
        expect(result[0].count).toBe(2);
        expect(result[0].totalCycles).toBe(2);
    });

    it('sorts multiple reasons most-frequent first', () => {
        const cycles = [
            cycleWithReasons(['persistent_opk_highs_no_peak', 'no_thermal_shift_late_in_cycle']),
            cycleWithReasons(['no_thermal_shift_late_in_cycle']),
            cycleWithReasons(['no_thermal_shift_late_in_cycle']),
        ];
        const result = summarizePcosPatterns(cycles);
        expect(result.map((r) => r.reason)).toEqual(['no_thermal_shift_late_in_cycle', 'persistent_opk_highs_no_peak']);
        expect(result[0].count).toBe(3);
        expect(result[1].count).toBe(1);
    });

    it('returns an empty list when no cycle ever flagged anovulatory', () => {
        const cycles = [cycleWithReasons(null), cycleWithReasons(null), cycleWithReasons(null)];
        expect(summarizePcosPatterns(cycles)).toEqual([]);
    });
});
