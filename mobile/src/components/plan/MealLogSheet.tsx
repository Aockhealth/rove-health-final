import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '../ui/BottomSheet';
import { logMeal, estimateMealMacros } from '../../lib/nutrition';
import { giCategory, GI_CATEGORY_COLOR } from '@shared/content/glycemic-index';

export interface MealLogSheetProps {
  dateKey: string;
  onSaved: () => void;
}

const FIELD_KEYS: { key: 'calories' | 'protein' | 'carbs' | 'fat' | 'sugar'; unit: string }[] = [
  { key: 'calories', unit: 'kcal' },
  { key: 'protein', unit: 'g' },
  { key: 'carbs', unit: 'g' },
  { key: 'fat', unit: 'g' },
  { key: 'sugar', unit: 'g' },
];

const AUTO_ESTIMATE_DEBOUNCE_MS = 700;
const AUTO_ESTIMATE_MIN_CHARS = 3;

/**
 * Manual meal entry — no food database, just a name and macros. Macros
 * auto-estimate in the background as she types (debounced, no button tap
 * needed); she can still edit any field, which cancels the estimate's claim
 * on it. Pairs with the targets shown on MacroFuelGauge.
 */
export const MealLogSheet = forwardRef<BottomSheetModal, MealLogSheetProps>(({ dateKey, onSaved }, ref) => {
  const { t } = useTranslation();
  const FIELDS = FIELD_KEYS.map((f) => ({ ...f, label: t(`plan.mealLogSheet.fields.${f.key}`) }));
  const [name, setName] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [glycemicIndex, setGlycemicIndex] = useState<number | null>(null);

  // Guards the debounce: a stale response for text she's since changed or
  // cleared must not land in the fields.
  const requestedForRef = useRef<string | null>(null);

  const reset = () => {
    setName('');
    setValues({});
    setGlycemicIndex(null);
    requestedForRef.current = null;
  };

  const runEstimate = async (description: string) => {
    requestedForRef.current = description;
    setEstimating(true);
    const result = await estimateMealMacros(description);
    if (requestedForRef.current !== description) return; // superseded by newer input
    setEstimating(false);
    if (!result.success) {
      toast.error(t('plan.mealLogSheet.couldNotEstimate'), { description: t('plan.mealLogSheet.enterManually') });
      return;
    }
    setValues({
      calories: String(result.estimate.calories),
      protein: String(result.estimate.proteinG),
      carbs: String(result.estimate.carbsG),
      fat: String(result.estimate.fatG),
      sugar: String(result.estimate.sugarG),
    });
    setGlycemicIndex(result.estimate.glycemicIndex);
  };

  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length < AUTO_ESTIMATE_MIN_CHARS) {
      requestedForRef.current = null;
      return;
    }
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      runEstimate(trimmed);
    }, AUTO_ESTIMATE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const result = await logMeal({
      date: dateKey,
      name,
      calories: values.calories ? Number(values.calories) : null,
      proteinG: values.protein ? Number(values.protein) : null,
      carbsG: values.carbs ? Number(values.carbs) : null,
      fatG: values.fat ? Number(values.fat) : null,
      sugarG: values.sugar ? Number(values.sugar) : null,
      glycemicIndex,
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved();
      setTimeout(() => {
        setSaved(false);
        reset();
        if (ref && 'current' in ref && ref.current) ref.current.dismiss();
      }, 700);
    }
  };

  return (
    <BottomSheet ref={ref} title={t('plan.mealLogSheet.logAMeal')} snapPoints={['62%']}>
      <Text className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-rove-stone">
        {t('plan.mealLogSheet.whatDidYouEat')}
      </Text>
      <View className="mb-5 flex-row items-center rounded-xl bg-black/[0.03] px-4 py-3">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('plan.mealLogSheet.namePlaceholder')}
          placeholderTextColor="#A8A29E"
          className="flex-1 text-sm text-rove-charcoal"
        />
        {estimating ? <ActivityIndicator size="small" color="#A8A29E" /> : null}
      </View>

      <Text className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-rove-stone">
        {t('plan.mealLogSheet.macrosLabel')}
      </Text>
      <View className="mb-6 flex-row flex-wrap gap-2.5">
        {FIELDS.map((f) => (
          <View key={f.key} className="flex-1" style={{ minWidth: '45%' }}>
            <View className="flex-row items-center rounded-xl bg-black/[0.03] px-3 py-2.5">
              <TextInput
                value={values[f.key] ?? ''}
                onChangeText={(t) => {
                  setValues((prev) => ({ ...prev, [f.key]: t.replace(/[^0-9]/g, '') }));
                  setGlycemicIndex(null);
                }}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#A8A29E"
                className="flex-1 text-sm text-rove-charcoal"
              />
              <Text className="text-[10px] font-semibold text-rove-stone">{f.unit}</Text>
            </View>
            <Text className="mt-1 text-[10px] text-rove-stone">{f.label}</Text>
          </View>
        ))}
      </View>

      {glycemicIndex !== null ? (
        <View className="mb-5 flex-row items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2.5">
          <Text className="text-[10px] font-extrabold uppercase tracking-widest text-rove-stone">
            {t('plan.gi.title')}
          </Text>
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${GI_CATEGORY_COLOR[giCategory(glycemicIndex)]}20` }}
          >
            <Text className="text-[10px] font-bold" style={{ color: GI_CATEGORY_COLOR[giCategory(glycemicIndex)] }}>
              {glycemicIndex} · {t(`plan.gi.category.${giCategory(glycemicIndex).toLowerCase()}`)}
            </Text>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={handleSave}
        disabled={saving || !name.trim()}
        className="flex-row items-center justify-center gap-2 rounded-full py-3.5"
        style={{ backgroundColor: '#2D2420', opacity: saving || !name.trim() ? 0.5 : 1 }}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : saved ? (
          <>
            <Check size={16} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">{t('plan.mealLogSheet.logged')}</Text>
          </>
        ) : (
          <Text className="text-sm font-bold text-white">{t('plan.mealLogSheet.saveMeal')}</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
});

MealLogSheet.displayName = 'MealLogSheet';
