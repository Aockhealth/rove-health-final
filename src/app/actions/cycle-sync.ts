"use server";

import { createClient } from "@/utils/supabase/server";
import { PHASE_CONTENT } from "@/data/phase-content";
import { getCyclePhase, getDietPlan, type CyclePhaseResponse, type DietPlanResponse } from "./ai-actions";

// --- HELPERS ---

function getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Dynamic Cycle Tracking Logic
 * Calculates the current phase based on the target date and last period start.
 */
function calculatePhase(
    targetDate: Date,
    lastPeriodStart: string,
    cycleLength: number = 28,
    periodLength: number = 5
) {
    const start = new Date(lastPeriodStart);
    const d = new Date(targetDate);
    const s = new Date(start);
    d.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);

    const diffTime = d.getTime() - s.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle += cycleLength;

    const estimatedOvulationDay = cycleLength - 14;

    if (dayInCycle <= periodLength) return { phase: "Menstrual", day: dayInCycle };
    if (dayInCycle < (estimatedOvulationDay - 1)) return { phase: "Follicular", day: dayInCycle };
    if (dayInCycle <= (estimatedOvulationDay + 1)) return { phase: "Ovulatory", day: dayInCycle };
    return { phase: "Luteal", day: dayInCycle };
}


// --- AI ACTIONS ---

/**
 * Generates a scientific and empathetic insight using Groq LLM (llama-3.3-70b-versatile).
 */
