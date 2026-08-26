import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  BarChart3,
  Scale,
  Check,
  Shield,
  Droplet,
  Baby,
  Sunrise,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getLocalizedFontFamily } from '../../lib/fonts';

export type TrackerMode = 'menstruation' | 'ttc' | 'menopause';

// What the app is tracking *for* you — this changes which screens you get, so
// it sits above the goal chips rather than reading as one more goal. Labels
// and descriptions are translated at render time via `onboarding.goals.trackerModes.<id>`.
//
// TTC and Menopause are temporarily locked out of onboarding while they're
// still being refined — new users can only start in Cycle Sync. Existing
// accounts already in one of those modes are unaffected (see profile.tsx's
// Tracking Mode selector, locked the same way). Re-add both rows here once
// they're ready.
const TRACKER_MODES: { id: TrackerMode; Icon: typeof Droplet }[] = [
  { id: 'menstruation', Icon: Droplet },
];

// Scoped to the things the app actually delivers on, rather than vaguer
// catch-alls — mirrored in ../profile/FocusGoals.tsx. PCOS (PMOS) guidance
// dropped as a separate goal — it's captured properly in Health Passport's
// Conditions Managed picker instead. Labels/descriptions translated at render
// time via `onboarding.goals.items.<id>`.
const GOALS = [
  { id: 'syncing', Icon: Calendar },
  { id: 'tracking', Icon: BarChart3 },
  { id: 'weight_loss', Icon: Scale },
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
  const { t, i18n } = useTranslation();

  return (
    <View className="gap-6 px-1">
      <Animated.View entering={FadeInDown.delay(100).duration(400)} className="gap-2">
        <Text
          className="text-2xl text-rove-charcoal"
          style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
        >
          {t('onboarding.goals.heading')}
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          {t('onboarding.goals.subheading')}
        </Text>
      </Animated.View>

      <View className="gap-2">
        <Text className="text-xs font-bold uppercase tracking-widest text-rove-stone">
          {t('onboarding.goals.trackingQuestion')}
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
                  borderColor: selected ? '#2D2420' : 'rgba(45,36,32,0.1)',
                  backgroundColor: selected ? '#2D2420' : 'rgba(255,255,255,0.6)',
                }}
              >
                <View
                  className="h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: selected ? 'rgba(255,255,255,0.15)' : 'rgba(45,36,32,0.05)' }}
                >
                  <mode.Icon size={18} color={selected ? '#FAF9F6' : '#78716C'} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: selected ? '#FAF9F6' : '#2D2420' }}
                  >
                    {t(`onboarding.goals.trackerModes.${mode.id}.label`)}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs"
                    style={{ color: selected ? 'rgba(250,247,242,0.6)' : '#78716C' }}
                  >
                    {t(`onboarding.goals.trackerModes.${mode.id}.description`)}
                  </Text>
                </View>
                {selected ? (
                  <View className="rounded-full bg-rove-cream p-1">
                    <Check size={12} color="#2D2420" />
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
                    <Check size={12} color="#2D2420" />
                  </View>
                ) : null}
                <View
                  className={`mb-3 h-9 w-9 items-center justify-center rounded-xl ${
                    selected ? 'bg-white/15' : 'bg-rove-charcoal/5'
                  }`}
                >
                  <goal.Icon size={18} color={selected ? '#FAF9F6' : '#78716C'} />
                </View>
                <Text
                  className={`text-sm font-semibold ${selected ? 'text-rove-cream' : 'text-rove-charcoal'}`}
                >
                  {t(`onboarding.goals.items.${goal.id}.label`)}
                </Text>
                <Text className={`mt-0.5 text-xs ${selected ? 'text-rove-cream/60' : 'text-rove-stone'}`}>
                  {t(`onboarding.goals.items.${goal.id}.description`)}
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
            {privacyConsented ? <Check size={12} color="#FAF9F6" /> : null}
          </TouchableOpacity>
          <View className="flex-1">
            <View className="mb-3 flex-row items-center gap-1.5">
              <Shield size={14} color="#A8A29E" />
              <Text className="text-xs font-semibold text-rove-charcoal">{t('onboarding.goals.privacy.title')}</Text>
            </View>
            <View className="gap-2">
              <Text className="text-xs leading-relaxed text-rove-stone">
                <Text className="font-bold text-rove-charcoal">• </Text>
                {t('onboarding.goals.privacy.agreePrefix')}
                <Text
                  className="underline text-rove-charcoal font-medium"
                  onPress={() => router.push('/terms')}
                >
                  {t('onboarding.goals.privacy.termsLink')}
                </Text>
                {t('onboarding.goals.privacy.agreeMiddle')}
                <Text
                  className="underline text-rove-charcoal font-medium"
                  onPress={() => router.push('/privacy')}
                >
                  {t('onboarding.goals.privacy.privacyLink')}
                </Text>
                {t('onboarding.goals.privacy.agreeSuffix')}
              </Text>
              <Text className="text-xs leading-relaxed text-rove-stone">
                <Text className="font-bold text-rove-charcoal">• </Text>
                {t('onboarding.goals.privacy.medicalDisclaimer')}
              </Text>
              <Text className="text-xs leading-relaxed text-rove-stone">
                <Text className="font-bold text-rove-charcoal">• </Text>
                {t('onboarding.goals.privacy.dataSecurity')}
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
