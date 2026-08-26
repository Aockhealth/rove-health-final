/**
 * Apple HealthKit sync. Reads basal temperature, sleep, and fertility-test/
 * period signals; writes back only what Rove itself collects that HealthKit
 * also models — basal temperature and period/flow — never symptoms, moods,
 * or anything else in her account.
 *
 * Background delivery (registerAppleHealthObservers) layers HealthKit's own
 * observer mechanism on top of the periodic cross-platform task in
 * healthBackgroundSync.ts — see that module's header for how the two relate.
 *
 * Must only ever be imported on iOS — the native module doesn't exist on
 * Android. Callers should go through ./healthSync.ts, which gates on
 * `Platform.OS`, rather than importing this file directly.
 */
import {
  isHealthDataAvailable,
  requestAuthorization,
  authorizationStatusFor,
  AuthorizationStatus,
  queryQuantitySamples,
  queryCategorySamples,
  saveQuantitySample,
  saveCategorySample,
  configureBackgroundTypes,
  disableAllBackgroundDelivery,
  subscribeToChanges,
} from '@kingstinct/react-native-healthkit';
import {
  mapAppleOvulationTestResult,
  mapAppleCervicalMucusQuality,
  mapAppleMenstrualFlow,
  mapFlowIntensityToAppleValue,
  type FlowIntensity,
} from '@shared/health/platformMapping';
import { writeImportedReadings, type ImportedDayReading } from './healthSyncWriter';

const READ_TYPES = [
  'HKQuantityTypeIdentifierBasalBodyTemperature',
  'HKCategoryTypeIdentifierOvulationTestResult',
  'HKCategoryTypeIdentifierCervicalMucusQuality',
  'HKCategoryTypeIdentifierMenstrualFlow',
  'HKCategoryTypeIdentifierSleepAnalysis',
  // Secondary, informational-only signals — see the migration comment on
  // daily_logs.hrv_ms. Never fed into detectOvulation.
  'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierAppleSleepingWristTemperature',
  'HKQuantityTypeIdentifierStepCount',
] as const;

const WRITE_TYPES = ['HKQuantityTypeIdentifierBasalBodyTemperature', 'HKCategoryTypeIdentifierMenstrualFlow'] as const;

const ASLEEP_VALUES = new Set([1, 3, 4, 5]); // asleepUnspecified/asleep, asleepCore, asleepDeep, asleepREM — excludes inBed(0) and awake(2)

export async function isAppleHealthAvailable(): Promise<boolean> {
  try {
    return await isHealthDataAvailable();
  } catch {
    return false;
  }
}

