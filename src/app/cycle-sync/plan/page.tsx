"use client";

import { useEffect, useState, useRef } from "react";
import { fetchCycleIntelligence } from "@/app/actions/cycle-sync";
import { motion, animate, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
    Activity, ArrowRight, Battery, Brain, CheckCircle2,
    Flame, Info, Leaf, Pill, Sparkles, Utensils, Waves, Beaker,
    Moon, Zap, Move, Music, Wind, Bike, Fish, Carrot, Wheat, Drumstick, Footprints, Heart, Coffee, Soup,
    Shield, Droplets, AlertCircle, Sun, Sunrise, Sunset, Ban, LayoutGrid, Dumbbell, ChevronLeft
} from "lucide-react";
import { DIET_RECOMMENDATIONS, DietType } from "@/data/diet-recommendations";

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
        rituals: {
            focus: "Inner Winter",
            practices: [
                { title: "Journaling", desc: "Reflect on the past month", icon: "Book" },
                { title: "Yoga Nidra", desc: "Deep conscious rest", icon: "Moon" },
                { title: "Salt Bath", desc: "Magnesium absoption & relaxation", icon: "Waves" },
                { title: "Phone Detox", desc: "Reduce sensory input", icon: "Ban" }
            ],
            symptom_relief: [
                { symptom: "Cramps", remedy: "Castor Oil Pack" },
                { symptom: "Fatigue", remedy: "Legs Up The Wall" }
            ]
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
        rituals: {
            focus: "Inner Spring",
            practices: [
                { title: "Vision Boarding", desc: "Plan your month ahead", icon: "Sun" },
                { title: "Morning Pages", desc: "Brain dump ideas", icon: "Book" },
                { title: "Social Planning", desc: "Book friend dates", icon: "Users" },
                { title: "Learn Skill", desc: "Try something new", icon: "Brain" }
            ],
            symptom_relief: [
                { symptom: "Restlessness", remedy: "Dancing/Shaking" },
                { symptom: "Overthinking", remedy: "Brain Dump Journaling" }
            ]
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
        rituals: {
            focus: "Inner Summer",
            practices: [
                { title: "Community", desc: "Host a gathering", icon: "Users" },
                { title: "Gratitude", desc: "Express appreciation", icon: "Heart" },
                { title: "Date Night", desc: "Romantic or self-date", icon: "Sparkles" },
                { title: "Public Speaking", desc: "Pitch ideas now", icon: "Mic" }
            ],
            symptom_relief: [
                { symptom: "Overstimulation", remedy: "Dim Lighting" },
                { symptom: "Skin Breakout", remedy: "Ice Roller" }
            ]
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
        rituals: {
            focus: "Inner Autumn",
            practices: [
                { title: "Declutter", desc: "Organize your space", icon: "Home" },
                { title: "Boundaries", desc: "Say no to extra plans", icon: "Shield" },
                { title: "Budgeting", desc: "Review finances", icon: "FileText" },
                { title: "Self-Care", desc: "Spa night at home", icon: "Sparkles" }
            ],
            symptom_relief: [
                { symptom: "PMS", remedy: "Magnesium Spray" },
                { symptom: "Anxiety", remedy: "Box Breathing" }
            ]
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

function SectionHeader({ title, icon: Icon }: { title: string, icon: any }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/50 text-rove-charcoal rounded-full shadow-sm border border-white/60"><Icon className="w-5 h-5" /></div>
            <h2 className="font-heading text-xl text-rove-charcoal">{title}</h2>
        </div>
    );
}

function RitualCheckbox({ item, theme, index, total }: { item: any, theme: any, index: number, total: number }) {
    const [checked, setChecked] = useState(false);
    return (
        <div
            onClick={() => setChecked(!checked)}
            className={cn(
                "group flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 hover:bg-white/40",
                index !== total - 1 && "border-b border-white/40"
            )}
        >
            <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                checked
                    ? cn("border-transparent scale-110", theme.accent, "text-white shadow-sm")
                    : "border-rove-stone/30 bg-white/50 group-hover:border-rove-stone/50"
            )}>
                {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>

            <div className="flex-1 opacity-90 transition-opacity duration-300" style={{ opacity: checked ? 0.5 : 1 }}>
                <h4 className={cn(
                    "font-bold text-rove-charcoal text-sm transition-all duration-300",
                    checked && "line-through text-rove-stone"
                )}>
                    {item.title}
                </h4>
                <p className="text-xs text-rove-stone/80">{item.desc}</p>
            </div>

            <div className={cn(
                "p-2 rounded-full bg-white/40 text-rove-stone/40 opacity-0 group-hover:opacity-100 transition-all duration-300",
                checked && "opacity-0"
            )}>
                <Sparkles className="w-3 h-3" />
            </div>
        </div>
    );
}

import { PlateBuilder } from "@/components/cycle-sync/PlateBuilder";
import { RiverTrack } from "@/components/cycle-sync/RiverTrack";
import { SymptomDecoder } from "@/components/cycle-sync/diet/SymptomDecoder";
import { MacroFuelGauge } from "@/components/cycle-sync/diet/MacroFuelGauge";
import { DietCheatSheet } from "@/components/cycle-sync/diet/DietCheatSheet";
import { ExerciseBuilder } from "@/components/cycle-sync/ExerciseBuilder";

// Phase Theme Logic - Ported from Home Dashboard
const phaseThemes: Record<string, any> = {
    "Menstrual": {
        color: "text-rose-500", // Soft Rose
        blob: "bg-rose-200/20",
        orbRing: "from-rose-300 via-rose-100 to-rose-400",
        glow: "shadow-[0_0_40px_rgba(251,113,133,0.2)]", // Soft pink glow
        badge: "bg-rose-50 text-rose-600 border-rose-100",
        accent: "bg-rose-500"
    },
    "Follicular": {
        color: "text-teal-500", // Fresh Teal/Mint
        blob: "bg-teal-200/20",
        orbRing: "from-teal-300 via-teal-100 to-teal-400",
        glow: "shadow-[0_0_40px_rgba(45,212,191,0.2)]", // Fresh Mint glow
        badge: "bg-teal-50 text-teal-600 border-teal-100",
        accent: "bg-teal-500"
    },
    "Ovulatory": {
        color: "text-amber-500", // Champagne Gold
        blob: "bg-amber-200/20",
        orbRing: "from-amber-300 via-amber-100 to-amber-400",
        glow: "shadow-[0_0_40px_rgba(251,191,36,0.2)]", // Golden glow
        badge: "bg-amber-50 text-amber-600 border-amber-100",
        accent: "bg-amber-500"
    },
    "Luteal": {
        color: "text-indigo-500", // Calming Indigo/Purple
        blob: "bg-indigo-200/20",
        orbRing: "from-indigo-300 via-indigo-100 to-indigo-400",
        glow: "shadow-[0_0_40px_rgba(129,140,248,0.2)]", // Deep calm glow
        badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
        accent: "bg-indigo-500"
    }
};

const PHASE_IMAGES: Record<string, string> = {
    "Menstrual": "/assets/phases/menstrual.jpg",
    "Follicular": "/assets/phases/follicular.jpg",
    "Ovulatory": "/assets/phases/ovulatory.jpg",
    "Luteal": "/assets/phases/luteal.jpg"
};

export default function DetailedPlanPage() {
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'guide' | 'diet' | 'exercise'>('guide');

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
    const theme = phaseThemes[phaseName] || phaseThemes["Menstrual"];
    const headerImage = PHASE_IMAGES[phaseName] || PHASE_IMAGES["Menstrual"];
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#FBFAF8]">

            {/* 1. TOP NAVIGATION (High Density) */}
            <div className="sticky top-0 z-50 bg-[#FBFAF8]/90 backdrop-blur-xl border-b border-black/5 shadow-sm">
                <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    <Link href="/cycle-sync" className="p-2 -ml-2 text-rove-stone hover:text-rove-charcoal transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex flex-col items-center">
                        <h1 className={cn("text-lg font-heading leading-none mb-0.5", theme.color)}>{phaseName}</h1>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone/60">Day {data.day} of Cycle</span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">{data.day}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-5xl">

                {/* 2. TABS (Moved Up) */}
                {/* Tabs - Floating Glass Pill */}
                <div className="flex p-1 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm mx-auto w-full max-w-md mb-6">
                    {[
                        { id: 'guide', label: 'Guide', icon: Sparkles },
                        { id: 'diet', label: 'Diet', icon: Utensils },
                        { id: 'exercise', label: 'Move', icon: Dumbbell }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    isActive ? "bg-white text-rove-charcoal shadow-sm" : "text-rove-charcoal/60 hover:bg-white/30"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">

                    {/* PHASE GUIDE TAB (Science + Rituals) */}
                    {activeTab === 'guide' && (
                        <motion.div
                            key="guide"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Slim Focus Banner */}
                            <div className={cn("p-5 rounded-2xl relative overflow-hidden shadow-sm flex items-center justify-between gap-4", BP.color)}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none" />

                                <div className="relative z-10 text-white text-left">
                                    <p className="opacity-80 uppercase tracking-widest text-[9px] font-bold mb-1">Current Focus</p>
                                    <h3 className="text-xl md:text-2xl font-heading leading-tight">
                                        {BP.rituals.focus}
                                    </h3>
                                </div>
                                <div className="relative z-10 bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/10">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Biology / Science Section */}
                            <section>
                                <SectionHeader title="The Science" icon={Beaker} />
                                <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm mb-4">
                                    <h4 className="font-heading text-xl text-rove-charcoal mb-2">{BP.hormones.title}</h4>
                                    <p className="text-sm font-bold text-rove-charcoal/80 mb-4">{BP.hormones.summary}</p>
                                    <p className="text-sm text-rove-stone leading-relaxed mb-6">"{BP.hormones.desc}"</p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {BP.hormones.symptoms.map((sym: string) => (
                                            <div key={sym} className="px-3 py-2 rounded-xl bg-white/50 border border-white/60 text-xs font-bold text-rove-charcoal/70 text-center shadow-sm">
                                                {sym}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section>
                                <SectionHeader title="Daily Rituals" icon={CheckCircle2} />
                                <div className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm overflow-hidden p-1">
                                    {BP.rituals.practices.map((practice: any, i: number) => (
                                        <RitualCheckbox
                                            key={i}
                                            item={practice}
                                            theme={theme}
                                            index={i}
                                            total={BP.rituals.practices.length}
                                        />
                                    ))}
                                </div>
                            </section>

                            <div className="mt-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-rove-stone ml-1 mb-4">Symptom Soothers</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {BP.rituals.symptom_relief.map((item: any, i: number) => (
                                        <div key={i} className="p-5 rounded-[1.5rem] bg-emerald-50/40 border border-emerald-100/60 backdrop-blur-xl shadow-sm">
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-800/60 mb-2">
                                                For {item.symptom}
                                            </div>
                                            <div className="text-base font-heading text-emerald-900 flex items-center gap-2">
                                                <Leaf className="w-4 h-4 text-emerald-600" />
                                                {item.remedy}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* DIET TAB (Refreshed UX) */}
                    {activeTab === 'diet' && (
                        <motion.div
                            key="diet"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-10 md:space-y-14 pb-24"
                        >
                            {/* 1. The Macro Fuel Gauge (Visual Top) */}
                            {BP.nutrition_guide?.macro_fuel && (
                                <MacroFuelGauge data={BP.nutrition_guide.macro_fuel} theme={theme} />
                            )}

                            {/* 2. Recommended Fuel (River Flow - Aggregated) */}
                            <section>
                                <SectionHeader title="Recommended Fuel" icon={Utensils} />
                                <div className="space-y-3 mt-4">
                                    {(() => {
                                        // 1. Determine User Preference (Simulated - in real app, comes from user profile)
                                        // Hierarchy: non_veg > vegetarian > vegan > jain
                                        const userDietPref: DietType = 'non_veg';

                                        // 2. Aggregate Data based on hierarchy
                                        const phaseMap: Record<string, keyof typeof DIET_RECOMMENDATIONS.phases> = {
                                            "Menstrual": "menstrual", "Follicular": "follicular",
                                            "Ovulatory": "ovulatory", "Ovulation": "ovulatory", "Luteal": "luteal"
                                        };
                                        const phaseKey = phaseMap[phaseName] || "menstrual";
                                        const phaseData = DIET_RECOMMENDATIONS.phases[phaseKey]?.diet_types;

                                        if (!phaseData) return null;

                                        let categories: DietType[] = [];
                                        if (userDietPref === 'non_veg') categories = ['non_veg', 'vegetarian', 'vegan', 'jain'];
                                        else if (userDietPref === 'vegetarian') categories = ['vegetarian', 'vegan', 'jain'];
                                        else if (userDietPref === 'vegan') categories = ['vegan', 'jain'];
                                        else if (userDietPref === 'jain') categories = ['jain'];

                                        // 3. Flatten and Deduplicate
                                        const allItems = categories.flatMap(cat => phaseData[cat] || []);
                                        const seen = new Set();
                                        const uniqueItems = allItems.filter(item => {
                                            const key = item.title.trim().toLowerCase();
                                            if (seen.has(key)) return false;
                                            seen.add(key);
                                            return true;
                                        });

                                        // 4. Split for River Flow
                                        const isLarge = uniqueItems.length > 6;
                                        const chunk = Math.ceil(uniqueItems.length / 3);

                                        const row1 = uniqueItems.slice(0, chunk);
                                        const row2 = uniqueItems.slice(chunk, chunk * 2);
                                        const row3 = uniqueItems.slice(chunk * 2);

                                        return (
                                            <>
                                                <RiverTrack label="Core Nutrients" items={row1} speed={80} />
                                                <RiverTrack label="Phase Superfoods" items={row2} direction="right" speed={95} />
                                                <RiverTrack label="Replenishing" items={row3} speed={90} />
                                            </>
                                        )
                                    })()}
                                </div>
                            </section>

                            {/* 3. The Symptom Decoder (Top Carousel) */}
                            {BP.nutrition_guide?.symptom_decoder && (
                                <SymptomDecoder data={BP.nutrition_guide.symptom_decoder} theme={theme} />
                            )}

                            {/* 4. Focus vs Avoid Cheat Sheet (T-Chart) */}
                            {BP.nutrition_guide?.cheat_sheet && (
                                <DietCheatSheet data={BP.nutrition_guide.cheat_sheet} theme={theme} />
                            )}

                            {/* 5. The AI Chef (Plate Builder) */}
                            {BP.nutrition_guide?.ai_chef && (
                                <PlateBuilder phase={phaseName} data={BP.nutrition_guide.ai_chef} theme={theme} />
                            )}
                        </motion.div>
                    )}


                    {/* EXERCISE TAB */}
                    {
                        activeTab === 'exercise' && (
                            <motion.div
                                key="exercise"
                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6"
                            >
                                <section>
                                    <SectionHeader title="Movement Plan" icon={Activity} />
                                    {/* Compact Summary */}
                                    <div className="p-5 rounded-[1.5rem] bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/60 shadow-sm mb-6">
                                        <p className="text-rove-charcoal italic text-base font-heading leading-relaxed">"{BP.exercise.summary}"</p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-rove-stone ml-1">Best Practices</h3>
                                        {/* Horizontal Scroll Carousel */}
                                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
                                            {BP.exercise.best.map((ex: any, i: number) => (
                                                <div key={i} className="min-w-[260px] snap-center p-4 rounded-[1.25rem] bg-white/60 backdrop-blur-sm border border-white/80 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-base text-rove-charcoal">{ex.title}</h4>
                                                            <div className="text-2xl opacity-10 font-heading text-rove-charcoal">0{i + 1}</div>
                                                        </div>
                                                        <p className="text-xs text-rove-stone leading-relaxed mb-3 h-8 overflow-hidden line-clamp-2">{ex.desc}</p>
                                                    </div>
                                                    <Badge variant="outline" className="w-fit text-[9px] bg-white border-gray-200 self-start">{ex.time}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Compact Avoid Section */}
                                    <div className="p-4 rounded-[1.5rem] bg-gray-50/60 border border-gray-200/60 backdrop-blur-sm">
                                        <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2">
                                            <Ban className="w-3 h-3" /> Avoid High Intensity
                                        </h4>
                                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            {BP.exercise.avoid.map((item: string) => (
                                                <span key={item} className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs text-gray-500 shadow-sm opacity-80 decoration-gray-300">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* AI Exercise Builder */}
                                <ExerciseBuilder phase={phaseName} theme={theme} />
                            </motion.div>
                        )
                    }

                </AnimatePresence >

            </div>
        </div>
    );
}