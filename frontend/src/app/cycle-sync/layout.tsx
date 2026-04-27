import CycleSyncShell from "@/components/cycle-sync/CycleSyncShell";

export default async function CycleSyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CycleSyncShell>{children}</CycleSyncShell>;
}
