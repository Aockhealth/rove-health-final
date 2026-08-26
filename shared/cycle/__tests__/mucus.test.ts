/**
 * Cervical mucus (MPIQ) fertility-signal unit tests.
 *
 * Tests for shared/cycle/mucus.ts.
 * Run with: npx jest shared/cycle/__tests__/mucus.test.ts
 */

import { isPeakMucus, findMucusPeakDate, parseMucusJson, type MucusReading } from '../mucus';

const reading = (
    date: string,
    vaginalFluid: MucusReading['vaginalFluid'],
    appearance: MucusReading['appearance'] = 'Clear',
    sensation: MucusReading['sensation'] = 'Wet'
): MucusReading => ({ date, vaginalFluid, appearance, sensation });

describe('isPeakMucus', () => {
    it('is true for classic egg-white mucus: stretchy, wet, clear', () => {
        expect(isPeakMucus(reading('2026-01-13', 'Stretchy', 'Clear', 'Wet'))).toBe(true);
    });

    it('is true for stretchy + slippery, not just wet', () => {
        expect(isPeakMucus(reading('2026-01-13', 'Stretchy', 'Clear', 'Slippery'))).toBe(true);
    });

    it('is false when stretchy but dry', () => {
        expect(isPeakMucus(reading('2026-01-13', 'Stretchy', 'Clear', 'Dry'))).toBe(false);
    });

    it('is false when stretchy but blood-tinged (period-adjacent, not a fertility signal)', () => {
        expect(isPeakMucus(reading('2026-01-13', 'Stretchy', 'Red', 'Wet'))).toBe(false);
    });

    it('is false for lower-fertility consistencies even if wet', () => {
        expect(isPeakMucus(reading('2026-01-13', 'Creamy', 'White/Yellow', 'Wet'))).toBe(false);
        expect(isPeakMucus(reading('2026-01-13', 'Tacky', 'Clear', 'Moist'))).toBe(false);
    });
});

describe('findMucusPeakDate', () => {
    it('returns null with no peak-quality readings', () => {
        const cycle = [reading('2026-01-10', 'Tacky'), reading('2026-01-11', 'Creamy')];
        expect(findMucusPeakDate(cycle)).toBeNull();
    });

    it('returns the latest peak-quality day when several qualify', () => {
        const cycle = [
            reading('2026-01-11', 'Stretchy'),
            reading('2026-01-12', 'Tacky'),
            reading('2026-01-13', 'Stretchy'),
        ];
        expect(findMucusPeakDate(cycle)).toBe('2026-01-13');
    });
});

describe('parseMucusJson', () => {
    it('parses the [fluid, appearance, sensation] array format', () => {
        const raw = JSON.stringify(['Stretchy', 'Clear', 'Wet']);
        expect(parseMucusJson(raw, '2026-01-13')).toEqual({
            date: '2026-01-13',
            vaginalFluid: 'Stretchy',
            appearance: 'Clear',
            sensation: 'Wet',
        });
    });

    it('returns null for a legacy non-array string', () => {
        expect(parseMucusJson('Egg white', '2026-01-13')).toBeNull();
    });

    it('returns null for missing or empty data', () => {
        expect(parseMucusJson(null, '2026-01-13')).toBeNull();
        expect(parseMucusJson(undefined, '2026-01-13')).toBeNull();
        expect(parseMucusJson('', '2026-01-13')).toBeNull();
    });
});
