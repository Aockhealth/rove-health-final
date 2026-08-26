import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PcosPatternInsight } from '../../lib/ttcCycleHistory';
import { getLocalizedFontFamily } from '../../lib/fonts';

/**
 * Longitudinal view of the anovulatory patterns the engine has already
 * flagged cycle by cycle (see detectAnovulatoryPattern in shared/cycle/ttc.ts)
 * — how often each one actually recurred across her logged history, not just
 * whether it fired on the cycle she's looking at today (that transient note
 * already lives on TtcFertilityCard).
 *
 * Only rendered for users who've flagged PCOS in onboarding — see hasPcosFlag
 * and how `pcosPatterns` is populated in insights.ts.
 */
export function PcosPatternInsights({ insights }: { insights: PcosPatternInsight[] }) {
  const { t, i18n } = useTranslation();
  if (insights.length === 0) return null;

  return (
    <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
      <Text className="mb-1 text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
        {t('insights.pcosPatterns.title')}
      </Text>
      <Text className="mb-3.5 text-[11.5px] leading-relaxed text-rove-stone">
        {t('insights.pcosPatterns.subtitle')}
      </Text>
      <View className="gap-3.5">
        {insights.map((insight) => (
          <View key={insight.reason} className="flex-row items-start gap-2.5">
            <View className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ backgroundColor: '#AF6B6B' }} />
            <View className="flex-1">
              <Text className="text-[13px] font-bold leading-tight text-rove-charcoal">{insight.title}</Text>
              <Text className="mt-0.5 text-[12px] leading-relaxed text-rove-charcoal/80">{insight.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text className="mt-3.5 text-[11px] leading-relaxed text-rove-stone">
        {t('insights.pcosPatterns.footer')}
      </Text>
    </View>
  );
}
