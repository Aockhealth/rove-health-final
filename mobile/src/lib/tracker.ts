import { supabase } from './supabase';
import type { CycleSettings } from '@shared/cycle/phase';

const LOG_WINDOW_DAYS = 90;

export type TrackerLog = {
  date: string;
  is_period: boolean | null;
  flow_intensity: string | null;
  symptoms: string[];
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
  notes: string;
};

export type TrackerData = {
  settings: CycleSettings;
  monthLogs: Record<string, TrackerLog>;
  hasSettings: boolean;
};

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

  const [settingsResult, logsResult] = await Promise.all([
    supabase.from('user_cycle_settings').select('*').eq('user_id', user.id).single(),
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', formatDate(pastDate))
      .order('date', { ascending: false }),
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

export type LogDailySymptomsPayload = {
  date: string;
  symptoms: string[];
  isPeriod: boolean | null;
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
      date: payload.date,
      symptoms: payload.symptoms,
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
