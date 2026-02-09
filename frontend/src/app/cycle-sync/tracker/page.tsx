"use client";

import { useState, useEffect, useTransition, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Edit2, X } from "lucide-react";
import ProfileAvatar from "@/components/cycle-sync/ProfileAvatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    logDailySymptoms,
    getDailyLog,
    fetchUserCycleSettings,
    updateLastPeriodDate,
    fetchMonthLogs,
} from "@/app/actions/cycle-sync";
import { calculatePhase as sharedCalculatePhase, isInFertileWindow, type CycleSettings, type DailyLog as SharedDailyLog } from "@shared/cycle/phase";
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
import SexualWellnessCard from "./components/SexualWellnessCard";
import NoteCard from "./components/NoteCard";
import LoadingScreen from "@/components/ui/LoadingScreen";

export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal" | null;



export default function TrackerPageRedesigned() {
    const router = useRouter();
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
    const [selectedSexActivity, setSelectedSexActivity] = useState<string[]>([]);
    const [selectedContraception, setSelectedContraception] = useState<string[]>([]);
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

    // NEW: Load states to prevent flash
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
    const [isLogsLoaded, setIsLogsLoaded] = useState(false);

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
    const formatDate = useCallback((date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }, []);

    // ⚡ ULTRA-FAST: Single unified load for settings + all logs (runs ONCE on mount)
    useEffect(() => {
        let isMounted = true;

        const loadTrackerData = async () => {
            try {
                const { fetchTrackerPageDataFast } = await import("@/app/actions/cycle-sync");
                const data = await fetchTrackerPageDataFast();

                if (!isMounted) return;

                if (data) {
                    // Set cycle settings
                    setCycleSettings({
                        last_period_start: data.settings.last_period_start,
                        cycle_length_days: data.settings.cycle_length_days,
                        period_length_days: data.settings.period_length_days,
                    });

                    if (!data.hasSettings) {
                        setIsEditingCycle(true);
                        toast.info("Welcome back! Please set your last period date to sync your cycle.", {
                            duration: 6000,
                        });
                    }

                    // Set all month logs at once (no need for 3 separate fetches)
                    setMonthLogs(data.monthLogs);
                    setIsSettingsLoaded(true);
                    setIsLogsLoaded(true);
                } else {
                    setIsEditingCycle(true);
                    setIsSettingsLoaded(true);
                    setIsLogsLoaded(true);
                }
            } catch (error) {
                console.error("Tracker load error:", error);
                setIsSettingsLoaded(true);
                setIsLogsLoaded(true);
            }
        };

        loadTrackerData();

        return () => { isMounted = false; };
    }, []); // ⚡ Empty deps = runs ONCE on mount

    // Track loaded months to prevent infinite re-fetching of empty months
    const loadedMonthsRef = useRef<Set<string>>(new Set());

    // Fetch month logs when navigating months (only for months not already loaded)
    useEffect(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

        // Skip if we already fetched this month session
        if (loadedMonthsRef.current.has(monthKey)) {
            return;
        }

        let isMounted = true;

        const loadMonthLogs = async () => {
            // Mark as fetching immediately to prevent double-fire
            loadedMonthsRef.current.add(monthKey);

            // Also mark prev/next as we fetch them too
            const nextMonth = new Date(year, month + 1, 1);
            const prevMonth = new Date(year, month - 1, 1);
            loadedMonthsRef.current.add(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`);
            loadedMonthsRef.current.add(`${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`);

            const monthsToFetch = [
                prevMonth,
                new Date(year, month, 1),
                nextMonth,
            ];

            // Parallel fetch
            const results = await Promise.all(
                monthsToFetch.map(monthDate => {
                    const monthYear = monthDate.getFullYear();
                    const monthNum = String(monthDate.getMonth() + 1).padStart(2, "0");
                    return fetchMonthLogs(`${monthYear}-${monthNum}`);
                })
            );

            if (!isMounted) return;

            setMonthLogs(prev => {
                const newLogMap = { ...prev };
                results.flat().forEach((l: any) => {
                    newLogMap[l.date] = l;
                });
                return newLogMap;
            });
        };

        loadMonthLogs();

        return () => { isMounted = false; };
    }, [currentMonth]);

    // ⚡ INSTANT: Load selected date log from cache (no API call)
    useEffect(() => {
        const dateKey = formatDate(selectedDate);
        const data = monthLogs[dateKey]; // Use cached data instead of API call

        if (data) {
            setSelectedSymptoms(data.symptoms || []);
            setSelectedMoods(data.moods || []);
            setSelectedExercise(data.exercise_types || []);
            setExerciseMinutes(data.exercise_minutes ? String(data.exercise_minutes) : "");
            setWaterIntake(data.water_intake || 0);
            setSelectedSelfLove(data.self_love_tags || []);
            setSelfLoveOther(data.self_love_other || "");
            setSelectedSleepQuality(data.sleep_quality || []);
            setSelectedDisruptors(data.disruptors || []);
            setSelectedSexActivity(data.sex_activity || []);
            setSelectedContraception(data.contraception || []);

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
            setSelectedSexActivity([]);
            setFlowIntensity(null);
            setCervicalDischarge(null);
            setNote("");
            setTrackMode("discharge");
            setMpiqConsistency(null);
            setMpiqAppearance(null);
            setMpiqSensation(null);
        }
    }, [selectedDate, monthLogs, formatDate]);



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

    const isFutureDate = useCallback((date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    }, []);

    const calendarDays = useMemo(() => {
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
    }, [currentMonth]);

    const nextMonth = useCallback(() => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + 1);
        setCurrentMonth(next);
    }, [currentMonth]);

    const prevMonth = useCallback(() => {
        const prev = new Date(currentMonth);
        prev.setMonth(currentMonth.getMonth() - 1);
        setCurrentMonth(prev);
    }, [currentMonth]);

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
                sexActivity: selectedSexActivity,
                contraception: selectedContraception,
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
                        flowIntensity: isCurrentlyLogged ? (monthLogs[dateStr]?.flow_intensity || "Normal") : undefined,
                        moods: monthLogs[dateStr]?.moods || [],
                        notes: monthLogs[dateStr]?.notes || "",
                        cervicalDischarge: monthLogs[dateStr]?.cervical_discharge || undefined,
                        exerciseTypes: monthLogs[dateStr]?.exercise_types || [],
                        exerciseMinutes: monthLogs[dateStr]?.exercise_minutes || null,
                        waterIntake: monthLogs[dateStr]?.water_intake || 0,
                        selfLoveTags: monthLogs[dateStr]?.self_love_tags || [],
                        selfLoveOther: monthLogs[dateStr]?.self_love_other || "",
                        sleepQuality: monthLogs[dateStr]?.sleep_quality || [],
                        sleepMinutes: monthLogs[dateStr]?.sleep_minutes || null,
                        disruptors: monthLogs[dateStr]?.disruptors || [],
                        sexActivity: monthLogs[dateStr]?.sex_activity || [],
                        contraception: monthLogs[dateStr]?.contraception || [],
                    });
                });

                await Promise.all(updates);

                // Update last period start from MOST RECENT period streak start
                // Sort all period dates in descending order (most recent first)
                const allPeriodDates = Object.keys(monthLogs)
                    .filter((d) => monthLogs[d]?.is_period === true)
                    .sort((a, b) => b.localeCompare(a)); // Descending order

                console.log("🔍 DEBUG: All period dates:", allPeriodDates);

                if (allPeriodDates.length > 0) {
                    // Find the start of the most recent period streak
                    // Start from the most recent period day and walk backwards
                    const mostRecentPeriodDay = allPeriodDates[0];
                    let streakStart = mostRecentPeriodDay;

                    const allPeriodSet = new Set(allPeriodDates);
                    const cur = new Date(mostRecentPeriodDay);

                    // Walk backwards to find the start of this streak
                    while (true) {
                        cur.setDate(cur.getDate() - 1);
                        const prevStr = formatDate(cur);
                        if (allPeriodSet.has(prevStr)) {
                            streakStart = prevStr;
                        } else {
                            break;
                        }
                    }

                    console.log("🔍 DEBUG: Setting last_period_start to:", streakStart);

                    const updateResult = await updateLastPeriodDate(streakStart);
                    console.log("🔍 DEBUG: Update result:", updateResult);

                    if (!updateResult.success) {
                        console.error("❌ Failed to update last_period_start:", updateResult.error);
                        toast.error("Failed to sync period date", { description: updateResult.error });
                    }

                    const freshSettings = await fetchUserCycleSettings();
                    console.log("🔍 DEBUG: Fresh settings:", freshSettings);

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

    const handleEndPeriod = () => {
        // "End Period Here" means selectedDate is the LAST day of the period.
        // 1. Ensure selectedDate is marked as period
        // 2. Ensure subsequent days (next ~7 days) are marked as NOT period

        const dateStr = formatDate(selectedDate);
        const updates: Record<string, any> = {};
        const changedDates = new Set(pendingPeriodChanges);

        // 1. Mark current day as period (if not already)
        if (!monthLogs[dateStr]?.is_period) {
            updates[dateStr] = { ...monthLogs[dateStr], is_period: true };
            changedDates.add(dateStr);
        }

        // 2. Clear next 7 days
        const cur = new Date(selectedDate);
        for (let i = 1; i <= 7; i++) {
            cur.setDate(cur.getDate() + 1);
            const dStr = formatDate(cur);

            // If it is currently marked as period, unmark it
            // OR if it's not logged but we want to be explicit? 
            // The new phase logic respects explicit false. 
            // So we should explicit set is_period: false even if it was undefined/empty?
            // Yes, to override prediction.

            if (monthLogs[dStr]?.is_period !== false) { // If it's true or undefined
                // We want to force it to false
                updates[dStr] = { ...monthLogs[dStr], is_period: false };

                // If it was previously TRUE, looking at it toggles it. 
                // But wait, `handleSavePeriodChanges` blindly saves whatever is in `monthLogs` at that date.
                // So we just need to ensure `monthLogs` has the correct new state (FALSE).
                // And we add to `changedDates` so the saver visits it.
                changedDates.add(dStr);
            }
        }

        setMonthLogs(prev => ({ ...prev, ...updates }));
        setPendingPeriodChanges(changedDates);

        toast.info("Period ended here. Future days cleared.", { duration: 2000 });
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

    // ---------- Phase prediction for the badge (canonical shared logic) ----------
    const phaseSettings: CycleSettings = useMemo(() => ({
        last_period_start: cycleSettings.last_period_start || "",
        cycle_length_days: cycleSettings.cycle_length_days || 28,
        period_length_days: cycleSettings.period_length_days || 5
    }), [cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days]);

    const sharedLogs: Record<string, SharedDailyLog> = useMemo(() => {
        const logs: Record<string, SharedDailyLog> = {};
        for (const [dateStr, log] of Object.entries(monthLogs)) {
            logs[dateStr] = { date: dateStr, is_period: log.is_period };
        }
        return logs;
    }, [monthLogs]);

    const phaseResult = sharedCalculatePhase(selectedDate, phaseSettings, sharedLogs);
    const currentPhase = phaseResult.phase as Phase;
    const dayInCycle = phaseResult.day > 0 ? phaseResult.day : null;
    const hasPhaseData = phaseResult.phase !== null;
    const phaseLabel = hasPhaseData ? currentPhase : "Add Period Start";
    const lateByDays = phaseResult.latePeriod
        ? Math.max(1, (phaseResult.day || 0) - (phaseSettings.cycle_length_days || 28))
        : 0;

    const isFertile = (() => {
        if (!dayInCycle) return false;
        if (phaseResult.latePeriod) return false;
        return isInFertileWindow(dayInCycle, phaseSettings.cycle_length_days || 28, phaseSettings.luteal_length_days);
    })();

    const getPhaseDot = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "bg-phase-menstrual shadow-[0_0_10px_rgba(175,107,107,0.4)]";
            case "Follicular":
                return "bg-phase-follicular shadow-[0_0_10px_rgba(141,170,157,0.4)]";
            case "Ovulatory":
                return "bg-phase-ovulatory shadow-[0_0_10px_rgba(212,162,95,0.4)]";
            case "Luteal":
                return "bg-phase-luteal shadow-[0_0_10px_rgba(123,130,168,0.4)]";
            default:
                return "bg-gray-400";
        }
    };

    const phasePill = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "bg-phase-menstrual/10 text-phase-menstrual border-phase-menstrual/20";
            case "Follicular":
                return "bg-phase-follicular/10 text-phase-follicular border-phase-follicular/20";
            case "Ovulatory":
                return "bg-phase-ovulatory/10 text-phase-ovulatory border-phase-ovulatory/20";
            case "Luteal":
                return "bg-phase-luteal/10 text-phase-luteal border-phase-luteal/20";
            default:
                return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    const getPhaseTheme = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "border-phase-menstrual/30 shadow-lg shadow-phase-menstrual/10";
            case "Follicular":
                return "border-phase-follicular/30 shadow-lg shadow-phase-follicular/10";
            case "Ovulatory":
                return "border-phase-ovulatory/30 shadow-lg shadow-phase-ovulatory/10";
            case "Luteal":
                return "border-phase-luteal/30 shadow-lg shadow-phase-luteal/10";
            default:
                return "border-gray-100 shadow-sm";
        }
    };



    if (!isSettingsLoaded || !isLogsLoaded) {
        return <LoadingScreen />;
    }


    return (
        <div className="min-h-screen bg-paper bg-gradient-to-b from-paper via-white-bone to-paper grain-overlay">
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
                    <ProfileAvatar /> {/* Spacer to balance the left icon for perfect centering */}
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
                                    {phaseLabel || "Phase Unknown"}
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
                            {hasPhaseData && phaseResult.latePeriod && (
                                <p className="text-[11px] text-rose-500">
                                    Late by {lateByDays} day{lateByDays === 1 ? "" : "s"}
                                </p>
                            )}
                        </div>
                    </div>
                    {!hasPhaseData && (
                        <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600">
                            Log your first period to unlock phase tracking and fertile window predictions.
                        </div>
                    )}
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
                        onEndPeriod={handleEndPeriod}
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
                                currentPhase={currentPhase}
                            />
                        )}

                        <SymptomsCard selectedSymptoms={selectedSymptoms} setSelectedSymptoms={setSelectedSymptoms} currentPhase={currentPhase} />
                        <MoodsCard selectedMoods={selectedMoods} setSelectedMoods={setSelectedMoods} currentPhase={currentPhase} />

                        <ExerciseCard
                            selectedExercise={selectedExercise}
                            exerciseMinutes={exerciseMinutes}
                            setSelectedExercise={setSelectedExercise}
                            setExerciseMinutes={setExerciseMinutes}
                            currentPhase={currentPhase}
                        />

                        <WaterIntakeCard
                            waterIntake={waterIntake}
                            setWaterIntake={setWaterIntake}
                            isPouring={isPouring}
                            setIsPouring={setIsPouring}
                            currentPhase={currentPhase}
                        />

                        <SleepCard
                            selectedSleepQuality={selectedSleepQuality}
                            sleepHours={sleepHours}
                            sleepMinutes={sleepMinutes}
                            setSelectedSleepQuality={setSelectedSleepQuality}
                            setSleepHours={setSleepHours}
                            setSleepMinutes={setSleepMinutes}
                            currentPhase={currentPhase}
                        />

                        <DisruptorsCard selectedDisruptors={selectedDisruptors} setSelectedDisruptors={setSelectedDisruptors} currentPhase={currentPhase} />

                        <SelfLoveCard
                            selectedSelfLove={selectedSelfLove}
                            selfLoveOther={selfLoveOther}
                            setSelectedSelfLove={setSelectedSelfLove}
                            setSelfLoveOther={setSelfLoveOther}
                            currentPhase={currentPhase}
                        />

                        <SexualWellnessCard
                            selectedSexActivity={selectedSexActivity}
                            setSelectedSexActivity={setSelectedSexActivity}
                            selectedContraception={selectedContraception}
                            setSelectedContraception={setSelectedContraception}
                            currentPhase={currentPhase}
                        />

                        <NoteCard note={note} setNote={setNote} currentPhase={currentPhase} />
                    </motion.div>
                )}

                {/* Save button - Sticky/Fixed above bottom nav on mobile */}
                {!isEditingCycle && !isPeriodLoggingMode && (
                    <div className="fixed bottom-[80px] md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl px-4 z-[60]">
                        <button
                            onClick={handleSave}
                            disabled={isPending || isFutureDate(selectedDate)}
                            className="w-full py-4 bg-phase-menstrual hover:bg-phase-menstrual/90 text-white text-base font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-phase-menstrual/30 flex items-center justify-center gap-2"
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
                    <div className="h-48" />
                )}
            </div>
        </div>
    );
}
