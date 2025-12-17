"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Activity, CheckCircle2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchInsightsData, generatePhaseAIInsight } from "@/app/actions/cycle-sync";

// --- COMPONENTS ---
import { AiAnalysisCard } from "@/components/cycle-sync/insights/AiAnalysisCard";
import { CycleOverviewCard } from "@/components/cycle-sync/insights/CycleOverviewCard";
import { FlowPatternCard } from "@/components/cycle-sync/insights/FlowPatternCard";
import { PredictionGraph } from "@/components/cycle-sync/insights/PredictionGraph";
import { PhaseInsightCard } from "@/components/cycle-sync/insights/PhaseInsightCard";

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

    if (loading) return (
        <div className="min-h-screen bg-[#FBFAF8] flex items-center justify-center text-xs text-rove-stone font-bold uppercase tracking-widest">
            Loading Insights...
        </div>
    );

    // --- DATABASE DATA EXTRACTION ---
    const currentPhase = stats?.phase?.name || "Luteal"; 
    const currentDay = stats?.phase?.day || 1;
    const headerImage = PHASE_IMAGES[currentPhase] || PHASE_IMAGES["Menstrual"];
    const avgCycle = stats?.averages?.cycle || 28;
    const lastStart = stats?.averages?.lastPeriodStart ? new Date(stats.averages.lastPeriodStart) : new Date();
    const isRegular = !stats?.averages?.isIrregular; 
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // --- PREDICTION LOGIC ---
    let nextPeriodDate = new Date(lastStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    while (nextPeriodDate <= today) {
        nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycle);
    }

    return (
        <div className="min-h-screen bg-[#FBFAF8]">
            
            {/* 1. HERO IMAGE */}
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

            {/* 2. MAIN CONTENT SHEET */}
            <div className="relative z-30 -mt-10 md:-mt-20 bg-[#FBFAF8] rounded-t-[2.5rem] md:rounded-t-[4rem] overflow-hidden shadow-2xl min-h-screen">
                <div className="container mx-auto px-4 py-8 md:p-12 md:pt-16 max-w-7xl">
                    
                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8 md:mb-12">
                        <div className="flex w-full md:w-auto p-1.5 bg-white rounded-full border border-rove-stone/10 shadow-lg overflow-x-auto no-scrollbar">
                            {["cycle", "symptoms", "medical"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "flex-1 md:flex-none px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                        activeTab === tab ? "bg-rove-charcoal text-white shadow-md" : "text-rove-stone hover:bg-rove-cream"
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
                                    />
                                </div>
                                <div className="md:col-span-1 xl:col-span-3">
                                    <AiAnalysisCard 
                                        logs={[]} 
                                        phaseCounts={stats?.phaseCounts} 
                                        phase={currentPhase}
                                    />
                                </div>
                                <div className="md:col-span-2 xl:col-span-4">
                                    <PhaseInsightCard 
                                        phase={currentPhase as any} 
                                        day={currentDay} 
                                        insight={aiInsight} 
                                    />
                                </div>
                                <div className="md:col-span-1 xl:col-span-2 h-full min-h-[250px]">
                                    <PredictionGraph 
                                        nextDate={nextPeriodDate.toISOString()} 
                                        cycleLength={avgCycle} 
                                        phase={currentPhase}
                                    />
                                </div>
                                <div className="md:col-span-1 xl:col-span-2">
                                    <FlowPatternCard phase={currentPhase} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}