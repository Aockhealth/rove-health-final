"use server";

import { createClient } from "@/utils/supabase/server";
import { PHASE_CONTENT } from "@/data/phase-content";
import { getCyclePhase, getDietPlan, type CyclePhaseResponse, type DietPlanResponse } from "./ai-actions";
import { z } from "zod";
import {
    generateMoodInsight,
    generateSymptomTips,
    type MoodInsight,
    type SymptomTips
} from "./ai-actions";
import { calculatePhase as calculatePhaseCanonical, parseLocalDate, type CycleSettings, type DailyLog } from "@shared/cycle/phase";
import { AIService } from "@/lib/ai/service";

export interface AIContext {
    symptoms: string[];
    moods: string[];
    sleep: string[];
    disruptors: string[];
    exercise: string[];
    recentNote?: string;
}

// --- VALIDATION SCHEMAS ---

const DailyLogSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    symptoms: z.array(z.string()).default([]),
    isPeriod: z.boolean(),
    flowIntensity: z.string().optional().nullable(),
    moods: z.array(z.string()).optional().default([]),
    notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional().default(""), // Prevent massive text spam
    cervicalDischarge: z.string().optional().nullable(),
    exerciseTypes: z.array(z.string()).optional().default([]),
    exerciseMinutes: z.number().min(0).max(1440, "Exercise cannot exceed 24 hours").optional().nullable(),
    waterIntake: z.number().min(0).max(50, "Water intake value is too high").optional().nullable(), // Max 50 glasses (~12L) is a safe upper bound
    selfLoveTags: z.array(z.string()).optional().default([]),
    selfLoveOther: z.string().max(200, "Text too long").optional().default(""),
    sleepQuality: z.array(z.string()).optional().default([]),
    sleepMinutes: z.number().min(0).max(1440, "Sleep cannot exceed 24 hours").optional().nullable(),
    disruptors: z.array(z.string()).optional().default([]),
    sexActivity: z.array(z.string()).optional().default([]),
    contraception: z.array(z.string()).optional().default([])
});

// --- HELPERS ---

function getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

const LOG_WINDOW_DAYS = 90;
const SYMPTOM_WINDOW_DAYS = 14;

function extractRecentSymptoms(logs: Array<{ symptoms?: unknown }>): string[] {
    const values = logs
        .flatMap((log) => Array.isArray(log.symptoms) ? log.symptoms : [])
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean);
    return Array.from(new Set(values)).slice(0, 8);
}


// --- AUTO-SYNC HELPERS ---

/**
 * Syncs the period start date to user_cycle_settings when a period is logged.
 * Walks backwards to find the streak start and updates settings if this is a newer period.
 */
async function syncPeriodStartFromLog(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    logDate: string
): Promise<void> {
    try {
        // 1. Fetch recent logs to find streak start
        const { data: recentLogs } = await supabase
            .from("daily_logs")
            .select("date, is_period")
            .eq("user_id", userId)
            .lte("date", logDate)
            .order("date", { ascending: false })
            .limit(45);

        if (!recentLogs || recentLogs.length === 0) return;

        // 2. Walk backwards to find streak start
        let streakStart = logDate;
        const sortedLogs = recentLogs.sort((a, b) => b.date.localeCompare(a.date));

        for (const log of sortedLogs) {
            if (log.date === logDate) continue; // Skip the current log
            if (log.date < logDate) {
                // Check if this is a consecutive day
                const prevDate = parseLocalDate(log.date);
                const currDate = parseLocalDate(streakStart);
                const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1 && log.is_period) {
                    streakStart = log.date;
                } else {
                    break; // Gap found, stop walking
                }
            }
        }

        // 3. Check current settings
        const { data: currentSettings } = await supabase
            .from("user_cycle_settings")
            .select("last_period_start")
            .eq("user_id", userId)
            .single();

        // 4. Update if this is a newer period start
        if (!currentSettings?.last_period_start || streakStart > currentSettings.last_period_start) {
            await supabase
                .from("user_cycle_settings")
                .update({
                    last_period_start: streakStart,
                    updated_at: new Date().toISOString()
                })
                .eq("user_id", userId);

            console.log(`[Auto-Sync] Updated last_period_start to ${streakStart}`);
        }
    } catch (error) {
        // Don't fail the main log operation if sync fails
        console.error("[Auto-Sync] Failed to sync period start:", error);
    }
}



// --- AI ACTIONS ---

/**
 * Generates a scientific and empathetic insight using the unified AIService (Gemini).
 */
export async function generatePhaseAIInsight(
    phase: string,
    context: AIContext
) {
    const safeJoin = (arr?: string[]) =>
        Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "None";

    try {
        const response = await AIService.generate({
            feature: "phase_insight",
            variables: {
                phase,
                symptoms: safeJoin(context.symptoms),
                moods: safeJoin(context.moods),
                sleep: safeJoin(context.sleep),
            }
        });

        if (response.error || !response.data) {
            console.error("[generatePhaseAIInsight] AIService Error:", response.error);
            return null;
        }

        return response.data;
    } catch (error) {
        console.error("[generatePhaseAIInsight] Unexpected Error:", error);
        return null;
    }
}
// --- DATABASE ACTIONS ---

