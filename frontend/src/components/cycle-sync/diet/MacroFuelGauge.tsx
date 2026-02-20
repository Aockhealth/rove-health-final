"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface MacroFuelGaugeProps {
    data: {
        title: string;
        protein: number;
        fats: number;
        carbs: number;
        calories?: number;
    };
    theme?: any;
    phase?: string; // New prop for explicit phase control
}

export function MacroFuelGauge({ data, theme, phase }: MacroFuelGaugeProps) {
    if (!data) return null;

    // Detect phase if not provided
    const detectPhase = () => {
        if (phase) return phase;
        // Fallback detection (less reliable for styles, but okay for content defaults)
        const title = data.title?.toLowerCase() || "";
        if (title.includes("menstrual") || title.includes("period")) return "Menstrual";
        if (title.includes("ovulat")) return "Ovulatory";
        if (title.includes("luteal") || title.includes("pms")) return "Luteal";
        return "Follicular";
    };

    const currentPhase = detectPhase();

    // Organic Chromatics Styling
    const themes: Record<string, any> = {
        "Menstrual": {
            border: "border-phase-menstrual/20",
            shadow: "shadow-phase-menstrual/5",
            ringGradient: "from-phase-menstrual via-white to-phase-menstrual", // simplified class approch if possible, otherwise hex
            color: "text-phase-menstrual",
            bg: "bg-phase-menstrual",
            blob: "bg-phase-menstrual",
            primaryHex: "#AF6B6B", // Terra Rose
            secondaryHex: "#D6A6A6" // Lighter Terra
        },
        "Follicular": {
            border: "border-phase-follicular/20",
            shadow: "shadow-phase-follicular/5",
            color: "text-phase-follicular",
            bg: "bg-phase-follicular",
            blob: "bg-phase-follicular",
            primaryHex: "#8DAA9D", // Sage Dew
            secondaryHex: "#B4CCC3" // Lighter Sage
        },
        "Ovulatory": {
            border: "border-phase-ovulatory/20",
            shadow: "shadow-phase-ovulatory/5",
            color: "text-phase-ovulatory",
            bg: "bg-phase-ovulatory",
            blob: "bg-phase-ovulatory",
            primaryHex: "#D4A25F", // Soleil Ochre
            secondaryHex: "#EBC695" // Lighter Ochre
        },
        "Luteal": {
            border: "border-phase-luteal/20",
            shadow: "shadow-phase-luteal/5",
            color: "text-phase-luteal",
            bg: "bg-phase-luteal",
            blob: "bg-phase-luteal",
            primaryHex: "#7B82A8", // Dusk Slate
            secondaryHex: "#A5ABC9" // Lighter Slate
        }
    };

    const currentTheme = themes[currentPhase] || themes["Menstrual"];

    // Calculate total weight to derive percentages for the visual gauge
    const totalGrams = data.protein + data.fats + data.carbs || 1;
    const pPct = Math.round((data.protein / totalGrams) * 100);
    const fPct = Math.round((data.fats / totalGrams) * 100);

    return (
        <section className="relative flex flex-col items-center mb-10">
            {/* Ambient Back Glow - Large */}
            <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] opacity-40 blur-[80px] -z-10", currentTheme.blob)} />

            {/* MAIN ORB CONTAINER */}
            <div className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center mb-6">

                {/* Layer 1: Outer Soft Glow */}
                <motion.div
                    className={cn("absolute inset-[-12px] rounded-full blur-[50px] opacity-30", currentTheme.bg)}
                    animate={{ scale: [1, 1.03, 1], opacity: [0.25, 0.4, 0.25] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Layer 2: Main Golden Gradient Ring */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `conic-gradient(from 0deg, ${currentTheme.primaryHex}, ${currentTheme.secondaryHex}, ${currentTheme.primaryHex})`,
                        padding: '8px',
                    }}
                >
                    {/* Inner white mask to create ring effect */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/95 via-white/90 to-white/85" />
                </div>

                {/* Layer 3: Subtle Inner Ring */}
                <div className="absolute inset-3 rounded-full border-[3px] border-white/60" />

                {/* Layer 4: Inner Content Glass */}
                <div className="absolute inset-[16px] rounded-full bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center z-10">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">
                        Daily Fuel
                    </p>
                    <h2 className={cn("text-4xl font-heading mb-0.5 leading-none", currentTheme.color)}>
                        {data.calories ? Math.round(data.calories / 10) * 10 : "2000"}
                    </h2>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                        kcal
                    </span>
                </div>

                {/* BUTTON: "AI Chef" Button */}
                <div className="absolute -bottom-2 -right-4 flex flex-col items-center gap-1.5 z-20">
                    <button
                        onClick={() => document.getElementById('ai-chef')?.scrollIntoView({ behavior: 'smooth' })}
                        className={cn("w-12 h-12 md:w-14 md:h-14 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-300 ring-4 ring-white/80 group transform hover:-translate-y-1 hover:scale-105", currentTheme.bg, "hover:opacity-90")}
                    >
                        <ChefHat className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                    </button>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Rove Chef</span>
                </div>
            </div>

            {/* ANIMATED NUTRITION FACTS */}
            <NutritionFactsCarousel phase={currentPhase} theme={currentTheme} />

            <h3 className="font-heading text-lg text-gray-800 mt-6 text-center">{data.title}</h3>
        </section>
    );
}

