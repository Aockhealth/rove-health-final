// Personalizes the Plan → Nourish calorie target using each person's real
// biometrics instead of one fixed number per cycle phase.

export type ActivityLevel = 'Sedentary' | 'Active' | 'Highly Active';

// Standard Harris-Benedict-style activity multipliers, matched to the three
// tiers offered in the Plan setup wizard (plan/index.tsx step 2).
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  Sedentary: 1.2,
  Active: 1.55,
  'Highly Active': 1.725,
};

// ~7700 kcal is the standard approximation of energy stored per kg of body fat.
const KCAL_PER_KG_BODYWEIGHT = 7700;

// A daily target is never recommended below this, regardless of how large a
// weekly-loss goal someone enters — this app gives wellness guidance, not
// medical supervision, so it shouldn't ever surface an unsafe number.
const MIN_SAFE_CALORIES = 1200;

export function calculateAge(dobString: string | null | undefined): number {
  if (!dobString) return 30; // reasonable default when DOB hasn't been collected
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  return Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
}

// BMI threshold above which Mifflin-St Jeor starts meaningfully overestimating
// energy needs — actual body weight is credited as if it were all
// metabolically active tissue, but fat burns far less at rest than muscle does.
const OBESITY_BMI_THRESHOLD = 30;

// Devine formula (female) — the standard clinical estimate of a healthy
// weight for someone's height, used below only to correct the BMR input,
// not shown to the user as a "target."
function calculateIdealBodyWeightKg(heightCm: number): number {
  const heightInches = heightCm / 2.54;
  const inchesOverFiveFeet = Math.max(0, heightInches - 60);
  return 45.5 + 2.3 * inchesOverFiveFeet;
}

function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// Standard clinical dietetics correction: past the obesity threshold, Mifflin-
// St Jeor is fed an "adjusted" weight (between ideal and actual) instead of
// actual body weight, so it doesn't overcredit excess fat mass as if it burned
// calories the way muscle does. Below the threshold, actual weight is used
// unchanged — the correction only matters once the gap is large.
function getEffectiveWeightForBMR(weightKg: number, heightCm: number): number {
  const bmi = calculateBMI(weightKg, heightCm);
  if (bmi < OBESITY_BMI_THRESHOLD) {
    return weightKg;
  }
  const idealWeight = calculateIdealBodyWeightKg(heightCm);
  return idealWeight + 0.25 * (weightKg - idealWeight);
}

// BMR (Mifflin-St Jeor, female) + activity + cycle-phase adjustment.
export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  phase: string,
  activityLevel?: string | null
): number {
  const effectiveWeight = getEffectiveWeightForBMR(weight, height);
  const bmr = 10 * effectiveWeight + 6.25 * height - 5 * age - 161;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as ActivityLevel] ?? ACTIVITY_MULTIPLIERS.Active;
  let tdee = bmr * multiplier;

  // Luteal phase increases resting metabolic rate by roughly 100-300 kcal.
  if (phase === 'Luteal') {
    tdee += 150;
  }

  return tdee;
}

// A lean muscle-gain surplus is capped far lower than a fat-loss/gain deficit
// would be: muscle synthesis is rate-limited, so a large surplus just adds fat
// rather than speeding up the gain — 500 kcal/day is standard lean-bulk guidance.
const MAX_LEAN_BULK_SURPLUS = 500;
// Realistic muscle-gain pace ceiling (kg/week) — much slower than a fat-loss
// pace, so it isn't run through the same 7700 kcal/kg fat approximation unbounded.
const MAX_MUSCLE_GAIN_RATE_KG = 0.5;

// Shifts a maintenance figure based on the person's actual stated goal, not
// just whatever numbers happen to be sitting in the target-weight field —
// so "Maintenance" always means maintenance, and "Build Muscle" gets a
// realistic lean-bulk surplus instead of being treated like generic weight gain.
export function applyGoalAdjustment(
  maintenanceCalories: number,
  fitnessGoal?: string | null,
  weeklyRateKg?: number | null
): number {
  if (fitnessGoal === 'weight_loss') {
    const rate = Math.abs(weeklyRateKg || 0);
    if (rate === 0) return Math.round(maintenanceCalories);
    const dailyDeficit = (rate * KCAL_PER_KG_BODYWEIGHT) / 7;
    return Math.round(Math.max(maintenanceCalories - dailyDeficit, MIN_SAFE_CALORIES));
  }

  if (fitnessGoal === 'muscle_gain') {
    const rate = Math.min(Math.abs(weeklyRateKg || 0) || 0.25, MAX_MUSCLE_GAIN_RATE_KG);
    const dailySurplus = Math.min((rate * KCAL_PER_KG_BODYWEIGHT) / 7, MAX_LEAN_BULK_SURPLUS);
    return Math.round(maintenanceCalories + dailySurplus);
  }

  // 'maintenance' (or no goal set) — always the plain maintenance number.
  return Math.round(maintenanceCalories);
}

