import React, { useEffect } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calendar, BarChart2, List, BookOpen } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../../lib/dashboard';
import { phaseThemes } from '../../data/home-content';
import { ChatFAB } from '../../components/tracker/ChatFAB';
import { supabase } from '../../lib/supabase';
import { setupPushNotifications, addNotificationListeners } from '../../lib/notifications';

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isChatScreen = pathname === '/chat';
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  // Push notification registration — runs once the authenticated app shell
  // mounts (i.e. after the auth gate in src/app/index.tsx has already
  // confirmed a session exists). See mobile/src/lib/notifications.ts for the
  // full picture, including the Android FCM / iOS APNs TODOs.
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setupPushNotifications(user.id);
      }
    });

    cleanup = addNotificationListeners({
      onReceived: (n) => console.log('[notifications] Received in foreground:', n.request.content.title),
      onResponse: (r) => console.log('[notifications] Tapped:', r.notification.request.content.title),
    });

    return () => cleanup?.();
  }, []);

  const activeColor = data?.phase?.name ? (phaseThemes[data.phase.name]?.color || '#AF6B6B') : '#AF6B6B';
  const inactiveColor = '#A8A29E';

  // Helper to render the premium icon with active background bubble
  const renderIcon = (IconComponent: any, color: string, focused: boolean) => (
    <View 
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        backgroundColor: focused ? `${activeColor}15` : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconComponent size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 1,
          borderTopColor: 'rgba(45, 36, 32, 0.05)',
          backgroundColor: 'transparent',
          elevation: 0, // Remove Android shadow
        },
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={100}
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(250, 249, 246, 0.9)' }]}
          />
        ),
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarShowLabel: true,
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => renderIcon(Home, color, focused),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, focused }) => renderIcon(Calendar, color, focused),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => renderIcon(BarChart2, color, focused),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, focused }) => renderIcon(List, color, focused),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => renderIcon(BookOpen, color, focused),
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          // The chat screen is its own full-screen experience (own header,
          // own input bar pinned to the bottom) — showing the tab bar
          // underneath it just eats into that space and squeezes the input
          // bar upward for no reason, so hide it while this screen is active.
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>

      {/* Floating AI assistant button — rendered once here so it persists,
          identically positioned, across every tab instead of being wired
          into each screen individually. Sits clear of the translucent tab
          bar (whose own height isn't reserved, since tabBarStyle above sets
          position:'absolute'), scaled by the safe-area bottom inset so it
          doesn't crowd the home-indicator area on notched devices. */}
      {/* Hidden on the chat screen itself — no point floating a button that
          opens the chat while you're already looking at it. */}
      {!isChatScreen && (
        <ChatFAB
          hasNotification
          style={{ position: 'absolute', right: 16, bottom: insets.bottom + 92 }}
        />
      )}
    </View>
  );
}
