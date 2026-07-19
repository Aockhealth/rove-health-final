/**
 * ChatFAB — Floating AI Assistant Button
 *
 * ── HOW TO WIRE YOUR AI ASSISTANT ──────────────────────────────────────────
 *
 * Step 1 — Install your chat SDK (if web-based):
 *   npx expo install react-native-webview (already in package.json ✓)
 *
 * Step 2 — Drop your assistant URL/config into AI_ASSISTANT_CONFIG below.
 *
 * Step 3 — Choose an integration mode:
 *   a) Web embed: set mode = 'webview' and provide assistantUrl
 *      → Opens a WebView bottom sheet with your assistant web app
 *   b) Native SDK: set mode = 'native' and replace the body of
 *      handleOpen() with your SDK's open() call
 *      e.g. Intercom.present(), Drift.openChat(), etc.
 *   c) Internal screen: set mode = 'route' and provide assistantRoute
 *      → Uses expo-router to push to your chat screen
 *
 * Step 4 — Notification dot: set hasNotification={true} from your
 *   notification/badge state (e.g. unread messages count > 0).
 *
 * ────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// ─── AI Assistant Configuration ───────────────────────────────────────────────
// Step 2: Fill this in with your assistant details
const AI_ASSISTANT_CONFIG = {
  /**
   * Integration mode:
   * 'webview'  → Embed your AI chat via WebView in a bottom sheet
   * 'native'   → Call a native SDK method directly
   * 'route'    → Navigate to an internal Expo Router screen
   * 'stub'     → No-op placeholder (current default)
   */
  mode: 'stub' as 'webview' | 'native' | 'route' | 'stub',

  /**
   * [mode = 'webview'] Your assistant's web embed URL
   * Example: 'https://your-ai-chat.app/embed?user_id=123'
   */
  assistantUrl: 'https://your-ai-assistant.app/chat',

  /**
   * [mode = 'route'] The Expo Router path to your chat screen
   * Example: '/(app)/chat'
   */
  assistantRoute: '/(app)/chat',
};

export interface ChatFABProps {
  hasNotification?: boolean;
  style?: object;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ChatFAB({ hasNotification = false, style }: ChatFABProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handleOpen = () => {
    // Press animation
    scale.value = withSequence(
      withSpring(0.88, { damping: 12, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
    rotate.value = withSequence(
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 80 }),
      withTiming(0, { duration: 80 }),
    );

    // Step 3: Choose your integration mode
    switch (AI_ASSISTANT_CONFIG.mode) {
      case 'webview':
        // INTEGRATION_POINT: Open a WebView bottom sheet
        // bottomSheetRef.current?.present();
        console.warn('[ChatFAB] webview mode: wire bottomSheetRef and WebView component');
        break;

      case 'native':
        // INTEGRATION_POINT: Call your native SDK
        // Example: Intercom.present();
        // Example: Crisp.setTokenID(userId); Crisp.show();
        console.warn('[ChatFAB] native mode: call your SDK here');
        break;

      case 'route':
        router.push(AI_ASSISTANT_CONFIG.assistantRoute as any);
        break;

      case 'stub':
      default:
        // INTEGRATION_POINT: Replace with your actual integration
        console.log('[ChatFAB] stub: no assistant configured yet');
        break;
    }
  };

  return (
    <AnimatedTouchable
      onPress={handleOpen}
      activeOpacity={0.9}
      style={[styles.fab, animatedStyle, style]}
    >
      <MessageCircle size={22} color="#FFFFFF" strokeWidth={2} />
      {hasNotification && <View style={styles.notificationDot} />}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2D2420',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C97B7B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
