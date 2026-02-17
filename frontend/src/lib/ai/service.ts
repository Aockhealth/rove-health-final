
// src/lib/ai/service.ts

import prompts from './prompts.json';

// --- TYPES ---

export type AIProvider = 'openai' | 'gemini' | 'groq' | 'sarvam';

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
    sarvam: 'SARVAM_API_KEY'
};

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

    /**
     * Parsing helper to handle "Markdown JSON" often returned by LLMs
     */
    private static parseJSON<T>(text: string): T {
        try {
            return JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    return JSON.parse(jsonMatch[1]);
                } catch (e2) {
                    throw new Error(`Failed to parse extracted JSON: ${e2}`);
                }
            }
            throw new Error(`Failed to parse JSON response: ${text.substring(0, 50)}...`);
        }
    }

    /**
     * Primary method to generate content.
     */
    public static async generate<T>(request: AIRequest): Promise<AIResponse<T>> {
        const { feature, variables, overrideProvider } = request;

        // @ts-ignore - Dynamic access to imported JSON
        const promptConfig = prompts[feature] as AIPromptConfig;

        if (!promptConfig) {
            return { data: null, error: `Prompt config not found for feature: ${feature}`, provider: 'unknown', model: 'unknown' };
        }

        const provider = overrideProvider || (promptConfig.model.provider as AIProvider);
        const modelName = promptConfig.model.name;
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
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }

            let data: T;
            if (promptConfig.model.json_mode) {
                data = this.parseJSON<T>(resultText);
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
