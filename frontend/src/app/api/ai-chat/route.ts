import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { aiRateLimiter } from "@/lib/rate-limiter";

// In-memory rate limiting (per user)
const userRequestMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = {
    maxRequests: 10, // max requests per window
    windowMs: 60 * 1000, // 1 minute
};

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRecord = userRequestMap.get(userId);

    if (!userRecord || now > userRecord.resetAt) {
        // Reset or create new window
        userRequestMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
        return true;
    }

    if (userRecord.count >= RATE_LIMIT.maxRequests) {
        return false; // Rate limit exceeded
    }

    userRecord.count++;
    return true;
}

// Helper: Retry with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const response = await fetch(url, options);

        // If successful or not a rate limit error, return immediately
        if (response.ok || response.status !== 429) {
            return response;
        }

        // If it's a 429 and we have retries left, wait and retry
        if (attempt < maxRetries - 1) {
            const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            console.log(`Rate limit hit, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
        } else {
            // Last attempt failed, return the 429 response
            return response;
        }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error("Unexpected error in fetchWithRetry");
}

/**
 * Strips all personally identifiable information from any object or array recursively.
 * This ensures no PII is sent to external AI services.
 */
function stripPersonalInfo(data: any): any {
    // List of ALL PII fields to remove
    const piiFields = [
        "user_id",
        "email",
        "username",
        "full_name",
        "name",
        "ip_address",
        "user_agent",
        "phone",
        "phone_number",
        "address",
        "street",
        "city",
        "postal_code",
        "zip_code",
        "ssn",
        "id", // Generic IDs might be sensitive
    ];

    if (Array.isArray(data)) {
        return data.map((item) => stripPersonalInfo(item));
    }

    if (data !== null && typeof data === "object") {
        const sanitized: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // Skip PII fields entirely
                if (piiFields.includes(key.toLowerCase())) {
                    continue;
                }
                // Recursively sanitize nested objects
                sanitized[key] = stripPersonalInfo(data[key]);
            }
        }
        return sanitized;
    }

    return data;
}

/**
 * Fetches comprehensive user health data from all relevant tables
 */
async function fetchUserHealthContext(supabase: any, userId: string) {
    const today = new Date().toISOString().split("T")[0];

    try {
        // Fetch all relevant data in parallel
        const [
            onboardingRes,
            cycleSettingsRes,
            dailyLogsRes,
            todayLogRes,
            cycleIntelligenceRes,
            dailyPlanRes,
            fitnessProfileRes,
            lifestyleRes,
            weightGoalsRes,
            preferencesRes,
            recentPeriodsRes,
            cycleSummaryRes,
        ] = await Promise.all([
            // User onboarding data
            supabase
                .from("user_onboarding")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle(),

            // Cycle settings
            supabase
                .from("user_cycle_settings")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle(),

            // Recent daily logs (last 7 days for pattern recognition)
            supabase
                .from("daily_logs")
                .select("*")
                .eq("user_id", userId)
                .order("date", { ascending: false })
                .limit(7),

            // Today's log specifically
            supabase
                .from("daily_logs")
                .select("*")
                .eq("user_id", userId)
                .eq("date", today)
                .maybeSingle(),

            // Today's cycle intelligence
            supabase
                .from("cycle_intelligence_cache")
                .select("*")
                .eq("user_id", userId)
                .eq("date", today)
                .maybeSingle(),

            // Today's generated plan
            supabase
                .from("daily_generated_plans")
                .select("*")
                .eq("user_id", userId)
                .eq("date", today)
                .maybeSingle(),

            // Fitness profile
            supabase
                .from("user_fitness_profile")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle(),

            // Lifestyle data
            supabase
                .from("user_lifestyle")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle(),

            // Weight goals
            supabase
                .from("user_weight_goals")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle(),

            // User preferences
            supabase
                .from("user_preferences")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle(),

            // Recent period events (last 3 cycles)
            supabase
                .from("period_events")
                .select("*")
                .eq("user_id", userId)
                .order("period_start_date", { ascending: false })
                .limit(3),

            // Latest cycle summary
            supabase
                .from("cycle_summary")
                .select("*")
                .eq("user_id", userId)
                .order("generated_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

        // Calculate current phase and cycle day
        const cycleSettings = cycleSettingsRes.data;
        const lastPeriodStart = cycleSettings?.last_period_start
            ? new Date(cycleSettings.last_period_start)
            : new Date();

        const todayDate = new Date();
        const daysSinceLastPeriod = Math.floor(
            (todayDate.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        const cycleLength = cycleSettings?.cycle_length_days || 28;
        const periodLength = cycleSettings?.period_length_days || 5;
        const currentDay = (daysSinceLastPeriod % cycleLength) + 1;

        // Determine current phase
        let currentPhase = "Unknown";
        if (currentDay >= 1 && currentDay <= periodLength) {
            currentPhase = "Menstrual";
        } else if (currentDay > periodLength && currentDay <= Math.floor(cycleLength * 0.45)) {
            currentPhase = "Follicular";
        } else if (currentDay > Math.floor(cycleLength * 0.45) && currentDay <= Math.floor(cycleLength * 0.55)) {
            currentPhase = "Ovulatory";
        } else {
            currentPhase = "Luteal";
        }

        // Build comprehensive context
        const context = {
            // Current cycle status
            current_cycle: {
                phase: currentPhase,
                cycle_day: currentDay,
                cycle_length: cycleLength,
                period_length: periodLength,
                last_period_start: cycleSettings?.last_period_start,
                is_irregular: cycleSettings?.is_irregular || false,
            },

            // Today's data
            today: {
                date: today,
                log: todayLogRes.data || null,
                intelligence: cycleIntelligenceRes.data || null,
                generated_plan: dailyPlanRes.data || null,
            },

            // User profile
            profile: {
                date_of_birth: onboardingRes.data?.date_of_birth,
                height_cm: onboardingRes.data?.height_cm || lifestyleRes.data?.height_cm,
                weight_kg: onboardingRes.data?.weight_kg || lifestyleRes.data?.weight_kg,
                activity_level: onboardingRes.data?.activity_level || lifestyleRes.data?.activity_level,
                dietary_preferences: onboardingRes.data?.dietary_preferences || [],
                metabolic_conditions: onboardingRes.data?.metabolic_conditions || [],
                conditions: onboardingRes.data?.conditions || [],
                typical_symptoms: onboardingRes.data?.typical_symptoms || [],
                goals: onboardingRes.data?.goals || [],
                tracker_mode: onboardingRes.data?.tracker_mode,
            },

            // Fitness
            fitness: {
                profile: fitnessProfileRes.data || null,
                goal: lifestyleRes.data?.fitness_goal || fitnessProfileRes.data?.fitness_goal,
            },

            // Weight goals
            weight_goals: weightGoalsRes.data || null,

            // Preferences
            preferences: preferencesRes.data || null,

            // Historical data
            history: {
                recent_logs: dailyLogsRes.data || [],
                recent_periods: recentPeriodsRes.data || [],
                latest_cycle_summary: cycleSummaryRes.data || null,
            },
        };

        return context;
    } catch (error) {
        console.error("Error fetching user health context:", error);
        return {
            error: "Failed to fetch some user data",
            current_cycle: {
                phase: "Unknown",
                cycle_day: 1,
            },
        };
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check rate limit
        if (aiRateLimiter) {
            const { success } = await aiRateLimiter.limit(`legacy_ai_chat_${user.id}`);
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a minute before trying again." },
                    { status: 429 }
                );
            }
        } else {
            // Local fallback
            if (!checkRateLimit(user.id)) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a minute before trying again." },
                    { status: 429 }
                );
            }
        }

        const body = await req.json();
        const { messages } = body ?? {};
        if (!Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
        }

        // Fetch comprehensive user health context
        const rawContext = await fetchUserHealthContext(supabase, user.id);

        // Strip ALL personal information before sending to AI
        const safeContext = stripPersonalInfo(rawContext);

        // Load AI state for memory persistence
        const { data: stateRow } = await supabase
            .from("ai_user_state")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        // Create if missing
        if (!stateRow) await supabase.from("ai_user_state").insert({ user_id: user.id });

        const aiState = stripPersonalInfo(stateRow || {});

        // Build prompt with sanitized context
        const prompt = `
You are Rove AI, a women's health and cycle wellness assistant. No emojis.

Current User Health Context (all PII removed):
${JSON.stringify(safeContext, null, 2)}

Persistent AI Memory:
${JSON.stringify(aiState, null, 2)}

Guidelines:
- Provide personalized advice based on the user's current cycle phase, symptoms, and health profile
- If user asks for meal/workout plans, check if one exists in AI memory first
- Be supportive, informative, and health-focused
- If you create a new plan or want to remember something, include it in memory_update

Response Format (ONLY valid JSON):
{
  "reply": "Your response to the user here",
  "memory_update": { ... } // or null if no update needed
}
`.trim();

        // Only user/assistant from client
        const safeMessages = messages
            .filter((m: any) => m?.role === "user" || m?.role === "assistant")
            .map((m: any) => ({ role: m.role, content: String(m.content || "").slice(0, 2000) }));

        // Use fetch to Gemini REST with retry logic for 429 errors
        const geminiRes = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: prompt }] },
                        ...safeMessages.map((m: any) => ({
                            role: "user",
                            parts: [{ text: `${m.role.toUpperCase()}: ${m.content}` }],
                        })),
                    ],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
                }),
            }
        );

        if (!geminiRes.ok) {
            // Special handling for rate limit errors
            if (geminiRes.status === 429) {
                return NextResponse.json(
                    {
                        error: "AI service is temporarily busy. Please wait a moment and try again.",
                        details: "Rate limit exceeded"
                    },
                    { status: 429 }
                );
            }
            return NextResponse.json({ error: "Gemini error", details: await geminiRes.text() }, { status: geminiRes.status });
        }

        const raw = await geminiRes.json();
        let text = raw?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

        // Strip markdown code fences if present (Gemini often wraps JSON in ```json ... ```)
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
        } else if (text.startsWith("```")) {
            text = text.replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
        }

        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON parse error:", parseError, "Raw text:", text);
            return NextResponse.json({
                error: "Gemini did not return valid JSON",
                raw: text.slice(0, 500) // Limit raw text to avoid huge responses
            }, { status: 502 });
        }

        // Persist memory_update if present
        if (parsed?.memory_update && typeof parsed.memory_update === "object") {
            const update = parsed.memory_update;
            await supabase.from("ai_user_state").upsert({
                user_id: user.id,
                profile: update.profile ?? stateRow?.profile ?? {},
                health_context: update.health_context ?? stateRow?.health_context ?? {},
                meal_plan: update.meal_plan ?? stateRow?.meal_plan ?? {},
                workout_plan: update.workout_plan ?? stateRow?.workout_plan ?? {},
                insights: update.insights ?? stateRow?.insights ?? {},
                updated_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({ reply: parsed.reply, memoryUpdated: !!parsed.memory_update });
    } catch (e: any) {
        console.error("AI Chat Error:", e);
        return NextResponse.json({ error: "Server error", details: e?.message ?? String(e) }, { status: 500 });
    }
}
