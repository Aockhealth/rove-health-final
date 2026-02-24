"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChefHat, RefreshCw, Droplets, Leaf, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateRoveChefProtocol, type RoveChefProtocol } from "@/app/actions/ai-actions";

// --- TYPES ---
interface RoveChefProps {
    phase: string;
    theme?: any;
    diet: string;
}

type TabType = 'snack' | 'smoothie' | 'salad';

export function RoveChef({ phase, diet }: RoveChefProps) {
    // --- STATE ---
    // Removed local diet/cuisine state in favor of props & defaults

    // Independent state for each item
    const [results, setResults] = useState<Partial<RoveChefProtocol>>({
        snack: undefined,
        smoothie: undefined,
        salad: undefined
    });

    const [activeTab, setActiveTab] = useState<TabType>('snack');
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [cuisinePreference, setCuisinePreference] = useState("");
    const [goalFocus, setGoalFocus] = useState("Hormone balance and steady energy");
    const [currentSymptomsOrCraving, setCurrentSymptomsOrCraving] = useState("");
    const [avoidIngredients, setAvoidIngredients] = useState("");

    // Organic Chromatics Styling
    const currentPhase = phase || "Menstrual";
    const themes: Record<string, any> = {
        "Menstrual": {
            border: "border-phase-menstrual/30",
            shadow: "shadow-phase-menstrual/10",
            iconColor: "text-phase-menstrual",
            button: "bg-phase-menstrual/90 shadow-phase-menstrual/20 hover:bg-phase-menstrual text-white",
            secondaryButton: "bg-phase-menstrual/10 text-phase-menstrual hover:bg-phase-menstrual/20",
            activeTab: "bg-white text-phase-menstrual shadow-sm",
            blob: "bg-phase-menstrual",
        },
        "Follicular": {
            border: "border-phase-follicular/30",
            shadow: "shadow-phase-follicular/10",
            iconColor: "text-phase-follicular",
            button: "bg-phase-follicular/90 shadow-phase-follicular/20 hover:bg-phase-follicular text-white",
            secondaryButton: "bg-phase-follicular/10 text-phase-follicular hover:bg-phase-follicular/20",
            activeTab: "bg-white text-phase-follicular shadow-sm",
            blob: "bg-phase-follicular",
        },
        "Ovulatory": {
            border: "border-phase-ovulatory/30",
            shadow: "shadow-phase-ovulatory/10",
            iconColor: "text-phase-ovulatory",
            button: "bg-phase-ovulatory/90 shadow-phase-ovulatory/20 hover:bg-phase-ovulatory text-white",
            secondaryButton: "bg-phase-ovulatory/10 text-phase-ovulatory hover:bg-phase-ovulatory/20",
            activeTab: "bg-white text-phase-ovulatory shadow-sm",
            blob: "bg-phase-ovulatory",
        },
        "Luteal": {
            border: "border-phase-luteal/30",
            shadow: "shadow-phase-luteal/10",
            iconColor: "text-phase-luteal",
            button: "bg-phase-luteal/90 shadow-phase-luteal/20 hover:bg-phase-luteal text-white",
            secondaryButton: "bg-phase-luteal/10 text-phase-luteal hover:bg-phase-luteal/20",
            activeTab: "bg-white text-phase-luteal shadow-sm",
            blob: "bg-phase-luteal",
        }
    };

    const theme = themes[currentPhase] || themes["Menstrual"];

    const handleGenerate = () => {
        setShowForm(false);
        startTransition(async () => {
            // Generate ONLY the active tab item
            const data = await generateRoveChefProtocol(
                phase,
                diet,
                cuisinePreference,
                activeTab,
                {
                    goalFocus,
                    currentSymptomsOrCraving,
                    avoidIngredients: avoidIngredients
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                }
            );
            if (data) {
                setResults(prev => ({ ...prev, ...data }));
            }
        });
    };



    const TABS: { id: TabType; label: string; icon: any }[] = [
        { id: 'snack', label: 'Snack', icon: Cookie },
        { id: 'smoothie', label: 'Smoothie', icon: Droplets },
        { id: 'salad', label: 'Salad', icon: Leaf },
    ];

    const tabMeta: Record<TabType, { label: string; resultTitle: string }> = {
        snack: { label: "Snack", resultTitle: "Cycle Snack" },
        smoothie: { label: "Smoothie", resultTitle: "Hormone Smoothie" },
        salad: { label: "Salad", resultTitle: "Phase Salad" }
    };

    const activeTabLabel = tabMeta[activeTab].label;
    const currentItem = results[activeTab];

    return (
        <section className="mb-12 relative" id="rove-chef-section">
            {/* Background Decor */}
            <div className={cn("absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none mix-blend-multiply", theme.blob)} />
            <div className={cn("absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-15 pointer-events-none mix-blend-multiply", theme.blob)} />

            {/* Section Header */}
            <div className="px-4 mb-6 relative z-10">
                <div className="flex items-center gap-3 mb-1">
                    <ChefHat className={cn("w-6 h-6", theme.iconColor)} />
                    <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                        Phase Nutrition
                    </span>
                </div>
                <h2 className="font-heading text-3xl text-gray-900">
                    Rove Chef
                </h2>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    Choose one protocol at a time for your {phase} phase.
                </p>
            </div>

            {/* Main Glass Card */}
            <div className={cn(
                "bg-white/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all border",
                theme.border,
                theme.shadow
            )}>
                {/* TOP TABS */}
                <div className="p-1 m-2 bg-gray-100/50 backdrop-blur-sm rounded-full flex relative z-20">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
                            className={cn(
                                "flex-1 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2",
                                activeTab === tab.id
                                    ? cn(theme.activeTab, "shadow-md scale-[1.02]")
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/30"
                            )}
                        >
                            <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? theme.iconColor : "opacity-50")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5 pt-3 relative z-10">
                    {/* Curating badge */}
                    <div className="mb-4 flex items-center">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full bg-white/60 border border-white/80 shadow-sm text-[9px] font-bold uppercase tracking-widest", theme.iconColor)}>
                            Curating for: {diet || "Balanced"}
                        </span>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="relative">
                        <div className={cn("absolute -left-10 top-10 w-32 h-32 rounded-full blur-[50px] opacity-30 pointer-events-none mix-blend-multiply", theme.blob)} />

                        <AnimatePresence mode="wait">
                            {isPending ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col items-center justify-center text-center py-16"
                                >
                                    <div className="relative">
                                        <div className={cn("absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse", theme.blob)} />
                                        <RefreshCw className={cn("w-10 h-10 animate-spin relative z-10", theme.iconColor)} />
                                    </div>
                                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400 animate-pulse">
                                        Chef is curating your {activeTabLabel.toLowerCase()}...
                                    </p>
                                </motion.div>
                            ) : currentItem ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <ResultCard
                                        title={tabMeta[activeTab].resultTitle}
                                        item={currentItem as any}
                                        theme={theme}
                                        isSimple={false}
                                    />
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className={cn("text-xs font-bold flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95", theme.secondaryButton)}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate {activeTabLabel}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                /* Empty state */
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center text-center py-8"
                                >
                                    <div className={cn("w-16 h-16 rounded-3xl rotate-3 flex items-center justify-center mb-4 shadow-xl transition-transform hover:rotate-6 border border-white/50", theme.button)}>
                                        <div className="text-2xl text-white">
                                            {activeTab === 'snack' ? <Cookie /> : activeTab === 'smoothie' ? <Droplets /> : <Leaf />}
                                        </div>
                                    </div>

                                    <h3 className="text-gray-900 font-heading text-xl mb-1">Ready to nourish?</h3>
                                    <div className="mb-5"><AnimatedPlaceholder phase={phase} type={activeTab} /></div>

                                    {/* Progressive disclosure */}
                                    <AnimatePresence mode="wait">
                                        {showForm ? (
                                            <motion.div
                                                key="form"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                className="w-full overflow-hidden"
                                            >
                                                <div className="mb-4 grid grid-cols-1 gap-2.5 text-left">
                                                    <label className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone ml-1">Cuisine Style</span>
                                                        <div className="relative">
                                                            <select value={cuisinePreference} onChange={(e) => setCuisinePreference(e.target.value)} className="w-full appearance-none bg-white/40 border border-white/60 rounded-xl px-3 py-2 text-xs font-medium text-rove-charcoal focus:outline-none focus:bg-white/60 transition-all cursor-pointer">
                                                                <option value="">Auto (Profile)</option>
                                                                <option value="Indian">Indian</option>
                                                                <option value="Mediterranean">Mediterranean</option>
                                                                <option value="Asian">Asian</option>
                                                                <option value="Global">Global</option>
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-rove-stone">
                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    <label className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-rove-stone ml-1">Avoid Ingredients</span>
                                                        <input type="text" value={avoidIngredients} onChange={(e) => setAvoidIngredients(e.target.value)} placeholder="e.g. peanuts, dairy, soy..." className="w-full bg-white/40 border border-white/60 rounded-xl px-3 py-2 text-xs font-medium text-rove-charcoal placeholder:text-rove-stone/60 focus:outline-none focus:bg-white/60 transition-all" />
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setShowForm(false)} className="text-xs font-bold px-4 py-2.5 rounded-full border border-rove-stone/20 text-rove-stone hover:bg-white/40 transition-all">
                                                        Cancel
                                                    </button>
                                                    <button onClick={handleGenerate} className={cn("flex-1 group relative px-6 py-2.5 rounded-2xl font-bold text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95 overflow-hidden", theme.button)}>
                                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span className="relative">Generate {activeTabLabel}</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.button
                                                key="cta"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => setShowForm(true)}
                                                className={cn(
                                                    "group relative px-8 py-3.5 rounded-2xl font-bold text-white text-sm uppercase tracking-wider flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden",
                                                    theme.button
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                <Sparkles className="w-4 h-4" />
                                                <span className="relative">Generate {activeTabLabel}</span>
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ResultCard({ title, item, theme, isSimple }: { title: string, item: any, theme: any, isSimple?: boolean }) {
    const [activeView, setActiveView] = useState<'ingredients' | 'recipe'>('ingredients');

    if (!item) return null;

    return (
        <div className="bg-white/60 border border-white/80 rounded-[2rem] p-8 flex flex-col h-full shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">

            <div className="relative z-10">
                <div className="flex flex-col items-center text-center mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{title}</p>
                    <h4 className="font-heading text-3xl text-gray-800 leading-tight mb-4">{item.name}</h4>
                    <div className={cn("h-1 w-12 rounded-full", theme.blob)} />
                </div>

                {/* Description */}
                <p className="text-base text-gray-600 mb-8 leading-relaxed text-center max-w-lg mx-auto">
                    {item.description}
                </p>

                {/* Ingredients / Recipe Toggle (if not simple and has instructions) */}
                {!isSimple && item.ingredients && (
                    <div className="mb-8 flex justify-center">
                        <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl inline-flex border border-white/60 shadow-inner">
                            <button
                                onClick={() => setActiveView('ingredients')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300",
                                    activeView === 'ingredients'
                                        ? cn(theme.blob, "text-white shadow-md transform scale-105")
                                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                )}
                            >
                                Ingredients
                            </button>
                            {item.instructions && item.instructions.length > 0 && (
                                <button
                                    onClick={() => setActiveView('recipe')}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ml-1",
                                        activeView === 'recipe'
                                            ? cn(theme.blob, "text-white shadow-md transform scale-105")
                                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                    )}
                                >
                                    Recipe
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Content Area Based on Toggle */}
                <div className="mb-8 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[140px]">
                    <AnimatePresence mode="wait">
                        {activeView === 'ingredients' || isSimple || !item.ingredients ? (
                            <motion.div
                                key="ingredients"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {item.ingredients ? (
                                    <div className="space-y-3">
                                        {item.ingredients.map((ing: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm transition-all hover:shadow-md hover:bg-white/80">
                                                <div className={cn("w-2 h-2 rounded-full shrink-0 shadow-sm", theme.blob)} />
                                                <span className="text-sm text-gray-800 font-medium">
                                                    {ing}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 text-sm italic py-4">No specific ingredients needed.</p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="recipe"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {item.instructions?.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-4 items-start p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm transition-all hover:shadow-md hover:bg-white/80">
                                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]", theme.blob)}>
                                            {i + 1}
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed font-medium pt-1">{step}</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Why */}
                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <Sparkles className={cn("w-4 h-4", theme.iconColor)} />
                        <span className={cn("text-[10px] font-bold uppercase", theme.iconColor)}>Why This Works</span>
                    </div>
                    <p className="text-sm text-gray-500 italic leading-relaxed text-center px-4">
                        "{item.why}"
                    </p>
                </div>
            </div>
        </div>
    );
}

const ANIMATED_EXAMPLES: Record<string, Record<string, string[]>> = {
    Menstrual: {
        snack: ["Warm Sesame Laddu...", "Iron-Rich Date Bites...", "Steamed Edamame..."],
        smoothie: ["Warm Cacao Elixir...", "Beetroot Recovery Blend...", "Ginger Turmeric Smoothie..."],
        salad: ["Warm Beetroot Salad...", "Iron-Rich Spinach Bowl...", "Roasted Pumpkin Toss..."]
    },
    Follicular: {
        snack: ["Sprouted Moong Salad...", "Fresh Berry Bowl...", "Fermented Yogurt Parfait..."],
        smoothie: ["Green Goddess Blend...", "Matcha Energy Boost...", "Probiotic Berry Blast..."],
        salad: ["Sprout & Moong Salad...", "Tangy Cucumber Raita Bowl...", "Fresh Herb Garden Toss..."]
    },
    Ovulatory: {
        snack: ["Raw Carrot Sticks...", "Fresh Fig & Honey...", "Cooling Cucumber Chat..."],
        smoothie: ["Maca Libido Smoothie...", "Raw Cacao Shake...", "Strawberry Glow Blend..."],
        salad: ["Cooling Kachumber Salad...", "Watermelon Feta Bowl...", "Chana Chaat Crunch..."]
    },
    Luteal: {
        snack: ["Roasted Sweet Potato...", "Dark Chocolate Squares...", "Sunflower Seed Mix..."],
        smoothie: ["Golden Milk Smoothie...", "Sweet Potato Pie Shake...", "Calming Chamomile Blend..."],
        salad: ["Warm Sweet Potato Salad...", "Roasted Veggie Bowl...", "Quinoa Crunch Salad..."]
    }
};

// --- ANIMATED PLACEHOLDER COMPONENT ---
function AnimatedPlaceholder({ phase, type }: { phase: string, type: string }) {
    const [text, setText] = useState("");


    const currentPhase = phase || "Menstrual";
    // Fix: Ensure we access valid keys
    const phaseData = ANIMATED_EXAMPLES[currentPhase] || ANIMATED_EXAMPLES["Menstrual"];
    const phaseExamples = phaseData[type] || phaseData["snack"]; // Fallback to snack if type is weird

    useEffect(() => {
        let currentIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeoutId: NodeJS.Timeout;

        const typeEffect = () => {
            // Safety check in case phaseExamples is undefined
            if (!phaseExamples || phaseExamples.length === 0) return;

            const currentString = phaseExamples[currentIndex];
            if (!currentString) return;

            if (isDeleting) {
                setText(currentString.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setText(currentString.substring(0, charIndex + 1));
                charIndex++;
            }

            let typeSpeed = 50;

            if (!isDeleting && charIndex === currentString.length) {
                isDeleting = true;
                typeSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentIndex = (currentIndex + 1) % phaseExamples.length;
                typeSpeed = 500; // Pause before typing next
            }

            timeoutId = setTimeout(typeEffect, typeSpeed);
        };

        timeoutId = setTimeout(typeEffect, 500);

        return () => clearTimeout(timeoutId);
    }, [phaseExamples]);

    return (
        <div className="h-6">
            <span className="text-gray-400 italic text-sm font-medium">
                Maybe: {text}
                <span className="animate-pulse">|</span>
            </span>
        </div>
    );
}
