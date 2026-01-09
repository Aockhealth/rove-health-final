"use client";

import { Scale, Target, TrendingDown, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface WeightProgressCardProps {
    currentWeight: number;
    targetWeight: number;
    startWeight: number;
    weeklyRate: number;
    startDate: string;
}

export default function WeightProgressCard({
    currentWeight,
    targetWeight,
    startWeight,
    weeklyRate,
    startDate
}: WeightProgressCardProps) {
    // Calculate progress
    const totalToLose = startWeight - targetWeight;
    const lostSoFar = startWeight - currentWeight;
    const progress = totalToLose > 0 ? Math.min(100, (lostSoFar / totalToLose) * 100) : 0;

    // Calculate remaining weeks
    const remaining = currentWeight - targetWeight;
    const weeksRemaining = remaining > 0 ? Math.ceil(remaining / weeklyRate) : 0;

    // Calculate target date
    const start = new Date(startDate);
    const targetDate = new Date(start);
    targetDate.setDate(targetDate.getDate() + (weeksRemaining * 7));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-6 border border-emerald-100/50 shadow-lg"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-heading font-semibold text-rove-charcoal">Weight Goal</h3>
                        <p className="text-xs text-rove-stone/70">Track your progress</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-600">{progress.toFixed(0)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-white/60 rounded-full overflow-hidden mb-6 shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                />
            </div>

            {/* Weight Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-rove-stone/60 text-xs mb-1">
                        <Scale className="w-3 h-3" />
                        <span>Start</span>
                    </div>
                    <span className="font-bold text-rove-charcoal">{startWeight} kg</span>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-teal-600 text-xs mb-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>Current</span>
                    </div>
                    <span className="font-bold text-teal-600 text-xl">{currentWeight} kg</span>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-rove-stone/60 text-xs mb-1">
                        <Target className="w-3 h-3" />
                        <span>Target</span>
                    </div>
                    <span className="font-bold text-rove-charcoal">{targetWeight} kg</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-rove-stone/60" />
                    <span className="text-rove-stone">
                        {weeksRemaining > 0 ? (
                            <>
                                <span className="font-semibold text-rove-charcoal">{weeksRemaining} weeks</span> to go
                            </>
                        ) : (
                            <span className="font-semibold text-emerald-600">Goal reached! 🎉</span>
                        )}
                    </span>
                </div>
                <span className="text-xs text-rove-stone/60">
                    @ {weeklyRate} kg/week
                </span>
            </div>
        </motion.div>
    );
}
