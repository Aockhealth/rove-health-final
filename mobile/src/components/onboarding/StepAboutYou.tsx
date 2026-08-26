import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import type { SymptomInput } from '@shared/onboarding/types';
import { Input } from '../ui/Input';
import { getLocalizedFontFamily } from '../../lib/fonts';

// `value` is what's persisted (to formData.conditions / symptom logs) and
// what hasPcosFlag string-matches against — it stays in English regardless
// of app language. `key` looks up the localized display text via
// `onboarding.aboutYou.conditions.<key>`.
const MEDICAL_CONDITIONS = [
  { value: 'None', key: 'none' },
  { value: 'PCOS / PCOD', key: 'pcosPcod' },
  { value: 'Recurrent UTI', key: 'recurrentUti' },
  { value: 'Bacterial Vaginosis', key: 'bacterialVaginosis' },
  { value: 'Endometriosis', key: 'endometriosis' },
  { value: 'Fibroids', key: 'fibroids' },
  { value: 'Diabetes', key: 'diabetes' },
  { value: 'Hypertension', key: 'hypertension' },
  { value: 'Thyroid', key: 'thyroid' },
];

// Same value/key split — `name` is persisted as part of SymptomInput, `key`
// looks up `onboarding.aboutYou.symptoms.<key>`.
const PHYSICAL_SYMPTOMS = [
  { value: 'Cramps', key: 'cramps' },
  { value: 'Bloating', key: 'bloating' },
  { value: 'Fatigue', key: 'fatigue' },
  { value: 'Headache', key: 'headache' },
  { value: 'Backache', key: 'backache' },
  { value: 'Acne', key: 'acne' },
  { value: 'Breast pain', key: 'breastPain' },
];
const EMOTIONAL_SYMPTOMS = [
  { value: 'Mood swings', key: 'moodSwings' },
  { value: 'Feeling low', key: 'feelingLow' },
  { value: 'Irritability', key: 'irritability' },
  { value: 'Anger', key: 'anger' },
  { value: 'Food cravings', key: 'foodCravings' },
];
const ALL_SYMPTOMS = [
  ...PHYSICAL_SYMPTOMS.map((s) => ({ name: s.value, key: s.key, category: 'Physical' as const })),
  ...EMOTIONAL_SYMPTOMS.map((s) => ({ name: s.value, key: s.key, category: 'Emotional' as const })),
];

const DIET_OPTIONS = [
  { id: 'vegetarian', key: 'vegetarian' },
  { id: 'non_vegetarian', key: 'nonVeg' },
  { id: 'vegan', key: 'vegan' },
  { id: 'jain', key: 'jain' },
  { id: 'eggetarian', key: 'eggetarian' },
  { id: 'pescatarian', key: 'pescatarian' },
];

type StepAboutYouProps = {
  conditions: string[];
  symptoms: SymptomInput[];
  heightCm: number | null;
  weightKg: number | null;
  dietPreference: string;
  onToggleCondition: (condition: string) => void;
  onToggleSymptom: (symptom: SymptomInput) => void;
  onHeightChange: (value: number | null) => void;
  onWeightChange: (value: number | null) => void;
  onDietChange: (value: string) => void;
  errors: Record<string, string>;
};

