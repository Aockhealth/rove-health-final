"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Activity, Brain } from "lucide-react";

export function MentalHealthCheckCard({ theme }: { theme?: any }) {
  // Fallback theme to prevent errors if undefined
  const safeTheme = theme || {
    bg: "bg-white",
    border: "border-gray-200",
    color: "text-gray-800",
    blob: "bg-gray-200",
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border shadow-sm p-7 flex flex-col bg-white/40 backdrop-blur-xl border-white/40">
      
      {/* Theme Background Blob (Matches CycleOverviewCard) */}
      <div
        className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none",
          safeTheme.blob
        )}
      />

      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <div className="mb-6">
          <h3 className="font-heading text-xl text-rove-charcoal mb-1">
            How have you really been feeling lately?
          </h3>
          <p className="text-[10px] text-rove-stone uppercase tracking-wider font-bold opacity-70">
            Reflects how you’ve felt over the past 2 weeks
          </p>
        </div>

        {/* Assessment Links (Styled like the Rhythm/Status blocks) */}
        <div className="flex flex-col gap-3">
          <Link
            href="/cycle-sync/wellbeing/intro?type=phq9"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-black/5 hover:bg-white/80 transition-all shadow-sm hover:shadow"
          >
            {/* Icon matching CycleOverviewCard style */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-white shrink-0 transition-transform group-hover:scale-105",
                safeTheme.color
              )}
            >
              <Brain className="w-5 h-5" />
            </div>
            
            <div>
              <h4 className="font-heading text-rove-charcoal text-base mb-0.5">
                Mood check <span className={cn("text-sm", safeTheme.color)}>(PHQ-9)</span>
              </h4>
              <p className="text-xs text-rove-stone leading-relaxed">
                A widely used screening tool for low mood and depressive symptoms.
              </p>
            </div>
          </Link>

          <Link
            href="/cycle-sync/wellbeing/intro?type=gad7"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-black/5 hover:bg-white/80 transition-all shadow-sm hover:shadow"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-white shrink-0 transition-transform group-hover:scale-105",
                safeTheme.color
              )}
            >
              <Activity className="w-5 h-5" />
            </div>
            
            <div>
              <h4 className="font-heading text-rove-charcoal text-base mb-0.5">
                Anxiety check <span className={cn("text-sm", safeTheme.color)}>(GAD-7)</span>
              </h4>
              <p className="text-xs text-rove-stone leading-relaxed">
                A widely used screening tool for anxiety symptoms.
              </p>
            </div>
          </Link>
        </div>

        {/* Custom Divider (Matches CycleOverviewCard) */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-rove-stone/20 to-transparent my-5" />

        {/* Footer Disclaimer */}
        <div className="text-center">
          <p className="text-[10px] text-rove-stone font-bold uppercase tracking-widest opacity-70">
            For self-reflection only. Not a diagnosis.
          </p>
        </div>

      </div>
    </div>
  );
}