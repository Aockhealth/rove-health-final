import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchLifecycleProfile, resolveLifecycleRedirect } from "@/lib/auth/flow-guard";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");

  if (type === "recovery" && code) {
    const resetUrl = new URL("/reset-password", requestUrl.origin);
    resetUrl.searchParams.set("code", code);
    return NextResponse.redirect(resetUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const profile = await fetchLifecycleProfile(supabase, user.id);
  const routeFromGuard = resolveLifecycleRedirect({
    pathname: "/cycle-sync",
    isAuthenticated: true,
    profile,
    userId: user.id,
  });

  const targetPath = routeFromGuard ?? next ?? "/cycle-sync";
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}
