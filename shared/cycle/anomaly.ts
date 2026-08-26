/**
 * Personal-baseline cycle anomaly detection — flags a cycle as unusual only
 * against her own logged history, never a population average, and tries to
 * explain the flag from her own Disruptor tags rather than leaving it as a
 * bare alarm.
 *
 * @module shared/cycle/anomaly
 */
import type { CycleHistoryEntry } from './phase';

export interface CycleAnomaly {
  /** The flagged cycle's own start date. */
  start: string;
  length: number;
  /** Her personal mean cycle length across the assessed history (incl. this cycle). */
  personalMean: number;
  zScore: number;
  /** Most differentially-elevated disruptor tag during this cycle vs. her average, if any. */
  likelyExplanation: string | null;
}

/** Need this many cycles before a mean/stdev means anything more than noise. */
export const MIN_CYCLES_FOR_ANOMALY_DETECTION = 4;

/** |z| beyond this is flagged — ~1.5 SD catches genuinely unusual cycles
 * without flagging normal month-to-month wobble. */
const Z_SCORE_THRESHOLD = 1.5;

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Counts disruptor-tag occurrences within [start, start+length) against the
 * same tag's average per-cycle occurrence across all assessed cycles, and
 * returns the tag with the largest positive gap for the flagged cycle — the
 * one most worth mentioning as a plausible explanation, not just a alarm.
 */
function findLikelyExplanation(
  cycle: CycleHistoryEntry,
  allCycles: CycleHistoryEntry[],
  disruptorsByDate: Record<string, string[]>
): string | null {
  const countForCycle = (c: CycleHistoryEntry): Map<string, number> => {
    const counts = new Map<string, number>();
    const startDate = new Date(`${c.start}T00:00:00`);
    for (let i = 0; i < c.length; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      for (const tag of disruptorsByDate[key] ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return counts;
  };

  const flaggedCounts = countForCycle(cycle);
  if (flaggedCounts.size === 0) return null;

  const otherCycles = allCycles.filter((c) => c.start !== cycle.start);
  if (otherCycles.length === 0) return null;

  const averageAcrossOthers = new Map<string, number>();
  for (const c of otherCycles) {
    const counts = countForCycle(c);
    for (const [tag, count] of counts) {
      averageAcrossOthers.set(tag, (averageAcrossOthers.get(tag) ?? 0) + count);
    }
  }

  let bestTag: string | null = null;
  let bestGap = 0;
  for (const [tag, flaggedCount] of flaggedCounts) {
    const avgCount = (averageAcrossOthers.get(tag) ?? 0) / otherCycles.length;
    const gap = flaggedCount - avgCount;
    // Require it to actually stand out, not just appear once more than a
    // fractional average.
    if (gap > bestGap && flaggedCount >= 2) {
      bestGap = gap;
      bestTag = tag;
    }
  }
  return bestTag;
}

/**
 * Flags cycles that deviate from her own rolling mean/stdev, sorted most
 * recent first. Returns [] with fewer than MIN_CYCLES_FOR_ANOMALY_DETECTION
 * cycles logged — a mean of 2-3 cycles isn't a baseline, it's noise.
 */
export function detectCycleAnomalies(
  cycles: CycleHistoryEntry[],
  disruptorsByDate: Record<string, string[]> = {}
): CycleAnomaly[] {
  if (cycles.length < MIN_CYCLES_FOR_ANOMALY_DETECTION) return [];

  const lengths = cycles.map((c) => c.length);
  const avg = mean(lengths);
  const sd = stdDev(lengths, avg);
  if (sd === 0) return [];

  const anomalies: CycleAnomaly[] = [];
  for (const cycle of cycles) {
    const z = (cycle.length - avg) / sd;
    if (Math.abs(z) >= Z_SCORE_THRESHOLD) {
      anomalies.push({
        start: cycle.start,
        length: cycle.length,
        personalMean: Math.round(avg * 10) / 10,
        zScore: Math.round(z * 100) / 100,
        likelyExplanation: findLikelyExplanation(cycle, cycles, disruptorsByDate),
      });
    }
  }

  return anomalies.sort((a, b) => (a.start < b.start ? 1 : -1));
}
