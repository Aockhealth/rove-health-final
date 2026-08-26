import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, Zap, Flame, Moon, Activity, ArrowRight } from 'lucide-react-native';

type PhasePatternCardProps = {
  phase: string;
  /** Days this phase actually has a log this cycle-history window — decides whether there's enough to say anything. */
  loggedDaysThisPhase: number;
  /** { mood/symptom label -> count }, this phase only — see symptomsByPhase/moodsByPhase in lib/insights.ts. */
  topMood: [string, number] | null;
  topSymptom: [string, number] | null;
  theme: any;
  onSeeFullBreakdown: () => void;
};

const MIN_LOGGED_DAYS_TO_SHOW_PATTERN = 3;

const PhaseIcon = ({
  Menstrual: Droplets,
  Follicular: Zap,
  Ovulatory: Flame,
  Luteal: Moon,
} as any);

/**
 * Replaces the old "Personalized AI Analysis" card (PhaseInsightCard), which
 * called an LLM with just a phase name and mood tally — thin enough that
 * "personalized" oversold what it actually did, and the Health Report (see
 * HealthReportCard, same screen's Health tab) already covers real AI-written
 * analysis from her full history.
 *
 * This shows something an LLM call can't: the actual mood/symptom she logs
 * most often in this specific phase, computed straight from her own data,
 * with a link into the Patterns tab for the full breakdown (correlations,
 * per-phase symptom learning) rather than repeating it here.
 */
export function PhasePatternCard({
  phase,
  loggedDaysThisPhase,
  topMood,
  topSymptom,
  theme,
  onSeeFullBreakdown,
}: PhasePatternCardProps) {
  const Icon = PhaseIcon[phase] || Activity;
  const hasEnoughData = loggedDaysThisPhase >= MIN_LOGGED_DAYS_TO_SHOW_PATTERN && (topMood || topSymptom);

  return (
    <View
      className="relative rounded-[32px] p-6 flex flex-col mb-4 overflow-hidden border border-white/60"
      style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.45)' : undefined, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 3 }}
    >
      {Platform.OS === 'ios' ? (
        <>
          <View
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30"
            style={{ backgroundColor: theme.color, transform: [{ scale: 1.5 }] }}
          />
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
        </>
      ) : (
        <LinearGradient
          colors={theme.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View className="relative z-10 flex flex-col gap-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: theme.textColor }}>
              YOUR PATTERN
            </Text>
            <Text className="text-2xl mt-1 text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
              {phase}, in your own data
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full flex items-center justify-center border border-white/40" style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: Platform.OS === 'ios' ? 2 : 0 }}>
            <Icon size={20} color={theme.color} />
          </View>
        </View>

        <View className="relative mt-2 p-5 rounded-[24px] border border-white/60 shadow-sm" style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}>
          {hasEnoughData ? (
            <View className="pl-4 gap-3">
              {topMood && (
                <Text className="text-sm leading-relaxed text-rove-stone">
                  You log <Text className="font-bold text-rove-charcoal">{topMood[0]}</Text> most often in your {phase.toLowerCase()} phase — {topMood[1]} of your last {loggedDaysThisPhase} logged days here.
                </Text>
              )}
              {topSymptom && (
                <Text className="text-sm leading-relaxed text-rove-stone">
                  Your most common symptom this phase is <Text className="font-bold text-rove-charcoal">{topSymptom[0]}</Text>, logged {topSymptom[1]} time{topSymptom[1] === 1 ? '' : 's'}.
                </Text>
              )}
            </View>
          ) : (
            <View className="pl-4 min-h-[64px] justify-center">
              <Text className="text-sm leading-relaxed text-rove-stone">
                Log a mood or symptom a few more times in your {phase.toLowerCase()} phase and this card will start showing what actually shows up for you here — not a population average.
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={onSeeFullBreakdown}
          className="flex-row items-center self-start"
        >
          <Text className="text-xs font-bold uppercase tracking-widest mr-1.5" style={{ color: theme.textColor }}>
            See full breakdown
          </Text>
          <ArrowRight size={13} color={theme.textColor} />
        </Pressable>
      </View>
    </View>
  );
}
