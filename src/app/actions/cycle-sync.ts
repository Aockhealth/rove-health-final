"use server";

import { createClient } from "@/utils/supabase/server";
import { PHASE_CONTENT } from "@/data/phase-content";

// --- HELPERS ---

function getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Dynamic Cycle Tracking Logic
 * Calculates the current phase based on the last period start date.
 */
function calculatePhase(
    targetDate: Date,
    lastPeriodStart: string, 
    cycleLength: number = 28, 
    periodLength: number = 5
) {
    const start = new Date(lastPeriodStart);
    const d = new Date(targetDate);
    const s = new Date(start);
    d.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);

    const diffTime = d.getTime() - s.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle += cycleLength;

    const estimatedOvulationDay = cycleLength - 14;

    if (dayInCycle <= periodLength) return { phase: "Menstrual", day: dayInCycle };
    if (dayInCycle < (estimatedOvulationDay - 1)) return { phase: "Follicular", day: dayInCycle };
    if (dayInCycle <= (estimatedOvulationDay + 1)) return { phase: "Ovulatory", day: dayInCycle };
    return { phase: "Luteal", day: dayInCycle };
}

// --- AI ACTIONS ---

/**
 * Generates a scientific and empathetic insight using Groq LLM (llama-3.3-70b-versatile).
 * Securely handled via Server Action using native fetch.
 */
// src/app/actions/cycle-sync.ts

export async function generatePhaseAIInsight(phase: string, symptoms: string[]) {
    const apiKey = "REDACTED_API_KEY";
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }, // Forces JSON output
                messages: [
                    {
                        role: "system",
                        content: `You are a menstrual health expert. Analyze the user's current phase and their specific symptoms to provide a personalized health report in JSON format.
                        
                        The JSON must contain:
                        1. "insight": A 2-sentence empathetic scientific explanation of WHY they feel these specific symptoms in this phase.
                        2. "moods": Array of 2 strings representing the emotional state based on symptoms.
                        3. "focus": Array of 3 strings representing specific activities to help with their symptoms.
                        
                        Be highly specific. If they have 'Cramps', mention prostaglandins. If they have 'Bloating', mention progesterone. 
                        JSON structure: {"insight": "", "moods": [], "focus": []}`
                    },
                    {
                        role: "user",
                        content: `Phase: ${phase}. Symptoms logged: ${symptoms.join(", ") || "No specific symptoms logged yet"}.`
                    }
                ],
                temperature: 0.45
            })
        });

        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content);
        return content; // Returns { insight, moods, focus }
    } catch (error) {
        console.error("Groq AI Error:", error);
        return null;
    }
}

// --- DATABASE ACTIONS ---

export async function fetchDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

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

    const { phase, day } = calculatePhase(
        new Date(), 
        cycleSettings.last_period_start, 
        cycleSettings.cycle_length_days, 
        cycleSettings.period_length_days
    );

    const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];
    const riverStr = getRandomItems(content.river, 1)[0] || "Rest • Restore • Reload";
    const fuel = getRandomItems(content.fuel, 2);
    const move = getRandomItems(content.move, 2);
    const rituals = getRandomItems(content.rituals, 2);

    const snapshotSet = getRandomItems(content.snapshot, 1)[0];
    const snapshot = {
        hormones: snapshotSet?.hormones || { title: "", desc: "" },
        mind: snapshotSet?.mind || { title: "", desc: "" },
        body: snapshotSet?.body || { title: "", desc: "" },
        skin: snapshotSet?.skin || { title: "" , desc: "" }
    };

    return {
        user: { ...user, name: profile?.full_name || "Rove Member" },
        phase: { name: phase, day, river: riverStr, superpower: "Resilience" },
        fuel,
        move,
        rituals,
        snapshot,
        tracker_mode: onboarding?.tracker_mode || "menstruation"
    };
}

export interface LogDailySymptomsPayload {
    date: Date;
    symptoms: string[];
    isPeriod: boolean;
    flowIntensity?: string;
}

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
            date: date.toISOString(), 
            symptoms,
            is_period: isPeriod,
            flow_intensity: flowIntensity || null,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date'
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function getDailyLog(date: Date) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const searchDate = date.toISOString().split('T')[0];
    const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", searchDate)
        .maybeSingle();

    if (error) return null;
    return data;
}

export async function fetchInsightsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("last_period_start, cycle_length_days, period_length_days, is_irregular")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    const avgCycle = cycleSettings.cycle_length_days || 28;
    const avgPeriod = cycleSettings.period_length_days || 5;

    const { data: logs } = await supabase
        .from("daily_logs")
        .select("date, symptoms")
        .eq("user_id", user.id);

    const phaseCounts: Record<string, number> = {
        "Menstrual": 0, "Follicular": 0, "Ovulatory": 0, "Luteal": 0
    };

    const allLoggedSymptoms = new Set<string>();

    if (logs && logs.length > 0) {
        logs.forEach((log) => {
            const { phase } = calculatePhase(
                new Date(log.date), 
                cycleSettings.last_period_start, 
                avgCycle, 
                avgPeriod
            );

            if (phaseCounts[phase] !== undefined) {
                phaseCounts[phase] += 1;
            }

            if (Array.isArray(log.symptoms)) {
                log.symptoms.forEach(s => allLoggedSymptoms.add(s));
            }
        });
    }

    const currentStatus = calculatePhase(
        new Date(), 
        cycleSettings.last_period_start, 
        avgCycle, 
        avgPeriod
    );

    return {
        phase: { name: currentStatus.phase, day: currentStatus.day },
        averages: {
            cycle: avgCycle,
            period: avgPeriod,
            lastPeriodStart: cycleSettings.last_period_start, 
            isIrregular: cycleSettings.is_irregular
        },
        phaseCounts: phaseCounts,
        symptoms: Array.from(allLoggedSymptoms).map(name => ({
            name,
            count: logs?.filter(l => l.symptoms?.includes(name)).length || 0
        }))
    };
}