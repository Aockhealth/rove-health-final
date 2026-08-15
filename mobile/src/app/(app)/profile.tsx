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
import { supabase } from '../../lib/supabase';
import {
  fetchProfilePageData,
  updateUserProfile,
  requestPasswordReset,
  updateContactInfo,
  type ProfileFormData,
  type ProfileCycleData,
} from '../../lib/profile';
import { CycleSignature, type ProfileTheme } from '../../components/profile/CycleSignature';
import { phaseThemes } from '../../data/home-content';
import { HealthPassport } from '../../components/profile/HealthPassport';
import { FocusGoals } from '../../components/profile/FocusGoals';
import { AccountSettings } from '../../components/profile/AccountSettings';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { syncBbtReminder } from '../../lib/notifications';
import LoadingScreen from '../../components/ui/LoadingScreen';

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
        setFormData(data.formData);
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
      toast.error('Failed to save profile', { description: res.error });
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success('Profile updated');
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
      toast.error('Failed to save', { description: res.error });
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

  const handleUpdateContact = async (newEmail: string, newPhone: string) => {
    setIsPending(true);
    const res = await updateContactInfo(newEmail, newPhone);
    setIsPending(false);
    if (res.error) {
      toast.error('Update failed', { description: res.error });
      return;
    }
    toast.success('Contact info updated', {
      description: 'Please check your new email for a confirmation link.',
    });
    setFormData((prev) => ({ ...prev, phone_number: newPhone }));
  };

  const handleResetPassword = async () => {
    if (!userEmail) return;
    setIsPending(true);
    const res = await requestPasswordReset(userEmail);
    setIsPending(false);
    if (res.error) {
      toast.error('Failed to send reset email', { description: res.error });
      return;
    }
    toast.success('Password reset email sent');
  };

  const handleLogout = async () => {
    queryClient.clear();
    await supabase.auth.signOut();
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
        <Text className="text-xs font-bold uppercase tracking-widest text-stone-500">Profile</Text>
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
                  style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
                >
                  {formData.full_name?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            </View>

            <TextInput
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              onBlur={handleSaveProfile}
              placeholder="Your Name"
              placeholderTextColor="#A8A29E"
              className="w-full text-center text-3xl text-stone-800"
              style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
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
                style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
              >
                Tracking Mode
              </Text>
              <Text className="mb-4 text-xs leading-relaxed text-stone-500">
                Conceiving mode adds basal temperature and ovulation test logging, and detects your
                ovulation from them.
              </Text>
              <SegmentedControl
                tabs={[
                  { id: 'menstruation', label: 'Cycle' },
                  { id: 'ttc', label: 'Conceiving' },
                  { id: 'menopause', label: 'Menopause' },
                ]}
                activeTab={formData.tracker_mode}
                onChange={(id) => {
                  if (id === formData.tracker_mode) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  saveProfileFields({ tracker_mode: id });
                  // Turning Conceiving mode on schedules the morning
                  // temperature reminder (and asks for permission the first
                  // time); turning it off cancels it, without prompting.
                  syncBbtReminder(id);
                }}
              />
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
              isPending={isPending}
              theme={theme}
            />

            <AccountSettings
              email={userEmail}
              phone={formData.phone_number}
              onLogout={handleLogout}
              onResetPassword={handleResetPassword}
              onUpdateContact={handleUpdateContact}
              isPending={isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
