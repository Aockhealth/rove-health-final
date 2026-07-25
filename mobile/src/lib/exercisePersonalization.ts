// Personalizes the Plan → Move tab's per-phase exercise blueprint using each
// person's activity level and fitness goal, instead of showing every user
// the exact same duration/intensity/card order for a given cycle phase.

type BestItem = { title: string; desc: string; time: string };

// Scales the phase's base duration — a beginner shouldn't be handed the same
// 60-minute Ovulatory session as someone who works out daily.
const DURATION_MULTIPLIER: Record<string, number> = {
  Sedentary: 0.6,
  Active: 1.0,
  'Highly Active': 1.3,
};

export function scaleDurationForActivity(baseTime: string, activityLevel?: string | null): string {
  const base = parseFloat(baseTime);
  if (!base) return baseTime;
  const multiplier = DURATION_MULTIPLIER[activityLevel as string] ?? DURATION_MULTIPLIER.Active;
  const scaled = Math.max(10, Math.round((base * multiplier) / 5) * 5);
  return String(scaled);
}

// Intensity ranking used to cap (never raise) what's recommended.
const INTENSITY_RANK: Record<string, number> = { Low: 1, Moderate: 2, 'Mod-High': 3, High: 4 };
const RANK_TO_INTENSITY = ['Low', 'Moderate', 'Mod-High', 'High'];
// The workout "type" that matches each capped intensity rank, so a capped
// session doesn't still get labeled "HIIT" once it's no longer high intensity.
const RANK_TO_TYPE = ['Restorative movement', 'Cardio', 'Strength', 'HIIT'];

// A Sedentary beginner never gets pushed past Moderate, regardless of what a
// given phase would otherwise recommend (e.g. Ovulatory's default "High").
// Active/Highly Active pass through unchanged — the blueprint's defaults
// already assume a reasonably fit baseline.
export function capIntensityForActivity(
  intensity: string,
  type: string,
  activityLevel?: string | null
): { intensity: string; type: string } {
  if (activityLevel !== 'Sedentary') {
    return { intensity, type };
  }
  const rank = INTENSITY_RANK[intensity] || 2;
  const cappedRank = Math.min(rank, INTENSITY_RANK.Moderate);
  if (cappedRank === rank) {
    return { intensity, type };
  }
  return { intensity: RANK_TO_INTENSITY[cappedRank - 1], type: RANK_TO_TYPE[cappedRank - 1] };
}

function classifyBestItem(title: string): 'cardio' | 'strength' | 'other' {
  const t = title.toLowerCase();
  if (t.includes('hiit') || t.includes('cardio') || t.includes('run') || t.includes('spin') || t.includes('hike')) {
    return 'cardio';
  }
  if (t.includes('lift') || t.includes('strength') || t.includes('weight')) {
    return 'strength';
  }
  return 'other';
}

// Same 4 cards every phase already has — just reprioritized so someone whose
// goal is "Build Muscle" sees Strength first, and "Fat Loss" sees Cardio
// first, instead of everyone getting the same fixed order.
export function reorderBestByGoal(best: BestItem[], fitnessGoal?: string | null): BestItem[] {
  if (!best || best.length === 0) return best;
  const preferred = fitnessGoal === 'muscle_gain' ? 'strength' : fitnessGoal === 'weight_loss' ? 'cardio' : null;
  if (!preferred) return best;

  // Stable partition: preferred-category items first, original relative order
  // preserved within each group.
  const matched = best.filter((item) => classifyBestItem(item.title) === preferred);
  const rest = best.filter((item) => classifyBestItem(item.title) !== preferred);
  return [...matched, ...rest];
}

// A rough, clearly-labeled guide (not a clinical prescription) for how many
// active days/week supports the pace someone chose in the Nourish tab's goal
// setup, floored/ceilinged by their actual activity level so it never jumps
// a beginner straight to a 6-day split.
const ACTIVITY_MAX_DAYS: Record<string, number> = {
  Sedentary: 4,
  Active: 6,
  'Highly Active': 7,
};

// Maps the profile's activity level / fitness goal to the descriptive
// strings Rove Coach's AI prompt expects — used so the AI-generated workout
// is actually built from the person's real profile instead of the fixed
// "Intermediate" / focus-area-as-goal values the builder previously sent.
export function mapActivityToFitnessLevel(activityLevel?: string | null): string {
  if (activityLevel === 'Sedentary') return 'Beginner';
  if (activityLevel === 'Highly Active') return 'Advanced';
  return 'Intermediate';
}

export function mapGoalToCoachGoal(fitnessGoal?: string | null): string {
  if (fitnessGoal === 'weight_loss') return 'Fat Loss';
  if (fitnessGoal === 'muscle_gain') return 'Build Muscle';
  return 'General Fitness';
}

export function recommendActiveDaysPerWeek(
  fitnessGoal?: string | null,
  activityLevel?: string | null,
  weeklyRateKg?: number | null,
  maxSafeWeeklyRateKg = 1.0
): number {
  const cap = ACTIVITY_MAX_DAYS[activityLevel as string] ?? ACTIVITY_MAX_DAYS.Active;

  if (fitnessGoal === 'weight_loss') {
    const paceRatio = Math.min(Math.max((weeklyRateKg || 0) / maxSafeWeeklyRateKg, 0), 1);
    const days = Math.round(3 + paceRatio * 3); // 3 (gentle pace) up to 6 (max safe pace)
    return Math.min(days, cap);
  }

  if (fitnessGoal === 'muscle_gain') {
    return Math.min(5, cap); // strength work needs recovery days between sessions
  }

  return Math.min(4, cap); // maintenance / general health baseline
}
