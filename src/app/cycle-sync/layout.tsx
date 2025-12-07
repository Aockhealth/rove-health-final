"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BarChart2, List, Settings } from "lucide-react";
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
    ];

    return (
        <div className="min-h-screen bg-rove-cream/20 pb-32 md:pb-0">
            {/* Main Content */}
            <main className="container mx-auto max-w-md md:max-w-4xl min-h-screen bg-white shadow-2xl shadow-rove-stone/5 md:my-8 md:rounded-[3rem] overflow-hidden relative">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-rove-stone/10 px-6 py-4 md:hidden z-50">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-colors",
                                    isActive ? "text-rove-charcoal" : "text-rove-stone/50 hover:text-rove-stone"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all",
                                    isActive && "bg-rove-charcoal/5"
                                )}>
                                    <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
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
