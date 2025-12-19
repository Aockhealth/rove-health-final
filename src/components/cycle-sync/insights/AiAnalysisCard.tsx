"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { SegmentedDoughnut } from "@/components/ui/SegmentedDoughnut";
import { motion, AnimatePresence } from "framer-motion";

interface Segment {
  value: number;
  id: string;
  hex: string;
  label: string;
}

export function AiAnalysisCard({
  logs,
  phaseCounts,
  phase = "Luteal",
  theme
}: {
  logs: any[];
  phaseCounts: Record<string, number>;
  phase?: string;
  theme: any;
}) {
  const safeTheme = theme || { bg: "bg-white", border: "border-gray-200", color: "text-gray-800", blob: "bg-gray-100" };

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
      className="relative p-6 rounded-[2rem] border shadow-sm overflow-hidden transition-all duration-700 bg-white/40 backdrop-blur-xl border-white/40"
    >

      {/* BACKGROUND TEXTURE (Subtle) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "url('/textures/card-bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      {/* Dynamic Blob */}
      <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-30 ${safeTheme.blob}`} />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between">
        <div className="flex-1 space-y-5 w-full">
          <h3 className="font-heading text-lg text-rove-charcoal flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${safeTheme.color}`} />
            Pattern Analysis
          </h3>

          <div className="space-y-2">
            <p className="text-sm text-rove-stone">
              Most symptoms logged during your
            </p>

            <span
              className={`
                inline-flex items-center px-4 py-1.5 rounded-full
                text-sm font-semibold shadow-sm w-fit border border-white/50
                ${dominantPhase === "Period"
                  ? "bg-rose-100/80 text-rose-700"
                  : dominantPhase === "Follicular"
                    ? "bg-teal-100/80 text-teal-700"
                    : dominantPhase === "Ovulatory"
                      ? "bg-amber-100/80 text-amber-800"
                      : dominantPhase === "Luteal"
                        ? "bg-indigo-100/80 text-indigo-700"
                        : "bg-stone-100/80 text-stone-600"
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
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeIndex !== null && activeIndex !== i
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