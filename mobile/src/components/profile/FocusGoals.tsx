import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  BarChart3,
  Scale,
  HeartPulse,
  Flower2,
  BookOpen,
  Check,
  Target,
} from 'lucide-react-native';
import type { ProfileTheme } from './CycleSignature';

// Mirrors GOALS in ../onboarding/StepGoals.tsx so editing goals here feels
// like a continuation of onboarding rather than a new pattern.
const GOALS = [
  { id: 'syncing', label: 'Cycle Syncing', Icon: Calendar },
  { id: 'tracking', label: 'Cycle Tracking', Icon: BarChart3 },
  { id: 'weight_loss', label: 'Weight Loss', Icon: Scale },
  { id: 'pcos', label: 'PCOS Guidance', Icon: HeartPulse },
  { id: 'other', label: 'General Wellness', Icon: Flower2 },
  { id: 'learn_body', label: 'Learn My Body', Icon: BookOpen },
];

interface FocusGoalsProps {
  goals: string[];
  onToggleGoal: (goalId: string) => void;
  theme: ProfileTheme;
}

export function FocusGoals({ goals, onToggleGoal, theme }: FocusGoalsProps) {
  return (
    <View className="rounded-[2rem] border border-white/60 bg-white/70 p-6">
      <View className="mb-6 flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.badgeBg }}
        >
          <Target size={20} color={theme.accentColor} />
        </View>
        <View>
          <Text className="text-xl text-stone-800" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
            Focus & Care Mode
          </Text>
          <Text className="mt-0.5 text-xs text-stone-400">What we tailor your plan around</Text>
        </View>
      </View>

      <View className="gap-6">
        <View className="gap-3">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Your Goals
          </Text>
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
            {GOALS.map((goal) => {
              const selected = goals.includes(goal.id);
              return (
                <View key={goal.id} style={{ width: '50%' }} className="p-1.5">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onToggleGoal(goal.id);
                    }}
                    activeOpacity={0.85}
                    className={`flex-row items-center gap-2 rounded-2xl border p-3 ${
                      selected ? 'border-stone-800 bg-stone-800' : 'border-stone-100 bg-stone-50/50'
                    }`}
                  >
                    <View
                      className={`h-7 w-7 items-center justify-center rounded-lg ${
                        selected ? 'bg-white/15' : 'bg-white'
                      }`}
                    >
                      <goal.Icon size={14} color={selected ? '#FAF7F2' : '#78716C'} />
                    </View>
                    <Text
                      className={`flex-1 text-xs font-semibold ${selected ? 'text-white' : 'text-stone-700'}`}
                      numberOfLines={1}
                    >
                      {goal.label}
                    </Text>
                    {selected ? <Check size={14} color="#FAF7F2" /> : null}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

      </View>
    </View>
  );
}
