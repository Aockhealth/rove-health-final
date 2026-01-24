"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function ThePrism() {
    return (
        <section className="py-24 px-6 bg-rove-charcoal text-white overflow-hidden relative">
            {/* Background Atmosphere - Subtler */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="flex flex-col items-center mb-20 text-center">
                    <Badge variant="outline" className="mb-6 border-white/20 text-white/80">
                        The Physics of Biology
                    </Badge>
                    <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                        They are the Beam. <br /> You are the <span className="text-transparent bg-clip-text bg-gradient-to-r from-rove-red via-purple-400 to-rove-green">Spectrum.</span>
                    </h2>
                </div>

                <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">

                    {/* 1. THE BEAM (MALE 24h) */}
                    {/* Aligned perfectly center-left */}
                    <div className="absolute left-0 right-[50%] top-1/2 -translate-y-1/2 flex items-center justify-end pr-16 z-10">
                        <div className="relative w-full h-0.5 bg-gradient-to-r from-transparent via-white to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                            <div className="absolute top-[-24px] right-0 text-right">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">24h Clock</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. THE PRISM (The Event) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="w-40 h-40 backdrop-blur-xl bg-white/5 border border-white/20 rounded-[2rem] rotate-45 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.05)] relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            {/* Sharp reflection line */}
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[20px] bg-white/10 rotate-45 group-hover:translate-x-full transition-transform duration-1000" />
                        </motion.div>
                        <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">
                            Infradian Filter
                        </p>
                    </div>

                    {/* 3. THE SPECTRUM (FEMALE 28d) */}
                    {/* Expanding rays with horizontal labels for neatness */}
                    <div className="absolute left-[50%] pl-20 top-1/2 -translate-y-1/2 w-[50%] h-[300px] z-10 flex flex-col justify-center">

                        {/* Ray 1: Red */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            whileInView={{ width: "100%", opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="absolute left-0 top-1/2 h-[2px] bg-rove-red shadow-[0_0_10px_rgba(216,165,157,0.5)] origin-left"
                            style={{ transform: "rotate(-12deg) translateY(-2px)" }}
                        >
                            <span className="absolute right-4 -top-6 text-rove-red text-[10px] font-bold uppercase tracking-wider opacity-80 rotate-0">Menstrual</span>
                        </motion.div>

                        {/* Ray 2: Purple */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            whileInView={{ width: "100%", opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="absolute left-0 top-1/2 h-[2px] bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)] origin-left"
                            style={{ transform: "rotate(-4deg)" }}
                        >
                            <span className="absolute right-12 -top-5 text-indigo-300 text-[10px] font-bold uppercase tracking-wider opacity-80 rotate-0">Follicular</span>
                        </motion.div>

                        {/* Ray 3: Green */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            whileInView={{ width: "100%", opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="absolute left-0 top-1/2 h-[2px] bg-rove-green shadow-[0_0_10px_rgba(74,108,111,0.5)] origin-left"
                            style={{ transform: "rotate(4deg)" }}
                        >
                            <span className="absolute right-16 -bottom-5 text-rove-green text-[10px] font-bold uppercase tracking-wider opacity-80 rotate-0">Ovulatory</span>
                        </motion.div>

                        {/* Ray 4: Orange */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            whileInView={{ width: "100%", opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="absolute left-0 top-1/2 h-[2px] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] origin-left"
                            style={{ transform: "rotate(12deg) translateY(2px)" }}
                        >
                            <span className="absolute right-4 -bottom-6 text-amber-400 text-[10px] font-bold uppercase tracking-wider opacity-80 rotate-0">Luteal</span>
                        </motion.div>

                    </div>
                </div>

                <div className="max-w-2xl mx-auto text-center mt-12">
                    <p className="text-xl md:text-2xl font-light text-white/60">
                        "The world runs on a single frequency. You run on a full symphony."
                    </p>
                </div>
            </div>
        </section>
    );
}
