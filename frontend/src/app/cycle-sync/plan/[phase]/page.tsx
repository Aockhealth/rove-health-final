"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchCycleIntelligence } from "@/app/actions/cycle-sync";
import { motion, animate, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
    Activity, ArrowLeft, Brain, CheckCircle2,
    Leaf, Pill, Utensils, Beaker,
    Moon, Zap, Wind, Fish, Drumstick, Heart, Coffee, Soup,
    Shield, Droplets, Ban, LayoutGrid, Dumbbell, Sun, Sunrise, Wheat, Flower2
} from "lucide-react";
import { getPhaseData, type PhaseData } from "@/data/phase-data";
import Link from "next/link";

// --- Icon Mapping ---
const iconMap: Record<string, any> = {
    "Moon": Moon,
    "Zap": Zap,
    "Brain": Brain,
    "Droplets": Droplets,
    "Fish": Fish,
    "Soup": Soup,
    "Leaf": Leaf,
    "Beaker": Beaker,
    "Drumstick": Drumstick,
    "Wheat": Wheat,
    "Shield": Shield,
    "Wind": Wind,
    "Pill": Pill,
    "Sunrise": Sunrise,
    "Sun": Sun,
    "Coffee": Coffee,
    "Heart": Heart,
    "Activity": Activity,
    "Dumbbell": Dumbbell,
};

// --- Components ---

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

