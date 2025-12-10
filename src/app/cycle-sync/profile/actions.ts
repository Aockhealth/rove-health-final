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

    const { data: onboarding, error } = await supabase
        .from("user_onboarding")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }

    return {
        ...onboarding,
        goals: onboarding.primary_goal ? onboarding.primary_goal.split(", ") : [],
    };
}

export async function updateUserProfile(data: {
    tracker_mode: string;
    goals: string[];
    weight: number;
    height: number;
    activity_level: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const { data: updated, error } = await supabase
        .from("user_onboarding")
        .update({
            tracker_mode: data.tracker_mode,
            primary_goal: data.goals.join(", "),
            weight_kg: data.weight,
            height_cm: data.height,
            activity_level: data.activity_level,
        })
        .eq("user_id", user.id)
        .select();

    if (error) {
        console.error("Error updating profile:", error);
        return { error: error.message };
    }

    if (!updated || updated.length === 0) {
        return { error: "No profile found to update. Please complete onboarding first." };
    }

    revalidatePath("/cycle-sync/profile");
    return { success: true };
}
