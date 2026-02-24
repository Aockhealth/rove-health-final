
// src/lib/ai/service.ts

import prompts from './prompts.json';

// --- TYPES ---

export type AIProvider = 'openai' | 'gemini' | 'groq' | 'sarvam' | 'azure';

export interface AIModelConfig {
    provider: AIProvider;
    name: string;
    temperature?: number;
    max_tokens?: number;
    json_mode?: boolean;
}

export interface AIPromptConfig {
    description?: string;
    model: AIModelConfig;
    system: string;
    user: string;
}

// Extract keys from the prompts.json file for type safety
export type FeatureKey = keyof typeof prompts;

export interface AIRequest {
    feature: FeatureKey;
    variables: Record<string, any>;
    userId?: string;
    overrideProvider?: AIProvider;
    overrideModel?: string;
}

export interface AIResponse<T> {
    data: T | null;
    error?: string;
    provider: string;
    model: string;
    raw?: string; // Debugging
}

// Map logical providers to Env Var keys
const ENV_KEYS: Record<AIProvider, string> = {
    openai: 'OPENAI_API_KEY',
    gemini: 'GEMINI_API_KEY',
    groq: 'GROQ_API_KEY',
    sarvam: 'SARVAM_API_KEY',
    azure: 'AZURE_OPENAI_API_KEY'
};

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

class JSONParseFailure extends Error {
    public readonly likelyTruncated: boolean;

    constructor(message: string, likelyTruncated = false) {
        super(message);
        this.name = "JSONParseFailure";
        this.likelyTruncated = likelyTruncated;
    }
}

export class AIService {

