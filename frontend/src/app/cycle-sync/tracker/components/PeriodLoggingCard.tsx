"use client";

import { useMemo, useTransition, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shield, HelpCircle, X, Calendar, Edit3, Activity, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { calculatePhase, daysBetween, getRelevantPeriodStart, isInFertileWindow, parseLocalDate, type CycleSettings, type DailyLog } from "@shared/cycle/phase";

// ─── Category color definitions ───────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
    discharge: "#7CB9E8", // Soft Blue
    bodySignals: "#E07B7B", // Warm Red
    innerWeather: "#B07FC0", // Soft Purple
    exerciseLog: "#E07B7B", // Warm Red (same as body signals – exercise)
    hydration: "#4DB6AC", // Teal
    sleepLog: "#7986CB", // Indigo
    disruptors: "#D4A82A", // Warm Amber/Yellow
    sexualWellness: "#E8924E", // Warm Orange
};

const CATEGORY_LEGEND = [
    { key: "discharge", label: "Discharge", color: CATEGORY_COLORS.discharge },
    { key: "bodySignals", label: "Body Signals", color: CATEGORY_COLORS.bodySignals },
    { key: "innerWeather", label: "Inner Weather", color: CATEGORY_COLORS.innerWeather },
    { key: "exerciseLog", label: "Exercise", color: CATEGORY_COLORS.exerciseLog },
    { key: "hydration", label: "Hydration", color: CATEGORY_COLORS.hydration },
    { key: "sleepLog", label: "Sleep", color: CATEGORY_COLORS.sleepLog },
    { key: "disruptors", label: "Disruptors", color: CATEGORY_COLORS.disruptors },
    { key: "sexualWellness", label: "Sexual Wellness", color: CATEGORY_COLORS.sexualWellness },
];

// Derive which categories are logged for a given day's log entry
function getLoggedCategories(log: any): { key: string; label: string; color: string }[] {
    if (!log) return [];
    const categories: { key: string; label: string; color: string }[] = [];

    if (log.cervical_discharge) {
        categories.push({ key: "discharge", label: "Discharge", color: CATEGORY_COLORS.discharge });
    }
    if (Array.isArray(log.symptoms) && log.symptoms.length > 0) {
        categories.push({ key: "bodySignals", label: "Body Signals", color: CATEGORY_COLORS.bodySignals });
    }
    if (Array.isArray(log.moods) && log.moods.length > 0) {
        categories.push({ key: "innerWeather", label: "Inner Weather", color: CATEGORY_COLORS.innerWeather });
    }
    if ((Array.isArray(log.exercise_types) && log.exercise_types.length > 0) || log.exercise_minutes) {
        categories.push({ key: "exerciseLog", label: "Exercise", color: CATEGORY_COLORS.exerciseLog });
    }
    if (log.water_intake && log.water_intake > 0) {
        categories.push({ key: "hydration", label: "Hydration", color: CATEGORY_COLORS.hydration });
    }
    if ((Array.isArray(log.sleep_quality) && log.sleep_quality.length > 0) || log.sleep_minutes) {
        categories.push({ key: "sleepLog", label: "Sleep", color: CATEGORY_COLORS.sleepLog });
    }
    if (Array.isArray(log.disruptors) && log.disruptors.length > 0) {
        categories.push({ key: "disruptors", label: "Disruptors", color: CATEGORY_COLORS.disruptors });
    }
    if ((Array.isArray(log.sex_activity) && log.sex_activity.length > 0) || (Array.isArray(log.contraception) && log.contraception.length > 0)) {
        categories.push({ key: "sexualWellness", label: "Sexual Wellness", color: CATEGORY_COLORS.sexualWellness });
    }

    return categories;
}

