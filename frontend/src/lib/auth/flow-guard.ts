import type { OnboardingStatus } from "@/lib/onboarding/types";

const AUTH_ROUTES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

const PROTECTED_PREFIXES = ["/cycle-sync", "/onboarding", "/privacy-pledge", "/api/protected"];

type LifecycleProfileRow = {
  id?: string;
  privacy_consented_at?: string | null;
  privacy_agreed_at?: string | null;
  privacy_policy_version?: string | null;
  onboarding_status?: string | null;
  onboarding_step?: number | null;
  onboarding_completed?: boolean | null;
  onboarding_flow_version?: string | null;
};

export type FlowLifecycleProfile = LifecycleProfileRow;

type ProfileSelectResult = Promise<{
  data: FlowLifecycleProfile | null;
  error: { message?: string } | null;
}>;

type SupabaseProfilesClient = {
  from: (table: "profiles") => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => any;
      };
    };
  };
};

export type ResolveFlowInput = {
  pathname: string;
  isAuthenticated: boolean;
  profile: FlowLifecycleProfile | null;
  userId?: string | null;
};

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname) || pathname.startsWith("/auth/callback");
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function hashToPercent(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

function inRolloutCohort(userId: string | null | undefined): boolean {
  if (!userId) return true;
  const rawPercent = process.env.ONBOARDING_V2_ROLLOUT_PERCENT ?? "100";
  const rolloutPercent = Number(rawPercent);
  if (Number.isNaN(rolloutPercent) || rolloutPercent >= 100) return true;
  if (rolloutPercent <= 0) return false;
  return hashToPercent(userId) < rolloutPercent;
}

export function shouldUseOnboardingV2(
  profile: FlowLifecycleProfile | null,
  userId?: string | null
): boolean {
  const explicitVersion = profile?.onboarding_flow_version;
  if (explicitVersion === "v2") return true;
  if (explicitVersion === "v1") return false;
  return inRolloutCohort(userId);
}

export function normalizeOnboardingStatus(
  profile: FlowLifecycleProfile | null
): OnboardingStatus {
  const status = profile?.onboarding_status;
  if (
    status === "privacy_pending" ||
    status === "onboarding_in_progress" ||
    status === "onboarding_complete"
  ) {
    return status;
  }

  const hasConsent = Boolean(profile?.privacy_consented_at || profile?.privacy_agreed_at);
  if (profile?.onboarding_completed) return "onboarding_complete";
  return hasConsent ? "onboarding_in_progress" : "privacy_pending";
}

export async function fetchLifecycleProfile(
  supabase: any,
  userId: string
): Promise<FlowLifecycleProfile | null> {
  const primary = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "privacy_consented_at",
        "privacy_agreed_at",
        "privacy_policy_version",
        "onboarding_status",
        "onboarding_step",
        "onboarding_completed",
        "onboarding_flow_version",
      ].join(",")
    )
    .eq("id", userId)
    .maybeSingle();

  if (!primary.error) return primary.data ?? null;

  const legacy = await supabase
    .from("profiles")
    .select("id,privacy_agreed_at,onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (legacy.error) return null;
  return legacy.data ?? null;
}

export function resolveLifecycleRedirect({
  pathname,
  isAuthenticated,
  profile,
  userId,
}: ResolveFlowInput): string | null {
  if (!isAuthenticated) {
    if (isProtectedRoute(pathname)) return "/login";
    return null;
  }

  const useV2 = shouldUseOnboardingV2(profile, userId);
  if (!useV2) {
    return isAuthRoute(pathname) ? "/cycle-sync" : null;
  }

  const status = normalizeOnboardingStatus(profile);

  if (status === "privacy_pending") {
    if (!pathname.startsWith("/privacy-pledge")) return "/privacy-pledge";
    return null;
  }

  if (status === "onboarding_in_progress") {
    if (!pathname.startsWith("/onboarding")) return "/onboarding";
    return null;
  }

  if (
    isAuthRoute(pathname) ||
    pathname.startsWith("/privacy-pledge") ||
    pathname.startsWith("/onboarding")
  ) {
    return "/cycle-sync";
  }

  return null;
}