// Animated Nutrition Facts Component
function NutritionFactsCarousel({ phase, theme }: { phase: string; theme: any }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const phaseGuidance: Record<string, any[]> = {
        "Menstrual": [
            { icon: "🩸", title: "Iron Focus", tip: "Prioritize iron-rich foods", desc: "Replace what you're losing" },
            { icon: "🥑", title: "Gentle Fats", tip: "Embrace healthy fats", desc: "Avocado, nuts & olive oil soothe inflammation" },
            { icon: "🍚", title: "Warming Carbs", tip: "Don't skip carbs now", desc: "Complex carbs reduce cramps & boost mood" },
            { icon: "💧", title: "Hydration", tip: "Drink warm liquids", desc: "Herbal teas & warm water ease discomfort" }
        ],
        "Follicular": [
            { icon: "🥗", title: "Light & Fresh", tip: "Go light on heavy fats", desc: "Your body processes lighter foods better now" },
            { icon: "🥚", title: "Protein Power", tip: "Aim for 80g today", desc: "Building phase - support with amino acids" },
            { icon: "🥬", title: "Fiber Up", tip: "Load up on fiber", desc: "Helps metabolize rising estrogen" },
            { icon: "⚡", title: "Energizing Carbs", tip: "Complex carbs fuel workouts", desc: "You can handle more intensity now" }
        ],
        "Ovulatory": [
            { icon: "🥒", title: "Anti-Inflammatory", tip: "Avoid processed foods", desc: "Keep inflammation low at peak fertility" },
            { icon: "🐟", title: "Omega Balance", tip: "Focus on omega-3s", desc: "Fish, flax & walnuts support hormones" },
            { icon: "🥗", title: "Light Meals", tip: "Eat smaller, frequent meals", desc: "High energy means faster metabolism" },
            { icon: "🚫", title: "Skip Heavy Fats", tip: "Avoid fried & greasy foods", desc: "Your liver is processing extra estrogen" }
        ],
        "Luteal": [
            { icon: "🍠", title: "Complex Carbs", tip: "Don't cut carbs!", desc: "They boost serotonin & reduce PMS anxiety" },
            { icon: "🥜", title: "Healthy Fats", tip: "Increase good fats now", desc: "Supports progesterone production" },
            { icon: "🍫", title: "Magnesium Rich", tip: "Dark chocolate is okay!", desc: "Magnesium eases cramps & cravings" },
            { icon: "🚫", title: "Limit Salt & Sugar", tip: "Reduce bloating triggers", desc: "Avoid processed & salty snacks" }
        ]
    };

    const facts = phaseGuidance[phase] || phaseGuidance["Follicular"];

    // Auto-cycle through facts
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % facts.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [facts.length]);

    const currentFact = facts[currentIndex];

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Main Fact Display */}
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={cn(
                    "relative bg-white/60 backdrop-blur-xl rounded-2xl p-5 border shadow-sm transition-all",
                    theme.border
                )}
            >
                <div className="flex items-center gap-4">
                    <div className="text-3xl">{currentFact.icon}</div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
                            {currentFact.title}
                        </p>
                        <p className={cn("text-lg font-heading leading-tight", theme.color)}>
                            {currentFact.tip}
                        </p>
                        <p className="text-xs text-gray-500/80 mt-1">{currentFact.desc}</p>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mt-4">
                    {facts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                idx === currentIndex ? cn("w-4", theme.bg) : "bg-gray-200 hover:bg-gray-300"
                            )}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
