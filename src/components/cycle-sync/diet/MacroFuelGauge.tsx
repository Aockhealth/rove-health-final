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
    };
    theme: any;
}

export function MacroFuelGauge({ data, theme }: MacroFuelGaugeProps) {
    if (!data) return null;

    // Calculate total weight to derive percentages for the visual gauge
    // Note: This is an approximation based on weight, not calories, for the circular chart visualization.
    // Ideally we'd map back to calories, but weight ratio is fine for visual distinction.
    const totalGrams = data.protein + data.fats + data.carbs || 1;

    // Calculate visual percentages
    const pPct = Math.round((data.protein / totalGrams) * 100);
    const fPct = Math.round((data.fats / totalGrams) * 100);
    // const cPct gets the rest

    // Gradient string: Protein (Red), Fats (Green), Carbs (Blue/Yellow)
    const gradient = `conic-gradient(
        #ef4444 0% ${pPct}%, 
        #10b981 ${pPct}% ${pPct + fPct}%, 
        #eab308 ${pPct + fPct}% 100%
    )`;

    return (
        <section className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[2.5rem] shadow-sm mb-10 overflow-hidden relative group">
            <div className={`absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-[80px] opacity-20 ${theme.blob}`} />

            <h3 className="font-heading text-lg text-rove-charcoal mb-6 text-center relative z-10">{data.title}</h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Visual Gauge */}
                <div className="relative w-40 h-40 rounded-full" style={{ background: gradient }}>
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
                    <div className="flex items-center justify-between md:justify-start gap-4">
                        <div className="flex items-center gap-2 w-24">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="font-bold text-sm">{data.protein}g</span>
                        </div>
                        <span className="text-xs text-rove-stone">Protein (Blood Replenishment)</span>
                    </div>
                    <div className="flex items-center justify-between md:justify-start gap-4">
                        <div className="flex items-center gap-2 w-24">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="font-bold text-sm">{data.fats}g</span>
                        </div>
                        <span className="text-xs text-rove-stone">Healthy Fats (Block Cramps)</span>
                    </div>
                    <div className="flex items-center justify-between md:justify-start gap-4">
                        <div className="flex items-center gap-2 w-24">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="font-bold text-sm">{data.carbs}g</span>
                        </div>
                        <span className="text-xs text-rove-stone">Complex Carbs (Stable Mood)</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
