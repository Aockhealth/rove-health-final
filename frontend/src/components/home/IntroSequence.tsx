"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface IntroSequenceProps {
    isLoggedIn: boolean;
}

export function IntroSequence({ isLoggedIn }: IntroSequenceProps) {
    return (
        <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#FDFBF7]">
            {/* 🌸 LUXURY: Flo-Style Hormone Animation */}

            {/* 1. Large Main Flow (Peach/Rose) */}
            <motion.div
                className="absolute w-[800px] h-[800px] bg-gradient-to-br from-[#F4DCD6]/40 to-[#E68D85]/20 rounded-full blur-[80px] mix-blend-multiply"
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 30, 0],
                    y: [0, -30, 0],
                    rotate: [0, 10, 0]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ top: '10%', left: '-10%' }}
            />

            {/* 2. Secondary Flow (Soft White/Cream) */}
            <motion.div
                className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#FFF]/60 to-[#F9F9F5]/40 rounded-full blur-[60px] mix-blend-overlay"
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -20, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                style={{ bottom: '20%', right: '-5%' }}
            />

            {/* 3. Deep Accent Flow (Rove Red Tint) */}
            <motion.div
                className="absolute w-[400px] h-[400px] bg-[#DC4C3E]/5 rounded-full blur-[100px]"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
                style={{ top: '40%', left: '30%' }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-3xl mx-auto"
            >
                {/* Rove Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-12"
                >
                    <div className="relative w-56 h-16 md:w-72 md:h-24 mix-blend-multiply opacity-90">
                        <Image
                            src="/assets/rove_logo.png"
                            alt="Rove Logo"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>
                </motion.div>

                {/* Badge - Minimalist & Elegant */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <span className="inline-block px-5 py-2 border border-rove-charcoal/20 rounded-full text-[11px] font-heading font-semibold tracking-[0.25em] uppercase text-rove-charcoal/70 mb-8 select-none">
                        Biology First
                    </span>
                </motion.div>

                {/* Title - Serif Luxury */}
                <motion.h1
                    className="font-serif text-5xl md:text-7xl leading-[1.1] text-rove-charcoal mb-8 tracking-tight select-none"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                >
                    You're not inconsistent. <br />
                    <span className="text-rove-red italic">You're cyclical.</span>
                </motion.h1>

                {/* Text - Spaced & Clean */}
                <motion.p
                    className="text-lg md:text-xl text-rove-stone/90 max-w-xl mx-auto leading-relaxed mb-16 font-light tracking-wide select-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                >
                    Stop forcing your 28-day biology into a 24-hour world.
                    <br className="hidden md:block" />
                    Rove decodes your hormones to give you the perfect diet, workout, and schedule for today.
                </motion.p>

                {/* Action Area - Glassmorphic or Solid Premium Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="w-full flex flex-col items-center gap-5 min-h-[60px]"
                >
                    <div className="flex flex-col gap-4 w-full max-w-xs items-center">
                        <Link href={isLoggedIn ? "/cycle-sync" : "/login"} className="w-full">
                            <Button className="w-full h-16 rounded-full bg-rove-charcoal text-[#FDFBF7] text-lg font-medium hover:bg-rove-charcoal/85 hover:scale-[1.01] shadow-[0_20px_40px_-12px_rgba(45,36,32,0.3)] transition-all duration-500 ease-out">
                                {isLoggedIn ? "Go to Dashboard" : "Begin Journey"}
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
