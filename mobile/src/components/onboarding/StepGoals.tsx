import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  Calendar,
  BarChart3,
  Scale,
  HeartPulse,
  Flower2,
  BookOpen,
  Check,
  Shield,
} from 'lucide-react-native';

const GOALS = [
  { id: 'syncing', label: 'Cycle Syncing', description: 'Align routines with your hormonal phases', Icon: Calendar },
  { id: 'tracking', label: 'Cycle Tracking', description: 'Track period and symptom patterns', Icon: BarChart3 },
  { id: 'weight_loss', label: 'Weight Loss', description: 'Build sustainable fat-loss habits', Icon: Scale },
  { id: 'pcos', label: 'PCOS Guidance', description: 'Manage symptoms and energy better', Icon: HeartPulse },
  { id: 'other', label: 'General Wellness', description: 'Improve mood, focus, and consistency', Icon: Flower2 },
  { id: 'learn_body', label: 'Learn My Body', description: 'Understand your personal cycle trends', Icon: BookOpen },
];

type StepGoalsProps = {
  selectedGoals: string[];
  privacyConsented: boolean;
  onToggleGoal: (goalId: string) => void;
  onPrivacyConsentChange: (value: boolean) => void;
  errors: Record<string, string>;
};

export function StepGoals({
  selectedGoals,
  privacyConsented,
  onToggleGoal,
  onPrivacyConsentChange,
  errors,
}: StepGoalsProps) {
  const router = useRouter();
  
  return (
    <View className="gap-6 px-1">
      <Animated.View entering={FadeInDown.delay(100).duration(400)} className="gap-2">
        <Text
          className="text-2xl text-rove-charcoal"
          style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
        >
          Your Goals
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          Pick what matters most — we'll tailor your daily plan from day one.
        </Text>
      </Animated.View>

      <View className="flex-row flex-wrap">
        {GOALS.map((goal, i) => {
          const selected = selectedGoals.includes(goal.id);
          return (
            <Animated.View
              key={goal.id}
              entering={FadeInDown.delay(150 + i * 40).duration(350)}
              style={{ width: '50%' }}
              className="p-1.5"
            >
              <TouchableOpacity
                onPress={() => onToggleGoal(goal.id)}
                activeOpacity={0.85}
                className={`rounded-2xl border p-4 ${
                  selected ? 'border-rove-charcoal bg-rove-charcoal' : 'border-rove-charcoal/10 bg-white/60'
                }`}
                style={{ minHeight: 120 }}
              >
                {selected ? (
                  <View className="absolute right-3 top-3 rounded-full bg-rove-cream p-1">
                    <Check size={12} color="#37332E" />
                  </View>
                ) : null}
                <View
                  className={`mb-3 h-9 w-9 items-center justify-center rounded-xl ${
                    selected ? 'bg-white/15' : 'bg-rove-charcoal/5'
                  }`}
                >
                  <goal.Icon size={18} color={selected ? '#FAF7F2' : '#78716C'} />
                </View>
                <Text
                  className={`text-sm font-semibold ${selected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                >
                  {goal.label}
                </Text>
                <Text className={`mt-0.5 text-xs ${selected ? 'text-rove-cream/60' : 'text-rove-stone'}`}>
                  {goal.description}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {errors.goals ? <Text className="text-center text-sm text-rove-red">{errors.goals}</Text> : null}

      <Animated.View
        entering={FadeInDown.delay(450).duration(400)}
        className="rounded-2xl border border-rove-charcoal/10 bg-white/40 p-4"
      >
        <View className="flex-row items-start gap-3">
          <TouchableOpacity
            onPress={() => onPrivacyConsentChange(!privacyConsented)}
            className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border-2 ${
              privacyConsented ? 'border-rove-charcoal bg-rove-charcoal' : 'border-rove-stone/40 bg-white'
            }`}
          >
            {privacyConsented ? <Check size={12} color="#FAF7F2" /> : null}
          </TouchableOpacity>
          <View className="flex-1">
            <View className="mb-3 flex-row items-center gap-1.5">
              <Shield size={14} color="#A8A29E" />
              <Text className="text-xs font-semibold text-rove-charcoal">Privacy & Disclaimer</Text>
            </View>
            <View className="gap-2">
              <Text className="text-xs leading-relaxed text-rove-stone">
                <Text className="font-bold text-rove-charcoal">• </Text>
                I agree to the{' '}
                <Text
                  className="underline text-rove-charcoal font-medium"
                  onPress={() => router.push('/privacy')}
                >
                  Privacy Policy
                </Text>.
              </Text>
              <Text className="text-xs leading-relaxed text-rove-stone">
                <Text className="font-bold text-rove-charcoal">• </Text>
                I understand this app does not intend to diagnose, cure, treat, or prevent any condition. I will consult a healthcare professional for medical advice.
              </Text>
              <Text className="text-xs leading-relaxed text-rove-stone">
                <Text className="font-bold text-rove-charcoal">• </Text>
                My data is stored securely and never sold.
              </Text>
            </View>
          </View>
        </View>
        {errors.privacyConsented ? (
          <Text className="mt-2 text-xs text-rove-red">{errors.privacyConsented}</Text>
        ) : null}
      </Animated.View>
    </View>
  );
}
