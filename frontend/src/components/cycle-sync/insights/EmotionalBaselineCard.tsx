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
  Menstrual: "bg-rose-400",
  Follicular: "bg-teal-400",
  Ovulatory: "bg-amber-400",
  Luteal: "bg-indigo-400",
};

const PHASE_STYLES: Record<string, string> = {
  Menstrual: "bg-rose-100 text-rose-700 border-rose-200",
  Follicular: "bg-teal-100 text-teal-700 border-teal-200",
  Ovulatory: "bg-amber-100 text-amber-700 border-amber-200",
  Luteal: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const PHASE_GRADIENTS: Record<string, string> = {
  Menstrual: "from-rose-50/40 to-rose-100/20",
  Follicular: "from-teal-50/40 to-teal-100/20",
  Ovulatory: "from-amber-50/40 to-amber-100/20",
  Luteal: "from-indigo-50/40 to-indigo-100/20",
};

const PHASE_GLOW: Record<string, string> = {
  Menstrual: "bg-rose-200/30",
  Follicular: "bg-teal-200/30",
  Ovulatory: "bg-amber-200/30",
  Luteal: "bg-indigo-200/30",
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
    <div className="relative rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm mt-6 overflow-hidden">

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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm">
            <Activity className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-base font-heading font-bold text-gray-800 tracking-tight">
            Emotional Baseline
          </h3>
        </div>
        <p className="text-xs text-gray-500 font-light ml-10">
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
                  : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300"
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
              hasData ? "text-gray-800" : "text-gray-300"
            )}>
              {hasData ? <TypingText text={data.title} delay={200} /> : data.title}
              {hasData && (
                <span className="text-xs font-normal text-gray-400 ml-auto">
                  {activePhase}
                </span>
              )}
            </h4>
            <p className={cn(
              "text-sm leading-relaxed",
              hasData ? "text-gray-700" : "text-gray-400 italic"
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
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Generated by Rove AI
            </span>
          </div>
        </div>
      )}

    </div>
  );
}