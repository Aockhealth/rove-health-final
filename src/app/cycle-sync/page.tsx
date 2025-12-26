"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Droplets, Zap, Moon, Sun, ArrowRight, Sparkles, TrendingUp, Brain, Activity, Utensils, Dumbbell, Baby, Flower2, Heart, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchDashboardData } from "@/app/actions/cycle-sync";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- 1. Helper Components ---

function RiverTrack({ items, direction = "left", speed = 20, label }: { items: any[], direction?: "left" | "right", speed?: number, label: string }) {
    const riverItems = [...items, ...items, ...items, ...items];
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full overflow-hidden">
            <div className="px-4 md:px-8 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/70">{label}</span>
            </div>
            <motion.div
                className="flex gap-3 w-max will-change-transform"
                initial={{ x: direction === "left" ? 0 : "-50%" }}
                animate={{ x: direction === "left" ? "-50%" : 0 }}
                transition={{ duration: speed, ease: "linear", repeat: Infinity }}
                style={{ backfaceVisibility: "hidden", WebkitFontSmoothing: "antialiased" }}
            >
                {riverItems.map((item, i) => (
                    <div key={i} className="w-auto min-w-[180px] flex-shrink-0 p-2.5 rounded-[1.25rem] bg-white/40 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-3 hover:bg-white/60 transition-colors cursor-pointer group transform-gpu">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", item.bg || "bg-white", item.color)}>
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="font-heading text-sm text-rove-charcoal leading-tight whitespace-nowrap">{item.title}</h4>
                            <p className="text-rove-stone text-[9px] whitespace-nowrap">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

const iconMap: Record<string, any> = {
    "Moon": Moon, "Sparkles": Sparkles, "Brain": Brain, "Utensils": Utensils,
    "Activity": Activity, "Leaf": Droplets, "Dumbbell": Dumbbell, "Zap": Zap,
    "Sun": Sun, "TrendingUp": TrendingUp, "Heart": Heart, "Wind": Wind
};

function DailyFlowRiver({ data }: { data: any }) {
    const mapItems = (items: any[], colorClass: string, bgClass: string) =>
        (items || []).map(item => ({
            ...item,
            icon: iconMap[item.icon] || Sparkles,
            color: colorClass,
            bg: bgClass
        }));

    const fuel = mapItems(data?.fuel, "text-rove-green", "bg-rove-green/10");
    const move = mapItems(data?.move, "text-rove-red", "bg-rove-red/10");
    const rituals = mapItems(data?.rituals, "text-rove-purple", "bg-rove-purple/10");

    if (!data || (!fuel.length && !move.length)) return (
        <div className="p-8 text-center border-2 border-dashed border-rove-stone/10 rounded-3xl bg-white/30">
            <p className="text-rove-stone text-sm mb-2">No flow data yet.</p>
            <Link href="/cycle-sync/tracker">
                <Button variant="link" className="text-rove-green">Set up your cycle →</Button>
            </Link>
        </div>
    );

    return (
        <div className="space-y-2 -mx-4 md:-mx-8">
            <RiverTrack label="Recommended Fuel" items={fuel} direction="right" speed={40} />
            <RiverTrack label="Movement Plan" items={move} direction="left" speed={38} />
            <RiverTrack label="Daily Rituals" items={rituals} direction="right" speed={42} />
        </div>
    );
}

// Phase Theme Logic
const phaseThemes: Record<string, any> = {
    "Menstrual": { color: "text-rose-500", blob: "bg-rose-200/20", orbRing: "from-rose-300 via-rose-100 to-rose-400", glow: "shadow-[0_0_40px_rgba(251,113,133,0.2)]", badge: "bg-rose-50 text-rose-600 border-rose-100" },
    "Follicular": { color: "text-teal-600", blob: "bg-teal-200/15", orbRing: "from-teal-300 via-emerald-100 to-teal-400", glow: "shadow-[0_0_40px_rgba(45,212,191,0.2)]", badge: "bg-teal-50 text-teal-700 border-teal-100" },
    "Ovulatory": { color: "text-amber-500/90", blob: "bg-amber-100/30", orbRing: "from-amber-300 via-yellow-100 to-amber-400", glow: "shadow-[0_0_40px_rgba(251,191,36,0.25)]", badge: "bg-amber-50 text-amber-700 border-amber-100" },
    "Luteal": { color: "text-indigo-500", blob: "bg-indigo-200/15", orbRing: "from-indigo-300 via-blue-100 to-indigo-400", glow: "shadow-[0_0_40px_rgba(129,140,248,0.2)]", badge: "bg-indigo-50 text-indigo-600 border-indigo-100" }
};

// --- 3. Animated Components ---

function HormoneWave({ color = "#fb7185" }: { color?: string }) {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-50">
            <motion.path d="M0 50 Q 25 30, 50 50 T 100 50" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1, pathOffset: [0, 1] }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }} />
            <motion.path d="M0 50 Q 25 70, 50 50 T 100 50" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" className="opacity-50" initial={{ pathLength: 0 }} animate={{ pathLength: 1, pathOffset: [1, 0] }} transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }} />
        </svg>
    );
}

