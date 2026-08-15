/**
 * Per-historical-cycle TTC scoring, shared by the Day-4 PDF health report and
 * the Insights "Across your cycles" / "Cycle history" / "Patterns worth
 * noticing" cards. Both consume the same `detectOvulation` walk over the same
 * cycle boundaries, so a doctor comparing the PDF to what Insights showed at
 * the time sees the same numbers.
 *
 * @module mobile/src/lib/ttcCycleHistory
 */

import { daysBetween, parseLocalDate, type CycleSettings } from '@shared/cycle/phase';
import {
  collectCycleReadings,
  currentCoverline,
  detectOvulation,
  type BbtReading,
  type OpkReading,
  type OpkResult,
  type OvulationSignal,
  type TtcDailyLog,
} from '@shared/cycle/ttc';

export type TtcHistoryLog = {
  date: string;
  is_period: boolean | null;
  bbt_celsius: number | null;
  opk_result: OpkResult | null | undefined;
};

export interface TtcHistoryCycle {
  cycleStart: string;
  /** Last day the cycle was scored over — the day before the next logged period, or the window end for an ongoing cycle. */
  cycleEnd: string;
  isOngoing: boolean;
  /** Days from this cycle's start to the next one's. Null while the cycle is still ongoing — there's no next start yet to measure to. */
  cycleLengthDays: number | null;
  signal: OvulationSignal;
}

export interface TtcCycleStats {
  cyclesLogged: number;
  confirmedCount: number;
  cycleLengthAvg: number | null;
  /** Population standard deviation of observed cycle lengths, in days. */
  cycleLengthVariation: number | null;
  /** Average day-in-cycle ovulation landed on (confirmed date, or predicted where nothing was confirmed). */
  ovulationDayAvg: number | null;
  lutealLengthAvg: number | null;
}

