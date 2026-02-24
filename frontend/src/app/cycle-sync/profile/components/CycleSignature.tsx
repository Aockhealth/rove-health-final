import { Zap, Clock, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CycleSignatureProps {
    cycleLength: number;
    periodLength: number;
    isIrregular: boolean;
    phaseName: string; // "Menstrual", "Follicular", etc.
    theme: any;
}

export function CycleSignature({ cycleLength, periodLength, isIrregular, phaseName, theme }: CycleSignatureProps) {
    // Determine "Signature" type based on stats
    const getSignatureType = () => {
        if (isIrregular) return { label: "Adaptive Flow", icon: Activity, desc: "Variable rhythm" };
        if (cycleLength < 26) return { label: "Rapid Cycle", icon: Zap, desc: "Fast metabolism" };
        if (cycleLength > 32) return { label: "Extended Rhythm", icon: Clock, desc: "Slower pace" };
        return { label: "Classic Rhythm", icon: Activity, desc: "Steady balance" };
    };

    const signature = getSignatureType();
    const SignatureIcon = signature.icon;

    // A beautiful multi-layered wave for the visualization
    const WaveVisualization = () => (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none scale-105 mix-blend-multiply">
            <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <motion.path
                    d="M 0 20 C 50 -10, 150 50, 200 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className={theme.accent}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                    d="M 0 20 C 50 50, 150 -10, 200 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className={theme.accent}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
                />
            </svg>
        </div>
    );

    const phases = [
        { name: "Menstrual", label: "Men", color: "bg-rose-400", shadow: "shadow-[0_0_12px_rgba(251,113,133,0.6)]" },
        { name: "Follicular", label: "Fol", color: "bg-teal-400", shadow: "shadow-[0_0_12px_rgba(45,212,191,0.6)]" },
        { name: "Ovulatory", label: "Ovu", color: "bg-amber-400", shadow: "shadow-[0_0_12px_rgba(251,191,36,0.6)]" },
        { name: "Luteal", label: "Lut", color: "bg-indigo-400", shadow: "shadow-[0_0_12px_rgba(129,140,248,0.6)]" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7"
        >
            {/* Subtle Top Inner Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

            <div className="relative z-10 flex items-start justify-between mb-8">
                <div>
                    <h3 className="font-heading text-xl text-stone-800 flex items-center gap-2.5">
                        <div className={cn("p-1.5 rounded-xl bg-white/60 shadow-sm border border-white", theme.accent)}>
                            <SignatureIcon className="w-5 h-5" />
                        </div>
                        Cycle Signature
                    </h3>
                    <p className="text-[13px] text-stone-500/80 font-medium mt-1.5 tracking-wide">
                        Your unique biological pattern
                    </p>
                </div>
                <div className={cn("px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm backdrop-blur-md", theme.badge)}>
                    {signature.label}
                </div>
            </div>

            <div className="relative mb-8">
                {/* Visual Representation */}
                <div className="relative h-24 bg-gradient-to-b from-stone-50/40 to-transparent rounded-2xl border border-white/50 overflow-hidden flex items-center px-6">
                    <WaveVisualization />

                    <div className="relative z-10 flex w-full justify-between items-center mt-2">
                        {phases.map((phase, i) => {
                            const isActive = phaseName.toLowerCase() === phase.name.toLowerCase();
                            return (
                                <motion.div
                                    key={phase.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 + 0.3 }}
                                    className="flex flex-col items-center gap-2.5 group"
                                >
                                    <div className={cn(
                                        "relative flex items-center justify-center transition-all duration-500",
                                        isActive ? "scale-125" : "scale-100 group-hover:scale-110"
                                    )}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-ring"
                                                className="absolute inset-0 rounded-full border border-stone-300/50 scale-[1.7] opacity-60"
                                            />
                                        )}
                                        <div className={cn(
                                            "w-3.5 h-3.5 rounded-full border-2 border-white transition-all duration-300",
                                            phase.color,
                                            isActive ? phase.shadow : "shadow-sm opacity-80"
                                        )} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] uppercase tracking-widest transition-colors duration-300",
                                        isActive ? "text-stone-800 font-bold" : "text-stone-400 font-semibold"
                                    )}>
                                        {phase.label}
                                    </span>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <div className="flex-1 bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/60 rounded-full blur-xl transition-transform group-hover:scale-150 duration-700 ease-out" />
                    <span className="block text-[10px] text-stone-500 font-semibold uppercase tracking-widest mb-1">Total Cycle</span>
                    <div className="flex items-baseline gap-1">
                        <span className="font-heading text-3xl text-stone-800 tracking-tight">{cycleLength}</span>
                        <span className="text-sm text-stone-500 font-medium">Days</span>
                    </div>
                </div>
                <div className="flex-1 bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/60 rounded-full blur-xl transition-transform group-hover:scale-150 duration-700 ease-out" />
                    <span className="block text-[10px] text-stone-500 font-semibold uppercase tracking-widest mb-1">Bleed</span>
                    <div className="flex items-baseline gap-1">
                        <span className="font-heading text-3xl text-stone-800 tracking-tight">{periodLength}</span>
                        <span className="text-sm text-stone-500 font-medium">Days</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
