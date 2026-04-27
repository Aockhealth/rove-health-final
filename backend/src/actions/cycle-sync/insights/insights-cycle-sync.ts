"use server";

import { createClient } from "@/utils/supabase/server";
import { PHASE_CONTENT } from "@/data/phase-content";
import {
    calculatePhase,
    getRelevantPeriodStart,
    parseLocalDate,
    formatDate
} from "../../../../../shared/cycle/smart-phase";

const LOG_WINDOW_DAYS = 30; // Using 30 days (Monthly) as you requested

// ==========================================================
// FETCH INSIGHTS DATA (Main Function)
// ==========================================================
export async function fetchInsightsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

    // ✅ FIXED: Added `exercise_minutes` to the query
    const [cycleSettingsResult, logsResult] = await Promise.all([
        supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_logs")
            .select("date, is_period, symptoms, moods, sleep_quality, sleep_minutes, water_intake, disruptors, exercise_types, exercise_minutes, notes")
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

    // Aggregation Sets
    const allSymptoms = new Set<string>();
    const allMoods = new Set<string>();
    const allSleep = new Set<string>();
    const allDisruptors = new Set<string>();
    const allExercise = new Set<string>();
    let mostRecentNote = "";

    // Math accumulators for Wellness Averages
    let totalWater = 0;
    let waterLogCount = 0;
    let totalSleepHours = 0;
    let sleepLogCount = 0;
    // ✅ NEW accumulators for Average Exercise Minutes
    let totalExerciseMinutes = 0;
    let exerciseLogCount = 0;
    
    const totalLogs = logs ? logs.length : 0;

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
            const phaseResult = calculatePhase(parseLocalDate(log.date), settings, logMap);
            const phase = phaseResult.phase;

            if (phase && phaseCounts[phase] !== undefined) phaseCounts[phase] += 1;

            // ✅ FIXED: Wellness Averages Logic
            if (log.water_intake && log.water_intake > 0) {
                totalWater += Number(log.water_intake);
                waterLogCount++;
            }
            if (log.sleep_minutes && log.sleep_minutes > 0) {
                totalSleepHours += (Number(log.sleep_minutes) / 60); // Convert minutes to hours
                sleepLogCount++;
            }
            // ✅ NEW: Summing up exercise minutes
            if (log.exercise_minutes && log.exercise_minutes > 0) {
                totalExerciseMinutes += Number(log.exercise_minutes);
                exerciseLogCount++;
            }

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
            log.exercise_types?.forEach((e: string) => allExercise.add(e));
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
        const content = PHASE_CONTENT[p as keyof typeof PHASE_CONTENT]; 
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
        // ✅ NEW: Corrected averages (using exerciseMinutes instead of activeRate)
        wellnessAverages: {
            water: waterLogCount > 0 ? Math.round(totalWater / waterLogCount) : 0,
            sleep: sleepLogCount > 0 ? (totalSleepHours / sleepLogCount).toFixed(1) : 0,
            exerciseMinutes: exerciseLogCount > 0 ? Math.round(totalExerciseMinutes / exerciseLogCount) : 0
        },
        phaseCounts,
        symptomsByPhase,
        tipsByPhase,
        emotionalBaselines,
        symptoms: Array.from(allSymptoms).map(name => ({ name, count: 1 })),
        aggregatedData: {
            moods: Array.from(allMoods),
            sleep: Array.from(allSleep),
            disruptors: Array.from(allDisruptors),
            exercise: Array.from(allExercise),
            recentNote: mostRecentNote
        }
    };
}