"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Activity, Calendar, Zap, User } from "lucide-react";
import ProfileAvatar from "@/components/cycle-sync/ProfileAvatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ✅ UPDATED IMPORTS: Using @backend alias from tsconfig.json
import { fetchInsightsData } from "@backend/actions/cycle-sync/insights/insights-cycle-sync";
import {
  generatePhaseAIInsight,
  type AIContext
} from "@/app/actions/cycle-sync";
// --- COMPONENTS ---
import { AiAnalysisCard } from "@/components/cycle-sync/insights/AiAnalysisCard";
import { MentalHealthCheckCard } from "@/components/cycle-sync/insights/MentalHealthCheckCard";
import { CycleOverviewCard } from "@/components/cycle-sync/insights/CycleOverviewCard";
import { HabitsOverviewCard } from "@/components/cycle-sync/insights/HabitsOverviewCard";
import { PhaseInsightCard } from "@/components/cycle-sync/insights/PhaseInsightCard";
import LoadingScreen from "@/components/ui/LoadingScreen";

// --- PHASE THEMES ---
const phaseThemes: Record<string, any> = {
  Menstrual: {
    color: "text-phase-menstrual",
    blob: "bg-phase-menstrual/20",
    blobAccent: "bg-phase-menstrual",
    border: "border-phase-menstrual/30",
    shadow: "shadow-lg shadow-phase-menstrual/10",
  },
  Follicular: {
    color: "text-phase-follicular",
    blob: "bg-phase-follicular/20",
    blobAccent: "bg-phase-follicular",
    border: "border-phase-follicular/30",
    shadow: "shadow-lg shadow-phase-follicular/10",
  },
  Ovulatory: {
    color: "text-phase-ovulatory",
    blob: "bg-phase-ovulatory/20",
    blobAccent: "bg-phase-ovulatory",
    border: "border-phase-ovulatory/30",
    shadow: "shadow-lg shadow-phase-ovulatory/10",
  },
  Luteal: {
    color: "text-phase-luteal",
    blob: "bg-phase-luteal/20",
    blobAccent: "bg-phase-luteal",
    border: "border-phase-luteal/30",
    shadow: "shadow-lg shadow-phase-luteal/10",
  },
};

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<"cycle" | "symptoms" | "medical">("cycle");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchInsightsData();

        if (data) {
          setStats(data);

          if (data.phase?.name) {
            setSelectedPhase((prev) => prev || data.phase!.name);
          }
        }
      } catch (err) {
        console.error("Insights load failed", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleGenerateInsight() {
    if (!stats?.phase?.name || isGeneratingInsight) return;

    setIsGeneratingInsight(true);
    try {
      const aiContext: AIContext = {
        symptoms: Object.keys(stats.symptomsByPhase?.[stats.phase.name] || {}),
        moods: stats.aggregatedData?.moods || [],
        sleep: stats.aggregatedData?.sleep || [],
        disruptors: stats.aggregatedData?.disruptors || [],
        exercise: stats.aggregatedData?.exercise || [],
        recentNote: stats.aggregatedData?.recentNote || "",
      };

      const insight = await generatePhaseAIInsight(
        stats.phase.name,
        aiContext
      );
      setAiInsight(insight);
    } catch (err) {
      console.error("Failed to generate insight:", err);
    } finally {
      setIsGeneratingInsight(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!selectedPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rove-cream/20 via-white to-white">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/cycle-sync">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-heading text-rove-charcoal">Insights</h1>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">No Data Yet</span>
            </div>
            <ProfileAvatar />
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="max-w-lg mx-auto glass-panel p-6 text-center">
            <h2 className="font-heading text-xl text-rove-charcoal mb-2">Log your first period</h2>
            <p className="text-sm text-rove-stone mb-4">
              Once you log a period start, phase‑based insights and patterns will appear here.
            </p>
            <Link
              href="/cycle-sync/tracker"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rove-charcoal text-rove-cream text-sm font-semibold hover:bg-rove-charcoal/90 transition-all shadow-[0_8px_16px_-4px_rgba(45,36,32,0.15)]"
            >
              Go to Tracker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPhase = stats?.phase?.name || "Luteal";
  const currentDay = stats?.phase?.day || 1;
  const avgCycle = stats?.averages?.cycle || 28;
  const isRegular = !stats?.averages?.isIrregular;

  // Theme always follows the *Actual* phase for the page background
  const theme = phaseThemes[currentPhase];

  return (
    <div className="relative min-h-screen bg-rove-cream grain-overlay overflow-hidden">
      {/* Phase-colored organic blobs */}
      <div className={cn(
        "absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 pointer-events-none animate-[breathe_12s_infinite_ease-in-out]",
        theme.blobAccent
      )} />
      <div className={cn(
        "absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none animate-[breathe_16s_infinite_ease-in-out_reverse]",
        theme.blobAccent
      )} />

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-rove-cream/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/cycle-sync">
            <ChevronLeft className="w-5 h-5 text-rove-stone" />
          </Link>

          <div className="text-center">
            <h1 className={cn("text-lg font-heading", theme.color)}>
              Insights
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-rove-stone/60">
              {currentPhase} Phase
            </span>
          </div>

          <ProfileAvatar />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl relative z-10">
        {/* TABS */}
        <div className="flex bg-white/40 backdrop-blur-md rounded-2xl p-1 mb-6 border border-white/60">
          {[
            { id: "cycle", label: "Cycle", icon: Calendar },
            { id: "symptoms", label: "Patterns", icon: Activity },
            { id: "medical", label: "Health", icon: Zap },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                  isActive ? cn("bg-white/80 shadow-sm backdrop-blur-sm", theme.color) : "text-rove-stone hover:text-rove-charcoal"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* --- CYCLE TAB --- */}
          {activeTab === "cycle" && (
            <motion.div
              key="cycle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* 1. Cycle Overview (Top) */}
              <CycleOverviewCard
                cycleLength={avgCycle}
                periodLength={stats?.averages?.period || 5}
                isRegular={isRegular}
                nextPeriodDate={stats?.averages?.nextPeriodDate}
                phase={currentPhase}
                theme={theme}
              />

              {/* 1.5. Habits Overview */}
              <HabitsOverviewCard
                wellnessAverages={stats?.wellnessAverages}
                theme={theme}
              />

              {/* 2. Phase Insight (Below Overview) */}
              <PhaseInsightCard
                phase={currentPhase}
                day={currentDay}
                insight={aiInsight}
                theme={theme}
                isGenerating={isGeneratingInsight}
                onGenerateInsight={handleGenerateInsight}
              />

              {/* 3. Mental Health Check (Replaced Emotional Baseline) */}
              <MentalHealthCheckCard theme={theme} />
            </motion.div>
          )}

          {/* --- SYMPTOMS / PATTERNS TAB --- */}
          {activeTab === "symptoms" && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* 1. Symptoms Analysis (Interactive Phase Doughnut) */}
              <AiAnalysisCard
                phaseCounts={stats?.phaseCounts}
                symptomsByPhase={stats?.symptomsByPhase}
                tipsByPhase={stats?.tipsByPhase}
                selectedPhase={selectedPhase}
                onPhaseSelect={setSelectedPhase}
                theme={theme}
              />
            </motion.div>
          )}

          {/* --- MEDICAL / HEALTH TAB --- */}
          {activeTab === "medical" && (
            <motion.div
              key="medical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center p-12 text-center space-y-4"
            >
              <div className={cn("p-4 rounded-full bg-white/60 backdrop-blur-sm shadow-sm mb-2 border border-white/40", theme.color)}>
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