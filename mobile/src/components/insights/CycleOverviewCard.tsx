import React from 'react';
import { View, Text, StyleSheet , Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type CycleOverviewCardProps = {
  cycleLength: number;
  periodLength: number;
  isRegular: boolean;
  nextPeriodDate?: string | null;
  phase?: string;
  theme: any;
  /** How many days the latest observed cycle differs from HER OWN prior
   * average (null until she has ≥2 prior cycles logged to average against —
   * never compared to a population number). */
  cycleDeltaFromBaseline?: number | null;
};

export function CycleOverviewCard({
  cycleLength,
  periodLength,
  isRegular,
  nextPeriodDate,
  phase = "Luteal",
  theme,
  cycleDeltaFromBaseline,
}: CycleOverviewCardProps) {
  // --- Prediction Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = nextPeriodDate ? new Date(nextPeriodDate) : null;
  if (target) target.setHours(0, 0, 0, 0);

  const diffTime = target ? target.getTime() - today.getTime() : null;
  const rawDays = diffTime !== null ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;
  const lateBy = rawDays !== null && rawDays < 0 ? Math.abs(rawDays) : null;
  const daysLeft = rawDays !== null && rawDays >= 0 ? rawDays : null;

  // Mirrors the Tracker's late-period copy: normalise a short delay, and only at a week
  // or more suggest a next step. Same threshold, same deliberately non-diagnostic tone.
  const lateMessage =
    lateBy !== null && lateBy >= 7
      ? 'A week or more is worth looking into. If pregnancy is possible, a test will tell you more — otherwise consider checking in with a doctor.'
      : 'A few days either way is common. Stress, illness, travel and poor sleep can all shift a cycle.';

  const likelyWindow = target && lateBy === null ? `${target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${new Date(
    target.getTime() + 4 * 86400000
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}` : "—";

  return (
    <View
      className="relative rounded-[32px] p-5 flex flex-col mb-4 overflow-hidden border border-white/60"
      style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.45)' : undefined, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 3 }}
    >
      {Platform.OS === 'ios' ? (
        <>
          {/* Blob */}
          <View
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-40"
            style={{ backgroundColor: theme.color, transform: [{ scale: 1.5 }] }}
          />
          {/* Blur overlay to soften the blob */}
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
        </>
      ) : (
        // Same opaque phase-gradient treatment already used for the pills below —
        // Android has no real blur, so the translucent iOS look just washes out.
        <LinearGradient
          colors={theme.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View className="relative z-10 flex flex-col gap-3">
        {/* Top: Next Period Focus */}
        <View className="flex flex-col items-center justify-center text-center p-5 rounded-[24px] border border-white/40" style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255,255,255,0.55)' }}>
          <View className="flex-row items-center justify-center gap-1.5 mb-2">
            <Feather name="calendar" size={12} color="#A8A29E" />
            <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-widest">
              Next Period
            </Text>
          </View>

          <View className="flex-row items-baseline justify-center gap-1.5 mb-2">
            <Text className="text-5xl tracking-tight" style={{ fontFamily: 'CormorantGaramond-SemiBold', color: theme.textColor }}>
              {lateBy !== null ? lateBy : (daysLeft !== null ? daysLeft : "—")}
            </Text>
            <Text className="text-sm font-bold text-rove-stone">
              {lateBy !== null ? 'days late' : 'days'}
            </Text>
          </View>

          {/* Window */}
          <LinearGradient
            colors={theme.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex flex-col items-center justify-center mt-3 mb-1 w-full px-4 py-3 rounded-full border border-white/60 shadow-sm"
            style={{ borderRadius: 999, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}
          >
            <Text className="text-[9px] font-bold text-rove-stone uppercase tracking-widest mb-1 opacity-80">
              {lateBy !== null ? 'What this means' : 'Likely Window'}
            </Text>
            <Text
              numberOfLines={lateBy !== null ? undefined : 1}
              adjustsFontSizeToFit={lateBy === null}
              className={lateBy !== null ? 'text-xs text-rove-charcoal text-center leading-5' : 'text-sm text-rove-charcoal tracking-wide'}
              style={lateBy !== null ? undefined : { fontFamily: 'CormorantGaramond-Bold' }}
            >
              {lateBy !== null ? lateMessage : likelyWindow}
            </Text>
          </LinearGradient>
        </View>

        {/* Bottom Grid: Stats */}
        <View className="flex-row justify-between gap-2 mt-1">
          <LinearGradient
            colors={theme.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 py-3 px-2 rounded-full border border-white/60 flex flex-col items-center text-center shadow-sm"
            style={{ borderRadius: 999, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}
          >
            <Text className="text-[9px] font-bold text-rove-stone uppercase tracking-wider mb-1">Cycle</Text>
            <View className="flex-row items-baseline">
              <Text className="text-xl text-rove-charcoal leading-none" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
                {cycleLength}
              </Text>
              <Text className="text-[10px] text-rove-stone ml-0.5 font-bold">d</Text>
            </View>
            {cycleDeltaFromBaseline != null && (
              <Text className="text-[9px] text-rove-stone font-medium mt-1 text-center">
                {cycleDeltaFromBaseline === 0
                  ? 'matches your avg'
                  : `${cycleDeltaFromBaseline > 0 ? '+' : ''}${cycleDeltaFromBaseline}d vs your avg`}
              </Text>
            )}
          </LinearGradient>

          <LinearGradient
            colors={theme.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 py-3 px-2 rounded-full border border-white/60 flex flex-col items-center text-center shadow-sm"
            style={{ borderRadius: 999, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}
          >
            <Text className="text-[9px] font-bold text-rove-stone uppercase tracking-wider mb-1">Flow</Text>
            <View className="flex-row items-baseline">
              <Text className="text-xl text-rove-charcoal leading-none" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
                {periodLength}
              </Text>
              <Text className="text-[10px] text-rove-stone ml-0.5 font-bold">d</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={theme.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 py-3 px-2 rounded-full border border-white/60 flex flex-col items-center text-center shadow-sm"
            style={{ borderRadius: 999, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}
          >
            <Text className="text-[9px] font-bold text-rove-stone uppercase tracking-wider mb-1">Rhythm</Text>
            <View className="flex-row items-center mt-1">
              <Feather name="repeat" size={12} color={theme.color} />
              <Text className="text-sm text-rove-charcoal leading-none ml-1" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
                {isRegular ? "Reg" : "Irreg"}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}
