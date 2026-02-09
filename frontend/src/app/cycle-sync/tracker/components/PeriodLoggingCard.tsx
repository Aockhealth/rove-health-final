"use client";

import { useMemo, useTransition, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shield, HelpCircle, X, Calendar, Edit3, Activity, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { calculatePhase, daysBetween, getRelevantPeriodStart, isInFertileWindow, parseLocalDate, type CycleSettings, type DailyLog } from "@shared/cycle/phase";

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

    // Color Palette - Visual Identity 2.0
    const colors = {
        menstrual: "#AF6B6B", // Terra Rose
        follicular: "#8DAA9D", // Sage Dew
        ovulatory: "#D4A25F", // Soleil Ochre
        luteal: "#7B82A8", // Dusk Slate
        today: "#1C1C1E",
        text: "#4B5563",
        neutralGray: "#9CA3AF",
        shadow: "rgba(0,0,0,0.06)",
    };

    const phaseSettings: CycleSettings = useMemo(() => ({
        last_period_start: cycleSettings.last_period_start || "",
        cycle_length_days: cycleSettings.cycle_length_days || 28,
        period_length_days: cycleSettings.period_length_days || 5
    }), [cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days]);

    const normalizedLogs: Record<string, DailyLog> = useMemo(() => {
        const logs: Record<string, DailyLog> = {};
        Object.entries(monthLogs).forEach(([date, log]) => {
            logs[date] = { date, is_period: log?.is_period };
        });
        return logs;
    }, [monthLogs]);

    const todayResult = useMemo(
        () => calculatePhase(new Date(), phaseSettings, normalizedLogs),
        [phaseSettings, normalizedLogs]
    );

    const selectedResult = useMemo(
        () => calculatePhase(selectedDate, phaseSettings, normalizedLogs),
        [selectedDate, phaseSettings, normalizedLogs]
    );

    const dayMeta = useMemo(() => {
        const map: Record<string, { phase: Phase | null; fertile: boolean; day: number; late: boolean }> = {};
        calendarDays.forEach(dayItem => {
            if (!dayItem.isPadding) {
                const dateStr = formatDate(dayItem.date);
                const result = calculatePhase(dayItem.date, phaseSettings, normalizedLogs);
                map[dateStr] = {
                    phase: result.phase,
                    day: result.day,
                    late: result.latePeriod,
                    fertile: result.phase
                        ? isInFertileWindow(
                            result.day,
                            phaseSettings.cycle_length_days || 28,
                            phaseSettings.luteal_length_days
                        )
                        : false
                };
            }
        });
        return map;
    }, [calendarDays, formatDate, phaseSettings, normalizedLogs]);

    // Days until next period
    const daysUntilPeriod = useMemo(() => {
        const cycleLength = phaseSettings.cycle_length_days || 28;
        if (!phaseSettings.last_period_start && Object.keys(normalizedLogs).length === 0) return 0;
        if (todayResult.phase === null || todayResult.latePeriod) return 0;

        const anchor = getRelevantPeriodStart(new Date(), phaseSettings, normalizedLogs);
        if (!anchor.start) return 0;

        const anchorDate = parseLocalDate(anchor.start);
        const nextStart = new Date(anchorDate);
        nextStart.setDate(anchorDate.getDate() + cycleLength);
        return Math.max(0, daysBetween(new Date(), nextStart));
    }, [phaseSettings, normalizedLogs, todayResult]);

    const lateByDays = todayResult.latePeriod
        ? Math.max(1, (todayResult.day || 0) - (phaseSettings.cycle_length_days || 28))
        : 0;

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

    return (
        <div className={cn(
            "bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-xl shadow-stone-200/40 transition-all duration-500 mb-6",
            // Dynamic glow based on phase
            currentPhase === "Menstrual" && "shadow-[0_20px_40px_rgba(175,107,107,0.1)]",
            currentPhase === "Follicular" && "shadow-[0_20px_40px_rgba(141,170,157,0.1)]",
            currentPhase === "Ovulatory" && "shadow-[0_20px_40px_rgba(212,162,95,0.1)]",
            currentPhase === "Luteal" && "shadow-[0_20px_40px_rgba(123,130,168,0.1)]"
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
                            {todayResult.phase === null
                                ? "Log your first period"
                                : currentPhase === "Menstrual"
                                    ? `Period Day ${Math.max(1, selectedResult.day || 1)}`
                                    : todayResult.latePeriod
                                        ? `Late by ${lateByDays} day${lateByDays === 1 ? "" : "s"}`
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
                <div className="mb-8 p-6 bg-phase-menstrual/5 rounded-3xl border border-phase-menstrual/10 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-sm font-heading font-semibold text-phase-menstrual">Select period dates</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Tap days to mark/unmark bleeding</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEndPeriod}
                            className="px-4 py-2 bg-white text-phase-menstrual border border-phase-menstrual/20 hover:bg-rose-50 text-xs font-semibold rounded-full transition-colors"
                        >
                            End Period Here
                        </button>
                        <button
                            onClick={onExitPeriodLogging}
                            className="px-6 py-2 bg-phase-menstrual hover:bg-phase-menstrual/90 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-phase-menstrual/20"
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
                        className="p-1 hover:text-phase-menstrual transition-colors"
                        title="How to use"
                    >
                        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-phase-menstrual" />
                    </button>
                </div>
                <div className="flex gap-4">
                    <button onClick={onPrevMonth} className="p-1 hover:text-phase-menstrual transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={onNextMonth} className="p-1 hover:text-phase-menstrual transition-colors">
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

                            const dayInfo = dayMeta[dateStr];
                            const phase = dayInfo?.phase ?? null;
                            const fertile = dayInfo?.fertile ?? false;

                            // Base colors
                            let textColor = colors.text;
                            if (disabled) textColor = "#D1D5DB"; // gray-300

                            // Phase Colors for Indicators
                            let phaseColor = "transparent";
                            if (loggedPeriod) phaseColor = colors.menstrual;
                            else if (phase === "Menstrual") phaseColor = colors.menstrual;
                            else if (phase === "Ovulatory") phaseColor = colors.ovulatory;
                            else if (phase === "Follicular") phaseColor = colors.follicular;
                            else if (phase === "Luteal") phaseColor = colors.luteal;

                            // Background Logic via classes or inline
                            // We want "Orb" logic at 20% scale for active/selected
                            // And "Solid Blocks" replaced by Vertical Bars for period

                            const isPhaseIndicated = !loggedPeriod && phase && !isPeriodLoggingMode;

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDayClick(date, dateStr, disabled)}
                                    disabled={disabled}
                                    className="relative aspect-square flex flex-col items-center justify-center p-0.5 group"
                                    style={{ minWidth: '44px', minHeight: '44px' }}
                                >
                                    <motion.div
                                        className={cn(
                                            "w-full h-full rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300",
                                            selected ? "shadow-lg scale-100" : "scale-[0.95]"
                                        )}
                                        style={{
                                            // Orb logic for selected: glass + gradient
                                            background: selected
                                                ? `linear-gradient(135deg, white, #FAF9F6)`
                                                : isPhaseIndicated
                                                    ? `${phaseColor}15` // 10% opacity hex
                                                    : "transparent",
                                            boxShadow: selected
                                                ? "0 8px 16px -4px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.8)"
                                                : isPhaseIndicated
                                                    ? `inset 0 2px 6px ${phaseColor}20` // Inner glow sphere effect
                                                    : "none",
                                            border: today ? `2px solid ${colors.today}` : "1px solid transparent"
                                        }}
                                    >

                                        {/* Number */}
                                        <span
                                            className={cn(
                                                "text-sm font-semibold relative z-10",
                                                loggedPeriod ? "font-bold text-gray-900" : ""
                                            )}
                                            style={{ color: loggedPeriod ? colors.menstrual : textColor }}
                                        >
                                            {date.getDate()}
                                        </span>

                                        {/* Bleed Day: Vertical Bar */}
                                        {loggedPeriod && (
                                            <div
                                                className="absolute z-0 w-1 h-5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
                                                style={{ backgroundColor: colors.menstrual }}
                                            />
                                        )}
                                        {loggedPeriod && (
                                            <div className="absolute -bottom-1 w-1 h-3 rounded-full bg-phase-menstrual" />
                                        )}

                                        {/* Phase Indicator Dot (for predicted days) */}
                                        {isPhaseIndicated && (
                                            <div
                                                className="absolute bottom-1.5 w-1 h-1 rounded-full opacity-60"
                                                style={{ backgroundColor: phaseColor }}
                                            />
                                        )}

                                        {/* Fertile Dot (if not period) */}
                                        {fertile && !loggedPeriod && phase !== "Menstrual" && (
                                            <div
                                                className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full"
                                                style={{ backgroundColor: colors.ovulatory }}
                                            />
                                        )}

                                        {/* Selected State Overlay/Ring handled by parent div styles */}
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
                            className="w-2 h-2 rounded-full shadow-sm"
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
        </div >
    );
});

export default PeriodLoggingCard;
