"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculatePhase, type CycleSettings, type DailyLog } from "@shared/cycle/phase";

const LOG_WINDOW_DAYS = 90;

// ============================================
// BUNDLED PROFILE PAGE DATA (Phase 1: Performance)
// Single auth call, 5 parallel DB queries
// ============================================

export async function fetchProfilePageData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

    // ⚡ ALL 5 queries in ONE parallel trip
    const [
        profileResult,
        onboardingResult,
        lifestyleResult,
        cycleSettingsResult,
        logsResult
    ] = await Promise.all([
        supabase.from("profiles").select("full_name, phone_number").eq("id", user.id).single(),
        supabase.from("user_onboarding").select("tracker_mode, goals, conditions").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_lifestyle").select("weight_kg, height_cm, activity_level, diet_preference").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_cycle_settings").select("last_period_start, cycle_length_days, period_length_days, is_irregular").eq("user_id", user.id).maybeSingle(),
        supabase.from("daily_logs").select("date, is_period").eq("user_id", user.id).gte("date", pastDate.toISOString().split("T")[0])
    ]);

    const profile = profileResult.data;
    const onboarding = onboardingResult.data;
    const lifestyle = lifestyleResult.data;
    const cycleSettings = cycleSettingsResult.data;
    const logs = logsResult.data || [];

    // Build log map for smart phase calculation
    const monthLogs: Record<string, DailyLog> = {};
    logs.forEach((l: any) => { monthLogs[l.date] = { date: l.date, is_period: l.is_period }; });

    // Calculate phase
    let smartPhase = "Menstrual";
    if (cycleSettings?.last_period_start) {
        const settings: CycleSettings = {
            last_period_start: cycleSettings.last_period_start,
            cycle_length_days: cycleSettings.cycle_length_days || 28,
            period_length_days: cycleSettings.period_length_days || 5,
        };
        const result = calculatePhase(new Date(), settings, monthLogs);
        smartPhase = result.phase || "Menstrual";
    }

    return {
        user: { id: user.id, email: user.email || "" },
        formData: {
            full_name: profile?.full_name || "",
            tracker_mode: onboarding?.tracker_mode || "menstruation",
            goals: Array.isArray(onboarding?.goals) ? onboarding.goals : [],
            conditions: Array.isArray(onboarding?.conditions) ? onboarding.conditions : [],
            weight: lifestyle?.weight_kg || 0,
            height: lifestyle?.height_cm || 0,
            activity_level: lifestyle?.activity_level || "moderate",
            diet_preference: lifestyle?.diet_preference || "non_veg",
            is_irregular: cycleSettings?.is_irregular || false,
            phone_number: profile?.phone_number || "",
        },
        cycleData: {
            last_period_start: cycleSettings?.last_period_start || "",
            cycle_length_days: cycleSettings?.cycle_length_days || 28,
            period_length_days: cycleSettings?.period_length_days || 5,
        },
        smartPhase,
    };
}

// ============================================
// DELETE USER ACCOUNT (Phase 4: Real Implementation)
// Hard deletes all user data from every table
// ============================================

export async function deleteUserAccount(): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const userId = user.id;

    // Delete from all data tables in parallel
    const deletions = await Promise.all([
        supabase.from("daily_logs").delete().eq("user_id", userId),
        supabase.from("user_onboarding").delete().eq("user_id", userId),
        supabase.from("user_lifestyle").delete().eq("user_id", userId),
        supabase.from("user_weight_goals").delete().eq("user_id", userId),
        supabase.from("user_cycle_settings").delete().eq("user_id", userId),
        supabase.from("ai_cache_keys").delete().eq("user_id", userId),
        supabase.from("onboarding_events").delete().eq("user_id", userId),
    ]);

    // Check for errors in any deletion
    const errors = deletions.filter(d => d.error).map(d => d.error?.message);
    if (errors.length > 0) {
        console.error("[deleteUserAccount] Partial deletion errors:", errors);
    }

    // Delete the profiles row (this is the core identity)
    await supabase.from("profiles").delete().eq("id", userId);

    // Sign the user out
    await supabase.auth.signOut();

    return { success: true };
}

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
    full_name?: string;
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

    // 0. Update Core Profile (Name)
    let profileError = null;
    if (data.full_name !== undefined) {
        const { error: pError } = await supabase
            .from("profiles")
            .update({ full_name: data.full_name })
            .eq("id", user.id);
        profileError = pError;
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

    if (profileError) console.error("Error updating profile name:", profileError);
    if (obError) console.error("Error updating onboarding:", obError);
    if (lsError) console.error("Error updating lifestyle:", lsError);

    if (profileError || obError || lsError) {
        return { error: `Failed to save: ${profileError?.message || ''} ${obError?.message || ''} ${lsError?.message || ''}` };
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
