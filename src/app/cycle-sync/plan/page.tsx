"use client";

import { useEffect, useState, useRef } from "react";
import { fetchCycleIntelligence } from "@/app/actions/cycle-sync";
import { motion, animate, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
    Activity, ArrowRight, Battery, Brain, CheckCircle2,
    Flame, Info, Leaf, Pill, Sparkles, Utensils, Waves, Beaker,
    Moon, Zap, Move, Music, Wind, Bike, Fish, Carrot, Wheat, Drumstick, Footprints, Heart, Coffee, Soup,
    Shield, Droplets, AlertCircle, Sun, Sunrise, Sunset, Ban, LayoutGrid, Dumbbell
} from "lucide-react";

// --- Data: Menstrual Blueprint ---
const MENSTRUAL_BLUEPRINT = {
    hormones: {
        title: "Hormones Now",
        summary: "Estrogen & progesterone are lowest.",
        desc: "Your body is shedding & renewing. Treat this phase like your 'inner winter'.",
        symptoms: ["Energy Dips", "Cramps", "Mood Sensitivity", "Inflammation"]
    },
    diet: {
        core_needs: [
            { id: "iron", title: "Iron-Rich", desc: "Restore blood loss", icon: Droplets },
            { id: "magnesium", title: "Magnesium", desc: "Reduce cramps", icon: Sparkles },
            { id: "omega", title: "Omega-3", desc: "Reduce pain", icon: Fish },
            { id: "warm", title: "Warm Foods", desc: "Support digestion", icon: Soup }
        ],
        ideal_meals: [
            { time: "Morning", title: "Warm & Grounding", items: ["Jeera-ajwain warm water", "Moong dal / Veg poha", "Ragi porridge w/ jaggery", "Ginger/Tulsi tea"], icon: Sunrise },
            { time: "Lunch", title: "Iron & Mineral Rich", items: ["Moong dal khichdi w/ ghee", "Spinach/Methi dal", "Brown rice / Soft phulkas", "Beet-carrot salad"], icon: Sun },
            { time: "Snack", title: "Magnesium Boost", items: ["Roasted makhana", "Walnuts + Fruit", "Turmeric latte"], icon: Coffee },
            { time: "Dinner", title: "Light & Soothing", items: ["Veg daliya / thin dal soup", "Palak tofu / Bottle gourd", "Steamed sweet potato"], icon: Moon }
        ],
        cramp_relief: ["Ginger & Turmeric", "Sesame Seeds", "Bananas", "Jaggery", "Miso / Soups"],
        avoid: ["Cold foods (smoothies)", "Fried foods", "Excess caffeine", "Refined sugar"]
    },
    exercise: {
        summary: "Low-intensity restorative movement improves wellbeing without stressing the system.",
        best: [
            { title: "Gentle Yoga", desc: "Child’s pose, Cat-cow, Butterfly", time: "10–20 mins" },
            { title: "Walking", desc: "Soft, slow walks for blood flow", time: "20–30 mins" },
            { title: "Breathwork", desc: "Deep belly breathing", time: "5 mins" },
            { title: "Stretching", desc: "Heaps, lower back, hamstrings", time: "10 mins" }
        ],
        avoid: ["HIIT", "Running", "Heavy Strength", "Intense Core"]
    },
    supplements: [
        { name: "Magnesium Glycinate", dose: "200–350 mg", why: "Reduce cramps & sleep" },
        { name: "Iron", dose: "Low dose", why: "Restore blood loss" },
        { name: "Vitamin C", dose: "With iron", why: "Absorption" },
        { name: "B12", dose: "Daily", why: "Energy support" }
    ],
    daily_flow: [
        { time: "Morning", activity: "Warm ginger water → Light breakfast → Yoga" },
        { time: "Afternoon", activity: "Khichdi + Greens → 15min Walk" },
        { time: "Evening", activity: "Warm snack → Stretching" },
        { time: "Night", activity: "Light soup → Magnesium → Early sleep" }
    ]
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
        <div className="relative p-6 rounded-[2.5rem] bg-white shadow-xl shadow-rove-charcoal/5 overflow-hidden border border-rove-stone/10 h-full">
            <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                        <motion.circle
                            cx="50" cy="50" r="46" fill="none" stroke="#2F363F" strokeWidth="4" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                        />
                    </svg>
                    <div className="text-center">
                        <div className="text-3xl font-heading text-rove-charcoal"><Counter from={0} to={calories} /></div>
                        <span className="text-[10px] uppercase tracking-widest text-rove-stone">KCAL</span>
                    </div>
                </div>
                <div className="flex-1 w-full space-y-4">
                    <h3 className="font-heading text-lg text-rove-charcoal">Daily Nutrition Target</h3>
                    {[
                        { label: "Protein", val: macros.protein.g, color: "bg-rove-red", width: macros.protein.pct },
                        { label: "Healthy Fats", val: macros.fats.g, color: "bg-amber-400", width: macros.fats.pct },
                        { label: "Carbs", val: macros.carbs.g, color: "bg-rove-green", width: macros.carbs.pct },
                    ].map((m) => (
                        <div key={m.label} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold uppercase text-rove-charcoal/70">
                                <span>{m.label}</span>
                                <span>{m.val}g</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${m.width}%` }} className={`h-full rounded-full ${m.color}`} />
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-rove-stone italic">"{biometrics.reason}"</p>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, icon: Icon }: { title: string, icon: any }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rove-charcoal rounded-full text-white"><Icon className="w-5 h-5" /></div>
            <h2 className="text-2xl font-heading text-rove-charcoal">{title}</h2>
        </div>
    );
}

function BlueprintCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-rove-stone/10 shadow-sm transition-all", className)}>{children}</div>;
}

function SnowIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="12" y2="12" /><line x1="12" x2="12" y1="2" y2="22" /><path d="m20 16-4-4 4-4" /><path d="m4 8 4 4-4 4" /><path d="m16 4-4 4-4-4" /><path d="m8 20 4-4 4 4" /></svg>
    )
}

export default function DetailedPlanPage() {
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'movement'>('overview');

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

    return (
        <div className="min-h-screen bg-rove-cream/20 pt-24 pb-24 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-rove-charcoal text-white px-3 py-1">Day 1–5</Badge>
                        <span className="text-sm font-bold uppercase tracking-widest text-rove-stone">Menstrual Phase</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-heading text-rove-charcoal leading-tight">
                        Your Complete Blueprint
                    </h1>
                </header>

                {/* Tabs */}
                <div className="bg-white/50 p-1.5 rounded-full flex gap-1 backdrop-blur-sm border border-rove-stone/5 sticky top-20 z-20 shadow-sm">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutGrid },
                        { id: 'nutrition', label: 'Nutrition', icon: Utensils },
                        { id: 'movement', label: 'Movement', icon: Dumbbell }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all",
                                    isActive ? "bg-rove-charcoal text-white shadow-md" : "text-rove-stone hover:bg-white/50"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden md:inline">{tab.label}</span>
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
                            className="space-y-6"
                        >
                            <MacroVisualizer nutrition={data.nutrition} biometrics={data.biometrics} />

                            {/* Hormones Card */}
                            <BlueprintCard className="bg-gradient-to-br from-rove-charcoal to-gray-900 text-white border-none py-8">
                                <div className="flex items-start gap-5">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                        <SnowIcon className="w-8 h-8 text-rove-cream" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-rove-cream/60 mb-2">Hormone Status</div>
                                        <h3 className="text-2xl font-heading mb-2">{MENSTRUAL_BLUEPRINT.hormones.title}</h3>
                                        <p className="text-rove-cream/80 leading-relaxed mb-4">{MENSTRUAL_BLUEPRINT.hormones.desc}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {MENSTRUAL_BLUEPRINT.hormones.symptoms.map(s => (
                                                <span key={s} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </BlueprintCard>

                            {/* Daily Flow Preview */}
                            <div>
                                <h3 className="text-lg font-heading text-rove-charcoal mb-4 ml-2">Today's Flow</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {MENSTRUAL_BLUEPRINT.daily_flow.map(d => (
                                        <div key={d.time} className="p-4 rounded-xl bg-white border border-rove-stone/10">
                                            <div className="text-[10px] font-bold uppercase text-rove-stone mb-1">{d.time}</div>
                                            <div className="text-xs font-medium text-rove-charcoal">{d.activity.split('→')[0]}...</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* NUTRITION TAB */}
                    {activeTab === 'nutrition' && (
                        <motion.div
                            key="nutrition"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Diet Architecture */}
                            <section>
                                <SectionHeader title="Dietary Architecture" icon={Utensils} />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    {MENSTRUAL_BLUEPRINT.diet.core_needs.map(n => (
                                        <BlueprintCard key={n.id} className="p-4 flex flex-col items-center text-center gap-2 hover:shadow-md h-full">
                                            <div className="p-2 bg-rove-green/10 text-rove-green rounded-full mb-1"><n.icon className="w-5 h-5" /></div>
                                            <div className="font-heading text-rove-charcoal text-sm">{n.title}</div>
                                            <div className="text-[10px] text-rove-stone uppercase tracking-wide opacity-80">{n.desc}</div>
                                        </BlueprintCard>
                                    ))}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-lg font-heading text-rove-charcoal ml-1">Ideal Indian Meals</h3>
                                    {MENSTRUAL_BLUEPRINT.diet.ideal_meals.map((meal, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-rove-stone/10 hover:border-rove-charcoal/20 transition-colors">
                                            <div className="flex flex-col items-center">
                                                <div className="p-2 bg-rove-cream rounded-full"><meal.icon className="w-5 h-5 text-rove-charcoal" /></div>
                                                <div className="h-full w-px bg-rove-stone/20 mt-2" />
                                            </div>
                                            <div className="pb-2 w-full">
                                                <div className="flex items-baseline justify-between mb-2">
                                                    <span className="text-sm font-heading text-rove-charcoal text-lg">{meal.title}</span>
                                                    <h4 className="font-bold text-xs uppercase tracking-wide text-rove-stone bg-rove-stone/5 px-2 py-1 rounded-md">{meal.time}</h4>
                                                </div>
                                                <ul className="text-sm text-rove-stone space-y-2">
                                                    {meal.items.map(item => <li key={item} className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rove-green rounded-full flex-shrink-0" />{item}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <BlueprintCard className="bg-rove-green/5 border-rove-green/10">
                                        <div className="flex items-center gap-2 mb-4 text-rove-green font-bold uppercase text-xs tracking-widest">
                                            <Heart className="w-4 h-4" /> Relief & Support
                                        </div>
                                        <ul className="space-y-3">
                                            {MENSTRUAL_BLUEPRINT.diet.cramp_relief.map(item => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-rove-charcoal">
                                                    <CheckCircle2 className="w-4 h-4 text-rove-green flex-shrink-0" /> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </BlueprintCard>

                                    <BlueprintCard className="bg-red-50/50 border-red-100">
                                        <div className="flex items-center gap-2 mb-4 text-red-500 font-bold uppercase text-xs tracking-widest">
                                            <Ban className="w-4 h-4" /> Avoid Now
                                        </div>
                                        <ul className="space-y-3">
                                            {MENSTRUAL_BLUEPRINT.diet.avoid.map(item => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-rove-charcoal">
                                                    <div className="w-1.5 h-1.5 bg-red-300 rounded-full flex-shrink-0" /> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </BlueprintCard>
                                </div>
                            </section>

                            <section>
                                <SectionHeader title="Supplement Specs" icon={Pill} />
                                <div className="grid grid-cols-2 gap-4">
                                    {MENSTRUAL_BLUEPRINT.supplements.map(s => (
                                        <BlueprintCard key={s.name} className="p-4 text-center">
                                            <div className="font-heading text-rove-charcoal text-sm md:text-lg mb-1">{s.name}</div>
                                            <div className="text-[10px] md:text-xs bg-rove-charcoal/5 px-2 py-1 rounded-full inline-block mb-2 font-bold text-rove-stone">{s.dose}</div>
                                            <div className="text-xs text-rove-stone/80 leading-tight">{s.why}</div>
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
                            className="space-y-8"
                        >
                            <section>
                                <SectionHeader title="Movement Plan" icon={Activity} />
                                <BlueprintCard className="mb-8 border-l-4 border-l-rove-charcoal">
                                    <p className="text-rove-charcoal italic text-lg font-heading leading-relaxed">"{MENSTRUAL_BLUEPRINT.exercise.summary}"</p>
                                </BlueprintCard>

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-lg font-heading text-rove-charcoal ml-1">Best Practices</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {MENSTRUAL_BLUEPRINT.exercise.best.map((ex, i) => (
                                            <div key={i} className="p-5 rounded-2xl bg-white border border-rove-stone/10 flex gap-5 items-start shadow-sm hover:shadow-md transition-all">
                                                <div className="text-3xl opacity-10 font-heading text-rove-charcoal">0{i + 1}</div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-rove-charcoal mb-1">{ex.title}</h4>
                                                    <Badge variant="outline" className="text-[10px] mb-2">{ex.time}</Badge>
                                                    <p className="text-sm text-rove-stone leading-relaxed">{ex.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <BlueprintCard className="bg-gray-50 border-gray-200">
                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                        <Ban className="w-4 h-4" /> Avoid High Intensity
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {MENSTRUAL_BLUEPRINT.exercise.avoid.map(item => (
                                            <span key={item} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm line-through decoration-gray-400">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 max-w-md">
                                        Your body’s metabolism and energy output are naturally lower; pushing too hard raises inflammation and worsens cramps.
                                    </p>
                                </BlueprintCard>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
