import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, RotateCcw, Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { compareDateStrings, formatLocalDate, monthLabel } from '@shared/onboarding/date';
import type { PeriodRangeDraft, AutoStats } from '../../lib/onboarding-state';

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

type DayStatus = 'none' | 'start' | 'mid' | 'end' | 'single';

function getDayStatus(dateString: string, ranges: PeriodRangeDraft[]): DayStatus {
  let status: DayStatus = 'none';
  for (const range of ranges) {
    if (range.startDate === dateString && range.endDate === dateString) return 'single';
    if (range.startDate === dateString) status = 'start';
    if (range.endDate === dateString) status = 'end';
    if (
      range.endDate &&
      compareDateStrings(dateString, range.startDate) > 0 &&
      compareDateStrings(dateString, range.endDate) < 0
    ) {
      status = 'mid';
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

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View className="flex-1 gap-1.5">
      <Text className="text-xs font-semibold text-rove-stone">{label}</Text>
      <View className="flex-row items-center justify-between rounded-2xl border border-rove-charcoal/10 bg-white px-2 py-2">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(Math.max(min, value - 1));
          }}
          disabled={value <= min}
          className="h-9 w-9 items-center justify-center rounded-xl bg-rove-charcoal/5"
          style={{ opacity: value <= min ? 0.3 : 1 }}
        >
          <Minus size={16} color="#2D2420" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-rove-charcoal">{value}d</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(Math.min(max, value + 1));
          }}
          disabled={value >= max}
          className="h-9 w-9 items-center justify-center rounded-xl bg-rove-charcoal/5"
          style={{ opacity: value >= max ? 0.3 : 1 }}
        >
          <Plus size={16} color="#2D2420" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function StepHistory({
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
  const rangesLogged = periodHistory.filter((r) => r.endDate).length;
  const showManualInputs = rangesLogged < 2 || (autoStats && !autoStats.isIrregular);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const isCurrentOrFutureMonth = viewDate.getTime() >= currentMonthStart.getTime();

  let hintMessage = 'Tap the first day of your most recent period';
  let hintClasses = 'border-rove-charcoal/10 bg-white/40';
  let hintTextClass = 'text-rove-charcoal/70';
  if (isSelectingRangeEnd) {
    hintMessage = 'Now tap the last day of that period';
    hintClasses = 'border-phase-menstrual/20 bg-phase-menstrual/5';
    hintTextClass = 'text-phase-menstrual';
  } else if (rangesLogged === 1) {
    hintMessage = 'Range saved — add one more for better accuracy';
    hintClasses = 'border-phase-follicular/20 bg-phase-follicular/5';
    hintTextClass = 'text-phase-follicular';
  } else if (rangesLogged >= 2) {
    hintMessage = `${rangesLogged} ranges logged — cycle auto-calculated`;
    hintClasses = 'border-phase-follicular/20 bg-phase-follicular/5';
    hintTextClass = 'text-phase-follicular';
  }

  return (
    <View className="gap-5 px-1">
      <Animated.View entering={FadeInDown.delay(100).duration(400)} className="gap-2">
        <Text
          className="text-2xl text-rove-charcoal"
          style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
        >
          Period History
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          Mark your recent periods. Adding 2+ ranges gives the most accurate predictions.
        </Text>
      </Animated.View>

      <Animated.View
        key={hintMessage}
        entering={FadeIn.duration(250)}
        className={`rounded-2xl border px-4 py-2.5 ${hintClasses}`}
      >
        <Text className={`text-center text-sm font-medium ${hintTextClass}`}>{hintMessage}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="rounded-3xl border border-rove-charcoal/10 bg-white/60 p-4"
      >
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPreviousMonth();
            }}
            className="rounded-full p-2"
          >
            <ChevronLeft size={20} color="#78716C" />
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-rove-charcoal">{monthLabel(viewDate)}</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onNextMonth();
            }}
            disabled={isCurrentOrFutureMonth}
            className="rounded-full p-2"
            style={{ opacity: isCurrentOrFutureMonth ? 0.3 : 1 }}
          >
            <ChevronRight size={20} color="#78716C" />
          </TouchableOpacity>
        </View>

        <View className="mb-2 flex-row">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Text
              key={`${day}-${i}`}
              className="flex-1 text-center text-[11px] font-semibold uppercase text-rove-stone/60"
            >
              {day}
            </Text>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {grid.map((day) => {
            const dateString = formatLocalDate(day);
            const inCurrentMonth = day.getMonth() === activeMonth;
            const isFuture = compareDateStrings(dateString, today) > 0;
            const isToday = dateString === today;
            const status = getDayStatus(dateString, periodHistory);
            const disabled = isFuture || !inCurrentMonth;

            let cellClass = '';
            let textClass = inCurrentMonth ? 'text-rove-charcoal' : 'text-rove-stone/30';
            if (status === 'start') {
              cellClass = 'bg-phase-menstrual rounded-l-xl rounded-r-md';
              textClass = 'text-white font-semibold';
            } else if (status === 'end') {
              cellClass = 'bg-phase-menstrual rounded-r-xl rounded-l-md';
              textClass = 'text-white font-semibold';
            } else if (status === 'single') {
              cellClass = 'bg-phase-menstrual rounded-xl';
              textClass = 'text-white font-semibold';
            } else if (status === 'mid') {
              cellClass = 'bg-phase-menstrual/15 rounded-md';
              textClass = 'text-phase-menstrual font-medium';
            } else {
              cellClass = 'rounded-lg';
            }

            return (
              <View key={dateString} style={{ width: `${100 / 7}%` }} className="p-[1.5px]">
                <Pressable
                  disabled={disabled}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelectDay(dateString);
                  }}
                  className={`h-10 items-center justify-center ${cellClass}`}
                  style={{ opacity: disabled ? 0.3 : 1 }}
                >
                  <Text className={`text-sm ${textClass}`}>{day.getDate()}</Text>
                  {isToday && status === 'none' ? (
                    <View className="absolute bottom-1 h-1 w-1 rounded-full bg-rove-charcoal/40" />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>

        {canClearMonth ? (
          <View className="mt-3 items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClearMonth();
              }}
              className="flex-row items-center gap-1.5 rounded-full border border-rove-charcoal/10 px-3 py-1.5"
            >
              <RotateCcw size={12} color="#78716C" />
              <Text className="text-xs font-semibold text-rove-stone">Clear this month</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </Animated.View>

      {autoStats ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="rounded-2xl border border-phase-follicular/20 bg-phase-follicular/5 p-4"
        >
          <Text className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-phase-follicular">
            Auto-Calculated
          </Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-semibold text-rove-charcoal">{autoStats.avgCycle}</Text>
              <Text className="text-xs text-rove-stone">Cycle days</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-semibold text-rove-charcoal">{autoStats.avgBleed}</Text>
              <Text className="text-xs text-rove-stone">Period days</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-semibold text-rove-charcoal">
                {autoStats.isIrregular ? 'Irregular' : 'Regular'}
              </Text>
              <Text className="text-xs text-rove-stone">Pattern</Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {showManualInputs ? (
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="gap-3 rounded-2xl border border-rove-charcoal/10 bg-white/60 p-4"
        >
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
            Or set manually
          </Text>
          <View className="flex-row gap-3">
            <Stepper
              label="Cycle length"
              value={cycleLength}
              min={15}
              max={60}
              onChange={onCycleLengthChange}
            />
            <Stepper
              label="Period length"
              value={periodLength}
              min={1}
              max={15}
              onChange={onPeriodLengthChange}
            />
          </View>
        </Animated.View>
      ) : null}

      {error ? <Text className="text-center text-sm text-rove-red">{error}</Text> : null}
    </View>
  );
}
