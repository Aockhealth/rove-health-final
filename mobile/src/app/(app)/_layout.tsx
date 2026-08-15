import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calendar, BarChart2, List, BookOpen } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../../lib/dashboard';
import { phaseThemes } from '../../data/home-content';

const TAB_BAR_CONTENT_HEIGHT = 56;

export default function AppLayout() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });
  const insets = useSafeAreaInsets();

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: 'rgba(45, 36, 32, 0.05)',
          backgroundColor: 'transparent',
          elevation: 0, // Remove Android shadow
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (<BlurView
            tint="light"
            intensity={100}
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(250, 249, 246, 0.9)' }]}
          />) : (<View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FAF9F6', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }]} />)
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
    </Tabs>
  );
}
