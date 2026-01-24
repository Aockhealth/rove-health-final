"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Dumbbell, RefreshCw, RotateCcw, Home, Building2, Trophy, Medal, Star, BicepsFlexed, Footprints, HeartPulse, Activity, Brain, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface ExerciseBuilderProps {
    phase: string;
    theme: any;
}

// --- AI LOGIC: DATA POOLS ---

const EXERCISE_POOL: any = {
    "Upper Body": {
        "Home": ["Pushups", "Tricep Dips (Chair)", "Pike Pushups", "Doorframe Rows", "Shoulder Taps"],
        "Gym": ["Bench Press", "Lat Pulldown", "Overhead Press", "Cable Rows", "Dumbbell Flys"]
    },
    "Lower Body": {
        "Home": ["Bodyweight Squats", "Lunges", "Glute Bridges", "Calf Raises", "Wall Sit"],
        "Gym": ["Barbell Squats", "Leg Press", "Romanian Deadlift", "Leg Extensions", "Calf Raise Machine"]
    },
    "Full Body": {
        "Home": ["Burpees", "Mountain Climbers", "Squat to Press (Water bottles)", "Bear Crawls", "Jumping Jacks"],
        "Gym": ["Clean and Jerk", "Thrusters", "Deadlift", "Kettlebell Swings", "Rowing Machine"]
    },
    "Cardio": {
        "Home": ["High Knees", "Jump Rope", "Burpees", "Sprints in Place", "Skater Jumps"],
        "Gym": ["Treadmill Sprints", "Stairmaster", "Assault Bike", "Rowing Intervals", "Elliptical"]
    },
    "Core": {
        "Home": ["Plank", "Leg Raises", "Bicycle Crunches", "Dead Bug", "Russian Twists"],
        "Gym": ["Cable Crunches", "Hanging Leg Raises", "Pallof Press", "Weighted Situps", "Ab Wheel"]
    },
    "Mobility": {
        "Home": ["Cat-Cow", "World's Greatest Stretch", "90-90 Hip Switch", "Thoracic Rotation", "Deep Squat Hold"],
        "Gym": ["Foam Rolling", "Band Dislocates", "Face Pulls", "Goblet Squat Hold", "Hanging Decompression"]
    }
};

const PHASE_MODIFIERS: any = {
    "Menstrual": { title: "Restorative", intensity: "Low", rest: "90s" },
    "Follicular": { title: "Energizing", intensity: "Med-High", rest: "45s" },
    "Ovulatory": { title: "Peak Power", intensity: "Max", rest: "60s" },
    "Luteal": { title: "Stability", intensity: "Med", rest: "60s" }
};

const LEVEL_MODIFIERS: any = {
    "Beginner": { sets: 2, reps: "8-10" },
    "Intermediate": { sets: 3, reps: "10-12" },
    "Pro": { sets: 4, reps: "12-15" }
};

