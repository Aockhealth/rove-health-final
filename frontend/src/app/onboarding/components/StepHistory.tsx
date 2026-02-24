"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { compareDateStrings, formatLocalDate, monthLabel } from "@/lib/onboarding/date";
import type { PeriodRangeDraft, AutoStats } from "@/app/onboarding/state";

type StepHistoryProps = {
  viewDate: Date;
  periodHistory: PeriodRangeDraft[];
  isSelectingRangeEnd: boolean;
  autoStats: AutoStats | null;
  cycleLength: number;
  periodLength: number;
  error?: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (dateString: string) => void;
  onClearMonth: () => void;
  canClearMonth: boolean;
  onCycleLengthChange: (value: number) => void;
  onPeriodLengthChange: (value: number) => void;
};

type DayStatus = "none" | "start" | "mid" | "end" | "single";

function getDayStatus(dateString: string, ranges: PeriodRangeDraft[]): DayStatus {
  let status: DayStatus = "none";
  for (const range of ranges) {
    if (range.startDate === dateString && range.endDate === dateString) return "single";
    if (range.startDate === dateString) status = "start";
    if (range.endDate === dateString) status = "end";
    if (
      range.endDate &&
      compareDateStrings(dateString, range.startDate) > 0 &&
      compareDateStrings(dateString, range.endDate) < 0
    ) {
      status = "mid";
    }
  }
  return status;
}

function getMonthGrid(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const start = new Date(year, month, 1 - firstDay);
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    days.push(next);
  }
  return days;
}

