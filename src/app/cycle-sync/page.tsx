"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, ChevronRight, Droplets, Zap, Moon, Sun, ArrowRight, Sparkles, TrendingUp, Brain, Activity, Utensils, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", item.bg, item.color)}>
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

function DailyFlowRiver() {
    const insights = [
        { icon: Sparkles, title: "Creativity Peaking", desc: "Great for brainstorming", color: "text-rove-charcoal", bg: "bg-white" },
        { icon: TrendingUp, title: "Social Battery High", desc: "Connect with friends", color: "text-rove-charcoal", bg: "bg-white" },
        { icon: Brain, title: "Sharp Focus", desc: "Tackle complex tasks", color: "text-rove-charcoal", bg: "bg-white" },
    ];

    const fuel = [
        { icon: Utensils, title: "Salmon Bowl", desc: "Omega-3s", color: "text-rove-red", bg: "bg-rove-red/10" },
        { icon: Utensils, title: "Avocado Toast", desc: "Healthy Fats", color: "text-rove-green", bg: "bg-rove-green/10" },
        { icon: Utensils, title: "Leafy Greens", desc: "Iron Boost", color: "text-rove-green", bg: "bg-rove-green/10" },
        { icon: Utensils, title: "Dark Chocolate", desc: "Magnesium", color: "text-rove-charcoal", bg: "bg-rove-charcoal/10" },
    ];

    const move = [
        { icon: Dumbbell, title: "HIIT Session", desc: "High Energy", color: "text-rove-charcoal", bg: "bg-rove-charcoal/10" },
        { icon: Activity, title: "Power Yoga", desc: "Strength", color: "text-rove-charcoal", bg: "bg-rove-charcoal/10" },
        { icon: Activity, title: "Spin Class", desc: "Cardio", color: "text-rove-charcoal", bg: "bg-rove-charcoal/10" },
        { icon: Dumbbell, title: "Boxing", desc: "Coordination", color: "text-rove-charcoal", bg: "bg-rove-charcoal/10" },
    ];

    return (
        <div className="space-y-2 -mx-4 md:-mx-8">
            <RiverTrack label="Daily Insights" items={insights} direction="left" speed={35} />
            <RiverTrack label="Recommended Fuel" items={fuel} direction="right" speed={40} />
            <RiverTrack label="Movement Plan" items={move} direction="left" speed={38} />
        </div>
    );
}

