import React from 'react';
import { View, Text } from 'react-native';

export const MAX_PROMPT_CHARS = 1000;
export const MAX_PROMPTS_PER_SESSION = 50;

interface CharLimitIndicatorProps {
    charCount: number;
    maxChars?: number;
}

interface PromptCountIndicatorProps {
    promptCount: number;
    maxPrompts?: number;
    showLabel?: boolean;
}

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
        <View className="flex-row items-center gap-1.5">
            <Text className="text-[10px] font-bold text-rove-charcoal">{charCount}/{maxChars}</Text>
            <View className="w-16 h-1.5 rounded-full bg-white/50 overflow-hidden border border-white/20">
                <View 
                    style={{
                        width: `${Math.min(100, percentage)}%`,
                        height: '100%',
                        backgroundColor: getColor(),
                    }}
                />
            </View>
        </View>
    );
}

export function PromptCountIndicator({ 
    promptCount, 
    maxPrompts = MAX_PROMPTS_PER_SESSION,
    showLabel = true
}: PromptCountIndicatorProps) {
    const isLimitReached = promptCount >= maxPrompts;
    
    return (
        <Text style={{ 
            color: isLimitReached ? '#D32F2F' : '#2D2420',
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'right'
        }}>
            {promptCount}/{maxPrompts}{showLabel ? ' prompts' : ''}
        </Text>
    );
}
