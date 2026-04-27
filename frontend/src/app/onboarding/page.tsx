import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OnboardingWizardV2 from "@/app/onboarding/OnboardingWizardV2";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", user.id)
    .single();

  return <OnboardingWizardV2 userId={user.id} initialStep={profile?.onboarding_step ?? 1} />;
}
