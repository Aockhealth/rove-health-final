import { supabase } from './supabase';
import { calculatePhase, type CycleSettings, type DailyLog } from '@shared/cycle/phase';
import { PHASE_CONTENT } from '@shared/content/phase-content';
import { BLUEPRINTS } from '@shared/content/plan-blueprints';

const LOG_WINDOW_DAYS = 90;

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
      onboardingResult
  ] = await Promise.all([
      supabase.from("user_cycle_settings").select("*").eq("user_id", user.id).single(),
      supabase.from("daily_logs").select("date, is_period").eq("user_id", user.id).gte("date", formatDate(pastDate)).order("date", { ascending: false }),
      supabase.from("user_lifestyle").select("*").eq("user_id", user.id).single(),
      supabase.from("user_weight_goals").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_onboarding").select("goals, conditions").eq("user_id", user.id).maybeSingle()
  ]);

  const settings = settingsResult.data;
  const lifestyle = lifestyleResult.data;
  const weightGoal = weightGoalResult.data;
  const onboarding = onboardingResult.data;
  const logs = logsResult.data || [];

  if (!settings) return null;

  const monthLogs: Record<string, DailyLog> = {};
  logs.forEach((l: any) => { monthLogs[l.date] = { date: l.date, is_period: l.is_period }; });

  const phaseSettings: CycleSettings = {
      last_period_start: settings.last_period_start || '',
      cycle_length_days: settings.cycle_length_days || 28,
      period_length_days: settings.period_length_days || 5
  };

  const phaseResult = calculatePhase(new Date(), phaseSettings, monthLogs);
  const phase = phaseResult.phase || "Menstrual";
  const day = phaseResult.day || 1;

  const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];
  const blueprintContent = BLUEPRINTS[phase] || BLUEPRINTS["Menstrual"];

  const getRandom = (arr: any[], count: number) => {
      if (!arr || arr.length === 0) return [];
      return arr.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  return {
      phase,
      day,
      settings: phaseSettings,
      monthLogs,
      lifestyle: lifestyle ? {
          weight_kg: lifestyle.weight_kg,
          height_cm: lifestyle.height_cm,
          activity_level: lifestyle.activity_level,
          diet_preference: lifestyle.diet_preference,
          fitness_goal: lifestyle.fitness_goal
      } : null,
      onboarding: onboarding ? {
          goals: onboarding.goals || [],
          conditions: onboarding.conditions || []
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
          exercise: {
              summary: blueprintContent.exercise?.summary || "",
              best: blueprintContent.exercise?.best || [],
              avoid: blueprintContent.exercise?.avoid || []
          },
          supplements: blueprintContent.supplements || [],
          daily_flow: blueprintContent.daily_flow || [],
          nutrition_guide: blueprintContent.nutrition_guide || {}
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

export async function savePlanSettings(data: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    // Save to user_lifestyle
    await supabase.from("user_lifestyle").upsert({
        user_id: user.id,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        activity_level: data.activity_level,
        diet_preference: data.diet_preference,
        fitness_goal: data.fitness_goal,
        updated_at: new Date().toISOString()
    });

    // Save to user_weight_goals
    await supabase.from("user_weight_goals").upsert({
        user_id: user.id,
        current_weight_kg: data.weight_kg,
        start_weight_kg: data.weight_kg,
        target_weight_kg: data.target_weight_kg,
        weekly_rate_kg: data.weekly_rate_kg,
        start_date: new Date().toISOString()
    });

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
