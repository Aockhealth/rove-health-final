// Workout Plan Generator Edge Function
// AI-powered exercise recommendations based on cycle phase, energy, and goals

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface WorkoutPlanRequest {
    phase: string;
    fitnessGoal: string;
    activityLevel: string;
    energyLevel: 'low' | 'medium' | 'high';
    availableTime: number;  // minutes
    equipment?: string[];
    injuries?: string[];
    symptoms?: string[];
}

interface Exercise {
    name: string;
    duration: string;
    description: string;
    modifications?: string;
}

interface WorkoutPlanResponse {
    intensity: 'low' | 'moderate' | 'high';
    duration: number;
    warmup: Exercise[];
    main: Exercise[];
    cooldown: Exercise[];
    exercisesToAvoid: string[];
    recoveryTips: string[];
    phaseContext: string;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase-based workout recommendations
const PHASE_WORKOUTS: Record<string, {
    intensity: 'low' | 'moderate' | 'high';
    mainExercises: Exercise[];
    avoid: string[];
    context: string;
}> = {
    'Menstrual': {
        intensity: 'low',
        context: 'Your body is in restoration mode. Focus on gentle movement that supports blood flow without straining your system.',
        mainExercises: [
            { name: 'Gentle Yoga', duration: '15-20 min', description: 'Child\'s pose, Cat-cow, Butterfly stretch' },
            { name: 'Walking', duration: '20-30 min', description: 'Slow, mindful walking outdoors' },
            { name: 'Stretching', duration: '10-15 min', description: 'Focus on hips, lower back, hamstrings' },
            { name: 'Breathwork', duration: '5-10 min', description: 'Deep belly breathing, 4-7-8 technique' },
        ],
        avoid: ['HIIT', 'Heavy lifting', 'Running', 'Intense core work', 'Hot yoga'],
    },
    'Follicular': {
        intensity: 'moderate',
        context: 'Energy is rising with estrogen! Great time to try new activities and build cardio endurance.',
        mainExercises: [
            { name: 'Cardio/Hikes', duration: '30-45 min', description: 'Running, cycling, dancing, hiking' },
            { name: 'Vinyasa Yoga', duration: '45 min', description: 'Dynamic, flowing sequences' },
            { name: 'Light Strength', duration: '30 min', description: 'Resistance bands, bodyweight, light weights' },
            { name: 'Dance/Zumba', duration: '30-45 min', description: 'High energy, social, fun movement' },
        ],
        avoid: ['Overtraining without rest days', 'Heavy lifting without proper warmup'],
    },
    'Ovulatory': {
        intensity: 'high',
        context: 'Peak performance time! Your body can handle max intensity. Go for PRs and challenging workouts.',
        mainExercises: [
            { name: 'HIIT', duration: '20-30 min', description: 'Sprints, intervals, bootcamp style' },
            { name: 'Heavy Lifting', duration: '45 min', description: 'Compound movements, progressive overload' },
            { name: 'Spin Class', duration: '45 min', description: 'High intensity cycling' },
            { name: 'Group Sports', duration: 'Variable', description: 'Tennis, basketball, soccer - social and competitive' },
        ],
        avoid: ['Overheating without hydration', 'Sleep deprivation'],
    },
    'Luteal': {
        intensity: 'moderate',
        context: 'Energy is declining. Focus on strength maintenance and steady-state cardio. Listen to your body.',
        mainExercises: [
            { name: 'Pilates', duration: '30-40 min', description: 'Core control, stability, mat work' },
            { name: 'Moderate Strength', duration: '30 min', description: 'Lower weights, higher reps' },
            { name: 'Walking/Hiking', duration: '45 min', description: 'Steady pace in nature' },
            { name: 'Yin Yoga', duration: '20-30 min', description: 'Deep stretches, restorative poses' },
        ],
        avoid: ['Heavy HIIT (late phase)', 'Plyometrics', 'Overexertion'],
    },
};

// Warmup exercises
const WARMUPS: Exercise[] = [
    { name: 'Joint Circles', duration: '2 min', description: 'Ankles, knees, hips, shoulders, wrists' },
    { name: 'Dynamic Stretches', duration: '3 min', description: 'Leg swings, arm circles, torso twists' },
    { name: 'Light Cardio', duration: '3-5 min', description: 'Marching in place, jumping jacks, high knees' },
];

// Cooldown exercises
const COOLDOWNS: Exercise[] = [
    { name: 'Static Stretches', duration: '5 min', description: 'Hamstrings, quads, hip flexors, shoulders' },
    { name: 'Deep Breathing', duration: '2-3 min', description: 'Slow inhales and exhales, activate parasympathetic' },
    { name: 'Foam Rolling', duration: '3-5 min', description: 'IT band, quads, back, calves' },
];

// Recovery tips by phase
const RECOVERY_TIPS: Record<string, string[]> = {
    'Menstrual': [
        'Prioritize sleep (8-9 hours)',
        'Use heat therapy for cramps',
        'Take warm baths with Epsom salts',
        'Light movement helps blood flow',
    ],
    'Follicular': [
        'Good time to increase training volume',
        'Focus on progressive overload',
        'Protein timing matters - eat within 2 hours of workout',
        'Stay hydrated with electrolytes',
    ],
    'Ovulatory': [
        'Peak recovery capacity - push yourself',
        'Ice baths or cold showers can help',
        'Watch for overheating',
        'Sleep quality affects next phase',
    ],
    'Luteal': [
        'Extra rest between sets',
        'Magnesium supplement before bed',
        'Avoid late-night intense workouts',
        'Scale back if PMS symptoms are strong',
    ],
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    try {
        const body: WorkoutPlanRequest = await req.json();

        const {
            phase,
            fitnessGoal,
            activityLevel,
            energyLevel,
            availableTime,
            equipment = [],
            injuries = [],
            symptoms = [],
        } = body;

        if (!phase) {
            return new Response(
                JSON.stringify({ error: 'phase is required' }),
                { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }

        // Get phase-specific workout template
        const phaseWorkout = PHASE_WORKOUTS[phase] || PHASE_WORKOUTS['Follicular'];

        // Adjust intensity based on energy level
        let finalIntensity = phaseWorkout.intensity;
        if (energyLevel === 'low') {
            finalIntensity = 'low';
        } else if (energyLevel === 'medium' && phaseWorkout.intensity === 'high') {
            finalIntensity = 'moderate';
        }

        // Filter exercises based on available time
        let mainExercises = phaseWorkout.mainExercises;
        if (availableTime <= 20) {
            mainExercises = mainExercises.slice(0, 1);
        } else if (availableTime <= 40) {
            mainExercises = mainExercises.slice(0, 2);
        }

        // Filter exercises if injuries present
        const avoidList = [...phaseWorkout.avoid];
        if (injuries.includes('knee')) {
            avoidList.push('Running', 'Jumping', 'Squats', 'Lunges');
            mainExercises = mainExercises.map(e => ({
                ...e,
                modifications: e.name.includes('Cardio') ? 'Swap for swimming or cycling' : undefined,
            }));
        }
        if (injuries.includes('back')) {
            avoidList.push('Deadlifts', 'Heavy core work', 'Sit-ups');
        }
        if (injuries.includes('shoulder')) {
            avoidList.push('Overhead press', 'Push-ups', 'Planks');
        }

        // Symptom-based adjustments
        if (symptoms.includes('Cramps') || symptoms.includes('Fatigue')) {
            finalIntensity = 'low';
            mainExercises = mainExercises.filter(e =>
                !e.name.includes('HIIT') && !e.name.includes('Heavy')
            );
        }

        // Calculate total duration
        const warmupDuration = 5;
        const cooldownDuration = 5;
        const mainDuration = Math.min(availableTime - warmupDuration - cooldownDuration, 45);

        const response: WorkoutPlanResponse = {
            intensity: finalIntensity,
            duration: availableTime,
            warmup: WARMUPS,
            main: mainExercises,
            cooldown: COOLDOWNS,
            exercisesToAvoid: avoidList,
            recoveryTips: RECOVERY_TIPS[phase] || RECOVERY_TIPS['Follicular'],
            phaseContext: phaseWorkout.context,
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'
                }
            }
        );

    } catch (error) {
        console.error('Error in workout-plan-generator:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
    }
});
