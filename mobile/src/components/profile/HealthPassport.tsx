import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Scale, Ruler, HeartPulse, X, Plus } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Select } from '../ui/Select';
import { getLocalizedFontFamily } from '../../lib/fonts';
import type { ProfileFormData } from '../../lib/profile';
import type { ProfileTheme } from './CycleSignature';

interface HealthPassportProps {
  formData: ProfileFormData;
  setFormData: (data: ProfileFormData) => void;
  onSave: () => void;
  /**
   * Persists a new conditions list immediately, the same way goal chips
   * autosave (see saveProfileFields in profile.tsx) — condition chips used
   * to only update local state and wait for the separate "Save Passport
   * Data" button, which read as "nothing happened" when she tapped PMOS and
   * checked Insights without also pressing that button. Takes the array
   * directly rather than reading it back off `formData` to avoid saving a
   * stale value from before the state update commits.
   */
  onConditionsChange: (conditions: string[]) => void;
  isPending: boolean;
  theme: ProfileTheme;
}

// `value` is what's persisted to formData/the backend (and what hasPcosFlag
// string-matches against) — only `label` is localized for display, via
// `profile.healthPassport.activityOptions.<value>`.
const ACTIVITY_OPTIONS = [
  { value: 'sedentary', labelKey: 'sedentary' },
  { value: 'moderate', labelKey: 'moderate' },
  { value: 'active', labelKey: 'active' },
  { value: 'athlete', labelKey: 'athlete' },
];

const DIET_OPTIONS = [
  { value: 'vegetarian', labelKey: 'vegetarian' },
  { value: 'non_veg', labelKey: 'nonVeg' },
  { value: 'vegan', labelKey: 'vegan' },
  { value: 'jain', labelKey: 'jain' },
];

/**
 * Structured picks for the reproductive/endocrine conditions this app
 * actually gates content on or asks about elsewhere (PMOS content, thyroid
 * differential in "PMOS or Thyroid", etc.) — free text alone meant every
 * feature checking `conditions` had to fuzzy-match arbitrary strings (see
 * hasPcosFlag). "Other" still opens free text for anything not listed here,
 * so nothing she has is left unrepresented.
 *
 * `value` is the exact string persisted to formData.conditions and matched
 * by hasPcosFlag — it stays in English regardless of app language so saved
 * data and cross-file matching stay stable. `labelKey` looks up the
 * localized display text via `profile.healthPassport.conditions.<labelKey>`.
 */
const COMMON_CONDITIONS = [
  { value: 'PMOS', labelKey: 'pmos' },
  { value: 'Endometriosis', labelKey: 'endometriosis' },
  { value: 'Uterine Fibroids', labelKey: 'uterineFibroids' },
  { value: 'Adenomyosis', labelKey: 'adenomyosis' },
  { value: 'Thyroid Disorder', labelKey: 'thyroidDisorder' },
  { value: 'Premature Ovarian Insufficiency', labelKey: 'prematureOvarianInsufficiency' },
  { value: 'Diminished Ovarian Reserve', labelKey: 'diminishedOvarianReserve' },
  { value: 'Recurrent Pregnancy Loss', labelKey: 'recurrentPregnancyLoss' },
  { value: 'Pelvic Inflammatory Disease', labelKey: 'pelvicInflammatoryDisease' },
];

// Not a real condition value — picking it in the dropdown opens the free-text
// input instead of appending to formData.conditions.
const OTHER_CONDITION_SENTINEL = '__other__';

