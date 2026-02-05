"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

const THOUGHT_FACTS = [
    "Did you know? Your intuition peaks during your menstrual phase.",
    "Hydration is your best friend for that inner glow.",
    "Every phase has its own superpower. Embrace yours today.",
    "Rest is productive. Your body is working hard!",
    "Syncing with your cycle is the ultimate self-care.",
    "Your energy naturally ebbs and flows. Ride the wave.",
    "Nourish your body, and it will nourish you back.",
    "Small steps every day lead to big changes.",
    "Listen to your body's whispers before they become screams.",
    "You are exactly where you need to be right now."
];

export default function LoadingScreen() {
    const [fact, setFact] = useState("");

    useEffect(() => {
        setFact(THOUGHT_FACTS[Math.floor(Math.random() * THOUGHT_FACTS.length)]);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7]">
            <div className="relative">
                {/* Pulsing Orb Background */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-rove-clay/20 blur-2xl rounded-full w-32 h-32 -z-10"
                />

                {/* Animated Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8 relative z-10 w-24 h-24 rounded-full overflow-hidden shadow-xl shadow-rove-clay/10 border-4 border-white"
                >
                    {/* Inner Pulse */}
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full relative"
                    >
                        <Image
                            src="/assets/rove-logo.jpg"
                            alt="Rove Health"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Fact Text */}
            <div className="max-w-xs text-center px-4 space-y-3 z-10">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-sm font-heading font-medium text-rove-charcoal/80 leading-relaxed"
                >
                    "{fact}"
                </motion.p>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "40%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-0.5 bg-gradient-to-r from-transparent via-rove-clay/30 to-transparent mx-auto"
                />
            </div>
        </div>
    );
}
