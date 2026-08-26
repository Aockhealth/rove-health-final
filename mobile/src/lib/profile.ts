import { supabase } from './supabase';
import {
  calculatePhase,
  deriveObservedCycleLength,
  formatDate,
  getRelevantPeriodStart,
  type CycleSettings,
  type DailyLog,
} from '@shared/cycle/phase';

// Wide enough to hold CYCLE_HISTORY_LOOKBACK cycles even at a long cycle
// length — the suggestion below is only as good as the history behind it.
const LOG_WINDOW_DAYS = 270;

export type ProfileFormData = {
  full_name: string;
  tracker_mode: string;
  goals: string[];
  conditions: string[];
  weight: number;
  height: number;
  activity_level: string;
  diet_preference: string;
  is_irregular: boolean;
  phone_number: string;
};

export type ProfileCycleData = {
  last_period_start: string;
  cycle_length_days: number;
  period_length_days: number;
  /**
   * The cycle length her logged periods actually show, when it differs from
   * the stored `cycle_length_days` by enough to be worth mentioning. null when
   * there isn't enough history, or when her setting already matches.
   *
   * The engine already predicts from this (see resolveCycleSettings); this
   * field exists so Profile can offer to bring the number she typed into line
   * with it, rather than the app silently disagreeing with its own settings
   * screen.
   */
  observedCycleLength: number | null;
};

export type ProfilePageData = {
  user: { id: string; email: string };
  formData: ProfileFormData;
  cycleData: ProfileCycleData;
  smartPhase: string;
};

export async function fetchProfilePageData(): Promise<ProfilePageData | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

  const [profileResult, onboardingResult, lifestyleResult, cycleSettingsResult, logsResult] =
    await Promise.all([
      supabase.from('profiles').select('full_name, phone_number').eq('id', user.id).single(),
      supabase
        .from('user_onboarding')
        .select('tracker_mode, goals, conditions')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('user_lifestyle')
        .select('weight_kg, height_cm, activity_level, diet_preference')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('user_cycle_settings')
        .select('last_period_start, cycle_length_days, period_length_days, is_irregular')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('daily_logs')
        .select('date, is_period')
        .eq('user_id', user.id)
        .gte('date', formatDate(pastDate)),
    ]);

  const profile = profileResult.data;
  const onboarding = onboardingResult.data;
  const lifestyle = lifestyleResult.data;
  const cycleSettings = cycleSettingsResult.data;
  const logs = logsResult.data || [];

  const monthLogs: Record<string, DailyLog> = {};
  logs.forEach((l: { date: string; is_period: boolean }) => {
    monthLogs[l.date] = { date: l.date, is_period: l.is_period };
  });

  let smartPhase = 'Menstrual';
  // Prefer the streak-corrected start over the raw stored column: logged period
  // days (even with spotty gaps) are a more reliable anchor than whatever was
  // last persisted, which can go stale if it was written before a gap-tolerance
  // fix (see shared/cycle/phase.ts findStreakStart) or before the user's most
  // recent edits synced back to user_cycle_settings.
  let resolvedLastPeriodStart = cycleSettings?.last_period_start || '';
  if (cycleSettings?.last_period_start) {
    const settings: CycleSettings = {
      last_period_start: cycleSettings.last_period_start,
      cycle_length_days: cycleSettings.cycle_length_days || 28,
      period_length_days: cycleSettings.period_length_days || 5,
    };
    const result = calculatePhase(new Date(), settings, monthLogs);
    smartPhase = result.phase || 'Menstrual';

    const { start } = getRelevantPeriodStart(new Date(), settings, monthLogs);
    if (start) resolvedLastPeriodStart = start;
  }

  // What her logs say her cycle actually is. Only surfaced when it differs
  // from the stored number by more than a day — a one-day drift is normal
  // month-to-month wobble, not something worth prompting about.
  const storedCycleLength = cycleSettings?.cycle_length_days || 28;
  const derived = deriveObservedCycleLength(new Date(), monthLogs);
  const observedCycleLength =
    derived !== null && Math.abs(derived - storedCycleLength) > 1 ? derived : null;

  return {
    user: { id: user.id, email: user.email || '' },
    formData: {
      full_name:
        profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
      tracker_mode: onboarding?.tracker_mode || 'menstruation',
      goals: Array.isArray(onboarding?.goals) ? onboarding.goals : [],
      conditions: Array.isArray(onboarding?.conditions) ? onboarding.conditions : [],
      weight: lifestyle?.weight_kg || 0,
      height: lifestyle?.height_cm || 0,
      activity_level: lifestyle?.activity_level || 'moderate',
      diet_preference: lifestyle?.diet_preference || 'non_veg',
      is_irregular: cycleSettings?.is_irregular || false,
      phone_number: profile?.phone_number || '',
    },
    cycleData: {
      last_period_start: resolvedLastPeriodStart,
      cycle_length_days: storedCycleLength,
      period_length_days: cycleSettings?.period_length_days || 5,
      observedCycleLength,
    },
    smartPhase,
  };
}

