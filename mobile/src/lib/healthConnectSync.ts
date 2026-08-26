/**
 * Android Health Connect sync — read-only, foreground-triggered (no
 * background delivery yet; see docs/lh_fsh_strip_integration_plan.md-style
 * "not yet built" note for that as a future step).
 *
 * On a Samsung device, Samsung Health already writes most of this data into
 * Health Connect itself, so this one integration covers those users too —
 * there is deliberately no separate Samsung Health SDK integration.
 *
 * Must only ever be imported on Android — the native module doesn't exist
 * on iOS. Callers should go through ./healthSync.ts, which gates on
 * `Platform.OS`, rather than importing this file directly.
 */
import {
  initialize,
  requestPermission,
  readRecords,
  insertRecords,
  openHealthConnectSettings,
  type RecordResult,
} from 'react-native-health-connect';

export { openHealthConnectSettings };
import {
  mapHealthConnectOvulationTestResult,
  mapHealthConnectCervicalMucus,
  mapHealthConnectMenstruationFlow,
  mapFlowIntensityToHealthConnectValue,
  type FlowIntensity,
} from '@shared/health/platformMapping';
import { writeImportedReadings, type ImportedDayReading } from './healthSyncWriter';

const RECORD_TYPES = [
  'BasalBodyTemperature',
  'OvulationTest',
  'CervicalMucus',
  'MenstruationFlow',
  'MenstruationPeriod',
  'SleepSession',
  // Secondary, informational-only signals — see the migration comment on
  // daily_logs.hrv_ms. Never fed into detectOvulation.
  'HeartRateVariabilityRmssd',
  'RestingHeartRate',
  'SkinTemperature',
  'Steps',
] as const;

// Only what Rove itself collects and Health Connect also models — never
// symptoms, moods, or anything else in her account.
const WRITE_RECORD_TYPES = ['BasalBodyTemperature', 'MenstruationFlow'] as const;

const SLEEPING_STAGES = new Set([2, 4, 5, 6]); // SLEEPING, LIGHT, DEEP, REM — excludes AWAKE(1) and OUT_OF_BED(3)

export async function isHealthConnectAvailable(): Promise<boolean> {
  try {
    return await initialize();
  } catch {
    return false;
  }
}

export async function requestHealthConnectPermissions(): Promise<boolean> {
  // The native client must be initialized in this same session before any
  // other call — requestPermission throws CLIENT_NOT_INITIALIZED otherwise,
  // even if initialize() succeeded on a previous app run.
  const available = await initialize();
  if (!available) return false;
  const readPerms = RECORD_TYPES.map((recordType) => ({ accessType: 'read' as const, recordType }));
  const writePerms = WRITE_RECORD_TYPES.map((recordType) => ({ accessType: 'write' as const, recordType }));
  const granted = await requestPermission([...readPerms, ...writePerms]);
  return granted.length > 0;
}

function toDateKey(isoTime: string): string {
  return isoTime.slice(0, 10);
}

/**
 * Pulls the last `days` of relevant records and writes any gaps into
 * daily_logs / lh_readings. Returns how many day-fields were actually
 * filled vs. left alone because she'd already logged them herself.
 */
