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

function MacroVisualizer({ nutrition, biometrics }: { nutrition: any, biometrics: any }) {
    const { macros, calories } = nutrition;
    return (
        <div className="relative h-full">
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
            <div className="p-2 bg-white/50 text-rove-charcoal rounded-full shadow-sm border border-white/60"><Icon className="w-5 h-5" /></div>
            <h2 className="text-xl md:text-2xl font-heading text-rove-charcoal">{title}</h2>
        </div>
    );
}

function BlueprintCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("p-6 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm transition-all", className)}>{children}</div>;
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

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20 pb-24">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-rove-charcoal/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] bg-rove-red/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 p-4 md:p-8 space-y-6 max-w-5xl mx-auto">

                {/* Header */}
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-white/50 backdrop-blur-md text-rove-charcoal border-white/60 px-3 py-1 shadow-sm">Day {data.day || "?"}</Badge>
                        <span className="text-xs font-bold uppercase tracking-widest text-rove-stone">{phaseName} Phase</span>
                    </div>
                    <h1 className="font-heading text-3xl md:text-5xl text-rove-charcoal leading-tight">
                        Daily Blueprint
                    </h1>
                </header>

                {/* Tabs - Floating Glass Pill */}
                {/* Tabs - Floating Glass Pill */}
                <div className="flex p-1.5 bg-white/40 backdrop-blur-xl rounded-full border border-white/40 shadow-lg shadow-rove-charcoal/5 mx-auto max-w-md sticky top-4 z-50">
                    {[
                        { id: 'guide', label: 'Phase Guide', icon: Sparkles },
                        { id: 'diet', label: 'Diet', icon: Utensils },
                        { id: 'exercise', label: 'Exercise', icon: Dumbbell }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    isActive ? "bg-white text-rove-charcoal shadow-md" : "text-rove-charcoal/60 hover:bg-white/20"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">

                    {/* PHASE GUIDE TAB (Science + Rituals) */}
                    {activeTab === 'guide' && (
                        <motion.div
                            key="guide"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Hero Focus Card */}
                            <div className="p-8 rounded-[2.5rem] bg-[#1a1a1a] text-white relative overflow-hidden shadow-lg text-center">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rove-gold/10 rounded-full blur-[60px]" />
                                <Sparkles className="w-10 h-10 text-white/50 mx-auto mb-4 relative z-10" />
                                <p className="text-white/50 uppercase tracking-widest text-[10px] font-bold mb-2 relative z-10">Current Phase Focus</p>
                                <h3 className="text-4xl md:text-5xl font-heading mb-4 text-white relative z-10">
                                    {BP.rituals.focus}
                                </h3>
                                <p className="text-white/70 max-w-md mx-auto relative z-10">
                                    Align your mindset with your biology.
                                </p>
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
                                <SectionHeader title="Mind & Rituals" icon={Brain} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {BP.rituals.practices.map((practice: any, i: number) => (
                                        <div key={i} className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm flex items-center gap-4 hover:bg-white/60 transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rove-charcoal">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-heading text-lg text-rove-charcoal">{practice.title}</h4>
                                                <p className="text-sm text-rove-stone">{practice.desc}</p>
                                            </div>
                                        </div>
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

                    {/* DIET TAB (Includes Calorie Tracker) */}
                    {activeTab === 'diet' && (
                        <motion.div
                            key="diet"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Macro Visualizer (Custom Glass Card) */}
                            <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm">
                                <MacroVisualizer nutrition={data.nutrition} biometrics={data.biometrics} />
                            </div>

                            {/* Diet Architecture */}
                            <section>
                                <SectionHeader title="Dietary Architecture" icon={Utensils} />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                                    {BP.diet.core_needs.map((n: any, i: number) => {
                                        const Icon = typeof n.icon === 'string' ? dIcon(n.icon) : n.icon;
                                        return (
                                            <div key={n.id || i} className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm flex flex-col items-center text-center gap-2 hover:shadow-md aspect-square justify-center">
                                                <div className="p-2 bg-rove-green/10 text-rove-green rounded-full mb-1"><Icon className="w-5 h-5" /></div>
                                                <div className="font-heading text-rove-charcoal text-sm leading-tight">{n.title}</div>
                                                <div className="text-[9px] text-rove-stone uppercase tracking-wide opacity-80">{n.desc}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-rove-stone ml-1">Ideal Meals</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {BP.diet.ideal_meals.map((meal: any, i: number) => {
                                            const Icon = typeof meal.icon === 'string' ? dIcon(meal.icon) : meal.icon;
                                            return (
                                                <div key={i} className="flex gap-4 p-5 rounded-[1.5rem] bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
                                                    <div className="flex flex-col items-center">
                                                        <div className="p-2 bg-white rounded-full shadow-sm"><Icon className="w-5 h-5 text-rove-charcoal" /></div>
                                                        <div className="h-full w-px bg-rove-stone/10 mt-2" />
                                                    </div>
                                                    <div className="pb-1 w-full">
                                                        <div className="flex items-baseline justify-between mb-2">
                                                            <span className="font-heading text-rove-charcoal text-lg">{meal.title}</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wide text-rove-stone bg-white px-2 py-1 rounded-full border border-gray-100">{meal.time}</span>
                                                        </div>
                                                        <ul className="text-sm text-rove-stone space-y-1.5">
                                                            {meal.items.map((item: string) => <li key={item} className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rove-green rounded-full flex-shrink-0" />{item}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[1.5rem] bg-emerald-50/60 backdrop-blur-xl border border-emerald-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold uppercase text-xs tracking-widest">
                                            <Heart className="w-4 h-4" /> Relief & Support
                                        </div>
                                        <ul className="space-y-3">
                                            {BP.diet.cramp_relief.map((item: string) => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-emerald-900">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-5 rounded-[1.5rem] bg-rose-50/60 backdrop-blur-xl border border-rose-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 text-rose-700 font-bold uppercase text-xs tracking-widest">
                                            <Ban className="w-4 h-4" /> Avoid Now
                                        </div>
                                        <ul className="space-y-3">
                                            {BP.diet.avoid.map((item: string) => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-rose-900">
                                                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full flex-shrink-0" /> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <SectionHeader title="Supplement Specs" icon={Pill} />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {BP.supplements.map((s: any) => (
                                        <div key={s.name} className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm text-center flex flex-col justify-center">
                                            <div className="font-heading text-rove-charcoal text-sm md:text-base mb-1">{s.name}</div>
                                            <div className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full inline-block mx-auto mb-2 font-bold text-rove-stone">{s.dose}</div>
                                            <div className="text-[10px] text-rove-stone/80 leading-tight">{s.why}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* EXERCISE TAB */}
                    {activeTab === 'exercise' && (
                        <motion.div
                            key="exercise"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-8"
                        >
                            <section>
                                <SectionHeader title="Movement Plan" icon={Activity} />
                                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border-l-4 border-l-rove-charcoal/80 border-t border-r border-b border-white/60 shadow-sm">
                                    <p className="text-rove-charcoal italic text-lg font-heading leading-relaxed">"{BP.exercise.summary}"</p>
                                </div>

                                <div className="space-y-4 mb-8 mt-8">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-rove-stone ml-1">Best Practices</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {BP.exercise.best.map((ex: any, i: number) => (
                                            <div key={i} className="p-5 rounded-[1.5rem] bg-white/60 backdrop-blur-sm border border-white/80 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
                                                <div className="text-3xl opacity-10 font-heading text-rove-charcoal">0{i + 1}</div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-rove-charcoal mb-1">{ex.title}</h4>
                                                    <Badge variant="outline" className="text-[10px] bg-white border-gray-200 mb-2">{ex.time}</Badge>
                                                    <p className="text-sm text-rove-stone leading-relaxed">{ex.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 rounded-[1.5rem] bg-gray-50/80 border border-gray-200 backdrop-blur-sm">
                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                        <Ban className="w-4 h-4" /> Avoid High Intensity
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {BP.exercise.avoid.map((item: string) => (
                                            <span key={item} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm line-through decoration-gray-400">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 max-w-md">
                                        Listen to your body. If you feel tired, rest.
                                    </p>
                                </div>
                            </section>
                        </motion.div>
                    )}

                </AnimatePresence>

            </div>
        </div>
    );
}