"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChefHat, RefreshCw, Zap, Droplets, Activity, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateRoveChefProtocol, type RoveChefProtocol } from "@/app/actions/ai-actions";

// --- TYPES ---
interface RoveChefProps {
    phase: string;
    theme?: any;
    diet: string;
}

type TabType = 'snack' | 'smoothie' | 'gut_sync';

export function RoveChef({ phase, diet }: RoveChefProps) {
    // --- STATE ---
    // Removed local diet/cuisine state in favor of props & defaults

    // Independent state for each item
    const [results, setResults] = useState<Partial<RoveChefProtocol>>({
        snack: undefined,
        smoothie: undefined,
        gut_sync: undefined
    });

    const [activeTab, setActiveTab] = useState<TabType>('snack');
    const [isPending, startTransition] = useTransition();

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
        startTransition(async () => {
            // Generate ONLY the active tab item
            // Use prop diet and default to Global cuisine
            const data = await generateRoveChefProtocol(phase, diet, "Global", activeTab);
            if (data) {
                setResults(prev => ({ ...prev, ...data }));
            }
        });
    };



    const TABS: { id: TabType; label: string; icon: any }[] = [
        { id: 'snack', label: 'Snack', icon: Cookie },
        { id: 'smoothie', label: 'Smoothie', icon: Droplets },
        { id: 'gut_sync', label: 'Gut Sync', icon: Activity },
    ];

    const currentItem = results[activeTab];

    return (
        <section className="mb-12 relative" id="ai-chef">
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
                    Generate your Triple Threat protocol: targeted fuel for your {phase} phase.
                </p>
            </div>

            {/* Main Glass Card */}
            <div className={cn(
                "bg-white/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all border",
                theme.border,
                theme.shadow
            )}>
                {/* 1. TOP TABS (Main Toggle) */}
                <div className="p-2 m-2 bg-gray-100/50 backdrop-blur-sm rounded-[2rem] flex relative z-20">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 py-3 rounded-[1.8rem] text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                                activeTab === tab.id
                                    ? cn(theme.activeTab, "shadow-md scale-[1.02]")
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/30"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? theme.iconColor : "opacity-50")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 pt-2 relative z-10">

                    {/* 2. PREFERENCES (Removed - Auto-fetched) */}
                    <div className="mb-4">
                        <span className={cn("text-xs font-bold uppercase tracking-widest opacity-60", theme.iconColor)}>
                            Curating for: {diet}
                        </span>
                    </div>


                    {/* 3. CONTENT AREA (Bottom) */}
                    <div className="min-h-[300px] relative">
                        <div className={cn("absolute -left-10 top-10 w-32 h-32 rounded-full blur-[50px] opacity-30 pointer-events-none mix-blend-multiply", theme.blob)} />

                        <AnimatePresence mode="wait">
                            {/* Loading State */}
                            {isPending ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-center z-20"
                                >
                                    <div className="relative">
                                        <div className={cn("absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse", theme.blob)} />
                                        <RefreshCw className={cn("w-10 h-10 animate-spin relative z-10", theme.iconColor)} />
                                    </div>
                                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400 animate-pulse">
                                        Chef is curating your {activeTab}...
                                    </p>
                                </motion.div>
                            ) : currentItem ? (
                                /* Result Display */
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="h-full"
                                >
                                    <ResultCard
                                        title={activeTab === 'snack' ? "Cycle Snack" : activeTab === 'smoothie' ? "Hormone Smoothie" : "Gut Sync"}
                                        icon={TABS.find(t => t.id === activeTab)?.icon}
                                        item={currentItem as any}
                                        theme={theme}
                                        isSimple={activeTab === 'gut_sync'}
                                    />

                                    {/* Regenerate Button (Floating) */}
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={handleGenerate}
                                            className={cn("text-xs font-bold flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95", theme.secondaryButton)}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate {activeTab}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                /* Animated Preview (Empty State) */
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-12"
                                >
                                    <div className={cn("w-20 h-20 rounded-3xl rotate-3 flex items-center justify-center mb-8 shadow-xl transition-transform hover:rotate-6 border border-white/50", theme.button)}>
                                        <div className="text-4xl text-white">
                                            {activeTab === 'snack' ? <Cookie /> : activeTab === 'smoothie' ? <Droplets /> : <Activity />}
                                        </div>
                                    </div>

                                    <h3 className="text-gray-900 font-heading text-2xl mb-2">
                                        Ready to nourish?
                                    </h3>

                                    <div className="mb-8">
                                        <AnimatedPlaceholder phase={phase} type={activeTab} />
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        className={cn(
                                            "group relative px-8 py-4 rounded-2xl font-bold text-white text-sm uppercase tracking-wider flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden",
                                            theme.button
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <Sparkles className="w-4 h-4" />
                                        <span className="relative">Generate Fresh {activeTab}</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}

function ResultCard({ title, icon, item, theme, isSimple }: { title: string, icon: any, item: any, theme: any, isSimple?: boolean }) {
    if (!item) return null;
    const Icon = icon;

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

                {/* Ingredients (if not simple) */}
                {!isSimple && item.ingredients && (
                    <div className="mb-8 p-6 bg-white/50 rounded-2xl border border-white/60">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-4 tracking-wide text-center">Ingredients</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {item.ingredients.map((ing: string, i: number) => (
                                <span key={i} className="text-xs bg-white px-4 py-2 rounded-xl border border-gray-100 text-gray-600 shadow-sm font-medium">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Why */}
                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <Sparkles className={cn("w-4 h-4", theme.accentText)} />
                        <span className={cn("text-[10px] font-bold uppercase", theme.accentText)}>Why This Works</span>
                    </div>
                    <p className="text-sm text-gray-500 italic leading-relaxed text-center px-4">
                        "{item.why}"
                    </p>
                </div>
            </div>
        </div>
    );
}

// --- ANIMATED PLACEHOLDER COMPONENT ---
function AnimatedPlaceholder({ phase, type }: { phase: string, type: string }) {
    const [text, setText] = useState("");

    // Examples strictly for animation/preview only
    const examples: Record<string, Record<string, string[]>> = {
        Menstrual: {
            snack: ["Warm Sesame Laddu...", "Iron-Rich Date Bites...", "Steamed Edamame..."],
            smoothie: ["Warm Cacao Elixir...", "Beetroot Recovery Blend...", "Ginger Turmeric Smoothie..."],
            gut_sync: ["Warm Ginger Tea...", "Bone Broth Cup...", "Cumin Water..."]
        },
        Follicular: {
            snack: ["Sprouted Moong Salad...", "Fresh Berry Bowl...", "Fermented Yogurt Parfait..."],
            smoothie: ["Green Goddess Blend...", "Matcha Energy Boost...", "Probiotic Berry Blast..."],
            gut_sync: ["Sauerkraut Forkful...", "Kimchi Side...", "Apple Cider Vinegar Shot..."]
        },
        Ovulatory: {
            snack: ["Raw Carrot Sticks...", "Fresh Fig & Honey...", "Cooling Cucumber Chat..."],
            smoothie: ["Maca Libido Smoothie...", "Raw Cacao Shake...", "Strawberry Glow Blend..."],
            gut_sync: ["Fiber-Rich Psyllium...", "Prebiotic Banana...", "Raw Garlic Honey..."]
        },
        Luteal: {
            snack: ["Roasted Sweet Potato...", "Dark Chocolate Squares...", "Sunflower Seed Mix..."],
            smoothie: ["Golden Milk Smoothie...", "Sweet Potato Pie Shake...", "Calming Chamomile Blend..."],
            gut_sync: ["Roasted Root Veggies...", "Cooked Spinach...", "Warm Lemon Water..."]
        }
    };

    const currentPhase = phase || "Menstrual";
    // Fix: Ensure we access valid keys
    const phaseData = examples[currentPhase] || examples["Menstrual"];
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
