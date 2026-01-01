"use server";

import { createClient } from "@/utils/supabase/server";

// ============================================
// EDGE FUNCTION TYPES
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

// ============================================
// CYCLE PHASE CALCULATOR
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
// DIET PLAN GENERATOR
// ============================================

interface DietPlanInput {
    phase: string;
    symptoms?: string[];
    todayExercise?: {
        type: string;
        duration: number;
        intensity: string;
    };
}

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
// WORKOUT PLAN GENERATOR
// ============================================

interface WorkoutPlanInput {
    phase: string;
    energyLevel: 'low' | 'medium' | 'high';
    availableTime: number;
    symptoms?: string[];
}

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
// SYMPTOM INSIGHTS
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
// COMBINED: GET FULL PERSONALIZED PLAN
// ============================================

export interface PersonalizedPlan {
    cyclePhase: CyclePhaseResponse | null;
    dietPlan: DietPlanResponse | null;
    workoutPlan: WorkoutPlanResponse | null;
}

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
