import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '@shared/cycle/phase';
import type { TtcHistoryCycle } from '../../lib/ttcCycleHistory';
import { getDateLocaleTag } from '../../lib/i18n';
import { getLocalizedFontFamily } from '../../lib/fonts';

/**
 * A per-cycle *summary* value trended across her recent cycles — not the raw
 * daily readings (see latestCycleChart's own comment on why splicing those
 * together across cycles would be misleading, since each cycle has its own
 * baseline/coverline). A peak value and a peak grade are each single numbers
 * per cycle, so they're safe to compare cycle to cycle the way a raw BBT
 * reading isn't.
 */
const MAX_TREND_POINTS = 6;

const BBT_LINE_COLOR = '#5C8A6E';
const LH_LINE_COLOR = '#C77D8F';
const AXIS_COLOR = 'rgba(138,131,120,0.18)';

const CHART_HEIGHT = 70;
const PADDING_X = 22;
const PADDING_Y = 14;

function monthAbbrev(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString(getDateLocaleTag(), { month: 'short' });
}

interface TrendPoint {
  cycleStart: string;
  value: number;
}

function MiniTrendLine({
  points,
  width,
  color,
  valueLabel,
  precision,
}: {
  points: TrendPoint[];
  width: number;
  color: string;
  valueLabel: (n: number) => string;
  precision: number;
}) {
  const { t } = useTranslation();
  const values = points.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  // A flat series (every cycle landed on the same value) still needs visible
  // room to draw a straight line in, not a divide-by-zero collapse.
  const span = rawMax - rawMin || Math.max(rawMax * 0.1, precision);
  const min = rawMin - span * 0.15;
  const max = rawMax + span * 0.15;

  const innerW = width - PADDING_X * 2;
  const innerH = CHART_HEIGHT - PADDING_Y * 2;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = PADDING_X + stepX * i;
    const t = (p.value - min) / (max - min);
    const y = PADDING_Y + innerH * (1 - t);
    return { x, y, point: p };
  });

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <View>
      <Svg width={width} height={CHART_HEIGHT}>
        <Line
          x1={PADDING_X}
          y1={CHART_HEIGHT - PADDING_Y}
          x2={width - PADDING_X}
          y2={CHART_HEIGHT - PADDING_Y}
          stroke={AXIS_COLOR}
          strokeWidth={1}
        />
        <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 3} fill={color} />
        ))}
      </Svg>
      <View className="flex-row justify-between px-0.5" style={{ marginLeft: PADDING_X - 8, marginRight: PADDING_X - 8 }}>
        {points.map((p, i) => (
          <Text key={i} className="text-[9px] font-semibold text-rove-stone">
            {monthAbbrev(p.cycleStart)}
          </Text>
        ))}
      </View>
      <Text className="mt-1 text-[10.5px] font-semibold text-rove-stone">
        {t('insights.cycleTrendChart.latest')} <Text style={{ color, fontWeight: '700' }}>{valueLabel(points[points.length - 1].value)}</Text>
      </Text>
    </View>
  );
}

export function TtcCycleTrendChart({ cycles }: { cycles: TtcHistoryCycle[] }) {
  const { t, i18n } = useTranslation();
  // Chronological, oldest first — the natural direction to read a trend —
  // and capped to the most recent MAX_TREND_POINTS so early history doesn't
  // compress the interesting recent part of the line.
  const chronological = [...cycles].reverse().slice(-MAX_TREND_POINTS);

  const bbtPoints: TrendPoint[] = chronological
    .filter((c): c is TtcHistoryCycle & { bbtPeak: number } => c.bbtPeak !== null)
    .map((c) => ({ cycleStart: c.cycleStart, value: c.bbtPeak }));

  const lhPoints: TrendPoint[] = chronological
    .filter((c): c is TtcHistoryCycle & { lhPeakGrade: number } => c.lhPeakGrade !== null)
    .map((c) => ({ cycleStart: c.cycleStart, value: c.lhPeakGrade }));

  if (bbtPoints.length < 2 && lhPoints.length < 2) return null;

  return (
    <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
      <Text className="text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
        {t('insights.cycleTrendChart.title')}
      </Text>
      <Text className="mb-3.5 mt-0.5 text-[11.5px] leading-relaxed text-rove-stone">
        {t('insights.cycleTrendChart.subtitle')}
      </Text>

      <View className="gap-4">
        {bbtPoints.length >= 2 ? (
          <View>
            <Text className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-rove-stone">
              {t('insights.cycleTrendChart.peakTemperature')}
            </Text>
            <TrendWidthMeasure>
              {(width) => (
                <MiniTrendLine
                  points={bbtPoints}
                  width={width}
                  color={BBT_LINE_COLOR}
                  precision={0.05}
                  valueLabel={(n) => `${n.toFixed(2)}°C`}
                />
              )}
            </TrendWidthMeasure>
          </View>
        ) : null}

        {lhPoints.length >= 2 ? (
          <View>
            <Text className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-rove-stone">
              {t('insights.cycleTrendChart.testStripPeakGrade')}
            </Text>
            <TrendWidthMeasure>
              {(width) => (
                <MiniTrendLine
                  points={lhPoints}
                  width={width}
                  color={LH_LINE_COLOR}
                  precision={1}
                  valueLabel={(n) => t('insights.cycleTrendChart.gradeValue', { n: Math.round(n) })}
                />
              )}
            </TrendWidthMeasure>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Measures the parent's available width once on layout, so the chart fills the card instead of guessing a fixed px width that's wrong on other screen sizes. */
function TrendWidthMeasure({ children }: { children: (width: number) => React.ReactNode }) {
  const [width, setWidth] = React.useState(0);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? children(width) : null}
    </View>
  );
}
