// Diet Plan Generator Edge Function
// AI-powered macros and calorie calculation based on cycle phase, goals, and conditions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface DietPlanRequest {
    // Cache Key Factors
    phase: string;
    goal: string;
    dietType: string;
    activityLevel: string;

    // Runtime Personalization
    weight: number;
    height: number;
    age: number;
    metabolicConditions?: string[];
    symptoms?: string[];
    todayExercise?: {
        type: string;
        duration: number;
        intensity: string;
    };
    weightLossTarget?: {
        targetKg: number;
        weeklyRateKg: number;
    };
}

interface MacroBreakdown {
    grams: number;
    percentage: number;
}

interface DietPlanResponse {
    calories: number;
    macros: {
        protein: MacroBreakdown;
        fats: MacroBreakdown;
        carbs: MacroBreakdown;
    };
    phaseNutritionFocus: string;
    hydrationGoalLiters: number;
    recommendedFoods: Array<{
        category: string;
        examples: string[];
        reason: string;
    }>;
    foodsToAvoid: string[];
    adjustments: Array<{
        condition: string;
        modification: string;
    }>;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase-based macro ratios
const PHASE_MACROS: Record<string, { protein: number; fats: number; carbs: number }> = {
    'Menstrual': { protein: 0.30, fats: 0.40, carbs: 0.30 },
    'Follicular': { protein: 0.30, fats: 0.20, carbs: 0.50 },
    'Ovulatory': { protein: 0.25, fats: 0.20, carbs: 0.55 },
    'Luteal': { protein: 0.30, fats: 0.30, carbs: 0.40 },
};

// Phase-based activity multipliers
const PHASE_ACTIVITY: Record<string, number> = {
    'Menstrual': 1.2,
    'Follicular': 1.55,
    'Ovulatory': 1.725,
    'Luteal': 1.375,
};

// Phase-specific nutrition focus
const PHASE_FOCUS: Record<string, string> = {
    'Menstrual': 'Iron restoration & anti-inflammatory foods',
    'Follicular': 'Lean protein & fresh vegetables for rising estrogen',
    'Ovulatory': 'Fiber & antioxidants to support peak energy',
    'Luteal': 'Complex carbs & magnesium for PMS management',
};

// Phase-specific recommended foods by diet type
const PHASE_FOODS: Record<string, Record<string, Array<{ category: string; examples: string[]; reason: string }>>> = {
    'Menstrual': {
        'vegetarian': [
            { category: 'Iron-Rich', examples: ['Spinach', 'Lentils', 'Tofu', 'Fortified cereals'], reason: 'Replenish iron lost during menstruation' },
            { category: 'Magnesium', examples: ['Dark chocolate', 'Almonds', 'Banana', 'Avocado'], reason: 'Reduce cramps and muscle tension' },
            { category: 'Omega-3', examples: ['Walnuts', 'Flax seeds', 'Chia seeds'], reason: 'Anti-inflammatory for pain relief' },
        ],
        'non_veg': [
            { category: 'Iron-Rich', examples: ['Red meat', 'Liver', 'Eggs', 'Shellfish'], reason: 'Heme iron for fast absorption' },
            { category: 'Omega-3', examples: ['Salmon', 'Mackerel', 'Sardines'], reason: 'Reduce inflammation and cramps' },
            { category: 'Warming Foods', examples: ['Bone broth', 'Ginger tea', 'Turmeric'], reason: 'Support digestion and comfort' },
        ],
        'vegan': [
            { category: 'Iron-Rich', examples: ['Spinach', 'Lentils', 'Quinoa', 'Tempeh'], reason: 'Plant-based iron sources' },
            { category: 'Vitamin C', examples: ['Citrus', 'Bell peppers', 'Broccoli'], reason: 'Enhance iron absorption' },
            { category: 'Anti-inflammatory', examples: ['Turmeric', 'Ginger', 'Berries'], reason: 'Reduce menstrual pain' },
        ],
        'jain': [
            { category: 'Iron-Rich', examples: ['Spinach', 'Amaranth', 'Makhana'], reason: 'Jain-friendly iron sources' },
            { category: 'Magnesium', examples: ['Pumpkin seeds', 'Dark chocolate', 'Almonds'], reason: 'Cramp relief' },
            { category: 'Warming', examples: ['Ginger tea', 'Turmeric milk', 'Moong dal'], reason: 'Easy digestion' },
        ],
    },
    'Follicular': {
        'vegetarian': [
            { category: 'Probiotics', examples: ['Yogurt', 'Kefir', 'Kimchi', 'Sauerkraut'], reason: 'Support estrogen metabolism' },
            { category: 'Cruciferous', examples: ['Broccoli', 'Cauliflower', 'Brussels sprouts'], reason: 'Help liver process estrogen' },
            { category: 'Lean Protein', examples: ['Paneer', 'Eggs', 'Lentils'], reason: 'Support follicle development' },
        ],
        'non_veg': [
            { category: 'Lean Protein', examples: ['Chicken breast', 'Turkey', 'Fish'], reason: 'Muscle repair during active phase' },
            { category: 'Fresh Veggies', examples: ['Salads', 'Stir-fry greens', 'Sprouts'], reason: 'Liver detox support' },
            { category: 'Zinc-Rich', examples: ['Oysters', 'Beef', 'Crab'], reason: 'Support follicle health' },
        ],
        'vegan': [
            { category: 'Fermented', examples: ['Tempeh', 'Miso', 'Sauerkraut', 'Kombucha'], reason: 'Gut health for estrogen balance' },
            { category: 'Fresh Greens', examples: ['Kale', 'Arugula', 'Spinach'], reason: 'Phytonutrients for detox' },
            { category: 'Protein', examples: ['Edamame', 'Tofu', 'Chickpeas'], reason: 'Plant-based muscle support' },
        ],
        'jain': [
            { category: 'Probiotics', examples: ['Curd', 'Buttermilk', 'Fermented rice'], reason: 'Gut health' },
            { category: 'Light Protein', examples: ['Moong dal', 'Paneer', 'Milk'], reason: 'Easy to digest' },
            { category: 'Fresh Produce', examples: ['Pomegranate', 'Cucumber', 'Coconut'], reason: 'Hydration and energy' },
        ],
    },
    'Ovulatory': {
        'vegetarian': [
            { category: 'Fiber', examples: ['Quinoa', 'Oats', 'Beans'], reason: 'Bind excess estrogen' },
            { category: 'Antioxidants', examples: ['Berries', 'Dark leafy greens', 'Nuts'], reason: 'Support egg quality' },
            { category: 'Cooling', examples: ['Cucumber', 'Watermelon', 'Coconut water'], reason: 'Balance peak body heat' },
        ],
        'non_veg': [
            { category: 'High-Quality Protein', examples: ['Eggs', 'Fish', 'Lean meat'], reason: 'Peak performance support' },
            { category: 'Raw Foods', examples: ['Sashimi', 'Salads', 'Ceviche'], reason: 'Light and energizing' },
            { category: 'Cooling', examples: ['Cucumber', 'Mint', 'Coconut water'], reason: 'Temperature balance' },
        ],
        'vegan': [
            { category: 'Raw Foods', examples: ['Salads', 'Smoothie bowls', 'Fresh fruits'], reason: 'Peak energy phase' },
            { category: 'Fiber-Rich', examples: ['Quinoa', 'Chia', 'Beans'], reason: 'Estrogen detox' },
            { category: 'Hydrating', examples: ['Watermelon', 'Cucumber', 'Celery'], reason: 'Cool the body' },
        ],
        'jain': [
            { category: 'Fiber', examples: ['Quinoa', 'Amaranth', 'Rajgira'], reason: 'Support detox' },
            { category: 'Cooling', examples: ['Coconut water', 'Cucumber', 'Muskmelon'], reason: 'Balance heat' },
            { category: 'Light Meals', examples: ['Fruit salads', 'Sprouts', 'Makhana'], reason: 'Easy digestion' },
        ],
    },
    'Luteal': {
        'vegetarian': [
            { category: 'Complex Carbs', examples: ['Sweet potato', 'Brown rice', 'Oats'], reason: 'Stabilize blood sugar and mood' },
            { category: 'Magnesium', examples: ['Dark chocolate', 'Pumpkin seeds', 'Bananas'], reason: 'Reduce PMS symptoms' },
            { category: 'B-Vitamins', examples: ['Chickpeas', 'Eggs', 'Fortified cereals'], reason: 'Support serotonin production' },
        ],
        'non_veg': [
            { category: 'Serotonin Boosters', examples: ['Turkey', 'Salmon', 'Eggs'], reason: 'Mood stabilization' },
            { category: 'Complex Carbs', examples: ['Sweet potato', 'Brown rice', 'Whole grains'], reason: 'Steady energy' },
            { category: 'Healthy Fats', examples: ['Fatty fish', 'Avocado', 'Olive oil'], reason: 'Hormone balance' },
        ],
        'vegan': [
            { category: 'Complex Carbs', examples: ['Sweet potato', 'Quinoa', 'Oats'], reason: 'Blood sugar stability' },
            { category: 'B6-Rich', examples: ['Chickpeas', 'Bananas', 'Potatoes'], reason: 'PMS relief' },
            { category: 'Magnesium', examples: ['Dark chocolate', 'Almonds', 'Spinach'], reason: 'Reduce cravings' },
        ],
        'jain': [
            { category: 'Complex Carbs', examples: ['Sweet potato', 'Sabudana', 'Rajgira'], reason: 'Steady energy' },
            { category: 'Calming Foods', examples: ['Warm milk', 'Makhana', 'Almonds'], reason: 'Reduce anxiety' },
            { category: 'Magnesium', examples: ['Sesame seeds', 'Sunflower seeds', 'Dark chocolate'], reason: 'PMS management' },
        ],
    },
};

// Foods to avoid by phase
const FOODS_TO_AVOID: Record<string, string[]> = {
    'Menstrual': ['Cold foods', 'Fried foods', 'Excess caffeine', 'Refined sugar', 'Alcohol'],
    'Follicular': ['Heavy oils', 'Processed snacks', 'Excess alcohol', 'Heavy dairy'],
    'Ovulatory': ['Heavy carbs', 'Excess red meat', 'Spicy foods', 'Alcohol'],
    'Luteal': ['Excess salt', 'Refined sugar', 'Alcohol', 'Caffeine'],
};

function stableHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function rotateArray<T>(items: T[], offset: number): T[] {
    if (!items.length) return [];
    const shift = ((offset % items.length) + items.length) % items.length;
    return [...items.slice(shift), ...items.slice(0, shift)];
}

function buildRotatedFoodPlan(
    phase: string,
    dietType: string,
    goal: string,
    symptoms: string[],
    foodPool: Array<{ category: string; examples: string[]; reason: string }>
) {
    if (!foodPool.length) return [];

    const daySeed = new Date().toISOString().slice(0, 10); // Daily rotation to avoid repetitive outputs.
    const symptomSeed = [...symptoms].sort().join("|");
    const seed = stableHash(`${phase}|${dietType}|${goal}|${symptomSeed}|${daySeed}`);

    const rotatedCategories = rotateArray(foodPool, seed);
    const targetCount = Math.min(3, rotatedCategories.length);

    return rotatedCategories.slice(0, targetCount).map((item, index) => {
        const rotatedExamples = rotateArray(item.examples, seed + index).slice(0, Math.min(3, item.examples.length));
        return {
            ...item,
            examples: rotatedExamples
        };
    });
}

// Calculate BMR using Mifflin-St Jeor equation (female)
function calculateBMR(weight: number, height: number, age: number): number {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

// Calculate exercise calories burned
function calculateExerciseCalories(exercise: { type: string; duration: number; intensity: string }, weight: number): number {
    const MET_VALUES: Record<string, Record<string, number>> = {
        'cardio': { 'low': 4, 'moderate': 6, 'high': 10 },
        'strength': { 'low': 3, 'moderate': 5, 'high': 6 },
        'yoga': { 'low': 2.5, 'moderate': 3, 'high': 4 },
        'rest': { 'low': 1, 'moderate': 1, 'high': 1 },
    };

    const met = MET_VALUES[exercise.type]?.[exercise.intensity] || 3;
    return (met * weight * exercise.duration) / 60;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    try {
        const body: DietPlanRequest = await req.json();

        const {
            phase,
            goal,
            dietType,
            activityLevel,
            weight,
            height,
            age,
            metabolicConditions = [],
            symptoms = [],
            todayExercise,
            weightLossTarget,
        } = body;

        // Validate required fields
        if (!phase || !weight || !height || !age) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: phase, weight, height, age' }),
                { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }

        // 1. Calculate BMR
        const bmr = calculateBMR(weight, height, age);

        // 2. Apply phase-based activity multiplier
        const baseMultiplier = PHASE_ACTIVITY[phase] || 1.375;

        // Adjust for user's general activity level
        const activityAdjustment =
            activityLevel === 'sedentary' ? 0.9 :
                activityLevel === 'moderate' ? 1.0 :
                    activityLevel === 'active' ? 1.1 :
                        activityLevel === 'athlete' ? 1.2 : 1.0;

        let tdee = bmr * baseMultiplier * activityAdjustment;

        // 3. Add calories for today's exercise
        if (todayExercise && todayExercise.type !== 'rest') {
            const exerciseCalories = calculateExerciseCalories(todayExercise, weight);
            tdee += exerciseCalories;
        }

        // 4. Luteal phase buffer (progesterone increases metabolism)
        if (phase === 'Luteal') {
            tdee += 150; // ~100-200 extra calories in luteal phase
        }

        // 5. Apply goal-based adjustment
        let goalAdjustment = 0;
        if (goal === 'weight_loss' && weightLossTarget) {
            // Calculate daily deficit needed for weekly rate
            // 1 kg = ~7700 calories, so 0.4 kg/week = 3080 cal/week = 440 cal/day deficit
            goalAdjustment = -(weightLossTarget.weeklyRateKg * 7700 / 7);
        } else if (goal === 'muscle_gain') {
            goalAdjustment = 300; // Slight surplus for muscle building
        }

        const finalCalories = Math.round(tdee + goalAdjustment);

        // 6. Calculate macros based on phase
        const macroRatios = PHASE_MACROS[phase] || PHASE_MACROS['Follicular'];

        // Adjust for goal
        const adjustedRatios = { ...macroRatios };
        if (goal === 'muscle_gain') {
            adjustedRatios.protein = Math.min(0.35, adjustedRatios.protein + 0.05);
            adjustedRatios.carbs = adjustedRatios.carbs - 0.05;
        } else if (goal === 'weight_loss') {
            adjustedRatios.protein = Math.min(0.35, adjustedRatios.protein + 0.05);
            adjustedRatios.fats = adjustedRatios.fats - 0.05;
        }

        const macros = {
            protein: {
                grams: Math.round((finalCalories * adjustedRatios.protein) / 4),
                percentage: Math.round(adjustedRatios.protein * 100),
            },
            fats: {
                grams: Math.round((finalCalories * adjustedRatios.fats) / 9),
                percentage: Math.round(adjustedRatios.fats * 100),
            },
            carbs: {
                grams: Math.round((finalCalories * adjustedRatios.carbs) / 4),
                percentage: Math.round(adjustedRatios.carbs * 100),
            },
        };

        // 7. Get recommended foods
        const normalizedDietType = dietType?.toLowerCase().replace('-', '_') || 'vegetarian';
        const recommendedFoodsPool = PHASE_FOODS[phase]?.[normalizedDietType] ||
            PHASE_FOODS[phase]?.['vegetarian'] || [];
        const recommendedFoods = buildRotatedFoodPlan(
            phase,
            normalizedDietType,
            goal,
            symptoms,
            recommendedFoodsPool
        );

        // 8. Calculate hydration goal (30-35ml per kg)
        const hydrationGoalLiters = Math.round((weight * 0.033) * 10) / 10;

        // 9. Build condition-specific adjustments
        const adjustments: Array<{ condition: string; modification: string }> = [];

        if (metabolicConditions.includes('PCOS') || metabolicConditions.includes('PCOS/PCOD')) {
            adjustments.push({
                condition: 'PCOS',
                modification: 'Lower carbs, higher protein. Focus on low-GI foods and avoid refined sugars.'
            });
        }

        if (metabolicConditions.includes('Diabetes')) {
            adjustments.push({
                condition: 'Diabetes',
                modification: 'Monitor carb intake closely. Prioritize fiber-rich, low-GI carbohydrates.'
            });
        }

        if (metabolicConditions.includes('Hypertension')) {
            adjustments.push({
                condition: 'Hypertension',
                modification: 'Limit sodium intake. Focus on potassium-rich foods.'
            });
        }

        // Symptom-based adjustments
        if (symptoms.includes('Cramps')) {
            adjustments.push({
                condition: 'Cramps',
                modification: 'Increase magnesium (dark chocolate, bananas, spinach) and ginger.'
            });
        }

        if (symptoms.includes('Bloating')) {
            adjustments.push({
                condition: 'Bloating',
                modification: 'Reduce sodium and increase potassium. Try ginger and peppermint tea.'
            });
        }

        const response: DietPlanResponse = {
            calories: finalCalories,
            macros,
            phaseNutritionFocus: PHASE_FOCUS[phase] || 'Balanced nutrition',
            hydrationGoalLiters,
            recommendedFoods,
            foodsToAvoid: FOODS_TO_AVOID[phase] || [],
            adjustments,
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

    } catch (error: any) {
        console.error('Error in diet-plan-generator:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
    }
});
