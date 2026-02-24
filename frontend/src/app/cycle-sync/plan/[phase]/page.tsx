"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchCycleIntelligence } from "@/app/actions/cycle-sync";
import {
    motion, animate, AnimatePresence,
    useReducedMotion, useScroll, useTransform,
} from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
    Activity, ArrowLeft, Brain, CheckCircle2,
    Leaf, Pill, Utensils, Beaker,
    Moon, Zap, Wind, Fish, Drumstick, Heart, Coffee, Soup,
    Shield, Droplets, Ban, LayoutGrid, Dumbbell, Sun, Sunrise, Wheat, Flower2,
    Play, ChevronRight,
} from "lucide-react";
import { getPhaseData, type PhaseData } from "@/data/phase-data";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { WorkoutExercise } from "./components/GuidedSession";

// Lazy-load the heavy session modal
const GuidedSession = dynamic(() => import("./components/GuidedSession"), { ssr: false });

// ─── Icon Mapping ─────────────────────────────────────────────────────────────
const iconMap: Record<string, any> = {
    Moon, Zap, Brain, Droplets, Fish, Soup, Leaf, Beaker,
    Drumstick, Wheat, Shield, Wind, Pill, Sunrise, Sun, Coffee, Heart, Activity, Dumbbell,
};

// ─── Motion Variants (unified system) ────────────────────────────────────────
const STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
};

const STAGGER_ITEM = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 320, damping: 28 } },
};

