"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { SegmentedDoughnut } from "@/components/ui/SegmentedDoughnut";
import { motion, AnimatePresence } from "framer-motion";

/** * Mapping colors from page.tsx
 */
const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    "Follicular": { bg: "rgba(236, 253, 245, 0.5)", text: "#065f46", border: "rgba(16, 185, 129, 0.1)" }, 
    "Luteal": { bg: "rgba(255, 251, 235, 0.5)", text: "#92400e", border: "rgba(245, 158, 11, 0.1)" },     
    "Menstrual": { bg: "rgba(255, 241, 242, 0.5)", text: "#9f1239", border: "rgba(225, 29, 72, 0.1)" },    
    "Ovulatory": { bg: "rgba(245, 243, 255, 0.5)", text: "#5b21b6", border: "rgba(139, 92, 246, 0.1)" },   
};

interface Segment {
  value: number;
  id: string;   
  hex: string;  
  label: string;
}

export function AiAnalysisCard({
  logs,
  phaseCounts,
  phase = "Luteal" // ✅ Prop passed from page.tsx
}: {
  logs: any[];
  phaseCounts: Record<string, number>;
  phase?: string;
}) {
  /* ---------------- THEME ---------------- */
  const theme = PHASE_COLORS[phase] || PHASE_COLORS["Luteal"];

  /* ---------------- DATA ---------------- */
  const rawData: Segment[] = [
    { value: phaseCounts["Menstrual"] || 0, id: "grad-period", hex: "#F43F5E", label: "Period" },
    { value: phaseCounts["Follicular"] || 0, id: "grad-follicular", hex: "#F472B6", label: "Follicular" },
    { value: phaseCounts["Ovulatory"] || 0, id: "grad-ovulatory", hex: "#6366F1", label: "Ovulatory" },
    { value: phaseCounts["Luteal"] || 0, id: "grad-luteal", hex: "#F59E0B", label: "Luteal" },
  ];

  const chartData = rawData
    .filter(d => d.value > 0)
    .map(d => ({ ...d, color: d.id })); 

  const hasData = chartData.length > 0;

  const dominantPhase = hasData
    ? [...chartData].sort((a, b) => b.value - a.value)[0].label
    : "—";

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div 
      className="relative p-6 rounded-[2rem] border shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-700"
      style={{ 
        backgroundColor: theme.bg, // 🎨 Background wash from props
        borderColor: theme.border 
      }}
    >

      {/* BACKGROUND TEXTURE: Picking up phase color via multiply */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: "url('/textures/card-bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "140%",
          backgroundPosition: "bottom right",
          opacity: 0.85, 
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between">
        <div className="flex-1 space-y-5 w-full">
          <h3 className="font-heading text-lg text-rove-charcoal flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Pattern Analysis
          </h3>

          <div className="space-y-2">
            <p className="text-sm text-rove-stone">
              Most symptoms logged during your
            </p>

            <span
              className={`
                inline-flex items-center px-4 py-1.5 rounded-full
                text-sm font-semibold shadow-sm w-fit
                ${
                  dominantPhase === "Period"
                    ? "bg-rose-100 text-rose-700"
                    : dominantPhase === "Follicular"
                    ? "bg-pink-100 text-pink-700"
                    : dominantPhase === "Ovulatory"
                    ? "bg-indigo-100 text-indigo-700"
                    : dominantPhase === "Luteal"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-600"
                }
              `}
            >
              {dominantPhase} phase
            </span>
          </div>

          <div className="h-px bg-rove-stone/10 my-3" />

          {hasData && (
            <div className="grid grid-cols-2 gap-y-3 gap-x-10 text-[11px] font-semibold tracking-wide">
              {chartData.map((d, i) => (
                <div
                  key={d.label}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                    activeIndex !== null && activeIndex !== i
                      ? "opacity-40"
                      : "opacity-100"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ background: d.hex }}
                  />
                  <span className="text-rove-charcoal">
                    {d.label.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-20">
          <SegmentedDoughnut
            size={170}
            thickness={36}
            gap={4}
            data={chartData}
            onHoverChange={setActiveIndex}
          />
        </div>
      </div>
    </div>
  );
}