import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { getLocalizedFontFamily } from '../../lib/fonts';

export const ACCENT = '#C77D8F';

// Same soft wash the rest of the app lays under its BlurView (see
// theme.cardTint on the cycle-sync cards in plan/index.tsx) — without it the
// TTC cards read flatter/duller than every other card on this screen even
// though they use the same blur.
const ACCENT_TINT = `${ACCENT}12`;

/**
 * Shared card shell for the TTC Guide/Nourish/Move sections. Mirrors the
 * cycle-sync card recipe exactly (blur + tint wash + diagonal gloss + 28px
 * radius) so TTC mode's cards sit at the same visual weight as the rest of
 * the Plan tab instead of reading as a flatter, smaller-scale variant.
 */
export function Card({
  icon,
  title,
  kicker,
  badge,
  accentColor = ACCENT,
  children,
  delay = 0,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  /** Small label above the title — matches the "Your Biology" line above "Hormones Now" on the cycle-sync Science card. */
  kicker?: string;
  /** Right-aligned pill, e.g. a state name — matches the phase-name pill on the cycle-sync Science card header. */
  badge?: string;
  /** Overrides the header/tint color — lets state-driven cards (e.g. the Timing card) recolor per state instead of the fixed ACCENT. */
  accentColor?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const { i18n } = useTranslation();
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500)} className="mb-5">
      <View
        className="rounded-[28px] overflow-hidden relative border"
        style={{
          borderColor: 'rgba(255,255,255,0.5)',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: Platform.OS === 'ios' ? 4 : 0,
        }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
        )}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: `${accentColor}12` }]} />
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={StyleSheet.absoluteFillObject}
        />

        <LinearGradient
          colors={[`${accentColor}CC`, `${accentColor}80`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View className="flex-row items-center flex-1">
            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mr-3">
              <Feather name={icon} size={16} color="white" />
            </View>
            <View className="flex-1">
              {kicker ? (
                <Text className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{kicker}</Text>
              ) : null}
              <Text className="text-white text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                {title}
              </Text>
            </View>
          </View>
          {badge ? (
            <View className="px-3 py-1 rounded-full bg-white/20 ml-2">
              <Text className="text-white text-[9px] font-bold uppercase tracking-widest">{badge}</Text>
            </View>
          ) : null}
        </LinearGradient>

        <View className="p-6">{children}</View>
      </View>
    </Animated.View>
  );
}

export function Bullet({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2.5 mb-2.5">
      <View className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
      <Text className="flex-1 text-[13px] leading-[20px] text-rove-charcoal">{text}</Text>
    </View>
  );
}

export function Chip({ label }: { label: string }) {
  return (
    <View className="rounded-full px-3 py-1.5 mr-2 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
      <Text className="text-[11.5px] text-rove-charcoal">{label}</Text>
    </View>
  );
}

export function Label({ text }: { text: string }) {
  return (
    <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
      {text}
    </Text>
  );
}
