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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("Missing GROQ_API_KEY");
        return null;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                temperature: 0.3,
                messages: [
                    {
                        role: "system",
                        content: `You are an empathetic women's health analyst.
            Analyze the user's mood log for the ${phase} phase.

            INPUT: List of moods and frequency.
            OUTPUT: JSON with:
            - "title": 2-3 words, summarizing the vibe (e.g., "Inward & Reflective", "High Energy").
            - "insight": 1-2 short, validating sentences. No advice. No medical claims. Just reflection.

            Tone: Calm, observational, validating.
            `
                    },
                    {
                        role: "user",
                        content: `Moods: ${sortedMoods}`
                    }
                ]
            }),
        });

        if (!response.ok) {
            console.error("Groq API error:", await response.text());
            return null;
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

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
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    try {
        // Prompt is now strictly for relief since we blocked empty symptoms above
        const prompt = `User is in ${phase} phase and reported: ${symptoms.join(", ")}. Give 3 short, specific actionable tips (max 10 words each) to relieve these.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                temperature: 0.4,
                messages: [
                    {
                        role: "system",
                        content: `You are a holistic women's health coach.
            Output JSON: { "tips": ["Tip 1", "Tip 2", "Tip 3"] }`
                    },
                    { role: "user", content: prompt }
                ]
            }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

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

export type RecipeType = "smoothie" | "dish" | "meal_prep";
export type DietPreference = "Veg" | "Non-Veg" | "Vegan" | "Jain";

export interface AIRecipe {
    name: string;
    ingredients: string;
    why: string;
    instructions?: string;
}

export interface GenerateRecipeInput {
    phase: string;
    recipeType: RecipeType;
    dietPreference: DietPreference;
    restrictions: string[];
    customInstruction?: string;
}

export async function generateAIRecipe(input: GenerateRecipeInput): Promise<AIRecipe | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("Missing GROQ_API_KEY");
        return null;
    }

    // Build the prompt
    const recipeTypeLabels: Record<RecipeType, string> = {
        smoothie: "a gut-healthy smoothie",
        dish: "a complete meal/dish",
        meal_prep: "a batch-cook meal prep idea (serves 4-6)"
    };

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

    const prompt = `Create ${recipeTypeLabels[input.recipeType]} recipe for someone in their ${input.phase} phase of the menstrual cycle.

PHASE NUTRITION FOCUS:
${phaseNutrition[input.phase] || phaseNutrition.Menstrual}

DIETARY REQUIREMENT:
${dietGuidelines[input.dietPreference]}
${input.restrictions.length > 0 ? `Additional restrictions: ${input.restrictions.join(", ")}` : ""}

${input.customInstruction ? `USER'S SPECIAL REQUEST: "${input.customInstruction}"` : ""}

Create a delicious, practical recipe they can actually make at home. Use common Indian + international ingredients available in typical kitchens.`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                temperature: 0.7, // Higher for creativity
                max_tokens: 500,
                messages: [
                    {
                        role: "system",
                        content: `You are an expert nutritionist and chef specializing in cycle-syncing nutrition.
Create recipes that are:
- Delicious and practical
- Phase-appropriate (support hormonal balance)
- Easy to make with common ingredients

Return JSON ONLY with this exact structure:
{
    "name": "Creative recipe name (3-5 words)",
    "ingredients": "Comma-separated list of main ingredients (6-10 items)",
    "why": "One sentence explaining why this recipe is perfect for this phase (mention specific nutrients/benefits)"
}`
                    },
                    { role: "user", content: prompt }
                ]
            }),
        });

        if (!response.ok) {
            console.error("Groq API error:", await response.text());
            return null;
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return result as AIRecipe;

    } catch (error) {
        console.error("AI Recipe Generation Error:", error);
        return null;
    }
}
