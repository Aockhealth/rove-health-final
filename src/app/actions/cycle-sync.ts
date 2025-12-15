"use server";

import { createClient } from "@/utils/supabase/server";
import { PHASE_CONTENT } from "@/data/phase-content";

// --- HELPERS ---

function getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 1. DYNAMIC CYCLE TRACKING LOGIC
function calculatePhase(lastPeriodStart: string, cycleLength: number = 28, periodLength: number = 5) {
    const today = new Date();
    // Normalize today to avoid time issues
    today.setHours(0, 0, 0, 0);

    // Parse the start date (assuming YYYY-MM-DD string) as local midnight if possible, 
    // or just standard parse. Since logic depends on diffDays, standard parse is often UTC.
    // Let's ensure consistent diffing.
    const start = new Date(lastPeriodStart);
    start.setHours(0, 0, 0, 0); // Align to midnight

    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate Day in Cycle (1-based)
    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle = 1;

    // BIOLOGICAL LOGIC
    const lutealLength = 14;
    const estimatedOvulationDay = cycleLength - lutealLength;

    let phase = "Luteal";

    if (dayInCycle <= periodLength) {
        phase = "Menstrual";
    } else if (dayInCycle < (estimatedOvulationDay - 1)) {
        phase = "Follicular";
    } else if (dayInCycle <= (estimatedOvulationDay + 1)) {
        phase = "Ovulatory";
    } else {
        phase = "Luteal";
    }

    return { phase, day: dayInCycle };
}

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

    const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("tracker_mode, dietary_preferences, metabolic_conditions")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    const { phase, day } = calculatePhase(cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);

    // --- STATIC CONTENT SELECTION ---
    const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];

    // 1. River (1 Random)
    const riverStr = getRandomItems(content.river, 1)[0] || "Rest • Restore • Reload";

    // 2. Fuel (2 Items)
    const fuel = getRandomItems(content.fuel, 2);

    // 3. Move (2 Items)
    const move = getRandomItems(content.move, 2);

    // 4. Rituals (2 Items)
    const rituals = getRandomItems(content.rituals, 2);

    // 5. Snapshot (1 Set)
    const snapshotSet = getRandomItems(content.snapshot, 1)[0];
    const snapshot = {
        hormones: snapshotSet?.hormones || { title: "", desc: "" },
        mind: snapshotSet?.mind || { title: "", desc: "" },
        body: snapshotSet?.body || { title: "", desc: "" },
        skin: snapshotSet?.skin || { title: "", desc: "" }
    };

    return {
        user: { ...user, name: profile?.full_name || "Rove Member" },
        phase: { name: phase, day, river: riverStr, superpower: "Resilience" },
        insights: [],
        fuel,
        move,
        rituals,
        snapshot,
        tracker_mode: onboarding?.tracker_mode || "menstruation"
    };
}

export interface LogDailySymptomsPayload {
    date: string; // YYYY-MM-DD
    symptoms: string[];
    isPeriod: boolean;
    flowIntensity?: string;
}

