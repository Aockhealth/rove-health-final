import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import type { SymptomInput } from '@shared/onboarding/types';
import { Input } from '../ui/Input';

const MEDICAL_CONDITIONS = [
  'None',
  'PCOS / PCOD',
  'Recurrent UTI',
  'Bacterial Vaginosis',
  'Endometriosis',
  'Fibroids',
  'Diabetes',
  'Hypertension',
  'Thyroid',
];

const PHYSICAL_SYMPTOMS = ['Cramps', 'Bloating', 'Fatigue', 'Headache', 'Backache', 'Acne', 'Breast pain'];
const EMOTIONAL_SYMPTOMS = ['Mood swings', 'Feeling low', 'Irritability', 'Anger', 'Food cravings'];
const ALL_SYMPTOMS = [
  ...PHYSICAL_SYMPTOMS.map((s) => ({ name: s, category: 'Physical' as const })),
  ...EMOTIONAL_SYMPTOMS.map((s) => ({ name: s, category: 'Emotional' as const })),
];

const DIET_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'non_vegetarian', label: 'Non-Veg' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'jain', label: 'Jain' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'pescatarian', label: 'Pescatarian' },
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
  const [showSymptoms, setShowSymptoms] = useState(false);

  return (
    <View className="gap-6 px-1">
      <Animated.View entering={FadeInDown.delay(100).duration(400)} className="gap-2">
        <Text
          className="text-2xl text-rove-charcoal"
          style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
        >
          About You
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          A few details about your health and lifestyle to tailor your experience.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} className="gap-3">
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
          Health Conditions
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {MEDICAL_CONDITIONS.map((condition) => {
            const isSelected = conditions.includes(condition);
            return (
              <TouchableOpacity
                key={condition}
                onPress={() => onToggleCondition(condition)}
                className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
                  isSelected
                    ? 'border-rove-charcoal bg-rove-charcoal'
                    : 'border-rove-charcoal/10 bg-white/60'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${isSelected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                >
                  {condition}
                </Text>
                {isSelected ? <Check size={14} color="#FAF7F2" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} className="gap-3">
        <TouchableOpacity
          onPress={() => setShowSymptoms(!showSymptoms)}
          className="flex-row items-center justify-between rounded-2xl border border-rove-charcoal/10 bg-white/60 px-4 py-3.5"
        >
          <View>
            <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
              Typical Symptoms
            </Text>
            <Text className="text-xs text-rove-stone/60">
              {symptoms.length > 0 ? `${symptoms.length} selected` : 'Optional — helps personalize insights'}
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
            {ALL_SYMPTOMS.map(({ name, category }) => {
              const isSelected = symptoms.some((s) => s.name === name);
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => onToggleSymptom({ name, category, severity: 5 })}
                  className={`rounded-xl border px-3 py-2 ${
                    isSelected
                      ? 'border-rove-charcoal bg-rove-charcoal'
                      : 'border-rove-charcoal/10 bg-white/60'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${isSelected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} className="gap-4">
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
          Lifestyle
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-xs font-semibold text-rove-stone">Height (cm)</Text>
            <Input
              keyboardType="numeric"
              value={heightCm != null ? String(heightCm) : ''}
              onChangeText={(text) => {
                const v = text.trim() === '' ? null : Number(text.replace(/[^0-9.]/g, ''));
                onHeightChange(v != null && Number.isNaN(v) ? null : v);
              }}
              placeholder="165"
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-xs font-semibold text-rove-stone">Weight (kg)</Text>
            <Input
              keyboardType="numeric"
              value={weightKg != null ? String(weightKg) : ''}
              onChangeText={(text) => {
                const v = text.trim() === '' ? null : Number(text.replace(/[^0-9.]/g, ''));
                onWeightChange(v != null && Number.isNaN(v) ? null : v);
              }}
              placeholder="60"
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xs font-semibold text-rove-stone">Diet preference</Text>
          <View className="flex-row flex-wrap">
            {DIET_OPTIONS.map((diet) => {
              const isSelected = dietPreference === diet.id;
              return (
                <View key={diet.id} style={{ width: '33.33%' }} className="p-1">
                  <TouchableOpacity
                    onPress={() => onDietChange(isSelected ? '' : diet.id)}
                    className={`items-center rounded-2xl border px-2 py-3 ${
                      isSelected
                        ? 'border-rove-charcoal bg-rove-charcoal'
                        : 'border-rove-charcoal/10 bg-white/60'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${isSelected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                    >
                      {diet.label}
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
