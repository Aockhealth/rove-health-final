"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, Brain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchInsightsData, generatePhaseAIInsight } from "@/app/actions/cycle-sync";
import { Badge } from "@/components/ui/Badge";

// --- COMPONENTS ---
import { AiAnalysisCard } from "@/components/cycle-sync/insights/AiAnalysisCard";
import { CycleOverviewCard } from "@/components/cycle-sync/insights/CycleOverviewCard";
import { FlowPatternCard } from "@/components/cycle-sync/insights/FlowPatternCard";
import { PredictionGraph } from "@/components/cycle-sync/insights/PredictionGraph";
import { PhaseInsightCard } from "@/components/cycle-sync/insights/PhaseInsightCard";

// Phase Theme Logic - Ported from Dashboard
const phaseThemes: Record<string, any> = {
    "Menstrual": {
        color: "text-rose-500", // Soft Rose
        blob: "bg-rose-200/20",
        orbRing: "from-rose-300 via-rose-100 to-rose-400",
        glow: "shadow-[0_0_40px_rgba(251,113,133,0.2)]", // Soft pink glow
        badge: "bg-rose-50 text-rose-600 border-rose-100",
        accent: "bg-rose-500"
    },
    "Follicular": {
        color: "text-teal-600", // Muted Teal
        blob: "bg-teal-200/15", // Very subtle mint
        orbRing: "from-teal-300 via-emerald-100 to-teal-400",
        glow: "shadow-[0_0_40px_rgba(45,212,191,0.2)]", // Mint glow
        badge: "bg-teal-50 text-teal-700 border-teal-100",
        accent: "bg-teal-500"
    },
    "Ovulatory": {
        color: "text-amber-500/90", // Chanpagne Gold
        blob: "bg-amber-100/30",
        orbRing: "from-amber-300 via-yellow-100 to-amber-400",
        glow: "shadow-[0_0_40px_rgba(251,191,36,0.25)]", // Golden hour glow
        badge: "bg-amber-50 text-amber-700 border-amber-100",
        accent: "bg-amber-500"
    },
    "Luteal": {
        color: "text-indigo-500", // Soft Periwinkle
        blob: "bg-indigo-200/15",
        orbRing: "from-indigo-300 via-blue-100 to-indigo-400",
        glow: "shadow-[0_0_40px_rgba(129,140,248,0.2)]", // Lavender glow
        badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
        accent: "bg-indigo-500"
    }
};

const PHASE_IMAGES: Record<string, string> = {
    "Menstrual": "/assets/phases/menstrual.jpg",
    "Follicular": "/assets/phases/follicular.jpg",
    "Ovulatory": "/assets/phases/ovulatory.jpg",
    "Luteal": "/assets/phases/luteal.jpg"
};

