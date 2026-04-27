"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
    value?: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DatePicker({ value, onChange, label, placeholder = "Select date" }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date()); // Date being viewed (month/year)
    const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
    const [yearDecadeStart, setYearDecadeStart] = useState(new Date().getFullYear() - 10);

    // Parse value or default to today for initialization if needed
    // But viewDate handles the navigation

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setViewMode("days"); // Reset view mode
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper: Days in month
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    // Helper: First day of month (0-6)
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const generateCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        // Previous month filler
        const prevMonthDays = getDaysInMonth(year, month - 1);
        const days = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }

        // Next month filler (to fill 42 cells grid 6x7 usually, or just 35 5x7)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
        }

        return days;
    };

    const isSelected = (date: Date) => {
        if (!value) return false;
        const d = new Date(value);
        return date.getDate() === d.getDate() &&
            date.getMonth() === d.getMonth() &&
            date.getFullYear() === d.getFullYear();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const handleSelectDate = (date: Date) => {
        // Format YYYY-MM-DD (safe for timezone issues if we just specific components)
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const handleSelectMonth = (monthIndex: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(monthIndex);
        setViewDate(newDate);
        setViewMode("days");
    };

    const handleSelectYear = (year: number) => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(year);
        setViewDate(newDate);
        setViewMode("months"); // Go to months after selecting year
    };

    const generateYearRange = () => {
        const years = [];
        for (let i = 0; i < 20; i++) {
            years.push(yearDecadeStart + i);
        }
        return years;
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            {label && (
                <label className="text-xs font-bold uppercase tracking-widest text-rove-stone pl-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full px-5 py-4 rounded-2xl bg-white border border-rove-stone/10 transition-all text-left flex items-center justify-between group",
                    isOpen ? "border-rove-charcoal ring-1 ring-rove-charcoal/5" : "hover:border-rove-charcoal/50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl bg-rove-cream/50 flex items-center justify-center transition-colors group-hover:bg-rove-cream",
                        value ? "text-rove-charcoal" : "text-rove-stone/50"
                    )}>
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        {value ? (
                            <span className="text-rove-charcoal font-medium text-lg">
                                {new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                        ) : (
                            <span className="text-rove-stone/40 text-lg">{placeholder}</span>
                        )}
                    </div>
                </div>
                <ChevronDown className={cn(
                    "w-5 h-5 text-rove-stone transition-transform duration-300",
                    isOpen && "rotate-180 text-rove-charcoal"
                )} />
            </button>

            {/* Dropdown Calendar */}
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div
                        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute top-full left-0 right-0 mt-3 md:w-[360px] md:right-auto z-40 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden">

                            {/* Header */}
                            <div className="p-4 flex items-center justify-between border-b border-rove-stone/10 bg-white/50">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === "days") {
                                            const d = new Date(viewDate);
                                            d.setMonth(d.getMonth() - 1);
                                            setViewDate(d);
                                        } else if (viewMode === "years") {
                                            setYearDecadeStart(yearDecadeStart - 20);
                                        }
                                    }}
                                    className="p-2 rounded-full hover:bg-rove-stone/5 transition-colors disabled:opacity-30"
                                    disabled={viewMode === "months"}
                                >
                                    <ChevronLeft className="w-5 h-5 text-rove-charcoal" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === "days") setViewMode("months");
                                        else if (viewMode === "months") setViewMode("years");
                                        else setViewMode("days");
                                    }}
                                    className="px-3 py-1 rounded-lg hover:bg-rove-stone/5 transition-colors font-heading text-lg text-rove-charcoal font-medium"
                                >
                                    {viewMode === "days" && viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    {viewMode === "months" && viewDate.getFullYear()}
                                    {viewMode === "years" && `${yearDecadeStart} - ${yearDecadeStart + 19}`}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === "days") {
                                            const d = new Date(viewDate);
                                            d.setMonth(d.getMonth() + 1);
                                            setViewDate(d);
                                        } else if (viewMode === "years") {
                                            setYearDecadeStart(yearDecadeStart + 20);
                                        }
                                    }}
                                    className="p-2 rounded-full hover:bg-rove-stone/5 transition-colors disabled:opacity-30"
                                    disabled={viewMode === "months"}
                                >
                                    <ChevronRight className="w-5 h-5 text-rove-charcoal" />
                                </button>
                            </div>

                            {/* Days View */}
                            {viewMode === "days" && (
                                <div className="p-4">
                                    {/* Weekdays */}
                                    <div className="grid grid-cols-7 mb-2">
                                        {DAYS.map(day => (
                                            <div key={day} className="text-center text-[10px] uppercase font-bold text-rove-stone/50">
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
