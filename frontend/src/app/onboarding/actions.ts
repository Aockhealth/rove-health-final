"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { ONBOARDING_FLOW_VERSION } from "@/lib/onboarding/constants";
import type { OnboardingSubmissionV2 } from "@/lib/onboarding/types";

const symptomSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.enum(["Physical", "Emotional"]),
  severity: z.number().int().min(0).max(10),
});

const periodRangeSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const onboardingSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth is required"),
  goals: z.array(z.string().trim().min(1)).min(1),
  conditions: z.array(z.string().trim().min(1)).default([]),
  symptoms: z.array(symptomSchema).default([]),
  periodHistory: z.array(periodRangeSchema).default([]),
  lastPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cycleLength: z.number().int().min(15).max(90),
  periodLength: z.number().int().min(1).max(15),
  isIrregular: z.boolean(),
  trackerMode: z.enum(["menstruation", "ttc", "menopause"]).optional(),
  heightCm: z.number().min(100).max(250).nullable().optional(),
  weightKg: z.number().min(20).max(300).nullable().optional(),
  dietPreference: z.string().max(50).optional(),
  privacyConsented: z.boolean().refine((v) => v === true, "Privacy consent is required"),
});

type OnboardingActionResult = {
  ok: boolean;
  code?: string;
  message?: string;
  nextRoute?: string;
  errors?: Record<string, string>;
};

function mapZodErrors(issues: z.ZodIssue[]): Record<string, string> {
  const errorMap: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!errorMap[key]) {
      errorMap[key] = issue.message;
    }
  }
  return errorMap;
}

export async function submitOnboardingV2(
  input: OnboardingSubmissionV2
): Promise<OnboardingActionResult> {
  const parsed = onboardingSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_FAILED",
      message: "Please review the highlighted fields.",
      errors: mapZodErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Please log in and try again.",
      nextRoute: "/login",
    };
  }

  // 1. Core onboarding RPC (profile, cycle settings, period history)
  const { data: rpcData, error: rpcError } = await supabase.rpc("complete_onboarding_v2", {
    p_name: data.name,
    p_goals: data.goals,
    p_conditions: data.conditions,
    p_symptoms: data.symptoms,
    p_last_period_start: data.lastPeriodStart,
    p_cycle_length_days: data.cycleLength,
    p_period_length_days: data.periodLength,
    p_is_irregular: data.isIrregular,
    p_period_history: data.periodHistory,
  });

  if (rpcError) {
    console.error("Onboarding RPC error:", rpcError);
    return {
      ok: false,
      code: "ONBOARDING_SAVE_FAILED",
      message: "Could not save onboarding. Please try again.",
    };
  }

  // 2. Save lifestyle data (height, weight, diet) - separate upsert
  if (data.heightCm || data.weightKg || data.dietPreference) {
    await supabase.from("user_lifestyle").upsert(
      {
        user_id: user.id,
        height_cm: data.heightCm ?? null,
        weight_kg: data.weightKg ?? null,
        diet_preference: data.dietPreference || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  // 3. Save DOB to user_onboarding
  if (data.dateOfBirth) {
    await supabase
      .from("user_onboarding")
      .update({ date_of_birth: data.dateOfBirth, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }

  // 4. Update profile metadata
  await supabase
    .from("profiles")
    .update({
      onboarding_flow_version: ONBOARDING_FLOW_VERSION,
      onboarding_status: "onboarding_complete",
      onboarding_step: 4,
      onboarding_completed: true,
      privacy_consented_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      full_name: data.name,
      onboarding_completed: true,
    },
  });

  if (authUpdateError) {
    console.error("Session metadata update failed:", authUpdateError);
  }

  revalidatePath("/cycle-sync");
  revalidatePath("/", "layout");

  return {
    ok: true,
    nextRoute:
      (rpcData && typeof rpcData === "object" && "nextRoute" in rpcData
        ? (rpcData as { nextRoute?: string }).nextRoute
        : undefined) ?? "/cycle-sync",
  };
}

export async function submitOnboarding(input: OnboardingSubmissionV2) {
  const result = await submitOnboardingV2(input);
  if (!result.ok) {
    throw new Error(result.message ?? "Onboarding failed");
  }
  redirect(result.nextRoute ?? "/cycle-sync");
}
