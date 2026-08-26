/**
 * Correlates the ingredients she's actually chosen in Rove Chef against her
 * own logged symptom severity — the piece the existing taste-preference loop
 * (see foodChoices.ts) doesn't cover. `fetchFoodChoiceContext` already tells
 * the AI what she *likes*; this tells it what seems to actually *help*, so
 * `preferenceSummary` can nudge future options toward ingredients that
 * correlate with milder days for her specifically, not just her habits.
 *
 * Deliberately simple and readable, same spirit as insights.ts's
 * computeSymptomCorrelations: a difference in her own averages, not a model.
 *
 * @module mobile/src/lib/foodOutcomeCorrelation
 */

export interface ChosenDish {
  date: string;
  ingredients: string[];
}

export interface IngredientOutcome {
  ingredient: string;
  withCount: number;
  withoutCount: number;
  avgSeverityWith: number;
  avgSeverityWithout: number;
  /** avgSeverityWithout - avgSeverityWith — positive means "milder with it". */
  diff: number;
}

/** Need this many rated days on each side before a comparison means anything. */
const MIN_SAMPLE_PER_SIDE = 3;
/** On a 1-5 severity scale, half a point is a real gap, not day-to-day noise. */
const MIN_SEVERITY_DIFF = 0.5;
/** How many distinct days an ingredient must have been chosen on to even consider it. */
const MIN_INGREDIENT_OCCURRENCES = 3;

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * Returns ingredients where days she chose a dish containing that ingredient
 * had a meaningfully lower average logged symptom severity than days she
 * didn't — sorted strongest-first. Only ever reports a *milder* association;
 * an ingredient correlating with worse days isn't useful to push harder on,
 * so those are filtered out rather than surfaced.
 */
export function correlateIngredientsWithSeverity(
  choices: ChosenDish[],
  severityByDate: Record<string, number | null>
): IngredientOutcome[] {
  const ratedUniverse = Object.entries(severityByDate)
    .filter((entry): entry is [string, number] => entry[1] !== null)
    .map(([date]) => date);
  const ratedSet = new Set(ratedUniverse);

  const datesByIngredient = new Map<string, Set<string>>();
  for (const choice of choices) {
    if (!ratedSet.has(choice.date)) continue;
    for (const raw of choice.ingredients) {
      const ingredient = raw.trim().toLowerCase();
      if (!ingredient) continue;
      if (!datesByIngredient.has(ingredient)) datesByIngredient.set(ingredient, new Set());
      datesByIngredient.get(ingredient)!.add(choice.date);
    }
  }

  const results: IngredientOutcome[] = [];

  for (const [ingredient, withDatesSet] of datesByIngredient) {
    if (withDatesSet.size < MIN_INGREDIENT_OCCURRENCES) continue;

    const withSeverities: number[] = [];
    const withoutSeverities: number[] = [];
    for (const date of ratedUniverse) {
      const severity = severityByDate[date] as number;
      if (withDatesSet.has(date)) withSeverities.push(severity);
      else withoutSeverities.push(severity);
    }

    if (withSeverities.length < MIN_SAMPLE_PER_SIDE || withoutSeverities.length < MIN_SAMPLE_PER_SIDE) continue;

    const avgWith = mean(withSeverities);
    const avgWithout = mean(withoutSeverities);
    const diff = avgWithout - avgWith;

    if (diff >= MIN_SEVERITY_DIFF) {
      results.push({
        ingredient,
        withCount: withSeverities.length,
        withoutCount: withoutSeverities.length,
        avgSeverityWith: Math.round(avgWith * 10) / 10,
        avgSeverityWithout: Math.round(avgWithout * 10) / 10,
        diff: Math.round(diff * 10) / 10,
      });
    }
  }

  return results.sort((a, b) => b.diff - a.diff);
}

/** Turns the strongest finding into the same kind of short clause
 * fetchFoodChoiceContext already builds for taste preferences. */
export function describeTopOutcome(outcomes: IngredientOutcome[]): string | null {
  if (outcomes.length === 0) return null;
  const top = outcomes[0];
  return `tends to log milder symptoms on days she's chosen dishes with ${top.ingredient}`;
}