export async function fetchDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // --- MOCK DATA FALLBACK ---
    if (!user) {
        const mockCycleSettings = { last_period_start: "2025-12-08", cycle_length_days: 28, period_length_days: 5 };

        const mockSettings: CycleSettings = {
            last_period_start: mockCycleSettings.last_period_start,
            cycle_length_days: mockCycleSettings.cycle_length_days,
            period_length_days: mockCycleSettings.period_length_days
        };
        const mockPhaseResult = calculatePhaseCanonical(new Date(), mockSettings, {});
        const phase = mockPhaseResult.phase || "Menstrual";
        const day = mockPhaseResult.day || 1;

        const content = PHASE_CONTENT["Follicular"];

        const nutrition = {
            macros: { protein: { g: 100, pct: 30 }, fats: { g: 60, pct: 25 }, carbs: { g: 200, pct: 45 } },
            calories: 1900
        };
        const biometrics = { reason: "Higher protein and fresh veggies to support rising estrogen and energy levels." };

        const blueprint = {
            color: "bg-rove-peach",
            hormones: {
                title: "Hormones Rising",
                summary: "Estrogen is rising, boosting energy.",
                desc: "Your 'inner spring'. Creativity and energy are increasing as follicles mature.",
                symptoms: ["Increasing Energy", "Better Mood", "Curiosity", "Lightness"]
            },
            rituals: {
                focus: "Inner Spring",
                practices: content.rituals || [],
                symptom_relief: []
            },
            diet: {
                core_needs: content.fuel?.map((f: any) => ({ ...f, id: f.title })) || [],
                ideal_meals: content.plan?.diet?.ideal_meals || [],
                cramp_relief: content.plan?.diet?.cramp_relief || [],
                avoid: content.plan?.diet?.avoid || []
            },
            exercise: {
                summary: content.plan?.exercise?.summary || "",
                best: content.move?.map((m: any) => ({ ...m, time: "20-30 mins" })) || [],
                avoid: content.plan?.exercise?.avoid || []
            },
            supplements: content.plan?.supplements || [],
            daily_flow: content.plan?.daily_flow || [],
            nutrition_guide: content.nutrition_guide
        };

        return {
            phase: "Follicular",
            day: 11,
            nutrition,
            biometrics,
            blueprint
        };
    }

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

    // ⚡ MEGA PARALLEL: Fetch ALL dashboard data in one trip
    const [profileResult, onboardingResult, settingsResult, logsResult, lifestyleResult] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("user_onboarding").select("tracker_mode, goals, conditions").eq("user_id", user.id).single(),
        supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_logs").select("date, is_period").eq("user_id", user.id).gte("date", formatDate(pastDate)).order("date", { ascending: false }),
        supabase.from("user_lifestyle").select("diet_preference").eq("user_id", user.id).maybeSingle()
    ]);

    const profile = profileResult.data;
    const onboarding = onboardingResult.data;
    const settings = settingsResult.data;
    const logs = logsResult.data || [];
    const lifestyle = lifestyleResult.data;

    if (!settings) return null;

    // Build log map for smart phase
    const monthLogs: Record<string, DailyLog> = {};
    logs.forEach((l: any) => { monthLogs[l.date] = { date: l.date, is_period: l.is_period }; });

    const phaseSettings: CycleSettings = {
        last_period_start: settings.last_period_start || "",
        cycle_length_days: settings.cycle_length_days || 28,
        period_length_days: settings.period_length_days || 5
    };

    // Calculate phase using canonical shared logic (respects logs + late period)
    const phaseResult = calculatePhaseCanonical(new Date(), phaseSettings, monthLogs);
    const phase = phaseResult.phase || "Menstrual";
    const day = phaseResult.day || 1;

    const cycleLength = settings.cycle_length_days || 28;
    const nextPeriodDate = settings.last_period_start ? (() => {
        const [py, pm, pd] = settings.last_period_start.split('-').map(Number);
        const next = new Date(py, pm - 1, pd);
        next.setDate(next.getDate() + cycleLength);
        return formatDate(next);
    })() : null;

    // Get content for current phase - Optimized Fetch
    const { data: phaseContentData } = await supabase
        .from("phase_content")
        .select("content")
        .eq("phase", phase)
        .single();

    const content = phaseContentData?.content || PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];
    const riverStr = getRandomItems((content as any).river, 1)[0] || "Rest • Restore • Reload";

    return {
        user: { ...user, name: profile?.full_name || "Rove Member" },
        phase: {
            name: phase,
            day: day,
            length: cycleLength,
            nextPeriodDate: nextPeriodDate,
            hormones: "Rising Estrogen",
            symptomFocus: "Energy rising? Time to create.",
        },
        // Unified data for client-side smart phase recalculation
        settings: phaseSettings,
        monthLogs,
        // New educational data for Daily Flow
        nutrients: content.nutrients || [],
        phaseFocus: content.phaseFocus || [],
        // Keep old data for backward compatibility
        fuel: getRandomItems(content.fuel, 2),
        move: getRandomItems(content.move, 2),
        rituals: getRandomItems(content.rituals, 2),
        snapshot: getRandomItems(content.snapshot, 1)[0],
        tracker_mode: onboarding?.tracker_mode || "menstruation",
        onboarding: onboarding,
        lifestyle: lifestyle ? { diet_preference: lifestyle.diet_preference } : null // Added for active diet check
    };
}

export async function fetchUserCycleSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // --- MOCK DATA FALLBACK ---
    if (!user) {
        return {
            last_period_start: "2025-12-01", // Adjust to force Follicular phase (approx 10-14 days ago)
            cycle_length_days: 28,
            period_length_days: 5,
            is_irregular: false
        };
    }

    // ✅ CANONICAL STATE: Use the single source of truth
    const cycleState = await getCanonicalCycleState(user.id);
    if (!cycleState) return null;

    // Return settings with overridden canonical last_period_start
    return {
        ...cycleState.settings,
        last_period_start: cycleState.lastPeriodStart
    };
}

// --- CALORIE & MACRO ALGORITHMS ---

