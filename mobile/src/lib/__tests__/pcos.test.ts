/**
 * Tests for hasPcosFlag and withoutLegacyPcosGoal — mobile/src/lib/pcos.ts.
 */

import { hasPcosFlag, withoutLegacyPcosGoal } from '../pcos';

describe('hasPcosFlag', () => {
    it('matches a legacy lowercase "pcos" goal chip', () => {
        expect(hasPcosFlag(['pcos'], [])).toBe(true);
    });

    it('matches a free-text "PCOS" condition', () => {
        expect(hasPcosFlag([], ['PCOS'])).toBe(true);
    });

    it('matches the standardized "PMOS" condition-picker value', () => {
        expect(hasPcosFlag([], ['PMOS'])).toBe(true);
    });

    it('matches "pmos" case-insensitively in either goals or conditions', () => {
        expect(hasPcosFlag(['pmos'], [])).toBe(true);
        expect(hasPcosFlag([], ['pmos'])).toBe(true);
    });

    it('returns false when neither term appears', () => {
        expect(hasPcosFlag(['fertility'], ['Endometriosis'])).toBe(false);
    });

    it('handles non-array or missing input without throwing', () => {
        expect(hasPcosFlag(undefined, undefined)).toBe(false);
        expect(hasPcosFlag(null, null)).toBe(false);
    });
});

describe('withoutLegacyPcosGoal', () => {
    it('strips a legacy "pcos" goal chip while keeping other goals', () => {
        expect(withoutLegacyPcosGoal(['pcos', 'syncing'])).toEqual(['syncing']);
    });

    it('is case-insensitive', () => {
        expect(withoutLegacyPcosGoal(['PCOS', 'PMOS', 'tracking'])).toEqual(['tracking']);
    });

    it('leaves goals unchanged when no pcos-like entry exists', () => {
        expect(withoutLegacyPcosGoal(['syncing', 'tracking'])).toEqual(['syncing', 'tracking']);
    });
});
