"use server";

import { createClient } from "@/utils/supabase/server";
import { AIService } from "../../../../../frontend/src/lib/ai/service";

// ============================================
// TYPES
// ============================================

export type MoodInsight = {
    title: string;
    insight: string;
};

export type SymptomTips = {
    tips: string[];
};

export interface AIContext {
    symptoms: string[];
    moods: string[];
    sleep: string[];
    disruptors: string[];
    exercise: string[];
    recentNote?: string;
}

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

// ============================================
// SYMPTOM TIPS GENERATOR
// ============================================

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

// ============================================
// PHASE AI INSIGHT GENERATOR
// ============================================

/**
 * Generates a scientific and empathetic insight using Groq LLM (llama-3.3-70b-versatile).
 */
export async function generatePhaseAIInsight(
    phase: string,
    context: AIContext
) {
    const safeJoin = (arr?: string[]) =>
        Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "None";

    try {
        const response = await AIService.generate<any>({
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
        console.error("AI Generation Error:", error);
        return null;
    }
}