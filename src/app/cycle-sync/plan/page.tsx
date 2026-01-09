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

// --- Data: Phase Blueprints (Fully Restored) ---
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
        nutrition_guide: {
            header: {
                title: "Replenish & Warm",
                desc: "Your body is working hard to shed the uterine lining. Focus on iron-rich, warm, and easily digestible foods to restore energy.",
                tags: ["Iron Rich", "Warm Foods", "Comfort"]
            },
            symptom_decoder: [
                { symptom: "Cramps", trigger: "Inflammation", fix: "Omega-3s & Magnesium" },
                { symptom: "Fatigue", trigger: "Low Iron", fix: "Lentils, Spinach, Red Meat" },
                { symptom: "Bloating", trigger: "Water Retention", fix: "Cucumber, Ginger Tea" }
            ],
            macro_fuel: { carbs: 40, protein: 30, fats: 30 },
            cheat_sheet: {
                focus: ["Soups & Stews", "Root Vegetables", "Herbal Teas", "Dark Chocolate"],
                avoid: ["Ice Cold Drinks", "Raw Salads", "Excess Caffeine", "Alcohol"]
            },
            ai_chef: {
                meal_options: [
                    { name: "Lentil Soup", type: "Lunch", calories: 400, protein: "18g" },
                    { name: "Ginger Tea", type: "Drink", calories: 10, protein: "0g" }
                ]
            }
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
        nutrition_guide: {
            header: {
                title: "Fresh & Energizing",
                desc: "Rising estrogen improves insulin sensitivity. Incorporate fresh veggies, fermented foods, and lean proteins.",
                tags: ["Probiotics", "Fresh Greens", "Lean Protein"]
            },
            symptom_decoder: [
                { symptom: "Anxiety", trigger: "Rising Energy", fix: "Grounding Root Veggies" },
                { symptom: "Restlessness", trigger: "High Cortisol", fix: "Chamomile Tea" }
            ],
            macro_fuel: { carbs: 50, protein: 25, fats: 25 },
            cheat_sheet: {
                focus: ["Salads", "Kimchi/Sauerkraut", "Sprouted Grains", "Chicken/Tofu"],
                avoid: ["Heavy Cream", "Deep Fried Foods", "Excess Sugar"]
            },
            ai_chef: {
                meal_options: [
                    { name: "Quinoa Salad", type: "Lunch", calories: 450, protein: "15g" },
                    { name: "Green Smoothie", type: "Breakfast", calories: 300, protein: "10g" }
                ]
            }
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
        nutrition_guide: {
            header: {
                title: "Fiber & Cool",
                desc: "High estrogen requires fiber for detoxification. Focus on cooling foods like cucumber and cruciferous veggies.",
                tags: ["Fiber", "Cooling", "Antioxidants"]
            },
            symptom_decoder: [
                { symptom: "Acne", trigger: "Oil Production", fix: "Zinc & Hydration" },
                { symptom: "Heat", trigger: "High Metabolism", fix: "Mint & Cucumber" }
            ],
            macro_fuel: { carbs: 45, protein: 25, fats: 30 },
            cheat_sheet: {
                focus: ["Broccoli", "Berries", "Almonds", "Raw Veggies"],
                avoid: ["Spicy Foods", "Greasy Fast Food", "Excess Alcohol"]
            },
            ai_chef: {
                meal_options: [
                    { name: "Raw Pad Thai", type: "Dinner", calories: 500, protein: "20g" },
                    { name: "Berry Bowl", type: "Snack", calories: 200, protein: "5g" }
                ]
            }
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
        nutrition_guide: {
            header: {
                title: "Stabilize & Comfort",
                desc: "Blood sugar instability is common. Prioritize complex carbs like sweet potatoes and brown rice to fight cravings.",
                tags: ["Complex Carbs", "B-Vitamins", "Magnesium"]
            },
            symptom_decoder: [
                { symptom: "Cravings", trigger: "Drop in Serotonin", fix: "Dark Chocolate" },
                { symptom: "Bloating", trigger: "Progesterone", fix: "Less Salt, More Water" }
            ],
            macro_fuel: { carbs: 40, protein: 30, fats: 30 },
            cheat_sheet: {
                focus: ["Sweet Potato", "Brown Rice", "Chickpeas", "Turkey"],
                avoid: ["Processed Sugar", "Salty Snacks", "Caffeine"]
            },
            ai_chef: {
                meal_options: [
                    { name: "Buddha Bowl", type: "Lunch", calories: 550, protein: "22g" },
                    { name: "Golden Milk", type: "Drink", calories: 120, protein: "4g" }
                ]
            }
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

    // Form State
    // Height is calculated from Ft/In
    const [heightFt, setHeightFt] = useState("");
    const [heightIn, setHeightIn] = useState("");
    
    // Weight is always KG
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
            // Validate Height (Ft/In)
            if (!heightFt || !weight) return alert("Please enter all fields.");
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
        
        // Convert Ft/In to CM for backend storage
        const ft = parseInt(heightFt) || 0;
        const inch = parseInt(heightIn) || 0;
        const totalCm = (ft * 30.48) + (inch * 2.54);

        startTransition(async () => {
            const res = await savePlanSettings({
                height: parseFloat(totalCm.toFixed(2)), // Save as CM float
                weight: parseFloat(weight), // Already KG
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

    // --- RENDER: SETUP WIZARD ---
    if (!hasPlanSetup) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden flex justify-center items-center p-4">
                
                <div className="blob-glow-peach" />
                <div className="glass-orb glass-orb-1" />
                <div className="glass-orb glass-orb-3" />

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
                            {/* STEP 1: METRICS (UPDATED: FT/IN ONLY) */}
                            {setupStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rove-red/10 rounded-full text-rove-red"><Ruler className="w-6 h-6" /></div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Body Metrics</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">We use this to calculate your precise caloric & hydration needs.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* HEIGHT INPUT (FT/IN ONLY) */}
                                        <div className="bg-white/50 p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col justify-center hover:bg-white/70 group focus-within:ring-2 focus-within:ring-rove-red/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Ruler className="w-5 h-5 text-rove-red" />
                                                <label className="text-xs font-bold uppercase tracking-widest text-rove-stone block">Height</label>
                                            </div>
                                            
                                            <div className="flex items-end gap-2 mt-2">
                                                <input 
                                                    type="number" 
                                                    value={heightFt} 
                                                    onChange={e => setHeightFt(e.target.value)} 
                                                    placeholder="5" 
                                                    className="w-12 text-4xl font-heading font-semibold bg-transparent outline-none text-rove-charcoal placeholder:text-rove-stone/20" 
                                                    autoFocus
                                                />
                                                <span className="text-sm font-medium text-rove-stone mb-2 mr-2">ft</span>
                                                
                                                <input 
                                                    type="number" 
                                                    value={heightIn} 
                                                    onChange={e => setHeightIn(e.target.value)} 
                                                    placeholder="4" 
                                                    className="w-14 text-4xl font-heading font-semibold bg-transparent outline-none text-rove-charcoal placeholder:text-rove-stone/20" 
                                                />
                                                <span className="text-sm font-medium text-rove-stone mb-2">in</span>
                                            </div>
                                        </div>

                                        {/* WEIGHT INPUT (ALWAYS KG) */}
                                        <div className="bg-white/50 p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col justify-center hover:bg-white/70 group focus-within:ring-2 focus-within:ring-rove-red/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Weight className="w-5 h-5 text-rove-red" />
                                                <label className="text-xs font-bold uppercase tracking-widest text-rove-stone block">Weight</label>
                                            </div>
                                            
                                            <div className="flex items-end gap-2 mt-2">
                                                <input 
                                                    type="number" 
                                                    value={weight} 
                                                    onChange={e => setWeight(e.target.value)} 
                                                    placeholder="60" 
                                                    className="w-24 text-4xl font-heading font-semibold bg-transparent outline-none text-rove-charcoal placeholder:text-rove-stone/20" 
                                                />
                                                <span className="text-sm font-medium text-rove-stone mb-2">kg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: ACTIVITY */}
                            {setupStep === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rove-red/10 rounded-full text-rove-red"><Activity className="w-6 h-6" /></div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Activity Level</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">How active are you on a typical week?</p>
                                    <div className="space-y-4">
                                        {ACTIVITY_LEVELS.map((opt) => (
                                            <button key={opt.id} onClick={() => setActivity(opt.id)} className={`w-full p-5 rounded-[1.5rem] border text-left transition-all duration-300 flex items-center justify-between group ${activity === opt.id ? "bg-white border-rove-charcoal ring-4 ring-rove-charcoal/5 shadow-xl scale-[1.01]" : "bg-white/40 border-white/60 shadow-sm hover:bg-white/60"}`}>
                                                <div>
                                                    <h3 className={`font-heading font-bold text-lg mb-1 transition-colors ${activity === opt.id ? "text-rove-charcoal" : "text-rove-charcoal/80"}`}>{opt.label}</h3>
                                                    <p className={`text-xs transition-colors ${activity === opt.id ? "text-rove-stone" : "text-rove-stone/70"}`}>{opt.desc}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${activity === opt.id ? "border-rove-charcoal bg-rove-charcoal text-white" : "border-rove-stone/20"}`}>
                                                    {activity === opt.id && <Check size={14} strokeWidth={4} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: FITNESS GOAL */}
                            {setupStep === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rove-red/10 rounded-full text-rove-red"><Utensils className="w-6 h-6" /></div>
                                        <h2 className="text-xl font-heading text-rove-charcoal">Diet Preference</h2>
                                    </div>
                                    <p className="text-rove-stone text-sm">This helps us customize your meal plan.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {DIET_OPTIONS.map((opt) => (
                                            <button key={opt.id} onClick={() => setDiet(opt.id)} className={`relative p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center justify-center h-40 group cursor-pointer text-center gap-3 ${diet === opt.id ? "bg-white border-rove-charcoal ring-4 ring-rove-charcoal/5 shadow-xl scale-[1.02]" : "bg-white/40 border-white/60 shadow-sm hover:bg-white/60 hover:shadow-md hover:scale-[1.01]"}`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${diet === opt.id ? "bg-rove-charcoal text-white shadow-lg" : "bg-white text-rove-stone border border-white/80 shadow-sm"}`}>{opt.icon}</div>
                                                <span className={`font-heading font-bold text-base transition-colors ${diet === opt.id ? "text-rove-charcoal" : "text-rove-charcoal/80"}`}>{opt.label}</span>
                                                {diet === opt.id && <div className="absolute top-4 right-4 text-rove-charcoal"><CheckCircle2 size={18} fill="currentColor" className="text-white" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer / Navigation */}
                    <div className="mt-auto pt-10 flex justify-between items-center">
                        {setupStep > 1 && (
                            <button onClick={() => setSetupStep(s => s - 1)} className="text-rove-stone font-medium hover:text-rove-charcoal transition-colors flex items-center gap-1 pl-1"><ChevronLeft size={18} /> Back</button>
                        )}
                        <div className="ml-auto">
                            {setupStep < 3 ? (
                                <Button onClick={handleSetupNext} className="rounded-2xl px-8 py-5 bg-rove-charcoal text-white hover:bg-black shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">Next Step <ArrowRight size={18} className="ml-2" /></Button>
                            ) : (
                                <Button onClick={handleSetupSubmit} disabled={isPending} className="rounded-2xl px-8 py-5 bg-rove-charcoal text-white hover:bg-black shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                    {isPending ? "Generating Plan..." : "Generate Plan"} {!isPending && <Sparkles size={18} className="ml-2" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Dashboard Render ---
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-rove-cream/20"><div className="animate-spin w-8 h-8 rounded-full border-2 border-rove-charcoal border-t-transparent" /></div>;

    const phaseName = data.phase || "Menstrual";
    const BP = data.blueprint || BLUEPRINTS[phaseName] || BLUEPRINTS["Menstrual"];
    const theme = phaseThemes[phaseName] || phaseThemes["Menstrual"];
    const headerImage = PHASE_IMAGES[phaseName] || PHASE_IMAGES["Menstrual"];
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#FBFAF8]">
            <div className="relative w-full h-[30vh] md:h-[40vh] bg-slate-900 z-0 transition-all duration-700">
                <Image src={headerImage} alt={phaseName} fill sizes="100vw" className="object-cover object-center opacity-90 transition-opacity duration-700" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 pb-14 md:pb-24 z-20 container mx-auto">
                    <div className="flex justify-between items-center text-white pt-2">
                        <Link href="/cycle-sync" className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/10"><ChevronLeft className="w-5 h-5" /></Link>
                        <div className="flex flex-col items-center"><span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] opacity-90 drop-shadow-md">Daily Intelligence</span><span className="text-[9px] uppercase tracking-widest opacity-60">{todayStr}</span></div>
                        <div className="w-10" />
                    </div>
                    <div className="space-y-2 animate-in slide-in-from-bottom-6 duration-700 fade-in">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">Day {data.day || "?"}</span>
                        <h1 className="font-heading text-3xl md:text-5xl text-white drop-shadow-xl leading-tight">{phaseName} Blueprint</h1>
                    </div>
                </div>
            </div>

            <div className="relative z-30 -mt-16 md:-mt-24 bg-[#FBFAF8] rounded-t-[2.5rem] md:rounded-t-[4rem] overflow-hidden shadow-2xl min-h-screen">
                <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className={cn("absolute -top-[10%] -left-[10%] w-[50vh] h-[50vh] rounded-full blur-[100px] opacity-40 mix-blend-multiply", theme.blob)} /></div>
                <div className="relative z-10 container mx-auto px-4 py-5 md:p-10 md:pt-12 max-w-5xl">
                    <div className="flex p-1.5 bg-white/60 backdrop-blur-xl rounded-full border border-white/40 shadow-lg shadow-rove-charcoal/5 mx-auto max-w-md sticky top-4 z-50 mb-6">
                        {[{ id: 'guide', label: 'Phase Guide', icon: Sparkles }, { id: 'diet', label: 'Diet', icon: Utensils }, { id: 'exercise', label: 'Exercise', icon: Dumbbell }].map(tab => {
                            const isActive = activeTab === tab.id;
                            return <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300", isActive ? "bg-white text-rove-charcoal shadow-md" : "text-rove-charcoal/60 hover:bg-white/20")}><tab.icon className="w-4 h-4" /><span className="hidden md:inline">{tab.label}</span></button>;
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'guide' && (
                            <motion.div key="guide" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                                <div className={cn("p-6 rounded-[2rem] relative overflow-hidden shadow-lg text-center transition-colors duration-500", BP.color)}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px]" />
                                    <Sparkles className="w-8 h-8 text-white/70 mx-auto mb-3 relative z-10" /><p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-1 relative z-10">Current Focus</p><h3 className="text-2xl md:text-3xl font-heading mb-2 text-white relative z-10">{BP.rituals.focus}</h3>
                                </div>
                                <section><SectionHeader title="The Science" icon={Beaker} />
                                    <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm mb-4">
                                        <h4 className="font-heading text-xl text-rove-charcoal mb-2">{BP.hormones.title}</h4><p className="text-sm font-bold text-rove-charcoal/80 mb-4">{BP.hormones.summary}</p><p className="text-sm text-rove-stone leading-relaxed mb-6">"{BP.hormones.desc}"</p>
                                        <div className="grid grid-cols-2 gap-3">{BP.hormones.symptoms.map((sym: string) => <div key={sym} className="px-3 py-2 rounded-xl bg-white/50 border border-white/60 text-xs font-bold text-rove-charcoal/70 text-center shadow-sm">{sym}</div>)}</div>
                                    </div>
                                </section>
                                <section><SectionHeader title="Mind & Rituals" icon={Brain} />
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
                                <div className="mt-4"><h3 className="text-sm font-bold uppercase tracking-wider text-rove-stone ml-1 mb-4">Symptom Soothers</h3><div className="grid grid-cols-2 gap-4">{BP.rituals.symptom_relief.map((item: any, i: number) => <div key={i} className="p-5 rounded-[1.5rem] bg-emerald-50/40 border border-emerald-100/60 backdrop-blur-xl shadow-sm"><div className="text-[9px] font-bold uppercase tracking-widest text-emerald-800/60 mb-2">For {item.symptom}</div><div className="text-base font-heading text-emerald-900 flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-600" />{item.remedy}</div></div>)}</div></div>
                            </motion.div>
                        )}
                        {activeTab === 'diet' && (<motion.div key="diet" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 md:space-y-14 pb-24">{BP.nutrition_guide && <DietHeader phase={phaseName} data={BP.nutrition_guide.header} theme={theme} />}{BP.nutrition_guide?.symptom_decoder && <SymptomDecoder data={BP.nutrition_guide.symptom_decoder} theme={theme} />}{BP.nutrition_guide?.macro_fuel && <MacroFuelGauge data={BP.nutrition_guide.macro_fuel} theme={theme} />}{BP.nutrition_guide?.cheat_sheet && <DietCheatSheet data={BP.nutrition_guide.cheat_sheet} theme={theme} />}{BP.nutrition_guide?.ai_chef && <PlateBuilder phase={phaseName} data={BP.nutrition_guide.ai_chef} theme={theme} />}<section><SectionHeader title="Supplement Specs" icon={Pill} /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{BP.supplements.map((s: any) => <div key={s.name} className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm text-center flex flex-col justify-center"><div className="font-heading text-rove-charcoal text-sm md:text-base mb-1">{s.name}</div><div className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full inline-block mx-auto mb-2 font-bold text-rove-stone">{s.dose}</div><div className="text-[10px] text-rove-stone/80 leading-tight">{s.why}</div></div>)}</div></section></motion.div>)}
                        {activeTab === 'exercise' && (<motion.div key="exercise" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8"><section><SectionHeader title="Movement Plan" icon={Activity} /><div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border-l-4 border-l-rove-charcoal/80 border-t border-r border-b border-white/60 shadow-sm"><p className="text-rove-charcoal italic text-lg font-heading leading-relaxed">"{BP.exercise.summary}"</p></div><div className="space-y-4 mb-8 mt-8"><h3 className="text-sm font-bold uppercase tracking-wider text-rove-stone ml-1">Best Practices</h3><div className="grid md:grid-cols-2 gap-4">{BP.exercise.best.map((ex: any, i: number) => <div key={i} className="p-5 rounded-[1.5rem] bg-white/60 backdrop-blur-sm border border-white/80 flex gap-4 items-start shadow-sm hover:shadow-md transition-all"><div className="text-3xl opacity-10 font-heading text-rove-charcoal">0{i + 1}</div><div><h4 className="font-bold text-lg text-rove-charcoal mb-1">{ex.title}</h4><Badge variant="outline" className="text-[10px] bg-white border-gray-200 mb-2">{ex.time}</Badge><p className="text-sm text-rove-stone leading-relaxed">{ex.desc}</p></div></div>)}</div></div><div className="p-5 rounded-[1.5rem] bg-gray-50/80 border border-gray-200 backdrop-blur-sm"><h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><Ban className="w-4 h-4" /> Avoid High Intensity</h4><div className="flex flex-wrap gap-2">{BP.exercise.avoid.map((item: string) => <span key={item} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm line-through decoration-gray-400">{item}</span>)}</div><p className="text-xs text-gray-400 mt-4 max-w-md">Listen to your body. If you feel tired, rest.</p></div></section></motion.div>)}
                    </AnimatePresence>
                </div>
            </div >
        </div>
    );
}