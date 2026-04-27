"use client";

import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@shared/cycle/phase";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal" | null;

interface CalendarDay {
    date: Date;
    isPadding: boolean;
}

interface CalendarCardProps {
    currentMonth: Date;
    selectedDate: Date;
    calendarDays: CalendarDay[];
    monthLogs: Record<string, any>;
    cycleSettings: {
        last_period_start: string;
        cycle_length_days: number;
        period_length_days: number;
    };
    isEditingCycle: boolean;
    isPeriodLoggingMode?: boolean;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDate: (date: Date) => void;
    onTogglePeriodDate?: (date: string) => void;
    onExitPeriodLogging?: () => void;
    getPhaseForDate: (date: Date) => Phase;
    getCurrentDay: (date: Date) => number;
    isFutureDate: (date: Date) => boolean;
    formatDate: (date: Date) => string;
}

export default function CalendarCard({
    currentMonth,
    selectedDate,
    calendarDays,
    monthLogs,
    cycleSettings,
    isEditingCycle,
    isPeriodLoggingMode = false,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
    onTogglePeriodDate,
    onExitPeriodLogging,
    getPhaseForDate,
    getCurrentDay,
    isFutureDate,
    formatDate
}: CalendarCardProps) {
    const getPhaseColor = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "bg-phase-menstrual/20 border border-phase-menstrual/30 text-phase-menstrual hover:bg-phase-menstrual/30";
            case "Follicular":
                return "bg-teal-100 border border-teal-200 text-teal-900 hover:bg-teal-200";
            case "Ovulatory":
                return "bg-amber-100 border border-amber-200 text-amber-900 hover:bg-amber-200";
            case "Luteal":
                return "bg-indigo-100 border border-indigo-200 text-indigo-900 hover:bg-indigo-200";
            default:
                return "bg-transparent text-gray-900 hover:bg-gray-50 border border-transparent";
        }
    };

    // Calculate predicted period dates
    const getPredictedDates = (): Set<string> => {
        if (!cycleSettings.last_period_start) return new Set();

        const predicted = new Set<string>();
        const lastPeriodStart = parseLocalDate(cycleSettings.last_period_start);
        const cycleLength = cycleSettings.cycle_length_days || 28;
        const periodLength = cycleSettings.period_length_days || 5;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastPeriodStart.setHours(0, 0, 0, 0);

        const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
        const cyclesSince = Math.floor(daysSinceLastPeriod / cycleLength);
        const nextPeriodStart = new Date(lastPeriodStart);
        nextPeriodStart.setDate(lastPeriodStart.getDate() + (cyclesSince + 1) * cycleLength);

        for (let i = 0; i < periodLength; i++) {
            const predictedDate = new Date(nextPeriodStart);
            predictedDate.setDate(nextPeriodStart.getDate() + i);
            predicted.add(formatDate(predictedDate));
        }

        return predicted;
    };

    const predictedDates = getPredictedDates();

    const handleDateClick = (date: Date, dateStr: string) => {
        if (isPeriodLoggingMode && onTogglePeriodDate) {
            onTogglePeriodDate(dateStr);
        } else {
            onSelectDate(date);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl shadow-phase-menstrual/5 border border-white/50 mb-6">
            {/* Period Logging Mode Banner */}
            {isPeriodLoggingMode && (
                <div className="mb-4 p-4 bg-phase-menstrual/10 rounded-2xl border border-phase-menstrual/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-phase-menstrual mb-1">
                                Select your period dates
                            </h3>
                            <p className="text-xs text-phase-menstrual/80">
                                Tap dates to mark or unmark period days
                            </p>
                        </div>
                        <button
                            onClick={onExitPeriodLogging}
                            className="px-4 py-2 bg-phase-menstrual hover:bg-phase-menstrual/90 text-white text-sm font-medium rounded-full transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={onPrevMonth}
                        className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onClick={onNextMonth}
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
            <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((dayItem, i) => {
                    if (dayItem.isPadding) return <div key={i} />;

                    const date = dayItem.date;
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isFuture = isFutureDate(date);
                    const dateStr = formatDate(date);
                    const log = monthLogs[dateStr];

                    const phase = getPhaseForDate(date);
                    const isDisabled = isEditingCycle ? false : isFuture;

                    // Period logging mode states
                    const isLogged = log?.is_period === true;
                    const isPredicted = predictedDates.has(dateStr) && !isLogged;

                    // Calculate Fertile Window
                    const dayInCycle = getCurrentDay(date);
                    const ovulationDay = (cycleSettings.cycle_length_days || 28) - 14;
                    const isFertile = dayInCycle >= (ovulationDay - 5) && dayInCycle <= (ovulationDay + 2);

                    if (isPeriodLoggingMode) {
                        // Period logging mode - simple circle design
                        return (
                            <button
                                key={i}
                                onClick={() => !isDisabled && handleDateClick(date, dateStr)}
                                disabled={isDisabled}
                                className="flex flex-col items-center"
                            >
                                {/* Day Circle */}
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all",
                                    isLogged && "bg-phase-menstrual text-white",
                                    isPredicted && "border-2 border-dashed border-phase-menstrual/40",
                                    !isLogged && !isPredicted && "border border-gray-300",
                                    isDisabled && "opacity-30 cursor-not-allowed"
                                )}>
                                    {isLogged ? "✓" : ""}
                                </div>
                                {/* Date Number */}
                                <span className="text-xs text-phase-menstrual mt-1">
                                    {date.getDate()}
                                </span>
                            </button>
                        );
                    }

                    // Normal mode - phase-based design
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
                            onClick={() => !isDisabled && handleDateClick(date, dateStr)}
                            disabled={isDisabled}
                            className={cn(
                                "relative h-11 w-full flex items-center justify-center text-sm font-medium transition-all group backdrop-blur-[2px]",
                                getPhaseColor(phase),
                                samePrev && "ml-0 rounded-l-none border-l-0",
                                sameNext && "mr-0 rounded-r-none border-r-0",
                                (!samePrev || isRowStart) && "rounded-l-xl",
                                (!sameNext || isRowEnd) && "rounded-r-xl",
                                isSelected && "z-10 shadow-lg shadow-gray-200/50 scale-105",
                                isSelected && !samePrev && !sameNext && "rounded-xl",
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
    );
}
