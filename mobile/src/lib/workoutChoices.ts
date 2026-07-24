import { supabase } from './supabase';

// Rove Coach personalization source — mirrors foodChoices.ts's pattern for
// Rove Chef, but reuses the existing `workout_sessions` table (already
// populated by ExerciseBuilder.saveSession on "Finish & Save Workout")
// instead of a dedicated shown/chosen log, since Coach only ever generates
// one plan at a time rather than a menu of options to pick from.

type WorkoutSessionRow = {
  phase: string;
  setting: string | null;
  focus: string | null;
  plan_title: string | null;
  plan_intensity: string | null;
  exercises_total: number | null;
  exercises_completed: number | null;
  date: string;
};

export type WorkoutChoiceContext = {
  preferenceSummary: string;
  recentChosen: string[];
};

/**
 * Builds the personalization hints for the Rove Coach prompt from the user's
 * own completed-session history. All heuristics are deliberately simple and
 * readable — this is a pattern sketch, not a model.
 */
export async function fetchWorkoutChoiceContext(): Promise<WorkoutChoiceContext> {
  const empty: WorkoutChoiceContext = { preferenceSummary: '', recentChosen: [] };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('phase, setting, focus, plan_title, plan_intensity, exercises_total, exercises_completed, date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) return empty;
  const rows = data as WorkoutSessionRow[];

  // Do-not-repeat list — most recent distinct plans, so a fresh generate
  // doesn't hand back something she just did.
  const recentChosen = Array.from(
    new Set(rows.map((r) => r.plan_title || r.focus).filter((v): v is string => Boolean(v)))
  ).slice(0, 5);

  if (rows.length < 3) {
    return { preferenceSummary: '', recentChosen };
  }

  const parts: string[] = [];

  const countBy = (key: 'focus' | 'setting') => {
    const counts = new Map<string, number>();
    rows.forEach((r) => {
      const val = r[key];
      if (!val) return;
      counts.set(val, (counts.get(val) || 0) + 1);
    });
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    return top && top[1] / rows.length >= 0.5 ? top[0] : null;
  };

  const topFocus = countBy('focus');
  const topSetting = countBy('setting');
  if (topFocus && topSetting) {
    parts.push(`tends to pick ${topFocus} at ${topSetting}`);
  } else if (topFocus) {
    parts.push(`tends to pick ${topFocus}`);
  } else if (topSetting) {
    parts.push(`usually trains at ${topSetting}`);
  }

  const completionRates = rows
    .filter((r) => r.exercises_total)
    .map((r) => (r.exercises_completed || 0) / (r.exercises_total as number));
  if (completionRates.length > 0) {
    const avgCompletion = Math.round(
      (completionRates.reduce((a, b) => a + b, 0) / completionRates.length) * 100
    );
    parts.push(`usually completes ~${avgCompletion}% of the set`);
  }

  return {
    preferenceSummary: parts.join('; '),
    recentChosen,
  };
}
