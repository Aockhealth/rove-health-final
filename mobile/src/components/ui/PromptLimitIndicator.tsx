import React from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mirrors frontend/src/components/ui/PromptLimitIndicator.tsx — same limits,
// same color thresholds, shared by Rove Chef, Rove Coach, and the Rove chat
// screen so the three AI-generation surfaces stay in lockstep with web.
export const MAX_PROMPT_CHARS = 1000;
export const MAX_PROMPTS_PER_SESSION = 50;

export function CharLimitIndicator({ charCount, maxChars = MAX_PROMPT_CHARS }: { charCount: number; maxChars?: number }) {
    const percentage = (charCount / maxChars) * 100;
    const isWarning = charCount > maxChars * 0.75;
    const isDanger = charCount > maxChars * 0.9;
    const color = isDanger ? '#D32F2F' : isWarning ? '#F57C00' : '#4CAF50';

    return (
        <View className="flex-row items-center">
            <Text className="text-[11px] text-rove-stone mr-2">{charCount}/{maxChars}</Text>
            <View className="w-16 h-1.5 rounded-full bg-rove-stone/15 overflow-hidden">
                <View style={{ width: `${Math.min(100, percentage)}%`, height: '100%', backgroundColor: color }} />
            </View>
        </View>
    );
}

export function PromptCountIndicator({ promptCount, maxPrompts = MAX_PROMPTS_PER_SESSION }: { promptCount: number; maxPrompts?: number }) {
    const isLimitReached = promptCount >= maxPrompts;
    return (
        <Text style={{ color: isLimitReached ? '#D32F2F' : 'rgba(45, 36, 32, 0.6)', fontSize: 11, fontWeight: '500' }}>
            {promptCount}/{maxPrompts} prompts
        </Text>
    );
}

// ── AsyncStorage-backed prompt-count helpers (RN's localStorage equivalent) ──
// Same 24h-expiry shape as the web's loadPromptCount/savePromptCount, just
// async since AsyncStorage has no synchronous API.
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function loadPromptCount(storageKey: string): Promise<number> {
    try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
            const { count, timestamp } = JSON.parse(stored);
            if (Date.now() - timestamp < STORAGE_EXPIRY_MS) {
                return count || 0;
            }
            await AsyncStorage.removeItem(storageKey);
        }
    } catch { }
    return 0;
}

export async function savePromptCount(storageKey: string, count: number): Promise<void> {
    try {
        await AsyncStorage.setItem(storageKey, JSON.stringify({ count, timestamp: Date.now() }));
    } catch { }
}
