"use client";

import { motion } from "framer-motion";
import { Info, Utensils, Zap, Leaf } from "lucide-react";

interface SymptomDecoderProps {
    data: {
        title: string;
        subtitle: string;
        cards: {
            title: string;
            condition: string;
            biology: string;
            fix: string;
            diet?: string;
        }[];
    };
    theme?: {
        color?: string;
        bannerBg?: string;
        cardBg?: string;
        border?: string;
        softBg?: string;
        iconContainer?: string;
        accent?: string;
        blob?: string;
    };
}

export function SymptomDecoder({ data, theme }: SymptomDecoderProps) {
    if (!data) return null;

    const colorBase = theme?.color?.replace("text-", "") || "rose-600";
    const colorFamily = colorBase.split("-")[0];

    return (
        <section className="mb-8">
            {/* Compact Header */}
            <div className="px-2 mb-4">
                <span className={`text-[10px] font-bold tracking-widest uppercase block mb-0.5 ${theme?.color || "text-rove-stone/60"}`}>
                    {data.subtitle}
                </span>
                <h2 className="font-heading text-xl text-rove-charcoal">{data.title}</h2>
            </div>

            {/* Compact Cards Carousel */}
            <div className="relative -mx-4 px-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar flex gap-3">
                {data.cards.map((card, idx) => (
                    <SymptomCard key={idx} card={card} index={idx} theme={theme} colorFamily={colorFamily} />
                ))}
                <div className="w-2 shrink-0" />
            </div>
        </section>
    );
}

function SymptomCard({ card, index, theme, colorFamily }: { card: any, index: number, theme: any, colorFamily: string }) {
    const phaseGradients: Record<string, { gradient: string, glow: string }> = {
        "rose": { gradient: "from-rose-50/80 via-white/60 to-pink-50/40", glow: "bg-rose-400/20" },
        "teal": { gradient: "from-teal-50/80 via-white/60 to-emerald-50/40", glow: "bg-teal-400/20" },
        "amber": { gradient: "from-amber-50/80 via-white/60 to-orange-50/40", glow: "bg-amber-400/20" },
        "indigo": { gradient: "from-indigo-50/80 via-white/60 to-purple-50/40", glow: "bg-indigo-400/20" }
    };

    const style = phaseGradients[colorFamily] || phaseGradients["rose"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="snap-center shrink-0 w-[75vw] md:w-[300px]"
        >
            <div className={`
                relative overflow-hidden
                bg-gradient-to-br ${style.gradient}
                backdrop-blur-xl 
                rounded-2xl
                p-4
                border ${theme?.border || "border-white/50"}
                shadow-md shadow-black/5
                h-full
                group
            `}>
                {/* Subtle Glow */}
                <div className={`absolute -right-8 -top-8 w-20 h-20 ${style.glow} rounded-full blur-3xl opacity-50`} />

                {/* Symptom Title */}
                <div className="relative z-10 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className={`w-4 h-4 ${theme?.color || "text-rose-500"}`} />
                        <h4 className="font-heading text-lg text-rove-charcoal leading-tight">{card.title}</h4>
                    </div>
                    <p className="text-xs text-rove-stone/70 italic pl-6">
                        {card.condition}
                    </p>
                </div>

                {/* Science Section */}
                <div className="relative z-10 mb-3">
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide mb-1.5 ${theme?.color || "text-rove-stone/70"}`}>
                        <Info className="w-3 h-3" />
                        Why This Happens
                    </div>
                    <div className={`${theme?.softBg || "bg-white/50"} p-2.5 rounded-xl border ${theme?.border || "border-white/40"}`}>
                        <p className="text-xs text-rove-charcoal/80 leading-relaxed">
                            {card.biology}
                        </p>
                    </div>
                </div>

                {/* Diet Recommendation - NEW */}
                <div className="relative z-10">
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide mb-1.5 ${theme?.color || "text-rose-600"}`}>
                        <Leaf className="w-3 h-3" />
                        Foods That Help
                    </div>
                    <div className="flex items-start gap-2 bg-white/60 p-2.5 rounded-xl border border-white/50">
                        <div className={`w-7 h-7 rounded-lg ${theme?.iconContainer || "bg-rose-100 text-rose-600"} flex items-center justify-center shrink-0`}>
                            <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-rove-charcoal leading-relaxed">
                            {card.diet || card.fix}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
