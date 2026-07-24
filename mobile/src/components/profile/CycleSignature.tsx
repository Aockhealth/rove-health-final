import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Zap, Clock, Activity } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { phaseThemes } from '../../data/home-content';

export type ProfileTheme = {
  accentColor: string;
  badgeBg: string;
  badgeText: string;
};

interface CycleSignatureProps {
  cycleLength: number;
  periodLength: number;
  isIrregular: boolean;
  phaseName: string;
  theme: ProfileTheme;
}

// Reuses the app's single real phase palette (phaseThemes) instead of a
// second hand-typed color list — this dot row is a summary of the same
// phases shown everywhere else (Tracker, Home, Insights) and needs to match.
const PHASES = [
  { name: 'Menstrual', label: 'Men', color: phaseThemes.Menstrual.color },
  { name: 'Follicular', label: 'Fol', color: phaseThemes.Follicular.color },
  { name: 'Ovulatory', label: 'Ovu', color: phaseThemes.Ovulatory.color },
  { name: 'Luteal', label: 'Lut', color: phaseThemes.Luteal.color },
];

export function CycleSignature({
  cycleLength,
  periodLength,
  isIrregular,
  phaseName,
  theme,
}: CycleSignatureProps) {
  const signature = isIrregular
    ? { label: 'Adaptive Flow', Icon: Activity }
    : cycleLength < 26
      ? { label: 'Rapid Cycle', Icon: Zap }
      : cycleLength > 32
        ? { label: 'Extended Rhythm', Icon: Clock }
        : { label: 'Classic Rhythm', Icon: Activity };

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <View className="mb-8 flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2.5">
            <View className="rounded-xl border border-white bg-white/60 p-1.5">
              <signature.Icon size={20} color={theme.accentColor} />
            </View>
            <Text className="text-xl text-stone-800" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
              Cycle Signature
            </Text>
          </View>
          <Text className="mt-1.5 text-[13px] font-medium text-stone-500/80">
            Your unique biological pattern
          </Text>
        </View>
        <View
          className="rounded-full border px-3.5 py-1.5"
          style={{ borderColor: `${theme.accentColor}4D`, backgroundColor: theme.badgeBg }}
        >
          <Text
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: theme.badgeText }}
          >
            {signature.label}
          </Text>
        </View>
      </View>

      <View className="mb-8 h-24 justify-center overflow-hidden rounded-2xl border border-white/50 bg-stone-50/40 px-6">
        <View className="absolute inset-0 items-center justify-center opacity-30">
          <Svg viewBox="0 0 200 40" width="100%" height="100%" preserveAspectRatio="none">
            <Path
              d="M 0 20 C 50 -10, 150 50, 200 20"
              fill="none"
              stroke={theme.accentColor}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.5}
            />
            <Path
              d="M 0 20 C 50 50, 150 -10, 200 20"
              fill="none"
              stroke={theme.accentColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.3}
            />
          </Svg>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          {PHASES.map((phase) => {
            const isActive = phaseName.toLowerCase() === phase.name.toLowerCase();
            return (
              <View key={phase.name} className="items-center gap-2.5">
                <View
                  className="items-center justify-center"
                  style={{ transform: [{ scale: isActive ? 1.25 : 1 }] }}
                >
                  {isActive ? (
                    <View
                      className="absolute rounded-full border border-stone-300/50"
                      style={{ width: 24, height: 24, opacity: 0.6 }}
                    />
                  ) : null}
                  <View
                    className="h-3.5 w-3.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: phase.color, opacity: isActive ? 1 : 0.8 }}
                  />
                </View>
                <Text
                  className={`text-[10px] uppercase tracking-widest ${
                    isActive ? 'font-bold text-stone-800' : 'font-semibold text-stone-400'
                  }`}
                >
                  {phase.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 justify-center rounded-2xl border border-white/60 bg-white/50 p-4">
          <Text className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-500">
            Total Cycle
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-3xl text-stone-800" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
              {cycleLength}
            </Text>
            <Text className="text-sm font-medium text-stone-500">Days</Text>
          </View>
        </View>
        <View className="flex-1 justify-center rounded-2xl border border-white/60 bg-white/50 p-4">
          <Text className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-500">
            Bleed
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-3xl text-stone-800" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
              {periodLength}
            </Text>
            <Text className="text-sm font-medium text-stone-500">Days</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
