"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function submitOnboarding(data: {
    dob: string;
    height: number;
    weight: number;
    activity: string;
    goal: string;
    conditions: string[];
    diet: string[];
    lastPeriod: string;
    cycleLength: number;
    periodLength: number;
    irregular: boolean;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 0. Self-healing: Ensure Profile Exists
    // This handles cases where the signup trigger failed or user existed before the trigger.
    const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        updated_at: new Date().toISOString(),
    });

    if (profileError) {
        console.error("Profile Healing Error:", profileError);
        // Continue anyway, maybe it exists but upsert failed due to permissions? 
        // But if it fails here, the next step will likely fail too if it doesn't exist.
    }

    // 1. Save Health Metrics to user_onboarding
    const onboardingData = {
        user_id: user.id,
        date_of_birth: data.dob,
        height_cm: data.height,
        weight_kg: data.weight,
        activity_level: data.activity,
        primary_goal: data.goal,
        metabolic_conditions: data.conditions,
        dietary_preferences: data.diet,
    };

    const { error: onboardingError } = await supabase
        .from("user_onboarding")
        .upsert(onboardingData);

    if (onboardingError) {
        console.error("Onboarding Error:", onboardingError);
        throw new Error("Failed to save onboarding data: " + onboardingError.message);
    }

    // 2. Save Cycle Settings to user_cycle_settings
    const cycleData = {
        user_id: user.id,
        last_period_start: data.lastPeriod,
        cycle_length_days: data.cycleLength,
        period_length_days: data.periodLength,
        is_irregular: data.irregular,
    };

    const { error: cycleError } = await supabase
        .from("user_cycle_settings")
        .upsert(cycleData);

    if (cycleError) {
        console.error("Cycle Error:", cycleError);
        throw new Error("Failed to save cycle data: " + cycleError.message);
    }

    redirect("/cycle-sync");
}
