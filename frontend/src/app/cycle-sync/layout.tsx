"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BarChart2, List, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/cycle-sync/ChatWidget";

export default function CycleSyncLayout({
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
        // Profile moved to header avatar
    ];

    return (
        <div className="min-h-screen bg-rove-cream/20 pb-safe-nav md:pb-0">
            {/* Main Content */}
            <main className="container mx-auto max-w-md md:max-w-4xl min-h-screen bg-white shadow-2xl shadow-rove-stone/5 md:my-8 md:rounded-[3rem] overflow-hidden relative">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-rove-stone/10 px-6 pt-3 safe-bottom-padding md:hidden z-50">
                <div className="flex justify-between items-center max-w-md mx-auto relative group">
                    {navItems.map((item) => {
                        const isActive = item.href === '/cycle-sync'
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={item.label}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all duration-200 w-16",
                                    isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-full transition-all duration-300",
                                    isActive ? "bg-rose-50 text-rose-500" : "bg-transparent text-gray-400"
                                )}>
                                    <item.icon className={cn("w-6 h-6", isActive && "fill-rose-500/20 stroke-[2.5px]")} />
                                </div>
                                <span className={cn(
                                    "text-[11px] font-semibold transition-all",
                                    isActive ? "opacity-100 text-gray-900" : "opacity-80 text-gray-500"
                                )}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* AI Chatbot */}
            <ChatWidget />
        </div>
    );
}
