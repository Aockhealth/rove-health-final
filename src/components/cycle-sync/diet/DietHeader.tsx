"use client";

import { motion } from "framer-motion";

interface DietHeaderProps {
    phase: string;
    data: {
        title: string;
        hormone_insight: string;
        narrative: string;
        goal: string;
        color: string;
    };
    theme: any; // Using custom theme object from page
}

export function DietHeader({ phase, data, theme }: DietHeaderProps) {
    if (!data) return null;

    return (
        <section className="mb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-white/40 border border-white/40 shadow-sm backdrop-blur-xl group hover:shadow-lg hover:bg-white/50 transition-all duration-500`}
            >
                {/* Background decorative blob - Dynamic from Theme */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-40 ${theme.blob}`} />
                <div className={`absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] opacity-20 ${theme.color.replace('text-', 'bg-')}`} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${theme.badge} rounded-full border`}>
                            {data.title}
                        </span>
                        <span className="text-xs text-rove-stone font-medium flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} />
                            {data.hormone_insight}
                        </span>
                    </div>

                    <h2 className="font-heading text-2xl md:text-3xl text-rove-charcoal leading-tight mb-3">
                        {data.narrative}
                    </h2>

                    <div className="flex items-start gap-4 mt-6 bg-white/40 p-4 rounded-[1.5rem] border border-white/50 hover:bg-white/60 transition-colors">
                        <div className={`w-1.5 h-full min-h-[40px] rounded-full ${theme.accent}`} />
                        <div>
                            <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wide block mb-0.5">Primary Focus</span>
                            <p className="text-sm text-rove-charcoal font-medium leading-relaxed">
                                {data.goal}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
