import { supabase } from './supabase';
import { calculatePhase, type CycleSettings, type DailyLog } from '@shared/cycle/phase';
import { PHASE_CONTENT } from '@shared/content/phase-content';

function calculateAge(dobString: string): number {
    if (!dobString) return 30; // Default age
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

// BMR (Mifflin-St Jeor) + TDEE calculation
function calculateCycleSyncedCalories(weight: number, height: number, age: number, phase: string): number {
    // Basic BMR for women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    let tdee = bmr * 1.375; // Moderate activity multiplier by default
    
    // Cycle syncing metabolic shifts
    // Luteal phase increases resting metabolic rate by 100-300 kcal
    if (phase === "Luteal") {
        tdee += 150;
    }
    
    return Math.round(tdee);
}

// Phase specific macro distribution
function getPhaseMacros(phase: string, calories: number) {
    let p = 0.25, f = 0.30, c = 0.45; // Default

    switch (phase) {
        case "Menstrual":
            p = 0.30; f = 0.35; c = 0.35; // Higher fat for hormone support, higher protein for blood building
            break;
        case "Follicular":
            p = 0.25; f = 0.25; c = 0.50; // Higher carbs for energy building
            break;
        case "Ovulatory":
            p = 0.25; f = 0.25; c = 0.50; // Higher carbs for peak energy
            break;
        case "Luteal":
            p = 0.25; f = 0.35; c = 0.40; // Higher fat & complex carbs for mood stability and cravings
            break;
    }

    return {
        protein: { g: Math.round((calories * p) / 4), pct: p * 100 },
        fats: { g: Math.round((calories * f) / 9), pct: f * 100 },
        carbs: { g: Math.round((calories * c) / 4), pct: c * 100 }
    };
}

export async function fetchPhaseDetailData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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

    const { data: recentLogs } = await supabase
        .from("daily_logs")
        .select("date, is_period")
        .eq("user_id", user.id)
        .gte("date", new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order("date", { ascending: false });

    const relevantLogs: Record<string, DailyLog> = {};
    if (recentLogs) {
        recentLogs.forEach((l: any) => { relevantLogs[l.date] = { date: l.date, is_period: l.is_period }; });
    }

    const phaseSettings: CycleSettings = {
        last_period_start: cycleSettings.last_period_start,
        cycle_length_days: cycleSettings.cycle_length_days || 28,
        period_length_days: cycleSettings.period_length_days || 5
    };
    const phaseResult = calculatePhase(new Date(), phaseSettings, relevantLogs);
    const phase = phaseResult.phase || "Menstrual";
    const day = phaseResult.day || 1;

    const weight = onboarding?.weight_kg || 60;
    const height = onboarding?.height_cm || 165;
    const age = calculateAge(onboarding?.date_of_birth || "");

    const tdee = calculateCycleSyncedCalories(weight, height, age, phase);
    const macros = getPhaseMacros(phase, tdee);

    return {
        phase,
        day,
        nutrition: {
            macros: macros,
            calories: tdee
        },
        biometrics: {
            reason: `Phase specific adjustments based on ${phase} phase`,
            hydrationGoal: 2,
            recommendedFoods: [],
            foodsToAvoid: [],
            adjustments: [],
            aiPowered: false
        }
    };
}