export default function CycleSyncDashboard() {
    // Mock data
    const currentPhase = {
        name: "Follicular",
        day: 8,
        totalDays: 28,
        superpower: "Creativity",
        description: "Estrogen is rising. You feel lighter, sharper, and ready to take on complex tasks."
    };

    // Circular Progress Calculation
    const radius = 120;
    const stroke = 3;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (currentPhase.day / currentPhase.totalDays) * circumference;

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20">
            {/* Immersive Background Gradient - Optimized */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rove-red/10 rounded-full blur-[80px] animate-pulse will-change-[opacity]" style={{ animationDuration: "10s" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rove-charcoal/5 rounded-full blur-[80px] animate-pulse will-change-[opacity]" style={{ animationDuration: "15s" }} />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-white rounded-full blur-[60px] opacity-60" />
            </div>

            <div className="relative z-10 p-4 md:p-8 space-y-8 pb-32">
                {/* Header */}
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="font-heading text-4xl text-rove-charcoal mb-1">Good Morning, Sarah</h1>
                        <p className="text-rove-stone font-light text-lg">It's Day {currentPhase.day} of your cycle.</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-rove-charcoal border border-white/50 flex items-center justify-center font-heading text-lg shadow-sm">S</div>
                    </Button>
                </header>

                {/* Hero Phase Orb */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative flex flex-col items-center justify-center py-6"
                >
                    {/* Glowing Orb Container */}
                    <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rove-red/20 to-transparent blur-3xl animate-pulse will-change-[opacity]" />

                        {/* Phase Indicator - Animated Orb */}
                        <motion.div
                            className="relative w-72 h-72 flex items-center justify-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {/* Rotating Gradient Ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-[6px] border-transparent bg-gradient-to-r from-rove-red via-rove-red/20 to-rove-red/50 bg-clip-border [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                style={{ willChange: "transform" }}
                            />

                            {/* Static Background Circle */}
                            <div className="absolute inset-2 rounded-full bg-white/80 backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.8)]" />

                            {/* Pulsing Glow Effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-rove-red/5 blur-3xl -z-10"
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Content */}
                            <div className="relative text-center z-10">
                                <motion.p
                                    className="text-xs font-bold tracking-[0.2em] text-rove-stone uppercase mb-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Current Phase
                                </motion.p>
                                <motion.h2
                                    className="text-5xl font-heading text-rove-charcoal mb-3"
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
                                    <Badge variant="secondary" className="bg-rove-red/10 text-rove-red border-rove-red/20 px-4 py-1.5 text-xs tracking-wider">
                                        <Sparkles className="w-3 h-3 mr-2 inline-block" />
                                        {currentPhase.superpower}
                                    </Badge>
                                </motion.div>
                            </div>

                            {/* Day Indicator - Orbiting */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full px-3 py-1 border border-rove-stone/10"
                                animate={{ rotate: -360 }} // Counter-rotate to keep text upright if attached to ring, or just position absolutely
                                style={{ originY: "144px" }} // Orbit radius
                            >
                                <span className="text-xs font-bold text-rove-charcoal whitespace-nowrap">Day {currentPhase.day}</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Glassmorphism Cards */}
                <section>
                    <div className="flex justify-between items-baseline mb-6">
                        <h3 className="font-heading text-2xl text-rove-charcoal">Today's Snapshot</h3>
                        <Button variant="link" className="text-rove-stone hover:text-rove-charcoal transition-colors">View Full Plan</Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {/* Hormone Status */}
                        <div className="group p-4 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-rove-red">
                                    <TrendingUp className="w-5 h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-1 rounded-full mb-2 inline-block">Hormones</span>
                                <p className="text-base font-heading text-rove-charcoal leading-tight mb-1">Estrogen Rising</p>
                                <p className="text-[10px] text-rove-stone leading-snug line-clamp-2">Social skills are peaking today.</p>
                            </div>
                        </div>

                        {/* Focus */}
                        <div className="group p-4 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-rove-charcoal">
                                    <Brain className="w-5 h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-1 rounded-full mb-2 inline-block">Mind</span>
                                <p className="text-base font-heading text-rove-charcoal leading-tight mb-1">Deep Focus</p>
                                <p className="text-[10px] text-rove-stone leading-snug line-clamp-2">Perfect for complex tasks.</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="group p-4 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-rove-green">
                                    <Activity className="w-5 h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-1 rounded-full mb-2 inline-block">Body</span>
                                <p className="text-base font-heading text-rove-charcoal leading-tight mb-1">High Recovery</p>
                                <p className="text-[10px] text-rove-stone leading-snug line-clamp-2">Push your limits in the gym.</p>
                            </div>
                        </div>

                        {/* Skin - New 4th Card */}
                        <div className="group p-4 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer aspect-square flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                                    <Sun className="w-5 h-5 stroke-2" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone bg-white/50 px-2 py-1 rounded-full mb-2 inline-block">Glow</span>
                                <p className="text-base font-heading text-rove-charcoal leading-tight mb-1">Radiance Peak</p>
                                <p className="text-[10px] text-rove-stone leading-snug line-clamp-2">Collagen levels are optimal.</p>
                            </div>
                        </div>
                    </div>

                </section>

                {/* Daily Flow Animation */}
                <section className="relative">
                    <h3 className="font-heading text-2xl text-rove-charcoal mb-4 px-2">Daily Flow</h3>
                    <DailyFlowRiver />
                </section>

                {/* Quick Actions */}
                <section>
                    <h3 className="font-heading text-2xl text-rove-charcoal mb-6">Quick Actions</h3>
                    <div className="space-y-4">
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
                    </div>
                </section>
            </div>
        </div>
    );
}
