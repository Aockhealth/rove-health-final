import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TTC_GUIDANCE } from '@shared/content/ttc-guidance';
import type { OvulationSignal } from '@shared/cycle/ttc';
import { Card, Bullet, Label, ACCENT } from './ttcCardKit';
import { TtcTimingCard } from './TtcTimingCard';

export interface TtcGuidanceSectionProps {
  hasPcos: boolean;
  signal: OvulationSignal | null;
}

/**
 * Leads the TTC Guide tab, in place of the menstrual-phase content it
 * replaces there (see plan/index.tsx — the phase-focus banner, "Hormones
 * Now" science card, and phase-ritual self-care checklist are all hidden in
 * TTC mode, since none of them are about preparing for pregnancy). The
 * state-driven Timing card leads (when a signal is available), followed by
 * the hero framing and the two steady, non-cycle-specific cards — the
 * "Fertility Nutrition" card moved to the Nourish tab, alongside the rest of
 * what's about food.
 */
export function TtcGuidanceSection({ hasPcos, signal }: TtcGuidanceSectionProps) {
  const g = TTC_GUIDANCE;

  return (
    <View className="mb-2">
      {signal ? <TtcTimingCard signal={signal} /> : null}

      {/* Hero — sets the "preparing for pregnancy" framing before the two
          cards below, so this reads as its own journey, not a phase. */}
      <Animated.View entering={FadeInUp.duration(500)} className="mb-4 rounded-[24px] overflow-hidden">
        <LinearGradient
          colors={[`${ACCENT}E6`, ACCENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 24, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white/70 uppercase tracking-widest text-[10px] font-bold mb-2">{g.heroSubtitle}</Text>
              <Text className="text-white text-[26px] leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                {g.heroTitle}
              </Text>
            </View>
            <View className="w-11 h-11 rounded-full border border-white/20 items-center justify-center bg-white/10 ml-4">
              <Feather name="heart" size={18} color="rgba(255,255,255,0.85)" />
            </View>
          </View>
          <Text className="text-white/90 text-[12.5px] leading-[19px] mt-4">{g.intro}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Card 1 — Daily Rhythm: the Ayurvedic lifestyle guidance. */}
      <Card icon="sunrise" title="Daily Rhythm" delay={50}>
        <Label text={g.ayurvedic.title} />
        {g.ayurvedic.points.map((p) => (
          <Bullet key={p} text={p} />
        ))}
      </Card>

      {/* Card 2 — Evidence: the clinical research summary plus the PCOS note
          folded in, since both are "what's actually established", separate
          from the day-to-day habits above. */}
      <Card icon="book-open" title="What the Research Says" delay={100}>
        {g.clinical.points.map((p) => (
          <Bullet key={p} text={p} />
        ))}

        {hasPcos ? (
          <View className="mt-4 rounded-2xl bg-white/60 p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="info" size={13} color={ACCENT} />
              <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                With PCOS
              </Text>
            </View>
            <Text className="text-[12.5px] leading-[19px] text-rove-charcoal">{g.pcosNote}</Text>
          </View>
        ) : null}

        <Text className="mt-4 text-[11px] leading-[17px] text-rove-stone">{g.disclaimer}</Text>
      </Card>
    </View>
  );
}
