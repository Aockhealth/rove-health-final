import { supabase } from './supabase';
import { daysBetween, parseLocalDate, type CycleSettings } from '@shared/cycle/phase';
import type { OpkResult } from '@shared/cycle/ttc';
import { writeHealthData } from './healthSync';
import type { FlowIntensity } from '@shared/health/platformMapping';
import { hasPcosFlag } from './pcos';

const LOG_WINDOW_DAYS = 90;

export type TrackerMode = 'menstruation' | 'ttc' | 'menopause';

export type TrackerLog = {
  date: string;
  is_period: boolean | null;
  flow_intensity: string | null;
  symptoms: string[];
  /** 1-5 rating per entry in `symptoms`, keyed by the same label string. Absent
   * keys (older logs, or a symptom logged before this shipped) mean "not rated". */
  symptom_severity: Record<string, number>;
  moods: string[];
  exercise_types: string[];
  exercise_minutes: number | null;
  water_intake: number | null;
  self_love_tags: string[];
  self_love_other: string;
  sleep_quality: string[];
  sleep_minutes: number | null;
  disruptors: string[];
  sex_activity: string[];
  contraception: string[];
  cervical_discharge: string | null;
  /** Basal body temperature in Celsius (TTC mode only). */
  bbt_celsius: number | null;
  /** Graded ovulation test reading (TTC mode only). */
  opk_result: OpkResult | null;
  /** Whether an NSAID/painkiller was taken this day (TTC mode only). */
  nsaid_taken: boolean | null;
  notes: string;
};

export type TrackerData = {
  settings: CycleSettings;
  monthLogs: Record<string, TrackerLog>;
  hasSettings: boolean;
  /** Drives whether the Tracker offers the Fertility section. */
  trackerMode: TrackerMode;
  /** From onboarding goals/conditions — see hasPcosFlag. */
  hasPcos: boolean;
  /** From user_cycle_settings.is_irregular. */
  isIrregular: boolean;
};

const TRACKER_MODES: TrackerMode[] = ['menstruation', 'ttc', 'menopause'];

function normaliseTrackerMode(raw: unknown): TrackerMode {
  return TRACKER_MODES.includes(raw as TrackerMode) ? (raw as TrackerMode) : 'menstruation';
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mirrors frontend/src/app/actions/cycle-sync.ts's fetchTrackerPageDataFast —
 * one settings row + a rolling 90-day log window, run as direct RLS-scoped
 * client queries (same pattern as dashboard.ts/plan.ts) since RN can't reach
 * Next.js Server Actions.
 */
export async function fetchTrackerData(): Promise<TrackerData | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

  const [settingsResult, logsResult, onboardingResult] = await Promise.all([
    supabase.from('user_cycle_settings').select('*').eq('user_id', user.id).single(),
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', formatDate(pastDate))
      .order('date', { ascending: false }),
    supabase.from('user_onboarding').select('tracker_mode, goals, conditions').eq('user_id', user.id).single(),
  ]);

  const settings = settingsResult.data;
  const logs = (logsResult.data || []) as TrackerLog[];

  const monthLogs: Record<string, TrackerLog> = {};
  logs.forEach((l) => {
    monthLogs[l.date] = l;
  });

  return {
    settings: {
      last_period_start: settings?.last_period_start || '',
      cycle_length_days: settings?.cycle_length_days || 28,
      period_length_days: settings?.period_length_days || 5,
    },
    monthLogs,
    hasSettings: !!settings?.last_period_start,
    trackerMode: normaliseTrackerMode(onboardingResult.data?.tracker_mode),
    hasPcos: hasPcosFlag(onboardingResult.data?.goals, onboardingResult.data?.conditions),
    isIrregular: settings?.is_irregular === true,
  };
}

/**
 * Mirrors fetchMonthLogs — used when navigating to a month outside the
 * initial 90-day window so the calendar still shows real data instead of
 * going blank.
 */
export async function fetchMonthLogs(year: number, month0: number): Promise<TrackerLog[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const month = month0 + 1; // caller passes 0-indexed month, DB range needs 1-indexed
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lt('date', endDate);

  if (error) return [];
  return (data || []) as TrackerLog[];
}

