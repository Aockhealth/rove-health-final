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
    Shield, Droplets, AlertCircle, Sun
} from "lucide-react";

// --- Icon Map for River + Facts ---
const iconMap: Record<string, any> = {
    "Pill": Pill, "Leaf": Leaf, "Utensils": Utensils, "Cherry": Utensils, "Soup": Soup,
    "Coffee": Coffee, "Moon": Moon, "Footprints": Footprints, "Brain": Brain, "Activity": Activity,
    "Wind": Wind, "Zap": Zap, "Music": Music, "Dumbbell": Activity, "Bike": Bike, "Fish": Fish,
    "Carrot": Carrot, "Wheat": Wheat, "Drumstick": Drumstick, "Heart": Heart, "Sparkles": Sparkles,
    "Shield": Shield, "Droplets": Droplets, "Flame": Flame, "AlertCircle": AlertCircle, "Sun": Sun
};

function Counter({ from, to }: { from: number; to: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(from, to, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = value.toFixed(0);
            },
        });

        return () => controls.stop();
    }, [from, to]);

    return <span ref={nodeRef} />;
}

function RiverTrack({ items = [], direction = "left", speed = 20, label, colorClass }: { items?: any[], direction?: "left" | "right", speed?: number, label: string, colorClass: string }) {
    // Duplicate for seamless loop
    const riverItems = [...items, ...items, ...items, ...items];

    return (
        <div className="w-full overflow-hidden mb-6">
            <div className="px-1 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/70">{label}</span>
            </div>
            <motion.div
                className="flex gap-3 w-max will-change-transform"
                initial={{ x: direction === "left" ? 0 : "-50%" }}
                animate={{ x: direction === "left" ? "-50%" : 0 }}
                transition={{ duration: speed, ease: "linear", repeat: Infinity }}
            >
                {riverItems.map((item, i) => {
                    const Icon = iconMap[item.icon] || Sparkles;
                    return (
                        <div key={i} className="w-auto min-w-[200px] flex-shrink-0 p-3 rounded-2xl bg-white border border-rove-stone/10 shadow-sm flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-rove-cream text-rove-charcoal shadow-sm", colorClass)}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-heading text-sm text-rove-charcoal leading-tight whitespace-nowrap">{item.title}</h4>
                                <p className="text-rove-stone text-[10px] uppercase tracking-wide whitespace-nowrap">{item.desc}</p>
                            </div>
                        </div>
                    )
                })}
            </motion.div>
        </div>
    );
}

// --- Components ---

