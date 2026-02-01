"use client";

import { useMemo, useTransition, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shield, HelpCircle, X, Calendar, Edit3, Activity, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

interface CalendarDay {
    date: Date;
    isPadding: boolean;
}

interface PeriodLoggingCardProps {
    // Selection (normal mode)
    selectedDate: Date;
    onSelectDate: (date: Date) => void;

    // Data
    monthLogs: Record<string, any>;
    cycleSettings: {
        last_period_start: string;
        cycle_length_days: number;
        period_length_days: number;
    };

    // Calendar state controlled by parent
    isPeriodLoggingMode: boolean;
    currentMonth: Date;
    calendarDays: CalendarDay[];
    onPrevMonth: () => void;
    onNextMonth: () => void;

    // Period logging actions (parent)
    onTogglePeriodDate: (dateStr: string) => void;
    onExitPeriodLogging: () => void;

    // Utils
    isFutureDate: (date: Date) => boolean;
    formatDate: (date: Date) => string;

    // CTA
    onEnablePeriodLogging: () => void;
    onEndPeriod?: () => void; // Optional for backward compatibility if needed, but we'll pass it
    currentPhase?: string | null;
}

const PeriodLoggingCard = memo(function PeriodLoggingCard({
    selectedDate,
    onSelectDate,

    monthLogs,
    cycleSettings,

    isPeriodLoggingMode,
    currentMonth,
    calendarDays,
    onPrevMonth,
    onNextMonth,

    onTogglePeriodDate,
    onExitPeriodLogging,
    onEndPeriod,

    isFutureDate,
    formatDate,

    onEnablePeriodLogging,
    currentPhase,
}: PeriodLoggingCardProps) {
    const [isPending] = useTransition();
    const [showTutorial, setShowTutorial] = useState(false);

    // Color Palette
    const colors = {
        menstrual: "#fb7185",
        follicular: "#2dd4bf",
        ovulatory: "#fbbf24",
        luteal: "#818cf8",
        today: "#1C1C1E",
        text: "#6B7280",
        neutralGray: "#4B5563",
        shadow: "rgba(0,0,0,0.06)",
    };

    // ---- logs-first anchor: use latest logged period start if present, else settings ----
    // Optimization: Memoize sorted keys once to avoid re-sorting inside the loop for every day
    const sortedLogDates = useMemo(() => {
        return Object.keys(monthLogs).sort().reverse();
    }, [monthLogs]);

    const getRelevantPeriodStart = useMemo(() => {
        const findStreakStart = (startStr: string) => {
            let cur = new Date(startStr);
            cur.setHours(0, 0, 0, 0);
            let first = startStr;

            // Look backwards for contiguous period days
            // We can optimize this by checking map directly without loop limit if needed,
            // but for now, just iterating back is safe enough given the data size.
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

            // if the day itself is logged as period, find streak start
            if (monthLogs[dateStr]?.is_period) return findStreakStart(dateStr);

            // otherwise find most recent logged period day before target
            // Usage of pre-sorted dates prevents O(N^2) sorting in the render loop
            for (const d of sortedLogDates) {
                if (d < dateStr && monthLogs[d]?.is_period) return findStreakStart(d);
            }

            // fallback: use cycleSettings.last_period_start
            if (cycleSettings.last_period_start) {
                const globalStart = new Date(cycleSettings.last_period_start);
                globalStart.setHours(0, 0, 0, 0);
                const check = new Date(targetDate);
                check.setHours(0, 0, 0, 0);

                // Enforce minimum cycle length
                const cycleLength = Math.max(cycleSettings.cycle_length_days || 28, 21);

                if (check >= globalStart) {
                    // Forward projection - use last_period_start directly
                    return cycleSettings.last_period_start;
                } else {
                    // Backcast: calculate which previous cycle this date falls into
                    const diffTime = globalStart.getTime() - check.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const cyclesBack = Math.ceil(diffDays / cycleLength);

                    const simulatedStart = new Date(globalStart);
                    simulatedStart.setDate(globalStart.getDate() - (cyclesBack * cycleLength));
                    return formatDate(simulatedStart);
                }
            }

            return null;
        };
    }, [monthLogs, sortedLogDates, cycleSettings.last_period_start, formatDate, cycleSettings.cycle_length_days]);

    const getDayInCycle = useMemo(() => {
        return (date: Date): number | null => {
            const startStr = getRelevantPeriodStart(date);
            if (!startStr) return null;

            const start = new Date(startStr);
            start.setHours(0, 0, 0, 0);

            const check = new Date(date);
            check.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((check.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return null;

            // Enforce minimum 21-day cycle (handle bad data)
            const cycleLength = Math.max(cycleSettings.cycle_length_days || 28, 21);
            let dayInCycle = (diffDays % cycleLength) + 1;
            if (dayInCycle <= 0) dayInCycle += cycleLength;
            return dayInCycle;
        };
    }, [getRelevantPeriodStart, cycleSettings.cycle_length_days]);

    const getPredictedPhase = useMemo(() => {
        return (date: Date): Phase | null => {
            const day = getDayInCycle(date);
            if (!day) return null;

            // Enforce minimum reasonable values (cycle can't be less than 21 days)
            const cycleLength = Math.max(cycleSettings.cycle_length_days || 28, 21);
            const periodLength = Math.max(Math.min(cycleSettings.period_length_days || 5, 10), 3);
            const ovulationDay = Math.max(cycleLength - 14, periodLength + 1);

            // Look up log for this specific date
            const dateStr = formatDate(date);
            const isExplicitlyNotPeriod = monthLogs[dateStr] && monthLogs[dateStr]?.is_period === false;

            // Day 1-periodLength = Menstrual (works for all cycles via modulo)
            if (day <= periodLength && !isExplicitlyNotPeriod) return "Menstrual";

            // Ovulatory window (around day 14 in a 28-day cycle)
            if (day >= ovulationDay - 1 && day <= ovulationDay + 1) return "Ovulatory";

            // After ovulation = Luteal
            if (day > ovulationDay + 1) return "Luteal";

            // Between period and ovulation = Follicular
            return "Follicular";
        };
    }, [getDayInCycle, cycleSettings.cycle_length_days, cycleSettings.period_length_days]);

    const isFertileDay = useMemo(() => {
        return (date: Date): boolean => {
            const day = getDayInCycle(date);
            if (!day) return false;

            const cycleLength = Math.max(cycleSettings.cycle_length_days || 28, 21);
            const ovulationDay = Math.max(cycleLength - 14, 7);
            return day >= ovulationDay - 5 && day <= ovulationDay + 2;
        };
    }, [getDayInCycle, cycleSettings.cycle_length_days]);

    // Pre-compute phases for all calendar days (prevents redundant calculations)
    const phaseMap = useMemo(() => {
        const map: Record<string, Phase | null> = {};
        calendarDays.forEach(dayItem => {
            if (!dayItem.isPadding) {
                const dateStr = formatDate(dayItem.date);
                map[dateStr] = getPredictedPhase(dayItem.date);
            }
        });
        return map;
    }, [calendarDays, getPredictedPhase, formatDate]);

    // Days until next period
    const daysUntilPeriod = useMemo(() => {
        const cycleLength = cycleSettings.cycle_length_days || 28;
        if (!cycleSettings.last_period_start && Object.keys(monthLogs).length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const anchor = getRelevantPeriodStart(today);
        if (!anchor) return 0;

        const anchorDate = new Date(anchor);
        anchorDate.setHours(0, 0, 0, 0);
        if (anchorDate > today) return 0;

        const daysSinceAnchor = Math.floor((today.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
        const offset = daysSinceAnchor % cycleLength;
        return (cycleLength - offset) % cycleLength;
    }, [cycleSettings.cycle_length_days, cycleSettings.last_period_start, monthLogs, getRelevantPeriodStart]);

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const handleDayClick = (date: Date, dateStr: string, disabled: boolean) => {
        if (disabled) return;
        if (isPeriodLoggingMode) onTogglePeriodDate(dateStr);
        else onSelectDate(date);
    };

    const getPhaseTheme = (p: string | null | undefined) => {
        switch (p) {
            case "Menstrual":
                return "border-[#fb7185]/40 shadow-xl shadow-[#fb7185]/10";
            case "Follicular":
                return "border-[#2dd4bf]/40 shadow-xl shadow-[#2dd4bf]/10";
            case "Ovulatory":
                return "border-[#fbbf24]/40 shadow-xl shadow-[#fbbf24]/10";
            case "Luteal":
                return "border-[#818cf8]/40 shadow-xl shadow-[#818cf8]/10";
            default:
                return "border-gray-100 shadow-sm";
        }
    };

    return (
        <div className={cn(
            "bg-white rounded-[2.5rem] p-8 border transition-all duration-500 mb-6",
            getPhaseTheme(currentPhase)
        )}>
            {/* Top info card (sleeker version) */}
            {!isPeriodLoggingMode && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h2 className="text-xl font-heading font-semibold text-gray-900 leading-tight">
                            {currentPhase === "Menstrual"
                                ? "Period Day " + (getDayInCycle(selectedDate) || 1)
                                : (daysUntilPeriod === 0 ? "Period starts today" : `Period in ${daysUntilPeriod} days`)
                            }
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Tap a date to log symptoms</p>
                    </div>
                    <button
                        onClick={onEnablePeriodLogging}
                        disabled={isPending}
                        className="bg-[#1C1C1E] hover:bg-[#2C2C2E] disabled:opacity-60 transition-all text-white rounded-full px-6 py-2.5 text-sm font-medium shadow-lg shadow-gray-200"
                    >
                        {currentPhase === "Menstrual" ? "Edit Period" : "Log Period"}
                    </button>
                </motion.div>
            )}

            {/* Logging mode banner */}
            {isPeriodLoggingMode && (
                <div className="mb-8 p-6 bg-rose-50/50 rounded-3xl border border-rose-100 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-sm font-heading font-semibold text-rose-900">Select period dates</h3>
                        <p className="text-xs text-rose-600 mt-0.5">Tap days to mark/unmark bleeding</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEndPeriod}
                            className="px-4 py-2 bg-white text-rose-500 border border-rose-200 hover:bg-rose-50 text-xs font-semibold rounded-full transition-colors"
                        >
                            End Period Here
                        </button>
                        <button
                            onClick={onExitPeriodLogging}
                            className="px-6 py-2 bg-[#fb7185] hover:bg-[#fb7185]/90 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-rose-200"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Month header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-heading font-bold text-gray-900 uppercase tracking-wider">
                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="p-1 hover:text-rose-500 transition-colors"
                        title="How to use"
                    >
                        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-rose-500" />
                    </button>
                </div>
                <div className="flex gap-4">
                    <button onClick={onPrevMonth} className="p-1 hover:text-rose-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={onNextMonth} className="p-1 hover:text-rose-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid wrapper for cross-fade */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMonth.toISOString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Week header */}
                    <div className="grid grid-cols-7 mb-4">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-2">
                        {calendarDays.map((dayItem, i) => {
                            if (dayItem.isPadding) return <div key={i} className="aspect-square" />;

                            const date = dayItem.date;
                            const dateStr = formatDate(dayItem.date);
                            const disabled = isFutureDate(date);
                            const today = isToday(date);
                            const selected = !isPeriodLoggingMode && date.toDateString() === selectedDate.toDateString();
                            const loggedPeriod = monthLogs[dateStr]?.is_period === true;

                            const phase = phaseMap[dateStr] ?? null;
                            const fertile = isFertileDay(date);

                            // Styling Logic based on rules
                            let bgColor = "transparent";
                            let textColor = colors.neutralGray;
                            let shadow = "none";
                            let ring = "none";

                            if (disabled) textColor = "#D1D5DB";

                            if (isPeriodLoggingMode && loggedPeriod) {
                                bgColor = colors.menstrual;
                                textColor = "white";
                            } else if (loggedPeriod || phase === "Menstrual") {
                                bgColor = "rgba(251, 113, 133, 0.2)"; // rose-400 @ 20%
                            } else if (phase === "Ovulatory") {
                                bgColor = "rgba(251, 191, 36, 0.2)"; // amber-400 @ 20%
                            } else if (phase === "Follicular") {
                                bgColor = "rgba(45, 212, 191, 0.2)"; // teal-400 @ 20%
                            } else if (phase === "Luteal") {
                                bgColor = "rgba(129, 140, 248, 0.2)"; // indigo-400 @ 20%
                            } else if (fertile) {
                                bgColor = "rgba(242, 169, 0, 0.1)"; // subtler for fertile if not in phase
                            }

                            if (selected) {
                                shadow = "0 4px 10px rgba(0,0,0,0.06)";
                                bgColor = bgColor === "transparent" ? "rgba(249, 250, 251, 1)" : bgColor;
                            }

                            if (today) {
                                ring = `inset 0 0 0 2px ${colors.today}`;
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDayClick(date, dateStr, disabled)}
                                    disabled={disabled}
                                    className="relative aspect-square flex flex-col items-center justify-center p-0.5 group"
                                    style={{ minWidth: '44px', minHeight: '44px' }}
                                >
                                    <motion.div
                                        className="w-full h-full rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200"
                                        style={{
                                            backgroundColor: bgColor,
                                            boxShadow: `${shadow}, ${ring}`,
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                "text-sm font-semibold",
                                                loggedPeriod && isPeriodLoggingMode ? "text-white" : ""
                                            )}
                                            style={{ color: (loggedPeriod && isPeriodLoggingMode) ? "white" : textColor }}
                                        >
                                            {date.getDate()}
                                        </span>

                                        {/* Indicators: Meaning -> background or underline/dot */}
                                        {(loggedPeriod || phase === "Menstrual") && !isPeriodLoggingMode && (
                                            <div
                                                className="absolute bottom-1.5 w-1 h-1 rounded-full"
                                                style={{ backgroundColor: colors.menstrual }}
                                            />
                                        )}
                                        {fertile && !loggedPeriod && phase !== "Menstrual" && (
                                            <div
                                                className="absolute bottom-1.5 w-1 h-1 rounded-full"
                                                style={{ backgroundColor: colors.ovulatory }}
                                            />
                                        )}
                                    </motion.div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Phase Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-8 pt-6 border-t border-gray-100">
                {[
                    { label: "Menstrual", color: colors.menstrual },
                    { label: "Follicular", color: colors.follicular },
                    { label: "Ovulatory", color: colors.ovulatory },
                    { label: "Luteal", color: colors.luteal },
                ].map((phase) => (
                    <div key={phase.label} className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: phase.color }}
                        />
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {phase.label}
                        </span>
                    </div>
                ))}
                <div className="flex items-center gap-3 border-l border-gray-100 pl-6 ml-2">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] text-gray-400 font-bold mb-0.5">14</span>
                        <div className="w-1 h-1 rounded-full bg-[#fbbf24]" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Fertile Window
                    </span>
                </div>
            </div>


            {/* Tutorial Modal */}
            <AnimatePresence>
                {showTutorial && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center">
                                        <HelpCircle className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <h2 className="text-xl font-heading font-bold text-gray-900">Tracker Guide</h2>
                                </div>
                                <button
                                    onClick={() => setShowTutorial(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="px-8 py-8 space-y-10">
                                {/* Step 1: Selection */}
                                <section className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-heading font-semibold text-gray-900">1. Navigate & Select</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Use the arrows at the top of the calendar to switch months.
                                            <span className="font-semibold text-gray-900"> Tap any date</span> to select it—the tracker cards below will instantly update to show your logs for that specific day.
                                        </p>
                                    </div>
                                </section>

                                {/* Step 2: Logging Period */}
                                <section className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                        <Edit3 className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-heading font-semibold text-gray-900">2. Log Your Period</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Tap the <span className="inline-flex items-center px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded-full font-bold">LOG PERIOD</span> button.
                                            The calendar will highlight in pink. Tap days to toggle bleeding on or off. Click <span className="font-semibold text-gray-900">Done</span> to save your cycle dates.
                                        </p>
                                    </div>
                                </section>

                                {/* Step 3: Daily Logging */}
                                <section className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-heading font-semibold text-gray-900">3. Log Daily Rhythm</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Scroll down to see dynamic cards for symptoms, moods, water intake, and more.
                                            Each card is tailored to your current phase. Changes are saved automatically as you tap.
                                        </p>
                                    </div>
                                </section>

                                {/* Step 4: Understanding Phases */}
                                <section className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-lg font-heading font-semibold text-gray-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Cycle Phases
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                                            <div className="w-3 h-3 bg-rose-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-rose-900">Menstrual</p>
                                            <p className="text-[10px] text-rose-700">Days 1-5 (Period)</p>
                                        </div>
                                        <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                                            <div className="w-3 h-3 bg-teal-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-teal-900">Follicular</p>
                                            <p className="text-[10px] text-teal-700">Pre-ovulation energy</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                            <div className="w-3 h-3 bg-amber-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-amber-900">Ovulatory</p>
                                            <p className="text-[10px] text-amber-700">Highest fertility</p>
                                        </div>
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                            <div className="w-3 h-3 bg-indigo-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-indigo-900">Luteal</p>
                                            <p className="text-[10px] text-indigo-700">Winding down</p>
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-4">
                                    <button
                                        onClick={() => setShowTutorial(false)}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                                    >
                                        Start Tracking
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default PeriodLoggingCard;
