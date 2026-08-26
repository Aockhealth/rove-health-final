import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '@shared/cycle/phase';
import {
  fetchLabResults,
  logLabResult,
  deleteLabResult,
  COMMON_LAB_TESTS,
  type LabResult,
} from '../../lib/labResults';
import { getDateLocaleTag } from '../../lib/i18n';
import { getLocalizedFontFamily } from '../../lib/fonts';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shortDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString(getDateLocaleTag(), { day: 'numeric', month: 'short' });
}

/**
 * A feed of manually logged lab values (testosterone, AMH, TSH, prolactin,
 * LH:FSH ratio) — one Clinical-tab section, alongside the doctor-export
 * report and the medication tracker. Informational only; never read by the
 * ovulation engine.
 */
export function LabResultsFeed({ theme }: { theme: { color: string } }) {
  const { t, i18n } = useTranslation();
  const [results, setResults] = useState<LabResult[]>([]);
  const [adding, setAdding] = useState(false);
  const [testName, setTestName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');

  const reload = useCallback(() => {
    fetchLabResults().then(setResults);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handlePick = (name: string, defaultUnit: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTestName(name);
    setUnit(defaultUnit);
  };

  const handleSave = async () => {
    if (!testName.trim()) return;
    const result = await logLabResult({
      date: todayKey(),
      testName,
      value: value ? Number(value) : null,
      unit: unit || null,
    });
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTestName('');
      setValue('');
      setUnit('');
      setAdding(false);
      reload();
    }
  };

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResults((prev) => prev.filter((r) => r.id !== id));
    await deleteLabResult(id);
  };

  return (
    <View className="mb-4 rounded-[22px] border border-black/[0.06] bg-white/60 p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}>
          {t('insights.labResults.title')}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAdding((v) => !v);
          }}
          className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
          style={{ backgroundColor: theme.color }}
        >
          {adding ? <X size={13} color="#FFFFFF" /> : <Plus size={13} color="#FFFFFF" />}
          <Text className="text-[11px] font-bold text-white">{adding ? t('common.buttons.cancel') : t('insights.labResults.addResult')}</Text>
        </Pressable>
      </View>

      {adding ? (
        <View className="mb-4 gap-3">
          <View className="flex-row flex-wrap gap-1.5">
            {COMMON_LAB_TESTS.map((test) => (
              <Pressable
                key={test.name}
                onPress={() => handlePick(test.name, test.unit)}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: testName === test.name ? theme.color : '#F7F5F1' }}
              >
                <Text className="text-[11px] font-bold" style={{ color: testName === test.name ? '#FFFFFF' : '#2D2420' }}>
                  {test.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={testName}
            onChangeText={setTestName}
            placeholder={t('insights.labResults.testNamePlaceholder')}
            placeholderTextColor="#A8A29E"
            className="rounded-xl bg-black/[0.03] px-4 py-2.5 text-sm text-rove-charcoal"
          />
          <View className="flex-row gap-2.5">
            <TextInput
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              placeholder={t('insights.labResults.valuePlaceholder')}
              placeholderTextColor="#A8A29E"
              className="flex-1 rounded-xl bg-black/[0.03] px-4 py-2.5 text-sm text-rove-charcoal"
            />
            <TextInput
              value={unit}
              onChangeText={setUnit}
              placeholder={t('insights.labResults.unitPlaceholder')}
              placeholderTextColor="#A8A29E"
              className="w-24 rounded-xl bg-black/[0.03] px-4 py-2.5 text-sm text-rove-charcoal"
            />
          </View>
          <Pressable
            onPress={handleSave}
            disabled={!testName.trim()}
            className="items-center rounded-full py-3"
            style={{ backgroundColor: '#2D2420', opacity: testName.trim() ? 1 : 0.5 }}
          >
            <Text className="text-sm font-bold text-white">{t('common.buttons.save')}</Text>
          </Pressable>
        </View>
      ) : null}

      {results.length === 0 ? (
        <Text className="text-[12px] text-rove-stone">{t('insights.labResults.empty')}</Text>
      ) : (
        <View className="gap-2">
          {results.map((r) => (
            <View key={r.id} className="flex-row items-center justify-between border-t border-black/[0.04] pt-2">
              <View className="flex-1">
                <Text className="text-[12.5px] font-semibold text-rove-charcoal">{r.testName}</Text>
                <Text className="text-[10.5px] text-rove-stone">{shortDate(r.date)}</Text>
              </View>
              {r.value !== null ? (
                <Text className="mr-2 text-[12.5px] text-rove-stone">
                  {r.value}
                  {r.unit ? ` ${r.unit}` : ''}
                </Text>
              ) : null}
              <Pressable onPress={() => handleDelete(r.id)} hitSlop={8}>
                <X size={13} color="#A8A29E" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
