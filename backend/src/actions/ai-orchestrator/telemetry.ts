import { createClient } from "@/utils/supabase/server";
import { UnifiedAIRequest, UnifiedAIResponse } from "../../../../frontend/src/lib/ai/unified-schemas";

/**
 * Privacy-Aware Telemetry Logger
 * 
 * Rules:
 * 1. Logs "chef", "coach", "diet_coach", and "exercise_coach" generations with full prompt/response snapshots for fine-tuning.
 * 2. Logs "chatbot", "personalized_insight", and "emotional_baseline" with ANONYMIZED METADATA ONLY
 *    (latency, modules used, safety status, missing data) — never logs conversation content.
 */
export async function logAIGenerationEvent(
    userId: string | undefined,
    request: UnifiedAIRequest,
    response: UnifiedAIResponse,
    promptContext: Record<string, any>
) {
    if (!userId) {
        // Can't log anonymous executions to RLS tables
        return;
    }

    // Determine logging strategy based on skill
    const FULL_TELEMETRY_SKILLS = ["chef", "coach", "diet_coach", "exercise_coach"];
    const METADATA_ONLY_SKILLS = ["chatbot", "personalized_insight", "emotional_baseline"];

    const isFullTelemetry = FULL_TELEMETRY_SKILLS.includes(request.skill);
    const isMetadataOnly = METADATA_ONLY_SKILLS.includes(request.skill);

    if (!isFullTelemetry && !isMetadataOnly) {
        console.log(`[Telemetry] Skipped logging for unregistered skill: ${request.skill}`);
        return;
    }

    try {
        const supabase = await createClient();

        const insertPayload: Record<string, any> = {
            user_id: userId,
            skill: request.skill,
            provider: response.telemetry?.provider || 'unknown',
            model: response.telemetry?.model || 'unknown',
            latency_ms: response.telemetry?.latencyMs || 0,
        };

        if (isFullTelemetry) {
            // Full logging for chef/coach/diet_coach/exercise_coach (fine-tuning datasets)
            const qualityMeta = response.actions?.find((action) => action.type === "quality_meta")?.payload;
            const baseSnapshot: Record<string, any> = (response.structuredPayload && typeof response.structuredPayload === "object")
                ? { ...(response.structuredPayload as Record<string, any>) }
                : { narrative: response.narrative };
            if (qualityMeta) {
                baseSnapshot.quality_passed = qualityMeta.quality_passed;
                baseSnapshot.retry_count = qualityMeta.retry_count;
                baseSnapshot.generic_score = qualityMeta.generic_score;
                baseSnapshot.duplicate_detected = qualityMeta.duplicate_detected;
                baseSnapshot.phase_rule_passed = qualityMeta.phase_rule_passed;
                if (Array.isArray(qualityMeta.reasons) && qualityMeta.reasons.length > 0) {
                    baseSnapshot.quality_reasons = qualityMeta.reasons;
                }
            }
            insertPayload.prompt_snapshot = promptContext;
            insertPayload.response_snapshot = baseSnapshot;
        } else {
            // 🛑 PRIVACY: Metadata-only for chatbot/insight/baseline
            // Never log conversation content, user messages, or narrative text
            insertPayload.prompt_snapshot = {
                _metadata_only: true,
                phase: promptContext.phase || "unknown",
                has_pcos_like_patterns: promptContext.has_pcos_like_patterns || "unknown",
                inferred_energy_level: promptContext.inferredEnergyLevel || "unknown"
            };
            insertPayload.response_snapshot = {
                _metadata_only: true,
                modules_used: response.structuredPayload?.modules_used || [],
                safety_status: response.structuredPayload?.safety?.status || (response.safety?.flagged ? "flagged" : "normal"),
                missing_data: response.structuredPayload?.missing_data || [],
                has_structured_payload: !!response.structuredPayload
            };
        }

        const { error } = await supabase
            .from('ai_generation_events')
            .insert(insertPayload);

        if (error) {
            console.error(`[Telemetry Error] Failed to log ${request.skill} generation:`, error.message);
        } else {
            console.log(`[Telemetry] Successfully logged ${request.skill} generation event${isMetadataOnly ? " (metadata-only)" : ""}.`);
        }
    } catch (e: any) {
        console.error(`[Telemetry Error] Unexpected failure logging ${request.skill}:`, e.message);
    }
}
