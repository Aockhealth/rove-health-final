"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Play, Pause, SkipForward, CheckCircle2, Timer, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import ExerciseDemo, { exerciseDemoId, type ExerciseId } from "./ExerciseDemo";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WorkoutExercise {
    title: string;
    description: string;
    duration: string;
    intensity: "Low" | "Moderate" | "High";
    benefits: string[];
    /** seconds for timer (uses reps mode if absent) */
    seconds?: number;
    reps?: number;
    sets?: number;
    formCues?: string[];
}

interface GuidedSessionProps {
    exercises: WorkoutExercise[];
    phaseName: string;
    accentColor: string;
    onClose: () => void;
}

// ─── Motion variants ──────────────────────────────────────────────────────────
const cardVariants = {
    enter: { opacity: 0, scale: 0.95, y: 24 },
    center: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -24 },
};

const REST_SECONDS = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, "0"); }

function intensityBadgeStyle(intensity: string) {
    if (intensity === "Low") return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    if (intensity === "High") return "bg-red-50 text-red-600 border border-red-200";
    return "bg-amber-50 text-amber-600 border border-amber-200";
}

// ─── Rest Screen ──────────────────────────────────────────────────────────────
function RestScreen({ onDone, accentColor }: { onDone: () => void; accentColor: string }) {
    const [remaining, setRemaining] = useState(REST_SECONDS);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (remaining <= 0) { onDone(); return; }
        const t = setTimeout(() => setRemaining(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [remaining, onDone]);

    const pct = ((REST_SECONDS - remaining) / REST_SECONDS) * 100;

    return (
        <motion.div
            key="rest"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-10 gap-6"
        >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rest</span>
            <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                    <motion.circle
                        cx="50" cy="50" r="44" fill="none"
                        stroke={accentColor} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        animate={{ strokeDashoffset: `${2 * Math.PI * 44 * (1 - pct / 100)}` }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold tabular-nums" style={{ color: accentColor }}>{remaining}</span>
                </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">Breathe. You're doing great.</p>
            <button
                onClick={onDone}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
            >
                Skip Rest
            </button>
        </motion.div>
    );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({
    exercise,
    exerciseIndex,
    total,
    onNext,
    accentColor,
}: {
    exercise: WorkoutExercise;
    exerciseIndex: number;
    total: number;
    onNext: () => void;
    accentColor: string;
}) {
    const [timerActive, setTimerActive] = useState(false);
    const [remaining, setRemaining] = useState(exercise.seconds ?? 0);
    const [showCue, setShowCue] = useState(0);
    const reduced = useReducedMotion();
    const demoId = exerciseDemoId(exercise.title);

    const hasTimer = !!exercise.seconds;

    useEffect(() => {
        // Reset when exercise changes
        setTimerActive(false);
        setRemaining(exercise.seconds ?? 0);
        setShowCue(0);
    }, [exercise]);

    useEffect(() => {
        if (!timerActive || !hasTimer) return;
        if (remaining <= 0) { setTimerActive(false); return; }
        const t = setTimeout(() => setRemaining(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [timerActive, remaining, hasTimer]);

    // Rotate form cues every 8 seconds while timer is active
    useEffect(() => {
        if (!timerActive || !exercise.formCues?.length) return;
        const t = setInterval(() => {
            setShowCue(c => (c + 1) % (exercise.formCues?.length ?? 1));
        }, 8000);
        return () => clearInterval(t);
    }, [timerActive, exercise.formCues]);

    const pct = hasTimer ? ((exercise.seconds! - remaining) / exercise.seconds!) * 100 : 0;
    const isDone = hasTimer && remaining === 0;

    return (
        <motion.div
            key={exerciseIndex}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="flex flex-col gap-4"
        >
            {/* Progress bar */}
            <div className="flex gap-1">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 rounded-full overflow-hidden bg-gray-100"
                    >
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: accentColor }}
                            initial={{ width: "0%" }}
                            animate={{ width: i < exerciseIndex ? "100%" : i === exerciseIndex ? "50%" : "0%" }}
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        Exercise {exerciseIndex + 1} of {total}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mt-0.5">{exercise.title}</h3>
                </div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", intensityBadgeStyle(exercise.intensity))}>
                    {exercise.intensity}
                </span>
            </div>

            {/* Demo Animation */}
            {demoId && (
                <ExerciseDemo
                    exerciseId={demoId}
                    accentColor={accentColor}
                    className="w-full h-36 mx-auto"
                />
            )}

            <p className="text-sm text-gray-600 leading-relaxed">{exercise.description}</p>

            {/* Form cue callout */}
            {exercise.formCues && exercise.formCues.length > 0 && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={showCue}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="flex items-start gap-2 p-3 rounded-xl"
                        style={{ backgroundColor: `${accentColor}18` }}
                    >
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                        <span className="text-xs font-medium" style={{ color: accentColor }}>
                            {exercise.formCues[showCue]}
                        </span>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Timer / Reps display */}
            {hasTimer ? (
                <div className="relative py-4 flex flex-col items-center gap-3">
                    {/* Ring */}
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F4F6" strokeWidth="7" />
                            <motion.circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke={accentColor} strokeWidth="7" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                animate={{ strokeDashoffset: `${2 * Math.PI * 42 * (1 - pct / 100)}` }}
                                transition={{ duration: 0.6 }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold tabular-nums" style={{ color: accentColor }}>
                                {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
                            </span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wider">sec</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setTimerActive(v => !v)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-lg active:scale-95 transition-transform"
                        style={{ backgroundColor: accentColor }}
                    >
                        {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {timerActive ? "Pause" : isDone ? "Done!" : "Start"}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-4 py-3">
                    {exercise.sets && (
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: accentColor }}>{exercise.sets}</div>
                            <div className="text-[9px] uppercase tracking-wider text-gray-400">Sets</div>
                        </div>
                    )}
                    <div className="w-px h-8 bg-gray-200" />
                    {exercise.reps && (
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: accentColor }}>{exercise.reps}</div>
                            <div className="text-[9px] uppercase tracking-wider text-gray-400">Reps</div>
                        </div>
                    )}
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                        <div className="text-sm font-bold text-gray-700">{exercise.duration}</div>
                        <div className="text-[9px] uppercase tracking-wider text-gray-400">Duration</div>
                    </div>
                </div>
            )}

            {/* Benefits */}
            <div className="flex flex-wrap gap-1.5">
                {exercise.benefits.map(b => (
                    <span key={b} className="flex items-center gap-1 text-[9px] text-gray-500 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        {b}
                    </span>
                ))}
            </div>

            {/* CTA */}
            <motion.button
                onClick={onNext}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all"
                style={{ backgroundColor: accentColor }}
            >
                {exerciseIndex < total - 1 ? "Next Exercise →" : "Complete Session 🎉"}
            </motion.button>
        </motion.div>
    );
}

// ─── Complete Screen ──────────────────────────────────────────────────────────
function CompleteScreen({ phaseName, onClose, accentColor }: { phaseName: string; onClose: () => void; accentColor: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-10 gap-4 text-center"
        >
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
            >
                <CheckCircle2 className="w-8 h-8" style={{ color: accentColor }} />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800">Session Complete!</h3>
            <p className="text-sm text-gray-500">You crushed your <strong>{phaseName}</strong> phase workout. Your body thanks you.</p>
            <button
                onClick={onClose}
                className="mt-2 px-6 py-3 rounded-full font-bold text-sm text-white shadow-lg"
                style={{ backgroundColor: accentColor }}
            >
                Back to Plan
            </button>
        </motion.div>
    );
}

// ─── Main GuidedSession ───────────────────────────────────────────────────────
export default function GuidedSession({ exercises, phaseName, accentColor, onClose }: GuidedSessionProps) {
    const [step, setStep] = useState<"exercise" | "rest" | "done">("exercise");
    const [idx, setIdx] = useState(0);

    const goNext = useCallback(() => {
        if (idx >= exercises.length - 1) {
            setStep("done");
        } else {
            setStep("rest");
        }
    }, [idx, exercises.length]);

    const afterRest = useCallback(() => {
        setIdx(i => i + 1);
        setStep("exercise");
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        >
            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
                        <Zap className="w-4 h-4" style={{ color: accentColor }} />
                    </div>
                    <div>
                        <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{phaseName} Phase</div>
                        <div className="text-sm font-bold text-gray-800">Guided Session</div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === "exercise" && (
                        <ExerciseCard
                            key={`ex-${idx}`}
                            exercise={exercises[idx]}
                            exerciseIndex={idx}
                            total={exercises.length}
                            onNext={goNext}
                            accentColor={accentColor}
                        />
                    )}
                    {step === "rest" && (
                        <RestScreen key="rest" onDone={afterRest} accentColor={accentColor} />
                    )}
                    {step === "done" && (
                        <CompleteScreen key="done" phaseName={phaseName} onClose={onClose} accentColor={accentColor} />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