function MacroVisualizer({ nutrition, biometrics }: { nutrition: any, biometrics: any }) {
    const { macros, calories } = nutrition;
    return (
        <div className="relative p-5 rounded-[2rem] bg-white shadow-lg shadow-rove-charcoal/5 overflow-hidden border border-rove-stone/10">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="#F3F4F6" strokeWidth="5" />
                        <motion.circle
                            cx="50" cy="50" r="46" fill="none" stroke="#2F363F" strokeWidth="5" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                        />
                    </svg>
                    <div className="text-center">
                        <div className="text-2xl font-heading text-rove-charcoal"><Counter from={0} to={calories} /></div>
                        <span className="text-[9px] uppercase tracking-widest text-rove-stone">KCAL</span>
                    </div>
                </div>
                <div className="flex-1 w-full space-y-3">
                    <h3 className="font-heading text-base text-rove-charcoal">Daily Target</h3>
                    {[
                        { label: "Protein", val: macros.protein.g, color: "bg-rove-red", width: macros.protein.pct },
                        { label: "Fats", val: macros.fats.g, color: "bg-amber-400", width: macros.fats.pct },
                        { label: "Carbs", val: macros.carbs.g, color: "bg-rove-green", width: macros.carbs.pct },
                    ].map((m) => (
                        <div key={m.label} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-rove-charcoal/70">
                                <span>{m.label}</span>
                                <span>{m.val}g</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${m.width}%` }} className={`h-full rounded-full ${m.color}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, icon: Icon }: { title: string, icon: any }) {
    return (
        <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-rove-charcoal rounded-lg text-white"><Icon className="w-4 h-4" /></div>
            <h2 className="text-lg font-heading text-rove-charcoal">{title}</h2>
        </div>
    );
}

function BlueprintCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-rove-stone/10 shadow-sm", className)}>{children}</div>;
}

export default function PhaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const phaseId = params.phase as string;

    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'movement'>('overview');

    // Map phase ID to phase name
    const phaseNameMap: Record<string, string> = {
        'menstrual': 'Menstrual',
        'follicular': 'Follicular',
        'ovulatory': 'Ovulatory',
        'luteal': 'Luteal'
    };

    const phaseName = phaseNameMap[phaseId] || 'Menstrual';
    const BP = getPhaseData(phaseName);

    useEffect(() => {
        const load = async () => {
            const res = await fetchCycleIntelligence();
            if (res) setData(res);
        };
        load();
    }, []);

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <div className="animate-spin w-8 h-8 rounded-full border-2 border-rove-charcoal border-t-transparent" />
        </div>
    );

    const isCurrentPhase = data.phase === phaseName;
    const PhaseIcon = iconMap[BP.core.icon] || Zap;

    const getDietIcon = (iconName: string) => iconMap[iconName] || Zap;

    return (
        <div className="min-h-screen bg-rove-cream/20 pt-20 pb-32 px-4 md:px-8">
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Back Button */}
                <Link href="/cycle-sync/plan">
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-sm text-rove-stone hover:text-rove-charcoal transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Plan
                    </motion.button>
                </Link>

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "relative overflow-hidden p-5 rounded-[1.5rem]",
                        "bg-gradient-to-br from-rove-charcoal to-gray-800 text-white"
                    )}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            {isCurrentPhase && (
                                <Badge className="bg-white/20 text-white text-[9px] px-2 py-0.5 mb-2 border-white/20">
                                    YOUR CURRENT PHASE
                                </Badge>
                            )}
                            <h1 className="text-2xl md:text-3xl font-heading">{phaseName} Phase</h1>
                            <p className="text-xs text-white/60 mt-1">{BP.core.altName} • {BP.core.duration}</p>
                        </div>
                        <div className={cn("p-3 rounded-xl", BP.core.color + "/20")}>
                            <PhaseIcon className="w-6 h-6" />
                        </div>
                    </div>

                    <p className="text-sm text-white/70 leading-relaxed mb-4">
                        {BP.hormones.summary}
                    </p>

                    {/* Energy Bar */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase text-white/50">Energy</span>
                        <div className="flex gap-1">
                            {[...Array(10)].map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        i < BP.hormones.energyLevel ? "bg-white" : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-white/60">{BP.hormones.energyLevel}/10</span>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="bg-white/60 p-1 rounded-full flex gap-1 backdrop-blur-sm border border-rove-stone/5 sticky top-20 z-20 shadow-sm">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutGrid },
                        { id: 'nutrition', label: 'Diet', icon: Utensils },
                        { id: 'movement', label: 'Exercise', icon: Dumbbell }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all",
                                    isActive ? "bg-rove-charcoal text-white shadow-md" : "text-rove-stone hover:bg-white/50"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {isCurrentPhase && <MacroVisualizer nutrition={data.nutrition} biometrics={data.biometrics} />}

                            {/* Description */}
                            <BlueprintCard>
                                <p className="text-sm text-rove-charcoal leading-relaxed">
                                    {BP.hormones.description}
                                </p>
                            </BlueprintCard>

                            {/* Symptoms */}
                            <BlueprintCard>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3">What You May Feel</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {BP.hormones.symptoms.map((s: string) => (
                                        <span key={s} className={cn("px-2.5 py-1 rounded-full text-xs font-medium", BP.core.badgeColor)}>{s}</span>
                                    ))}
                                </div>
                            </BlueprintCard>

                            {/* Mood Patterns */}
                            <BlueprintCard>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3">Mood Patterns</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {BP.hormones.moodPatterns.map((m: string) => (
                                        <span key={m} className="px-2.5 py-1 bg-rove-charcoal/5 rounded-full text-xs font-medium text-rove-charcoal">{m}</span>
                                    ))}
                                </div>
                            </BlueprintCard>

                            {/* Affirmation */}
                            <BlueprintCard className={cn("border-l-4", BP.core.color.replace("bg-", "border-l-"))}>
                                <p className="text-rove-charcoal italic text-base font-heading leading-relaxed">
                                    "{BP.affirmation}"
                                </p>
                            </BlueprintCard>

                            {/* Self-Care */}
                            <BlueprintCard className="bg-purple-50/50 border-purple-100">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-3 flex items-center gap-1.5">
                                    <Heart className="w-3 h-3" /> Self-Care Tips
                                </h4>
                                <ul className="space-y-2">
                                    {BP.selfCareTips.slice(0, 4).map((tip: string) => (
                                        <li key={tip} className="flex items-start gap-2 text-xs text-rove-charcoal">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />{tip}
                                        </li>
                                    ))}
                                </ul>
                            </BlueprintCard>
                        </motion.div>
                    )}

                    {/* NUTRITION TAB */}
                    {activeTab === 'nutrition' && (
                        <motion.div
                            key="nutrition"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            {/* Ayurvedic Tip */}
                            <BlueprintCard className={cn("border-l-4", BP.core.color.replace("bg-", "border-l-"))}>
                                <div className="flex items-start gap-2">
                                    <Flower2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-rove-charcoal text-xs mb-1">Ayurvedic Wisdom</h4>
                                        <p className="text-xs text-rove-stone italic leading-relaxed">{BP.diet.ayurvedicTip}</p>
                                    </div>
                                </div>
                            </BlueprintCard>

                            {/* Core Needs */}
                            <section>
                                <SectionHeader title="Focus On" icon={Utensils} />
                                <div className="grid grid-cols-2 gap-2">
                                    {BP.diet.coreNeeds.map((n: any) => {
                                        const NeedIcon = getDietIcon(n.icon);
                                        return (
                                            <BlueprintCard key={n.id} className="p-3 flex items-center gap-2.5">
                                                <div className="p-1.5 bg-rove-green/10 text-rove-green rounded-lg"><NeedIcon className="w-4 h-4" /></div>
                                                <div>
                                                    <div className="font-heading text-rove-charcoal text-xs">{n.title}</div>
                                                    <div className="text-[9px] text-rove-stone">{n.description}</div>
                                                </div>
                                            </BlueprintCard>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Meals */}
                            <section>
                                <SectionHeader title="Indian Meal Plan" icon={Soup} />
                                <div className="space-y-3">
                                    {BP.diet.meals.map((meal: any, i: number) => {
                                        const MealIcon = iconMap[meal.icon] || Sun;
                                        return (
                                            <BlueprintCard key={i} className="p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 bg-rove-cream rounded-lg"><MealIcon className="w-3.5 h-3.5 text-rove-charcoal" /></div>
                                                    <div className="flex-1">
                                                        <span className="font-heading text-rove-charcoal text-sm">{meal.title}</span>
                                                        <span className="text-[9px] text-rove-stone bg-rove-stone/5 px-1.5 py-0.5 rounded ml-2">{meal.time}</span>
                                                    </div>
                                                </div>
                                                <ul className="text-xs text-rove-stone space-y-1 ml-8">
                                                    {meal.items.slice(0, 4).map((item: string) => (
                                                        <li key={item} className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-rove-green rounded-full" />{item}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {meal.tip && (
                                                    <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2 ml-8">
                                                        💡 {meal.tip}
                                                    </p>
                                                )}
                                            </BlueprintCard>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Superfoods & Avoid */}
                            <div className="grid grid-cols-2 gap-3">
                                <BlueprintCard className="bg-rove-green/5 border-rove-green/10 p-3">
                                    <h4 className="text-[9px] font-bold uppercase text-rove-green mb-2 flex items-center gap-1">
                                        <Heart className="w-3 h-3" /> Eat
                                    </h4>
                                    <ul className="space-y-1">
                                        {BP.diet.superfoods.slice(0, 5).map((item: string) => (
                                            <li key={item} className="text-[10px] text-rove-charcoal flex items-start gap-1.5">
                                                <CheckCircle2 className="w-3 h-3 text-rove-green flex-shrink-0 mt-0.5" />
                                                <span className="line-clamp-1">{item.split(' - ')[0]}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </BlueprintCard>

                                <BlueprintCard className="bg-red-50/50 border-red-100 p-3">
                                    <h4 className="text-[9px] font-bold uppercase text-red-500 mb-2 flex items-center gap-1">
                                        <Ban className="w-3 h-3" /> Avoid
                                    </h4>
                                    <ul className="space-y-1">
                                        {BP.diet.avoid.slice(0, 5).map((item: string) => (
                                            <li key={item} className="text-[10px] text-rove-charcoal flex items-start gap-1.5">
                                                <div className="w-1 h-1 bg-red-300 rounded-full flex-shrink-0 mt-1.5" />
                                                <span className="line-clamp-1">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </BlueprintCard>
                            </div>

                            {/* Supplements */}
                            <section>
                                <SectionHeader title="Supplements" icon={Pill} />
                                <div className="grid grid-cols-2 gap-2">
                                    {BP.supplements.slice(0, 4).map((s: any) => (
                                        <BlueprintCard key={s.name} className="p-3">
                                            <div className="font-heading text-rove-charcoal text-xs mb-0.5">{s.name}</div>
                                            <div className="text-[9px] text-rove-stone bg-rove-charcoal/5 px-1.5 py-0.5 rounded inline-block mb-1">{s.dose}</div>
                                            <div className="text-[9px] text-rove-stone line-clamp-2">{s.reason}</div>
                                        </BlueprintCard>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* MOVEMENT TAB */}
                    {activeTab === 'movement' && (
                        <motion.div
                            key="movement"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            {/* Philosophy */}
                            <BlueprintCard className={cn("border-l-4", BP.core.color.replace("bg-", "border-l-"))}>
                                <p className="text-rove-charcoal italic text-sm font-heading leading-relaxed">{BP.exercise.summary}</p>
                            </BlueprintCard>

                            {/* Recommended */}
                            <section>
                                <SectionHeader title="Recommended" icon={Dumbbell} />
                                <div className="space-y-2">
                                    {BP.exercise.recommended.map((ex: any, i: number) => (
                                        <BlueprintCard key={i} className="p-3">
                                            <div className="flex items-start gap-3">
                                                <div className="text-xl opacity-10 font-heading text-rove-charcoal">0{i + 1}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-sm text-rove-charcoal">{ex.title}</h4>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[8px] h-4",
                                                            ex.intensity === "Low" && "border-green-300 text-green-600",
                                                            ex.intensity === "Moderate" && "border-amber-300 text-amber-600",
                                                            ex.intensity === "High" && "border-red-300 text-red-600"
                                                        )}>{ex.intensity}</Badge>
                                                        <span className="text-[9px] text-rove-stone">{ex.duration}</span>
                                                    </div>
                                                    <p className="text-xs text-rove-stone">{ex.description}</p>
                                                </div>
                                            </div>
                                        </BlueprintCard>
                                    ))}
                                </div>
                            </section>

                            {/* Yoga */}
                            <div className="grid grid-cols-2 gap-3">
                                <BlueprintCard className="p-3">
                                    <h4 className="text-[9px] font-bold uppercase text-rove-charcoal mb-2 flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> Yoga
                                    </h4>
                                    <ul className="space-y-1">
                                        {BP.exercise.yoga.asanas.slice(0, 4).map((a: string) => (
                                            <li key={a} className="text-[10px] text-rove-stone flex items-start gap-1.5">
                                                <div className="w-1 h-1 bg-rove-charcoal rounded-full flex-shrink-0 mt-1.5" />
                                                <span className="line-clamp-1">{a}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </BlueprintCard>

                                <BlueprintCard className="p-3">
                                    <h4 className="text-[9px] font-bold uppercase text-rove-charcoal mb-2 flex items-center gap-1">
                                        <Wind className="w-3 h-3" /> Breathwork
                                    </h4>
                                    <ul className="space-y-1">
                                        {BP.exercise.yoga.pranayama.map((p: string) => (
                                            <li key={p} className="text-[10px] text-rove-stone flex items-start gap-1.5">
                                                <div className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />
                                                <span className="line-clamp-1">{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </BlueprintCard>
                            </div>

                            {/* Avoid */}
                            <BlueprintCard className="bg-gray-50 border-gray-200 p-3">
                                <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-2 flex items-center gap-1">
                                    <Ban className="w-3 h-3" /> Skip These
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {BP.exercise.avoid.map((item: string) => (
                                        <span key={item} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] text-gray-500 line-through">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">{BP.exercise.restDays}</p>
                            </BlueprintCard>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