export function ExerciseBuilder({ phase, theme }: ExerciseBuilderProps) {
    const [setting, setSetting] = useState<"Home" | "Gym" | null>(null);
    const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Pro">("Intermediate");
    const [focus, setFocus] = useState<"Full Body" | "Upper Body" | "Lower Body" | "Cardio" | "Core" | "Mobility">("Full Body");

    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleGenerate = () => {
        if (!setting) return;
        setIsGenerating(true);
        setResult(null);

        // Simulate AI "Construction"
        setTimeout(() => {
            const phaseKey = Object.keys(PHASE_MODIFIERS).find(k => k.toLowerCase() === phase.toLowerCase()) || "Menstrual";
            const phaseMod = PHASE_MODIFIERS[phaseKey];
            const levelMod = LEVEL_MODIFIERS[level];
            const pool = EXERCISE_POOL[focus][setting];

            // Pick 3-4 random exercises from pool
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            const selectedExercises = shuffled.slice(0, 3).map((ex: string) => `${ex} (${levelMod.sets}x${levelMod.reps})`);

            setResult({
                title: `${phaseMod.title} ${focus}`,
                exercises: selectedExercises,
                focus: focus,
                setting: setting,
                level: level,
                rest: phaseMod.rest
            });
            setIsGenerating(false);
        }, 1500);
    };

    const reset = () => {
        setResult(null);
        setSetting(null);
    };

    return (
        <div className="w-full bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-sm overflow-hidden relative group">
            <div className={`absolute bottom-0 left-0 w-64 h-64 ${theme.blob} rounded-full blur-[80px] pointer-events-none opacity-30`} />

            <div className="p-5 md:p-6 relative z-10">
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${theme.color} bg-white/50 border border-white/60`}>
                            <Dumbbell className="w-4 h-4" />
                        </div>
                        <h3 className="font-heading text-lg text-rove-charcoal">AI Trainer</h3>
                    </div>
                    {result && !isGenerating && (
                        <button onClick={reset} className="text-xs font-bold uppercase tracking-wider text-rove-stone hover:text-rove-charcoal transition-colors flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {!result && !isGenerating ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* 1. Setting Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-rove-stone/80">Where?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setSetting("Home")} className={cn("p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2", setting === "Home" ? cn("bg-white shadow-md border-transparent", theme.color) : "bg-white/30 border-white/40 text-rove-stone hover:bg-white/50")}>
                                        <Home className="w-4 h-4" /> Home
                                    </button>
                                    <button onClick={() => setSetting("Gym")} className={cn("p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2", setting === "Gym" ? cn("bg-white shadow-md border-transparent", theme.color) : "bg-white/30 border-white/40 text-rove-stone hover:bg-white/50")}>
                                        <Building2 className="w-4 h-4" /> Gym
                                    </button>
                                </div>
                            </div>

                            {/* 2. Level Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-rove-stone/80">Experience?</label>
                                <div className="flex bg-white/30 p-1 rounded-xl border border-white/40">
                                    {(["Beginner", "Intermediate", "Pro"] as const).map((lvl) => (
                                        <button key={lvl} onClick={() => setLevel(lvl)} className={cn("flex-1 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1", level === lvl ? "bg-white text-rove-charcoal shadow-sm" : "text-rove-stone hover:text-rove-charcoal/80")}>
                                            {lvl === "Beginner" && <Star className="w-3 h-3" />}
                                            {lvl === "Intermediate" && <Medal className="w-3 h-3" />}
                                            {lvl === "Pro" && <Trophy className="w-3 h-3" />}
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Focus Selector (New) */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-rove-stone/80">Focus Area?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "Full Body", icon: Activity },
                                        { id: "Upper Body", icon: BicepsFlexed },
                                        { id: "Lower Body", icon: Footprints },
                                        { id: "Cardio", icon: HeartPulse },
                                        { id: "Core", icon: Zap },
                                        { id: "Mobility", icon: Brain }
                                    ].map((item) => (
                                        <button key={item.id} onClick={() => setFocus(item.id as any)} className={cn("p-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 h-16", focus === item.id ? cn("bg-white shadow-sm border-transparent", theme.color) : "bg-white/30 border-white/40 text-rove-stone hover:bg-white/50")}>
                                            <item.icon className="w-4 h-4 opacity-70" />
                                            {item.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleGenerate} disabled={!setting} className={cn("w-full py-3.5 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all mt-2", setting ? cn(theme.accent) : "bg-gray-300 cursor-not-allowed")}>
                                <Sparkles className="w-4 h-4" /> Build Workout
                            </button>
                        </motion.div>
                    ) : isGenerating ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center justify-center text-center">
                            <RefreshCw className="w-8 h-8 text-rove-charcoal/30 animate-spin mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest text-rove-stone/60 animate-pulse">Designing {focus} Plan...</p>
                        </motion.div>
                    ) : (
                        <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="p-4 bg-white/60 rounded-xl border border-white/60 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-heading text-xl text-rove-charcoal">{result.title}</h4>
                                    <div className="flex gap-1">
                                        <Badge className={cn("bg-white border-white/50", theme.color)}>{result.setting}</Badge>
                                        <Badge variant="outline" className="bg-white/50">{result.level}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-rove-stone font-medium mb-4">
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {result.focus}</span>
                                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Rest: {result.rest}</span>
                                </div>

                                <div className="space-y-2">
                                    {result.exercises.map((ex: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/40 border border-white/40">
                                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-rove-stone">{i + 1}</div>
                                            <span className="text-sm text-rove-charcoal/90">{ex}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="w-full py-3 rounded-xl border border-rove-charcoal/10 bg-white/40 text-rove-charcoal text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/60 transition-all">
                                <Play className="w-4 h-4" /> Start Session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
