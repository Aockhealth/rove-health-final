"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Check, Droplets, Calendar, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logDailySymptoms, getDailyLog, fetchUserCycleSettings, updateLastPeriodDate, updateCycleLength } from "@/app/actions/cycle-sync";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export default function TrackerPageRedesigned() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<string[]>([]);
    const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
    const [cervicalDischarge, setCervicalDischarge] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [trackMode, setTrackMode] = useState<"period" | "discharge">("discharge");
    const [isEditingCycle, setIsEditingCycle] = useState(false);
    const [isPending, startTransition] = useTransition();

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
                setSelectedMedicine(data.medicine || []);
                setFlowIntensity(data.flow_intensity || null);
                setCervicalDischarge(data.cervical_discharge || null);
                setNote(data.notes || "");

                // Set initial toggle state based on data
                if (data.flow_intensity || data.is_period) {
                    setTrackMode('period');
                } else {
                    setTrackMode('discharge'); // Default to discharge/daily tracking if nothing logged or only discharge
                }
            } else {
                setSelectedSymptoms([]);
                setSelectedMoods([]);
                setSelectedMedicine([]);
                setFlowIntensity(null);
                setCervicalDischarge(null);
                setNote("");
                setTrackMode('discharge');
            }
        };
        fetchLog();
    }, [selectedDate]);

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
    const cervicalDischargeOptions = ["Dry", "Sticky", "Creamy", "Watery", "Egg White"];
    const symptomOptions = ["Headache", "Cramps", "Bloating", "Acne", "Backache", "Fatigue", "Cravings", "Insomnia", "Nausea"];
    const moodOptions = ["Normal", "Happy", "Angry", "Anxious", "Sad", "Energetic", "Irritable", "Weepy"];
    const medicineOptions = ["Painkiller", "Contraceptive", "Supplements", "Other"];

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

            // Prepare Payload (CamelCase to match cycle-sync.ts)
            const payload = {
                date: formatDate(selectedDate),
                symptoms: selectedSymptoms,
                moods: selectedMoods,
                medicine: selectedMedicine,
                isPeriod: isPeriodMode,
                flowIntensity: isPeriodMode ? flowIntensity || "Normal" : undefined,
                cervicalDischarge: !isPeriodMode ? (cervicalDischarge || undefined) : undefined,
                notes: note
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

                    // New Cycle Logic
                    if (diffDays > cycleSettings.cycle_length_days || diffDays < 0) {
                        await updateLastPeriodDate(formatDate(selectedDate));
                        await updateCycleLength(1);
                    } else {
                        // Extending current period logic
                        const newLength = diffDays + 1;
                        if (newLength > cycleSettings.period_length_days) {
                            await updateCycleLength(newLength);
                        }
                    }
                }
            } else if (!isPeriodMode && cycleSettings.last_period_start) {
                // END PERIOD → Finalize or Adjust Period Length
                // Logic: If user clicks "End Period" on a date, we treat that date as the *last day* of the period (inclusive).
                // We update the period length setting to match this duration, provided it's within a reasonable range (e.g., <= 10 days).
                // This visually aligns the calendar phases (Menstrual) with the user's input, even though the daily log for this date will show as 'discharge' (no flow).

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
                // Reload to refresh phase calculations
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

                        {/* Cervical Discharge Card (Discharge Mode) */}
                        {trackMode === "discharge" && (
                            <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Droplets className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-base font-semibold text-gray-900">Cervical Discharge</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cervicalDischargeOptions.map((c) => {
                                        const isActive = cervicalDischarge === c;
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => setCervicalDischarge(isActive ? null : c)}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                                                    isActive
                                                        ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white border-transparent shadow-md shadow-blue-200"
                                                        : "bg-white border-blue-100/50 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30"
                                                )}
                                            >
                                                {c}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Symptoms Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Symptoms</h3>
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
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Moods</h3>
                            <div className="flex flex-wrap gap-2">
                                {moodOptions.map(m => {
                                    const isActive = selectedMoods.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => toggleItem(m, selectedMoods, setSelectedMoods)}
                                            className={cn(
                                                "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                isActive
                                                    ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-transparent shadow-md shadow-rose-200"
                                                    : "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30"
                                            )}
                                        >
                                            {isActive && <Check className="w-3.5 h-3.5" />}
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Medicine Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Medicine</h3>
                            <div className="flex flex-wrap gap-2">
                                {medicineOptions.map(m => {
                                    const isActive = selectedMedicine.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => toggleItem(m, selectedMedicine, setSelectedMedicine)}
                                            className={cn(
                                                "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                isActive
                                                    ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-transparent shadow-md shadow-rose-200"
                                                    : "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30"
                                            )}
                                        >
                                            {isActive && <Check className="w-3.5 h-3.5" />}
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Note Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Note</h3>
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
        </div>
    );
}