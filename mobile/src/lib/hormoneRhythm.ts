/**
 * Inferred hormone-associated rhythm — NOT a hormone measurement. Wearables
 * can't read estrogen or progesterone directly, but skin temperature and
 * resting heart rate are well-documented to rise slightly after ovulation
 * (the same thermogenic effect the BBT-based ovulation engine already relies
 * on), and HRV is well-documented to dip in the luteal phase. This module
 * fuses those three signals against her own early-cycle baseline into one
 * composite "thermal & autonomic rhythm" index — explicitly framed as a
 * pattern that typically shifts after ovulation, never as a hormone level,
 * to stay honest about what a wearable can and can't actually measure.
 *
 * @module mobile/src/lib/hormoneRhythm
 */

export interface DailySignalReading {
  date: string;
  skinTempDeltaCelsius: number | null;
  restingHeartRateBpm: number | null;
  hrvMs: number | null;
}

export interface RhythmPoint {
  date: string;
  cycleDay: number;
  /** 0-100 composite index, or null if too few signals were logged that day. */
  index: number | null;
}

export interface HormoneRhythmResult {
  points: RhythmPoint[];
  /** False when there isn't enough early-cycle data to establish "normal for her." */
  hasBaseline: boolean;
}

/** Early-cycle days used to establish "normal for her" per signal. */
const BASELINE_WINDOW_DAYS = 10;
/** Need at least this many non-null baseline readings for a signal to count it at all. */
const MIN_BASELINE_READINGS = 4;
/** Centered smoothing window so single noisy days don't spike the line. */
const SMOOTHING_WINDOW = 3;

type SignalKey = 'skinTempDeltaCelsius' | 'restingHeartRateBpm' | 'hrvMs';
// HRV is inverted — a drop from baseline should read the same direction
// (rising index) as a temperature or heart-rate rise, since HRV is expected
// to move opposite them after ovulation.
const SIGNAL_DIRECTION: Record<SignalKey, 1 | -1> = {
  skinTempDeltaCelsius: 1,
  restingHeartRateBpm: 1,
  hrvMs: -1,
};

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  return Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / (values.length - 1));
}

function dayIndexInCycle(cycleStart: string, date: string): number {
  const start = new Date(`${cycleStart}T00:00:00`).getTime();
  const d = new Date(`${date}T00:00:00`).getTime();
  return Math.round((d - start) / 86_400_000) + 1;
}

export function computeHormoneRhythm(
  cycleStart: string,
  cycleLengthDays: number,
  readings: DailySignalReading[]
): HormoneRhythmResult {
  const byDate = new Map(readings.map((r) => [r.date, r]));

  const baselines: Partial<Record<SignalKey, { mean: number; sd: number }>> = {};
  const signalKeys: SignalKey[] = ['skinTempDeltaCelsius', 'restingHeartRateBpm', 'hrvMs'];

  for (const key of signalKeys) {
    const baselineValues: number[] = [];
    for (const r of readings) {
      const day = dayIndexInCycle(cycleStart, r.date);
      const value = r[key];
      if (day >= 1 && day <= BASELINE_WINDOW_DAYS && value !== null && Number.isFinite(value)) {
        baselineValues.push(value);
      }
    }
    if (baselineValues.length >= MIN_BASELINE_READINGS) {
      const avg = mean(baselineValues);
      const sd = stdDev(baselineValues, avg);
      if (sd > 0) baselines[key] = { mean: avg, sd };
    }
  }

  const hasBaseline = Object.keys(baselines).length > 0;
  if (!hasBaseline) return { points: [], hasBaseline: false };

  const rawPoints: { date: string; cycleDay: number; z: number | null }[] = [];
  for (let day = 1; day <= cycleLengthDays; day++) {
    const date = new Date(`${cycleStart}T00:00:00`);
    date.setDate(date.getDate() + (day - 1));
    const dateStr = date.toISOString().slice(0, 10);
    const reading = byDate.get(dateStr);

    if (!reading) {
      rawPoints.push({ date: dateStr, cycleDay: day, z: null });
      continue;
    }

    const zs: number[] = [];
    for (const key of signalKeys) {
      const baseline = baselines[key];
      const value = reading[key];
      if (!baseline || value === null || !Number.isFinite(value)) continue;
      zs.push(((value - baseline.mean) / baseline.sd) * SIGNAL_DIRECTION[key]);
    }
    rawPoints.push({ date: dateStr, cycleDay: day, z: zs.length ? mean(zs) : null });
  }

  // Centered moving-average smoothing, skipping nulls rather than treating
  // them as zero.
  const smoothed: RhythmPoint[] = rawPoints.map((p, i) => {
    const half = Math.floor(SMOOTHING_WINDOW / 2);
    const windowVals: number[] = [];
    for (let j = Math.max(0, i - half); j <= Math.min(rawPoints.length - 1, i + half); j++) {
      const z = rawPoints[j].z;
      if (z !== null) windowVals.push(z);
    }
    if (windowVals.length === 0) return { date: p.date, cycleDay: p.cycleDay, index: null };
    const smoothedZ = mean(windowVals);
    // Clamp to +/-2 SD and rescale to 0-100 for display.
    const clamped = Math.min(2, Math.max(-2, smoothedZ));
    const index = Math.round(((clamped + 2) / 4) * 100);
    return { date: p.date, cycleDay: p.cycleDay, index };
  });

  return { points: smoothed, hasBaseline: true };
}
