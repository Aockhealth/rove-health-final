"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChefHat, RefreshCw, Utensils, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAIRecipe, type RecipeType, type DietPreference, type AIRecipe } from "@/app/actions/ai-actions";

// --- TYPES ---
type Restriction = "Gluten-Free" | "Dairy-Free" | "Nut-Free";

interface PlateBuilderProps {
    phase: string;
    theme: any;
}

// --- FALLBACK RECIPES (Used when AI fails) ---
const FALLBACK_RECIPES: Record<string, Record<RecipeType, AIRecipe[]>> = {
    "Menstrual": {
        smoothie: [
            { name: "Iron Restore Smoothie", ingredients: "Spinach, banana, dates, almond milk, cacao", why: "Iron + magnesium to replenish blood loss and reduce cramps." },
            { name: "Beetroot Power Shake", ingredients: "Beetroot, carrot, orange, ginger, coconut water", why: "Blood-building beets with vitamin C for iron absorption." },
        ],
        dish: [
            { name: "Comfort Dal Khichdi", ingredients: "Rice, moong dal, ghee, turmeric, cumin", why: "Easy to digest, iron-rich, and deeply comforting." },
            { name: "Spinach Paneer Curry", ingredients: "Paneer, spinach, tomatoes, cream, spices", why: "Iron from spinach + protein from paneer." },
        ],
        meal_prep: [
            { name: "Iron Power Bowl Prep", ingredients: "Lentils, spinach, sweet potato, tahini (4 servings)", why: "Batch cook for iron-rich lunches all week." },
        ]
    },
    "Follicular": {
        smoothie: [
            { name: "Green Detox Smoothie", ingredients: "Kale, cucumber, green apple, lemon, chia", why: "Support liver detox as estrogen rises." },
        ],
        dish: [
            { name: "Rainbow Stir-Fry", ingredients: "Tofu, bell peppers, broccoli, sesame, rice", why: "Fresh veggies support estrogen metabolism." },
        ],
        meal_prep: [
            { name: "Protein Energy Balls", ingredients: "Oats, nut butter, dates, protein powder (12 balls)", why: "Grab-and-go snacks for active days." },
        ]
    },
    "Ovulatory": {
        smoothie: [
            { name: "Fiber Flush Smoothie", ingredients: "Papaya, flax, spinach, coconut water, mint", why: "High fiber to bind excess estrogen at peak." },
        ],
        dish: [
            { name: "Raw Rainbow Bowl", ingredients: "Shredded veggies, sprouts, avocado, seeds", why: "Raw fiber-rich foods support estrogen clearance." },
        ],
        meal_prep: [
            { name: "Cruciferous Crunch Slaw", ingredients: "Cabbage, broccoli, kale, apple cider dressing (5 servings)", why: "DIM from cruciferous veggies helps estrogen balance." },
        ]
    },
    "Luteal": {
        smoothie: [
            { name: "Craving Crusher Smoothie", ingredients: "Banana, cacao, almond butter, dates, oat milk", why: "Complex carbs + magnesium to curb PMS cravings." },
        ],
        dish: [
            { name: "Loaded Sweet Potato", ingredients: "Baked sweet potato, black beans, avocado, salsa", why: "Complex carbs + fiber to stabilize blood sugar." },
        ],
        meal_prep: [
            { name: "Chickpea Curry Batch", ingredients: "Chickpeas, tomatoes, coconut milk, spices (6 servings)", why: "B6-rich comfort food ready to reheat." },
        ]
    }
};

