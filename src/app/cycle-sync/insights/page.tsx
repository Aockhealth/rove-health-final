"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Activity, Calendar, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  fetchInsightsData,
  generatePhaseAIInsight,
  type AIContext
} from "@/app/actions/cycle-sync";

// --- COMPONENTS ---
import { AiAnalysisCard } from "@/components/cycle-sync/insights/AiAnalysisCard";
import { EmotionalBaselineCard } from "@/components/cycle-sync/insights/EmotionalBaselineCard";
import { CycleOverviewCard } from "@/components/cycle-sync/insights/CycleOverviewCard";
import { PhaseInsightCard } from "@/components/cycle-sync/insights/PhaseInsightCard";

// --- PHASE THEMES ---
const phaseThemes: Record<string, any> = {
  Menstrual: {
    color: "text-rose-600",
    pageGradient: "from-rose-50/50 via-white to-white",
    blob: "bg-rose-300",
  },
  Follicular: {
    color: "text-teal-600",
    pageGradient: "from-teal-50/50 via-white to-white",
    blob: "bg-teal-300",
  },
  Ovulatory: {
    color: "text-amber-600",
    pageGradient: "from-amber-50/50 via-white to-white",
    blob: "bg-amber-300",
  },
  Luteal: {
    color: "text-indigo-600",
    pageGradient: "from-indigo-50/50 via-white to-white",
    blob: "bg-indigo-300",
  },
};

// --- SCROLL REVEAL WRAPPER ---
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<"cycle" | "symptoms" | "medical">("cycle");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<any>(null);

  // ✅ FIX 1: Initialize as null to distinguish "not loaded" from "Menstrual"
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchInsightsData();

        if (data) {
          setStats(data);

          if (data.phase?.name) {
            // ✅ FIX 2: Only set phase if it hasn't been touched yet.
            setSelectedPhase((prev) => prev || data.phase.name);

            // Generate AI Insight for the *current real phase*
            const aiContext: AIContext = {
              symptoms: Object.keys(data.symptomsByPhase?.[data.phase.name] || {}),
              moods: data.aggregatedData?.moods || [],
              sleep: data.aggregatedData?.sleep || [],
              disruptors: data.aggregatedData?.disruptors || [],
              exercise: data.aggregatedData?.exercise || [],
              recentNote: data.aggregatedData?.recentNote || "",
            };

            const insight = await generatePhaseAIInsight(
              data.phase.name,
              aiContext
            );
            setAiInsight(insight);
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

  // ✅ FIX 3: Guard render until we have a phase
  if (loading || !selectedPhase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-gray-400 border-t-transparent" />
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
    <div className={cn("min-h-screen bg-gradient-to-b", theme.pageGradient)}>
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/cycle-sync">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>

          <div className="text-center">
            <h1 className={cn("text-lg font-heading", theme.color)}>
              Insights
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              {currentPhase} Phase
            </span>
          </div>

          <Activity className={cn("w-4 h-4", theme.color)} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* TABS */}
        <div className="flex bg-white/60 rounded-2xl p-1 mb-6">
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
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold",
                  isActive ? cn("bg-white shadow-sm", theme.color) : "text-gray-500"
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
              <ScrollReveal>
                <CycleOverviewCard
                  cycleLength={avgCycle}
                  periodLength={stats?.averages?.period || 5}
                  isRegular={isRegular}
                  nextPeriodDate={stats?.averages?.lastPeriodStart}
                  phase={currentPhase}
                  theme={theme}
                />
              </ScrollReveal>

              {/* 2. Phase Insight (Below Overview) */}
              <ScrollReveal delay={0.1}>
                <PhaseInsightCard
                  phase={currentPhase}
                  day={currentDay}
                  insight={aiInsight}
                  theme={theme}
                />
              </ScrollReveal>

              {/* 3. Symptoms Analysis (Interactive Phase) */}
              <ScrollReveal delay={0.2}>
                <AiAnalysisCard
                  phaseCounts={stats?.phaseCounts}
                  symptomsByPhase={stats?.symptomsByPhase}
                  tipsByPhase={stats?.tipsByPhase}
                  selectedPhase={selectedPhase}
                  onPhaseSelect={setSelectedPhase}
                  theme={theme}
                />
              </ScrollReveal>

              {/* 4. Emotional Baseline (Interactive Phase) */}
              <ScrollReveal delay={0.2}>
                <EmotionalBaselineCard
                  emotionalBaselines={stats?.emotionalBaselines}
                  defaultPhase={selectedPhase}
                />
              </ScrollReveal>
            </motion.div>
          )}

          {/* --- SYMPTOMS / PATTERNS TAB --- */}
          {activeTab === "symptoms" && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center p-12 text-center space-y-4"
            >
              <div className={cn("p-4 rounded-full bg-white shadow-sm mb-2", theme.color)}>
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading text-rove-charcoal">Symptom Patterns</h3>
              <p className="text-rove-stone max-w-sm">Keep logging daily to unlock detailed symptom correlation analysis.</p>
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