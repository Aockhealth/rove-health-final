"use client";

import { Badge } from "@/components/ui/Badge";
import { TrendingUp, AlertCircle, Info, Sparkles, Brain, Activity, Droplets, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function InsightsPage() {
    // Mock data
    const symptomTrends = [
        { name: "Anxiety", value: 70, color: "bg-rove-red" },
        { name: "Energy", value: 40, color: "bg-rove-green" },
        { name: "Bloating", value: 20, color: "bg-rove-charcoal" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { stiffness: 40, damping: 20 } }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20">
            {/* Immersive Background Gradient */}
            {/* Immersive Background Gradient - Optimized */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-rove-charcoal/5 rounded-full blur-[100px] animate-pulse will-change-[opacity]" style={{ animationDuration: "15s" }} />
                <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] bg-rove-red/5 rounded-full blur-[80px]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 p-4 md:p-8 space-y-8 pb-32"
            >
                <motion.header variants={itemVariants}>
                    <h1 className="font-heading text-3xl text-rove-charcoal mb-1">Cycle Insights</h1>
                    <p className="text-rove-stone text-sm">AI analysis based on your last 3 cycles.</p>
                </motion.header>

                {/* Main Insight Card - Holographic Style */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-lg group"
                >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                    <div className="flex items-start gap-4 mb-6 relative z-10">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-rove-charcoal">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="font-heading text-xl text-rove-charcoal">Pattern Detected</h2>
                                <Badge variant="secondary" className="bg-rove-red/10 text-rove-red text-[10px] px-2 py-0.5 border-rove-red/20">High Confidence</Badge>
                            </div>
                            <p className="text-rove-charcoal/80 text-sm leading-relaxed">
                                Your anxiety tends to peak <span className="font-bold text-rove-charcoal">3 days before your period</span>. This correlates with the sharp drop in progesterone.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/50 p-5 rounded-[1.5rem] border border-white/40 backdrop-blur-sm">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-4">Top Symptoms This Phase</h3>
                        <div className="space-y-5">
                            {symptomTrends.map((item, i) => (
                                <div key={item.name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-rove-charcoal">{item.name}</span>
                                        <span className="text-rove-stone font-mono text-xs">{item.value}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${item.value}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.5 + (i * 0.2), ease: [0.22, 1, 0.36, 1] }}
                                            className={`h-full rounded-full ${item.color} relative`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Cycle Metrics Grid */}
                <motion.section variants={itemVariants}>
                    <h3 className="font-heading text-xl text-rove-charcoal mb-6 px-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rove-gold" />
                        Cycle Intelligence
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="relative overflow-hidden p-6 rounded-[2.5rem] bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group hover:bg-white/40 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rove-charcoal/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                <div className="flex justify-between items-start">
                                    <Activity className="w-5 h-5 text-rove-charcoal/60 stroke-[1.5]" />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-rove-charcoal/50 font-semibold mb-1">Avg Cycle</p>
                                    <div className="flex items-baseline">
                                        <span className="font-heading text-4xl text-rove-charcoal">28</span>
                                        <span className="text-xs text-rove-charcoal/40 font-medium ml-1">days</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="relative overflow-hidden p-6 rounded-[2.5rem] bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group hover:bg-white/40 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rove-red/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                <div className="flex justify-between items-start">
                                    <Droplets className="w-5 h-5 text-rove-red/60 stroke-[1.5]" />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-rove-charcoal/50 font-semibold mb-1">Flow</p>
                                    <div className="flex items-baseline">
                                        <span className="font-heading text-4xl text-rove-charcoal">5</span>
                                        <span className="text-xs text-rove-charcoal/40 font-medium ml-1">days</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="col-span-2 relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-transparent to-transparent opacity-50" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
                                        <div className="relative w-12 h-12 rounded-full border border-emerald-500/20 flex items-center justify-center bg-emerald-50/50 backdrop-blur-sm">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[1.5]" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-heading text-2xl text-rove-charcoal mb-0.5">Regular</p>
                                        <p className="text-xs text-rove-charcoal/60 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            98% Consistency
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-rove-charcoal/50 font-semibold mb-1">Next Period</p>
                                    <p className="font-heading text-xl text-rove-charcoal">Oct 24</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Phase Analysis - Timeline View */}
                <motion.section variants={itemVariants}>
                    <h3 className="font-heading text-xl text-rove-charcoal mb-4 px-2">Phase Analysis</h3>
                    <div className="relative pl-8 border-l-2 border-rove-charcoal/10 space-y-8">
                        <div className="relative">
                            <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-rove-charcoal border-4 border-white shadow-sm" />
                            <div className="p-4 rounded-[1.5rem] bg-white/60 backdrop-blur-sm border border-white/50">
                                <p className="text-xs font-bold uppercase tracking-wider text-rove-stone mb-1">Current Phase</p>
                                <h4 className="font-heading text-lg text-rove-charcoal">Follicular</h4>
                                <p className="text-sm text-rove-charcoal/70 mt-1">Energy rising, creativity peaking.</p>
                            </div>
                        </div>
                        <div className="relative opacity-60">
                            <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-white border-4 border-white shadow-sm ring-2 ring-rove-charcoal/10" />
                            <div className="p-4 rounded-[1.5rem] bg-white/30 backdrop-blur-sm border border-white/30">
                                <p className="text-xs font-bold uppercase tracking-wider text-rove-stone mb-1">Next Phase</p>
                                <h4 className="font-heading text-lg text-rove-charcoal">Ovulatory</h4>
                                <p className="text-sm text-rove-charcoal/70 mt-1">High social energy, confidence boost.</p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Educational Tip */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-rove-charcoal text-white p-6 rounded-[2rem] flex gap-5 items-start shadow-xl shadow-rove-charcoal/10"
                >
                    <div className="p-2 bg-white/10 rounded-full">
                        <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-heading text-lg mb-1">Did you know?</h4>
                        <p className="text-sm text-white/70 leading-relaxed font-light">
                            Your metabolism speeds up during the Luteal phase. You actually need <span className="text-white font-medium">100-300 more calories</span> per day to support your body.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>);
}
