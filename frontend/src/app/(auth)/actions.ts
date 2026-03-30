// src/app/(auth)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchLifecycleProfile, resolveLifecycleRedirect } from "@/lib/auth/flow-guard";
import { ONBOARDING_FLOW_VERSION, PRIVACY_POLICY_VERSION } from "@/lib/onboarding/constants";
import type { ConsentRecord } from "@/lib/onboarding/types";

type ActionResult = {
  ok: boolean;
  success?: boolean;
  code?: string;
  message?: string;
  error?: string;
  nextRoute?: string;
};

/**
 * Initiates a password reset by sending a secure link to the user's email.
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const supabase = await createClient();

  // The redirectTo points to the callback route which handles the token exchange and then redirects to the reset page.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
      code: "RESET_FAILED",
      message: error.message
    };
  }

  return {
    ok: true,
    success: true,
    message: "A password reset link has been sent to your email."
  };
}

/**
 * Updates user email in Auth and phone number in the profiles table.
 */
export async function updateContactInfo(email: string, phone: string): Promise<ActionResult> {
  const supabase = await createClient();

  // 1. Update Auth Email - Supabase handles verification for the new address.
  const { error: authError } = await supabase.auth.updateUser({ email });
  if (authError) return { ok: false, error: authError.message };

  // 2. Update Phone Number in the Database profiles table.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ phone_number: phone })
      .eq("id", user.id);

    if (profileError) return { ok: false, error: profileError.message };
  }

  revalidatePath("/cycle-sync/profile");
  return {
    ok: true,
    message: "Contact info updated. Please check your new email for a confirmation link."
  };
}

export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const data = {
    email: (formData.get("email") as string)?.trim(),
    password: (formData.get("password") as string)?.trim(),
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { ok: false, error: error.message, code: "AUTH_FAILED", message: error.message };
  }

  const user = authData.user;

  let nextRoute = "/cycle-sync";
  if (user) {
    const profile = await fetchLifecycleProfile(supabase, user.id);
    const routeFromGuard = resolveLifecycleRedirect({
      pathname: "/cycle-sync",
      isAuthenticated: true,
      profile,
      userId: user.id,
    });
    nextRoute = routeFromGuard ?? nextRoute;
  }

  revalidatePath("/", "layout");
  return { ok: true, success: true, nextRoute };
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        onboarding_flow_version: ONBOARDING_FLOW_VERSION,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  });

  if (error) {
    console.error("❌ SIGNUP FAILED:", error.message);
    return { ok: false, error: error.message, code: "SIGNUP_FAILED", message: error.message };
  }

  if (!data?.session) {
    return {
      ok: false,
      error: "Check your email to verify your account.",
      code: "EMAIL_VERIFICATION_REQUIRED",
      message: "Check your email to verify your account.",
    };
  }

  if (data?.user) {
    await supabase
      .from("profiles")
      .update({
        onboarding_flow_version: ONBOARDING_FLOW_VERSION,
        onboarding_status: "onboarding_in_progress",
        onboarding_step: 1,
      })
      .eq("id", data.user.id);

    revalidatePath("/", "layout");
    return { ok: true, success: true, nextRoute: "/privacy-pledge" };
  }

  return { ok: false, error: "Signup encountered an unknown error.", code: "UNKNOWN" };
}

export async function recordPrivacyConsent(input: ConsentRecord): Promise<ActionResult> {
  if (!input.agreed) {
    return {
      ok: false,
      code: "CONSENT_REQUIRED",
      error: "You must agree to continue.",
      message: "You must agree to continue.",
    };
  }

  if (input.policyVersion !== PRIVACY_POLICY_VERSION) {
    return {
      ok: false,
      code: "POLICY_VERSION_MISMATCH",
      error: "Privacy policy version is outdated. Please refresh and try again.",
      message: "Privacy policy version is outdated. Please refresh and try again.",
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      error: "Please log in to continue.",
      message: "Please log in to continue.",
      nextRoute: "/login",
    };
  }

  const consentedAt = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      privacy_agreed_at: consentedAt,
      privacy_consented_at: consentedAt,
      privacy_policy_version: input.policyVersion,
      onboarding_status: "onboarding_in_progress",
      onboarding_step: 1,
      onboarding_flow_version: ONBOARDING_FLOW_VERSION,
      updated_at: consentedAt,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Privacy consent error:", error);
    return {
      ok: false,
      code: "CONSENT_PERSIST_FAILED",
      error: "Could not save your consent. Please try again.",
      message: "Could not save your consent. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    success: true,
    nextRoute: "/onboarding",
  };
}

export async function acceptPrivacyPolicy() {
  const result = await recordPrivacyConsent({
    agreed: true,
    policyVersion: PRIVACY_POLICY_VERSION,
  });

  if (!result.ok) {
    throw new Error(result.error ?? "Failed to record privacy consent.");
  }

  redirect(result.nextRoute ?? "/onboarding");
}