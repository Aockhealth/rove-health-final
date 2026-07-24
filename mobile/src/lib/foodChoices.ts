import { supabase } from './supabase';

// Chef v2 "pick your plate" — logging + personalization source.
//
// Architecture note: the AI options endpoint on rovehealth.in is called via
// plain fetch with no Supabase auth cookie, so the server cannot read this
// table for the calling user. Instead the mobile app (RLS-scoped) reads its
// own history here and passes the derived hints (preferenceSummary /
// recentChosen / recentShown) in the request body — same pattern the v1
// endpoint already used for recentOutputSignatures.

export type ChefOption = {
  name: string;
  description: string;
  prep_time_minutes: number;
  key_ingredients: string[];
  why: string;
  serving_style: 'warm' | 'room' | 'cold';
};

type FoodChoiceRow = {
  phase: string;
  meal_type: string;
  options_shown: ChefOption[];
  chosen_name: string | null;
  created_at: string;
};

export async function logFoodChoice(input: {
  phase: string;
  mealType: string;
  optionsShown: ChefOption[];
  chosenName: string | null; // null = regenerated without picking
  chosenIndex: number | null;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('user_food_choices').insert({
    user_id: user.id,
    phase: input.phase,
    meal_type: input.mealType,
    options_shown: input.optionsShown,
    chosen_name: input.chosenName,
    chosen_index: input.chosenIndex,
  });
  if (error) console.error('[foodChoices] Failed to log choice:', error.message);
}

export type FoodChoiceContext = {
  preferenceSummary: string;
  recentChosen: string[];
  recentShown: string[];
};

/**
 * Builds the personalization hints for the options prompt from the user's
 * own choice history. All heuristics are deliberately simple and readable —
 * this is a taste sketch, not a model.
 */
export async function fetchFoodChoiceContext(mealType: string): Promise<FoodChoiceContext> {
  const empty: FoodChoiceContext = { preferenceSummary: '', recentChosen: [], recentShown: [] };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data, error } = await supabase
    .from('user_food_choices')
    .select('phase, meal_type, options_shown, chosen_name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return empty;
  const rows = data as FoodChoiceRow[];

  // Do-not-repeat lists. Chosen dishes matter across all meal types (she just
  // ate it); shown-but-not-chosen only suppresses within the same meal type
  // and only for the last few generations.
  const recentChosen = Array.from(
    new Set(rows.filter((r) => r.chosen_name).map((r) => r.chosen_name as string))
  ).slice(0, 8);

  const recentShown = Array.from(
    new Set(
      rows
        .filter((r) => r.meal_type === mealType)
        .slice(0, 3)
        .flatMap((r) => (Array.isArray(r.options_shown) ? r.options_shown.map((o) => o.name) : []))
    )
  ).slice(0, 12);

  // Taste sketch from chosen options.
  const chosenOptions: ChefOption[] = rows
    .filter((r) => r.chosen_name && Array.isArray(r.options_shown))
    .map((r) => r.options_shown.find((o) => o.name === r.chosen_name))
    .filter((o): o is ChefOption => Boolean(o));

  if (chosenOptions.length < 3) {
    return { preferenceSummary: '', recentChosen, recentShown };
  }

  const parts: string[] = [];

  const ingredientCounts = new Map<string, number>();
  chosenOptions.forEach((o) =>
    (o.key_ingredients || []).forEach((ing) => {
      const key = ing.trim().toLowerCase();
      ingredientCounts.set(key, (ingredientCounts.get(key) || 0) + 1);
    })
  );
  const topIngredients = Array.from(ingredientCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ing]) => ing);
  if (topIngredients.length > 0) {
    parts.push(`often picks dishes with ${topIngredients.join(', ')}`);
  }

  const quickPicks = chosenOptions.filter((o) => o.prep_time_minutes <= 10).length;
  if (quickPicks / chosenOptions.length >= 0.7) {
    parts.push('prefers quick options (10 minutes or under)');
  }

  const warmPicks = chosenOptions.filter((o) => o.serving_style === 'warm').length;
  if (warmPicks / chosenOptions.length >= 0.7) {
    parts.push('leans toward warm dishes');
  }

  return {
    preferenceSummary: parts.join('; '),
    recentChosen,
    recentShown,
  };
}
