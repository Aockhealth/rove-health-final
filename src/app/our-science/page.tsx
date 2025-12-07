"use client";

import { motion } from "framer-motion";
import { HormoneFlowBackground } from "@/components/HormoneFlowBackground";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CycleSymptomVisualizer } from "@/components/CycleSymptomVisualizer";
import { ArrowRight, Brain, Activity, Droplets, Sun, Moon, Clock, ShieldCheck, Microscope, Layers, Repeat, TrendingUp, HeartPulse, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OurSciencePage() {
    return (
        <div className="min-h-screen bg-white text-rove-charcoal font-sans selection:bg-rove-red/20">

            {/* 1. THE HOOK: The World Was Built For Men */}
            <section className="relative min-h-[90vh] flex flex-col justify-center px-6 overflow-hidden">
                <HormoneFlowBackground variant="calm" className="opacity-40" />
                <div className="relative z-10 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge variant="luxury" className="mb-6 bg-rove-red/10 text-rove-red border-rove-red/20">
                            The Hard Truth
                        </Badge>
                        <h1 className="font-heading text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-[1.1]">
                            The world was built for <span className="italic text-rove-stone">men.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-rove-charcoal/80 font-light leading-relaxed">
                            Medical research. Diet plans. Work schedules. They all assume one thing:
                        </p>
                        <p className="text-xl md:text-2xl text-rove-charcoal font-medium mt-4">
                            You are the same person every single day.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. THE CONFLICT: Why You Feel Crazy */}
            <section className="py-20 px-6 bg-rove-charcoal text-white">
                <div className="max-w-xl">
                    <h2 className="font-heading text-4xl md:text-5xl mb-8">But you're not.</h2>

                    <div className="space-y-12">
                        <div className="border-l-2 border-white/20 pl-6">
                            <h3 className="text-2xl font-bold mb-2 text-rove-red">The 24-Hour Lie</h3>
                            <p className="text-lg text-white/70 leading-relaxed">
                                Men run on a 24-hour clock. They wake up, reset, and repeat. The world expects you to do the same.
                            </p>
                        </div>

                        <div className="border-l-2 border-white/20 pl-6">
                            <h3 className="text-2xl font-bold mb-2 text-rove-red">The Burnout Loop</h3>
                            <p className="text-lg text-white/70 leading-relaxed">
                                Trying to live a 24-hour life in a 28-day body is why you feel exhausted, anxious, and out of sync.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. THE REVEAL: The 2nd Clock */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-xl">
                    <Badge className="mb-6 bg-rove-green/10 text-rove-green border-rove-green/20">The Missing Piece</Badge>
                    <h2 className="font-heading text-4xl md:text-6xl mb-6 text-rove-charcoal">You have a second clock.</h2>
                    <p className="text-xl text-rove-stone leading-relaxed mb-12">
                        It's called the <strong className="text-rove-charcoal">Infradian Rhythm</strong>. It doesn't reset daily. It shifts weekly.
                    </p>

                    <div className="bg-rove-cream/50 rounded-3xl p-8 border border-rove-stone/10">
                        <div className="flex items-center gap-4 mb-6">
                            <Clock className="w-8 h-8 text-rove-charcoal" />
                            <h3 className="font-heading text-2xl">4 Phases. 4 Realities.</h3>
                        </div>
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-rove-red shrink-0 mt-1" />
                                <div>
                                    <span className="font-bold text-rove-charcoal block text-lg">Menstrual</span>
                                    <span className="text-rove-stone">Winter. Rest & Release.</span>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-rove-charcoal shrink-0 mt-1" />
                                <div>
                                    <span className="font-bold text-rove-charcoal block text-lg">Follicular</span>
                                    <span className="text-rove-stone">Spring. Energy & Creativity.</span>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-rove-green shrink-0 mt-1" />
                                <div>
                                    <span className="font-bold text-rove-charcoal block text-lg">Ovulatory</span>
                                    <span className="text-rove-stone">Summer. Magnetism & Power.</span>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-orange-400 shrink-0 mt-1" />
                                <div>
                                    <span className="font-bold text-rove-charcoal block text-lg">Luteal</span>
                                    <span className="text-rove-stone">Autumn. Focus & Detail.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 4. THE SOLUTION: Decode Your Symptoms */}
            <section className="py-20 bg-rove-cream/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-xl mb-12">
                        <h2 className="font-heading text-4xl md:text-5xl mb-4">Stop guessing.</h2>
                        <p className="text-xl text-rove-stone">
                            Your symptoms aren't random. They are signals.
                        </p>
                    </div>

                    {/* The Visualizer Component */}
                    <CycleSymptomVisualizer />
                </div>
            </section>

            {/* 5. THE DEEP DIVE: The 3 Architects */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-xl mx-auto">
                    <h2 className="font-heading text-4xl md:text-5xl mb-12 text-center">Meet your architects.</h2>

                    <div className="space-y-8">
                        <div className="p-8 rounded-3xl bg-white border border-rove-stone/10 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-rove-charcoal/5 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-rove-charcoal" />
                                </div>
                                <h3 className="font-heading text-2xl">Estrogen</h3>
                            </div>
                            <p className="text-rove-stone text-lg">
                                The Builder. It boosts your energy, mood, and brain power. When it drops, so do you.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-white border border-rove-stone/10 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-rove-green/5 rounded-xl">
                                    <ShieldCheck className="w-6 h-6 text-rove-green" />
                                </div>
                                <h3 className="font-heading text-2xl">Progesterone</h3>
                            </div>
                            <p className="text-rove-stone text-lg">
                                The Stabilizer. It keeps you calm and helps you sleep. Stress kills it first.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-white border border-rove-stone/10 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-rove-red/5 rounded-xl">
                                    <HeartPulse className="w-6 h-6 text-rove-red" />
                                </div>
                                <h3 className="font-heading text-2xl">Testosterone</h3>
                            </div>
                            <p className="text-rove-stone text-lg">
                                The Driver. It powers your libido, motivation, and muscle growth. Yes, you need it too.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. CALL TO ACTION */}
            <section className="py-24 px-6 bg-rove-charcoal text-center text-white">
                <div className="max-w-xl mx-auto">
                    <h2 className="font-heading text-5xl mb-6">Stop fighting your biology.</h2>
                    <p className="text-xl text-white/60 mb-10">
                        We built the system that syncs with you.
                    </p>
                    <Button size="lg" className="w-full md:w-auto rounded-full px-12 h-16 text-xl bg-white text-rove-charcoal hover:bg-rove-cream" asChild>
                        <a href="/cycle-sync">Start Syncing Now</a>
                    </Button>
                </div>
            </section>
        </div>
    );
}
