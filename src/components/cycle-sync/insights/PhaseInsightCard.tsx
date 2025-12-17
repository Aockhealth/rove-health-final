"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Flame, Moon, Brain, Leaf, Sun } from "lucide-react";

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    "Follicular": { bg: "rgba(236, 253, 245, 0.5)", text: "#065f46", border: "rgba(16, 185, 129, 0.1)" }, 
    "Luteal": { bg: "rgba(255, 251, 235, 0.5)", text: "#92400e", border: "rgba(245, 158, 11, 0.1)" },     
    "Menstrual": { bg: "rgba(255, 241, 242, 0.5)", text: "#9f1239", border: "rgba(225, 29, 72, 0.1)" },    
    "Ovulatory": { bg: "rgba(245, 243, 255, 0.5)", text: "#5b21b6", border: "rgba(139, 92, 246, 0.1)" },   
};

interface PhaseInsightCardProps {
  phase: "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";
  day?: number;
  insight?: any; // Changed to any because it is now an object { insight, moods, focus }
}

export function PhaseInsightCard({ phase, insight, day }: PhaseInsightCardProps) {
  const theme = PHASE_COLORS[phase] || PHASE_COLORS["Luteal"];

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] p-8 h-full flex flex-col transition-all duration-700"
      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
    >
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-85"
        style={{
          backgroundImage: "url('/textures/card-bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "140%",
          backgroundPosition: "bottom right",
        }}
      />

      <div className="relative z-10 flex flex-col gap-5 h-full">
        <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: theme.text }}>
                DAY {day} INSIGHT
            </span>
            <h3 className="font-heading text-2xl mt-1" style={{ color: theme.text }}>
                Personalized AI Analysis
            </h3>
        </div>

        <div className="w-10 h-1 rounded-full opacity-30" style={{ backgroundColor: theme.text }} />

        {/* ✅ FIX: Access insight.insight instead of rendering the whole object */}
        <p className="text-sm leading-relaxed max-w-[90%] text-rove-stone min-h-[3.5rem]">
          {insight?.insight ? (
              insight.insight 
          ) : (
              <span className="animate-pulse opacity-50 italic">Groq AI is analyzing your specific symptoms...</span>
          )}
        </p>

        <div className="mt-auto space-y-6">
            {/* ✅ DYNAMIC MOOD PILLS */}
            {insight?.moods && (
                <div className="flex flex-wrap gap-2">
                    {insight.moods.map((mood: string) => (
                        <span
                            key={mood}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm bg-white/40 backdrop-blur-md"
                            style={{ color: theme.text }}
                        >
                            {mood}
                        </span>
                    ))}
                </div>
            )}

            {/* ✅ DYNAMIC FOCUS PILLS */}
            {insight?.focus && (
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-rove-stone opacity-60">
                        Symptom-Specific Recommendations
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {insight.focus.map((f: string) => (
                            <span
                                key={f}
                                className="px-3 py-1 rounded-full bg-white/60 border border-rove-stone/10 backdrop-blur-sm text-[11px] font-medium text-rove-charcoal"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="pt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rove-stone/40 border-t border-rove-stone/5 mt-2">
          <Sparkles className="w-3 h-3" />
          Powered by Llama 3.3 70B
        </div>
      </div>
    </div>
  );
}