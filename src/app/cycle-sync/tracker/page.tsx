"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Check, Droplets, Calendar, Edit2, X, Info, Waves, Shield, Dumbbell, Clock, Plus, Minus, Droplet, Heart, Moon, ZapOff, Smile, Activity, PenLine, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logDailySymptoms, getDailyLog, fetchUserCycleSettings, updateLastPeriodDate, updateCycleLength } from "@/app/actions/cycle-sync";
import confetti from "canvas-confetti";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

// MPIQ Options & Types
type Consistency = "Tacky" | "Creamy" | "Stretchy" | "Bloody";
type Appearance = "White/Yellow" | "Clear" | "Red";
type Sensation = "Dry" | "Moist" | "Wet" | "Slippery";

const consistencyOptions: { label: Consistency; score: number; desc: string; type: "video" | "image"; src: string }[] = [
    { label: "Tacky", score: 4, desc: "Sticky, glue-like", type: "video", src: "/images/gifs/tacky.mp4" },
    { label: "Creamy", score: 3, desc: "Lotion-like, smooth", type: "video", src: "/images/gifs/creamy.mp4" },
    { label: "Stretchy", score: 2, desc: "Raw egg white, elastic", type: "video", src: "/images/gifs/stretchy.mp4" },
    { label: "Bloody", score: 1, desc: "Red/brown tint", type: "video", src: "/images/gifs/bloody.mp4" },
];

const appearanceOptions: { label: Appearance; score: number; desc: string; type: "video" | "image"; src: string }[] = [
    { label: "White/Yellow", score: 3, desc: "Cloudy or cream colored", type: "image", src: "/images/gifs/white yellow appearance.jpeg" },
    { label: "Clear", score: 2, desc: "Transparent like glass", type: "image", src: "/images/gifs/clear appearance.jpeg" },
    { label: "Red", score: 1, desc: "Pink to bright red", type: "image", src: "/images/gifs/red appearance.jpeg" },
];

const sensationOptions: { label: Sensation; score: number; desc: string }[] = [
    { label: "Dry", score: 4, desc: "No fluid felt" },
    { label: "Moist", score: 3, desc: "Slightly damp" },
    { label: "Wet", score: 2, desc: "Distinctly wet" },
    { label: "Slippery", score: 1, desc: "Lubricated, sliding" },
];

