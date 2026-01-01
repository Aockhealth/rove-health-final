"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Flame, Moon, Brain, Leaf, Sun } from "lucide-react";

interface PhaseInsightCardProps {
  phase: "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";
  day?: number;
  insight?: any;
  theme: any;
}

export function PhaseInsightCard({ phase, insight, day, theme }: PhaseInsightCardProps) {
  // Theme is now passed from parent

  return (
    <div
      className={cn("relative overflow-hidden rounded-[2rem] border shadow-sm p-8 h-full flex flex-col transition-all duration-700", theme.cardBg, theme.border)}
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
          <span className={cn("text-[10px] font-bold uppercase tracking-[0.25em]", theme.color)}>
            DAY {day} INSIGHT
          </span>
          <h3 className={cn("font-heading text-2xl mt-1", theme.color)}>
            Personalized AI Analysis
          </h3>
        </div>

        <div className={cn("w-10 h-10 rounded-full opacity-20", theme.accent)} />

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
                  className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm bg-white/40 backdrop-blur-md", theme.color)}
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
    </div >
  );
}