export interface MedicationLogEntry {
  date: string;
  medication: string;
  dose: string | null;
}

/** Most recent first — days that actually had a fertility medication logged, for the Clinical tab's medication tracker. */
export async function fetchRecentMedicationLogs(limit = 30): Promise<MedicationLogEntry[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('daily_logs')
    .select('date, fertility_medication, fertility_medication_dose')
    .eq('user_id', user.id)
    .not('fertility_medication', 'is', null)
    .order('date', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row: any) => ({
    date: row.date,
    medication: row.fertility_medication,
    dose: row.fertility_medication_dose,
  }));
}

export type LogDailySymptomsPayload = {
  date: string;
  symptoms: string[];
  symptomSeverity?: Record<string, number>;
  isPeriod: boolean | null;
  /** Whether this date is the first day of a new period streak — only meaningful when isPeriod is true. Feeds HealthKit's HKMenstrualCycleStart metadata. */
  isPeriodStart?: boolean;
  flowIntensity?: string | null;
  moods?: string[];
  notes?: string;
  cervicalDischarge?: string | null;
  exerciseTypes?: string[];
  exerciseMinutes?: number | null;
  waterIntake?: number | null;
  selfLoveTags?: string[];
  selfLoveOther?: string;
  sleepQuality?: string[];
  sleepMinutes?: number | null;
  disruptors?: string[];
  sexActivity?: string[];
  contraception?: string[];
  /**
   * TTC biomarkers. Unlike the fields above, these are *omitted* from the
   * write when left undefined rather than written as null — callers that know
   * nothing about fertility (the period-calendar save, any non-TTC save) must
   * not silently wipe a temperature the user logged that morning. Pass an
   * explicit null to clear one.
   */
  bbtCelsius?: number | null;
  opkResult?: OpkResult | null;
  nsaidTaken?: boolean | null;
};

/** Mirrors logDailySymptoms — same table, same upsert conflict key. */
export async function logDailySymptoms(
  payload: LogDailySymptomsPayload
): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  const { error } = await supabase.from('daily_logs').upsert(
    {
      user_id: user.id,
      ...(payload.bbtCelsius !== undefined ? { bbt_celsius: payload.bbtCelsius } : {}),
      ...(payload.opkResult !== undefined ? { opk_result: payload.opkResult } : {}),
      ...(payload.nsaidTaken !== undefined ? { nsaid_taken: payload.nsaidTaken } : {}),
      date: payload.date,
      symptoms: payload.symptoms,
      symptom_severity: payload.symptomSeverity || {},
      is_period: payload.isPeriod,
      flow_intensity: payload.flowIntensity || null,
      moods: payload.moods || [],
      notes: payload.notes || '',
      cervical_discharge: payload.cervicalDischarge || null,
      exercise_types: payload.exerciseTypes || [],
      exercise_minutes: payload.exerciseMinutes || null,
      water_intake: payload.waterIntake || 0,
      self_love_tags: payload.selfLoveTags || [],
      self_love_other: payload.selfLoveOther || '',
      sleep_quality: payload.sleepQuality || [],
      sleep_minutes: payload.sleepMinutes || null,
      disruptors: payload.disruptors || [],
      sex_activity: payload.sexActivity || [],
      contraception: payload.contraception || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id, date' }
  );

  if (error) return { success: false, error: error.message };

  // Fire-and-forget — never blocks or fails the tracker save the user is
  // actually looking at (see writeHealthData).
  writeHealthData({
    date: payload.date,
    bbtCelsius: payload.bbtCelsius,
    isPeriod: payload.isPeriod,
    isPeriodStart: payload.isPeriodStart,
    flowIntensity: payload.flowIntensity as FlowIntensity | null,
  }).catch((err) => console.error('[tracker] health write-back failed:', err));

  return { success: true };
}

/**
 * Quick-log entry point for TTC signals from Home's quick-log sheet. Unlike
 * `logDailySymptoms` — which always writes symptoms/moods/etc. as a full-day
 * form submit, by design, for the Tracker screen — this only ever touches the
 * TTC columns actually passed in. Supabase's upsert only sets the columns
 * present in the payload (ON CONFLICT DO UPDATE SET is scoped to them), so an
 * existing day's symptoms/period/mood data is left untouched, and a
 * brand-new day falls back to the table's own column defaults for everything
 * else.
 */
