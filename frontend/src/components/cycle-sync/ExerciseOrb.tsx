"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

interface ExerciseOrbProps {
    phase: string;
    data: any;
    theme: any;
}

export function ExerciseOrb({ phase, data, theme }: ExerciseOrbProps) {
    if (!data) return null;

    // Map Phase to Metrics
    const metrics: Record<string, any> = {
        "Menstrual": {
            time: "20",
            unit: "mins",
            intensity: "Low",
            intensityColor: "#8FBC8F", // Green
            type: "Restorative",
            typeColor: "#DDD6FE", // Violet
            energy: 20
        },
        "Follicular": {
            time: "45",
            unit: "mins",
            intensity: "Moderate",
            intensityColor: "#F59E0B", // Amber
            type: "Cardio",
            typeColor: "#2DD4BF", // Teal
            energy: 60
        },
        "Ovulatory": {
            time: "60",
            unit: "mins",
            intensity: "High",
            intensityColor: "#DC4C3E", // Red
            type: "HIIT",
            typeColor: "#F472B6", // Pink
            energy: 90
        },
        "Luteal": {
            time: "40",
            unit: "mins",
            intensity: "Mod/High",
            intensityColor: "#818CF8", // Indigo
            type: "Strength",
            typeColor: "#A78BFA", // Purple
            energy: 50
        }
    };

    const current = metrics[phase] || metrics["Follicular"];

    // Gradient based on energy level
    const intensityGradient = `conic-gradient(
        ${current.intensityColor} 0% ${current.energy}%, 
        ${theme.bg || '#f3f4f6'} ${current.energy}% 100%
    )`;

    return (
        <section className="relative flex flex-col items-center mb-10">
            {/* Ambient Back Glow - Large */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] ${theme.blob || 'bg-rove-peach/20'} opacity-40 blur-[80px] -z-10`} />

            {/* MAIN ORB CONTAINER */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mb-8">

                {/* Layer 1: Outer Decorative Glow Ring (Phase Theme) */}
                <motion.div
                    className={`absolute inset-[-10px] rounded-full blur-[40px] opacity-40 ${theme.bg || 'bg-white'}`}
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Layer 2: Rotating Decorative Ring (Phase Theme) */}
                <motion.div
                    className={`absolute inset-0 rounded-full border-[6px] border-transparent bg-gradient-to-r ${theme.orbRing || 'from-rove-peach via-white to-rove-peach'} bg-clip-border [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Layer 3: Secondary Reverse Rotating Ring (Subtle) */}
                <motion.div
                    className={`absolute inset-2 rounded-full border-[2px] border-transparent bg-gradient-to-br ${theme.orbRing} opacity-40`}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />

                {/* Layer 4: Functional Energy Ring (Intensity) - Sitting slightly inside */}
                <div
                    className="absolute inset-[14px] rounded-full"
                    style={{ background: intensityGradient }}
                >
                    {/* Mask inner part to create ring effect */}
                    <div className="absolute inset-[6px] bg-white/90 backdrop-blur-xl rounded-full" />
                </div>

                {/* Layer 5: Inner Content Glass */}
                <div className="absolute inset-[24px] rounded-full bg-white/40 backdrop-blur-md flex flex-col items-center justify-center shadow-inner text-center z-10 border border-white/50">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-rove-stone/80 uppercase mb-1">
                        Movement
                    </p>
                    <h2 className={`text-4xl font-heading ${theme.color} mb-0.5 leading-none`}>
                        {current.time}
                    </h2>
                    <span className="text-[10px] font-medium text-rove-charcoal/40 uppercase tracking-widest">
                        {current.unit}
                    </span>
                </div>

                {/* BUTTON: Diagonal "AI Coach" Style Button */}
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

            {/* LEGEND BELOW */}
            <div className="flex gap-2 sm:gap-4 w-full max-w-sm justify-center">
                {/* Intensity */}
                <div className="flex flex-col items-center bg-white/50 px-3 py-2 rounded-xl border border-white/40 min-w-[80px]">
                    <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: current.intensityColor }}></div>
                    <span className="text-sm font-bold text-rove-charcoal">{current.intensity}</span>
                    <span className="text-[9px] text-rove-stone uppercase tracking-wide">Intensity</span>
                </div>
                {/* Type */}
                <div className="flex flex-col items-center bg-white/50 px-3 py-2 rounded-xl border border-white/40 min-w-[80px]">
                    <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: current.typeColor }}></div>
                    <span className="text-sm font-bold text-rove-charcoal">{current.type}</span>
                    <span className="text-[9px] text-rove-stone uppercase tracking-wide">Type</span>
                </div>
            </div>

            <p className="text-center text-rove-charcoal/60 text-xs italic mt-6 max-w-xs mx-auto leading-relaxed">
                "{data.summary}"
            </p>
        </section>
    );
}
