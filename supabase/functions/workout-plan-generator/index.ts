// Workout Plan Generator Edge Function
// Personalized workout recommendations based on cycle phase, energy, equipment, and limitations.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface WorkoutPlanRequest {
    phase: string;
    fitnessGoal: string;
    activityLevel: string;
    energyLevel: 'low' | 'medium' | 'high';
    availableTime: number; // minutes
    equipment?: string[];
    injuries?: string[];
    symptoms?: string[];
    focusArea?: string;
    progressionPreference?: "steady" | "push" | "deload";
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

interface ExerciseVariant extends Exercise {
    tags: string[];
    requires?: Array<"bodyweight" | "dumbbell" | "barbell" | "machine" | "cardio" | "mat">;
    avoidIf?: string[];
    intensityBand: "low" | "moderate" | "high";
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHASE_CONTEXT: Record<string, string> = {
    Menstrual: "Restoration phase. Keep effort gentle and prioritize comfort, mobility, and circulation.",
    Follicular: "Rising-energy phase. Great window for progressive overload and skill confidence.",
    Ovulatory: "Peak-performance phase. Push output while protecting joints with strict form cues.",
    Luteal: "Stabilization phase. Maintain intensity early, then bias toward lower-impact consistency."
};

const PHASE_EXERCISE_POOL: Record<string, ExerciseVariant[]> = {
    Menstrual: [
        { name: "Cat-Cow Mobility Flow", duration: "4 min", description: "Slow spinal articulation with breath.", tags: ["mobility", "core"], requires: ["mat"], intensityBand: "low" },
        { name: "Supported Glute Bridge", duration: "6 min", description: "Gentle posterior-chain activation.", tags: ["lower body", "full body"], requires: ["bodyweight", "mat"], intensityBand: "low" },
        { name: "Nasal Breathing Walk", duration: "10 min", description: "Easy pace walk focusing on nasal breathing.", tags: ["cardio", "full body"], requires: ["bodyweight"], intensityBand: "low" },
        { name: "Wall Pushup Tempo", duration: "6 min", description: "Low-load upper push pattern with control.", tags: ["upper body", "full body"], requires: ["bodyweight"], intensityBand: "low" },
        { name: "Supine Figure-4 Stretch", duration: "4 min", description: "Hip-opening and lower-back relief.", tags: ["mobility"], requires: ["mat"], intensityBand: "low" },
        { name: "Dead Bug Core Reset", duration: "5 min", description: "Core coordination without spinal strain.", tags: ["core"], requires: ["mat"], intensityBand: "low" }
    ],
    Follicular: [
        { name: "Goblet Squat", duration: "8 min", description: "Controlled lower-body strength volume.", tags: ["lower body", "full body"], requires: ["dumbbell"], intensityBand: "moderate" },
        { name: "Split Squat", duration: "8 min", description: "Unilateral strength and stability work.", tags: ["lower body"], requires: ["bodyweight"], intensityBand: "moderate" },
        { name: "Dumbbell Row", duration: "7 min", description: "Horizontal pull for upper-back strength.", tags: ["upper body"], requires: ["dumbbell"], intensityBand: "moderate" },
        { name: "Incline Pushup", duration: "6 min", description: "Upper push with shoulder-friendly loading.", tags: ["upper body", "full body"], requires: ["bodyweight"], intensityBand: "moderate" },
        { name: "Bike Intervals", duration: "12 min", description: "Short cardio intervals to build capacity.", tags: ["cardio", "full body"], requires: ["cardio"], intensityBand: "moderate" },
        { name: "Pallof Press Hold", duration: "5 min", description: "Anti-rotation core control.", tags: ["core"], requires: ["bodyweight"], intensityBand: "moderate" },
        { name: "Lateral Band Walk", duration: "5 min", description: "Glute med activation and hip stability.", tags: ["lower body", "mobility"], requires: ["bodyweight"], intensityBand: "moderate" }
    ],
    Ovulatory: [
        { name: "Barbell Front Squat", duration: "10 min", description: "Strength-focused compound lower-body lift.", tags: ["lower body", "full body"], requires: ["barbell"], intensityBand: "high" },
        { name: "Trap-Bar Deadlift", duration: "10 min", description: "Power-oriented hinge with neutral spine focus.", tags: ["lower body", "full body"], requires: ["barbell"], intensityBand: "high" },
        { name: "Push Press", duration: "8 min", description: "Explosive upper-body power pattern.", tags: ["upper body", "full body"], requires: ["dumbbell"], intensityBand: "high", avoidIf: ["shoulder"] },
        { name: "Sprint Bike Intervals", duration: "12 min", description: "High-output interval conditioning.", tags: ["cardio", "full body"], requires: ["cardio"], intensityBand: "high" },
        { name: "Box Step-Up Drive", duration: "8 min", description: "Power and balance without plyometric impact.", tags: ["lower body"], requires: ["bodyweight"], intensityBand: "high", avoidIf: ["knee"] },
        { name: "Renegade Row", duration: "7 min", description: "Core-integrated pull with anti-rotation demand.", tags: ["core", "upper body"], requires: ["dumbbell"], intensityBand: "high", avoidIf: ["wrist", "shoulder"] },
        { name: "Assault Bike Tempo", duration: "10 min", description: "Sustained hard effort with cadence control.", tags: ["cardio"], requires: ["cardio"], intensityBand: "high" }
    ],
    Luteal: [
        { name: "Tempo RDL", duration: "8 min", description: "Controlled hinge pattern for posterior-chain work.", tags: ["lower body", "full body"], requires: ["dumbbell"], intensityBand: "moderate", avoidIf: ["back"] },
        { name: "Step-Back Lunge", duration: "8 min", description: "Lower-body strength with lower joint stress.", tags: ["lower body"], requires: ["bodyweight"], intensityBand: "moderate", avoidIf: ["knee"] },
        { name: "Seated Dumbbell Press", duration: "7 min", description: "Stable upper-body pressing volume.", tags: ["upper body"], requires: ["dumbbell"], intensityBand: "moderate", avoidIf: ["shoulder"] },
        { name: "Row Erg Easy Intervals", duration: "10 min", description: "Steady aerobic work without impact.", tags: ["cardio", "full body"], requires: ["cardio"], intensityBand: "moderate" },
        { name: "Pilates Core Sequence", duration: "8 min", description: "Core control and breathing rhythm.", tags: ["core", "mobility"], requires: ["mat"], intensityBand: "low" },
        { name: "Mobility Circuit", duration: "8 min", description: "Hip, thoracic, and ankle mobility flow.", tags: ["mobility"], requires: ["mat"], intensityBand: "low" },
        { name: "Incline Treadmill Walk", duration: "12 min", description: "Low-impact conditioning with moderate load.", tags: ["cardio"], requires: ["cardio"], intensityBand: "moderate" }
    ]
};

const PHASE_AVOID: Record<string, string[]> = {
    Menstrual: ["Max-effort HIIT", "Heavy spinal loading", "Exhaustive conditioning"],
    Follicular: ["Sudden volume spikes without warm-up"],
    Ovulatory: ["Sloppy high-speed reps", "Uncontrolled landing mechanics"],
    Luteal: ["Late-phase all-out intervals", "Excessive plyometrics when fatigued"]
};

const RECOVERY_TIPS: Record<string, string[]> = {
    Menstrual: ["Prioritize sleep and warmth post-session", "Use gentle breathing to downshift stress", "Hydrate steadily through the day", "Keep intensity conversational"],
    Follicular: ["Great window for progressive overload", "Aim for protein within 1-2 hours", "Keep hydration high for volume days", "Track performance lifts this week"],
    Ovulatory: ["Warm up thoroughly before top sets", "Keep form strict as intensity rises", "Use longer rest between hard efforts", "Hydrate with electrolytes during intervals"],
    Luteal: ["Use controlled tempo and steady pacing", "Scale effort if PMS or fatigue spikes", "Bias recovery and sleep consistency", "Favor lower-impact cardio options"]
};

const WARMUP_LIBRARY: Exercise[] = [
    { name: "Joint Prep Sequence", duration: "2 min", description: "Ankles, hips, thoracic spine, shoulders." },
    { name: "Dynamic Mobility", duration: "3 min", description: "Leg swings, arm circles, inchworms." },
    { name: "Light Cardio Ramp", duration: "3 min", description: "Low effort movement to raise core temperature." },
    { name: "Activation Set", duration: "2 min", description: "Glute and core activation before main work." }
];

const COOLDOWN_LIBRARY: Exercise[] = [
    { name: "Parasympathetic Breathing", duration: "2 min", description: "Slow exhale-focused breathing." },
    { name: "Posterior Chain Stretch", duration: "3 min", description: "Hamstrings, glutes, lower back." },
    { name: "Hip Flexor + Quad Release", duration: "3 min", description: "Reduce lower-body residual tension." },
    { name: "Thoracic Opener", duration: "2 min", description: "Restore upper-back mobility and posture." }
];

function stableHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 33 + input.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function rotateArray<T>(items: T[], offset: number): T[] {
    if (!items.length) return [];
    const shift = ((offset % items.length) + items.length) % items.length;
    return [...items.slice(shift), ...items.slice(0, shift)];
}

function normalizeTextList(values: string[] = []): string[] {
    return values.map((value) => value.toLowerCase().trim()).filter(Boolean);
}

function resolveIntensity(
    phase: string,
    energyLevel: "low" | "medium" | "high",
    symptoms: string[]
): "low" | "moderate" | "high" {
    const symptomText = symptoms.join(" ").toLowerCase();
    const fatigueSignals = ["fatigue", "cramp", "pain", "low energy", "exhausted", "dizzy"];
    if (energyLevel === "low" || fatigueSignals.some((signal) => symptomText.includes(signal))) {
        return "low";
    }
    if (energyLevel === "medium") {
        return "moderate";
    }
    if (phase === "Menstrual") {
        return "moderate";
    }
    return phase === "Ovulatory" ? "high" : "moderate";
}

function filterByEquipment(exercises: ExerciseVariant[], equipmentText: string): ExerciseVariant[] {
    const hasGym = /(gym|barbell|machine|cable|rack)/.test(equipmentText);
    const hasDumbbell = /(dumbbell|kettlebell|weights|full gym)/.test(equipmentText) || hasGym;
    const hasCardioMachine = /(bike|rower|treadmill|cardio|full gym)/.test(equipmentText) || hasGym;
    const hasMat = /(mat|bodyweight|home|full gym)/.test(equipmentText) || equipmentText.length === 0;

    return exercises.filter((exercise) => {
        if (!exercise.requires || exercise.requires.length === 0) return true;
        return exercise.requires.every((requirement) => {
            if (requirement === "bodyweight") return true;
            if (requirement === "dumbbell") return hasDumbbell;
            if (requirement === "barbell" || requirement === "machine") return hasGym;
            if (requirement === "cardio") return hasCardioMachine;
            if (requirement === "mat") return hasMat;
            return true;
        });
    });
}

function filterByInjuries(exercises: ExerciseVariant[], injuries: string[]): ExerciseVariant[] {
    const injuryText = injuries.join(" ");
    return exercises.filter((exercise) => {
        if (!exercise.avoidIf || exercise.avoidIf.length === 0) return true;
        return !exercise.avoidIf.some((token) => injuryText.includes(token));
    }).map((exercise) => {
        if (injuryText.includes("knee") && /(squat|lunge|jump|step-up)/i.test(exercise.name)) {
            return { ...exercise, modifications: "Reduce range of motion and prioritize pain-free movement." };
        }
        if (injuryText.includes("back") && /(deadlift|hinge)/i.test(exercise.name)) {
            return { ...exercise, modifications: "Use lighter load, neutral spine, and slower tempo." };
        }
        if (injuryText.includes("shoulder") && /(press|push|renegade)/i.test(exercise.name)) {
            return { ...exercise, modifications: "Use neutral grip and keep range pain-free." };
        }
        return exercise;
    });
}

function filterByFocus(exercises: ExerciseVariant[], focus: string): ExerciseVariant[] {
    if (!focus || /full body/i.test(focus)) return exercises;
    const normalizedFocus = focus.toLowerCase();
    const filtered = exercises.filter((exercise) =>
        exercise.tags.some((tag) => normalizedFocus.includes(tag) || tag.includes(normalizedFocus))
    );
    return filtered.length > 0 ? filtered : exercises;
}

function addOvulatoryFormCue(exercises: ExerciseVariant[], phase: string): ExerciseVariant[] {
    if (phase !== "Ovulatory") return exercises;
    return exercises.map((exercise) => ({
        ...exercise,
        modifications: exercise.modifications
            ? `${exercise.modifications} Focus on strict form and joint alignment.`
            : "Focus on strict form and controlled reps because joint laxity can be higher now."
    }));
}

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
            focusArea = "Full Body",
            progressionPreference = "steady"
        } = body;

        if (!phase) {
            return new Response(
                JSON.stringify({ error: 'phase is required' }),
                { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }

        const phasePool = PHASE_EXERCISE_POOL[phase] || PHASE_EXERCISE_POOL.Follicular;
        const normalizedInjuries = normalizeTextList(injuries);
        const normalizedSymptoms = normalizeTextList(symptoms);
        const equipmentText = normalizeTextList(equipment).join(" ");

        const finalIntensity = resolveIntensity(phase, energyLevel, normalizedSymptoms);
        const intensityFiltered = phasePool.filter((exercise) => {
            if (finalIntensity === "low") return exercise.intensityBand === "low" || exercise.intensityBand === "moderate";
            if (finalIntensity === "moderate") return exercise.intensityBand !== "high" || phase === "Ovulatory";
            return true;
        });

        let candidateExercises = filterByEquipment(intensityFiltered, equipmentText);
        candidateExercises = filterByFocus(candidateExercises, focusArea);
        candidateExercises = filterByInjuries(candidateExercises, normalizedInjuries);
        candidateExercises = addOvulatoryFormCue(candidateExercises, phase);

        // Guarantee we always have candidates.
        if (candidateExercises.length === 0) {
            candidateExercises = filterByInjuries(filterByEquipment(phasePool, equipmentText), normalizedInjuries);
        }

        const exerciseCount = availableTime <= 20 ? 3 : availableTime <= 35 ? 4 : availableTime <= 50 ? 5 : 6;
        const variationSeed = stableHash(`${phase}|${energyLevel}|${availableTime}|${focusArea}|${progressionPreference}|${new Date().getTime()}`);
        const rotatedMain = rotateArray(candidateExercises, variationSeed).slice(0, Math.min(exerciseCount, candidateExercises.length));

        const warmup = rotateArray(WARMUP_LIBRARY, variationSeed + 1).slice(0, 3);
        const cooldown = rotateArray(COOLDOWN_LIBRARY, variationSeed + 2).slice(0, 3);

        const avoidList = [...new Set([...(PHASE_AVOID[phase] || []), ...(normalizedInjuries.length ? normalizedInjuries.map((value) => `Avoid aggravating ${value}`) : [])])];
        const recoveryTips = rotateArray(RECOVERY_TIPS[phase] || RECOVERY_TIPS.Follicular, variationSeed + 3).slice(0, 4);

        const response: WorkoutPlanResponse = {
            intensity: finalIntensity,
            duration: availableTime,
            warmup,
            main: rotatedMain,
            cooldown,
            exercisesToAvoid: avoidList,
            recoveryTips,
            phaseContext: PHASE_CONTEXT[phase] || PHASE_CONTEXT.Follicular
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
