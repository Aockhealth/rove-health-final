"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Clock, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfradianClock() {
    return (
        <section className="py-24 px-6 bg-rove-charcoal text-white overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rove-red/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* The Visual Clock */}
                    <div className="relative h-[500px] flex items-center justify-center">

                        {/* OUTER RING: Infradian (28 Days) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                className="w-[450px] h-[450px] rounded-full border border-white/10 flex items-center justify-center relative"
                            >
                                {/* Markers */}
                                {[...Array(28)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "absolute top-0 w-0.5 h-3 bg-white/20 origin-bottom",
                                            i % 7 === 0 ? "h-6 bg-rove-red/80 w-1" : ""
                                        )}
                                        style={{
                                            left: "50%",
                                            transform: `rotate(${i * (360 / 28)}deg) translateY(-225px)`
                                        }}
                                    />
                                ))}

                                {/* Label */}
                                <div className="absolute -top-12 text-center">
                                    <span className="text-rove-red tracking-[0.2em] text-xs font-bold uppercase block mb-1">Infradian Rhythm</span>
                                    <span className="text-white/40 text-xs">28 Days</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* INNER RING: Circadian (24 Hours) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-[200px] h-[200px] rounded-full border border-white/20 flex items-center justify-center relative bg-white/5 backdrop-blur-sm"
                            >
                                {/* Markers */}
                                {[...Array(12)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-0 w-0.5 h-2 bg-white/40 origin-bottom"
                                        style={{
                                            left: "50%",
                                            transform: `rotate(${i * (360 / 12)}deg) translateY(-100px)`
                                        }}
                                    />
                                ))}

                                {/* Label */}
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <Clock className="w-6 h-6 text-white/80 mb-2" />
                                    <span className="text-white font-heading text-xl">24h</span>
                                    <span className="text-white/40 text-[10px] uppercase tracking-wider mt-1">Circadian</span>
                                </div>

                                {/* Active Hand */}
                                <div className="absolute top-2 left-1/2 w-0.5 h-24 bg-gradient-to-b from-white to-transparent origin-bottom -translate-x-1/2" />
                            </motion.div>
                        </div>

                        {/* Connecting Lines / Orbits */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-white/10"
                        />

                    </div>

                    {/* The Explainer Text */}
                    <div>
                        <Badge variant="outline" className="mb-6 border-white/20 text-white/80">
                            Biology 101
                        </Badge>
                        <h2 className="font-heading text-5xl md:text-6xl mb-8 leading-tight">
                            You have <span className="text-rove-red">two</span> clocks.
                        </h2>

                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">The Male Clock (Circadian)</h3>
                                    <p className="text-white/60 leading-relaxed">
                                        Governs sleep and wakefulness. Resets every 24 hours. The world is built on this rhythm.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 relative">
                                {/* Connector Line */}
                                <div className="absolute left-6 top-12 bottom-[-32px] w-px bg-gradient-to-b from-rove-red/50 to-transparent" />

                                <div className="w-12 h-12 rounded-xl bg-rove-red/20 flex items-center justify-center shrink-0 ring-1 ring-rove-red/50">
                                    <Activity className="w-6 h-6 text-rove-red" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-rove-red">Your Clock (Infradian)</h3>
                                    <p className="text-white/80 leading-relaxed text-lg">
                                        Governs your brain, metabolism, immunity, and stress response. Resets every 28 days.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <p className="text-white/90 italic font-light text-lg">
                                "The problem isn't your body. The problem is trying to run a 28-day system on a 24-hour schedule."
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
