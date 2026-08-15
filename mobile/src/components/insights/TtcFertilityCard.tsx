import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { Thermometer } from 'lucide-react-native';
import { parseLocalDate } from '@shared/cycle/phase';
import type { BbtReading, OpkReading, OpkResult, OvulationSignal } from '@shared/cycle/ttc';

// Hand-rolled SVG, matching how every other chart in this app is drawn (see
// PhaseOrbRing, MacroFuelGauge) — there's no charting library here, and adding
// one for a single line chart isn't worth the bundle.
//
// The card shell follows the same iOS-blur / Android-gradient split every
// other Insights card uses (see HabitsOverviewCard, PhaseInsightCard) rather
// than faking a translucent-glass look with a flat near-opaque fill on
// Android — that mismatch was both visually inconsistent with its neighbors
// and the actual cause of a white seam showing where the SVG's transparent
// canvas sat against it.

const ACCENT = '#C77D8F';
const COVERLINE_COLOR = '#8A8378';
const CONFIRMED_COLOR = '#5C8A6E';
const AXIS_COLOR = 'rgba(138,131,120,0.18)';
const FERTILE_WINDOW_FILL = '#D4A25F';
const ANDROID_GRADIENT: [string, string] = ['#FAEBEF', '#FDF7F9'];

const CHART_HEIGHT = 150;
const PADDING_LEFT = 32;
const PADDING_RIGHT = 8;
const PADDING_TOP = 12;
const OPK_ROW_HEIGHT = 24;

// Enough vertical room that a real 0.3°C shift is visibly a step, not a
// rounding wobble — without this floor, a flat cycle's noise fills the chart
// and looks alarming.
const MIN_TEMP_SPAN_C = 0.6;

const OPK_COLORS: Record<OpkResult, string> = {
  negative: '#D6D1CB',
  low: '#E3C7CF',
  high: '#D9A0B0',
  peak: '#C0546F',
};

const METHOD_LABEL: Record<OvulationSignal['method'], string> = {
  combined: 'Temperature + test',
  bbt_only: 'Temperature',
  opk_only: 'Ovulation test',
  date_math: 'Cycle dates',
};

const CONFIDENCE_LABEL: Record<OvulationSignal['confidence'], string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

export interface TtcFertilityCardProps {
  bbt: BbtReading[];
  opk: OpkReading[];
  coverline: number | null;
  signal: OvulationSignal;
  cycleStart: string;
  /** Measured width available for the chart. */
  width: number;
}

