import React from 'react';
import { View, Text } from 'react-native';
import { daysBetween, parseLocalDate } from '@shared/cycle/phase';
import type { OvulationSignal } from '@shared/cycle/ttc';
import type { TtcStateKey } from '../../lib/ttcEngine';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Mark = 'Test' | 'Try' | 'Rest' | '—';

const MARK_STYLE: Record<Mark, { bg: string; color: string }> = {
  Test: { bg: '#F5E8E8', color: '#9C4F4F' },
  Try: { bg: '#F3E7D3', color: '#8B6A2E' },
  Rest: { bg: '#F2F0EC', color: '#6E6862' },
  '—': { bg: '#F7F5F1', color: 'rgba(45,36,32,0.35)' },
};

const CAPTIONS: Record<TtcStateKey, string> = {
  insufficient: '',
  predicted: 'Testing days come from the predicted window, which widens when confidence is low.',
  surge: 'Marked from your own surge, not from an average cycle.',
  likely_confirmed: 'The window has likely closed. Nothing this week needs timing.',
  confirmed: 'Confirmed closed. Nothing this week needs timing.',
  surge_unconfirmed: '',
  anovulatory: '',
};

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Marks a single day Test/Try/Rest/— from the real signal fields — never a fixed per-state template. */
function markFor(stateKey: TtcStateKey, dayKey: string, signal: OvulationSignal): Mark {
  if (stateKey === 'likely_confirmed' || stateKey === 'confirmed') return 'Rest';

  const { fertileWindowStart, fertileWindowEnd, opkPeakDate, predictedDate } = signal;
  if (fertileWindowStart && fertileWindowEnd && dayKey >= fertileWindowStart && dayKey <= fertileWindowEnd) {
    if (opkPeakDate) {
      const daysFromPeak = daysBetween(parseLocalDate(opkPeakDate), parseLocalDate(dayKey));
      return daysFromPeak >= 0 && daysFromPeak <= 1 ? 'Try' : 'Test';
    }
    if (predictedDate) {
      return dayKey <= predictedDate ? 'Test' : 'Try';
    }
    return 'Test';
  }
  return '—';
}

export function TtcWeekStrip({ stateKey, signal }: { stateKey: TtcStateKey; signal: OvulationSignal }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() + i * 86400000);
    const key = formatDateKey(d);
    return { key, dow: DOW[d.getDay()], day: d.getDate(), mark: markFor(stateKey, key, signal), isToday: i === 0 };
  });

  return (
    <View className="mt-4">
      <Text className="px-0.5 pb-2.5 text-[10px] font-extrabold uppercase tracking-wide text-rove-charcoal/70">
        This week
      </Text>
      <View className="flex-row gap-1.5">
        {days.map((d) => {
          const style = MARK_STYLE[d.mark];
          return (
            <View
              key={d.key}
              className="flex-1 items-center rounded-2xl py-2"
              style={{
                backgroundColor: style.bg,
                outlineColor: d.isToday ? 'rgba(45,36,32,0.35)' : undefined,
              }}
            >
              <Text className="text-[8.5px] font-extrabold uppercase tracking-wide opacity-60" style={{ color: style.color }}>
                {d.dow}
              </Text>
              <Text className="mt-0.5 text-[15px]" style={{ fontFamily: 'CormorantGaramond-Bold', color: style.color }}>
                {d.day}
              </Text>
              <Text className="mt-0.5 text-[8px] font-extrabold uppercase tracking-wide" style={{ color: style.color }}>
                {d.mark}
              </Text>
            </View>
          );
        })}
      </View>
      {CAPTIONS[stateKey] ? (
        <Text className="mt-2 px-0.5 text-[10.5px] font-semibold leading-relaxed text-rove-stone">{CAPTIONS[stateKey]}</Text>
      ) : null}
    </View>
  );
}