const TAB_CONTENT = {
    enter: { opacity: 0, y: 12 },
    center: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ─── Phase accent colors ──────────────────────────────────────────────────────
const PHASE_ACCENT: Record<string, string> = {
    Menstrual: "#AF6B6B",
    Follicular: "#5C8F7A",
    Ovulatory: "#C89B36",
    Luteal: "#6262B8",
};

// ─── Helper: enrich exercise items with guided session metadata ───────────────
function enrichExercises(items: any[]): WorkoutExercise[] {
    return items.map((ex, i) => ({
        ...ex,
        seconds: ex.intensity === "Low" ? 30 : ex.intensity === "Moderate" ? 45 : 40,
        sets: ex.intensity === "Low" ? undefined : 3,
        reps: ex.intensity === "Low" ? undefined : 12,
        formCues: getFormCues(ex.title),
    }));
}

function getFormCues(title: string): string[] {
    const t = title.toLowerCase();
    if (t.includes("push")) return [
        "Keep your core tight — don't let your hips sag",
        "Elbows at ~45° from your body, not flared out",
        "Breathe out on the way up",
    ];
    if (t.includes("wall sit")) return [
        "Back flat against the wall, thighs parallel to floor",
        "Weight evenly on both feet",
        "Hold the breath steady — don't hold your breath",
    ];
    if (t.includes("lunge")) return [
        "Step back far enough that your front knee stays above your ankle",
        "Lower your back knee toward the floor, not forward",
        "Keep chest tall, gaze forward",
    ];
    if (t.includes("yoga") || t.includes("stretch")) return [
        "Breathe into each stretch — don't force it",
        "Never stretch to the point of pain",
    ];
    if (t.includes("plank")) return [
        "Straight line from head to heels",
        "Squeeze your glutes and abs simultaneously",
        "Look just ahead of your hands, neutral neck",
    ];
    return [
        "Controlled movements — quality over speed",
        "Exhale on exertion",
    ];
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function Counter({ from, to }: { from: number; to: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        const controls = animate(from, to, { duration: 1.5, ease: "easeOut", onUpdate(v) { node.textContent = v.toFixed(0); } });
        return () => controls.stop();
    }, [from, to]);
    return <span ref={nodeRef} />;
}

function MacroVisualizer({ nutrition }: { nutrition: any }) {
    const { macros, calories } = nutrition;
    return (
        <motion.div variants={STAGGER_ITEM} className="relative p-5 rounded-2xl bg-white shadow-md shadow-gray-900/5 overflow-hidden border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="#F3F4F6" strokeWidth="6" />
                        <motion.circle
                            cx="50" cy="50" r="44" fill="none" stroke="#2F363F" strokeWidth="6" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="text-center">
                        <div className="text-xl font-bold text-rove-charcoal"><Counter from={0} to={calories} /></div>
                        <span className="text-[8px] uppercase tracking-widest text-rove-stone">KCAL</span>
                    </div>
                </div>
                <div className="flex-1 w-full space-y-2.5">
                    <h3 className="font-bold text-sm text-rove-charcoal">Daily Macro Target</h3>
                    {[
                        { label: "Protein", val: macros.protein.g, color: "#AF6B6B", width: macros.protein.pct },
                        { label: "Fats", val: macros.fats.g, color: "#C89B36", width: macros.fats.pct },
                        { label: "Carbs", val: macros.carbs.g, color: "#5C8F7A", width: macros.carbs.pct },
                    ].map(m => (
                        <div key={m.label} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                                <span>{m.label}</span>
                                <span>{m.val}g</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${m.width}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: m.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
    return (
        <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 bg-rove-charcoal/90 rounded-lg text-white">
                <Icon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base font-bold text-rove-charcoal">{title}</h2>
        </div>
    );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            variants={STAGGER_ITEM}
            className={cn("p-4 rounded-2xl bg-white/80 backdrop-blur border border-gray-100/80 shadow-sm", className)}
        >
            {children}
        </motion.div>
    );
}

// ─── Exercise Card (plan view) ────────────────────────────────────────────────
function ExerciseListCard({
    ex, index, accent,
}: { ex: any; index: number; accent: string }) {
    const intensityColor = ex.intensity === "Low"
        ? "border-emerald-200 text-emerald-600 bg-emerald-50"
        : ex.intensity === "High"
            ? "border-red-200 text-red-600 bg-red-50"
            : "border-amber-200 text-amber-600 bg-amber-50";

    return (
        <motion.div
            variants={STAGGER_ITEM}
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            className="p-3.5 rounded-2xl bg-white/80 border border-gray-100 shadow-sm transition-all"
        >
            <div className="flex items-start gap-3">
                <div
                    className="text-lg font-bold opacity-10 select-none shrink-0 w-6 text-right"
                    style={{ color: accent }}
                >
                    {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-sm text-rove-charcoal">{ex.title}</h4>
                        <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full border", intensityColor)}>
                            {ex.intensity}
                        </span>
                        <span className="text-[9px] text-gray-400">{ex.duration}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{ex.description}</p>
                    {ex.benefits?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {ex.benefits.map((b: string) => (
                                <span key={b} className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                                    {b}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function ScrollProgress({ accent }: { accent: string }) {
    const { scrollYProgress } = useScroll();
    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50"
            style={{ scaleX: scrollYProgress, backgroundColor: accent }}
        />
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PhaseDetailPage() {
    const params = useParams();
    const phaseId = params.phase as string;
    const reduced = useReducedMotion();

    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "nutrition" | "movement">("overview");
    const [sessionOpen, setSessionOpen] = useState(false);

    const phaseNameMap: Record<string, string> = {
        menstrual: "Menstrual",
        follicular: "Follicular",
        ovulatory: "Ovulatory",
        luteal: "Luteal",
    };
    const phaseName = phaseNameMap[phaseId] || "Menstrual";
    const BP = getPhaseData(phaseName);
    const accent = PHASE_ACCENT[phaseName] || "#2F363F";

    useEffect(() => {
        fetchCycleIntelligence().then(res => { if (res) setData(res); });
    }, []);

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-7 h-7 rounded-full border-2 border-t-transparent"
                style={{ borderColor: `${accent} transparent transparent transparent` }}
            />
        </div>
    );

    const isCurrentPhase = data.phase === phaseName;
    const PhaseIcon = iconMap[BP.core.icon] || Zap;
    const enrichedExercises = enrichExercises(BP.exercise.recommended);

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutGrid },
        { id: "nutrition", label: "Diet", icon: Utensils },
        { id: "movement", label: "Exercise", icon: Dumbbell },
    ] as const;

    return (
        <>
            <ScrollProgress accent={accent} />

            {/* Guided session modal */}
            <AnimatePresence>
                {sessionOpen && (
                    <GuidedSession
                        exercises={enrichedExercises}
                        phaseName={phaseName}
                        accentColor={accent}
                        onClose={() => setSessionOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen bg-rove-cream/20 pt-20 pb-32 px-4 md:px-8">
                <div className="max-w-2xl mx-auto space-y-4">

                    {/* Back */}
                    <Link href="/cycle-sync/plan">
                        <motion.button
                            initial={reduced ? false : { opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-bold uppercase tracking-wider transition-colors mb-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Plan
                        </motion.button>
                    </Link>

                    {/* Hero */}
                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="relative overflow-hidden p-5 rounded-[1.5rem] bg-rove-charcoal text-white"
                    >
                        {/* Subtle radial glow */}
                        <div
                            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
                            style={{ backgroundColor: accent }}
                        />

                        <div className="relative flex items-start justify-between mb-3">
                            <div>
                                {isCurrentPhase && (
                                    <span className="inline-block text-[8px] font-bold uppercase tracking-widest bg-white/15 border border-white/20 text-white px-2.5 py-1 rounded-full mb-2">
                                        Your Current Phase
                                    </span>
                                )}
                                <h1 className="text-2xl font-bold leading-tight">{phaseName} Phase</h1>
                                <p className="text-xs text-white/50 mt-0.5">{BP.core.altName} · {BP.core.duration}</p>
                            </div>
                            <div
                                className="p-2.5 rounded-xl shrink-0"
                                style={{ backgroundColor: `${accent}30` }}
                            >
                                <PhaseIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <p className="text-sm text-white/65 leading-relaxed mb-4">{BP.hormones.summary}</p>

                        {/* Energy dots */}
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Energy</span>
                            <div className="flex gap-0.5">
                                {[...Array(10)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={reduced ? false : { scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            backgroundColor: i < BP.hormones.energyLevel
                                                ? accent
                                                : "rgba(255,255,255,0.12)"
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-white/40">{BP.hormones.energyLevel}/10</span>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/70 backdrop-blur-sm p-1 rounded-full flex gap-1 border border-gray-100 sticky top-[70px] z-30 shadow-sm"
                    >
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[11px] font-bold transition-colors",
                                        isActive ? "text-white" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-pill"
                                            className="absolute inset-0 rounded-full"
                                            style={{ backgroundColor: accent }}
                                            transition={{ type: "spring", stiffness: 400, damping: 34 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        <tab.icon className="w-3 h-3" />
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">

                        {/* ─── OVERVIEW ─────────────────────────────── */}
                        {activeTab === "overview" && (
                            <motion.div
                                key="overview"
                                variants={STAGGER_CONTAINER}
                                initial={reduced ? false : "hidden"}
                                animate="show"
                                exit="exit"
                                className="space-y-3"
                            >
                                {isCurrentPhase && data.nutrition && (
                                    <MacroVisualizer nutrition={data.nutrition} />
                                )}

                                <Card>
                                    <p className="text-sm text-gray-700 leading-relaxed">{BP.hormones.description}</p>
                                </Card>

                                <Card>
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">What You May Feel</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {BP.hormones.symptoms.map((s: string) => (
                                            <span key={s} className={cn("px-2.5 py-1 rounded-full text-xs font-medium", BP.core.badgeColor)}>{s}</span>
                                        ))}
                                    </div>
                                </Card>

                                <Card>
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Mood Patterns</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {BP.hormones.moodPatterns.map((m: string) => (
                                            <span key={m} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-700">{m}</span>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="border-l-4" style={{ borderLeftColor: accent } as any}>
                                    <p className="text-gray-800 italic text-base font-medium leading-relaxed">
                                        "{BP.affirmation}"
                                    </p>
                                </Card>

                                <Card className="bg-purple-50/60 border border-purple-100">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-purple-500 mb-2.5 flex items-center gap-1.5">
                                        <Heart className="w-3 h-3" /> Self-Care Tips
                                    </h4>
                                    <ul className="space-y-2">
                                        {BP.selfCareTips.slice(0, 4).map((tip: string) => (
                                            <li key={tip} className="flex items-start gap-2 text-xs text-gray-700">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />{tip}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </motion.div>
                        )}

                        {/* ─── NUTRITION ────────────────────────────── */}
                        {activeTab === "nutrition" && (
                            <motion.div
                                key="nutrition"
                                variants={STAGGER_CONTAINER}
                                initial={reduced ? false : "hidden"}
                                animate="show"
                                exit="exit"
                                className="space-y-3"
                            >
                                <Card className="border-l-4" style={{ borderLeftColor: accent } as any}>
                                    <div className="flex items-start gap-2.5">
                                        <Flower2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-xs text-gray-800 mb-1">Ayurvedic Wisdom</h4>
                                            <p className="text-xs text-gray-500 italic leading-relaxed">{BP.diet.ayurvedicTip}</p>
                                        </div>
                                    </div>
                                </Card>

                                <motion.section variants={STAGGER_ITEM}>
                                    <SectionHeader title="Focus On" icon={Utensils} />
                                    <div className="grid grid-cols-2 gap-2">
                                        {BP.diet.coreNeeds.map((n: any) => {
                                            const NeedIcon = iconMap[n.icon] || Zap;
                                            return (
                                                <motion.div
                                                    key={n.id}
                                                    variants={STAGGER_ITEM}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="p-3 rounded-xl bg-white/80 border border-gray-100 flex items-center gap-2.5"
                                                >
                                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${accent}18` }}>
                                                        <NeedIcon className="w-4 h-4" style={{ color: accent }} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[11px] text-gray-800">{n.title}</div>
                                                        <div className="text-[9px] text-gray-400">{n.description}</div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.section>

                                <motion.section variants={STAGGER_ITEM}>
                                    <SectionHeader title="Indian Meal Plan" icon={Soup} />
                                    <div className="space-y-2.5">
                                        {BP.diet.meals.map((meal: any, i: number) => {
                                            const MealIcon = iconMap[meal.icon] || Sun;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    variants={STAGGER_ITEM}
                                                    className="p-3.5 rounded-xl bg-white/80 border border-gray-100 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="p-1.5 bg-gray-50 rounded-lg">
                                                            <MealIcon className="w-3.5 h-3.5 text-gray-600" />
                                                        </div>
                                                        <span className="font-bold text-sm text-gray-800">{meal.title}</span>
                                                        <span className="text-[8px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full ml-auto">
                                                            {meal.time}
                                                        </span>
                                                    </div>
                                                    <ul className="text-[11px] text-gray-500 space-y-1 ml-8">
                                                        {meal.items.slice(0, 4).map((item: string) => (
                                                            <li key={item} className="flex items-center gap-1.5">
                                                                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {meal.tip && (
                                                        <p className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg mt-2 ml-8">
                                                            💡 {meal.tip}
                                                        </p>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.section>

                                <div className="grid grid-cols-2 gap-3">
                                    <Card className="bg-emerald-50/50 border-emerald-100 p-3">
                                        <h4 className="text-[9px] font-bold uppercase text-emerald-600 mb-2 flex items-center gap-1">
                                            <Heart className="w-3 h-3" /> Eat
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {BP.diet.superfoods.slice(0, 5).map((item: string) => (
                                                <li key={item} className="text-[10px] text-gray-700 flex items-start gap-1.5">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                                                    <span>{item.split(" - ")[0]}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                    <Card className="bg-red-50/40 border-red-100 p-3">
                                        <h4 className="text-[9px] font-bold uppercase text-red-500 mb-2 flex items-center gap-1">
                                            <Ban className="w-3 h-3" /> Avoid
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {BP.diet.avoid.slice(0, 5).map((item: string) => (
                                                <li key={item} className="text-[10px] text-gray-600 flex items-start gap-1.5">
                                                    <div className="w-1 h-1 bg-red-300 rounded-full flex-shrink-0 mt-1.5" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>

                                <motion.section variants={STAGGER_ITEM}>
                                    <SectionHeader title="Supplements" icon={Pill} />
                                    <div className="grid grid-cols-2 gap-2">
                                        {BP.supplements.slice(0, 4).map((s: any) => (
                                            <motion.div
                                                key={s.name}
                                                variants={STAGGER_ITEM}
                                                className="p-3 rounded-xl bg-white/80 border border-gray-100"
                                            >
                                                <div className="font-bold text-xs text-gray-800 mb-0.5">{s.name}</div>
                                                <div
                                                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border inline-block mb-1"
                                                    style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}10` }}
                                                >
                                                    {s.dose}
                                                </div>
                                                <div className="text-[9px] text-gray-400 line-clamp-2">{s.reason}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.section>
                            </motion.div>
                        )}

                        {/* ─── MOVEMENT ─────────────────────────────── */}
                        {activeTab === "movement" && (
                            <motion.div
                                key="movement"
                                variants={STAGGER_CONTAINER}
                                initial={reduced ? false : "hidden"}
                                animate="show"
                                exit="exit"
                                className="space-y-4"
                            >
                                {/* Philosophy */}
                                <Card className="border-l-4" style={{ borderLeftColor: accent } as any}>
                                    <p className="text-gray-700 italic text-sm font-medium leading-relaxed">
                                        {BP.exercise.summary}
                                    </p>
                                </Card>

                                {/* ── Start Guided Session CTA ── */}
                                <motion.div variants={STAGGER_ITEM}>
                                    <motion.button
                                        onClick={() => setSessionOpen(true)}
                                        whileHover={{ scale: 1.02, boxShadow: `0 12px 32px ${accent}40` }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white font-bold shadow-lg transition-all"
                                        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Play className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold">Start Guided Session</div>
                                                <div className="text-[10px] text-white/70 font-medium">
                                                    {enrichedExercises.length} exercises · includes timers &amp; form cues
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/60" />
                                    </motion.button>
                                </motion.div>

                                {/* Exercise List */}
                                <motion.section variants={STAGGER_ITEM}>
                                    <SectionHeader title="Recommended Exercises" icon={Dumbbell} />
                                    <div className="space-y-2">
                                        {BP.exercise.recommended.map((ex: any, i: number) => (
                                            <ExerciseListCard key={i} ex={ex} index={i} accent={accent} />
                                        ))}
                                    </div>
                                </motion.section>

                                {/* Yoga + Breathwork */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Card className="p-3">
                                        <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-2 flex items-center gap-1">
                                            <Activity className="w-3 h-3" /> Yoga
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {BP.exercise.yoga.asanas.slice(0, 4).map((a: string) => (
                                                <li key={a} className="text-[10px] text-gray-500 flex items-start gap-1.5">
                                                    <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: accent }} />
                                                    <span className="line-clamp-1">{a}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                    <Card className="p-3">
                                        <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-2 flex items-center gap-1">
                                            <Wind className="w-3 h-3" /> Breathwork
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {BP.exercise.yoga.pranayama.map((p: string) => (
                                                <li key={p} className="text-[10px] text-gray-500 flex items-start gap-1.5">
                                                    <div className="w-1 h-1 bg-sky-400 rounded-full shrink-0 mt-1.5" />
                                                    <span className="line-clamp-1">{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>

                                {/* Avoid */}
                                <Card className="bg-gray-50 border-gray-200 p-3.5">
                                    <h4 className="text-[9px] font-bold uppercase text-gray-400 mb-2.5 flex items-center gap-1.5">
                                        <Ban className="w-3 h-3" /> Skip These This Phase
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {BP.exercise.avoid.map((item: string) => (
                                            <span key={item} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[9px] text-gray-400 line-through">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                    {BP.exercise.restDays && (
                                        <p className="text-[10px] text-gray-400 mt-2.5 italic">{BP.exercise.restDays}</p>
                                    )}
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
