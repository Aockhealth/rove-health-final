import {
    RoveChatbotStructuredPayloadSchema,
    UnifiedAIContextEnvelope,
    UnifiedAIRequest,
    UnifiedAIRequestSchema,
    UnifiedAIResponse
} from "../../../../frontend/src/lib/ai/unified-schemas";
import { createClient } from "@/utils/supabase/server";
import { buildUnifiedContext } from "./context-builder";
import { ModelRouter } from "./router";
import { logAIGenerationEvent } from "./telemetry";
import { validateSkillPrompt } from "./prompt-limiter";

function pickFirstNonEmpty<T>(...values: Array<T | undefined | null>): T | undefined {
    for (const value of values) {
        if (value === undefined || value === null) continue;
        if (typeof value === "string" && value.trim() === "") continue;
        return value as T;
    }
    return undefined;
}

function mergeContext(
    primary?: Partial<UnifiedAIContextEnvelope>,
    fallback?: Partial<UnifiedAIContextEnvelope>
): UnifiedAIContextEnvelope {
    return {
        phase: pickFirstNonEmpty(primary?.phase, fallback?.phase, "Menstrual") as string,
        dayInCycle: pickFirstNonEmpty(primary?.dayInCycle, fallback?.dayInCycle, 1) as number | null,
        averageCycleLength: pickFirstNonEmpty(primary?.averageCycleLength, fallback?.averageCycleLength),
        lastPeriodDate: pickFirstNonEmpty(primary?.lastPeriodDate, fallback?.lastPeriodDate),
        periodLengthDays: pickFirstNonEmpty(primary?.periodLengthDays, fallback?.periodLengthDays),
        cycleRegularity: pickFirstNonEmpty(primary?.cycleRegularity, fallback?.cycleRegularity),
        hasPcosLikePatterns: pickFirstNonEmpty(primary?.hasPcosLikePatterns, fallback?.hasPcosLikePatterns),
        recentSymptoms: pickFirstNonEmpty(primary?.recentSymptoms, fallback?.recentSymptoms),
        recentMoods: pickFirstNonEmpty(primary?.recentMoods, fallback?.recentMoods),
        recentSleepQuality: pickFirstNonEmpty(primary?.recentSleepQuality, fallback?.recentSleepQuality),
        inferredEnergyLevel: pickFirstNonEmpty(primary?.inferredEnergyLevel, fallback?.inferredEnergyLevel),
        dietaryPreferences: pickFirstNonEmpty(primary?.dietaryPreferences, fallback?.dietaryPreferences),
        dietaryPreference: pickFirstNonEmpty(primary?.dietaryPreference, fallback?.dietaryPreference),
        cuisinePreference: pickFirstNonEmpty(primary?.cuisinePreference, fallback?.cuisinePreference),
        goalFocus: pickFirstNonEmpty(primary?.goalFocus, fallback?.goalFocus),
        currentSymptomsOrCraving: pickFirstNonEmpty(primary?.currentSymptomsOrCraving, fallback?.currentSymptomsOrCraving),
        avoidIngredients: pickFirstNonEmpty(primary?.avoidIngredients, fallback?.avoidIngredients),
        recentOutputSignatures: pickFirstNonEmpty(primary?.recentOutputSignatures, fallback?.recentOutputSignatures),
        qualityFeedback: pickFirstNonEmpty(primary?.qualityFeedback, fallback?.qualityFeedback),
        fitnessGoals: pickFirstNonEmpty(primary?.fitnessGoals, fallback?.fitnessGoals),
        fitnessLevel: pickFirstNonEmpty(primary?.fitnessLevel, fallback?.fitnessLevel),
        requestedEnergyLevel: pickFirstNonEmpty(primary?.requestedEnergyLevel, fallback?.requestedEnergyLevel),
        progressionPreference: pickFirstNonEmpty(primary?.progressionPreference, fallback?.progressionPreference),
        equipment: pickFirstNonEmpty(primary?.equipment, fallback?.equipment),
        workoutFocus: pickFirstNonEmpty(primary?.workoutFocus, fallback?.workoutFocus),
        sessionDuration: pickFirstNonEmpty(primary?.sessionDuration, fallback?.sessionDuration),
        limitations: pickFirstNonEmpty(primary?.limitations, fallback?.limitations)
    };
}

