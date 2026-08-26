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
    summarizePcosPatterns,
    type TtcCycleStats,
    type TtcHistoryCycle,
    type TtcPattern,
    type PcosPatternInsight,
} from './ttcCycleHistory';
import { deriveRecentCycleLengths, deriveRecentCycleHistory, type CycleSettings, type CycleHistoryEntry } from '@shared/cycle/phase';
import { detectCycleAnomalies, type CycleAnomaly } from '@shared/cycle/anomaly';
import { resolvePhaseSettings, toTtcLogs } from './phaseSettings';
import type { LhBandReading } from '@shared/cycle/lh';
import { parseMucusJson, type MucusReading } from '@shared/cycle/mucus';
import { hasPcosFlag } from './pcos';
import { computePmosPatternScore, type PmosPatternScore } from './pmosScore';
import { computeHormoneRhythm, type HormoneRhythmResult, type DailySignalReading } from './hormoneRhythm';

export type TtcInsights = {
    cycleStart: string;
    bbt: BbtReading[];
    opk: OpkReading[];
    /** This cycle's cervical mucus readings — coincident with ovulation, sharpens confidence but never confirms it. */
    mucus: MucusReading[];
    coverline: number | null;
    signal: OvulationSignal;
    /** Most recent cycle first, including the current ongoing one. */
    cycles: TtcHistoryCycle[];
    stats: TtcCycleStats;
    patterns: TtcPattern[];
    /** Only populated when she's flagged PCOS in onboarding — see hasPcosFlag. */
    pcosPatterns: PcosPatternInsight[];
    /**
     * Today's secondary signals, if any were synced from Apple Health /
     * Health Connect (see healthBackgroundSync.ts) — informational only,
     * never fed into `signal` above. Null fields mean "not synced today,"
     * not zero.
     */
    secondarySignals: {
        hrvMs: number | null;
        hrvSource: 'apple_sdnn' | 'health_connect_rmssd' | null;
        restingHeartRateBpm: number | null;
        skinTempDeltaCelsius: number | null;
    };
};

