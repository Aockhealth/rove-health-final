import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Mail,
  LogOut,
  ChevronRight,
  FileText,
  ScrollText,
  Trash2,
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../ui/SegmentedControl';
import { setAppLanguage, type SupportedLanguage } from '../../lib/i18n';
import { getLocalizedFontFamily } from '../../lib/fonts';

interface AccountSettingsProps {
  name: string;
  email: string;
  phone?: string;
  onLogout: () => void;
  onUpdateContact: (email: string, phone: string) => void;
  onDeleteAccount: () => void;
  isPending?: boolean;
}

function Row({
  Icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  subtitle: string;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between p-4"
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-stone-100">
          <Icon size={16} color="#78716C" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-stone-700">{title}</Text>
          <Text className="text-xs text-stone-400" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>
      {showChevron ? <ChevronRight size={16} color="#D6D3D1" /> : null}
    </TouchableOpacity>
  );
}

export function AccountSettings({
  name,
  email,
  phone,
  onLogout,
  onUpdateContact,
  onDeleteAccount,
  isPending,
}: AccountSettingsProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone || '');
  const [languageChanging, setLanguageChanging] = useState(false);

  const handleContactSave = () => {
    if (editEmail && (editEmail !== email || editPhone !== phone)) {
      onUpdateContact(editEmail, editPhone);
    }
    setIsEditingContact(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.account.deleteAccount.confirmTitle'),
      t('profile.account.deleteAccount.confirmMessage'),
      [
        { text: t('common.buttons.cancel'), style: 'cancel' },
        {
          text: t('profile.account.deleteAccount.confirmButton'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('profile.account.deleteAccount.finalConfirmTitle'),
              t('profile.account.deleteAccount.finalConfirmMessage'),
              [
                { text: t('common.buttons.cancel'), style: 'cancel' },
                {
                  text: t('profile.account.deleteAccount.finalConfirmButton'),
                  style: 'destructive',
                  onPress: onDeleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Hindi is locked (see the SegmentedControl's disabledTabs below) while
  // its translations are still being finished — this guard is defense in
  // depth, since the control itself already blocks the tap.
  const handleLanguageChange = async (id: string) => {
    if (languageChanging || id === i18n.language || id === 'hi') return;
    setLanguageChanging(true);
    await setAppLanguage(id as SupportedLanguage);
    setLanguageChanging(false);
  };

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text
          className="px-2 text-lg text-stone-800"
          style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
        >
          {t('profile.language.title')}
        </Text>
        <SegmentedControl
          className="mx-2"
          tabs={[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिंदी' },
          ]}
          activeTab={i18n.language}
          onChange={handleLanguageChange}
          disabledTabs={['hi']}
          disabledBadgeText={t('profile.language.comingSoon')}
        />
        <Text className="px-2 text-xs text-stone-400">{t('profile.language.restartNote')}</Text>
      </View>

      <Text
        className="px-2 text-lg text-stone-800"
        style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
      >
        {t('profile.account.title')}
      </Text>

      <View className="overflow-hidden rounded-2xl border border-white/50 bg-white/60">
        <View className="border-b border-stone-100">
          <Row
            Icon={Mail}
            title={t('profile.account.contactInfo.title')}
            subtitle={phone ? `${email} • ${phone}` : `${email} • ${t('profile.account.contactInfo.noPhone')}`}
            onPress={!isEditingContact ? () => setIsEditingContact(true) : undefined}
            showChevron={!isEditingContact}
          />
          {isEditingContact ? (
            <Animated.View entering={FadeIn.duration(200)} className="gap-3 px-4 pb-4">
              <View>
                <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {t('profile.account.contactInfo.email')}
                </Text>
                <TextInput
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  className="rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3 text-sm text-stone-800"
                />
              </View>
              <View>
                <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {t('profile.account.contactInfo.phone')}
                </Text>
                <TextInput
                  keyboardType="phone-pad"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="+91 9876543210"
                  placeholderTextColor="#A8A29E"
                  className="rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3 text-sm text-stone-800"
                />
              </View>
              <View className="flex-row gap-2 pt-1">
                <TouchableOpacity
                  onPress={handleContactSave}
                  disabled={isPending}
                  className="flex-1 items-center rounded-xl bg-stone-900 py-2.5"
                  style={{ opacity: isPending ? 0.5 : 1 }}
                >
                  <Text className="text-xs font-bold uppercase tracking-widest text-white">{t('common.buttons.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingContact(false);
                    setEditEmail(email);
                    setEditPhone(phone || '');
                  }}
                  className="flex-1 items-center rounded-xl border border-stone-200 py-2.5"
                >
                  <Text className="text-xs font-bold uppercase tracking-widest text-stone-600">
                    {t('common.buttons.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : null}
        </View>

        <View className="border-b border-stone-100">
          <Row
            Icon={Shield}
            title={t('profile.account.security.title')}
            subtitle={t('profile.account.security.subtitle')}
            onPress={() => router.push({ pathname: '/login-security', params: { name, email } })}
          />
        </View>

        <View className="border-b border-stone-100">
          <Row
            Icon={FileText}
            title={t('profile.account.privacyPolicy.title')}
            subtitle={t('profile.account.privacyPolicy.subtitle')}
            onPress={() => router.push('/privacy')}
          />
        </View>

        <View>
          <Row
            Icon={ScrollText}
            title={t('profile.account.terms.title')}
            subtitle={t('profile.account.terms.subtitle')}
            onPress={() => router.push('/terms')}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={onLogout}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-phase-menstrual/20 py-4"
      >
        <LogOut size={16} color="#AF6B6B" />
        <Text className="text-sm font-semibold text-phase-menstrual">{t('profile.account.signOut')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDeleteAccount}
        disabled={isPending}
        className="flex-row items-center justify-center gap-2 rounded-xl bg-phase-menstrual/10 py-4"
        style={{ opacity: isPending ? 0.5 : 1 }}
      >
        <Trash2 size={16} color="#AF6B6B" />
        <Text className="text-sm font-semibold text-phase-menstrual">
          {isPending ? t('profile.account.deleteAccount.deleting') : t('profile.account.deleteAccount.title')}
        </Text>
      </TouchableOpacity>

      <View className="items-center gap-2">
        <Text className="text-[10px] font-medium uppercase tracking-[3px] text-stone-300">
          {t('profile.account.version', { version: '1.0.2' })}
        </Text>
      </View>
    </View>
  );
}