export async function requestAppleHealthPermissions(): Promise<boolean> {
  return requestAuthorization({ toRead: [...READ_TYPES], toShare: [...WRITE_TYPES] });
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Pulls the last `days` of relevant samples and writes any gaps into
 * daily_logs / lh_readings. Returns how many day-fields were actually
 * filled vs. left alone because she'd already logged them herself.
 */
export async function syncAppleHealthData(days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  const filter = { date: { startDate, endDate } };

  const byDate = new Map<string, ImportedDayReading>();
  const get = (date: string): ImportedDayReading => {
    let existing = byDate.get(date);
    if (!existing) {
      existing = { date };
      byDate.set(date, existing);
    }
    return existing;
  };

  const [bbt, opk, mucus, flow, sleep, hrv, restingHr, wristTemp, steps] = await Promise.all([
    queryQuantitySamples('HKQuantityTypeIdentifierBasalBodyTemperature', { filter, limit: 0, unit: 'degC' }),
    queryCategorySamples('HKCategoryTypeIdentifierOvulationTestResult', { filter, limit: 0 }),
    queryCategorySamples('HKCategoryTypeIdentifierCervicalMucusQuality', { filter, limit: 0 }),
    queryCategorySamples('HKCategoryTypeIdentifierMenstrualFlow', { filter, limit: 0 }),
    queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', { filter, limit: 0 }),
    queryQuantitySamples('HKQuantityTypeIdentifierHeartRateVariabilitySDNN', { filter, limit: 0, unit: 'ms' }),
    queryQuantitySamples('HKQuantityTypeIdentifierRestingHeartRate', { filter, limit: 0, unit: 'count/min' }),
    queryQuantitySamples('HKQuantityTypeIdentifierAppleSleepingWristTemperature', { filter, limit: 0, unit: 'degC' }),
    queryQuantitySamples('HKQuantityTypeIdentifierStepCount', { filter, limit: 0, unit: 'count' }),
  ]);

  for (const sample of bbt) {
    const reading = get(toDateKey(sample.startDate));
    reading.bbtCelsius = sample.quantity;
    reading.bbtRecordedAt = sample.startDate.toISOString();
  }

  for (const sample of opk) {
    const mapped = mapAppleOvulationTestResult(sample.value as number);
    if (mapped) {
      const reading = get(toDateKey(sample.startDate));
      reading.opk = mapped;
      reading.opkRecordedAt = sample.startDate.toISOString();
    }
  }

  for (const sample of mucus) {
    const mapped = mapAppleCervicalMucusQuality(sample.value as number);
    if (mapped) get(toDateKey(sample.startDate)).mucus = mapped;
  }

  for (const sample of flow) {
    const intensity = mapAppleMenstrualFlow(sample.value as number);
    if (intensity !== null) {
      const reading = get(toDateKey(sample.startDate));
      reading.isPeriod = true;
      reading.flowIntensity = intensity;
    }
  }

  // Group sleep samples by wake-up date (the day the sample ends), matching
  // how a manual sleep log describes "how much I slept last night" as part
  // of today's entry.
  const sleepMinutesByDate = new Map<string, number>();
  for (const sample of sleep) {
    if (!ASLEEP_VALUES.has(sample.value as number)) continue;
    const wakeDate = toDateKey(sample.endDate);
    const minutes = (sample.endDate.getTime() - sample.startDate.getTime()) / 60000;
    sleepMinutesByDate.set(wakeDate, (sleepMinutesByDate.get(wakeDate) || 0) + Math.max(0, minutes));
  }
  for (const [date, minutes] of sleepMinutesByDate) {
    get(date).sleepMinutes = Math.round(minutes);
  }

  for (const sample of hrv) {
    get(toDateKey(sample.startDate)).hrvMs = round2(sample.quantity);
    get(toDateKey(sample.startDate)).hrvSource = 'apple_sdnn';
  }

  for (const sample of restingHr) {
    get(toDateKey(sample.startDate)).restingHeartRateBpm = Math.round(sample.quantity);
  }

  // AppleSleepingWristTemperature is absolute, not a delta — HealthKit has
  // no "deviation from baseline" reading the way Health Connect's
  // SkinTemperatureRecord does, so it's derived here: the median of this
  // window's own readings stands in for her baseline. A real rolling
  // baseline (weighted toward her most recent cycles, the way the BBT
  // coverline is) would be better, but this is a reasonable one-pass
  // approximation for a secondary, informational-only signal.
  if (wristTemp.length >= 3) {
    const sorted = [...wristTemp.map((s) => s.quantity)].sort((a, b) => a - b);
    const baseline = sorted[Math.floor(sorted.length / 2)];
    for (const sample of wristTemp) {
      get(toDateKey(sample.startDate)).skinTempDeltaCelsius = round2(sample.quantity - baseline);
    }
  }

  // HealthKit reports steps as many small samples throughout the day (often
  // from multiple sources) — summed per day, same shape as the sleep
  // aggregation above.
  const stepsByDate = new Map<string, number>();
  for (const sample of steps) {
    const date = toDateKey(sample.startDate);
    stepsByDate.set(date, (stepsByDate.get(date) || 0) + sample.quantity);
  }
  for (const [date, total] of stepsByDate) {
    get(date).steps = Math.round(total);
  }

  return writeImportedReadings(Array.from(byDate.values()), 'apple_health');
}

/**
 * Writes one day's BBT and/or period status back to Apple Health, so Rove
 * isn't a second silo for data she's already logging in the app. A day with
 * neither field set is a no-op — this is called from the same save path for
 * every daily-log write, whether or not that particular save touched BBT or
 * period status.
 *
 * Both samples are anchored to local midnight on `date` (start) through
 * 23:59:59 (end) — a same-day range, since Rove only ever logs one BBT
 * reading and one period status per calendar day, never a precise time.
 */
// Marking a period always fills forward a multi-day span (see
// handleTogglePeriodDate/handleSavePeriodChanges in tracker.tsx), which
// persists every changed day via Promise.all — so a single "log period" tap
// fires several of these concurrently. The native HealthKit bridge isn't
// safe under that concurrency (concurrent HKCategorySample construction on
// the same identifier is a known crash source, independent of authorization
// status), so every call is chained onto one queue and only ever runs one
// at a time, no matter how many callers invoke it at once.
let healthWriteQueue: Promise<void> = Promise.resolve();

export function writeAppleHealthData(entry: {
  date: string;
  bbtCelsius?: number | null;
  isPeriod?: boolean | null;
  isPeriodStart?: boolean | null;
  flowIntensity?: FlowIntensity | null;
}): Promise<void> {
  const run = healthWriteQueue.then(() => performAppleHealthWrite(entry));
  healthWriteQueue = run;
  return run;
}

// This package's own docs warn that saving/reading a type without having
// called requestAuthorization for it *in this process* can misbehave even
// when authorizationStatusFor already reports sharingAuthorized from a grant
// made in an earlier app launch. Re-requesting a type the OS already decided
// doesn't show a prompt — it resolves immediately with the existing status —
// so this only ever surfaces UI for a type still sitting at notDetermined,
// which is exactly the case being deliberately skipped below (a user who's
// never gone through Profile > Health Sync shouldn't get a permission sheet
// triggered by just logging a period). Kept as cheap, docs-recommended
// defense in depth alongside the metadata fix below, which is what actually
// stopped the crash.
const requestedWriteTypes = new Set<(typeof WRITE_TYPES)[number]>();

async function ensureWriteAuthorizationRequested(identifier: (typeof WRITE_TYPES)[number]): Promise<boolean> {
  if (authorizationStatusFor(identifier) !== AuthorizationStatus.sharingAuthorized) return false;

  if (!requestedWriteTypes.has(identifier)) {
    await requestAuthorization({ toShare: [identifier] });
    requestedWriteTypes.add(identifier);
  }
  return true;
}

async function performAppleHealthWrite(entry: {
  date: string;
  bbtCelsius?: number | null;
  isPeriod?: boolean | null;
  isPeriodStart?: boolean | null;
  flowIntensity?: FlowIntensity | null;
}): Promise<void> {
  try {
    const [y, m, d] = entry.date.split('-').map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59);

    if (
      typeof entry.bbtCelsius === 'number' &&
      (await ensureWriteAuthorizationRequested('HKQuantityTypeIdentifierBasalBodyTemperature'))
    ) {
      await saveQuantitySample('HKQuantityTypeIdentifierBasalBodyTemperature', 'degC', entry.bbtCelsius, start, end);
    }

    if (entry.isPeriod && (await ensureWriteAuthorizationRequested('HKCategoryTypeIdentifierMenstrualFlow'))) {
      // HealthKit's own construction-time validation for MenstrualFlow
      // samples expects HKMenstrualCycleStart in the metadata — omitting it
      // is what was crashing HKCategorySample's initializer on every single
      // write, independent of authorization state or write concurrency.
      await saveCategorySample(
        'HKCategoryTypeIdentifierMenstrualFlow',
        mapFlowIntensityToAppleValue(entry.flowIntensity ?? null),
        start,
        end,
        { HKMenstrualCycleStart: entry.isPeriodStart ?? false }
      );
    }
  } catch (err) {
    // Best-effort — a failed write-back should never surface as an error on
    // the tracker save the user is actually looking at.
    console.error('[appleHealthSync] writeAppleHealthData failed:', err);
  }
}

