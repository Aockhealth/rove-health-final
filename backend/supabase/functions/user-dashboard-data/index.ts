
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- STATIC CONTENT (Moved from Frontend) ---
const PHASE_SNAPSHOTS = {
    "Menstrual": {
        hormones: { title: "Low Levels", desc: "A reset for your body.", detail: "Estrogen and progesterone drop to their lowest levels, signalling your uterus to shed its lining." },
        mind: { title: "Reflective", desc: "Turn inward & rest.", detail: "The communication between your left and right brain hemispheres is strongest now." },
        body: { title: "Releasing", desc: "Prioritize comfort.", detail: "Inflammation may be slightly higher. Focus on gentle movements." },
        glow: { title: "Dry", desc: "Hydration is key.", detail: "Skin barrier might be weaker. Use rich moisturizers." }
    },
    "Follicular": {
        hormones: { title: "Estrogen Rising", desc: "Energy is building.", detail: "FSH stimulates follicles, and estrogen begins to climb." },
        mind: { title: "Creative", desc: "Brainstorm new ideas.", detail: "You are primed for learning and complex problem solving." },
        body: { title: "Light", desc: "Ready for movement.", detail: "Your stamina is increasing. Great time for cardio." },
        glow: { title: "Balanced", desc: "Collagen boosting.", detail: "Estrogen supports collagen production. Skin is plump." }
    },
    "Ovulatory": {
        hormones: { title: "Peak Estrogen", desc: "You are magnetic.", detail: "Estrogen peaks, triggering LH surge. Biological peak for confidence." },
        mind: { title: "Social", desc: "Connect/Speak up.", detail: "Your verbal center is lit up. Schedule important meetings." },
        body: { title: "Peak Power", desc: "Hit your PRs.", detail: "Testosterone adds a strength boost." },
        glow: { title: "Radiant", desc: "Natural glow.", detail: "Skin is vibrant but pores may be more visible." }
    },
    "Luteal": {
        hormones: { title: "Progesterone", desc: "Calming influence.", detail: "Progesterone rises to maintain lining. Has a sedative effect." },
        mind: { title: "Detailed", desc: "Focus mode on.", detail: "Brain chemistry shifts to detail-oriented tasks." },
        body: { title: "Heavy", desc: "Slow down.", detail: "Metabolism speeds up, but endurance drops." },
        glow: { title: "Oily", desc: "Congestion prone.", detail: "Progesterone stimulates sebum production." }
    }
};

const DAILY_FLOW_CONTENT = {
    // Simplified for example
    "Menstrual": { fuel: [{ label: "Iron-Rich Foods", icon: "droplet" }], move: [{ label: "Yoga", icon: "moon" }], rituals: [{ label: "Nap", icon: "bed" }] },
    "Follicular": { fuel: [{ label: "Fresh Veggies", icon: "leaf" }], move: [{ label: "Running", icon: "wind" }], rituals: [{ label: "Brainstorm", icon: "sun" }] },
    "Ovulatory": { fuel: [{ label: "Fiber", icon: "wheat" }], move: [{ label: "HIIT", icon: "fire" }], rituals: [{ label: "Date Night", icon: "heart" }] },
    "Luteal": { fuel: [{ label: "Complex Carbs", icon: "cookie" }], move: [{ label: "Pilates", icon: "layout" }], rituals: [{ label: "Organize", icon: "list" }] }
};


serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        const { user_id, weight_kg, height_cm, activity_level, fitness_goal } = await req.json();

        if (!user_id) throw new Error("Missing user_id");

        // 1. Calculate Cycle Phase 
        const { data: cycleData, error: cycleError } = await supabase.functions.invoke('cycle-intelligence', {
            body: { user_id }
        });

        if (cycleError) throw cycleError;

        const currentPhase = cycleData.currentPhase.name;

        // 2. FETCH USER PROFILE & LIFESTYLE (Fallback)
        const { data: profile } = await supabase
            .from("profiles")
            .select("birth_date")
            .eq("id", user_id)
            .single();

        const { data: lifestyle, error: lifestyleError } = await supabase
            .from("user_lifestyle")
            .select("*")
            .eq("user_id", user_id)
            .single();

        if (lifestyleError) console.error("❌ Lifestyle Error:", lifestyleError);

        const { data: weightGoal } = await supabase
            .from("user_weight_goals")
            .select("*")
            .eq("user_id", user_id)
            .maybeSingle();

        // 3. FETCH DYNAMIC CONTENT 
        async function fetchCategory(category: string, userTags: string[] = []) {
            let query = supabase
                .from("content_library")
                .select("label:title, icon, tags")
                .eq("category", category)
                .eq("phase", currentPhase);

            if (userTags && userTags.length > 0) {
                query = query.overlaps("tags", userTags);
            }

            const { data } = await query.limit(15);
            return data || [];
        }

        const [fuelDocs, moveDocs, ritualDocs] = await Promise.all([
            fetchCategory("fuel", [] as string[]),
            fetchCategory("move", [] as string[]),
            fetchCategory("ritual", [] as string[])
        ]);

        // Fallback to static
        const dailyFlow = {
            fuel: fuelDocs.length > 0 ? fuelDocs : DAILY_FLOW_CONTENT[currentPhase]?.fuel || [],
            move: moveDocs.length > 0 ? moveDocs : DAILY_FLOW_CONTENT[currentPhase]?.move || [],
            rituals: ritualDocs.length > 0 ? ritualDocs : DAILY_FLOW_CONTENT[currentPhase]?.rituals || []
        };

        // --- SMART CALORIE & MACRO CALCULATION ---
        let calories = 2000;
        let macros = { protein: { pct: 30 }, fats: { pct: 30 }, carbs: { pct: 40 } };

        // Use Payload OR Database values
        const userWeight = Number(weight_kg) || Number(lifestyle?.weight_kg) || 60;
        const userHeight = Number(height_cm) || Number(lifestyle?.height_cm) || 165;
        const userActivity = activity_level || lifestyle?.activity_level || "sedentary";

        // Ensure Calculation runs if we have weight
        if (userWeight) {
            // A. BMR Calculation (Mifflin-St Jeor for Women)
            const age = profile?.birth_date
                ? (new Date().getFullYear() - new Date(profile.birth_date).getFullYear())
                : 30;

            let bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * age) - 161;

            // B. TDEE (Activity Multiplier)
            const activityMultipliers: Record<string, number> = {
                "sedentary": 1.2,
                "lightly_active": 1.375,
                "moderately_active": 1.55,
                "very_active": 1.725,
                "athlete": 1.9
            };
            let tdee = bmr * (activityMultipliers[userActivity] || 1.2);

            // C. Phase Adjustment 
            if (currentPhase === "Luteal") {
                tdee += 150;
            }

            // D. Goal Adjustment
            if (weightGoal && weightGoal.target_weight_kg) {
                const weeklyRate = Number(weightGoal.weekly_rate_kg) || 0.4;
                const dailyDeficit = (weeklyRate * 7700) / 7;

                if (Number(weightGoal.target_weight_kg) < userWeight) {
                    tdee -= dailyDeficit;
                } else if (Number(weightGoal.target_weight_kg) > userWeight) {
                    tdee += dailyDeficit;
                }
            }

            calories = Math.max(1200, Math.min(3500, Math.round(tdee)));
        }

        // E. Macros by Phase (Percentage Split)
        switch (currentPhase) {
            case "Menstrual":
                // Restore Iron/Blood -> Higher Protein/Fat
                macros = { protein: { pct: 30 }, fats: { pct: 35 }, carbs: { pct: 35 } };
                break;
            case "Follicular":
                // Energy Rising -> Balanced, slightly higher carb for activity
                macros = { protein: { pct: 30 }, fats: { pct: 25 }, carbs: { pct: 45 } };
                break;
            case "Ovulatory":
                // Peak Energy -> High Carb/Protein
                macros = { protein: { pct: 25 }, fats: { pct: 25 }, carbs: { pct: 50 } };
                break;
            case "Luteal":
                // Prevent Cravings/Bloat -> Stabilize Sugar -> Lower Carb, Higher Fat/Protein
                macros = { protein: { pct: 30 }, fats: { pct: 40 }, carbs: { pct: 30 } };
                break;
        }


        // F. Calculate Ideal Body Weight (Hamwi Formula for Women)
        // 45.5 kg for first 5 feet (152.4 cm) + 0.9 kg per cm over 152.4 cm
        let idealWeight = 0;
        if (userHeight > 0) {
            const heightOver5ft = Math.max(0, userHeight - 152.4);
            idealWeight = 45.5 + (0.9 * heightOver5ft);

            // Adjust for frame size? Simplest is +/- 10% range, but let's stick to the base formula for "Ideal"
            // Maybe round to 1 decimal
            idealWeight = Math.round(idealWeight * 10) / 10;
        }

        // G. Convert Macros to Grams
        // Protein = 4 kcal/g, Fats = 9 kcal/g, Carbs = 4 kcal/g
        const macroGrams = {
            protein: Math.round((calories * (macros.protein.pct / 100)) / 4),
            fats: Math.round((calories * (macros.fats.pct / 100)) / 9),
            carbs: Math.round((calories * (macros.carbs.pct / 100)) / 4)
        };

        // 4. Combine with Content
        const dashboardResponse = {
            cycle: cycleData,
            phaseContent: {
                snapshots: PHASE_SNAPSHOTS[currentPhase],
                dailyFlow: dailyFlow,
                theme: {
                    phase: currentPhase
                },
                // Pass calculated plans here
            },
            plans: {
                diet: {
                    status: "generated",
                    calories: calories,
                    macros: macros, // Keep percentages for backwards compat?
                    macros_grams: macroGrams,
                    ideal_weight: idealWeight,
                    phaseNutritionFocus: PHASE_SNAPSHOTS[currentPhase]?.hormones?.desc || "Balanced nutrition"
                },
                workout: { status: "generated", summary: "Restorative yoga recommended." }
            }
        };

        return new Response(JSON.stringify(dashboardResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
