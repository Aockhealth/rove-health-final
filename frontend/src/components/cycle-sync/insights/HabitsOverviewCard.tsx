"use client";

import { Droplet, Dumbbell, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitsOverviewCardProps {
    wellnessAverages?: {
        water: number;
        sleep: string | number;
        exerciseMinutes: number; // ✅ Updated from activeRate to exerciseMinutes
    };
    theme: any;
}

export function HabitsOverviewCard({
    wellnessAverages,
    theme,
}: HabitsOverviewCardProps) {
    const safeTheme = theme || {
        bg: "bg-white/40",
        border: "border-white/40",
        color: "text-rove-charcoal",
        blob: "bg-rove-stone/20",
    };

    // Extract averages from backend data (fallback to 0)
    const avgSleep = Number(wellnessAverages?.sleep || 0);
    const avgExercise = wellnessAverages?.exerciseMinutes || 0; // ✅ Extracting the new minutes variable
    const avgHydration = wellnessAverages?.water || 0;

    return (
        <div className={cn(
            "relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-5 flex flex-col shadow-xl border overflow-hidden",
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
                    "absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none",
                    safeTheme.blob
                )}
            />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className={cn("w-4 h-4", safeTheme.color)} />
                    <h3 className="font-heading text-lg text-rove-charcoal">30-Day Habits</h3>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Sleep Row */}
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]", safeTheme.color)}>
                                <Moon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-rove-charcoal">Avg Sleep</span>
                        </div>
                        <div className="text-right flex items-baseline gap-1">
                            {avgSleep > 0 ? (
                                <>
                                    <span className="font-heading text-lg font-medium text-rove-charcoal">{avgSleep}</span>
                                    <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">hrs</span>
                                </>
                            ) : (
                                <span className="text-[10px] text-rove-stone/60 uppercase tracking-wider font-bold">No Data</span>
                            )}
                        </div>
                    </div>

                    {/* Exercise Row */}
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]", safeTheme.color)}>
                                <Dumbbell className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-rove-charcoal">Avg Workout</span>
                        </div>
                        <div className="text-right flex items-baseline gap-1">
                            {avgExercise > 0 ? (
                                <>
                                    <span className="font-heading text-lg font-medium text-rove-charcoal">{avgExercise}</span>
                                    <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">mins</span>
                                </>
                            ) : (
                                <span className="text-[10px] text-rove-stone/60 uppercase tracking-wider font-bold">No Data</span>
                            )}
                        </div>
                    </div>

                    {/* Hydration Row */}
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]", safeTheme.color)}>
                                <Droplet className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-rove-charcoal">Avg Hydration</span>
                        </div>
                        <div className="text-right flex items-baseline gap-1">
                            {avgHydration > 0 ? (
                                <>
                                    <span className="font-heading text-lg font-medium text-rove-charcoal">{(avgHydration * 0.25).toFixed(1)}</span>
                                    <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">L/day</span>
                                </>
                            ) : (
                                <span className="text-[10px] text-rove-stone/60 uppercase tracking-wider font-bold">No Data</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}