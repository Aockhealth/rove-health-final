"use server";
import { unstable_noStore as noStore } from 'next/cache';

import { createClient } from "@/utils/supabase/server";
import { ChefItemSchema, ChefSaladItemSchema, RoveChefProtocolSchema, RoveCoachPlanSchema } from "@/lib/ai/schemas";
import { AIService } from "@/lib/ai/service";
import { executeUnifiedAI } from "../../../../backend/src/actions/ai-orchestrator/orchestrator";
import { logAIGenerationEvent } from "../../../../backend/src/actions/ai-orchestrator/telemetry";
import { UnifiedAIRequest, UnifiedAIResponse } from "@/lib/ai/unified-schemas";

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

export type MoodInsight = {
    title: string;
    insight: string;
};
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

import {
    calculatePhase,
    formatDate,
    getOvulationDay,
    isInFertileWindow,
    parseLocalDate,
    type CycleSettings,
    type DailyLog
} from "@shared/cycle/phase";

const LOG_WINDOW_DAYS = 90;

// ============================================
// CYCLE PHASE CALCULATOR
// ============================================

export async function getCyclePhase(): Promise<CyclePhaseResponse | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Fetch Settings & Recent Logs in Parallel (last 90 days for streak detection)
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - LOG_WINDOW_DAYS);

    const [settingsResult, logsResult] = await Promise.all([
        supabase.from('user_cycle_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('daily_logs')
            .select('date, is_period')
            .eq('user_id', user.id)
            .gte('date', formatDate(pastDate))
    ]);

    // 2. Prepare Data for Shared Module
    const settingsData = settingsResult.data;
    if (!settingsData?.last_period_start) return null;

    const cycleSettings: CycleSettings = {
        last_period_start: settingsData.last_period_start,
        cycle_length_days: settingsData.cycle_length_days || 28,
        period_length_days: settingsData.period_length_days || 5,
        luteal_length_days: 14 // Default for now
    };

    const logs: Record<string, DailyLog> = {};
    if (logsResult.data) {
        logsResult.data.forEach(log => {
            logs[log.date] = { date: log.date, is_period: log.is_period };
        });
    }

    // 3. Calculate Phase Locally (Single Source of Truth)
    const result = calculatePhase(today, cycleSettings, logs);

    // 4. Calculate Extras (Fertile Window, Next Period, Hormone State)
    const cycleLength = cycleSettings.cycle_length_days;
    const nextPeriodDate = parseLocalDate(settingsData.last_period_start);
    // Simple projection for next period based on last known start
    // Note: detailed next period projection is complex, simple addition for now
    // Ideally we'd project from the *current* cycle start found by calculatePhase
    // But calculatePhase doesn't export the cycle start date directly in PhaseResult yet.
    // We can approximate daysUntilNextPeriod using result.day

    const daysUntilNextPeriod = cycleLength - result.day;

    // Determine Hormone State
    let hormoneState: 'low' | 'rising' | 'peak' | 'falling' = 'low';
    if (result.phase === 'Menstrual') hormoneState = 'low';
    else if (result.phase === 'Follicular') hormoneState = 'rising';
    else if (result.phase === 'Ovulatory') hormoneState = 'peak';
    else hormoneState = 'falling'; // Luteal

    // Determine Fertile Window Range (relative to current cycle)
    const ovulationDay = getOvulationDay(cycleLength);
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 2;

    return {
        phase: result.phase || 'Menstrual', // Fallback if null
        dayInCycle: result.day,
        daysUntilNextPeriod,
        hormoneState,
        fertileWindow: { start: fertileStart, end: fertileEnd },
        nextPeriodDate: "2030-01-01", // Placeholder, would need better projection logic
        cycleLength
    };
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
            goal: lifestyle.fitness_goal || onboarding?.goals?.[0] || 'maintenance',
            dietType: lifestyle.diet_preference || 'vegetarian',
            activityLevel: lifestyle.activity_level || 'moderate',
            weight: lifestyle.weight_kg || 60,
            height: lifestyle.height_cm || 165,
            age,
            metabolicConditions: onboarding?.conditions || [],
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
    focusArea?: string;
    progressionPreference?: "steady" | "push" | "deload";
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
            symptoms: input.symptoms || [],
            focusArea: input.focusArea || "Full Body",
            progressionPreference: input.progressionPreference || "steady"
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
// ============================================
// MOOD INSIGHT GENERATOR (Direct Groq Call)
// ============================================

/**
 * Generates or retrieves a cached AI insight for emotional baselines.
 * Cache Key Format: "mood_insight_{userId}_{phase}_{month}_{year}"
 */
export async function generateMoodInsight(
    phase: string,
    moodCounts: Record<string, number>
): Promise<MoodInsight | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Create a Unique Cache Key for THIS month
    const date = new Date();
    const cacheKey = `mood_insight_${user.id}_${phase}_${date.getMonth()}_${date.getFullYear()}`;

    // 2. Check Cache First (Fast Path)
    // Ensure your 'ai_cache_keys' table exists and has a 'user_id' column
    const { data: cached } = await supabase
        .from("ai_cache_keys")
        .select("response")
        .eq("cache_key", cacheKey)
        .single();

    if (cached?.response) {
        return cached.response as MoodInsight;
    }

    // 3. Prepare AI Prompt (If no cache)
    const sortedMoods = Object.entries(moodCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([mood, count]) => `${mood} (${count}x)`)
        .join(", ");

    if (!sortedMoods) return null; // No data, no insight

    try {
        const response = await AIService.generate<MoodInsight>({
            feature: "insights_mood",
            variables: {
                phase,
                mood_counts: sortedMoods
            }
        });

        if (response.error || !response.data) {
            console.error("[generateMoodInsight] AIService Error:", response.error);
            return null;
        }

        const result = response.data;

        // 4. Save to Cache
        await supabase.from("ai_cache_keys").insert({
            user_id: user.id,
            cache_key: cacheKey,
            cache_type: "mood_insight",
            response: result,
            expires_at: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString()
        });

        return result;

    } catch (error) {
        console.error("AI Generation Error:", error);
        // Fallback safe return
        return {
            title: "Mood Pattern",
            insight: "Not enough data to generate a personalized insight right now."
        };
    }
}



