"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, BarChart2, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const TOUR_STEPS = [
    {
        icon: Home,
        title: "Welcome Home",
        body: "This is your dashboard. See your current cycle phase, daily tips, and a body snapshot — all at a glance."
    },
    {
        icon: Calendar,
        title: "Track Everything",
        body: "Log your period, symptoms, moods, and more. The more you log, the smarter your predictions get."
    },
    {
        icon: BarChart2,
        title: "Your Insights",
        body: "AI-powered insights about your hormones, energy, and what your body needs — based on your phase."
    },
    {
        icon: List,
        title: "Your Daily Plan",
        body: "Personalized diet, exercise, and skincare recommendations — synced to your cycle, every single day."
    }
];

export default function WelcomeTour() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Only show if the user hasn't seen it yet
        const hasSeenTour = localStorage.getItem("rove-welcome-tour-v1");
        if (!hasSeenTour) {
            // Small delay to let the dashboard render first
            const timer = setTimeout(() => setIsOpen(true), 800);
            return () => clearTimeout(timer);
        }
        setMounted(true);
    }, []);

    const dismissTour = () => {
        setIsOpen(false);
        localStorage.setItem("rove-welcome-tour-v1", "done");
    };

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep((s) => s + 1);
        } else {
            dismissTour();
        }
    };

    // Prevent hydration mismatch
    if (!mounted && !isOpen) return null;

    const step = TOUR_STEPS[currentStep];
    const Icon = step.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                        onClick={dismissTour}
                    />

                    {/* Bottom Sheet Modal */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[70] mx-auto w-full max-w-md rounded-t-[2.5rem] bg-white p-8 pb-safe-nav shadow-2xl"
                    >
                        {/* Draggable Handle Indicator */}
                        <div className="mx-auto mb-8 w-12 h-1.5 rounded-full bg-rove-stone/20" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rove-charcoal/5 shadow-inner">
                                    <Icon className="h-8 w-8 text-rove-charcoal" strokeWidth={1.5} />
                                </div>

                                <h3 className="mb-3 font-serif text-2xl font-medium text-rove-charcoal">
                                    {step.title}
                                </h3>

                                <p className="mb-8 min-h-[60px] text-sm leading-relaxed text-rove-stone font-medium">
                                    {step.body}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Navigation */}
                        <div className="flex items-center justify-between pt-2">
                            {/* Dots */}
                            <div className="flex gap-2">
                                {TOUR_STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            currentStep === i ? "w-6 bg-rove-charcoal" : "w-1.5 bg-rove-stone/30"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                                {currentStep < TOUR_STEPS.length - 1 && (
                                    <button
                                        onClick={dismissTour}
                                        className="text-sm font-bold tracking-wider text-rove-stone/60 hover:text-rove-charcoal transition-colors uppercase"
                                    >
                                        Skip
                                    </button>
                                )}
                                <Button
                                    onClick={handleNext}
                                    className="rounded-full bg-rove-charcoal px-6 py-2.5 text-sm font-semibold text-white hover:bg-black hover:scale-105 transition-all shadow-md"
                                >
                                    {currentStep === TOUR_STEPS.length - 1 ? "Got it ✨" : "Next"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
