import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, Zap, Flame, Moon, Activity, ArrowRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type PhasePatternCardProps = {
  phase: string;
  /** Days this phase actually has a log this cycle-history window — decides whether there's enough to say anything. */
  loggedDaysThisPhase: number;
  /** mood label -> count, this phase only — see moodsByPhase in lib/insights.ts. */
  moodCounts: Record<string, number>;
  theme: any;
  onSeeFullBreakdown: () => void;
};

const MIN_LOGGED_DAYS_TO_SHOW_PATTERN = 3;
const MAX_CHART_ROWS = 4;

const PhaseIcon = ({
  Menstrual: Droplets,
  Follicular: Zap,
  Ovulatory: Flame,
  Luteal: Moon,
} as any);

function topEntries(counts: Record<string, number>, limit: number): [string, number][] {
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

/**
 * Horizontal bar chart of her most-logged moods this phase — plain flex
 * Views, not SVG: a filled track sized as a percentage of the row's own
 * width, same recipe NutritionTrackerCard's ProgressRow already uses on this
 * app, just without a fixed target to measure against.
 */
function MoodBarChart({
  entries,
  loggedDays,
  color,
}: {
  entries: [string, number][];
  loggedDays: number;
  color: string;
}) {
  const maxCount = Math.max(...entries.map(([, n]) => n), 1);

  return (
    <View className="gap-3">
      {entries.map(([label, count]) => {
        const barPct = Math.max((count / maxCount) * 100, 6);
        const dayPct = loggedDays > 0 ? Math.min(100, Math.round((count / loggedDays) * 100)) : 0;
        return (
          <View key={label}>
            <View className="mb-1 flex-row items-baseline justify-between">
              <Text className="text-[11px] font-semibold text-rove-charcoal/80">{label}</Text>
              <Text className="text-[10px] font-medium text-rove-charcoal/45">{dayPct}% of days</Text>
            </View>
            <View className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${barPct}%`, backgroundColor: color }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Replaces the old "Personalized AI Analysis" card (PhaseInsightCard), which
 * called an LLM with just a phase name and a mood tally — thin enough that
 * "personalized" oversold what it actually did, and the Health Report (see
 * HealthReportCard, same screen's Health tab) already covers real AI-written
 * analysis from her full history.
 *
 * Draws a bar chart of the moods she actually logs in this specific phase,
 * computed straight from her own data (moodsByPhase, already derived in
 * lib/insights.ts — no new query). Deliberately mood-only, not a smaller copy
 * of the Patterns tab: symptom breakdowns already have a whole tab to
 * themselves there (PatternAnalysisCard's doughnut + correlations), so
 * repeating them here in miniature would just be the same page twice. What
 * this card adds instead is a phase-scoped view — "this phase specifically,"
 * not the whole cycle — and a link into Patterns for everything else.
 */
export function PhasePatternCard({
  phase,
  loggedDaysThisPhase,
  moodCounts,
  theme,
  onSeeFullBreakdown,
}: PhasePatternCardProps) {
  const Icon = PhaseIcon[phase] || Activity;
  const topMoods = topEntries(moodCounts, MAX_CHART_ROWS);
  const hasEnoughData = loggedDaysThisPhase >= MIN_LOGGED_DAYS_TO_SHOW_PATTERN && topMoods.length > 0;

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
              Moods in your {phase.toLowerCase()} phase
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full flex items-center justify-center border border-white/40" style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: Platform.OS === 'ios' ? 2 : 0 }}>
            <Icon size={20} color={theme.color} />
          </View>
        </View>

        <View className="relative mt-2 p-5 rounded-[24px] border border-white/60 shadow-sm" style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}>
          {hasEnoughData ? (
            <Animated.View entering={FadeIn.duration(400)}>
              <MoodBarChart entries={topMoods} loggedDays={loggedDaysThisPhase} color={theme.color} />
            </Animated.View>
          ) : (
            <View className="min-h-[64px] justify-center">
              <Text className="text-sm leading-relaxed text-rove-stone">
                Log a mood a few more times in your {phase.toLowerCase()} phase and this card will start charting what actually shows up for you here — not a population average.
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={onSeeFullBreakdown}
          className="flex-row items-center self-start"
        >
          <Text className="text-xs font-bold uppercase tracking-widest mr-1.5" style={{ color: theme.textColor }}>
            See symptoms & patterns
          </Text>
          <ArrowRight size={13} color={theme.textColor} />
        </Pressable>
      </View>
    </View>
  );
}
