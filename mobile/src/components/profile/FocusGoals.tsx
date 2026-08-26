import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  BarChart3,
  Scale,
  Check,
  Target,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getLocalizedFontFamily } from '../../lib/fonts';
import type { ProfileTheme } from './CycleSignature';

// Mirrors GOALS in ../onboarding/StepGoals.tsx so editing goals here feels
// like a continuation of onboarding rather than a new pattern. Scoped to the
// things the app actually delivers on, rather than vaguer catch-alls. PCOS
// (PMOS) guidance dropped as a separate goal — it's now captured properly in
// Health Passport's Conditions Managed picker instead (see hasPcosFlag,
// which still recognizes existing users' saved 'pcos' goal for
// backward compatibility — this only removes the option going forward).
// Labels translated at render time via `profile.focusGoals.items.<id>`.
const GOALS = [
  { id: 'syncing', Icon: Calendar },
  { id: 'tracking', Icon: BarChart3 },
  { id: 'weight_loss', Icon: Scale },
];

interface FocusGoalsProps {
  goals: string[];
  onToggleGoal: (goalId: string) => void;
  theme: ProfileTheme;
}

export function FocusGoals({ goals, onToggleGoal, theme }: FocusGoalsProps) {
  const { t, i18n } = useTranslation();
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
          <Text className="text-xl text-stone-800" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}>
            {t('profile.focusGoals.title')}
          </Text>
          <Text className="mt-0.5 text-xs text-stone-400">{t('profile.focusGoals.subtitle')}</Text>
        </View>
      </View>

      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {t('profile.focusGoals.yourGoals')}
          </Text>
          {GOALS.map((goal) => {
            const selected = goals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onToggleGoal(goal.id);
                }}
                activeOpacity={0.85}
                className={`flex-row items-center gap-3 rounded-2xl border p-3 ${
                  selected ? 'border-stone-800 bg-stone-800' : 'border-stone-100 bg-stone-50/50'
                }`}
              >
                <View
                  className={`h-8 w-8 items-center justify-center rounded-lg ${
                    selected ? 'bg-white/15' : 'bg-white'
                  }`}
                >
                  <goal.Icon size={15} color={selected ? '#FAF7F2' : '#78716C'} />
                </View>
                <Text
                  className={`flex-1 text-sm font-semibold ${selected ? 'text-white' : 'text-stone-700'}`}
                >
                  {t(`profile.focusGoals.items.${goal.id}`)}
                </Text>
                {selected ? <Check size={16} color="#FAF7F2" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </View>
  );
}
