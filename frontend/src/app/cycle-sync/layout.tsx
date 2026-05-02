import CycleSyncShell from "@/components/cycle-sync/CycleSyncShell";
import { PostHogProvider, AppQueryProvider } from "@/app/providers";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { createClient } from "@/utils/supabase/server";

export default async function CycleSyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get userId on the server for user-scoped caching
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AppQueryProvider userId={user?.id}>
      <PostHogProvider>
        <CycleSyncShell>{children}</CycleSyncShell>
        <InstallPrompt />
      </PostHogProvider>
    </AppQueryProvider>
  );
}
