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

// --- Data: Phase Blueprints ---
const BLUEPRINTS: any = {
    "Menstrual": {
        color: "bg-rove-red",
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
                { title: "Stretching", desc: "Hips, lower back, hamstrings", time: "10 mins" }
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
    },
    "Follicular": {
        color: "bg-rove-peach",
        hormones: {
            title: "Hormones Rising",
            summary: "Estrogen is rising, boosting energy.",
            desc: "Your 'inner spring'. Creativity and energy are increasing as follicles mature.",
            symptoms: ["Increasing Energy", "Better Mood", "Curiosity", "Lightness"]
        },
        diet: {
            core_needs: [
                { id: "fresh", title: "Fresh Veggies", desc: "Support liver detox", icon: Leaf },
                { id: "probiotic", title: "Probiotics", desc: "Gut health", icon: Beaker },
                { id: "protein", title: "Lean Protein", desc: "Muscle repair", icon: Drumstick },
                { id: "hydration", title: "Hydration", desc: "Support fluid balance", icon: Droplets }
            ],
            ideal_meals: [
                { time: "Morning", title: "Fresh & Light", items: ["Green smoothie", "Oats with berries", "Avocado toast", "Lemon water"], icon: Sunrise },
                { time: "Lunch", title: "Energizing Bowl", items: ["Quinoa salad", "Grilled chicken/tofu", "Kimchi/Sauerkraut", "Fresh fruits"], icon: Sun },
                { time: "Snack", title: "Crunchy & Fresh", items: ["Apple slices", "Carrot sticks + Hummus", "Pumpkin seeds"], icon: Coffee },
                { time: "Dinner", title: "Balanced", items: ["Stir-fried veggies", "Lean fish/paneer", "Wild rice"], icon: Moon }
            ],
            cramp_relief: ["Flax seeds", "Leafy greens", "Citrus fruits", "Berries", "Clean protein"],
            avoid: ["Heavy oils", "Processed snacks", "Alcohol (moderation)", "Excess dairy"]
        },
        exercise: {
            summary: "Ramp up intensity. Try new classes and build cardio endurance.",
            best: [
                { title: "Cardio / Hikes", desc: "Running, cycling, dancing", time: "30-45 mins" },
                { title: "Flow Yoga", desc: "Vinyasa, dynamic movement", time: "45 mins" },
                { title: "Strength", desc: "Light weights, resistance bands", time: "30 mins" },
                { title: "Try New Things", desc: "Boxing, Pilates, climbing", time: "Variable" }
            ],
            avoid: ["Overtraining (rest days still needed)", "Heavy lifting without warmup"]
        },
        supplements: [
            { name: "Probiotics", dose: "Daily", why: "Gut health & estrogen metabolism" },
            { name: "B-Complex", dose: "Daily", why: "Energy production" },
            { name: "Zinc", dose: "15-30mg", why: "Follicle health" },
            { name: "Vitamin E", dose: "Daily", why: "Skin & inflammation" }
        ],
        daily_flow: [
            { time: "Morning", activity: "Lemon water → Cardio/Run → Fresh Breakfast" },
            { time: "Afternoon", activity: "Salad/Grain Bowl → Creative Work" },
            { time: "Evening", activity: "Socializing → Light Dinner" },
            { time: "Night", activity: "Reading → Planning tomorrow" }
        ]
    },
    "Ovulatory": {
        color: "bg-rove-charcoal",
        hormones: {
            title: "Peak Hormones",
            summary: "Estrogen at peak, testosterone surge.",
            desc: "Your 'inner summer'. You are magnetic, verbal, and energetic.",
            symptoms: ["Peak Energy", "High Libido", "Confidence", "Social Buzz"]
        },
        diet: {
            core_needs: [
                { id: "fiber", title: "Fiber", desc: "Bind excess estrogen", icon: Wheat },
                { id: "antiox", title: "Antioxidants", desc: "Cell protection", icon: Shield },
                { id: "cruciferous", title: "Cruciferous", desc: "Detox support", icon: Leaf },
                { id: "cooling", title: "Cooling Foods", desc: "Balance body heat", icon: Wind }
            ],
            ideal_meals: [
                { time: "Morning", title: "Fiber Start", items: ["Chia pudding", "Fruit salad", "Smoothie bowl", "Cool water"], icon: Sunrise },
                { time: "Lunch", title: "Raw & Fresh", items: ["Huge raw salad", "Sprouts", "Lentils", "Cucumber juice"], icon: Sun },
                { time: "Snack", title: "Energy", items: ["Almonds", "Dark chocolate", "Berries"], icon: Coffee },
                { time: "Dinner", title: "Light Fiber", items: ["Steamed broccoli", "Fish/Tofu", "Quinoa"], icon: Moon }
            ],
            cramp_relief: ["Raw carrots", "Brussels sprouts", "Berries", "Turmeric", "Green tea"],
            avoid: ["Heavy carbs", "Red meat (limit)", "Excess heat/spice", "Alcohol"]
        },
        exercise: {
            summary: "Peak performance. Go for your PRs and high-intensity workouts.",
            best: [
                { title: "HIIT", desc: "Sprints, intervals, bootcamps", time: "20-30 mins" },
                { title: "Spin Class", desc: "High energy cardio", time: "45 mins" },
                { title: "Heavy Lifting", desc: "Max strength output", time: "45 mins" },
                { title: "Group Sports", desc: "Social & active", time: "Variable" }
            ],
            avoid: ["Overheating without hydration", "Sleep deprivation"]
        },
        supplements: [
            { name: "NAC", dose: "600mg", why: "Liver support (estrogen detox)" },
            { name: "Glutathione", dose: "Optional", why: "Antioxidant support" },
            { name: "Magnesium", dose: "Daily", why: "Recovery" },
            { name: "Zinc", dose: "Daily", why: "Immunity" }
        ],
        daily_flow: [
            { time: "Morning", activity: "HIIT Workout → High Fiber Breakfast" },
            { time: "Afternoon", activity: "Raw Lunch → Important Meetings" },
            { time: "Evening", activity: "Social Event / Date Night" },
            { time: "Night", activity: "Wind down routine → Sleep mask" }
        ]
    },
    "Luteal": {
        color: "bg-amber-500",
        hormones: {
            title: "Progesterone Rise",
            summary: "Progesterone rises, then drops.",
            desc: "Your 'inner autumn'. Winding down, focusing on completion and detail.",
            symptoms: ["PMS Possible", "Bloating", "Cravings", "Introversion"]
        },
        diet: {
            core_needs: [
                { id: "complex_carbs", title: "Complex Carbs", desc: "Mood stability", icon: Wheat },
                { id: "b6", title: "Vitamin B6", desc: "Reduce PMS", icon: Pill },
                { id: "magnesium", title: "Magnesium", desc: "Relaxation", icon: Sparkles },
                { id: "fiber", title: "Fiber", desc: "Prevent bloating", icon: Leaf }
            ],
            ideal_meals: [
                { time: "Morning", title: "Stable Cabs", items: ["Oatmeal w/ seeds", "Sweet potato hash", "Avocado toast", "Herbal tea"], icon: Sunrise },
                { time: "Lunch", title: "Grain Bowl", items: ["Brown rice + Beans", "Roasted root veggies", "Chickpea curry", "Soup"], icon: Sun },
                { time: "Snack", title: "Cravings Fix", items: ["Dark chocolate", "Apple + Nut butter", "Roasted chickpeas"], icon: Coffee },
                { time: "Dinner", title: "Comforting", items: ["Baked potato", "Turkey/Tofu stir fry", "Warm golden milk"], icon: Moon }
            ],
            cramp_relief: ["Sweet potato", "Dark chocolate (>70%)", "Walnuts", "Sunflower seeds", "Chickpeas"],
            avoid: ["Excess salt", "Refined sugar", "Alcohol", "Caffeine (increases anxiety)"]
        },
        exercise: {
            summary: "Scale back intensity. Focus on strength maintenance and steady state cardio.",
            best: [
                { title: "Pilates", desc: "Core control, stability", time: "30-40 mins" },
                { title: "Strength", desc: "Moderate weights, lower reps", time: "30 mins" },
                { title: "Hiking/Walking", desc: "Nature, steady pace", time: "45 mins" },
                { title: "Yin/Restorative", desc: "Late luteal phase", time: "20 mins" }
            ],
            avoid: ["Heavy HIIT (late phase)", "Jumping/Plyometrics", "Overexertion"]
        },
        supplements: [
            { name: "Vitamin B6", dose: "50-100mg", why: "Mood & PMS" },
            { name: "Magnesium", dose: "300mg+", why: "Bloating & Anxiety" },
            { name: "Omega-3", dose: "Daily", why: "Inflammation" },
            { name: "Ashwagandha", dose: "Optional", why: "Stress reduction" }
        ],
        daily_flow: [
            { time: "Morning", activity: "Gentle stretch → Complex Carb Breakfast" },
            { time: "Afternoon", activity: "Focus Work → Roasted Snack" },
            { time: "Evening", activity: "Pilates/Strength → Warm Dinner" },
            { time: "Night", activity: "Journaling → Tea → Early Bed" }
        ]
    }
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

// --- Icon Mapping for AI Data ---
const ICON_MAP: any = {
    "Droplets": Droplets, "Sparkles": Sparkles, "Fish": Fish, "Soup": Soup, "Sunrise": Sunrise, "Sun": Sun,
    "Coffee": Coffee, "Moon": Moon, "Leaf": Leaf, "Beaker": Beaker, "Drumstick": Drumstick, "Wind": Wind,
    "Wheat": Wheat, "Shield": Shield, "Carrot": Carrot, "Zap": Zap, "Bike": Bike, "Pill": Pill,
    "Activity": Activity, "Dumbbell": Dumbbell, "Utensils": Utensils
};

const dIcon = (name: string) => ICON_MAP[name] || Sparkles;

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

    // Select Blueprint: Prioritize AI Blueprint, else use Static Fallback
    const phaseName = data.phase || "Menstrual";
    const BP = data.blueprint || BLUEPRINTS[phaseName] || BLUEPRINTS["Menstrual"];

    return (
        <div className="min-h-screen bg-rove-cream/20 pt-24 pb-24 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-rove-charcoal text-white px-3 py-1">Day {data.day || "?"}</Badge>
                        <span className="text-sm font-bold uppercase tracking-widest text-rove-stone">{phaseName} Phase</span>
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
                                        <h3 className="text-2xl font-heading mb-2">{BP.hormones.title}</h3>
                                        <p className="text-rove-cream/80 leading-relaxed mb-4">{BP.hormones.desc}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {BP.hormones.symptoms.map((s: string) => (
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
                                    {BP.daily_flow.map((d: any) => (
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
                                    {BP.diet.core_needs.map((n: any) => {
                                        const Icon = typeof n.icon === 'string' ? dIcon(n.icon) : n.icon;
                                        return (
                                            <BlueprintCard key={n.id} className="p-4 flex flex-col items-center text-center gap-2 hover:shadow-md h-full">
                                                <div className="p-2 bg-rove-green/10 text-rove-green rounded-full mb-1"><Icon className="w-5 h-5" /></div>
                                                <div className="font-heading text-rove-charcoal text-sm">{n.title}</div>
                                                <div className="text-[10px] text-rove-stone uppercase tracking-wide opacity-80">{n.desc}</div>
                                            </BlueprintCard>
                                        );
                                    })}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-lg font-heading text-rove-charcoal ml-1">Ideal Meals</h3>
                                    {BP.diet.ideal_meals.map((meal: any, i: number) => {
                                        const Icon = typeof meal.icon === 'string' ? dIcon(meal.icon) : meal.icon;
                                        return (
                                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-rove-stone/10 hover:border-rove-charcoal/20 transition-colors">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-2 bg-rove-cream rounded-full"><Icon className="w-5 h-5 text-rove-charcoal" /></div>
                                                    <div className="h-full w-px bg-rove-stone/20 mt-2" />
                                                </div>
                                                <div className="pb-2 w-full">
                                                    <div className="flex items-baseline justify-between mb-2">
                                                        <span className="text-sm font-heading text-rove-charcoal text-lg">{meal.title}</span>
                                                        <h4 className="font-bold text-xs uppercase tracking-wide text-rove-stone bg-rove-stone/5 px-2 py-1 rounded-md">{meal.time}</h4>
                                                    </div>
                                                    <ul className="text-sm text-rove-stone space-y-2">
                                                        {meal.items.map((item: string) => <li key={item} className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rove-green rounded-full flex-shrink-0" />{item}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <BlueprintCard className="bg-rove-green/5 border-rove-green/10">
                                        <div className="flex items-center gap-2 mb-4 text-rove-green font-bold uppercase text-xs tracking-widest">
                                            <Heart className="w-4 h-4" /> Relief & Support
                                        </div>
                                        <ul className="space-y-3">
                                            {BP.diet.cramp_relief.map((item: string) => (
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
                                            {BP.diet.avoid.map((item: string) => (
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
                                    {BP.supplements.map((s: any) => (
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
                                    <p className="text-rove-charcoal italic text-lg font-heading leading-relaxed">"{BP.exercise.summary}"</p>
                                </BlueprintCard>

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-lg font-heading text-rove-charcoal ml-1">Best Practices</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {BP.exercise.best.map((ex: any, i: number) => (
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
                                        {BP.exercise.avoid.map((item: string) => (
                                            <span key={item} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm line-through decoration-gray-400">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 max-w-md">
                                        Listen to your body. If you feel tired, rest.
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
