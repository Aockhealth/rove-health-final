import {
    mapHealthConnectOvulationTestResult,
    mapHealthConnectCervicalMucus,
    mapHealthConnectMenstruationFlow,
    mapFlowIntensityToHealthConnectValue,
    mapAppleOvulationTestResult,
    mapAppleCervicalMucusQuality,
    mapAppleMenstrualFlow,
    mapFlowIntensityToAppleValue,
} from '../platformMapping';
import { isPeakMucus } from '../../cycle/mucus';

describe('Health Connect mappers', () => {
    it('maps POSITIVE to a peak OPK reading', () => {
        expect(mapHealthConnectOvulationTestResult(1)).toEqual({ opkResult: 'peak', bandLevel: 4 });
    });

    it('maps HIGH to a high OPK reading', () => {
        expect(mapHealthConnectOvulationTestResult(2)).toEqual({ opkResult: 'high', bandLevel: 3 });
    });

    it('maps NEGATIVE to a negative OPK reading', () => {
        expect(mapHealthConnectOvulationTestResult(3)).toEqual({ opkResult: 'negative', bandLevel: 1 });
    });

    it('skips INCONCLUSIVE rather than guessing', () => {
        expect(mapHealthConnectOvulationTestResult(0)).toBeNull();
    });

    it('skips an unrecognized future OPK value', () => {
        expect(mapHealthConnectOvulationTestResult(99)).toBeNull();
    });

    it('maps EGG_WHITE mucus to a peak-compatible reading', () => {
        const mapped = mapHealthConnectCervicalMucus(5);
        expect(mapped).toEqual({ vaginalFluid: 'Stretchy', appearance: 'Clear', sensation: null });
        // The whole point of importing this is to feed the engine's own
        // peak-mucus check — verify the mapped shape actually satisfies it.
        expect(isPeakMucus({ date: '2026-01-01', ...mapped! })).toBe(true);
    });

    it('does not map ambiguous mucus appearances (sticky/creamy/watery)', () => {
        expect(mapHealthConnectCervicalMucus(2)).toBeNull();
        expect(mapHealthConnectCervicalMucus(3)).toBeNull();
        expect(mapHealthConnectCervicalMucus(4)).toBeNull();
        expect(mapHealthConnectCervicalMucus(undefined)).toBeNull();
    });

    it('maps menstruation flow tiers', () => {
        expect(mapHealthConnectMenstruationFlow(1)).toBe('Low');
        expect(mapHealthConnectMenstruationFlow(2)).toBe('Normal');
        expect(mapHealthConnectMenstruationFlow(3)).toBe('Heavy');
        expect(mapHealthConnectMenstruationFlow(0)).toBeNull();
        expect(mapHealthConnectMenstruationFlow(undefined)).toBeNull();
    });
});

describe('Apple HealthKit mappers', () => {
    it('maps luteinizingHormoneSurge/positive to a peak OPK reading', () => {
        expect(mapAppleOvulationTestResult(2)).toEqual({ opkResult: 'peak', bandLevel: 4 });
    });

    it('maps estrogenSurge to a high OPK reading', () => {
        expect(mapAppleOvulationTestResult(4)).toEqual({ opkResult: 'high', bandLevel: 3 });
    });

    it('maps negative to a negative OPK reading', () => {
        expect(mapAppleOvulationTestResult(1)).toEqual({ opkResult: 'negative', bandLevel: 1 });
    });

    it('skips indeterminate rather than guessing', () => {
        expect(mapAppleOvulationTestResult(3)).toBeNull();
    });

    it('maps eggWhite mucus to a peak-compatible reading', () => {
        const mapped = mapAppleCervicalMucusQuality(5);
        expect(mapped).toEqual({ vaginalFluid: 'Stretchy', appearance: 'Clear', sensation: null });
        expect(isPeakMucus({ date: '2026-01-01', ...mapped! })).toBe(true);
    });

    it('does not map dry/sticky/creamy/watery mucus', () => {
        expect(mapAppleCervicalMucusQuality(1)).toBeNull();
        expect(mapAppleCervicalMucusQuality(2)).toBeNull();
        expect(mapAppleCervicalMucusQuality(3)).toBeNull();
        expect(mapAppleCervicalMucusQuality(4)).toBeNull();
    });

    it('maps menstrual flow tiers', () => {
        expect(mapAppleMenstrualFlow(2)).toBe('Low');
        expect(mapAppleMenstrualFlow(3)).toBe('Normal');
        expect(mapAppleMenstrualFlow(4)).toBe('Heavy');
    });

    it('skips unspecified and none rather than asserting a period day', () => {
        expect(mapAppleMenstrualFlow(1)).toBeNull();
        expect(mapAppleMenstrualFlow(5)).toBeNull();
    });

    it('round-trips flow intensity to Apple values and back for every mappable tier', () => {
        expect(mapAppleMenstrualFlow(mapFlowIntensityToAppleValue('Low'))).toBe('Low');
        expect(mapAppleMenstrualFlow(mapFlowIntensityToAppleValue('Normal'))).toBe('Normal');
        expect(mapAppleMenstrualFlow(mapFlowIntensityToAppleValue('Heavy'))).toBe('Heavy');
    });

    it('maps Spotting and High to Apple\'s nearest tier rather than inventing one', () => {
        expect(mapFlowIntensityToAppleValue('Spotting')).toBe(2); // light
        expect(mapFlowIntensityToAppleValue('High')).toBe(3); // medium
    });

    it('maps no intensity to unspecified, not a guessed flow level', () => {
        expect(mapFlowIntensityToAppleValue(null)).toBe(1); // unspecified
    });
});

describe('write-direction flow mappers', () => {
    it('round-trips flow intensity to Health Connect values and back for every mappable tier', () => {
        expect(mapHealthConnectMenstruationFlow(mapFlowIntensityToHealthConnectValue('Low'))).toBe('Low');
        expect(mapHealthConnectMenstruationFlow(mapFlowIntensityToHealthConnectValue('Normal'))).toBe('Normal');
        expect(mapHealthConnectMenstruationFlow(mapFlowIntensityToHealthConnectValue('Heavy'))).toBe('Heavy');
    });

    it('maps Spotting and High to Health Connect\'s nearest tier rather than inventing one', () => {
        expect(mapFlowIntensityToHealthConnectValue('Spotting')).toBe(1); // LIGHT
        expect(mapFlowIntensityToHealthConnectValue('High')).toBe(2); // MEDIUM
    });

    it('maps no intensity to UNKNOWN, not a guessed flow level', () => {
        expect(mapFlowIntensityToHealthConnectValue(null)).toBe(0); // UNKNOWN
    });
});
