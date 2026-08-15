import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Mail,
  LogOut,
  ChevronRight,
  FileText,
  ScrollText,
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface AccountSettingsProps {
  email: string;
  phone?: string;
  onLogout: () => void;
  onResetPassword: () => void;
  onUpdateContact: (email: string, phone: string) => void;
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
  email,
  phone,
  onLogout,
  onResetPassword,
  onUpdateContact,
  isPending,
}: AccountSettingsProps) {
  const router = useRouter();
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone || '');

  const handleContactSave = () => {
    if (editEmail && (editEmail !== email || editPhone !== phone)) {
      onUpdateContact(editEmail, editPhone);
    }
    setIsEditingContact(false);
  };

  return (
    <View className="gap-6">
      <Text
        className="px-2 text-lg text-stone-800"
        style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
      >
        Account Management
      </Text>

      <View className="overflow-hidden rounded-2xl border border-white/50 bg-white/60">
        <View className="border-b border-stone-100">
          <Row
            Icon={Mail}
            title="Contact Information"
            subtitle={`${email} ${phone ? `• ${phone}` : '• No phone added'}`}
            onPress={!isEditingContact ? () => setIsEditingContact(true) : undefined}
            showChevron={!isEditingContact}
          />
          {isEditingContact ? (
            <Animated.View entering={FadeIn.duration(200)} className="gap-3 px-4 pb-4">
              <View>
                <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Email
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
                  Phone
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
                  <Text className="text-xs font-bold uppercase tracking-widest text-white">Save</Text>
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
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : null}
        </View>

        <View className="border-b border-stone-100">
          <Row
            Icon={Shield}
            title="Login & Security"
            subtitle="Request Password Reset"
            onPress={onResetPassword}
          />
        </View>

        <View className="border-b border-stone-100">
          <Row
            Icon={FileText}
            title="Privacy Policy"
            subtitle="How your data is handled, and account deletion"
            onPress={() => router.push('/privacy')}
          />
        </View>

        <View>
          <Row
            Icon={ScrollText}
            title="Terms & Conditions"
            subtitle="The terms you agreed to"
            onPress={() => router.push('/terms')}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={onLogout}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-phase-menstrual/20 py-4"
      >
        <LogOut size={16} color="#AF6B6B" />
        <Text className="text-sm font-semibold text-phase-menstrual">Sign Out</Text>
      </TouchableOpacity>

      <View className="items-center gap-2">
        <Text className="text-[10px] font-medium uppercase tracking-[3px] text-stone-300">
          Rove Health v1.0.2
        </Text>
      </View>
    </View>
  );
}
