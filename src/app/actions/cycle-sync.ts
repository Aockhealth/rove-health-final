"use server";

import { createClient } from "@/utils/supabase/server";

// --- HELPERS ---

// 1. DYNAMIC CYCLE TRACKING LOGIC
function calculatePhase(lastPeriodStart: string, cycleLength: number = 28, periodLength: number = 5) {
    const today = new Date();
    const start = new Date(lastPeriodStart);

    // Normalize dates to ignore time
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate Day in Cycle (1-based)
    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle = 1;

    // BIOLOGICAL LOGIC
    const lutealLength = 14;
    const estimatedOvulationDay = cycleLength - lutealLength;

    let phase = "Luteal";

    if (dayInCycle <= periodLength) {
        phase = "Menstrual";
    } else if (dayInCycle < (estimatedOvulationDay - 1)) {
        phase = "Follicular";
    } else if (dayInCycle <= (estimatedOvulationDay + 1)) {
        phase = "Ovulatory";
    } else {
        phase = "Luteal";
    }

    return { phase, day: dayInCycle };
}

// --- ACTIONS ---

export async function fetchDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch cycle data & profile
    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Correctly fetch name from 'profiles' table
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    // Fetch tracker mode from onboarding
    const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("tracker_mode")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    const { phase, day } = calculatePhase(cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);

    let insights: any[] = [];

    switch (phase) {
        case "Menstrual":
            insights = [
                { title: "Reset Mode", desc: "Energy reflects introspection", icon: "Moon" },
                { title: "Iron Needs", desc: "Replenish lost minerals", icon: "Soup" }
            ];
            break;
        case "Follicular":
            insights = [
                { title: "Rising Energy", desc: "Creativity is peaking", icon: "Zap" },
                { title: "Brain Power", desc: "Learn new skills", icon: "Brain" }
            ];
            break;
        case "Ovulatory":
            insights = [
                { title: "Peak Confidence", desc: "Social magnetism high", icon: "Sparkles" },
                { title: "Verbal Flow", desc: "Great for communication", icon: "Mic" }
            ];
            break;
        case "Luteal":
            insights = [
                { title: "Metabolism Up", desc: "Burning ~200 more cal", icon: "Flame" },
                { title: "Deep Focus", desc: "Detail-oriented work", icon: "CheckCircle2" }
            ];
            break;
        default:
            insights = [
                { title: `Day ${day}`, desc: "Tracking perfectly", icon: "TrendingUp" },
                { title: `${phase} Phase`, desc: "Current status", icon: "Moon" },
            ];
    }

    let fuel: any[] = [];
    let move: any[] = [];
    let riverStr = "";

    // Generic Phase Content Mapping
    switch (phase) {
        case "Menstrual":
            riverStr = "Rest • Restore • Reload";
            fuel = [
                { title: "Bone Broth", desc: "Mineral Replenishment", icon: "Soup" },
                { title: "Dark Chocolate", desc: "Magnesium Boost", icon: "Coffee" }
            ];
            move = [
                { title: "Yin Yoga", desc: "Stretch & Relax", icon: "Moon" },
                { title: "Walking", desc: "Light Movement", icon: "Footprints" }
            ];
            break;
        case "Follicular":
            riverStr = "Dream • Plan • Initiate";
            fuel = [
                { title: "Fermented Foods", desc: "Gut Health", icon: "Beaker" },
                { title: "Avocado", desc: "Healthy Fats", icon: "Leaf" }
            ];
            move = [
                { title: "Cardio Run", desc: "Build Endurance", icon: "Wind" },
                { title: "Dance", desc: "Creative Flow", icon: "Music" }
            ];
            break;
        case "Ovulatory":
            riverStr = "Connect • Shine • Magnetize";
            fuel = [
                { title: "Raw Salads", desc: "Liver Support", icon: "Carrot" },
                { title: "Berries", desc: "Antioxidants", icon: "Sparkles" }
            ];
            move = [
                { title: "HIIT", desc: "Max Intensity", icon: "Zap" },
                { title: "Spin Class", desc: "High Energy", icon: "Bike" }
            ];
            break;
        case "Luteal":
            riverStr = "Complete • Organize • Nest";
            fuel = [
                { title: "Sweet Potato", desc: "Complex Carbs", icon: "Wheat" },
                { title: "Brown Rice", desc: "Mood Stability", icon: "Soup" }
            ];
            move = [
                { title: "Pilates", desc: "Core & Stability", icon: "Activity" },
                { title: "Strength", desc: "Maintenance", icon: "Dumbbell" }
            ];
            break;
        default:
            riverStr = "Balance • Maintain • Flow";
            fuel = [{ title: "Balanced Meal", desc: "Whole Foods", icon: "Utensils" }];
            move = [{ title: "Walking", desc: "Daily Steps", icon: "Footprints" }];
    }

    return {
        user: { ...user, name: profile?.full_name || user.user_metadata?.full_name || "Rove Member" },
        phase: { name: phase, day, river: riverStr },
        insights,
        fuel,
        move,
        tracker_mode: onboarding?.tracker_mode || "menstruation"
    };
}


