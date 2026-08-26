import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getLocalizedFontFamily } from '../../lib/fonts';

/**
 * Same card shell as LabResultsFeed/MedicationTracker (which this replaces
 * on the Clinical tab while they're locked), but with no fetching or input —
 * just the title and a "Coming soon" badge, so re-enabling later is a
 * one-line swap back to the real component.
 */
export function LockedComingSoonCard({ title }: { title: string }) {
  const { t, i18n } = useTranslation();
  return (
    <View className="mb-4 rounded-[22px] border border-black/[0.06] bg-white/60 p-4">
      <View className="flex-row items-center justify-between">
        <Text
          className="text-lg text-rove-charcoal/50"
          style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
        >
          {title}
        </Text>
        <View className="flex-row items-center gap-1 rounded-full bg-black/[0.05] px-3 py-1.5">
          <Feather name="lock" size={11} color="#A8A29E" />
          <Text className="text-[10px] font-bold uppercase tracking-wide text-rove-stone">
            {t('insights.comingSoon.badge')}
          </Text>
        </View>
      </View>
      <Text className="mt-2 text-[12px] text-rove-stone">{t('insights.comingSoon.body')}</Text>
    </View>
  );
}