function BodyDNA({ color = "#22c55e" }: { color?: string }) {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-50">
            {[10, 30, 50, 70, 90].map((y, i) => (
                <motion.line key={i} x1="30" y1={y} x2="70" y2={y} stroke={color} strokeWidth="6" strokeLinecap="round" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }} />
            ))}
            <motion.path d="M30 0 V100" stroke={color} strokeWidth="4" opacity="0.3" />
            <motion.path d="M70 0 V100" stroke={color} strokeWidth="4" opacity="0.3" />
        </svg>
    );
}

function MindSynapse({ color = "#374151" }: { color?: string }) {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-50">
            <motion.circle cx="50" cy="50" r="15" fill={color} opacity="0.2" animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
            <circle cx="50" cy="50" r="8" fill={color} />
            {[0, 72, 144, 216, 288].map((angle, i) => (
                <motion.line key={i} x1="50" y1="50" x2={50 + 35 * Math.cos(angle * Math.PI / 180)} y2={50 + 35 * Math.sin(angle * Math.PI / 180)} stroke={color} strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }} />
            ))}
        </svg>
    );
}

function GlowHalo({ color = "#f59e0b" }: { color?: string }) {
    return (
        <div className="w-full h-full relative flex items-center justify-center opacity-60">
            <motion.div className="absolute inset-0 rounded-full border-4 border-dashed" style={{ borderColor: color }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-4 rounded-full border-[6px]" style={{ borderColor: color, opacity: 0.3 }} animate={{ scale: [1, 0.9, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
            <Sun className="w-8 h-8 opacity-50" style={{ color }} />
        </div>
    );
}

// --- 4. Main Component ---

export default function CycleSyncDashboard() {
    const [data, setData] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchDashboardData();
                if (res) {
                    setData(res);
                } else {
                    // Safety Net: If no data found, redirect to Onboarding
                    router.push("/onboarding");
                }
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            }
        }
        load();
    }, [router]);

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-rove-red/20 border-t-rove-red animate-spin" />
                <p className="text-rove-stone font-medium">Syncing with your cycle...</p>
            </div>
        </div>
    );

    const { user, phase: currentPhase } = data;
    const theme = phaseThemes[currentPhase.name] || phaseThemes["Follicular"];
    const trackerMode = data.tracker_mode || "menstruation";

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20 pt-4 md:pt-20">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${theme.blob} rounded-full blur-[80px] animate-pulse will-change-[opacity]`} style={{ animationDuration: "10s" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rove-charcoal/5 rounded-full blur-[80px] animate-pulse will-change-[opacity]" style={{ animationDuration: "15s" }} />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-white rounded-full blur-[60px] opacity-60" />
            </div>

            <div className="relative z-10 p-4 md:p-8 space-y-2 md:space-y-8 pb-32">
                {/* Header */}
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="font-heading text-2xl md:text-4xl text-rove-charcoal mb-1">Good Morning, {user?.name || "Rove Member"}</h1>
                        <p className="text-rove-stone font-light text-base md:text-lg">
                            It's Day {currentPhase.day} of your cycle.
                        </p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/50 transition-colors">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur-md text-rove-charcoal border border-white/50 flex items-center justify-center font-heading text-base md:text-lg shadow-sm">
                            {(user?.name || "R")[0]}
                        </div>
                    </Button>
                </header>

                {/* MODE: Menstruation (Default) */}
                {trackerMode === "menstruation" && (
                    <motion.div
                        key="menstruation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {/* Hero Phase Orb */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative flex flex-col items-center justify-center py-1 md:py-6"
                        >
                            <div className="relative w-56 h-56 md:w-[300px] md:h-[300px] flex items-center justify-center">
                                {/* Outer Glow */}
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${theme.blob.replace("bg-", "from-")} to-transparent blur-3xl animate-pulse will-change-[opacity]`} />

                                {/* Link to Tracker */}
                                <Link href="/cycle-sync/tracker">
                                    <motion.div
                                        className="relative w-48 h-48 md:w-72 md:h-72 flex items-center justify-center cursor-pointer group"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        {/* Rotating Gradient Ring */}
                                        <motion.div
                                            className={`absolute inset-0 rounded-full border-[6px] border-transparent bg-gradient-to-r ${theme.orbRing} bg-clip-border [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]`}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            style={{ willChange: "transform" }}
                                        />

                                        <div className={`absolute inset-2 rounded-full bg-white/80 backdrop-blur-3xl ${theme.glow}`} />

                                        <motion.div
                                            className={`absolute inset-0 rounded-full ${theme.blob} blur-3xl -z-10`}
                                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        />

                                        {/* ORB CONTENT */}
                                        <div className="relative text-center z-10 px-4">
                                            <motion.p
                                                className="text-[9px] md:text-xs font-bold tracking-[0.2em] text-rove-stone uppercase mb-1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Current Phase
                                            </motion.p>
                                            <motion.h2
                                                className={`text-2xl md:text-5xl font-heading ${theme.color} mb-2`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                {currentPhase.name}
                                            </motion.h2>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <Badge variant="secondary" className={`${theme.badge} px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs tracking-wider transition-colors duration-500`}>
                                                    <Sparkles className="w-3 h-3 mr-2 inline-block" />
                                                    {currentPhase.superpower}
                                                </Badge>
                                            </motion.div>
                                        </div>

                                        {/* Day Indicator */}
                                        <motion.div
                                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full px-3 py-1 border border-rove-stone/10"
                                        >
                                            <span className="text-xs font-bold text-rove-charcoal whitespace-nowrap">Day {currentPhase.day}</span>
                                        </motion.div>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Daily Flow Animation */}
                        <section className="relative">
                            <h3 className="font-heading text-xl md:text-2xl text-rove-charcoal mb-4 px-2">Daily Flow</h3>
                            <DailyFlowRiver data={data} />
                        </section>

                        {/* Today's Snapshot */}
                        <section>
                            <div className="flex justify-between items-baseline mb-4">
                                <h3 className="font-heading text-xl md:text-2xl text-rove-charcoal">Today's Snapshot</h3>
                                <Link href="/cycle-sync/plan">
                                    <Button variant="link" className="text-rove-stone hover:text-rove-charcoal transition-colors">View Full Plan</Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Hormones */}
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group">
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Hormones</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none text-rove-red">
                                        <HormoneWave />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{data.snapshot?.hormones?.title || "Balanced"}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{data.snapshot?.hormones?.desc || "Levels are stable."}</p>
                                    </div>
                                </div>

                                {/* Mind */}
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group">
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Mind</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <MindSynapse color="#374151" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{data.snapshot?.mind?.title || "Focused"}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{data.snapshot?.mind?.desc || "Mental clarity is good."}</p>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group">
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Body</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <BodyDNA color="#22c55e" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{data.snapshot?.body?.title || "Active"}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{data.snapshot?.body?.desc || "Energy for movement."}</p>
                                    </div>
                                </div>

                                {/* Glow */}
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group">
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Glow</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <GlowHalo color="#f59e0b" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{data.snapshot?.skin?.title || "Radiant"}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{data.snapshot?.skin?.desc || "Skin is looking healthy."}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section>
                            <h3 className="font-heading text-xl md:text-2xl text-rove-charcoal mb-4">Quick Actions</h3>
                            <div className="space-y-4">
                                <Link href="/cycle-sync/tracker">
                                    <button className="w-full flex items-center justify-between p-1 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm group transition-all hover:scale-[1.01]">
                                        <div className="flex items-center gap-5 pl-5 py-4">
                                            <div className="w-12 h-12 rounded-full bg-rove-charcoal text-white flex items-center justify-center shadow-lg shadow-rove-charcoal/20">
                                                <Droplets className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-heading text-lg text-rove-charcoal">Log Symptoms</p>
                                                <p className="text-rove-stone text-sm">Track your daily rhythm</p>
                                            </div>
                                        </div>
                                        <div className="pr-6">
                                            <div className="w-10 h-10 rounded-full bg-white text-rove-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-sm">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        </section>
                    </motion.div>
                )}

                {/* MODE: TTC */}
                {trackerMode === "ttc" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 py-12"
                    >
                        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-4">
                            <Baby className="w-10 h-10" />
                        </div>
                        <h2 className="font-heading text-3xl text-rove-charcoal">Fertility Window</h2>
                        <p className="text-rove-stone max-w-md">
                            Your dedicated fertility dashboard is being prepared. <br />
                            Soon you'll track BBT, cervical mucus, and peak ovulation days here.
                        </p>
                        <Button className="rounded-full">Log Temperature</Button>
                    </motion.div>
                )}

                {/* MODE: Menopause */}
                {trackerMode === "menopause" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 py-12"
                    >
                        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 mb-4">
                            <Flower2 className="w-10 h-10" />
                        </div>
                        <h2 className="font-heading text-3xl text-rove-charcoal">Symptom Management</h2>
                        <p className="text-rove-stone max-w-md">
                            Your menopause support hub is coming soon. <br />
                            Track hot flashes, sleep quality, and HRT adherence.
                        </p>
                        <Button className="rounded-full">Log Symptom</Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}