/**
 * LH strip band-level ovulation-surge detection.
 *
 * The kit being sourced reads as a graded strip — compared by eye against
 * its own printed backing card — not a numeric concentration, so unlike a
 * lab assay this can't use a continuous ratio-against-baseline rule. It
 * needs an ordinal version of the same idea: a surge is a jump of several
 * grades above HER OWN baseline, never a fixed grade for everyone.
 *
 * That personalization is the whole point, not a refinement: a fixed grade
 * cutoff reads "surge" continuously for anyone with chronically elevated LH
 * (a PCOS hallmark), and would either misfire constantly for her or have to
 * be set so high it misses women with a naturally low baseline.
 *
 * Pure functions, no I/O — same style as ./phase.ts and ./ttc.ts.
 *
 * @module shared/cycle/lh
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Number of distinct grades the kit's own backing card distinguishes.
 * Assumed from the kit being sourced (a printed reference card with example
 * shades for a few cycle days) — 0=no line, 1=faint, 2=medium, 3=dark,
 * 4=darker-than-control. Confirm against the physical card and adjust this
 * one constant; everything below is written generically against it, not
 * hardcoded to 5.
 */
export const LH_BAND_LEVELS = 5;

/**
 * Absolute floor: a reading below this grade is never called a surge, even
 * for someone whose own baseline is "no line at all". Expressed relative to
 * LH_BAND_LEVELS so it scales if the real card turns out to have a
 * different number of grades.
 */
export const LH_BAND_FLOOR_LEVEL = LH_BAND_LEVELS - 2;

/** Grades above her own baseline required to count as a surge. */
export const LH_SURGE_JUMP = 2;

/** Need at least this many of her own readings before trusting a personal baseline over the floor-only fallback. */
export const MIN_READINGS_FOR_PERSONAL_LH_BASELINE = 3;

// ============================================================================
// TYPES
// ============================================================================

export interface LhBandReading {
    date: string;
    /** Time of day the strip was read — LH reads higher in afternoon/evening urine, so this matters for trend comparisons even though it isn't used by the surge rule itself. */
    testTime: string;
    /** 0 to LH_BAND_LEVELS - 1. */
    bandLevel: number;
}

// ============================================================================
// BASELINE
// ============================================================================

/**
 * Her personal LH baseline: the median of her own lowest-tertile band
 * readings, across all logged cycles (not just the current one) — the
 * bottom third is her "normal, not surging" level.
 *
 * Returns null with too little history — callers fall back to the absolute
 * floor alone (see isLhSurgeReading) until she's logged enough to
 * personalize.
 */
export function computeLhBaselineBand(allLoggedReadings: LhBandReading[]): number | null {
    const levels = allLoggedReadings
        .map((r) => r.bandLevel)
        .filter((n) => Number.isFinite(n) && n >= 0);

    if (levels.length < MIN_READINGS_FOR_PERSONAL_LH_BASELINE) return null;

    const sorted = [...levels].sort((a, b) => a - b);
    const tertileCount = Math.max(1, Math.ceil(sorted.length / 3));
    const lowestTertile = sorted.slice(0, tertileCount);

    const mid = Math.floor(lowestTertile.length / 2);
    return lowestTertile.length % 2 === 0
        ? (lowestTertile[mid - 1] + lowestTertile[mid]) / 2
        : lowestTertile[mid];
}

// ============================================================================
// SURGE DETECTION
// ============================================================================

/**
 * Is this one reading a surge?
 *
 * Two gates, both must pass:
 *  - at or above the absolute floor (never a "faint" reading, regardless of baseline)
 *  - at least LH_SURGE_JUMP grades above her own baseline, once she has one —
 *    with no personal baseline yet (first cycle), the floor alone decides,
 *    which is close to the kit's own printed instructions until her own
 *    history takes over.
 */
export function isLhSurgeReading(bandLevel: number, baselineBand: number | null): boolean {
    if (bandLevel < LH_BAND_FLOOR_LEVEL) return false;
    if (baselineBand === null) return true;
    return bandLevel >= baselineBand + LH_SURGE_JUMP;
}

/**
 * The peak reading in this cycle, if any — the day used to predict
 * ovulation. Ties at the same highest grade resolve to the LATEST day: a
 * second elevated reading after an apparent fade is a multi-surge pattern
 * (common in PCOS), not noise, and ovulation follows the most recent real
 * surge, not the first one.
 */
export function findLhPeak(
    cycleReadings: LhBandReading[],
    baselineBand: number | null
): LhBandReading | null {
    const surging = cycleReadings.filter((r) => isLhSurgeReading(r.bandLevel, baselineBand));
    if (surging.length === 0) return null;

    const maxLevel = Math.max(...surging.map((r) => r.bandLevel));
    const atMax = surging
        .filter((r) => r.bandLevel === maxLevel)
        .sort((a, b) => a.date.localeCompare(b.date));

    return atMax[atMax.length - 1];
}

/** How many distinct days registered a surge this cycle — feeds the "multiple surges" PCOS-pattern check, same idea as the OPK-based one already in ttc.ts. */
export function countSurgeDays(cycleReadings: LhBandReading[], baselineBand: number | null): number {
    return cycleReadings.filter((r) => isLhSurgeReading(r.bandLevel, baselineBand)).length;
}
