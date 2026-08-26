import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '@shared/cycle/phase';
import { logTtcQuickEntry, fetchRecentMedicationLogs, type MedicationLogEntry } from '../../lib/tracker';
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

const COMMON_MEDS = ['Letrozole', 'Clomiphene'];

/**
 * A history of ovulation-induction medication days, with a quick way to log
 * today's — the third Clinical-tab section, alongside the report and lab
 * feed. Display/tracking only: not yet read by detectOvulation (see the
 * migration comment on daily_logs.fertility_medication) — that's a
 * validated-separately engine change, not a UI one.
 */
export function MedicationTracker({ theme }: { theme: { color: string } }) {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState<MedicationLogEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [medication, setMedication] = useState('');
  const [dose, setDose] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    fetchRecentMedicationLogs().then(setLogs);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSave = async () => {
    if (!medication.trim()) return;
    setSaving(true);
    const result = await logTtcQuickEntry({
      date: todayKey(),
      fertilityMedication: medication.trim(),
      fertilityMedicationDose: dose.trim() || null,
    });
    setSaving(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMedication('');
      setDose('');
      setAdding(false);
      reload();
    }
  };

  return (
    <View className="mb-4 rounded-[22px] border border-black/[0.06] bg-white/60 p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}>
          {t('insights.medicationTracker.title')}
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
          <Text className="text-[11px] font-bold text-white">{adding ? t('common.buttons.cancel') : t('insights.medicationTracker.logToday')}</Text>
        </Pressable>
      </View>

      {adding ? (
        <View className="mb-4 gap-3">
          <View className="flex-row flex-wrap gap-1.5">
            {COMMON_MEDS.map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMedication(m);
                }}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: medication === m ? theme.color : '#F7F5F1' }}
              >
                <Text className="text-[11px] font-bold" style={{ color: medication === m ? '#FFFFFF' : '#2D2420' }}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={medication}
            onChangeText={setMedication}
            placeholder={t('insights.medicationTracker.medicationNamePlaceholder')}
            placeholderTextColor="#A8A29E"
            className="rounded-xl bg-black/[0.03] px-4 py-2.5 text-sm text-rove-charcoal"
          />
          <TextInput
            value={dose}
            onChangeText={setDose}
            placeholder={t('insights.medicationTracker.dosePlaceholder')}
            placeholderTextColor="#A8A29E"
            className="rounded-xl bg-black/[0.03] px-4 py-2.5 text-sm text-rove-charcoal"
          />
          <Pressable
            onPress={handleSave}
            disabled={saving || !medication.trim()}
            className="items-center rounded-full py-3"
            style={{ backgroundColor: '#2D2420', opacity: saving || !medication.trim() ? 0.5 : 1 }}
          >
            <Text className="text-sm font-bold text-white">{t('common.buttons.save')}</Text>
          </Pressable>
        </View>
      ) : null}

      {logs.length === 0 ? (
        <Text className="text-[12px] text-rove-stone">{t('insights.medicationTracker.empty')}</Text>
      ) : (
        <View className="gap-2">
          {logs.map((l) => (
            <View key={l.date} className="flex-row items-center justify-between border-t border-black/[0.04] pt-2">
              <Text className="text-[12.5px] font-semibold text-rove-charcoal">{l.medication}</Text>
              <Text className="text-[11px] text-rove-stone">{l.dose ? `${l.dose} · ` : ''}{shortDate(l.date)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
