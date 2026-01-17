"use server";

import { createClient } from "@/utils/supabase/server";
import { PHASE_CONTENT } from "@/data/phase-content"; 

// ✅ FIX: Removed "async" keyword here
// It only performs math, so it should be synchronous.
export function calculatePhase(
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

// ==========================================================
// FETCH INSIGHTS DATA (Main Function)
// ==========================================================
export async function fetchInsightsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: cycleSettings } = await supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single();
    if (!cycleSettings) return null;

    // ✅ UPDATE: Select ALL relevant columns
    const { data: logs } = await supabase
        .from("daily_logs")
        .select("date, symptoms, moods, sleep_quality, disruptors, exercise_types, notes")
        .eq("user_id", user.id)
        .order('date', { ascending: false }); // Get newest first for "Recent Note"

    const phases = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];
    const phaseCounts: Record<string, number> = { "Menstrual": 0, "Follicular": 0, "Ovulatory": 0, "Luteal": 0 };
    const symptomsByPhase: Record<string, Record<string, number>> = {
        "Menstrual": {}, "Follicular": {}, "Ovulatory": {}, "Luteal": {}
    };
    const moodsByPhase: Record<string, Record<string, number>> = {
        "Menstrual": {}, "Follicular": {}, "Ovulatory": {}, "Luteal": {}
    };

    // Aggregation Sets
    const allSymptoms = new Set<string>();
    const allMoods = new Set<string>();
    const allSleep = new Set<string>();
    const allDisruptors = new Set<string>();
    const allExercise = new Set<string>();
    let mostRecentNote = "";

    if (logs) {
        // Grab the most recent non-empty note
        const noteLog = logs.find(l => l.notes && l.notes.length > 0);
        if (noteLog) mostRecentNote = noteLog.notes;

        logs.forEach((log) => {
            // ✅ This now works because calculatePhase returns the object directly, not a Promise
            const { phase } = calculatePhase(new Date(log.date), cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);
            
            if (phaseCounts[phase] !== undefined) phaseCounts[phase] += 1;

            // Group symptoms by phase
            log.symptoms?.forEach((s: string) => {
                allSymptoms.add(s);
                symptomsByPhase[phase][s] = (symptomsByPhase[phase][s] || 0) + 1;
            });

            // Group moods by phase
            log.moods?.forEach((m: string) => {
                allMoods.add(m);
                moodsByPhase[phase][m] = (moodsByPhase[phase][m] || 0) + 1;
            });

            // Collect all tags found in logs
            log.sleep_quality?.forEach((s: string) => allSleep.add(s));
            log.disruptors?.forEach((d: string) => allDisruptors.add(d));
            log.exercise_types?.forEach((e: string) => allExercise.add(e));
        });
    }

    const currentStatus = calculatePhase(new Date(), cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);

    // Generate tips from PHASE_CONTENT
    const tipsByPhase: Record<string, string[]> = {};
    phases.forEach(p => {
        const content = PHASE_CONTENT[p]; // Ensure strict indexing or define Type for PHASE_CONTENT keys
        if (content) {
            tipsByPhase[p] = content.plan?.hormones?.symptoms || [];
        }
    });

    // Generate simple emotional baseline insights
    const emotionalBaselines: Record<string, { title: string; insight: string }> = {};
    phases.forEach(p => {
        const moods = moodsByPhase[p];
        const topMoods = Object.entries(moods)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([name]) => name);

        if (topMoods.length > 0) {
            emotionalBaselines[p] = {
                title: `${topMoods.join(" & ")} Dominates`,
                insight: `During your ${p} phase, you frequently experience ${topMoods.join(" and ")}. This is consistent with rising hormone levels.`
            };
        } else {
            emotionalBaselines[p] = {
                title: "Steady State",
                insight: `No significant mood patterns detected for the ${p} phase yet. Keep logging to unlock insights.`
            };
        }
    });

    return {
        phase: { name: currentStatus.phase, day: currentStatus.day },
        averages: {
            cycle: cycleSettings.cycle_length_days,
            period: cycleSettings.period_length_days,
            lastPeriodStart: cycleSettings.last_period_start,
            isIrregular: cycleSettings.is_irregular
        },
        phaseCounts,
        symptomsByPhase,
        tipsByPhase,
        emotionalBaselines,
        // Return full context objects for the UI or AI to use
        symptoms: Array.from(allSymptoms).map(name => ({ name, count: 1 })), // Simplified count for now
        aggregatedData: {
            moods: Array.from(allMoods),
            sleep: Array.from(allSleep),
            disruptors: Array.from(allDisruptors),
            exercise: Array.from(allExercise),
            recentNote: mostRecentNote
        }
    };
}