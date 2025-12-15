"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, FileText, Download, CheckCircle2, AlertCircle, Calendar, Activity, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { fetchInsightsData } from "@/app/actions/cycle-sync";

// Types derived from action return
type InsightsData = {
    averages: { cycle: number; period: number };
    history: { month: string; length: number; periodLength: number; status: string }[];
    lastCycle: { month: string; length: number; periodLength: number; status: string };
    symptoms: { name: string; count: number; severity: string; phase: string }[];
    vitals: { bbt: { day: number; temp: number }[]; weight: { current: number; trend: string } };
};

export default function InsightsPage() {
    const [data, setData] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"cycle" | "symptoms" | "medical">("cycle");

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await fetchInsightsData();
            if (res) setData(res);
            setLoading(false);
        }
        load();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { stiffness: 40, damping: 20 } }
    };

    const handleDownload = () => {
        alert("Generating Medical Report...");
    };

    if (loading) return <div className="min-h-screen bg-rove-cream/20 flex items-center justify-center text-rove-stone">Loading Insights...</div>;
    if (!data) return <div className="min-h-screen bg-rove-cream/20 flex items-center justify-center text-rove-stone">No data available.</div>;

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20 pb-24">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-rove-charcoal/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] bg-rove-red/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 p-4 md:p-8 space-y-6">
                <header>
                    <h1 className="font-heading text-2xl md:text-3xl text-rove-charcoal mb-1">Insights</h1>
                    <p className="text-rove-stone text-xs md:text-sm">Deep dive into your biomarkers.</p>
                </header>

                {/* TABS - Floating Glass Pill */}
                <div className="flex p-1.5 bg-white/40 backdrop-blur-xl rounded-full border border-white/40 shadow-lg shadow-rove-charcoal/5 mx-auto max-w-sm mb-6">
                    {(["cycle", "symptoms", "medical"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${activeTab === tab
                                ? "bg-white text-rove-charcoal shadow-md"
                                : "text-rove-charcoal/60 hover:bg-white/20"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* --- CYCLE TAB --- */}
                {activeTab === "cycle" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pb-20"
                    >
                        {/* 1. Avg Cycle (Square) */}
                        <div className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 flex flex-col justify-between aspect-square shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest text-rove-stone font-bold">Avg Cycle</p>
                            <div className="text-center my-auto">
                                <span className="font-heading text-5xl text-rove-charcoal">{data.averages.cycle}</span>
                                <span className="block text-xs text-rove-stone font-medium">days</span>
                            </div>
                        </div>

                        {/* 2. Avg Period (Square) */}
                        <div className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 flex flex-col justify-between aspect-square shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest text-rove-stone font-bold">Avg Period</p>
                            <div className="text-center my-auto">
                                <span className="font-heading text-5xl text-rove-charcoal">{data.averages.period}</span>
                                <span className="block text-xs text-rove-stone font-medium">days</span>
                            </div>
                        </div>

                        {/* 3. Regularity Badge (Square) */}
                        <div className="p-4 rounded-[1.5rem] bg-emerald-50/60 backdrop-blur-xl border border-emerald-100 flex flex-col justify-center items-center text-center aspect-square shadow-sm">
                            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 mb-2">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="font-heading text-sm text-emerald-800">Normal</span>
                            <span className="text-[10px] text-emerald-600 font-medium">+ Regular</span>
                        </div>

                        {/* 4. Variation (Square) */}
                        <div className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 flex flex-col justify-between aspect-square shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest text-rove-stone font-bold">Var.</p>
                            <div className="text-center my-auto">
                                <span className="font-heading text-4xl text-rove-charcoal">+/- 2</span>
                                <span className="block text-xs text-rove-stone font-medium">Deviation</span>
                            </div>
                        </div>

                        {/* 5. Graph (Wide Tile - Full width on mobile) */}
                        <div className="col-span-2 md:col-span-4 p-5 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 min-h-[200px] flex flex-col justify-between shadow-sm mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-heading text-base text-rove-charcoal">Cycle History</h3>
                                <Badge variant="outline" className="text-[10px] bg-white/40 border-white">6 Months</Badge>
                            </div>
                            <div className="h-32 w-full pt-4">
                                <MockLineGraph data={data.history.map(d => d.length)} labels={data.history.map(d => d.month)} />
                            </div>
                        </div>

                        {/* 6. Recent History (Wide Tile) */}
                        <div className="col-span-2 md:col-span-4 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-rove-stone ml-2">Recent Cycles</h3>
                            {data.history.slice(0, 3).map((cycle, i) => (
                                <div key={i} className="p-4 bg-white/60 backdrop-blur-sm rounded-[1.5rem] border border-white/80 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-xs font-black text-rove-charcoal shadow-sm border border-gray-100">
                                            {cycle.month}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-rove-charcoal">{cycle.length} Days</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < cycle.periodLength ? 'bg-rove-red' : 'bg-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* --- SYMPTOMS TAB --- */}
                {activeTab === "symptoms" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                    >
                        {/* 1. Top Symptom Highlight (Wide Tile) */}
                        <div className="col-span-2 md:col-span-4 relative overflow-hidden p-6 rounded-[2rem] bg-[#1a1a1a] text-white shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rove-red/20 rounded-full blur-[40px] pointer-events-none" />
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Pattern Alert</span>
                                <AlertCircle className="w-5 h-5 text-rove-gold" />
                            </div>
                            <h3 className="font-heading text-4xl text-white mb-2 relative z-10">{data.symptoms[0]?.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-rove-gold font-bold">
                                <TrendingUp className="w-3 h-3" /> Highest Frequency
                            </div>
                        </div>

                        {/* 2 & 3. Secondary Symptoms (Squares) */}
                        {data.symptoms.slice(1, 3).map((sym, i) => (
                            <div key={i} className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 flex flex-col justify-between aspect-square">
                                <div className="w-8 h-8 rounded-full bg-rove-red/10 flex items-center justify-center text-rove-red">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-heading text-lg text-rove-charcoal leading-none mb-1">{sym.name}</p>
                                    <p className="text-[10px] text-rove-stone font-bold uppercase">{sym.severity}</p>
                                </div>
                            </div>
                        ))}

                        {/* 4. Distribution Bar (Wide Tile) */}
                        <div className="col-span-2 md:col-span-4 p-5 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60">
                            <h3 className="font-heading text-sm text-rove-charcoal mb-4">Symptom Distribution</h3>
                            <div className="space-y-3">
                                {data.symptoms.slice(0, 3).map((s, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-16 text-xs font-bold text-rove-stone truncate">{s.name}</span>
                                        <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
                                            <div style={{ width: `${(s.count / 20) * 100}%` }} className="h-full bg-rove-charcoal rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- MEDICAL TAB --- */}
                {activeTab === "medical" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                    >
                        {/* 1. Doctor Report (Wide Tile - Compact) */}
                        <div className="col-span-2 md:col-span-4 p-5 rounded-[2rem] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border border-[#A5D6A7] flex flex-col justify-center relative overflow-hidden h-32 shadow-sm">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h3 className="font-heading text-xl text-[#1B5E20]">Doctor Report</h3>
                                    <p className="text-xs text-[#2E7D32] mb-3">Last 6 Cycles • PDF</p>
                                    <button onClick={handleDownload} className="bg-[#1B5E20] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2">
                                        <Download className="w-3 h-3" /> Download
                                    </button>
                                </div>
                                <FileText className="w-16 h-16 text-[#1B5E20] opacity-10 rotate-[-10deg]" />
                            </div>
                        </div>

                        {/* 2. BBT Graph (Wide Tile) */}
                        <div className="col-span-2 md:col-span-4 p-5 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-heading text-sm text-rove-charcoal">Basal Body Temp</h3>
                                <div className="px-2 py-0.5 rounded-full bg-white/50 text-[10px] font-bold text-rove-stone">30D</div>
                            </div>
                            <div className="h-20 flex items-end justify-between gap-0.5">
                                {data.vitals.bbt.map((day, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${(day.temp - 36) * 100}%` }}
                                        className={`w-full rounded-t-sm ${i > 14 ? 'bg-rove-red/60' : 'bg-rove-charcoal/20'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 3. Weight Tile (Square) */}
                        <div className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 flex flex-col justify-between aspect-square">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] uppercase tracking-widest text-rove-stone font-bold">Weight</p>
                                {/* Scale Icon would go here if imported, using generic layout */}
                            </div>
                            <div>
                                <span className="font-heading text-3xl text-rove-charcoal">{data.vitals.weight.current}</span>
                                <span className="text-xs text-rove-stone font-medium ml-1">kg</span>
                                <div className="mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-1.5 py-0.5 rounded-full">
                                    {data.vitals.weight.trend}
                                </div>
                            </div>
                        </div>

                        {/* 4. Ask Doctor (Square) */}
                        <div className="p-4 rounded-[1.5rem] bg-blue-50/60 border border-blue-100 flex flex-col justify-between aspect-square">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Brain className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-heading text-sm text-blue-800 leading-tight mb-1">Ask Doctor</p>
                                <p className="text-[10px] text-blue-600 leading-tight">Generate Qs</p>
                            </div>
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Sub-components
function InfoIcon() {
    return (
        <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-xs font-serif italic">i</span>
        </div>
    );
}

function MockLineGraph({ data, labels }: { data: number[], labels: string[] }) {
    // Simple SVG Line Graph
    const max = Math.max(...data, 35);
    const min = Math.min(...data, 20);
    const range = max - min;
    const height = 100;
    const width = 100; // Percent

    // Calculate points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 80 - 10; // Padding
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className="w-full h-32 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-gray-300 pointer-events-none">
                <div className="border-b border-dashed border-gray-100 w-full h-full absolute top-[25%]" />
                <div className="border-b border-dashed border-gray-100 w-full h-full absolute top-[50%]" />
                <div className="border-b border-dashed border-gray-100 w-full h-full absolute top-[75%]" />
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Line */}
                <motion.polyline
                    fill="none"
                    stroke="#D8A59D" // Rove Red/Pinkish
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Dots */}
                {data.map((val, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((val - min) / range) * 80 - 10;
                    return (
                        <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#fff"
                            stroke="#D8A59D"
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + (i * 0.1) }}
                        />
                    );
                })}
            </svg>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                {labels.map((l, i) => (
                    <span key={i}>{l}</span>
                ))}
            </div>
        </div>
    );
}