export default function InsightsPage() {
    const [activeTab, setActiveTab] = useState<"cycle" | "symptoms" | "medical">("cycle");
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchInsightsData();
            setStats(data);

            // Trigger AI Insight Generation based on actual symptom logs
            if (data?.phase?.name) {
                const symptomNames = data.symptoms?.map((s: any) => s.name) || [];
                const insight = await generatePhaseAIInsight(data.phase.name, symptomNames);
                setAiInsight(insight);
            }
            setLoading(false);
        }
        load();
    }, []);

    // Theme Logic
    const currentPhase = stats?.phase?.name || "Luteal";
    const currentDay = stats?.phase?.day || 1;
    const avgCycle = stats?.averages?.cycle || 28;
    const isRegular = !stats?.averages?.isIrregular;
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Select Theme
    const theme = phaseThemes[currentPhase] || phaseThemes["Menstrual"];
    const headerImage = PHASE_IMAGES[currentPhase] || PHASE_IMAGES["Menstrual"];

    // Prediction Logic
    const lastStart = stats?.averages?.lastPeriodStart ? new Date(stats.averages.lastPeriodStart) : new Date();
    let nextPeriodDate = new Date(lastStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    while (nextPeriodDate <= today) {
        nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycle);
    }

    if (loading) return (
        <div className="min-h-screen bg-rove-cream/20 flex items-center justify-center text-xs text-rove-stone font-bold uppercase tracking-widest">
            <span className="animate-pulse">Analyzing Patterns...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FBFAF8]">

            {/* 1. HERO IMAGE (Restored) */}
            <div className="relative w-full h-[40vh] md:h-[45vh] bg-slate-900 z-0 transition-all duration-700">
                <Image
                    src={headerImage}
                    alt={currentPhase}
                    fill
                    sizes="100vw"
                    className="object-cover object-center opacity-90 transition-opacity duration-700"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 pb-16 md:pb-32 z-20 container mx-auto">
                    <div className="flex justify-between items-center text-white pt-2">
                        <Link href="/cycle-sync" className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/10">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex flex-col items-center">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] opacity-90 drop-shadow-md">Biometric Analysis</span>
                            <span className="text-[9px] uppercase tracking-widest opacity-60">{todayStr}</span>
                        </div>
                        <div className="w-10" />
                    </div>

                    <div className="space-y-2 animate-in slide-in-from-bottom-6 duration-700 fade-in">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                            Day {currentDay} of {avgCycle}
                        </span>
                        <h1 className="font-heading text-4xl md:text-6xl text-white drop-shadow-xl leading-tight">
                            {currentPhase} Phase
                        </h1>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT SHEET (Overlapping) */}
            <div className="relative z-30 -mt-10 md:-mt-20 bg-[#FBFAF8] rounded-t-[2.5rem] md:rounded-t-[4rem] overflow-hidden shadow-2xl min-h-screen">

                {/* Ambient Blobs inside the sheet for continuity */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={cn("absolute -top-[10%] -left-[10%] w-[50vh] h-[50vh] rounded-full blur-[100px] opacity-40 mix-blend-multiply", theme.blob)} />
                </div>

                <div className="relative z-10 container mx-auto px-4 py-8 md:p-12 md:pt-16 max-w-7xl">

                    {/* Tab Navigation (Glassmorphism) */}
                    <div className="flex justify-center mb-10">
                        <div className="flex w-full md:w-auto p-1.5 bg-white/60 backdrop-blur-xl border border-rove-stone/10 rounded-full shadow-sm overflow-x-auto no-scrollbar">
                            {["cycle", "symptoms", "medical"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "flex-1 md:flex-none px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                        activeTab === tab ? "bg-rove-charcoal text-white shadow-md" : "text-rove-stone/70 hover:bg-white/40 hover:text-rove-stone"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "cycle" && (
                            <motion.div
                                key="cycle"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                            >
                                <div className="md:col-span-1 xl:col-span-1">
                                    <CycleOverviewCard
                                        cycleLength={avgCycle}
                                        periodLength={stats?.averages?.period || 5}
                                        isRegular={isRegular}
                                        phase={currentPhase}
                                        theme={theme}
                                    />
                                </div>
                                <div className="md:col-span-1 xl:col-span-3">
                                    <AiAnalysisCard
                                        logs={[]}
                                        phaseCounts={stats?.phaseCounts}
                                        phase={currentPhase}
                                        theme={theme}
                                    />
                                </div>
                                <div className="md:col-span-2 xl:col-span-4">
                                    <PhaseInsightCard
                                        phase={currentPhase as any}
                                        day={currentDay}
                                        insight={aiInsight}
                                        theme={theme}
                                    />
                                </div>
                                <div className="md:col-span-1 xl:col-span-2 h-full min-h-[250px]">
                                    <PredictionGraph
                                        nextDate={nextPeriodDate.toISOString()}
                                        cycleLength={avgCycle}
                                        phase={currentPhase}
                                        theme={theme}
                                    />
                                </div>
                                <div className="md:col-span-1 xl:col-span-2">
                                    <FlowPatternCard phase={currentPhase} theme={theme} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}