/**
 * Smart conversation history formatter with summarization.
 * - For short conversations (≤8 turns): returns the last 8 messages.
 * - For longer conversations (>8 turns): summarizes older messages via a fast
 *   Gemini call, then concatenates summary + last 4 recent messages.
 *   This keeps context rich without blowing the token window.
 */
async function formatConversationHistory(history?: Array<{ role: "user" | "assistant"; content: string }>): Promise<string> {
    if (!Array.isArray(history) || history.length === 0) return "";

    // Short conversations: return all recent messages (no summarization needed)
    if (history.length <= 8) {
        return history
            .slice(-8)
            .map((msg) => `${msg.role === "user" ? "User" : "Rove"}: ${String(msg.content).slice(0, 1000)}`)
            .join("\n");
    }

    // Longer conversations: summarize older messages, keep recent 4
    const olderMessages = history.slice(0, -4);
    const recentMessages = history.slice(-4);

    const olderText = olderMessages
        .map((msg) => `${msg.role === "user" ? "User" : "Rove"}: ${String(msg.content).slice(0, 500)}`)
        .join("\n");

    let summary = "";
    try {
        const { AIService } = await import("../../../../frontend/src/lib/ai/service");
        const result = await AIService.generate<string>({
            feature: "summarize_conversation" as any,
            variables: { conversation: olderText },
            overrideProvider: "gemini"
        });
        summary = result.data || "";
    } catch (err) {
        console.warn("[Orchestrator] Summarization failed, falling back to truncation:", err);
        // Fallback: just use last 8 messages like before
        return history
            .slice(-8)
            .map((msg) => `${msg.role === "user" ? "User" : "Rove"}: ${String(msg.content).slice(0, 1000)}`)
            .join("\n");
    }

    const recentText = recentMessages
        .map((msg) => `${msg.role === "user" ? "User" : "Rove"}: ${String(msg.content).slice(0, 1000)}`)
        .join("\n");

    return `[Earlier conversation summary]: ${summary}\n\n${recentText}`;
}

function buildChatNarrative(payload: any): string {
    const blocks: string[] = [];

    // Combine greeting and context into a tight, two-sentence intro
    const intro: string[] = [];
    if (payload?.greeting_validation) intro.push(payload.greeting_validation);
    if (payload?.phase_context) intro.push(payload.phase_context);
    if (intro.length > 0) blocks.push(intro.join(" "));

    // Build concise bulleted modules
    if (payload?.nutrition?.meal) {
        blocks.push(`### 🥗 Nutrition\n${payload.nutrition.meal}\n- *Why it helps:* ${payload.nutrition.reason}`);
    }
    if (payload?.movement?.activity) {
        blocks.push(`### 🏃‍♀️ Movement\n${payload.movement.activity}\n- *Why it helps:* ${payload.movement.reason}`);
    }
    if (payload?.lifestyle?.habit) {
        blocks.push(`### 🧘‍♀️ Lifestyle\n${payload.lifestyle.habit}\n- *Why it helps:* ${payload.lifestyle.reason}`);
    }
    if (payload?.supplement_spotlight?.nutrient_or_herb) {
        const note = payload.supplement_spotlight.safety_note
            ? `\n- ⚠️ **Note:** ${payload.supplement_spotlight.safety_note}`
            : "";
        blocks.push(
            `### 💊 Supplement Spotlight\n${payload.supplement_spotlight.nutrient_or_herb}\n- *Why it helps:* ${payload.supplement_spotlight.reason}${note}`
        );
    }

    if (payload?.check_in_question) {
        blocks.push(`---\n*${payload.check_in_question}*`);
    }
    return blocks.filter(Boolean).join("\n\n").trim();
}

/**
 * The core entry point for all unified AI skills.
 * This orchestrator handles context assembly, routing, and telemetry filters.
 */
