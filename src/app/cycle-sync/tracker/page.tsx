"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Check, Droplets, Calendar as CalendarIcon, Edit2, Pill, Smile, Lock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logDailySymptoms, getDailyLog, fetchUserCycleSettings, updateLastPeriodDate } from "@/app/actions/cycle-sync";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export default function TrackerPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date()); 
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<string[]>([]);
    const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [isPending, startTransition] = useTransition();

    const [cycleSettings, setCycleSettings] = useState<{
        last_period_start: string;
        cycle_length_days: number;
        period_length_days: number;
    } | null>(null);

    const [isLocked, setIsLocked] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // Edit Cycle Mode
    const [isEditingCycle, setIsEditingCycle] = useState(false);

    // Derived State
    const hasFlow = !!flowIntensity;

    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fetch Cycle Settings
    const loadSettings = async () => {
        try {
            const settings = await fetchUserCycleSettings();
            if (settings) {
                setCycleSettings({
                    last_period_start: settings.last_period_start,
                    cycle_length_days: settings.cycle_length_days || 28,
                    period_length_days: settings.period_length_days || 5
                });
                setIsLocked(false);
            } else {
                // ✅ SAFETY NET: If no settings, redirect to onboarding silently
                setIsLocked(true);
                router.push("/onboarding"); 
            }
        } catch (err) {
            console.error("Failed to load cycle settings", err);
            setIsLocked(true);
        } finally {
            setIsLoadingSettings(false);
        }
    };

    useEffect(() => {
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
                setNote(data.notes || "");
            } else {
                setSelectedSymptoms([]);
                setSelectedMoods([]);
                setSelectedMedicine([]);
                setFlowIntensity(null);
                setNote("");
            }
        };
        fetchLog();
    }, [selectedDate]);

    // Validation
    const isFutureDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    // --- PHASE CALCULATOR ---
    const getPhaseForDate = (date: Date): Phase => {
        if (!cycleSettings) return "Menstrual"; 

        const start = new Date(cycleSettings.last_period_start);
        start.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const diffTime = date.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let dayInCycle = (diffDays % cycleSettings.cycle_length_days) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleSettings.cycle_length_days;

        const lutealLength = 14;
        const estimatedOvulationDay = cycleSettings.cycle_length_days - lutealLength;

        if (dayInCycle <= cycleSettings.period_length_days) return "Menstrual";
        if (dayInCycle < (estimatedOvulationDay - 1)) return "Follicular";
        if (dayInCycle <= (estimatedOvulationDay + 1)) return "Ovulatory";
        return "Luteal";
    };

    // --- CALENDAR LOGIC ---
    const getCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const days = [];
        const startPadding = firstDayOfMonth.getDay(); // 0 is Sunday

        // Padding days (previous month)
        for (let i = 0; i < startPadding; i++) {
            const d = new Date(year, month, 0 - i); 
            days.unshift({ date: d, isPadding: true });
        }

        // Current month days
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

    const flowOptions = ["Spotting", "Low", "Normal", "High", "Heavy"];
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
            const result = await logDailySymptoms({
                date: formatDate(selectedDate),
                symptoms: selectedSymptoms,
                moods: selectedMoods,
                medicine: selectedMedicine,
                isPeriod: !!flowIntensity,
                flowIntensity: flowIntensity || undefined,
                notes: note
            });

            if (result.success) {
                alert("Entry Saved!");
            } else {
                alert("Failed to save: " + result.error);
            }
        });
    }

    const handleUpdatePeriod = () => {
        startTransition(async () => {
            const result = await updateLastPeriodDate(formatDate(selectedDate));
            if (result.success) {
                alert("Cycle Updated! Phases will recalculate.");
                setIsEditingCycle(false);
                window.location.reload();
            } else {
                alert("Error updating cycle: " + result.error);
            }
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } }
    };

    // ✅ REPLACED: "Lock Screen" with Loading Spinner
    // If settings are missing, we redirect. While redirecting, just show spinner.
    if (isLoadingSettings || isLocked || !cycleSettings) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-rove-red/20 border-t-rove-red animate-spin" />
                    <p className="text-rove-stone font-medium">Loading Tracker...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={cn("absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[80px] animate-pulse transition-colors duration-1000", hasFlow ? "bg-rove-red/20" : "bg-rove-red/5")} style={{ animationDuration: "8s" }} />
                <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-rove-green/5 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: "12s" }} />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 p-4 md:p-8 space-y-8 pb-32 max-w-4xl mx-auto"
            >
                <motion.header variants={itemVariants} className="flex justify-between items-end">
                    <div>
                        <h1 className="font-heading text-3xl text-rove-charcoal mb-1">Tracker</h1>
                        <p className="text-rove-stone text-sm">Log your daily rhythm.</p>
                    </div>

                    <Button
                        onClick={() => setIsEditingCycle(!isEditingCycle)}
                        variant="outline"
                        size="sm"
                        className={cn("gap-2 border-white/40 bg-white/40 backdrop-blur-md text-rove-stone hover:text-rove-charcoal transition-colors", isEditingCycle && "bg-rove-charcoal text-white border-transparent hover:bg-rove-charcoal hover:text-white")}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        {isEditingCycle ? "Cancel Edit" : "Edit Cycle"}
                    </Button>
                </motion.header>

                {/* Edit Mode Instructions */}
                <AnimatePresence>
                    {isEditingCycle && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-rove-charcoal/5 border border-rove-charcoal/10 rounded-xl p-4 overflow-hidden"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-rove-charcoal/10 rounded-full">
                                    <CalendarIcon className="w-4 h-4 text-rove-charcoal" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-sm font-bold text-rove-charcoal">Update Period Start Date</h3>
                                    <p className="text-xs text-rove-stone leading-relaxed">
                                        Select the correct start date of your last period on the calendar below, then click "Update Start Date". This will recalibrate your entire cycle predictions.
                                    </p>
                                    <Button
                                        onClick={handleUpdatePeriod}
                                        size="sm"
                                        disabled={isPending}
                                        className="bg-rove-charcoal text-white rounded-full text-xs h-8 px-4"
                                    >
                                        {isPending ? "Updating..." : "Update Start Date to Selected"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MONTHLY CALENDAR */}
                <motion.div
                    variants={itemVariants}
                    className={cn(
                        "bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-lg p-6 transition-all duration-300",
                        isEditingCycle && "ring-2 ring-rove-charcoal/10 shadow-xl"
                    )}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-heading text-2xl text-rove-charcoal tracking-wide">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <Button onClick={prevMonth} size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/50 hover:bg-white shadow-sm border border-white/50">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button onClick={nextMonth} size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/50 hover:bg-white shadow-sm border border-white/50">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="text-[11px] font-bold uppercase tracking-widest text-rove-stone/60 py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-y-3 gap-x-0">
                        {calendarDays.map((dayItem, i) => {
                            if (dayItem.isPadding) return <div key={i} className="" />;

                            const date = dayItem.date;
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFuture = isFutureDate(date);
                            const phase = getPhaseForDate(date);

                            const prevItem = calendarDays[i - 1];
                            const nextItem = calendarDays[i + 1];
                            const isStartOfRow = i % 7 === 0;
                            const samePhaseAsPrev = prevItem && !prevItem.isPadding && getPhaseForDate(prevItem.date) === phase;
                            const connectLeft = samePhaseAsPrev && !isStartOfRow;
                            const isEndOfRow = (i + 1) % 7 === 0;
                            const samePhaseAsNext = nextItem && !nextItem.isPadding && getPhaseForDate(nextItem.date) === phase;
                            const connectRight = samePhaseAsNext && !isEndOfRow;

                            const roundedClass = cn(
                                connectLeft ? "rounded-l-none" : "rounded-l-2xl",
                                connectRight ? "rounded-r-none" : "rounded-r-2xl"
                            );

                            const getStripColor = (p: Phase) => {
                                switch (p) {
                                    case "Menstrual": return "bg-[#FFD6D6]"; 
                                    case "Follicular": return "bg-[#E2F0D9]";
                                    case "Ovulatory": return "bg-[#FFF4C3]";
                                    case "Luteal": return "bg-[#FAE8D2]"; 
                                    default: return "bg-gray-50";
                                }
                            };

                            const stripColor = getStripColor(phase);
                            const isDisabled = isEditingCycle ? false : isFuture;

                            return (
                                <div key={i} className="relative w-full">
                                    <motion.button
                                        onClick={() => !isDisabled && setSelectedDate(date)}
                                        disabled={isDisabled}
                                        layout
                                        className={cn(
                                            "relative w-full aspect-square flex items-center justify-center transition-all focus:outline-none",
                                            stripColor,
                                            roundedClass,
                                            isDisabled && "opacity-30 cursor-not-allowed grayscale bg-gray-100"
                                        )}
                                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                    >
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all",
                                            isSelected
                                                ? "bg-white text-rove-charcoal shadow-md scale-110 font-bold"
                                                : "text-rove-charcoal/80"
                                        )}>
                                            <span className="text-sm font-heading">
                                                {date.getDate()}
                                            </span>
                                        </div>
                                        {isToday && !isSelected && (
                                            <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-rove-red/70" />
                                        )}
                                    </motion.button>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* --- TRACKING TOOLS (Hidden in Edit Mode) --- */}
                {!isEditingCycle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Flow Helper */}
                        <motion.section variants={itemVariants} className="space-y-4">
                            <h3 className="font-heading text-lg text-rove-charcoal ml-1">Flow</h3>
                            <div className="flex flex-wrap gap-3">
                                {flowOptions.map((f) => {
                                    const isActive = flowIntensity === f;
                                    return (
                                        <button
                                            key={f}
                                            onClick={() => setFlowIntensity(isActive ? null : f)}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-sm font-medium border transition-all flex items-center gap-2",
                                                isActive
                                                    ? "bg-rove-red text-white border-rove-red shadow-lg shadow-rove-red/20"
                                                    : "bg-white/40 text-rove-charcoal/70 border-white/50 hover:bg-white hover:border-white shadow-sm"
                                            )}
                                        >
                                            <Droplets className={cn("w-4 h-4", isActive ? "text-white" : "text-rove-red/50")} />
                                            {f}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.section>

                        {/* Symptoms */}
                        <motion.section variants={itemVariants} className="space-y-4">
                            <h3 className="font-heading text-lg text-rove-charcoal ml-1">Symptoms</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {symptomOptions.map(s => {
                                    const isActive = selectedSymptoms.includes(s);
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => toggleItem(s, selectedSymptoms, setSelectedSymptoms)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2",
                                                isActive
                                                    ? "bg-rove-charcoal text-white border-rove-charcoal shadow-md"
                                                    : "bg-white/40 text-rove-stone border-white/50 hover:bg-white"
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3" />}
                                            {s}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.section>

                        {/* Moods */}
                        <motion.section variants={itemVariants} className="space-y-4">
                            <h3 className="font-heading text-lg text-rove-charcoal ml-1">Moods</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {moodOptions.map(m => {
                                    const isActive = selectedMoods.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => toggleItem(m, selectedMoods, setSelectedMoods)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2",
                                                isActive
                                                    ? "bg-amber-100 text-amber-900 border-amber-200 shadow-md"
                                                    : "bg-white/40 text-rove-stone border-white/50 hover:bg-white"
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3" />}
                                            {m}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.section>

                        {/* Medicine */}
                        <motion.section variants={itemVariants} className="space-y-4">
                            <h3 className="font-heading text-lg text-rove-charcoal ml-1">Medicine</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {medicineOptions.map(m => {
                                    const isActive = selectedMedicine.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => toggleItem(m, selectedMedicine, setSelectedMedicine)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2",
                                                isActive
                                                    ? "bg-purple-100 text-purple-900 border-purple-200 shadow-md"
                                                    : "bg-white/40 text-rove-stone border-white/50 hover:bg-white"
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3" />}
                                            {m}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.section>

                        {/* Notes */}
                        <motion.section variants={itemVariants} className="space-y-4">
                            <h3 className="font-heading text-lg text-rove-charcoal ml-1">Note</h3>
                            <div className="relative">
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add your note here..."
                                    className="w-full bg-white/40 border border-white/60 rounded-2xl p-4 text-rove-charcoal placeholder:text-rove-stone/50 focus:outline-none focus:ring-2 focus:ring-rove-charcoal/10 focus:bg-white/60 transition-all resize-none h-32 text-sm"
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-rove-stone/40">
                                    {note.length} chars
                                </div>
                            </div>
                        </motion.section>

                        {/* Save Block */}
                        <div className="pt-8 flex justify-center">
                            <Button
                                onClick={handleSave}
                                size="lg"
                                disabled={isPending || isFutureDate(selectedDate)}
                                className="w-full max-w-sm rounded-full h-14 text-lg font-heading bg-rove-charcoal text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                            >
                                {isPending ? "Saving Log..." : "Save Today's Log"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}