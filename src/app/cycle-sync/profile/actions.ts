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

    // 1. Fetch Identity/Onboarding Data
    const { data: onboarding, error: obError } = await supabase
        .from("user_onboarding")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Fetch Profile Core Data (Name)
    const { data: profileCore, error: pcError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    // 2. Fetch Lifestyle/Biometric Data
    const { data: lifestyle, error: lsError } = await supabase
        .from("user_lifestyle")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // safe fallback if records don't exist yet
    const safeOnboarding = onboarding || {};
    const safeLifestyle = lifestyle || {};

    const goals = safeOnboarding.goals && Array.isArray(safeOnboarding.goals) && safeOnboarding.goals.length > 0
        ? safeOnboarding.goals
        : (safeOnboarding.primary_goal ? safeOnboarding.primary_goal.split(", ") : []);

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
        });

    if (obError) console.error("Error updating onboarding:", obError);
    if (lsError) console.error("Error updating lifestyle:", lsError);

    if (obError || lsError) {
        return { error: "Failed to save some profile settings." };
    }

    revalidatePath("/cycle-sync/profile");
    return { success: true };
}
