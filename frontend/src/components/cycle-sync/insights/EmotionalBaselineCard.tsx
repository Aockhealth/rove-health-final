"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MoodInsight = {
  title: string;
  insight: string;
};

type EmotionalBaselineCardProps = {
  emotionalBaselines: Record<string, MoodInsight>;
  defaultPhase?: string;
};

const PHASES = ["Menstrual", "Follicular", "Ovulatory", "Luteal"] as const;

const PHASE_BLOBS: Record<string, string> = {
  Menstrual: "bg-phase-menstrual",
  Follicular: "bg-phase-follicular",
  Ovulatory: "bg-phase-ovulatory",
  Luteal: "bg-phase-luteal",
};

const PHASE_STYLES: Record<string, string> = {
  Menstrual: "bg-phase-menstrual/15 text-phase-menstrual border-phase-menstrual/20",
  Follicular: "bg-phase-follicular/15 text-phase-follicular border-phase-follicular/20",
  Ovulatory: "bg-phase-ovulatory/15 text-phase-ovulatory border-phase-ovulatory/20",
  Luteal: "bg-phase-luteal/15 text-phase-luteal border-phase-luteal/20",
};

const PHASE_GRADIENTS: Record<string, string> = {
  Menstrual: "from-phase-menstrual/5 to-phase-menstrual/3",
  Follicular: "from-phase-follicular/5 to-phase-follicular/3",
  Ovulatory: "from-phase-ovulatory/5 to-phase-ovulatory/3",
  Luteal: "from-phase-luteal/5 to-phase-luteal/3",
};

const PHASE_GLOW: Record<string, string> = {
  Menstrual: "bg-phase-menstrual/20",
  Follicular: "bg-phase-follicular/20",
  Ovulatory: "bg-phase-ovulatory/20",
  Luteal: "bg-phase-luteal/20",
};

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(intervalId);
        }
      }, 20);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
        />
      )}
    </>
  );
}

export function EmotionalBaselineCard({
  emotionalBaselines,
  defaultPhase = "Menstrual",
}: EmotionalBaselineCardProps) {
  const [activePhase, setActivePhase] = useState<string>(defaultPhase);

  const data = emotionalBaselines?.[activePhase] || {
    title: "No Data",
    insight: "Log your moods to generate an emotional baseline for this phase."
  };

  const hasData = data.title !== "No Data";

  return (
    <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-phase-ovulatory/30 transition-all mt-6 overflow-hidden">

      {/* Subtle background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none",
        PHASE_GRADIENTS[activePhase]
      )} />

      {/* Top-Right Blob */}
      <div className={cn(
        "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500",
        PHASE_BLOBS[activePhase]
      )} />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-phase-ovulatory/20 to-phase-ovulatory/30 flex items-center justify-center shadow-sm">
            <Activity className="w-4 h-4 text-phase-ovulatory" strokeWidth={2.5} />
          </div>
          <h3 className="text-base font-heading font-bold text-rove-charcoal tracking-tight">
            Emotional Baseline
          </h3>
        </div>
        <p className="text-xs text-rove-stone font-light ml-10">
          AI analysis of your mood patterns this month
        </p>
      </div>

      {/* Phase Navigation (Pills) */}
      <div className="relative z-10 flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {PHASES.map((phase) => {
          const isActive = phase === activePhase;
          return (
            <motion.button
              key={phase}
              onClick={() => setActivePhase(phase)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative px-4 py-2 rounded-full text-xs font-semibold transition-all border-2 shrink-0",
                isActive
                  ? PHASE_STYLES[phase] + " shadow-md"
                  : "bg-white/60 border-white/40 text-rove-charcoal/60 hover:bg-white/80 hover:text-rove-charcoal/80 hover:border-rove-stone/30"
              )}
            >
              {phase}
              {isActive && (
                <motion.div
                  layoutId="activePhase"
                  className={cn(
                    "absolute inset-0 rounded-full -z-10 blur-lg opacity-40",
                    PHASE_GLOW[phase]
                  )}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* AI Content Display with Typing Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 min-h-[120px] bg-white/80 backdrop-blur-sm rounded-[24px] p-6 border-2 border-white/60 shadow-lg"
        >
          {/* Content Glow */}
          <div className={cn(
            "absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20",
            PHASE_GLOW[activePhase]
          )} />

          <div className="relative">
            <h4 className={cn(
              "text-base font-heading font-bold mb-3 flex items-center gap-2",
              hasData ? "text-rove-charcoal" : "text-rove-stone/40"
            )}>
              {hasData ? <TypingText text={data.title} delay={200} /> : data.title}
              {hasData && (
                <span className="text-xs font-normal text-rove-stone ml-auto">
                  {activePhase}
                </span>
              )}
            </h4>
            <p className={cn(
              "text-sm leading-relaxed",
              hasData ? "text-rove-charcoal/80" : "text-rove-stone italic"
            )}>
              {hasData ? <TypingText text={data.insight} delay={400} /> : data.insight}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      {hasData && (
        <div className="relative z-10 mt-5 pt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
            <span className="text-[10px] text-rove-stone/60 font-medium uppercase tracking-wider">
              Generated by Rove AI
            </span>
          </div>
        </div>
      )}

    </div>
  );
}