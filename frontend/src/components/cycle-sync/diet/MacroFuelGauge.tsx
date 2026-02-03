"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface MacroFuelGaugeProps {
    data: {
        title: string;
        protein: number;
        fats: number;
        carbs: number;
        calories?: number;
        proteinLabel?: string;
        fatsLabel?: string;
        carbsLabel?: string;
        proteinDesc?: string;
        fatsDesc?: string;
        carbsDesc?: string;
    };
    theme: any;
}

import { ChefHat } from "lucide-react";


export function MacroFuelGauge({ data, theme }: MacroFuelGaugeProps) {
    if (!data) return null;

    // Calculate total weight to derive percentages for the visual gauge
    const totalGrams = data.protein + data.fats + data.carbs || 1;
    const pPct = Math.round((data.protein / totalGrams) * 100);
    const fPct = Math.round((data.fats / totalGrams) * 100);

    // Functional Gradient (Data Layer)
    const macroGradient = `conic-gradient(
        #DC4C3E 0% ${pPct}%, 
        #8FBC8F ${pPct}% ${pPct + fPct}%, 
        #F59E0B ${pPct + fPct}% 100%
    )`;

    return (
        <section className="relative flex flex-col items-center mb-10">
            {/* Ambient Back Glow - Large */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] ${theme.blob || 'bg-rove-peach/20'} opacity-40 blur-[80px] -z-10`} />

            {/* MAIN ORB CONTAINER */}
            <div className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center mb-6">

                {/* Layer 1: Outer Soft Glow */}
                <motion.div
                    className={`absolute inset-[-12px] rounded-full blur-[50px] opacity-30 ${theme.bg || 'bg-amber-200'}`}
                    animate={{ scale: [1, 1.03, 1], opacity: [0.25, 0.4, 0.25] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Layer 2: Main Golden Gradient Ring */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `conic-gradient(from 0deg, ${theme.primary || '#F59E0B'}, ${theme.secondary || '#FBBF24'}, ${theme.primary || '#F59E0B'})`,
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
                    <p className="text-[9px] font-bold tracking-[0.2em] text-rove-stone/70 uppercase mb-1">
                        Daily Fuel
                    </p>
                    <h2 className={`text-4xl font-heading ${theme.color || 'text-amber-500'} mb-0.5 leading-none`}>
                        {data.calories || "2000"}
                    </h2>
                    <span className="text-[10px] font-medium text-rove-charcoal/40 uppercase tracking-widest">
                        kcal
                    </span>
                </div>

                {/* BUTTON: "AI Chef" Button */}
                <div className="absolute -bottom-2 -right-4 flex flex-col items-center gap-1.5 z-20">
                    <button
                        onClick={() => document.getElementById('ai-chef')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-rove-charcoal to-rove-charcoal/80 text-white flex items-center justify-center shadow-lg shadow-rove-charcoal/20 hover:shadow-xl transition-all duration-300 ring-4 ring-white/80 group transform hover:-translate-y-1 hover:scale-105"
                    >
                        <ChefHat className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                    </button>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-rove-charcoal/80">AI Chef</span>
                </div>
            </div>

            {/* ANIMATED NUTRITION FACTS */}
            <NutritionFactsCarousel data={data} theme={theme} />

            <h3 className="font-heading text-lg text-rove-charcoal mt-6 text-center">{data.title}</h3>
        </section>
    );
}

// Animated Nutrition Facts Component
function NutritionFactsCarousel({ data, theme }: { data: any; theme: any }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Phase-specific dietary guidance (not gram counts!)
    // Determine phase from data.title which contains phase info
    const phaseGuidance: Record<string, any[]> = {
        "Menstrual": [
            { icon: "🩸", title: "Iron Focus", tip: "Prioritize iron-rich foods", desc: "Replace what you're losing", color: "text-[#DC4C3E]" },
            { icon: "🥑", title: "Gentle Fats", tip: "Embrace healthy fats", desc: "Avocado, nuts & olive oil soothe inflammation", color: "text-[#8FBC8F]" },
            { icon: "🍚", title: "Warming Carbs", tip: "Don't skip carbs now", desc: "Complex carbs reduce cramps & boost mood", color: "text-[#F59E0B]" },
            { icon: "💧", title: "Hydration", tip: "Drink warm liquids", desc: "Herbal teas & warm water ease discomfort", color: "text-rove-charcoal" }
        ],
        "Follicular": [
            { icon: "🥗", title: "Light & Fresh", tip: "Go light on heavy fats", desc: "Your body processes lighter foods better now", color: "text-[#8FBC8F]" },
            { icon: "🥚", title: "Protein Power", tip: `Aim for ${data.protein || 80}g today`, desc: "Building phase - support with amino acids", color: "text-[#DC4C3E]" },
            { icon: "🥬", title: "Fiber Up", tip: "Load up on fiber", desc: "Helps metabolize rising estrogen", color: "text-[#22C55E]" },
            { icon: "⚡", title: "Energizing Carbs", tip: "Complex carbs fuel workouts", desc: "You can handle more intensity now", color: "text-[#F59E0B]" }
        ],
        "Ovulatory": [
            { icon: "🥒", title: "Anti-Inflammatory", tip: "Avoid processed foods", desc: "Keep inflammation low at peak fertility", color: "text-[#22C55E]" },
            { icon: "🐟", title: "Omega Balance", tip: "Focus on omega-3s", desc: "Fish, flax & walnuts support hormones", color: "text-[#3B82F6]" },
            { icon: "🥗", title: "Light Meals", tip: "Eat smaller, frequent meals", desc: "High energy means faster metabolism", color: "text-[#8FBC8F]" },
            { icon: "🚫", title: "Skip Heavy Fats", tip: "Avoid fried & greasy foods", desc: "Your liver is processing extra estrogen", color: "text-[#DC4C3E]" }
        ],
        "Luteal": [
            { icon: "🍠", title: "Complex Carbs", tip: "Don't cut carbs!", desc: "They boost serotonin & reduce PMS anxiety", color: "text-[#F59E0B]" },
            { icon: "🥜", title: "Healthy Fats", tip: "Increase good fats now", desc: "Supports progesterone production", color: "text-[#8FBC8F]" },
            { icon: "🍫", title: "Magnesium Rich", tip: "Dark chocolate is okay!", desc: "Magnesium eases cramps & cravings", color: "text-[#8B5CF6]" },
            { icon: "🚫", title: "Limit Salt & Sugar", tip: "Reduce bloating triggers", desc: "Avoid processed & salty snacks", color: "text-[#DC4C3E]" }
        ]
    };

    // Detect phase from title or default to Follicular
    const detectPhase = () => {
        const title = data.title?.toLowerCase() || "";
        if (title.includes("menstrual") || title.includes("period")) return "Menstrual";
        if (title.includes("ovulat")) return "Ovulatory";
        if (title.includes("luteal") || title.includes("pms")) return "Luteal";
        return "Follicular";
    };

    const currentPhase = detectPhase();
    const facts = phaseGuidance[currentPhase] || phaseGuidance["Follicular"];

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
                className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="text-3xl">{currentFact.icon}</div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/70 mb-0.5">
                            {currentFact.title}
                        </p>
                        <p className={`text-lg font-heading ${currentFact.color} leading-tight`}>
                            {currentFact.tip}
                        </p>
                        <p className="text-xs text-rove-stone/80 mt-1">{currentFact.desc}</p>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mt-4">
                    {facts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'bg-rove-charcoal w-4'
                                : 'bg-rove-stone/30 hover:bg-rove-stone/50'
                                }`}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
