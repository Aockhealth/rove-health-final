import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Sun, Zap, Heart, Thermometer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { SymptomChip } from './SymptomChip';
import { getLocalizedTracking } from '../../lib/fonts';

export type JumpSection = 'daily' | 'fertility' | 'lifestyle' | 'intimacy';

interface Item {
  key: JumpSection;
  labelKey: string;
  color: string;
  Icon: typeof Sun;
}

const ITEMS: Item[] = [
  { key: 'daily', labelKey: 'daily', color: '#AF6B6B', Icon: Sun },
  { key: 'lifestyle', labelKey: 'lifestyle', color: '#4DB6AC', Icon: Zap },
  { key: 'intimacy', labelKey: 'intimacy', color: '#E8924E', Icon: Heart },
];

// Only in TTC mode — the fertility card is the one people come back to every
// morning, so it earns a jump target, but only when it exists.
const FERTILITY_ITEM: Item = { key: 'fertility', labelKey: 'fertility', color: '#C77D8F', Icon: Thermometer };

interface SectionJumpBarProps {
  onJump: (section: JumpSection) => void;
  accentColor?: string;
  showFertility?: boolean;
}

// Quick-access row — lets someone skip straight to Lifestyle or Intimacy
// (both tucked far down the page and collapsed by default) instead of
// scrolling past everything else, or jump back to the top of today's log.
// Built from the same SymptomChip already used everywhere else on this
// screen (Quick Phase Log, Body Signals, ...) rather than a bespoke chip
// style — a hand-rolled look-alike didn't actually match, and stacking it
// in its own extra card on top of the calendar/Follicular Patterns/etc.
// cards just added another box to an already box-heavy page. This is a
// plain labeled row, no card of its own.
export function SectionJumpBar({ onJump, accentColor = '#78716C', showFertility = false }: SectionJumpBarProps) {
  const { t, i18n } = useTranslation();
  const items = showFertility ? [ITEMS[0], FERTILITY_ITEM, ...ITEMS.slice(1)] : ITEMS;
  return (
    <View className="mb-6">
      <Text
        className="text-[11px] font-bold uppercase text-rove-stone mb-2 ml-1"
        style={{ letterSpacing: getLocalizedTracking(2, i18n.language) }}
      >
        {t('tracker.jumpBar.jumpTo')}
      </Text>
      <View
        className="flex-row rounded-[18px] p-1.5 relative overflow-hidden bg-white border border-white/60 shadow-sm"
        style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 0 }}
      >
        {items.map(({ key, labelKey, color, Icon }) => {
          return (
            <Pressable
              key={key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onJump(key);
              }}
              className="flex-1 flex-row items-center justify-center py-2.5 rounded-2xl z-10 active:bg-black/5"
            >
              <Icon size={13} color="#78716C" style={{ marginRight: 6 }} />
              <Text className="text-[11px] font-bold text-rove-stone">{t(`tracker.jumpBar.sections.${labelKey}`)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}


