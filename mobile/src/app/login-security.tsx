import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, User, Mail, LogOut, ShieldCheck, KeyRound, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { requestPasswordReset, verifyPasswordResetOtp, updatePassword } from '../lib/profile';

const RESEND_COOLDOWN_SECONDS = 30;
const MIN_PASSWORD_LENGTH = 8;

type Step = 'default' | 'code' | 'newPassword' | 'success';

function Row({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 p-4">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-stone-100">
        <Icon size={16} color="#78716C" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</Text>
        <Text className="text-sm font-semibold text-stone-800" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function LoginSecurityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { name, email } = useLocalSearchParams<{ name?: string; email?: string }>();
  const displayName = name || '';
  const displayEmail = email || '';

  const [step, setStep] = useState<Step>('default');
  const [sending, setSending] = useState(false);

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    queryClient.clear();
    const { unregisterHealthBackgroundSync } = await import('../lib/healthBackgroundSync');
    await unregisterHealthBackgroundSync().catch(() => {});
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const handleSendCode = async () => {
    if (!displayEmail) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    const res = await requestPasswordReset(displayEmail);
    setSending(false);
    if (res.error) {
      toast.error(t('profile.loginSecurity.forgotPassword.sendFailed'), { description: res.error });
      return;
    }
    setStep('code');
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !displayEmail) return;
    setResending(true);
    const res = await requestPasswordReset(displayEmail);
    setResending(false);
    if (res.error) {
      toast.error(t('profile.loginSecurity.forgotPassword.sendFailed'), { description: res.error });
      return;
    }
    toast.success(t('profile.loginSecurity.forgotPassword.resendSent'));
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleVerify = async () => {
    if (code.trim().length < 6) {
      toast.error(t('profile.loginSecurity.forgotPassword.invalidCode'));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVerifying(true);
    const res = await verifyPasswordResetOtp(displayEmail, code.trim());
    setVerifying(false);
    if (res.error) {
      toast.error(t('profile.loginSecurity.forgotPassword.verifyFailed'), { description: res.error });
      return;
    }
    setStep('newPassword');
  };

  const handleSavePassword = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(t('profile.loginSecurity.forgotPassword.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.loginSecurity.forgotPassword.passwordMismatch'));
      return;
    }
    setSaving(true);
    const res = await updatePassword(newPassword);
    setSaving(false);
    if (res.error) {
      toast.error(t('profile.loginSecurity.forgotPassword.saveFailed'), { description: res.error });
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep('success');
  };

  const resetFlow = () => {
    setStep('default');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <View className="flex-row items-center px-4 py-3 border-b border-rove-stone/10">
        <TouchableOpacity
          onPress={() => (step === 'default' ? router.back() : resetFlow())}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-rove-stone/10"
        >
          <ChevronLeft size={24} color="#37332E" />
        </TouchableOpacity>
        <Text className="text-lg text-rove-charcoal ml-2" style={{ fontFamily: 'Raleway-Medium' }}>
          {t('profile.loginSecurity.headerTitle')}
        </Text>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {step === 'default' ? (
            <View className="gap-6">
              <View className="overflow-hidden rounded-2xl border border-white/50 bg-white/60">
                <View className="border-b border-stone-100">
                  <Row Icon={User} label={t('profile.loginSecurity.nameLabel')} value={displayName} />
                </View>
                <View>
                  <Row Icon={Mail} label={t('profile.loginSecurity.emailLabel')} value={displayEmail} />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={sending}
                className="flex-row items-center justify-between rounded-2xl border border-white/50 bg-white/60 p-4"
                style={{ opacity: sending ? 0.6 : 1 }}
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-stone-100">
                    <ShieldCheck size={16} color="#78716C" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-stone-700">{t('profile.loginSecurity.forgotPassword.rowTitle')}</Text>
                    <Text className="text-xs text-stone-400">
                      {sending ? t('profile.loginSecurity.forgotPassword.sending') : t('profile.loginSecurity.forgotPassword.rowSubtitle')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center justify-center gap-2 rounded-xl border border-phase-menstrual/20 py-4"
              >
                <LogOut size={16} color="#AF6B6B" />
                <Text className="text-sm font-semibold text-phase-menstrual">{t('profile.loginSecurity.signOut')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {step === 'code' ? (
            <View className="gap-5">
              <View className="items-center mt-4 mb-2">
                <View className="w-16 h-16 bg-phase-follicular/10 rounded-full items-center justify-center border border-phase-follicular/20 mb-4">
                  <KeyRound size={28} color="#8DAA9D" />
                </View>
                <Text className="text-2xl text-rove-charcoal mb-2 text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {t('profile.loginSecurity.forgotPassword.codeSentTitle')}
                </Text>
                <Text className="text-sm text-rove-stone text-center leading-relaxed">
                  {t('profile.loginSecurity.forgotPassword.codeSentBody', { email: displayEmail })}
                </Text>
              </View>

              <Input
                className="bg-white h-14 rounded-2xl text-center text-2xl font-semibold tracking-[5px]"
                placeholder={t('profile.loginSecurity.forgotPassword.codePlaceholder')}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 8))}
                keyboardType="number-pad"
                maxLength={8}
              />

              <Button onPress={handleVerify} disabled={verifying} className="w-full h-14 rounded-full bg-rove-charcoal">
                <Text className="text-rove-cream font-semibold text-lg">
                  {verifying ? t('profile.loginSecurity.forgotPassword.verifying') : t('profile.loginSecurity.forgotPassword.verify')}
                </Text>
              </Button>

              <TouchableOpacity onPress={handleResend} disabled={resending || resendCooldown > 0} className="items-center">
                <Text className={`text-sm font-semibold ${resending || resendCooldown > 0 ? 'text-rove-stone/50' : 'text-rove-stone'}`}>
                  {resendCooldown > 0
                    ? t('profile.loginSecurity.forgotPassword.resendCooldown', { seconds: resendCooldown })
                    : t('profile.loginSecurity.forgotPassword.resend')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {step === 'newPassword' ? (
            <View className="gap-5">
              <View className="items-center mt-4 mb-2">
                <View className="w-16 h-16 bg-phase-follicular/10 rounded-full items-center justify-center border border-phase-follicular/20 mb-4">
                  <ShieldCheck size={28} color="#8DAA9D" />
                </View>
                <Text className="text-2xl text-rove-charcoal mb-2 text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {t('profile.loginSecurity.forgotPassword.newPasswordTitle')}
                </Text>
                <Text className="text-sm text-rove-stone text-center leading-relaxed">
                  {t('profile.loginSecurity.forgotPassword.newPasswordBody')}
                </Text>
              </View>

              <View>
                <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">
                  {t('profile.loginSecurity.forgotPassword.newPasswordLabel')}
                </Text>
                <Input
                  className="bg-white h-12 rounded-2xl"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View>
                <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">
                  {t('profile.loginSecurity.forgotPassword.confirmPasswordLabel')}
                </Text>
                <Input
                  className="bg-white h-12 rounded-2xl"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Button onPress={handleSavePassword} disabled={saving} className="w-full h-14 rounded-full bg-rove-charcoal">
                <Text className="text-rove-cream font-semibold text-lg">
                  {saving ? t('profile.loginSecurity.forgotPassword.saving') : t('profile.loginSecurity.forgotPassword.savePassword')}
                </Text>
              </Button>
            </View>
          ) : null}

          {step === 'success' ? (
            <View className="items-center mt-10 gap-4">
              <View className="w-16 h-16 bg-rove-green/10 rounded-full items-center justify-center border border-rove-green/20">
                <Check size={28} color="#5B9A8B" />
              </View>
              <Text className="text-2xl text-rove-charcoal text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                {t('profile.loginSecurity.forgotPassword.successTitle')}
              </Text>
              <Text className="text-sm text-rove-stone text-center leading-relaxed">
                {t('profile.loginSecurity.forgotPassword.successBody')}
              </Text>
              <Button onPress={resetFlow} className="w-full h-14 rounded-full bg-rove-charcoal mt-2">
                <Text className="text-rove-cream font-semibold text-lg">{t('profile.loginSecurity.forgotPassword.done')}</Text>
              </Button>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
