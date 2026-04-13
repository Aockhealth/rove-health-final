/**
 * PromptLimitIndicator Component
 * 
 * Displays character count and prompt usage limits for AI input fields
 */

export const MAX_PROMPT_CHARS = 1000;
export const MAX_PROMPTS_PER_SESSION = 5;

interface CharLimitIndicatorProps {
    charCount: number;
    maxChars?: number;
}

interface PromptCountIndicatorProps {
    promptCount: number;
    maxPrompts?: number;
    showLabel?: boolean;
}

/**
 * Character limit progress bar and count
 */
export function CharLimitIndicator({ charCount, maxChars = MAX_PROMPT_CHARS }: CharLimitIndicatorProps) {
    const percentage = (charCount / maxChars) * 100;
    const isWarning = charCount > maxChars * 0.75;
    const isDanger = charCount > maxChars * 0.9;
    
    const getColor = () => {
        if (isDanger) return '#D32F2F';
        if (isWarning) return '#F57C00';
        return '#4CAF50';
    };

    return (
        <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">{charCount}/{maxChars}</span>
            <div className="w-16 h-1.5 rounded-full bg-gray-200" style={{ overflow: 'hidden' }}>
                <div 
                    style={{
                        width: `${Math.min(100, percentage)}%`,
                        height: '100%',
                        backgroundColor: getColor(),
                        transition: 'all 200ms ease'
                    }}
                />
            </div>
        </div>
    );
}

/**
 * Prompt count indicator (X/5)
 */
export function PromptCountIndicator({ 
    promptCount, 
    maxPrompts = MAX_PROMPTS_PER_SESSION,
    showLabel = true
}: PromptCountIndicatorProps) {
    const isLimitReached = promptCount >= maxPrompts;
    
    return (
        <div style={{ 
            color: isLimitReached ? '#D32F2F' : 'rgba(45, 36, 32, 0.6)',
            fontSize: '12px',
            fontWeight: '500'
        }}>
            {promptCount}/{maxPrompts}{showLabel ? ' prompts' : ''}
        </div>
    );
}

/**
 * Combined indicator showing both character and prompt limits
 */
interface AllLimitsIndicatorProps {
    charCount: number;
    promptCount: number;
    maxChars?: number;
    maxPrompts?: number;
}

export function AllLimitsIndicator({ 
    charCount, 
    promptCount, 
    maxChars = MAX_PROMPT_CHARS,
    maxPrompts = MAX_PROMPTS_PER_SESSION 
}: AllLimitsIndicatorProps) {
    return (
        <div className="flex justify-between items-center px-1 text-xs gap-4">
            <div className="flex items-center gap-1">
                <CharLimitIndicator charCount={charCount} maxChars={maxChars} />
            </div>
            <PromptCountIndicator promptCount={promptCount} maxPrompts={maxPrompts} />
        </div>
    );
}
