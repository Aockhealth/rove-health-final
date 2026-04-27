import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchLifecycleProfile, resolveLifecycleRedirect } from "@/lib/auth/flow-guard";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");



  // 1. (Removed previous client-side redirect logic)

  // 2. Safeguard for missing codes
  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const supabase = await createClient();

  // 3. Exchange the PKCE code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback exchange error:", error.message, error);

    // Fallback: If code exchange fails but the user is already fully authenticated,
    // we can still let them proceed to reset password.
    const { data: { session } } = await supabase.auth.getSession();
    if (session && type === "recovery") {
      return NextResponse.redirect(new URL("/reset-password", requestUrl.origin));
    }

    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", `auth_callback_failed_${encodeURIComponent(error.message)}`);
    return NextResponse.redirect(loginUrl);
  }

  // 3b. If this was a password recovery request, redirect to the reset password page
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/reset-password", requestUrl.origin));
  }

  // 4. Get the user to determine the next step in their lifecycle
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  // 5. Run Lifecycle Guard logic
  // This checks onboarding status and profile completion to determine the target route.
  const profile = await fetchLifecycleProfile(supabase, user.id);
  const routeFromGuard = resolveLifecycleRedirect({
    pathname: "/cycle-sync",
    isAuthenticated: true,
    profile,
    userId: user.id,
  });

  // 6. Final Redirect
  // Priority: Guard Logic -> 'next' param -> Default Dashboard
  const targetPath = routeFromGuard ?? next ?? "/cycle-sync";
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}