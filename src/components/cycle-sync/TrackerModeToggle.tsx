"use client";

import { motion } from "framer-motion";
import { Droplets, Baby, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrackerMode = "menstruation" | "ttc" | "menopause";

interface TrackerModeToggleProps {
    currentMode: TrackerMode;
    onModeChange: (mode: TrackerMode) => void;
}

const MODES = [
    { id: "menstruation", label: "Cycle", icon: Droplets, color: "text-rose-500", bg: "bg-rose-100" },
    { id: "ttc", label: "Fertility", icon: Baby, color: "text-amber-500", bg: "bg-amber-100" },
    { id: "menopause", label: "Menopause", icon: Flower2, color: "text-purple-500", bg: "bg-purple-100" },
];

export function TrackerModeToggle({ currentMode, onModeChange }: TrackerModeToggleProps) {
    return (
        <div className="flex p-1 bg-white/50 backdrop-blur-sm border border-white/40 rounded-full shadow-sm">
            {MODES.map((mode) => {
                const isActive = currentMode === mode.id;
                return (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id as TrackerMode)}
                        className={cn(
                            "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                            isActive ? "text-rove-charcoal" : "text-rove-stone hover:text-rove-charcoal/80"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeMode"
                                className="absolute inset-0 bg-white shadow-sm rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className={cn("relative z-10 flex items-center gap-2", isActive && mode.color)}>
                            <mode.icon className="w-4 h-4" />
                            {mode.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
