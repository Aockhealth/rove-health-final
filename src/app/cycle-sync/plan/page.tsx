"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { fetchCycleIntelligenceAI } from "@/app/actions/cycle-sync";
import { savePlanSettings, fetchPlanSettings } from "./actions";
import { motion, animate, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
    Activity, ArrowRight, Battery, Brain, CheckCircle2,
    Flame, Info, Leaf, Pill, Sparkles, Utensils, Waves, Beaker,
    Moon, Zap, Move, Music, Wind, Bike, Fish, Carrot, Wheat, Drumstick, Footprints, Heart, Coffee, Soup,
    Shield, Droplets, AlertCircle, Sun, Sunrise, Sunset, Ban, LayoutGrid, Dumbbell, ChevronLeft, Ruler, Weight, Check,
    Flower2, Target, Scale
} from "lucide-react";
import { DIET_RECOMMENDATIONS, DietType } from "@/data/diet-recommendations";

// --- Custom Components ---
import { PlateBuilder } from "@/components/cycle-sync/PlateBuilder";
import { RiverTrack } from "@/components/cycle-sync/RiverTrack";
import { ExerciseBuilder } from "@/components/cycle-sync/ExerciseBuilder";
import { SymptomDecoder } from "@/components/cycle-sync/diet/SymptomDecoder";
import { MacroFuelGauge } from "@/components/cycle-sync/diet/MacroFuelGauge";
import { DietCheatSheet } from "@/components/cycle-sync/diet/DietCheatSheet";
import WeightProgressCard from "@/components/cycle-sync/WeightProgressCard";

// --- Data: Phase Blueprints (PRESERVED) ---
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

// --- Setup Constants ---
const ACTIVITY_LEVELS = [
    { id: "Sedentary", label: "Inactive", desc: "Mostly sitting, no regular exercise." },
    { id: "Active", label: "Active", desc: ">2h/week moderate or yoga." },
    { id: "Highly Active", label: "Highly Active", desc: ">5h/week or intense training." }
];

const DIET_OPTIONS = [
    { id: "Veg", label: "Vegetarian", icon: <Carrot size={24} /> },
    { id: "Non-Veg", label: "Non-Veg", icon: <Drumstick size={24} /> },
    { id: "Jain", label: "Jain", icon: <Flower2 size={24} /> },
    { id: "Vegan", label: "Vegan", icon: <Leaf size={24} /> }
];

// --- Helpers ---
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



