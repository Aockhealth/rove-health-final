import { supabase } from './supabase';
import { calculatePhase, deriveRecentCycleLengths, getRelevantPeriodStart, type CycleSettings, type DailyLog } from '@shared/cycle/phase';
import { detectOvulation, type OvulationSignal, type TtcDailyLog } from '@shared/cycle/ttc';
import type { LhBandReading } from '@shared/cycle/lh';
import { parseMucusJson, type MucusReading } from '@shared/cycle/mucus';
import { resolvePhaseSettings, toTtcLogs } from './phaseSettings';
import { PHASE_CONTENT } from '@shared/content/phase-content';
import { hasPcosFlag } from './pcos';
import { BLUEPRINTS } from '@shared/content/plan-blueprints';
import { calculateAge, calculateTDEE, applyGoalAdjustment, getPhaseMacros } from './calorieCalculator';
import {
    scaleDurationForActivity,
    capIntensityForActivity,
    reorderBestByGoal,
    recommendActiveDaysPerWeek,
} from './exercisePersonalization';

// Sized to CYCLE_HISTORY_LOOKBACK (6) cycles at the long end of
// MAX_PLAUSIBLE_CYCLE_LENGTH. A flat 90 days held ~3 cycles at 28 days and
// only 2 at 45 — below the 4 that anomaly detection needs and the 3 that
// fertile-window personalization needs, so the longer a woman's cycles were,
// the less personalization she got.
const LOG_WINDOW_DAYS = 270;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function fetchPlanPageDataFast() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

  const [
      settingsResult,
      logsResult,
      lifestyleResult,
      weightGoalResult,
      onboardingResult,
      lhReadingsResult
  ] = await Promise.all([
      supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single(),
      supabase.from("daily_logs").select("date, is_period, bbt_celsius, opk_result, nsaid_taken, disruptors, sleep_minutes, bbt_wake_time, cervical_discharge").eq("user_id", user.id).gte("date", formatDate(pastDate)).order("date", { ascending: false }),
      supabase.from("user_lifestyle").select("*").eq("user_id", user.id).single(),
      supabase.from("user_weight_goals").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_onboarding").select("goals, conditions, date_of_birth, tracker_mode").eq("user_id", user.id).maybeSingle(),
      supabase.from("lh_readings").select("date, test_time, band_level").eq("user_id", user.id).gte("date", formatDate(pastDate)).order("date", { ascending: false })
  ]);

  const settings = settingsResult.data;
  const lifestyle = lifestyleResult.data;
  const weightGoal = weightGoalResult.data;
  const onboarding = onboardingResult.data;
  const logs = logsResult.data || [];
  const lhReadings: LhBandReading[] = (lhReadingsResult.data || []).map((r: any) => ({
    date: r.date,
    testTime: r.test_time,
    bandLevel: Number(r.band_level),
  }));

  // Same trap as lib/dashboard.ts's user_cycle_settings check: `.single()`
  // on a transient network/timeout failure and `.single()` on a genuinely
  // missing settings row both land here as settingsResult.error with
  // settingsResult.data === null. `if (!settings) return null` used to treat
  // both the same, so a blip nulls out the *entire* plan payload (including
  // the weight-goal card, which just reads as "missing") instead of only the
  // genuine "never finished onboarding" case. PGRST116 is PostgREST's real
  // "no rows" code — anything else is a fetch failure and must not silently
  // return null.
  if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
    console.error('[plan] user_cycle_settings query failed:', settingsResult.error.message);
    throw new Error(`user_cycle_settings fetch failed: ${settingsResult.error.message}`);
  }
  if (!settings) return null;

  const monthLogs: Record<string, DailyLog> = {};
  const ttcLogs: Record<string, TtcDailyLog> = {};
  const mucusReadings: MucusReading[] = [];
  logs.forEach((l: any) => {
    monthLogs[l.date] = { date: l.date, is_period: l.is_period };
    ttcLogs[l.date] = {
      date: l.date,
      is_period: l.is_period,
      bbt_celsius: l.bbt_celsius === null || l.bbt_celsius === undefined ? null : Number(l.bbt_celsius),
      opk_result: l.opk_result ?? null,
      disruptors: l.disruptors ?? null,
      sleep_minutes: l.sleep_minutes === null || l.sleep_minutes === undefined ? null : Number(l.sleep_minutes),
      bbt_wake_time: l.bbt_wake_time ?? null,
      nsaid_taken: l.nsaid_taken ?? null,
    };
    if (l.cervical_discharge) {
      const mucus = parseMucusJson(l.cervical_discharge, l.date);
      if (mucus) mucusReadings.push(mucus);
    }
  });

  const baseSettings: CycleSettings = {
      last_period_start: settings.last_period_start || '',
      cycle_length_days: settings.cycle_length_days || 28,
      period_length_days: settings.period_length_days || 5
  };

  const trackerModeRaw = onboarding?.tracker_mode || 'menstruation';
  const hasPcos = hasPcosFlag(onboarding?.goals, onboarding?.conditions);

  // Her observed cycle length + (in TTC) her own luteal length, resolved once
  // by the module every screen now shares — see lib/phaseSettings.ts.
  const phaseSettings = resolvePhaseSettings({
      base: baseSettings,
      monthLogs,
      ttcLogs: toTtcLogs(logs),
      trackerMode: trackerModeRaw,
      hasPcos,
      lhReadings,
      mucusReadings,
  });

  const phaseResult = calculatePhase(new Date(), phaseSettings, monthLogs);
  const phase = phaseResult.phase || "Menstrual";
  const day = phaseResult.day || 1;

  // Anchored to the same period start the phase calculation uses, matching
  // dashboard.ts, so the Plan tab's Timing card never disagrees with Home
  // about which cycle it's describing.
  const { start: cycleStart } = getRelevantPeriodStart(new Date(), phaseSettings, monthLogs);
  const recentCycleLengths = deriveRecentCycleLengths(new Date(), monthLogs);
  const ovulation: OvulationSignal | null =
      trackerModeRaw === 'ttc' && cycleStart
          ? detectOvulation(cycleStart, new Date(), ttcLogs, phaseSettings, { hasPcos, recentCycleLengths, lhReadings, mucusReadings })
          : null;

  const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];
  const blueprintContent = BLUEPRINTS[phase] || BLUEPRINTS["Menstrual"];

  const getRandom = (arr: any[], count: number) => {
      if (!arr || arr.length === 0) return [];
      return arr.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  // Personalizes the phase's static macro_fuel numbers with this person's real
  // biometrics/activity/goal when we have enough data to do so; otherwise falls
  // back to the same fixed per-phase figures the blueprint always shipped with.
  const staticMacroFuel = blueprintContent.nutrition_guide?.macro_fuel;
  let macroFuel = staticMacroFuel;
  if (lifestyle?.weight_kg && lifestyle?.height_cm) {
      const age = calculateAge(onboarding?.date_of_birth);
      const maintenanceCalories = calculateTDEE(
          lifestyle.weight_kg,
          lifestyle.height_cm,
          age,
          phase,
          lifestyle.activity_level
      );
      const targetCalories = applyGoalAdjustment(
          maintenanceCalories,
          lifestyle.fitness_goal,
          weightGoal?.weekly_rate_kg
      );
      const macros = getPhaseMacros(phase, targetCalories);
      macroFuel = {
          ...staticMacroFuel,
          calories: targetCalories,
          protein: macros.protein.g,
          fats: macros.fats.g,
          carbs: macros.carbs.g,
      };
  }

  // Personalizes the phase's static exercise blueprint the same way — duration
  // scaled to activity level, intensity capped for beginners, "best for you"
  // cards reprioritized by goal, plus a rough active-days-per-week guide tied
  // to the pace chosen in the Nourish setup.
  const baseExercise = blueprintContent.exercise || {};
  const cappedIntensity = capIntensityForActivity(
      baseExercise.intensity || 'Moderate',
      baseExercise.type || 'Cardio',
      lifestyle?.activity_level
  );
  const personalizedExercise = {
      summary: baseExercise.summary || '',
      best: reorderBestByGoal(baseExercise.best || [], lifestyle?.fitness_goal),
      avoid: baseExercise.avoid || [],
      time: scaleDurationForActivity(baseExercise.time || '45', lifestyle?.activity_level),
      unit: baseExercise.unit || 'mins',
      intensity: cappedIntensity.intensity,
      type: cappedIntensity.type,
      activeDaysPerWeek: recommendActiveDaysPerWeek(
          lifestyle?.fitness_goal,
          lifestyle?.activity_level,
          weightGoal?.weekly_rate_kg
      ),
  };

  return {
      phase,
      day,
      settings: phaseSettings,
      monthLogs,
      trackerMode: trackerModeRaw,
      hasPcos,
      ovulation,
      lifestyle: lifestyle ? {
          weight_kg: lifestyle.weight_kg,
          height_cm: lifestyle.height_cm,
          activity_level: lifestyle.activity_level,
          diet_preference: lifestyle.diet_preference,
          fitness_goal: lifestyle.fitness_goal
      } : null,
      onboarding: onboarding ? {
          goals: onboarding.goals || [],
          conditions: onboarding.conditions || [],
          dateOfBirth: onboarding.date_of_birth || null
      } : null,
      weightGoal: weightGoal ? {
          currentWeight: lifestyle?.weight_kg || weightGoal.current_weight_kg,
          targetWeight: weightGoal.target_weight_kg,
          startWeight: weightGoal.current_weight_kg,
          weeklyRate: weightGoal.weekly_rate_kg,
          startDate: weightGoal.start_date,
          fitnessGoal: lifestyle?.fitness_goal
      } : null,
      blueprint: {
          color: phase === "Menstrual" ? "bg-rove-red" :
              phase === "Follicular" ? "bg-rove-peach" :
                  phase === "Ovulatory" ? "bg-rove-charcoal" : "bg-amber-500",
          hormones: {
              title: "Hormonal State",
              summary: blueprintContent.hormones?.summary || "",
              desc: blueprintContent.hormones?.desc || "",
              symptoms: blueprintContent.hormones?.symptoms || []
          },
          rituals: {
              focus: content.phaseFocus?.[0]?.title || "Rest & Restore",
              practices: blueprintContent.rituals?.practices || [],
              symptom_relief: blueprintContent.rituals?.symptom_relief || []
          },
          diet: {
              core_needs: blueprintContent.diet?.core_needs || [],
              ideal_meals: blueprintContent.diet?.ideal_meals || [],
              cramp_relief: blueprintContent.diet?.cramp_relief || [],
              avoid: blueprintContent.diet?.avoid || []
          },
          exercise: personalizedExercise,
          supplements: blueprintContent.supplements || [],
          daily_flow: blueprintContent.daily_flow || [],
          nutrition_guide: { ...blueprintContent.nutrition_guide, macro_fuel: macroFuel }
      },
      biometrics: {
          reason: `Phase specific adjustments based on ${phase} phase`,
          hydrationGoal: 2,
          recommendedFoods: [],
          foodsToAvoid: [],
          adjustments: [],
          aiPowered: false
      }
  };
}

