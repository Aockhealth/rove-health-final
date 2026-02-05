"use client";

import { Flame, Drumstick, Droplets, Wheat } from "lucide-react";
import { motion } from "framer-motion";

interface MacroBreakdown {
    grams: number;
    percentage: number;
}

interface MacroTargetCardProps {
    calories: number;
    macros: {
        protein: MacroBreakdown;
        fats: MacroBreakdown;
        carbs: MacroBreakdown;
    };
    phaseNutritionFocus?: string;
    hydrationGoal?: number;
}

export default function MacroTargetCard({
    calories,
    macros,
    phaseNutritionFocus,
    hydrationGoal = 2
}: MacroTargetCardProps) {

    const macroRings = [
        {
            name: 'Protein',
            ...macros.protein,
            color: 'from-blue-400 to-indigo-500',
            bg: 'bg-blue-50',
            icon: Drumstick,
            textColor: 'text-blue-600'
        },
        {
            name: 'Carbs',
            ...macros.carbs,
            color: 'from-amber-400 to-orange-500',
            bg: 'bg-amber-50',
            icon: Wheat,
            textColor: 'text-amber-600'
        },
        {
            name: 'Fats',
            ...macros.fats,
            color: 'from-rose-400 to-pink-500',
            bg: 'bg-rose-50',
            icon: Droplets,
            textColor: 'text-rose-600'
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white via-orange-50/30 to-rose-50/30 rounded-3xl p-6 border border-orange-100/50 shadow-lg"
        >
            {/* Calories Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-full mb-3 shadow-lg shadow-orange-200">
                    <Flame className="w-5 h-5" />
                    <span className="text-lg font-bold">{calories} kcal</span>
                </div>
                <p className="text-sm text-rove-stone/70">Daily Target</p>
            </div>

            {/* Macro Rings */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {macroRings.map((macro, i) => (
                    <motion.div
                        key={macro.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${macro.bg} rounded-2xl p-4 text-center`}
                    >
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white shadow-sm flex items-center justify-center">
                            <macro.icon className={`w-5 h-5 ${macro.textColor}`} />
                        </div>
                        <div className={`text-2xl font-bold ${macro.textColor}`}>
                            {macro.grams}g
                        </div>
                        <div className="text-xs text-rove-stone/60 mt-1">
                            {macro.percentage}% • {macro.name}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Phase Focus */}
            {phaseNutritionFocus && (
                <div className="bg-white/60 rounded-xl p-4 mb-4 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rove-stone/50 block mb-1">
                        Phase Focus
                    </span>
                    <p className="text-sm text-rove-charcoal font-medium">
                        {phaseNutritionFocus}
                    </p>
                </div>
            )}

            {/* Hydration Goal */}
            <div className="flex items-center justify-center gap-2 text-sm text-rove-stone">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <span>Hydration: <span className="font-semibold text-cyan-600">{hydrationGoal}L</span> water</span>
            </div>
        </motion.div>
    );
}
