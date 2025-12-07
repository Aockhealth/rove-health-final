"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { MaleClockGraph, FemaleCycleGraph } from "@/components/CycleGraphs";
import { HormoneFlowBackground } from "@/components/HormoneFlowBackground";

export function TheNarrative() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // ---------------------------------------------------------------------------
    // SCENE 1: THE HOOK ("You are not a small man")
    // Range: 0 - 0.2
    // ---------------------------------------------------------------------------
    const hookOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.2], [1, 1, 0, 0]);
    const hookScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

    // ---------------------------------------------------------------------------
    // SCENE 2: THE STAT ("70% of research...")
    // Range: 0.2 - 0.4
    // ---------------------------------------------------------------------------
    const statOpacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
    const statY = useTransform(scrollYProgress, [0.2, 0.25], [50, 0]);

    // ---------------------------------------------------------------------------
    // SCENE 3: THE MISMATCH INTRO ("It's not a flaw...")
    // Range: 0.4 - 0.55
    // ---------------------------------------------------------------------------
    const mismatchTextOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.5, 0.55], [0, 1, 1, 0]);
    const mismatchTextScale = useTransform(scrollYProgress, [0.4, 0.55], [0.9, 1]);

    // ---------------------------------------------------------------------------
    // SCENE 4: MALE PHYSIOLOGY (Legacy Standard)
    // Range: 0.55 - 0.75
    // ---------------------------------------------------------------------------
    const maleOpacity = useTransform(scrollYProgress, [0.55, 0.6, 0.7, 0.75], [0, 1, 1, 0]);
    const maleY = useTransform(scrollYProgress, [0.55, 0.6, 0.7, 0.75], [50, 0, 0, -50]);
    const maleScale = useTransform(scrollYProgress, [0.7, 0.75], [1, 0.9]);

    // ---------------------------------------------------------------------------
    // SCENE 5: FEMALE PHYSIOLOGY (Your Reality)
    // Range: 0.75 - 1.0
    // ---------------------------------------------------------------------------
    const femaleOpacity = useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1]);
    const femaleY = useTransform(scrollYProgress, [0.75, 0.8], [50, 0]);


    return (
        <section ref={containerRef} className="relative h-[350vh] md:h-[500vh] bg-rove-charcoal text-white">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6">

                {/* Background: Constant Dark Flow */}
                <div className="absolute inset-0 z-0">
                    <HormoneFlowBackground className="opacity-10" />
                </div>

                {/* --- SCENE 1: THE HOOK --- */}
                <motion.div
                    style={{ opacity: hookOpacity, scale: hookScale }}
                    className="absolute z-10 max-w-4xl text-center"
                >
                    <Badge variant="outline" className="mb-8 border-white/20 text-white/60 mx-auto">
                        The Research Gap
                    </Badge>
                    <h2 className="font-heading text-6xl md:text-8xl lg:text-9xl tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        You are not <br /> a small man.
                    </h2>
                </motion.div>

                {/* --- SCENE 2: THE STAT --- */}
                <motion.div
                    style={{ opacity: statOpacity, y: statY }}
                    className="absolute z-10 max-w-2xl text-center px-6"
                >
                    <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-white/90">
                        <span className="text-rove-red font-medium">70%</span> of medical research is performed on male mice.
                        <br className="hidden md:block" />
                        <span className="text-white/50 mt-4 block text-xl md:text-2xl">
                            Science treats your cycle as a "variable" to be removed. <br />
                            We treat it as your baseline.
                        </span>
                    </p>
                </motion.div>

                {/* --- SCENE 3: MISMATCH INTRO --- */}
                <motion.div
                    style={{ opacity: mismatchTextOpacity, scale: mismatchTextScale }}
                    className="absolute z-10 text-center"
                >
                    <Badge variant="outline" className="mb-6 border-white/20 text-white/80">
                        The Biological Reality
                    </Badge>
                    <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                        It's not a flaw. <br /> It's a <span className="text-rove-red">mismatch.</span>
                    </h2>
                </motion.div>

                {/* --- SCENE 4: MALE CARD --- */}
                <motion.div
                    style={{ opacity: maleOpacity, y: maleY, scale: maleScale }}
                    className="absolute z-20 w-full max-w-xl"
                >
                    <div className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-12 backdrop-blur-md shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <Sun className="w-24 h-24 text-white" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-white" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Legacy Standard</span>
                            </div>
                            <div>
                                <h3 className="font-heading text-3xl md:text-4xl mb-2">Male Physiology</h3>
                                <div className="inline-block bg-white/10 rounded-full px-4 py-1">
                                    <span className="text-sm font-semibold text-white">24-Hour Cycle</span>
                                </div>
                            </div>
                            <div className="h-32 w-full flex items-center mb-2">
                                <MaleClockGraph />
                            </div>
                            <p className="text-white/60 text-lg">
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
                    <div className="group relative bg-gradient-to-br from-rove-red/10 to-rove-charcoal/80 border border-rove-red/30 rounded-[2rem] p-6 md:p-12 backdrop-blur-md shadow-[0_0_60px_rgba(216,165,157,0.1)]">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <Moon className="w-24 h-24 text-rove-red" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-rove-red" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-rove-red/80">Your Reality</span>
                            </div>
                            <div>
                                <h3 className="font-heading text-3xl md:text-4xl mb-2 text-white">Female Physiology</h3>
                                <div className="inline-block bg-rove-red/20 rounded-full px-4 py-1 border border-rove-red/20">
                                    <span className="text-sm font-semibold text-rove-red">28-Day Cycle</span>
                                </div>
                            </div>
                            <div className="h-32 w-full flex items-center justify-center mb-2">
                                <FemaleCycleGraph color="#D8A59D" />
                            </div>
                            <p className="text-white/80 text-lg">
                                Resets every 28 days. Dynamic.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
