"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, Brain, Activity, Calendar, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchInsightsData, generatePhaseAIInsight } from "@/app/actions/cycle-sync";

// --- COMPONENTS ---
import { AiAnalysisCard } from "@/components/cycle-sync/insights/AiAnalysisCard";
import { CycleOverviewCard } from "@/components/cycle-sync/insights/CycleOverviewCard";
import { FlowPatternCard } from "@/components/cycle-sync/insights/FlowPatternCard";
import { PredictionGraph } from "@/components/cycle-sync/insights/PredictionGraph";
import { PhaseInsightCard } from "@/components/cycle-sync/insights/PhaseInsightCard";

// Phase Theme Logic - Expanded for Full UI Theming (MATCHING PLAN PAGE)
const phaseThemes: Record<string, any> = {
    "Menstrual": {
        color: "text-rose-600",
        bannerBg: "bg-gradient-to-r from-rose-500 to-pink-600",
        cardBg: "bg-white/60",
        border: "border-rose-100",
        softBg: "bg-rose-50/30",
        pageGradient: "from-rose-50/50 via-white to-white",
        iconContainer: "bg-rose-100 text-rose-600",
        accent: "bg-rose-500"
    },
    "Follicular": {
        color: "text-teal-600",
        bannerBg: "bg-gradient-to-r from-teal-400 to-emerald-500",
        cardBg: "bg-teal-50/30",
        border: "border-teal-100",
        softBg: "bg-teal-50/30",
        pageGradient: "from-teal-50/50 via-white to-white",
        iconContainer: "bg-teal-100 text-teal-600",
        accent: "bg-teal-500"
    },
    "Ovulatory": {
        color: "text-amber-600",
        bannerBg: "bg-gradient-to-r from-amber-400 to-orange-500",
        cardBg: "bg-amber-50/30",
        border: "border-amber-100",
        softBg: "bg-amber-50/30",
        pageGradient: "from-amber-50/50 via-white to-white",
        iconContainer: "bg-amber-100 text-amber-600",
        accent: "bg-amber-500"
    },
    "Luteal": {
        color: "text-indigo-600",
        bannerBg: "bg-gradient-to-r from-indigo-500 to-purple-600",
        cardBg: "bg-indigo-50/30",
        border: "border-indigo-100",
        softBg: "bg-indigo-50/30",
        pageGradient: "from-indigo-50/50 via-white to-white",
        iconContainer: "bg-indigo-100 text-indigo-600",
        accent: "bg-indigo-500"
    }
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <div className="animate-spin w-8 h-8 rounded-full border-2 border-rove-charcoal border-t-transparent" />
        </div>
    );

    // Theme Logic
    const currentPhase = stats?.phase?.name || "Luteal";
    const currentDay = stats?.phase?.day || 1;
    const avgCycle = stats?.averages?.cycle || 28;
    const isRegular = !stats?.averages?.isIrregular;
    const theme = phaseThemes[currentPhase] || phaseThemes["Menstrual"];

    // Prediction Logic
    const lastStart = stats?.averages?.lastPeriodStart ? new Date(stats.averages.lastPeriodStart) : new Date();
    let nextPeriodDate = new Date(lastStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    while (nextPeriodDate <= today) {
        nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycle);
    }

    return (
        <div className={cn("min-h-screen bg-gradient-to-b transition-colors duration-500", theme.pageGradient)}>

            {/* 1. TOP NAVIGATION (Floating Glass) */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
                <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    <Link href="/cycle-sync" className="p-2 -ml-2 text-rove-stone hover:text-rove-charcoal transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex flex-col items-center">
                        <h1 className={cn("text-lg font-heading leading-none mb-0.5", theme.color)}>Insights</h1>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone/60">{currentPhase} Phase</span>
                    </div>

                    <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center shadow-sm", theme.cardBg, theme.border)}>
                        <Activity className={cn("w-4 h-4", theme.color)} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-5xl">

                {/* 2. TAB NAVIGATION (Floating Pill) */}
                <div className="flex p-1 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm mx-auto w-full max-w-md mb-6">
                    {[
                        { id: 'cycle', label: 'Cycle', icon: Calendar },
                        { id: 'symptoms', label: 'Patterns', icon: Activity },
                        { id: 'medical', label: 'Health', icon: Zap }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    isActive ? cn("bg-white shadow-sm", theme.color) : "text-rove-charcoal/60 hover:bg-white/30"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. MAIN DASHBOARD CONTENT */}
                <AnimatePresence mode="wait">
                    {activeTab === "cycle" && (
                        <motion.div
                            key="cycle"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* AI INSIGHT BANNER */}
                            <PhaseInsightCard
                                phase={currentPhase as any}
                                day={currentDay}
                                insight={aiInsight}
                                theme={theme}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* CYCLE OVERVIEW */}
                                <div className={cn("rounded-3xl p-6 backdrop-blur-xl border transition-all hover:shadow-lg", theme.cardBg, theme.border)}>
                                    <CycleOverviewCard
                                        cycleLength={avgCycle}
                                        periodLength={stats?.averages?.period || 5}
                                        isRegular={isRegular}
                                        phase={currentPhase}
                                        theme={theme}
                                    />
                                </div>

                                {/* PREDICTION GRAPH */}
                                <div className={cn("rounded-3xl p-6 backdrop-blur-xl border transition-all hover:shadow-lg lg:col-span-2", theme.cardBg, theme.border)}>
                                    <PredictionGraph
                                        nextDate={nextPeriodDate.toISOString()}
                                        cycleLength={avgCycle}
                                        phase={currentPhase}
                                        theme={theme}
                                    />
                                </div>

                                {/* AI ANALYSIS */}
                                <div className={cn("rounded-3xl p-6 backdrop-blur-xl border transition-all hover:shadow-lg lg:col-span-3", theme.cardBg, theme.border)}>
                                    <AiAnalysisCard
                                        logs={[]}
                                        phaseCounts={stats?.phaseCounts}
                                        phase={currentPhase}
                                        theme={theme}
                                    />
                                </div>

                                {/* FLOW PATTERN */}
                                <div className={cn("rounded-3xl p-6 backdrop-blur-xl border transition-all hover:shadow-lg", theme.cardBg, theme.border)}>
                                    <FlowPatternCard phase={currentPhase} theme={theme} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "symptoms" && (
                        <motion.div
                            key="symptoms"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center p-12 text-center space-y-4"
                        >
                            <div className={cn("p-4 rounded-full bg-white shadow-sm mb-2", theme.color)}>
                                <Activity className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-heading text-rove-charcoal">Symptom Patterns</h3>
                            <p className="text-rove-stone max-w-sm">Keep logging daily to unlock detailed symptom correlation analysis.</p>
                        </motion.div>
                    )}

                    {activeTab === "medical" && (
                        <motion.div
                            key="medical"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center p-12 text-center space-y-4"
                        >
                            <div className={cn("p-4 rounded-full bg-white shadow-sm mb-2", theme.color)}>
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-heading text-rove-charcoal">Health Report</h3>
                            <p className="text-rove-stone max-w-sm">Generate a PDF report for your doctor (Coming Soon).</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}