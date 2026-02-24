import { z } from "zod";

// ============================================
// UNIFIED SKILL ENUMS
// ============================================
export const UnifiedSkillSchema = z.enum([
    "chef",
    "coach",
    "diet_coach",
    "exercise_coach",
    "chatbot",
    "personalized_insight",
    "emotional_baseline"
]);

export type UnifiedSkill = z.infer<typeof UnifiedSkillSchema>;

// ============================================
// UNIFIED CONTEXT
// ============================================
export const UnifiedAIContextEnvelopeSchema = z.object({
    phase: z.string(), // Menstrual, Follicular, Ovulatory, Luteal
    dayInCycle: z.number().nullable(),
    averageCycleLength: z.number().optional(),
    lastPeriodDate: z.string().optional(),
    periodLengthDays: z.number().optional(),
    cycleRegularity: z.enum(["regular", "irregular"]).optional(),
    hasPcosLikePatterns: z.boolean().optional(),
    recentSymptoms: z.array(z.string()).optional(),
    recentMoods: z.array(z.string()).optional(),
    recentSleepQuality: z.array(z.string()).optional(),
    inferredEnergyLevel: z.enum(["Low", "Medium", "High"]).optional(),
    dietaryPreferences: z.string().optional(),
    dietaryPreference: z.string().optional(),
    cuisinePreference: z.string().optional(),
    goalFocus: z.string().optional(),
    currentSymptomsOrCraving: z.string().optional(),
    avoidIngredients: z.array(z.string()).optional(),
    recentOutputSignatures: z.array(z.string()).optional(),
    qualityFeedback: z.string().optional(),
    fitnessGoals: z.string().optional(),
    fitnessLevel: z.enum(["Beginner", "Intermediate", "Pro"]).optional(),
    requestedEnergyLevel: z.enum(["Low", "Medium", "High"]).optional(),
    progressionPreference: z.enum(["steady", "push", "deload"]).optional(),
    equipment: z.string().optional(),
    workoutFocus: z.string().optional(),
    sessionDuration: z.string().optional(),
    limitations: z.string().optional(),
});

export type UnifiedAIContextEnvelope = z.infer<typeof UnifiedAIContextEnvelopeSchema>;

// ============================================
// UNIFIED REQUEST CONTRACT
// ============================================
export const UnifiedAIRequestSchema = z.object({
    skill: UnifiedSkillSchema,
    userIntent: z.string().optional(), // For routing within skills
    userMessage: z.string().optional(), // Raw user query if applicable
    conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
    })).optional(),
    contextHints: UnifiedAIContextEnvelopeSchema.optional(), // Sent by the client (fallback if backend ContextBuilder fails)
    memoryMode: z.enum(["read_write", "read_only", "isolated"]).default("isolated"),
    clientSurface: z.string().optional(), // e.g., "ios_app", "web_chat_widget", "web_chef"
    overrideProvider: z.string().optional(), // specific provider request
    overrideModel: z.string().optional(), // optional one-off model override (e.g., retry upgrade)
    deferTelemetry: z.boolean().optional(), // caller will manually log after post-processing
});

export const ChatbotModuleSchema = z.enum([
    "nutrition",
    "movement",
    "lifestyle",
    "supplement_spotlight"
]);

export const ChatbotNutritionSchema = z.object({
    meal: z.string(),
    reason: z.string()
});

export const ChatbotMovementSchema = z.object({
    activity: z.string(),
    reason: z.string()
});

export const ChatbotLifestyleSchema = z.object({
    habit: z.string(),
    reason: z.string()
});

export const ChatbotSupplementSchema = z.object({
    nutrient_or_herb: z.string(),
    reason: z.string(),
    safety_note: z.string().optional()
});

export const ChatbotSafetySchema = z.object({
    status: z.enum(["normal", "out_of_scope", "medical_red_flag"]),
    message: z.string().optional()
});

export const RoveChatbotStructuredPayloadSchema = z.object({
    greeting_validation: z.string().optional(),
    phase_context: z.string().optional(),
    modules_used: z.array(ChatbotModuleSchema).optional(),
    nutrition: ChatbotNutritionSchema.nullable().optional(),
    movement: ChatbotMovementSchema.nullable().optional(),
    lifestyle: ChatbotLifestyleSchema.nullable().optional(),
    supplement_spotlight: ChatbotSupplementSchema.nullable().optional(),
    check_in_question: z.string().optional(),
    missing_data: z.array(z.enum([
        "last_period_date_or_cycle_day",
        "average_cycle_length",
        "current_symptoms",
        "diet_preference"
    ])).optional(),
    safety: ChatbotSafetySchema
});

export type RoveChatbotStructuredPayload = z.infer<typeof RoveChatbotStructuredPayloadSchema>;

export type UnifiedAIRequest = z.infer<typeof UnifiedAIRequestSchema>;

// ============================================
// UNIFIED RESPONSE CONTRACT
// ============================================
export const UnifiedAIResponseSchema = z.object({
    skill: UnifiedSkillSchema,
    narrative: z.string(), // The human-readable 'voice' of the AI
    structuredPayload: z.any().optional(), // The type-checked JSON payload specific to the skill
    actions: z.array(z.object({
        type: z.string(),
        payload: z.any()
    })).optional(), // Suggested actions for UI
    safety: z.object({
        flagged: z.boolean(),
        reason: z.string().optional()
    }).optional(),
    telemetry: z.object({
        provider: z.string(),
        model: z.string(),
        latencyMs: z.number()
    }).optional(),
    cache: z.object({
        hit: z.boolean(),
        key: z.string().optional()
    }).optional()
});

export type UnifiedAIResponse = z.infer<typeof UnifiedAIResponseSchema>;