    /**
     * Replaces {{variable}} placeholders in a template string.
     */
    private static hydrate(template: string, variables: Record<string, any>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
            const val = variables[key];
            if (val === undefined || val === null) {
                console.warn(`[AIService] Warning: Variable reference {{${key}}} not found in variables.`);
                return `[MISSING: ${key}]`;
            }
            if (typeof val === 'object') {
                return JSON.stringify(val);
            }
            return String(val);
        });
    }

    private static stripMarkdownFences(text: string): string {
        const trimmed = text.trim();
        if (!trimmed.startsWith("```")) return trimmed;

        return trimmed
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
    }

    private static normalizeJsonCandidate(text: string): string {
        return text
            .replace(/^\uFEFF/, "")
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/,\s*([}\]])/g, "$1")
            .trim();
    }

    private static extractBalancedJsonCandidate(text: string): { candidate: string | null; likelyTruncated: boolean } {
        const source = text.trim();
        const start = source.search(/[{\[]/);
        if (start === -1) {
            return { candidate: null, likelyTruncated: false };
        }

        const stack: string[] = [];
        let inString = false;
        let escaped = false;

        for (let i = start; i < source.length; i++) {
            const ch = source[i];

            if (inString) {
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (ch === "\\") {
                    escaped = true;
                    continue;
                }
                if (ch === "\"") {
                    inString = false;
                }
                continue;
            }

            if (ch === "\"") {
                inString = true;
                continue;
            }

            if (ch === "{" || ch === "[") {
                stack.push(ch);
                continue;
            }

            if (ch === "}" || ch === "]") {
                if (stack.length === 0) {
                    continue;
                }
                const open = stack.pop();
                if ((open === "{" && ch !== "}") || (open === "[" && ch !== "]")) {
                    return { candidate: null, likelyTruncated: false };
                }

                if (stack.length === 0) {
                    return { candidate: source.slice(start, i + 1), likelyTruncated: false };
                }
            }
        }

        return { candidate: null, likelyTruncated: stack.length > 0 };
    }



    /**
     * Parsing helper to handle near-JSON and markdown-wrapped JSON from LLMs.
     */
    private static parseJSON<T>(text: string): T {
        const cleaned = this.normalizeJsonCandidate(this.stripMarkdownFences(text));

        try {
            return JSON.parse(cleaned);
        } catch {
            const { candidate, likelyTruncated } = this.extractBalancedJsonCandidate(cleaned);
            if (candidate) {
                const normalizedCandidate = this.normalizeJsonCandidate(candidate);
                try {
                    return JSON.parse(normalizedCandidate);
                } catch (candidateError) {
                    throw new JSONParseFailure(
                        `Failed to parse extracted JSON block: ${String(candidateError)}`,
                        likelyTruncated
                    );
                }
            }
            throw new JSONParseFailure(
                `Failed to parse JSON response: ${cleaned.substring(0, 80)}...`,
                likelyTruncated
            );
        }
    }

    private static shouldRetryGeminiJSON(error: unknown): boolean {
        if (!(error instanceof JSONParseFailure)) return false;
        return true;
    }

    /**
     * Primary method to generate content.
     */
    public static async generate<T>(request: AIRequest): Promise<AIResponse<T>> {
        const { feature, variables, overrideProvider, overrideModel } = request;

        // @ts-ignore - Dynamic access to imported JSON
        const promptConfig = prompts[feature] as AIPromptConfig;

        if (!promptConfig) {
            return { data: null, error: `Prompt config not found for feature: ${feature}`, provider: 'unknown', model: 'unknown' };
        }

        const provider = overrideProvider || (promptConfig.model.provider as AIProvider);
        const modelName = overrideModel || (provider === "gemini"
            ? DEFAULT_GEMINI_MODEL
            : promptConfig.model.name);
        const apiKey = process.env[ENV_KEYS[provider]];

        if (!apiKey) {
            console.error(`[AIService] Missing API Key for ${provider}`);
            return { data: null, error: `Configuration Error: Missing API Key for ${provider}`, provider, model: modelName };
        }

        const systemMessage = this.hydrate(promptConfig.system, variables);
        const userMessage = this.hydrate(promptConfig.user, variables);

        console.log(`[AIService] Generating ${feature} using ${provider}/${modelName}...`);

        try {
            let resultText: string = "";

            switch (provider) {
                case 'openai':
                    resultText = await this.callOpenAI(apiKey, modelName, systemMessage, userMessage, promptConfig.model);
                    break;
                case 'gemini':
                    resultText = await this.callGemini(apiKey, modelName, systemMessage, userMessage, promptConfig.model);
                    break;
                case 'groq':
                    resultText = await this.callGroq(apiKey, modelName, systemMessage, userMessage, promptConfig.model);
                    break;
                case 'sarvam':
                    resultText = await this.callSarvam(apiKey, modelName, systemMessage, userMessage, promptConfig.model);
                    break;
                case 'azure':
                    resultText = await this.callAzure(apiKey, modelName, systemMessage, userMessage, promptConfig.model);
                    break;
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }

            let data: T;
            if (promptConfig.model.json_mode) {
                try {
                    data = this.parseJSON<T>(resultText);
                } catch (parseError) {
                    console.error("[AIService] Failed to parse JSON, attempting salvage...");


                    const canRetryGemini = provider === "gemini" && this.shouldRetryGeminiJSON(parseError);
                    if (canRetryGemini) {
                        console.warn("[AIService] Retrying Gemini once with stronger completion constraints.");
                        const retryUserMessage = `${userMessage}\n\nCRITICAL: Return only one complete valid JSON object. Ensure all quotes, brackets, and braces are fully closed.`;
                        const retryConfig: AIModelConfig = {
                            ...promptConfig.model,
                            temperature: Math.min(promptConfig.model.temperature ?? 0.4, 0.3),
                            max_tokens: Math.max((promptConfig.model.max_tokens ?? 900) + 600, 1400)
                        };

                        const retryText = await this.callGemini(apiKey, modelName, systemMessage, retryUserMessage, retryConfig);
                        resultText = retryText;
                        data = this.parseJSON<T>(retryText);
                    } else {
                        throw parseError;
                    }
                }
            } else {
                data = resultText as unknown as T;
            }

            return { data, provider, model: modelName, raw: resultText };

        } catch (error: any) {
            console.error(`[AIService] Error generating ${feature}:`, error);
            return { data: null, error: error.message || "Unknown AI Error", provider, model: modelName };
        }
    }

    // --- ADAPTERS ---

    private static async callOpenAI(apiKey: string, model: string, system: string, user: string, config: AIModelConfig): Promise<string> {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });

        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            temperature: config.temperature || 0.7,
            max_tokens: config.max_tokens || 1000,
            response_format: config.json_mode ? { type: "json_object" } : undefined
        });

        return response.choices[0].message.content || "";
    }

    private static async callAzure(apiKey: string, model: string, system: string, user: string, config: AIModelConfig): Promise<string> {
        const { OpenAI } = await import('openai');
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        if (!endpoint) throw new Error('AZURE_OPENAI_ENDPOINT is not configured');

        const client = new OpenAI({
            apiKey,
            baseURL: endpoint
        });

        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            temperature: config.temperature || 0.7,
            max_tokens: config.max_tokens || 1000,
            response_format: config.json_mode ? { type: "json_object" } : undefined
        });

        return response.choices[0].message.content || "";
    }
    private static async callGroq(apiKey: string, model: string, system: string, user: string, config: AIModelConfig): Promise<string> {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: user }
                ],
                temperature: config.temperature || 0.7,
                max_tokens: config.max_tokens || 1000,
                response_format: config.json_mode ? { type: "json_object" } : undefined
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API Error (${response.status}): ${errText}`);
        }

        const json = await response.json();
        return json.choices[0].message.content || "";
    }

    private static async callGemini(apiKey: string, model: string, system: string, user: string, config: AIModelConfig): Promise<string> {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);

        const generativeModel = genAI.getGenerativeModel({
            model: model,
            generationConfig: {
                responseMimeType: config.json_mode ? "application/json" : "text/plain",
                temperature: config.temperature,
                maxOutputTokens: config.max_tokens,
            },
            systemInstruction: system
        });

        const result = await generativeModel.generateContent(user);
        const responseMeta = result.response as unknown as { candidates?: Array<{ finishReason?: string }> };
        const finishReason = responseMeta.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== "STOP") {
            console.warn(`[AIService] Gemini finishReason=${finishReason} for ${model}.`);
        }
        return result.response.text();
    }

    private static async callSarvam(apiKey: string, model: string, system: string, user: string, config: AIModelConfig): Promise<string> {
        // Sarvam is OpenAI compatible via https://api.sarvam.ai/v1
        const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model, // e.g., "saaras-2.0-llama-3.1-8b"
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: user }
                ],
                temperature: config.temperature || 0.7,
                max_tokens: config.max_tokens || 1000,
                // Note: Check if Sarvam supports response_format: json_object. If not, rely on prompt.
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Sarvam AI API Error (${response.status}): ${errText}`);
        }

        const json = await response.json();
        return json.choices[0].message.content || "";
    }
}