export async function updateUserProfile(data: {
  full_name?: string;
  tracker_mode: string;
  goals: string[];
  conditions: string[];
  weight: number;
  height: number;
  activity_level: string;
  diet_preference: string;
}): Promise<{ success?: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  let profileError = null;
  if (data.full_name !== undefined) {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: data.full_name })
      .eq('id', user.id);
    profileError = error;
  }

  const { error: obError } = await supabase
    .from('user_onboarding')
    .update({
      tracker_mode: data.tracker_mode,
      goals: data.goals,
      conditions: data.conditions,
    })
    .eq('user_id', user.id);

  const { error: lsError } = await supabase.from('user_lifestyle').upsert(
    {
      user_id: user.id,
      weight_kg: data.weight,
      height_cm: data.height,
      activity_level: data.activity_level,
      diet_preference: data.diet_preference,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (profileError || obError || lsError) {
    return {
      error: `Failed to save: ${profileError?.message || ''} ${obError?.message || ''} ${lsError?.message || ''}`,
    };
  }

  return { success: true };
}

export async function updateCycleSettings(data: {
  last_period_start: string;
  cycle_length_days: number;
  period_length_days: number;
  is_irregular: boolean;
}): Promise<{ success?: boolean; error?: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.last_period_start)) {
    return { error: 'Invalid date format' };
  }
  if (data.period_length_days < 1 || data.period_length_days > 15) {
    return { error: 'Period length must be between 1 and 15 days' };
  }
  if (data.cycle_length_days < 15 || data.cycle_length_days > 100) {
    return { error: 'Cycle length must be between 15 and 100 days' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required' };

  const { error } = await supabase
    .from('user_cycle_settings')
    .update({
      last_period_start: data.last_period_start,
      cycle_length_days: data.cycle_length_days,
      period_length_days: data.period_length_days,
      is_irregular: data.is_irregular,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function requestPasswordReset(email: string): Promise<{ success?: boolean; error?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'rovehealth://reset-password',
  });
  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Verifies the numeric code from the password-reset email (same 'Token'
 * that requestPasswordReset's underlying Supabase call generates — the
 * redirectTo link and this code are two views of the same recovery
 * request). A successful verify re-establishes her session, which is what
 * lets updatePassword below succeed without her having ever left the app.
 */
export async function verifyPasswordResetOtp(email: string, token: string): Promise<{ success?: boolean; error?: string }> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(newPassword: string): Promise<{ success?: boolean; error?: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateContactInfo(
  email: string,
  phone: string
): Promise<{ success?: boolean; error?: string }> {
  const { error: authError } = await supabase.auth.updateUser({ email });
  if (authError) return { error: authError.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ phone_number: phone })
      .eq('id', user.id);
    if (profileError) return { error: profileError.message };
  }

  return { success: true };
}

export async function deleteUserAccount(): Promise<{ success?: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const userId = user.id;

  const deletions = await Promise.all([
    supabase.from('daily_logs').delete().eq('user_id', userId),
    supabase.from('user_onboarding').delete().eq('user_id', userId),
    supabase.from('user_lifestyle').delete().eq('user_id', userId),
    supabase.from('user_weight_goals').delete().eq('user_id', userId),
    supabase.from('user_cycle_settings').delete().eq('user_id', userId),
    supabase.from('ai_cache_keys').delete().eq('user_id', userId),
    supabase.from('onboarding_events').delete().eq('user_id', userId),
    // These five don't have an RLS delete policy for lh_readings/ovulation_estimates
    // (view+insert+update only), so they're cleaned up by the ON DELETE CASCADE added
    // in 20260824010000_cascade_delete_ttc_tables.sql when the auth user is removed
    // below, not here. lab_results and meal_logs do have a delete policy, so those
    // two are removed proactively for immediate consistency.
    supabase.from('lab_results').delete().eq('user_id', userId),
    supabase.from('meal_logs').delete().eq('user_id', userId),
  ]);

  const errors = deletions.filter((d) => d.error).map((d) => d.error?.message);
  if (errors.length > 0) {
    console.error('[deleteUserAccount] Partial deletion errors:', errors);
  }

  await supabase.from('profiles').delete().eq('id', userId);

  // Removing app data above only deletes rows the user's own session is allowed to
  // touch under RLS. The Auth identity itself (email/password credential, linked
  // Google account) needs the service-role key to remove, so it's done server-side
  // via an edge function — called here, before signOut, while the session is still valid.
  const { error: authDeleteError } = await supabase.functions.invoke('delete-account');
  if (authDeleteError) {
    console.error('[deleteUserAccount] Failed to delete auth identity:', authDeleteError);
    return { error: 'Your data was deleted, but we could not remove your login. Please contact support.' };
  }

  await supabase.auth.signOut();

  return { success: true };
}