// 6, not 3: this is the one window already scaled to her own cycle length, and
// CYCLE_HISTORY_LOOKBACK / MIN_CYCLES_FOR_ANOMALY_DETECTION ask for more
// cycles than 3 can supply — detectCycleAnomalies needs 4 and was therefore
// almost never able to return anything.
const LOG_WINDOW_CYCLE_MULTIPLIER = 6;

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
    const hasPcos = hasPcosFlag(onboarding?.goals, onboarding?.conditions);

    // Weight/height for the PMOS-pattern score's BMI indicator — best-effort,
    // absent until she's filled in Health Passport.
    const { data: lifestyle } = await supabase
        .from("user_lifestyle")
        .select("weight_kg, height_cm")
        .eq("user_id", user.id)
        .single();
    const bmi = lifestyle?.weight_kg && lifestyle?.height_cm
        ? lifestyle.weight_kg / ((lifestyle.height_cm / 100) ** 2)
        : null;

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
    // cycle_summary is a server-side cache that nothing currently populates
    // (the edge function that's supposed to write it is never triggered —
    // see process-daily-log), so this is really just today's fallback:
    // whatever's stored in settings, or the 28-day default. It gets replaced
    // below with a real number derived from her own logged periods once
    // logMap is available.
    let computedAvgCycle = latestCycle?.phase_data?.avg_length_used || latestCycle?.cycle_length || cycleSettings.cycle_length_days || 28;

    // Personal baseline from the cycles BEFORE the latest one, so the latest
    // cycle's own length can't dilute the number it's being compared against.
    const priorCycleLengths = (recentCycleSummaries || [])
        .slice(1)
        .map((c) => c.cycle_length)
        .filter((n): n is number => typeof n === 'number' && n > 0);
    let personalBaselineCycleLength = priorCycleLengths.length >= 2
        ? Math.round(priorCycleLengths.reduce((a, b) => a + b, 0) / priorCycleLengths.length)
        : null;
    let latestCycleLength = typeof latestCycle?.cycle_length === 'number' ? latestCycle.cycle_length : null;
    let cycleDeltaFromBaseline = personalBaselineCycleLength != null && latestCycleLength != null
        ? latestCycleLength - personalBaselineCycleLength
        : null;

    const logWindowDays = (computedAvgCycle) * LOG_WINDOW_CYCLE_MULTIPLIER;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - logWindowDays);

    // ✅ FIXED: Added `exercise_minutes` to the query
    const logsResult = await supabase.from("daily_logs")
        .select("date, is_period, symptoms, moods, sleep_quality, sleep_minutes, water_intake, disruptors, exercise_types, exercise_minutes, notes, bbt_celsius, opk_result, nsaid_taken, bbt_wake_time, cervical_discharge, hrv_ms, hrv_source, resting_heart_rate_bpm, skin_temp_delta_celsius, steps")
        .eq("user_id", user.id)
        .gte("date", pastDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

    const logs = logsResult.data;

    const lhReadingsResult = isTtcMode
        ? await supabase.from("lh_readings")
            .select("date, test_time, band_level")
            .eq("user_id", user.id)
            .gte("date", pastDate.toISOString().split('T')[0])
            .order('date', { ascending: false })
        : null;
    const lhReadings: LhBandReading[] = (lhReadingsResult?.data || []).map((r: any) => ({
        date: r.date,
        testTime: r.test_time,
        bandLevel: Number(r.band_level),
    }));

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
    let totalSteps = 0;
    let stepsLogCount = 0;
    
    const totalLogs = logs ? logs.length : 0;

    // Build logMap first so we can use it for smart phase calculation
    const logMap: Record<string, any> = {};
    const disruptorsByDate: Record<string, string[]> = {};
    if (logs) {
        logs.forEach((l: any) => {
            logMap[l.date] = l;
            if (l.disruptors?.length) disruptorsByDate[l.date] = l.disruptors;
        });
    }

    // Resolved once for the whole payload — her observed cycle length, plus her
    // own luteal length in TTC. The per-day phase loop below, `currentStatus`,
    // `relevant` and the TTC ovulation read all take these same settings, so
    // Insights can't disagree with Home/Tracker about which phase a day is in.
    const settings: CycleSettings = resolvePhaseSettings({
        base: {
            last_period_start: cycleSettings.last_period_start,
            cycle_length_days: cycleSettings.cycle_length_days,
            period_length_days: cycleSettings.period_length_days,
        },
        monthLogs: logMap,
        ttcLogs: toTtcLogs(logs),
        trackerMode: onboarding?.tracker_mode,
        hasPcos,
        lhReadings,
        mucusReadings: (logs || [])
            .map((l: any) => parseMucusJson(l.cervical_discharge, l.date))
            .filter((m: MucusReading | null): m is MucusReading => m !== null),
    });

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
            if (log.steps && log.steps > 0) {
                totalSteps += Number(log.steps);
                stepsLogCount++;
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

    const currentStatus = calculatePhase(new Date(), settings, logMap);

    const relevant = getRelevantPeriodStart(new Date(), settings, logMap);

    const nextPeriodDate = relevant.start
        ? (() => {
            const start = parseLocalDate(relevant.start);
            const cycleLen = settings.cycle_length_days;
            start.setDate(start.getDate() + cycleLen);
            return formatDate(start);
        })()
        : null;

    // TTC chart data — the readings for the *current* cycle only. Earlier
    // cycles have their own baselines, so splicing them into one series would
    // draw a coverline that belongs to no cycle in particular.
    let ttc: TtcInsights | null = null;
    // Quiet, retrospective summary for every mode, not just TTC — the
    // anovulatory/confirmed states are engine-level facts, never gated
    // behind TTC (see shared/cycle/ttc.ts and the standing "one engine, not
    // a TTC-only feature" rule). Default mode gets this line, not the full
    // chart/history object, which needs biomarker logging only TTC prompts.
    let ovulationSummary: {
        status: OvulationSignal['status'];
        anovulatory: OvulationSignal['anovulatory'];
        confidence: OvulationSignal['confidence'];
        confirmedDate: string | null;
        predictedDate: string | null;
    } | null = null;
    // Populated below regardless of TTC/Cycle Sync mode — cycle-length
    // history only needs logged period days, not biomarkers.
    let cycleHistory: CycleHistoryEntry[] = [];
    // Only populated in TTC mode, where BBT/OPK logging actually exists to
    // assess anovulatory signals from. Cycle Sync mode has no biomarker
    // logging today, so this stays null there — see pmosScore.ts.
    let anovulatoryAssessmentForScore: { flaggedCycles: number; totalCycles: number } | null = null;
    // Available in every mode when PCOS is flagged — not TTC-only, since
    // seeing your own PCOS patterns (short luteal phases, long anovulatory
    // stretches) is useful whether or not you're trying to conceive. Reuses
    // whatever cycle scoring the mode already computes below rather than
    // running scoreTtcCycles a second time in TTC mode.
    let pcosPatterns: PcosPatternInsight[] = [];

    if (relevant.start) {
        // bbt_celsius is a Postgres `numeric`, returned as a string by PostgREST —
        // coerce once here so it doesn't reach the coverline/threshold arithmetic
        // as a string, in either the chart read or the historical cycle scoring.
        const normalizedTtcLogs = (logs || []).map((l: any) => ({
            date: l.date as string,
            is_period: l.is_period as boolean | null,
            bbt_celsius: l.bbt_celsius === null || l.bbt_celsius === undefined ? null : Number(l.bbt_celsius),
            opk_result: (l.opk_result ?? null) as TtcDailyLog['opk_result'],
            disruptors: l.disruptors ?? null,
            sleep_minutes: l.sleep_minutes === null || l.sleep_minutes === undefined ? null : Number(l.sleep_minutes),
            bbt_wake_time: l.bbt_wake_time ?? null,
            nsaid_taken: l.nsaid_taken ?? null,
        }));

        const ttcLogs: Record<string, TtcDailyLog> = {};
        normalizedTtcLogs.forEach((l) => {
            ttcLogs[l.date] = { ...l, is_period: l.is_period ?? undefined };
        });

        const mucusReadings: MucusReading[] = (logs || [])
            .map((l: any) => parseMucusJson(l.cervical_discharge, l.date))
            .filter((m): m is MucusReading => m !== null);

        const baseTtcSettings: CycleSettings = settings;
        const recentCycleLengths = deriveRecentCycleLengths(new Date(), logMap);
        cycleHistory = deriveRecentCycleHistory(new Date(), logMap);

        // Real cycle lengths derived from her own logged periods take over
        // from the cycle_summary/settings fallback above, the same way the
        // fertile-window and anomaly-detection code already trusts this data
        // instead of that never-populated cache. recentCycleLengths is most-
        // recent-first; [0] is the latest *completed* cycle (a start followed
        // by a later start), so an ongoing, not-yet-finished cycle correctly
        // doesn't get counted as if it were done.
        if (recentCycleLengths.length > 0) {
            computedAvgCycle = recentCycleLengths[0];
            latestCycleLength = recentCycleLengths[0];
            const priorLoggedCycleLengths = recentCycleLengths.slice(1);
            personalBaselineCycleLength = priorLoggedCycleLengths.length >= 2
                ? Math.round(priorLoggedCycleLengths.reduce((a, b) => a + b, 0) / priorLoggedCycleLengths.length)
                : null;
            cycleDeltaFromBaseline = personalBaselineCycleLength != null
                ? latestCycleLength - personalBaselineCycleLength
                : null;
        }

        if (isTtcMode) {
            const readings = collectCycleReadings(relevant.start, new Date(), ttcLogs);

            // Cycles across the fetched log window, most recent first — the same
            // per-cycle scoring the Day-4 PDF report runs, reused here for the
            // "Across your cycles" / "Cycle history" / "Patterns worth noticing" cards.
            // Scored with the base (non-personalized) settings: luteal_length_days
            // only affects the date-math fallback, never a biomarker-confirmed
            // signal, so it's safe to derive the personalized value from this pass
            // rather than needing a second one.
            const { starts } = deriveCycleStarts(normalizedTtcLogs);
            const cycles = scoreTtcCycles(normalizedTtcLogs, starts, baseTtcSettings, new Date(), hasPcos, lhReadings, mucusReadings);
            const stats = computeTtcCycleStats(cycles);

            const scoredCyclesForScore = cycles.filter((c) => !c.isOngoing);
            if (scoredCyclesForScore.length > 0) {
                const flaggedCycles = scoredCyclesForScore.filter(
                    (c) => (c.signal.anovulatory?.reasons?.length ?? 0) > 0
                ).length;
                anovulatoryAssessmentForScore = { flaggedCycles, totalCycles: scoredCyclesForScore.length };
            }

            pcosPatterns = hasPcos ? summarizePcosPatterns(cycles) : [];

            // `settings` already carries her personalized luteal length —
            // resolvePhaseSettings applied it above, for every screen at once.
            // Recomputing it here was how Insights used to end up a step out of
            // sync with Home.
            const signal = detectOvulation(relevant.start, new Date(), ttcLogs, baseTtcSettings, { hasPcos, recentCycleLengths, lhReadings, mucusReadings });

            const todayStr = formatDate(new Date());
            const cycleMucusReadings = mucusReadings.filter(
                (r) => r.date >= relevant.start! && r.date <= todayStr
            );
            const todayLog = logMap[todayStr];
            ttc = {
                cycleStart: relevant.start,
                bbt: readings.bbt,
                opk: readings.opk,
                mucus: cycleMucusReadings,
                coverline: currentCoverline(readings.bbt),
                signal,
                cycles,
                stats,
                patterns: detectTtcPatterns(cycles, stats),
                pcosPatterns,
                secondarySignals: {
                    hrvMs: todayLog?.hrv_ms ?? null,
                    hrvSource: todayLog?.hrv_source ?? null,
                    restingHeartRateBpm: todayLog?.resting_heart_rate_bpm ?? null,
                    skinTempDeltaCelsius: todayLog?.skin_temp_delta_celsius ?? null,
                },
            };
            ovulationSummary = { status: signal.status, anovulatory: signal.anovulatory, confidence: signal.confidence, confirmedDate: signal.confirmedDate, predictedDate: signal.predictedDate };
        } else {
            // Same engine, no biomarker prompts to log against — realistically
            // date-math and cycle-history-only anovulatory checks, which is
            // exactly the case this signal was designed to still work for.
            const signal = detectOvulation(relevant.start, new Date(), ttcLogs, baseTtcSettings, { hasPcos, recentCycleLengths, lhReadings, mucusReadings });
            ovulationSummary = { status: signal.status, anovulatory: signal.anovulatory, confidence: signal.confidence, confirmedDate: signal.confirmedDate, predictedDate: signal.predictedDate };

            // Cycle Sync doesn't get the full TTC chart/history object, but a
            // PCOS-flagged user still gets her own pattern summary — she may
            // now be logging BBT/OPK too (see tracker.tsx's PCOS/irregular
            // fertility-tracking unlock), and the patterns are worth surfacing
            // even from date-math-only history.
            if (hasPcos) {
                const { starts } = deriveCycleStarts(normalizedTtcLogs);
                const cycles = scoreTtcCycles(normalizedTtcLogs, starts, baseTtcSettings, new Date(), hasPcos, lhReadings, mucusReadings);
                pcosPatterns = summarizePcosPatterns(cycles);
            }
        }
    }

    // Personal-baseline anomaly detection — her own rolling mean/stdev, not
    // a population number. Available in every mode since it only needs
    // logged period days.
    const cycleAnomalies: CycleAnomaly[] = detectCycleAnomalies(cycleHistory, disruptorsByDate);

    // Composite PMOS-pattern score — see pmosScore.ts for why each indicator
    // only counts when there's enough data to actually assess it.
    const pmosScore: PmosPatternScore = computePmosPatternScore({
        cycleLengths: cycleHistory.map((c) => c.length),
        anovulatoryAssessment: anovulatoryAssessmentForScore,
        bmi,
    });

    // Inferred thermal & autonomic rhythm — Cycle Sync mode's equivalent of
    // the BBT/OPK chart TTC mode already has, built from whatever HealthKit/
    // Health Connect signals have synced this cycle (see hormoneRhythm.ts).
    let hormoneRhythm: HormoneRhythmResult = { points: [], hasBaseline: false };
    if (relevant.start) {
        const signalReadings: DailySignalReading[] = Object.values(logMap).map((l: any) => ({
            date: l.date,
            skinTempDeltaCelsius: l.skin_temp_delta_celsius ?? null,
            restingHeartRateBpm: l.resting_heart_rate_bpm ?? null,
            hrvMs: l.hrv_ms ?? null,
        }));
        hormoneRhythm = computeHormoneRhythm(relevant.start, computedAvgCycle, signalReadings);
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
            exerciseMinutes: exerciseLogCount > 0 ? Math.round(totalExerciseMinutes / exerciseLogCount) : 0,
            steps: stepsLogCount > 0 ? Math.round(totalSteps / stepsLogCount) : 0
        },
        phaseCounts,
        symptomsByPhase,
        moodsByPhase,
        tipsByPhase,
        emotionalBaselines,
        trackerMode: onboarding?.tracker_mode ?? 'menstruation',
        ttc,
        ovulationSummary,
        /** Populated whenever PCOS is flagged in onboarding, in every tracker mode — see hasPcosFlag. */
        pcosPatterns,
        cycleAnomalies,
        pmosScore,
        hormoneRhythm,
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