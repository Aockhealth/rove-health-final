"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, Calendar, BarChart2, List, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/cycle-sync/ChatWidget";
import { useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/app/providers";

export default function CycleSyncShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const userId = useUserId();

  // Prefetch sibling tabs in the background so they are instant
  useEffect(() => {
    // Only prefetch when on the dashboard (initial landing tab)
    if (pathname !== "/cycle-sync" || !userId) return;

    const staleTime = 5 * 60 * 1000;

    // Prefetch articles (public, cheap)
    queryClient.prefetchQuery({
      queryKey: ['articles'],
      queryFn: async () => {
        const res = await fetch('/api/learn');
        return await res.json().catch(() => []);
      },
      staleTime,
    });

    // Prefetch insights
    queryClient.prefetchQuery({
      queryKey: ['insights', userId],
      queryFn: async () => {
        const { fetchInsightsData } = await import("@backend/actions/cycle-sync/insights/insights-cycle-sync");
        return await fetchInsightsData();
      },
      staleTime,
    });

    // Prefetch tracker summary
    queryClient.prefetchQuery({
      queryKey: ['trackerData', userId],
      queryFn: async () => {
        const { fetchTrackerPageDataFast } = await import("@/app/actions/cycle-sync");
        return await fetchTrackerPageDataFast();
      },
      staleTime,
    });

    // Prefetch plan
    queryClient.prefetchQuery({
      queryKey: ['plan', userId],
      queryFn: async () => {
        const { fetchPlanPageDataFast } = await import("@/app/actions/cycle-sync");
        return await fetchPlanPageDataFast();
      },
      staleTime,
    });
  }, [pathname, queryClient, userId]);

  const navItems = [
    { href: "/cycle-sync", icon: Home, label: "Home" },
    { href: "/cycle-sync/tracker", icon: Calendar, label: "Tracker" },
    { href: "/cycle-sync/insights", icon: BarChart2, label: "Insights" },
    { href: "/cycle-sync/plan", icon: List, label: "Plan" },
    { href: "/cycle-sync/learn", icon: BookOpen, label: "Learn" },
  ];

  return (
    <div className="min-h-screen bg-rove-cream/20 pb-safe-nav md:pb-0">
      <main className="container relative mx-auto min-h-screen max-w-md overflow-hidden bg-white shadow-2xl shadow-rove-stone/5 md:my-8 md:max-w-4xl md:rounded-[3rem]">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-2 safe-bottom-padding md:hidden"
        style={{
          backgroundColor: "rgba(250, 249, 246, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(45, 36, 32, 0.06)",
        }}
      >
        <div className="relative mx-auto flex max-w-md items-center justify-between">
          {navItems.map((item) => {
            const isActive = item.href === "/cycle-sync" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "flex w-16 flex-col items-center gap-1 transition-all duration-200",
                  isActive ? "text-rove-charcoal" : "hover:text-rove-charcoal/60"
                )}
                style={!isActive ? { color: "#A8A29E" } : undefined}
              >
                <div
                  className={cn(
                    "rounded-full p-1 transition-all duration-300",
                    isActive ? "" : "bg-transparent"
                  )}
                  style={
                    isActive
                      ? { backgroundColor: "rgba(175, 107, 107, 0.08)", color: "#AF6B6B" }
                      : { color: "#A8A29E" }
                  }
                >
                  <item.icon
                    className={cn("h-5 w-5", isActive && "stroke-[2.5px]")}
                    style={isActive ? { fill: "rgba(175, 107, 107, 0.12)" } : undefined}
                  />
                </div>
                <span
                  className={cn("text-[10px] font-semibold transition-all", isActive ? "opacity-100" : "opacity-70")}
                  style={{ color: isActive ? "#2D2420" : "#A8A29E" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ChatWidget />
    </div>
  );
}
