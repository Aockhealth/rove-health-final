/**
 * Writes health-platform-sourced readings into daily_logs / lh_readings.
 *
 * Conflict policy: sync only ever fills a field that is currently NULL. It
 * never overwrites something she entered herself, even if the synced value
 * is more recent — a manual entry is always trusted over an imported one.
 * This is the same reasoning as the "self-corrects on the next log" BBT
 * tradeoff already documented in shared/cycle/phase.ts: silently replacing
 * her own data with a device's guess is a worse failure than leaving a gap
 * unfilled for one more day.
 */
import { supabase } from './supabase';
import type { HealthPlatformSource, FlowIntensity, MappedOpkReading, MappedMucusReading } from '@shared/health/platformMapping';

export interface ImportedDayReading {
  date: string; // YYYY-MM-DD
  bbtCelsius?: number;
  bbtRecordedAt?: string; // ISO timestamp of the BBT reading itself
  opk?: MappedOpkReading;
  opkRecordedAt?: string; // ISO timestamp of the OPK reading itself
  mucus?: MappedMucusReading;
  isPeriod?: true;
  flowIntensity?: FlowIntensity;
  sleepMinutes?: number;
  /** Informational only — never read by detectOvulation. See the migration comment on daily_logs.hrv_ms. */
  hrvMs?: number;
  hrvSource?: 'apple_sdnn' | 'health_connect_rmssd';
  restingHeartRateBpm?: number;
  skinTempDeltaCelsius?: number;
  steps?: number;
}

export interface SyncWriteResult {
  daysConsidered: number;
  fieldsWritten: number;
  fieldsSkippedExisting: number;
}

type ExistingDailyLogRow = {
  date: string;
  bbt_celsius: number | null;
  opk_result: string | null;
  is_period: boolean | null;
  flow_intensity: string | null;
  cervical_discharge: string | null;
  sleep_minutes: number | null;
  hrv_ms: number | null;
  resting_heart_rate_bpm: number | null;
  skin_temp_delta_celsius: number | null;
  steps: number | null;
};

/** Only the columns this writer ever touches — never a full daily_logs row shape. */
type DailyLogSyncPatch = {
  user_id: string;
  date: string;
  synced_from: HealthPlatformSource;
  bbt_celsius?: number;
  bbt_wake_time?: string;
  opk_result?: string;
  is_period?: boolean;
  flow_intensity?: string;
  cervical_discharge?: string;
  sleep_minutes?: number;
  hrv_ms?: number;
  hrv_source?: string;
  resting_heart_rate_bpm?: number;
  skin_temp_delta_celsius?: number;
  steps?: number;
};

export async function writeImportedReadings(
  readings: ImportedDayReading[],
  source: HealthPlatformSource
): Promise<SyncWriteResult> {
  const result: SyncWriteResult = { daysConsidered: readings.length, fieldsWritten: 0, fieldsSkippedExisting: 0 };
  if (readings.length === 0) return result;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return result;

  const dates = readings.map((r) => r.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const { data: existingRows } = await supabase
    .from('daily_logs')
    .select('date, bbt_celsius, opk_result, is_period, flow_intensity, cervical_discharge, sleep_minutes, hrv_ms, resting_heart_rate_bpm, skin_temp_delta_celsius, steps')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate);

  const existingByDate = new Map<string, ExistingDailyLogRow>();
  for (const row of (existingRows || []) as ExistingDailyLogRow[]) {
    existingByDate.set(row.date, row);
  }

  const { data: existingLh } = await supabase
    .from('lh_readings')
    .select('date')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate);
  const existingLhDates = new Set((existingLh || []).map((r: { date: string }) => r.date));

  const dailyLogPatches: DailyLogSyncPatch[] = [];
  const lhInserts: Array<{ user_id: string; date: string; test_time: string; band_level: number; synced_from: HealthPlatformSource }> = [];

  for (const reading of readings) {
    const existing = existingByDate.get(reading.date);
    const patch: DailyLogSyncPatch = { user_id: user.id, date: reading.date, synced_from: source };
    let wroteAnyField = false;

    if (reading.bbtCelsius !== undefined && !existing?.bbt_celsius) {
      patch.bbt_celsius = reading.bbtCelsius;
      patch.bbt_wake_time = reading.bbtRecordedAt;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.bbtCelsius !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (reading.opk !== undefined && !existing?.opk_result) {
      patch.opk_result = reading.opk.opkResult;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.opk !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (reading.mucus !== undefined && !existing?.cervical_discharge) {
      patch.cervical_discharge = JSON.stringify([reading.mucus.vaginalFluid, reading.mucus.appearance, reading.mucus.sensation]);
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.mucus !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (reading.isPeriod !== undefined && (existing?.is_period ?? null) === null) {
      patch.is_period = true;
      if (reading.flowIntensity) patch.flow_intensity = reading.flowIntensity;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.isPeriod !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (reading.sleepMinutes !== undefined && !existing?.sleep_minutes) {
      patch.sleep_minutes = reading.sleepMinutes;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.sleepMinutes !== undefined) {
      result.fieldsSkippedExisting++;
    }

    // Secondary/informational signals — same "fill only if empty" policy,
    // though there's nothing for her to have entered manually here; this
    // only ever guards against re-writing a value synced on a previous run.
    if (reading.hrvMs !== undefined && !existing?.hrv_ms) {
      patch.hrv_ms = reading.hrvMs;
      if (reading.hrvSource) patch.hrv_source = reading.hrvSource;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.hrvMs !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (reading.restingHeartRateBpm !== undefined && !existing?.resting_heart_rate_bpm) {
      patch.resting_heart_rate_bpm = reading.restingHeartRateBpm;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.restingHeartRateBpm !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (reading.skinTempDeltaCelsius !== undefined && existing?.skin_temp_delta_celsius == null) {
      patch.skin_temp_delta_celsius = reading.skinTempDeltaCelsius;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.skinTempDeltaCelsius !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (reading.steps !== undefined && !existing?.steps) {
      patch.steps = reading.steps;
      wroteAnyField = true;
      result.fieldsWritten++;
    } else if (reading.steps !== undefined) {
      result.fieldsSkippedExisting++;
    }

    if (wroteAnyField) dailyLogPatches.push(patch);

    if (reading.opk !== undefined && !existingLhDates.has(reading.date)) {
      lhInserts.push({
        user_id: user.id,
        date: reading.date,
        test_time: reading.opkRecordedAt || `${reading.date}T08:00:00.000Z`,
        band_level: reading.opk.bandLevel,
        synced_from: source,
      });
    }
  }

  if (dailyLogPatches.length > 0) {
    await supabase.from('daily_logs').upsert(dailyLogPatches, { onConflict: 'user_id, date' });
  }
  if (lhInserts.length > 0) {
    await supabase.from('lh_readings').upsert(lhInserts, { onConflict: 'user_id, date' });
  }

  return result;
}