export async function generatePhaseAIInsight(phase: string, symptoms: string[]) {
    const apiKey = "REDACTED_API_KEY";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a menstrual health expert. Analyze the user's current phase and symptoms to provide a personalized health report in JSON format.
                        
                        The JSON must contain:
                        1. "insight": A 2-sentence empathetic scientific explanation.
                        2. "moods": Array of 2 strings representing emotional state.
                        3. "focus": Array of 3 strings representing helpful activities.
                        
                        JSON structure: {"insight": "", "moods": [], "focus": []}`
                    },
                    {
                        role: "user",
                        content: `Phase: ${phase}. Symptoms logged: ${symptoms.join(", ") || "No specific symptoms logged yet"}.`
                    }
                ],
                temperature: 0.45
            })
        });

        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content);
        return content;
    } catch (error) {
        console.error("Groq AI Error:", error);
        return null;
    }
}

// --- DATABASE ACTIONS ---

export async function fetchDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // --- MOCK DATA FALLBACK ---
    if (!user) {
        console.log("⚠️ Using Mock Data for Intelligence");
        const mockCycleSettings = { last_period_start: "2025-12-08", cycle_length_days: 28, period_length_days: 5 };

        const { phase, day } = calculatePhase(
            new Date(),
            mockCycleSettings.last_period_start,
            mockCycleSettings.cycle_length_days,
            mockCycleSettings.period_length_days
        );

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

    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    const settings = {
        last_period_start: cycleSettings.last_period_start,
        cycle_length_days: cycleSettings.cycle_length_days || 28,
        period_length_days: cycleSettings.period_length_days || 5
    };

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("tracker_mode, dietary_preferences, metabolic_conditions")
        .eq("user_id", user.id)
        .single();

    // ✅ Use Edge Function for phase calculation
    let phaseData: CyclePhaseResponse | null = null;
    try {
        phaseData = await getCyclePhase();
    } catch (error) {
        console.log("Edge function failed, falling back to local calculation");
    }

    // Fallback to local if edge function fails
    const phase = phaseData?.phase || calculatePhase(
        new Date(),
        settings.last_period_start,
        settings.cycle_length_days,
        settings.period_length_days
    ).phase;

    const day = phaseData?.dayInCycle || calculatePhase(
        new Date(),
        settings.last_period_start,
        settings.cycle_length_days,
        settings.period_length_days
    ).day;

    const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];
    const riverStr = getRandomItems(content.river, 1)[0] || "Rest • Restore • Reload";

    return {
        user: { ...user, name: profile?.full_name || "Rove Member" },
        phase: {
            name: phase,
            day,
            river: riverStr,
            superpower: "Resilience",
            // Add edge function data if available
            hormoneState: phaseData?.hormoneState,
            nextPeriodDate: phaseData?.nextPeriodDate,
            daysUntilNextPeriod: phaseData?.daysUntilNextPeriod,
            aiPowered: !!phaseData
        },
        fuel: getRandomItems(content.fuel, 2),
        move: getRandomItems(content.move, 2),
        rituals: getRandomItems(content.rituals, 2),
        snapshot: getRandomItems(content.snapshot, 1)[0],
        tracker_mode: onboarding?.tracker_mode || "menstruation"
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

    const { data: cycleSettings, error } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error) {
        console.error("Error fetching cycle settings:", error);
        return null;
    }

    return cycleSettings;
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
        .select("tracker_mode, dietary_preferences, metabolic_conditions, date_of_birth, weight_kg, height_cm")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    // 2. Calculate Phase
    const { phase, day } = calculatePhase(
        new Date(),
        cycleSettings.last_period_start,
        cycleSettings.cycle_length_days,
        cycleSettings.period_length_days
    );

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
                protein: nutrition.macros.protein.pct,
                fats: nutrition.macros.fats.pct,
                carbs: nutrition.macros.carbs.pct,
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Fetch cycle settings
    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    // 2. Try to get phase from Edge Function
    let phaseData: CyclePhaseResponse | null = null;
    try {
        phaseData = await getCyclePhase();
    } catch (error) {
        console.log("Edge function failed, falling back to local calculation");
    }

    // Fallback to local calculation if edge function fails
    const phase = phaseData?.phase || calculatePhase(
        new Date(),
        cycleSettings.last_period_start,
        cycleSettings.cycle_length_days,
        cycleSettings.period_length_days
    ).phase;

    const day = phaseData?.dayInCycle || calculatePhase(
        new Date(),
        cycleSettings.last_period_start,
        cycleSettings.cycle_length_days,
        cycleSettings.period_length_days
    ).day;

    // 3. Fetch lifestyle and weight goal data
    const [lifestyleResult, weightGoalResult] = await Promise.all([
        supabase.from("user_lifestyle").select("*").eq("user_id", user.id).single(),
        supabase.from("user_weight_goals").select("*").eq("user_id", user.id).maybeSingle()
    ]);

    const lifestyle = lifestyleResult.data;
    const weightGoal = weightGoalResult.data;

    // 4. Get AI-powered diet plan from Edge Function
    let dietPlan: DietPlanResponse | null = null;
    try {
        dietPlan = await getDietPlan({ phase, symptoms: [] });
    } catch (error) {
        console.log("Diet edge function failed, using fallback");
    }

    const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];

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
            title: phaseData?.hormoneState ? `Hormones ${phaseData.hormoneState}` : "Hormonal State",
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
            core_needs: dietPlan?.recommendedFoods || content.fuel?.map((f: any) => ({ ...f, id: f.title })) || [],
            ideal_meals: content.plan?.diet?.ideal_meals || [],
            cramp_relief: content.plan?.diet?.cramp_relief || [],
            avoid: dietPlan?.foodsToAvoid || content.plan?.diet?.avoid || []
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
                title: dietPlan ? "AI-Optimized" : "Phase-Balanced",
                protein: nutrition.macros.protein.pct,
                fats: nutrition.macros.fats.pct,
                carbs: nutrition.macros.carbs.pct,
                calories: nutrition.calories
            }
        }
    };

    return {
        phase,
        day,
        nutrition,
        biometrics,
        blueprint,
        phaseDetails: phaseData ? {
            hormoneState: phaseData.hormoneState,
            nextPeriodDate: phaseData.nextPeriodDate,
            daysUntilNextPeriod: phaseData.daysUntilNextPeriod,
            fertileWindow: phaseData.fertileWindow
        } : null,
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

export async function fetchInsightsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // --- MOCK DATA FALLBACK ---
    if (!user) {
        console.log("⚠️ Using Mock Data for Insights");
        const mockCycleSettings = { last_period_start: "2025-12-01", cycle_length_days: 28, period_length_days: 5, is_irregular: false };
        const mockStatus = calculatePhase(new Date(), mockCycleSettings.last_period_start);

        return {
            phase: { name: "Follicular", day: 11 },
            averages: { cycle: 28, period: 5, lastPeriodStart: "2025-12-01", isIrregular: false },
            phaseCounts: { "Menstrual": 2, "Follicular": 5, "Ovulatory": 2, "Luteal": 3 },
            symptoms: [{ name: "High Energy", count: 3 }, { name: "Optimism", count: 2 }]
        };
    }

    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    const { data: logs } = await supabase
        .from("daily_logs")
        .select("date, symptoms")
        .eq("user_id", user.id);

    const phaseCounts: Record<string, number> = {
        "Menstrual": 0, "Follicular": 0, "Ovulatory": 0, "Luteal": 0
    };

    const allLoggedSymptoms = new Set<string>();

    if (logs) {
        logs.forEach((log) => {
            // ✅ FIXED: Passed log.date as the targetDate
            const { phase } = calculatePhase(
                new Date(log.date),
                cycleSettings.last_period_start,
                cycleSettings.cycle_length_days,
                cycleSettings.period_length_days
            );
            if (phaseCounts[phase] !== undefined) phaseCounts[phase] += 1;
            log.symptoms?.forEach((s: string) => allLoggedSymptoms.add(s));
        });
    }

    // ✅ FIXED: Added new Date() as the first argument
    const currentStatus = calculatePhase(
        new Date(),
        cycleSettings.last_period_start,
        cycleSettings.cycle_length_days,
        cycleSettings.period_length_days
    );

    return {
        phase: { name: currentStatus.phase, day: currentStatus.day },
        averages: {
            cycle: cycleSettings.cycle_length_days,
            period: cycleSettings.period_length_days,
            lastPeriodStart: cycleSettings.last_period_start,
            isIrregular: cycleSettings.is_irregular
        },
        phaseCounts,
        symptoms: Array.from(allLoggedSymptoms).map(name => ({
            name,
            count: logs?.filter(l => l.symptoms?.includes(name)).length || 0
        }))
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
}

export async function logDailySymptoms(payload: LogDailySymptomsPayload) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    try {
        const { data, error } = await supabase.from("daily_logs").upsert({
            user_id: user.id,
            date: payload.date,
            symptoms: payload.symptoms,
            is_period: payload.isPeriod,
            flow_intensity: payload.flowIntensity || null,
            moods: payload.moods || [],
            notes: payload.notes || "",
            cervical_discharge: payload.cervicalDischarge || null,
            exercise_types: payload.exerciseTypes || [],
            exercise_minutes: payload.exerciseMinutes || null,
            water_intake: payload.waterIntake || 0,
            self_love_tags: payload.selfLoveTags || [],
            self_love_other: payload.selfLoveOther || "",
            sleep_quality: payload.sleepQuality || [],
            sleep_minutes: payload.sleepMinutes || null,
            disruptors: payload.disruptors || [],
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date'
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function updateLastPeriodDate(newDate: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase
        .from("user_cycle_settings")
        .update({
            last_period_start: newDate, // Expecting YYYY-MM-DD string
            updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating period date:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getDailyLog(date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // --- MOCK DATA FALLBACK ---
    if (!user) {
        console.log("⚠️ Using Mock Data for Intelligence");
        const mockCycleSettings = { last_period_start: "2025-12-08", cycle_length_days: 28, period_length_days: 5 }; // Result: Day 12 (Follicular)

        const { phase, day } = calculatePhase(
            new Date(),
            mockCycleSettings.last_period_start,
            mockCycleSettings.cycle_length_days,
            mockCycleSettings.period_length_days
        );

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