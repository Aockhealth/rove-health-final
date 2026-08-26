import React, { useEffect, useMemo, useReducer, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowRight, Check, ChevronLeft } from 'lucide-react-native';
import { ONBOARDING_FLOW_VERSION, ONBOARDING_STEPS } from '@shared/onboarding/constants';
import { formatLocalDate } from '@shared/onboarding/date';
import type { OnboardingDraftV2 } from '@shared/onboarding/types';
import { supabase } from '../lib/supabase';
import { submitOnboardingV2, trackOnboardingEvent } from '../lib/onboarding';
import {
  onboardingReducer,
  initialOnboardingState,
  calculateAutoStats,
  getCompletedRanges,
  type OnboardingState,
} from '../lib/onboarding-state';
import { StepIntro } from '../components/onboarding/StepIntro';
import { StepWelcome } from '../components/onboarding/StepWelcome';
import { StepHistory } from '../components/onboarding/StepHistory';
import { StepAboutYou } from '../components/onboarding/StepAboutYou';
import { StepGoals } from '../components/onboarding/StepGoals';

const STEP_LABELS = ['Intro', 'Profile', 'History', 'About You', 'Goals'];

const CUTE_HEADINGS = [
  { pt1: 'You are not inconsistent.', pt2: 'You are cyclical.', desc: "Your biology isn't broken. Rove is translating your cycle into practical daily choices for meals, movement, and rest." },
  { pt1: "Your body isn't a machine.", pt2: "It's a garden.", desc: 'Blooming in phases. Allow Rove to tune your daily choices to match your natural rhythm perfectly.' },
  { pt1: 'Stop fighting your biology.', pt2: 'Start flowing with it.', desc: 'Your energy naturally ebbs and flows. Rove is calibrating your personalized plan to honor your cycle.' },
  { pt1: 'No more guesswork.', pt2: 'Just perfect timing.', desc: 'Syncing your lifestyle to your cycle changes everything. Preparing your phase-aligned insights now...' },
  { pt1: 'Your energy shifts?', pt2: "That's your superpower.", desc: 'Every phase has a unique advantage. Rove helps you harness your shifts for peak performance and recovery.' },
];

function getStorageKey(userId: string): string {
  return `onboarding-draft:${ONBOARDING_FLOW_VERSION}:${userId}`;
}

function getMonthBoundaries(viewDate: Date): { monthStart: string; monthEnd: string } {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStart = formatLocalDate(new Date(year, month, 1));
  const monthEnd = formatLocalDate(new Date(year, month + 1, 0));
  return { monthStart, monthEnd };
}

