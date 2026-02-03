"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { fetchCycleIntelligenceAI } from "@/app/actions/cycle-sync";
import { fetchUnifiedCycleData, UnifiedCycleData } from "@/app/actions/unified-cycle"; // NEW
import { calculateSmartPhase } from "@shared/cycle/smart-phase";
import { savePlanSettings, fetchPlanSettings } from "./actions";
import { motion, animate, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ProfileAvatar from "@/components/cycle-sync/ProfileAvatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
    Activity, ArrowRight, Battery, Brain, CheckCircle2,
    Flame, Info, Leaf, Pill, Sparkles, Utensils, Waves, Beaker,
    Moon, Zap, Move, Music, Wind, Bike, Fish, Carrot, Wheat, Drumstick, Footprints, Heart, Coffee, Soup,
    Shield, Droplets, AlertCircle, Sun, Sunrise, Sunset, Ban, LayoutGrid, Dumbbell, ChevronLeft, Ruler, Weight, Check,
    Flower2, Target, Scale, Plus, Trash2, Compass, Star, Wand2
} from "lucide-react";
import { DIET_RECOMMENDATIONS, DietType } from "@/data/diet-recommendations";
import LoadingScreen from "@/components/ui/LoadingScreen";

// --- Custom Components ---
import { PlateBuilder } from "@/components/cycle-sync/PlateBuilder";
import { RiverTrack } from "@/components/cycle-sync/RiverTrack";
import { ExerciseBuilder } from "@/components/cycle-sync/ExerciseBuilder";
import { SymptomDecoder } from "@/components/cycle-sync/diet/SymptomDecoder";
import { MacroFuelGauge } from "@/components/cycle-sync/diet/MacroFuelGauge";
import { DietCheatSheet } from "@/components/cycle-sync/diet/DietCheatSheet";
import { ExerciseOrb } from "@/components/cycle-sync/ExerciseOrb";
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
                { id: "magnesium", title: "Magnesium", desc: "Reduce cramps", icon: Pill },
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 1800, protein: 60, fats: 65, carbs: 220,
                proteinLabel: "60g", fatsLabel: "High (Support)", carbsLabel: "Comfort (Mod)",
                proteinDesc: "Protein (Blood Replenishment)",
                fatsDesc: "Healthy Fats (Block Cramps)",
                carbsDesc: "Complex Carbs (Comfort)"
            },
            symptom_decoder: {
                title: "Period Symptoms",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Cramps", condition: "Lower abdominal pain", biology: "Prostaglandins trigger uterine contractions to shed lining", diet: "Ginger tea, dark chocolate, salmon, turmeric" },
                    { title: "Fatigue", condition: "Feeling drained", biology: "Iron loss from bleeding + low estrogen & progesterone", diet: "Spinach, red meat, lentils, pumpkin seeds" },
                    { title: "Headaches", condition: "Throbbing pain", biology: "Sudden estrogen drop affects blood vessels in brain", diet: "Magnesium-rich foods, almonds, avocado, water" },
                    { title: "Lower Back Pain", condition: "Aching back", biology: "Prostaglandins cause contractions that radiate to lower back", diet: "Anti-inflammatory foods, fatty fish, walnuts" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Warm Foods", "Iron", "Rest"] },
                avoid: { title: "What to Limit", items: ["Cold Salads", "Caffeine", "HIIT"] }
            }
        }
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 2000, protein: 75, fats: 55, carbs: 260,
                proteinLabel: "75g", fatsLabel: "Low (Light)", carbsLabel: "High (Energy)",
                proteinDesc: "Protein (Muscle Repair)",
                fatsDesc: "Healthy Fats (Hormone Synthesis)",
                carbsDesc: "Complex Carbs (Building Energy)"
            },
            symptom_decoder: {
                title: "Rising Energy",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Energy Surge", condition: "Feeling motivated", biology: "Rising estrogen boosts dopamine & serotonin levels", diet: "Lean protein, fresh fruits, green smoothies" },
                    { title: "Clear Skin", condition: "Glowing complexion", biology: "Estrogen promotes collagen & reduces sebum production", diet: "Berries, citrus fruits, leafy greens, water" },
                    { title: "Increased Focus", condition: "Mental clarity", biology: "Estrogen enhances cognitive function & memory", diet: "Omega-3s, walnuts, blueberries, eggs" },
                    { title: "Light Cervical Mucus", condition: "Vaginal changes", biology: "Estrogen starts producing cervical fluid for fertility", diet: "Hydrating foods, cucumber, watermelon" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Fresh Veggies", "Probiotics", "Cardio"] },
                avoid: { title: "What to Limit", items: ["Heavy Oils", "Processed Sugar"] }
            }
        }
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
                { title: "Date Night", desc: "Romantic or self-date", icon: "Heart" },
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 2100, protein: 80, fats: 60, carbs: 280,
                proteinLabel: "80g", fatsLabel: "Low (Digestion)", carbsLabel: "Peak (Fuel)",
                proteinDesc: "Protein (Support)",
                fatsDesc: "Healthy Fats (Anti-Inflammatory)",
                carbsDesc: "Complex Carbs (Peak Fuel)"
            },
            symptom_decoder: {
                title: "Peak Performance",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Ovulation Pain", condition: "One-sided pelvic twinge", biology: "Egg releasing from ovary can cause mild pain (Mittelschmerz)", diet: "Anti-inflammatory foods, turmeric, ginger" },
                    { title: "Increased Libido", condition: "Heightened desire", biology: "Peak estrogen & testosterone boost sex drive", diet: "Zinc-rich foods, oysters, pumpkin seeds" },
                    { title: "Breast Tenderness", condition: "Sensitive chest", biology: "Hormonal surge causes breast tissue swelling", diet: "Low-sodium foods, flaxseeds, evening primrose" },
                    { title: "Light Spotting", condition: "Minor bleeding", biology: "Estrogen dip during ovulation can cause spotting", diet: "Iron-rich foods, beets, leafy greens" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Fiber", "Cruciferous Veg", "HIIT"] },
                avoid: { title: "What to Limit", items: ["Alcohol", "Heavy Carbs"] }
            }
        }
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
                { title: "Self-Care", desc: "Spa night at home", icon: "Flower2" }
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
                { id: "magnesium", title: "Magnesium", desc: "Relaxation", icon: Pill },
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 1900, protein: 70, fats: 70, carbs: 240,
                proteinLabel: "70g", fatsLabel: "High (Satiety)", carbsLabel: "Low (Stable)",
                proteinDesc: "Protein (Stabilize)",
                fatsDesc: "Healthy Fats (Mood Stability)",
                carbsDesc: "Complex Carbs (Fight Cravings)"
            },
            symptom_decoder: {
                title: "PMS Decoder",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Bloating", condition: "Puffy/swollen feeling", biology: "Progesterone slows digestion & causes water retention", diet: "Potassium-rich bananas, asparagus, cucumber" },
                    { title: "Mood Swings", condition: "Emotional ups & downs", biology: "Progesterone drop affects serotonin & GABA levels", diet: "Complex carbs, oatmeal, sweet potato" },
                    { title: "Cravings", condition: "Sugar/carb hunger", biology: "Serotonin dip triggers comfort food cravings", diet: "Dark chocolate, dates, whole grains" },
                    { title: "Acne Breakouts", condition: "Skin flare-ups", biology: "Rising testosterone increases sebum production", diet: "Zinc, probiotics, low-glycemic foods" },
                    { title: "Breast Tenderness", condition: "Sore/heavy feeling", biology: "Progesterone causes fluid retention in breast tissue", diet: "Reduce caffeine, add vitamin E, flaxseeds" },
                    { title: "Insomnia", condition: "Trouble sleeping", biology: "Progesterone (a sedative) drops before period", diet: "Magnesium, chamomile tea, tart cherry" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Complex Carbs", "Magnesium", "Pilates"] },
                avoid: { title: "What to Limit", items: ["Salt", "Sugar", "Caffeine"] }
            }
        }
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
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-white/60 text-rove-charcoal rounded-lg sm:rounded-full shadow-sm border border-white/60"><Icon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <h2 className="font-heading text-base sm:text-xl text-rove-charcoal">{title}</h2>
        </div>
    );
}

