import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Scale, ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '@shared/cycle/phase';
import { fetchWeightHistory, fetchWeightGoalTarget, type WeightLogPoint } from '../../lib/weightLog';
import { getDateLocaleTag } from '../../lib/i18n';
import { getLocalizedFontFamily } from '../../lib/fonts';

/**
 * Replaces PhasePatternCard in Insights' Cycle tab. Before weight_logs
 * existed, the app kept exactly one weight number per user, overwritten on
 * every log — there was no history to draw a trend from, the single most
 * habit-forming screen in a Healthify-style app. This is that screen: a real
 * line chart from weight_logs.
 *
 * Logging itself is not done here — this card had an inline stepper at
 * first, but Plan's weight card is the one place that already keeps
 * current/target/pace consistent with each other, and duplicating "enter a
 * number, save" in a second place just for this card risked the two
 * disagreeing. Tapping through routes to Plan instead.
 */

const LINE_COLOR = '#8B7355';
const TARGET_COLOR = '#A8A29E';
const AXIS_COLOR = 'rgba(138,131,120,0.18)';

const CHART_HEIGHT = 120;
const PADDING_X = 14;
const PADDING_Y = 16;

function shortDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString(getDateLocaleTag(), { day: 'numeric', month: 'short' });
}

function WeightLine({
  points,
  width,
  targetWeightKg,
}: {
  points: WeightLogPoint[];
  width: number;
  targetWeightKg: number | null;
}) {
  const values = points.map((p) => p.weightKg);
  const rawMin = Math.min(...values, ...(targetWeightKg !== null ? [targetWeightKg] : []));
  const rawMax = Math.max(...values, ...(targetWeightKg !== null ? [targetWeightKg] : []));
  // A flat series (every reading landed on the same value) still needs
  // visible room to draw a line in, not a divide-by-zero collapse.
  const span = rawMax - rawMin || 1;
  const min = rawMin - span * 0.15;
  const max = rawMax + span * 0.15;

  const innerW = width - PADDING_X * 2;
  const innerH = CHART_HEIGHT - PADDING_Y * 2;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const x = (i: number) => PADDING_X + stepX * i;
  const y = (value: number) => PADDING_Y + innerH * (1 - (value - min) / (max - min));

  const coords = points.map((p, i) => ({ x: x(i), y: y(p.weightKg) }));
  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  // Circles on every point get cluttered past a couple of dozen readings —
  // keep just the endpoints legible and let the line carry the rest.
  const showAllDots = points.length <= 20;

  // Label only the first, middle and last date — one per point would overlap
  // once she's logged more than a handful of times.
  const labelIndices = new Set(
    points.length <= 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1]
  );

  return (
    <View>
      <Svg width={width} height={CHART_HEIGHT}>
        <Line x1={PADDING_X} y1={CHART_HEIGHT - PADDING_Y} x2={width - PADDING_X} y2={CHART_HEIGHT - PADDING_Y} stroke={AXIS_COLOR} strokeWidth={1} />
        {targetWeightKg !== null && (
          <Line
            x1={PADDING_X}
            y1={y(targetWeightKg)}
            x2={width - PADDING_X}
            y2={y(targetWeightKg)}
            stroke={TARGET_COLOR}
            strokeWidth={1.25}
            strokeDasharray="4 3"
          />
        )}
        <Path d={pathD} stroke={LINE_COLOR} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) =>
          showAllDots || i === 0 || i === coords.length - 1 ? (
            <Circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.6} fill={LINE_COLOR} />
          ) : null
        )}
      </Svg>
      <View className="flex-row justify-between px-0.5" style={{ marginLeft: PADDING_X - 8, marginRight: PADDING_X - 8 }}>
        {points.map((p, i) =>
          labelIndices.has(i) ? (
            <Text key={i} className="text-[9px] font-semibold text-rove-stone">
              {shortDate(p.date)}
            </Text>
          ) : null
        )}
      </View>
    </View>
  );
}

function ChartWidthMeasure({ children }: { children: (width: number) => React.ReactNode }) {
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width), []);
  return <View onLayout={onLayout}>{width > 0 ? children(width) : null}</View>;
}

export function WeightTrendCard({ theme }: { theme: any }) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [history, setHistory] = useState<WeightLogPoint[] | null>(null);
  const [targetWeightKg, setTargetWeightKg] = useState<number | null>(null);

  useEffect(() => {
    fetchWeightHistory(90).then(setHistory);
    fetchWeightGoalTarget().then(setTargetWeightKg);
  }, []);

  const goToPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(app)/plan' as any);
  };

  const hasEnoughData = !!history && history.length >= 2;
  const latest = history && history.length > 0 ? history[history.length - 1] : null;
  const first = history && history.length > 0 ? history[0] : null;
  const totalChange = latest && first ? latest.weightKg - first.weightKg : null;

  return (
    <Pressable onPress={goToPlan}>
      <View
        className="relative rounded-[32px] p-6 flex flex-col mb-4 overflow-hidden border border-white/60"
        style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.45)' : undefined, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 3 }}
      >
        {Platform.OS === 'ios' ? (
          <>
            <View className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30" style={{ backgroundColor: theme.color, transform: [{ scale: 1.5 }] }} />
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
          </>
        ) : (
          <LinearGradient colors={theme.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
        )}

        <View className="relative z-10 flex flex-col gap-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: theme.textColor }}>
                WEIGHT
              </Text>
              <Text className="text-2xl mt-1 text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}>
                {latest ? `${latest.weightKg.toFixed(1)} kg` : 'Your trend'}
              </Text>
              {totalChange !== null && (
                <Text className="text-[11px] font-semibold text-rove-charcoal/60 mt-0.5">
                  {totalChange === 0
                    ? 'Steady since your first log'
                    : `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg since ${shortDate(first!.date)}`}
                </Text>
              )}
            </View>
            <View className="w-12 h-12 rounded-full flex items-center justify-center border border-white/40" style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: Platform.OS === 'ios' ? 2 : 0 }}>
              <Scale size={20} color={theme.color} />
            </View>
          </View>

          <View className="relative mt-2 p-5 rounded-[24px] border border-white/60 shadow-sm" style={{ backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}>
            {hasEnoughData ? (
              <ChartWidthMeasure>
                {(width) => <WeightLine points={history!} width={width} targetWeightKg={targetWeightKg} />}
              </ChartWidthMeasure>
            ) : (
              <View className="min-h-[64px] justify-center">
                <Text className="text-sm leading-relaxed text-rove-stone">
                  {history === null
                    ? ' '
                    : history.length === 0
                      ? 'Log a weigh-in from Plan and this card starts drawing your trend — no history existed before this.'
                      : 'One more weigh-in and there\'s enough to draw a line.'}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center self-start">
            <Text className="text-xs font-bold uppercase tracking-widest mr-1.5" style={{ color: theme.textColor }}>
              Log in Plan
            </Text>
            <ArrowRight size={13} color={theme.textColor} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
