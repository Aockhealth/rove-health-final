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
        <section className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[2.5rem] shadow-sm mb-10 overflow-hidden relative group">
            <div className={`absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-[80px] opacity-20 ${theme.blob}`} />

            <h3 className="font-heading text-lg text-rove-charcoal mb-6 text-center relative z-10">{data.title}</h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Visual Gauge */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0" style={{ background: gradient }}>
                    <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner pt-1">
                        <div className="text-center">
                            <span className="text-[10px] text-rove-stone font-medium uppercase tracking-wider">Target</span>
                            <div className="font-heading text-xl text-rove-charcoal leading-none">
                                {data.calories ? data.calories : "2000"}
                            </div>
                            <span className="text-[10px] text-rove-stone/60">kcal</span>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-4 w-full md:w-auto">
                    {/* Protein */}
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-rove-charcoal/80">
                            {data.proteinDesc || "Protein"}
                        </span>
                        <div className="flex items-center gap-2 min-w-[100px] justify-end">
                            <div className="w-3 h-3 rounded-full bg-[#DC4C3E] shrink-0"></div>
                            <span className="font-bold text-sm text-rove-charcoal">
                                {data.proteinLabel || `${data.protein}g`}
                            </span>
                        </div>
                    </div>
                    {/* Fats */}
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-rove-charcoal/80">
                            {data.fatsDesc || "Healthy Fats"}
                        </span>
                        <div className="flex items-center gap-2 min-w-[100px] justify-end">
                            <div className="w-3 h-3 rounded-full bg-[#8FBC8F] shrink-0"></div>
                            <span className="font-bold text-sm text-rove-charcoal">
                                {data.fatsLabel || `${data.fats}g`}
                            </span>
                        </div>
                    </div>
                    {/* Carbs */}
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-rove-charcoal/80">
                            {data.carbsDesc || "Complex Carbs"}
                        </span>
                        <div className="flex items-center gap-2 min-w-[100px] justify-end">
                            <div className="w-3 h-3 rounded-full bg-[#F59E0B] shrink-0"></div>
                            <span className="font-bold text-sm text-rove-charcoal">
                                {data.carbsLabel || `${data.carbs}g`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
