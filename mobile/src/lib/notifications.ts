import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ── TODO (iOS): APNs credential setup ───────────────────────────────────────
// Everything in this file runs on both platforms — the Expo push token
// request, permission flow, and listeners are platform-agnostic. What's
// still missing for iOS specifically (needs the Apple Developer account,
// which nobody on this build has yet):
//   1. An APNs authentication key (.p8) generated in the Apple Developer
//      portal (Certificates, Identifiers & Profiles → Keys).
//   2. Upload that key to EAS: `eas credentials` → iOS → Push Notifications
//      → add the .p8 key + Key ID + Team ID. EAS then handles the
//      APNs↔Expo-push-service bridging automatically — no iOS-specific code
//      needed here beyond what's already written.
//   3. Until that's done, `registerForPushNotificationsAsync()` will still
//      run on iOS but `getExpoPushTokenAsync()` will fail/reject there,
//      since Expo's push service has no APNs credentials to hand back a
//      token with. Android is unaffected by this and can be wired up fully
//      now (see the FCM TODO below for what Android still needs).
// ─────────────────────────────────────────────────────────────────────────

// ── TODO (Android): Firebase project + FCM credentials ──────────────────────
// The client-side code below is complete, but two external, credential-gated
// steps still need to happen before a token can actually be generated or a
// remote push actually delivered — neither is something that can be done
// from inside this repo:
//   1. Create a Firebase project (or reuse an existing one), add an Android
//      app to it with package name `com.rovehealth.app` (matches app.json),
//      download `google-services.json`, and place it at `mobile/google-
//      services.json` (already referenced from app.json's android config).
//   2. Generate a Firebase service-account key (Project Settings → Service
//      accounts → Generate new private key) and upload it to EAS via
//      `eas credentials` → Android → Push Notifications (FCM V1) — this is
//      what lets Expo's push service actually deliver to FCM on your behalf.
//   3. IMPORTANT: Expo Go does not support remote push notifications on
//      Android as of SDK 53+ (this project is on SDK 54) — this is an Expo
//      Go limitation, not a bug in this code. To test a real remote push
//      end-to-end you need a development build:
//        eas build --profile development --platform android
//      or locally: `npx expo run:android` (requires Android Studio).
//      Local notifications (scheduleNotificationAsync) DO still work in
//      Expo Go right now, which is enough to verify the permission flow,
//      Android notification channel, and on-device display pipeline before
//      a dev build exists.
// ─────────────────────────────────────────────────────────────────────────

const DEVICE_ID_KEY = 'rove_device_id';

// How notifications behave while the app is in the foreground — without
// this, iOS/Android show nothing at all for a foreground push by default.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Platform.OS}-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export interface PushRegistrationResult {
  token: string | null;
  status: 'granted' | 'denied' | 'unavailable' | 'error';
  error?: string;
}

/**
 * Requests notification permission, sets up the Android notification
 * channel, and fetches an Expo push token. Safe to call on both platforms —
 * returns status: 'unavailable' on a simulator/emulator (push tokens
 * require a physical device) rather than throwing.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#AF6B6B',
    });
  }

  if (!Device.isDevice) {
    return { token: null, status: 'unavailable', error: 'Push tokens require a physical device (not a simulator/emulator).' };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { token: null, status: 'denied', error: 'Notification permission was not granted.' };
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return { token: null, status: 'error', error: 'No EAS projectId found in app config.' };
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token, status: 'granted' };
  } catch (e: any) {
    // Expected on iOS until the APNs key is uploaded to EAS (see TODO
    // above), and in Expo Go on Android (SDK 53+ blocks remote push there —
    // this call only succeeds in a dev/production build).
    return { token: null, status: 'error', error: e?.message || String(e) };
  }
}

/**
 * Upserts the token for this (user, device) pair. Call after a successful
 * registerForPushNotificationsAsync() once you have a logged-in user.
 */
export async function savePushToken(userId: string, token: string): Promise<{ error?: string }> {
  const deviceId = await getOrCreateDeviceId();
  const { error } = await supabase.from('user_push_tokens').upsert(
    {
      user_id: userId,
      expo_push_token: token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      device_id: deviceId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,device_id' }
  );
  if (error) {
    console.error('[notifications] Failed to save push token:', error.message);
    return { error: error.message };
  }
  return {};
}

/** Convenience wrapper: register + save in one call, swallowing (and logging) errors. */
export async function setupPushNotifications(userId: string): Promise<PushRegistrationResult> {
  const result = await registerForPushNotificationsAsync();
  if (result.token) {
    await savePushToken(userId, result.token);
  } else {
    console.warn('[notifications] Push registration incomplete:', result.status, result.error);
  }
  return result;
}

/**
 * Fires a local notification immediately — works in Expo Go right now (local
 * notifications aren't affected by the Android/Expo-Go remote-push
 * restriction), so this is the fastest way to confirm the permission flow,
 * Android channel, and foreground/background display are all wired
 * correctly before a dev build exists to test real remote push.
 */
export async function sendTestLocalNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rove',
      body: "This is a test notification — if you can see this, the display pipeline works.",
      sound: true,
    },
    trigger: null,
  });
}

/** Registers listeners for notifications received in the foreground and for
 * taps on a notification (background/killed → opened). Returns a cleanup
 * function — call it from a useEffect's return. */
export function addNotificationListeners(handlers: {
  onReceived?: (notification: Notifications.Notification) => void;
  onResponse?: (response: Notifications.NotificationResponse) => void;
}): () => void {
  const receivedSub = Notifications.addNotificationReceivedListener((n) => handlers.onReceived?.(n));
  const responseSub = Notifications.addNotificationResponseReceivedListener((r) => handlers.onResponse?.(r));
  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
