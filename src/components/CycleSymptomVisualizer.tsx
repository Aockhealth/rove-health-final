
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Zap, Droplets, Moon, Sun, Brain, Activity, Battery, Sparkles, TrendingUp, Heart, ArrowRight, ChevronRight, BarChart3 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

// Phase Data
const phases = [
    {
        id: "menstrual",
        name: "Menstrual Phase",
        days: "Days 1-5",
        tagline: "The Reset",
        color: "text-rove-red",
        bg: "bg-rove-red",
        lightBg: "bg-rove-red/5",
        border: "border-rove-red/20",
        description: "Your hormones are at their lowest levels. It's a time of release and reflection.",
        superpower: "Intuition",
        symptoms: [
            { name: "Cramps", icon: Activity, detail: "Uterine contractions" },
            { name: "Low Energy", icon: Battery, detail: "Hormone drop" },
            { name: "Brain Fog", icon: Brain, detail: "Reduced focus" },
        ],
        hormones: { estrogen: 10, progesterone: 5, testosterone: 10 }
    },
    {
        id: "follicular",
        name: "Follicular Phase",
        days: "Days 6-16",
        tagline: "The Rise",
        color: "text-rove-charcoal",
        bg: "bg-rove-charcoal",
        lightBg: "bg-rove-charcoal/5",
        border: "border-rove-charcoal/20",
        description: "Estrogen rises, boosting your energy, mood, and collagen production.",
        superpower: "Creativity",
        symptoms: [
            { name: "High Energy", icon: Zap, detail: "Peak performance" },
            { name: "Clear Skin", icon: Sun, detail: "Collagen boost" },
            { name: "High Libido", icon: Heart, detail: "Reproductive drive" },
        ],
        hormones: { estrogen: 80, progesterone: 15, testosterone: 40 }
    },
    {
        id: "luteal",
        name: "Luteal Phase",
        days: "Days 17-28",
        tagline: "The Wind Down",
        color: "text-rove-green",
        bg: "bg-rove-green",
        lightBg: "bg-rove-green/10",
        border: "border-rove-green/20",
        description: "Progesterone dominates, calming your nervous system but increasing metabolic demand.",
        superpower: "Focus",
        symptoms: [
            { name: "Bloating", icon: Droplets, detail: "Water retention" },
            { name: "Mood Swings", icon: Moon, detail: "Sensitivity" },
            { name: "Cravings", icon: Activity, detail: "Metabolic spike" },
        ],
        hormones: { estrogen: 40, progesterone: 80, testosterone: 20 }
    }
];

export function CycleSymptomVisualizer() {
    const [activePhase, setActivePhase] = useState(phases[0]);

    return (
        <div className="w-full max-w-6xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-rove-stone/5 overflow-hidden border border-rove-stone/10 flex flex-col md:flex-row min-h-[auto] md:min-h-[600px]">

            {/* Left Panel: Navigation & Timeline */}
            <div className="w-full md:w-1/3 bg-rove-cream/30 border-b md:border-b-0 md:border-r border-rove-stone/10 p-6 md:p-12 flex flex-col">
                <div className="mb-6 md:mb-10">
                    <h3 className="font-heading text-xl md:text-2xl text-rove-charcoal mb-2">Cycle Timeline</h3>
                    <p className="text-rove-stone text-xs md:text-sm">Select a phase to explore your physiology.</p>
                </div>

                <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-2 pb-2 md:pb-0 no-scrollbar">
                    {phases.map((phase) => (
                        <button
                            key={phase.id}
                            onClick={() => setActivePhase(phase)}
                            className={cn(
                                "shrink-0 w-[85%] md:w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden border",
                                activePhase.id === phase.id
                                    ? "bg-white border-rove-stone/10 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-white/50"
                            )}
                        >
                            {activePhase.id === phase.id && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className={cn("absolute left-0 top-0 bottom-0 w-1", phase.bg)}
                                />
                            )}
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-widest block mb-1",
                                        activePhase.id === phase.id ? phase.color : "text-rove-stone"
                                    )}>
                                        {phase.days}
                                    </span>
                                    <span className={cn(
                                        "font-heading text-lg block",
                                        activePhase.id === phase.id ? "text-rove-charcoal" : "text-rove-stone/70"
                                    )}>
                                        {phase.name}
                                    </span>
                                </div>
                                {activePhase.id === phase.id && (
                                    <ChevronRight className={cn("w-5 h-5", phase.color)} />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Editorial Content */}
            <div className="flex-1 p-6 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[500px] md:min-h-auto">
                {/* Background Watermark */}
                <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none">
                    <Image
                        src="/images/body-silhouette.png"
                        alt="Silhouette"
                        fill
                        className="object-contain object-right-top"
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePhase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 max-w-2xl"
                    >
                        {/* Header */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", activePhase.lightBg, activePhase.color)}>
                                    {activePhase.tagline}
                                </span>
                                <span className="h-px w-12 bg-rove-stone/20" />
                                <span className="text-rove-stone text-sm font-medium flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Superpower: {activePhase.superpower}
                                </span>
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl text-rove-charcoal mb-6 leading-tight">
                                {activePhase.description}
                            </h2>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            {/* Symptoms List */}
                            <div>
                                <h4 className="font-bold text-rove-charcoal mb-6 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-rove-stone" />
                                    Physical Signals
                                </h4>
                                <div className="space-y-4">
                                    {activePhase.symptoms.map((symptom, i) => (
                                        <motion.div
                                            key={symptom.name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-4 p-3 rounded-xl bg-rove-cream/50 border border-rove-stone/5"
                                        >
                                            <div className={cn("p-2 rounded-lg shrink-0", activePhase.lightBg)}>
                                                <symptom.icon className={cn("w-4 h-4", activePhase.color)} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-rove-charcoal text-sm">{symptom.name}</div>
                                                <div className="text-rove-stone text-xs">{symptom.detail}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Hormone Chart (Sparklines) */}
                            <div>
                                <h4 className="font-bold text-rove-charcoal mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-rove-stone" />
                                    Hormone Profile
                                </h4>
                                <div className="space-y-6">
                                    {Object.entries(activePhase.hormones).map(([hormone, level], i) => (
                                        <div key={hormone}>
                                            <div className="flex justify-between text-xs uppercase tracking-wider font-medium text-rove-stone mb-2">
                                                <span>{hormone}</span>
                                                <span className={activePhase.color}>{level}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-rove-stone/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${level}%` }}
                                                    transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                                    className={cn("h-full rounded-full", activePhase.bg)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-rove-stone/10">
                                    <Button variant="link" className={cn("p-0 h-auto font-medium group", activePhase.color)}>
                                        Learn how to support this phase <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

