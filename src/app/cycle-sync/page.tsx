"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, ChevronRight, Droplets, Zap, Moon, Sun, ArrowRight, Sparkles, TrendingUp, Brain, Activity, Utensils, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchDashboardData } from "@/app/actions/cycle-sync";
import Link from "next/link";

function RiverTrack({ items, direction = "left", speed = 20, label }: { items: any[], direction?: "left" | "right", speed?: number, label: string }) {
    // Duplicate items for seamless loop
    const riverItems = [...items, ...items, ...items, ...items];

    return (
        <div className="w-full overflow-hidden">
            <div className="px-4 md:px-8 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/70">{label}</span>
            </div>
            <motion.div
                className="flex gap-3 w-max will-change-transform"
                initial={{ x: direction === "left" ? 0 : "-50%" }}
                animate={{ x: direction === "left" ? "-50%" : 0 }}
                transition={{
                    duration: speed,
                    ease: "linear",
                    repeat: Infinity
                }}
                style={{ backfaceVisibility: "hidden", WebkitFontSmoothing: "antialiased" }}
            >
                {riverItems.map((item, i) => (
                    <div key={i} className="w-auto min-w-[180px] flex-shrink-0 p-2.5 rounded-[1.25rem] bg-white/40 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-3 hover:bg-white/60 transition-colors cursor-pointer group transform-gpu">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", item.bg || "bg-white", item.color)}>
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="font-heading text-sm text-rove-charcoal leading-tight whitespace-nowrap">{item.title}</h4>
                            <p className="text-rove-stone text-[9px] whitespace-nowrap">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

// Icon mapping helper
const iconMap: Record<string, any> = {
    "Moon": Moon,
    "Sparkles": Sparkles,
    "Brain": Brain,
    "Utensils": Utensils,
    "Activity": Activity,
    "Leaf": Droplets,
    "Dumbbell": Dumbbell,
    "Zap": Zap,
    "Sun": Sun,
    "TrendingUp": TrendingUp,
    "Heart": Heart,
    "Wind": Wind
};
import { Heart, Wind } from "lucide-react"; // Add missing imports

function DailyFlowRiver({ data }: { data: any }) {

    const mapItems = (items: any[], colorClass: string, bgClass: string) =>
        (items || []).map(item => ({
            ...item,
            icon: iconMap[item.icon] || Sparkles,
            color: colorClass,
            bg: bgClass
        }));

    const insights = mapItems(data?.insights, "text-rove-charcoal", "bg-white");
    const fuel = mapItems(data?.fuel, "text-rove-green", "bg-rove-green/10");
    const move = mapItems(data?.move, "text-rove-red", "bg-rove-red/10");

    if (!data) return <div className="p-4 text-center text-rove-stone text-xs">Loading flow...</div>;

    return (
        <div className="space-y-2 -mx-4 md:-mx-8">
            <RiverTrack label="Daily Insights" items={insights} direction="left" speed={35} />
            <RiverTrack label="Recommended Fuel" items={fuel} direction="right" speed={40} />
            <RiverTrack label="Movement Plan" items={move} direction="left" speed={38} />
        </div>
    );
}

// Phase Theme Logic - Refined for Subtlety
const phaseThemes: Record<string, any> = {
    "Menstrual": {
        color: "text-rose-500", // Soft Rose
        blob: "bg-rose-200/20",
        orbRing: "from-rose-300 via-rose-100 to-rose-400",
        glow: "shadow-[0_0_40px_rgba(251,113,133,0.2)]", // Soft pink glow
        badge: "bg-rose-50 text-rose-600 border-rose-100"
    },
    "Follicular": {
        color: "text-teal-600", // Muted Teal
        blob: "bg-teal-200/15", // Very subtle mint
        orbRing: "from-teal-300 via-emerald-100 to-teal-400",
        glow: "shadow-[0_0_40px_rgba(45,212,191,0.2)]", // Mint glow
        badge: "bg-teal-50 text-teal-700 border-teal-100"
    },
    "Ovulatory": {
        color: "text-amber-500/90", // Chanpagne Gold
        blob: "bg-amber-100/30",
        orbRing: "from-amber-300 via-yellow-100 to-amber-400",
        glow: "shadow-[0_0_40px_rgba(251,191,36,0.25)]", // Golden hour glow
        badge: "bg-amber-50 text-amber-700 border-amber-100"
    },
    "Luteal": {
        color: "text-indigo-500", // Soft Periwinkle
        blob: "bg-indigo-200/15",
        orbRing: "from-indigo-300 via-blue-100 to-indigo-400",
        glow: "shadow-[0_0_40px_rgba(129,140,248,0.2)]", // Lavender glow
        badge: "bg-indigo-50 text-indigo-600 border-indigo-100"
    }
};

export default function CycleSyncDashboard() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const res = await fetchDashboardData();
            if (res) {
                setData(res);
            } else {
                // If no data, redirect or show empty state. 
                // For now, let's just stay here to avoid loops, or redirect to onboarding.
                window.location.href = "/onboarding";
            }
        }
        load();
    }, []);

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-rove-red/20 border-t-rove-red animate-spin" />
                <p className="text-rove-stone font-medium">Syncing with your cycle...</p>
            </div>
        </div>
    );

    const { user, phase: currentPhase } = data;
    const theme = phaseThemes[currentPhase.name] || phaseThemes["Follicular"];

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20 pt-4 md:pt-20">
            {/* Immersive Background Gradient - Dynamic */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${theme.blob} rounded-full blur-[80px] animate-pulse will-change-[opacity]`} style={{ animationDuration: "10s" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rove-charcoal/5 rounded-full blur-[80px] animate-pulse will-change-[opacity]" style={{ animationDuration: "15s" }} />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-white rounded-full blur-[60px] opacity-60" />
            </div>

            <div className="relative z-10 p-4 md:p-8 space-y-2 md:space-y-8 pb-32">
                {/* Header */}
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="font-heading text-2xl md:text-4xl text-rove-charcoal mb-1">Good Morning, {user?.name || "Rove Member"}</h1>
                        <p className="text-rove-stone font-light text-base md:text-lg">It's Day {currentPhase.day} of your cycle.</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/50 transition-colors">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur-md text-rove-charcoal border border-white/50 flex items-center justify-center font-heading text-base md:text-lg shadow-sm">
                            {(user?.name || "R")[0]}
                        </div>
                    </Button>
                </header>

                {/* Hero Phase Orb */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative flex flex-col items-center justify-center py-1 md:py-6"
                >
                    {/* Glowing Orb Container */}
                    <div className="relative w-56 h-56 md:w-[300px] md:h-[300px] flex items-center justify-center">
                        {/* Outer Glow */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${theme.blob.replace("bg-", "from-")} to-transparent blur-3xl animate-pulse will-change-[opacity]`} />

                        {/* Phase Indicator - Animated Orb */}
                        <motion.div
                            className="relative w-48 h-48 md:w-72 md:h-72 flex items-center justify-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {/* Rotating Gradient Ring */}
                            <motion.div
                                className={`absolute inset-0 rounded-full border-[6px] border-transparent bg-gradient-to-r ${theme.orbRing} bg-clip-border [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]`}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                style={{ willChange: "transform" }}
                            />

                            {/* Static Background Circle */}
                            <div className={`absolute inset-2 rounded-full bg-white/80 backdrop-blur-3xl ${theme.glow}`} />

                            {/* Pulsing Glow Effect */}
                            <motion.div
                                className={`absolute inset-0 rounded-full ${theme.blob} blur-3xl -z-10`}
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Content */}
                            <div className="relative text-center z-10">
                                <motion.p
                                    className="text-[9px] md:text-xs font-bold tracking-[0.2em] text-rove-stone uppercase mb-1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Current Phase
                                </motion.p>
                                <motion.h2
                                    className={`text-2xl md:text-5xl font-heading ${theme.color} mb-2`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {currentPhase.name}
                                </motion.h2>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Badge variant="secondary" className={`${theme.badge} px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs tracking-wider transition-colors duration-500`}>
                                        <Sparkles className="w-3 h-3 mr-2 inline-block" />
                                        {currentPhase.superpower}
                                    </Badge>
                                </motion.div>
                            </div>

                            {/* Day Indicator - Pinned Top */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full px-3 py-1 border border-rove-stone/10"
                            >
                                <span className="text-xs font-bold text-rove-charcoal whitespace-nowrap">Day {currentPhase.day}</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Daily Flow Animation - Moved Up */}
                <section className="relative">
                    <h3 className="font-heading text-xl md:text-2xl text-rove-charcoal mb-2 px-2">Daily Flow</h3>
                    <DailyFlowRiver data={data} />
                </section>

                {/* Glassmorphism Cards - Moved Down */}
                <section>
                    <div className="flex justify-between items-baseline mb-4">
                        <h3 className="font-heading text-xl md:text-2xl text-rove-charcoal">Today's Snapshot</h3>
                        <Button variant="link" className="text-rove-stone hover:text-rove-charcoal transition-colors">View Full Plan</Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        {/* Hormone Status */}
                        <div className="group p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-1.5 md:p-2 bg-white rounded-xl shadow-sm text-rove-red">
                                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-0.5 rounded-full mb-1 inline-block">Hormones</span>
                                <p className="text-sm md:text-base font-heading text-rove-charcoal leading-tight mb-0.5">Estrogen Rising</p>
                                <p className="text-[9px] md:text-[10px] text-rove-stone leading-snug line-clamp-2">Social skills are peaking today.</p>
                            </div>
                        </div>

                        {/* Focus */}
                        <div className="group p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-1.5 md:p-2 bg-white rounded-xl shadow-sm text-rove-charcoal">
                                    <Brain className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-0.5 rounded-full mb-1 inline-block">Mind</span>
                                <p className="text-sm md:text-base font-heading text-rove-charcoal leading-tight mb-0.5">Deep Focus</p>
                                <p className="text-[9px] md:text-[10px] text-rove-stone leading-snug line-clamp-2">Perfect for complex tasks.</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="group p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-1.5 md:p-2 bg-white rounded-xl shadow-sm text-rove-green">
                                    <Activity className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-0.5 rounded-full mb-1 inline-block">Body</span>
                                <p className="text-sm md:text-base font-heading text-rove-charcoal leading-tight mb-0.5">High Recovery</p>
                                <p className="text-[9px] md:text-[10px] text-rove-stone leading-snug line-clamp-2">Push your limits in the gym.</p>
                            </div>
                        </div>

                        {/* Skin */}
                        <div className="group p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-1.5 md:p-2 bg-white rounded-xl shadow-sm text-amber-500">
                                    <Sun className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-0.5 rounded-full mb-1 inline-block">Glow</span>
                                <p className="text-sm md:text-base font-heading text-rove-charcoal leading-tight mb-0.5">Radiance Peak</p>
                                <p className="text-[9px] md:text-[10px] text-rove-stone leading-snug line-clamp-2">Collagen levels are optimal.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <h3 className="font-heading text-xl md:text-2xl text-rove-charcoal mb-4">Quick Actions</h3>
                    <div className="space-y-4">
                        <Link href="/cycle-sync/tracker">
                            <button className="w-full flex items-center justify-between p-1 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm group transition-all hover:scale-[1.01]">
                                <div className="flex items-center gap-5 pl-5 py-4">
                                    <div className="w-12 h-12 rounded-full bg-rove-charcoal text-white flex items-center justify-center shadow-lg shadow-rove-charcoal/20">
                                        <Droplets className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-heading text-lg text-rove-charcoal">Log Symptoms</p>
                                        <p className="text-rove-stone text-sm">Track your daily rhythm</p>
                                    </div>
                                </div>
                                <div className="pr-6">
                                    <div className="w-10 h-10 rounded-full bg-white text-rove-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-sm">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
