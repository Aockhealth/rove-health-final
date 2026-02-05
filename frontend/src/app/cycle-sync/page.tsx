"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ProfileAvatar from "@/components/cycle-sync/ProfileAvatar";
import { Droplets, Zap, Moon, Sun, ArrowRight, Baby, TrendingUp, Brain, Activity, Utensils, Dumbbell, Flower2, Heart, Wind, ChevronLeft, CalendarPlus, Plus, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchDashboardData } from "@/app/actions/cycle-sync"; // Still needed for content
import { fetchUnifiedCycleData, UnifiedCycleData } from "@/app/actions/unified-cycle"; // NEW
import { calculateSmartPhase } from "@shared/cycle/smart-phase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";

// --- 1. Helper Components ---

import { RiverTrack, iconMap } from "@/components/cycle-sync/RiverTrack";

function DailyFlowRiver({ data, theme }: { data: any, theme: any }) {
    const [expandedCard, setExpandedCard] = useState<{ title: string; desc: string; detail: string; icon: any; } | null>(null);

    const mapItems = (items: any[]) =>
        (items || []).map(item => ({
            ...item,
            icon: iconMap[item.icon] || Zap,
            // Use theme colors
            color: theme.iconColor,
            bg: theme.iconBg
        }));

    const nutrients = mapItems(data?.nutrients);
    const phaseFocus = mapItems(data?.phaseFocus);

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
                    onCardClick={(item) => setExpandedCard(item)}
                />
                <RiverTrack
                    label="What To Focus On"
                    items={phaseFocus}
                    direction="left"
                    speed={38}
                    onCardClick={(item) => setExpandedCard(item)}
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "relative w-full max-w-md p-8 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border shadow-2xl overflow-hidden",
                                theme.borderColor
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Background Glow */}
                            <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10", theme.iconBg)} />

                            {/* Close Button */}
                            <button
                                onClick={() => setExpandedCard(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-rove-charcoal hover:bg-black/10 transition-all border border-black/5 z-10"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>

                            {/* Icon Container */}
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
                                theme.iconBg,
                                theme.iconColor
                            )}>
                                {expandedCard.icon && <expandedCard.icon className="w-8 h-8" />}
                            </div>

                            {/* Content */}
                            <h3 className="text-3xl font-heading text-rove-charcoal mb-1 leading-tight">{expandedCard.title}</h3>
                            <p className={cn(
                                "text-sm font-bold mb-6 tracking-[0.15em] uppercase",
                                theme.iconColor
                            )}>{expandedCard.desc}</p>

                            <div className="space-y-6">
                                <p className="text-base text-gray-800 leading-relaxed font-sans font-medium">
                                    {expandedCard.detail}
                                </p>

                                {expandedCard.detail.includes("Sources:") && (
                                    <div className="pt-4 border-t border-black/10">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Food Sources</p>
                                        <p className="text-[13px] text-gray-700 leading-relaxed italic">
                                            {expandedCard.detail.split("Sources:")[1]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Phase Theme Logic
// Phase Theme Logic - Visual Identity 2.0 (Organic Chromatics)
const phaseThemes: Record<string, any> = {
    "Menstrual": {
        color: "text-phase-menstrual",
        blob: "bg-phase-menstrual/10",
        orbRing: "from-phase-menstrual/40 via-white to-phase-menstrual/20",
        glow: "shadow-[0_20px_50px_rgba(175,107,107,0.12)]", // Terra Rose Aura
        badge: "bg-transparent text-phase-menstrual border border-phase-menstrual/20",
        iconBg: "bg-phase-menstrual/10",
        iconColor: "text-phase-menstrual",
        gradient: "from-phase-menstrual/5 to-white/0", // Subtle wash
        borderColor: "border-phase-menstrual/20"
    },
    "Follicular": {
        color: "text-phase-follicular",
        blob: "bg-phase-follicular/10",
        orbRing: "from-phase-follicular/40 via-white to-phase-follicular/20",
        glow: "shadow-[0_20px_50px_rgba(141,170,157,0.12)]", // Sage Dew Aura
        badge: "bg-transparent text-phase-follicular border border-phase-follicular/20",
        iconBg: "bg-phase-follicular/10",
        iconColor: "text-phase-follicular",
        gradient: "from-phase-follicular/5 to-white/0",
        borderColor: "border-phase-follicular/20"
    },
    "Ovulatory": {
        color: "text-phase-ovulatory",
        blob: "bg-phase-ovulatory/10",
        orbRing: "from-phase-ovulatory/40 via-white to-phase-ovulatory/20",
        glow: "shadow-[0_20px_50px_rgba(212,162,95,0.15)]", // Soleil Ochre Aura (slightly stronger)
        badge: "bg-transparent text-phase-ovulatory border border-phase-ovulatory/20",
        iconBg: "bg-phase-ovulatory/10",
        iconColor: "text-phase-ovulatory",
        gradient: "from-phase-ovulatory/5 to-white/0",
        borderColor: "border-phase-ovulatory/20"
    },
    "Luteal": {
        color: "text-phase-luteal",
        blob: "bg-phase-luteal/10",
        orbRing: "from-phase-luteal/40 via-white to-phase-luteal/20",
        glow: "shadow-[0_20px_50px_rgba(123,130,168,0.12)]", // Dusk Slate Aura
        badge: "bg-transparent text-phase-luteal border border-phase-luteal/20",
        iconBg: "bg-phase-luteal/10",
        iconColor: "text-phase-luteal",
        gradient: "from-phase-luteal/5 to-white/0",
        borderColor: "border-phase-luteal/20"
    }
};

// --- 2. Phase Data ---
const PHASE_SNAPSHOTS: any = {
    "Menstrual": {
        hormones: {
            title: "The Great Reset",
            desc: "Biological baseline reached.",
            detail: "Estrogen and progesterone hit their monthly nadir to trigger the shed. This 'biological winter' is a vital system reboot—not a shutdown.",
            protocol: "Protect your energy. Magnesium glycinate (200-400mg) can soothe cramps and support deep restorative sleep tonight."
        },
        mind: {
            title: "Intuitive Clarity",
            desc: "Left & right brain sync.",
            detail: "Communication between brain hemispheres is strongest now. It’s the perfect time for evaluating your path and setting intentions.",
            protocol: "Journaling tonight is non-negotiable. Your intuition is louder than logic right now—listen to it."
        },
        body: {
            title: "Active Recovery",
            desc: "Inflammation peaks slightly.",
            detail: "Your body is working hard to release. High intensity will backfire by spiking cortisol when resilience is low.",
            protocol: "Focus on Yin Yoga or a slow 20-minute walk. Keep your lower back and feet warm to support circulation."
        },
        glow: {
            title: "Hydration Barrier",
            desc: "Skin is driest now.",
            detail: "Low estrogen means less natural oil and moisture retention. Your skin barrier is more permeable and sensitive.",
            protocol: "Skip the harsh exfoliants. Layer a hydrating serum with a rich ceramide moisturizer to lock in water."
        }
    },
    "Follicular": {
        hormones: {
            title: "The Awakening",
            desc: "Estrogen begins its climb.",
            detail: "FSH stimulates new follicles, and estrogen begins to climb. This neuro-stimulant hormone lifts your mood, energy, and mental speed.",
            protocol: "Capitalize on this rising energy. Schedule your most demanding creative work for the morning hours."
        },
        mind: {
            title: "Architect Mode",
            desc: "Pattern recognition peaks.",
            detail: "You are primed for learning and complex problem solving. Brain fog clears as you become open to new ideas and social connection.",
            protocol: "Tackle that complex project you've been putting off. Your brain is hungry for challenge."
        },
        body: {
            title: "Building Power",
            desc: "Insulin sensitivity rises.",
            detail: "Your body is ready to burn carbs for fuel and build muscle. Recovery time is faster now than at any other time.",
            protocol: "Increase cardio intensity or heavy lifting. Your body can handle the stress and bounce back stronger."
        },
        glow: {
            title: "Collagen Bloom",
            desc: "Natural plumpness returns.",
            detail: "Rising estrogen boosts collagen and hyaluronic acid production. Your skin is naturally more resilient and glowing.",
            protocol: "A great time for a vitamin C serum to amplify that natural glow. You can tolerate more active treatments now."
        }
    },
    "Ovulatory": {
        hormones: {
            title: "The Main Event",
            desc: "Peak estrogen & testosterone.",
            detail: "The biological zenith. Estrogen peaks to trigger ovulation, while testosterone gives you a surge of confidence and libido.",
            protocol: "You are magnetic. Schedule dates, pitches, or difficult conversations. You are chemically wired to persuade."
        },
        mind: {
            title: "Social Butterfly",
            desc: "Verbal centers light up.",
            detail: "Your verbal skills and emotional intelligence are at their height. You are more articulate and persuasive.",
            protocol: "Network, present, or record content. Your ability to connect with others is at its peak."
        },
        body: {
            title: "Peak Performance",
            desc: "Maximum power output.",
            detail: "Testosterone adds a strength boost. You are at your strongest, but your ligaments are also looser (higher injury risk).",
            protocol: "Go for a PR in the gym, but watch your form. High-intensity interval training (HIIT) is highly effective now."
        },
        glow: {
            title: "Radiant but Oily",
            desc: "The 'glow' is real.",
            detail: "Sebum production increases slightly. You look vibrant, but pores may be more visible due to the surge.",
            protocol: "Double cleanse in the evenings. Using a clay mask can help manage the extra oil without stripping your glow."
        }
    },
    "Luteal": {
        hormones: {
            title: "The Shift",
            desc: "Progesterone takes over.",
            detail: "Estrogen drops and progesterone rises. This has a sedative, calming effect, but withdrawal later triggers PMS.",
            protocol: "Prioritize stability. Eat regular meals with protein to stabilize blood sugar and combat mood swings."
        },
        mind: {
            title: "Deep Focus",
            desc: "Detail-oriented brain.",
            detail: "Brain chemistry shifts from social/expansive to internal/analytical. You notice things you missed before.",
            protocol: "Edit, organize, and wrap up loose ends. It's the best time for administrative tasks and deep work."
        },
        body: {
            title: "Metabolic Burn",
            desc: "Calorie burn increases.",
            detail: "Your metabolism speeds up (burning ~100-300 more calories), but endurance drops. Heat tolerance is lower.",
            protocol: "Switch to strength training with longer rests. Honor your hunger with complex carbs to boost serotonin."
        },
        glow: {
            title: "Congestion Alert",
            desc: "Pores are prone to clogging.",
            detail: "Progesterone stimulates oil production while pores tighten, leading to trapped bacteria and breakouts.",
            protocol: "Use salicylic acid (BHA) to keep pores clear. Avoid heavy, pore-clogging makeup if possible."
        }
    }
};

const PHASE_KEYWORDS: Record<string, string> = {
    "Menstrual": "Winter • Rest & Reset",
    "Follicular": "Spring • Energy Rising",
    "Ovulatory": "Performer • Peak Confidence",
    "Luteal": "Reflective Phase"
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
                // ⚡ ULTRA-FAST: Single action now includes all data
                const dashboardData = await fetchDashboardData();

                if (dashboardData) {
                    setData(dashboardData);
                    // Set unified data from the same response (no second call needed)
                    if (dashboardData.settings && dashboardData.monthLogs) {
                        setUnifiedData({
                            settings: dashboardData.settings,
                            monthLogs: dashboardData.monthLogs,
                            smartPhase: { phase: dashboardData.phase.name, day: dashboardData.phase.day },
                            userId: ""
                        });
                    }
                } else {
                    router.push("/onboarding");
                }
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            }
        }
        load();
    }, [router]);

    if (!data) return <LoadingScreen />;


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
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20 pt-4 md:pt-20 grain-overlay">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${theme.blob} rounded-full blur-[80px] animate-pulse will-change-[opacity]`} style={{ animationDuration: "10s" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rove-charcoal/5 rounded-full blur-[80px] animate-pulse will-change-[opacity]" style={{ animationDuration: "15s" }} />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-white rounded-full blur-[60px] opacity-60" />
            </div>

            <div className="relative z-10 p-4 md:p-8 space-y-2 md:space-y-8 pb-4 md:pb-32">
                {/* NANO HEADER (Personalized) */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rove-charcoal/50 mb-0.5">ROVE</span>
                        <span className="font-heading text-2xl text-rove-charcoal">Hey, {user?.name?.split(" ")[0] || "Love"}</span>
                        <span className="text-[10px] font-medium text-rove-stone uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <ProfileAvatar />
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
                            {/* MAIN HERO LAYOUT: Orb centered with diagonal Log Button */}
                            <div className="flex items-center justify-center">

                                {/* Spacer for balance (hidden on mobile) */}
                                <div className="hidden md:block w-24"></div>

                                {/* CENTER: The Phase Orb with diagonal button */}
                                <div className="relative">
                                    {/* Atmospheric Background */}
                                    <div className="absolute inset-[-50px] z-0 rounded-full overflow-hidden opacity-60 pointer-events-none">
                                        <SeasonalBackground phase={currentPhase.name} />
                                    </div>

                                    {/* Outer Glow - Enhanced with pulsing */}
                                    <motion.div
                                        className={`absolute inset-[-20px] rounded-full ${theme.blob} blur-3xl pointer-events-none`}
                                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    <Link href="/cycle-sync/tracker">
                                        <motion.div
                                            className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 flex items-center justify-center cursor-pointer group"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                        >
                                            {/* Rotating Gradient Ring - Enhanced visibility */}
                                            <motion.div
                                                className={`absolute inset-0 rounded-full border-[4px] sm:border-[5px] md:border-[6px] border-transparent bg-gradient-to-r ${theme.orbRing} bg-clip-border [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]`}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            />
                                            {/* Second rotating ring for more prominent effect */}
                                            <motion.div
                                                className={`absolute inset-[-4px] sm:inset-[-5px] md:inset-[-6px] rounded-full border-[2px] sm:border-[3px] border-transparent bg-gradient-to-r ${theme.orbRing} bg-clip-border [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] opacity-50`}
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                            />

                                            {/* Inner Glass */}
                                            <div className={`absolute inset-2 rounded-full bg-white/70 backdrop-blur-xl ${theme.glow}`} />

                                            {/* ORB CONTENT */}
                                            <div className="relative text-center z-10 px-4">
                                                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-rove-stone/80 uppercase mb-1">
                                                    Current Phase
                                                </p>
                                                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-heading ${theme.color} mb-0.5 sm:mb-1`}>
                                                    {currentPhase.name}
                                                </h2>

                                                {/* Keyword Subtitle */}
                                                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-rove-charcoal/60 mb-1 sm:mb-2 tracking-wide opacity-90">
                                                    {PHASE_KEYWORDS[currentPhase.name]}
                                                </p>

                                                <Badge variant="secondary" className={`${theme.badge} px-2 sm:px-3 py-0.5 text-[8px] sm:text-[9px] md:text-[10px] tracking-wider border`}>
                                                    {currentPhase.superpower}
                                                </Badge>
                                            </div>

                                            {/* Day Indicator (Top) */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-rove-stone/10">
                                                <span className="text-xs font-bold text-rove-charcoal">Day {currentPhase.day}</span>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    {/* DIAGONAL Log Data Button - Bottom Right */}
                                    <div className="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 md:bottom-2 md:right-[-60px] flex flex-col items-center gap-1.5 z-20">
                                        <Link href="/cycle-sync/tracker">
                                            <motion.button
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-rove-charcoal to-rove-charcoal/80 text-white flex items-center justify-center shadow-lg shadow-rove-charcoal/20 hover:shadow-xl transition-all duration-300 ring-4 ring-white/80"
                                            >
                                                <CalendarPlus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                            </motion.button>
                                        </Link>
                                        <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-rove-charcoal/80">Log</span>
                                    </div>
                                </div>

                                {/* Spacer for balance on desktop */}
                                <div className="hidden md:block w-24"></div>
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
                                            {/* Next Period Card - Terra Rose (Menstrual) */}
                                            <Link href="/cycle-sync/tracker">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="h-full bg-phase-menstrual/[0.03] backdrop-blur-sm rounded-3xl p-4 border border-phase-menstrual/15 hover:bg-phase-menstrual/[0.06] hover:border-phase-menstrual/30 transition-all cursor-pointer group shadow-sm"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <div className="w-6 h-6 rounded-xl bg-phase-menstrual/10 flex items-center justify-center">
                                                            <Droplets className="w-3.5 h-3.5 text-phase-menstrual" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-phase-menstrual/80">Period</span>
                                                    </div>
                                                    <p className="text-xl font-heading font-medium text-rove-charcoal">{formatDate(nextPeriod)}</p>
                                                    <p className="text-[10px] text-rove-stone/70 mt-1 font-medium group-hover:text-phase-menstrual/80 transition-colors">
                                                        {nextPeriod ? `in ${Math.ceil((nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'Next cycle'}
                                                    </p>
                                                </motion.div>
                                            </Link>

                                            {/* Ovulation Card - Soleil Ochre (Ovulatory) */}
                                            <Link href="/cycle-sync/tracker">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="h-full bg-phase-ovulatory/[0.03] backdrop-blur-sm rounded-3xl p-4 border border-phase-ovulatory/15 hover:bg-phase-ovulatory/[0.06] hover:border-phase-ovulatory/30 transition-all cursor-pointer group shadow-sm"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <div className="w-6 h-6 rounded-xl bg-phase-ovulatory/10 flex items-center justify-center">
                                                            <Baby className="w-3.5 h-3.5 text-phase-ovulatory" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-phase-ovulatory/80">Ovulation</span>
                                                    </div>
                                                    <p className="text-xl font-heading font-medium text-rove-charcoal">{formatDate(ovulationDate)}</p>
                                                    <p className="text-[10px] text-rove-stone/70 mt-1 font-medium group-hover:text-phase-ovulatory/80 transition-colors">Peak fertility</p>
                                                </motion.div>
                                            </Link>

                                            {/* Fertile Window Card - Sage Dew (Follicular) */}
                                            <Link href="/cycle-sync/tracker">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="h-full bg-phase-follicular/[0.03] backdrop-blur-sm rounded-3xl p-4 border border-phase-follicular/15 hover:bg-phase-follicular/[0.06] hover:border-phase-follicular/30 transition-all cursor-pointer group shadow-sm"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <div className="w-6 h-6 rounded-xl bg-phase-follicular/10 flex items-center justify-center">
                                                            <Heart className="w-3.5 h-3.5 text-phase-follicular" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-phase-follicular/80">Fertile</span>
                                                    </div>
                                                    <p className="text-xl font-heading font-medium text-rove-charcoal">
                                                        {fertileStart && fertileEnd ? `${fertileStart.toLocaleDateString('en-US', { month: 'short' })} ${fertileStart.getDate()}-${fertileEnd.getDate()}` : '--'}
                                                    </p>
                                                    <p className="text-[10px] text-rove-stone/70 mt-1 font-medium group-hover:text-phase-follicular/80 transition-colors">6-day window</p>
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
                            <DailyFlowRiver data={data} theme={theme} />
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
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-rove-stone/10 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Hormones</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none text-phase-menstrual">
                                        <HormoneWave />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.hormones.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.hormones.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Mind */}
                                <motion.div
                                    layoutId="mind"
                                    onClick={() => setSelectedSnapshot("mind")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-rove-stone/10 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Mind</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <MindSynapse color="#374151" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.mind.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.mind.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Body */}
                                <motion.div
                                    layoutId="body"
                                    onClick={() => setSelectedSnapshot("body")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-rove-stone/10 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Body</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <BodyDNA color="#22c55e" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.body.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.body.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Glow */}
                                <motion.div
                                    layoutId="glow"
                                    onClick={() => setSelectedSnapshot("glow")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-rove-stone/10 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Glow</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-40 transition-opacity group-hover:opacity-50 pointer-events-none">
                                        <GlowHalo color="#f59e0b" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.glow.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.glow.desc}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </section>


                    </motion.div >
                )
                }

                {/* MODE: TTC */}
                {
                    trackerMode === "ttc" && (
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
                    )
                }

                {/* MODE: Menopause */}
                {
                    trackerMode === "menopause" && (
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
                    )
                }
            </div >

            {/* EXPANDED MODAL OVERLAY (SCIENTIFIC / CLEAN) */}
            <AnimatePresence>
                {
                    selectedSnapshot && (
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
                                                <Lightbulb className="w-3.5 h-3.5 text-rove-charcoal" />
                                                <span className="text-[9px] font-bold text-rove-charcoal uppercase tracking-widest">Recommended Protocol</span>
                                            </div>
                                            <p className="text-rove-stone text-xs leading-relaxed font-medium">
                                                {PHASE_SNAPSHOTS[currentPhase.name][selectedSnapshot].protocol}
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
                    )
                }
            </AnimatePresence >
        </div >
    );
}