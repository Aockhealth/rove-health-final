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
  nextPeriodDate: string; // 🔹 REQUIRED NOW
  phase?: string;
  theme: any;
}) {
  const safeTheme = theme || {
    bg: "bg-white",
    border: "border-gray-200",
    color: "text-gray-800",
    blob: "bg-gray-200",
  };

  // --- Prediction Logic ---
  const target = new Date(nextPeriodDate);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const status = getPredictionStatus(daysLeft);

  const likelyWindow = `${target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${new Date(
    target.getTime() + 4 * 86400000
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border shadow-sm p-7 h-full flex flex-col bg-white/40 backdrop-blur-xl border-white/40">
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
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40",
          safeTheme.blob
        )}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* --- TOP: STATS --- */}
        <div className="grid grid-cols-2 w-full">
          {/* Avg Flow */}
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
              <div className="w-4 h-4 bg-current rounded-full opacity-20" />
            </div>
            <div>
              <span className="block text-3xl font-heading text-rove-charcoal">
                <span className={safeTheme.color}>{periodLength}</span>
                <span className="text-sm text-rove-stone ml-1">days</span>
              </span>
              <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">
                Avg Flow
              </span>
            </div>
          </div>

          {/* Avg Cycle */}
          <div className="flex flex-col gap-3 border-l border-rove-stone/10 pl-6">
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
              <div className="w-4 h-4 bg-current rounded-full opacity-20" />
            </div>
            <div>
              <span className="block text-3xl font-heading text-rove-charcoal">
                <span className={safeTheme.color}>{cycleLength}</span>
                <span className="text-sm text-rove-stone ml-1">days</span>
              </span>
              <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">
                Avg Cycle
              </span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rove-stone/20 to-transparent my-5" />

        {/* --- PREDICTION INFO (Moved from PredictionGraph) --- */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs p-2 bg-white/50 rounded-xl border border-black/5">
            <span className="flex items-center gap-2 text-rove-stone">
              <Calendar className="w-3.5 h-3.5" />
              Starts In
            </span>
            <span className="font-heading text-lg text-rove-charcoal">
              {daysLeft} days
            </span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 bg-white/50 rounded-xl border border-black/5">
            <span className="flex items-center gap-2 text-rove-stone">
              <Calendar className="w-3.5 h-3.5" />
              Likely Window
            </span>
            <span className="font-heading text-rove-charcoal">
              {likelyWindow}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 bg-white/50 rounded-xl border border-black/5">
            <span className="flex items-center gap-2 text-rove-stone">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Status
            </span>
            <span className={cn("font-heading", status.color)}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-rove-stone/20 to-transparent my-5" />

        {/* --- RHYTHM --- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-white/80",
                safeTheme.color
              )}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading text-rove-charcoal text-base">
                {isRegular ? "Regular" : "Irregular"}{" "}
                <span className={safeTheme.color}>Rhythm</span>
              </p>
              <p className="text-[10px] text-rove-stone uppercase tracking-wider font-bold opacity-70">
                {isRegular ? "Normal Deviation" : "Variation Detected"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}