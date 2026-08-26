import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, RotateCcw, Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { compareDateStrings, formatLocalDate, monthLabel } from '@shared/onboarding/date';
import { Calendar } from 'react-native-calendars';
import type { PeriodRangeDraft, AutoStats } from '../../lib/onboarding-state';
import { getLocalizedFontFamily } from '../../lib/fonts';

type StepHistoryProps = {
  viewDate: Date;
  periodHistory: PeriodRangeDraft[];
  isSelectingRangeEnd: boolean;
  autoStats: AutoStats | null;
  cycleLength: number;
  periodLength: number;
  error?: string;
  onMonthChange: (dateString: string) => void;
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
  const { t } = useTranslation();
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
        <Text className="text-base font-semibold text-rove-charcoal">{t('onboarding.history.daysValue', { count: value })}</Text>
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
  onMonthChange,
  onSelectDay,
  onClearMonth,
  canClearMonth,
  onCycleLengthChange,
  onPeriodLengthChange,
}: StepHistoryProps) {
  const { t, i18n } = useTranslation();
  const today = formatLocalDate(new Date());
  const grid = getMonthGrid(viewDate);
  const activeMonth = viewDate.getMonth();
  const rangesLogged = periodHistory.filter((r) => r.endDate).length;
  const showManualInputs = rangesLogged < 2 || (autoStats && !autoStats.isIrregular);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const isCurrentOrFutureMonth = viewDate.getTime() >= currentMonthStart.getTime();

  let hintMessage = t('onboarding.history.hints.tapFirstDay');
  let hintClasses = 'border-rove-charcoal/10 bg-white/40';
  let hintTextClass = 'text-rove-charcoal/70';
  if (isSelectingRangeEnd) {
    hintMessage = t('onboarding.history.hints.tapLastDay');
    hintClasses = 'border-phase-menstrual/20 bg-phase-menstrual/5';
    hintTextClass = 'text-phase-menstrual';
  } else if (rangesLogged === 1) {
    hintMessage = t('onboarding.history.hints.rangeSaved');
    hintClasses = 'border-phase-follicular/20 bg-phase-follicular/5';
    hintTextClass = 'text-phase-follicular';
  } else if (rangesLogged >= 2) {
    hintMessage = t('onboarding.history.hints.rangesLogged', { count: rangesLogged });
    hintClasses = 'border-phase-follicular/20 bg-phase-follicular/5';
    hintTextClass = 'text-phase-follicular';
  }

  return (
    <View className="gap-5 px-1">
      <Animated.View entering={FadeInDown.delay(100).duration(400)} className="gap-2">
        <Text
          className="text-2xl text-rove-charcoal"
          style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
        >
          {t('onboarding.history.title')}
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          {t('onboarding.history.subtitle')}
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
        <View className="mb-2">
          <Calendar
            current={formatLocalDate(viewDate)}
            onDayPress={(day: any) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectDay(day.dateString);
            }}
            onMonthChange={(month: any) => {
              onMonthChange(month.dateString);
            }}
            maxDate={today}
            markingType="period"
            markedDates={(() => {
              const dates: any = {};
              periodHistory.forEach((range) => {
                if (!range.endDate || range.startDate === range.endDate) {
                  dates[range.startDate] = { startingDay: true, endingDay: true, color: '#AF6B6B', textColor: 'white' };
                } else {
                  let currDate = new Date(range.startDate);
                  const end = new Date(range.endDate);
                  while (currDate <= end) {
                    const dateStr = formatLocalDate(currDate);
                    const isStart = dateStr === range.startDate;
                    const isEnd = dateStr === range.endDate;
                    dates[dateStr] = {
                      startingDay: isStart,
                      endingDay: isEnd,
                      color: isStart || isEnd ? '#AF6B6B' : '#E4C3C3',
                      textColor: isStart || isEnd ? 'white' : '#AF6B6B',
                    };
                    currDate.setDate(currDate.getDate() + 1);
                  }
                }
              });
              return dates;
            })()}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: '#A8A29E',
              selectedDayBackgroundColor: '#AF6B6B',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#2D2420',
              dayTextColor: '#2D2420',
              textDisabledColor: '#D6D3D1',
              arrowColor: '#78716C',
              monthTextColor: '#2D2420',
              textMonthFontFamily: 'CormorantGaramond-SemiBold',
              textDayFontFamily: 'Raleway-Medium',
              textDayHeaderFontFamily: 'Raleway-SemiBold',
            }}
          />
        </View>

        {canClearMonth ? (
          <View className="mt-1 items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClearMonth();
              }}
              className="flex-row items-center gap-1.5 rounded-full border border-rove-charcoal/10 px-3 py-1.5"
            >
              <RotateCcw size={12} color="#78716C" />
              <Text className="text-xs font-semibold text-rove-stone">{t('onboarding.history.clearMonth')}</Text>
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
            {t('onboarding.history.autoCalculated')}
          </Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-semibold text-rove-charcoal">{autoStats.avgCycle}</Text>
              <Text className="text-xs text-rove-stone">{t('onboarding.history.cycleDays')}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-semibold text-rove-charcoal">{autoStats.avgBleed}</Text>
              <Text className="text-xs text-rove-stone">{t('onboarding.history.periodDays')}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-semibold text-rove-charcoal">
                {autoStats.isIrregular ? t('onboarding.history.irregular') : t('onboarding.history.regular')}
              </Text>
              <Text className="text-xs text-rove-stone">{t('onboarding.history.pattern')}</Text>
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
            {t('onboarding.history.orSetManually')}
          </Text>
          <View className="flex-row gap-3">
            <Stepper
              label={t('onboarding.history.cycleLength')}
              value={cycleLength}
              min={15}
              max={60}
              onChange={onCycleLengthChange}
            />
            <Stepper
              label={t('onboarding.history.periodLength')}
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