// The subset of READ_TYPES that meaningfully changes day to day and is
// worth waking the app for — sleep is deliberately excluded, since it isn't
// itself an ovulation signal and would fire an observer callback nightly for
// no benefit.
const BACKGROUND_TYPES = [
  'HKQuantityTypeIdentifierBasalBodyTemperature',
  'HKCategoryTypeIdentifierOvulationTestResult',
  'HKCategoryTypeIdentifierCervicalMucusQuality',
  'HKCategoryTypeIdentifierMenstrualFlow',
] as const;

// HKUpdateFrequency.hourly — passed as the raw numeric value rather than
// importing the enum, since the package doesn't re-export it as a value
// from its main entry point, only as a type.
const UPDATE_FREQUENCY_HOURLY = 2;

let activeSubscriptions: Array<{ remove: () => boolean }> = [];

/**
 * Registers HealthKit's own background-delivery observers, layered on top
 * of the periodic cross-platform task in healthBackgroundSync.ts. Requires
 * the HealthKit config plugin's `background: true` (see app.json) and
 * `toRead` authorization already granted for BACKGROUND_TYPES — safe to
 * call without either; it just won't deliver anything.
 */
export async function registerAppleHealthObservers(): Promise<void> {
  try {
    await configureBackgroundTypes([...BACKGROUND_TYPES], UPDATE_FREQUENCY_HOURLY);

    unsubscribeAll();
    activeSubscriptions = BACKGROUND_TYPES.map((type) =>
      subscribeToChanges(type, () => {
        // A short window — this fires on genuine new data, not a periodic
        // catch-up scan.
        void syncAppleHealthData(3);
      })
    );
  } catch (err) {
    console.error('[appleHealthSync] registerAppleHealthObservers failed:', err);
  }
}

export async function unregisterAppleHealthObservers(): Promise<void> {
  unsubscribeAll();
  try {
    await disableAllBackgroundDelivery();
  } catch (err) {
    console.error('[appleHealthSync] unregisterAppleHealthObservers failed:', err);
  }
}

function unsubscribeAll(): void {
  for (const sub of activeSubscriptions) {
    try {
      sub.remove();
    } catch {
      // Already removed or never fully registered — nothing to do.
    }
  }
  activeSubscriptions = [];
}
