"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SegmentedDoughnut } from "@/components/ui/SegmentedDoughnut";
import { Sparkles, Leaf, Heart, Coffee } from "lucide-react";

// --- CONFIGURATION ---
const PHASE_GUIDANCE: Record<string, {
  color: string;
  bg: string;
  blob: string;
  icon: any;
  tips: string[];
}> = {
  Menstrual: {
    color: "text-rose-600",
    bg: "bg-rose-50",
    blob: "bg-rose-400",
    icon: Coffee,
    tips: [
      "Prioritize warmth and slow movement.",
      "Focus on iron-rich foods.",
      "Allow yourself extra rest."
    ]
  },
  Follicular: {
    color: "text-teal-600",
    bg: "bg-teal-50",
    blob: "bg-teal-400",
    icon: Leaf,
    tips: [
      "Great time for creative projects.",
      "Try new workouts or classes.",
      "Load up on fresh vegetables."
    ]
  },
  Ovulatory: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    blob: "bg-amber-400",
    icon: Sparkles,
    tips: [
      "High energy: Schedule social events.",
      "Strength training hits harder now.",
      "Stay hydrated as estrogen peaks."
    ]
  },
  Luteal: {
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    blob: "bg-indigo-400",
    icon: Heart,
    tips: [
      "Magnesium helps with cravings.",
      "Gentle movement lowers cortisol.",
      "Stick to complex carbs for mood."
    ]
  }
};

type Props = {
  phaseCounts?: Record<string, number>;
  symptomsByPhase: Record<string, Record<string, number>>;
  tipsByPhase?: Record<string, string[]>;
  selectedPhase: string;
  onPhaseSelect: (phase: string) => void;
  theme: any;
};

export function AiAnalysisCard({
  symptomsByPhase,
  tipsByPhase,
  selectedPhase,
  onPhaseSelect,
  theme
}: Props) {

  const currentCounts = symptomsByPhase?.[selectedPhase] || {};
  const topSymptoms = Object.entries(currentCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3);

  const guidance = PHASE_GUIDANCE[selectedPhase] || PHASE_GUIDANCE["Luteal"];
  const dynamicTips = tipsByPhase?.[selectedPhase];
  const displayTips = (dynamicTips && dynamicTips.length > 0) ? dynamicTips : guidance.tips;

  const GuidanceIcon = guidance.icon;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm max-w-md mx-auto">

      {/* Animated blob that changes color based on phase */}
      <div className={cn(
        "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500",
        guidance.blob
      )} />

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <div className="text-amber-500 text-lg">✨</div>
        <h3 className="text-lg font-heading text-rove-charcoal">
          Pattern Analysis
        </h3>
      </div>

      {/* VISUAL SELECTOR */}
      <div className="flex justify-center mb-8 relative z-10">
        <SegmentedDoughnut
          selectedPhase={selectedPhase}
          onPhaseSelect={onPhaseSelect}
          size={180}
        />
      </div>

      {/* SYMPTOM TILES */}
      <div className="mb-6 min-h-[140px] relative z-10">
        <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
          Top Symptoms in {selectedPhase}
        </h4>

        <AnimatePresence mode="wait">
          {topSymptoms.length > 0 ? (
            <motion.div
              key={selectedPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-3 gap-3"
            >
              {topSymptoms.map(([name, count]) => {
                const iconName = name.toLowerCase().replace(/\s+/g, '-');

                return (
                  <div
                    key={name}
                    className="flex flex-col items-center bg-white border border-stone-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    {/* LARGER ICON: 20px circle with 16px image */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stone-50 to-stone-100/80 flex items-center justify-center mb-3 overflow-hidden relative border border-stone-100/50 shadow-sm group-hover:shadow-md transition-all">
                      <div className="relative w-16 h-16">
                        <Image
                          src={`/assets/symptoms/${iconName}.png`}
                          alt={name}
                          fill
                          className="object-contain opacity-90 group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <span className="text-[11px] font-medium text-rove-charcoal text-center leading-tight mb-2 h-8 flex items-center justify-center line-clamp-2">
                      {name}
                    </span>

                    {/* Count Badge */}
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                      guidance.bg, guidance.color
                    )}>
                      {count}d
                    </span>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center mb-2">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-sm text-rove-stone">
                No symptoms logged yet.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STATIC GUIDANCE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPhase + "-tips"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "rounded-2xl p-5 relative overflow-hidden z-10",
            guidance.bg
          )}
        >
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <GuidanceIcon className={cn("w-4 h-4", guidance.color)} />
            <span className={cn("text-xs font-bold uppercase tracking-wider", guidance.color)}>
              What May Help
            </span>
          </div>

          <ul className="space-y-2 relative z-10">
            {displayTips.map((tip, i) => (
              <li key={i} className="text-sm text-rove-charcoal/80 flex items-start gap-2">
                <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", guidance.color.replace('text-', 'bg-'))} />
                {tip}
              </li>
            ))}
          </ul>

          <div className={cn(
            "absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 blur-2xl",
            guidance.color.replace('text-', 'bg-')
          )} />
        </motion.div>
      </AnimatePresence>

    </div>
  );
}