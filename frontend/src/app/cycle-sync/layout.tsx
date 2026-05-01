import CycleSyncShell from "@/components/cycle-sync/CycleSyncShell";
import { PostHogProvider } from "@/app/providers";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default async function CycleSyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      <CycleSyncShell>{children}</CycleSyncShell>
      <InstallPrompt />
    </PostHogProvider>
  );
}
