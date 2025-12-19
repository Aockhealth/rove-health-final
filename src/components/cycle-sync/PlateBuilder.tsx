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
        <div className="w-full bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-sm overflow-hidden relative group">
            {/* Decorative Background from Theme */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${theme.blob} rounded-full blur-[80px] pointer-events-none opacity-50`} />

            <div className="p-6 md:p-8 relative z-10">
                <header className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className={`w-4 h-4 ${theme.color}`} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${theme.color} opacity-80`}>AI Chef</span>
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl text-rove-charcoal mb-2">Build Your Bio-Individual Plate</h3>
                    <p className="text-sm text-rove-stone">
                        {data.prompt}
                    </p>
                </header>

                {/* Symptom Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {data.options.map((opt, idx) => (
                        <Button
                            key={idx}
                            onClick={() => handleGenerate(idx)}
                            variant="outline"
                            className={cn(
                                "h-16 rounded-2xl text-lg font-medium transition-all duration-300 border-2",
                                selectedOption === idx
                                    ? `bg-white ${theme.color} ${theme.blob.replace('bg-', 'border-')} shadow-lg scale-[1.02]`
                                    : "bg-white/40 border-white/40 text-rove-charcoal hover:bg-white/60"
                            )}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>

                {/* Loading State */}
                <AnimatePresence mode="wait">
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <RefreshCw className="w-10 h-10 text-rove-charcoal/40 animate-spin mb-4" />
                            <p className="text-sm font-medium text-rove-charcoal/60 animate-pulse">
                                Analyzing your biology...
                            </p>
                        </motion.div>
                    )}

                    {/* Result Card */}
                    {result && !isGenerating && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="bg-white/60 rounded-[2.5rem] p-6 md:p-8 border border-white/60 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05)] overflow-hidden relative backdrop-blur-md"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${theme.blob} rounded-full blur-2xl -mr-10 -mt-10 opacity-70`} />

                            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                                <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center ${theme.color} flex-shrink-0 shadow-sm border border-white/50`}>
                                    <ChefHat className="w-8 h-8" />
                                </div>
                                <div className="space-y-4 w-full">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-2 bg-white/60 w-fit px-2 py-1 rounded-md border border-white/40">
                                            Recommended Meal
                                        </div>
                                        <h4 className="font-heading text-3xl text-rove-charcoal mb-3 leading-tight">
                                            {result.meal_name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            <div className={`flex items-center gap-2 text-sm font-bold ${theme.color} bg-white/50 px-4 py-2 rounded-xl border border-white/60`}>
                                                <Utensils className="w-4 h-4" />
                                                {result.ingredients}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 p-5 rounded-[1.5rem] border border-white/50 backdrop-blur-sm">
                                        <p className="text-base text-rove-charcoal/80 leading-relaxed font-medium">
                                            <span className={`font-bold ${theme.color} block mb-2 text-xs uppercase tracking-widest`}>Scientific Benefit</span>
                                            "{result.why}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
