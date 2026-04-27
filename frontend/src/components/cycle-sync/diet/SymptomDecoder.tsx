"use client";

import { motion } from "framer-motion";
import { Info, Utensils, Zap, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

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
    theme?: any;
    phase?: string;
}

export function SymptomDecoder({ data, theme, phase }: SymptomDecoderProps) {
    if (!data) return null;

    // Organic Chromatics Styling
    const currentPhase = phase || "Menstrual";
    const themes: Record<string, any> = {
        "Menstrual": {
            color: "text-phase-menstrual",
            gradient: "from-phase-menstrual/20 via-white/60 to-phase-menstrual/5",
            glow: "bg-phase-menstrual/20",
            border: "border-phase-menstrual/20",
            softBg: "bg-white/50",
            iconContainer: "bg-phase-menstrual/10 text-phase-menstrual"
        },
        "Follicular": {
            color: "text-phase-follicular",
            gradient: "from-phase-follicular/20 via-white/60 to-phase-follicular/5",
            glow: "bg-phase-follicular/20",
            border: "border-phase-follicular/20",
            softBg: "bg-white/50",
            iconContainer: "bg-phase-follicular/10 text-phase-follicular"
        },
        "Ovulatory": {
            color: "text-phase-ovulatory",
            gradient: "from-phase-ovulatory/20 via-white/60 to-phase-ovulatory/5",
            glow: "bg-phase-ovulatory/20",
            border: "border-phase-ovulatory/20",
            softBg: "bg-white/50",
            iconContainer: "bg-phase-ovulatory/10 text-phase-ovulatory"
        },
        "Luteal": {
            color: "text-phase-luteal",
            gradient: "from-phase-luteal/20 via-white/60 to-phase-luteal/5",
            glow: "bg-phase-luteal/20",
            border: "border-phase-luteal/20",
            softBg: "bg-white/50",
            iconContainer: "bg-phase-luteal/10 text-phase-luteal"
        }
    };

    const currentTheme = themes[currentPhase] || themes["Menstrual"];

    return (
        <section className="mb-8">
            {/* Compact Header */}
            <div className="px-2 mb-4">
                <span className={cn("text-[10px] font-bold tracking-widest uppercase block mb-0.5", currentTheme.color)}>
                    {data.subtitle}
                </span>
                <h2 className="font-heading text-xl text-gray-800">{data.title}</h2>
            </div>

            {/* Compact Cards Carousel */}
            <div className="relative -mx-4 px-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar flex gap-3">
                {data.cards.map((card, idx) => (
                    <SymptomCard key={idx} card={card} index={idx} theme={currentTheme} />
                ))}
                <div className="w-2 shrink-0" />
            </div>
        </section>
    );
}

function SymptomCard({ card, index, theme }: { card: any, index: number, theme: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="snap-center shrink-0 w-[75vw] md:w-[300px]"
        >
            <div className={cn(
                "relative overflow-hidden bg-gradient-to-br backdrop-blur-xl rounded-2xl p-4 border shadow-sm shadow-black/5 h-full group",
                theme.gradient,
                theme.border
            )}>
                {/* Subtle Glow */}
                <div className={cn("absolute -right-8 -top-8 w-20 h-20 rounded-full blur-3xl opacity-50", theme.glow)} />

                {/* Symptom Title */}
                <div className="relative z-10 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className={cn("w-4 h-4", theme.color)} />
                        <h4 className="font-heading text-lg text-gray-800 leading-tight">{card.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500/70 italic pl-6">
                        {card.condition}
                    </p>
                </div>

                {/* Science Section */}
                <div className="relative z-10 mb-3">
                    <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide mb-1.5", theme.color)}>
                        <Info className="w-3 h-3" />
                        Why This Happens
                    </div>
                    <div className={cn("p-2.5 rounded-xl border", theme.softBg, theme.border)}>
                        <p className="text-xs text-gray-700/80 leading-relaxed">
                            {card.biology}
                        </p>
                    </div>
                </div>

                {/* Diet Recommendation - NEW */}
                <div className="relative z-10">
                    <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide mb-1.5", theme.color)}>
                        <Leaf className="w-3 h-3" />
                        Foods That Help
                    </div>
                    <div className="flex items-start gap-2 bg-white/60 p-2.5 rounded-xl border border-white/50">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", theme.iconContainer)}>
                            <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-gray-800 leading-relaxed">
                            {card.diet || card.fix}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
