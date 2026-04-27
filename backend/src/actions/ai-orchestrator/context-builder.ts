import { createClient } from "@/utils/supabase/server";
import { UnifiedAIContextEnvelope } from "../../../../frontend/src/lib/ai/unified-schemas";
import { getCyclePhase } from "../ai-actions/ai-actions";

const CONTEXT_LOG_WINDOW_DAYS = 21;

function uniqueStrings(values: unknown[]): string[] {
    const normalized = values
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean);
    return Array.from(new Set(normalized));
}

function normalizeDietPreference(lifestyle: any, onboarding: any): string {
    if (typeof lifestyle?.diet_preference === "string" && lifestyle.diet_preference.trim()) {
        return lifestyle.diet_preference.trim();
    }

    const onboardingPrefs = uniqueStrings([onboarding?.dietary_preferences]);
    if (onboardingPrefs.length > 0) {
        return onboardingPrefs.join(", ");
    }

    return "not specified";
}

function inferPcosLikePatterns(onboarding: any, cycleSettings: any): boolean {
    const conditionText = uniqueStrings([
        onboarding?.metabolic_conditions,
        onboarding?.conditions
    ]).join(" ").toLowerCase();

    if (conditionText.includes("pcos") || conditionText.includes("pcod")) {
        return true;
    }

    const cycleLength = Number(cycleSettings?.cycle_length_days || 0);
    return Boolean(cycleSettings?.is_irregular) || cycleLength >= 35;
}

/**
 * Derives energy level from recent moods, sleep quality, and current cycle phase.
 * Avoids hardcoding and adapts to actual user data.
 */
function inferEnergyLevel(
    phase: string,
    moods: string[],
    sleepQuality: string[]
): "Low" | "Medium" | "High" {
    const lowEnergyKeywords = ["tired", "exhausted", "fatigued", "drained", "low energy", "sluggish", "weak"];
    const highEnergyKeywords = ["energetic", "motivated", "happy", "excited", "focused", "strong"];
    const poorSleepKeywords = ["poor", "bad", "restless", "insomnia", "disturbed", "terrible"];

    const moodsLower = moods.map(m => m.toLowerCase());
    const sleepLower = sleepQuality.map(s => s.toLowerCase());

    const hasLowSignals = moodsLower.some(m => lowEnergyKeywords.some(k => m.includes(k)))
        || sleepLower.some(s => poorSleepKeywords.some(k => s.includes(k)));
    const hasHighSignals = moodsLower.some(m => highEnergyKeywords.some(k => m.includes(k)));

    if (hasLowSignals) return "Low";
    if (hasHighSignals) return "High";

    // Phase-based default when no mood/sleep signals
    if (phase === "Menstrual") return "Low";
    if (phase === "Ovulatory") return "High";
    return "Medium";
}

/**
 * Builds the unified contextual baseline for an AI request.
 * Fetches the user's current cycle phase, diet, fitness, and recent health signals.
 */
export async function buildUnifiedContext(userId: string): Promise<UnifiedAIContextEnvelope> {
    const supabase = await createClient();
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - CONTEXT_LOG_WINDOW_DAYS);

    // 1. Fetch cycle + profile context in parallel
    const [cyclePhase, lifestyleRes, fitnessRes, onboardingRes, cycleSettingsRes, logsRes] = await Promise.all([
        getCyclePhase(),
        supabase.from("user_lifestyle").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_fitness_profile").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_onboarding").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_cycle_settings")
            .select("last_period_start, cycle_length_days, period_length_days, is_irregular")
            .eq("user_id", userId)
            .maybeSingle(),
        supabase.from("daily_logs")
            .select("symptoms, moods, sleep_quality, date")
            .eq("user_id", userId)
            .gte("date", since.toISOString().split("T")[0])
            .order("date", { ascending: false })
            .limit(CONTEXT_LOG_WINDOW_DAYS)
    ]);

    const lifestyle = lifestyleRes.data;
    const fitness = fitnessRes.data;
    const onboarding = onboardingRes.data;
    const cycleSettings = cycleSettingsRes.data;
    const logs = logsRes.data || [];

    const recentSymptoms = uniqueStrings(logs.map((log: any) => log?.symptoms));
    const recentMoods = uniqueStrings(logs.map((log: any) => log?.moods));
    const recentSleepQuality = uniqueStrings(logs.map((log: any) => log?.sleep_quality));
    const dietaryPreference = normalizeDietPreference(lifestyle, onboarding);

    const phase = cyclePhase?.phase || "Menstrual";

    // Assemble the canonical context Envelope
    return {
        phase,
        dayInCycle: cyclePhase?.dayInCycle || 1,
        averageCycleLength: cycleSettings?.cycle_length_days || cyclePhase?.cycleLength || 28,
        lastPeriodDate: cycleSettings?.last_period_start || undefined,
        periodLengthDays: cycleSettings?.period_length_days || undefined,
        cycleRegularity: cycleSettings?.is_irregular ? "irregular" : "regular",
        hasPcosLikePatterns: inferPcosLikePatterns(onboarding, cycleSettings),
        dietaryPreference,
        dietaryPreferences: dietaryPreference,
        cuisinePreference: typeof lifestyle?.cuisine_preference === "string" ? lifestyle.cuisine_preference : undefined,
        fitnessGoals: fitness?.fitness_goal || lifestyle?.fitness_goal || "maintenance",
        limitations: fitness?.injuries_limitations?.join(", ") || "",
        recentSymptoms,
        recentMoods,
        recentSleepQuality,
        inferredEnergyLevel: inferEnergyLevel(phase, recentMoods, recentSleepQuality)
    };
}
