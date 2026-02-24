"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Run all 3 queries in parallel for maximum speed
    const [onboardingResult, profileCoreResult, lifestyleResult] = await Promise.all([
        supabase.from("user_onboarding").select("*").eq("user_id", user.id).single(),
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("user_lifestyle").select("*").eq("user_id", user.id).single()
    ]);

    const onboarding = onboardingResult.data;
    const profileCore = profileCoreResult.data;
    const lifestyle = lifestyleResult.data;

    // safe fallback if records don't exist yet
    const safeOnboarding = onboarding || {};
    const safeLifestyle = lifestyle || {};

    const goals = safeOnboarding.goals && Array.isArray(safeOnboarding.goals) && safeOnboarding.goals.length > 0
        ? safeOnboarding.goals
        : [];

    return {
        ...safeOnboarding,
        ...safeLifestyle, // Merge lifestyle (height, weight, diet)
        full_name: profileCore?.full_name || "",
        goals,
        conditions: safeOnboarding.conditions || [],
        diet_preference: safeLifestyle.diet_preference || "non_veg",
        weight_kg: safeLifestyle.weight_kg || 0,
        height_cm: safeLifestyle.height_cm || 0,
        activity_level: safeLifestyle.activity_level || "moderate"
    };
}

export async function getHeaderProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fast query just for the name
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    // Fallback logic on server side
    const name = profile?.full_name
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split('@')[0];

    return { name };
}

export async function updateUserProfile(data: {
    tracker_mode: string;
    goals: string[];
    conditions: string[];
    weight: number;
    height: number;
    activity_level: string;
    diet_preference: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // 1. Update Identity (Onboarding table)
    const { error: obError } = await supabase
        .from("user_onboarding")
        .update({
            tracker_mode: data.tracker_mode,
            goals: data.goals,
            conditions: data.conditions,
        })
        .eq("user_id", user.id);

    // 2. Update Lifestyle (Biometrics/Diet)
    // Upsert is safer here as this record might not exist if they skipped parts of a flow
    const { error: lsError } = await supabase
        .from("user_lifestyle")
        .upsert({
            user_id: user.id,
            weight_kg: data.weight,
            height_cm: data.height,
            activity_level: data.activity_level,
            diet_preference: data.diet_preference,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (obError) console.error("Error updating onboarding:", obError);
    if (lsError) console.error("Error updating lifestyle:", lsError);

    if (obError || lsError) {
        return { error: `Failed to save: ${obError?.message || ''} ${lsError?.message || ''}` };
    }

    revalidatePath("/cycle-sync/profile");
    revalidatePath("/cycle-sync"); // Revalidate dashboard
    revalidatePath("/cycle-sync/plan"); // Revalidate plan page
    return { success: true };
}

export async function updateWeightGoals(weightData: {
    current_weight_kg: number;
    target_weight_kg: number;
    start_weight_kg?: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const updateData: any = {
        current_weight_kg: weightData.current_weight_kg,
        target_weight_kg: weightData.target_weight_kg,
        updated_at: new Date().toISOString()
    };

    if (weightData.start_weight_kg) {
        updateData.start_weight_kg = weightData.start_weight_kg;
    }

    // Update Weight Goals table
    const { error: wgError } = await supabase
        .from("user_weight_goals")
        .update(updateData)
        .eq("user_id", user.id);

    // Also sync current weight to lifestyle table for consistency
    const { error: lsError } = await supabase
        .from("user_lifestyle")
        .update({
            weight_kg: weightData.current_weight_kg,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

    if (wgError) {
        console.error("Error updating weight goals:", wgError);
        return { error: "Failed to update weight goals" };
    }

    if (lsError) {
        console.error("Error syncing lifestyle weight:", lsError);
    }

    revalidatePath("/cycle-sync/plan");
    revalidatePath("/cycle-sync/profile");
    revalidatePath("/cycle-sync");

    return { success: true };
}