function calculateAge(dob: string): number {
    if (!dob) return 30; // Default age if missing
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateCycleSyncedCalories(
    weight_kg: number,
    height_cm: number,
    age: number,
    phase: string
): number {
    // 1. Calculate BMR (Mifflin-St Jeor for Females)
    // BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161
    const bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    // 2. Define Variables based on Cycle Phase
    let activity_multiplier = 1.2; // Default Sedentary
    let luteal_buffer = 0;

    switch (phase) {
        case "Menstrual":
            // Rest & Restoration. Yoga/walking only.
            activity_multiplier = 1.2;
            luteal_buffer = 0;
            break;
        case "Follicular":
            // Muscle Building. Lifting heavy. Moderate metabolism.
            activity_multiplier = 1.55;
            luteal_buffer = 0;
            break;
        case "Ovulatory":
            // Peak Performance. HIIT/PRs. Very Active.
            activity_multiplier = 1.725;
            luteal_buffer = 0;
            break;
        case "Luteal":
            // Maintenance & Craving Management. Light activity + Thermogenesis.
            activity_multiplier = 1.375;
            // Progesterone raises REE by ~2.5-10% (100-300 kcal).
            luteal_buffer = 200;
            break;
    }

    // 3. Final TDEE
    const tdee = (bmr * activity_multiplier) + luteal_buffer;
    return Math.round(tdee);
}

function getPhaseMacros(phase: string, calories: number) {
    let split = { protein: 0.3, fats: 0.3, carbs: 0.4 }; // Default

    switch (phase) {
        case "Menstrual":
            // 30% P / 40% F / 30% C (Satiety, lower carbs due to inactivity)
            split = { protein: 0.30, fats: 0.40, carbs: 0.30 };
            break;
        case "Follicular":
            // 30% P / 20% F / 50% C (Fuel for muscle hypertrophy)
            split = { protein: 0.30, fats: 0.20, carbs: 0.50 };
            break;
        case "Ovulatory":
            // 25% P / 20% F / 55% C (Peak carb for high intensity)
            split = { protein: 0.25, fats: 0.20, carbs: 0.55 };
            break;
        case "Luteal":
            // 30% P / 30% F / 40% C (Balanced to stabilize blood sugar)
            split = { protein: 0.30, fats: 0.30, carbs: 0.40 };
            break;
    }

    // Convert percentages to grams
    // Protein = 4 kcal/g, Fat = 9 kcal/g, Carb = 4 kcal/g
    return {
        protein: { g: Math.round((calories * split.protein) / 4), pct: Math.round(split.protein * 100) },
        fats: { g: Math.round((calories * split.fats) / 9), pct: Math.round(split.fats * 100) },
        carbs: { g: Math.round((calories * split.carbs) / 4), pct: Math.round(split.carbs * 100) }
    };
}

export async function fetchCycleIntelligence() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // --- MOCK DATA FALLBACK (If no user) ---
    if (!user) {
        return null;
    }

    // 1. Fetch User Data (Cycle + Biometrics)
    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("tracker_mode, goals, conditions, date_of_birth, weight_kg, height_cm")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    // 2. Fetch recent logs for accurate phase calculation (BUG FIX)
    const { data: recentLogs } = await supabase
        .from("daily_logs")
        .select("date, is_period")
        .eq("user_id", user.id)
        .gte("date", new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 45 days
        .order("date", { ascending: false });

    const relevantLogs: Record<string, DailyLog> = {};
    if (recentLogs) {
        recentLogs.forEach((l: any) => { relevantLogs[l.date] = { date: l.date, is_period: l.is_period }; });
    }

    // 3. Calculate Phase using REAL logs (fix for phase mismatch)
    const phaseSettings: CycleSettings = {
        last_period_start: cycleSettings.last_period_start,
        cycle_length_days: cycleSettings.cycle_length_days || 28,
        period_length_days: cycleSettings.period_length_days || 5
    };
    const phaseResult = calculatePhaseCanonical(new Date(), phaseSettings, relevantLogs);
    const phase = phaseResult.phase || "Menstrual";
    const day = phaseResult.day || 1;

    const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];

    // 3. Calculate Personalized Nutrition
    // Defaults if data missing: Weight 60kg, Height 165cm, Age 30
    const weight = onboarding?.weight_kg || 60;
    const height = onboarding?.height_cm || 165;
    const age = calculateAge(onboarding?.date_of_birth || "");

    // Calculate TDEE
    const tdee = calculateCycleSyncedCalories(weight, height, age, phase);
    // Calculate Macros
    const macros = getPhaseMacros(phase, tdee);

    const nutrition = {
        macros: macros,
        calories: tdee
    };

    let biometrics = {
        reason: "Balanced nutrition for general health."
    };

    if (phase === "Menstrual") {
        biometrics.reason = "Focus on iron and warming foods to replenish lost blood and soothe cramps.";
    } else if (phase === "Follicular") {
        biometrics.reason = "High carb & protein to support rising estrogen and muscle repair.";
    } else if (phase === "Ovulatory") {
        biometrics.reason = "Peak carbohydrates to sustain high-intensity performance.";
    } else if (phase === "Luteal") {
        biometrics.reason = "Complex carbs and magnesium to combat PMS cravings and stabilize mood.";
    }

    // Map PHASE_CONTENT to the structure expected by the page (BLUEPRINTS format)
    const blueprint = {
        color: phase === "Menstrual" ? "bg-rove-red" :
            phase === "Follicular" ? "bg-rove-peach" :
                phase === "Ovulatory" ? "bg-rove-charcoal" : "bg-amber-500",
        hormones: {
            title: content.snapshot?.[0]?.hormones?.title || "Hormonal State",
            summary: content.plan?.hormones?.summary || "",
            desc: content.snapshot?.[0]?.hormones?.desc || "",
            symptoms: content.plan?.hormones?.symptoms || []
        },
        rituals: {
            focus: content.river?.[0] || "Rest & Restore",
            practices: content.rituals || [],
            symptom_relief: []
        },
        diet: {
            core_needs: content.fuel?.map((f: any) => ({ ...f, id: f.title })) || [],
            ideal_meals: content.plan?.diet?.ideal_meals || [],
            cramp_relief: content.plan?.diet?.cramp_relief || [],
            avoid: content.plan?.diet?.avoid || []
        },
        exercise: {
            summary: content.plan?.exercise?.summary || "",
            best: content.move?.map((m: any) => ({ ...m, time: "20-30 mins" })) || [],
            avoid: content.plan?.exercise?.avoid || []
        },
        supplements: content.plan?.supplements || [],
        daily_flow: content.plan?.daily_flow || [],
        nutrition_guide: {
            ...content.nutrition_guide,
            macro_fuel: {
                title: "Ideally Balanced",
                protein: nutrition.macros.protein.g,
                fats: nutrition.macros.fats.g,
                carbs: nutrition.macros.carbs.g,
                calories: nutrition.calories
            }
        }
    };

    return {
        phase,
        day,
        nutrition,
        biometrics,
        blueprint: blueprint
    };
}

