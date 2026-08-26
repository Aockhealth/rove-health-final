/**
 * LH band-level ovulation-surge detection unit tests.
 *
 * Tests for shared/cycle/lh.ts.
 * Run with: npx jest shared/cycle/__tests__/lh.test.ts
 */

import {
    computeLhBaselineBand,
    isLhSurgeReading,
    findLhPeak,
    countSurgeDays,
    LH_BAND_FLOOR_LEVEL,
    LH_SURGE_JUMP,
    type LhBandReading,
} from '../lh';

const reading = (date: string, bandLevel: number, testTime = `${date}T09:00:00Z`): LhBandReading => ({
    date,
    testTime,
    bandLevel,
});

describe('computeLhBaselineBand', () => {
    it('returns null with fewer than 3 readings', () => {
        expect(computeLhBaselineBand([])).toBeNull();
        expect(computeLhBaselineBand([reading('2026-01-01', 1), reading('2026-01-02', 2)])).toBeNull();
    });

    it('computes the median of her own lowest-tertile readings', () => {
        // 9 readings sorted: 0,0,1,1,2,2,3,3,4 — lowest tertile (3) = [0,0,1], median 0.
        const all = [0, 3, 1, 4, 0, 2, 1, 3, 2].map((level, i) =>
            reading(`2026-01-${String(i + 1).padStart(2, '0')}`, level)
        );
        expect(computeLhBaselineBand(all)).toBe(0);
    });

    it('reads a chronically elevated (PCOS-like) baseline correctly', () => {
        // Her "low" readings still sit at grade 2 — a fixed population
        // threshold would misread this as already surging.
        const all = [2, 2, 3, 2, 3, 4].map((level, i) =>
            reading(`2026-01-${String(i + 1).padStart(2, '0')}`, level)
        );
        expect(computeLhBaselineBand(all)).toBe(2);
    });
});

describe('isLhSurgeReading', () => {
    it('never calls a reading below the absolute floor a surge, even with no baseline', () => {
        expect(isLhSurgeReading(LH_BAND_FLOOR_LEVEL - 1, null)).toBe(false);
    });

    it('first-cycle fallback: floor alone decides with no personal baseline yet', () => {
        expect(isLhSurgeReading(LH_BAND_FLOOR_LEVEL, null)).toBe(true);
        expect(isLhSurgeReading(LH_BAND_FLOOR_LEVEL - 1, null)).toBe(false);
    });

    it('requires a jump of LH_SURGE_JUMP grades above her own baseline once she has one', () => {
        const baseline = 1;
        expect(isLhSurgeReading(baseline + LH_SURGE_JUMP - 1, baseline)).toBe(false);
        expect(isLhSurgeReading(baseline + LH_SURGE_JUMP, baseline)).toBe(true);
    });

    it('a chronically elevated baseline needs a genuinely elevated read, not just above floor', () => {
        // Elevated baseline of "medium" (2) — a bare floor-level reading (3)
        // is only +1 above her baseline, not a surge; needs +2 = grade 4.
        const elevatedBaseline = 2;
        expect(isLhSurgeReading(LH_BAND_FLOOR_LEVEL, elevatedBaseline)).toBe(false);
        expect(isLhSurgeReading(elevatedBaseline + LH_SURGE_JUMP, elevatedBaseline)).toBe(true);
    });

    it('a run of same-level reads never falsely triggers', () => {
        const baseline = 1;
        const steadyReadings = [1, 1, 1, 1, 1, 1].map((level, i) =>
            reading(`2026-01-${String(i + 1).padStart(2, '0')}`, level)
        );
        expect(countSurgeDays(steadyReadings, baseline)).toBe(0);
    });
});

describe('findLhPeak', () => {
    it('returns null when nothing surges', () => {
        const cycle = [reading('2026-01-01', 0), reading('2026-01-02', 1)];
        expect(findLhPeak(cycle, null)).toBeNull();
    });

    it('picks the single highest-graded surging day', () => {
        const cycle = [
            reading('2026-01-10', 3),
            reading('2026-01-11', 4),
            reading('2026-01-12', 3),
        ];
        expect(findLhPeak(cycle, null)?.date).toBe('2026-01-11');
    });

    it('resolves ties at the same highest grade to the latest day (multi-surge pattern)', () => {
        const cycle = [
            reading('2026-01-10', 4),
            reading('2026-01-14', 3),
            reading('2026-01-18', 4),
        ];
        expect(findLhPeak(cycle, null)?.date).toBe('2026-01-18');
    });
});

describe('countSurgeDays', () => {
    it('counts every day meeting the surge gates, not just the peak', () => {
        const cycle = [
            reading('2026-01-10', 3),
            reading('2026-01-11', 4),
            reading('2026-01-12', 3),
            reading('2026-01-13', 1),
        ];
        expect(countSurgeDays(cycle, null)).toBe(3);
    });
});
