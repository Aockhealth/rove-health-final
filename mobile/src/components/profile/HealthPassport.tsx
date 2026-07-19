import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Scale, Ruler, Activity, X, Plus } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Select } from '../ui/Select';
import type { ProfileFormData } from '../../lib/profile';
import type { ProfileTheme } from './CycleSignature';

interface HealthPassportProps {
  formData: ProfileFormData;
  setFormData: (data: ProfileFormData) => void;
  onSave: () => void;
  isPending: boolean;
  theme: ProfileTheme;
}

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'athlete', label: 'Athlete' },
];

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_veg', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
];

export function HealthPassport({ formData, setFormData, onSave, isPending, theme }: HealthPassportProps) {
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [newCondition, setNewCondition] = useState('');

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData({ ...formData, conditions: [...formData.conditions, newCondition.trim()] });
      setNewCondition('');
      setIsAddingCondition(false);
    }
  };

  const removeCondition = (condition: string) => {
    setFormData({ ...formData, conditions: formData.conditions.filter((c) => c !== condition) });
  };

  return (
    <View className="rounded-[2rem] border border-white/60 bg-white/70 p-6">
      <View className="mb-8 flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.badgeBg }}
        >
          <Activity size={20} color={theme.accentColor} />
        </View>
        <View>
          <Text className="text-xl text-stone-800" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
            Health Passport
          </Text>
          <Text className="mt-0.5 text-xs text-stone-400">Primary biomarkers & conditions</Text>
        </View>
      </View>

      <View className="gap-7">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <View className="mb-2 flex-row items-center gap-1.5">
              <Scale size={12} color="#A8A29E" />
              <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Weight (kg)
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
              style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
              placeholderTextColor="#A8A29E"
            />
          </View>
          <View className="flex-1">
            <View className="mb-2 flex-row items-center gap-1.5">
              <Ruler size={12} color="#A8A29E" />
              <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Height (cm)
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
              style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
              placeholderTextColor="#A8A29E"
            />
          </View>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Activity Level
            </Text>
            <Select
              title="Activity Level"
              options={ACTIVITY_OPTIONS}
              value={formData.activity_level}
              onValueChange={(val) => setFormData({ ...formData, activity_level: val })}
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Diet Type
            </Text>
            <Select
              title="Diet Type"
              options={DIET_OPTIONS}
              value={formData.diet_preference}
              onValueChange={(val) => setFormData({ ...formData, diet_preference: val })}
            />
          </View>
        </View>

        <View>
          <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Conditions Managed
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {formData.conditions?.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => removeCondition(c)}
                className="flex-row items-center gap-1 rounded-full border border-phase-menstrual/20 bg-phase-menstrual/10 px-3 py-1.5"
              >
                <Text className="text-xs font-bold text-phase-menstrual">{c}</Text>
                <X size={12} color="#AF6B6B" />
              </TouchableOpacity>
            ))}

            {!isAddingCondition ? (
              <TouchableOpacity
                onPress={() => setIsAddingCondition(true)}
                className="rounded-full border border-dashed border-stone-200 bg-stone-50 px-3 py-1.5"
              >
                <Text className="text-xs font-bold text-stone-400">+ Add</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View entering={FadeIn.duration(200)} className="flex-row items-center gap-2">
                <TextInput
                  value={newCondition}
                  onChangeText={setNewCondition}
                  onSubmitEditing={addCondition}
                  autoFocus
                  className="w-32 border-b border-stone-300 bg-stone-50 px-2 py-1 text-xs text-stone-800"
                  placeholder="Condition..."
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
        </View>

        <TouchableOpacity
          onPress={onSave}
          disabled={isPending}
          className="items-center rounded-xl bg-stone-900 py-4"
          style={{ opacity: isPending ? 0.5 : 1 }}
        >
          <Text className="text-xs font-bold uppercase tracking-widest text-white">
            Save Passport Data
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
