import { Platform } from 'react-native';
import { supabase } from './supabase';

const getBaseUrl = () => {
    // On a real device in Expo Go, `localhost`/`10.0.2.2` point at the phone
    // itself, not the dev machine — set EXPO_PUBLIC_API_URL to your dev
    // machine's LAN IP (e.g. http://192.168.1.23:3000) in mobile/.env to
    // test against a real device. Falls back to the emulator defaults when
    // unset, so simulator/emulator dev keeps working with no config.
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // For local development
    if (__DEV__) {
        return Platform.OS === 'android'
            ? 'http://10.0.2.2:3000'
            : 'http://localhost:3000';
    }
    // Production URL would go here
    return 'https://your-production-url.com';
};

export const API_URL = getBaseUrl();

export async function generateRoveCoachPlan(
    phase: string,
    energyLevel: string,
    goal: string,
    equipment: string,
    injuries: string,
    fitnessLevel: string,
    workoutFocus: string,
    sessionDuration: string
) {
    const res = await fetch(`${API_URL}/api/rove-coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, energyLevel, goal, equipment, injuries, fitnessLevel, workoutFocus, sessionDuration })
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch plan');
    }
    
    return res.json();
}

export async function generateRoveChefProtocol(
    phase: string,
    dietary_preferences: string,
    cuisine: string,
    type: string,
    personalization: any
) {
    const res = await fetch(`${API_URL}/api/rove-chef`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, dietary_preferences, cuisine, type, personalization })
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch recipe');
    }

    return res.json();
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Mirrors frontend/src/components/cycle-sync/ChatInterface.tsx's call to
// POST /api/chat — same request shape ({ messages }), same response shape
// ({ ok, ai: { narrative, structuredPayload, safety, telemetry }, choices }).
// Unlike Rove Chef/Coach, this route requires auth: the web client relies on
// its cookie session, but mobile has no cookie jar, so we forward the
// current Supabase session's access token as a Bearer header instead (the
// route was updated to accept either).
export async function sendChatMessage(messages: ChatMessage[]) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated');
    }

    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.error || 'Failed to reach Rove');
    }
    return data as {
        ok: boolean;
        ai: { narrative: string; structuredPayload: any; safety: any; telemetry: any };
        choices: { message: { content: string } }[];
    };
}