export default function TrackerPageRedesigned() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Standard Tracker State
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string[]>([]);
    const [exerciseMinutes, setExerciseMinutes] = useState<string>("");
    const [waterIntake, setWaterIntake] = useState<number>(0);
    const [isPouring, setIsPouring] = useState(false);
    const [selectedSelfLove, setSelectedSelfLove] = useState<string[]>([]);
    const [selfLoveOther, setSelfLoveOther] = useState<string>("");
    const [selectedSleepQuality, setSelectedSleepQuality] = useState<string[]>([]);
    const [sleepHours, setSleepHours] = useState<string>("");
    const [sleepMinutes, setSleepMinutes] = useState<string>("");
    const [selectedDisruptors, setSelectedDisruptors] = useState<string[]>([]);
    const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
    const [cervicalDischarge, setCervicalDischarge] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [trackMode, setTrackMode] = useState<"period" | "discharge">("discharge");
    const [isEditingCycle, setIsEditingCycle] = useState(false);
    const [isPending, startTransition] = useTransition();

    // MPIQ Specific State - Removed mpiqLastPeriod (using cycleSettings directly)
    const [mpiqConsistency, setMpiqConsistency] = useState<Consistency | null>(null);
    const [mpiqAppearance, setMpiqAppearance] = useState<Appearance | null>(null);
    const [mpiqSensation, setMpiqSensation] = useState<Sensation | null>(null);
    const [isDischargeExpanded, setIsDischargeExpanded] = useState(false);

    const [cycleSettings, setCycleSettings] = useState({
        last_period_start: "", // Loaded from DB
        cycle_length_days: 28,
        period_length_days: 5
    });

    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Load cycle settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            const settings = await fetchUserCycleSettings();
            if (settings) {
                setCycleSettings({
                    last_period_start: settings.last_period_start,
                    cycle_length_days: settings.cycle_length_days || 28,
                    period_length_days: settings.period_length_days || 5
                });
            }
        };
        loadSettings();
    }, []);

    // Fetch existing log when date changes
    useEffect(() => {
        const fetchLog = async () => {
            const data = await getDailyLog(formatDate(selectedDate));
            if (data) {
                setSelectedSymptoms(data.symptoms || []);
                setSelectedMoods(data.moods || []);
                setSelectedExercise(data.exercise_types || []);
                setExerciseMinutes(data.exercise_minutes ? String(data.exercise_minutes) : "");
                setWaterIntake(data.water_intake || 0);
                setSelectedSelfLove(data.self_love_tags || []);
                setSelfLoveOther(data.self_love_other || "");
                setSelectedSleepQuality(data.sleep_quality || []);
                if (data.sleep_minutes) {
                    setSleepHours(Math.floor(data.sleep_minutes / 60).toString());
                    setSleepMinutes((data.sleep_minutes % 60).toString());
                } else {
                    setSleepHours("");
                    setSleepMinutes("");
                }
                setFlowIntensity(data.flow_intensity || null);
                setSelectedDisruptors(data.disruptors || []);
                // Handle Cervical Discharge (Parse JSON if applicable)
                if (data.cervical_discharge) {
                    try {
                        // Check if it looks like JSON structure
                        if (data.cervical_discharge.startsWith('[')) {
                            // Format: ["Consistency", "Appearance", "Sensation"]
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (Array.isArray(parsed) && parsed.length >= 3) {
                                setMpiqConsistency(parsed[0]);
                                setMpiqAppearance(parsed[1]);
                                setMpiqSensation(parsed[2]);
                                // derived cervicalDischarge string will adjust via its own useEffect
                            }
                        } else if (data.cervical_discharge.startsWith('{')) {
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (parsed.type === 'MPIQ') {
                                setMpiqConsistency(parsed.consistency || null);
                                setMpiqAppearance(parsed.appearance || null);
                                setMpiqSensation(parsed.sensation || null);
                                setCervicalDischarge(parsed.legacyLabel || null);
                            } else {
                                setCervicalDischarge(data.cervical_discharge);
                            }
                        } else {
                            // Legacy string format
                            setCervicalDischarge(data.cervical_discharge);
                            setMpiqConsistency(null);
                            setMpiqAppearance(null);
                            setMpiqSensation(null);
                        }
                    } catch (e) {
                        // Fallback if parse fails
                        setCervicalDischarge(data.cervical_discharge);
                        setMpiqConsistency(null);
                        setMpiqAppearance(null);
                        setMpiqSensation(null);
                    }
                } else {
                    setCervicalDischarge(null);
                    setMpiqConsistency(null);
                    setMpiqAppearance(null);
                    setMpiqSensation(null);
                }

                setNote(data.notes || "");

                // Set initial toggle state based on data
                if (data.flow_intensity || data.is_period) {
                    setTrackMode('period');
                } else {
                    setTrackMode('discharge');
                }
            } else {
                setSelectedSymptoms([]);
                setSelectedMoods([]);
                setSelectedExercise([]);
                setExerciseMinutes("");
                setWaterIntake(0);
                setSelectedSelfLove([]);
                setSelfLoveOther("");
                setSelectedSleepQuality([]);
                setSleepHours("");
                setSleepMinutes("");
                setSelectedDisruptors([]);
                setFlowIntensity(null);
                setCervicalDischarge(null);
                setNote("");
                setTrackMode('discharge');
                // Reset MPIQ partials
                setMpiqConsistency(null);
                setMpiqAppearance(null);
                setMpiqSensation(null);
            }
        };
        fetchLog();
    }, [selectedDate]);

    // Update derived cervical discharge based on MPIQ (Only when user is actively changing MPIQ inputs)
    useEffect(() => {
        if (trackMode === 'discharge') {
            // Simple mapping from MPIQ to legacy list for consistency
            // "Dry", "Sticky", "Creamy", "Watery", "Egg White"
            if (mpiqConsistency === "Stretchy" || mpiqSensation === "Slippery") {
                setCervicalDischarge("Egg White");
            } else if (mpiqSensation === "Wet" || mpiqAppearance === "Clear") {
                setCervicalDischarge("Watery");
            } else if (mpiqConsistency === "Creamy") {
                setCervicalDischarge("Creamy");
            } else if (mpiqConsistency === "Tacky") {
                setCervicalDischarge("Sticky");
            } else if (mpiqSensation === "Dry") {
                setCervicalDischarge("Dry");
            }
        }
    }, [mpiqConsistency, mpiqAppearance, mpiqSensation, trackMode]);

    // Confetti Effect for Water Goal
    useEffect(() => {
        if (waterIntake === 8) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#60A5FA', '#3B82F6', '#93C5FD', '#FFFFFF'] // Blue/Water theme
            });
        }
    }, [waterIntake]);

    const isFutureDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    const getCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const days = [];
        const startPadding = firstDayOfMonth.getDay();

        for (let i = 0; i < startPadding; i++) {
            const d = new Date(year, month, 0 - i);
            days.unshift({ date: d, isPadding: true });
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isPadding: false });
        }

        return days;
    };

    const getCycleDay = (date: Date) => {
        if (!cycleSettings.last_period_start) return 1;
        const start = new Date(cycleSettings.last_period_start);
        start.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        const diffTime = checkDate.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let dayInCycle = (diffDays % cycleSettings.cycle_length_days) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleSettings.cycle_length_days;
        return dayInCycle;
    };

    const getPhaseForDate = (date: Date): Phase => {
        const dayInCycle = getCycleDay(date);
        const { cycle_length_days, period_length_days } = cycleSettings;
        const ovulationDay = (cycle_length_days || 28) - 14;

        if (dayInCycle <= (period_length_days || 5)) return "Menstrual";
        if (dayInCycle < ovulationDay - 1) return "Follicular";
        if (dayInCycle <= ovulationDay + 1) return "Ovulatory";
        return "Luteal";
    };

    const calendarDays = getCalendarDays();

    const nextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + 1);
        setCurrentMonth(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(currentMonth.getMonth() - 1);
        setCurrentMonth(prev);
    };

    const flowOptions = ["Spotting", "Low", "Normal", "High", "Heavy"];
    // Legacy mapping support
    // const cervicalDischargeOptions = ["Dry", "Sticky", "Creamy", "Watery", "Egg White"];
    const symptomOptions = ["Headache", "Cramps", "Bloating", "Acne", "Backache", "Fatigue", "Cravings", "Insomnia", "Nausea"];

    const moodsList = [
        // Positive (Green)
        { label: "Happy", type: "positive" },
        { label: "Grateful", type: "positive" },
        { label: "Excited", type: "positive" },

        // Focus/Calm (Blue)
        { label: "Focused", type: "blue" },
        { label: "Calm", type: "blue" },
        { label: "Optimistic", type: "blue" },
        { label: "Confident", type: "blue" },
        { label: "Creative", type: "blue" },
        { label: "High Energy", type: "blue" },

        // Anxious/Orange (Orange)
        { label: "Unfocused", type: "orange" },
        { label: "Self-Critical", type: "orange" },
        { label: "Tearful", type: "orange" },
        { label: "Anxious", type: "orange" },
        { label: "Mood Swings", type: "orange" },
        { label: "Sadness", type: "orange" },
        { label: "Low Energy", type: "orange" },
        { label: "Apathetic", type: "orange" },
        { label: "Confused", type: "orange" },

        // Negative (Red)
        { label: "Irritable", type: "negative" },
        { label: "Panic", type: "negative" },
        { label: "Depressed", type: "negative" },
        { label: "Overwhelmed", type: "negative" },
        { label: "Annoyed", type: "negative" },
        { label: "Angry", type: "negative" },
    ];


    const exerciseOptions = ["Agility", "Cardio", "Gym", "Light Movement", "Cycling", "Swimming", "Yoga"];
    const selfLoveOptions = ["Travel", "Stress", "Meditation", "Journal", "Hobbies"];
    const sleepOptions = [
        { label: "Refreshed", type: "positive" },
        { label: "Restful", type: "positive" },
        { label: "Deep Sleep", type: "positive" },
        { label: "Vivid Dreams", type: "positive" },
        { label: "Normal Sleep", type: "neutral" },
        { label: "Wake Often", type: "negative" },
        { label: "Insomnia", type: "negative" },
        { label: "No Sleep", type: "negative" },
        { label: "Nightmares", type: "negative" },
    ];

    const disruptorsList = [
        { label: "Stress", type: "negative" },
        { label: "Smoking", type: "negative" },
        { label: "Alcohol", type: "negative" },
        { label: "Meds side-effects", type: "orange" },
        { label: "Overexercise", type: "orange" },
        { label: "Caffeine", type: "orange" },
        { label: "Inactivity", type: "orange" },
        { label: "Poor Diet", type: "orange" },
        { label: "Sugary Food", type: "orange" },
        { label: "Travel", type: "orange" },
        { label: "Late Night", type: "orange" },
        { label: "Screen Time", type: "orange" },
        { label: "Pollution", type: "orange" },
    ];

    const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            const isPeriodMode = trackMode === "period";

            // Prepare Initial Payload Variables
            let finalCervicalDischarge = !isPeriodMode ? (cervicalDischarge || null) : null;
            let finalNotes = note;

            // Strict check: DO NOT allow manual input interference, use DB value for MPIQ score
            const mpiqLastPeriodDB = cycleSettings.last_period_start;

            // 1. MPIQ LOGIC: Save as ["Consistency", "Appearance", "Sensation"]
            // We check if ANY option is selected to save meaningful data
            if (!isPeriodMode && (mpiqConsistency || mpiqAppearance || mpiqSensation)) {
                // Construct the array the user requested
                const mpiqArray = [
                    mpiqConsistency || "",
                    mpiqAppearance || "",
                    mpiqSensation || ""
                ];
                finalCervicalDischarge = JSON.stringify(mpiqArray);
            }

            // Prepare Final Payload
            const payload = {
                date: formatDate(selectedDate),
                symptoms: selectedSymptoms,
                moods: selectedMoods,
                exerciseTypes: selectedExercise,
                exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
                waterIntake: waterIntake,
                selfLoveTags: selectedSelfLove,
                selfLoveOther: selfLoveOther,
                sleepQuality: selectedSleepQuality,
                sleepMinutes: (sleepHours || sleepMinutes) ? (parseInt(sleepHours || "0") * 60 + parseInt(sleepMinutes || "0")) : null,
                disruptors: selectedDisruptors,
                isPeriod: isPeriodMode,
                flowIntensity: isPeriodMode ? flowIntensity || "Normal" : undefined,
                cervicalDischarge: finalCervicalDischarge || undefined,
                notes: finalNotes
            };

            const result = await logDailySymptoms(payload);
            if (!result.success) {
                alert("Failed to save: " + result.error);
                return;
            }

            // START or CONTINUE PERIOD
            if (isPeriodMode) {
                if (!cycleSettings.last_period_start) {
                    await updateLastPeriodDate(formatDate(selectedDate));
                } else {
                    const lastStart = new Date(cycleSettings.last_period_start);
                    lastStart.setHours(0, 0, 0, 0);

                    const current = new Date(selectedDate);
                    current.setHours(0, 0, 0, 0);

                    const diffDays = Math.floor(
                        (current.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    // New Cycle Logic (Check if at least 14 days since last period to detect new cycle vs long period)
                    if (diffDays >= 14 || diffDays < 0) {
                        await updateLastPeriodDate(formatDate(selectedDate));
                        // Only update cycle length if it's a reasonable positive duration
                        if (diffDays > 0) {
                            await updateCycleLength(1, diffDays); // Reset period len to 1, update cycle len
                        } else {
                            await updateCycleLength(1); // Just reset period length
                        }
                    } else {
                        // Extending current period logic
                        const newLength = diffDays + 1;
                        if (newLength > cycleSettings.period_length_days) {
                            await updateCycleLength(newLength);
                        }
                    }
                }
            } else if (!isPeriodMode && cycleSettings.last_period_start) {
                const start = new Date(cycleSettings.last_period_start);
                start.setHours(0, 0, 0, 0);

                const end = new Date(selectedDate);
                end.setHours(0, 0, 0, 0);

                const diffTime = end.getTime() - start.getTime();
                const length = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of selected date

                if (length > 0 && length <= 10) {
                    await updateCycleLength(length);
                }
            }

            alert("Entry Saved & Cycle Updated!");
            window.location.reload();
        });
    };


    const handleUpdatePeriod = (showAlert = true) => {
        startTransition(async () => {
            const dateStr = formatDate(selectedDate);
            const result = await updateLastPeriodDate(dateStr);

            if (result.success) {
                setCycleSettings({
                    ...cycleSettings,
                    last_period_start: dateStr
                });
                setIsEditingCycle(false);
                if (showAlert) {
                    alert(`Cycle updated! Period start date set to ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
                }
                window.location.reload();
            } else {
                alert("Failed to update cycle: " + result.error);
            }
        });
    };

    const getPhaseColor = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "bg-rose-200/40 text-gray-900 hover:bg-rose-200/60";
            case "Follicular":
                return "bg-teal-200/40 text-gray-900 hover:bg-teal-200/60";
            case "Ovulatory":
                return "bg-amber-200/40 text-gray-900 hover:bg-amber-200/60";
            case "Luteal":
                return "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/60";
            default:
                return "bg-gray-100/50 text-gray-400";
        }
    };

    const getPhaseDot = (p: Phase) => {
        switch (p) {
            case "Menstrual": return "bg-rose-400";
            case "Follicular": return "bg-teal-400";
            case "Ovulatory": return "bg-amber-400";
            case "Luteal": return "bg-indigo-400";
            default: return "bg-gray-400";
        }
    };

    const currentPhase = getPhaseForDate(selectedDate);
    // Use cycleSettings for progress bar check (strictly bound to db)
    const mpiqLastPeriodDB = cycleSettings.last_period_start;
    const waveProgress = [!!mpiqLastPeriodDB, !!mpiqConsistency, !!mpiqAppearance, !!mpiqSensation].filter(Boolean).length * 25;

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-orange-50/20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Tracker</h1>
                            <p className="text-xs text-gray-500">Log your daily rhythm</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditingCycle(!isEditingCycle)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <Edit2 className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-24">
                {/* Edit Cycle Banner */}
                <AnimatePresence>
                    {isEditingCycle && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-3xl p-5 border border-rose-100"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-rose-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Update Period Start Date</h3>
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        Select the correct start date of your last period on the calendar, then update to recalibrate predictions.
                                    </p>
                                    <button
                                        onClick={() => handleUpdatePeriod(true)}
                                        className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
                                    >
                                        Update Start Date
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsEditingCycle(false)}
                                    className="p-1.5 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current Phase Badge */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", getPhaseDot(currentPhase))} />
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Current Phase</p>
                                <p className="text-lg font-semibold text-gray-900">{currentPhase}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-0.5">Selected Date</p>
                            <p className="text-sm font-medium text-gray-900">
                                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="bg-white/80 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl shadow-rose-100/20 border border-white/50 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={prevMonth}
                                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 mb-3">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-0">
                        {calendarDays.map((dayItem, i) => {
                            if (dayItem.isPadding) return <div key={i} />;

                            const date = dayItem.date;
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFuture = isFutureDate(date);
                            const phase = getPhaseForDate(date);
                            const isDisabled = isEditingCycle ? false : isFuture;

                            // Calculate Fertile Window
                            const dayInCycle = getCycleDay(date);
                            const ovulationDay = (cycleSettings.cycle_length_days || 28) - 14;
                            const isFertile = dayInCycle >= (ovulationDay - 5) && dayInCycle <= (ovulationDay + 2);

                            // Determine phase neighbors for strip styling
                            const isRowStart = i % 7 === 0;
                            const isRowEnd = i % 7 === 6;

                            const prevItem = !isRowStart ? calendarDays[i - 1] : null;
                            const nextItem = !isRowEnd ? calendarDays[i + 1] : null;

                            const prevPhase = prevItem && !prevItem.isPadding ? getPhaseForDate(prevItem.date) : null;
                            const nextPhase = nextItem && !nextItem.isPadding ? getPhaseForDate(nextItem.date) : null;

                            const samePrev = prevPhase === phase;
                            const sameNext = nextPhase === phase;

                            return (
                                <button
                                    key={i}
                                    onClick={() => !isDisabled && setSelectedDate(date)}
                                    disabled={isDisabled}
                                    className={cn(
                                        "relative h-11 w-full flex items-center justify-center text-sm font-medium transition-all group backdrop-blur-[2px]",
                                        getPhaseColor(phase),
                                        // Shape logic for continuous strips (removed mx-1px)
                                        samePrev && "ml-0 rounded-l-none border-l-0",
                                        sameNext && "mr-0 rounded-r-none border-r-0",
                                        (!samePrev || isRowStart) && "rounded-l-xl",
                                        (!sameNext || isRowEnd) && "rounded-r-xl",

                                        // Selection state override - floating effect
                                        isSelected && "z-10 shadow-lg shadow-gray-200/50 scale-105",
                                        isSelected && !samePrev && !sameNext && "rounded-xl",

                                        // Interaction
                                        !isSelected && !isDisabled && "hover:brightness-95",
                                        isDisabled && "opacity-30 cursor-not-allowed grayscale"
                                    )}
                                >
                                    <span className={cn(
                                        "relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                        isSelected ? "bg-gray-900 text-white shadow-lg" : ""
                                    )}>
                                        {date.getDate()}
                                    </span>
                                    {isToday && !isSelected && (
                                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-50" />
                                    )}
                                    {isFertile && !isSelected && !isToday && (
                                        <div className="absolute bottom-1 w-3 h-0.5 rounded-full bg-blue-900/40" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Privacy Notice */}
                    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100/50">
                        <Shield className="w-3 h-3 text-gray-400" />
                        <p className="text-[10px] text-gray-400 font-medium">Your data is encrypted and will never be shared</p>
                    </div>
                </div>



                {/* Logging Sections */}
                {!isEditingCycle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Toggle Track Mode */}
                        <div className="flex bg-gray-100/50 p-1 rounded-full mb-2">
                            <button
                                onClick={() => setTrackMode("period")}
                                className={cn(
                                    "flex-1 py-2 text-sm font-medium rounded-full transition-all",
                                    trackMode === "period"
                                        ? "bg-white text-rose-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Start Period
                            </button>
                            <button
                                onClick={() => setTrackMode("discharge")}
                                className={cn(
                                    "flex-1 py-2 text-sm font-medium rounded-full transition-all",
                                    trackMode === "discharge"
                                        ? "bg-white text-rose-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                End Period
                            </button>
                        </div>

                        {/* Flow Card (Period Mode) */}
                        {trackMode === "period" && (
                            <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Droplets className="w-5 h-5 text-rose-500" />
                                    <h3 className="text-base font-semibold text-gray-900">Flow</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {flowOptions.map((f) => {
                                        const isActive = flowIntensity === f;
                                        return (
                                            <button
                                                key={f}
                                                onClick={() => setFlowIntensity(isActive ? null : f)}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                                                    isActive
                                                        ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-transparent shadow-md shadow-rose-200"
                                                        : "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30"
                                                )}
                                            >
                                                {f}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Advanced Cervical Discharge Card (MPIQ) */}
                        {trackMode === "discharge" && (
                            <div className={cn(
                                "relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-100/20 border border-blue-100 transition-all duration-300",
                                isDischargeExpanded ? "p-0" : "p-0"
                            )}>
                                {!isDischargeExpanded ? (
                                    <button
                                        onClick={() => setIsDischargeExpanded(true)}
                                        className="w-full p-5 flex items-center justify-between group hover:bg-white/40 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Waves className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-base font-semibold text-gray-900">Discharge</h3>
                                                <p className="text-xs text-gray-500">Please fill out 3 questions for accurate phase prediction</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                            <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </button>
                                ) : (
                                    <>
                                        {/* Wave Progress Bar */}
                                        <div className="absolute top-0 left-0 right-0 h-3 bg-gray-100/50 z-0">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-teal-300 via-blue-400 to-indigo-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${waveProgress}%` }}
                                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                            />
                                            {/* SVG Wave Overlay for effect */}
                                            <svg className="absolute top-0 w-full h-full text-white/30" preserveAspectRatio="none" viewBox="0 0 100 10">
                                                <path d="M0 10 Q 25 0 50 10 T 100 10 V 10 H 0 Z" fill="currentColor" />
                                            </svg>
                                        </div>

                                        <div className="p-6 pt-8 relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Waves className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">Cervical Discharge</h3>
                                                        <p className="text-xs text-gray-500">Answer 4 questions to track fertility</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsDischargeExpanded(false)}
                                                    className="p-2 hover:bg-blue-50/50 rounded-full transition-colors text-blue-400 hover:text-blue-600"
                                                >
                                                    <div className="sr-only">Collapse</div>
                                                    <ChevronRight className="w-5 h-5 -rotate-90" />
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Q1: Last Period Date */}
                                                <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-gray-700">1. First day of last period?</p>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={cycleSettings.last_period_start} // READ ONLY FROM DB
                                                            disabled
                                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                                                        />
                                                        <div className="absolute inset-y-0 right-2 flex items-center">
                                                            <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
                                                                From Calendar
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Q2: Consistency */}
                                                <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                    <p className="text-sm font-medium text-gray-700 mb-3">2. Consistency of discharge?</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {consistencyOptions.map((opt) => (
                                                            <button
                                                                key={opt.label}
                                                                onClick={() => setMpiqConsistency(opt.label)}
                                                                className={cn(
                                                                    "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                                    mpiqConsistency === opt.label
                                                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                        : "bg-white border-gray-100 hover:bg-gray-50"
                                                                )}
                                                            >
                                                                {/* Image/Video Media */}
                                                                <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-2 overflow-hidden shadow-inner">
                                                                    {opt.type === 'video' ? (
                                                                        <video
                                                                            src={opt.src}
                                                                            autoPlay
                                                                            loop
                                                                            muted
                                                                            playsInline
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <img
                                                                            src={opt.src}
                                                                            alt={opt.label}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-semibold text-gray-800">{opt.label}</span>
                                                                <span className="text-[10px] text-gray-400 leading-tight mt-1">{opt.desc}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Q3: Appearance */}
                                                <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                    <p className="text-sm font-medium text-gray-700 mb-3">3. Appearance of discharge?</p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {appearanceOptions.map((opt) => (
                                                            <button
                                                                key={opt.label}
                                                                onClick={() => setMpiqAppearance(opt.label)}
                                                                className={cn(
                                                                    "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                                    mpiqAppearance === opt.label
                                                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                        : "bg-white border-gray-100 hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-2 overflow-hidden shadow-inner">
                                                                    {opt.type === 'video' ? (
                                                                        <video
                                                                            src={opt.src}
                                                                            autoPlay
                                                                            loop
                                                                            muted
                                                                            playsInline
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <img
                                                                            src={opt.src}
                                                                            alt={opt.label}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-semibold text-gray-800">{opt.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Q4: Sensation */}
                                                <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                    <p className="text-sm font-medium text-gray-700 mb-3">4. Vaginal sensation?</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {sensationOptions.map((opt) => (
                                                            <button
                                                                key={opt.label}
                                                                onClick={() => setMpiqSensation(opt.label)}
                                                                className={cn(
                                                                    "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                                    mpiqSensation === opt.label
                                                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                        : "bg-white border-gray-100 hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <span className="text-xs font-semibold text-gray-800">{opt.label}</span>
                                                                <span className="text-[10px] text-gray-400 leading-tight mt-1">{opt.desc}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Symptoms Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
                                >
                                    <Activity className="w-4 h-4 text-rose-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Symptoms</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {symptomOptions.map(s => {
                                    const isActive = selectedSymptoms.includes(s);
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => toggleItem(s, selectedSymptoms, setSelectedSymptoms)}
                                            className={cn(
                                                "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                isActive
                                                    ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-transparent shadow-md shadow-rose-200"
                                                    : "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30"
                                            )}
                                        >
                                            {isActive && <Check className="w-3.5 h-3.5" />}
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Moods Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        y: [0, -2, 0],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
                                >
                                    <Smile className="w-4 h-4 text-rose-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Moods</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {moodsList.map(m => {
                                    const isActive = selectedMoods.includes(m.label);

                                    // Dynamic Styling Logic
                                    let activeClass = "";
                                    let inactiveClass = "";

                                    switch (m.type) {
                                        case 'positive': // Green
                                            activeClass = "bg-green-100 text-green-800 border-green-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-green-100 ring-1 ring-green-50 hover:bg-green-50/50";
                                            break;
                                        case 'blue': // Blue
                                            activeClass = "bg-blue-100 text-blue-800 border-blue-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-blue-100 ring-1 ring-blue-50 hover:bg-blue-50/50";
                                            break;
                                        case 'orange': // Orange
                                            activeClass = "bg-orange-100 text-orange-800 border-orange-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-orange-100 ring-1 ring-orange-50 hover:bg-orange-50/50";
                                            break;
                                        case 'negative': // Red
                                            activeClass = "bg-red-100 text-red-800 border-red-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-red-100 ring-1 ring-red-50 hover:bg-red-50/50";
                                            break;
                                        default:
                                            activeClass = "bg-gray-200 text-gray-900";
                                            inactiveClass = "bg-white text-gray-600 border-gray-100";
                                    }

                                    return (
                                        <button
                                            key={m.label}
                                            onClick={() => toggleItem(m.label, selectedMoods, setSelectedMoods)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                                                isActive ? activeClass : inactiveClass
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3" />}
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>



                        {/* Exercise Card */}
                        <div className="bg-gradient-to-br from-white to-green-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-green-100/20 border border-green-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 45, 0]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"
                                    >
                                        <Dumbbell className="w-4 h-4 text-green-500" />
                                    </motion.div>
                                    <h3 className="text-base font-semibold text-gray-900">Exercise Log</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedExercise([]);
                                        setExerciseMinutes("");
                                    }}
                                    className="text-[10px] font-medium text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-full bg-white border border-gray-100 hover:border-red-100"
                                >
                                    Didn't Exercise
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {exerciseOptions.map(e => {
                                        const isActive = selectedExercise.includes(e);
                                        return (
                                            <button
                                                key={e}
                                                onClick={() => toggleItem(e, selectedExercise, setSelectedExercise)}
                                                className={cn(
                                                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                    isActive
                                                        ? "bg-green-100 text-green-800 border-green-300 shadow-sm"
                                                        : "bg-white border-green-100/50 text-gray-600 hover:border-green-200 hover:bg-green-50/30"
                                                )}
                                            >
                                                {isActive && <Check className="w-3.5 h-3.5" />}
                                                {e}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Digital Clock Input */}
                                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-green-100/50">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 block mb-1">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            value={exerciseMinutes}
                                            onChange={(e) => setExerciseMinutes(e.target.value)}
                                            placeholder="00"
                                            className="w-full bg-transparent text-xl font-mono font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none"
                                        />
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">MIN</div>
                                </div>
                            </div>
                        </div>

                        {/* Water Intake Card */}
                        <div className="bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-blue-100/20 border border-blue-100">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    animate={{
                                        y: [0, 3, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                                >
                                    <Droplet className="w-4 h-4 text-blue-500 fill-blue-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Hydration</h3>
                            </div>

                            <div className="flex items-center gap-8 justify-center">
                                {/* Glass Animation */}
                                <div className="relative w-24 h-32 border-4 border-blue-200 border-t-0 rounded-b-3xl bg-blue-50/10 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-inner">
                                    {/* Liquid */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 bg-blue-400/80 backdrop-blur-md"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.min(waterIntake, 8) * 12.5}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300/50 animate-pulse" />

                                        {/* Bubbles */}
                                        <div className="absolute w-full h-full overflow-hidden">
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute bg-white/30 rounded-full w-2 h-2"
                                                    initial={{ bottom: -10, left: `${20 + i * 30}%`, opacity: 0 }}
                                                    animate={{ bottom: "100%", opacity: [0, 1, 0] }}
                                                    transition={{
                                                        duration: 2 + i,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                        delay: i * 0.5
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Pouring Stream */}
                                    <AnimatePresence>
                                        {isPouring && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "105%", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-12"
                                                style={{ originY: 0 }}
                                            >
                                                <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="w-full h-full text-blue-400 fill-current drop-shadow-sm">
                                                    {/* Fluid shape: narrow top, widening bottom with curves */}
                                                    <path d="M 18 0 Q 21 30 15 90 Q 5 100 0 100 L 40 100 Q 35 100 25 90 Q 19 30 22 0 Z" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="text-center h-16 flex flex-col justify-center">
                                        <AnimatePresence mode="wait">
                                            {waterIntake >= 8 ? (
                                                <motion.div
                                                    key="success"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="w-40"
                                                >
                                                    <p className="text-[10px] uppercase tracking-wide text-green-500 font-bold mb-0.5">Woohoo!</p>
                                                    <p className="text-xs text-green-600 font-medium leading-tight">You’re taking care of yourself 💧</p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="count"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                >
                                                    <p className="text-3xl font-bold text-gray-900">{waterIntake * 250}<span className="text-sm font-medium text-gray-400 ml-1">ml</span></p>
                                                    <p className="text-xs text-gray-500">{waterIntake} / 8 glasses</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setWaterIntake(waterIntake + 1);
                                                setIsPouring(true);
                                                setTimeout(() => setIsPouring(false), 600);
                                            }}
                                            className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Self Love Card */}
                        <div className="bg-gradient-to-br from-white to-pink-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-pink-100/20 border border-pink-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center"
                                >
                                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Self Love Log</h3>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {selfLoveOptions.map(option => {
                                        const isActive = selectedSelfLove.includes(option);
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => toggleItem(option, selectedSelfLove, setSelectedSelfLove)}
                                                className={cn(
                                                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                    isActive
                                                        ? "bg-pink-100 text-pink-800 border-pink-300 shadow-sm"
                                                        : "bg-white border-pink-100/50 text-gray-600 hover:border-pink-200 hover:bg-pink-50/30"
                                                )}
                                            >
                                                {isActive && <Check className="w-3.5 h-3.5" />}
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Others (log here)..."
                                    value={selfLoveOther}
                                    onChange={(e) => setSelfLoveOther(e.target.value)}
                                    className="w-full bg-white/60 border border-pink-100/50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Sleep Card */}
                        <div className="bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-indigo-100/20 border border-indigo-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        y: [0, -3, 0],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"
                                >
                                    <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Sleep Log</h3>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {sleepOptions.map(m => {
                                        const isActive = selectedSleepQuality.includes(m.label);
                                        return (
                                            <button
                                                key={m.label}
                                                onClick={() => toggleItem(m.label, selectedSleepQuality, setSelectedSleepQuality)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border-2",
                                                    isActive
                                                        ? m.type === "positive" ? "bg-blue-100 text-blue-800 border-blue-300"
                                                            : m.type === "negative" ? "bg-red-100 text-red-800 border-red-300"
                                                                : "bg-orange-100 text-orange-800 border-orange-300"
                                                        : "bg-white border-indigo-50 text-gray-600 hover:border-indigo-100"
                                                )}
                                            >
                                                {isActive && <Check className="w-3 h-3 inline mr-1" />}
                                                {m.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-indigo-100/50">
                                    <Clock className="w-5 h-5 text-indigo-400" />
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Hours</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={sleepHours}
                                                onChange={(e) => setSleepHours(e.target.value)}
                                                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
                                            />
                                        </div>
                                        <span className="text-xl font-mono font-bold text-gray-300">:</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Mins</span>
                                            <input
                                                type="number"
                                                placeholder="00"
                                                value={sleepMinutes}
                                                onChange={(e) => setSleepMinutes(e.target.value)}
                                                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="ml-auto text-xs font-medium text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg">
                                        TOTAL DURATION
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Disruptors Card */}
                        <div className="bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-orange-100/20 border border-orange-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
                                >
                                    <ZapOff className="w-4 h-4 text-orange-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Disruptors</h3>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {disruptorsList.map(item => {
                                    const isActive = selectedDisruptors.includes(item.label);
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => toggleItem(item.label, selectedDisruptors, setSelectedDisruptors)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border-2",
                                                isActive
                                                    ? item.type === "negative"
                                                        ? "bg-red-100 text-red-800 border-red-300 shadow-sm"
                                                        : "bg-orange-100 text-orange-800 border-orange-300 shadow-sm"
                                                    : "bg-white border-orange-100/50 text-gray-600 hover:border-orange-200"
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3 inline mr-1" />}
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Note Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        x: [0, 2, -2, 0],
                                        y: [0, -2, 2, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
                                >
                                    <PenLine className="w-4 h-4 text-rose-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Note</h3>
                            </div>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="How are you feeling today?"
                                className="w-full bg-white/50 border border-rose-100 rounded-2xl p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent transition-all resize-none h-32"
                            />
                            <div className="mt-2 text-xs text-gray-400 text-right">
                                {note.length} characters
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isPending || isFutureDate(selectedDate)}
                                className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-base font-semibold rounded-full hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300"
                            >
                                {isPending ? "Saving..." : "Save Log"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div >
    );
}