export async function executeUnifiedAI(rawRequest: unknown): Promise<UnifiedAIResponse> {
    const parsed = UnifiedAIRequestSchema.safeParse(rawRequest);
    if (!parsed.success) {
        console.error("[Orchestrator] Invalid Unified Request:", parsed.error);
        return {
            skill: "chatbot",
            narrative: "System Error: The AI request was malformed.",
            safety: { flagged: true, reason: "Schema Validation Failed" }
        };
    }

    const request = parsed.data;
    
    // ============================================
    // PROMPT LIMITER: Validate prompts before execution
    // ============================================
    const promptValidation = validateSkillPrompt(
        request.skill,
        request.userMessage,
        request.conversationHistory
    );
    
    if (!promptValidation.valid) {
        console.warn(`[Orchestrator] Prompt validation failed for skill ${request.skill}: ${promptValidation.error}`);
        return {
            skill: request.skill,
            narrative: promptValidation.error || "Your prompt did not meet the requirements.",
            safety: { flagged: true, reason: "Prompt validation failed" }
        };
    }
    
    let context = mergeContext(request.contextHints, {
        phase: "Menstrual",
        dayInCycle: 1
    });

    let user = null;
    try {
        const supabase = await createClient();
        const auth = await supabase.auth.getUser();
        user = auth.data.user;

        if (user) {
            const dbContext = await buildUnifiedContext(user.id);
            context = mergeContext(dbContext, request.contextHints);
        }
    } catch {
        console.warn("[Orchestrator] Running outside request scope or auth failed. Falling back to hints.");
    }

    try {
        let response: UnifiedAIResponse;

        switch (request.skill) {
            case "chef":
                response = await handleChefSkill(request, context);
                break;
            case "coach":
                response = await handleCoachSkill(request, context);
                break;
            case "diet_coach":
                response = await handleDietCoachSkill(request, context);
                break;
            case "exercise_coach":
                response = await handleExerciseCoachSkill(request, context);
                break;
            case "chatbot":
                response = await handleChatbotSkill(request, context);
                break;
            case "personalized_insight":
                response = await handleInsightSkill(request, context);
                break;
            case "emotional_baseline":
                response = await handleBaselineSkill(request, context);
                break;
            default:
                throw new Error(`Skill ${request.skill} not yet implemented via orchestrator.`);
        }

        if (!request.deferTelemetry) {
            logAIGenerationEvent(user?.id, request, response, context).catch((e) => {
                console.error("[Orchestrator] Telemetry logger failed asynchronously:", e);
            });
        }

        return response;
    } catch (e: any) {
        console.error(`[Orchestrator] Execution failed for skill ${request.skill}:`, e);
        return {
            skill: request.skill,
            narrative: "An unexpected orchestration error occurred.",
            safety: { flagged: true, reason: e.message }
        };
    }
}

async function handleChefSkill(req: UnifiedAIRequest, context: UnifiedAIContextEnvelope): Promise<UnifiedAIResponse> {
    const vars = {
        phase: context.phase,
        preferences: context.dietaryPreference || context.dietaryPreferences || "none",
        symptoms: (context.recentSymptoms || []).join(", ")
    };
    return await ModelRouter.executeWithFallback(req, "chef", vars);
}

async function handleCoachSkill(req: UnifiedAIRequest, context: UnifiedAIContextEnvelope): Promise<UnifiedAIResponse> {
    const vars = {
        phase: context.phase,
        energy_level: context.inferredEnergyLevel || "Medium",
        time: 30
    };
    return await ModelRouter.executeWithFallback(req, "coach", vars);
}