export function PlateBuilder({ phase, theme }: PlateBuilderProps) {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<RecipeType>("dish");
    const [dietPref, setDietPref] = useState<DietPreference>("Veg");
    const [restrictions, setRestrictions] = useState<Restriction[]>([]);
    const [customInstruction, setCustomInstruction] = useState("");
    const [result, setResult] = useState<AIRecipe | null>(null);
    const [isAI, setIsAI] = useState(true); // Track if result came from AI
    const [isPending, startTransition] = useTransition();

    // Load preferences from localStorage
    useEffect(() => {
        try {
            const savedDiet = localStorage.getItem("rove_diet_pref");
            if (savedDiet) setDietPref(savedDiet as DietPreference);

            const savedRestrictions = localStorage.getItem("rove_diet_restrictions");
            if (savedRestrictions) setRestrictions(JSON.parse(savedRestrictions));
        } catch (e) {
            console.error("Failed to load preferences", e);
        }
    }, []);

    // Save preferences when changed
    const updateDietPref = (pref: DietPreference) => {
        setDietPref(pref);
        localStorage.setItem("rove_diet_pref", pref);
    };

    const toggleRestriction = (r: Restriction) => {
        const next = restrictions.includes(r)
            ? restrictions.filter(x => x !== r)
            : [...restrictions, r];
        setRestrictions(next);
        localStorage.setItem("rove_diet_restrictions", JSON.stringify(next));
    };

    // Generate Recipe with AI (fallback to static)
    const handleGenerate = () => {
        setResult(null);

        startTransition(async () => {
            try {
                // Try AI first
                const aiResult = await generateAIRecipe({
                    phase,
                    recipeType: activeTab,
                    dietPreference: dietPref,
                    restrictions,
                    customInstruction: customInstruction.trim() || undefined
                });

                if (aiResult) {
                    setResult(aiResult);
                    setIsAI(true);
                    return;
                }
            } catch (error) {
                console.error("AI generation failed:", error);
            }

            // Fallback to static recipes
            const phaseRecipes = FALLBACK_RECIPES[phase] || FALLBACK_RECIPES["Menstrual"];
            const tabRecipes = phaseRecipes[activeTab] || [];
            const randomRecipe = tabRecipes[Math.floor(Math.random() * tabRecipes.length)];

            if (randomRecipe) {
                setResult(randomRecipe);
                setIsAI(false);
            }
        });
    };

    // Reset when tab changes
    useEffect(() => {
        setResult(null);
    }, [activeTab, phase]);

    // --- TAB DEFINITIONS ---
    const TABS: { id: RecipeType; label: string; emoji: string }[] = [
        { id: "smoothie", label: "Smoothie", emoji: "🥤" },
        { id: "dish", label: "Dish", emoji: "🍲" },
        { id: "meal_prep", label: "Meal Prep", emoji: "🥗" }
    ];

    const DIET_OPTIONS: DietPreference[] = ["Veg", "Non-Veg", "Vegan", "Jain"];
    const RESTRICTION_OPTIONS: Restriction[] = ["Gluten-Free", "Dairy-Free", "Nut-Free"];

    return (
        <section className="mb-10">
            {/* Section Header */}
            <div className="px-2 mb-6">
                <span className="text-xs font-bold tracking-widest text-rove-stone/60 uppercase block mb-1">
                    Personalized Recipes
                </span>
                <h2 className="font-heading text-2xl text-rove-charcoal flex items-center gap-2">
                    <ChefHat className="w-6 h-6" /> AI Chef
                    <span className={cn("ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white flex items-center gap-1", theme.accent)}>
                        <Zap className="w-3 h-3" /> Powered by AI
                    </span>
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                <div className={cn("absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none", theme.blob)} />

                <div className="p-6 relative z-10">
                    <AnimatePresence mode="wait">
                        {!result && !isPending ? (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {/* Tabs */}
                                <div className="flex gap-2">
                                    {TABS.map(tab => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border",
                                                    isActive
                                                        ? cn("bg-white shadow-md border-gray-100 text-rove-charcoal", theme.color)
                                                        : "bg-gray-50 border-transparent text-rove-stone/70 hover:bg-gray-100"
                                                )}
                                            >
                                                <span className="text-lg">{tab.emoji}</span>
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Diet Preference */}
                                <div>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-rove-stone/60 mb-3 tracking-wide">
                                        <Info className="w-3 h-3" /> Your Preference
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {DIET_OPTIONS.map(opt => {
                                            const isSelected = dietPref === opt;
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => updateDietPref(opt)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border",
                                                        isSelected
                                                            ? cn("text-white border-transparent shadow-md", theme.accent)
                                                            : "bg-white text-rove-charcoal/80 border-gray-200 hover:border-gray-300"
                                                    )}
                                                >
                                                    {isSelected && "✓ "}{opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Restrictions */}
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-rove-stone/60 mb-3 tracking-wide block">
                                        Restrictions (optional)
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {RESTRICTION_OPTIONS.map(opt => {
                                            const isSelected = restrictions.includes(opt);
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => toggleRestriction(opt)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                        isSelected
                                                            ? "bg-rove-charcoal text-white border-transparent shadow-sm"
                                                            : "bg-white text-rove-stone/70 border-gray-200 hover:border-gray-300"
                                                    )}
                                                >
                                                    {isSelected ? "✓ " : "+ "}{opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Instruction */}
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 focus-within:bg-white focus-within:ring-2 ring-black/5 transition-all">
                                    <span className="text-[10px] font-bold uppercase text-rove-stone/60 mb-2 tracking-wide block">
                                        Special Request (AI will consider this)
                                    </span>
                                    <input
                                        type="text"
                                        value={customInstruction}
                                        onChange={e => setCustomInstruction(e.target.value)}
                                        placeholder='e.g., "Low carb", "Use leftover rice", "Kid-friendly"'
                                        className="w-full bg-transparent text-sm text-rove-charcoal placeholder:text-rove-stone/50 outline-none"
                                    />
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-bold text-white text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden",
                                        theme.primaryGradient,
                                        theme.buttonShadow
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors duration-300" />
                                    <Sparkles className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">Create {phase} {TABS.find(t => t.id === activeTab)?.label}</span>
                                </button>
                            </motion.div>
                        ) : isPending ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-20 flex flex-col items-center justify-center text-center"
                            >
                                <div className="relative mb-4">
                                    <RefreshCw className="w-10 h-10 text-rove-charcoal/20 animate-spin" />
                                    <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-rove-stone/50 animate-pulse">
                                    AI is crafting your {activeTab === "smoothie" ? "smoothie" : "recipe"}...
                                </p>
                                <p className="text-[10px] text-rove-stone/40 mt-2">
                                    Considering your {phase} phase + {dietPref} preference
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Result Card */}
                                <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 relative overflow-hidden">
                                    <div className={cn("absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] opacity-40", theme.blob)} />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
                                                {TABS.find(t => t.id === activeTab)?.emoji}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white", theme.accent)}>
                                                        {phase}
                                                    </span>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-rove-stone/60">
                                                        {dietPref}
                                                    </span>
                                                    {isAI && (
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-0.5">
                                                            <Zap className="w-2.5 h-2.5" /> AI Generated
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-heading text-xl text-rove-charcoal leading-tight">{result!.name}</h4>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-[10px] font-bold uppercase text-rove-stone/60 mb-2 block tracking-wide">
                                                Ingredients
                                            </span>
                                            <p className="text-sm text-rove-charcoal/90 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                {result!.ingredients}
                                            </p>
                                        </div>

                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                            <span className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase mb-2 tracking-wide", theme.color)}>
                                                <Sparkles className="w-3 h-3" /> Why This Works
                                            </span>
                                            <p className="text-sm text-rove-stone leading-relaxed italic">
                                                "{result!.why}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isPending}
                                        className={cn(
                                            "flex-1 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all border shadow-sm",
                                            "bg-white border-gray-200 text-rove-charcoal hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
                                        )}
                                    >
                                        <Sparkles className="w-4 h-4" /> New Recipe
                                    </button>
                                    <button
                                        onClick={() => setResult(null)}
                                        className="flex-1 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider text-rove-stone/70 bg-transparent border border-gray-200 hover:bg-gray-50 transition-all"
                                    >
                                        ← Start Over
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

