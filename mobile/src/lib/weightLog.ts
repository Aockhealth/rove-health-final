import { supabase } from './supabase';

/**
 * Weight history — weight_logs is the source of truth for the trend chart.
 * Before this table existed, the app kept exactly one weight number per user
 * (user_lifestyle.weight_kg / user_weight_goals.current_weight_kg,
 * overwritten on every log), so there was nothing to draw a trend from.
 *
 * @module lib/weightLog
 */

export type WeightLogPoint = { date: string; weightKg: number };

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Records one day's weigh-in in weight_logs, and keeps
 * user_lifestyle.weight_kg / user_weight_goals.current_weight_kg in sync —
 * every other screen in the app still reads those two fields as "her current
 * weight," so a log here has to reach them too, not just the history table.
 *
 * onConflict: 'user_id, date' — a second correction logged the same day
 * overwrites that day's entry rather than duplicating it. The
 * user_weight_goals update is a no-op when she has no goal row yet;
 * current_weight_kg on a goal is only meaningful once a goal exists.
 */
export async function writeWeightLog(
  weightKg: number,
  date: string = todayDateStr()
): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error: logError } = await supabase.from('weight_logs').upsert(
    { user_id: user.id, date, weight_kg: weightKg, updated_at: new Date().toISOString() },
    { onConflict: 'user_id, date' }
  );
  if (logError) return { success: false, error: `weight_logs save failed: ${logError.message}` };

  await supabase
    .from('user_lifestyle')
    .upsert(
      { user_id: user.id, weight_kg: weightKg, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  await supabase
    .from('user_weight_goals')
    .update({ current_weight_kg: weightKg, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  return { success: true };
}

/** The fast "log today's weight" entry point — just today's date, no goal fields required. */
export async function logWeightToday(weightKg: number): Promise<{ success: boolean; error?: string }> {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg >= 500) {
    return { success: false, error: 'Enter a valid weight' };
  }
  return writeWeightLog(weightKg);
}

/** Her active weight goal target, if she has set one — null otherwise. Used to draw the trend chart's reference line. */
export async function fetchWeightGoalTarget(): Promise<number | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_weight_goals')
    .select('target_weight_kg')
    .eq('user_id', user.id)
    .maybeSingle();

  return typeof data?.target_weight_kg === 'number' ? data.target_weight_kg : null;
}

/** Her weigh-ins over the last `days` days, oldest first — what a trend chart plots left-to-right. */
export async function fetchWeightHistory(days: number = 90): Promise<WeightLogPoint[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-${String(since.getDate()).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('weight_logs')
    .select('date, weight_kg')
    .eq('user_id', user.id)
    .gte('date', sinceStr)
    .order('date', { ascending: true });

  if (error || !data) return [];
  return data.map((r: any) => ({ date: r.date, weightKg: Number(r.weight_kg) }));
}