function validateStep(state: OnboardingState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (state.step === 2) {
    if (!state.name.trim()) errors.name = 'Name is required.';
    else if (state.name.trim().length < 2) errors.name = 'Name should be at least 2 characters.';
    if (!state.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
  }

  if (state.step === 3) {
    if (state.periodHistory.some((range) => !range.endDate)) {
      errors.periodHistory = 'Finish selecting the end date for your open range.';
    }
  }

  if (state.step === 5) {
    if (state.goals.length === 0) errors.goals = 'Select at least one goal.';
    if (!state.privacyConsented) errors.privacyConsented = 'Privacy consent is required to continue.';
  }

  return errors;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const autoStats = useMemo(() => calculateAutoStats(state.periodHistory), [state.periodHistory]);
  const completedRanges = useMemo(() => getCompletedRanges(state.periodHistory), [state.periodHistory]);
  const hasOpenRange = state.periodHistory.some((range) => !range.endDate);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }
      setUserId(user.id);
      try {
        const raw = await AsyncStorage.getItem(getStorageKey(user.id));
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<OnboardingDraftV2>;
          dispatch({ type: 'hydrate', payload: parsed });
        }
      } catch {
        // Ignore a corrupt draft — start fresh.
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!hydrated || !userId) return;
    const draft: OnboardingDraftV2 = {
      step: state.step,
      name: state.name,
      dateOfBirth: state.dateOfBirth,
      periodHistory: state.periodHistory,
      manualLastPeriodStart: state.manualLastPeriodStart,
      cycleLength: state.cycleLength,
      periodLength: state.periodLength,
      regularity: state.regularity,
      conditions: state.conditions,
      symptoms: state.symptoms,
      goals: state.goals,
      trackerMode: state.trackerMode,
      heightCm: state.heightCm,
      weightKg: state.weightKg,
      dietPreference: state.dietPreference,
      privacyConsented: state.privacyConsented,
      updatedAt: new Date().toISOString(),
    };
    AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(draft)).catch(() => {});
  }, [state, hydrated, userId]);

  useEffect(() => {
    trackOnboardingEvent('onboarding_step_viewed', { step: state.step });
  }, [state.step]);

  function goNextStep() {
    const errors = validateStep(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'set_errors', errors });
      return;
    }
    dispatch({ type: 'clear_errors' });
    dispatch({ type: 'set_step', step: Math.min(state.step + 1, ONBOARDING_STEPS) });
  }

  function goBackStep() {
    dispatch({ type: 'set_step', step: Math.max(state.step - 1, 1) });
  }

  function selectCalendarDay(dateString: string) {
    const today = formatLocalDate(new Date());
    if (dateString > today) return;

    if (hasOpenRange) {
      dispatch({ type: 'complete_period_range', date: dateString });
      return;
    }
    dispatch({ type: 'start_period_range', date: dateString });
  }

  async function handleLogOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  async function submit() {
    const stepErrors = validateStep(state);
    if (Object.keys(stepErrors).length > 0) {
      dispatch({ type: 'set_errors', errors: stepErrors });
      return;
    }

    const latestRange = completedRanges
      .map((range) => range.startDate)
      .sort((a, b) => (a > b ? -1 : 1))[0];
    const lastPeriodStart = latestRange ?? state.manualLastPeriodStart;

    setIsPending(true);
    await trackOnboardingEvent('onboarding_submit_attempted', { step: state.step });
    const result = await submitOnboardingV2({
      name: state.name.trim(),
      dateOfBirth: state.dateOfBirth,
      goals: state.goals,
      conditions: state.conditions.filter((item) => item !== 'None'),
      symptoms: state.symptoms,
      periodHistory: completedRanges.map((range) => ({
        start_date: range.startDate,
        end_date: range.endDate!,
      })),
      lastPeriodStart,
      cycleLength: autoStats?.avgCycle ?? state.cycleLength,
      periodLength: autoStats?.avgBleed ?? state.periodLength,
      isIrregular: autoStats?.isIrregular ?? state.regularity === 'Irregular',
      trackerMode: state.trackerMode,
      heightCm: state.heightCm,
      weightKg: state.weightKg,
      dietPreference: state.dietPreference,
      privacyConsented: state.privacyConsented,
    });
    setIsPending(false);

    if (!result.ok) {
      if (result.code === 'UNAUTHENTICATED') {
        router.replace('/(auth)/login');
        return;
      }
      dispatch({
        type: 'set_errors',
        errors: result.errors ?? { form: result.message ?? 'Unable to continue.' },
      });
      await trackOnboardingEvent('onboarding_submit_failed', { code: result.code ?? 'unknown_error' });
      return;
    }

    setShowComplete(true);
    if (userId) {
      AsyncStorage.removeItem(getStorageKey(userId)).catch(() => {});
    }
    await trackOnboardingEvent('onboarding_completed', { nextRoute: '/(app)/home' });
  }

  const { monthStart, monthEnd } = getMonthBoundaries(viewDate);
  const canClearMonth = state.periodHistory.some(
    (range) => {
      const start = range.startDate;
      const end = range.endDate || range.startDate;
      return !(start > monthEnd || end < monthStart);
    }
  );

  const isLastStep = state.step === ONBOARDING_STEPS;
  const progress = state.step > 1 ? ((state.step - 1) / (ONBOARDING_STEPS - 1)) * 100 : 0;
  const showHeader = state.step > 1;

  const cute = useMemo(() => CUTE_HEADINGS[Math.floor(Math.random() * CUTE_HEADINGS.length)], []);

  if (showComplete) {
    return (
      <SafeAreaView className="flex-1 bg-rove-cream" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeInUp.delay(200).duration(800)} className="items-center">
            <Image
              source={require('../../assets/images/splash-mark.png')}
              className="mb-10 h-12 w-12 opacity-80"
              resizeMode="contain"
            />
            <View className="mb-8 rounded-full border border-rove-charcoal/20 px-4 py-1.5">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">
                Biology First
              </Text>
            </View>
            <Text
              className="mb-2 text-center text-3xl text-rove-charcoal"
              style={{ fontFamily: 'CormorantGaramond-Medium' }}
            >
              {cute.pt1}
            </Text>
            <Text
              className="mb-8 text-center text-4xl italic text-rove-peach"
              style={{ fontFamily: 'CormorantGaramond-Medium' }}
            >
              {cute.pt2}
            </Text>
            <Text className="mb-12 max-w-[320px] text-center text-sm font-medium leading-relaxed text-rove-stone">
              {cute.desc}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/intro/phase-menstrual')}
              className="w-full rounded-full bg-rove-charcoal py-4"
              style={{ minWidth: 280 }}
            >
              <Text className="text-center text-base font-semibold text-rove-cream">
                Continue
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-rove-cream" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {showHeader ? (
          <View className="px-5 pb-2 pt-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
                {STEP_LABELS[state.step - 1]}
              </Text>
              <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
                {state.step - 1} of {ONBOARDING_STEPS - 1}
              </Text>
            </View>
            <View className="h-[3px] overflow-hidden rounded-full bg-rove-charcoal/10">
              <View className="h-full rounded-full bg-rove-charcoal" style={{ width: `${progress}%` }} />
            </View>
          </View>
        ) : null}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View key={state.step} entering={FadeIn.duration(250)} className="flex-1">
            {state.step === 1 && <StepIntro />}

            {state.step === 2 && (
              <StepWelcome
                name={state.name}
                dateOfBirth={state.dateOfBirth}
                onNameChange={(value) => dispatch({ type: 'set_name', name: value })}
                onDobChange={(value) => dispatch({ type: 'set_dob', dob: value })}
                errors={state.errors}
              />
            )}

            {state.step === 3 && (
              <StepHistory
                viewDate={viewDate}
                periodHistory={state.periodHistory}
                isSelectingRangeEnd={hasOpenRange}
                autoStats={autoStats}
                cycleLength={state.cycleLength}
                periodLength={state.periodLength}
                error={state.errors.periodHistory}
                onMonthChange={(dateStr) => {
                  const parts = dateStr.split('-');
                  if (parts.length === 3) {
                    setViewDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1));
                  }
                }}
                onSelectDay={selectCalendarDay}
                onClearMonth={() => dispatch({ type: 'clear_month', monthStart, monthEnd })}
                canClearMonth={canClearMonth}
                onCycleLengthChange={(value) => dispatch({ type: 'set_cycle_length', value })}
                onPeriodLengthChange={(value) => dispatch({ type: 'set_period_length', value })}
              />
            )}

            {state.step === 4 && (
              <StepAboutYou
                conditions={state.conditions}
                symptoms={state.symptoms}
                heightCm={state.heightCm}
                weightKg={state.weightKg}
                dietPreference={state.dietPreference}
                onToggleCondition={(condition) => dispatch({ type: 'toggle_condition', condition })}
                onToggleSymptom={(symptom) => dispatch({ type: 'toggle_symptom', symptom })}
                onHeightChange={(value) => dispatch({ type: 'set_height', value })}
                onWeightChange={(value) => dispatch({ type: 'set_weight', value })}
                onDietChange={(value) => dispatch({ type: 'set_diet', value })}
                errors={state.errors}
              />
            )}

            {state.step === 5 && (
              <StepGoals
                selectedGoals={state.goals}
                trackerMode={state.trackerMode}
                privacyConsented={state.privacyConsented}
                onToggleGoal={(goalId) => dispatch({ type: 'toggle_goal', goalId })}
                onTrackerModeChange={(value) => dispatch({ type: 'set_tracker_mode', value })}
                onPrivacyConsentChange={(value) => dispatch({ type: 'set_privacy_consent', value })}
                errors={state.errors}
              />
            )}

            {state.errors.form ? (
              <Animated.View
                entering={FadeInDown.duration(250)}
                className="mt-4 rounded-2xl border border-rove-red/20 bg-rove-red/10 px-4 py-3"
              >
                <Text className="text-sm text-rove-red">{state.errors.form}</Text>
              </Animated.View>
            ) : null}
          </Animated.View>
        </ScrollView>

        <View className="border-t border-rove-charcoal/5 bg-rove-cream px-5 py-4">
          <View className="flex-row items-center justify-between">
            {state.step > 1 ? (
              <TouchableOpacity
                onPress={goBackStep}
                disabled={isPending}
                className="flex-row items-center gap-1 rounded-xl px-3 py-2.5"
                style={{ opacity: isPending ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} color="#78716C" />
                <Text className="text-sm font-semibold text-rove-stone">Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleLogOut}
                disabled={isPending}
                className="rounded-xl px-3 py-2.5"
              >
                <Text className="text-sm font-semibold text-rove-stone">Log Out</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={isLastStep ? submit : goNextStep}
              disabled={isPending}
              className="flex-row items-center gap-2 rounded-full bg-rove-charcoal px-8 py-3.5"
              style={{ opacity: isPending ? 0.5 : 1 }}
            >
              <Text className="text-sm font-semibold text-rove-cream">
                {isLastStep
                  ? isPending
                    ? 'Saving...'
                    : 'Finish Setup'
                  : state.step === 1
                    ? 'Get Started'
                    : 'Continue'}
              </Text>
              {isLastStep ? (
                !isPending ? <Check size={16} color="#FAF7F2" /> : null
              ) : (
                <ArrowRight size={16} color="#FAF7F2" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
