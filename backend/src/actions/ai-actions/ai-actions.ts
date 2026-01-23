"use server";

import { createClient } from "@/utils/supabase/server";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CyclePhaseResponse {
  phase: 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';
  dayInCycle: number;
  daysUntilNextPeriod: number;
  hormoneState: 'low' | 'rising' | 'peak' | 'falling';
  fertileWindow: { start: number; end: number };
  nextPeriodDate: string;
  cycleLength: number;
}

export interface MacroBreakdown {
  grams: number;
  percentage: number;
}

export interface DietPlanResponse {
  calories: number;
  macros: {
    protein: MacroBreakdown;
    fats: MacroBreakdown;
    carbs: MacroBreakdown;
  };
  phaseNutritionFocus: string;
  hydrationGoalLiters: number;
  recommendedFoods: Array<{
    category: string;
    examples: string[];
    reason: string;
  }>;
  foodsToAvoid: string[];
  adjustments: Array<{
    condition: string;
    modification: string;
  }>;
}

export interface Exercise {
  name: string;
  duration: string;
  description: string;
  modifications?: string;
}

export interface WorkoutPlanResponse {
  intensity: 'low' | 'moderate' | 'high';
  duration: number;
  warmup: Exercise[];
  main: Exercise[];
  cooldown: Exercise[];
  exercisesToAvoid: string[];
  recoveryTips: string[];
  phaseContext: string;
}

export interface SymptomInsight {
  symptom: string;
  explanation: string;
  reliefTips: string[];
}

export interface SymptomInsightsResponse {
  overallInsight: string;
  symptoms: SymptomInsight[];
  focusAreas: string[];
}

export interface PersonalizedPlan {
  cyclePhase: CyclePhaseResponse | null;
  dietPlan: DietPlanResponse | null;
  workoutPlan: WorkoutPlanResponse | null;
}

export interface DietPlanInput {
  phase: string;
  symptoms?: string[];
  todayExercise?: {
    type: string;
    duration: number;
    intensity: string;
  };
}

export interface WorkoutPlanInput {
  phase: string;
  energyLevel: 'low' | 'medium' | 'high';
  availableTime: number;
  symptoms?: string[];
}

export type PhaseReliefTips = {
  tips: string[];
};

// ============================================
// 1. CYCLE PHASE CALCULATOR (Edge Function)
// ============================================

export async function getCyclePhase(): Promise<CyclePhaseResponse | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user cycle settings
  const { data: settings } = await supabase
    .from('user_cycle_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!settings?.last_period_start) return null;

  // Call edge function
  const { data, error } = await supabase.functions.invoke('cycle-phase-calculator', {
    body: {
      lastPeriodStart: settings.last_period_start,
      cycleLength: settings.cycle_length_days || 28,
      periodLength: settings.period_length_days || 5,
      isIrregular: settings.is_irregular || false
    }
  });

  if (error) {
    console.error('Error calling cycle-phase-calculator:', error);
    return null;
  }

  return data as CyclePhaseResponse;
}

// ============================================
// 2. DIET PLAN GENERATOR (Edge Function)
// ============================================

export async function getDietPlan(input: DietPlanInput): Promise<DietPlanResponse | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Gather user data from multiple tables
  const [onboardingResult, lifestyleResult, weightGoalResult] = await Promise.all([
    supabase.from('user_onboarding').select('*').eq('user_id', user.id).single(),
    supabase.from('user_lifestyle').select('*').eq('user_id', user.id).single(),
    supabase.from('user_weight_goals').select('*').eq('user_id', user.id).maybeSingle()
  ]);

  const onboarding = onboardingResult.data;
  const lifestyle = lifestyleResult.data;
  const weightGoal = weightGoalResult.data;

  if (!lifestyle) return null;

  // Calculate age from date of birth
  let age = 25; // default
  if (onboarding?.date_of_birth) {
    const dob = new Date(onboarding.date_of_birth);
    const today = new Date();
    age = today.getFullYear() - dob.getFullYear();
  }

  // Call edge function
  const { data, error } = await supabase.functions.invoke('diet-plan-generator', {
    body: {
      phase: input.phase,
      goal: lifestyle.fitness_goal || onboarding?.primary_goal || 'maintenance',
      dietType: lifestyle.diet_preference || 'vegetarian',
      activityLevel: lifestyle.activity_level || 'moderate',
      weight: lifestyle.weight_kg || 60,
      height: lifestyle.height_cm || 165,
      age,
      metabolicConditions: onboarding?.metabolic_conditions || [],
      symptoms: input.symptoms || [],
      todayExercise: input.todayExercise,
      weightLossTarget: weightGoal ? {
        targetKg: weightGoal.target_weight_kg,
        weeklyRateKg: weightGoal.weekly_rate_kg
      } : undefined
    }
  });

  if (error) {
    console.error('Error calling diet-plan-generator:', error);
    return null;
  }

  return data as DietPlanResponse;
}

