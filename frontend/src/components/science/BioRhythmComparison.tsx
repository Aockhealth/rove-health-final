"use client";

import { motion } from "framer-motion";
import { MaleClockGraph, FemaleCycleGraph } from "@/components/CycleGraphs";
import { cn } from "@/lib/utils";

export function BioRhythmComparison() {
    return (
        <section className="py-24 px-6 bg-rove-charcoal text-white overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">

                    {/* Male 24h Clock */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-white/5 rounded-3xl blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
                        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="h-48 mb-6">
                                <MaleClockGraph color="white" />
                            </div>
                            <h3 className="text-2xl font-heading mb-2">The 24-Hour Clock</h3>
                            <p className="text-white/60 leading-relaxed">
                                <span className="text-white font-bold">Male physiology</span> resets every 24 hours like the sun. Predictable. Consistent. Linear.
                            </p>
                        </div>
                    </div>

                    {/* Female 28d Rhythm */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-rove-red/20 rounded-3xl blur-2xl group-hover:bg-rove-red/30 transition-colors duration-500" />
                        <div className="relative bg-white/5 border border-rove-red/30 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="h-48 mb-6">
                                <FemaleCycleGraph color="#D8A59D" />
                            </div>
                            <h3 className="text-2xl font-heading mb-2 text-rove-red">The 28-Day Rhythm</h3>
                            <p className="text-white/60 leading-relaxed">
                                <span className="text-rove-red font-bold">Female physiology</span> flows through 4 distinct phases. Cyclical. Dynamic. Powerful.
                            </p>
                        </div>
                    </div>

                </div>

                <div className="mt-16 text-center max-w-2xl mx-auto">
                    <p className="text-xl md:text-2xl font-light text-white/80">
                        "Trying to live a 24-hour life in a 28-day body is why you feel exhausted."
                    </p>
                </div>
            </div>
        </section>
    );
}
