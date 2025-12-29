"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Info, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useRef } from "react";

interface SymptomDecoderProps {
    data: {
        title: string;
        subtitle: string;
        cards: {
            title: string;
            condition: string;
            biology: string;
            fix: string;
        }[];
    };
    theme: any;
}

export function SymptomDecoder({ data, theme }: SymptomDecoderProps) {
    if (!data) return null;

    return (
        <section className="mb-10">
            {/* Header */}
            <div className="px-2 mb-6">
                <span className="text-xs font-bold tracking-widest text-rove-stone/60 uppercase block mb-1">
                    {data.subtitle}
                </span>
                <h2 className="font-heading text-2xl text-rove-charcoal">{data.title}</h2>
            </div>

            {/* Carousel */}
            <div className="relative -mx-4 px-4 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar flex gap-4">
                {data.cards.map((card, idx) => (
                    <DecoderCard key={idx} card={card} index={idx} theme={theme} />
                ))}
                {/* Spacer for end of list padding */}
                <div className="w-4 shrink-0" />
            </div>
        </section>
    );
}

function DecoderCard({ card, index, theme }: { card: any, index: number, theme: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
            }}
            whileTap={{ scale: 0.98 }}
            className="snap-center shrink-0 w-[85vw] md:w-[400px] h-full"
        >
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/60 shadow-sm h-full flex flex-col relative overflow-hidden group hover:bg-white/50 transition-colors duration-500">
                {/* Subtle Gradient Blob from Theme */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 ${theme.blob} rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700`} />

                {/* Card Header */}
                <div className="mb-6 pb-4 border-b border-white/20 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.badge} px-2 py-1 rounded-full border`}>
                            Symptom {index + 1}
                        </div>
                    </div>
                    <h4 className="font-heading text-2xl text-rove-charcoal mb-1 leading-tight">{card.title}</h4>
                    <div className="text-sm text-rove-stone font-medium italic">
                        "If you feel {card.condition}..."
                    </div>
                </div>

                {/* The Biology - Delayed Entry */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    className="mb-4 relative z-10"
                >
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-rove-stone/80 mb-2 tracking-wide">
                        <Info className="w-3 h-3 text-blue-400" /> Maximum Biology
                    </span>
                    <p className="text-sm text-rove-charcoal/90 leading-relaxed bg-white/40 p-4 rounded-2xl border border-white/40 backdrop-blur-sm">
                        {card.biology}
                    </p>
                </motion.div>

                {/* The Fix - Delayed Entry 2 */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="mt-auto relative z-10"
                >
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${theme.color} mb-2 tracking-wide`}>
                        <Sparkles className="w-3 h-3" /> The Bio-Hack
                    </span>
                    <div className={`text-sm font-bold text-rove-charcoal bg-white/60 p-4 rounded-2xl border border-white/60 backdrop-blur-sm flex items-start gap-3 shadow-sm`}>
                        <div className="mt-0.5 min-w-[16px]">💊</div>
                        {card.fix}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
