import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Minus, Plus } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
  fetchProfilePageData,
  updateUserProfile,
  updateContactInfo,
  deleteUserAccount,
  type ProfileFormData,
  type ProfileCycleData,
} from '../../lib/profile';
import { CycleSignature, type ProfileTheme } from '../../components/profile/CycleSignature';
import { phaseThemes } from '../../data/home-content';
import { HealthPassport } from '../../components/profile/HealthPassport';
import { FocusGoals } from '../../components/profile/FocusGoals';
import { AccountSettings } from '../../components/profile/AccountSettings';
import { HealthPlatformSync } from '../../components/profile/HealthPlatformSync';
import { PartnerShareCard } from '../../components/profile/PartnerShareCard';
import { Select } from '../../components/ui/Select';
import { syncBbtReminder } from '../../lib/notifications';
import { hasPcosFlag, withoutLegacyPcosGoal } from '../../lib/pcos';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { getLocalizedFontFamily } from '../../lib/fonts';

// Derived from the app's single real phase palette (phaseThemes) instead of a
// second hand-typed color list — this badge/avatar ring needs to match the same
// phase colors shown by the dots in CycleSignature and everywhere else in the app.
const PROFILE_THEMES: Record<string, ProfileTheme> = Object.fromEntries(
  Object.entries(phaseThemes).map(([name, tokens]) => [
    name,
    { accentColor: tokens.color, badgeBg: tokens.iconBg, badgeText: tokens.textColor },
  ]),
);

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    tracker_mode: 'menstruation',
    goals: [],
    conditions: [],
    weight: 0,
    height: 0,
    activity_level: 'moderate',
    diet_preference: 'non_veg',
    is_irregular: false,
    phone_number: '',
  });
  const [cycleData, setCycleData] = useState<ProfileCycleData>({
    last_period_start: '',
    cycle_length_days: 28,
    period_length_days: 5,
  });
  const [unifiedPhase, setUnifiedPhase] = useState('Menstrual');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchProfilePageData();
      if (cancelled) return;
      if (data) {
        setUserEmail(data.user.email);
        // Self-heals accounts that already have a stale legacy 'pcos' goal
        // (see withoutLegacyPcosGoal) from before this screen offered any
        // way to clear one — otherwise an account that removed PMOS from
        // conditions before this fix shipped would stay stuck showing
        // PCOS-gated content forever, since there's nothing left to tap to
        // re-trigger handleConditionsChange's cleanup.
        const stillHasPcosInConditions = hasPcosFlag([], data.formData.conditions);
        const cleanedGoals = stillHasPcosInConditions
          ? data.formData.goals
          : withoutLegacyPcosGoal(data.formData.goals);
        const cleanedFormData = { ...data.formData, goals: cleanedGoals };
        setFormData(cleanedFormData);
        if (cleanedGoals.length !== data.formData.goals.length) {
          updateUserProfile(cleanedFormData).then((res) => {
            if (!res.error) queryClient.invalidateQueries({ queryKey: ['trackerData'] });
          });
        }
        setCycleData(data.cycleData);
        setUnifiedPhase(data.smartPhase);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const theme = PROFILE_THEMES[unifiedPhase] || PROFILE_THEMES.Menstrual;

  const invalidateAppData = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['profile-avatar'] });
    queryClient.invalidateQueries({ queryKey: ['plan'] });
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    queryClient.invalidateQueries({ queryKey: ['trackerData'] });
  };

  const handleSaveProfile = async () => {
    setIsPending(true);
    const res = await updateUserProfile(formData);
    setIsPending(false);
    if (res.error) {
      toast.error(t('profile.screen.saveProfileFailed'), { description: res.error });
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success(t('profile.screen.profileUpdated'));
    invalidateAppData();
  };

  // Autosaves a single field the moment it changes (goal chips, tracker mode)
  // rather than waiting for the unrelated "Save Passport Data" button below.
  const saveProfileFields = async (overrides: Partial<ProfileFormData>) => {
    const next = { ...formData, ...overrides };
    setFormData(next);
    setIsPending(true);
    const res = await updateUserProfile(next);
    setIsPending(false);
    if (res.error) {
      toast.error(t('profile.screen.saveFailed'), { description: res.error });
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    invalidateAppData();
  };

  const handleToggleGoal = (goalId: string) => {
    const nextGoals = formData.goals.includes(goalId)
      ? formData.goals.filter((g) => g !== goalId)
      : [...formData.goals, goalId];
    saveProfileFields({ goals: nextGoals });
  };

  // Same autosave-on-change pattern as goals — a condition tap (PMOS,
  // Endometriosis, etc.) should take effect immediately, not wait for a
  // separate "Save Passport Data" tap she might not know to make.
  //
  // Also clears any legacy 'pcos' goal (see withoutLegacyPcosGoal) once PMOS
  // is no longer in conditions — otherwise removing PMOS here silently does
  // nothing for a pre-Health-Passport-era user, since hasPcosFlag still
  // counts the old goal chip and PCOS-gated content (like Tracker's
  // fertility card) keeps showing.
  const handleConditionsChange = (nextConditions: string[]) => {
    const stillHasPcos = hasPcosFlag([], nextConditions);
    const nextGoals = stillHasPcos ? formData.goals : withoutLegacyPcosGoal(formData.goals);
    saveProfileFields({ conditions: nextConditions, goals: nextGoals });
  };

  const handleUpdateContact = async (newEmail: string, newPhone: string) => {
    setIsPending(true);
    const res = await updateContactInfo(newEmail, newPhone);
    setIsPending(false);
    if (res.error) {
      toast.error(t('profile.screen.updateFailed'), { description: res.error });
      return;
    }
    toast.success(t('profile.screen.contactUpdated'), {
      description: t('profile.screen.contactUpdatedDescription'),
    });
    setFormData((prev) => ({ ...prev, phone_number: newPhone }));
  };

  const handleLogout = async () => {
    queryClient.clear();
    const { unregisterHealthBackgroundSync } = await import('../../lib/healthBackgroundSync');
    await unregisterHealthBackgroundSync().catch(() => {});
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = async () => {
    setIsPending(true);
    const res = await deleteUserAccount();
    if (res.error) {
      toast.error(t('profile.screen.deleteAccountFailed'), { description: res.error });
      setIsPending(false);
      return;
    }
    queryClient.clear();
    const { unregisterHealthBackgroundSync } = await import('../../lib/healthBackgroundSync');
    await unregisterHealthBackgroundSync().catch(() => {});
    router.replace('/(auth)/login');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-rove-cream" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-white/40 bg-white/60 px-6 pb-4 pt-2">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2">
          <ChevronLeft size={20} color="#A8A29E" />
        </TouchableOpacity>
        <Text className="text-xs font-bold uppercase tracking-widest text-stone-500">{t('profile.screen.title')}</Text>
        <View className="w-9" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.duration(400)} className="mb-12 items-center">
            <View className="relative mb-6">
              <View
                className="h-28 w-28 items-center justify-center rounded-full bg-white"
                style={{
                  borderWidth: 8,
                  borderColor: theme.badgeBg,
                  shadowColor: '#000',
                  shadowOpacity: 0.07,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 0,
                }}
              >
                <Text
                  className="text-4xl text-stone-700"
                  style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
                >
                  {formData.full_name?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            </View>

            <TextInput
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              onBlur={handleSaveProfile}
              placeholder={t('profile.screen.namePlaceholder')}
              placeholderTextColor="#A8A29E"
              className="w-full text-center text-3xl text-stone-800"
              style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
            />
          </Animated.View>

          <View className="gap-6">
            <CycleSignature
              cycleLength={cycleData.cycle_length_days}
              periodLength={cycleData.period_length_days}
              isIrregular={formData.is_irregular}
              phaseName={unifiedPhase}
              theme={theme}
            />

            <View className="rounded-[2rem] border border-white/60 bg-white/70 p-6">
              <Text
                className="mb-2 text-xl text-stone-800"
                style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
              >
                {t('profile.screen.trackingMode.title')}
              </Text>
              <Text className="mb-4 text-xs leading-relaxed text-stone-500">
                {t('profile.screen.trackingMode.description')}
              </Text>
              <Select
                title={t('profile.screen.trackingMode.title')}
                // TTC and Menopause are temporarily locked while they're
                // still being refined (see StepGoals.tsx's onboarding-side
                // lock). Only offered here if that's already the account's
                // current mode, so an existing TTC/Menopause user keeps
                // seeing their own setting correctly rather than it looking
                // unset — but once they switch away, the option is gone
                // until this is lifted.
                options={[
                  { value: 'menstruation', label: t('profile.screen.trackingMode.tabs.cycle') },
                  ...(formData.tracker_mode === 'ttc' ? [{ value: 'ttc', label: t('profile.screen.trackingMode.tabs.conceiving') }] : []),
                  ...(formData.tracker_mode === 'menopause' ? [{ value: 'menopause', label: t('profile.screen.trackingMode.tabs.menopause') }] : []),
                ]}
                value={formData.tracker_mode}
                onValueChange={(id) => {
                  if (id === formData.tracker_mode) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  saveProfileFields({ tracker_mode: id as typeof formData.tracker_mode });
                  // Turning Conceiving mode on schedules the morning
                  // temperature reminder (and asks for permission the first
                  // time); turning it off cancels it, without prompting.
                  syncBbtReminder(id);
                }}
              />

              {/* Also drives Tracker's fertility card (see showFertilityTracking
                  in app/(app)/tracker.tsx) — surfaced here so it's visible and
                  editable instead of a value onboarding set once and forgot. */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  saveProfileFields({ is_irregular: !formData.is_irregular });
                }}
                activeOpacity={0.85}
                className="mt-4 flex-row items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/50 p-3.5"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-semibold text-stone-700">
                    {t('profile.screen.trackingMode.irregularToggle.label')}
                  </Text>
                  <Text className="mt-0.5 text-xs leading-relaxed text-stone-400">
                    {t('profile.screen.trackingMode.irregularToggle.description')}
                  </Text>
                </View>
                <View
                  className={`h-6 w-11 justify-center rounded-full p-0.5 ${
                    formData.is_irregular ? 'bg-stone-800' : 'bg-stone-200'
                  }`}
                >
                  <View
                    className="h-5 w-5 rounded-full bg-white"
                    style={{ marginLeft: formData.is_irregular ? 20 : 0 }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <FocusGoals
              goals={formData.goals}
              onToggleGoal={handleToggleGoal}
              theme={theme}
            />

            <HealthPassport
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveProfile}
              onConditionsChange={handleConditionsChange}
              isPending={isPending}
              theme={theme}
            />

            <HealthPlatformSync />

            {formData.tracker_mode === 'ttc' ? <PartnerShareCard /> : null}

            <AccountSettings
              name={formData.full_name}
              email={userEmail}
              phone={formData.phone_number}
              onLogout={handleLogout}
              onUpdateContact={handleUpdateContact}
              onDeleteAccount={handleDeleteAccount}
              isPending={isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
