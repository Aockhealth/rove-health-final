"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BarChart2, List, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/cycle-sync/ChatWidget";

export default function CycleSyncShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/cycle-sync", icon: Home, label: "Home" },
    { href: "/cycle-sync/tracker", icon: Calendar, label: "Tracker" },
    { href: "/cycle-sync/insights", icon: BarChart2, label: "Insights" },
    { href: "/cycle-sync/plan", icon: List, label: "Plan" },
    { href: "/cycle-sync/learn", icon: BookOpen, label: "Learn" },
  ];

  return (
    <div className="min-h-dvh bg-rove-cream/20 grain-overlay">
      <main className="container relative mx-auto min-h-dvh max-w-md bg-white shadow-2xl shadow-rove-stone/5 md:my-8 md:max-w-4xl md:rounded-[3rem] pt-[env(safe-area-inset-top,0px)]">
        {children}
      </main>

      <nav
        className="fixed bottom-0 isolate left-0 right-0 z-50 px-6 pt-3 pb-[env(safe-area-inset-bottom,20px)] md:hidden"
        style={{
          backgroundColor: "rgba(250, 249, 246, 0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(45, 36, 32, 0.05)",
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
                    "rounded-full p-1.5 transition-all duration-300",
                    isActive ? "" : "bg-transparent"
                  )}
                  style={
                    isActive
                      ? { backgroundColor: "rgba(175, 107, 107, 0.08)", color: "#AF6B6B" }
                      : { color: "#A8A29E" }
                  }
                >
                  <item.icon
                    className={cn("h-6 w-6", isActive && "stroke-[2.5px]")}
                    style={isActive ? { fill: "rgba(175, 107, 107, 0.12)" } : undefined}
                  />
                </div>
                <span
                  className={cn("text-[11px] font-semibold transition-all", isActive ? "opacity-100" : "opacity-70")}
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