export type SymptomTips = {
    tips: string[];
};
export async function generateSymptomTips(
    phase: string,
    symptoms: string[]
): Promise<SymptomTips | null> {
    // ✅ STRICT FIX: Stop AI if no symptoms are logged.
    // This ensures we don't generate generic "wellness tips" that look like analysis.
    if (!symptoms || symptoms.length === 0) {
        return null;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Create unique cache key
    const date = new Date();
    const symptomsHash = symptoms.sort().join("_");
    const cacheKey = `tips_${user.id}_${phase}_${symptomsHash}_${date.getMonth()}`;

    // 2. Check Cache
    const { data: cached } = await supabase
        .from("ai_cache_keys")
        .select("response")
        .eq("cache_key", cacheKey)
        .single();

    if (cached?.response) {
        return cached.response as SymptomTips;
    }

    // 3. AI Generation
    try {
        const response = await AIService.generate<SymptomTips>({
            feature: "symptom_tips",
            variables: {
                phase,
                symptoms: symptoms.join(", ")
            }
        });

        if (response.error || !response.data) {
            console.error("[generateSymptomTips] AIService Error:", response.error);
            return null;
        }

        const result = response.data;

        // 4. Save to Cache
        await supabase.from("ai_cache_keys").insert({
            user_id: user.id,
            cache_key: cacheKey,
            cache_type: "symptom_tips",
            response: result,
            expires_at: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString()
        });

        return result;

    } catch (error) {
        console.error("Tip Generation Error:", error);
        return null;
    }
}






export type PhaseReliefTips = {
    tips: string[];
};

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
    try {
        const response = await AIService.generate<PhaseReliefTips>({
            feature: "phase_relief_tips",
            variables: {
                phase,
                symptoms: symptoms.join(", ")
            }
        });

        if (response.error || !response.data) {
            console.error("[generatePhaseReliefTips] AIService Error:", response.error);
            return null;
        }

        const result = response.data;

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

// ============================================
// AI RECIPE GENERATOR (AI Chef)
// ============================================

export type RecipeType = "smoothie" | "salad" | "snack";
export type DietPreference = "Veg" | "Non-Veg" | "Vegan" | "Jain";

export interface AIRecipe {
    name: string;
    ingredients: string;
    why: string;
    instructions: string[]; // Changed to array for step-by-step
    calories: string;       // Added calories
    time: string;          // Added prep time
}

export interface GenerateRecipeInput {
    phase: string;
    recipeType: RecipeType;
    dietPreference: DietPreference;
    restrictions: string[];
    customInstruction?: string;
}

export async function generateAIRecipe(input: GenerateRecipeInput): Promise<AIRecipe | null> {
    const phaseNutrition: Record<string, string> = {
        Menstrual: "Focus on iron-rich ingredients (spinach, beets, lentils), warming spices (ginger, turmeric), and anti-inflammatory foods to support blood loss and ease cramps.",
        Follicular: "Focus on fresh, light foods, probiotics, and cruciferous vegetables to support rising estrogen and energy. Include fermented foods and lean proteins.",
        Ovulatory: "Focus on fiber-rich foods, raw vegetables, and foods that help metabolize estrogen at its peak. Include flax, leafy greens, and light proteins.",
        Luteal: "Focus on complex carbs (sweet potato, oats), magnesium-rich foods (dark chocolate, nuts), and serotonin-boosting ingredients to combat PMS cravings and mood swings."
    };

    const dietGuidelines: Record<DietPreference, string> = {
        Veg: "Vegetarian - no meat or fish, but eggs and dairy are okay.",
        "Non-Veg": "Non-vegetarian - can include chicken, fish, eggs, and any protein.",
        Vegan: "Vegan - no animal products at all. No meat, fish, eggs, dairy, honey, or ghee.",
        Jain: "Jain vegetarian - no onion, garlic, ginger, root vegetables, or anything grown underground. No eggs."
    };

    const recipeTypeLabels: Record<RecipeType, string> = {
        smoothie: "a hormone-balancing smoothie",
        salad: "a nutrient-dense salad",
        snack: "a quick, healthy snack"
    };

    try {
        const response = await AIService.generate<AIRecipe>({
            feature: "ai_recipe",
            variables: {
                recipe_type: recipeTypeLabels[input.recipeType],
                phase: input.phase,
                phase_nutrition: phaseNutrition[input.phase] || phaseNutrition.Menstrual,
                diet_guidelines: dietGuidelines[input.dietPreference] || dietGuidelines.Veg,
                restrictions: input.restrictions.length > 0 ? `Additional restrictions: ${input.restrictions.join(", ")}` : "",
                custom_instruction: input.customInstruction ? `USER'S SPECIAL REQUEST: "${input.customInstruction}"` : ""
            }
        });

        if (response.error || !response.data) {
            console.error("[generateAIRecipe] AIService Error:", response.error);
            return null;
        }

        return response.data;

    } catch (error) {
        console.error("AI Recipe Generation Error:", error);
        return null;
    }
}

// ============================================
// ROVE CHEF "TRIPLE THREAT" PROTOCOL
// ============================================

export interface RoveChefItem {
    name: string;
    description: string;
    ingredients: string[];
    instructions?: string[];
    why: string;
}

export interface RoveChefProtocol {
    snack: RoveChefItem;
    smoothie: RoveChefItem;
    salad: {
        name: string;
        description: string;
        ingredients: string[];
        instructions?: string[];
        why: string;
    };
}

export interface RoveChefPersonalization {
    goalFocus?: string;
    currentSymptomsOrCraving?: string;
    avoidIngredients?: string[];
    recentOutputSignatures?: string[];
}

type GenerationQualityMetadata = {
    quality_passed: boolean;
    retry_count: number;
    generic_score: number;
    duplicate_detected: boolean;
    phase_rule_passed: boolean;
    reasons?: string[];
};

const GENERIC_PHRASES = [
    "nutrient-dense",
    "balanced routine",
    "balanced flow",
    "hormone harmony",
    "supports hormone balance",
    "essential vitamins",
    "kickstarts digestion",
    "full body routine"
];

function isFlagEnabled(name: string, defaultValue = true): boolean {
    const raw = process.env[name];
    if (raw === undefined) return defaultValue;
    return raw.toLowerCase() === "true";
}

function normalizeList(input?: string[] | string): string[] {
    if (!input) return [];
    const values = Array.isArray(input) ? input : input.split(",");
    return values
        .map((value) => value.trim())
        .filter(Boolean);
}

function sanitizeSignature(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function computeGenericScore(chunks: string[]): number {
    const text = chunks.join(" ").toLowerCase();
    if (!text.trim()) return 1;
    const hits = GENERIC_PHRASES.reduce((count, phrase) => count + (text.includes(phrase) ? 1 : 0), 0);
    return Math.min(1, Number((hits / Math.max(3, chunks.length)).toFixed(3)));
}

function hasAny(text: string, needles: string[]): boolean {
    return needles.some((needle) => text.includes(needle));
}

function evaluateChefPhaseRule(phase: string, text: string): boolean {
    const normalizedPhase = phase.toLowerCase();
    if (normalizedPhase === "menstrual") {
        return !hasAny(text, ["raw", "cold", "iced", "ice"]) &&
            hasAny(text, ["warm", "ginger", "iron", "cooked", "soup", "stew"]);
    }
    if (normalizedPhase === "follicular") {
        return hasAny(text, ["fresh", "sprout", "ferment", "probiotic", "light"]);
    }
    if (normalizedPhase === "ovulatory") {
        return hasAny(text, ["cool", "cooling", "fiber", "hydr", "cucumber", "berry", "raw"]);
    }
    return hasAny(text, ["warm", "ground", "complex carb", "oat", "sweet potato", "millet", "magnesium"]);
}

function evaluateChefQuality(
    candidate: Partial<RoveChefProtocol>,
    phase: string,
    recentSignatures: string[],
    retryCount: number
): GenerationQualityMetadata {
    const names = [candidate.snack?.name, candidate.smoothie?.name, candidate.salad?.name]
        .filter((name): name is string => Boolean(name));
    const nameSignatures = names.map(sanitizeSignature);
    const recent = new Set(recentSignatures.map(sanitizeSignature));
    const duplicateDetected = nameSignatures.some((name) => recent.has(name));

    const textChunks: string[] = [];
    const collectItem = (item?: RoveChefItem | { name: string; description: string; why: string }) => {
        if (!item) return;
        textChunks.push(item.name, item.description, item.why);
        if ("ingredients" in item && Array.isArray(item.ingredients)) {
            textChunks.push(...item.ingredients);
        }
        if ("instructions" in item && Array.isArray(item.instructions)) {
            textChunks.push(...item.instructions);
        }
    };
    collectItem(candidate.snack);
    collectItem(candidate.smoothie);
    collectItem(candidate.salad);

    const genericScore = computeGenericScore(textChunks);
    const phaseRulePassed = evaluateChefPhaseRule(phase, textChunks.join(" ").toLowerCase());
    // Relaxed quality gate: 50% generic threshold, less strict duplicate detection
    const qualityPassed = phaseRulePassed && genericScore <= 0.50;

    const reasons: string[] = [];
    if (!phaseRulePassed) reasons.push("phase_rule_failed");
    if (genericScore > 0.50) reasons.push("generic_score_too_high");

    return {
        quality_passed: qualityPassed,
        retry_count: retryCount,
        generic_score: genericScore,
        duplicate_detected: duplicateDetected,
        phase_rule_passed: phaseRulePassed,
        reasons
    };
}

function evaluateCoachQuality(
    candidate: RoveCoachPlan,
    phase: string,
    requestedEnergy: "Low" | "Medium" | "High",
    recentSignatures: string[],
    retryCount: number
): GenerationQualityMetadata {
    const normalizedPhase = phase.toLowerCase();
    const normalizedIntensity = candidate.intensity.toLowerCase();
    const titleSignature = sanitizeSignature(candidate.title || "");
    const duplicateDetected = recentSignatures.map(sanitizeSignature).includes(titleSignature);

    let phaseRulePassed = true;
    if (normalizedPhase === "menstrual" && normalizedIntensity === "high") {
        phaseRulePassed = false;
    }
    if (requestedEnergy === "Low" && normalizedIntensity !== "low") {
        phaseRulePassed = false;
    }
    if (requestedEnergy === "Medium" && normalizedIntensity === "high") {
        phaseRulePassed = false;
    }
    if (normalizedPhase === "ovulatory") {
        const notes = candidate.main_set.map((set) => (set.notes || "").toLowerCase()).join(" ");
        if (!hasAny(notes, ["form", "joint", "alignment", "control", "stability"])) {
            console.log("[Quality] Ovulatory phase requires form/joint/alignment/control/stability keyword in notes. Found notes:", notes);
            phaseRulePassed = false;
        }
    }
    if (!Array.isArray(candidate.main_set) || candidate.main_set.length < 3) {
        console.log("[Quality] main_set check failed. Is array:", Array.isArray(candidate.main_set), "Length:", candidate.main_set?.length);
        phaseRulePassed = false;
    }

    const textChunks = [
        candidate.title,
        candidate.reasoning,
        ...(candidate.warmup || []),
        ...(candidate.cooldown || []),
        ...(candidate.main_set || []).flatMap((set) => [set.name, set.notes || ""])
    ];

    const genericScore = computeGenericScore(textChunks);
    // Relaxed thresholds: allow 50% generic content (up from 24%) and don't fail on duplicates alone
    const qualityPassed = phaseRulePassed && genericScore <= 0.50;

    console.log("[Quality] Coach evaluation:", {
        phase: normalizedPhase,
        intensity: normalizedIntensity,
        phaseRulePassed,
        genericScore,
        threshold: 0.50,
        qualityPassed,
        title: candidate.title,
        mainSetCount: candidate.main_set?.length
    });

    const reasons: string[] = [];
    if (!phaseRulePassed) reasons.push("phase_rule_failed");
    if (genericScore > 0.50) reasons.push("generic_score_too_high");

    return {
        quality_passed: qualityPassed,
        retry_count: retryCount,
        generic_score: genericScore,
        duplicate_detected: duplicateDetected,
        phase_rule_passed: phaseRulePassed,
        reasons
    };
}

function normalizeCuisineChoice(
    requestedCuisine: string,
    profileCuisine: string | undefined,
    recentCuisines: string[]
): string {
    const requested = (requestedCuisine || "").trim();
    const profile = (profileCuisine || "").trim();
    const recentTop = recentCuisines.map((item) => item.trim()).filter(Boolean);
    const fallbackPool = ["Indian", "Mediterranean", "Asian", "Global"];

    // Precedence: request override > profile > fallback default.
    const baseCuisine = requested || profile || "Global";
    if (requested) return baseCuisine;

    // Auto-rotation applies only when user did not explicitly request a cuisine.
    // Avoid repeating the same style back-to-back when alternatives exist.
    if (recentTop[0] && recentTop[0].toLowerCase() === baseCuisine.toLowerCase()) {
        const rotationPool = Array.from(new Set([profile, ...fallbackPool].filter(Boolean)));
        const rotated = rotationPool.find((option) => option.toLowerCase() !== baseCuisine.toLowerCase());
        return rotated || baseCuisine;
    }
    return baseCuisine;
}

function extractSignatures(snapshot: unknown): string[] {
    if (!isRecord(snapshot)) return [];
    const signatures: string[] = [];
    if (typeof snapshot.title === "string") signatures.push(snapshot.title);
    if (typeof snapshot.name === "string") signatures.push(snapshot.name);

    const snack = isRecord(snapshot.snack) ? snapshot.snack : null;
    const smoothie = isRecord(snapshot.smoothie) ? snapshot.smoothie : null;
    const salad = isRecord(snapshot.salad) ? snapshot.salad : null;
    if (snack && typeof snack.name === "string") signatures.push(snack.name);
    if (smoothie && typeof smoothie.name === "string") signatures.push(smoothie.name);
    if (salad && typeof salad.name === "string") signatures.push(salad.name);

    if (Array.isArray(snapshot.main_set)) {
        snapshot.main_set.slice(0, 2).forEach((set) => {
            if (isRecord(set) && typeof set.name === "string") signatures.push(set.name);
        });
    }
    return signatures;
}

type TelemetryRow = {
    response_snapshot?: unknown;
    prompt_snapshot?: unknown;
};

async function getRecentOutputContext(
    userId: string,
    skills: string[],
    options: { surface?: string; limit?: number } = {}
): Promise<{ signatures: string[]; cuisines: string[] }> {
    const limit = options.limit ?? 24;
    const supabase = await createClient();
    const { data } = await supabase
        .from("ai_generation_events")
        .select("response_snapshot,prompt_snapshot")
        .eq("user_id", userId)
        .in("skill", skills)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (!data || data.length === 0) return { signatures: [], cuisines: [] };

    const rows = (data as TelemetryRow[]).map((row) => ({
        response_snapshot: row.response_snapshot,
        prompt_snapshot: isRecord(row.prompt_snapshot) ? row.prompt_snapshot : {}
    }));

    const surfaceScoped = options.surface
        ? rows.filter((row) => row.prompt_snapshot.clientSurface === options.surface)
        : rows;
    const scopedRows = surfaceScoped.length > 0 ? surfaceScoped : rows;

    const signatures = Array.from(
        new Set(
            scopedRows
                .flatMap((row) => extractSignatures(row.response_snapshot))
                .map((value) => sanitizeSignature(value))
        )
    ).slice(0, 5);

    const cuisines = Array.from(
        new Set(
            scopedRows
                .map((row) => row.prompt_snapshot.cuisinePreference || row.prompt_snapshot.cuisine)
                .filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
        )
    ).slice(0, 5);

    return { signatures, cuisines };
}

async function logGenerationWithQuality(
    userId: string | undefined,
    request: UnifiedAIRequest,
    response: UnifiedAIResponse,
    quality: GenerationQualityMetadata
) {
    if (!userId) return;
    const enrichedResponse: UnifiedAIResponse = {
        ...response,
        actions: [
            ...(response.actions || []),
            {
                type: "quality_meta",
                payload: quality
            }
        ]
    };
    const promptSnapshot = {
        ...(request.contextHints || {}),
        clientSurface: request.clientSurface || "unknown",
        userIntent: request.userIntent || undefined
    };
    await logAIGenerationEvent(userId, request, enrichedResponse, promptSnapshot);
}

export async function generateRoveChefProtocol(
    phase: string,
    dietary_preferences: string,
    cuisine: string,
    type?: 'snack' | 'smoothie' | 'salad',
    personalization: RoveChefPersonalization = {}
): Promise<Partial<RoveChefProtocol> | null> {
    noStore(); // Prevent Next.js from caching AI actions

    // Default fallback if AI fails or key missing
    const fallback: RoveChefProtocol = {
        snack: {
            name: "Energy Seed Bites",
            description: "No-bake energy balls with phase-specific seeds.",
            ingredients: ["Dates", "Seeds (Pumpkin/Flax)", "Coconut"],
            instructions: [
                "Blend dates until sticky.",
                "Mix in seeds and coconut.",
                "Roll into small balls and chill."
            ],
            why: "Supports hormone balance."
        },
        smoothie: {
            name: "Hormone Harmony Blend",
            description: "A nutrient-dense smoothie.",
            ingredients: ["Fruit", "Liquid base", "Superfood"],
            instructions: [
                "Add all ingredients to a high-speed blender.",
                "Blend on high until perfectly smooth.",
                "Serve immediately."
            ],
            why: "Provides essential vitamins."
        },
        salad: {
            name: "Fresh Garden Salad",
            description: "A light, nourishing salad with seasonal greens and seeds.",
            ingredients: ["Mixed greens", "Cucumber", "Cherry tomatoes", "Pumpkin seeds", "Lemon dressing"],
            instructions: [
                "Wash and chop all vegetables.",
                "Toss greens with cucumber and tomatoes.",
                "Top with seeds and drizzle lemon dressing."
            ],
            why: "Light fiber supports digestion."
        }
    };

    const qualityGateEnabled = isFlagEnabled("AI_QUALITY_GATE_ENABLED", true);
    const retryEnabled = isFlagEnabled("AI_QUALITY_RETRY_ENABLED", true);
    const retryModelEnabled = isFlagEnabled("AI_RETRY_UPGRADE_MODEL", false);
    const retryModel = process.env.AI_RETRY_UPGRADE_MODEL_NAME || "gemini-2.5-pro";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const recentContext = user
        ? await getRecentOutputContext(user.id, ["diet_coach", "chef"], { surface: "rove_chef_card" })
        : { signatures: [], cuisines: [] };
    const profileCuisine = recentContext.cuisines[0];
    const resolvedCuisine = normalizeCuisineChoice(cuisine, profileCuisine, recentContext.cuisines);
    const recentSignatures = personalization.recentOutputSignatures?.length
        ? personalization.recentOutputSignatures
        : recentContext.signatures;

    let lastRequest: UnifiedAIRequest | null = null;
    let lastResponse: UnifiedAIResponse | null = null;
    let retryCount = 0;

    const featureMap = {
        snack: "chef_snack",
        smoothie: "chef_smoothie",
        salad: "chef_salad"
    } as const;

    const buildRequest = (qualityFeedback = "", isRetry = false): UnifiedAIRequest => ({
        skill: "diet_coach",
        userIntent: type ? featureMap[type] : undefined,
        contextHints: {
            phase,
            dayInCycle: null,
            dietaryPreferences: dietary_preferences,
            cuisinePreference: resolvedCuisine,
            goalFocus: personalization.goalFocus || "Hormone balance and cycle-aligned nourishment",
            currentSymptomsOrCraving: personalization.currentSymptomsOrCraving || "",
            avoidIngredients: normalizeList(personalization.avoidIngredients),
            recentOutputSignatures: recentSignatures,
            qualityFeedback: qualityFeedback ? qualityFeedback + ` [Seed: ${Date.now()}]` : `[Seed: ${Date.now()}]`
        },
        clientSurface: "rove_chef_card",
        memoryMode: "isolated",
        deferTelemetry: true,
        overrideModel: isRetry && retryModelEnabled ? retryModel : undefined
    });

    const parseCandidate = (payload: unknown): Partial<RoveChefProtocol> | null => {
        if (type) {
            const targetData = isRecord(payload) && payload[type] ? payload[type] : payload;
            const schema = type === "salad" ? ChefSaladItemSchema : ChefItemSchema;
            const parsed = schema.safeParse(targetData);
            if (!parsed.success) return null;
            return { [type]: parsed.data };
        }
        const parsed = RoveChefProtocolSchema.safeParse(payload);
        if (!parsed.success) return null;
        return parsed.data;
    };

    try {
        // Granular Generation Request
        lastRequest = buildRequest();
        lastResponse = await executeUnifiedAI(lastRequest);

        let candidate = (!lastResponse.safety?.flagged && lastResponse.structuredPayload)
            ? parseCandidate(lastResponse.structuredPayload)
            : null;
        let quality = candidate
            ? evaluateChefQuality(candidate, phase, recentSignatures, retryCount)
            : {
                quality_passed: false,
                retry_count: retryCount,
                generic_score: 1,
                duplicate_detected: false,
                phase_rule_passed: false,
                reasons: ["invalid_payload_or_safety_flag"]
            };

        if (qualityGateEnabled && !quality.quality_passed && retryEnabled) {
            retryCount = 1;
            lastRequest = buildRequest(`Fix these issues: ${(quality.reasons || []).join(", ")}`, true);
            lastResponse = await executeUnifiedAI(lastRequest);
            candidate = (!lastResponse.safety?.flagged && lastResponse.structuredPayload)
                ? parseCandidate(lastResponse.structuredPayload)
                : null;
            quality = candidate
                ? evaluateChefQuality(candidate, phase, recentSignatures, retryCount)
                : {
                    quality_passed: false,
                    retry_count: retryCount,
                    generic_score: 1,
                    duplicate_detected: false,
                    phase_rule_passed: false,
                    reasons: ["retry_invalid_payload_or_safety_flag"]
                };
        }

        if (!candidate || (qualityGateEnabled && !quality.quality_passed)) {
            const fallbackResult = type ? { [type]: fallback[type] } : fallback;
            if (lastRequest && lastResponse) {
                await logGenerationWithQuality(user?.id, lastRequest, lastResponse, quality);
            }
            return fallbackResult;
        }

        if (lastRequest && lastResponse) {
            await logGenerationWithQuality(user?.id, lastRequest, lastResponse, quality);
        }
        return candidate;
    } catch (error) {
        console.error("Rove Chef Unexpected Error:", error);
        return type ? { [type]: fallback[type] } : fallback;
    }
}

// ============================================
// ROVE COACH ACTIONS
// ============================================

export interface WorkoutSet {
    name: string;
    reps: string;
    sets: string;
    notes?: string;
}

export interface RoveCoachPlan {
    title: string;
    duration: string;
    intensity: "Low" | "Moderate" | "High" | string;
    warmup: string[];
    main_set: WorkoutSet[];
    cooldown: string[];
    reasoning: string;
}

export async function generateRoveCoachPlan(
    phase: string,
    energyLevel: "Low" | "Medium" | "High",
    goal: string,
    equipment: string,
    injuries: string,
    fitnessLevel: "Beginner" | "Intermediate" | "Pro" = "Intermediate",
    workoutFocus = "Full Body",
    sessionDuration = "30m",
    progressionPreference: "steady" | "push" | "deload" = "steady",
    goalFocus = goal,
    recentOutputSignatures: string[] = []
): Promise<RoveCoachPlan | null> {
    noStore(); // Prevent Next.js from caching AI actions

    const fallback: RoveCoachPlan = {
        title: "Balanced Flow",
        duration: "30 mins",
        intensity: "Moderate",
        warmup: ["Arm circles", "High knees"],
        main_set: [
            { name: "Squats", reps: "12", sets: "3", notes: "Keep chest up" },
            { name: "Pushups", reps: "10", sets: "3", notes: "Core tight" }
        ],
        cooldown: ["Child's pose", "Deep breathing"],
        reasoning: "A balanced routine perfect for your current energy."
    };

    const qualityGateEnabled = isFlagEnabled("AI_QUALITY_GATE_ENABLED", true);
    const retryEnabled = isFlagEnabled("AI_QUALITY_RETRY_ENABLED", true);
    const retryModelEnabled = isFlagEnabled("AI_RETRY_UPGRADE_MODEL", false);
    const retryModel = process.env.AI_RETRY_UPGRADE_MODEL_NAME || "gemini-2.5-pro";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const recentContext = user
        ? await getRecentOutputContext(user.id, ["exercise_coach", "coach"], { surface: "rove_coach_card" })
        : { signatures: [], cuisines: [] };
    const signatures = recentOutputSignatures.length > 0 ? recentOutputSignatures : recentContext.signatures;

    let lastRequest: UnifiedAIRequest | null = null;
    let lastResponse: UnifiedAIResponse | null = null;
    let retryCount = 0;

    const buildRequest = (qualityFeedback = "", isRetry = false): UnifiedAIRequest => ({
        skill: "exercise_coach",
        contextHints: {
            phase,
            dayInCycle: null,
            fitnessGoals: goal,
            goalFocus,
            progressionPreference,
            fitnessLevel,
            requestedEnergyLevel: energyLevel,
            equipment,
            workoutFocus,
            sessionDuration,
            limitations: injuries,
            recentOutputSignatures: signatures,
            qualityFeedback: qualityFeedback ? qualityFeedback + ` [Seed: ${Date.now()}]` : `[Seed: ${Date.now()}]`
        },
        clientSurface: "rove_coach_card",
        memoryMode: "isolated",
        deferTelemetry: true,
        overrideModel: isRetry && retryModelEnabled ? retryModel : undefined
    });

    try {
        lastRequest = buildRequest();
        console.log("[Rove Coach] Executing AI request...", { phase, energyLevel, equipment });
        lastResponse = await executeUnifiedAI(lastRequest);
        console.log("[Rove Coach] AI Response received:", { 
            isFlagged: lastResponse.safety?.flagged, 
            hasPayload: !!lastResponse.structuredPayload 
        });

        let candidate = (!lastResponse.safety?.flagged && lastResponse.structuredPayload)
            ? RoveCoachPlanSchema.safeParse(lastResponse.structuredPayload)
            : null;
        console.log("[Rove Coach] Schema parse result:", { 
            success: candidate?.success, 
            error: candidate?.error?.toString() 
        });

        if (candidate?.error) {
            console.log("[Rove Coach] Schema validation failed. Payload was:", JSON.stringify(lastResponse.structuredPayload).substring(0, 800));
        }

        let parsedPlan = candidate && candidate.success ? candidate.data : null;
        let quality = parsedPlan
            ? evaluateCoachQuality(parsedPlan, phase, energyLevel, signatures, retryCount)
            : {
                quality_passed: false,
                retry_count: retryCount,
                generic_score: 1,
                duplicate_detected: false,
                phase_rule_passed: false,
                reasons: ["invalid_payload_or_safety_flag"]
            };
        console.log("[Rove Coach] Quality evaluation:", { 
            passed: quality.quality_passed, 
            reasons: quality.reasons,
            genericScore: quality.generic_score,
            phaseRulePassed: quality.phase_rule_passed
        });

        if (qualityGateEnabled && !quality.quality_passed && retryEnabled) {
            console.log("[Rove Coach] Quality gate failed. Retrying with feedback...");
            retryCount = 1;
            lastRequest = buildRequest(`Fix these issues: ${(quality.reasons || []).join(", ")}`, true);
            lastResponse = await executeUnifiedAI(lastRequest);
            candidate = (!lastResponse.safety?.flagged && lastResponse.structuredPayload)
                ? RoveCoachPlanSchema.safeParse(lastResponse.structuredPayload)
                : null;
            parsedPlan = candidate && candidate.success ? candidate.data : null;
            quality = parsedPlan
                ? evaluateCoachQuality(parsedPlan, phase, energyLevel, signatures, retryCount)
                : {
                    quality_passed: false,
                    retry_count: retryCount,
                    generic_score: 1,
                    duplicate_detected: false,
                    phase_rule_passed: false,
                    reasons: ["retry_invalid_payload_or_safety_flag"]
                };
            console.log("[Rove Coach] Retry quality evaluation:", { 
                passed: quality.quality_passed, 
                reasons: quality.reasons 
            });
        }

        if (!parsedPlan || (qualityGateEnabled && !quality.quality_passed)) {
            console.log("[Rove Coach] RETURNING FALLBACK - parsedPlan:", parsedPlan ? "exists" : "null", "qualityGateEnabled:", qualityGateEnabled, "qualityPassed:", quality.quality_passed);
            console.log("[Rove Coach] Fallback plan: Squats & Pushups");
            if (lastRequest && lastResponse) {
                await logGenerationWithQuality(user?.id, lastRequest, lastResponse, quality);
            }
            return fallback;
        }

        console.log("[Rove Coach] SUCCESS - Returning parsed plan:", parsedPlan?.title);
        if (lastRequest && lastResponse) {
            await logGenerationWithQuality(user?.id, lastRequest, lastResponse, quality);
        }
        return parsedPlan;
    } catch (error) {
        console.error("Rove Coach Unexpected Error:", error);
        return fallback;
    }
}
