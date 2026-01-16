
export interface GroqCompletionOptions {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface GroqMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export class GroqClient {
    private apiKey: string;
    private baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    private defaultModel = "llama3-8b-8192";

    constructor(options: GroqCompletionOptions) {
        this.apiKey = options.apiKey;
        if (options.model) this.defaultModel = options.model;
    }

    async chatCompletion(messages: GroqMessage[], options: Partial<GroqCompletionOptions> = {}): Promise<string> {
        const model = options.model || this.defaultModel;
        const temperature = options.temperature ?? 0.7;
        const maxTokens = options.maxTokens ?? 1024;

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    response_format: { type: "json_object" } // Force JSON mode for structured outputs
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "{}";
        } catch (error) {
            console.error("Groq Chat Completion Failed:", error);
            throw error;
        }
    }
}
