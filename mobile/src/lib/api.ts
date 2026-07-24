import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
    // Allow overriding the local API URL in development (useful for ngrok or forcing prod)
    if (process.env.EXPO_PUBLIC_DEV_API_URL) {
        return process.env.EXPO_PUBLIC_DEV_API_URL;
    }

    // For local development
    if (__DEV__) {
        // `localhost`/`10.0.2.2` only resolve to the dev machine on a
        // SIMULATOR/EMULATOR — on a real phone (e.g. Expo Go on an actual
        // iPhone over WiFi), "localhost" means the phone itself, so every
        // API call would silently fail. Expo already knows the Mac's real
        // LAN IP (it's what the phone used to load the JS bundle in the
        // first place) — reuse it here instead of guessing.
        const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
        const lanHost = hostUri?.split(':')[0];
        if (lanHost && lanHost !== 'localhost' && lanHost !== '127.0.0.1') {
            return `http://${lanHost}:3000`;
        }
        return Platform.OS === 'android'
            ? 'http://10.0.2.2:3000'
            : 'http://localhost:3000';
    }
    // Production: the API routes stay deployed on rovehealth.in even after
    // the website itself goes shop-only — they are backend functions, not
    // web pages. EXPO_PUBLIC_API_URL is set in mobile/.env; the literal here
    // is the safety net so a missing env var can never bring back the old
    // "your-production-url.com" placeholder bug.
    return process.env.EXPO_PUBLIC_API_URL || 'https://rovehealth.in';
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
    sessionDuration: string,
    recentChosen?: string[],
    preferenceSummary?: string
) {
    const res = await fetch(`${API_URL}/api/rove-coach`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ phase, energyLevel, goal, equipment, injuries, fitnessLevel, workoutFocus, sessionDuration, recentChosen, preferenceSummary })
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch plan');
    }
    
    return res.json();
}

// ─── Chef v2: "pick your plate" ──────────────────────────────────────────────

export async function fetchChefOptions(input: {
    phase: string;
    mealType: 'snack' | 'smoothie' | 'salad';
    dietaryPreferences?: string;
    cuisine?: string;
    symptoms?: string;
    recentChosen?: string[];
    recentShown?: string[];
    preferenceSummary?: string;
}) {
    const res = await fetch(`${API_URL}/api/rove-chef-options`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
            phase: input.phase,
            mealType: input.mealType,
            dietary_preferences: input.dietaryPreferences,
            cuisine: input.cuisine,
            symptoms: input.symptoms,
            recentChosen: input.recentChosen,
            recentShown: input.recentShown,
            preferenceSummary: input.preferenceSummary,
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to fetch chef options');
    }

    return res.json();
}

export async function fetchChefDetail(input: {
    dishName: string;
    mealType: 'snack' | 'smoothie' | 'salad';
    phase: string;
    dietaryPreferences?: string;
    keyIngredients?: string[];
}) {
    const res = await fetch(`${API_URL}/api/rove-chef-detail`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
            dishName: input.dishName,
            mealType: input.mealType,
            phase: input.phase,
            dietary_preferences: input.dietaryPreferences,
            keyIngredients: input.keyIngredients,
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to fetch recipe detail');
    }

    return res.json();
}

// ─── Insights: real mood-pattern insight (replaces the previous fake/mocked ── //
// generation in mobile/src/app/(app)/insights.tsx) — wraps the same           //
// generateMoodInsight server action the web app already uses and caches.     //
export async function fetchRoveInsight(input: { phase: string; moodCounts: Record<string, number> }) {
    const res = await fetch(`${API_URL}/api/rove-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: input.phase, moodCounts: input.moodCounts }),
    });

    if (!res.ok) {
        throw new Error('Failed to fetch insight');
    }

    return res.json() as Promise<{ title?: string; insight: string | null }>;
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
        headers: { 
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ phase, dietary_preferences, cuisine, type, personalization })
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch recipe');
    }
    
    return res.json();
}
