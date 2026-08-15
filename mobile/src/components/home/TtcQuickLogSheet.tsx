import React, { forwardRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import type { OpkResult } from '@shared/cycle/ttc';
import { BottomSheet } from '../ui/BottomSheet';
import { logTtcQuickEntry } from '../../lib/tracker';
import { TTC_OPK_LABEL } from '../../lib/ttcEngine';

const OPK_OPTIONS: OpkResult[] = ['negative', 'low', 'high', 'peak'];
const BBT_STEP = 0.1;
const MIN_BBT_C = 34;
const MAX_BBT_C = 40;
const DEFAULT_BBT_C = 36.5;

export interface TtcQuickLogSheetProps {
  dateKey: string;
  initialBbtCelsius: number | null;
  initialOpkResult: OpkResult | null;
  initialNsaidTaken: boolean;
  onSaved: () => void;
}

export const TtcQuickLogSheet = forwardRef<BottomSheetModal, TtcQuickLogSheetProps>(
  ({ dateKey, initialBbtCelsius, initialOpkResult, initialNsaidTaken, onSaved }, ref) => {
    const [opk, setOpk] = useState<OpkResult | null>(initialOpkResult);
    const [bbt, setBbt] = useState<number | null>(initialBbtCelsius);
    const [nsaid, setNsaid] = useState(initialNsaidTaken);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
        opkResult: opk,
        nsaidTaken: nsaid,
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
      <BottomSheet ref={ref} title="Log today" snapPoints={['55%']}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-rove-stone mb-2">LH strip</Text>
        <View className="flex-row gap-1.5 mb-5">
          {OPK_OPTIONS.map((level) => {
            const selected = opk === level;
            return (
              <Pressable
                key={level}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setOpk(selected ? null : level);
                }}
                className="flex-1 rounded-xl py-2.5 items-center"
                style={{ backgroundColor: selected ? '#C97B7B' : '#F7F5F1' }}
              >
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: selected ? '#FFFFFF' : '#2D2420' }}
                >
                  {TTC_OPK_LABEL[level]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-rove-stone mb-2">
          Waking temperature
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
            style={{ fontFamily: 'CormorantGaramond-Bold' }}
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
          <Text className="text-[13px] font-semibold text-rove-charcoal">On an NSAID / painkiller today?</Text>
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
              <Text className="text-white text-[13.5px] font-bold">Saved</Text>
            </>
          ) : (
            <Text className="text-white text-[13.5px] font-bold">Save entry</Text>
          )}
        </Pressable>
      </BottomSheet>
    );
  }
);

TtcQuickLogSheet.displayName = 'TtcQuickLogSheet';