// UPDATED: Uses upsert to prevent duplicates
export async function logDailySymptoms(payload: LogDailySymptomsPayload) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { success: false, error: "User not authenticated" };
    }

    const { date, symptoms, isPeriod, flowIntensity } = payload;

    try {
        const { data, error } = await supabase.from("daily_logs").upsert({
            user_id: user.id,
            date: date, // Passed correctly as YYYY-MM-DD string
            symptoms,
            is_period: isPeriod,
            flow_intensity: flowIntensity || null,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date' // This matches the unique constraint we created in SQL
        });

        if (error) {
            console.error("Error logging daily symptoms:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: (err as Error).message };
    }
}

// NEW: Helper to fetch a single day's log for the calendar
export async function getDailyLog(date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Use date string directly (YYYY-MM-DD)
    const searchDate = date;

    const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", searchDate)
        .maybeSingle();

    if (error) {
        console.error("Error fetching log:", error);
        return null;
    }

    return data;
}

export async function fetchCycleIntelligence() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch cycle settings for calculation
    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Correctly fetch name from 'profiles' table (needed for AI context)
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    const { data: onboarding } = await supabase.from("user_onboarding").select("dietary_preferences, metabolic_conditions").eq("user_id", user.id).single();

    let phase = "Menstrual";
    let dayInCycle = 1 as number;

    if (cycleSettings) {
        const result = calculatePhase(cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);
        phase = result.phase;
        dayInCycle = result.day;
    }

    // --- STATIC CONTENT FALLBACK (AI REMOVED) ---
    const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];

    // Construct a Mock Blueprint using static content to prevent Plan Page crash
    // Construct a Full Blueprint using static content
    const snapshotSet = getRandomItems(content.snapshot, 1)[0] || content.snapshot[0];

    const blueprint = {
        hormones: {
            ...snapshotSet.hormones,
            summary: content.plan.hormones.summary,
            symptoms: content.plan.hormones.symptoms
        },
        diet: {
            core_needs: getRandomItems(content.fuel, 3),
            ideal_meals: content.plan.diet.ideal_meals,
            cramp_relief: content.plan.diet.cramp_relief,
            avoid: content.plan.diet.avoid
        },
        rituals: {
            focus: "Phase Focus", // Fallback text
            practices: getRandomItems(content.rituals, 4),
            symptom_relief: [] // Empty fallback to prevent crash, can be populated if data exists
        },
        exercise: {
            summary: content.plan.exercise.summary,
            best: getRandomItems(content.move, 2).map(m => ({ ...m, time: "30 mins" })),
            avoid: content.plan.exercise.avoid
        },
        supplements: content.plan.supplements,
        daily_flow: content.plan.daily_flow
    };

    // Dynamic Data Generation based on Phase (Calculated Metrics)
    let nutrition = {};
    let biometrics = {};

    switch (phase) {
        case "Menstrual":
            nutrition = {
                calories: 1850,
                macros: { protein: { g: 120, pct: 30 }, fats: { g: 70, pct: 35 }, carbs: { g: 180, pct: 35 } },
                hormones: { estrogen: "Low", progesterone: "Low", text: "Baseline" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Higher iron needs during menstruation require nutrient-dense caloric intake." };
            break;
        case "Follicular":
            nutrition = {
                calories: 1950,
                macros: { protein: { g: 130, pct: 30 }, fats: { g: 60, pct: 30 }, carbs: { g: 210, pct: 40 } },
                hormones: { estrogen: "Rising", progesterone: "Low", text: "Building" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Rising estrogen supports higher carbohydrate tolerance and energy for building." };
            break;
        case "Ovulatory":
            nutrition = {
                calories: 2000,
                macros: { protein: { g: 125, pct: 25 }, fats: { g: 65, pct: 30 }, carbs: { g: 220, pct: 45 } },
                hormones: { estrogen: "Peak", progesterone: "Low", text: "Peak" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Peak estrogen helps utilize glycogen; focus on complex carbs and antioxidants." };
            break;
        case "Luteal":
            nutrition = {
                calories: 2100,
                macros: { protein: { g: 135, pct: 30 }, fats: { g: 80, pct: 40 }, carbs: { g: 180, pct: 30 } },
                hormones: { estrogen: "Moderate", progesterone: "Peak", text: "Luteal Peak" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Progesterone increases metabolic rate; higher caloric needs but stable blood sugar is key." };
            break;
        default:
            nutrition = {
                calories: 2000,
                macros: { protein: { g: 120, pct: 30 }, fats: { g: 70, pct: 35 }, carbs: { g: 200, pct: 35 } },
                hormones: { estrogen: "Unknown", progesterone: "Unknown", text: "Unknown" },
                symptoms: [], bio_facts: [], diet_river: [], exercise_river: []
            };
            biometrics = { reason: "Balanced nutrition for maintenance." };
    }

    return {
        phase: phase,
        day: dayInCycle,
        nutrition: nutrition,
        biometrics: biometrics,
        blueprint: blueprint // Pass the MOCK blueprint
    };
}

export async function fetchInsightsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    const avgCycle = cycleSettings.cycle_length_days || 28;
    const avgPeriod = cycleSettings.period_length_days || 5;

    // --- REAL DATA AGGREGATION ---
    // Fetch last 60 days of logs for symptom analysis
    const { data: logs } = await supabase
        .from("daily_logs")
        .select("date, symptoms, is_period")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(60);

    const symptomStats: Record<string, { count: number, lastDate: string }> = {};

    logs?.forEach(log => {
        if (Array.isArray(log.symptoms)) {
            log.symptoms.forEach((symptom: string) => {
                // Skip "Flow" related tags if they are mixed in, or keep them if desired. 
                // The tracker separates flow but saves it in symptoms too sometimes or purely in tags.
                // Based on tracker code, they are saved in the same array.
                if (!symptomStats[symptom]) {
                    symptomStats[symptom] = { count: 0, lastDate: log.date };
                }
                symptomStats[symptom].count++;
                // Keep most recent date
                if (new Date(log.date) > new Date(symptomStats[symptom].lastDate)) {
                    symptomStats[symptom].lastDate = log.date;
                }
            });
        }
    });

    // Convert to array and sort
    const topSymptoms = Object.entries(symptomStats)
        .map(([name, stat]) => {
            // Estimate phase for the last occurrence
            const { phase } = calculatePhase(cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);
            // Note: properly calculating phase for *past* dates requires passing that date to a calculator.
            // For now, let's just use the current calculation or a simple fallback to "Variable" if complex.
            // Actually, let's try to calculate it for the specific date if possible, but calculatePhase uses "today" inside.
            // We'll skip precise phase calculation for history to avoid complexity for now, or use the current phase if it was recent.

            let severity = "Low";
            if (stat.count > 5) severity = "High";
            else if (stat.count > 2) severity = "Medium";

            return {
                name,
                count: stat.count,
                severity,
                phase: "Variable" // Placeholder as we'd need to refactor calculatePhase to accept a 'targetDate'
            };
        })
        .filter(s => !["Spotting", "Light", "Medium", "Heavy"].includes(s.name)) // Filter out flow if desired, often separate
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5

    // If no data, fallback to some defaults or empty
    const finalSymptoms = topSymptoms.length > 0 ? topSymptoms : [
        { name: "No Data Yet", count: 0, severity: "None", phase: "-" }
    ];

    // Generate Mock History (Last 6 Cycles) - STILL MOCKED as we need full cycle analysis logic
    const history = Array.from({ length: 6 }).map((_, i) => {
        const variation = Math.floor(Math.random() * 5) - 2;
        const length = avgCycle + variation;
        const status = length > 35 || length < 21 ? "Abnormal" : "Normal";
        const date = new Date(cycleSettings.last_period_start);
        date.setMonth(date.getMonth() - (i + 1));
        return {
            month: date.toLocaleString('default', { month: 'short' }),
            length,
            periodLength: avgPeriod + (Math.random() > 0.8 ? 1 : 0),
            status
        };
    }).reverse();

    return {
        averages: {
            cycle: avgCycle,
            period: avgPeriod
        },
        history,
        lastCycle: history[history.length - 1],
        symptoms: finalSymptoms,
        vitals: {
            bbt: Array.from({ length: 30 }).map((_, i) => ({ day: i + 1, temp: 36.4 + Math.random() * 0.5 + (i > 14 ? 0.4 : 0) })),
            weight: { current: 62, trend: "-0.5kg" } // Fixed for now as weight isn't in daily_logs
        }
    };
}

export async function fetchUserCycleSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: cycleSettings, error } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error) {
        console.error("Error fetching cycle settings:", error);
        return null;
    }

    return cycleSettings;
}

export async function updateLastPeriodDate(newDate: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase
        .from("user_cycle_settings")
        .update({
            last_period_start: newDate, // Expecting YYYY-MM-DD string
            updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating period date:", error);
        return { success: false, error: error.message };
    }

    // Revalidate paths if needed in a real app (revalidatePath)
    return { success: true };
}