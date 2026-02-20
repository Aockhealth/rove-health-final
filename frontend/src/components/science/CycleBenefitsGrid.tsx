"use client";

import { motion } from "framer-motion";
import { Zap, Brain, Sun, HeartPulse, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CycleBenefitsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6 h-auto md:h-[600px]">

            {/* 1. ENERGY (Large Tile) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="md:col-span-4 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] bg-amber-500 text-white p-8 md:p-12 border border-white/20"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-heading text-4xl md:text-5xl mb-4 leading-tight">
                            Unlimit your <br /> energy.
                        </h3>
                        <p className="text-white/80 text-lg md:text-xl max-w-md leading-relaxed">
                            Stop running on stress hormones like cortisol. Learn to ride the wave of your natural chemistry for sustained, crash-free power.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 font-medium">
                        <ArrowUpRight className="w-5 h-5" />
                        <span>Optimized for Follicular Phase</span>
                    </div>
                </div>
            </motion.div>

            {/* 2. FOCUS (Medium Tile) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] bg-white border border-rove-stone/10 p-8 hover:shadow-lg transition-all duration-300"
            >
                <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600">
                        <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-2xl text-rove-charcoal mb-2">Deep Focus</h3>
                    <p className="text-rove-stone text-sm leading-relaxed">
                        Leverage the Luteal phase's natural detail-orientation.
                    </p>
                </div>
            </motion.div>

            {/* 3. SKIN (Medium Tile) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] bg-white border border-rove-stone/10 p-8 hover:shadow-lg transition-all duration-300"
            >
                <div className="absolute inset-0 bg-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-6 text-rose-600">
                        <Sun className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-2xl text-rove-charcoal mb-2">Radiant Skin</h3>
                    <p className="text-rove-stone text-sm leading-relaxed">
                        Support liver detox during Ovulation to prevent breakouts.
                    </p>
                </div>
            </motion.div>

        </div>
    );
}
