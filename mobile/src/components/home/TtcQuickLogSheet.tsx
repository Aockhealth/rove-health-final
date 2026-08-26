import React, { forwardRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LH_BAND_LEVELS } from '@shared/cycle/lh';
import { BottomSheet } from '../ui/BottomSheet';
import { logTtcQuickEntry } from '../../lib/tracker';
import { getLhBandLabels } from '../../lib/ttcEngine';
import { getLocalizedFontFamily } from '../../lib/fonts';

const BBT_STEP = 0.1;
const MIN_BBT_C = 34;
const MAX_BBT_C = 40;
const DEFAULT_BBT_C = 36.5;
const STRIPS_PER_KIT = 5;

export interface TtcQuickLogSheetProps {
  dateKey: string;
  /** Current cycle's start date — needed to compute cycle_day when saving an LH reading. */
  cycleStart: string | null;
  initialBbtCelsius: number | null;
  initialNsaidTaken: boolean;
  /** Today's LH band level, if already logged (0 to LH_BAND_LEVELS - 1). */
  initialLhBandLevel: number | null;
  /** How many strips she's already used this cycle — drives the "Strip N of 5" countdown. */
  stripsUsedThisCycle: number;
  onSaved: () => void;
}

export const TtcQuickLogSheet = forwardRef<BottomSheetModal, TtcQuickLogSheetProps>(
  (
    {
      dateKey,
      cycleStart,
      initialBbtCelsius,
      initialNsaidTaken,
      initialLhBandLevel,
      stripsUsedThisCycle,
      onSaved,
    },
    ref
  ) => {
    const { t, i18n } = useTranslation();
    const [lhBand, setLhBand] = useState<number | null>(initialLhBandLevel);
    const [bbt, setBbt] = useState<number | null>(initialBbtCelsius);
    const [nsaid, setNsaid] = useState(initialNsaidTaken);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const lhBandLabels = getLhBandLabels(t);

    // A reading already logged today counts as the strip she's on, not a new one.
    const currentStripNumber = Math.min(
      STRIPS_PER_KIT,
      initialLhBandLevel !== null ? Math.max(1, stripsUsedThisCycle) : stripsUsedThisCycle + 1
    );
    const stripsRemaining = Math.max(0, STRIPS_PER_KIT - currentStripNumber);

    const adjustBbt = (delta: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setBbt((prev) => {
        const base = prev ?? DEFAULT_BBT_C;
        const next = Math.round((base + delta) * 10) / 10;
        return Math.min(MAX_BBT_C, Math.max(MIN_BBT_C, next));
      });
    };

    const handleSave = async () => {
      setSaving(true);
      const result = await logTtcQuickEntry({
        date: dateKey,
        bbtCelsius: bbt,
        nsaidTaken: nsaid,
        lhBand:
          lhBand !== null
            ? { bandLevel: lhBand, kitStripNumber: currentStripNumber, cycleStart }
            : null,
      });
      setSaving(false);
      if (result.success) {
        setSaved(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSaved();
        setTimeout(() => {
          setSaved(false);
          if (ref && 'current' in ref && ref.current) ref.current.dismiss();
        }, 700);
      }
    };

    return (
      <BottomSheet ref={ref} title={t('home.quickLog.title')} snapPoints={['55%']}>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[10px] font-extrabold uppercase tracking-widest text-rove-stone">{t('home.quickLog.lhStrip')}</Text>
          {lhBand !== null && (
            <Text className="text-[10px] font-semibold text-rove-stone">
              {stripsRemaining > 0
                ? t('home.quickLog.stripOfKit', { current: currentStripNumber, total: STRIPS_PER_KIT })
                : t('home.quickLog.lastStrip')}
            </Text>
          )}
        </View>
        <View className="flex-row gap-1.5 mb-5">
          {Array.from({ length: LH_BAND_LEVELS }, (_, level) => level).map((level) => {
            const selected = lhBand === level;
            return (
              <Pressable
                key={level}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLhBand(selected ? null : level);
                }}
                className="flex-1 rounded-xl py-2.5 items-center"
                style={{ backgroundColor: selected ? '#C97B7B' : '#F7F5F1' }}
              >
                <Text
                  className="text-[10px] font-bold text-center"
                  style={{ color: selected ? '#FFFFFF' : '#2D2420' }}
                >
                  {lhBandLabels[level] ?? String(level)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-rove-stone mb-2">
          {t('home.quickLog.wakingTemperature')}
        </Text>
        <View className="flex-row items-center gap-4 mb-5">
          <Pressable
            onPress={() => adjustBbt(-BBT_STEP)}
            className="w-10 h-10 rounded-full bg-black/5 items-center justify-center"
          >
            <Text className="text-lg text-rove-charcoal">−</Text>
          </Pressable>
          <Text
            className="text-2xl text-rove-charcoal min-w-[92px] text-center"
            style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}
          >
            {(bbt ?? DEFAULT_BBT_C).toFixed(1)}°C
          </Text>
          <Pressable
            onPress={() => adjustBbt(BBT_STEP)}
            className="w-10 h-10 rounded-full bg-black/5 items-center justify-center"
          >
            <Text className="text-lg text-rove-charcoal">+</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setNsaid((v) => !v);
          }}
          className="flex-row items-center justify-between px-3.5 py-3 rounded-2xl mb-6"
          style={{ backgroundColor: '#F7F5F1' }}
        >
          <Text className="text-[13px] font-semibold text-rove-charcoal">{t('home.quickLog.nsaidToggle')}</Text>
          <View
            className="w-10 h-6 rounded-full p-0.5 justify-center"
            style={{ backgroundColor: nsaid ? '#5B9A8B' : 'rgba(0,0,0,0.15)' }}
          >
            <View
              className="w-5 h-5 rounded-full bg-white"
              style={{ transform: [{ translateX: nsaid ? 16 : 0 }] }}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="h-12 rounded-full items-center justify-center flex-row gap-2"
          style={{ backgroundColor: '#2D2420' }}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : saved ? (
            <>
              <Check size={15} color="#FFFFFF" />
              <Text className="text-white text-[13.5px] font-bold">{t('home.quickLog.saved')}</Text>
            </>
          ) : (
            <Text className="text-white text-[13.5px] font-bold">{t('home.quickLog.saveEntry')}</Text>
          )}
        </Pressable>
      </BottomSheet>
    );
  }
);

TtcQuickLogSheet.displayName = 'TtcQuickLogSheet';
