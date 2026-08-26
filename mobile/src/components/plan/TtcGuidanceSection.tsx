import React from 'react';
import { View, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { TTC_GUIDANCE } from '@shared/content/ttc-guidance';
import type { OvulationSignal } from '@shared/cycle/ttc';
import { deriveTtcState, getTtcStateMetaByKey } from '../../lib/ttcEngine';
import { getLocalizedFontFamily } from '../../lib/fonts';
import { ACCENT } from './ttcCardKit';
import { TtcTimingCard } from './TtcTimingCard';
import { ActivitiesWidget } from './ActivitiesWidget';

export interface TtcGuidanceSectionProps {
  hasPcos: boolean;
  signal: OvulationSignal | null;
}

/**
 * Leads the TTC Guide tab. Same three-block shape as the cycle-sync Guide
 * tab (Focus banner → Science card → Activities checklist), just fed TTC
 * content instead of phase content:
 *  - the hero banner shows the fertility state's own headline and color
 *    instead of "today's phase focus", falling back to the static
 *    "Preparing for Pregnancy" framing before there's a signal to read;
 *  - TtcTimingCard is the Science-card equivalent (state timing + the
 *    clinical research points, always rendered);
 *  - the Ayurvedic daily-rhythm points become the Activities checklist,
 *    reusing the same checkable-list component and card recipe cycle-sync
 *    uses for phase rituals, namespaced to its own storage keys so a custom
 *    item added here can't leak into cycle-sync's list (see
 *    ActivitiesWidget's storageKeyPrefix).
 */
export function TtcGuidanceSection({ hasPcos, signal }: TtcGuidanceSectionProps) {
  const { t, i18n } = useTranslation();
  const g = TTC_GUIDANCE;
  const meta = signal ? getTtcStateMetaByKey(deriveTtcState(signal), t) : null;
  const heroColor = meta?.color || ACCENT;

  return (
    <View className="mb-2">
      {/* Hero — matches the cycle-sync "Current Focus" banner exactly (28px
          radius, same icon scale/shadow), colored by fertility state instead
          of cycle phase once there's a signal to read. */}
      <Animated.View entering={FadeInUp.duration(500)} className="mb-5 rounded-[28px]" style={{ shadowColor: heroColor, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: Platform.OS === 'ios' ? 6 : 0 }}>
        <LinearGradient
          colors={[`${heroColor}E6`, heroColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white/70 uppercase tracking-widest text-[10px] font-bold mb-2">
                {meta ? meta.timingKicker : g.heroSubtitle}
              </Text>
              <Text className="text-white text-[28px] leading-tight" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                {meta ? meta.timingTitle : g.heroTitle}
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full border border-white/20 items-center justify-center bg-white/10 ml-4">
              <Feather name="heart" size={20} color="rgba(255,255,255,0.85)" />
            </View>
          </View>
          <Text className="text-white/90 text-[12.5px] leading-[19px] mt-4">
            {meta ? meta.timingBody : g.intro}
          </Text>
        </LinearGradient>
      </Animated.View>

      <TtcTimingCard signal={signal} hasPcos={hasPcos} />

      <Animated.View entering={FadeInUp.delay(100).duration(500)} className="mb-8">
        <ActivitiesWidget
          practices={g.ayurvedic.points.map((p) => ({ title: p }))}
          themeColor={ACCENT}
          title={t('plan.guidanceSection.dailyRhythm')}
          storageKeyPrefix="_ttc"
        />
      </Animated.View>
    </View>
  );
}
