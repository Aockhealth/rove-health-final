"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Zap, Activity, ShieldCheck, Moon } from "lucide-react";
import { HormoneFlowBackground } from "@/components/HormoneFlowBackground";

const PHASES = [
    {
        title: "Follicular",
        subtitle: "The Spring",
        desc: "Estrogen rises. Creativity peaks. You naturally build energy.",
        icon: Zap,
        color: "bg-rove-charcoal",
        textColor: "text-rove-charcoal",
        accent: "bg-rove-charcoal/10"
    },
    {
        title: "Ovulatory",
        subtitle: "The Summer",
        desc: "Testosterone peaks. Confidence puts you on center stage.",
        icon: Activity,
        color: "bg-rove-green",
        textColor: "text-rove-green",
        accent: "bg-rove-green/10"
    },
    {
        title: "Luteal",
        subtitle: "The Autumn",
        desc: "Progesterone stabilizes. Focus turns inward. Deep work flows.",
        icon: ShieldCheck,
        color: "bg-rove-red",
        textColor: "text-rove-red",
        accent: "bg-rove-red/10"
    },
    {
        title: "Menstrual",
        subtitle: "The Winter",
        desc: "Hormones baseline. Your intuition and analysis are sharpest.",
        icon: Moon,
        color: "bg-rove-stone",
        textColor: "text-rove-stone",
        accent: "bg-rove-stone/10"
    }
];

export function ScrollyBenefits() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} className="relative bg-white text-rove-charcoal">

            {/* --------------------------------------------------------------------------
               DESKTOP: STICKY SCROLLYTELLING (MD+)
               Hidden on mobile, visible on md+
               Height is tall to allow for scrolling
            -------------------------------------------------------------------------- */}
            <div className="hidden md:block relative h-[400vh]">
                <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6">

                    {/* Background */}
                    <div className="absolute inset-0 z-0">
                        <HormoneFlowBackground variant="calm" className="opacity-30" />
                    </div>

                    {/* Header */}
                    <div className="absolute top-12 left-0 w-full text-center z-50">
                        <Badge className="mb-4 bg-rove-green/10 text-rove-green border-rove-green/20">The Scientific Solution</Badge>
                        <p className="text-rove-stone text-sm uppercase tracking-widest font-bold">Infradian Rhythm</p>
                    </div>

                    <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center">
                        {PHASES.map((phase, i) => {
                            // Calculate entry/exit for each card based on scroll progress
                            const start = i * 0.25;
                            const end = start + 0.25;
                            const nextStart = end;

                            // Opacity & Scale Logic (Desktop only)
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const opacity = useTransform(
                                scrollYProgress,
                                [start, start + 0.05, nextStart - 0.05, nextStart],
                                [0, 1, i === PHASES.length - 1 ? 1 : 1, i === PHASES.length - 1 ? 1 : 0]
                            );

                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const scale = useTransform(scrollYProgress, [start, end], [0.9, 1]);
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const y = useTransform(scrollYProgress, [start, start + 0.1], [50, 0]);

                            return (
                                <motion.div
                                    key={phase.title}
                                    style={{ opacity, scale, y }}
                                    className="absolute inset-0 flex items-center justify-center p-6"
                                >
                                    <div className={cn("w-full max-w-md p-12 rounded-[2.5rem] border backdrop-blur-sm shadow-2xl flex flex-col items-center text-center bg-white/80", phase.accent, "border-black/5")}>
                                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-8 shadow-sm", "bg-white")}>
                                            <phase.icon className={cn("w-8 h-8", phase.textColor)} />
                                        </div>
                                        <h3 className={cn("font-heading text-5xl mb-2", phase.textColor)}>{phase.title}</h3>
                                        <span className="text-rove-stone uppercase tracking-widest text-xs font-bold mb-6 block">{phase.subtitle}</span>
                                        <div className="w-12 h-1 bg-current opacity-10 mb-6 rounded-full" />
                                        <p className="text-xl text-rove-charcoal/80 leading-relaxed">
                                            {phase.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --------------------------------------------------------------------------
               MOBILE: HORIZONTAL SNAP (XS-SM)
               Hidden on md+, visible on mobile
               Standard height, horizontal overflow
            -------------------------------------------------------------------------- */}
            <div className="md:hidden py-16 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <HormoneFlowBackground variant="calm" className="opacity-30" />
                </div>

                <div className="text-center mb-8 relative z-10 px-6">
                    <Badge className="mb-4 bg-rove-green/10 text-rove-green border-rove-green/20">The Scientific Solution</Badge>
                    <p className="text-rove-stone text-sm uppercase tracking-widest font-bold">Infradian Rhythm</p>
                </div>

                {/* Snap Container */}
                <div className="flex overflow-x-auto snap-x snap-mandatory px-6 gap-4 pb-8 no-scrollbar relative z-10">
                    {PHASES.map((phase) => (
                        <div key={phase.title} className="snap-center shrink-0 w-[85vw] max-w-sm">
                            <div className={cn("h-full p-8 rounded-[2rem] border backdrop-blur-sm shadow-xl flex flex-col items-center text-center bg-white/60", phase.accent, "border-black/5")}>
                                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-sm", "bg-white")}>
                                    <phase.icon className={cn("w-7 h-7", phase.textColor)} />
                                </div>
                                <h3 className={cn("font-heading text-3xl mb-2", phase.textColor)}>{phase.title}</h3>
                                <span className="text-rove-stone uppercase tracking-widest text-[10px] font-bold mb-4 block">{phase.subtitle}</span>
                                <p className="text-base text-rove-charcoal/80 leading-relaxed">
                                    {phase.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                    {/* Spacer for end of list padding */}
                    <div className="w-2 shrink-0" />
                </div>
            </div>

        </section>
    );
}
