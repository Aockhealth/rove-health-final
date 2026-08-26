/**
 * Cervical mucus (MPIQ) as a fertility signal.
 *
 * Unlike LH (predicts, ahead of time) and BBT (confirms, after the fact),
 * peak-quality mucus is coincident with ovulation — it shows up around the
 * same time, not clearly before or after. That means it can sharpen how
 * confident a prediction is, but it can never itself confirm ovulation
 * happened, the same way a coincident clock can't tell you which of two
 * simultaneous events came first.
 *
 * Pure functions, no I/O — same style as ./phase.ts, ./ttc.ts and ./lh.ts.
 *
 * @module shared/cycle/mucus
 */

export type VaginalFluid = 'Tacky' | 'Creamy' | 'Stretchy' | 'Bloody' | null;
export type MucusAppearance = 'White/Yellow' | 'Clear' | 'Red' | null;
export type MucusSensation = 'Dry' | 'Moist' | 'Wet' | 'Slippery' | null;

export interface MucusReading {
    date: string;
    vaginalFluid: VaginalFluid;
    appearance: MucusAppearance;
    sensation: MucusSensation;
}

/**
 * Classic "egg-white" cervical mucus — stretchy, not dry, and not blood-
 * tinged (which reads as period-adjacent, not a fertility signal). This is
 * a deliberately simple rule rather than a numeric score: consistency is
 * genuinely hard to self-assess, and a false sense of precision here would
 * be worse than an honest three-way (peak / some / none) read.
 */
export function isPeakMucus(reading: MucusReading): boolean {
    return reading.vaginalFluid === 'Stretchy' && reading.sensation !== 'Dry' && reading.appearance !== 'Red';
}

/**
 * The most recent day this cycle with peak-quality mucus, if any. Latest,
 * not first — mucus quality can build over several days, and the day
 * closest to today is the one nearest ovulation.
 */
export function findMucusPeakDate(cycleReadings: MucusReading[]): string | null {
    const peaks = cycleReadings.filter(isPeakMucus).map((r) => r.date).sort();
    return peaks.length > 0 ? peaks[peaks.length - 1] : null;
}

/**
 * Parses the `[vaginalFluid, appearance, sensation]` JSON array the mobile
 * tracker stores in `daily_logs.cervical_discharge` into a MucusReading.
 * Returns null for anything that isn't that exact shape (e.g. a legacy plain
 * string from an older web format) — there's no safe way to split those
 * back into three answers, so they're treated as "not logged" rather than
 * guessed at.
 */
export function parseMucusJson(raw: string | null | undefined, date: string): MucusReading | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 3) {
            return {
                date,
                vaginalFluid: parsed[0] ?? null,
                appearance: parsed[1] ?? null,
                sensation: parsed[2] ?? null,
            };
        }
    } catch {
        // Not our JSON array format — fall through to null.
    }
    return null;
}
