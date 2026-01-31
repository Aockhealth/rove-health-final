"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Droplets, Zap, Moon, Sun, ArrowRight, Sparkles, TrendingUp, Brain, Activity, Utensils, Dumbbell, Baby, Flower2, Heart, Wind, ChevronLeft, CalendarPlus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchDashboardData } from "@/app/actions/cycle-sync"; // Still needed for content
import { fetchUnifiedCycleData, UnifiedCycleData } from "@/app/actions/unified-cycle"; // NEW
import { calculateSmartPhase } from "@/lib/cycle/smart-calc"; // NEW
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- 1. Helper Components ---

import { RiverTrack, iconMap } from "@/components/cycle-sync/RiverTrack";

function DailyFlowRiver({ data }: { data: any }) {
    const [expandedCard, setExpandedCard] = useState<{ title: string; desc: string; detail: string; icon: any; color: string } | null>(null);

    const mapItems = (items: any[], colorClass: string, bgClass: string) =>
        (items || []).map(item => ({
            ...item,
            icon: iconMap[item.icon] || Sparkles,
            color: colorClass,
            bg: bgClass
        }));

    const nutrients = mapItems(data?.nutrients, "text-emerald-600", "bg-emerald-100");
    const phaseFocus = mapItems(data?.phaseFocus, "text-violet-600", "bg-violet-100");

    if (!data || (!nutrients.length && !phaseFocus.length)) return (
        <div className="p-8 text-center border-2 border-dashed border-rove-stone/10 rounded-3xl bg-white/30">
            <p className="text-rove-stone text-sm mb-2">No flow data yet.</p>
            <Link href="/cycle-sync/tracker">
                <Button variant="link" className="text-rove-green">Set up your cycle →</Button>
            </Link>
        </div>
    );

    return (
        <>
            <div className="space-y-4 -mx-4 md:-mx-8">
                <RiverTrack
                    label="Nutrients For This Phase"
                    items={nutrients}
                    direction="right"
                    speed={40}
                    onCardClick={(item) => setExpandedCard({ ...item, color: "emerald" })}
                />
                <RiverTrack
                    label="What To Focus On"
                    items={phaseFocus}
                    direction="left"
                    speed={38}
                    onCardClick={(item) => setExpandedCard({ ...item, color: "violet" })}
                />
            </div>

            {/* Expanded Card Modal */}
            <AnimatePresence>
                {expandedCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setExpandedCard(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "relative w-full max-w-md p-6 rounded-3xl shadow-2xl border",
                                expandedCard.color === "emerald"
                                    ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-200"
                                    : "bg-gradient-to-br from-violet-50 to-white border-violet-200"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setExpandedCard(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-rove-stone hover:bg-white transition-colors"
                            >
                                ✕
                            </button>

                            {/* Icon */}
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                                expandedCard.color === "emerald" ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-violet-600"
                            )}>
                                {expandedCard.icon && <expandedCard.icon className="w-7 h-7" />}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-heading text-rove-charcoal mb-1">{expandedCard.title}</h3>
                            <p className={cn(
                                "text-sm font-medium mb-4",
                                expandedCard.color === "emerald" ? "text-emerald-600" : "text-violet-600"
                            )}>{expandedCard.desc}</p>
                            <p className="text-sm text-rove-stone leading-relaxed">{expandedCard.detail}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Phase Theme Logic
const phaseThemes: Record<string, any> = {
    "Menstrual": { color: "text-rose-500", blob: "bg-rose-200/20", orbRing: "from-rose-300 via-rose-100 to-rose-400", glow: "shadow-[0_0_40px_rgba(251,113,133,0.2)]", badge: "bg-rose-50 text-rose-600 border-rose-100" },
    "Follicular": { color: "text-teal-600", blob: "bg-teal-200/15", orbRing: "from-teal-300 via-emerald-100 to-teal-400", glow: "shadow-[0_0_40px_rgba(45,212,191,0.2)]", badge: "bg-teal-50 text-teal-700 border-teal-100" },
    "Ovulatory": { color: "text-amber-500/90", blob: "bg-amber-100/30", orbRing: "from-amber-300 via-yellow-100 to-amber-400", glow: "shadow-[0_0_40px_rgba(251,191,36,0.25)]", badge: "bg-amber-50 text-amber-700 border-amber-100" },
    "Luteal": { color: "text-indigo-500", blob: "bg-indigo-200/15", orbRing: "from-indigo-300 via-blue-100 to-indigo-400", glow: "shadow-[0_0_40px_rgba(129,140,248,0.2)]", badge: "bg-indigo-50 text-indigo-600 border-indigo-100" }
};

// --- 2. Phase Data ---
const PHASE_SNAPSHOTS: any = {
    "Menstrual": {
        hormones: { title: "Low Levels", desc: "A reset for your body.", detail: "Estrogen and progesterone drop to their lowest levels, signalling your uterus to shed its lining. You may feel a desire to withdraw and rest." },
        mind: { title: "Reflective", desc: "Turn inward & rest.", detail: "The communication between your left and right brain hemispheres is strongest now. It’s the perfect time for intuition and evaluating your path." },
        body: { title: "Releasing", desc: "Prioritize comfort.", detail: "Inflammation may be slightly higher. Focus on gentle movements like walking or yin yoga, and keep warm." },
        glow: { title: "Dry", desc: "Hydration is key.", detail: "Skin barrier might be weaker. Use rich moisturizers and avoid harsh actives to prevent irritation." }
    },
    "Follicular": {
        hormones: { title: "Estrogen Rising", desc: "Energy is building.", detail: "FSH stimulates follicles, and estrogen begins to climb. You'll feel a lift in mood, energy, and brain fog clearing." },
        mind: { title: "Creative", desc: "Brainstorm new ideas.", detail: "You are primed for learning and complex problem solving. Tackle challenging projects or start something new." },
        body: { title: "Light", desc: "Ready for movement.", detail: "Your stamina is increasing. It's a great time for cardio, hiking, or trying a new fitness class." },
        glow: { title: "Balanced", desc: "Collagen boosting.", detail: "Estrogen supports collagen production. Your skin is likely plump and resilient—enjoy the natural glow!" }
    },
    "Ovulatory": {
        hormones: { title: "Peak Estrogen", desc: "You are magnetic.", detail: "Estrogen peaks, triggering LH surge. You are at your biological peak for confidence, verbal skills, and libido." },
        mind: { title: "Social", desc: "Connect/Speak up.", detail: "Your verbal center is lit up. Schedule important meetings, dates, or social gatherings now." },
        body: { title: "Peak Power", desc: "Hit your PRs.", detail: "Testosterone adds a strength boost. Go for personal bests in lifting or high-intensity intervals." },
        glow: { title: "Radiant", desc: "Natural glow.", detail: "Pores may be slightly more visible due to oil, but skin is generally vibrant. Double cleanse if you're sweating more." }
    },
    "Luteal": {
        hormones: { title: "Progesterone", desc: "Calming influence.", detail: "Progesterone rises to maintain lining. It has a sedative effect but can also cause bloating or mood sensitivity." },
        mind: { title: "Detailed", desc: "Focus mode on.", detail: "Brain chemistry shifts to detail-oriented tasks. Great for wrapping up projects, organizing, and administrative work." },
        body: { title: "Heavy", desc: "Slow down.", detail: "Metabolism speeds up, but endurance drops. Switch to strength training with longer rests or pilates." },
        glow: { title: "Oily", desc: "Congestion prone.", detail: "Progesterone stimulates sebum production. Use salicylic acid or clay masks to keep pores clear." }
    }
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

// --- 4. Seasonal Background Component ---
// --- 4. Seasonal Background Component ---
// --- 4. Seasonal Background Component (Premium Atmosphere) ---
function SeasonalBackground({ phase }: { phase: string }) {
    // Shared transition for smooth mood shifts
    const fluidTransition = { duration: 8, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as any };

    if (phase === "Menstrual") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60">
                {/* Winter: Icy Rose/Blue Sheen */}
                <motion.div
                    className="absolute w-[120%] h-[120%] bg-gradient-to-tr from-rose-100/40 via-indigo-50/30 to-rose-100/40 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                    transition={fluidTransition}
                />
                <motion.div
                    className="absolute w-[80%] h-[80%] bg-blue-100/30 rounded-full blur-2xl"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ ...fluidTransition, duration: 5 }}
                />
            </div>
        );
    }
    if (phase === "Follicular") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70">
                {/* Spring: Fresh Teal/Pink Bloom */}
                <motion.div
                    className="absolute w-[130%] h-[130%] bg-gradient-to-br from-teal-100/50 via-emerald-50/30 to-rose-100/50 rounded-full blur-3xl"
                    animate={{ rotate: [0, -20, 0], scale: [1, 1.05, 1] }}
                    transition={fluidTransition}
                />
                <motion.div
                    className="absolute w-full h-full bg-teal-50/40 blur-2xl rounded-full"
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ ...fluidTransition, duration: 6 }}
                />
            </div>
        );
    }
    if (phase === "Ovulatory") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80">
                {/* Summer: Radiant Golden Aura */}
                <motion.div
                    className="absolute w-[140%] h-[140%] bg-gradient-to-t from-amber-100/60 via-orange-50/40 to-yellow-100/60 rounded-full blur-3xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute w-[90%] h-[90%] bg-amber-200/20 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        );
    }
    if (phase === "Luteal") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70">
                {/* Autumn: Warm Indigo/Rust Dusk */}
                <motion.div
                    className="absolute w-[120%] h-[120%] bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-amber-100/40 rounded-full blur-3xl"
                    animate={{ scale: [1.05, 1, 1.05], rotate: [0, 15, 0] }}
                    transition={fluidTransition}
                />
                <motion.div
                    className="absolute w-[100%] h-[100%] bg-gradient-to-tr from-indigo-200/20 to-transparent blur-2xl rounded-full"
                    animate={{ x: [-10, 10, -10], y: [-10, 10, -10] }}
                    transition={{ ...fluidTransition, duration: 10 }}
                />
            </div>
        );
    }
    return null;
}