async function handleChatbotSkill(req: UnifiedAIRequest, context: UnifiedAIContextEnvelope): Promise<UnifiedAIResponse> {
    const historyText = await formatConversationHistory(req.conversationHistory) || req.userIntent || "";
    const symptoms = Array.isArray(context.recentSymptoms) && context.recentSymptoms.length > 0
        ? context.recentSymptoms.join(", ")
        : "not specified";
    const dietPreference = context.dietaryPreference || context.dietaryPreferences || "not specified";

   /*  const vars = {
        phase: context.phase,
        cycle_day: context.dayInCycle ?? "unknown",
        average_cycle_length: context.averageCycleLength ?? "unknown",
        last_period_date: context.lastPeriodDate ?? "unknown",
        current_symptoms: symptoms,
        diet_preference: dietPreference,
        dietary_preferences: dietPreference,
        has_pcos_like_patterns: context.hasPcosLikePatterns ? "yes" : "no",
        history: historyText,
        user_message: req.userMessage || ""
    };
 */
const vars = {
    phase: context.phase,
    cycle_day: context.dayInCycle ?? "unknown",
    average_cycle_length: context.averageCycleLength ?? "unknown",
    last_period_date: context.lastPeriodDate ?? "unknown",
    current_symptoms: symptoms,
    diet_preference: dietPreference,
    dietary_preferences: dietPreference,                                          // 👈 fix missing_data bug
    goals: context.goalFocus || context.fitnessGoals || "not specified",          // 👈 add
    typical_symptoms: context.recentSymptoms?.join(", ") || "not specified",      // 👈 add
    activity_level: context.fitnessLevel || context.inferredEnergyLevel || "unknown", // 👈 add                        // 👈 add
    has_pcos_like_patterns: context.hasPcosLikePatterns ? "yes" : "no",
    history: historyText,
    user_message: req.userMessage || ""
}
    const response = await ModelRouter.executeWithFallback(req, "chat", vars);
    if (!response.structuredPayload) return response;

    // --- TIER 1: Full schema parse ---
    const parsed = RoveChatbotStructuredPayloadSchema.safeParse(response.structuredPayload);
    if (parsed.success) {
        return processChatPayload(response, parsed.data);
    }

    console.warn("[Orchestrator] Chatbot full schema parse failed. Attempting partial parse...");
    console.warn("[Orchestrator] Parse errors:", JSON.stringify(parsed.error.format(), null, 2));

    // --- TIER 2: Partial parse — salvage whatever fields are valid ---
    const partialSchema = RoveChatbotStructuredPayloadSchema.partial();
    const partial = partialSchema.safeParse(response.structuredPayload);
    if (partial.success) {
        console.log("[Orchestrator] Partial parse succeeded. Salvaging usable fields.");
        const payload = partial.data;

        // Check safety even in partial mode
        if (payload.safety?.status === "medical_red_flag") {
            response.safety = { flagged: true, reason: payload.safety.message || "Medical safety escalation" };
            response.narrative = payload.safety.message
                || "I'm here to support your wellness, but this sounds like something that needs a doctor's touch. Please reach out to a healthcare professional right away.";
            return response;
        }
        if (payload.safety?.status === "out_of_scope") {
            response.narrative = payload.safety.message
                || "I want to stay in my lane so I can support you safely. I can still help connect this to your cycle health.";
            return response;
        }

        // Build narrative from whatever we got
        response.narrative = buildChatNarrative(payload)
            || response.narrative
            || "I can help with cycle and hormone wellness support. Tell me how you're feeling today.";
        return response;
    }

    // --- TIER 3: Raw narrative fallback — use whatever the router returned ---
    console.error("[Orchestrator] Both full and partial parse failed. Falling back to raw narrative.");
    if (typeof response.narrative === "string" && response.narrative.length > 10) {
        return response; // The raw narrative is still usable
    }
    response.narrative = "I can help with cycle and hormone wellness support. Tell me how you're feeling today.";
    return response;
}

/** Shared processing for a successfully parsed chatbot payload. */
function processChatPayload(response: UnifiedAIResponse, payload: any): UnifiedAIResponse {
    response.structuredPayload = payload;

    if (payload.safety.status === "medical_red_flag") {
        response.safety = {
            flagged: true,
            reason: payload.safety.message || "Medical safety escalation"
        };
        response.narrative = payload.safety.message
            || "I'm here to support your wellness, but this sounds like something that needs a doctor's touch. Please reach out to a healthcare professional right away.";
        return response;
    }

    if (payload.safety.status === "out_of_scope") {
        response.narrative = payload.safety.message
            || "I want to stay in my lane so I can support you safely. I can still help connect this to your cycle health.";
        return response;
    }

    response.narrative = buildChatNarrative(payload)
        || "I can help with cycle and hormone wellness support. Tell me how you're feeling today.";
    return response;
}

