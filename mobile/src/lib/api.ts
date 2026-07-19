import { Platform } from 'react-native';

const getBaseUrl = () => {
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
