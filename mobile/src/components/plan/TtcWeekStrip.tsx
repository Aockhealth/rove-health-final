import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { daysBetween, parseLocalDate } from '@shared/cycle/phase';
import type { OvulationSignal } from '@shared/cycle/ttc';
import { getWeekStripDow, getWeekStripMarkLabel, getWeekStripCaption, type TtcStateKey } from '../../lib/ttcEngine';
import { getLocalizedFontFamily } from '../../lib/fonts';

type MarkKey = 'test' | 'try' | 'rest' | 'none';

const MARK_STYLE: Record<MarkKey, { bg: string; color: string }> = {
  test: { bg: '#F5E8E8', color: '#9C4F4F' },
  try: { bg: '#F3E7D3', color: '#8B6A2E' },
  rest: { bg: '#F2F0EC', color: '#6E6862' },
  none: { bg: '#F7F5F1', color: 'rgba(45,36,32,0.35)' },
};

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Marks a single day test/try/rest/none from the real signal fields — never a fixed per-state template. */
function markFor(stateKey: TtcStateKey, dayKey: string, signal: OvulationSignal): MarkKey {
  if (stateKey === 'likely_confirmed' || stateKey === 'confirmed') return 'rest';

  const { fertileWindowStart, fertileWindowEnd, opkPeakDate, predictedDate } = signal;
  if (fertileWindowStart && fertileWindowEnd && dayKey >= fertileWindowStart && dayKey <= fertileWindowEnd) {
    if (opkPeakDate) {
      const daysFromPeak = daysBetween(parseLocalDate(opkPeakDate), parseLocalDate(dayKey));
      return daysFromPeak >= 0 && daysFromPeak <= 1 ? 'try' : 'test';
    }
    if (predictedDate) {
      return dayKey <= predictedDate ? 'test' : 'try';
    }
    return 'test';
  }
  return 'none';
}

export function TtcWeekStrip({ stateKey, signal }: { stateKey: TtcStateKey; signal: OvulationSignal }) {
  const { t, i18n } = useTranslation();
  const dow = getWeekStripDow(t);
  const caption = getWeekStripCaption(stateKey, t);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() + i * 86400000);
    const key = formatDateKey(d);
    return { key, dow: dow[d.getDay()], day: d.getDate(), mark: markFor(stateKey, key, signal), isToday: i === 0 };
  });

  return (
    <View className="mt-4">
      <Text className="px-0.5 pb-2.5 text-[10px] font-extrabold uppercase tracking-wide text-rove-charcoal/70">
        {t('ttcEngine.weekStrip.thisWeek')}
      </Text>
      <View className="flex-row gap-1.5">
        {days.map((d) => {
          const style = MARK_STYLE[d.mark];
          return (
            <View
              key={d.key}
              className="flex-1 items-center rounded-2xl py-2.5"
              style={{
                backgroundColor: style.bg,
                borderWidth: d.isToday ? 1.5 : 1,
                borderColor: d.isToday ? 'rgba(45,36,32,0.35)' : 'rgba(255,255,255,0.6)',
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Text className="text-[8.5px] font-extrabold uppercase tracking-wide opacity-60" style={{ color: style.color }}>
                {d.dow}
              </Text>
              <Text className="mt-0.5 text-[15px]" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language), color: style.color }}>
                {d.day}
              </Text>
              <Text className="mt-0.5 text-[8px] font-extrabold uppercase tracking-wide" style={{ color: style.color }}>
                {getWeekStripMarkLabel(d.mark, t)}
              </Text>
            </View>
          );
        })}
      </View>
      {caption ? (
        <Text className="mt-2 px-0.5 text-[10.5px] font-semibold leading-relaxed text-rove-stone">{caption}</Text>
      ) : null}
    </View>
  );
}