export function StepAboutYou({
  conditions,
  symptoms,
  heightCm,
  weightKg,
  dietPreference,
  onToggleCondition,
  onToggleSymptom,
  onHeightChange,
  onWeightChange,
  onDietChange,
  errors,
}: StepAboutYouProps) {
  const { t, i18n } = useTranslation();
  const [showSymptoms, setShowSymptoms] = useState(false);

  return (
    <View className="gap-6 px-1">
      <Animated.View entering={FadeInDown.delay(100).duration(400)} className="gap-2">
        <Text
          className="text-2xl text-rove-charcoal"
          style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
        >
          {t('onboarding.aboutYou.title')}
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          {t('onboarding.aboutYou.subtitle')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} className="gap-3">
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
          {t('onboarding.aboutYou.healthConditions')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {MEDICAL_CONDITIONS.map((condition) => {
            const isSelected = conditions.includes(condition.value);
            return (
              <TouchableOpacity
                key={condition.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onToggleCondition(condition.value);
                }}
                className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
                  isSelected
                    ? 'border-rove-charcoal bg-rove-charcoal'
                    : 'border-rove-charcoal/10 bg-white/60'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${isSelected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                >
                  {t(`onboarding.aboutYou.conditions.${condition.key}`)}
                </Text>
                {isSelected ? <Check size={14} color="#FAF9F6" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} className="gap-3">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSymptoms(!showSymptoms);
          }}
          className="flex-row items-center justify-between rounded-2xl border border-rove-charcoal/10 bg-white/60 px-4 py-3.5"
        >
          <View>
            <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
              {t('onboarding.aboutYou.typicalSymptoms')}
            </Text>
            <Text className="text-xs text-rove-stone">
              {symptoms.length > 0
                ? t('onboarding.aboutYou.symptomsSelected', { count: symptoms.length })
                : t('onboarding.aboutYou.symptomsOptional')}
            </Text>
          </View>
          {showSymptoms ? (
            <ChevronUp size={16} color="#78716C" />
          ) : (
            <ChevronDown size={16} color="#78716C" />
          )}
        </TouchableOpacity>

        {showSymptoms ? (
          <Animated.View entering={FadeIn.duration(250)} className="flex-row flex-wrap gap-2 pt-1">
            {ALL_SYMPTOMS.map(({ name, key, category }) => {
              const isSelected = symptoms.some((s) => s.name === name);
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onToggleSymptom({ name, category, severity: 5 });
                  }}
                  className={`rounded-xl border px-3 py-2 ${
                    isSelected
                      ? 'border-rove-charcoal bg-rove-charcoal'
                      : 'border-rove-charcoal/10 bg-white/60'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${isSelected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                  >
                    {t(`onboarding.aboutYou.symptoms.${key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} className="gap-4">
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
          {t('onboarding.aboutYou.lifestyle')}
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-xs font-semibold text-rove-stone">{t('onboarding.aboutYou.heightLabel')}</Text>
            <Input
              className="border-0 border-b border-rove-stone/30 rounded-none bg-transparent px-0 pb-3 h-auto text-rove-charcoal"
              keyboardType="numeric"
              value={heightCm != null ? String(heightCm) : ''}
              onChangeText={(text) => {
                const v = text.trim() === '' ? null : Number(text.replace(/[^0-9.]/g, ''));
                onHeightChange(v != null && Number.isNaN(v) ? null : v);
              }}
              placeholder="165"
              placeholderTextColor="#A99B87"
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-xs font-semibold text-rove-stone">{t('onboarding.aboutYou.weightLabel')}</Text>
            <Input
              className="border-0 border-b border-rove-stone/30 rounded-none bg-transparent px-0 pb-3 h-auto text-rove-charcoal"
              keyboardType="numeric"
              value={weightKg != null ? String(weightKg) : ''}
              onChangeText={(text) => {
                const v = text.trim() === '' ? null : Number(text.replace(/[^0-9.]/g, ''));
                onWeightChange(v != null && Number.isNaN(v) ? null : v);
              }}
              placeholder="60"
              placeholderTextColor="#A99B87"
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xs font-semibold text-rove-stone">{t('onboarding.aboutYou.dietPreference')}</Text>
          <View className="flex-row flex-wrap">
            {DIET_OPTIONS.map((diet) => {
              const isSelected = dietPreference === diet.id;
              return (
                <View key={diet.id} style={{ width: '33.33%' }} className="p-1">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onDietChange(isSelected ? '' : diet.id);
                    }}
                    className={`items-center rounded-2xl border px-2 py-3 ${
                      isSelected
                        ? 'border-rove-charcoal bg-rove-charcoal'
                        : 'border-rove-charcoal/10 bg-white/60'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${isSelected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                    >
                      {t(`onboarding.aboutYou.dietOptions.${diet.key}`)}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {errors.form ? <Text className="text-center text-sm text-rove-red">{errors.form}</Text> : null}
    </View>
  );
}
