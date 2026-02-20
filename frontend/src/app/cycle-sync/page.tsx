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
import { calculatePhase } from "@shared/cycle/phase";
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

    const dietPref = (data?.lifestyle?.diet_preference || data?.onboarding?.dietary_preferences || "").toLowerCase();
    const isVeg = dietPref.includes("veg") && !dietPref.includes("non");

    const sanitize = (text: string) => {
        if (!isVeg || !text) return text;
        const nonVegWords = ["mutton", "chicken", "fish", "salmon", "tuna", "oysters", "beef", "meat", "liver", "prawns"];

        // Handle "Sources: ..."
        if (text.includes("Sources:")) {
            const [desc, sourcePart] = text.split("Sources:");
            const sources = sourcePart.split(",").map(s => s.trim());
            const safeSources = sources.filter(s => !nonVegWords.some(nv => s.toLowerCase().includes(nv)));
            if (safeSources.length === 0) return desc.trim(); // No safe sources left
            return `${desc}Sources: ${safeSources.join(", ")}`;
        }

        // General text check (simpler)
        if (nonVegWords.some(nv => text.toLowerCase().includes(nv))) {
            return text; // Hard to rewrite sentences automatically, leave as is or hide?
            // For now, only reliable replacement is in lists. 
            // Most sensitive text is in "Sources".
        }
        return text;
    };

    const filterItems = (items: any[]) => {
        if (!items) return [];
        return items.map(item => ({
            ...item,
            detail: sanitize(item.detail)
        }));
    };

    const nutrients = mapItems(filterItems(data?.nutrients));
    const phaseFocus = mapItems(filterItems(data?.phaseFocus));

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
                                    {expandedCard.detail.split("Sources:")[0]}
                                </p>

                                {expandedCard.detail.includes("Sources:") && (
                                    <div className={cn(
                                        "p-5 rounded-2xl border",
                                        theme.iconBg,
                                        theme.borderColor
                                    )}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Utensils className={cn("w-4 h-4", theme.iconColor)} />
                                            <h4 className={cn("text-xs font-bold uppercase tracking-[0.2em]", theme.iconColor)}>
                                                Food Sources
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {expandedCard.detail.split("Sources:")[1].split(",").map((source, idx) => {
                                                const cleanSource = source.trim().replace(/\.$/, "");
                                                if (!cleanSource) return null;
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-xl text-[14px] font-semibold text-gray-800 shadow-sm border border-white/50 capitalize"
                                                    >
                                                        {cleanSource}
                                                    </span>
                                                );
                                            })}
                                        </div>
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
        blob: "bg-phase-follicular/30",
        orbRing: "from-phase-follicular/60 via-white to-phase-follicular/30",
        glow: "shadow-[0_20px_50px_rgba(141,170,157,0.25)]", // Sage Dew Aura
        badge: "bg-transparent text-phase-follicular border border-phase-follicular/30",
        iconBg: "bg-phase-follicular/20",
        iconColor: "text-phase-follicular",
        gradient: "from-phase-follicular/20 to-white/0",
        borderColor: "border-phase-follicular/30"
    },
    "Ovulatory": {
        color: "text-phase-ovulatory",
        blob: "bg-phase-ovulatory/30",
        orbRing: "from-phase-ovulatory/60 via-white to-phase-ovulatory/30",
        glow: "shadow-[0_20px_50px_rgba(212,162,95,0.3)]", // Soleil Ochre Aura
        badge: "bg-transparent text-phase-ovulatory border border-phase-ovulatory/30",
        iconBg: "bg-phase-ovulatory/20",
        iconColor: "text-phase-ovulatory",
        gradient: "from-phase-ovulatory/20 to-white/0",
        borderColor: "border-phase-ovulatory/30"
    },
    "Luteal": {
        color: "text-phase-luteal",
        blob: "bg-phase-luteal/30",
        orbRing: "from-phase-luteal/60 via-white to-phase-luteal/40",
        glow: "shadow-[0_20px_50px_rgba(123,130,168,0.25)]", // Dusk Slate Aura
        badge: "bg-transparent text-phase-luteal border border-phase-luteal/30",
        iconBg: "bg-phase-luteal/20",
        iconColor: "text-phase-luteal",
        gradient: "from-phase-luteal/20 to-white/0",
        borderColor: "border-phase-luteal/30"
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
        skin: {
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
        skin: {
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
        skin: {
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
        skin: {
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

const PHASE_EXPLAINERS: Record<string, string> = {
    "Menstrual": "Why Red? 🌹 Honoring your body's sacred reset.",
    "Follicular": "Why Green? 🌱 Just like spring, your energy is blooming!",
    "Ovulatory": "Why Gold? ✨ You're glowing with peak summer vibes!",
    "Luteal": "Why Indigo? 🌙 Deep colors for deep thoughts & nesting."
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
// --- 4. Seasonal Background Component (Premium Atmosphere) ---
// --- 4. Seasonal Background Component (Premium Atmosphere) ---
function SeasonalBackground({ phase }: { phase: string }) {
    // Shared transition for smooth mood shifts
    const fluidTransition = { duration: 8, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as any };

    if (phase === "Menstrual") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-50"> {/* Reduced opacity */}
                {/* Winter: Soft Rose Glow */}
                <motion.div
                    className="absolute w-[140%] h-[140%] bg-gradient-to-tr from-phase-menstrual/30 via-white/5 to-transparent rounded-full blur-3xl"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                    transition={fluidTransition}
                />
                <motion.div
                    className="absolute w-[90%] h-[90%] bg-phase-menstrual/10 rounded-full blur-2xl"
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.95, 1.05, 0.95] }}
                    transition={{ ...fluidTransition, duration: 6 }}
                />
            </div>
        );
    }
    if (phase === "Follicular") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60"> {/* Soft & Airy */}
                {/* Spring: Sage Mist */}
                <motion.div
                    className="absolute w-[150%] h-[150%] bg-gradient-to-br from-phase-follicular/30 via-white/10 to-transparent rounded-full blur-3xl"
                    animate={{ rotate: [0, -20, 0], scale: [1, 1.15, 1] }}
                    transition={fluidTransition}
                />
                <motion.div
                    className="absolute w-[110%] h-[110%] bg-phase-follicular/20 blur-2xl rounded-full"
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ ...fluidTransition, duration: 5 }}
                />
            </div>
        );
    }
    if (phase === "Ovulatory") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60">
                {/* Summer: Golden Haze */}
                <motion.div
                    className="absolute w-[150%] h-[150%] bg-gradient-to-t from-phase-ovulatory/30 via-white/10 to-transparent rounded-full blur-3xl"
                    animate={{ rotate: 180, scale: [1, 1.05, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute w-[100%] h-[100%] bg-phase-ovulatory/20 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        );
    }
    if (phase === "Luteal") {
        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-50">
                {/* Autumn: Slate Dusk */}
                <motion.div
                    className="absolute w-[140%] h-[140%] bg-gradient-to-bl from-phase-luteal/30 via-white/5 to-transparent rounded-full blur-3xl"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 15, 0] }}
                    transition={fluidTransition}
                />
                <motion.div
                    className="absolute w-[110%] h-[110%] bg-gradient-to-tr from-phase-luteal/20 to-transparent blur-2xl rounded-full"
                    animate={{ x: [-15, 15, -15], y: [-15, 15, -15], scale: [1, 1.05, 1] }}
                    transition={{ ...fluidTransition, duration: 9 }}
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
            const result = calculatePhase(new Date(), unifiedData.settings, unifiedData.monthLogs);
            setClientDay(result.day > 0 ? result.day : null);
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
                            smartPhase: calculatePhase(new Date(), dashboardData.settings, dashboardData.monthLogs),
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


    const hasCycleData =
        !!data?.settings?.last_period_start ||
        Object.values(data?.monthLogs || {}).some((log: any) => log?.is_period);

    // ✅ OVERRIDE PHASE DATA
    const { user, phase: serverPhase } = data;
    const currentPhase = {
        ...serverPhase,
        name: clientPhaseName || serverPhase.name,
        day: clientDay || serverPhase.day
    };

    const theme = phaseThemes[currentPhase.name] || phaseThemes["Follicular"];
    const trackerMode = data.tracker_mode || "menstruation";

    if (!hasCycleData) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-rove-cream/20 pt-4 md:pt-20 grain-overlay">
                <div className="relative z-10 p-4 md:p-8 space-y-6 md:space-y-8 pb-4 md:pb-32">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rove-charcoal/50 mb-0.5">ROVE</span>
                            <span className="font-heading text-2xl text-rove-charcoal">Hey, {user?.name?.split(" ")[0] || "Love"}</span>
                            <span className="text-[10px] font-medium text-rove-stone uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <ProfileAvatar />
                    </div>

                    <div className="max-w-xl mx-auto bg-white/80 border border-rove-stone/10 rounded-3xl p-6 shadow-sm">
                        <h2 className="font-heading text-xl text-rove-charcoal mb-2">Log your first period</h2>
                        <p className="text-sm text-rove-stone mb-4">
                            Once you log a period start, your phase, fertile window, and insights will appear here.
                        </p>
                        <Link
                            href="/cycle-sync/tracker"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rove-charcoal text-white text-sm font-semibold hover:bg-black transition"
                        >
                            Go to Tracker
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                                <div className="flex flex-col items-center gap-6">
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

                                                    {/* Cutesy Explainer */}

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

                                    {/* Cutesy Explainer (Outside Orb) */}
                                    <p className="text-[10px] sm:text-xs text-rove-stone/80 font-medium italic text-center max-w-[200px] leading-relaxed">
                                        {PHASE_EXPLAINERS[currentPhase.name]}
                                    </p>
                                </div>

                                {/* Spacer for balance on desktop */}
                                <div className="hidden md:block w-24"></div>
                            </div>

                            {/* CYCLE STATS CARDS - Mobile Scroll / Desktop Grid */}
                            <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-4 px-0 md:px-2">
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
                                            <Link href="/cycle-sync/tracker" className="flex-1">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="h-full bg-gradient-to-br from-phase-menstrual/40 to-phase-menstrual/10 backdrop-blur-md rounded-2xl md:rounded-3xl px-3 py-4 md:p-4 border border-phase-menstrual/30 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                                                >
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />

                                                    <div className="flex flex-col md:flex-row md:items-center gap-1.5 mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/40 flex items-center justify-center shrink-0">
                                                                <Droplets className="w-3 h-3 md:w-3.5 md:h-3.5 text-phase-menstrual" />
                                                            </div>
                                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-phase-menstrual/90">Period</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-lg md:text-xl font-heading font-semibold text-rove-charcoal leading-none mb-1">{formatDate(nextPeriod)}</p>
                                                    <p className="text-[9px] text-rove-stone/80 font-medium whitespace-nowrap">
                                                        {nextPeriod ? `in ${Math.ceil((nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'Next cycle'}
                                                    </p>
                                                </motion.div>
                                            </Link>

                                            {/* Ovulation Card - Soleil Ochre (Ovulatory) */}
                                            <Link href="/cycle-sync/tracker" className="flex-1">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="h-full bg-gradient-to-br from-phase-ovulatory/40 to-phase-ovulatory/10 backdrop-blur-md rounded-2xl md:rounded-3xl px-3 py-4 md:p-4 border border-phase-ovulatory/30 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                                                >
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />

                                                    <div className="flex flex-col md:flex-row md:items-center gap-1.5 mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/40 flex items-center justify-center shrink-0">
                                                                <Baby className="w-3 h-3 md:w-3.5 md:h-3.5 text-phase-ovulatory" />
                                                            </div>
                                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-phase-ovulatory/90">Ovulation</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-lg md:text-xl font-heading font-bold text-rove-charcoal leading-none mb-1">{formatDate(ovulationDate)}</p>
                                                    <p className="text-[9px] text-rove-stone/80 font-medium whitespace-nowrap">Peak fertility</p>
                                                </motion.div>
                                            </Link>

                                            {/* Fertile Window Card - Sage Dew (Follicular) */}
                                            <Link href="/cycle-sync/tracker" className="flex-1">
                                                <motion.div
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="h-full bg-gradient-to-br from-phase-follicular/40 to-phase-follicular/10 backdrop-blur-md rounded-2xl md:rounded-3xl px-3 py-4 md:p-4 border border-phase-follicular/30 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                                                >
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />

                                                    <div className="flex flex-col md:flex-row md:items-center gap-1.5 mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/40 flex items-center justify-center shrink-0">
                                                                <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-phase-follicular" />
                                                            </div>
                                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-phase-follicular/90">Fertile</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-lg md:text-xl font-heading font-semibold text-rove-charcoal leading-none mb-1">
                                                        {fertileStart && fertileEnd ? `${formatDate(fertileStart)} - ${formatDate(fertileEnd)}` : '--'}
                                                    </p>
                                                    <p className="text-[9px] text-rove-stone/80 font-medium whitespace-nowrap">6-day window</p>
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
                                    onClick={() => setSelectedSnapshot("hormones")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative overflow-hidden rounded-[1.5rem] ${theme.blob.replace('bg-', 'bg-').replace('/30', '/5')} backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer`}
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className={`text-xs font-extrabold uppercase tracking-[0.2em] ${theme.color}`}>Hormones</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-80 transition-opacity group-hover:opacity-100 pointer-events-none">
                                        <HormoneWave color="#FB7185" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading font-bold text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.hormones.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.hormones.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Mind */}
                                <motion.div
                                    onClick={() => setSelectedSnapshot("mind")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative overflow-hidden rounded-[1.5rem] ${theme.blob.replace('bg-', 'bg-').replace('/30', '/5')} backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer`}
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className={`text-xs font-extrabold uppercase tracking-[0.2em] ${theme.color}`}>Mind</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-80 transition-opacity group-hover:opacity-100 pointer-events-none">
                                        <MindSynapse color="#64748B" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading font-bold text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.mind.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.mind.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Body */}
                                <motion.div
                                    onClick={() => setSelectedSnapshot("body")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative overflow-hidden rounded-[1.5rem] ${theme.blob.replace('bg-', 'bg-').replace('/30', '/5')} backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer`}
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className={`text-xs font-extrabold uppercase tracking-[0.2em] ${theme.color}`}>Body</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-80 transition-opacity group-hover:opacity-100 pointer-events-none">
                                        <BodyDNA color="#10B981" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading font-bold text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.body.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.body.desc}</p>
                                    </div>
                                </motion.div>

                                {/* Skin (fka Glow) */}
                                <motion.div
                                    onClick={() => setSelectedSnapshot("skin")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative overflow-hidden rounded-[1.5rem] ${theme.blob.replace('bg-', 'bg-').replace('/30', '/5')} backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all aspect-square group cursor-pointer`}
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className={`text-xs font-extrabold uppercase tracking-[0.2em] ${theme.color}`}>Skin</span>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-[45%] h-[45%] opacity-80 transition-opacity group-hover:opacity-100 pointer-events-none">
                                        <GlowHalo color="#F59E0B" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h4 className="text-base sm:text-lg md:text-xl font-heading font-bold text-rove-charcoal leading-tight mb-0.5 sm:mb-1">{PHASE_SNAPSHOTS[currentPhase.name]?.skin.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-rove-stone font-medium leading-relaxed">{PHASE_SNAPSHOTS[currentPhase.name]?.skin.desc}</p>
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

            {/* EXPANDED MODAL OVERLAY (PREMIUM / CLEAN) */}
            <AnimatePresence>
                {
                    selectedSnapshot && (
                        <motion.div
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSnapshot(null)}
                        >
                            <motion.div
                                className="bg-white/95 backdrop-blur-2xl rounded-[1.5rem] w-full max-w-sm shadow-2xl relative border border-white/50 overflow-hidden ring-1 ring-black/5"
                                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header Section with Phase Color Tint */}
                                <div className={`px-6 py-6 pb-4 relative ${theme.blob.replace('bg-', 'bg-').replace('/30', '/10')}`}>
                                    {/* Ambient Background Graphic for Texture */}
                                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                                        {selectedSnapshot === "hormones" && <HormoneWave color="#FB7185" />}
                                        {selectedSnapshot === "mind" && <MindSynapse color="#64748B" />}
                                        {selectedSnapshot === "body" && <BodyDNA color="#10B981" />}
                                        {selectedSnapshot === "skin" && <GlowHalo color="#F59E0B" />}
                                    </div>

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme.blob.replace('bg-', 'bg-').replace('/30', '')}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.color}`}>
                                                    {selectedSnapshot === "skin" ? "Skin" : selectedSnapshot}
                                                </span>
                                            </div>
                                            <h3 className="text-3xl font-heading text-rove-charcoal tracking-tight leading-tight">
                                                {/* @ts-ignore */}
                                                {PHASE_SNAPSHOTS[currentPhase.name]?.[selectedSnapshot]?.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSnapshot(null)}
                                            className="p-2 -mr-2 -mt-2 bg-white/50 hover:bg-white rounded-full transition-all group shadow-sm"
                                        >
                                            <div className="relative w-5 h-5 flex items-center justify-center text-rove-charcoal/60 group-hover:text-rove-charcoal">
                                                <Plus className="w-5 h-5 rotate-45" />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="px-6 py-5 space-y-6">
                                    {/* Insight Description */}
                                    <p className="text-lg text-rove-charcoal/90 leading-relaxed font-heading">
                                        {/* @ts-ignore */}
                                        {PHASE_SNAPSHOTS[currentPhase.name]?.[selectedSnapshot]?.detail}
                                    </p>

                                    {/* Action/Protocol */}
                                    <div className={`rounded-xl p-5 border ${theme.borderColor} ${theme.blob.replace('bg-', 'bg-').replace('/30', '/5')}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className={`w-4 h-4 ${theme.color}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.color}`}>Protocol</span>
                                        </div>
                                        <p className="text-rove-stone text-sm leading-relaxed font-medium">
                                            {/* @ts-ignore */}
                                            {PHASE_SNAPSHOTS[currentPhase.name]?.[selectedSnapshot]?.protocol}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