function clampInput(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

const completedRangeCount = (ranges: PeriodRangeDraft[]) =>
  ranges.filter((r) => r.endDate).length;

export default function StepHistory({
  viewDate,
  periodHistory,
  isSelectingRangeEnd,
  autoStats,
  cycleLength,
  periodLength,
  error,
  onPreviousMonth,
  onNextMonth,
  onSelectDay,
  onClearMonth,
  canClearMonth,
  onCycleLengthChange,
  onPeriodLengthChange,
}: StepHistoryProps) {
  const today = formatLocalDate(new Date());
  const grid = getMonthGrid(viewDate);
  const activeMonth = viewDate.getMonth();
  const rangesLogged = completedRangeCount(periodHistory);
  const showManualInputs = rangesLogged < 2 || (autoStats && !autoStats.isIrregular);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const isCurrentOrFutureMonth = viewDate.getTime() >= currentMonthStart.getTime();

  // Contextual hint
  let hintMessage = "Tap the first day of your most recent period";
  let hintStyle = "border-rove-charcoal/10 bg-white/40 text-rove-charcoal/70";
  if (isSelectingRangeEnd) {
    hintMessage = "Now tap the last day of that period";
    hintStyle = "border-phase-menstrual/20 bg-phase-menstrual/5 text-phase-menstrual";
  } else if (rangesLogged === 1) {
    hintMessage = "Range saved — add one more for better accuracy";
    hintStyle = "border-phase-follicular/20 bg-phase-follicular/5 text-phase-follicular";
  } else if (rangesLogged >= 2) {
    hintMessage = `${rangesLogged} ranges logged — cycle auto-calculated`;
    hintStyle = "border-phase-follicular/20 bg-phase-follicular/5 text-phase-follicular";
  }

  return (
    <section className="space-y-5 px-1">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-2"
      >
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-rove-charcoal sm:text-3xl">
          Period History
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-rove-stone">
          Mark your recent periods. Adding 2+ ranges gives the most accurate predictions.
        </p>
      </motion.div>

      {/* Contextual hint */}
      <motion.div
        key={hintMessage}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl border px-4 py-2.5 text-center text-sm font-medium ${hintStyle}`}
      >
        {hintMessage}
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-3xl border border-rove-charcoal/8 bg-white/60 p-4 shadow-sm backdrop-blur-xl sm:p-5"
      >
        {/* Month navigator */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="rounded-full p-2 text-rove-stone transition hover:bg-rove-charcoal/5 hover:text-rove-charcoal active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-rove-charcoal">{monthLabel(viewDate)}</span>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={isCurrentOrFutureMonth}
            className="rounded-full p-2 text-rove-stone transition hover:bg-rove-charcoal/5 hover:text-rove-charcoal active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone/60">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <span key={`${day}-${i}`}>{day}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-[3px]">
          {grid.map((day) => {
            const dateString = formatLocalDate(day);
            const inCurrentMonth = day.getMonth() === activeMonth;
            const isFuture = compareDateStrings(dateString, today) > 0;
            const isToday = dateString === today;
            const status = getDayStatus(dateString, periodHistory);

            let bgClass = "";
            let textClass = inCurrentMonth ? "text-rove-charcoal" : "text-rove-stone/30";
            let roundClass = "rounded-lg";

            if (status === "start") {
              bgClass = "bg-phase-menstrual";
              textClass = "text-white font-semibold";
              roundClass = "rounded-l-xl rounded-r-md";
            } else if (status === "end") {
              bgClass = "bg-phase-menstrual";
              textClass = "text-white font-semibold";
              roundClass = "rounded-r-xl rounded-l-md";
            } else if (status === "single") {
              bgClass = "bg-phase-menstrual";
              textClass = "text-white font-semibold";
              roundClass = "rounded-xl";
            } else if (status === "mid") {
              bgClass = "bg-phase-menstrual/15";
              textClass = "text-phase-menstrual font-medium";
              roundClass = "rounded-md";
            }

            return (
              <button
                key={dateString}
                type="button"
                disabled={isFuture || !inCurrentMonth}
                onClick={() => onSelectDay(dateString)}
                className={`relative h-10 text-sm transition-all duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 ${bgClass} ${textClass} ${roundClass} ${inCurrentMonth && status === "none" ? "hover:bg-rove-charcoal/5" : ""
                  }`}
              >
                {day.getDate()}
                {isToday && status === "none" && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rove-charcoal/40" />
                )}
              </button>
            );
          })}
        </div>

        {canClearMonth && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onClearMonth}
              className="inline-flex items-center gap-1.5 rounded-full border border-rove-charcoal/10 px-3 py-1.5 text-xs font-semibold text-rove-stone transition hover:border-phase-menstrual/20 hover:text-phase-menstrual active:scale-95"
            >
              <RotateCcw className="h-3 w-3" />
              Clear this month
            </button>
          </div>
        )}
      </motion.div>

      {/* Auto-calculated stats */}
      {autoStats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border border-phase-follicular/20 bg-phase-follicular/5 p-4"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-phase-follicular">
            Auto-Calculated
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-semibold text-rove-charcoal">{autoStats.avgCycle}</p>
              <p className="text-xs text-rove-stone">Cycle days</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-rove-charcoal">{autoStats.avgBleed}</p>
              <p className="text-xs text-rove-stone">Period days</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-rove-charcoal">
                {autoStats.isIrregular ? "Irregular" : "Regular"}
              </p>
              <p className="text-xs text-rove-stone">Pattern</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Manual cycle inputs */}
      {showManualInputs && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 rounded-2xl border border-rove-charcoal/8 bg-white/60 p-4 backdrop-blur-xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone">
            Or set manually
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-rove-stone">Cycle length</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={15}
                  max={60}
                  value={cycleLength}
                  onChange={(e) => onCycleLengthChange(clampInput(Number(e.target.value), 15, 60))}
                  className="w-full accent-rove-charcoal"
                />
                <span className="min-w-[2rem] text-center text-sm font-semibold text-rove-charcoal">
                  {cycleLength}d
                </span>
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-rove-stone">Period length</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={periodLength}
                  onChange={(e) => onPeriodLengthChange(clampInput(Number(e.target.value), 1, 15))}
                  className="w-full accent-rove-charcoal"
                />
                <span className="min-w-[2rem] text-center text-sm font-semibold text-rove-charcoal">
                  {periodLength}d
                </span>
              </div>
            </label>
          </div>
        </motion.div>
      )}

      {error && <p className="text-center text-sm text-phase-menstrual">{error}</p>}
    </section>
  );
}
