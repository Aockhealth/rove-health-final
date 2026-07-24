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
  updateCycleSettings,
  requestPasswordReset,
  updateContactInfo,
  deleteUserAccount,
  type ProfileFormData,
  type ProfileCycleData,
} from '../../lib/profile';
import { CycleSignature, type ProfileTheme } from '../../components/profile/CycleSignature';
import { HealthPassport } from '../../components/profile/HealthPassport';
import { FocusGoals } from '../../components/profile/FocusGoals';
import { AccountSettings } from '../../components/profile/AccountSettings';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const PROFILE_THEMES: Record<string, ProfileTheme> = {
  Menstrual: { accentColor: '#AF6B6B', badgeBg: 'rgba(175,107,107,0.10)', badgeText: '#AF6B6B' },
  Follicular: { accentColor: '#0F766E', badgeBg: 'rgba(20,184,166,0.10)', badgeText: '#0F766E' },
  Ovulatory: { accentColor: '#B45309', badgeBg: 'rgba(251,191,36,0.12)', badgeText: '#B45309' },
  Luteal: { accentColor: '#4338CA', badgeBg: 'rgba(129,140,248,0.12)', badgeText: '#4338CA' },
};

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-widest text-stone-400">{label}</Text>
        <Text className="text-base font-bold text-stone-800">{value} Days</Text>
      </View>
      <View className="flex-row items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/50 px-2 py-2">
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-9 w-9 items-center justify-center rounded-xl bg-white"
          style={{ opacity: value <= min ? 0.3 : 1 }}
        >
          <Minus size={16} color="#37332E" />
        </TouchableOpacity>
        <View className="h-1.5 flex-1 mx-3 overflow-hidden rounded-full bg-stone-200">
          <View
            className="h-full rounded-full bg-stone-800"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </View>
        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-9 w-9 items-center justify-center rounded-xl bg-white"
          style={{ opacity: value >= max ? 0.3 : 1 }}
        >
          <Plus size={16} color="#37332E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleSaveCycle = async () => {
    setIsPending(true);
    const res = await updateCycleSettings({
      last_period_start: cycleData.last_period_start,
      cycle_length_days: cycleData.cycle_length_days,
      period_length_days: cycleData.period_length_days,
      is_irregular: formData.is_irregular,
    });
    setIsPending(false);
    if (res.error) {
      toast.error('Failed to update cycle', { description: res.error });
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success('Cycle settings updated');
    invalidateAppData();
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

  const handleAccountDeletion = async () => {
    setIsPending(true);
    const res = await deleteUserAccount();
    setIsPending(false);
    if (res.error) {
      toast.error('Failed to delete account', { description: res.error });
      return;
    }
    queryClient.clear();
    toast.success('Account deleted. Goodbye.');
    router.replace('/(auth)/login');
  };

  let parsedDate = new Date();
  if (cycleData.last_period_start) {
    const [y, m, d] = cycleData.last_period_start.split('-').map(Number);
    if (y && m && d) {
      parsedDate = new Date(y, m - 1, d);
    }
  }

  const handleDateConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setCycleData((p) => ({
      ...p,
      last_period_start: `${year}-${month}-${day}`,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-rove-cream items-center justify-center">
        <Text className="text-xs font-bold uppercase tracking-widest text-stone-300">Loading...</Text>
      </SafeAreaView>
    );
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
                  elevation: 3,
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
                className="mb-6 text-xl text-stone-800"
                style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
              >
                Cycle Settings
              </Text>
              <View className="gap-6">
                <Stepper
                  label="Cycle Length"
                  value={cycleData.cycle_length_days}
                  min={21}
                  max={45}
                  onChange={(v) => setCycleData((p) => ({ ...p, cycle_length_days: v }))}
                />
                <Stepper
                  label="Period Length"
                  value={cycleData.period_length_days}
                  min={2}
                  max={10}
                  onChange={(v) => setCycleData((p) => ({ ...p, period_length_days: v }))}
                />

                <View className="gap-2">
                  <Text className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Last Period Start
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center h-14 w-full rounded-[20px] border border-stone-100 bg-stone-50/50 px-5"
                  >
                    <Text className="flex-1 text-[15px] font-bold text-stone-800">
                      {cycleData.last_period_start ? parsedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={showDatePicker}
                    mode="date"
                    date={parsedDate}
                    maximumDate={new Date()}
                    onConfirm={handleDateConfirm}
                    onCancel={() => setShowDatePicker(false)}
                    confirmTextIOS="Confirm"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Cycle Regularity
                  </Text>
                  <SegmentedControl
                    tabs={[
                      { id: 'regular', label: 'Regular' },
                      { id: 'irregular', label: 'Irregular' },
                    ]}
                    activeTab={formData.is_irregular ? 'irregular' : 'regular'}
                    onChange={(id) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData((p) => ({ ...p, is_irregular: id === 'irregular' }));
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveCycle}
                  disabled={isPending}
                  className="items-center rounded-xl bg-stone-900 py-4"
                  style={{ opacity: isPending ? 0.5 : 1 }}
                >
                  <Text className="text-sm font-bold tracking-wide text-white">Update Cycle</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FocusGoals
              goals={formData.goals}
              trackerMode={formData.tracker_mode}
              onToggleGoal={handleToggleGoal}
              onTrackerModeChange={(mode) => saveProfileFields({ tracker_mode: mode })}
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
              onDeleteAccount={handleAccountDeletion}
              onClearLocalData={() => {
                queryClient.clear();
                toast.success('Local data cleared', {
                  description: 'Cached data has been removed from this device.',
                });
              }}
              isPending={isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