// WHO's free-sugar guidance: a strong recommendation to stay under 10% of
// total energy, and a conditional one to go under 5% for further benefit. The
// tighter figure is applied on a weight-loss goal, where displacing free sugar
// is the least costly place to find part of the deficit.
//
// Expressed as a share of the *personalized* calorie target, so the sugar cap
// already moves with activity level, cycle phase and goal rather than being a
// fixed number — see calculateTDEE and applyGoalAdjustment.
const WHO_SUGAR_SHARE = 0.1;
const WHO_SUGAR_SHARE_WEIGHT_LOSS = 0.05;
const CALORIES_PER_GRAM_SUGAR = 4;

export function getPhaseMacros(phase: string, calories: number, fitnessGoal?: string | null) {
  let p = 0.25,
    f = 0.3,
    c = 0.45; // Default

  switch (phase) {
    case 'Menstrual':
      p = 0.3; f = 0.35; c = 0.35; // Higher fat for hormone support, higher protein for blood building
      break;
    case 'Follicular':
      p = 0.25; f = 0.25; c = 0.5; // Higher carbs for energy building
      break;
    case 'Ovulatory':
      p = 0.25; f = 0.25; c = 0.5; // Higher carbs for peak energy
      break;
    case 'Luteal':
      p = 0.25; f = 0.35; c = 0.4; // Higher fat & complex carbs for mood stability and cravings
      break;
  }

  // Deliberately not varied by cycle phase. Protein/fat/carb splits shift with
  // phase because the body's fuel needs genuinely do; a free-sugar ceiling is a
  // health guideline, and quietly raising it in the luteal phase to
  // accommodate cravings would dress a preference up as nutrition advice.
  const sugarShare = fitnessGoal === 'weight_loss' ? WHO_SUGAR_SHARE_WEIGHT_LOSS : WHO_SUGAR_SHARE;

  return {
    protein: { g: Math.round((calories * p) / 4), pct: p * 100 },
    fats: { g: Math.round((calories * f) / 9), pct: f * 100 },
    carbs: { g: Math.round((calories * c) / 4), pct: c * 100 },
    /** A daily ceiling, not a target to reach. */
    sugar: {
      g: Math.round((calories * sugarShare) / CALORIES_PER_GRAM_SUGAR),
      pct: sugarShare * 100,
    },
  };
}

// ============================================================================
// EXERCISE-EARNED CALORIES
// ============================================================================

// Labels as persisted in daily_logs.exercise_types (see EXERCISE_OPTIONS in
// components/tracker/constants.ts — that file's own comment: "label is the
// exact string persisted... to daily_logs"). Duplicated here rather than
// imported so this stays a dependency-free calculation module; these three
// change rarely and are checked by prefix ("Light" of "Light (Walk, Yoga)"),
// not exact match, so minor wording changes to the parenthetical don't break it.
const EXERCISE_TIER_PREFIXES = ['Intense', 'Moderate', 'Light'] as const;

// Approximate MET (metabolic equivalent) values for the app's three exercise
// intensity tiers, converted to kcal/min via the standard
// kcal/min = MET × 3.5 × weightKg / 200 formula. A rough estimate for nudging
// today's target — not a wearable-measured burn to build a calorie bank on.
const EXERCISE_MET: Record<(typeof EXERCISE_TIER_PREFIXES)[number], number> = {
  Light: 3.5,
  Moderate: 5.5,
  Intense: 8.5,
};

// Don't let a long, intense session hand back more than a lean-bulk-sized
// surplus — earning back calories should nudge the target, not license
// compensatory eating after a big workout.
const MAX_EARNED_CALORIES = 500;

/**
 * Estimated calories earned back today from logged exercise, added to the
 * day's target. This is the mechanic that was missing: calculateTDEE's
 * activity_level input is a fixed onboarding setting, so completing a workout
 * previously changed nothing about today's calorie ceiling — only tomorrow's
 * baseline assumption did.
 *
 * `loggedTypes` is today's daily_logs.exercise_types (a multi-select, so more
 * than one tier can be logged the same day); `totalMinutes` is the day's one
 * aggregate exercise_minutes. The schema doesn't split minutes per type, so
 * the highest-intensity tier logged today is applied to the whole total
 * rather than guessing a split — a session that was "light AND intense" is
 * more likely under-logged-as-light than genuinely half-and-half.
 */
export function calculateEarnedCalories(
  loggedTypes: string[] | null | undefined,
  totalMinutes: number | null | undefined,
  weightKg: number
): number {
  if (!totalMinutes || totalMinutes <= 0 || !loggedTypes || loggedTypes.length === 0) return 0;

  const highestTier = EXERCISE_TIER_PREFIXES.find((tier) =>
    loggedTypes.some((label) => label.startsWith(tier))
  );
  if (!highestTier) return 0;

  const kcalPerMin = (EXERCISE_MET[highestTier] * 3.5 * weightKg) / 200;
  return Math.min(Math.round(kcalPerMin * totalMinutes), MAX_EARNED_CALORIES);
}