// user_weight_goals.weekly_rate_kg has a DB-level CHECK constraint of
// [0.25, 0.75] (see supabase/migrations/001_ai_personalization.sql), but the
// Plan screen's own "safe pace" clamp only enforces [0, 1.0] — so a goal with
// a small weight difference or a long timeline can compute a rate outside
// the DB's stricter range. Re-clamping here guarantees the write below never
// gets rejected by that constraint no matter which caller/UI clamp fed it.
const DB_MIN_WEEKLY_RATE_KG = 0.25;
const DB_MAX_WEEKLY_RATE_KG = 0.75;

export async function savePlanSettings(data: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // onConflict MUST be spelled out (as it already is in lib/onboarding.ts and
    // lib/profile.ts). Without it PostgREST resolves conflicts against the
    // table's PRIMARY KEY, and in the live DB these tables carry a surrogate
    // `id` PK plus a separate UNIQUE (user_id) -- so an upsert that omits `id`
    // is planned as a plain INSERT and dies on
    // "duplicate key value violates unique constraint user_lifestyle_user_id_key"
    // for anyone who already has a row (i.e. every returning user).
    const { error: lifestyleError } = await supabase.from("user_lifestyle").upsert({
        user_id: user.id,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        activity_level: data.activity_level,
        diet_preference: data.diet_preference,
        fitness_goal: data.fitness_goal,
        updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (lifestyleError) throw new Error(`user_lifestyle save failed: ${lifestyleError.message}`);

    const weeklyRateKg = Math.min(
        Math.max(data.weekly_rate_kg, DB_MIN_WEEKLY_RATE_KG),
        DB_MAX_WEEKLY_RATE_KG
    );

    // start_weight_kg / start_date are the baseline the Plan screen measures
    // progress against ("2.4 kg lost"), so they belong to the FIRST goal only.
    // Re-sending them on every save would silently reset that baseline to
    // today's weight each time she edits her height or diet, permanently
    // zeroing her progress bar. Seed them only when there is no goal row yet
    // (or when an older row never got a baseline written).
    const { data: existingGoal, error: existingGoalError } = await supabase
        .from("user_weight_goals")
        .select("start_weight_kg, start_date")
        .eq("user_id", user.id)
        .maybeSingle();
    if (existingGoalError) throw new Error(`user_weight_goals read failed: ${existingGoalError.message}`);

    const weightGoalRow: Record<string, any> = {
        user_id: user.id,
        current_weight_kg: data.weight_kg,
        target_weight_kg: data.target_weight_kg,
        weekly_rate_kg: weeklyRateKg,
        updated_at: new Date().toISOString()
    };
    if (existingGoal?.start_weight_kg == null) weightGoalRow.start_weight_kg = data.weight_kg;
    if (existingGoal?.start_date == null) weightGoalRow.start_date = new Date().toISOString();

    // Save to user_weight_goals
    const { error: weightGoalError } = await supabase
        .from("user_weight_goals")
        .upsert(weightGoalRow, { onConflict: "user_id" });
    if (weightGoalError) throw new Error(`user_weight_goals save failed: ${weightGoalError.message}`);

    return { success: true };
}

/**
 * Mirrors updateWeightGoals in frontend/src/app/cycle-sync/profile/actions.ts —
 * updates the weight-goal row and keeps user_lifestyle.weight_kg (the
 * "current weight" everything else on the app reads) in sync with it. This
 * is what the Plan page's Weight Goal widget edit pencil calls; without it
 * there was no way to log a new current weight after initial setup.
 */
export async function updateWeightGoals(weightData: {
    current_weight_kg: number;
    target_weight_kg: number;
    start_weight_kg?: number;
}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const updateData: Record<string, any> = {
        current_weight_kg: weightData.current_weight_kg,
        target_weight_kg: weightData.target_weight_kg,
        updated_at: new Date().toISOString()
    };
    if (weightData.start_weight_kg) {
        updateData.start_weight_kg = weightData.start_weight_kg;
    }

    const { error: wgError } = await supabase
        .from("user_weight_goals")
        .update(updateData)
        .eq("user_id", user.id);

    if (wgError) {
        return { error: "Failed to update weight goals" };
    }

    const { error: lsError } = await supabase
        .from("user_lifestyle")
        .update({ weight_kg: weightData.current_weight_kg, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

    if (lsError) {
        console.error("Error syncing lifestyle weight:", lsError);
    }

    return { success: true };
}
