import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '@shared/cycle/phase';
import type { CycleAnomaly } from '@shared/cycle/anomaly';
import { getDateLocaleTag } from '../../lib/i18n';
import { getLocalizedFontFamily } from '../../lib/fonts';

function formatDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString(getDateLocaleTag(), { month: 'short', day: 'numeric' });
}

/**
 * Flags a cycle only when it deviates from HER OWN rolling mean/stdev (see
 * detectCycleAnomalies) — never a population number — and tries to explain
 * it from her own logged Disruptor tags rather than leaving a bare alarm.
 */
export function CycleAnomalyCard({ anomalies }: { anomalies: CycleAnomaly[] }) {
  const { t, i18n } = useTranslation();
  if (anomalies.length === 0) return null;

  return (
    <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
      <Text className="mb-1 text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
        {t('insights.cycleAnomaly.title')}
      </Text>
      <Text className="mb-3.5 text-[11.5px] leading-relaxed text-rove-stone">
        {t('insights.cycleAnomaly.subtitle')}
      </Text>
      <View className="gap-3.5">
        {anomalies.map((a) => (
          <View key={a.start} className="flex-row items-start gap-2.5">
            <View className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ backgroundColor: '#D4A25F' }} />
            <View className="flex-1">
              <Text className="text-[13px] font-bold leading-tight text-rove-charcoal">
                {t('insights.cycleAnomaly.itemTitle', { date: formatDate(a.start), count: a.length })}
              </Text>
              <Text className="mt-0.5 text-[12px] leading-relaxed text-rove-charcoal/80">
                {a.length > a.personalMean
                  ? t('insights.cycleAnomaly.longerBody', { diff: Math.abs(a.length - a.personalMean).toFixed(0), mean: a.personalMean })
                  : t('insights.cycleAnomaly.shorterBody', { diff: Math.abs(a.length - a.personalMean).toFixed(0), mean: a.personalMean })}
                {a.likelyExplanation
                  ? t('insights.cycleAnomaly.likelyExplanation', { tag: a.likelyExplanation })
                  : ''}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text className="mt-3.5 text-[11px] leading-relaxed text-rove-stone">
        {t('insights.cycleAnomaly.footer')}
      </Text>
    </View>
  );
}
