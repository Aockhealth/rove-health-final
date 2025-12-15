"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Check, Droplets, Calendar as CalendarIcon, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logDailySymptoms, getDailyLog, fetchUserCycleSettings, updateLastPeriodDate } from "@/app/actions/cycle-sync";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export default function TrackerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Tracks the month being viewed
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const [cycleSettings, setCycleSettings] = useState<{
        last_period_start: string;
        cycle_length_days: number;
        period_length_days: number;
    } | null>(null);

    // Edit Cycle Mode
    const [isEditingCycle, setIsEditingCycle] = useState(false);

    // Derived State
    const hasFlow = selectedSymptoms.some(s => ["Spotting", "Light", "Medium", "Heavy"].includes(s));

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
            }
        } catch (err) {
            console.error("Failed to load cycle settings", err);
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
            } else {
                setSelectedSymptoms([]);
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
        if (!cycleSettings) return "Menstrual"; // Default

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

    const getPhaseStyles = (phase: Phase) => {
        switch (phase) {
            case "Menstrual": return "bg-rove-red/10 text-rove-red border-rove-red/20";
            case "Follicular": return "bg-blue-100/50 text-blue-600 border-blue-200";
            case "Ovulatory": return "bg-amber-100/50 text-amber-600 border-amber-200";
            case "Luteal": return "bg-emerald-100/50 text-emerald-600 border-emerald-200";
            default: return "bg-white text-rove-stone border-transparent";
        }
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
            const d = new Date(year, month, 0 - i); // Just a placeholder, we won't render functionality for them heavily
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

    const symptomCategories = [
        {
            name: "Flow",
            items: ["Spotting", "Light", "Medium", "Heavy"],
        },
        { name: "Mood", items: ["Calm", "Anxious", "Irritable", "Energetic", "Weepy"] },
        { name: "Body", items: ["Bloating", "Cramps", "Headache", "Acne", "Breast Tenderness"] },
        { name: "Digestion", items: ["Normal", "Constipation", "Diarrhea", "Cravings"] }
    ];

    const sortedCategories = [...symptomCategories].sort((a, b) => a.name === "Flow" ? -1 : 1);

    const toggleSymptom = (symptom: string) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            const isPeriod = selectedSymptoms.some(s => ["Spotting", "Light", "Medium", "Heavy"].includes(s));

            await logDailySymptoms({
                date: formatDate(selectedDate),
                symptoms: selectedSymptoms,
                isPeriod: isPeriod,
                flowIntensity: selectedSymptoms.find(s => ["Spotting", "Light", "Medium", "Heavy"].includes(s))
            });
            alert("Entry Saved!");
        });
    }

    const handleUpdatePeriod = () => {
        startTransition(async () => {
            // Call server action to update last_period_start used for calculations
            const result = await updateLastPeriodDate(formatDate(selectedDate));
            if (result.success) {
                alert("Cycle Updated! Phases will recalculate.");
                setIsEditingCycle(false);
                // Optionally trigger a refresh of the page or context
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
                            // Render empty slot for padding but keep layout consistent
                            if (dayItem.isPadding) return <div key={i} className="" />;

                            const date = dayItem.date;
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFuture = isFutureDate(date);
                            const phase = getPhaseForDate(date);

                            // --- STRIP LOGIC ---
                            // Check neighbors to create continuous strip effect
                            // Only connect if same phase AND within same row (week)

                            const prevItem = calendarDays[i - 1];
                            const nextItem = calendarDays[i + 1];

                            // Check previous
                            const isStartOfRow = i % 7 === 0;
                            const samePhaseAsPrev = prevItem && !prevItem.isPadding && getPhaseForDate(prevItem.date) === phase;
                            const connectLeft = samePhaseAsPrev && !isStartOfRow;

                            // Check next
                            const isEndOfRow = (i + 1) % 7 === 0;
                            const samePhaseAsNext = nextItem && !nextItem.isPadding && getPhaseForDate(nextItem.date) === phase;
                            const connectRight = samePhaseAsNext && !isEndOfRow;

                            // Determine Radius classes
                            const roundedClass = cn(
                                connectLeft ? "rounded-l-none" : "rounded-l-2xl",
                                connectRight ? "rounded-r-none" : "rounded-r-2xl"
                            );

                            // Pastel Phase Colors (Solid fills for strips)
                            const getStripColor = (p: Phase) => {
                                switch (p) {
                                    case "Menstrual": return "bg-[#FFD6D6]"; // Soft Pink
                                    case "Follicular": return "bg-[#E2F0D9]"; // Soft Sage/Green
                                    case "Ovulatory": return "bg-[#FFF4C3]"; // Soft Gold/Yellow
                                    case "Luteal": return "bg-[#FAE8D2]"; // Soft Beige/Peach
                                    default: return "bg-gray-50";
                                }
                            };

                            const stripColor = getStripColor(phase);

                            // In edit mode, we allow selecting past dates freely
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
                                        {/* Selection Circle Overlay */}
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

                                        {/* Today Indicator (Small Dot below number) */}
                                        {isToday && !isSelected && (
                                            <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-rove-red/70" />
                                        )}

                                        {/* Label (Optional - hidden for cleaner aesthetic like screenshot) */}
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
                        {/* Symptom Tags */}
                        <div className="space-y-6">
                            {sortedCategories.map((category) => (
                                <motion.section key={category.name} variants={itemVariants} layout>
                                    <h3 className="font-heading text-lg text-rove-charcoal mb-4 ml-1">{category.name}</h3>
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        {category.items.map((item) => {
                                            const isActive = selectedSymptoms.includes(item);
                                            return (
                                                <motion.button
                                                    key={item}
                                                    onClick={() => toggleSymptom(item)}
                                                    whileTap={{ scale: 0.95 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className={cn(
                                                        "px-5 py-3 rounded-2xl text-sm font-medium border transition-all flex items-center gap-2",
                                                        isActive
                                                            ? "bg-rove-charcoal text-white border-rove-charcoal shadow-lg shadow-rove-charcoal/10"
                                                            : "bg-white/40 text-rove-charcoal/70 border-white/50 hover:bg-white hover:border-white shadow-sm"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                            <Check className="w-3.5 h-3.5" />
                                                        </motion.span>
                                                    )}
                                                    {item}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.section>
                            ))}
                        </div>

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