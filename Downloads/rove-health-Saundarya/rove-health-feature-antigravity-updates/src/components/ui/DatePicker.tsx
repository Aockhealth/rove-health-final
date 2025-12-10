"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function DatePicker({ value, onChange, placeholder = "Select date", className }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            return new Date(value);
        }
        return new Date();
    });
    const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
    const [yearDecadeStart, setYearDecadeStart] = useState(() => {
        const currentYear = new Date().getFullYear();
        return Math.floor(currentYear / 20) * 20 - 20; // Start from 20 years ago
    });
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the selected date
    const selectedDate = value ? new Date(value) : null;

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setViewMode("days");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get days in month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday, we want Monday = 0)
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert to Monday-first
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);

        const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            days.push({
                day,
                isCurrentMonth: false,
                date: new Date(year, month - 1, day)
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Next month days (fill to complete last row)
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (date: Date) => {
        // Use local date methods to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const handleSelectMonth = (monthIndex: number) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setViewMode("days");
    };

    const handleSelectYear = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode("months");
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return selectedDate && date.toDateString() === selectedDate.toDateString();
    };

    // Generate year range for year picker (20 years at a time)
    const generateYearRange = () => {
        const years = [];
        for (let i = yearDecadeStart; i < yearDecadeStart + 20; i++) {
            years.push(i);
        }
        return years;
    };

    const formatDisplayValue = () => {
        if (!value) return placeholder;
        const date = new Date(value);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Input Display */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full p-4 rounded-xl bg-white border border-transparent",
                    "focus:border-rove-charcoal outline-none shadow-sm",
                    "flex items-center justify-between text-left transition-all",
                    "hover:shadow-md",
                    !value && "text-rove-stone"
                )}
            >
                <span className={value ? "text-rove-charcoal" : "text-rove-stone/60"}>
                    {formatDisplayValue()}
                </span>
                <Calendar className="w-5 h-5 text-rove-stone" />
            </button>

            {/* Calendar Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Calendar Panel */}
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-rove-stone/10">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handlePrevMonth}
                                        className="p-2 rounded-full hover:bg-rove-stone/10 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-rove-charcoal" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setViewMode(viewMode === "days" ? "months" : viewMode === "months" ? "years" : "days")}
                                        className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-rove-stone/10 transition-colors"
                                    >
                                        <span className="font-heading text-xl text-rove-peach">
                                            {MONTHS[viewDate.getMonth()]}
                                        </span>
                                        <span className="font-heading text-xl text-rove-charcoal">
                                            {viewDate.getFullYear()}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="p-2 rounded-full hover:bg-rove-stone/10 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-rove-charcoal" />
                                    </button>
                                </div>
                            </div>

                            {/* Days View */}
                            {viewMode === "days" && (
                                <div className="p-4">
                                    {/* Day Headers */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {DAYS.map((day, i) => (
                                            <div
                                                key={i}
                                                className="text-center text-xs font-medium text-rove-stone py-2"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {generateCalendarDays().map((item, i) => {
                                            const selected = isSelected(item.date);
                                            const today = isToday(item.date);

                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleSelectDate(item.date)}
                                                    className={cn(
                                                        "aspect-square flex items-center justify-center rounded-full text-sm transition-all",
                                                        "hover:bg-rove-peach/20",
                                                        !item.isCurrentMonth && "text-rove-stone/30",
                                                        item.isCurrentMonth && !selected && "text-rove-charcoal",
                                                        today && !selected && "ring-2 ring-rove-peach/50",
                                                        selected && "bg-rove-peach text-white font-medium shadow-lg shadow-rove-peach/30"
                                                    )}
                                                >
                                                    {item.day}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-4 pt-3 border-t border-rove-stone/10 flex justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = new Date();
                                                setViewDate(today);
                                            }}
                                            className="text-xs text-rove-stone hover:text-rove-charcoal transition-colors px-3 py-1 rounded-full hover:bg-rove-stone/10"
                                        >
                                            Today
                                        </button>
                                        {value && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onChange("");
                                                    setIsOpen(false);
                                                }}
                                                className="text-xs text-rove-stone hover:text-red-500 transition-colors px-3 py-1 rounded-full hover:bg-red-50"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Months View */}
                            {viewMode === "months" && (
                                <div className="p-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {MONTHS.map((month, i) => {
                                            const isCurrentMonth = viewDate.getMonth() === i;
                                            return (
                                                <button
                                                    key={month}
                                                    type="button"
                                                    onClick={() => handleSelectMonth(i)}
                                                    className={cn(
                                                        "py-3 px-2 rounded-xl text-sm font-medium transition-all",
                                                        "hover:bg-rove-peach/20",
                                                        isCurrentMonth && "bg-rove-peach text-white"
                                                    )}
                                                >
                                                    {month.slice(0, 3)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Years View */}
                            {viewMode === "years" && (
                                <div className="p-4">
                                    {/* Year Range Navigation */}
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setYearDecadeStart(yearDecadeStart - 20)}
                                            className="p-2 rounded-full hover:bg-rove-stone/10 transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-rove-charcoal" />
                                        </button>
                                        <span className="text-sm font-medium text-rove-stone">
                                            {yearDecadeStart} - {yearDecadeStart + 19}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setYearDecadeStart(yearDecadeStart + 20)}
                                            className="p-2 rounded-full hover:bg-rove-stone/10 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-rove-charcoal" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {generateYearRange().map((year) => {
                                            const isCurrentYear = viewDate.getFullYear() === year;
                                            return (
                                                <button
                                                    key={year}
                                                    type="button"
                                                    onClick={() => handleSelectYear(year)}
                                                    className={cn(
                                                        "py-3 px-2 rounded-xl text-sm font-medium transition-all",
                                                        "hover:bg-rove-peach/20",
                                                        isCurrentYear && "bg-rove-peach text-white"
                                                    )}
                                                >
                                                    {year}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
