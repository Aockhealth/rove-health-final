"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PlanSettings = {
  height?: number;
  weight: number;
  activityLevel?: string;
  diet?: string;
  fitnessGoal?: string;
  targetWeight?: number;
  weeklyRate?: number;
};

export async function savePlanSettings(data: PlanSettings) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Save to user_lifestyle
  const { error: lifestyleError } = await supabase
    .from("user_lifestyle")
    .upsert({
      user_id: user.id,
      height_cm: data.height,
      weight_kg: data.weight,
      activity_level: data.activityLevel,
      diet_preference: data.diet,
      fitness_goal: data.fitnessGoal,
      updated_at: new Date().toISOString(),
    });

  if (lifestyleError) {
    console.error("Error saving lifestyle settings:", lifestyleError);
    return { success: false, error: lifestyleError.message };
  }

  // Save weight goal if applicable
  if (data.fitnessGoal === "weight_loss" && data.targetWeight) {
    const { error: weightError } = await supabase
      .from("user_weight_goals")
      .upsert({
        user_id: user.id,
        current_weight_kg: data.weight,
        target_weight_kg: data.targetWeight,
        weekly_rate_kg: data.weeklyRate || 0.4,
        start_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      });

    if (weightError) {
      console.error("Error saving weight goals:", weightError);
      // Don't fail completely, lifestyle was saved
    }
  }

  revalidatePath("/cycle-sync/plan");
  return { success: true };
}

export async function fetchPlanSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [lifestyleResult, weightGoalResult] = await Promise.all([
    supabase.from("user_lifestyle").select("*").eq("user_id", user.id).single(),
    supabase.from("user_weight_goals").select("*").eq("user_id", user.id).maybeSingle()
  ]);

  const lifestyle = lifestyleResult.data;

  // 🔥 VALIDATION: If core metrics are missing, return null to force onboarding
  if (!lifestyle || !lifestyle.weight_kg || !lifestyle.height_cm) {
    return null;
  }

  return {
    ...lifestyle,
    weightGoal: weightGoalResult.data
  };
}