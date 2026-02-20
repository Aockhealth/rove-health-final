"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, RefreshCw, RotateCcw, Home, Building2, Trophy, Medal, Star, BicepsFlexed, Footprints, HeartPulse, Activity, Brain, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface ExerciseBuilderProps {
    phase: string;
    theme?: any; // Made optional as we'll use internal theming
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

export function ExerciseBuilder({ phase }: ExerciseBuilderProps) {
    const [setting, setSetting] = useState<"Home" | "Gym" | null>(null);
    const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Pro">("Intermediate");
    const [focus, setFocus] = useState<"Full Body" | "Upper Body" | "Lower Body" | "Cardio" | "Core" | "Mobility">("Full Body");

    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Organic Chromatics Styling
    const currentPhase = phase || "Menstrual";
    const themes: Record<string, any> = {
        "Menstrual": {
            border: "border-phase-menstrual/20",
            shadow: "shadow-phase-menstrual/5",
            iconBg: "bg-phase-menstrual/10",
            iconColor: "text-phase-menstrual",
            button: "bg-phase-menstrual shadow-phase-menstrual/20 hover:bg-phase-menstrual/90",
            active: "bg-white shadow-md border-phase-menstrual/20 text-phase-menstrual",
            badge: "bg-phase-menstrual/10 text-phase-menstrual border-phase-menstrual/20",
            header: "text-gray-800",
            blob: "bg-phase-menstrual"
        },
        "Follicular": {
            border: "border-phase-follicular/20",
            shadow: "shadow-phase-follicular/5",
            iconBg: "bg-phase-follicular/10",
            iconColor: "text-phase-follicular",
            button: "bg-phase-follicular shadow-phase-follicular/20 hover:bg-phase-follicular/90",
            active: "bg-white shadow-md border-phase-follicular/20 text-phase-follicular",
            badge: "bg-phase-follicular/10 text-phase-follicular border-phase-follicular/20",
            header: "text-gray-800",
            blob: "bg-phase-follicular"
        },
        "Ovulatory": {
            border: "border-phase-ovulatory/20",
            shadow: "shadow-phase-ovulatory/5",
            iconBg: "bg-phase-ovulatory/10",
            iconColor: "text-phase-ovulatory",
            button: "bg-phase-ovulatory shadow-phase-ovulatory/20 hover:bg-phase-ovulatory/90",
            active: "bg-white shadow-md border-phase-ovulatory/20 text-phase-ovulatory",
            badge: "bg-phase-ovulatory/10 text-phase-ovulatory border-phase-ovulatory/20",
            header: "text-gray-800",
            blob: "bg-phase-ovulatory"
        },
        "Luteal": {
            border: "border-phase-luteal/20",
            shadow: "shadow-phase-luteal/5",
            iconBg: "bg-phase-luteal/10",
            iconColor: "text-phase-luteal",
            button: "bg-phase-luteal shadow-phase-luteal/20 hover:bg-phase-luteal/90",
            active: "bg-white shadow-md border-phase-luteal/20 text-phase-luteal",
            badge: "bg-phase-luteal/10 text-phase-luteal border-phase-luteal/20",
            header: "text-gray-800",
            blob: "bg-phase-luteal"
        }
    };

    const theme = themes[currentPhase] || themes["Menstrual"];

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
        <div className={cn(
            "w-full bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group transition-all",
            theme.border,
            theme.shadow
        )}>
            <div className={cn("absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-30", theme.blob)} />

            <div className="p-5 md:p-6 relative z-10">
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg border border-white/60", theme.iconBg, theme.iconColor)}>
                            <Dumbbell className="w-4 h-4" />
                        </div>
                        <h3 className={cn("font-heading text-lg", theme.header)}>AI Trainer</h3>
                    </div>
                    {result && !isGenerating && (
                        <button onClick={reset} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1">
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
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500/80">Where?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setSetting("Home")} className={cn("p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2", setting === "Home" ? theme.active : "bg-white/30 border-white/40 text-gray-500 hover:bg-white/50")}>
                                        <Home className="w-4 h-4" /> Home
                                    </button>
                                    <button onClick={() => setSetting("Gym")} className={cn("p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2", setting === "Gym" ? theme.active : "bg-white/30 border-white/40 text-gray-500 hover:bg-white/50")}>
                                        <Building2 className="w-4 h-4" /> Gym
                                    </button>
                                </div>
                            </div>

                            {/* 2. Level Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500/80">Experience?</label>
                                <div className="flex bg-white/30 p-1 rounded-xl border border-white/40">
                                    {(["Beginner", "Intermediate", "Pro"] as const).map((lvl) => (
                                        <button key={lvl} onClick={() => setLevel(lvl)} className={cn("flex-1 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1", level === lvl ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
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
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500/80">Focus Area?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "Full Body", icon: Activity },
                                        { id: "Upper Body", icon: BicepsFlexed },
                                        { id: "Lower Body", icon: Footprints },
                                        { id: "Cardio", icon: HeartPulse },
                                        { id: "Core", icon: Zap },
                                        { id: "Mobility", icon: Brain }
                                    ].map((item) => (
                                        <button key={item.id} onClick={() => setFocus(item.id as any)} className={cn("p-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 h-16", focus === item.id ? theme.active : "bg-white/30 border-white/40 text-gray-500 hover:bg-white/50")}>
                                            <item.icon className="w-4 h-4 opacity-70" />
                                            {item.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleGenerate} disabled={!setting} className={cn("w-full py-3.5 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all mt-2", setting ? theme.button : "bg-gray-300 cursor-not-allowed")}>
                                Build Workout
                            </button>
                        </motion.div>
                    ) : isGenerating ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center justify-center text-center">
                            <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500/60 animate-pulse">Designing {focus} Plan...</p>
                        </motion.div>
                    ) : (
                        <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="p-4 bg-white/60 rounded-xl border border-white/60 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-heading text-xl text-gray-800">{result.title}</h4>
                                    <div className="flex gap-1">
                                        <Badge className={cn("bg-white text-gray-700", theme.border)}>{result.setting}</Badge>
                                        <Badge variant="outline" className="bg-white/50">{result.level}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mb-4">
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {result.focus}</span>
                                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Rest: {result.rest}</span>
                                </div>

                                <div className="space-y-2">
                                    {result.exercises.map((ex: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/40 border border-white/40">
                                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-500">{i + 1}</div>
                                            <span className="text-sm text-gray-800/90">{ex}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="w-full py-3 rounded-xl border border-gray-100 bg-white/40 text-gray-800 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/60 transition-all">
                                <Play className="w-4 h-4" /> Start Session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
