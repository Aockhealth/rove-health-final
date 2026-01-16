"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChefHat, RefreshCw, ArrowRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PlateBuilderProps {
    phase: string;
    data: {
        prompt: string;
        options: {
            label: string;
            meal_name: string;
            ingredients: string;
            why: string;
        }[];
    };
    theme: any;
}

export function PlateBuilder({ phase, data, theme }: PlateBuilderProps) {
    if (!data) return null;

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<typeof data.options[0] | null>(null);

    const handleGenerate = (index: number) => {
        setSelectedOption(index);
        setIsGenerating(true);
        setResult(null);

        // Simulate AI "Thinking"
        setTimeout(() => {
            setResult(data.options[index]);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="w-full bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-sm overflow-hidden relative group">
            {/* Decorative Background */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${theme.blob} rounded-full blur-[80px] pointer-events-none opacity-30`} />

            <div className="p-5 md:p-6 relative z-10">
                <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${theme.color} bg-white/50 border border-white/60`}>
                            <ChefHat className="w-4 h-4" />
                        </div>
                        <h3 className="font-heading text-lg text-rove-charcoal">AI Chef</h3>
                    </div>
                    {result && !isGenerating && (
                        <button
                            onClick={() => setResult(null)}
                            className="text-xs font-bold uppercase tracking-wider text-rove-stone hover:text-rove-charcoal transition-colors md:hidden"
                        >
                            Reset
                        </button>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {!result && !isGenerating ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <p className="text-sm text-rove-stone/80 mb-4 leading-relaxed line-clamp-2">
                                {data.prompt}
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                {data.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleGenerate(idx)}
                                        className="w-full text-left p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/50 transition-all flex items-center justify-between group"
                                    >
                                        <span className="font-medium text-rove-charcoal text-sm">{opt.label}</span>
                                        <ArrowRight className="w-4 h-4 text-rove-stone opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : isGenerating ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="py-12 flex flex-col items-center justify-center text-center"
                        >
                            <RefreshCw className="w-8 h-8 text-rove-charcoal/30 animate-spin mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest text-rove-stone/60 animate-pulse">Designing Meal...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white/60 rounded-2xl p-5 border border-white/50 relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4 relative z-10">
                                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${theme.color} bg-white shadow-sm border border-white/50`}>
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-rove-stone opacity-70">Recommended</span>
                                        <button onClick={() => setResult(null)} className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-rove-charcoal hover:opacity-70">New Meal</button>
                                    </div>
                                    <h4 className="font-heading text-xl text-rove-charcoal mb-1 truncate leading-tight">{result!.meal_name}</h4>
                                    <p className="text-xs font-medium text-rove-charcoal/80 mb-3">{result!.ingredients}</p>

                                    <div className="p-3 bg-white/40 rounded-xl border border-white/40">
                                        <p className="text-xs text-rove-stone leading-relaxed italic">
                                            "{result!.why}"
                                        </p>
                                    </div>

                                    <button onClick={() => setResult(null)} className="mt-3 md:hidden w-full py-2 text-center text-xs font-bold uppercase tracking-widest text-rove-charcoal bg-white/30 rounded-lg">
                                        Try Another
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
