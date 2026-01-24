"use client";

import { useState, useEffect, useTransition, useRef, useMemo } from "react";
import { Calendar, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    logDailySymptoms,
    getDailyLog,
    fetchUserCycleSettings,
    updateLastPeriodDate,
    fetchMonthLogs,
} from "@/app/actions/cycle-sync";
import confetti from "canvas-confetti";
import { toast, Toaster } from "sonner";

import PeriodLoggingCard from "./components/PeriodLoggingCard";
import FlowCard from "./components/FlowCard";
import DischargeCard, { Consistency, Appearance, Sensation } from "./components/DischargeCard";
import SymptomsCard from "./components/SymptomsCard";
import MoodsCard from "./components/MoodsCard";
import ExerciseCard from "./components/ExerciseCard";
import WaterIntakeCard from "./components/WaterIntakeCard";
import SleepCard from "./components/SleepCard";
import DisruptorsCard from "./components/DisruptorsCard";
import SelfLoveCard from "./components/SelfLoveCard";
import NoteCard from "./components/NoteCard";

export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal" | null;



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
    const [isDischargeExpanded, setIsDischargeExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [monthLogs, setMonthLogs] = useState<Record<string, any>>({});

    // Period logging mode (circle calendar toggles only when this is true)
    const [isPeriodLoggingMode, setIsPeriodLoggingMode] = useState(false);
    const [pendingPeriodChanges, setPendingPeriodChanges] = useState<Set<string>>(new Set());

    const calendarRef = useRef<HTMLDivElement>(null);

    // MPIQ Specific State
    const [mpiqConsistency, setMpiqConsistency] = useState<Consistency | null>(null);
    const [mpiqAppearance, setMpiqAppearance] = useState<Appearance | null>(null);
    const [mpiqSensation, setMpiqSensation] = useState<Sensation | null>(null);

    const [cycleSettings, setCycleSettings] = useState({
        last_period_start: "",
        cycle_length_days: 28,
        period_length_days: 5,
    });

    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
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
                    period_length_days: settings.period_length_days || 5,
                });

                if (!settings.last_period_start) {
                    setIsEditingCycle(true);
                    toast.info("Welcome back! Please set your last period date to sync your cycle.", {
                        duration: 6000,
                    });
                }
            } else {
                setIsEditingCycle(true);
            }
        };
        loadSettings();
    }, []);

    // Fetch month logs (prev/current/next)
    useEffect(() => {
        const loadMonthLogs = async () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            const monthsToFetch = [
                new Date(year, month - 1, 1),
                new Date(year, month, 1),
                new Date(year, month + 1, 1),
            ];

            const allLogs: any[] = [];
            for (const monthDate of monthsToFetch) {
                const monthYear = monthDate.getFullYear();
                const monthNum = String(monthDate.getMonth() + 1).padStart(2, "0");
                const logs = await fetchMonthLogs(`${monthYear}-${monthNum}`);
                allLogs.push(...logs);
            }

            const logMap: Record<string, any> = {};
            allLogs.forEach((l: any) => {
                logMap[l.date] = l;
            });
            setMonthLogs(logMap);
        };

        loadMonthLogs();
    }, [currentMonth]);

    // Fetch existing log when selected date changes
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

                if (data.cervical_discharge) {
                    try {
                        if (data.cervical_discharge.startsWith("[")) {
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (Array.isArray(parsed) && parsed.length >= 3) {
                                setMpiqConsistency(parsed[0]);
                                setMpiqAppearance(parsed[1]);
                                setMpiqSensation(parsed[2]);
                            }
                        } else if (data.cervical_discharge.startsWith("{")) {
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (parsed.type === "MPIQ") {
                                setMpiqConsistency(parsed.consistency || null);
                                setMpiqAppearance(parsed.appearance || null);
                                setMpiqSensation(parsed.sensation || null);
                                setCervicalDischarge(parsed.legacyLabel || null);
                            } else {
                                setCervicalDischarge(data.cervical_discharge);
                            }
                        } else {
                            setCervicalDischarge(data.cervical_discharge);
                            setMpiqConsistency(null);
                            setMpiqAppearance(null);
                            setMpiqSensation(null);
                        }
                    } catch {
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

                if (data.flow_intensity || data.is_period) setTrackMode("period");
                else setTrackMode("discharge");
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
                setTrackMode("discharge");
                setMpiqConsistency(null);
                setMpiqAppearance(null);
                setMpiqSensation(null);
            }
        };

        fetchLog();
    }, [selectedDate]);



    // Confetti Effect for Water Goal
    useEffect(() => {
        if (waterIntake === 8) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#60A5FA", "#3B82F6", "#93C5FD", "#FFFFFF"],
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
        const days: { date: Date; isPadding: boolean }[] = [];
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

    const handleSave = () => {
        startTransition(async () => {
            const isPeriodMode = trackMode === "period";

            let finalCervicalDischarge = !isPeriodMode ? cervicalDischarge || null : null;
            let finalNotes = note;

            if (!isPeriodMode && (mpiqConsistency || mpiqAppearance || mpiqSensation)) {
                const mpiqArray = [mpiqConsistency || "", mpiqAppearance || "", mpiqSensation || ""];
                finalCervicalDischarge = JSON.stringify(mpiqArray);
            }

            const payload = {
                date: formatDate(selectedDate),
                symptoms: selectedSymptoms,
                moods: selectedMoods,
                exerciseTypes: selectedExercise,
                exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
                waterIntake,
                selfLoveTags: selectedSelfLove,
                selfLoveOther,
                sleepQuality: selectedSleepQuality,
                sleepMinutes: (sleepHours || sleepMinutes)
                    ? parseInt(sleepHours || "0") * 60 + parseInt(sleepMinutes || "0")
                    : null,
                disruptors: selectedDisruptors,
                isPeriod: isPeriodMode,
                flowIntensity: isPeriodMode ? flowIntensity || "Normal" : undefined,
                cervicalDischarge: finalCervicalDischarge || undefined,
                notes: finalNotes,
            };

            const result = await logDailySymptoms(payload);

            if (!result.success) {
                toast.error("Failed to save entry", { description: result.error, duration: 5000 });
                return;
            }

            toast.success("Entry Saved!", { description: "Your daily log has been updated.", duration: 3000 });

            // Refresh logs
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const monthsToFetch = [
                new Date(year, month - 1, 1),
                new Date(year, month, 1),
                new Date(year, month + 1, 1),
            ];

            const allLogs: any[] = [];
            for (const monthDate of monthsToFetch) {
                const monthYear = monthDate.getFullYear();
                const monthNum = String(monthDate.getMonth() + 1).padStart(2, "0");
                const logs = await fetchMonthLogs(`${monthYear}-${monthNum}`);
                allLogs.push(...logs);
            }

            const logMap: Record<string, any> = {};
            allLogs.forEach((l: any) => {
                logMap[l.date] = l;
            });
            setMonthLogs(logMap);
        });
    };

    const handleTogglePeriodDate = (dateStr: string) => {
        const isCurrentlyLogged = monthLogs[dateStr]?.is_period === true;
        const isPendingLocal = pendingPeriodChanges.has(dateStr);

        setPendingPeriodChanges((prev) => {
            const next = new Set(prev);
            if (next.has(dateStr)) next.delete(dateStr);
            else next.add(dateStr);
            return next;
        });

        setMonthLogs((prev) => {
            const newPeriodState = isPendingLocal ? isCurrentlyLogged : !isCurrentlyLogged;
            return {
                ...prev,
                [dateStr]: {
                    ...prev[dateStr],
                    is_period: newPeriodState,
                },
            };
        });
    };

    const handleSavePeriodChanges = async () => {
        if (pendingPeriodChanges.size === 0) {
            setIsPeriodLoggingMode(false);
            return;
        }

        startTransition(async () => {
            try {
                const updates = Array.from(pendingPeriodChanges).map(async (dateStr) => {
                    const isCurrentlyLogged = monthLogs[dateStr]?.is_period === true;

                    return logDailySymptoms({
                        date: dateStr,
                        symptoms: monthLogs[dateStr]?.symptoms || [],
                        isPeriod: isCurrentlyLogged,
                        flowIntensity: isCurrentlyLogged ? "Normal" : undefined,
                        moods: monthLogs[dateStr]?.moods || [],
                        notes: monthLogs[dateStr]?.notes || "",
                        waterIntake: monthLogs[dateStr]?.water_intake || 0,
                    });
                });

                await Promise.all(updates);

                // Update last period start from earliest period day
                const allPeriodDates = Object.keys(monthLogs)
                    .filter((d) => monthLogs[d]?.is_period === true)
                    .sort();

                if (allPeriodDates.length > 0) {
                    await updateLastPeriodDate(allPeriodDates[0]);
                    const freshSettings = await fetchUserCycleSettings();
                    if (freshSettings) {
                        setCycleSettings({
                            last_period_start: freshSettings.last_period_start,
                            cycle_length_days: freshSettings.cycle_length_days || 28,
                            period_length_days: freshSettings.period_length_days || 5,
                        });
                    }
                }

                // Refresh logs
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const monthsToFetch = [
                    new Date(year, month - 1, 1),
                    new Date(year, month, 1),
                    new Date(year, month + 1, 1),
                ];

                const allLogs: any[] = [];
                for (const monthDate of monthsToFetch) {
                    const monthYear = monthDate.getFullYear();
                    const monthNum = String(monthDate.getMonth() + 1).padStart(2, "0");
                    const logs = await fetchMonthLogs(`${monthYear}-${monthNum}`);
                    allLogs.push(...logs);
                }

                const logMap: Record<string, any> = {};
                allLogs.forEach((l: any) => {
                    logMap[l.date] = l;
                });
                setMonthLogs(logMap);

                setPendingPeriodChanges(new Set());
                setIsPeriodLoggingMode(false);

                toast.success("Period dates updated!", { duration: 2000 });
            } catch {
                toast.error("Failed to save period dates", { description: "Please try again", duration: 3000 });
            }
        });
    };

    const handleEnablePeriodLogging = () => {
        setPendingPeriodChanges(new Set());
        setIsPeriodLoggingMode(true);
        setTimeout(() => {
            calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const handleExitPeriodLogging = () => {
        handleSavePeriodChanges();
    };

    const handleUpdatePeriod = (showAlert = true) => {
        startTransition(async () => {
            const dateStr = formatDate(selectedDate);
            const result = await updateLastPeriodDate(dateStr);

            if (result.success) {
                setCycleSettings({ ...cycleSettings, last_period_start: dateStr });
                setIsEditingCycle(false);
                if (showAlert) {
                    alert(
                        `Cycle updated! Period start date set to ${selectedDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}`
                    );
                }
                window.location.reload();
            } else {
                alert("Failed to update cycle: " + result.error);
            }
        });
    };

    // ---------- Phase prediction for the badge (same model as calendar) ----------
    const getRelevantPeriodStart = useMemo(() => {
        const findStreakStart = (startStr: string) => {
            let cur = new Date(startStr);
            cur.setHours(0, 0, 0, 0);
            let first = startStr;

            while (true) {
                cur.setDate(cur.getDate() - 1);
                const prevStr = formatDate(cur);
                if (monthLogs[prevStr]?.is_period) first = prevStr;
                else break;
            }
            return first;
        };

        return (targetDate: Date): string | null => {
            const dateStr = formatDate(targetDate);

            if (monthLogs[dateStr]?.is_period) return findStreakStart(dateStr);

            const datesDesc = Object.keys(monthLogs).sort().reverse();
            for (const d of datesDesc) {
                if (d < dateStr && monthLogs[d]?.is_period) return findStreakStart(d);
            }

            if (cycleSettings.last_period_start) {
                const globalStart = new Date(cycleSettings.last_period_start);
                globalStart.setHours(0, 0, 0, 0);
                const check = new Date(targetDate);
                check.setHours(0, 0, 0, 0);
                if (check >= globalStart) return cycleSettings.last_period_start;
            }

            return null;
        };
    }, [monthLogs, cycleSettings.last_period_start]); // uses formatDate closure

    const getDayInCycle = (date: Date): number | null => {
        const startStr = getRelevantPeriodStart(date);
        if (!startStr) return null;

        const start = new Date(startStr);
        start.setHours(0, 0, 0, 0);

        const check = new Date(date);
        check.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((check.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return null;

        const cycleLength = cycleSettings.cycle_length_days || 28;
        let dayInCycle = (diffDays % cycleLength) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleLength;
        return dayInCycle;
    };

    const getPhaseForDate = (date: Date): Phase => {
        const dateStr = formatDate(date);
        if (monthLogs[dateStr]?.is_period) return "Menstrual";

        const day = getDayInCycle(date);
        if (!day) return null;

        const cycleLength = cycleSettings.cycle_length_days || 28;
        const periodLength = cycleSettings.period_length_days || 5;
        const ovulationDay = cycleLength - 14;

        if (day <= periodLength) return "Menstrual";
        if (day >= ovulationDay - 1 && day <= ovulationDay + 1) return "Ovulatory";
        if (day > ovulationDay + 1) return "Luteal";
        return "Follicular";
    };

    const currentPhase = getPhaseForDate(selectedDate);
    const dayInCycle = getDayInCycle(selectedDate);

    const isFertile = (() => {
        if (!dayInCycle) return false;
        const ovulationDay = (cycleSettings.cycle_length_days || 28) - 14;
        return dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 2;
    })();

    const getPhaseDot = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "bg-[#fb7185]";
            case "Follicular":
                return "bg-[#2dd4bf]";
            case "Ovulatory":
                return "bg-[#fbbf24]";
            case "Luteal":
                return "bg-[#818cf8]";
            default:
                return "bg-gray-400";
        }
    };

    const phasePill = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]/20";
            case "Follicular":
                return "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20";
            case "Ovulatory":
                return "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20";
            case "Luteal":
                return "bg-[#818cf8]/10 text-[#818cf8] border-[#818cf8]/20";
            default:
                return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    const getPhaseTheme = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "border-[#fb7185]/30 shadow-lg shadow-[#fb7185]/10";
            case "Follicular":
                return "border-[#2dd4bf]/30 shadow-lg shadow-[#2dd4bf]/10";
            case "Ovulatory":
                return "border-[#fbbf24]/30 shadow-lg shadow-[#fbbf24]/10";
            case "Luteal":
                return "border-[#818cf8]/30 shadow-lg shadow-[#818cf8]/10";
            default:
                return "border-gray-100 shadow-sm";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-orange-50/20">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="w-10 h-10  rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-black" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-heading font-semibold text-gray-900">Rove Tracker</h1>
                        <p className="text-xs text-gray-500">Log your daily rhythm</p>
                    </div>
                    <div className="w-10" /> {/* Spacer to balance the left icon for perfect centering */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-24">

                {/* Phase + Selected badge (updates when you click a date) */}
                <div className={cn(
                    "bg-white rounded-3xl p-5 border transition-all duration-500",
                    getPhaseTheme(currentPhase)
                )}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", getPhaseDot(currentPhase))} />
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Phase</p>
                                <div
                                    className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-heading font-semibold",
                                        phasePill(currentPhase)
                                    )}
                                >
                                    {currentPhase || "Phase Unknown"}
                                    {isFertile && <span className="text-[11px] font-medium opacity-80">• Fertile</span>}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-0.5">Selected</p>
                            <p className="text-sm font-heading font-semibold text-gray-900">
                                {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                            <p className="text-[11px] text-gray-500">{dayInCycle ? `Day ${dayInCycle}` : "—"}</p>
                        </div>
                    </div>
                </div>

                {/* The ONLY calendar */}
                <div ref={calendarRef}>
                    <PeriodLoggingCard
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        monthLogs={monthLogs}
                        cycleSettings={cycleSettings}
                        isPeriodLoggingMode={isPeriodLoggingMode}
                        currentMonth={currentMonth}
                        calendarDays={calendarDays}
                        onPrevMonth={prevMonth}
                        onNextMonth={nextMonth}
                        onTogglePeriodDate={handleTogglePeriodDate}
                        onExitPeriodLogging={handleExitPeriodLogging}
                        isFutureDate={isFutureDate}
                        formatDate={formatDate}
                        onEnablePeriodLogging={handleEnablePeriodLogging}
                        currentPhase={currentPhase}
                    />
                </div>

                {/* Tracker Cards - Only show when NOT editing cycle */}
                {!isEditingCycle && !isPeriodLoggingMode && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {currentPhase === "Menstrual" ? (
                            <FlowCard flowIntensity={flowIntensity} setFlowIntensity={setFlowIntensity} />
                        ) : (
                            <DischargeCard
                                isDischargeExpanded={isDischargeExpanded}
                                setIsDischargeExpanded={setIsDischargeExpanded}
                                mpiqConsistency={mpiqConsistency}
                                setMpiqConsistency={setMpiqConsistency}
                                mpiqAppearance={mpiqAppearance}
                                setMpiqAppearance={setMpiqAppearance}
                                mpiqSensation={mpiqSensation}
                                setMpiqSensation={setMpiqSensation}
                                selectedDate={selectedDate}
                                getRelevantPeriodStart={getRelevantPeriodStart}
                            />
                        )}

                        <SymptomsCard selectedSymptoms={selectedSymptoms} setSelectedSymptoms={setSelectedSymptoms} />
                        <MoodsCard selectedMoods={selectedMoods} setSelectedMoods={setSelectedMoods} />

                        <ExerciseCard
                            selectedExercise={selectedExercise}
                            exerciseMinutes={exerciseMinutes}
                            setSelectedExercise={setSelectedExercise}
                            setExerciseMinutes={setExerciseMinutes}
                        />

                        <WaterIntakeCard
                            waterIntake={waterIntake}
                            setWaterIntake={setWaterIntake}
                            isPouring={isPouring}
                            setIsPouring={setIsPouring}
                        />

                        <SleepCard
                            selectedSleepQuality={selectedSleepQuality}
                            sleepHours={sleepHours}
                            sleepMinutes={sleepMinutes}
                            setSelectedSleepQuality={setSelectedSleepQuality}
                            setSleepHours={setSleepHours}
                            setSleepMinutes={setSleepMinutes}
                        />

                        <DisruptorsCard selectedDisruptors={selectedDisruptors} setSelectedDisruptors={setSelectedDisruptors} />

                        <SelfLoveCard
                            selectedSelfLove={selectedSelfLove}
                            selfLoveOther={selfLoveOther}
                            setSelectedSelfLove={setSelectedSelfLove}
                            setSelfLoveOther={setSelfLoveOther}
                        />

                        <NoteCard note={note} setNote={setNote} />
                    </motion.div>
                )}

                {/* Save button - Sticky/Fixed above bottom nav on mobile */}
                {!isEditingCycle && !isPeriodLoggingMode && (
                    <div className="fixed bottom-[80px] md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl px-4 z-[60]">
                        <button
                            onClick={handleSave}
                            disabled={isPending || isFutureDate(selectedDate)}
                            className="w-full py-4 bg-[#fb7185] hover:bg-[#fb7185]/90 text-white text-base font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-rose-200/50 flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : "Save Log"}
                        </button>
                    </div>
                )}

                {/* Extra spacing for sticky bottom button */}
                {!isEditingCycle && !isPeriodLoggingMode && (
                    <div className="h-24" />
                )}
            </div>
        </div>
    );
}