async function handleDietCoachSkill(req: UnifiedAIRequest, context: UnifiedAIContextEnvelope): Promise<UnifiedAIResponse> {
    const requestHints = req.contextHints;
    const vars = {
        phase: context.phase,
        dietary_preferences: requestHints?.dietaryPreference
            || requestHints?.dietaryPreferences
            || context.dietaryPreference
            || context.dietaryPreferences
            || "none",
        cuisine: requestHints?.cuisinePreference || context.cuisinePreference || "Global",
        health_goals: context.fitnessGoals || "General Wellness",
        goal_focus: requestHints?.goalFocus || context.goalFocus || "Hormone balance and steady energy",
        current_symptoms_or_craving: requestHints?.currentSymptomsOrCraving
            || context.currentSymptomsOrCraving
            || (context.recentSymptoms || []).join(", "),
        symptoms: requestHints?.currentSymptomsOrCraving
            || context.currentSymptomsOrCraving
            || (context.recentSymptoms || []).join(", "),
        avoid_ingredients: (requestHints?.avoidIngredients || context.avoidIngredients || []).join(", "),
        recent_output_signatures: (requestHints?.recentOutputSignatures || context.recentOutputSignatures || []).join(" | "),
        quality_feedback: requestHints?.qualityFeedback || context.qualityFeedback || ""
    };
    const allowedFeatureOverrides = new Set(["chef_snack", "chef_smoothie", "chef_gut"]);
    const featureKey = req.userIntent && allowedFeatureOverrides.has(req.userIntent)
        ? req.userIntent
        : "diet_coach";
    return await ModelRouter.executeWithFallback(req, featureKey, vars);
}

async function handleExerciseCoachSkill(req: UnifiedAIRequest, context: UnifiedAIContextEnvelope): Promise<UnifiedAIResponse> {
    const requestHints = req.contextHints;
    const vars = {
        phase: context.phase,
        energy_level: requestHints?.requestedEnergyLevel || context.requestedEnergyLevel || context.inferredEnergyLevel || "Medium",
        fitness_level: requestHints?.fitnessLevel || context.fitnessLevel || "Intermediate",
        equipment: requestHints?.equipment || context.equipment || "Bodyweight / Mat",
        workout_focus: requestHints?.workoutFocus || context.workoutFocus || "Full Body",
        goal_focus: requestHints?.goalFocus || context.goalFocus || "Build consistency",
        progression_preference: requestHints?.progressionPreference || context.progressionPreference || "steady",
        available_time: requestHints?.sessionDuration || context.sessionDuration || "30m",
        symptoms: requestHints?.limitations || context.limitations || (context.recentSymptoms || []).join(", "),
        recent_output_signatures: (requestHints?.recentOutputSignatures || context.recentOutputSignatures || []).join(" | "),
        quality_feedback: requestHints?.qualityFeedback || context.qualityFeedback || ""
    };
    return await ModelRouter.executeWithFallback(req, "exercise_coach", vars);
}

async function handleInsightSkill(req: UnifiedAIRequest, context: UnifiedAIContextEnvelope): Promise<UnifiedAIResponse> {
    const vars = {
        cycle_day: context.dayInCycle || 1,
        avg_cycle_length: context.averageCycleLength || 28,
        historical_patterns: "None recorded yet."
    };
    return await ModelRouter.executeWithFallback(req, "personalized_insight", vars);
}

async function handleBaselineSkill(req: UnifiedAIRequest, context: UnifiedAIContextEnvelope): Promise<UnifiedAIResponse> {
    const vars = {
        phase: context.phase,
        mood_logs: (context.recentMoods || []).join(", "),
        sleep_quality: (context.recentSleepQuality || []).join(", ") || "Not logged"
    };
    return await ModelRouter.executeWithFallback(req, "emotional_baseline", vars);
}