export function TtcFertilityCard({
  bbt,
  opk,
  coverline,
  signal,
  cycleStart,
  width,
}: TtcFertilityCardProps) {
  const chartWidth = Math.max(width, 240);
  const plotWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - OPK_ROW_HEIGHT;
  const plotBottom = PADDING_TOP + plotHeight;

  const dayOf = (dateStr: string): number =>
    Math.round(
      (parseLocalDate(dateStr).getTime() - parseLocalDate(cycleStart).getTime()) / 86400000
    ) + 1;

  const lastDay = Math.max(
    ...bbt.map((r) => dayOf(r.date)),
    ...opk.map((r) => dayOf(r.date)),
    dayOf(todayString()),
    1
  );
  const spanDays = Math.max(lastDay - 1, 1);

  const temps = bbt.map((r) => r.value);
  const coverlineValues = coverline !== null ? [coverline] : [];
  const allValues = [...temps, ...coverlineValues];
  const rawMin = allValues.length ? Math.min(...allValues) : 36.0;
  const rawMax = allValues.length ? Math.max(...allValues) : 37.0;
  const midpoint = (rawMin + rawMax) / 2;
  const span = Math.max(rawMax - rawMin, MIN_TEMP_SPAN_C);
  const minTemp = midpoint - span / 2 - 0.05;
  const maxTemp = midpoint + span / 2 + 0.05;

  const xForDay = (day: number): number => PADDING_LEFT + ((day - 1) / spanDays) * plotWidth;
  const x = (dateStr: string): number => xForDay(dayOf(dateStr));
  const y = (value: number): number =>
    PADDING_TOP + ((maxTemp - value) / (maxTemp - minTemp)) * plotHeight;

  // Break the line wherever a day was missed, so an unlogged stretch isn't
  // drawn as if it were a measured trend between two real points.
  const segments: BbtReading[][] = [];
  bbt.forEach((r, i) => {
    const previous = bbt[i - 1];
    if (!previous || dayOf(r.date) - dayOf(previous.date) > 1) segments.push([r]);
    else segments[segments.length - 1].push(r);
  });

  const linePath = (segment: BbtReading[]): string =>
    segment.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(r.date)},${y(r.value)}`).join(' ');

  // A soft fill under each line segment is what separates a "chart" from a
  // plotted line — closes the path down to the plot floor and back.
  const areaPath = (segment: BbtReading[]): string => {
    const first = segment[0];
    const last = segment[segment.length - 1];
    return `${linePath(segment)} L${x(last.date)},${plotBottom} L${x(first.date)},${plotBottom} Z`;
  };

  const markerDate = signal.confirmedDate ?? signal.predictedDate;
  const markerDay = markerDate ? dayOf(markerDate) : null;
  const markerX = markerDay !== null && markerDay >= 1 && markerDay <= lastDay ? xForDay(markerDay) : null;
  const dpo = signal.confirmedDate ? dayOf(todayString()) - dayOf(signal.confirmedDate) : null;

  const fertileStartDay = signal.fertileWindowStart ? dayOf(signal.fertileWindowStart) : null;
  const fertileEndDay = signal.fertileWindowEnd ? dayOf(signal.fertileWindowEnd) : null;
  const fertileBand =
    fertileStartDay !== null &&
    fertileEndDay !== null &&
    fertileStartDay <= lastDay &&
    fertileEndDay >= 1
      ? { x1: xForDay(Math.max(fertileStartDay, 1)), x2: xForDay(Math.min(fertileEndDay, lastDay)) }
      : null;

  const hasChart = bbt.length > 0 || opk.length > 0;
  const dateRangeLabel = `${shortDate(cycleStart)} – ${shortDate(addDaysStr(cycleStart, lastDay - 1))}`;
  const loggingIsSparse = bbt.length < Math.ceil(lastDay / 2);

  return (
    <View
      className="relative mb-4 overflow-hidden rounded-[32px] border border-white/60 p-5"
      style={{
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.45)' : undefined,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: Platform.OS === 'ios' ? 4 : 3,
      }}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <LinearGradient
          colors={ANDROID_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View className="flex-row items-center gap-2">
        <Thermometer size={18} color={ACCENT} />
        <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
          Fertility Signals
        </Text>
      </View>

      {/* Status at a glance — pulled out of the chart into chips, matching
          the Home card, so the chart itself only has to show the trend. */}
      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        <View className="rounded-full bg-white/70 px-2.5 py-1">
          <Text className="text-[10px] font-semibold text-rove-stone">{METHOD_LABEL[signal.method]}</Text>
        </View>
        <View className="rounded-full bg-white/70 px-2.5 py-1">
          <Text className="text-[10px] font-semibold" style={{ color: ACCENT }}>
            {CONFIDENCE_LABEL[signal.confidence]}
          </Text>
        </View>
        {dpo !== null ? (
          <View className="rounded-full bg-white/70 px-2.5 py-1">
            <Text className="text-[10px] font-semibold" style={{ color: CONFIRMED_COLOR }}>
              {dpo === 0 ? 'Ovulation day' : `${dpo} DPO`}
            </Text>
          </View>
        ) : null}
      </View>

      {hasChart ? (
        <>
          <Svg
            width={chartWidth}
            height={CHART_HEIGHT}
            style={{ marginTop: 14 }}
          >
            {fertileBand ? (
              <Rect
                x={fertileBand.x1}
                y={PADDING_TOP}
                width={Math.max(fertileBand.x2 - fertileBand.x1, 1)}
                height={plotHeight}
                fill={FERTILE_WINDOW_FILL}
                fillOpacity={0.1}
              />
            ) : null}

            {/* Two gridlines — just enough to read the scale. */}
            {[maxTemp, minTemp].map((value) => (
              <Line
                key={value}
                x1={PADDING_LEFT}
                y1={y(value)}
                x2={chartWidth - PADDING_RIGHT}
                y2={y(value)}
                stroke={AXIS_COLOR}
                strokeWidth={0.5}
              />
            ))}

            {coverline !== null ? (
              <Line
                x1={PADDING_LEFT}
                y1={y(coverline)}
                x2={chartWidth - PADDING_RIGHT}
                y2={y(coverline)}
                stroke={COVERLINE_COLOR}
                strokeWidth={1.2}
                strokeDasharray="4 3"
              />
            ) : null}

            {markerX !== null ? (
              <Line
                x1={markerX}
                y1={PADDING_TOP}
                x2={markerX}
                y2={plotBottom}
                stroke={signal.confirmedDate ? CONFIRMED_COLOR : ACCENT}
                strokeWidth={1.5}
                strokeDasharray={signal.confirmedDate ? undefined : '3 3'}
              />
            ) : null}

            {segments.map((segment, i) => (
              <Path key={`area-${i}`} d={areaPath(segment)} fill={ACCENT} fillOpacity={0.12} />
            ))}
            {segments.map((segment, i) => (
              <Path
                key={`line-${i}`}
                d={linePath(segment)}
                stroke={ACCENT}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Each point gets a white halo so it reads clearly against the
                area fill instead of blending into the line. */}
            {bbt.map((r) => (
              <React.Fragment key={r.date}>
                <Circle cx={x(r.date)} cy={y(r.value)} r={4.5} fill="#FFFFFF" />
                <Circle cx={x(r.date)} cy={y(r.value)} r={3} fill={ACCENT} />
              </React.Fragment>
            ))}

            {opk.map((r) => (
              <Rect
                key={r.date}
                x={x(r.date) - 4}
                y={plotBottom + 7}
                width={8}
                height={9}
                rx={2}
                fill={OPK_COLORS[r.value]}
              />
            ))}
          </Svg>

          <Text className="mt-1 text-[10px] text-rove-stone">{dateRangeLabel}</Text>

          {/* One combined legend row instead of separate blocks — a
              coverline swatch alongside the four OPK grades. */}
          <View className="mt-2 flex-row flex-wrap items-center gap-x-3 gap-y-1.5">
            {coverline !== null ? (
              <View className="flex-row items-center gap-1.5">
                <View style={{ width: 10, height: 2, backgroundColor: COVERLINE_COLOR, borderRadius: 1 }} />
                <Text className="text-[10px] text-rove-stone">Coverline</Text>
              </View>
            ) : null}
            {(['negative', 'low', 'high', 'peak'] as OpkResult[]).map((value) => (
              <View key={value} className="flex-row items-center gap-1.5">
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: OPK_COLORS[value] }} />
                <Text className="text-[10px] capitalize text-rove-stone">{value}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text className="mt-3 text-[13px] leading-relaxed text-rove-stone">
          Log a morning temperature and an ovulation test in the Tracker and your chart will build
          here across the cycle.
        </Text>
      )}

      <Text className="mt-3 text-[13px] leading-relaxed text-rove-stone">
        {signal.explanation}
        {hasChart && loggingIsSparse ? ' Daily readings sharpen the coverline.' : ''}
      </Text>

      {signal.anovulatory?.detected ? (
        <View className="mt-3 rounded-2xl bg-white/60 p-3">
          <Text className="text-[11px] leading-relaxed text-rove-stone">
            Cycles vary, and one unusual cycle on its own is common. This isn’t a diagnosis.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function todayString(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function addDaysStr(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** "2026-08-15" -> "15 Aug" */
function shortDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
