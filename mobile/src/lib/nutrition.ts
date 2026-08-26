/**
 * Actual food logging — pairs with the phase-based macro *targets* already
 * shown on the Plan tab (see MacroFuelGauge, which reads content_library's
 * recommendation, not a record of what she ate). This is the "tracker" half
 * that was missing: log a meal, see today's logged total against the
 * target.
 *
 * @module mobile/src/lib/nutrition
 */
import { supabase } from './supabase';

export interface MealEntry {
  id: string;
  date: string;
  name: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  /** Subset of carbsG. Null if logged before this field existed. */
  sugarG: number | null;
  /** 0-100 glucose=100 scale, null if negligible carbohydrate or logged before this field existed. */
  glycemicIndex: number | null;
  loggedAt: string;
}

export interface DailyMacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
}

function mapRow(row: any): MealEntry {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    sugarG: row.sugar_g ?? null,
    glycemicIndex: row.glycemic_index ?? null,
    loggedAt: row.logged_at,
  };
}

export async function logMeal(entry: {
  date: string;
  name: string;
  calories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  sugarG?: number | null;
  glycemicIndex?: number | null;
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  const { error } = await supabase.from('meal_logs').insert({
    user_id: user.id,
    date: entry.date,
    name: entry.name.trim(),
    calories: entry.calories ?? null,
    protein_g: entry.proteinG ?? null,
    carbs_g: entry.carbsG ?? null,
    fat_g: entry.fatG ?? null,
    sugar_g: entry.sugarG ?? null,
    glycemic_index: entry.glycemicIndex ?? null,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export interface MealMacroEstimate {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  /** 0-100 glucose=100 scale, null if the meal has negligible carbohydrate. */
  glycemicIndex: number | null;
  confidence: 'low' | 'medium' | 'high';
  /** 'cache' = scaled from a prior estimate for this food, no AI call made. */
  source: 'cache' | 'ai';
}

/**
 * Asks the estimate-meal-macros edge function to turn a free-text meal
 * description into a starting calorie/macro guess — she can still edit every
 * field before saving, this just removes the "I have to already know the
 * numbers" barrier to logging. The function keeps a shared cache keyed by
 * food + portion unit, so repeated or rescaled requests ("2 plate dal", "1
 * katori dal" once "1 plate dal" is known) resolve instantly without
 * spending another Gemini call.
 */
export async function estimateMealMacros(
  description: string
): Promise<{ success: true; estimate: MealMacroEstimate } | { success: false; error: string }> {
  const trimmed = description.trim();
  if (!trimmed) return { success: false, error: 'Nothing to estimate' };

  const { data, error } = await supabase.functions.invoke('estimate-meal-macros', {
    body: { description: trimmed },
  });

  if (error) return { success: false, error: error.message };
  if (!data || typeof data.calories !== 'number') {
    return { success: false, error: 'Could not estimate that meal' };
  }

  return {
    success: true,
    estimate: {
      calories: data.calories,
      proteinG: data.proteinG,
      carbsG: data.carbsG,
      fatG: data.fatG,
      sugarG: typeof data.sugarG === 'number' ? data.sugarG : 0,
      glycemicIndex: typeof data.glycemicIndex === 'number' ? data.glycemicIndex : null,
      confidence: data.confidence === 'high' || data.confidence === 'medium' ? data.confidence : 'low',
      source: data.source === 'cache' ? 'cache' : 'ai',
    },
  };
}

export async function deleteMeal(id: string): Promise<boolean> {
  const { error } = await supabase.from('meal_logs').delete().eq('id', id);
  return !error;
}

export async function fetchMealsForDate(date: string): Promise<MealEntry[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('meal_logs')
    .select('id, date, name, calories, protein_g, carbs_g, fat_g, sugar_g, glycemic_index, logged_at')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('logged_at', { ascending: true });

  if (error || !data) return [];
  return data.map(mapRow);
}

export function sumMacroTotals(meals: MealEntry[]): DailyMacroTotals {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      proteinG: acc.proteinG + (m.proteinG ?? 0),
      carbsG: acc.carbsG + (m.carbsG ?? 0),
      fatG: acc.fatG + (m.fatG ?? 0),
      sugarG: acc.sugarG + (m.sugarG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 }
  );
}