// ==========================================
// NEW: AI-POWERED CYCLE INTELLIGENCE
// Uses Edge Functions for phase, diet, and workout
// ==========================================

// (imports are now at top of file)
export async function fetchCycleIntelligenceAI() {
    const supabase = await createClient();
    const { data: { user } = {} } = await supabase.auth.getUser();

    if (!user) return null;

    // ✅ CANONICAL STATE: Use the single source of truth
    const cycleState = await getCanonicalCycleState(user.id);
    if (!cycleState) return null;

    const { phase, day, nextPeriodDate, cycleLength, settings: cycleSettings } = cycleState;

    const symptomSince = new Date();
    symptomSince.setDate(symptomSince.getDate() - SYMPTOM_WINDOW_DAYS);

    // Pull profile + recent symptom logs first, then feed symptoms into AI diet generation.
    const [lifestyleResult, weightGoalResult, symptomLogResult] = await Promise.all([
        supabase.from("user_lifestyle").select("*").eq("user_id", user.id).single(),
        supabase.from("user_weight_goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
            .from("daily_logs")
            .select("symptoms,date")
            .eq("user_id", user.id)
            .gte("date", formatDate(symptomSince))
            .order("date", { ascending: false })
            .limit(SYMPTOM_WINDOW_DAYS)
    ]);

    const lifestyle = lifestyleResult.data;
    const weightGoal = weightGoalResult.data;
    const recentSymptoms = extractRecentSymptoms((symptomLogResult.data || []) as Array<{ symptoms?: unknown }>);
    const dietPlan = await getDietPlan({ phase, symptoms: recentSymptoms }).catch(() => null);

    // ✅ FETCH CONTENT FROM DB (phase_content table)
    const content = await getPhaseContentFromDB(phase);

    // Helper to get random items
    const getRandom = (arr: any[], count: number) => {
        if (!arr || arr.length === 0) return [];
        return arr.sort(() => 0.5 - Math.random()).slice(0, count);
    };

    // Build nutrition data - prefer AI, fallback to local
    const nutrition = dietPlan ? {
        macros: {
            protein: { g: dietPlan.macros.protein.grams, pct: dietPlan.macros.protein.percentage },
            fats: { g: dietPlan.macros.fats.grams, pct: dietPlan.macros.fats.percentage },
            carbs: { g: dietPlan.macros.carbs.grams, pct: dietPlan.macros.carbs.percentage }
        },
        calories: dietPlan.calories
    } : (() => {
        const { data: onboarding } = { data: null } as any;
        const weight = 60;
        const height = 165;
        const age = 30;
        const tdee = calculateCycleSyncedCalories(weight, height, age, phase);
        const macros = getPhaseMacros(phase, tdee);
        return { macros, calories: tdee };
    })();

    const biometrics = {
        reason: dietPlan?.phaseNutritionFocus || getDefaultBiometricsReason(phase),
        hydrationGoal: dietPlan?.hydrationGoalLiters || 2,
        recommendedFoods: dietPlan?.recommendedFoods || [],
        foodsToAvoid: dietPlan?.foodsToAvoid || [],
        adjustments: dietPlan?.adjustments || [],
        aiPowered: !!dietPlan
    };

    // Blueprint structure for UI
    const blueprint = {
        color: phase === "Menstrual" ? "bg-rove-red" :
            phase === "Follicular" ? "bg-rove-peach" :
                phase === "Ovulatory" ? "bg-rove-charcoal" : "bg-amber-500",
        hormones: {
            title: "Hormonal State",
            summary: content.plan?.hormones?.summary || "",
            desc: content.snapshot?.[0]?.hormones?.desc || "",
            symptoms: content.plan?.hormones?.symptoms || []
        },
        rituals: {
            focus: content.river?.[0] || "Rest & Restore",
            practices: getRandom(content.rituals, 2),
            symptom_relief: []
        },
        diet: {
            core_needs: getRandom(content.fuel, 2), // Use dynamic fuel items here
            ideal_meals: content.plan?.diet?.ideal_meals || [],
            cramp_relief: content.plan?.diet?.cramp_relief || [],
            avoid: dietPlan?.foodsToAvoid || content.plan?.diet?.avoid || []
        },
        exercise: {
            summary: content.plan?.exercise?.summary || "",
            // Map DB 'move' items to the UI format if needed, or just pass them if compatible
            best: getRandom(content.move, 2).map((m: any) => ({
                title: m.title,
                desc: m.description,
                time: "20-30 mins",
                icon: m.icon
            })),
            avoid: content.plan?.exercise?.avoid || []
        },
        supplements: content.plan?.supplements || [],
        daily_flow: content.plan?.daily_flow || [],
        nutrition_guide: {
            ...content.nutrition_guide,
            macro_fuel: {
                title: dietPlan ? "AI-Optimized" : "Phase-Balanced",
                protein: nutrition.macros.protein.g,
                fats: nutrition.macros.fats.g,
                carbs: nutrition.macros.carbs.g,
                calories: nutrition.calories
            }
        }
    };

    return {
        phase,
        day,
        nextPeriodDate: nextPeriodDate, // Exposed for parity
        nutrition,
        biometrics,
        blueprint,
        phaseDetails: null, // Removed Edge Function call for performance
        settings: cycleSettings, // ✅ EXPOSE SETTINGS FOR CLIENT-SIDE RECALCULATION
        aiPowered: !!dietPlan,
        weightGoal: weightGoal ? {
            currentWeight: lifestyle?.weight_kg || weightGoal.current_weight_kg,
            targetWeight: weightGoal.target_weight_kg,
            startWeight: weightGoal.current_weight_kg,
            weeklyRate: weightGoal.weekly_rate_kg,
            startDate: weightGoal.start_date,
            fitnessGoal: lifestyle?.fitness_goal
        } : null
    };
}

function getDefaultBiometricsReason(phase: string): string {
    switch (phase) {
        case "Menstrual":
            return "Focus on iron and warming foods to replenish lost blood and soothe cramps.";
        case "Follicular":
            return "High carb & protein to support rising estrogen and muscle repair.";
        case "Ovulatory":
            return "Peak carbohydrates to sustain high-intensity performance.";
        case "Luteal":
            return "Complex carbs and magnesium to combat PMS cravings and stabilize mood.";
        default:
            return "Balanced nutrition for general health.";
    }
}

// ==========================================================
// ⚡ FAST: UNIFIED PLAN PAGE DATA (Single Trip, Max Parallelization)
// ==========================================================
export async function fetchPlanPageDataFast() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // ⚡ MEGA PARALLEL: Fetch ALL data in ONE trip
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

    const [
        settingsResult,
        logsResult,
        lifestyleResult,
        weightGoalResult,
        onboardingResult
    ] = await Promise.all([
        supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_logs").select("date, is_period").eq("user_id", user.id).gte("date", formatDate(pastDate)).order("date", { ascending: false }),
        supabase.from("user_lifestyle").select("*").eq("user_id", user.id).single(),
        supabase.from("user_weight_goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_onboarding").select("goals, conditions").eq("user_id", user.id).maybeSingle()
    ]);

    const settings = settingsResult.data;
    const lifestyle = lifestyleResult.data;
    const weightGoal = weightGoalResult.data;
    const onboarding = onboardingResult.data;
    const logs = logsResult.data || [];



    if (!settings) return null;

    // Build log map for smart phase
    const monthLogs: Record<string, DailyLog> = {};
    logs.forEach((l: any) => { monthLogs[l.date] = { date: l.date, is_period: l.is_period }; });

    const phaseSettings: CycleSettings = {
        last_period_start: settings.last_period_start,
        cycle_length_days: settings.cycle_length_days || 28,
        period_length_days: settings.period_length_days || 5
    };

    // Calculate phase using canonical shared logic (respects logs + late period)
    const phaseResult = calculatePhaseCanonical(new Date(), phaseSettings, monthLogs);
    const phase = phaseResult.phase || "Menstrual";
    const day = phaseResult.day || 1;

    // Get content for current phase - Optimized Fetch
    const { data: phaseContentData } = await supabase
        .from("phase_content")
        .select("content")
        .eq("phase", phase)
        .single();

    const content = phaseContentData?.content || PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];

    // Build unified response
    return {
        // Cycle data
        phase,
        day,
        settings: phaseSettings,
        monthLogs,

        // Lifestyle data
        lifestyle: lifestyle ? {
            weight_kg: lifestyle.weight_kg,
            height_cm: lifestyle.height_cm,
            activity_level: lifestyle.activity_level,
            diet_preference: lifestyle.diet_preference,
            fitness_goal: lifestyle.fitness_goal
        } : null,

        // Onboarding (Diet)
        onboarding: onboarding
            ? {
                goals: onboarding.goals || [],
                conditions: onboarding.conditions || []
            }
            : null,

        // Weight goal data
        weightGoal: weightGoal ? {
            currentWeight: lifestyle?.weight_kg || weightGoal.current_weight_kg,
            targetWeight: weightGoal.target_weight_kg,
            startWeight: weightGoal.current_weight_kg,
            weeklyRate: weightGoal.weekly_rate_kg,
            startDate: weightGoal.start_date,
            fitnessGoal: lifestyle?.fitness_goal
        } : null,

        // Phase content (blueprint)
        blueprint: {
            color: phase === "Menstrual" ? "bg-rove-red" :
                phase === "Follicular" ? "bg-rove-peach" :
                    phase === "Ovulatory" ? "bg-rove-charcoal" : "bg-amber-500",
            hormones: {
                title: "Hormonal State",
                summary: content.plan?.hormones?.summary || "",
                desc: content.snapshot?.[0]?.hormones?.desc || "",
                symptoms: content.plan?.hormones?.symptoms || []
            },
            rituals: {
                focus: content.river?.[0] || "Rest & Restore",
                practices: content.rituals || [],
                symptom_relief: content.plan?.rituals?.symptom_relief || []
            },
            diet: {
                core_needs: content.fuel || [],
                ideal_meals: content.plan?.diet?.ideal_meals || [],
                cramp_relief: content.plan?.diet?.cramp_relief || [],
                avoid: content.plan?.diet?.avoid || []
            },
            exercise: {
                summary: content.plan?.exercise?.summary || "",
                best: content.move || [],
                avoid: content.plan?.exercise?.avoid || []
            },
            supplements: content.plan?.supplements || [],
            daily_flow: content.plan?.daily_flow || [],
            nutrition_guide: content.nutrition_guide || {}
        },

        biometrics: {
            reason: getDefaultBiometricsReason(phase)
        }
    };
}