export interface LogDailySymptomsPayload {
    date: Date;
    symptoms: string[];
    isPeriod: boolean;
    flowIntensity?: string;
}

// UPDATED: Uses upsert to prevent duplicates
export async function logDailySymptoms(payload: LogDailySymptomsPayload) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { success: false, error: "User not authenticated" };
    }

    const { date, symptoms, isPeriod, flowIntensity } = payload;

    try {
        const { data, error } = await supabase.from("daily_logs").upsert({
            user_id: user.id,
            date: date.toISOString(), // Postgres will cast this to DATE type (YYYY-MM-DD)
            symptoms,
            is_period: isPeriod,
            flow_intensity: flowIntensity || null,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date' // This matches the unique constraint we created in SQL
        });

        if (error) {
            console.error("Error logging daily symptoms:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: (err as Error).message };
    }
}

// NEW: Helper to fetch a single day's log for the calendar
export async function getDailyLog(date: Date) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Format date to YYYY-MM-DD to match the DATE column in Postgres
    const searchDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", searchDate)
        .maybeSingle();

    if (error) {
        console.error("Error fetching log:", error);
        return null;
    }

    return data;
}

export async function fetchCycleIntelligence() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch cycle settings for calculation
    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    let phase = "Menstrual";
    let dayInCycle = 1 as number;

    if (cycleSettings) {
        const result = calculatePhase(cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);
        phase = result.phase;
        dayInCycle = result.day;
    }

    // Dynamic Data Generation based on Phase
    let nutrition = {};
    let biometrics = {};

    switch (phase) {
        case "Menstrual":
            nutrition = {
                calories: 1850,
                macros: { protein: { g: 120, pct: 30 }, fats: { g: 70, pct: 35 }, carbs: { g: 180, pct: 35 } },
                hormones: { estrogen: "Low", progesterone: "Low", text: "Baseline" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Higher iron needs during menstruation require nutrient-dense caloric intake." };
            break;
        case "Follicular":
            nutrition = {
                calories: 1950,
                macros: { protein: { g: 130, pct: 30 }, fats: { g: 60, pct: 30 }, carbs: { g: 210, pct: 40 } },
                hormones: { estrogen: "Rising", progesterone: "Low", text: "Building" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Rising estrogen supports higher carbohydrate tolerance and energy for building." };
            break;
        case "Ovulatory":
            nutrition = {
                calories: 2000,
                macros: { protein: { g: 125, pct: 25 }, fats: { g: 65, pct: 30 }, carbs: { g: 220, pct: 45 } },
                hormones: { estrogen: "Peak", progesterone: "Low", text: "Peak" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Peak estrogen helps utilize glycogen; focus on complex carbs and antioxidants." };
            break;
        case "Luteal":
            nutrition = {
                calories: 2100,
                macros: { protein: { g: 135, pct: 30 }, fats: { g: 80, pct: 40 }, carbs: { g: 180, pct: 30 } },
                hormones: { estrogen: "Moderate", progesterone: "Peak", text: "Luteal Peak" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Progesterone increases metabolic rate; higher caloric needs but stable blood sugar is key." };
            break;
        default:
            nutrition = {
                calories: 2000,
                macros: { protein: { g: 120, pct: 30 }, fats: { g: 70, pct: 35 }, carbs: { g: 200, pct: 35 } },
                hormones: { estrogen: "Unknown", progesterone: "Unknown", text: "Unknown" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Balanced nutrition for maintenance." };
    }

    return {
        phase: phase,
        day: dayInCycle,
        nutrition: nutrition,
        biometrics: biometrics
    };
}