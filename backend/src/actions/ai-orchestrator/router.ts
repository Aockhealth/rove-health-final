import { UnifiedAIRequest, UnifiedAIResponse } from "../../../../frontend/src/lib/ai/unified-schemas";
import { AIService, AIRequest } from "../../../../frontend/src/lib/ai/service";

export class ModelRouter {
    /**
     * Executes an AI request exclusively through Gemini.
     */
    static async executeWithFallback<T>(
        request: UnifiedAIRequest,
        baseFeatureKey: string,
        variables: Record<string, any>
    ): Promise<UnifiedAIResponse> {

        // Default is Gemini. Callers can explicitly request a provider/model (e.g., retry upgrade).
        const provider = (request.overrideProvider === "openai"
            || request.overrideProvider === "gemini"
            || request.overrideProvider === "groq"
            || request.overrideProvider === "sarvam"
            || request.overrideProvider === "azure")
            ? request.overrideProvider
            : "gemini";

        const startTime = Date.now();
        try {
            console.log(`[ModelRouter] Executing ${request.skill} via ${provider}...`);

            const aiRequest: AIRequest = {
                feature: baseFeatureKey as any,
                variables,
                overrideProvider: provider,
                overrideModel: request.overrideModel
            };

            const result = await AIService.generate<T>(aiRequest);

            if (result.error) {
                throw new Error(result.error);
            }

            const latencyMs = Date.now() - startTime;

            return {
                skill: request.skill,
                narrative: typeof result.data === 'string' ? result.data : "Structured response generated.",
                structuredPayload: typeof result.data !== 'string' ? result.data : undefined,
                telemetry: {
                    provider: result.provider,
                    model: result.model,
                    latencyMs
                },
                cache: { hit: false }
            };

        } catch (error: any) {
            console.error(`[ModelRouter] ${provider} execution failed for ${request.skill}. Error: ${error.message}`);
            return {
                skill: request.skill,
                narrative: "I encountered an issue generating this response. Please try again.",
                safety: { flagged: true, reason: error.message || `${provider} execution failed.` }
            };
        }
    }
}
