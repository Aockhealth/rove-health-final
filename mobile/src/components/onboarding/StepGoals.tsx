import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  BarChart3,
  Scale,
  HeartPulse,
  Check,
  Shield,
  Droplet,
  Baby,
  Sunrise,
} from 'lucide-react-native';

export type TrackerMode = 'menstruation' | 'ttc' | 'menopause';

// What the app is tracking *for* you — this changes which screens you get, so
// it sits above the goal chips rather than reading as one more goal.
const TRACKER_MODES: { id: TrackerMode; label: string; description: string; Icon: typeof Droplet }[] = [
  { id: 'menstruation', label: 'My Cycle', description: 'Period, symptoms and phase-based guidance', Icon: Droplet },
  { id: 'ttc', label: 'Trying to Conceive', description: 'Adds temperature and ovulation test tracking', Icon: Baby },
  { id: 'menopause', label: 'Menopause', description: 'Perimenopause and menopause support', Icon: Sunrise },
];

// Scoped to the four things the app actually delivers on, rather than vaguer
// catch-alls — mirrored in ../profile/FocusGoals.tsx.
const GOALS = [
  { id: 'syncing', label: 'Cycle Syncing', description: 'Align routines with your hormonal phases', Icon: Calendar },
  { id: 'tracking', label: 'Cycle Tracking', description: 'Track period and symptom patterns', Icon: BarChart3 },
  { id: 'weight_loss', label: 'Weight Loss', description: 'Build sustainable fat-loss habits', Icon: Scale },
  { id: 'pcos', label: 'PCOS Guidance', description: 'Manage symptoms and energy better', Icon: HeartPulse },
];

type StepGoalsProps = {
  selectedGoals: string[];
  trackerMode: TrackerMode;
  privacyConsented: boolean;
  onToggleGoal: (goalId: string) => void;
  onTrackerModeChange: (value: TrackerMode) => void;
  onPrivacyConsentChange: (value: boolean) => void;
  errors: Record<string, string>;
};

export function StepGoals({
  selectedGoals,
  trackerMode,
  privacyConsented,
  onToggleGoal,
  onTrackerModeChange,
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

      <View className="gap-2">
        <Text className="text-xs font-bold uppercase tracking-widest text-rove-stone">
          What are you tracking?
        </Text>
        {TRACKER_MODES.map((mode, i) => {
          const selected = trackerMode === mode.id;
          return (
            <Animated.View key={mode.id} entering={FadeInDown.delay(120 + i * 40).duration(350)}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onTrackerModeChange(mode.id);
                }}
                activeOpacity={0.85}
                className="flex-row items-center gap-3 rounded-2xl border p-3.5"
                // Conditional visuals go through `style`, not a branching
                // className — NativeWind shorthand classes that flip on state
                // crash touchables in this app.
                style={{
                  borderColor: selected ? '#37332E' : 'rgba(55,51,46,0.1)',
                  backgroundColor: selected ? '#37332E' : 'rgba(255,255,255,0.6)',
                }}
              >
                <View
                  className="h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: selected ? 'rgba(255,255,255,0.15)' : 'rgba(55,51,46,0.05)' }}
                >
                  <mode.Icon size={18} color={selected ? '#FAF7F2' : '#78716C'} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: selected ? '#FAF7F2' : '#37332E' }}
                  >
                    {mode.label}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs"
                    style={{ color: selected ? 'rgba(250,247,242,0.6)' : '#78716C' }}
                  >
                    {mode.description}
                  </Text>
                </View>
                {selected ? (
                  <View className="rounded-full bg-rove-cream p-1">
                    <Check size={12} color="#37332E" />
                  </View>
                ) : null}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

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
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onToggleGoal(goal.id);
                }}
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPrivacyConsentChange(!privacyConsented);
            }}
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
                  onPress={() => router.push('/terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
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
