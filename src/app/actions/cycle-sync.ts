"use server";

import { createClient } from "@/utils/supabase/server";

// --- HELPERS ---

// 1. DYNAMIC CYCLE TRACKING LOGIC
function calculatePhase(lastPeriodStart: string, cycleLength: number = 28, periodLength: number = 5) {
    const today = new Date();
    const start = new Date(lastPeriodStart);

    // Normalize dates to ignore time (UTC check might be needed in real app, staying simple for now)
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate Day in Cycle (1-based)
    // e.g. Start=Jan 1, Today=Jan 1 -> Diff=0 -> Day 1
    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle = 1; // Fallback for future dates

    // BIOLOGICAL LOGIC:
    // Luteal Phase is consistently ~14 days for most women.
    // Ovulation occurs 14 days before the NEXT period.
    const lutealLength = 14;
    const estimatedOvulationDay = cycleLength - lutealLength;

    let phase = "Luteal"; // Default/Fallback

    if (dayInCycle <= periodLength) {
        phase = "Menstrual";
    } else if (dayInCycle < (estimatedOvulationDay - 1)) {
        phase = "Follicular";
    } else if (dayInCycle <= (estimatedOvulationDay + 1)) {
        phase = "Ovulatory"; // 3 Day Probable Window (e.g., Day 13, 14, 15 for 28-day cycle)
    } else {
        phase = "Luteal";
    }

    return { phase, day: dayInCycle };
}

// --- ACTIONS ---

// --- ACTIONS ---

export async function fetchDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch cycle data & profile
    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Correctly fetch name from 'profiles' table
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    // Fetch tracker mode from onboarding
    const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("tracker_mode")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    // Calculate Phase
    const { phase, day } = calculatePhase(cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);

    // Dynamic "River" Content based on Phase
    const insights = [
        { title: `Day ${day}`, desc: "Tracking perfectly", icon: "TrendingUp" },
        { title: `${phase} Phase`, desc: "Current status", icon: "Moon" },
    ];

    let fuel: any[] = [];
    let move: any[] = [];
    let riverStr = "";

    // Safely handle phase matching to ensure data is never empty
    const currentPhase = phase || "Follicular"; // default check

    if (phase === "Menstrual") {
        riverStr = "Rest • Restore • Reload";
        fuel = [
            { title: "Bone Broth", desc: "Mineral Replenishment", icon: "Soup" },
            { title: "Spinach", desc: "Iron Boost", icon: "Leaf" },
            { title: "Dark Chocolate", desc: "Magnesium Boost", icon: "Leaf" },
            { title: "Warm Tea", desc: "Cramp Relief", icon: "Utensils" },
            { title: "Lentils", desc: "Plant Iron", icon: "Utensils" }
        ];
        move = [
            { title: "Yin Yoga", desc: "Stretch & Relax", icon: "Moon" },
            { title: "Walking", desc: "Low Impact", icon: "Wind" },
            { title: "Meditation", desc: "Mental Rest", icon: "Brain" },
            { title: "Stretching", desc: "Blood Flow", icon: "Activity" }
        ];
        insights.push({ title: "Low Energy", desc: "Totally normal now", icon: "Battery" });
    } else if (phase === "Ovulatory") {
        riverStr = "Peak • Perform • Shine";
        fuel = [
            { title: "Cruciferous Veg", desc: "Estrogen Detox", icon: "Leaf" },
            { title: "Flax Seeds", desc: "Lignans", icon: "Leaf" },
            { title: "Salmon", desc: "Omega-3s", icon: "Fish" },
            { title: "Fiber", desc: "Gut Health", icon: "Wheat" },
            { title: "Quinoa", desc: "Complex Carb", icon: "Utensils" }
        ];
        move = [
            { title: "Spin Class", desc: "Max Intensity", icon: "Activity" },
            { title: "Heavy Lifting", desc: "PR Attempts", icon: "Dumbbell" },
            { title: "Sprinting", desc: "Speed Work", icon: "Wind" },
            { title: "Kickboxing", desc: "Power", icon: "Zap" }
        ];
        insights.push({ title: "Peak Confidence", desc: "Social battery full", icon: "Sparkles" });
    } else if (phase === "Luteal") {
        riverStr = "Stabilize • Focus • Nest";
        fuel = [
            { title: "Sweet Potato", desc: "Carb Stability", icon: "Leaf" },
            { title: "Banana", desc: "Potassium", icon: "Leaf" },
            { title: "Turkey", desc: "Tryptophan", icon: "Dumbbell" },
            { title: "Dark Chocolate", desc: "Cravings", icon: "Heart" },
            { title: "Avocado", desc: "Healthy Fats", icon: "Leaf" }
        ];
        move = [
            { title: "Pilates", desc: "Core Control", icon: "Activity" },
            { title: "Strength", desc: "Muscle Maintenance", icon: "Dumbbell" },
            { title: "Walking", desc: "Cortisol Management", icon: "Activity" },
            { title: "Yoga Sculpt", desc: "Low Impact Toning", icon: "Sparkles" }
        ];
        insights.push({ title: "Winding Down", desc: "Prioritize sleep", icon: "Moon" });
    } else {
        // Default to Follicular (or anything else) to ensure data exists
        riverStr = "Build • Create • Push";
        fuel = [
            { title: "Kimchi", desc: "Estrogen Metabolism", icon: "Leaf" },
            { title: "Oats", desc: "Sustained Energy", icon: "Wheat" },
            { title: "Pumpkin Seeds", desc: "Cycle Syncing", icon: "Leaf" },
            { title: "Chicken Breast", desc: "Lean Protein", icon: "Utensils" },
            { title: "Berries", desc: "Antioxidants", icon: "Leaf" }
        ];
        move = [
            { title: "Running", desc: "Cardio Peak", icon: "Wind" },
            { title: "HIIT", desc: "Fat Burn", icon: "Zap" },
            { title: "Dancing", desc: "Coordination", icon: "Activity" },
            { title: "Boxing", desc: "Power", icon: "Dumbbell" }
        ];
        insights.push({ title: "Rising Estrogen", desc: "Creativity spike", icon: "Brain" });
    }

    return {
        user: { ...user, name: profile?.full_name || user.user_metadata?.full_name || "Rove Member" },
        phase: { name: phase, day, river: riverStr },
        insights,
        fuel,
        move,
        tracker_mode: onboarding?.tracker_mode || "menstruation"
    };
}