export function HealthPassport({
  formData,
  setFormData,
  onSave,
  onConditionsChange,
  isPending,
  theme,
}: HealthPassportProps) {
  const { t, i18n } = useTranslation();
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [newCondition, setNewCondition] = useState('');

  const addCondition = () => {
    if (newCondition.trim()) {
      onConditionsChange([...formData.conditions, newCondition.trim()]);
      setNewCondition('');
      setIsAddingCondition(false);
    }
  };

  const removeCondition = (condition: string) => {
    onConditionsChange(formData.conditions.filter((c) => c !== condition));
  };

  // Free-text "Other" conditions (not in COMMON_CONDITIONS) are shown as-is
  // — they're whatever she typed, not something to translate.
  const conditionLabel = (value: string): string => {
    const known = COMMON_CONDITIONS.find((c) => c.value === value);
    return known ? t(`profile.healthPassport.conditions.${known.labelKey}`) : value;
  };

  const activityOptions = ACTIVITY_OPTIONS.map((o) => ({
    value: o.value,
    label: t(`profile.healthPassport.activityOptions.${o.labelKey}`),
  }));
  const dietOptions = DIET_OPTIONS.map((o) => ({
    value: o.value,
    label: t(`profile.healthPassport.dietOptions.${o.labelKey}`),
  }));

  return (
    <View
      className="rounded-[2rem] border border-white/60 bg-white/70 p-6"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 0,
      }}
    >
      <View className="mb-8 flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.badgeBg }}
        >
          <HeartPulse size={20} color={theme.accentColor} />
        </View>
        <View>
          <Text className="text-xl text-stone-800" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}>
            {t('profile.healthPassport.title')}
          </Text>
          <Text className="mt-0.5 text-xs text-stone-400">{t('profile.healthPassport.subtitle')}</Text>
        </View>
      </View>

      <View className="gap-7">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <View className="mb-2 flex-row items-center gap-1.5">
              <Scale size={12} color="#A8A29E" />
              <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {t('profile.healthPassport.weight')}
              </Text>
            </View>
            <TextInput
              keyboardType="numeric"
              value={formData.weight ? String(formData.weight) : ''}
              onChangeText={(text) => {
                const v = Number(text.replace(/[^0-9.]/g, ''));
                setFormData({ ...formData, weight: Number.isNaN(v) ? 0 : v });
              }}
              className="rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3 text-xl text-stone-800"
              style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
              placeholderTextColor="#A8A29E"
            />
          </View>
          <View className="flex-1">
            <View className="mb-2 flex-row items-center gap-1.5">
              <Ruler size={12} color="#A8A29E" />
              <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {t('profile.healthPassport.height')}
              </Text>
            </View>
            <TextInput
              keyboardType="numeric"
              value={formData.height ? String(formData.height) : ''}
              onChangeText={(text) => {
                const v = Number(text.replace(/[^0-9.]/g, ''));
                setFormData({ ...formData, height: Number.isNaN(v) ? 0 : v });
              }}
              className="rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3 text-xl text-stone-800"
              style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
              placeholderTextColor="#A8A29E"
            />
          </View>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {t('profile.healthPassport.activityLevel')}
            </Text>
            <Select
              title={t('profile.healthPassport.activityLevel')}
              options={activityOptions}
              value={formData.activity_level}
              onValueChange={(val) => setFormData({ ...formData, activity_level: val })}
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {t('profile.healthPassport.dietType')}
            </Text>
            <Select
              title={t('profile.healthPassport.dietType')}
              options={dietOptions}
              value={formData.diet_preference}
              onValueChange={(val) => setFormData({ ...formData, diet_preference: val })}
            />
          </View>
        </View>

        <View>
          <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {t('profile.healthPassport.conditionsManaged')}
          </Text>

          {formData.conditions?.length ? (
            <View className="mb-3 flex-row flex-wrap gap-2">
              {formData.conditions.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => removeCondition(c)}
                  className="flex-row items-center gap-1 rounded-full border border-phase-menstrual/20 bg-phase-menstrual/10 px-3 py-1.5"
                >
                  <Text className="text-xs font-bold text-phase-menstrual">{conditionLabel(c)}</Text>
                  <X size={12} color="#AF6B6B" />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {!isAddingCondition ? (
            <Select
              title={t('profile.healthPassport.addConditionTitle')}
              placeholder={t('profile.healthPassport.tapToAdd')}
              options={[
                ...COMMON_CONDITIONS.filter((c) => !formData.conditions?.includes(c.value)).map((c) => ({
                  value: c.value,
                  label: conditionLabel(c.value),
                })),
                { value: OTHER_CONDITION_SENTINEL, label: t('profile.healthPassport.otherButton') },
              ]}
              onValueChange={(val) => {
                if (val === OTHER_CONDITION_SENTINEL) {
                  setIsAddingCondition(true);
                  return;
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onConditionsChange([...formData.conditions, val]);
              }}
            />
          ) : (
            <Animated.View entering={FadeIn.duration(200)} className="flex-row items-center gap-2">
              <TextInput
                value={newCondition}
                onChangeText={setNewCondition}
                onSubmitEditing={addCondition}
                autoFocus
                className="flex-1 border-b border-stone-300 bg-stone-50 px-2 py-1 text-xs text-stone-800"
                placeholder={t('profile.healthPassport.conditionPlaceholder')}
                placeholderTextColor="#A8A29E"
              />
              <TouchableOpacity
                onPress={addCondition}
                className="h-6 w-6 items-center justify-center rounded-full bg-stone-800"
              >
                <Plus size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSave();
          }}
          disabled={isPending}
          className="items-center rounded-xl bg-stone-900 py-4"
          style={{ opacity: isPending ? 0.5 : 1 }}
        >
          <Text className="text-xs font-bold uppercase tracking-widest text-white">
            {t('profile.healthPassport.saveButton')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
