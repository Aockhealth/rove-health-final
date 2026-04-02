/**
 * Prompt Limiter Utility
 * 
 * Enforces usage limits on AI tools:
 * - 5 prompts per AI tool per session
 * - 1000 characters per prompt
 */

export interface PromptLimitConfig {
    maxPromptsPerSession: number;
    maxCharactersPerPrompt: number;
}

export interface PromptValidationResult {
    valid: boolean;
    error?: string;
    truncatedMessage?: string;
}

const DEFAULT_CONFIG: PromptLimitConfig = {
    maxPromptsPerSession: 5,
    maxCharactersPerPrompt: 1000
};

/**
 * Counts the total number of prompts (user messages) in conversation history + current message
 */
export function countPrompts(conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>): number {
    if (!Array.isArray(conversationHistory)) {
        return 1; // Current message counts as 1
    }
    
    // Count user messages in history
    const userMessagesCount = conversationHistory.filter(msg => msg.role === "user").length;
    
    // Add 1 for the current message being sent
    return userMessagesCount + 1;
}

/**
 * Validates a single prompt message against character limit
 */
export function validatePromptLength(message: string, maxChars: number = DEFAULT_CONFIG.maxCharactersPerPrompt): PromptValidationResult {
    const trimmed = String(message || "").trim();
    
    if (trimmed.length === 0) {
        return {
            valid: false,
            error: "Prompt cannot be empty."
        };
    }
    
    if (trimmed.length > maxChars) {
        return {
            valid: false,
            error: `Prompt exceeds ${maxChars} character limit. You sent ${trimmed.length} characters.`,
            truncatedMessage: trimmed.substring(0, maxChars)
        };
    }
    
    return { valid: true };
}

/**
 * Validates total prompt count for a skill/tool
 */
export function validatePromptCount(
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
    maxPrompts: number = DEFAULT_CONFIG.maxPromptsPerSession
): PromptValidationResult {
    const count = countPrompts(conversationHistory);
    
    if (count > maxPrompts) {
        return {
            valid: false,
            error: `You've reached the limit of ${maxPrompts} prompts per session with this AI tool. Please start a new conversation to continue.`
        };
    }
    
    return { valid: true };
}

/**
 * Full validation for a prompt request
 * Checks both count and character limits
 */
export function validatePromptRequest(
    userMessage: string | undefined,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
    config: Partial<PromptLimitConfig> = {}
): PromptValidationResult {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Check character limit on current message
    if (userMessage) {
        const lengthResult = validatePromptLength(userMessage, finalConfig.maxCharactersPerPrompt);
        if (!lengthResult.valid) {
            return lengthResult;
        }
    }
    
    // Check total prompt count
    const countResult = validatePromptCount(conversationHistory, finalConfig.maxPromptsPerSession);
    if (!countResult.valid) {
        return countResult;
    }
    
    return { valid: true };
}

/**
 * Apply limiter to a specific skill with custom limits if needed
 */
export function validateSkillPrompt(
    skill: "chef" | "coach" | "diet_coach" | "exercise_coach" | "chatbot" | string,
    userMessage: string | undefined,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
): PromptValidationResult {
    // All skills use the same limits
    return validatePromptRequest(userMessage, conversationHistory);
}