/* export async function logDailySymptoms(symptoms: string[], flowIntensity?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Basic logging (placeholder for DB insert)
    console.log("Logging for user:", user.id, symptoms, flowIntensity);

    // In real app: await supabase.from('daily_logs').insert(...)
    return { success: true };
} */


export interface LogDailySymptomsPayload {
    date: Date;
    symptoms: string[];
    isPeriod: boolean;
    flowIntensity?: string; // Optional: "Spotting", "Light", "Medium", "Heavy"
}

export async function logDailySymptoms(payload: LogDailySymptomsPayload) {
    const supabase = await createClient();

    // Get the authenticated user
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError);
        return { success: false, error: userError.message };
    }

    if (!user) {
        console.error("No authenticated user.");
        return { success: false, error: "User not authenticated" };
    }

    const { date, symptoms, isPeriod, flowIntensity } = payload;

    try {
        // Insert a new daily log
        const { data, error } = await supabase.from("daily_logs").insert({
            user_id: user.id,
            date: date.toISOString(), // Store in ISO format
            symptoms, // array of strings
            is_period: isPeriod,
            flow_intensity: flowIntensity || null, // optional
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error("Error inserting daily log:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Unexpected error logging daily symptoms:", err);
        return { success: false, error: (err as Error).message };
    }
}


export async function fetchCycleIntelligence() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch Cycle Data & Onboarding Data
    const { data: cycleData } = await supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single();
    const { data: profile } = await supabase.from("user_onboarding").select("*").eq("user_id", user.id).single();

    if (!cycleData || !profile) return null;

    const { phase, day } = calculatePhase(cycleData.last_period_start, cycleData.cycle_length_days, cycleData.period_length_days);

    // --- 1. BIOMETRIC CALCULATION (Mifflin-St Jeor Formula) ---

    // Age
    const dob = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())) age--;

    // BMR
    const weight = profile.weight_kg;
    const height = profile.height_cm;
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;

    // Activity Multiplier
    const activityMap: Record<string, number> = {
        "sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "very_active": 1.9
    };
    const activityMultiplier = activityMap[profile.activity_level] || 1.375;

    // Phase Adjustments
    let phaseSurplus = 0;
    if (phase === "Luteal") phaseSurplus = 200;
    if (phase === "Menstrual") phaseSurplus = 100;

    const targetCalories = Math.round((bmr * activityMultiplier) + phaseSurplus);

    // Phase Rules
    const macroRules: Record<string, any> = {
        "Menstrual": { p: 0.25, f: 0.35, c: 0.40, desc: "Higher fats support lipid hormone production." },
        "Follicular": { p: 0.30, f: 0.25, c: 0.45, desc: "High carbs fuel riding energy levels." },
        "Ovulatory": { p: 0.25, f: 0.25, c: 0.50, desc: "Fast-burning carbs for peak output." },
        "Luteal": { p: 0.35, f: 0.40, c: 0.25, desc: "Protein & Stability to manage blood sugar." }
    };
    const currentMacros = macroRules[phase];

    // Gram Conversions
    const proteinGrams = Math.round((targetCalories * currentMacros.p) / 4);
    const fatGrams = Math.round((targetCalories * currentMacros.f) / 9);
    const carbGrams = Math.round((targetCalories * currentMacros.c) / 4);

    // --- 2. DEEP SCIENCE INTELLIGENCE ---
    const strategy: Record<string, any> = {
        "Menstrual": {
            focus: "Replenish",
            biometrics_why: `Your BMR is slightly elevated (+100kcal) due to the energy cost of menstruation.`,
            hormones: { estrogen: "Low", progesterone: "Low", text: "All hormones are at baseline." },

            // FOOD SCIENCE
            meal_examples: ["Bone Broth", "Warm Lentil Stew", "Dark Chocolate"],
            food_why: "Bone broth provides mineral density without digestive strain. Iron-rich foods replenish blood loss, while warming foods aid circulation to reduce cramps.",

            // MOVEMENT SCIENCE
            movement: { type: "Yoga / Walk", intensity: "Low (20%)", focus: "Restoration" },
            movement_why: "Inflammatory markers are naturally higher. High intensity training now increases cortisol, which can prolong inflammation and increase cramping.",

            // SYMPTOM FORECAST
            symptoms: ["Fatigue", "Cramping", "Low Social Battery"],

            // BIO FACTS CAROUSEL
            bio_facts: [
                { title: "Deficit: Iron", text: "You lose ~30-80ml of blood. Replenish with heme iron (red meat) or lentils + vitamin C for absorption.", icon: "Droplets" },
                { title: "Deficit: Magnesium", text: "Uterine contractions depletion magnesium stores. Dark chocolate and pumpkin seeds are natural muscle relaxants.", icon: "Sparkles" },
                { title: "Deficit: Omega-3", text: "Inflammatory prostaglandins cause pain. Fatty fish helps neutralize the inflammation naturally.", icon: "Fish" },
                { title: "Immunity Dip", text: "Your immune system is slightly suppressed right now. It's the easiest time to catch a cold.", icon: "Shield" },
                { title: "Inflammation", text: "Prostaglandins are spiking to trigger shedding. Gentle movement helps flush them out.", icon: "Flame" }
            ],

            // FLOW RIVER DATA
            diet_river: [
                { title: "Bone Broth", desc: "Mineral Replenishment", icon: "Soup" },
                { title: "Spinach", desc: "Iron Boost", icon: "Leaf" },
                { title: "Dark Chocolate", desc: "Magnesium Boost", icon: "Leaf" },
                { title: "Warm Tea", desc: "Cramp Relief", icon: "Coffee" },
                { title: "Lentils", desc: "Plant Iron", icon: "Utensils" }
            ],
            exercise_river: [
                { title: "Yin Yoga", desc: "Stretch & Relax", icon: "Moon" },
                { title: "Walking", desc: "Low Impact", icon: "Footprints" },
                { title: "Meditation", desc: "Mental Rest", icon: "Brain" },
                { title: "Stretching", desc: "Blood Flow", icon: "Activity" }
            ]
        },
        "Follicular": {
            focus: "Build",
            biometrics_why: `Insulin sensitivity is at its peak. Your body partitions carbohydrates into muscle glycogen very efficiently right now.`,
            hormones: { estrogen: "Rising", progesterone: "Low", text: "Estrogen is stimulating growth." },

            // FOOD SCIENCE
            meal_examples: ["Fermented Foods", "Chicken Salad", "Pumpkin Seeds"],
            food_why: "Fermented foods assist in gut microbiome diversity, essential for metabolizing the rising estrogen. Fresh, vibrant foods match your rising energy.",

            // MOVEMENT SCIENCE
            movement: { type: "Run / Dance", intensity: "High (80%)", focus: "Cardio Base" },
            movement_why: "Rising estrogen improves muscle recovery time and pain tolerance. It's the biologically optimal time to push for Personal Bests.",

            // SYMPTOM FORECAST
            symptoms: ["High Energy", "Creativity", "Optimism"],

            bio_facts: [
                { title: "Deficit: B-Vitamins", text: "Energy production is ramping up. Leafy greens provide the folate needed for cellular replication.", icon: "Leaf" },
                { title: "Deficit: Probiotics", text: "Your gut bacteria modulate estrogen levels. Sauerkraut or yogurt supports efficient hormone processing.", icon: "Beaker" },
                { title: "Deficit: Zinc", text: "Critical for healthy follicle development. Shellfish and seeds are the most potent sources.", icon: "Sparkles" },
                { title: "Collagen Spike", text: "Estrogen boosts collagen production. Your skin naturally retains more moisture and looks glowier this week.", icon: "Sparkles" },
                { title: "Insulin Sensitivity", text: "Your body handles carbs better now than at any other time. Enjoy that pasta or fruit without the crash.", icon: "Zap" }
            ],

            diet_river: [
                { title: "Kimchi", desc: "Estrogen Metabolism", icon: "Leaf" },
                { title: "Oats", desc: "Sustained Energy", icon: "Wheat" },
                { title: "Pumpkin Seeds", desc: "Cycle Syncing", icon: "Leaf" },
                { title: "Chicken Breast", desc: "Lean Protein", icon: "Utensils" },
                { title: "Berries", desc: "Antioxidants", icon: "Cherry" }
            ],
            exercise_river: [
                { title: "Running", desc: "Cardio Peak", icon: "Wind" },
                { title: "HIIT", desc: "Fat Burn", icon: "Zap" },
                { title: "Dancing", desc: "Coordination", icon: "Music" },
                { title: "Boxing", desc: "Power", icon: "Dumbbell" }
            ]
        },
        "Ovulatory": {
            focus: "Perform",
            biometrics_why: `Metabolic fire is high. You burn more calories at rest due to the thermal effect of ovulation.`,
            hormones: { estrogen: "Peak", progesterone: "Rising", text: "Estrogen & Testosterone Peak." },

            // FOOD SCIENCE
            meal_examples: ["Salmon", "Quinoa", "Berries"],
            food_why: "Cruciferous vegetables and fiber are critical now to help your liver flush out the massive surge of estrogen, preventing dominance symptoms.",

            // MOVEMENT SCIENCE
            movement: { type: "HIIT / Spin", intensity: "Max (100%)", focus: "Power Output" },
            movement_why: "A testosterone spike gives you a temporary strength & aggression boost. Use it for heavy lifting or high-intensity intervals.",

            // SYMPTOM FORECAST
            symptoms: ["High Libido", "Social confidence", "Breast Tenderness"],

            bio_facts: [
                { title: "Deficit: Fiber", text: "Crucial for binding to excess estrogen in the gut. Cruciferous veggies are your best detox tool.", icon: "Carrot" },
                { title: "Deficit: Antioxidants", text: "Ovulation is an inflammatory event. Berries help neutralize the oxidative stress on the ovary.", icon: "Cherry" },
                { title: "Deficit: Zinc", text: "Zinc supports the production of progesterone, which you'll need for the second half of your cycle.", icon: "Sparkles" },
                { title: "The Glow", text: "You are biologically at your most attractive. Studies show facial symmetry and skin tone peak during these 48 hours.", icon: "Sun" },
                { title: "Liver Load", text: "Your liver is working overtime to process peak hormones. Hydration is key right now.", icon: "Droplets" }
            ],

            diet_river: [
                { title: "Cruciferous Veg", desc: "Estrogen Detox", icon: "Carrot" },
                { title: "Flax Seeds", desc: "Lignans", icon: "Leaf" },
                { title: "Salmon", desc: "Omega-3s", icon: "Fish" },
                { title: "Fiber", desc: "Gut Health", icon: "Wheat" },
                { title: "Quinoa", desc: "Complex Carb", icon: "Utensils" }
            ],
            exercise_river: [
                { title: "Spin Class", desc: "Max Intensity", icon: "Bike" },
                { title: "Heavy Lifting", desc: "PR Attempts", icon: "Dumbbell" },
                { title: "Sprinting", desc: "Speed Work", icon: "Wind" },
                { title: "Kickboxing", desc: "Power", icon: "Zap" }
            ]
        },
        "Luteal": {
            focus: "Stabilize",
            biometrics_why: `Your BMR spikes by ~200-300 kcal as your body prepares for potential pregnancy (creating the uterine lining).`,
            hormones: { estrogen: "Drop", progesterone: "Dominant", text: "Progesterone is the calming force." },

            // FOOD SCIENCE
            meal_examples: ["Roasted Root Veg", "Turkey", "Brown Rice"],
            food_why: "Slow-burning complex carbs are essential to maintain serotonin levels, which drop alongside estrogen. Root veggies provide grounding energy.",

            // MOVEMENT SCIENCE
            movement: { type: "Strength / Pilates", intensity: "Moderate (60%)", focus: "Muscle Control" },
            movement_why: "Progesterone raises body temp and heart rate. Endurance suffers, but strength maintenance is key. Avoid heat stress.",

            // SYMPTOM FORECAST
            symptoms: ["Bloating", "Sugar Cravings", "Brain Fog"],

            bio_facts: [
                { title: "Deficit: Magnesium", text: "Progesterone depletes magnesium, leading to cramps and mood swings. Focus on leafy greens and nuts.", icon: "Sparkles" },
                { title: "Deficit: Vitamin B6", text: "Essential for synthesizing progesterone and boosting mood. Turkey and bananas are top sources.", icon: "Drumstick" },
                { title: "Deficit: Calcium", text: "Helps reduce bloating and water retention. Yogurt or sesame seeds are great additions.", icon: "Droplets" },
                { title: "The Burn", text: "Your metabolism naturally speeds up by ~250 calories/day. Eat nutrient-dense snacks to avoid crashing.", icon: "Flame" },
                { title: "Serotonin Dip", text: "As estrogen drops, so does serotonin. Complex carbs help transport tryptophan to the brain to rebuild it.", icon: "Brain" }
            ],

            diet_river: [
                { title: "Sweet Potato", desc: "Carb Stability", icon: "Carrot" },
                { title: "Banana", desc: "Potassium", icon: "Leaf" },
                { title: "Turkey", desc: "Tryptophan", icon: "Drumstick" },
                { title: "Dark Chocolate", desc: "Cravings", icon: "Heart" },
                { title: "Avocado", desc: "Healthy Fats", icon: "Leaf" }
            ],
            exercise_river: [
                { title: "Pilates", desc: "Core Control", icon: "Activity" },
                { title: "Strength Training", desc: "Muscle Maintenance", icon: "Dumbbell" },
                { title: "Walking", desc: "Cortisol Management", icon: "Footprints" },
                { title: "Yoga Sculpt", desc: "Low Impact Toning", icon: "Sparkles" }
            ]
        }
    };

    return {
        phase,
        day,
        biometrics: { weight, tdee: targetCalories, bmr: Math.round(bmr), reason: strategy[phase].biometrics_why },
        nutrition: {
            calories: targetCalories,
            macros: {
                protein: { g: proteinGrams, pct: currentMacros.p * 100 },
                fats: { g: fatGrams, pct: currentMacros.f * 100 },
                carbs: { g: carbGrams, pct: currentMacros.c * 100 },
                desc: currentMacros.desc
            },
            ...strategy[phase]
        }
    };
}
