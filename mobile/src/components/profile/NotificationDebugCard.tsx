import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Bell, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import {
  registerForPushNotificationsAsync,
  sendTestLocalNotification,
  type PushRegistrationResult,
} from '../../lib/notifications';

const STATUS_COPY: Record<PushRegistrationResult['status'], { label: string; color: string }> = {
  granted: { label: 'Registered', color: '#4CAF50' },
  denied: { label: 'Permission denied', color: '#D32F2F' },
  unavailable: { label: 'Needs a physical device', color: '#F57C00' },
  error: { label: 'Not available yet', color: '#F57C00' },
};

/**
 * Dev/QA card for verifying push-notification setup on-device — not meant
 * to be a permanent user-facing settings item, just the fastest way to
 * confirm permission + token + local-display all work per platform while
 * the Android FCM / iOS APNs credential setup (see notifications.ts) is
 * still pending. Safe to leave in: it degrades to an honest status message
 * rather than crashing when a token can't be issued yet.
 */
export function NotificationDebugCard() {
  const [result, setResult] = useState<PushRegistrationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(setResult)
      .finally(() => setLoading(false));
  }, []);

  const handleCopyToken = async () => {
    if (result?.token) {
      await Clipboard.setStringAsync(result.token);
    }
  };

  const handleTestNotification = async () => {
    await sendTestLocalNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  const status = result ? STATUS_COPY[result.status] : null;

  return (
    <View className="gap-3">
      <Text
        className="px-2 text-lg text-stone-800"
        style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
      >
        Notifications (debug)
      </Text>

      <View className="rounded-2xl border border-white/50 bg-white/60 p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-stone-100">
            <Bell size={16} color="#78716C" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-stone-700">
              {Platform.OS === 'ios' ? 'iOS' : 'Android'} push status
            </Text>
            {loading ? (
              <Text className="text-xs text-stone-400">Checking...</Text>
            ) : (
              <Text className="text-xs font-semibold" style={{ color: status?.color }}>
                {status?.label}
              </Text>
            )}
          </View>
          {loading && <ActivityIndicator size="small" color="#A8A29E" />}
        </View>

        {result?.error ? (
          <Text className="text-[11px] text-stone-400 leading-relaxed">{result.error}</Text>
        ) : null}

        {result?.token ? (
          <TouchableOpacity
            onPress={handleCopyToken}
            className="flex-row items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2.5"
          >
            <Text className="flex-1 text-[10px] text-stone-500" numberOfLines={1}>
              {result.token}
            </Text>
            <Copy size={13} color="#A8A29E" />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={handleTestNotification}
          className="items-center rounded-xl bg-stone-900 py-2.5"
        >
          <Text className="text-xs font-bold uppercase tracking-widest text-white">
            {testSent ? 'Sent — check your notification shade' : 'Send Test Notification'}
          </Text>
        </TouchableOpacity>
        <Text className="text-[10px] text-stone-400 text-center leading-relaxed">
          This fires a local notification and works in Expo Go right now — it doesn't need FCM/APNs,
          it just confirms permission + display are wired correctly.
        </Text>
      </View>
    </View>
  );
}
