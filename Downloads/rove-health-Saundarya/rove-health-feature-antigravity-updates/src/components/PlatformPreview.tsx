"use client";

import { motion } from "framer-motion";
import { Activity, Calendar, Utensils, Brain, Battery } from "lucide-react";

export function PlatformPreview() {
    return (
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800 relative">
                {/* App Content Mockup */}
                <div className="flex flex-col h-full bg-rove-cream/20">
                    {/* Header */}
                    <div className="pt-12 pb-4 px-6 bg-white shadow-sm z-10">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-xs font-bold text-rove-stone uppercase tracking-wider">Today</div>
                            <div className="w-8 h-8 rounded-full bg-rove-charcoal/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-rove-charcoal">JD</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-heading text-rove-charcoal">Day 14</h3>
                        <p className="text-sm text-rove-red font-medium">Ovulatory Phase</p>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                        {/* Daily Insight */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-rove-stone/5"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Brain className="w-4 h-4 text-rove-red" />
                                <span className="text-xs font-bold text-rove-stone uppercase">Focus</span>
                            </div>
                            <p className="text-sm text-rove-charcoal">Your communication skills are at their peak today. Schedule that important meeting.</p>
                        </motion.div>

                        {/* Nutrition */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-rove-stone/5"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Utensils className="w-4 h-4 text-rove-green" />
                                <span className="text-xs font-bold text-rove-stone uppercase">Nutrition</span>
                            </div>
                            <p className="text-sm text-rove-charcoal mb-3">Focus on lighter grains and fresh veggies to support liver function.</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                <div className="w-16 h-16 bg-rove-green/10 rounded-lg shrink-0 flex items-center justify-center text-xs text-rove-green font-medium">Quinoa</div>
                                <div className="w-16 h-16 bg-rove-red/10 rounded-lg shrink-0 flex items-center justify-center text-xs text-rove-red font-medium">Berries</div>
                                <div className="w-16 h-16 bg-orange-100 rounded-lg shrink-0 flex items-center justify-center text-xs text-orange-600 font-medium">Salmon</div>
                            </div>
                        </motion.div>

                        {/* Movement */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-rove-stone/5"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-rove-stone uppercase">Movement</span>
                            </div>
                            <p className="text-sm text-rove-charcoal mb-2">High intensity interval training is best tolerated right now.</p>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-rove-stone">Energy Level</span>
                                <span className="text-[10px] font-bold text-blue-500">High</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Nav */}
                    <div className="bg-white border-t border-rove-stone/10 p-4 flex justify-between items-center px-8">
                        <Calendar className="w-6 h-6 text-rove-red" />
                        <Activity className="w-6 h-6 text-rove-stone/40" />
                        <Utensils className="w-6 h-6 text-rove-stone/40" />
                    </div>
                </div>
            </div>
        </div>
    );
}
