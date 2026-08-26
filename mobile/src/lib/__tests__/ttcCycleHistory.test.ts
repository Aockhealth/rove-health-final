/**
 * Tests for getPersonalizedLutealLength — mobile/src/lib/ttcCycleHistory.ts.
 */

import { getPersonalizedLutealLength, type TtcHistoryCycle } from '../ttcCycleHistory';
import type { OvulationSignal } from '@shared/cycle/ttc';

const baseSignal: OvulationSignal = {
    method: 'bbt_only',
    status: 'ovulation_confirmed',
    confirmedDate: null,
    predictedDate: null,
    fertileWindowStart: null,
    fertileWindowEnd: null,
    coverline: null,
    opkPeakDate: null,
    confidence: 'medium',
    explanation: '',
    anovulatory: null,
    periovulatoryNsaidFlag: false,
};

/** A confirmed cycle: `cycleLengthDays` total, ovulation confirmed on day `ovDay`. */
const confirmedCycle = (
    n: number,
    cycleLengthDays: number,
    ovDay: number
): TtcHistoryCycle => ({
    cycleStart: '2026-01-01',
    cycleEnd: '2026-01-30',
    isOngoing: false,
    cycleLengthDays,
    bbtPeak: null,
    lhPeakGrade: null,
    signal: {
        ...baseSignal,
        confirmedDate: `2026-01-${String(ovDay).padStart(2, '0')}`,
    },
});

const unconfirmedCycle = (cycleLengthDays: number): TtcHistoryCycle => ({
    cycleStart: '2026-01-01',
    cycleEnd: '2026-01-30',
    isOngoing: false,
    bbtPeak: null,
    lhPeakGrade: null,
    cycleLengthDays,
    signal: { ...baseSignal, status: 'fertile_window', confirmedDate: null, predictedDate: '2026-01-14' },
});

describe('getPersonalizedLutealLength', () => {
    it('returns null with fewer than 3 confirmed cycles', () => {
        const cycles = [confirmedCycle(1, 28, 14), confirmedCycle(2, 29, 15)];
        expect(getPersonalizedLutealLength(cycles)).toBeNull();
    });

    it('averages the luteal length across confirmed cycles once there are enough', () => {
        // 28 - 14 = 14, 29 - 15 = 14, 27 - 13 = 14 -> avg 14
        const cycles = [confirmedCycle(1, 28, 14), confirmedCycle(2, 29, 15), confirmedCycle(3, 27, 13)];
        expect(getPersonalizedLutealLength(cycles)).toBe(14);
    });

    it('ignores cycles that never reached a confirmed ovulation, even mixed in with confirmed ones', () => {
        const cycles = [
            confirmedCycle(1, 28, 14),
            confirmedCycle(2, 29, 15),
            confirmedCycle(3, 27, 13),
            unconfirmedCycle(35),
            unconfirmedCycle(21),
        ];
        // Same 3 confirmed cycles as the test above — the unconfirmed ones must not shift the average.
        expect(getPersonalizedLutealLength(cycles)).toBe(14);
    });

    it('clamps an outlier average to the sane 8-16 day range', () => {
        // 28 - 6 = 22, 29 - 7 = 22, 27 - 5 = 22 -> avg 22, clamped to 16
        const cycles = [confirmedCycle(1, 28, 6), confirmedCycle(2, 29, 7), confirmedCycle(3, 27, 5)];
        expect(getPersonalizedLutealLength(cycles)).toBe(16);
    });

    it('ignores cycles with no cycleLengthDays (still ongoing)', () => {
        const ongoing: TtcHistoryCycle = {
            cycleStart: '2026-01-01',
            cycleEnd: '2026-01-20',
            isOngoing: true,
            cycleLengthDays: null,
            bbtPeak: null,
            lhPeakGrade: null,
            signal: { ...baseSignal, confirmedDate: '2026-01-14' },
        };
        const cycles = [confirmedCycle(1, 28, 14), confirmedCycle(2, 29, 15), ongoing];
        expect(getPersonalizedLutealLength(cycles)).toBeNull();
    });
});