// ─── Tooltip component ────────────────────────────────────────────────────────
function DayTooltip({ categories, children }: { categories: { label: string; color: string }[]; children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setVisible(true);
    };
    const hide = () => {
        timerRef.current = setTimeout(() => setVisible(false), 80);
    };

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    if (categories.length === 0) return <>{children}</>;

    return (
        <div
            className="relative"
            onMouseEnter={show}
            onMouseLeave={hide}
            onTouchStart={show}
            onTouchEnd={hide}
        >
            {children}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[200] pointer-events-none"
                        style={{ minWidth: "9rem" }}
                    >
                        <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-xl px-2.5 py-2 shadow-2xl">
                            <div className="flex flex-col gap-1">
                                {categories.map(c => (
                                    <div key={c.label} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                        <span className="text-[10px] font-medium whitespace-nowrap">{c.label}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

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
            "bg-white/60 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.53rem] p-4 sm:p-6 md:p-8 border shadow-xl transition-all duration-500 mb-4 sm:mb-6",
            // Phase-colored border (matching other tracker cards)
            currentPhase === "Menstrual" && "border-phase-menstrual/30 shadow-[0_20px_40px_rgba(175,107,107,0.1)]",
            currentPhase === "Follicular" && "border-phase-follicular/30 shadow-[0_20px_40px_rgba(141,170,157,0.1)]",
            currentPhase === "Ovulatory" && "border-phase-ovulatory/30 shadow-[0_20px_40px_rgba(212,162,95,0.1)]",
            currentPhase === "Luteal" && "border-phase-luteal/30 shadow-[0_20px_40px_rgba(123,130,168,0.1)]",
            !currentPhase && "border-gray-100 shadow-stone-200/30"
        )}>
            {/* Top info card (sleeker version) */}
            {!isPeriodLoggingMode && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h2 className="text-lg sm:text-xl font-heading font-semibold text-gray-900 leading-tight">
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
                        className="w-full sm:w-auto bg-[#1C1C1E] hover:bg-[#2C2C2E] disabled:opacity-60 transition-all text-white rounded-full px-6 py-2.5 text-sm font-medium shadow-lg shadow-gray-200"
                    >
                        {currentPhase === "Menstrual" ? "Edit Period" : "Log Period"}
                    </button>
                </motion.div>
            )}

            {/* Logging mode banner */}
            {isPeriodLoggingMode && (
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-phase-menstrual/5 rounded-2xl sm:rounded-3xl border border-phase-menstrual/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <h3 className="text-sm font-heading font-semibold text-phase-menstrual">Select period dates</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Tap days to mark/unmark bleeding</p>
                    </div>
                    <div className="w-full sm:w-auto flex flex-wrap gap-2">
                        <button
                            onClick={onEndPeriod}
                            className="flex-1 sm:flex-none px-4 py-2 bg-white text-phase-menstrual border border-phase-menstrual/20 hover:bg-rose-50 text-xs font-semibold rounded-full transition-colors"
                        >
                            End Period Here
                        </button>
                        <button
                            onClick={onExitPeriodLogging}
                            className="flex-1 sm:flex-none px-6 py-2 bg-phase-menstrual hover:bg-phase-menstrual/90 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-phase-menstrual/20"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Month header */}
            <div className="flex items-center justify-between mb-5 sm:mb-8 px-0 sm:px-2 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <h3 className="text-sm sm:text-base font-heading font-bold text-gray-900 uppercase tracking-wider truncate">
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
                <div className="flex gap-2 sm:gap-4 shrink-0">
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
                    <div className="grid grid-cols-7 mb-3 sm:mb-4">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 sm:gap-y-2 sm:gap-x-2">
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

                            const isPhaseIndicated = !!phase;
                            const logEntry = monthLogs[dateStr];
                            const loggedCategories = !isPeriodLoggingMode && !disabled ? getLoggedCategories(logEntry) : [];

                            return (
                                <DayTooltip key={i} categories={loggedCategories}>
                                    <button
                                        onClick={() => handleDayClick(date, dateStr, disabled)}
                                        disabled={disabled}
                                        className="relative aspect-square min-h-[2.15rem] sm:min-h-[2.75rem] flex flex-col items-center justify-center p-0.5 group w-full"
                                    >
                                        <motion.div
                                            className={cn(
                                                "w-full h-full rounded-xl sm:rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300",
                                                selected ? "shadow-lg scale-100" : "scale-[0.95]"
                                            )}
                                            style={{
                                                // Make selected day stand out with a dark background instead of white
                                                background: selected
                                                    ? colors.today
                                                    : isPhaseIndicated
                                                        ? `${phaseColor}30`
                                                        : "transparent",
                                                boxShadow: selected
                                                    ? "0 4px 12px rgba(0,0,0,0.15)"
                                                    : isPhaseIndicated
                                                        ? `inset 0 2px 6px ${phaseColor}20`
                                                        : "none",
                                                border: today && !selected ? `2px solid ${colors.today}` : "1px solid transparent"
                                            }}
                                        >

                                            {/* Number */}
                                            <span
                                                className={cn(
                                                    "text-xs sm:text-sm font-semibold relative z-10",
                                                    loggedPeriod && !selected ? "font-bold" : ""
                                                )}
                                                style={{ color: selected ? "#FFFFFF" : loggedPeriod ? colors.menstrual : textColor }}
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

                                            {/* Fertile Dot (if not period) */}
                                            {fertile && !loggedPeriod && phase !== "Menstrual" && (
                                                <div
                                                    className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full"
                                                    style={{ backgroundColor: colors.ovulatory }}
                                                />
                                            )}

                                            {/* ─── Activity Bars ───────────────────────────────
                                                Vertical bars anchored to top-left, like a tiny
                                                bar chart. Each bar = one logged category color.
                                                Max 5 bars shown; extras collapsed into one gray.
                                            */}
                                            {loggedCategories.length > 0 && (
                                                <div
                                                    className="absolute top-[3px] left-[3px] flex flex-row items-flex-start gap-[1.5px] z-20"
                                                    style={{ pointerEvents: "none" }}
                                                >
                                                    {loggedCategories.slice(0, 5).map((cat) => (
                                                        <div
                                                            key={cat.key}
                                                            className="rounded-full"
                                                            style={{
                                                                width: "4px",
                                                                height: "10px",
                                                                backgroundColor: selected ? "rgba(255,255,255,0.75)" : cat.color,
                                                                opacity: selected ? 0.85 : 0.8,
                                                            }}
                                                        />
                                                    ))}
                                                    {loggedCategories.length > 5 && (
                                                        <div
                                                            className="rounded-full"
                                                            style={{
                                                                width: "2px",
                                                                height: "10px",
                                                                backgroundColor: selected ? "rgba(255,255,255,0.4)" : "#9CA3AF",
                                                                opacity: 0.5,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Selected State Overlay/Ring handled by parent div styles */}
                                        </motion.div>
                                    </button>
                                </DayTooltip>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Phase Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-100">
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
                        <span className="text-[6px] sm:text-[6px] font-bold text-gray-400 uppercase tracking-widest">
                            {phase.label}
                        </span>
                    </div>
                ))}

                <div className="flex items-center gap-3 sm:border-l border-gray-100 sm:pl-6 sm:ml-2">
                    <div className="flex flex-col items-center justify-center">
                        {/*  <span className="text-[6px] text-gray-400 font-bold mb-0.5">14</span> */}
                        <div className="w-1 h-1 rounded-full bg-[#fbbf24]" />
                    </div>
                    <span className="text-[6px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Fertile Window
                    </span>
                </div>
            </div>

            {/* ─── Data Category Legend ─────────────────────────────────────────
                Maps the colored lines inside date cells to their categories.
            */}
            <div className="mt-4 pt-3 border-t border-gray-100/70">
                <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2.5">Logged data indicators</p>
                <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2">
                    {CATEGORY_LEGEND.map((cat) => (
                        <div key={cat.key} className="flex items-center gap-1.5">
                            <div
                                className="rounded-full"
                                style={{ width: "2.5px", height: "12px", backgroundColor: cat.color, opacity: 0.85 }}
                            />
                            <span className="text-[8px] sm:text-[9px] font-medium text-gray-400 whitespace-nowrap">
                                {cat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>


            {/* Tutorial Modal */}
            <AnimatePresence>
                {showTutorial && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between z-10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900">Tracker Guide</h2>
                                </div>
                                <button
                                    onClick={() => setShowTutorial(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="px-4 sm:px-8 py-5 sm:py-8 space-y-6 sm:space-y-10">
                                {/* Step 1: Selection */}
                                <section className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-500">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-base sm:text-lg font-heading font-semibold text-gray-900">1. Navigate & Select</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Use the arrows at the top of the calendar to switch months.
                                            <span className="font-semibold text-gray-900"> Tap any date</span> to select it—the tracker cards below will instantly update to show your logs for that specific day.
                                        </p>
                                    </div>
                                </section>

                                {/* Step 2: Logging Period */}
                                <section className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-rose-500">
                                        <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-base sm:text-lg font-heading font-semibold text-gray-900">2. Log Your Period</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Tap the <span className="inline-flex items-center px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded-full font-bold">LOG PERIOD</span> button.
                                            The calendar will highlight in pink. Tap days to toggle bleeding on or off. Click <span className="font-semibold text-gray-900">Done</span> to save your cycle dates.
                                        </p>
                                    </div>
                                </section>

                                {/* Step 3: Daily Logging */}
                                <section className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-500">
                                        <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-base sm:text-lg font-heading font-semibold text-gray-900">3. Log Daily Rhythm</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Scroll down to see dynamic cards for symptoms, moods, water intake, and more.
                                            Each card is tailored to your current phase. Changes are saved automatically as you tap.
                                        </p>
                                    </div>
                                </section>

                                {/* Step 4: Understanding Phases */}
                                <section className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-base sm:text-lg font-heading font-semibold text-gray-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Cycle Phases
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 sm:p-4 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl">
                                            <div className="w-3 h-3 bg-rose-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-rose-900">Menstrual</p>
                                            <p className="text-[10px] text-rose-700">Days 1-5 (Period)</p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-teal-50 border border-teal-100 rounded-xl sm:rounded-2xl">
                                            <div className="w-3 h-3 bg-teal-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-teal-900">Follicular</p>
                                            <p className="text-[10px] text-teal-700">Pre-ovulation energy</p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl">
                                            <div className="w-3 h-3 bg-amber-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-amber-900">Ovulatory</p>
                                            <p className="text-[10px] text-amber-700">Highest fertility</p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-indigo-50 border border-indigo-100 rounded-xl sm:rounded-2xl">
                                            <div className="w-3 h-3 bg-indigo-400 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-indigo-900">Luteal</p>
                                            <p className="text-[10px] text-indigo-700">Winding down</p>
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-4">
                                    <button
                                        onClick={() => setShowTutorial(false)}
                                        className="w-full py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
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
