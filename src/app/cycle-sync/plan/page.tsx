"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Utensils, Dumbbell, Brain, ArrowRight, CheckCircle2, Play, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function DailyPlanPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20">
            {/* Immersive Background Gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[50%] w-[600px] h-[600px] bg-rove-green/5 rounded-full blur-[100px] -translate-x-1/2" />
            </div>

            <div className="relative z-10 p-4 md:p-8 space-y-8 pb-32">
                <header>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mb-3"
                    >
                        <Badge variant="secondary" className="bg-rove-charcoal text-white border-none px-3 py-1 text-[10px] tracking-widest uppercase">Follicular Phase</Badge>
                        <span className="text-xs font-bold text-rove-stone uppercase tracking-widest">Day 8</span>
                    </motion.div>
                    <h1 className="font-heading text-3xl text-rove-charcoal mb-2">Today's Protocol</h1>
                    <p className="text-rove-stone text-sm max-w-sm">Your biology is primed for <span className="text-rove-charcoal font-medium">fresh foods</span> and <span className="text-rove-charcoal font-medium">cardio</span>.</p>
                </header>

                {/* Nutrition Section - Mini River */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 overflow-hidden shadow-sm"
                >
                    <div className="p-6 border-b border-white/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl text-rove-green shadow-sm">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-heading text-xl text-rove-charcoal leading-none">Fuel</h2>
                                <p className="text-[10px] text-rove-stone uppercase tracking-wider mt-1">Light & Vibrant</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-4">Recommended Ingredients</h3>
                        {/* Horizontal Scroll Container */}
                        <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
                            {[
                                { name: "Avocado", desc: "Healthy Fats", color: "bg-green-100 text-green-700" },
                                { name: "Salmon", desc: "Omega-3s", color: "bg-orange-100 text-orange-700" },
                                { name: "Kimchi", desc: "Probiotics", color: "bg-red-100 text-red-700" },
                                { name: "Leafy Greens", desc: "Iron", color: "bg-emerald-100 text-emerald-700" },
                                { name: "Citrus", desc: "Vitamin C", color: "bg-yellow-100 text-yellow-700" }
                            ].map((food, i) => (
                                <motion.div
                                    key={food.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex-shrink-0 w-32 p-4 rounded-[1.5rem] bg-white border border-white/50 shadow-sm flex flex-col items-center text-center gap-2"
                                >
                                    <div className={`w-10 h-10 rounded-full ${food.color} flex items-center justify-center text-xs font-bold`}>
                                        {food.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-heading text-sm text-rove-charcoal">{food.name}</p>
                                        <p className="text-[10px] text-rove-stone">{food.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-2 bg-white/60 p-5 rounded-[1.5rem] border border-white/40 flex justify-between items-center">
                            <div>
                                <h3 className="font-heading text-lg text-rove-charcoal mb-1">Citrus Glazed Salmon</h3>
                                <p className="text-xs text-rove-stone">25 mins • High Protein</p>
                            </div>
                            <Button size="icon" className="rounded-full bg-rove-charcoal text-white w-10 h-10 shadow-lg shadow-rove-charcoal/20">
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.section>

                {/* Movement Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 overflow-hidden shadow-sm"
                >
                    <div className="p-6 border-b border-white/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl text-rove-red shadow-sm">
                                <Dumbbell className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-heading text-xl text-rove-charcoal leading-none">Movement</h2>
                                <p className="text-[10px] text-rove-stone uppercase tracking-wider mt-1">Cardio & HIIT</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="relative overflow-hidden rounded-[2rem] bg-rove-charcoal text-white p-6 mb-4 shadow-lg shadow-rove-charcoal/20 group cursor-pointer">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Play className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">Featured</Badge>
                                    <span className="flex items-center gap-1 text-xs text-white/70"><Clock className="w-3 h-3" /> 20 min</span>
                                </div>
                                <h3 className="font-heading text-2xl mb-2">Morning HIIT Blast</h3>
                                <p className="text-sm text-white/70 mb-6 max-w-[200px]">Boost your metabolism with this high energy session.</p>
                                <Button size="sm" className="rounded-full bg-white text-rove-charcoal hover:bg-white/90 font-bold px-6">Start Workout</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {["Jumping Jacks", "Burpees", "Mountain Climbers", "Rest"].map((exercise, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/40 transition-colors">
                                    <div className="w-6 h-6 rounded-full border-2 border-rove-stone/20 flex items-center justify-center text-transparent hover:border-rove-charcoal hover:text-rove-charcoal transition-all cursor-pointer">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-rove-charcoal">{exercise}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Focus Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 overflow-hidden shadow-sm"
                >
                    <div className="p-6 border-b border-white/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl text-rove-charcoal shadow-sm">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-heading text-xl text-rove-charcoal leading-none">Focus</h2>
                                <p className="text-[10px] text-rove-stone uppercase tracking-wider mt-1">Brainstorming</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-rove-charcoal/80 leading-relaxed text-sm">
                            Your brain is primed for new ideas today. Tackle that creative project you've been putting off.
                        </p>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
