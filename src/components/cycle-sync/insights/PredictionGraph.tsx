"use client";

import { motion } from "framer-motion";
import { ChevronRight, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ RESTORED: Phase Color Mapping for dynamic backgrounds
const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    "Follicular": { bg: "rgba(236, 253, 245, 0.5)", text: "#065f46", border: "rgba(16, 185, 129, 0.1)" }, // SS2
    "Luteal": { bg: "rgba(255, 251, 235, 0.5)", text: "#92400e", border: "rgba(245, 158, 11, 0.1)" },     // SS3
    "Menstrual": { bg: "rgba(255, 241, 242, 0.5)", text: "#9f1239", border: "rgba(225, 29, 72, 0.1)" },    // SS4
    "Ovulatory": { bg: "rgba(245, 243, 255, 0.5)", text: "#5b21b6", border: "rgba(139, 92, 246, 0.1)" },   // SS5
};

// --- GEOMETRY CONSTANTS ---
const SVG_W = 240;
const SVG_H = 160;
const CX = SVG_W / 2;
const CY = SVG_H * 0.65; 
const RADIUS = 75;
const START_ANGLE = 150; 
const END_ANGLE = 390;   
const TOTAL_SWEEP = END_ANGLE - START_ANGLE;

function getCoords(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function getGradientRange(days: number) {
  if (days <= 7) return { start: "#e11d48", end: "#fda4af", label: "Imminent" };
  if (days <= 14) return { start: "#f97316", end: "#fcd34d", label: "Approaching" };
  return { start: "#059669", end: "#6ee7b7", label: "Distant" };
}

export function PredictionGraph({ 
  nextDate, 
  cycleLength = 28,
  phase = "Luteal" // ✅ Added phase prop to drive the theme
}: { 
  nextDate: string; 
  cycleLength?: number;
  phase?: string;
}) {
  const target = new Date(nextDate);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const safeDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const progress = Math.min(1, (cycleLength - safeDaysLeft) / cycleLength);
  const colorTheme = getGradientRange(safeDaysLeft);
  
  // ✅ Select theme based on current phase
  const theme = PHASE_COLORS[phase] || PHASE_COLORS["Luteal"];

  const labelInterval = cycleLength <= 20 ? 4 : 7;

  const ticks = Array.from({ length: cycleLength + 1 }, (_, i) => {
    const angle = START_ANGLE + (i / cycleLength) * TOTAL_SWEEP;
    const displayValue = cycleLength - i;
    const isMajor = displayValue % labelInterval === 0 || displayValue === cycleLength || displayValue === 1;

    return { 
        angle, 
        inner: getCoords(angle, RADIUS - 6), 
        outer: getCoords(angle, RADIUS), 
        text: getCoords(angle, RADIUS - 18), 
        value: displayValue === 0 ? 1 : displayValue,
        isMajor 
    };
  });

  const dateRange = `${target.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(target.getTime() + 4 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div 
      className="relative overflow-hidden rounded-[2rem] border shadow-lg p-6 h-full flex flex-col transition-all duration-700"
      style={{ 
        backgroundColor: theme.bg, // ✅ Dynamic background wash
        borderColor: theme.border 
      }}
    >
       {/* Texture Overlay */}
       <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" style={{ backgroundImage: "url('/textures/card-bg.png')", backgroundSize: 'cover' }} />
       
       <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-heading text-lg text-rove-charcoal">Period Prediction</h3>
          <ChevronRight className="w-5 h-5 text-rove-stone" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full h-40">
            <svg width="100%" height="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="overflow-visible">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={colorTheme.start} />
                  <stop offset="100%" stopColor={colorTheme.end} />
                </linearGradient>
              </defs>

              <path d={`M ${getCoords(START_ANGLE, RADIUS).x} ${getCoords(START_ANGLE, RADIUS).y} A ${RADIUS} ${RADIUS} 0 1 1 ${getCoords(END_ANGLE, RADIUS).x} ${getCoords(END_ANGLE, RADIUS).y}`} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8" strokeLinecap="butt" />

              <motion.path d={`M ${getCoords(START_ANGLE, RADIUS).x} ${getCoords(START_ANGLE, RADIUS).y} A ${RADIUS} ${RADIUS} 0 1 1 ${getCoords(END_ANGLE, RADIUS).x} ${getCoords(END_ANGLE, RADIUS).y}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="butt" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 1.5, ease: "easeOut" }} />

              {ticks.map((tick, i) => (
                <g key={i}>
                  <line x1={tick.inner.x} y1={tick.inner.y} x2={tick.outer.x} y2={tick.outer.y} stroke="rgba(0,0,0,0.2)" strokeWidth={tick.isMajor ? 2 : 1} />
                  {tick.isMajor && (
                    <text x={tick.text.x} y={tick.text.y} fontSize="9" fontWeight="700" textAnchor="middle" fill="rgba(0,0,0,0.5)">
                        {tick.value}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-[10px] font-bold text-rove-stone uppercase tracking-widest">Starts In</span>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-6xl text-rove-charcoal tracking-tighter">{safeDaysLeft}</span>
                <span className="text-sm font-medium text-rove-stone">Days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs p-2 bg-white/40 rounded-xl border border-black/5">
                <span className="text-rove-stone flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Likely Window</span>
                <span className="font-bold text-rove-charcoal">{dateRange}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 bg-white/40 rounded-xl border border-black/5">
                <span className="text-rove-stone flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Status</span>
                <span className={cn("font-bold", safeDaysLeft <= 7 ? "text-rose-500" : "text-emerald-600")}>{colorTheme.label}</span>
            </div>
        </div>
      </div>
    </div>
  );
}