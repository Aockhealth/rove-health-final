"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GraphProps {
    className?: string;
    color?: string;
}

export const MaleClockGraph = ({ className, color = "white" }: GraphProps) => {
    return (
        <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
            <svg
                viewBox="0 0 400 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
            >
                {/* Main Baseline */}
                <line x1="0" y1="80" x2="400" y2="80" stroke={color} strokeOpacity="0.2" strokeWidth="2" />

                {/* Daily Ticks - Representing the 24h reset */}
                {[...Array(7)].map((_, i) => (
                    <motion.line
                        key={i}
                        x1={50 + i * 50}
                        y1="80"
                        x2={50 + i * 50}
                        y2="60"
                        stroke={color}
                        strokeOpacity="0.4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ y2: 80, opacity: 0 }}
                        whileInView={{ y2: 60, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                ))}

                {/* The "Loop" visual - A subtle arc showing the daily repetition */}
                {[...Array(7)].map((_, i) => (
                    <motion.path
                        key={`arc-${i}`}
                        d={`M ${50 + i * 50} 60 Q ${75 + i * 50} 40, ${100 + i * 50} 60`}
                        stroke={color}
                        strokeOpacity="0.1"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    />
                ))}
            </svg>
        </div>
    );
};

export const FemaleCycleGraph = ({ className, color = "#D8A59D" }: GraphProps) => {
    return (
        <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
            <svg
                viewBox="0 0 400 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
            >
                {/* Baseline */}
                <line x1="0" y1="100" x2="400" y2="100" stroke={color} strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" />

                {/* The Wave - Representing Hormonal Fluctuation */}
                {/* Path: Starts low (Menses), Sharp rise to Peak (Ovulation), Dip, Plateau (Luteal), Drop (Menses) */}
                <motion.path
                    d="M0 90 C 80 90, 120 20, 160 20 S 220 60, 260 50 S 340 40, 400 90"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Gradient Fill under the curve */}
                <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    d="M0 90 C 80 90, 120 20, 160 20 S 220 60, 260 50 S 340 40, 400 90 V 120 H 0 Z"
                    fill="url(#waveGradient)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                />

                {/* Phase Markers */}
                {/* Ovulation Peak */}
                <motion.circle cx="160" cy="20" r="4" fill={color} initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1 }} />
                {/* Luteal Plateau */}
                <motion.circle cx="260" cy="50" r="4" fill={color} initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1.2 }} />

            </svg>
        </div>
    );
};
