/**
 * Translates Apple HealthKit and Android Health Connect's own value enums
 * into the shapes Rove's daily_logs / lh_readings already use.
 *
 * Both platforms model fertility data at a coarser resolution than Rove's
 * own manual-entry scales (a 3-4 tier ovulation-test result vs. a graded
 * 0-4 LH band; a single mucus "appearance" axis vs. Rove's three-axis
 * fluid/appearance/sensation model). Rather than force a confident-looking
 * value out of an ambiguous source reading, every mapper here returns null
 * for anything it can't translate with real confidence — the same "say
 * what we don't know" rule the rest of shared/cycle applies to the engine
 * itself, applied here to the data going *into* it.
 *
 * Pure functions, no I/O — same style as ../cycle/phase.ts, ttc.ts, lh.ts.
 *
 * @module shared/health/platformMapping
 */

import type { OpkResult } from '../cycle/ttc';
import type { VaginalFluid, MucusAppearance, MucusSensation } from '../cycle/mucus';

export type FlowIntensity = 'Spotting' | 'Low' | 'Normal' | 'High' | 'Heavy';
export type HealthPlatformSource = 'apple_health' | 'health_connect';

export interface MappedOpkReading {
    opkResult: OpkResult;
    /** Best-effort graded band (0-4) so this can also feed lh_readings, which is what the surge-detection engine actually reads. */
    bandLevel: number;
}

export interface MappedMucusReading {
    vaginalFluid: VaginalFluid;
    appearance: MucusAppearance;
    sensation: MucusSensation;
}

// ============================================================================
// Android Health Connect
// ============================================================================
// Enum values per react-native-health-connect's `constants.ts` — reproduced
// here as plain numbers rather than importing the package, so this module
// stays platform-independent and unit-testable without RN present.

/**
 * Health Connect's OvulationTestResult: INCONCLUSIVE=0, POSITIVE=1, HIGH=2,
 * NEGATIVE=3. INCONCLUSIVE is a real "the test didn't give a clear answer"
 * result, not a data gap — treated the same as unmappable, since a reading
 * she took and got no answer from shouldn't be recorded as if it said
 * something.
 */
export function mapHealthConnectOvulationTestResult(result: number): MappedOpkReading | null {
    switch (result) {
        case 1: // POSITIVE — the LH surge peak
            return { opkResult: 'peak', bandLevel: 4 };
        case 2: // HIGH — rising, fertile window likely
            return { opkResult: 'high', bandLevel: 3 };
        case 3: // NEGATIVE — low fertility
            return { opkResult: 'negative', bandLevel: 1 };
        default: // INCONCLUSIVE or an unrecognized future value
            return null;
    }
}

/**
 * Health Connect's CervicalMucusAppearance: UNKNOWN=0, DRY=1, STICKY=2,
 * CREAMY=3, WATERY=4, EGG_WHITE=5, APPEARANCE_UNUSUAL=6.
 *
 * Only EGG_WHITE maps with real confidence onto Rove's three-axis model —
 * it is specifically what `isPeakMucus` (shared/cycle/mucus.ts) looks for.
 * The middle values (sticky/creamy/watery) don't correspond cleanly to
 * Rove's vaginalFluid vocabulary (Tacky/Creamy/Stretchy/Bloody), so they're
 * left unmapped rather than guessed at.
 */
export function mapHealthConnectCervicalMucus(appearance: number | undefined): MappedMucusReading | null {
    if (appearance === 5) {
        return { vaginalFluid: 'Stretchy', appearance: 'Clear', sensation: null };
    }
    return null;
}

/** Health Connect's MenstruationFlow: UNKNOWN=0, LIGHT=1, MEDIUM=2, HEAVY=3. */
export function mapHealthConnectMenstruationFlow(flow: number | undefined): FlowIntensity | null {
    switch (flow) {
        case 1: return 'Low';
        case 2: return 'Normal';
        case 3: return 'Heavy';
        default: return null;
    }
}

