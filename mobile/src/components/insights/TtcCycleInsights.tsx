import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { daysBetween, parseLocalDate } from '@shared/cycle/phase';
import type { TtcHistoryCycle, TtcCycleStats, TtcPattern } from '../../lib/ttcCycleHistory';
import { getTtcStateMeta } from '../../lib/ttcEngine';
import { prepareHealthReport, type PreparedReport } from '../../lib/healthReport';
import { HealthReportViewer } from './HealthReportViewer';

const HISTORY_LIMIT = 5;

function monthLabel(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'long' });
}

export function TtcCycleInsights({
  cycles,
  stats,
  patterns,
  theme,
}: {
  cycles: TtcHistoryCycle[];
  stats: TtcCycleStats;
  patterns: TtcPattern[];
  theme: { color: string };
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prepared, setPrepared] = useState<PreparedReport | null>(null);

  const handlePreview = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    const result = await prepareHealthReport();
    setIsGenerating(false);
    if (result.ok) {
      setPrepared(result.prepared);
    } else if (result.reason === 'no-data') {
      toast.error('Not enough data yet', { description: 'Log a few days first — the report needs something to summarise.' });
    } else {
      toast.error('Could not create the report', { description: 'Please try again in a moment.' });
    }
  };

  const statTiles = [
    { label: 'Cycles logged', value: String(stats.cyclesLogged), sub: `${stats.confirmedCount} confirmed` },
    {
      label: 'Cycle length',
      value: stats.cycleLengthAvg !== null ? `${stats.cycleLengthAvg}${stats.cycleLengthVariation !== null ? ` ± ${stats.cycleLengthVariation.toFixed(1)}` : ''}` : '—',
      sub: 'Days, across logged cycles',
    },
    {
      label: 'Ovulation day',
      value: stats.ovulationDayAvg !== null ? `~${stats.ovulationDayAvg}` : '—',
      sub: stats.ovulationDayAvg !== null ? 'Average, confirmed + predicted' : 'Not yet estimated',
    },
    {
      label: 'Luteal length',
      value: stats.lutealLengthAvg !== null ? String(stats.lutealLengthAvg) : '—',
      sub: 'Days, averaged',
    },
  ];

  const historyCycles = cycles.filter((c) => !c.isOngoing || cycles.length === 1).slice(0, HISTORY_LIMIT);

  return (
    <View className="mt-4">
      <Text className="mb-3 px-1 text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
        Across your cycles
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {statTiles.map((tile) => (
          <View key={tile.label} className="rounded-2xl border border-black/[0.06] p-3.5" style={{ width: '48%' }}>
            <Text className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wide text-rove-stone">{tile.label}</Text>
            <Text className="text-[22px] leading-none text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              {tile.value}
            </Text>
            <Text className="mt-1.5 text-[10.5px] font-semibold text-rove-stone">{tile.sub}</Text>
          </View>
        ))}
      </View>

      {historyCycles.length > 0 ? (
        <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
          <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            Cycle history
          </Text>
          <Text className="mb-3.5 mt-0.5 text-[11.5px] leading-relaxed text-rove-stone">
            Each bar is one cycle. The mark shows how that cycle's ovulation was established, if it was.
          </Text>
          <View className="gap-3">
            {historyCycles.map((cycle) => {
              const meta = getTtcStateMeta(cycle.signal);
              const length = cycle.cycleLengthDays;
              const fertileStart = cycle.signal.fertileWindowStart;
              const fertileEnd = cycle.signal.fertileWindowEnd;
              const ovDate = cycle.signal.confirmedDate || cycle.signal.predictedDate;

              let fertilePct: { left: number; width: number } | null = null;
              let ovPct: number | null = null;
              if (length && length > 0) {
                if (fertileStart && fertileEnd) {
                  const s = daysBetween(parseLocalDate(cycle.cycleStart), parseLocalDate(fertileStart));
                  const e = daysBetween(parseLocalDate(cycle.cycleStart), parseLocalDate(fertileEnd));
                  fertilePct = { left: (Math.max(s, 0) / length) * 100, width: (Math.max(e - s, 1) / length) * 100 };
                }
                if (ovDate) {
                  const d = daysBetween(parseLocalDate(cycle.cycleStart), parseLocalDate(ovDate));
                  ovPct = (Math.max(d, 0) / length) * 100;
                }
              }

              return (
                <View key={cycle.cycleStart}>
                  <View className="mb-1 flex-row items-baseline justify-between">
                    <Text className="text-[11.5px] font-bold text-rove-charcoal">{monthLabel(cycle.cycleStart)}</Text>
                    <Text className="text-[10.5px] font-bold" style={{ color: meta.colorText }}>
                      {cycle.isOngoing ? 'In progress' : meta.orbTitle}
                    </Text>
                  </View>
                  <View className="h-2.5 overflow-hidden rounded-full bg-black/[0.04]">
                    {fertilePct ? (
                      <View
                        className="absolute bottom-0 top-0 rounded-full"
                        style={{ left: `${fertilePct.left}%`, width: `${fertilePct.width}%`, backgroundColor: '#D4A25F', opacity: 0.35 }}
                      />
                    ) : null}
                    {ovPct !== null ? (
                      <View
                        className="absolute bottom-0 top-0 rounded-full"
                        style={{ left: `${ovPct}%`, width: 3, backgroundColor: meta.colorText }}
                      />
                    ) : null}
                  </View>
                  <Text className="mt-1 text-[10px] font-semibold text-rove-stone">{cycle.signal.explanation}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {patterns.length > 0 ? (
        <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
          <Text className="mb-3 text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            Patterns worth noticing
          </Text>
          <View className="gap-3.5">
            {patterns.map((p) => (
              <View key={p.title} className="flex-row items-start gap-2.5">
                <View className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ backgroundColor: '#7B82A8' }} />
                <View className="flex-1">
                  <Text className="text-[13px] font-bold leading-tight text-rove-charcoal">{p.title}</Text>
                  <Text className="mt-0.5 text-[12px] leading-relaxed text-rove-charcoal/80">{p.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              Doctor export
            </Text>
            <Text className="mt-1 text-xs leading-relaxed text-rove-stone">
              Your cycle lengths, ovulation evidence, and BBT/strip readings — on one page for your appointment.
            </Text>
          </View>
          <Pressable
            onPress={handlePreview}
            disabled={isGenerating}
            className="flex-row items-center gap-1.5 rounded-full px-4 py-2.5"
            style={{ backgroundColor: theme.color, opacity: isGenerating ? 0.6 : 1 }}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-[11.5px] font-bold text-white">Preview</Text>
            )}
          </Pressable>
        </View>
      </View>

      <Text className="mt-4 px-1 text-[11px] leading-relaxed text-rove-stone">
        A cycle showing an ovulatory signature is not proof an egg was released, and a cycle without one is not a
        diagnosis. This page describes what your signals did, nothing more.
      </Text>

      <HealthReportViewer prepared={prepared} accentColor={theme.color} onClose={() => setPrepared(null)} />
    </View>
  );
}
