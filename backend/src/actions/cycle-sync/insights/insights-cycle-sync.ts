"use server";

import { createClient } from "@/utils/supabase/server";
import { PHASE_CONTENT } from "@/data/phase-content";
import {
    calculatePhase,
    getRelevantPeriodStart,
    parseLocalDate,
    formatDate
} from "../../../../../shared/cycle/smart-phase";

const LOG_WINDOW_DAYS = 90;

// ==========================================================
// FETCH INSIGHTS DATA (Main Function)
// ==========================================================
export async function fetchInsightsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

    // ✅ OPTIMIZED: Parallel fetch of cycleSettings and logs
    const [cycleSettingsResult, logsResult] = await Promise.all([
        supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_logs")
            .select("date, is_period, symptoms, moods, sleep_quality, disruptors, exercise_types, water_intake, notes")
            .eq("user_id", user.id)
            .gte("date", pastDate.toISOString().split('T')[0])
            .order('date', { ascending: false })
    ]);

    const cycleSettings = cycleSettingsResult.data;
    const logs = logsResult.data;

    if (!cycleSettings) return null;

    const phases = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];
    const phaseCounts: Record<string, number> = { "Menstrual": 0, "Follicular": 0, "Ovulatory": 0, "Luteal": 0 };
    const symptomsByPhase: Record<string, Record<string, number>> = {
        "Menstrual": {}, "Follicular": {}, "Ovulatory": {}, "Luteal": {}
    };
    const moodsByPhase: Record<string, Record<string, number>> = {
        "Menstrual": {}, "Follicular": {}, "Ovulatory": {}, "Luteal": {}
    };
    const exerciseByPhase: Record<string, Record<string, number>> = {
        "Menstrual": {}, "Follicular": {}, "Ovulatory": {}, "Luteal": {}
    };
    const hydrationByPhase: Record<string, { total: number, days: number }> = {
        "Menstrual": { total: 0, days: 0 },
        "Follicular": { total: 0, days: 0 },
        "Ovulatory": { total: 0, days: 0 },
        "Luteal": { total: 0, days: 0 }
    };

    // Aggregation Sets
    const allSymptoms = new Set<string>();
    const allMoods = new Set<string>();
    const allSleep = new Set<string>();
    const allDisruptors = new Set<string>();
    const allExercise = new Set<string>();
    let mostRecentNote = "";

    // Build logMap first so we can use it for smart phase calculation
    const logMap: Record<string, any> = {};
    if (logs) {
        logs.forEach((l: any) => {
            logMap[l.date] = l;
        });
    }

    const settings = {
        last_period_start: cycleSettings.last_period_start,
        cycle_length_days: cycleSettings.cycle_length_days,
        period_length_days: cycleSettings.period_length_days
    };

    if (logs) {
        // Grab the most recent non-empty note
        const noteLog = logs.find((l: any) => l.notes && l.notes.length > 0);
        if (noteLog) mostRecentNote = noteLog.notes;

        logs.forEach((log: any) => {
            // ✅ FIXED: Using canonical calculatePhase to respect manual period logs + no-data
            const phaseResult = calculatePhase(parseLocalDate(log.date), settings, logMap);
            const phase = phaseResult.phase;

            if (phase && phaseCounts[phase] !== undefined) phaseCounts[phase] += 1;

            // Always collect aggregated tags
            log.symptoms?.forEach((s: string) => {
                allSymptoms.add(s);
                if (phase) symptomsByPhase[phase][s] = (symptomsByPhase[phase][s] || 0) + 1;
            });

            log.moods?.forEach((m: string) => {
                allMoods.add(m);
                if (phase) moodsByPhase[phase][m] = (moodsByPhase[phase][m] || 0) + 1;
            });

            // Collect all tags found in logs
            log.sleep_quality?.forEach((s: string) => allSleep.add(s));
            log.disruptors?.forEach((d: string) => allDisruptors.add(d));
            log.exercise_types?.forEach((e: string) => {
                allExercise.add(e);
                if (phase) exerciseByPhase[phase][e] = (exerciseByPhase[phase][e] || 0) + 1;
            });

            if (log.water_intake && phase) {
                hydrationByPhase[phase].total += log.water_intake;
                hydrationByPhase[phase].days += 1;
            }
        });
    }

    const currentStatus = calculatePhase(new Date(), {
        last_period_start: cycleSettings.last_period_start,
        cycle_length_days: cycleSettings.cycle_length_days,
        period_length_days: cycleSettings.period_length_days
    }, logMap);

    const relevant = getRelevantPeriodStart(
        new Date(),
        {
            last_period_start: cycleSettings.last_period_start,
            cycle_length_days: cycleSettings.cycle_length_days,
            period_length_days: cycleSettings.period_length_days
        },
        logMap
    );

    const nextPeriodDate = relevant.start
        ? (() => {
            const start = parseLocalDate(relevant.start);
            const cycleLen = cycleSettings.cycle_length_days || 28;
            start.setDate(start.getDate() + cycleLen);
            return formatDate(start);
        })()
        : null;

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
        phase: currentStatus.phase ? {
            name: currentStatus.phase,
            day: currentStatus.day,
            latePeriod: currentStatus.latePeriod,
            confidence: currentStatus.confidence,
            dataSource: currentStatus.dataSource
        } : null,
        averages: {
            cycle: cycleSettings.cycle_length_days,
            period: cycleSettings.period_length_days,
            lastPeriodStart: cycleSettings.last_period_start,
            nextPeriodDate,
            isIrregular: cycleSettings.is_irregular
        },
        phaseCounts,
        symptomsByPhase,
        moodsByPhase,
        exerciseByPhase,
        hydrationByPhase,
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
