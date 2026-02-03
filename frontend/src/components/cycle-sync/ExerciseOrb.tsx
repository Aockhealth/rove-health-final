"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";

interface ExerciseOrbProps {
    phase: string;
    data: any;
    theme: any;
}

export function ExerciseOrb({ phase, data, theme }: ExerciseOrbProps) {
    if (!data) return null;

    // Map Phase to Metrics
    const metrics: Record<string, any> = {
        "Menstrual": { time: "20", unit: "mins", intensity: "Low", type: "Restorative" },
        "Follicular": { time: "45", unit: "mins", intensity: "Moderate", type: "Cardio" },
        "Ovulatory": { time: "60", unit: "mins", intensity: "High", type: "HIIT" },
        "Luteal": { time: "40", unit: "mins", intensity: "Mod-High", type: "Strength" }
    };

    const current = metrics[phase] || metrics["Follicular"];

    return (
        <section className="relative flex flex-col items-center mb-10">
            {/* Ambient Back Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] ${theme.blob || 'bg-rove-peach/20'} opacity-40 blur-[80px] -z-10`} />

            {/* MAIN ORB CONTAINER - Smaller like Diet */}
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
                        Movement
                    </p>
                    <h2 className={`text-3xl font-heading ${theme.color || 'text-amber-500'} mb-0.5 leading-none`}>
                        {current.time}
                    </h2>
                    <span className="text-[10px] font-medium text-rove-charcoal/40 uppercase tracking-widest">
                        {current.unit}
                    </span>
                </div>

                {/* BUTTON: "AI Coach" */}
                <div className="absolute -bottom-2 -right-4 flex flex-col items-center gap-1.5 z-20">
                    <button
                        onClick={() => document.getElementById('ai-exercise-builder')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-rove-charcoal to-rove-charcoal/80 text-white flex items-center justify-center shadow-lg shadow-rove-charcoal/20 hover:shadow-xl transition-all duration-300 ring-4 ring-white/80 group transform hover:-translate-y-1 hover:scale-105"
                    >
                        <Dumbbell className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                    </button>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-rove-charcoal/80">AI Coach</span>
                </div>
            </div>

            {/* ANIMATED EXERCISE FACTS */}
            <ExerciseFactsCarousel phase={phase} current={current} theme={theme} />

            <p className="text-center text-rove-charcoal/60 text-xs italic mt-6 max-w-xs mx-auto leading-relaxed">
                "{data.summary}"
            </p>
        </section>
    );
}

// Animated Exercise Facts Component
function ExerciseFactsCarousel({ phase, current, theme }: { phase: string; current: any; theme: any }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Phase-specific exercise guidance
    const phaseGuidance: Record<string, any[]> = {
        "Menstrual": [
            { icon: "🧘", title: "Gentle Movement", tip: "Stick to restorative yoga", desc: "Honor your body's need for rest" },
            { icon: "🚶", title: "Easy Walks", tip: "20 min slow walks are perfect", desc: "Light movement helps with cramps" },
            { icon: "🚫", title: "Skip Intensity", tip: "Avoid HIIT & heavy lifting", desc: "Your body is already working hard" },
            { icon: "🔥", title: "Warm It Up", tip: "Keep lower body warm", desc: "Warmth supports circulation" }
        ],
        "Follicular": [
            { icon: "🏃", title: "Ramp It Up", tip: "Increase cardio intensity", desc: "Rising estrogen = more endurance" },
            { icon: "💪", title: "Try New Things", tip: "Perfect time for new workouts", desc: "Your brain is primed for learning" },
            { icon: "⚡", title: "Push Harder", tip: "Challenge yourself this week", desc: "Energy levels are climbing" },
            { icon: "🎯", title: "Set Goals", tip: "Aim for 45 min sessions", desc: "Your body can handle more now" }
        ],
        "Ovulatory": [
            { icon: "🔥", title: "Peak Performance", tip: "Go for your personal best!", desc: "Strength & speed at their highest" },
            { icon: "🏋️", title: "High Intensity", tip: "HIIT & heavy lifting shine now", desc: "Maximum power output" },
            { icon: "⚠️", title: "Watch Form", tip: "Ligaments are more lax", desc: "Higher injury risk - focus on form" },
            { icon: "💥", title: "60 Min Sessions", tip: "Your stamina is peak", desc: "Make the most of this window" }
        ],
        "Luteal": [
            { icon: "🏋️", title: "Strength Focus", tip: "Prioritize strength training", desc: "Progesterone supports muscle" },
            { icon: "📉", title: "Lower Intensity", tip: "Reduce cardio as PMS nears", desc: "Switch from HIIT to steady-state" },
            { icon: "🧘", title: "Flexibility", tip: "Add stretching & pilates", desc: "Helps with bloating & tension" },
            { icon: "💤", title: "Rest More", tip: "Take extra rest days if needed", desc: "Listen to fatigue signals" }
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
                        <p className={`text-lg font-heading ${theme.color || 'text-amber-500'} leading-tight`}>
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

