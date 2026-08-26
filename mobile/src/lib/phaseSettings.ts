/**
 * One place that answers "what cycle settings should this screen predict
 * from?" — so Home, Tracker, Insights, Plan and the health report can never
 * again disagree about it.
 *
 * Two corrections get layered onto the stored settings row:
 *
 *  1. **Observed cycle length.** `user_cycle_settings.cycle_length_days` is
 *     only ever written by the manual Cycle Settings form, so a woman who
 *     logged three honest 34-day cycles was still counted down to day 28
 *     forever. `resolveCycleSettings` replaces it with the median of her
 *     actual logged cycles once there are enough of them. Applies in every
 *     mode — it needs nothing but logged period days.
 *
 *  2. **Personalized luteal length.** Luteal length is comparatively stable
 *     within a woman, so her own confirmed cycles are a better prior than the
 *     population 14. Needs BBT-confirmed ovulation, so it is TTC-only.
 *
 * Before this existed, (2) was applied in dashboard.ts / plan.ts /
 * healthReport.ts but NOT in tracker.tsx or the Insights phase readout, which
 * built their settings inline — so Home and Tracker named a different phase on
 * four days of every cycle for the same user.
 *
 * @module lib/phaseSettings
 */
import { resolveCycleSettings, type CycleSettings, type DailyLog } from '@shared/cycle/phase';
import type { LhBandReading } from '@shared/cycle/lh';
import type { MucusReading } from '@shared/cycle/mucus';
import {
  deriveCycleStarts,
  getPersonalizedLutealLength,
  scoreTtcCycles,
  type TtcHistoryLog,
} from './ttcCycleHistory';

/** The raw `daily_logs` row shape every caller already has in hand. */
export type RawDailyLogRow = Record<string, any> & { date: string };

/**
 * Normalize raw `daily_logs` rows into the cycle-history shape the TTC scorer
 * wants. Was copy-pasted in dashboard.ts, insights.ts, plan.ts and
 * healthReport.ts; kept here so the column list only has to be right once.
 *
 * `bbt_celsius` is a Postgres `numeric`, which PostgREST hands back as a
 * string — coerced here so it never reaches the coverline arithmetic as one.
 */
export function toTtcLogs(logs: RawDailyLogRow[] | null | undefined): TtcHistoryLog[] {
  return (logs ?? []).map((l) => ({
    date: l.date as string,
    is_period: (l.is_period ?? null) as boolean | null,
    bbt_celsius: l.bbt_celsius === null || l.bbt_celsius === undefined ? null : Number(l.bbt_celsius),
    opk_result: (l.opk_result ?? null) as TtcHistoryLog['opk_result'],
    disruptors: l.disruptors ?? null,
    sleep_minutes: l.sleep_minutes === null || l.sleep_minutes === undefined ? null : Number(l.sleep_minutes),
    bbt_wake_time: l.bbt_wake_time ?? null,
    nsaid_taken: l.nsaid_taken ?? null,
  }));
}

export interface ResolvePhaseSettingsOptions {
  /** The stored `user_cycle_settings` row, already defaulted. */
  base: CycleSettings;
  /** Logs keyed by date — what `calculatePhase` itself consumes. */
  monthLogs: Record<string, DailyLog>;
  /** The same logs as a flat biomarker list, for the luteal personalization. */
  ttcLogs: TtcHistoryLog[];
  trackerMode: string | null | undefined;
  hasPcos: boolean;
  lhReadings?: LhBandReading[];
  mucusReadings?: MucusReading[];
  /** Defaults to now; injectable so the health report can resolve as of its own window end. */
  referenceDate?: Date;
}

/**
 * The settings every screen should hand to `calculatePhase` / `detectOvulation`.
 *
 * Never writes back to the settings row: the stored numbers are hers, typed by
 * hand, so this corrects the *prediction* without overwriting her input.
 */
export function resolvePhaseSettings(options: ResolvePhaseSettingsOptions): CycleSettings {
  const {
    base,
    monthLogs,
    ttcLogs,
    trackerMode,
    hasPcos,
    lhReadings = [],
    mucusReadings = [],
    referenceDate = new Date(),
  } = options;

  // 1. Her real cycle length, in every mode.
  let resolved = resolveCycleSettings(referenceDate, base, monthLogs);

  // 2. Her real luteal length, where confirmed ovulations make it knowable.
  if (trackerMode === 'ttc') {
    const { starts } = deriveCycleStarts(ttcLogs);
    const cycles = scoreTtcCycles(ttcLogs, starts, resolved, referenceDate, hasPcos, lhReadings, mucusReadings);
    const personalizedLuteal = getPersonalizedLutealLength(cycles);
    if (personalizedLuteal !== null) {
      resolved = { ...resolved, luteal_length_days: personalizedLuteal };
    }
  }

  return resolved;
}
