"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PlanSettings = {
  height: number;
  weight: number;
  activityLevel: string;
  diet: string;
};

export async function savePlanSettings(data: PlanSettings) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("user_lifestyle")
    .upsert({
      user_id: user.id,
      height_cm: data.height,
      weight_kg: data.weight,
      activity_level: data.activityLevel,
      diet_preference: data.diet,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error saving plan settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/cycle-sync/plan");
  return { success: true };
}

export async function fetchPlanSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_lifestyle")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}