// Phase Theme Logic - Expanded for Full UI Theming
const phaseThemes: Record<string, any> = {
    "Menstrual": {
        color: "text-rose-600",
        bannerBg: "bg-gradient-to-r from-rose-500 to-pink-600",
        cardBg: "bg-white/60",
        border: "border-rose-100",
        softBg: "bg-rose-50/30",
        pageGradient: "from-rose-50/50 via-white to-white",
        iconContainer: "bg-rose-100 text-rose-600",
        orbRing: "from-rose-300 via-rose-100 to-rose-400",
        accent: "bg-rose-500"
    },
    "Follicular": {
        color: "text-teal-600",
        bannerBg: "bg-gradient-to-r from-teal-400 to-emerald-500",
        cardBg: "bg-teal-50/30",
        border: "border-teal-100",
        softBg: "bg-teal-50/30",
        pageGradient: "from-teal-50/50 via-white to-white",
        iconContainer: "bg-teal-100 text-teal-600",
        orbRing: "from-teal-300 via-teal-100 to-teal-400",
        accent: "bg-teal-500"
    },
    "Ovulatory": {
        color: "text-amber-600",
        bannerBg: "bg-gradient-to-r from-amber-400 to-orange-500",
        cardBg: "bg-amber-50/30",
        border: "border-amber-100",
        softBg: "bg-amber-50/30",
        pageGradient: "from-amber-50/50 via-white to-white",
        iconContainer: "bg-amber-100 text-amber-600",
        orbRing: "from-amber-300 via-amber-100 to-amber-400",
        accent: "bg-amber-500"
    },
    "Luteal": {
        color: "text-indigo-600",
        bannerBg: "bg-gradient-to-r from-indigo-500 to-purple-600",
        cardBg: "bg-indigo-50/30",
        border: "border-indigo-100",
        softBg: "bg-indigo-50/30",
        pageGradient: "from-indigo-50/50 via-white to-white",
        iconContainer: "bg-indigo-100 text-indigo-600",
        orbRing: "from-indigo-300 via-indigo-100 to-indigo-400",
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
    const [hasPlanSetup, setHasPlanSetup] = useState(false);
    const [setupLoading, setSetupLoading] = useState(true);
    const [setupStep, setSetupStep] = useState(1);
    const [isPending, startTransition] = useTransition();

    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [activity, setActivity] = useState("");
    const [diet, setDiet] = useState("");
    const [fitnessGoal, setFitnessGoal] = useState("");
    const [targetWeight, setTargetWeight] = useState("");
    const [weeklyRate, setWeeklyRate] = useState("0.4");

    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'guide' | 'diet' | 'exercise'>('guide');

    useEffect(() => {
        const load = async () => {
            try {
                const planSettings = await fetchPlanSettings();
                if (planSettings) {
                    setHasPlanSetup(true);
                    const res = await fetchCycleIntelligenceAI();
                    if (res) setData(res);
                } else {
                    setHasPlanSetup(false);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setSetupLoading(false);
            }
        };
        load();
    }, []);
    const handleSetupNext = () => {
        if (setupStep === 1) {
            if (!height || !weight) return alert("Please enter height and weight.");
            setSetupStep(2);
        } else if (setupStep === 2) {
            if (!activity) return alert("Please select an activity level.");
            setSetupStep(3);
        } else if (setupStep === 3) {
            if (!fitnessGoal) return alert("Please select a fitness goal.");
            // Skip weight target step if not weight_loss
            if (fitnessGoal === "weight_loss") {
                setSetupStep(4);
            } else {
                setSetupStep(5);
            }
        } else if (setupStep === 4) {
            if (!targetWeight) return alert("Please enter your target weight.");
            setSetupStep(5);
        }
    };

    const handleSetupSubmit = () => {
        if (!diet) return alert("Please select a diet preference.");
        startTransition(async () => {
            const res = await savePlanSettings({
                height: parseFloat(height),
                weight: parseFloat(weight),
                activityLevel: activity,
                diet: diet,
                fitnessGoal: fitnessGoal,
                targetWeight: fitnessGoal === "weight_loss" && targetWeight ? parseFloat(targetWeight) : undefined,
                weeklyRate: fitnessGoal === "weight_loss" ? parseFloat(weeklyRate) : undefined
            });
            if (res.success) {
                setHasPlanSetup(true);
                const cycleData = await fetchCycleIntelligenceAI();
                if (cycleData) setData(cycleData);
            } else {
                alert("Failed to save settings. Please try again.");
            }
        });
    };

    if (setupLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <div className="animate-spin w-8 h-8 rounded-full border-2 border-rove-charcoal border-t-transparent" />
        </div>
    );

    // --- 5. RENDER: SETUP WIZARD (REDESIGNED) ---
    if (!hasPlanSetup) {
        return (
            // ✅ Updated Background (#FDFBF7)
            <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden flex justify-center items-center p-4">

                {/* ✅ Updated Visuals: Only Peach Blob + Orbs (Privacy Style) */}
                <div className="blob-glow-peach" />
                <div className="glass-orb glass-orb-1" />
                <div className="glass-orb glass-orb-3" />

                {/* ✅ Updated Card Style: Privacy Border & Shadow */}
                <div className="glass-panel relative z-10 w-full max-w-2xl p-8 md:p-12 flex flex-col border-rove-peach/30 shadow-2xl">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-rove-stone/60 block mb-1">
                                Step {setupStep} of {fitnessGoal === "weight_loss" || !fitnessGoal ? 5 : 4}
                            </span>
                            <h1 className="font-heading text-2xl md:text-3xl text-rove-charcoal">
                                Personalize Plan
                            </h1>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-10">
                        {[1, 2, 3, 4, 5].map((s) => {
                            // Hide step 4 if not weight_loss goal
                            if (s === 4 && fitnessGoal && fitnessGoal !== "weight_loss") return null;
                            const isActive = s <= setupStep;
                            return (
                                <div
                                    key={s}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isActive ? "bg-rove-charcoal shadow-md" : "bg-black/5"
                                        }`}
                                />
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={setupStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8 min-h-[300px]"
                        >
                            {/* STEP 1: METRICS */}
                            {setupStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rove-red/10 rounded-full text-rove-red">
                                            <Ruler className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Body Metrics</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">We use this to calculate your precise caloric & hydration needs.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Height Input */}
                                        <div className="bg-white/50 p-6 rounded-3xl border border-white/60 shadow-sm flex items-center justify-between transition-all hover:bg-white/70 group focus-within:ring-2 focus-within:ring-rove-red/10 focus-within:border-rove-red/30">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rove-red shadow-sm border border-white/50">
                                                    <Ruler className="w-6 h-6" />
                                                </div>
                                                <label className="text-xs font-bold uppercase tracking-widest text-rove-stone block">Height</label>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <input
                                                    type="number"
                                                    value={height}
                                                    onChange={e => setHeight(e.target.value)}
                                                    placeholder="165"
                                                    className="w-16 text-right text-3xl font-heading font-semibold bg-transparent outline-none text-rove-charcoal placeholder:text-rove-stone/20"
                                                    autoFocus
                                                />
                                                <span className="text-sm font-medium text-rove-stone mb-1">cm</span>
                                            </div>
                                        </div>

                                        {/* Weight Input */}
                                        <div className="bg-white/50 p-6 rounded-3xl border border-white/60 shadow-sm flex items-center justify-between transition-all hover:bg-white/70 group focus-within:ring-2 focus-within:ring-rove-red/10 focus-within:border-rove-red/30">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rove-red shadow-sm border border-white/50">
                                                    <Weight className="w-6 h-6" />
                                                </div>
                                                <label className="text-xs font-bold uppercase tracking-widest text-rove-stone block">Weight</label>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <input
                                                    type="number"
                                                    value={weight}
                                                    onChange={e => setWeight(e.target.value)}
                                                    placeholder="60"
                                                    className="w-16 text-right text-3xl font-heading font-semibold bg-transparent outline-none text-rove-charcoal placeholder:text-rove-stone/20"
                                                />
                                                <span className="text-sm font-medium text-rove-stone mb-1">kg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: ACTIVITY */}
                            {setupStep === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rove-red/10 rounded-full text-rove-red">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Activity Level</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">How active are you on a typical week?</p>

                                    <div className="space-y-4">
                                        {ACTIVITY_LEVELS.map((opt) => {
                                            const isSelected = activity === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setActivity(opt.id)}
                                                    className={`w-full p-5 rounded-[1.5rem] border text-left transition-all duration-300 flex items-center justify-between group ${isSelected
                                                        ? "bg-white border-rove-red/40 ring-4 ring-rove-red/5 shadow-xl scale-[1.01]"
                                                        : "bg-white/40 border-white/60 shadow-sm hover:bg-white/60 hover:shadow-md"
                                                        }`}
                                                >
                                                    <div>
                                                        <h3 className={`font-heading font-bold text-lg mb-1 transition-colors ${isSelected ? "text-rove-charcoal" : "text-rove-charcoal/80"}`}>
                                                            {opt.label}
                                                        </h3>
                                                        <p className={`text-xs transition-colors ${isSelected ? "text-rove-stone" : "text-rove-stone/70"}`}>
                                                            {opt.desc}
                                                        </p>
                                                    </div>

                                                    {/* Selection Circle */}
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-rove-red bg-rove-red text-white" : "border-rove-stone/20"
                                                        }`}>
                                                        {isSelected && <Check size={14} strokeWidth={4} />}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: FITNESS GOAL */}
                            {setupStep === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Fitness Goal</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">What's your primary health objective right now?</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: "weight_loss", label: "Weight Loss", desc: "Lose fat, get lean", icon: "🔥" },
                                            { id: "maintenance", label: "Maintenance", desc: "Stay balanced", icon: "⚖️" },
                                            { id: "muscle_gain", label: "Muscle Gain", desc: "Build strength", icon: "💪" },
                                            { id: "energy", label: "Energy", desc: "Boost vitality", icon: "⚡" },
                                            { id: "hormone_balance", label: "Hormone Balance", desc: "Sync naturally", icon: "🌙" },
                                            { id: "endurance", label: "Endurance", desc: "Improve stamina", icon: "🏃" }
                                        ].map((opt) => {
                                            const isSelected = fitnessGoal === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFitnessGoal(opt.id)}
                                                    className={`
                                                        relative p-5 rounded-[1.5rem] border transition-all duration-300 flex flex-col items-center justify-center h-32 group cursor-pointer text-center gap-2
                                                        ${isSelected
                                                            ? "bg-white border-emerald-400 ring-4 ring-emerald-100 shadow-xl scale-[1.02]"
                                                            : "bg-white/40 border-white/60 shadow-sm hover:bg-white/60 hover:shadow-md hover:scale-[1.01]"
                                                        }
                                                    `}
                                                >
                                                    <span className="text-3xl">{opt.icon}</span>
                                                    <h3 className={`font-heading font-bold text-sm ${isSelected ? "text-emerald-700" : "text-rove-charcoal/80"}`}>
                                                        {opt.label}
                                                    </h3>
                                                    <p className="text-[10px] text-rove-stone/70">{opt.desc}</p>
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                            <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: WEIGHT TARGET (Only if weight_loss) */}
                            {setupStep === 4 && fitnessGoal === "weight_loss" && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500/10 rounded-full text-orange-600">
                                            <Scale className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Weight Target</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">Set a healthy and achievable weight loss goal.</p>

                                    <div className="space-y-6">
                                        <div className="bg-white/60 rounded-2xl p-5 border border-white/80 shadow-sm">
                                            <label className="block text-sm font-medium text-rove-charcoal mb-2">
                                                Current Weight: <span className="font-bold text-rove-red">{weight} kg</span>
                                            </label>
                                            <label className="block text-sm font-medium text-rove-charcoal mb-2">Target Weight (kg)</label>
                                            <input
                                                type="number"
                                                value={targetWeight}
                                                onChange={(e) => setTargetWeight(e.target.value)}
                                                placeholder={`e.g., ${parseFloat(weight) ? Math.round(parseFloat(weight) - 5) : 55}`}
                                                className="w-full text-lg p-4 border border-white/60 rounded-xl bg-white/80 text-rove-charcoal focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                                            />
                                        </div>

                                        <div className="bg-white/60 rounded-2xl p-5 border border-white/80 shadow-sm">
                                            <label className="block text-sm font-medium text-rove-charcoal mb-3">Weekly Loss Rate</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { value: "0.25", label: "Gentle", desc: "0.25 kg/week" },
                                                    { value: "0.4", label: "Moderate", desc: "0.4 kg/week" },
                                                    { value: "0.5", label: "Active", desc: "0.5 kg/week" }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setWeeklyRate(opt.value)}
                                                        className={`p-3 rounded-xl border text-center transition-all ${weeklyRate === opt.value
                                                            ? "bg-orange-50 border-orange-400 ring-2 ring-orange-100"
                                                            : "bg-white/50 border-white/60 hover:bg-white/80"
                                                            }`}
                                                    >
                                                        <div className="font-bold text-rove-charcoal">{opt.label}</div>
                                                        <div className="text-[10px] text-rove-stone">{opt.desc}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Estimated Timeline */}
                                        {targetWeight && parseFloat(weight) > parseFloat(targetWeight) && (
                                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                                                <div className="flex items-center gap-2 text-orange-700">
                                                    <Flame className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        Estimated: {Math.ceil((parseFloat(weight) - parseFloat(targetWeight)) / parseFloat(weeklyRate))} weeks to reach goal
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: DIET */}
                            {setupStep === 5 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rove-red/10 rounded-full text-rove-red">
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Diet Preference</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">This helps us customize your meal plan.</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {DIET_OPTIONS.map((opt) => {
                                            const isSelected = diet === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setDiet(opt.id)}
                                                    className={`
                                                        relative p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center justify-center h-40 group cursor-pointer text-center gap-3
                                                        ${isSelected
                                                            ? "bg-white border-rove-red/40 ring-4 ring-rove-red/5 shadow-xl scale-[1.02]"
                                                            : "bg-white/40 border-white/60 shadow-sm hover:bg-white/60 hover:shadow-md hover:scale-[1.01]"
                                                        }
                                                    `}
                                                >
                                                    {/* Icon Container */}
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isSelected
                                                        ? "bg-rove-red text-white shadow-lg shadow-rove-red/20"
                                                        : "bg-white text-rove-stone border border-white/80 shadow-sm"
                                                        }`}>
                                                        {opt.icon}
                                                    </div>
                                                    {/* Label */}
                                                    <h3 className={`font-heading font-bold text-base transition-colors duration-300 ${isSelected ? "text-rove-charcoal" : "text-rove-charcoal/80"}`}>
                                                        {opt.label}
                                                    </h3>

                                                    {/* Selection Checkmark */}
                                                    {isSelected && (
                                                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-rove-red flex items-center justify-center shadow-md">
                                                            <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer / Navigation */}
                    <div className="mt-auto pt-10 flex justify-between items-center">
                        {setupStep > 1 && (
                            <button
                                onClick={() => setSetupStep(s => s - 1)}
                                className="text-rove-stone font-medium hover:text-rove-charcoal transition-colors flex items-center gap-1 pl-1"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}

                        <div className="ml-auto">
                            {setupStep < 5 ? (
                                <Button
                                    onClick={handleSetupNext}
                                    className="rounded-2xl px-8 py-5 bg-rove-charcoal text-white hover:bg-black shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Next Step <ArrowRight size={18} className="ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSetupSubmit}
                                    disabled={isPending}
                                    className="rounded-2xl px-8 py-5 bg-rove-charcoal text-white hover:bg-black shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isPending ? "Generating Plan..." : "Generate Plan"}
                                    {!isPending && <Sparkles size={18} className="ml-2" />}
                                </Button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // --- 6. RENDER: MAIN DASHBOARD (PRESERVED) ---
    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <div className="animate-spin w-8 h-8 rounded-full border-2 border-rove-charcoal border-t-transparent" />
        </div>
    );

    const phaseName = data.phase || "Menstrual";
    const BP = data.blueprint || BLUEPRINTS[phaseName] || BLUEPRINTS["Menstrual"];
    const theme = phaseThemes[phaseName] || phaseThemes["Menstrual"];
    const headerImage = PHASE_IMAGES[phaseName] || PHASE_IMAGES["Menstrual"];
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className={cn("min-h-screen bg-gradient-to-b transition-colors duration-500", theme.pageGradient)}>

            {/* 1. TOP NAVIGATION (High Density) */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
                <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    <Link href="/cycle-sync" className="p-2 -ml-2 text-rove-stone hover:text-rove-charcoal transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex flex-col items-center">
                        <h1 className={cn("text-lg font-heading leading-none mb-0.5", theme.color)}>{phaseName}</h1>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone/60">Day {data.day} of Cycle</span>
                    </div>

                    <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center shadow-sm", theme.cardBg, theme.border)}>
                        <span className={cn("text-xs font-bold", theme.color)}>{data.day}</span>
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
                                    isActive ? cn("bg-white shadow-sm", theme.color) : "text-rove-charcoal/60 hover:bg-white/30"
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
                            {/* Slim Focus Banner - Phase Colored */}
                            <div className={cn("p-5 rounded-2xl relative overflow-hidden shadow-md flex items-center justify-between gap-4 text-white transition-all duration-500", theme.bannerBg)}>
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

                            {/* Your Goals - Compact on Mobile, Luxurious on Desktop */}
                            {data?.weightGoal && (
                                <section className="mt-4 md:mt-8">
                                    {/* Mobile Version - Compact Card - Matches App Theme */}
                                    <div className={cn("md:hidden relative overflow-hidden rounded-2xl backdrop-blur-xl p-4 shadow-sm border", theme.cardBg, theme.border)}>
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", theme.iconContainer)}>
                                                    <Target className="w-3 h-3" />
                                                </div>
                                                <span className="text-rove-charcoal text-sm font-heading font-bold">Your Goal</span>
                                            </div>
                                            <span className={cn("px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase", theme.accent)}>
                                                {data.weightGoal.fitnessGoal?.replace('_', ' ') || 'Weight Loss'}
                                            </span>
                                        </div>

                                        {/* Weight Row - Inline */}
                                        <div className={cn("flex items-center justify-between rounded-xl p-3 mb-3", theme.softBg)}>
                                            <div className="text-center flex-1">
                                                <p className="text-lg font-heading font-bold text-rove-charcoal/70">{data.weightGoal.startWeight}<span className="text-xs text-rove-stone">kg</span></p>
                                                <p className="text-[8px] uppercase text-rove-stone">Start</p>
                                            </div>
                                            <div className="text-rove-stone/40 text-lg">→</div>
                                            <div className={cn("text-center flex-1 px-2 py-1 rounded-lg", theme.iconContainer)}>
                                                <p className={cn("text-lg font-heading font-bold", theme.color)}>{data.weightGoal.currentWeight}<span className="text-xs opacity-60">kg</span></p>
                                                <p className="text-[8px] uppercase opacity-70">Now</p>
                                            </div>
                                            <div className="text-rove-stone/40 text-lg">→</div>
                                            <div className="text-center flex-1">
                                                <p className="text-lg font-heading font-bold text-rove-charcoal">{data.weightGoal.targetWeight}<span className="text-xs text-rove-stone">kg</span></p>
                                                <p className="text-[8px] uppercase text-rove-stone">Goal</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 bg-rove-stone/10 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", theme.accent)}
                                                style={{
                                                    width: `${Math.min(100, Math.max(5,
                                                        ((data.weightGoal.startWeight - data.weightGoal.currentWeight) /
                                                            (data.weightGoal.startWeight - data.weightGoal.targetWeight)) * 100
                                                    ))}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-center text-rove-stone text-[10px] mt-1.5">
                                            {data.weightGoal.currentWeight <= data.weightGoal.startWeight
                                                ? `${(data.weightGoal.startWeight - data.weightGoal.currentWeight).toFixed(1)}kg lost • ${(data.weightGoal.currentWeight - data.weightGoal.targetWeight).toFixed(1)}kg to go`
                                                : `${(data.weightGoal.currentWeight - data.weightGoal.targetWeight).toFixed(1)}kg to lose`
                                            }
                                        </p>
                                    </div>

                                    {/* Desktop Version - Full Card - Matches App Theme */}
                                    <div className={cn("hidden md:block relative overflow-hidden rounded-[2rem] backdrop-blur-xl p-6 shadow-sm border", theme.cardBg, theme.border)}>
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", theme.iconContainer)}>
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", theme.color)}>Your Personalized Journey</p>
                                                    <h2 className="text-rove-charcoal text-xl font-heading font-bold">Your Goals</h2>
                                                </div>
                                            </div>
                                            <span className={cn("px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wide", theme.accent)}>
                                                {data.weightGoal.fitnessGoal?.replace('_', ' ') || 'Weight Loss'}
                                            </span>
                                        </div>

                                        {/* Weight Journey */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className={cn("text-center p-4 rounded-2xl", theme.softBg)}>
                                                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-rove-stone/20 flex items-center justify-center">
                                                    <span className="text-lg">🏁</span>
                                                </div>
                                                <p className="text-2xl font-heading font-bold text-rove-charcoal/70">
                                                    {data.weightGoal.startWeight}<span className="text-sm text-rove-stone ml-0.5">kg</span>
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider text-rove-stone mt-1">Started at</p>
                                            </div>
                                            <div className={cn("text-center p-4 rounded-2xl border-2", theme.iconContainer, theme.border)}>
                                                <div className={cn("w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center", theme.accent)}>
                                                    <span className="text-lg">💪</span>
                                                </div>
                                                <p className={cn("text-2xl font-heading font-bold", theme.color)}>
                                                    {data.weightGoal.currentWeight}<span className="text-sm opacity-60 ml-0.5">kg</span>
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider opacity-70 mt-1">You Now</p>
                                            </div>
                                            <div className={cn("text-center p-4 rounded-2xl", theme.softBg)}>
                                                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-rove-stone/20 flex items-center justify-center">
                                                    <span className="text-lg">🎯</span>
                                                </div>
                                                <p className="text-2xl font-heading font-bold text-rove-charcoal">
                                                    {data.weightGoal.targetWeight}<span className="text-sm text-rove-stone ml-0.5">kg</span>
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider text-rove-stone mt-1">Dream Goal</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between text-[10px] text-rove-stone mb-2">
                                                <span>Progress</span>
                                                <span className={cn("font-bold", theme.color)}>
                                                    {Math.round(Math.max(0, Math.min(100,
                                                        ((data.weightGoal.startWeight - data.weightGoal.currentWeight) /
                                                            (data.weightGoal.startWeight - data.weightGoal.targetWeight)) * 100
                                                    )))}% Complete
                                                </span>
                                            </div>
                                            <div className="h-2 bg-rove-stone/10 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000", theme.accent)}
                                                    style={{
                                                        width: `${Math.min(100, Math.max(5,
                                                            ((data.weightGoal.startWeight - data.weightGoal.currentWeight) /
                                                                (data.weightGoal.startWeight - data.weightGoal.targetWeight)) * 100
                                                        ))}%`
                                                    }}
                                                />
                                            </div>
                                            <p className="text-center text-rove-stone text-xs mt-2">
                                                {data.weightGoal.currentWeight <= data.weightGoal.startWeight
                                                    ? `🔥 ${(data.weightGoal.startWeight - data.weightGoal.currentWeight).toFixed(1)} kg lost • ${(data.weightGoal.currentWeight - data.weightGoal.targetWeight).toFixed(1)} kg to go`
                                                    : `🎯 ${(data.weightGoal.currentWeight - data.weightGoal.targetWeight).toFixed(1)} kg to lose`
                                                }
                                            </p>
                                        </div>

                                        {/* Feature Cards */}
                                        <div className="border-t border-rove-stone/10 pt-5">
                                            <p className="text-rove-stone text-[10px] uppercase tracking-[0.12em] font-bold mb-3">✦ Your Plan Includes</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className={cn("p-4 rounded-xl border", theme.softBg, theme.border)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                                                            <Utensils className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-rove-charcoal font-heading font-bold text-sm">Cycle-Synced Diet</h4>
                                                            <p className="text-rove-stone text-[10px]">AI macros for your {phaseName.toLowerCase()} phase</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={cn("p-4 rounded-xl border", theme.softBg, theme.border)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                            <Dumbbell className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-rove-charcoal font-heading font-bold text-sm">Smart Workouts</h4>
                                                            <p className="text-rove-stone text-[10px]">Hormone-aligned intensity</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Biology / Science Section */}
                            <section>
                                <SectionHeader title="The Science" icon={Beaker} />
                                <div className={cn("p-6 rounded-[2rem] backdrop-blur-xl border shadow-sm mb-4 transition-all duration-500", theme.cardBg, theme.border)}>
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
                                <SectionHeader title="Your Focus" icon={Target} />
                                <div className="space-y-4">
                                    {/* 1. Weight Tracker Integration (If goal is weight_loss) */}
                                    {data?.weightGoal?.fitnessGoal === "weight_loss" && (
                                        <div className={cn("p-5 rounded-[1.5rem] backdrop-blur-xl border shadow-sm", theme.cardBg, theme.border)}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", theme.iconContainer)}>
                                                        <Scale className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-rove-charcoal font-heading font-bold text-sm">Weight Tracker</h4>
                                                        <p className="text-rove-stone text-[10px]">Your progress this week</p>
                                                    </div>
                                                </div>
                                                <Badge className={cn("text-[10px] uppercase font-bold text-white", theme.accent)}>Active</Badge>
                                            </div>

                                            {/* Simple Stats Row */}
                                            <div className="flex items-center justify-around mb-4 bg-white/40 p-3 rounded-xl border border-white/50">
                                                <div className="text-center">
                                                    <div className="text-xs text-rove-stone uppercase tracking-wider mb-1">Start</div>
                                                    <div className="font-heading font-bold text-rove-charcoal">{data.weightGoal.startWeight}</div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-rove-stone/40" />
                                                <div className="text-center">
                                                    <div className="text-xs text-rove-stone uppercase tracking-wider mb-1">Current</div>
                                                    <div className={cn("font-heading font-bold", theme.color)}>{data.weightGoal.currentWeight}</div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-rove-stone/40" />
                                                <div className="text-center">
                                                    <div className="text-xs text-rove-stone uppercase tracking-wider mb-1">Goal</div>
                                                    <div className="font-heading font-bold text-rove-charcoal">{data.weightGoal.targetWeight}</div>
                                                </div>
                                            </div>

                                            <div className="bg-white/50 p-3 rounded-xl text-center">
                                                <p className="text-xs text-rove-stone">
                                                    {data.weightGoal.currentWeight <= data.weightGoal.startWeight
                                                        ? `🔥 You've lost ${(data.weightGoal.startWeight - data.weightGoal.currentWeight).toFixed(1)}kg! Keep it up!`
                                                        : `🌱 Beginning your journey. Consistency is key!`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. PCOS / Condition Insight Card */}
                                    {data?.conditions?.includes("pcos") && (
                                        <div className={cn("p-5 rounded-[1.5rem] backdrop-blur-xl border shadow-sm relative overflow-hidden", theme.cardBg, theme.border)}>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                                        <Flower2 className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="text-rove-charcoal font-heading font-bold text-sm">PCOS Support</h4>
                                                </div>
                                                <p className="text-sm text-rove-stone leading-relaxed">
                                                    {phaseName === "Menstrual" ? "Inflammation is naturally lower but insulin sensitivity can be tricky. Prioritize warm, cooked proteins." :
                                                        phaseName === "Follicular" ? "Estrogen is rising. Great time for spearmint tea to help balance androgens." :
                                                            phaseName === "Ovulatory" ? "You might feel a stronger energy spike. Use it, but avoid burnout to keep cortisol low." :
                                                                "Progesterone is key now. Use magnesium and limit sugar to prevent insulin spikes."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Muscle Gain Insight */}
                                    {data?.weightGoal?.fitnessGoal === "muscle_gain" && (
                                        <div className={cn("p-5 rounded-[1.5rem] backdrop-blur-xl border shadow-sm", theme.cardBg, theme.border)}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <Dumbbell className="w-4 h-4" />
                                                </div>
                                                <h4 className="text-rove-charcoal font-heading font-bold text-sm">Muscle Strategy</h4>
                                            </div>
                                            <p className="text-sm text-rove-stone leading-relaxed">
                                                {phaseName === "Follicular" || phaseName === "Ovulatory"
                                                    ? "Anabolic Window: Estrogen helps muscle repair. Push your weights up for max hypertrophy."
                                                    : "Maintenance Mode: Your body is using more energy for internal heat. Focus on form and protein intake."}
                                            </p>
                                        </div>
                                    )}

                                    {/* 4. Irregular Cycle Insight */}
                                    {data?.isCycleIrregular && (
                                        <div className={cn("p-5 rounded-[1.5rem] backdrop-blur-xl border shadow-sm", theme.cardBg, theme.border)}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                                    <Waves className="w-4 h-4" />
                                                </div>
                                                <h4 className="text-rove-charcoal font-heading font-bold text-sm">Irregular Cycle Tips</h4>
                                            </div>
                                            <p className="text-sm text-rove-stone leading-relaxed">
                                                Since your cycle length varies, these phase predictions are estimates.
                                                <span className="font-bold block mt-2 mb-1">Watch for body cues:</span>
                                                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                                                    <li>Rising basal temperature = Ovulation passed</li>
                                                    <li>Egg-white cervical mucus = Fertile window</li>
                                                </ul>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="mt-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-rove-stone ml-1 mb-3">Symptom Soothers</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {BP.rituals.symptom_relief.map((item: any, i: number) => (
                                        <div key={i} className={cn("p-5 rounded-[1.5rem] backdrop-blur-xl border shadow-sm transition-all duration-500", theme.cardBg, theme.border)}>
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-rove-stone/60 mb-2">
                                                For {item.symptom}
                                            </div>
                                            <div className={cn("text-base font-heading flex items-center gap-2", theme.color)}>
                                                <Leaf className="w-4 h-4" />
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