// --- 5. Main Component ---

export default function CycleSyncDashboard() {
    const [data, setData] = useState<any>(null);
    const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
    const [unifiedData, setUnifiedData] = useState<UnifiedCycleData | null>(null); // NEW
    const router = useRouter();

    // ✅ CLIENT-SIDE RECALCULATION
    const [clientDay, setClientDay] = useState<number | null>(null);
    const [clientPhaseName, setClientPhaseName] = useState<string | null>(null);

    useEffect(() => {
        if (unifiedData) {
            const result = calculateSmartPhase(new Date(), unifiedData.settings, unifiedData.monthLogs);
            setClientDay(result.day);
            setClientPhaseName(result.phase);
        }
    }, [unifiedData]);

    useEffect(() => {
        const load = async () => {
            try {
                const [dashboardData, unified] = await Promise.all([
                    fetchDashboardData(),
                    fetchUnifiedCycleData()
                ]);

                if (dashboardData) setData(dashboardData);
                if (unified) setUnifiedData(unified);

                if (!dashboardData) {
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


    // ✅ OVERRIDE PHASE DATA
    const { user, phase: serverPhase } = data;
    const currentPhase = {
        ...serverPhase,
        name: clientPhaseName || serverPhase.name,
        day: clientDay || serverPhase.day
    };

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
                {/* NANO HEADER (Personalized) */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rove-charcoal/50 mb-0.5">ROVE</span>
                        <span className="font-heading text-2xl text-rove-charcoal">Hey, {user?.name?.split(" ")[0] || "Love"}</span>
                        <span className="text-[10px] font-medium text-rove-stone uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <Link href="/cycle-sync/profile">
                        <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95">
                            <span className="font-heading text-lg text-rove-charcoal">{user?.name?.[0] || "R"}</span>
                        </div>
                    </Link>
                </div>

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
                            className="relative py-4 md:py-8"
                        >
                            {/* MAIN HERO LAYOUT: Orb (center) + Log Button (right) */}
                            <div className="flex items-center justify-center gap-4 md:gap-8">

                                {/* Spacer for balance (hidden on mobile) */}
                                <div className="hidden md:block w-24"></div>

                                {/* CENTER: The Phase Orb */}
                                <div className="relative">
                                    {/* Atmospheric Background */}
                                    <div className="absolute inset-[-50px] z-0 rounded-full overflow-hidden opacity-60 pointer-events-none">
                                        <SeasonalBackground phase={currentPhase.name} />
                                    </div>

                                    {/* Outer Glow */}
                                    <div className={`absolute inset-[-20px] rounded-full ${theme.blob} blur-3xl opacity-40 pointer-events-none`} />

                                    <Link href="/cycle-sync/tracker">
                                        <motion.div
                                            className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center cursor-pointer group"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                        >
                                            {/* Rotating Gradient Ring */}
                                            <motion.div
                                                className={`absolute inset-0 rounded-full border-[5px] md:border-[6px] border-transparent bg-gradient-to-r ${theme.orbRing} bg-clip-border [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]`}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                                            />

                                            {/* Inner Glass */}
                                            <div className={`absolute inset-2 rounded-full bg-white/70 backdrop-blur-xl ${theme.glow}`} />

                                            {/* ORB CONTENT */}
                                            <div className="relative text-center z-10 px-4">
                                                <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-rove-stone uppercase mb-1.5">
                                                    Current Phase
                                                </p>
                                                <h2 className={`text-3xl md:text-4xl font-heading ${theme.color} mb-2`}>
                                                    {currentPhase.name}
                                                </h2>
                                                <Badge variant="secondary" className={`${theme.badge} px-3 py-0.5 text-[9px] md:text-[10px] tracking-wider border`}>
                                                    {currentPhase.superpower}
                                                </Badge>
                                            </div>

                                            {/* Day Indicator (Top) */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-rove-stone/10">
                                                <span className="text-xs font-bold text-rove-charcoal">Day {currentPhase.day}</span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </div>

                                {/* RIGHT: Log Data Button */}
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    <Link href="/cycle-sync/tracker">
                                        <motion.button
                                            whileHover={{ scale: 1.08, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-rove-charcoal to-rove-charcoal/80 text-white flex items-center justify-center shadow-xl shadow-rove-charcoal/30 hover:shadow-2xl transition-all duration-300 ring-4 ring-white/50"
                                        >
                                            <CalendarPlus className="w-6 h-6 md:w-7 md:h-7" />
                                        </motion.button>
                                    </Link>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-rove-charcoal/60 mt-1">Log Data</span>
                                </div>
                            </div>

                            {/* CYCLE STATS CARDS */}
                            <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-4 px-2">
                                {(() => {
                                    // Calculate dates
                                    const nextPeriod = currentPhase.nextPeriodDate ? new Date(currentPhase.nextPeriodDate) : null;
                                    const ovulationDate = nextPeriod ? new Date(nextPeriod.getTime() - 14 * 24 * 60 * 60 * 1000) : null;
                                    const fertileStart = ovulationDate ? new Date(ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000) : null;
                                    const fertileEnd = ovulationDate ? new Date(ovulationDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null;

                                    const formatDate = (d: Date | null) => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';
                                    const formatShort = (d: Date | null) => d ? d.toLocaleDateString('en-US', { day: 'numeric' }) : '--';

                                    return (
                                        <>
                                            {/* Next Period Card */}
                                            <Link href="/cycle-sync/tracker">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-2xl p-3 md:p-4 border border-rose-200/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                                                            <Droplets className="w-2.5 h-2.5 md:w-3 md:h-3 text-rose-500" />
                                                        </div>
                                                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-rose-600/70">Period</span>
                                                    </div>
                                                    <p className="text-base md:text-xl font-bold text-rose-700">{formatDate(nextPeriod)}</p>
                                                    <p className="text-[9px] md:text-[10px] text-rose-500/70 mt-0.5 group-hover:text-rose-600 transition-colors">
                                                        {nextPeriod ? `in ${Math.ceil((nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : ''}
                                                    </p>
                                                </motion.div>
                                            </Link>

                                            {/* Ovulation Card */}
                                            <Link href="/cycle-sync/tracker">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="bg-gradient-to-br from-purple-50 to-indigo-100/50 rounded-2xl p-3 md:p-4 border border-purple-200/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                            <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-500" />
                                                        </div>
                                                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-purple-600/70">Ovulation</span>
                                                    </div>
                                                    <p className="text-base md:text-xl font-bold text-purple-700">{formatDate(ovulationDate)}</p>
                                                    <p className="text-[9px] md:text-[10px] text-purple-500/70 mt-0.5 group-hover:text-purple-600 transition-colors">Peak fertility</p>
                                                </motion.div>
                                            </Link>

                                            {/* Fertile Window Card */}
                                            <Link href="/cycle-sync/tracker">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="bg-gradient-to-br from-teal-50 to-emerald-100/50 rounded-2xl p-3 md:p-4 border border-teal-200/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-teal-500/10 flex items-center justify-center">
                                                            <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 text-teal-500" />
                                                        </div>
                                                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-teal-600/70">Fertile</span>
                                                    </div>
                                                    <p className="text-base md:text-xl font-bold text-teal-700">
                                                        {fertileStart && fertileEnd ? `${fertileStart.toLocaleDateString('en-US', { month: 'short' })} ${fertileStart.getDate()}-${fertileEnd.getDate()}` : '--'}
                                                    </p>
                                                    <p className="text-[9px] md:text-[10px] text-teal-500/70 mt-0.5 group-hover:text-teal-600 transition-colors">6-day window</p>
                                                </motion.div>
                                            </Link>
                                        </>
                                    );
                                })()}
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

                            <div className="grid grid-cols-2 gap-3 relative z-30">
                                {/* Hormones */}
                                <motion.div
                                    layoutId="hormones"
                                    onClick={() => setSelectedSnapshot("hormones")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Hormones</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none text-rove-red">
                                        <HormoneWave />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{PHASE_SNAPSHOTS[currentPhase.name]?.hormones.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{PHASE_SNAPSHOTS[currentPhase.name]?.hormones.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Mind */}
                                <motion.div
                                    layoutId="mind"
                                    onClick={() => setSelectedSnapshot("mind")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Mind</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <MindSynapse color="#374151" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{PHASE_SNAPSHOTS[currentPhase.name]?.mind.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{PHASE_SNAPSHOTS[currentPhase.name]?.mind.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Body */}
                                <motion.div
                                    layoutId="body"
                                    onClick={() => setSelectedSnapshot("body")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Body</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <BodyDNA color="#22c55e" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{PHASE_SNAPSHOTS[currentPhase.name]?.body.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{PHASE_SNAPSHOTS[currentPhase.name]?.body.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Glow */}
                                <motion.div
                                    layoutId="glow"
                                    onClick={() => setSelectedSnapshot("glow")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white border border-rove-stone/5 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Glow</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <GlowHalo color="#f59e0b" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-lg font-medium text-rove-charcoal leading-tight mb-0.5">{PHASE_SNAPSHOTS[currentPhase.name]?.glow.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-90">{PHASE_SNAPSHOTS[currentPhase.name]?.glow.desc}</p>
                                    </div>
                                </motion.div>
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

            {/* EXPANDED MODAL OVERLAY (SCIENTIFIC / CLEAN) */}
            <AnimatePresence>
                {selectedSnapshot && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSnapshot(null)}
                    >
                        <motion.div
                            className="bg-white/95 backdrop-blur-xl rounded-[1rem] w-full max-w-sm shadow-2xl relative border border-white/50 overflow-hidden ring-1 ring-black/5"
                            initial={{ scale: 0.95, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 10, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            layoutId={selectedSnapshot}
                        >
                            {/* Decorative Top Bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-rove-stone/20 via-rove-charcoal/20 to-rove-stone/20" />

                            {/* Header Section */}
                            <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rove-charcoal animate-pulse" />
                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-rove-stone/80">
                                            {selectedSnapshot} // METRICS
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-heading text-rove-charcoal tracking-tight">
                                        {PHASE_SNAPSHOTS[currentPhase.name][selectedSnapshot].title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedSnapshot(null)}
                                    className="p-2 -mr-2 -mt-2 hover:bg-gray-100 rounded-full transition-colors group"
                                >
                                    <div className="relative w-6 h-6 flex items-center justify-center">
                                        <span className="absolute w-4 h-[1.5px] bg-gray-400 rotate-45 group-hover:bg-gray-600 transition-colors" />
                                        <span className="absolute w-4 h-[1.5px] bg-gray-400 -rotate-45 group-hover:bg-gray-600 transition-colors" />
                                    </div>
                                </button>
                            </div>

                            {/* Divider with ID */}
                            <div className="w-full h-px bg-gray-100 my-2 flex items-center justify-end px-6">
                                <span className="text-[8px] font-mono text-gray-300">ID: {currentPhase.name.substring(0, 3).toUpperCase()}-001</span>
                            </div>

                            {/* Content Body */}
                            <div className="px-6 py-4 relative">
                                {/* Ambient Background Graphic */}
                                <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.08] pointer-events-none translate-x-10 -translate-y-10">
                                    {selectedSnapshot === "hormones" && <HormoneWave />}
                                    {selectedSnapshot === "mind" && <MindSynapse color="#000" />}
                                    {selectedSnapshot === "body" && <BodyDNA color="#000" />}
                                    {selectedSnapshot === "glow" && <GlowHalo color="#000" />}
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {/* Observation */}
                                    <div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Scientific Observation</span>
                                        <p className="text-rove-charcoal/90 text-[15px] leading-relaxed font-sans border-l-2 border-rove-charcoal/10 pl-3">
                                            {PHASE_SNAPSHOTS[currentPhase.name][selectedSnapshot].detail}
                                        </p>
                                    </div>

                                    {/* Action/Protocol */}
                                    <div className="bg-rove-cream/40 rounded-lg p-4 border border-rove-stone/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-3.5 h-3.5 text-rove-charcoal" />
                                            <span className="text-[9px] font-bold text-rove-charcoal uppercase tracking-widest">Recommended Protocol</span>
                                        </div>
                                        <p className="text-rove-stone text-xs leading-relaxed font-medium">
                                            Align your routine by prioritizing specific nutrient timing and activity adjustments tailored to this phase.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Status */}
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-gray-400">
                                <span>STATUS: ACTIVE</span>
                                <span>UPDATED: TODAY</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}