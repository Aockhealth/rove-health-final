"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface MacroFuelGaugeProps {
    data: {
        title: string;
        protein: number;
        fats: number;
        carbs: number;
        calories?: number;
        proteinLabel?: string;
        fatsLabel?: string;
        carbsLabel?: string;
        proteinDesc?: string;
        fatsDesc?: string;
        carbsDesc?: string;
    };
    theme: any;
}

export function MacroFuelGauge({ data, theme }: MacroFuelGaugeProps) {
    if (!data) return null;

    // Calculate total weight to derive percentages for the visual gauge
    const totalGrams = data.protein + data.fats + data.carbs || 1;
    const pPct = Math.round((data.protein / totalGrams) * 100);
    const fPct = Math.round((data.fats / totalGrams) * 100);

    const gradient = `conic-gradient(
        #DC4C3E 0% ${pPct}%, 
        #8FBC8F ${pPct}% ${pPct + fPct}%, 
        #F59E0B ${pPct + fPct}% 100%
    )`;

    return (
        <section className="bg-white/50 backdrop-blur-xl border border-white/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm mb-6 sm:mb-10 overflow-hidden relative group">
            <div className={`absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-[80px] opacity-10 ${theme.blob}`} />

            <h3 className="font-heading text-base sm:text-lg text-rove-charcoal mb-4 sm:mb-6 text-center relative z-10">{data.title}</h3>

            <div className="flex flex-col items-center gap-4 sm:gap-8">
                {/* Visual Gauge - Slightly smaller on mobile */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full shrink-0" style={{ background: gradient }}>
                    <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <div className="text-center">
                            <span className="text-[8px] sm:text-[10px] text-rove-stone font-bold uppercase tracking-wider">Target</span>
                            <div className="font-heading text-lg sm:text-xl text-rove-charcoal leading-none">
                                {data.calories ? data.calories : "2000"}
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-rove-stone/60">kcal</span>
                        </div>
                    </div>
                </div>

                {/* Legend - Improved mobile layout */}
                <div className="space-y-2.5 sm:space-y-4 w-full max-w-xs">
                    {/* Protein */}
                    <div className="flex items-center justify-between gap-2 bg-white/60 rounded-xl px-3 py-2 sm:p-0 sm:bg-transparent">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#DC4C3E] shrink-0"></div>
                            <span className="text-xs sm:text-sm font-medium text-rove-charcoal/80 truncate">
                                {data.proteinDesc || "Protein"}
                            </span>
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-rove-charcoal whitespace-nowrap">
                            {data.proteinLabel || `${data.protein}g`}
                        </span>
                    </div>
                    {/* Fats */}
                    <div className="flex items-center justify-between gap-2 bg-white/60 rounded-xl px-3 py-2 sm:p-0 sm:bg-transparent">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#8FBC8F] shrink-0"></div>
                            <span className="text-xs sm:text-sm font-medium text-rove-charcoal/80 truncate">
                                {data.fatsDesc || "Healthy Fats"}
                            </span>
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-rove-charcoal whitespace-nowrap">
                            {data.fatsLabel || `${data.fats}g`}
                        </span>
                    </div>
                    {/* Carbs */}
                    <div className="flex items-center justify-between gap-2 bg-white/60 rounded-xl px-3 py-2 sm:p-0 sm:bg-transparent">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F59E0B] shrink-0"></div>
                            <span className="text-xs sm:text-sm font-medium text-rove-charcoal/80 truncate">
                                {data.carbsDesc || "Complex Carbs"}
                            </span>
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-rove-charcoal whitespace-nowrap">
                            {data.carbsLabel || `${data.carbs}g`}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
