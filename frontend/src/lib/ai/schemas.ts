
import { z } from "zod";

// ============================================
// SHARED UTILS
// ============================================
const PhaseEnum = z.enum(["menstrual", "follicular", "ovulatory", "luteal"]);

// ============================================
// ROVE CHEF SCHEMAS
// ============================================
export const ChefItemSchema = z.object({
    name: z.string(),
    description: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()).optional(),
    why: z.string()
});

export const ChefSaladItemSchema = z.object({
    name: z.string(),
    description: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()).optional(),
    why: z.string()
});

export const RoveChefProtocolSchema = z.object({
    snack: ChefItemSchema,
    smoothie: ChefItemSchema,
    salad: ChefSaladItemSchema
});

// ============================================
// ROVE CHEF V2 — "PICK YOUR PLATE" SCHEMAS
// ============================================
// Options are deliberately lightweight (no full instructions) so the first
// response is short and fast; the full recipe is generated only for the one
// dish the user actually picks (ChefDetailSchema below).
export const ChefOptionSchema = z.object({
    name: z.string(),
    description: z.string(),
    prep_time_minutes: z.number(),
    key_ingredients: z.array(z.string()),
    why: z.string(),
    // How the dish is served — drives the hard phase rules (e.g. no "cold"
    // options during the Menstrual phase) in the quality gate.
    serving_style: z.enum(["warm", "room", "cold"]),
    // Drives the fixed 2 protein / 1 fruit / 1 traditional composition
    // (see chef_options prompt) — checked by the quality gate regardless of
    // which cuisine was requested.
    category: z.enum(["protein", "fruit", "traditional"])
});

export const ChefOptionsResponseSchema = z.object({
    options: z.array(ChefOptionSchema).min(3).max(4)
});

export const ChefDetailSchema = z.object({
    name: z.string(),
    description: z.string(),
    prep_time_minutes: z.number(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    why: z.string()
});

// ============================================
// ROVE COACH SCHEMAS
// ============================================
export const WorkoutSetSchema = z.object({
    name: z.string(),
    reps: z.string(),
    sets: z.string(),
    notes: z.string().optional(),
    description: z.string().describe("A brief 1-2 sentence description of how to perform the exercise").optional()
});

export const RoveCoachPlanSchema = z.object({
    title: z.string(),
    duration: z.string(),
    intensity: z.enum(["Low", "Moderate", "High"]),
    warmup: z.array(z.string()),
    main_set: z.array(WorkoutSetSchema),
    cooldown: z.array(z.string()),
    reasoning: z.string()
});

// ============================================
// INSIGHTS SCHEMAS
// ============================================
export const MoodInsightSchema = z.object({
    title: z.string(),
    insight: z.string()
});

// ============================================
// CHATBOT SCHEMAS (COMPLEX)
// ============================================
export const ChatMetaSchema = z.object({
    agent_name: z.string(),
    response_type: z.enum(["daily_checkin", "guidance", "followup", "jit_education"]),
    confidence_level: z.enum(["high", "medium", "low"]),
    needs_clarification: z.boolean()
});

export const ChatGreetingSchema = z.object({
    text: z.string(),
    tone: z.enum(["warm", "supportive", "empathetic", "neutral"])
});

export const ChatCycleAnalysisSchema = z.object({
    detected_phase: z.enum(["menstrual", "follicular", "ovulatory", "luteal", "anovulatory"]),
    phase_confidence: z.number().optional(), // Optional float
    reasoning: z.array(z.string()),
    cycle_day_estimate: z.number()
});

export const ChatSymptomInsightSchema = z.object({
    symptom: z.string(),
    likely_driver: z.string(),
    explanation: z.string(),
    severity: z.enum(["mild", "moderate", "high"]).optional()
});

export const ChatNutritionPlanSchema = z.object({
    diet_preference_used: z.enum(["veg", "non-veg", "vegan", "jain", "unknown"]).optional(),
    focus: z.string(),
    meal_suggestions: z.array(z.object({
        meal_type: z.string(),
        suggestions: z.array(z.string())
    })),
    foods_to_go_easy_on: z.array(z.string()).optional()
});

export const ChatMovementPlanSchema = z.object({
    recommended_intensity: z.enum(["low", "moderate", "high"]),
    suggested_activities: z.array(z.string()),
    rationale: z.string(),
    requires_user_confirmation: z.boolean().optional()
});

export const ChatSupplementGuidanceSchema = z.object({
    nutrient: z.string(),
    purpose: z.string(),
    timing: z.string(),
    cycle_phase_relevance: z.string().optional(),
    optional: z.boolean().optional()
});

export const ChatLifestyleTipSchema = z.object({
    tip: z.string(),
    reason: z.string()
});

export const ChatLoggingPromptSchema = z.object({
    encouraged: z.boolean(),
    fields_to_log: z.array(z.string()),
    message: z.string()
});

export const ChatSafetyNotesSchema = z.object({
    medical_disclaimer: z.string(),
    red_flag_detected: z.boolean(),
    recommend_doctor_visit: z.boolean()
});

export const ChatEngagementSchema = z.object({
    check_in_question: z.string().optional(),
    next_prompt_suggestions: z.array(z.string())
});

export const RoveChatResponseSchema = z.object({
    meta: ChatMetaSchema,
    greeting: ChatGreetingSchema,
    cycle_analysis: ChatCycleAnalysisSchema.optional(),
    symptom_insights: z.array(ChatSymptomInsightSchema).optional(),
    nutrition_plan: ChatNutritionPlanSchema.optional(),
    movement_plan: ChatMovementPlanSchema.optional(),
    supplement_guidance: z.array(ChatSupplementGuidanceSchema).optional(),
    lifestyle_tips: z.array(ChatLifestyleTipSchema).optional(),
    logging_prompt: ChatLoggingPromptSchema.optional(),
    safety_notes: ChatSafetyNotesSchema.optional(),
    engagement: ChatEngagementSchema.optional()
});

// ============================================
// EXPORT TYPES
// ============================================
export type RoveChefProtocol = z.infer<typeof RoveChefProtocolSchema>;
export type ChefOption = z.infer<typeof ChefOptionSchema>;
export type ChefOptionsResponse = z.infer<typeof ChefOptionsResponseSchema>;
export type ChefDetail = z.infer<typeof ChefDetailSchema>;
export type RoveCoachPlan = z.infer<typeof RoveCoachPlanSchema>;
export type MoodInsight = z.infer<typeof MoodInsightSchema>;
export type RoveChatResponse = z.infer<typeof RoveChatResponseSchema>;
