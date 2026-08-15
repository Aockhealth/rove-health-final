import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { OvulationSignal } from '@shared/cycle/ttc';
import { deriveTtcState, TTC_STATE_META } from '../../lib/ttcEngine';
import { TtcWeekStrip } from './TtcWeekStrip';

/**
 * Leads the TTC Guide tab — the one card whose content is driven by her own
 * signal rather than static guidance. When the estimate is too diffuse to
 * time (no cycle history, a surge nothing confirmed, no ovulatory
 * signature), the week strip drops away for a "paused" note instead, since a
 * day-by-day plan would overstate what's actually known this cycle.
 */
export function TtcTimingCard({ signal }: { signal: OvulationSignal }) {
  const stateKey = deriveTtcState(signal);
  const meta = TTC_STATE_META[stateKey];

  return (
    <Animated.View entering={FadeInUp.duration(500)} className="mb-4">
      <View
        className="rounded-[24px] p-5"
        style={{ backgroundColor: meta.colorLight, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}
      >
        <Text className="mb-1.5 text-[9.5px] font-extrabold uppercase tracking-wide" style={{ color: meta.colorText }}>
          {meta.timingKicker}
        </Text>
        <Text className="text-[20px] leading-tight text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          {meta.timingTitle}
        </Text>
        <Text className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-rove-charcoal/85">{meta.timingBody}</Text>

        <View className="mt-3.5 gap-2">
          {meta.focus.map((f) => (
            <View key={f} className="flex-row items-start gap-2.5">
              <View className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ backgroundColor: meta.colorText }} />
              <Text className="flex-1 text-[12.5px] font-semibold leading-tight text-rove-charcoal">{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {meta.gated ? (
        <View className="mt-2.5 rounded-2xl border border-black/[0.06] p-3.5" style={{ backgroundColor: '#F7F5F1' }}>
          <Text className="mb-1 text-[9.5px] font-extrabold uppercase tracking-wide text-rove-stone">
            Timing guidance paused
          </Text>
          <Text className="text-xs font-medium leading-relaxed text-rove-charcoal">
            {meta.gateReason} Everything below is steady guidance — none of it depends on knowing the day.
          </Text>
        </View>
      ) : (
        <TtcWeekStrip stateKey={stateKey} signal={signal} />
      )}
    </Animated.View>
  );
}
