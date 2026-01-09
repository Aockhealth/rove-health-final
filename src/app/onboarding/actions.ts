"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type SymptomEntry = {
  name: string;
  category: "Physical" | "Emotional";
  severity: number;
};

type OnboardingData = {
  name: string;
  goals: string[];
  conditions: string[];
  symptoms: SymptomEntry[];
  lastPeriod: string;
  cycleLength: number;
  periodLength: number;
  isIrregular: boolean;
};

export async function submitOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error("Auth error:", authError);
    redirect("/login");
  }

  try {
    // 1. Update Profile (Name)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
          full_name: data.name,
          onboarding_completed: true 
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      throw new Error("Failed to update profile");
    }

    // 2. Save Onboarding Details (Goals, Conditions, Symptoms)
    const { error: onboardingError } = await supabase
      .from("user_onboarding")
      .upsert({
        user_id: user.id,
        goals: data.goals,
        conditions: data.conditions,
        typical_symptoms: data.symptoms,
        updated_at: new Date().toISOString()
      });

    if (onboardingError) {
      console.error("Onboarding save error:", onboardingError);
      // Continue even if this fails - not critical
    }

    // 3. Save Cycle Stats
    const { error: cycleError } = await supabase
      .from("user_cycle_settings")
      .upsert({
        user_id: user.id,
        last_period_start: data.lastPeriod,
        cycle_length_days: data.cycleLength,
        period_length_days: data.periodLength,
        is_irregular: data.isIrregular,
        updated_at: new Date().toISOString()
      });

    if (cycleError) {
      console.error("Cycle settings error:", cycleError);
      throw new Error("Failed to save cycle settings");
    }

    revalidatePath("/cycle-sync"); 
    
    // ✅ FIXED: Redirect to Dashboard instead of Tracker
    redirect("/cycle-sync");
  } catch (error) {
    console.error("Onboarding submission error:", error);
    throw error; // Re-throw to be caught by the client
  }
}