export interface TtcPattern {
  title: string;
  body: string;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function standardDeviation(nums: number[]): number | null {
  if (nums.length < 2) return null;
  const mean = average(nums)!;
  const variance = nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

/**
 * Real cycle boundaries from logged period days, not the settings average.
 * Consecutive period days (tolerating a one-day gap, matching how people
 * actually log) collapse into one bleed; the gap between consecutive bleed
 * starts is one observed cycle.
 */
export function deriveCycleStarts(
  logs: { date: string; is_period: boolean | null }[]
): { starts: string[]; bleedLengths: number[] } {
  const periodDates = logs
    .filter((l) => l.is_period === true)
    .map((l) => l.date)
    .sort();

  const starts: string[] = [];
  const bleedLengths: number[] = [];
  let currentStart: string | null = null;
  let currentLength = 0;
  let previous: Date | null = null;

  for (const dateStr of periodDates) {
    const d = new Date(`${dateStr}T00:00:00`);
    const gapDays = previous ? Math.round((d.getTime() - previous.getTime()) / 86400000) : null;

    if (currentStart === null || (gapDays !== null && gapDays > 2)) {
      if (currentStart !== null) bleedLengths.push(currentLength);
      currentStart = dateStr;
      starts.push(dateStr);
      currentLength = 1;
    } else {
      currentLength += 1;
    }
    previous = d;
  }
  if (currentStart !== null) bleedLengths.push(currentLength);

  return { starts, bleedLengths };
}

/** Scores every cycle the window saw, most recent first, using the same `detectOvulation` the rest of the app runs. */
export function scoreTtcCycles(
  logs: TtcHistoryLog[],
  cycleStarts: string[],
  settings: CycleSettings,
  windowEnd: Date,
  hasPcos: boolean
): TtcHistoryCycle[] {
  if (cycleStarts.length === 0) return [];

  const ttcLogs: Record<string, TtcDailyLog> = {};
  for (const l of logs) {
    ttcLogs[l.date] = { date: l.date, is_period: l.is_period === true, bbt_celsius: l.bbt_celsius, opk_result: l.opk_result };
  }

  const windowEndStr = formatDate(windowEnd);

  return cycleStarts
    .map((cycleStart, i) => {
      const nextStart = cycleStarts[i + 1];
      const isOngoing = !nextStart;
      const cycleEnd = isOngoing
        ? windowEndStr
        : formatDate(new Date(new Date(`${nextStart}T00:00:00`).getTime() - 86400000));
      const targetDate = isOngoing ? windowEnd : new Date(`${cycleEnd}T00:00:00`);
      const cycleLengthDays = nextStart
        ? Math.round(
            (new Date(`${nextStart}T00:00:00`).getTime() - new Date(`${cycleStart}T00:00:00`).getTime()) / 86400000
          )
        : null;

      const signal = detectOvulation(cycleStart, targetDate, ttcLogs, settings, { hasPcos });
      return { cycleStart, cycleEnd, isOngoing, cycleLengthDays, signal };
    })
    .reverse(); // most recent first
}

/** Chart-ready readings for the most recent cycle only — earlier cycles have their own baselines, so splicing them together would draw a coverline that belongs to no cycle in particular. */
export function latestCycleChart(
  logs: TtcHistoryLog[],
  cycleStarts: string[],
  windowEnd: Date
): { cycleStart: string; bbt: BbtReading[]; opk: OpkReading[]; coverline: number | null } | null {
  if (cycleStarts.length === 0) return null;

  const ttcLogs: Record<string, TtcDailyLog> = {};
  for (const l of logs) {
    ttcLogs[l.date] = { date: l.date, is_period: l.is_period === true, bbt_celsius: l.bbt_celsius, opk_result: l.opk_result };
  }

  const latestCycleStart = cycleStarts[cycleStarts.length - 1];
  const readings = collectCycleReadings(latestCycleStart, windowEnd, ttcLogs);
  if (readings.bbt.length === 0 && readings.opk.length === 0) return null;

  return {
    cycleStart: latestCycleStart,
    bbt: readings.bbt,
    opk: readings.opk,
    coverline: currentCoverline(readings.bbt),
  };
}

/** "Across your cycles" stat tiles. */
export function computeTtcCycleStats(cycles: TtcHistoryCycle[]): TtcCycleStats {
  const lengths = cycles.map((c) => c.cycleLengthDays).filter((n): n is number => n !== null);
  const confirmedCount = cycles.filter((c) => c.signal.status === 'ovulation_confirmed').length;

  const ovDays: number[] = [];
  const lutealLengths: number[] = [];
  cycles.forEach((c) => {
    const eventDate = c.signal.confirmedDate || c.signal.predictedDate;
    if (!eventDate) return;
    const dayInCycle = daysBetween(parseLocalDate(c.cycleStart), parseLocalDate(eventDate)) + 1;
    ovDays.push(dayInCycle);
    if (c.cycleLengthDays !== null) lutealLengths.push(c.cycleLengthDays - dayInCycle);
  });

  return {
    cyclesLogged: cycles.length,
    confirmedCount,
    cycleLengthAvg: lengths.length ? Math.round(average(lengths)!) : null,
    cycleLengthVariation: standardDeviation(lengths),
    ovulationDayAvg: ovDays.length ? Math.round(average(ovDays)!) : null,
    lutealLengthAvg: lutealLengths.length ? Math.round(average(lutealLengths)!) : null,
  };
}

/**
 * 1-3 deterministic, non-diagnostic observations computed from her own logged
 * cycles — same philosophy as `healthReport.ts`'s `buildSuggestions` /
 * `buildClinicalFlags`: state what was observed, never interpret it.
 */
export function detectTtcPatterns(cycles: TtcHistoryCycle[], stats: TtcCycleStats): TtcPattern[] {
  const out: TtcPattern[] = [];

  if (stats.cycleLengthVariation !== null && stats.cycleLengthVariation >= 3) {
    out.push({
      title: 'Your window is wider than average',
      body: `Your cycle lengths have varied by about ${stats.cycleLengthVariation.toFixed(1)} days across your logged cycles, which is why the predicted fertile window stays wide until a signal narrows it.`,
    });
  }

  const surgeToShiftGaps = cycles
    .map((c) => (c.signal.confirmedDate && c.signal.opkPeakDate
      ? daysBetween(parseLocalDate(c.signal.opkPeakDate), parseLocalDate(c.signal.confirmedDate))
      : null))
    .filter((n): n is number => n !== null);
  if (surgeToShiftGaps.length >= 2) {
    const gapAvg = average(surgeToShiftGaps)!;
    const gapVariation = standardDeviation(surgeToShiftGaps);
    if (gapVariation !== null && gapVariation < 1) {
      out.push({
        title: 'Your surge-to-shift gap is steady',
        body: `Across your confirmed cycles, ovulation lands about ${Math.round(gapAvg)} day${Math.round(gapAvg) === 1 ? '' : 's'} after your test peaks — consistent enough that a surge alone is a reasonable early estimate.`,
      });
    }
  }

  if (cycles.length >= 3) {
    const ratio = stats.confirmedCount / cycles.length;
    out.push(
      ratio < 0.5
        ? {
            title: 'Fewer than half your cycles confirmed',
            body: `${stats.confirmedCount} of your last ${cycles.length} cycles reached a two-signal confirmation. Adding a second signal — a thermometer alongside a strip, or the other way round — would confirm more of them.`,
          }
        : {
            title: 'Most of your cycles confirm cleanly',
            body: `${stats.confirmedCount} of your last ${cycles.length} cycles reached a two-signal confirmation — your current kit is doing its job.`,
          }
    );
  }

  return out.slice(0, 3);
}
