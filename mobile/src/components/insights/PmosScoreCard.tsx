import React from 'react';
import { View, Text } from 'react-native';
import { Check, HelpCircle, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { PmosPatternScore } from '../../lib/pmosScore';
import { getLocalizedFontFamily } from '../../lib/fonts';

/**
 * Composite, strictly-educational PMOS-pattern score — combines cycle
 * irregularity, an anovulatory-signal read (when BBT data exists), and BMI
 * into one "X of N assessable indicators" count. Never a risk level, never a
 * diagnosis — see pmosScore.ts for why each indicator only counts when
 * there's actually enough data to judge it.
 */
export function PmosScoreCard({ score }: { score: PmosPatternScore }) {
  const { t, i18n } = useTranslation();
  if (score.assessableCount === 0) return null;

  return (
    <View className="mt-4 rounded-[22px] border border-black/[0.06] p-4">
      <Text className="mb-1 text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
        {t('insights.pmosScore.title')}
      </Text>
      <Text className="mb-3.5 text-[11.5px] leading-relaxed text-rove-stone">
        {t('insights.pmosScore.subtitle', {
          flagged: score.flaggedCount,
          total: score.assessableCount,
          indicatorWord:
            score.assessableCount === 1
              ? t('insights.pmosScore.indicatorSingular')
              : t('insights.pmosScore.indicatorPlural'),
        })}
      </Text>

      <View className="gap-3">
        {score.indicators.map((indicator) => (
          <View key={indicator.key} className="flex-row items-start gap-2.5">
            <View
              className="mt-0.5 h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: !indicator.assessable
                  ? 'rgba(138,131,120,0.12)'
                  : indicator.flagged
                    ? 'rgba(212,162,95,0.15)'
                    : 'rgba(141,170,157,0.15)',
              }}
            >
              {!indicator.assessable ? (
                <HelpCircle size={11} color="#8A8378" />
              ) : indicator.flagged ? (
                <Check size={11} color="#D4A25F" />
              ) : (
                <X size={11} color="#8DAA9D" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-bold leading-tight text-rove-charcoal">{indicator.label}</Text>
              <Text className="mt-0.5 text-[12px] leading-relaxed text-rove-charcoal/80">{indicator.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text className="mt-3.5 text-[11px] leading-relaxed text-rove-stone">
        {t('insights.pmosScore.footer')}
      </Text>
    </View>
  );
}