// ==========================================================
// ⚡ FAST: UNIFIED TRACKER PAGE DATA (Single Trip)
// ==========================================================
export async function fetchTrackerPageDataFast(selectedDateStr?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get 90 days of logs (covers prev/current/next months + history for streak)
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - LOG_WINDOW_DAYS);

    // ⚡ MEGA PARALLEL: Fetch ALL tracker data in one trip
    const [settingsResult, logsResult, todayLogResult] = await Promise.all([
        supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).gte("date", pastDate.toISOString().split('T')[0]).order("date", { ascending: false }),
        selectedDateStr
            ? supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", selectedDateStr).maybeSingle()
            : Promise.resolve({ data: null })
    ]);

    const settings = settingsResult.data;
    const allLogs = logsResult.data || [];

    if (!settings) return null;

    // Build log map for calendar
    const monthLogs: Record<string, any> = {};
    allLogs.forEach((l: any) => {
        monthLogs[l.date] = l;
    });

    return {
        settings: {
            last_period_start: settings.last_period_start,
            cycle_length_days: settings.cycle_length_days || 28,
            period_length_days: settings.period_length_days || 5,
        },
        monthLogs,
        selectedDayLog: todayLogResult.data,
        hasSettings: !!settings.last_period_start
    };
}

// ==========================================================
// FETCH INSIGHTS DATA (Main Function)
// ==========================================================
export async function fetchInsightsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: cycleSettings } = await supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single();
    if (!cycleSettings) return null;

    // ✅ UPDATE: Select ALL relevant columns
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

    const { data: logs } = await supabase
        .from("daily_logs")
        .select("date, is_period, symptoms, moods, sleep_quality, disruptors, exercise_types, notes")
        .eq("user_id", user.id)
        .gte("date", formatDate(pastDate))
        .order('date', { ascending: false }); // Get newest first for "Recent Note"

    const phases = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];
    const phaseCounts: Record<string, number> = { "Menstrual": 0, "Follicular": 0, "Ovulatory": 0, "Luteal": 0 };
    const symptomsByPhase: Record<string, Record<string, number>> = {
        "Menstrual": {}, "Follicular": {}, "Ovulatory": {}, "Luteal": {}
    };
    const moodsByPhase: Record<string, Record<string, number>> = {
        "Menstrual": {}, "Follicular": {}, "Ovulatory": {}, "Luteal": {}
    };

    // Aggregation Sets
    const allSymptoms = new Set<string>();
    const allMoods = new Set<string>();
    const allSleep = new Set<string>();
    const allDisruptors = new Set<string>();
    const allExercise = new Set<string>();
    let mostRecentNote = "";

    const phaseSettings: CycleSettings = {
        last_period_start: cycleSettings.last_period_start,
        cycle_length_days: cycleSettings.cycle_length_days || 28,
        period_length_days: cycleSettings.period_length_days || 5
    };

    const monthLogs: Record<string, DailyLog> = {};
    if (logs) {
        logs.forEach((log: any) => {
            monthLogs[log.date] = { date: log.date, is_period: log.is_period };
        });
    }

    if (logs) {
        // Grab the most recent non-empty note
        const noteLog = logs.find(l => l.notes && l.notes.length > 0);
        if (noteLog) mostRecentNote = noteLog.notes;

        logs.forEach((log) => {
            const phaseResult = calculatePhaseCanonical(parseLocalDate(log.date), phaseSettings, monthLogs);
            const phase = phaseResult.phase || "Menstrual";
            if (phaseCounts[phase] !== undefined) phaseCounts[phase] += 1;

            // Group symptoms by phase
            log.symptoms?.forEach((s: string) => {
                allSymptoms.add(s);
                symptomsByPhase[phase][s] = (symptomsByPhase[phase][s] || 0) + 1;
            });

            // Group moods by phase
            log.moods?.forEach((m: string) => {
                allMoods.add(m);
                moodsByPhase[phase][m] = (moodsByPhase[phase][m] || 0) + 1;
            });

            // Collect all tags found in logs
            log.sleep_quality?.forEach((s: string) => allSleep.add(s));
            log.disruptors?.forEach((d: string) => allDisruptors.add(d));
            log.exercise_types?.forEach((e: string) => allExercise.add(e));
        });
    }

    const currentStatusResult = calculatePhaseCanonical(new Date(), phaseSettings, monthLogs);
    const currentStatus = {
        phase: currentStatusResult.phase || "Menstrual",
        day: currentStatusResult.day || 1
    };

    // Generate tips from PHASE_CONTENT
    const tipsByPhase: Record<string, string[]> = {};
    phases.forEach(p => {
        const content = PHASE_CONTENT[p];
        if (content) {
            tipsByPhase[p] = content.plan?.hormones?.symptoms || [];
        }
    });

    // Generate simple emotional baseline insights
    const emotionalBaselines: Record<string, { title: string; insight: string }> = {};
    phases.forEach(p => {
        const moods = moodsByPhase[p];
        const topMoods = Object.entries(moods)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([name]) => name);

        if (topMoods.length > 0) {
            emotionalBaselines[p] = {
                title: `${topMoods.join(" & ")} Dominates`,
                insight: `During your ${p} phase, you frequently experience ${topMoods.join(" and ")}. This is consistent with rising hormone levels.`
            };
        } else {
            emotionalBaselines[p] = {
                title: "Steady State",
                insight: `No significant mood patterns detected for the ${p} phase yet. Keep logging to unlock insights.`
            };
        }
    });

    return {
        phase: { name: currentStatus.phase, day: currentStatus.day },
        averages: {
            cycle: cycleSettings.cycle_length_days,
            period: cycleSettings.period_length_days,
            lastPeriodStart: cycleSettings.last_period_start,
            isIrregular: cycleSettings.is_irregular
        },
        phaseCounts,
        symptomsByPhase,
        tipsByPhase,
        emotionalBaselines,
        // Return full context objects for the UI or AI to use
        symptoms: Array.from(allSymptoms).map(name => ({ name, count: 1 })), // Simplified count for now
        aggregatedData: {
            moods: Array.from(allMoods),
            sleep: Array.from(allSleep),
            disruptors: Array.from(allDisruptors),
            exercise: Array.from(allExercise),
            recentNote: mostRecentNote
        }
    };
}