function HormoneHorizon({ hormones }: { hormones: any }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-white border border-rove-stone/10 shadow-sm">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-rove-cream rounded-full flex-shrink-0">
                    <Waves className="w-5 h-5 text-rove-charcoal" />
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-rove-stone font-bold">Hormone Status</div>
                    <div className="text-sm font-heading text-rove-charcoal">{hormones.text}</div>
                </div>
            </div>

            {/* Mobile: Simple Status Tags */}
            <div className="flex md:hidden gap-2 w-full mt-2">
                <Badge variant="outline" className={cn("text-xs flex-1 justify-center", hormones.estrogen === "High" || hormones.estrogen === "Peak" ? "bg-rove-green/10 text-rove-green border-rove-green/20" : "text-rove-stone")}>
                    E: {hormones.estrogen}
                </Badge>
                <Badge variant="outline" className={cn("text-xs flex-1 justify-center", hormones.progesterone === "Dominant" ? "bg-amber-100 text-amber-600 border-amber-200" : "text-rove-stone")}>
                    P: {hormones.progesterone}
                </Badge>
            </div>

            {/* Desktop: Visual Bars */}
            <div className="hidden md:flex gap-4 flex-1 w-full">
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] uppercase text-rove-stone">
                        <span>Estrogen</span>
                        <span className={hormones.estrogen === "High" || hormones.estrogen === "Peak" ? "text-rove-green font-bold" : ""}>{hormones.estrogen}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${hormones.estrogen === "Peak" ? "bg-rove-charcoal w-full" : hormones.estrogen === "Rising" ? "bg-rove-charcoal/60 w-3/4" : "bg-rove-charcoal/20 w-1/4"}`}
                        />
                    </div>
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] uppercase text-rove-stone">
                        <span>Progesterone</span>
                        <span className={hormones.progesterone === "Dominant" ? "text-amber-500 font-bold" : ""}>{hormones.progesterone}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${hormones.progesterone === "Dominant" ? "bg-amber-400 w-full" : hormones.progesterone === "Rising" ? "bg-amber-400/60 w-3/4" : "bg-amber-400/20 w-1/4"}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function MacroVisualizer({ nutrition, biometrics }: { nutrition: any, biometrics: any }) {
    const { macros, calories } = nutrition;
    return (
        <div className="relative p-5 md:p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rove-green/5 rounded-full blur-3xl -mr-10 -mt-10" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center relative z-10">
                {/* Calorie Dial - Glass Gauge */}
                <div className="text-center md:text-left flex flex-row md:flex-col items-center gap-4 md:gap-0">
                    <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center flex-shrink-0">
                        {/* SVG Rings */}
                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                            {/* Background Track */}
                            <circle cx="50" cy="50" r="46" fill="none" stroke="#E5E7EB" strokeWidth="1.5" />
                            {/* Progress Ring */}
                            <defs>
                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2F363F" />
                                    <stop offset="100%" stopColor="#6B7280" />
                                </linearGradient>
                            </defs>
                            <motion.circle
                                cx="50" cy="50" r="46"
                                fill="none"
                                stroke="url(#gaugeGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>

                        {/* Inner Glass */}
                        <div className="absolute inset-3 bg-white/60 rounded-full backdrop-blur-md border border-white/60 shadow-inner" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center pt-2">
                            <div className="text-2xl md:text-3xl font-heading text-rove-charcoal leading-none">
                                <Counter from={0} to={calories} />
                            </div>
                            <span className="text-[9px] uppercase text-rove-stone tracking-widest font-bold mt-1">KCAL</span>
                        </div>
                    </div>

                    <p className="hidden md:block text-[10px] text-rove-stone max-w-[150px] leading-tight mx-auto mt-4 text-center">
                        {biometrics.reason}
                    </p>
                </div>

                {/* Mobile Reason Text */}
                <div className="md:hidden text-center -mt-2 mb-2">
                    <p className="text-[10px] text-rove-stone leading-tight px-4 italic">"{biometrics.reason}"</p>
                </div>

                {/* Gram Bars */}
                <div className="w-full space-y-3 md:space-y-4">
                    {[
                        { label: "Protein", val: macros.protein.g, color: "bg-rove-red", width: macros.protein.pct, desc: "Muscle repair" },
                        { label: "Healthy Fats", val: macros.fats.g, color: "bg-amber-400", width: macros.fats.pct, desc: "Hormone production" },
                        { label: "Carbs", val: macros.carbs.g, color: "bg-rove-green", width: macros.carbs.pct, desc: "Energy fuel" },
                    ].map((m) => (
                        <div key={m.label} className="space-y-1">
                            <div className="flex justify-between items-end mb-1">
                                <div>
                                    <div className="text-xs font-bold uppercase text-rove-charcoal/80">{m.label}</div>
                                    <div className="text-[10px] text-rove-stone">{m.desc}</div>
                                </div>
                                <span className="text-sm font-heading">{m.val}g</span>
                            </div>
                            <div className="h-2.5 md:h-3 bg-white/50 rounded-full overflow-hidden border border-white/20">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.width}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${m.color} shadow-sm relative overflow-hidden`}
                                >
                                    <div className="absolute inset-0 bg-white/20" />
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BioFactCarousel({ facts }: { facts: any[] }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!facts || facts.length === 0) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % facts.length);
        }, 6000); // 6s rotation
        return () => clearInterval(interval);
    }, [facts]);

    if (!facts || facts.length === 0) return null;

    const fact = facts[index];
    const Icon = iconMap[fact.icon] || Sparkles;

    return (
        <div
            className="p-5 md:p-6 rounded-[2rem] bg-gradient-to-br from-rove-charcoal via-gray-900 to-rove-charcoal/90 text-white shadow-xl shadow-rove-charcoal/10 relative overflow-hidden h-full flex flex-col justify-center min-h-[220px]"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] pointer-events-none animate-pulse" />

            <div className="relative z-10 w-full">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md">
                        <Info className="w-3.5 h-3.5 text-rove-gold" />
                    </div>
                    <h3 className="font-heading text-sm uppercase tracking-widest text-rove-gold/90">Body Intelligence</h3>

                    {/* Progress dots */}
                    <div className="ml-auto flex gap-1">
                        {facts.map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full transition-all duration-300 ${i === index ? "bg-white w-3" : "bg-white/20"}`} />
                        ))}
                    </div>
                </div>

                <div className="h-[120px] relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex-shrink-0">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-heading text-xl md:text-2xl leading-none text-white">{fact.title}</h4>
                                    <p className="text-sm text-rove-stone/80 leading-relaxed">
                                        {fact.text}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}


// --- Main Page ---

export default function DetailedPlanPage() {
    const [data, setData] = useState<any>(null);

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
        <div className="min-h-screen bg-rove-cream/20 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">

                {/* Header with Hormone Horizon */}
                <header className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-rove-stone">Cycle Science</span>
                            <Badge className="bg-rove-charcoal px-2 py-0.5 text-[10px] md:text-xs">Phase {data.phase}</Badge>
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl text-rove-charcoal">Daily Plan</h1>
                    </div>
                    <HormoneHorizon hormones={data.nutrition.hormones} />

                    {/* Symptom Ticker */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        <div className="text-xs font-bold text-rove-stone uppercase whitespace-nowrap pt-1">Forecast:</div>
                        {data.nutrition.symptoms.map((sym: string) => (
                            <Badge key={sym} variant="secondary" className="bg-white border-rove-stone/20 text-rove-stone font-normal whitespace-nowrap text-xs">
                                {sym}
                            </Badge>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-2">
                        <MacroVisualizer nutrition={data.nutrition} biometrics={data.biometrics} />
                    </div>
                    <div className="md:col-span-1">
                        <BioFactCarousel facts={data.nutrition.bio_facts} />
                    </div>
                </div>

                {/* Flow River Animation (Diet & Exercise) */}
                <div className="space-y-2 -mx-4 md:-mx-8 py-4 overflow-hidden">
                    <RiverTrack
                        label="Suggested Diet & Supplements"
                        items={data.nutrition.diet_river}
                        direction="left"
                        speed={35}
                        colorClass="bg-rove-green/10 text-rove-green"
                    />
                    <RiverTrack
                        label="Recommended Yoga & Movement"
                        items={data.nutrition.exercise_river}
                        direction="right"
                        speed={40}
                        colorClass="bg-rove-red/10 text-rove-red"
                    />
                </div>
            </div>
        </div>
    );
}