// ============================================
// 3. WORKOUT PLAN GENERATOR (Edge Function)
// ============================================

export async function getWorkoutPlan(input: WorkoutPlanInput): Promise<WorkoutPlanResponse | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user fitness profile
  const [lifestyleResult, fitnessResult] = await Promise.all([
    supabase.from('user_lifestyle').select('*').eq('user_id', user.id).single(),
    supabase.from('user_fitness_profile').select('*').eq('user_id', user.id).maybeSingle()
  ]);

  const lifestyle = lifestyleResult.data;
  const fitness = fitnessResult.data;

  // Call edge function
  const { data, error } = await supabase.functions.invoke('workout-plan-generator', {
    body: {
      phase: input.phase,
      fitnessGoal: fitness?.fitness_goal || lifestyle?.fitness_goal || 'strength',
      activityLevel: lifestyle?.activity_level || 'moderate',
      energyLevel: input.energyLevel,
      availableTime: input.availableTime,
      equipment: fitness?.equipment_available || [],
      injuries: fitness?.injuries_limitations || [],
      symptoms: input.symptoms || []
    }
  });

  if (error) {
    console.error('Error calling workout-plan-generator:', error);
    return null;
  }

  return data as WorkoutPlanResponse;
}

// ============================================
// 4. SYMPTOM INSIGHTS (Edge Function)
// ============================================

export async function getSymptomInsights(
  phase: string,
  symptoms: string[],
  dayOfCycle: number = 1
): Promise<SymptomInsightsResponse | null> {
  const supabase = await createClient();

  // Call edge function
  const { data, error } = await supabase.functions.invoke('symptom-insights', {
    body: {
      phase,
      dayOfCycle,
      symptoms
    }
  });

  if (error) {
    console.error('Error calling symptom-insights:', error);
    return null;
  }

  return data as SymptomInsightsResponse;
}

// ============================================
// 5. PHASE RELIEF TIPS (Direct Groq Call)
// ============================================

export async function generatePhaseReliefTips(
  phase: string,
  symptoms: string[]
): Promise<PhaseReliefTips | null> {
  // ❌ HARD STOP — no symptoms = no AI
  if (!symptoms || symptoms.length === 0) {
    return null;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 🔐 Cache key: ONE per month per phase
  const now = new Date();
  const monthKey = `${now.getFullYear()}_${now.getMonth() + 1}`;
  const cacheKey = `phase_relief_${user.id}_${phase}_${monthKey}`;

  // 1️⃣ Check cache
  const { data: cached } = await supabase
    .from("ai_cache_keys")
    .select("response")
    .eq("cache_key", cacheKey)
    .single();

  if (cached?.response) {
    return cached.response as PhaseReliefTips;
  }

  // 2️⃣ AI Generation
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `
User is currently in the ${phase} phase.
This month they reported symptoms: ${symptoms.join(", ")}.

Give 3 gentle, phase-appropriate suggestions that may help them feel better.
Tips should be:
- supportive (not medical)
- short (max 12 words)
- holistic (energy, food, rest, movement)
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.35,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a compassionate women's health guide.
Return JSON ONLY:
{ "tips": ["Tip 1", "Tip 2", "Tip 3"] }`
            },
            { role: "user", content: prompt }
          ]
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // 3️⃣ Save to cache (expires next month)
    await supabase.from("ai_cache_keys").insert({
      user_id: user.id,
      cache_key: cacheKey,
      cache_type: "phase_relief_tips",
      response: result,
      expires_at: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      ).toISOString(),
    });

    return result;

  } catch (error) {
    console.error("Phase Relief Tip Error:", error);
    return null;
  }
}

// ============================================
// 6. FULL PERSONALIZED PLAN (Aggregator)
// ============================================

export async function getFullPersonalizedPlan(
  energyLevel: 'low' | 'medium' | 'high' = 'medium',
  availableTime: number = 30,
  symptoms: string[] = []
): Promise<PersonalizedPlan> {
  // First get cycle phase
  const cyclePhase = await getCyclePhase();

  if (!cyclePhase) {
    return { cyclePhase: null, dietPlan: null, workoutPlan: null };
  }

  // Then get diet and workout plans in parallel
  const [dietPlan, workoutPlan] = await Promise.all([
    getDietPlan({ phase: cyclePhase.phase, symptoms }),
    getWorkoutPlan({
      phase: cyclePhase.phase,
      energyLevel,
      availableTime,
      symptoms
    })
  ]);

  return { cyclePhase, dietPlan, workoutPlan };
}