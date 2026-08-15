import { supabase } from './supabase';
import { PHASE_CONTENT } from '@shared/content/phase-content';
import {
    calculatePhase,
    getRelevantPeriodStart,
    parseLocalDate,
    formatDate
} from '@shared/cycle/smart-phase';
import {
    collectCycleReadings,
    currentCoverline,
    detectOvulation,
    type BbtReading,
    type OpkReading,
    type OvulationSignal,
    type TtcDailyLog
} from '@shared/cycle/ttc';
import {
    computeTtcCycleStats,
    deriveCycleStarts,
    detectTtcPatterns,
    scoreTtcCycles,
    type TtcCycleStats,
    type TtcHistoryCycle,
    type TtcPattern,
} from './ttcCycleHistory';

export type TtcInsights = {
    cycleStart: string;
    bbt: BbtReading[];
    opk: OpkReading[];
    coverline: number | null;
    signal: OvulationSignal;
    /** Most recent cycle first, including the current ongoing one. */
    cycles: TtcHistoryCycle[];
    stats: TtcCycleStats;
    patterns: TtcPattern[];
};

const LOG_WINDOW_CYCLE_MULTIPLIER = 3; // Cover at least 3 cycles so pattern analysis isn't limited to the most recent one

// ==========================================================
// SYMPTOM CORRELATIONS — computed from her own logs, not a
// population lookup table. Falls back silently (via `undefined`)
// when there isn't enough of her own data yet to say anything real.
// ==========================================================
const SLEEP_LOW_MINUTES = 360; // under 6 hours
const WATER_LOW_GLASSES = 6;
const MIN_SAMPLE_DAYS = 4; // per side of the comparison
const MIN_RATE_DIFF = 0.2; // 20 points — below this it reads as noise, not a pattern

function rateOf(symptom: string, group: any[]): number {
    return group.filter((l) => l.symptoms?.includes(symptom)).length / group.length;
}

function computeSymptomCorrelations(logs: any[]): Record<string, { stat: string }> {
    const bySleep = { low: [] as any[], ok: [] as any[] };
    const byWater = { low: [] as any[], ok: [] as any[] };
    const byExercise = { rest: [] as any[], active: [] as any[] };

    logs.forEach((log) => {
        if (log.sleep_minutes != null) (log.sleep_minutes < SLEEP_LOW_MINUTES ? bySleep.low : bySleep.ok).push(log);
        if (log.water_intake != null) (log.water_intake < WATER_LOW_GLASSES ? byWater.low : byWater.ok).push(log);
        if (log.exercise_minutes != null) (log.exercise_minutes > 0 ? byExercise.active : byExercise.rest).push(log);
    });

    const allSymptoms = new Set<string>();
    logs.forEach((l) => l.symptoms?.forEach((s: string) => allSymptoms.add(s)));

    const result: Record<string, { stat: string }> = {};

    allSymptoms.forEach((symptom) => {
        const candidates: { diff: number; stat: string }[] = [];

        if (bySleep.low.length >= MIN_SAMPLE_DAYS && bySleep.ok.length >= MIN_SAMPLE_DAYS) {
            const low = rateOf(symptom, bySleep.low);
            const ok = rateOf(symptom, bySleep.ok);
            if (Math.abs(low - ok) >= MIN_RATE_DIFF) {
                candidates.push({
                    diff: Math.abs(low - ok),
                    stat: low > ok
                        ? `Your ${symptom.toLowerCase()} shows up on ${Math.round(low * 100)}% of days you slept under 6 hours, vs ${Math.round(ok * 100)}% otherwise.`
                        : `Your ${symptom.toLowerCase()} is actually less common for you on short-sleep days — ${Math.round(low * 100)}% vs ${Math.round(ok * 100)}% otherwise.`,
                });
            }
        }

        if (byWater.low.length >= MIN_SAMPLE_DAYS && byWater.ok.length >= MIN_SAMPLE_DAYS) {
            const low = rateOf(symptom, byWater.low);
            const ok = rateOf(symptom, byWater.ok);
            if (Math.abs(low - ok) >= MIN_RATE_DIFF) {
                candidates.push({
                    diff: Math.abs(low - ok),
                    stat: low > ok
                        ? `Your ${symptom.toLowerCase()} shows up on ${Math.round(low * 100)}% of days you drank fewer than 6 glasses of water, vs ${Math.round(ok * 100)}% otherwise.`
                        : `Your ${symptom.toLowerCase()} is actually less common for you on low-water days — ${Math.round(low * 100)}% vs ${Math.round(ok * 100)}% otherwise.`,
                });
            }
        }

        if (byExercise.rest.length >= MIN_SAMPLE_DAYS && byExercise.active.length >= MIN_SAMPLE_DAYS) {
            const rest = rateOf(symptom, byExercise.rest);
            const active = rateOf(symptom, byExercise.active);
            if (Math.abs(rest - active) >= MIN_RATE_DIFF) {
                candidates.push({
                    diff: Math.abs(rest - active),
                    stat: rest > active
                        ? `Your ${symptom.toLowerCase()} shows up on ${Math.round(rest * 100)}% of rest days, vs ${Math.round(active * 100)}% of days you moved.`
                        : `Your ${symptom.toLowerCase()} shows up more on active days for you — ${Math.round(active * 100)}% vs ${Math.round(rest * 100)}% on rest days.`,
                });
            }
        }

        if (candidates.length > 0) {
            candidates.sort((a, b) => b.diff - a.diff);
            result[symptom] = { stat: candidates[0].stat };
        }
    });

    return result;
}