function ActivitiesWidget({ practices, theme }: { practices: any[], theme: any }) {
    const [customItems, setCustomItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState("");
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

    // Load state on mount
    useEffect(() => {
        try {
            const savedCustom = localStorage.getItem('rove_custom_activities');
            if (savedCustom) setCustomItems(JSON.parse(savedCustom));

            const savedChecks = localStorage.getItem('rove_activity_checks');
            // Logic to clear checks if date changed could go here, but simple persistence is fine for now
            if (savedChecks) setCheckedState(JSON.parse(savedChecks));
        } catch (e) {
            console.error("Failed to load local storage", e);
        }
    }, []);

    const toggleCheck = (id: string) => {
        const newState = { ...checkedState, [id]: !checkedState[id] };
        setCheckedState(newState);
        localStorage.setItem('rove_activity_checks', JSON.stringify(newState));
    };

    const addCustom = () => {
        if (!newItem.trim()) return;
        const item = {
            title: newItem,
            desc: "Personal Goal",
            icon: "Star",
            id: `custom-${Date.now()}`,
            isCustom: true
        };
        const next = [...customItems, item];
        setCustomItems(next);
        localStorage.setItem('rove_custom_activities', JSON.stringify(next));
        setNewItem("");
    };

    const removeCustom = (id: string) => {
        const next = customItems.filter(i => i.id !== id);
        setCustomItems(next);
        localStorage.setItem('rove_custom_activities', JSON.stringify(next));
    };

    // Merge lists directly in render for simplicity
    const mergedList = [
        ...practices.map((p, i) => ({ ...p, id: `sys-${p.title || i}`, isCustom: false })),
        ...customItems
    ];

    return (
        <section>
            <SectionHeader title="Activities Recommended For You" icon={CheckCircle2} />
            <div className={cn("backdrop-blur-xl rounded-[1.5rem] border shadow-sm overflow-hidden transition-all duration-500", theme.softBg, theme.border)}>
                <div className="divide-y divide-black/5">
                    {mergedList.map((item) => {
                        const isChecked = checkedState[item.id];
                        return (
                            <div key={item.id} className="group flex items-center gap-4 p-4 hover:bg-white/40 transition-colors cursor-pointer" onClick={() => toggleCheck(item.id)}>
                                {/* Checkbox */}
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0",
                                        isChecked
                                            ? cn("border-transparent scale-110 text-white shadow-sm", theme.accent)
                                            : "border-rove-stone/30 bg-white/50 group-hover:border-rove-stone/50"
                                    )}
                                >
                                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>

                                {/* Text */}
                                <div className="flex-1">
                                    <h4 className={cn(
                                        "font-bold text-sm transition-all duration-300",
                                        isChecked ? "text-rove-stone line-through decoration-rove-stone/50" : "text-rove-charcoal"
                                    )}>
                                        {item.title}
                                    </h4>
                                    {item.desc && <p className="text-[10px] text-rove-stone/80">{item.desc}</p>}
                                </div>

                                {/* Actions */}
                                {item.isCustom && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeCustom(item.id); }}
                                        className="p-2 text-rove-stone/40 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Add Input */}
                <div className="p-3 bg-white/30 border-t border-white/20 flex gap-2 items-center">
                    <input
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustom()}
                        placeholder="Add your own activity or supplement..."
                        className="flex-1 bg-transparent text-sm font-medium placeholder:text-rove-stone/50 outline-none p-2 text-rove-charcoal"
                    />
                    <button
                        onClick={addCustom}
                        disabled={!newItem.trim()}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full text-white transition-all shadow-sm hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            theme.accent
                        )}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
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
        pageGradient: "from-white to-white",
        iconContainer: "bg-rose-100 text-rose-600",
        orbRing: "from-rose-300 via-rose-100 to-rose-400",
        accent: "bg-rose-500",
        primaryGradient: "bg-gradient-to-r from-rose-500 to-pink-600",
        buttonShadow: "shadow-rose-200",
        bannerTextColor: "text-white",
        textShadow: "drop-shadow-sm",
        blob: "bg-rose-200/20",
        glow: "shadow-[0_0_40px_rgba(251,113,133,0.2)]"
    },
    "Follicular": {
        color: "text-teal-600",
        bannerBg: "bg-gradient-to-r from-teal-400 to-emerald-500",
        cardBg: "bg-teal-50/30",
        border: "border-teal-100",
        softBg: "bg-teal-50/30",
        pageGradient: "from-white to-white",
        iconContainer: "bg-teal-100 text-teal-600",
        orbRing: "from-teal-300 via-teal-100 to-teal-400",
        accent: "bg-teal-500",
        primaryGradient: "bg-gradient-to-r from-teal-400 to-emerald-500",
        buttonShadow: "shadow-teal-200",
        bannerTextColor: "text-white",
        textShadow: "drop-shadow-sm",
        blob: "bg-teal-200/15",
        glow: "shadow-[0_0_40px_rgba(45,212,191,0.2)]"
    },
    "Ovulatory": {
        color: "text-amber-950",
        bannerBg: "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100",
        cardBg: "bg-gradient-to-br from-orange-50/50 to-white",
        border: "border-orange-200",
        softBg: "bg-orange-50/50",
        pageGradient: "from-white to-white",
        iconContainer: "bg-orange-100 text-orange-800",
        orbRing: "from-amber-300 via-orange-200 to-amber-300",
        accent: "bg-orange-400",
        primaryGradient: "bg-gradient-to-r from-amber-400 to-orange-500",
        buttonShadow: "shadow-orange-200",
        bannerTextColor: "text-amber-900",
        textShadow: "",
        blob: "bg-orange-200/20",
        glow: "shadow-[0_0_40px_rgba(251,191,36,0.3)]"
    },
    "Luteal": {
        color: "text-indigo-600",
        bannerBg: "bg-gradient-to-r from-indigo-500 to-purple-600",
        cardBg: "bg-indigo-50/30",
        border: "border-indigo-100",
        softBg: "bg-indigo-50/30",
        pageGradient: "from-white to-white",
        iconContainer: "bg-indigo-100 text-indigo-600",
        orbRing: "from-indigo-300 via-indigo-100 to-indigo-400",
        accent: "bg-indigo-500",
        primaryGradient: "bg-gradient-to-r from-indigo-500 to-purple-600",
        buttonShadow: "shadow-indigo-200",
        bannerTextColor: "text-white",
        textShadow: "drop-shadow-sm",
        blob: "bg-indigo-200/15",
        glow: "shadow-[0_0_40px_rgba(129,140,248,0.2)]"
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
    const [unifiedData, setUnifiedData] = useState<UnifiedCycleData | null>(null); // NEW
    const [activeTab, setActiveTab] = useState<'guide' | 'diet' | 'exercise'>('guide');

    // ✅ CLIENT-SIDE RECALCULATION (Unified Smart Logic)
    const [clientDay, setClientDay] = useState<number | null>(null);
    const [clientPhaseName, setClientPhaseName] = useState<string | null>(null);

    useEffect(() => {
        if (unifiedData) {
            // Run the EXACT same logic as Tracker, but on Client (Local Time)
            const result = calculateSmartPhase(new Date(), unifiedData.settings, unifiedData.monthLogs);
            setClientDay(result.day);
            setClientPhaseName(result.phase);
        }
    }, [unifiedData]);

    useEffect(() => {
        const load = async () => {
            try {
                // ⚡ ULTRA-FAST: Single action fetches ALL data in 1 trip
                const { fetchPlanPageDataFast } = await import("@/app/actions/cycle-sync");
                const fastData = await fetchPlanPageDataFast();

                if (fastData?.lifestyle) {
                    setHasPlanSetup(true);
                    if (fastData.lifestyle.weight_kg) setWeight(fastData.lifestyle.weight_kg.toString());
                    if (fastData.lifestyle.height_cm) setHeight(fastData.lifestyle.height_cm.toString());
                    if (fastData.lifestyle.activity_level) setActivity(fastData.lifestyle.activity_level);
                    if (fastData.lifestyle.fitness_goal) setFitnessGoal(fastData.lifestyle.fitness_goal);

                    // Set unified data for smart phase calculation
                    setUnifiedData({
                        settings: fastData.settings,
                        monthLogs: fastData.monthLogs,
                        smartPhase: { phase: fastData.phase, day: fastData.day },
                        userId: ""
                    });

                    // Set legacy data format for UI components
                    setData({
                        phase: fastData.phase,
                        day: fastData.day,
                        blueprint: fastData.blueprint,
                        biometrics: fastData.biometrics,
                        weightGoal: fastData.weightGoal,
                        settings: fastData.settings
                    });
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

    // Helper: Calculate Personalized Macros based on Phase & Biometrics
    const getPersonalizedMacros = (phaseName: string, w: number, h: number, age: number = 30, act: string, goal: string) => {
        // 1. Calculate BMR (Mifflin-St Jeor for Women)
        // BMR = 10W + 6.25H - 5A - 161
        const bmr = (10 * w) + (6.25 * h) - (5 * age) - 161;

        // 2. Activity Multiplier (Refined for User Feedback)
        let multiplier = 1.2; // Sedentary
        if (act === "Active") multiplier = 1.375; // Moderate (was 1.55)
        if (act === "Highly Active") multiplier = 1.55; // High (was 1.725)

        // 3. TDEE (Total Daily Energy Expenditure)
        let tdee = bmr * multiplier;

        // 4. Goal Adjustment (Deficit/Surplus)
        if (goal === "weight_loss") tdee -= 400; // ~0.4kg/week loss
        if (goal === "muscle_gain") tdee += 200; // Small surplus

        // 5. Phase Adjustments (Metabolic Shift)
        // Luteal: +100-200 kcal (Metabolism increases)
        // Follicular: Base
        if (phaseName === "Luteal") tdee += 150;
        if (phaseName === "Follicular") tdee += 50;

        // 6. Weight-Based Protein (Female Physiology Friendly)
        // Standard: 0.8g/kg
        // Active: 1.2 - 1.4g/kg
        // Highly Active: 1.6g/kg
        let proteinPerKg = 1.0;
        if (act === "Active") proteinPerKg = 1.3;
        if (act === "Highly Active") proteinPerKg = 1.6;

        // Phase Tweak: Luteal needs slightly more protein for satiety
        if (phaseName === "Luteal") proteinPerKg += 0.1;

        const proteinGrams = Math.round(w * proteinPerKg);
        const proteinCals = proteinGrams * 4;

        // 7. Healthy Fats (Crucial for Hormones - min 0.8g/kg or 30%)
        let fatPct = 0.30;
        if (phaseName === "Menstrual" || phaseName === "Luteal") fatPct = 0.35; // Higher fat for hormone support

        const fatCals = tdee * fatPct;
        const fatGrams = Math.round(fatCals / 9);

        // 8. Carbs (Remainder)
        const carbCals = Math.max(0, tdee - proteinCals - fatCals);
        const carbGrams = Math.round(carbCals / 4);

        // 9. Qualitative Labels & Descriptions (Phase-Specific Suggestions)
        let cLabel = "Moderate", fLabel = "Moderate", pLabel = "Moderate";
        let cDesc = "Complex Carbs", fDesc = "Healthy Fats", pDesc = "Protein";

        switch (phaseName) {
            case "Menstrual":
                pLabel = `${proteinGrams}g`; pDesc = "Protein (Blood Replenishment)";
                fLabel = "Nourishing"; fDesc = "Healthy Fats (Block Cramps)";
                cLabel = "Comforting"; cDesc = "Complex Carbs (Comfort)";
                break;
            case "Follicular":
                pLabel = `${proteinGrams}g`; pDesc = "Protein (Muscle Repair)";
                fLabel = "Light"; fDesc = "Healthy Fats (Hormone Synthesis)";
                cLabel = "Energizing"; cDesc = "Complex Carbs (Building Energy)";
                break;
            case "Ovulatory":
                pLabel = `${proteinGrams}g`; pDesc = "Protein (Support)";
                fLabel = "Easy Digest"; fDesc = "Healthy Fats (Anti-Inflammatory)";
                cLabel = "Peak Fuel"; cDesc = "Complex Carbs (Peak Fuel)";
                break;
            case "Luteal":
                pLabel = `${proteinGrams}g`; pDesc = "Protein (Stabilize)";
                fLabel = "Satiating"; fDesc = "Healthy Fats (Mood Stability)";
                cLabel = "Stabilizing"; cDesc = "Complex Carbs (Fight Cravings)";
                break;
        }

        return {
            calories: Math.round(tdee),
            protein: proteinGrams,
            fats: fatGrams,
            carbs: carbGrams,
            proteinLabel: pLabel,
            fatsLabel: fLabel,
            carbsLabel: cLabel,
            proteinDesc: pDesc,
            fatsDesc: fDesc,
            carbsDesc: cDesc
        };
    };
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

    if (setupLoading) return <LoadingScreen />;

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
                                    {!isPending && <Wand2 size={18} className="ml-2" />}
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

    const phaseName = clientPhaseName || data.phase || "Menstrual";
    const displayDay = clientDay || data.day;

    // Only use server blueprint if phases match, otherwise fallback to static content for the new phase
    const useServerBlueprint = !clientPhaseName || (clientPhaseName === data.phase);
    let BP = (useServerBlueprint ? data.blueprint : null) || BLUEPRINTS[phaseName] || BLUEPRINTS["Menstrual"];

    // ✅ DYNAMIC OVERRIDE: Personalize Macros if we have user metrics
    if (weight && height) {
        const pMacros = getPersonalizedMacros(
            phaseName,
            parseFloat(weight),
            parseFloat(height),
            30, // Default age if not tracked
            activity || "Active",
            fitnessGoal || "maintenance"
        );

        BP = {
            ...BP,
            nutrition_guide: {
                ...BP.nutrition_guide,
                macro_fuel: pMacros
            }
        };
    }

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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone/60">Day {displayDay} of Cycle</span>
                    </div>

                    <ProfileAvatar />
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-5xl">

                {/* 2. TABS - Modern Pill Design */}
                <div className="mb-6">
                    {/* Swipe hint */}
                    <p className={`text-center text-[9px] font-bold uppercase tracking-widest mb-3 ${theme.color} opacity-60`}>
                        ↔ Tap to explore
                    </p>

                    {/* Tab Container - More compact on mobile */}
                    <div className="relative flex p-1 sm:p-1.5 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/60 shadow-lg shadow-black/5 mx-auto w-full max-w-md">
                        {/* Animated Background Indicator */}
                        <motion.div
                            className={cn(
                                "absolute top-1.5 bottom-1.5 rounded-xl shadow-md",
                                theme.bannerBg
                            )}
                            initial={false}
                            animate={{
                                left: activeTab === 'guide' ? '6px' : activeTab === 'diet' ? 'calc(33.33% + 2px)' : 'calc(66.66% - 2px)',
                                width: 'calc(33.33% - 4px)'
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />

                        {[
                            { id: 'guide', label: 'Guide', icon: Compass },
                            { id: 'diet', label: 'Nutrition', icon: Utensils },
                            { id: 'exercise', label: 'Move', icon: Dumbbell }
                        ].map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "relative z-10 flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-300",
                                        isActive ? cn(theme.bannerTextColor, theme.textShadow) : "text-rove-charcoal/50 hover:text-rove-charcoal/80"
                                    )}
                                >
                                    <tab.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", isActive && theme.textShadow)} />
                                    <span className="uppercase tracking-wide text-[10px] sm:text-xs">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
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
                            <div className={cn("p-5 rounded-2xl relative overflow-hidden shadow-sm flex items-center justify-between gap-4 transition-all duration-500", theme.bannerBg, theme.bannerTextColor)}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-[40px] pointer-events-none" />

                                <div className="relative z-10 text-left">
                                    <p className="opacity-70 uppercase tracking-widest text-[9px] font-bold mb-1">Current Focus</p>
                                    <h3 className="text-xl md:text-2xl font-heading leading-tight">
                                        {BP.rituals.focus}
                                    </h3>
                                </div>
                                <div className={cn("relative z-10 p-2.5 rounded-full backdrop-blur-md border border-black/5", theme.iconContainer)}>
                                    <Compass className="w-5 h-5" />
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



                                        {/* Main Dashboard (Weight Goal + Diet + Activity) */}
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

                            <ActivitiesWidget practices={BP.rituals.practices} theme={theme} />


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
                                                <RiverTrack label="Core Nutrients" items={row1} speed={80} cardClass={cn(theme.cardBg, theme.border)} />
                                                <RiverTrack label="Phase Superfoods" items={row2} direction="right" speed={95} cardClass={cn(theme.cardBg, theme.border)} />
                                                <RiverTrack label="Replenishing" items={row3} speed={90} cardClass={cn(theme.cardBg, theme.border)} />
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
                            <div id="ai-chef" className="scroll-mt-24">
                                <PlateBuilder phase={phaseName} theme={theme} />
                            </div>
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
                                {/* 1. Exercise Orb (Visual Top) */}
                                <ExerciseOrb phase={phaseName} data={BP.exercise} theme={theme} />

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-rove-stone ml-1 flex items-center gap-2">
                                        <span className="w-6 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></span>
                                        Best For This Phase
                                    </h3>

                                    {/* Premium Card Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {BP.exercise.best.slice(0, 4).map((ex: any, i: number) => {
                                            // Assign icons based on exercise type
                                            const getIcon = (title: string) => {
                                                const t = title.toLowerCase();
                                                if (t.includes('yoga') || t.includes('stretch')) return '🧘';
                                                if (t.includes('walk') || t.includes('stroll')) return '🚶';
                                                if (t.includes('hiit') || t.includes('interval')) return '🔥';
                                                if (t.includes('spin') || t.includes('cardio') || t.includes('cycling')) return '🚴';
                                                if (t.includes('lift') || t.includes('strength') || t.includes('weight')) return '🏋️';
                                                if (t.includes('swim')) return '🏊';
                                                if (t.includes('sport') || t.includes('team')) return '⚽';
                                                if (t.includes('pilates')) return '🤸';
                                                if (t.includes('dance')) return '💃';
                                                if (t.includes('run') || t.includes('jog')) return '🏃';
                                                return '💪';
                                            };

                                            return (
                                                <div
                                                    key={i}
                                                    className="group relative p-4 rounded-2xl bg-gradient-to-br from-white via-white to-amber-50/30 border border-white/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                                                >
                                                    {/* Background Number */}
                                                    <div className="absolute -right-2 -top-2 text-6xl font-heading text-amber-100/50 select-none">
                                                        {i + 1}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="relative z-10">
                                                        {/* Icon */}
                                                        <div className="text-2xl mb-2">{getIcon(ex.title)}</div>

                                                        {/* Title */}
                                                        <h4 className="font-bold text-sm text-rove-charcoal mb-1 group-hover:text-amber-600 transition-colors">
                                                            {ex.title}
                                                        </h4>

                                                        {/* Description */}
                                                        <p className="text-[11px] text-rove-stone/80 leading-snug mb-3 line-clamp-2">
                                                            {ex.desc}
                                                        </p>

                                                        {/* Time Badge */}
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                                            <span className="text-[10px] font-semibold text-amber-600">{ex.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Compact Avoid Section */}
                                <div className="p-4 rounded-[1.5rem] bg-gray-50/60 border border-gray-200/60 backdrop-blur-sm">
                                    <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2">
                                        <Ban className="w-3 h-3" /> {phaseName === "Ovulatory" || phaseName === "Ovulation" ? "Watch Out For" : "Avoid This Phase"}
                                    </h4>
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        {BP.exercise.avoid.map((item: string) => (
                                            <span key={item} className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs text-gray-500 shadow-sm opacity-80 decoration-gray-300">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>


                                {/* AI Exercise Builder */}
                                <div id="ai-exercise-builder" className="scroll-mt-24">
                                    <ExerciseBuilder phase={phaseName} theme={theme} />
                                </div>
                            </motion.div>
                        )
                    }

                </AnimatePresence >

            </div >
        </div >
    );
}