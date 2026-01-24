// src/components/HormoneFlowBackground.tsx

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HormoneFlowBackgroundProps {
    variant?: "flow" | "calm" | "cellular";
    className?: string;
}

export const HormoneFlowBackground = ({
    variant = "flow",
    className
}: HormoneFlowBackgroundProps) => {
    // State to hold random values for hydration stability
    const [cellularParticles, setCellularParticles] = useState<any[]>([]);
    const [flowParticles, setFlowParticles] = useState<any[]>([]);

    useEffect(() => {
        // Generate random values only on the client side
        setCellularParticles([...Array(6)].map(() => ({
            width: Math.random() * 200 + 100,
            height: Math.random() * 200 + 100,
            left: Math.random() * 100,
            top: Math.random() * 100,
            xMove: Math.random() * 100 - 50,
            yMove: Math.random() * 100 - 50,
            duration: Math.random() * 10 + 15
        })));

        setFlowParticles([...Array(3)].map(() => ({
            width: Math.random() * 150 + 50,
            height: Math.random() * 150 + 50,
            left: Math.random() * 80 + 10,
            top: Math.random() * 60 + 20,
            duration: Math.random() * 5 + 10
        })));
    }, []);

    // ---------------------------------------------------------------------------
    // VARIANT: CELLULAR (Ingredients Page)
    // ---------------------------------------------------------------------------
    if (variant === "cellular") {
        return (
            <div className={cn("absolute inset-0 z-0 overflow-hidden bg-rove-cream/20", className)}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80 z-10" />

                {/* Floating Organic Shapes - Rendered from state to prevent hydration error */}
                {cellularParticles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full mix-blend-multiply filter blur-xl"
                        style={{
                            background: i % 2 === 0 ? "rgba(216, 165, 157, 0.15)" : "rgba(168, 198, 160, 0.15)", // rove-red / sage
                            width: p.width,
                            height: p.height,
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                        }}
                        animate={{
                            x: [0, p.xMove, 0],
                            y: [0, p.yMove, 0],
                            scale: [1, 1.1, 0.9, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
        );
    }

    // ---------------------------------------------------------------------------
    // VARIANT: FLOW & CALM (Home Page)
    // ---------------------------------------------------------------------------
    const isCalm = variant === "calm";
    const opacityMultiplier = isCalm ? 0.5 : 1;

    return (
        <div className={cn("absolute inset-0 z-0 overflow-hidden bg-rove-cream/10", className)}>
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60 z-10" />

            <svg
                className="absolute w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="estrogenGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#D8A59D" stopOpacity={0.2 * opacityMultiplier} />
                        <stop offset="100%" stopColor="#D8A59D" stopOpacity={0.05 * opacityMultiplier} />
                    </linearGradient>
                    <linearGradient id="progesteroneGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#A8C6A0" stopOpacity={0.2 * opacityMultiplier} />
                        <stop offset="100%" stopColor="#A8C6A0" stopOpacity={0.05 * opacityMultiplier} />
                    </linearGradient>
                </defs>

                {/* Wave 1 - Estrogen */}
                <motion.path
                    d="M0 50 Q 25 40, 50 50 T 100 50 V 100 H 0 Z"
                    fill="url(#estrogenGradient)"
                    animate={{
                        d: [
                            "M0 50 Q 25 40, 50 50 T 100 50 V 100 H 0 Z",
                            "M0 40 Q 25 20, 50 40 T 100 40 V 100 H 0 Z",
                            "M0 55 Q 25 65, 50 55 T 100 55 V 100 H 0 Z",
                            "M0 50 Q 25 40, 50 50 T 100 50 V 100 H 0 Z",
                        ],
                    }}
                    transition={{
                        duration: isCalm ? 30 : 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.4, 0.7, 1]
                    }}
                />

                {/* Wave 2 - Progesterone */}
                <motion.path
                    d="M0 55 Q 25 65, 50 55 T 100 55 V 100 H 0 Z"
                    fill="url(#progesteroneGradient)"
                    animate={{
                        d: [
                            "M0 55 Q 25 65, 50 55 T 100 55 V 100 H 0 Z",
                            "M0 60 Q 25 70, 50 60 T 100 60 V 100 H 0 Z",
                            "M0 45 Q 25 35, 50 45 T 100 45 V 100 H 0 Z",
                            "M0 55 Q 25 65, 50 55 T 100 55 V 100 H 0 Z",
                        ],
                    }}
                    transition={{
                        duration: isCalm ? 30 : 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.4, 0.8, 1]
                    }}
                />

                {/* Wave 3 - Background Flow */}
                <motion.path
                    d="M0 52 Q 40 42, 70 52 T 100 52 V 100 H 0 Z"
                    fill="#F4EBE8"
                    opacity={0.3 * opacityMultiplier}
                    animate={{
                        d: [
                            "M0 52 Q 40 42, 70 52 T 100 52 V 100 H 0 Z",
                            "M0 52 Q 40 62, 70 52 T 100 52 V 100 H 0 Z",
                            "M0 52 Q 40 42, 70 52 T 100 52 V 100 H 0 Z",
                        ],
                    }}
                    transition={{
                        duration: isCalm ? 25 : 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{ mixBlendMode: "multiply" }}
                />
            </svg>

            {/* Floating Particles - Rendered from state */}
            {flowParticles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-rove-red/10 blur-3xl"
                    style={{
                        width: p.width,
                        height: p.height,
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        opacity: [0.2 * opacityMultiplier, 0.4 * opacityMultiplier, 0.2 * opacityMultiplier],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 3,
                    }}
                />
            ))}
        </div>
    );
};