export interface LogDailySymptomsPayload {
    date: string;
    symptoms: string[];
    isPeriod: boolean;
    flowIntensity?: string;
    moods?: string[];
    notes?: string;
    cervicalDischarge?: string;
    exerciseTypes?: string[];
    exerciseMinutes?: number | null;
    waterIntake?: number | null;
    selfLoveTags?: string[];
    selfLoveOther?: string;
    sleepQuality?: string[];
    sleepMinutes?: number | null;
    disruptors?: string[];
    sexActivity?: string[];
    contraception?: string[];
}
export async function logDailySymptoms(payload: LogDailySymptomsPayload) {
    // ✅ VALIDATION: Strict Zod check
    const validation = DailyLogSchema.safeParse(payload);

    // Check success FIRST
    if (!validation.success) {
        // Now TypeScript knows validation.error exists
        return { success: false, error: validation.error.issues[0].message };
    }

    const safeData = validation.data; // Use the validated data

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    try {
        const { data, error } = await supabase.from("daily_logs").upsert({
            user_id: user.id,
            date: safeData.date,
            symptoms: safeData.symptoms,
            is_period: safeData.isPeriod,
            flow_intensity: safeData.flowIntensity || null,
            moods: safeData.moods || [],
            notes: safeData.notes || "",
            cervical_discharge: safeData.cervicalDischarge || null,
            exercise_types: safeData.exerciseTypes || [],
            exercise_minutes: safeData.exerciseMinutes || null,
            water_intake: safeData.waterIntake || 0,
            self_love_tags: safeData.selfLoveTags || [],
            self_love_other: safeData.selfLoveOther || "",
            sleep_quality: safeData.sleepQuality || [],
            sleep_minutes: safeData.sleepMinutes || null,
            disruptors: safeData.disruptors || [],
            sex_activity: safeData.sexActivity || [],
            contraception: safeData.contraception || [],
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date'
        }).select().single();

        if (error) return { success: false, error: error.message };

        // Auto-sync period start when period is logged
        if (safeData.isPeriod) {
            await syncPeriodStartFromLog(supabase, user.id, safeData.date);
        }

        return { success: true, data };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function updateLastPeriodDate(newDate: string) {
    // ✅ VALIDATION
    const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
    const result = dateSchema.safeParse(newDate);

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message };
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    console.log("🔧 SERVER: Updating last_period_start to:", newDate, "for user:", user.id);

    const { error, data } = await supabase
        .from("user_cycle_settings")
        .update({ last_period_start: newDate, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select();

    console.log("🔧 SERVER: Update result - error:", error, "data:", data);

    if (error) return { success: false, error: error.message };

    // Verify the update by fetching back
    const { data: verifyData } = await supabase
        .from("user_cycle_settings")
        .select("last_period_start")
        .eq("user_id", user.id)
        .single();

    console.log("🔧 SERVER: Verification - last_period_start is now:", verifyData?.last_period_start);

    return { success: true, updatedTo: verifyData?.last_period_start };
}

export async function getDailyLog(date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // --- MOCK DATA FALLBACK ---
    if (!user) {
        const mockCycleSettings = { last_period_start: "2025-12-08", cycle_length_days: 28, period_length_days: 5 }; // Result: Day 12 (Follicular)

        const mockSettings: CycleSettings = {
            last_period_start: mockCycleSettings.last_period_start,
            cycle_length_days: mockCycleSettings.cycle_length_days,
            period_length_days: mockCycleSettings.period_length_days
        };
        const mockPhaseResult = calculatePhaseCanonical(new Date(), mockSettings, {});
        const phase = mockPhaseResult.phase || "Menstrual";
        const day = mockPhaseResult.day || 1;

        const content = PHASE_CONTENT["Follicular"];

        // Mock Nutrition
        const nutrition = {
            macros: { protein: { g: 100, pct: 30 }, fats: { g: 60, pct: 25 }, carbs: { g: 200, pct: 45 } },
            calories: 1900
        };
        const biometrics = { reason: "Higher protein and fresh veggies to support rising estrogen and energy levels." };

        const blueprint = {
            color: "bg-rove-peach",
            hormones: {
                title: "Hormones Rising",
                summary: "Estrogen is rising, boosting energy.",
                desc: "Your 'inner spring'. Creativity and energy are increasing as follicles mature.",
                symptoms: ["Increasing Energy", "Better Mood", "Curiosity", "Lightness"]
            },
            rituals: {
                focus: "Inner Spring",
                practices: content.rituals || [],
                symptom_relief: []
            },
            diet: {
                core_needs: content.fuel?.map((f: any) => ({ ...f, id: f.title })) || [],
                ideal_meals: content.plan?.diet?.ideal_meals || [],
                cramp_relief: content.plan?.diet?.cramp_relief || [],
                avoid: content.plan?.diet?.avoid || []
            },
            exercise: {
                summary: content.plan?.exercise?.summary || "",
                best: content.move?.map((m: any) => ({ ...m, time: "20-30 mins" })) || [],
                avoid: content.plan?.exercise?.avoid || []
            },
            supplements: content.plan?.supplements || [],
            daily_flow: content.plan?.daily_flow || [],
            nutrition_guide: content.nutrition_guide
        };

        return {
            phase: "Follicular",
            day: 11,
            nutrition,
            biometrics,
            blueprint
        };
    }

    const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();
    return data;
}

export async function updateCycleLength(periodLength?: number, cycleLength?: number, isIrregular?: boolean) {
    // ✅ VALIDATION: Cycle length logic
    if (periodLength && (periodLength < 1 || periodLength > 15)) {
        return { success: false, error: "Period length must be between 1 and 15 days" };
    }
    if (cycleLength && (cycleLength < 15 || cycleLength > 100)) {
        return { success: false, error: "Cycle length must be between 15 and 100 days" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const updates: any = { updated_at: new Date().toISOString() };
    if (periodLength) updates.period_length_days = periodLength;
    if (cycleLength) updates.cycle_length_days = cycleLength;
    if (isIrregular !== undefined) updates.is_irregular = isIrregular;

    const { error } = await supabase
        .from("user_cycle_settings")
        .update(updates)
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function fetchMonthLogs(monthStr: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Parse YYYY-MM
    const [yearStr, monthNumStr] = monthStr.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthNumStr);

    // Calculate start and end range
    // Start: YYYY-MM-01
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    // End: Start of next month
    // Handle December wrap around
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = year + 1;
    }
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lt("date", endDate);

    if (error) {
        return [];
    }

    return data || [];
}


// Add this new function at the end of your file
// DEAD CODE REMOVED: fetchMonthsLogsBulk, getCycleIntelligenceCached, fetchInsightsDataOptimized
// These RPC wrappers were not used by the app and caused confusion. 
// We use direct Supabase queries in fetchPlanPageDataFast / fetchTrackerPageDataFast instead.

// Helper function for formatting date
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Helper: CMS Content Strategy ---
async function getPhaseContentFromDB(phase: string): Promise<any> {
    const supabase = await createClient();

    // 1. Try to fetch from Supabase
    const { data, error } = await supabase
        .from('phase_content')
        .select('content')
        .eq('phase', phase)
        .single();

    // 2. If valid data exists, return it
    if (data?.content) {
        return data.content;
    }

    // 3. Fallback: Use static content & seed ALL phases (Bulk Seed)
    // If one is missing, we assume the DB might need a full refresh.
    const staticContent = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];

    // Trigger background seeding for ALL phases
    (async () => {
        console.log("🌱 Triggering bulk seed for all phases...");
        const phases = Object.keys(PHASE_CONTENT);
        for (const p of phases) {
            const { error } = await supabase.from('phase_content').upsert({
                phase: p,
                content: PHASE_CONTENT[p] as any,
                updated_at: new Date().toISOString()
            });
            if (!error) console.log(`✅ Auto-seeded content for ${p}`);
            else if (error.code !== '42501') console.error(`Failed to seed ${p}:`, error.message);
        }
    })(); // End of IIFE

    return staticContent;
}

// ✅ UNIFIED CYCLE STATE: The Single Source of Truth
export async function getCanonicalCycleState(userId: string) {
    const supabase = await createClient();

    // ✅ OPTIMIZED: Parallel fetch of settings and logs
    const [settingsResult, logsResult] = await Promise.all([
        supabase
            .from("user_cycle_settings")
            .select("*")
            .eq("user_id", userId)
            .single(),
        supabase
            .from("daily_logs")
            .select("date")
            .eq("user_id", userId)
            .eq("is_period", true)
            .order("date", { ascending: false })
            .limit(10) // Check last 10 period days
    ]);

    const settings = settingsResult.data;
    const recentLogs = logsResult.data;

    // Convert logs to map for canonical calculation
    const monthLogs: Record<string, DailyLog> = {};
    if (recentLogs) {
        recentLogs.forEach((l: any) => {
            // We only fetched date from the query above, so is_period is implicitly true (based on filter) 
            // BUT calculatePhaseCanonical expects { date, is_period }.
            monthLogs[l.date] = { date: l.date, is_period: true };
        });
    }

    if (!settings) return null;

    let lastPeriodStart = settings.last_period_start;
    const periodLength = settings.period_length_days || 5;
    const cycleLength = settings.cycle_length_days || 28;

    if (recentLogs && recentLogs.length > 0) {
        // Sort explicitly descending just in case
        const dates = recentLogs.map(l => l.date).sort().reverse();
        const latestDate = dates[0]; // e.g., "2026-01-29"

        // ALWAYS calculate streak start from the latest log
        // This ensures we fix cases where settings = latestDate (Day 1) but should be streakStart (Day 2+)
        let streakStart = latestDate;
        const dateSet = new Set(dates);

        // Helper to subtract days
        const getPrevDay = (dStr: string) => {
            const [y, m, d] = dStr.split('-').map(Number);
            const prev = new Date(y, m - 1, d - 1);
            const py = prev.getFullYear();
            const pm = String(prev.getMonth() + 1).padStart(2, '0');
            const pd = String(prev.getDate()).padStart(2, '0');
            return `${py}-${pm}-${pd}`;
        };

        let current = latestDate;
        while (true) {
            const prev = getPrevDay(current);
            if (dateSet.has(prev)) {
                current = prev;
            } else {
                break;
            }
        }
        streakStart = current;

        // If the calculated streak start differs from what's in settings, UPDATE IT
        // This covers:
        // 1. Settings too old (lagging)
        // 2. Settings too new (incorrectly set to latest date instead of start)
        if (streakStart !== lastPeriodStart) {
            lastPeriodStart = streakStart;

            // Background update - AWAIT this to prevent race conditions (BUG FIX)
            await supabase.from("user_cycle_settings")
                .update({ last_period_start: lastPeriodStart, updated_at: new Date().toISOString() })
                .eq("user_id", userId);
        }
    }

    // 4. Calculate Phase
    const phaseSettings: CycleSettings = {
        last_period_start: lastPeriodStart || "",
        cycle_length_days: cycleLength,
        period_length_days: periodLength
    };
    const phaseResult = calculatePhaseCanonical(new Date(), phaseSettings, monthLogs);



    // 5. Calculate Next Period
    // Use the same robust parsing for next period calculation
    const nextPeriodDateStr = lastPeriodStart ? (() => {
        const [py, pm, pd] = lastPeriodStart.split('-').map(Number);
        const nextPeriodDateFallback = new Date(py, pm - 1, pd);
        nextPeriodDateFallback.setDate(nextPeriodDateFallback.getDate() + cycleLength);
        return formatDate(nextPeriodDateFallback);
    })() : null;

    return {
        phase: phaseResult.phase || "Menstrual",
        day: phaseResult.day || 1,
        lastPeriodStart,
        nextPeriodDate: nextPeriodDateStr,
        cycleLength,
        periodLength,
        settings // return original settings object if needed
    };
}
