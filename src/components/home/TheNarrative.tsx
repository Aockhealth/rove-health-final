"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Sun, Moon, ArrowDown } from "lucide-react";
import { MaleClockGraph, FemaleCycleGraph } from "@/components/CycleGraphs";
import { HormoneFlowBackground } from "@/components/HormoneFlowBackground";

export function TheNarrative() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mobileContainerRef = useRef<HTMLDivElement>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Mobile Slideshow Logic
    const [activeIndex, setActiveIndex] = useState(0);
    const TOTAL_SCENES = 6; // Hero + Hook + Stat + Mismatch + Male + Female

    useEffect(() => {
        const interval = setInterval(() => {
            if (isUserInteracting) return;
            if (window.innerWidth >= 768) return;

            setActiveIndex((prev) => (prev + 1) % TOTAL_SCENES);
        }, 4000);

        return () => clearInterval(interval);
    }, [isUserInteracting]);

    // ---------------------------------------------------------------------------
    // DESKTOP ANIMATIONS (Sticky Scroll)
    // ---------------------------------------------------------------------------
    // Scene 1: Hook
    const hookOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
    const hookScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);

    // Scene 2: Stat
    const statOpacity = useTransform(scrollYProgress, [0.15, 0.2, 0.3, 0.35], [0, 1, 1, 0]);
    const statY = useTransform(scrollYProgress, [0.15, 0.2], [50, 0]);

    // Scene 3: Mismatch Intro
    const mismatchTextOpacity = useTransform(scrollYProgress, [0.35, 0.4, 0.45, 0.5], [0, 1, 1, 0]);
    const mismatchTextScale = useTransform(scrollYProgress, [0.35, 0.5], [0.9, 1]);

    // Scene 4: Male Card
    const maleOpacity = useTransform(scrollYProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
    const maleY = useTransform(scrollYProgress, [0.5, 0.55, 0.65, 0.7], [50, 0, 0, -50]);
    const maleScale = useTransform(scrollYProgress, [0.65, 0.7], [1, 0.9]);

    // Scene 5: Female Card
    const femaleOpacity = useTransform(scrollYProgress, [0.7, 0.75, 1], [0, 1, 1]);
    const femaleY = useTransform(scrollYProgress, [0.7, 0.75], [50, 0]);

    // Common Glass Card Style
    const glassCardClass = "bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden";

    return (
        <section className="relative bg-rove-cream/20 text-rove-charcoal">

            {/* ---------------------------------------------------------------------------
               MOBILE LAYOUT (Cinematic Slideshow - No Scroll)
               Visible on < md
            --------------------------------------------------------------------------- */}
            <div
                className="md:hidden h-screen w-full relative overflow-hidden bg-white"
                onTouchStart={() => setIsUserInteracting(true)}
                onTouchEnd={() => setIsUserInteracting(false)}
                onMouseEnter={() => setIsUserInteracting(true)}
                onMouseLeave={() => setIsUserInteracting(false)}
            >
                <AnimatePresence mode="wait">

                    {/* SCENE 0: HERO */}
                    {activeIndex === 0 && (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-rove-cream/50 to-white text-center"
                        >
                            <div className="absolute inset-0 pointer-events-none">
                                <HormoneFlowBackground variant="calm" className="opacity-50" />
                            </div>
                            <div className="relative z-10">
                                <Badge variant="outline" className="mb-6 border-rove-charcoal/10 text-rove-charcoal/60 mx-auto w-fit bg-white/50 backdrop-blur-sm">
                                    The New Standard
                                </Badge>
                                <h1 className="font-heading text-5xl tracking-tight mb-6 leading-[1.1] text-rove-charcoal">
                                    <span className="font-light block mb-2">You're not inconsistent.</span>
                                    <span className="italic text-rove-red font-medium">You're cyclical.</span>
                                </h1>
                                <p className="text-xl text-rove-charcoal/70 font-light leading-relaxed mb-8 max-w-xs mx-auto">
                                    Stop forcing your 28-day biology into a 24-hour world.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 1: HOOK */}
                    {activeIndex === 1 && (
                        <motion.div
                            key="hook"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-rove-cream/20"
                        >
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rove-red/10 rounded-full blur-[80px]" />
                            </div>
                            <Badge variant="outline" className="mb-6 border-rove-charcoal/10 text-rove-charcoal/60 mx-auto w-fit">
                                The Research Gap
                            </Badge>
                            <h2 className="font-heading text-5xl tracking-tight mb-6 text-rove-charcoal text-center">
                                You are not <br /> a small man.
                            </h2>
                        </motion.div>
                    )}

                    {/* SCENE 2: STAT */}
                    {activeIndex === 2 && (
                        <motion.div
                            key="stat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-rove-red/5 to-white"
                        >
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-rove-red/10 w-full">
                                <p className="text-xl font-light leading-relaxed text-rove-charcoal/80">
                                    <span className="text-rove-red font-bold text-5xl block mb-4">70%</span>
                                    of medical research is performed on male mice.
                                    <span className="block h-px w-20 bg-rove-red/20 my-6" />
                                    <span className="text-rove-stone text-lg">
                                        Science treats your cycle as a variable to be removed. <br />
                                        <span className="text-rove-charcoal font-medium">We treat it as your baseline.</span>
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 3: MISMATCH */}
                    {activeIndex === 3 && (
                        <motion.div
                            key="mismatch"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-rove-charcoal text-white text-center"
                        >
                            <Badge variant="secondary" className="mb-6 bg-white/10 text-white/80 mx-auto w-fit border-0">
                                The Biological Reality
                            </Badge>
                            <h2 className="font-heading text-5xl leading-tight mb-4">
                                It's not a flaw. <br /> It's a <span className="text-rove-red">mismatch.</span>
                            </h2>
                        </motion.div>
                    )}

                    {/* SCENE 4: MALE */}
                    {activeIndex === 4 && (
                        <motion.div
                            key="male"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center p-6 bg-slate-50"
                        >
                            <div className={glassCardClass}>
                                <div className="flex items-center gap-3 mb-6">
                                    <Sun className="w-5 h-5 text-rove-gold" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-rove-stone">Legacy Standard</span>
                                </div>
                                <h3 className="font-heading text-3xl mb-2 text-rove-charcoal">Male Physiology</h3>
                                <div className="h-24 w-full flex items-center mb-4 border-b border-rove-stone/10">
                                    <MaleClockGraph color="#374151" />
                                </div>
                                <p className="text-rove-stone text-sm">Resets every 24 hours. Static.</p>
                            </div>
                        </motion.div>
                    )}

                    {/* SCENE 5: FEMALE */}
                    {activeIndex === 5 && (
                        <motion.div
                            key="female"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-rove-red/10 to-rove-cream/30"
                        >
                            <div className={cn(glassCardClass, "bg-white/60 border-rove-red/20")}>
                                <div className="flex items-center gap-3 mb-6">
                                    <Moon className="w-5 h-5 text-rove-red" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-rove-red">Your Reality</span>
                                </div>
                                <h3 className="font-heading text-3xl mb-2 text-rove-charcoal">Female Physiology</h3>
                                <div className="h-24 w-full flex items-center mb-4 border-b border-rove-red/10">
                                    <FemaleCycleGraph color="#D8A59D" />
                                </div>
                                <p className="text-rove-charcoal text-sm">Resets every 28 days. Dynamic.</p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 z-50">
                    {[...Array(TOTAL_SCENES)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                activeIndex === i ? "bg-rove-charcoal w-6" : "bg-rove-charcoal/20"
                            )}
                        />
                    ))}
                </div>
            </div>


            {/* ---------------------------------------------------------------------------
               DESKTOP LAYOUT (Sticky Scrollytelling)
               Visible on md+
            --------------------------------------------------------------------------- */}
            <div ref={containerRef} className="hidden md:block relative h-[500vh]">
                <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6">

                    {/* Background: Light Flow */}
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply">
                        <HormoneFlowBackground variant="calm" />
                    </div>

                    {/* --- SCENE 1: THE HOOK --- */}
                    <motion.div
                        style={{ opacity: hookOpacity, scale: hookScale }}
                        className="absolute z-10 max-w-4xl text-center"
                    >
                        <Badge variant="outline" className="mb-8 border-rove-charcoal/20 text-rove-charcoal/60 mx-auto">
                            The Research Gap
                        </Badge>
                        <h2 className="font-heading text-8xl lg:text-9xl tracking-tighter mb-8 text-rove-charcoal">
                            You are not <br /> a small man.
                        </h2>
                    </motion.div>

                    {/* --- SCENE 2: THE STAT --- */}
                    <motion.div
                        style={{ opacity: statOpacity, y: statY }}
                        className="absolute z-10 max-w-2xl text-center px-6"
                    >
                        <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white/50">
                            <p className="text-3xl lg:text-4xl font-light leading-relaxed text-rove-charcoal">
                                <span className="text-rove-red font-medium">70%</span> of medical research is performed on male mice.
                            </p>
                            <div className="mt-8 pt-8 border-t border-rove-charcoal/5">
                                <p className="text-xl text-rove-stone">
                                    Science treats your cycle as a "variable" to be removed. <br />
                                    <span className="text-rove-charcoal font-medium">We treat it as your baseline.</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* --- SCENE 3: MISMATCH INTRO --- */}
                    <motion.div
                        style={{ opacity: mismatchTextOpacity, scale: mismatchTextScale }}
                        className="absolute z-10 text-center"
                    >
                        <Badge variant="outline" className="mb-6 border-rove-charcoal/20 text-rove-charcoal/60">
                            The Biological Reality
                        </Badge>
                        <h2 className="font-heading text-6xl mb-4 leading-tight text-rove-charcoal">
                            It's not a flaw. <br /> It's a <span className="text-rove-red">mismatch.</span>
                        </h2>
                    </motion.div>

                    {/* --- SCENE 4: MALE CARD --- */}
                    <motion.div
                        style={{ opacity: maleOpacity, y: maleY, scale: maleScale }}
                        className="absolute z-20 w-full max-w-xl"
                    >
                        <div className={glassCardClass}>
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sun className="w-24 h-24 text-rove-charcoal" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-8">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-rove-stone" />
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-rove-stone">Legacy Standard</span>
                                </div>
                                <div>
                                    <h3 className="font-heading text-4xl mb-2 text-rove-charcoal">Male Physiology</h3>
                                    <div className="inline-block bg-rove-stone/10 rounded-full px-4 py-1">
                                        <span className="text-sm font-semibold text-rove-stone">24-Hour Cycle</span>
                                    </div>
                                </div>
                                <div className="h-32 w-full flex items-center mb-2">
                                    <MaleClockGraph />
                                </div>
                                <p className="text-rove-stone text-lg">
                                    Resets every 24 hours. Static.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* --- SCENE 5: FEMALE CARD --- */}
                    <motion.div
                        style={{ opacity: femaleOpacity, y: femaleY }}
                        className="absolute z-30 w-full max-w-xl"
                    >
                        <div className={cn(glassCardClass, "border-rove-red/20 bg-gradient-to-br from-white/60 to-rove-red/5")}>
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <Moon className="w-24 h-24 text-rove-red" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-8">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-rove-red" />
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-rove-red">Your Reality</span>
                                </div>
                                <div>
                                    <h3 className="font-heading text-4xl mb-2 text-rove-charcoal">Female Physiology</h3>
                                    <div className="inline-block bg-rove-red/10 rounded-full px-4 py-1 border border-rove-red/20">
                                        <span className="text-sm font-semibold text-rove-red">28-Day Cycle</span>
                                    </div>
                                </div>
                                <div className="h-32 w-full flex items-center justify-center mb-2">
                                    <FemaleCycleGraph color="#D8A59D" />
                                </div>
                                <p className="text-rove-charcoal text-lg">
                                    Resets every 28 days. Dynamic.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
