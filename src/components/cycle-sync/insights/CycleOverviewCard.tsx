"use client";
import Image from "next/image";
import { Activity } from "lucide-react";

export function CycleOverviewCard({
    cycleLength,
    periodLength,
    isRegular,
    phase = "Luteal",
    theme
}: {
    cycleLength: number,
    periodLength: number,
    isRegular: boolean,
    phase?: string,
    theme: any
}) {
    // If theme is missing (fallback), use a safe default or expected structure
    const safeTheme = theme || { bg: "bg-white", border: "border-gray-200", color: "text-gray-800" };

    return (
        <div
            className={`relative overflow-hidden rounded-[2rem] border shadow-sm p-7 h-full flex flex-col transition-all duration-700 bg-white/40 backdrop-blur-xl border-white/40`}
        >
            {/* 🌸 TEXTURE BACKGROUND (Subtler) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                style={{
                    backgroundImage: "url('/textures/card-bg.png')", // Ensure this asset exists or remove
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                }}
            />

            {/* Dynamic Blob for Card */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 ${safeTheme.blob}`} />

            <div className="relative z-10 flex flex-col h-full justify-between">

                {/* TOP SECTION: Stats Grid */}
                <div className="grid grid-cols-2 w-full flex-1 items-center">
                    {/* AVG FLOW */}
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0 shadow-sm text-rove-stone">
                            {/* Replaced Image with Icon for consistency if image missing, or keep Image if preferred. Keeping Image for now but verifying path. */}
                            <div className="w-4 h-4 bg-current rounded-full opacity-20" /> {/* Placeholder/Icon */}
                        </div>
                        <div>
                            <span className="block text-3xl font-heading text-rove-charcoal leading-none">
                                <span className={safeTheme.color}>{periodLength}</span>
                                <span className="text-sm font-sans text-rove-stone font-medium ml-1">days</span>
                            </span>
                            <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">Avg Flow</span>
                        </div>
                    </div>

                    {/* SEPARATOR */}
                    <div className="flex flex-col gap-3 border-l border-rove-stone/10 pl-6">
                        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0 shadow-sm text-rove-stone">
                            <div className="w-4 h-4 bg-current rounded-full opacity-20" />
                        </div>
                        <div>
                            <span className="block text-3xl font-heading text-rove-charcoal leading-none">
                                <span className={safeTheme.color}>{cycleLength}</span>
                                <span className="text-sm font-sans text-rove-stone font-medium ml-1">days</span>
                            </span>
                            <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">Avg Cycle</span>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-rove-stone/20 to-transparent my-6" />

                {/* BOTTOM SECTION: Regularity */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 bg-white/80 ${safeTheme.color}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-heading text-rove-charcoal text-base">
                                {isRegular ? "Regular" : "Irregular"} <span className={safeTheme.color}>Rhythm</span>
                            </p>
                            <p className="text-[10px] text-rove-stone uppercase tracking-wider font-bold opacity-70">
                                {isRegular ? "Normal Deviation" : "Variation Detected"}
                            </p>
                        </div>
                    </div>

                    {/* Visual Sparkline */}
                    <div className="flex gap-1 items-end h-8 opacity-40">
                        {[3, 5, 4, 6, 4, 5, 3, 6].map((h, i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-full ${safeTheme.color.replace('text-', 'bg-')}`}
                                style={{
                                    height: `${h * 10 + 20}%`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}