export async function logTtcQuickEntry(payload: {
  date: string;
  bbtCelsius?: number | null;
  opkResult?: OpkResult | null;
  nsaidTaken?: boolean | null;
  /** Ovulation-induction medication (e.g. Letrozole, Clomiphene), if any was taken this day. */
  fertilityMedication?: string | null;
  fertilityMedicationDose?: string | null;
  /** Graded LH strip reading — separate table (see lh_readings), not daily_logs. */
  lhBand?: {
    bandLevel: number;
    kitStripNumber?: number | null;
    /** Current cycle's start date, to compute cycle_day at write time. */
    cycleStart?: string | null;
  } | null;
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  const { error } = await supabase.from('daily_logs').upsert(
    {
      user_id: user.id,
      date: payload.date,
      ...(payload.bbtCelsius !== undefined ? { bbt_celsius: payload.bbtCelsius } : {}),
      // Auto-captured at save time rather than a manual time picker — she's
      // logging in the moment in the vast majority of real cases, and this
      // is what the exclusion check needs (a reading far from her usual
      // wake time this cycle is dropped), not a separate UI.
      ...(payload.bbtCelsius !== undefined ? { bbt_wake_time: new Date().toISOString() } : {}),
      ...(payload.opkResult !== undefined ? { opk_result: payload.opkResult } : {}),
      ...(payload.nsaidTaken !== undefined ? { nsaid_taken: payload.nsaidTaken } : {}),
      ...(payload.fertilityMedication !== undefined ? { fertility_medication: payload.fertilityMedication } : {}),
      ...(payload.fertilityMedicationDose !== undefined ? { fertility_medication_dose: payload.fertilityMedicationDose } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id, date' }
  );

  if (error) return { success: false, error: error.message };

  if (payload.bbtCelsius !== undefined && payload.bbtCelsius !== null) {
    // Fire-and-forget — never blocks or fails the quick-log the user is
    // actually looking at (see writeHealthData).
    writeHealthData({ date: payload.date, bbtCelsius: payload.bbtCelsius }).catch((err) =>
      console.error('[tracker] health write-back failed:', err)
    );
  }

  if (payload.lhBand) {
    const cycleDay = payload.lhBand.cycleStart
      ? Math.max(1, daysBetween(parseLocalDate(payload.lhBand.cycleStart), parseLocalDate(payload.date)) + 1)
      : null;

    // surge_flag is left at its column default here, not computed at write
    // time — the engine (detectOvulation) recomputes surge status live from
    // band_level against her rolling baseline every time it runs, the same
    // way BBT/thermal-shift detection already works. Pre-baking it here
    // would need a full history fetch just to write one reading, and risks
    // going stale if her baseline shifts later.
    const { error: lhError } = await supabase.from('lh_readings').upsert(
      {
        user_id: user.id,
        date: payload.date,
        test_time: new Date().toISOString(),
        cycle_day: cycleDay,
        band_level: payload.lhBand.bandLevel,
        kit_strip_number: payload.lhBand.kitStripNumber ?? null,
      },
      { onConflict: 'user_id, date' }
    );
    if (lhError) return { success: false, error: lhError.message };
  }

  return { success: true };
}

/**
 * Records the one-tap "did the predicted date land about right?" response
 * shown when a genuinely new period start is logged. `daysOff` is signed:
 * negative means the period arrived early, positive means it was late.
 */
export async function savePeriodPredictionFeedback(payload: {
  periodStartDate: string;
  predictedDate: string | null;
  daysOff: number | null;
  wasAccurate: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  const { error } = await supabase.from('period_prediction_feedback').insert({
    user_id: user.id,
    period_start_date: payload.periodStartDate,
    predicted_date: payload.predictedDate,
    days_off: payload.daysOff,
    was_accurate: payload.wasAccurate,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Mirrors updateLastPeriodDate. */
export async function updateLastPeriodDate(
  newDate: string
): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Authentication required' };

  const { error } = await supabase
    .from('user_cycle_settings')
    .update({ last_period_start: newDate, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
