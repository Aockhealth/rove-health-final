"use client";

import { Activity, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function getPredictionStatus(daysLeft: number) {
  if (daysLeft <= 7) return { label: "Imminent", color: "text-phase-menstrual" };
  if (daysLeft <= 14) return { label: "Approaching", color: "text-phase-ovulatory" };
  return { label: "Distant", color: "text-phase-follicular" };
}

export function CycleOverviewCard({
  cycleLength,
  periodLength,
  isRegular,
  nextPeriodDate,
  phase = "Luteal",
  theme,
}: {
  cycleLength: number;
  periodLength: number;
  isRegular: boolean;
  nextPeriodDate?: string | null;
  phase?: string;
  theme: any;
}) {
  const safeTheme = theme || {
    bg: "bg-white/40",
    border: "border-white/40",
    color: "text-rove-charcoal",
    blob: "bg-rove-stone/20",
  };

  // --- Prediction Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = nextPeriodDate ? new Date(nextPeriodDate) : null;
  if (target) target.setHours(0, 0, 0, 0);

  const diffTime = target ? target.getTime() - today.getTime() : null;
  const rawDays = diffTime !== null ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;
  const lateBy = rawDays !== null && rawDays < 0 ? Math.abs(rawDays) : null;
  const daysLeft = rawDays !== null && rawDays >= 0 ? rawDays : null;

  const status = lateBy !== null
    ? { label: "Late", color: "text-phase-menstrual" }
    : (daysLeft !== null ? getPredictionStatus(daysLeft) : { label: "Unknown", color: "text-rove-stone" });

  const likelyWindow = target && lateBy === null ? `${target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${new Date(
    target.getTime() + 4 * 86400000
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}` : "—";

  return (
    <div className={cn(
      "relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-5 flex flex-col shadow-xl border transition-all overflow-hidden",
      safeTheme.border || "border-rove-stone/10"
    )}>
      {/* Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: "url('/textures/card-bg.png')",
          backgroundSize: "cover",
        }}
      />

      {/* Blob */}
      <div
        className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none",
          safeTheme.blob
        )}
      />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Top: Next Period Focus */}
        <div className="flex flex-col items-center justify-center text-center p-5 bg-white/40 rounded-[1.5rem] border border-white/50 shadow-sm relative overflow-hidden">
          <div className={cn("absolute inset-0 opacity-10 blur-xl pointer-events-none", safeTheme.blob)} />

          <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider mb-2 flex items-center gap-1.5 relative z-10">
            <Calendar className="w-3.5 h-3.5" /> Next Period
          </span>
          <div className="flex items-baseline gap-1.5 mb-2 relative z-10">
            <span className={cn("text-4xl sm:text-5xl font-heading font-medium tracking-tight", safeTheme.color)}>
              {lateBy !== null ? `Late ${lateBy}` : (daysLeft !== null ? daysLeft : "—")}
            </span>
            <span className="text-sm font-medium text-rove-stone">
              {lateBy !== null ? 'days' : 'days'}
            </span>
          </div>

          {/* Status & Window */}
          {/* Window */}
          <div className="flex flex-col items-center justify-center mt-3 mb-1 w-full px-4 py-2.5 bg-white/40 rounded-[1rem] border border-white/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] backdrop-blur-md relative z-10 transition-all hover:bg-white/50">
            <span className="text-[9px] font-bold text-rove-stone uppercase tracking-widest mb-1 opacity-80">Likely Window</span>
            <span className="font-heading text-rove-charcoal font-semibold text-sm md:text-base tracking-wide">{likelyWindow}</span>
          </div>
        </div>

        {/* Bottom Grid: Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="py-3 px-2 bg-white/50 rounded-[1.2rem] border border-white/60 flex flex-col items-center text-center shadow-sm">
            <span className="text-[9px] font-bold text-rove-stone uppercase tracking-wider mb-1">Cycle</span>
            <span className="font-heading text-lg sm:text-xl text-rove-charcoal leading-none">
              {cycleLength}<span className="text-xs text-rove-stone ml-0.5">d</span>
            </span>
          </div>
          <div className="py-3 px-2 bg-white/50 rounded-[1.2rem] border border-white/60 flex flex-col items-center text-center shadow-sm">
            <span className="text-[9px] font-bold text-rove-stone uppercase tracking-wider mb-1">Flow</span>
            <span className="font-heading text-lg sm:text-xl text-rove-charcoal leading-none">
              {periodLength}<span className="text-xs text-rove-stone ml-0.5">d</span>
            </span>
          </div>
          <div className="py-3 px-2 bg-white/50 rounded-[1.2rem] border border-white/60 flex flex-col items-center text-center shadow-sm">
            <span className="text-[9px] font-bold text-rove-stone uppercase tracking-wider mb-1">Rhythm</span>
            <span className="font-heading text-sm sm:text-base text-rove-charcoal leading-none flex items-center gap-1 mt-0.5 sm:mt-1">
              <Activity className={cn("w-3.5 h-3.5", safeTheme.color)} />
              {isRegular ? "Reg" : "Irreg"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