/**
 * The write direction: Rove's own FlowIntensity back to Health Connect's
 * MenstruationFlow. 'Spotting' has no dedicated value in Health Connect's
 * enum — mapped to LIGHT rather than invented, since spotting is lighter
 * than a light flow, not absent. Null (period logged, no intensity chosen)
 * maps to UNKNOWN, which is what that value means on this platform — not a
 * guessed intensity.
 */
export function mapFlowIntensityToHealthConnectValue(intensity: FlowIntensity | null): number {
    switch (intensity) {
        case 'Spotting': return 1; // LIGHT
        case 'Low': return 1; // LIGHT
        case 'Normal': return 2; // MEDIUM
        case 'High': return 2; // MEDIUM — Health Connect has no fourth tier
        case 'Heavy': return 3; // HEAVY
        default: return 0; // UNKNOWN — period happened, no intensity specified
    }
}

// ============================================================================
// Apple HealthKit
// ============================================================================
// Enum values per @kingstinct/react-native-healthkit's generated types.

/**
 * HealthKit's CategoryValueOvulationTestResult: negative=1,
 * luteinizingHormoneSurge=2 (aliased as positive=2), indeterminate=3,
 * estrogenSurge=4. indeterminate is skipped for the same reason as Health
 * Connect's INCONCLUSIVE.
 */
export function mapAppleOvulationTestResult(value: number): MappedOpkReading | null {
    switch (value) {
        case 2: // luteinizingHormoneSurge / positive — the LH peak
            return { opkResult: 'peak', bandLevel: 4 };
        case 4: // estrogenSurge — rising, fertile window likely, not yet peak
            return { opkResult: 'high', bandLevel: 3 };
        case 1: // negative
            return { opkResult: 'negative', bandLevel: 1 };
        default: // indeterminate or an unrecognized future value
            return null;
    }
}

/**
 * HealthKit's CategoryValueCervicalMucusQuality: dry=1, sticky=2, creamy=3,
 * watery=4, eggWhite=5. Same reasoning as the Health Connect mapper above —
 * only eggWhite is confidently mappable.
 */
export function mapAppleCervicalMucusQuality(value: number): MappedMucusReading | null {
    if (value === 5) {
        return { vaginalFluid: 'Stretchy', appearance: 'Clear', sensation: null };
    }
    return null;
}

/**
 * HealthKit's CategoryValueMenstrualFlow: unspecified=1, light=2, medium=3,
 * heavy=4, none=5. `none` is Apple's representation for "cycle day logged,
 * no active flow" (e.g. spotting-adjacent or a tracked-but-dry day) — its
 * exact meaning varies enough across how source apps write it that treating
 * it as a confirmed period day would risk the same silent-mislabeling
 * failure mode fixed in phase.ts, so it's skipped rather than guessed at.
 * `unspecified` is skipped for the same reason.
 */
export function mapAppleMenstrualFlow(value: number): FlowIntensity | null {
    switch (value) {
        case 2: return 'Low';
        case 3: return 'Normal';
        case 4: return 'Heavy';
        default: return null;
    }
}

/**
 * The write direction: Rove's own FlowIntensity back to HealthKit's
 * CategoryValueMenstrualFlow. 'Spotting' maps to light rather than a guessed
 * value of its own — HealthKit has no spotting tier. Null (period logged, no
 * intensity chosen) maps to `unspecified`, which exists on this platform for
 * exactly that case, not a fabricated default flow level.
 */
export function mapFlowIntensityToAppleValue(intensity: FlowIntensity | null): number {
    switch (intensity) {
        case 'Spotting': return 2; // light
        case 'Low': return 2; // light
        case 'Normal': return 3; // medium
        case 'High': return 3; // medium — HealthKit has no fourth tier
        case 'Heavy': return 4; // heavy
        default: return 1; // unspecified
    }
}
