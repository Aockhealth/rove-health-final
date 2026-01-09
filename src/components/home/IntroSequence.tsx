"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface IntroSequenceProps {
    isLoggedIn: boolean;
}

export function IntroSequence({ isLoggedIn }: IntroSequenceProps) {
    const [step, setStep] = useState(0);

    const slides = [
        {
            // SLIDE 1: The New Standard (User's Request)
            id: 0,
            badge: "THE NEW STANDARD",
            title: (
                <>
                    You're not inconsistent.<br />
                    <span className="text-rove-red italic font-serif">You're cyclical.</span>
                </>
            ),
            text: "Stop forcing your 28-day biology into a 24-hour world.",
            imgGradient: "from-rose-50 to-white",
        },
        {
            // SLIDE 2: What It Does
            id: 1,
            badge: "BIOLOGY FIRST",
            title: (
                <>
                    Your body is not<br />
                    <span className="text-rove-charcoal italic font-serif">a mystery.</span>
                </>
            ),
            text: "Rove decodes your hormones to give you the perfect diet, workout, and schedule for today.",
            imgGradient: "from-indigo-50 to-white",
        },
        {
            // SLIDE 3: Start
            id: 2,
            badge: "YOUR DASHBOARD",
            title: (
                <>
                    Sync everything<br />
                    <span className="text-emerald-600 italic font-serif">to you.</span>
                </>
            ),
            text: "Ready to live in forward motion? Let's check your daily flow.",
            imgGradient: "from-emerald-50 to-white",
        }
    ];

    const [isPaused, setIsPaused] = useState(false);

    // Auto-advance formatting
    useEffect(() => {
        if (step < slides.length - 1 && !isPaused) {
            const timer = setTimeout(() => {
                setStep(prev => prev + 1);
            }, 4000); // 4 seconds per slide
            return () => clearTimeout(timer);
        }
    }, [step, slides.length, isPaused]);

    // Handle Manual Swipe
    const handleDragEnd = (event: any, info: any) => {
        const threshold = 50; // swipe distance
        if (info.offset.x < -threshold) {
            // Swipe Left (Next)
            if (step < slides.length - 1) {
                setStep(step + 1);
                setIsPaused(true); // Pause on manual interaction
            }
        } else if (info.offset.x > threshold) {
            // Swipe Right (Prev)
            if (step > 0) {
                setStep(step - 1);
                setIsPaused(true);
            }
        }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-white cursor-grab active:cursor-grabbing">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto"

                    // Swipe Props
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    onPointerDown={() => setIsPaused(true)} // Pause when touching
                >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slides[step].imgGradient} opacity-50 -z-10 transition-colors duration-1000 pointer-events-none`} />

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full border border-rove-charcoal/10 bg-white/50 backdrop-blur-sm text-[10px] font-bold tracking-[0.2em] uppercase text-rove-charcoal/60 mb-8 select-none">
                            {slides[step].badge}
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        className="font-heading text-5xl md:text-7xl leading-[1.1] text-rove-charcoal mb-6 tracking-tight select-none"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {slides[step].title}
                    </motion.h1>

                    {/* Text */}
                    <motion.p
                        className="text-lg md:text-xl text-rove-stone max-w-md mx-auto leading-relaxed mb-12 select-none"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {slides[step].text}
                    </motion.p>

                    {/* Action Area (Only shows Login on final slide) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="w-full flex flex-col items-center gap-4 min-h-[60px]"
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag on buttons
                    >
                        {step === slides.length - 1 && (
                            // Final Step: Main CTA
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <Link href={isLoggedIn ? "/cycle-sync" : "/login"} className="w-full">
                                    <Button className="w-full h-14 rounded-full bg-rove-charcoal text-white text-lg hover:bg-rove-charcoal/90 shadow-xl shadow-rove-charcoal/10 transition-transform active:scale-95">
                                        {isLoggedIn ? "Go to Dashboard" : "Login"}
                                    </Button>
                                </Link>
                                {!isLoggedIn && (
                                    <Link href="/signup" className="text-center">
                                        <span className="text-xs text-rove-stone hover:text-rove-charcoal underline underline-offset-4 decoration-rove-stone/30">
                                            Don't have an account? Sign up
                                        </span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="absolute bottom-12 flex gap-3 z-10">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { setStep(i); setIsPaused(true); }}
                        className={`transition-all duration-500 rounded-full ${i === step ? "w-8 h-1.5 bg-rove-charcoal" : "w-1.5 h-1.5 bg-rove-charcoal/20 hover:bg-rove-charcoal/40"}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