// ==========================================================
// FETCH INSIGHTS DATA (Main Function)
// ==========================================================
export async function fetchInsightsData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const cycleSettingsResult = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    const cycleSettings = cycleSettingsResult.data;

    if (!cycleSettings) return null;

    const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("tracker_mode, goals, conditions")
        .eq("user_id", user.id)
        .single();

    const isTtcMode = onboarding?.tracker_mode === 'ttc';
    const hasPcos = [
        ...(Array.isArray(onboarding?.goals) ? onboarding.goals : []),
        ...(Array.isArray(onboarding?.conditions) ? onboarding.conditions : []),
    ].some((item: unknown) => String(item).toLowerCase().includes('pcos'));

    // Latest + up to 6 prior cycles — the prior ones establish her own
    // baseline so the latest can be compared against it, not against a
    // population number.
    const { data: recentCycleSummaries } = await supabase
        .from("cycle_summary")
        .select("cycle_length, phase_data")
        .eq("user_id", user.id)
        .order("cycle_start_date", { ascending: false })
        .limit(7);

    const latestCycle = recentCycleSummaries?.[0];
    const computedAvgCycle = latestCycle?.phase_data?.avg_length_used || latestCycle?.cycle_length || cycleSettings.cycle_length_days || 28;

    // Personal baseline from the cycles BEFORE the latest one, so the latest
    // cycle's own length can't dilute the number it's being compared against.
    const priorCycleLengths = (recentCycleSummaries || [])
        .slice(1)
        .map((c) => c.cycle_length)
        .filter((n): n is number => typeof n === 'number' && n > 0);
    const personalBaselineCycleLength = priorCycleLengths.length >= 2
        ? Math.round(priorCycleLengths.reduce((a, b) => a + b, 0) / priorCycleLengths.length)
        : null;
    const latestCycleLength = typeof latestCycle?.cycle_length === 'number' ? latestCycle.cycle_length : null;
    const cycleDeltaFromBaseline = personalBaselineCycleLength != null && latestCycleLength != null
        ? latestCycleLength - personalBaselineCycleLength
        : null;

    const logWindowDays = (computedAvgCycle) * LOG_WINDOW_CYCLE_MULTIPLIER;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - logWindowDays);

    // ✅ FIXED: Added `exercise_minutes` to the query
    const logsResult = await supabase.from("daily_logs")
        .select("date, is_period, symptoms, moods, sleep_quality, sleep_minutes, water_intake, disruptors, exercise_types, exercise_minutes, notes, bbt_celsius, opk_result")
        .eq("user_id", user.id)
        .gte("date", pastDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

    const logs = logsResult.data;

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

    // TTC chart data — the readings for the *current* cycle only. Earlier
    // cycles have their own baselines, so splicing them into one series would
    // draw a coverline that belongs to no cycle in particular.
    let ttc: TtcInsights | null = null;
    if (isTtcMode && relevant.start) {
        // bbt_celsius is a Postgres `numeric`, returned as a string by PostgREST —
        // coerce once here so it doesn't reach the coverline/threshold arithmetic
        // as a string, in either the chart read or the historical cycle scoring.
        const normalizedTtcLogs = (logs || []).map((l: any) => ({
            date: l.date as string,
            is_period: l.is_period as boolean | null,
            bbt_celsius: l.bbt_celsius === null || l.bbt_celsius === undefined ? null : Number(l.bbt_celsius),
            opk_result: (l.opk_result ?? null) as TtcDailyLog['opk_result'],
        }));

        const ttcLogs: Record<string, TtcDailyLog> = {};
        normalizedTtcLogs.forEach((l) => {
            ttcLogs[l.date] = { ...l, is_period: l.is_period ?? undefined };
        });

        const readings = collectCycleReadings(relevant.start, new Date(), ttcLogs);
        const ttcSettings = {
            last_period_start: cycleSettings.last_period_start,
            cycle_length_days: cycleSettings.cycle_length_days,
            period_length_days: cycleSettings.period_length_days,
        };

        // Cycles across the fetched log window, most recent first — the same
        // per-cycle scoring the Day-4 PDF report runs, reused here for the
        // "Across your cycles" / "Cycle history" / "Patterns worth noticing" cards.
        const { starts } = deriveCycleStarts(normalizedTtcLogs);
        const cycles = scoreTtcCycles(normalizedTtcLogs, starts, ttcSettings, new Date(), hasPcos);
        const stats = computeTtcCycleStats(cycles);

        ttc = {
            cycleStart: relevant.start,
            bbt: readings.bbt,
            opk: readings.opk,
            coverline: currentCoverline(readings.bbt),
            signal: detectOvulation(relevant.start, new Date(), ttcLogs, ttcSettings, { hasPcos }),
            cycles,
            stats,
            patterns: detectTtcPatterns(cycles, stats),
        };
    }

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
            cycle: computedAvgCycle,
            period: cycleSettings.period_length_days,
            lastPeriodStart: cycleSettings.last_period_start,
            nextPeriodDate,
            isIrregular: cycleSettings.is_irregular,
            personalBaselineCycleLength,
            cycleDeltaFromBaseline
        },
        // ✅ NEW: Corrected averages (using exerciseMinutes instead of activeRate)
        wellnessAverages: {
            water: waterLogCount > 0 ? Math.round(totalWater / waterLogCount) : 0,
            sleep: sleepLogCount > 0 ? (totalSleepHours / sleepLogCount).toFixed(1) : 0,
            exerciseMinutes: exerciseLogCount > 0 ? Math.round(totalExerciseMinutes / exerciseLogCount) : 0
        },
        phaseCounts,
        symptomsByPhase,
        moodsByPhase,
        tipsByPhase,
        emotionalBaselines,
        trackerMode: onboarding?.tracker_mode ?? 'menstruation',
        ttc,
        symptomCorrelations: computeSymptomCorrelations(logs || []),
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