export async function syncHealthConnectData(days = 30) {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);
  const timeRangeFilter = {
    operator: 'between' as const,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  };

  const byDate = new Map<string, ImportedDayReading>();
  const get = (date: string): ImportedDayReading => {
    let existing = byDate.get(date);
    if (!existing) {
      existing = { date };
      byDate.set(date, existing);
    }
    return existing;
  };

  const [bbt, opk, mucus, flow, periods, sleep, hrv, restingHr, skinTemp, steps] = await Promise.all([
    readRecords('BasalBodyTemperature', { timeRangeFilter }),
    readRecords('OvulationTest', { timeRangeFilter }),
    readRecords('CervicalMucus', { timeRangeFilter }),
    readRecords('MenstruationFlow', { timeRangeFilter }),
    readRecords('MenstruationPeriod', { timeRangeFilter }),
    readRecords('SleepSession', { timeRangeFilter }),
    readRecords('HeartRateVariabilityRmssd', { timeRangeFilter }),
    readRecords('RestingHeartRate', { timeRangeFilter }),
    readRecords('SkinTemperature', { timeRangeFilter }),
    readRecords('Steps', { timeRangeFilter }),
  ]);

  for (const record of bbt.records as RecordResult<'BasalBodyTemperature'>[]) {
    const reading = get(toDateKey(record.time));
    reading.bbtCelsius = record.temperature.inCelsius;
    reading.bbtRecordedAt = record.time;
  }

  for (const record of opk.records as RecordResult<'OvulationTest'>[]) {
    const mapped = mapHealthConnectOvulationTestResult(record.result);
    if (mapped) {
      const reading = get(toDateKey(record.time));
      reading.opk = mapped;
      reading.opkRecordedAt = record.time;
    }
  }

  for (const record of mucus.records as RecordResult<'CervicalMucus'>[]) {
    const mapped = mapHealthConnectCervicalMucus(record.appearance);
    if (mapped) get(toDateKey(record.time)).mucus = mapped;
  }

  for (const record of flow.records as RecordResult<'MenstruationFlow'>[]) {
    const intensity = mapHealthConnectMenstruationFlow(record.flow);
    const reading = get(toDateKey(record.time));
    reading.isPeriod = true;
    if (intensity) reading.flowIntensity = intensity;
  }

  // One MenstruationPeriodRecord per logged day, not an interval — marks
  // that day as a period day with no flow grade (flow records above fill
  // in an intensity separately, where logged).
  for (const record of periods.records as RecordResult<'MenstruationPeriod'>[]) {
    get(toDateKey(record.time)).isPeriod = true;
  }

  for (const record of sleep.records as RecordResult<'SleepSession'>[]) {
    // Attributed to the wake-up date (endTime), matching how a manual sleep
    // log describes "how much I slept last night" as part of today's entry.
    const wakeDate = toDateKey(record.endTime);
    const stages = record.stages || [];
    const asleepMinutes = stages.reduce((total, stage) => {
      if (!SLEEPING_STAGES.has(stage.stage)) return total;
      const minutes = (new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()) / 60000;
      return total + Math.max(0, minutes);
    }, 0);
    if (asleepMinutes > 0) {
      const reading = get(wakeDate);
      reading.sleepMinutes = Math.round(asleepMinutes);
    }
  }

  for (const record of hrv.records as RecordResult<'HeartRateVariabilityRmssd'>[]) {
    const reading = get(toDateKey(record.time));
    reading.hrvMs = Math.round(record.heartRateVariabilityMillis * 100) / 100;
    reading.hrvSource = 'health_connect_rmssd';
  }

  for (const record of restingHr.records as RecordResult<'RestingHeartRate'>[]) {
    get(toDateKey(record.time)).restingHeartRateBpm = Math.round(record.beatsPerMinute);
  }

  // Unlike Apple's absolute wrist-temperature reading, Health Connect hands
  // over a deviation from baseline directly — no baseline estimation needed
  // here, just averaging a record's own delta samples into one value for
  // the day.
  for (const record of skinTemp.records as RecordResult<'SkinTemperature'>[]) {
    if (record.deltas.length === 0) continue;
    const avgDeltaCelsius =
      record.deltas.reduce((sum, d) => sum + d.delta.inCelsius, 0) / record.deltas.length;
    get(toDateKey(record.startTime)).skinTempDeltaCelsius = Math.round(avgDeltaCelsius * 100) / 100;
  }

  // Health Connect can report steps as several records per day (different
  // apps/sources) — summed per day, same as HealthKit's step handling.
  const stepsByDate = new Map<string, number>();
  for (const record of steps.records as RecordResult<'Steps'>[]) {
    const date = toDateKey(record.startTime);
    stepsByDate.set(date, (stepsByDate.get(date) || 0) + record.count);
  }
  for (const [date, total] of stepsByDate) {
    get(date).steps = Math.round(total);
  }

  return writeImportedReadings(Array.from(byDate.values()), 'health_connect');
}

/**
 * Writes one day's BBT and/or period status back to Health Connect, so Rove
 * isn't a second silo for data she's already logging in the app. A day with
 * neither field set is a no-op.
 *
 * Anchored to local noon on `date` — Health Connect records are
 * instantaneous (one `time`, not a range), and noon avoids any ambiguity
 * with a device's timezone rounding a midnight timestamp onto the wrong
 * calendar day.
 */
export async function writeHealthConnectData(entry: {
  date: string;
  bbtCelsius?: number | null;
  isPeriod?: boolean | null;
  flowIntensity?: FlowIntensity | null;
}): Promise<void> {
  const [y, m, d] = entry.date.split('-').map(Number);
  const time = new Date(y, m - 1, d, 12, 0, 0).toISOString();

  const records: Array<{ recordType: 'BasalBodyTemperature'; temperature: { value: number; unit: 'celsius' }; time: string } | { recordType: 'MenstruationFlow'; flow: number; time: string }> = [];

  if (typeof entry.bbtCelsius === 'number') {
    records.push({ recordType: 'BasalBodyTemperature', temperature: { value: entry.bbtCelsius, unit: 'celsius' }, time });
  }

  if (entry.isPeriod) {
    records.push({ recordType: 'MenstruationFlow', flow: mapFlowIntensityToHealthConnectValue(entry.flowIntensity ?? null), time });
  }

  if (records.length === 0) return;

  try {
    await insertRecords(records as Parameters<typeof insertRecords>[0]);
  } catch (err) {
    // Best-effort — a failed write-back should never surface as an error on
    // the tracker save the user is actually looking at.
    console.error('[healthConnectSync] writeHealthConnectData failed:', err);
  }
}
