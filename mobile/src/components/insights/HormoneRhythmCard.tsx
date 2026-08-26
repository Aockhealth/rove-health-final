import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import type { RhythmPoint } from '../../lib/hormoneRhythm';
import { getLocalizedFontFamily } from '../../lib/fonts';

const LINE_COLOR = '#8878B8';
const AXIS_COLOR = 'rgba(138,131,120,0.18)';
const CHART_HEIGHT = 110;
const PADDING_X = 8;
const PADDING_Y = 14;
const MIN_POINTS_TO_RENDER = 4;

/** Contiguous runs of non-null points — a null (no signal that day) breaks
 * the line rather than interpolating across a day with no data. */
function toSegments(coords: { x: number; y: number; index: number | null }[]) {
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (const c of coords) {
    if (c.index === null) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push({ x: c.x, y: c.y });
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

function RhythmSvg({ points, width }: { points: RhythmPoint[]; width: number }) {
  const innerW = width - PADDING_X * 2;
  const innerH = CHART_HEIGHT - PADDING_Y * 2;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: PADDING_X + stepX * i,
    y: p.index === null ? 0 : PADDING_Y + innerH * (1 - p.index / 100),
    index: p.index,
  }));

  const midY = PADDING_Y + innerH * 0.5;
  const segments = toSegments(coords);

  return (
    <Svg width={width} height={CHART_HEIGHT}>
      <Line x1={PADDING_X} y1={midY} x2={width - PADDING_X} y2={midY} stroke={AXIS_COLOR} strokeWidth={1} strokeDasharray="3,3" />
      <Line
        x1={PADDING_X}
        y1={CHART_HEIGHT - PADDING_Y}
        x2={width - PADDING_X}
        y2={CHART_HEIGHT - PADDING_Y}
        stroke={AXIS_COLOR}
        strokeWidth={1}
      />
      {segments.map((seg, si) => (
        <Path
          key={si}
          d={seg.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')}
          stroke={LINE_COLOR}
          strokeWidth={2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {coords
        .filter((c) => c.index !== null)
        .map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={2.5} fill={LINE_COLOR} />
        ))}
    </Svg>
  );
}

function ChartWidthMeasure({ children }: { children: (width: number) => React.ReactNode }) {
  const [width, setWidth] = useState(0);
  return <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>{width > 0 ? children(width) : null}</View>;
}

/**
 * Cycle Sync mode's equivalent of the BBT/OPK chart TTC mode already has —
 * fuses skin temperature, resting heart rate, and HRV (all already synced
 * from Apple Health / Health Connect) into one composite index. Explicitly
 * NOT framed as an estrogen/progesterone measurement: wearables can't read
 * hormone levels, only physiological effects known to correlate with them.
 */
export function HormoneRhythmCard({ points, hasBaseline }: { points: RhythmPoint[]; hasBaseline: boolean }) {
  const { t, i18n } = useTranslation();
  const withData = points.filter((p) => p.index !== null);
  if (!hasBaseline || withData.length < MIN_POINTS_TO_RENDER) return null;

  const latest = [...withData].pop()!;
  const risingLatterHalf =
    withData.length >= 6 &&
    withData.slice(-3).reduce((s, p) => s + (p.index ?? 0), 0) / 3 >
      withData.slice(0, 3).reduce((s, p) => s + (p.index ?? 0), 0) / 3 + 10;

  return (
    <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
      <Text className="text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
        {t('insights.hormoneRhythm.title')}
      </Text>
      <Text className="mb-3.5 mt-0.5 text-[11.5px] leading-relaxed text-rove-stone">
        {t('insights.hormoneRhythm.subtitle')}
      </Text>

      <ChartWidthMeasure>{(width) => <RhythmSvg points={points} width={width} />}</ChartWidthMeasure>

      <View className="mt-1 flex-row justify-between">
        <Text className="text-[9px] font-semibold text-rove-stone">{t('insights.hormoneRhythm.cycleDay1')}</Text>
        <Text className="text-[9px] font-semibold text-rove-stone">{t('insights.hormoneRhythm.day', { count: points.length })}</Text>
      </View>

      {risingLatterHalf ? (
        <Text className="mt-3 text-[12px] leading-[18px] text-rove-charcoal">
          {t('insights.hormoneRhythm.risingNote')}
        </Text>
      ) : null}

      <Text className="mt-3 text-[10.5px] leading-[16px] text-rove-stone">
        {t('insights.hormoneRhythm.footer')}
      </Text>
    </View>
  );
}
