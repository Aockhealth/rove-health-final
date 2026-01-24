"use server";

import { createClient } from "@/utils/supabase/server";

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
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error("❌ Missing GROQ_API_KEY. AI features disabled.");
        return null;
    }

    const safeJoin = (arr?: string[]) =>
        Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "None";

    // ✅ CHECK: Do we have symptoms logged for this phase?
    const hasData = context.symptoms.length > 0;

    let systemPrompt = "";
    let userContextString = "";

    if (hasData) {
        // --- PERSONALIZED MODE (User has logs) ---
        systemPrompt = `You are a compassionate women's health guide.
Your goal is to help the user understand how their cycle phase explains their specific symptoms today.

### HOW TO WRITE
• Explain *why* they feel this way based on ${phase} hormones.
• Use warm, reassuring language.
• Avoid medical jargon.

### OUTPUT FORMAT (JSON)
{
  "insight": "Two sentences explaining their specific symptoms based on the cycle phase.",
  "moods": ["Emotion 1", "Emotion 2"],
  "focus": ["Specific Action 1", "Specific Action 2", "Specific Action 3"]
}`;

        userContextString = `
Cycle phase: ${phase}
Body symptoms: ${safeJoin(context.symptoms)}
Moods: ${safeJoin(context.moods)}
Sleep: ${safeJoin(context.sleep)}
    `.trim();

    } else {
        // --- EDUCATIONAL MODE (No logs yet) ---
        systemPrompt = `You are a women's health educator.
The user is in the ${phase} phase but has NOT logged any symptoms yet.

Your goal:
1. Describe what the ${phase} phase typically feels like (energy, hormones).
2. Explicitly ask them to log their symptoms to get a personalized analysis.

### OUTPUT FORMAT (JSON)
{
  "insight": "General description of the ${phase} phase. Ends with a sentence asking them to log data.",
  "moods": ["Typical Phase Mood 1", "Typical Phase Mood 2"],
  "focus": ["General Wellness Tip 1", "General Wellness Tip 2", "Log Your Symptoms"]
}`;

        userContextString = `Current Phase: ${phase}. No symptoms logged by user.`;
    }

    try {
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
                    response_format: { type: "json_object" },
                    temperature: 0.45,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userContextString },
                    ],
                }),
            }
        );

        if (!response.ok) {
            console.error("Groq API failed:", await response.text());
            return null;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) return null;

        try {
            return JSON.parse(content);
        } catch {
            console.error("❌ Invalid JSON from AI:", content);
            return null;
        }
    } catch (error) {
        console.error("Groq AI Error:", error);
        return null;
    }
}