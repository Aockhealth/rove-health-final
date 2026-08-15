import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export const ACCENT = '#C77D8F';

/**
 * Shared card shell for the TTC Guide/Nourish/Move sections — blur+tint on
 * iOS, flat gradient on Android (see the note on TtcFertilityCard about why
 * this app never fakes a translucent look on Android with a plain opaque
 * fill: it's both inconsistent with every other card here and the actual
 * cause of a visible rendering seam).
 */
export function Card({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500)} className="mb-4">
      <View
        className="rounded-[24px] overflow-hidden relative border"
        style={{
          borderColor: 'rgba(255,255,255,0.5)',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: Platform.OS === 'ios' ? 3 : 0,
        }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFillObject} />
        ) : (
          <LinearGradient
            colors={['#FDF7F9', '#FAEBEF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <LinearGradient
          colors={[`${ACCENT}CC`, `${ACCENT}80`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' }}
        >
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
            <Feather name={icon} size={14} color="white" />
          </View>
          <Text className="text-white text-[16px]" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            {title}
          </Text>
        </LinearGradient>

        <View className="p-5">{children}</View>
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
