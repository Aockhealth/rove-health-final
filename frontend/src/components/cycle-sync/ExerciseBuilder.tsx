"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, RefreshCw, RotateCcw, Home, Building2, Trophy, Medal, Star, BicepsFlexed, Footprints, HeartPulse, Activity, Brain, Zap, Play, CheckCircle2, Circle, Clock, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { generateRoveCoachPlan, RoveCoachPlan, WorkoutSet } from "@/app/actions/ai-actions";

interface ExerciseBuilderProps {
    phase: string;
    theme?: any; // Made optional as we'll use internal theming
}

export function ExerciseBuilder({ phase }: ExerciseBuilderProps) {
    const [setting, setSetting] = useState<"Home" | "Gym" | null>(null);
    const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Pro">("Intermediate");
    const [focus, setFocus] = useState<"Full Body" | "Upper Body" | "Lower Body" | "Cardio" | "Core" | "Mobility">("Full Body");
    const [progressionPreference, setProgressionPreference] = useState<"steady" | "push" | "deload">("steady");
    const [energy, setEnergy] = useState<"Low" | "Medium" | "High">("Medium");
    const [time, setTime] = useState<"15m" | "30m" | "45m" | "60m">("30m");
    const [symptoms, setSymptoms] = useState("");

    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<RoveCoachPlan | null>(null);

    // Session State
    const [sessionMode, setSessionMode] = useState(false);
    const [completedSets, setCompletedSets] = useState<Record<number, boolean>>({});
    const [sessionTimer, setSessionTimer] = useState(0);

    // Organic Chromatics Styling
    const currentPhase = phase || "Menstrual";
    const themes: Record<string, any> = {
        "Menstrual": {
            border: "border-phase-menstrual/20",
            shadow: "shadow-phase-menstrual/5",
            iconBg: "bg-phase-menstrual/10",
            iconColor: "text-phase-menstrual",
            button: "bg-phase-menstrual shadow-phase-menstrual/20 hover:bg-phase-menstrual/90",
            active: "bg-white shadow-md border-phase-menstrual/30 text-phase-menstrual",
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
            active: "bg-white shadow-md border-phase-follicular/30 text-phase-follicular",
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
            active: "bg-white shadow-md border-phase-ovulatory/30 text-phase-ovulatory",
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
            active: "bg-white shadow-md border-phase-luteal/30 text-phase-luteal",
            badge: "bg-phase-luteal/10 text-phase-luteal border-phase-luteal/20",
            header: "text-gray-800",
            blob: "bg-phase-luteal"
        }
    };

    const theme = themes[currentPhase] || themes["Menstrual"];

    const handleGenerate = async () => {
        if (!setting) return;
        setIsGenerating(true);
        setResult(null);

        try {
            const plan = await generateRoveCoachPlan(
                phase,
                energy,
                `${time} ${focus} workout`, // Goal
                setting === "Home" ? "Bodyweight / Mat" : "Full Gym", // Equipment
                symptoms, // Injuries/Limitations
                level,
                focus,
                time,
                progressionPreference,
                `${focus} performance`
            );
            setResult(plan);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const reset = () => {
        setResult(null);
        setSessionMode(false);
        setSessionTimer(0);
        setCompletedSets({});
    };

    // Session Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sessionMode) {
            interval = setInterval(() => {
                setSessionTimer(t => t + 1);
            }, 1000);
        } else {
            setSessionTimer(0);
        }
        return () => clearInterval(interval);
    }, [sessionMode]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleSession = () => {
        if (!sessionMode) {
            setSessionMode(true);
            setCompletedSets({});
        } else {
            // Ending the session
            setSessionMode(false);
        }
    };

    const toggleSet = (index: number) => {
        setCompletedSets(prev => ({ ...prev, [index]: !prev[index] }));
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
                        <h3 className={cn("font-heading text-lg", theme.header)}>Workout Coach</h3>
                    </div>
                    {((result && !isGenerating) || sessionMode) && (
                        <button onClick={reset} className="text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-full shadow-sm hover:bg-white/80">
                            <RotateCcw className="w-3 h-3" /> Start Over
                        </button>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {sessionMode && result ? (
                        <motion.div key="session" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl shadow-sm border border-white/60">
                                <div>
                                    <h4 className="font-heading text-lg font-bold text-gray-800">Session in Progress</h4>
                                    <p className="text-xs text-gray-500 font-medium">Earn those endorphins!</p>
                                </div>
                                <div className={cn("px-4 py-2 rounded-lg font-mono font-bold text-lg text-white shadow-sm flex items-center gap-2", theme.blob)}>
                                    <Clock className="w-4 h-4 opacity-80" /> {formatTime(sessionTimer)}
                                </div>
                            </div>

                            <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1 pb-4">
                                {/* Warmup */}
                                {result.warmup && result.warmup.length > 0 && (
                                    <div className="space-y-2">
                                        <h5 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Warmup</h5>
                                        {result.warmup.map((item, i) => (
                                            <div key={`w-${i}`} className="p-3 bg-white/40 rounded-xl border border-white flex items-start gap-3">
                                                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-white", theme.blob)}>{i + 1}</div>
                                                <span className="text-sm font-medium text-gray-800 leading-snug">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Main Set */}
                                <div className="space-y-2">
                                    <h5 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Main Set</h5>
                                    {result.main_set?.map((item, i) => (
                                        <div key={`m-${i}`}
                                            onClick={() => toggleSet(i)}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                                                completedSets[i] ? "bg-green-50/80 border-green-200 shadow-inner" : "bg-white/70 border-white shadow-sm hover:bg-white"
                                            )}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className={cn("font-bold text-md", completedSets[i] ? "text-green-800 line-through opacity-60" : "text-gray-800")}>{item.name}</span>
                                                    <div className="flex gap-2 text-[11px] text-gray-500 font-bold mt-1.5 uppercase tracking-wide">
                                                        <span className="bg-gray-100/80 px-2 py-1 rounded-md text-gray-600">{item.sets} Sets</span>
                                                        <span className="bg-gray-100/80 px-2 py-1 rounded-md text-gray-600">{item.reps} Reps</span>
                                                    </div>
                                                </div>
                                                {completedSets[i] ? <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1 drop-shadow-sm" /> : <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-1" />}
                                            </div>
                                            {item.notes && !completedSets[i] && (
                                                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100/50 p-2.5 rounded-lg inline-flex items-start gap-1.5 mt-2 font-medium">
                                                    <Info className="w-4 h-4 shrink-0 mt-0.5 opacity-80" /> {item.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Cooldown */}
                                {result.cooldown && result.cooldown.length > 0 && (
                                    <div className="space-y-2">
                                        <h5 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Cooldown</h5>
                                        {result.cooldown.map((item, i) => (
                                            <div key={`c-${i}`} className="p-3 bg-white/40 rounded-xl border border-white flex items-start gap-3">
                                                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-white opacity-60", theme.blob)}>{i + 1}</div>
                                                <span className="text-sm font-medium text-gray-800 leading-snug">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={toggleSession} className="w-full py-3.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold flex items-center justify-center transition-all shadow-sm group">
                                <CheckCircle2 className="w-4 h-4 mr-2 group-hover:text-green-500 transition-colors" /> End Session & Save
                            </button>
                        </motion.div>
                    ) : !result && !isGenerating ? (
                        <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            {/* 1. Setting / Equipment */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Where?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setSetting("Home")} className={cn("p-2.5 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2", setting === "Home" ? theme.active : "bg-white/40 border-white/60 text-gray-500 hover:bg-white/60 hover:text-gray-700 shadow-sm")}>
                                        <Home className="w-4 h-4 opacity-70" /> Home
                                    </button>
                                    <button onClick={() => setSetting("Gym")} className={cn("p-2.5 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2", setting === "Gym" ? theme.active : "bg-white/40 border-white/60 text-gray-500 hover:bg-white/60 hover:text-gray-700 shadow-sm")}>
                                        <Building2 className="w-4 h-4 opacity-70" /> Gym
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Energy */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Energy</label>
                                    <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 shadow-inner">
                                        {(["Low", "Medium", "High"] as const).map((lvl) => (
                                            <button key={lvl} onClick={() => setEnergy(lvl)} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center", energy === lvl ? cn("text-white shadow-sm", theme.blob) : "text-gray-500 hover:text-gray-700")}>
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</label>
                                    <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 shadow-inner grid grid-cols-4">
                                        {(["15m", "30m", "45m", "60m"] as const).map((t) => (
                                            <button key={t} onClick={() => setTime(t)} className={cn("py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center", time === t ? cn("text-white shadow-sm", theme.blob) : "text-gray-500 hover:text-gray-700")}>
                                                {t.replace('m', '')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Focus Area */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Focus Area</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "Full Body", name: "Full Body", icon: Activity },
                                        { id: "Upper Body", name: "Upper", icon: BicepsFlexed },
                                        { id: "Lower Body", name: "Lower", icon: Footprints },
                                        { id: "Cardio", name: "Cardio", icon: HeartPulse },
                                        { id: "Core", name: "Core", icon: Zap },
                                        { id: "Mobility", name: "Mobility", icon: Brain }
                                    ].map((item) => (
                                        <button key={item.id} onClick={() => setFocus(item.id as any)} className={cn("py-2.5 px-1 rounded-xl border text-[10px] md:text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1.5", focus === item.id ? theme.active : "bg-white/40 border-white/60 text-gray-500 hover:bg-white/60 hover:text-gray-700 shadow-sm")}>
                                            <item.icon className={cn("w-4 h-4", focus === item.id ? theme.iconColor : "opacity-60")} />
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Symptoms / Limitations */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Progression</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { id: "steady", label: "Steady" },
                                        { id: "push", label: "Push" },
                                        { id: "deload", label: "Deload" }
                                    ] as const).map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setProgressionPreference(item.id)}
                                            className={cn(
                                                "py-2 rounded-xl border text-[11px] font-bold transition-all",
                                                progressionPreference === item.id
                                                    ? theme.active
                                                    : "bg-white/40 border-white/60 text-gray-500 hover:bg-white/60 hover:text-gray-700 shadow-sm"
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Symptoms / Limitations */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Anything to keep in mind?</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cramps, sore knees, skip jumps..."
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    className="w-full bg-white/60 border border-white/80 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-all font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                />
                            </div>

                            <button onClick={handleGenerate} disabled={!setting} className={cn("w-full py-3.5 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg mt-2", setting ? theme.button : "bg-gray-300 text-white cursor-not-allowed border outline-none")}>
                                <Flame className="w-4 h-4" /> Generate AI Plan
                            </button>
                        </motion.div>
                    ) : isGenerating ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 flex flex-col items-center justify-center text-center">
                            <RefreshCw className={cn("w-10 h-10 animate-spin mb-4", theme.iconColor)} />
                            <p className="text-sm font-bold tracking-wide text-gray-600 animate-pulse">Designing your {phase} workout...</p>
                        </motion.div>
                    ) : (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                            <div className="p-5 bg-white/70 rounded-2xl border border-white shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-heading text-[1.35rem] leading-tight text-gray-800 pr-4">{result?.title}</h4>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <Badge className={cn("bg-white text-gray-700 shadow-sm border border-gray-100 font-bold", theme.iconColor)}>{result?.intensity} Intensity</Badge>
                                        <Badge variant="outline" className="bg-white/50 text-gray-600 border-none px-2 shadow-sm font-bold flex gap-1 items-center"><Clock className="w-3 h-3" /> {result?.duration}</Badge>
                                    </div>
                                </div>

                                {result?.reasoning && (
                                    <div className="mt-4 mb-5 text-sm text-gray-600 bg-white/60 p-3.5 rounded-xl border border-white leading-relaxed italic relative">
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-40", theme.blob)} />
                                        "{result.reasoning}"
                                    </div>
                                )}

                                <div className="mt-4 space-y-2.5">
                                    <h5 className="text-[11px] uppercase font-bold text-gray-400 tracking-widest pl-1 mb-1.5">Main Routine Preview</h5>
                                    {result?.main_set?.map((ex: WorkoutSet, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", theme.blob)}>{i + 1}</div>
                                            <span className="text-sm text-gray-800 font-bold">{ex.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={toggleSession} className={cn("w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]", theme.blob, theme.button)}>
                                <Play className="w-5 h-5 fill-white" /> Start Guided Session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
