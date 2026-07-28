import React, { useState, useEffect, useCallback } from 'react';
import { Platform,  View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, withSpring, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LoadingScreen from '../../components/ui/LoadingScreen';
import ProfileAvatar from '../../components/home/ProfileAvatar';
import { phaseThemes } from '../../data/home-content';
import { fetchInsightsData } from '../../lib/insights';
import { fetchRoveInsight } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import { CycleOverviewCard } from '../../components/insights/CycleOverviewCard';
import { HabitsOverviewCard } from '../../components/insights/HabitsOverviewCard';
import { PhaseInsightCard } from '../../components/insights/PhaseInsightCard';
import { MentalHealthCheckCard } from '../../components/insights/MentalHealthCheckCard';
import { PatternAnalysisCard } from '../../components/insights/PatternAnalysisCard';

const TABS = [
  { id: 'cycle', label: 'Cycle', icon: 'calendar' },
  { id: 'patterns', label: 'Patterns', icon: 'activity' },
  { id: 'health', label: 'Health', icon: 'zap' },
] as const;

export default function InsightsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cycle' | 'patterns' | 'health'>('cycle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsight, setAiInsight] = useState<{ title?: string; insight: string } | null>(null);
  const [insightError, setInsightError] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  // Animation values for tab bar
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const tabIndicatorPos = useSharedValue(0);
  const tabScale = useSharedValue(1);

  const handleTabPress = useCallback((tabId: 'cycle' | 'patterns' | 'health') => {
    if (tabId === activeTab) return;
    const idx = TABS.findIndex((t) => t.id === tabId);
    tabIndicatorPos.value = withSpring(idx, { damping: 18, stiffness: 160, mass: 0.8 });
    tabScale.value = withSpring(0.92, { damping: 12, stiffness: 400 }, () => {
      tabScale.value = withSpring(1, { damping: 14, stiffness: 200 });
    });
    setActiveTab(tabId);
  }, [activeTab]);

  // Query key must be exactly 'insights' — tracker.tsx and profile.tsx both
  // call `queryClient.invalidateQueries({ queryKey: ['insights'] })` after
  // saving a log entry or updating cycle settings, expecting this screen to
  // refetch. It was previously keyed 'insights-mobile', so those
  // invalidations silently matched nothing and hydration/sleep/cycle-length
  // averages here never updated after a save — only ever refreshing if the
  // screen happened to fully unmount and remount.
  const { data: stats, isPending: loading, refetch, isRefetching } = useQuery({
    queryKey: ['insights'],
    queryFn: fetchInsightsData,
  });

  const handleGenerateInsight = useCallback(async () => {
    setIsGenerating(true);
    setInsightError(false);
    try {
      const phaseName = stats?.phase?.name || 'Menstrual';
      const moodCounts = stats?.moodsByPhase?.[phaseName] || {};
      const result = await fetchRoveInsight({ phase: phaseName, moodCounts });
      if (result.insight) {
        setAiInsight({ title: result.title, insight: result.insight });
      } else {
        setInsightError(true);
      }
    } catch (e) {
      setInsightError(true);
    } finally {
      setIsGenerating(false);
    }
  }, [stats]);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const tabIndicatorStyle = useAnimatedStyle(() => {
    const slotWidth = tabBarWidth / 3;
    return {
      width: slotWidth,
      transform: [
        { translateX: tabIndicatorPos.value * slotWidth },
        { scaleX: tabScale.value },
        { scaleY: tabScale.value },
      ],
    };
  });

  if (loading) {
    return <LoadingScreen />;
  }

  const phaseName = stats?.phase?.name || 'Menstrual';
  const theme = phaseThemes[phaseName as keyof typeof phaseThemes] || phaseThemes['Menstrual'];
  const activePatternsPhase = selectedPhase || phaseName;

  return (
    <SafeAreaView className="flex-1 bg-rove-cream">
      {/* HEADER */}
      <View className="px-5 pb-2 pt-2 flex-row items-center justify-between z-50 mb-2">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-[3px] text-rove-charcoal/65 mb-0.5">Your Body Intelligence</Text>
          <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold', color: theme.color }}>Insights</Text>
        </View>
        <ProfileAvatar />
      </View>

      <Animated.ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.color}
            colors={[theme.color]}
          />
        }
      >
        {/* TAB BAR */}
        <View
          className={`flex-row rounded-[18px] p-1.5 mb-6 relative overflow-hidden bg-white border border-white/60 ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}
          style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 0 }}
          onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width - 12)}
        >
          {tabBarWidth > 0 && (
            <Animated.View
              className={`absolute left-1.5 top-1.5 bottom-1.5 rounded-2xl ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}
              style={[{ backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 0 }, tabIndicatorStyle]}
            />
          )}
          
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => handleTabPress(tab.id)}
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-2xl z-10"
              >
                <Feather name={tab.icon as any} size={13} color={isActive ? 'white' : '#78716C'} style={{ marginRight: 6 }} />
                <Text className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-rove-stone'}`}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* TAB CONTENT PLACEHOLDERS */}
        {activeTab === 'cycle' && (
          <>
            <Animated.View entering={FadeInUp.duration(500).springify()}>
              <CycleOverviewCard
                cycleLength={stats?.averages?.cycle || 28}
                periodLength={stats?.averages?.period || 5}
                isRegular={!stats?.averages?.isIrregular}
                nextPeriodDate={stats?.averages?.nextPeriodDate}
                phase={phaseName}
                theme={theme}
              />
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(100).duration(500).springify()}>
              <HabitsOverviewCard
                wellnessAverages={stats?.wellnessAverages}
                theme={theme}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(500).springify()}>
              <PhaseInsightCard
                phase={phaseName}
                day={stats?.phase?.day || 1}
                insight={aiInsight}
                theme={theme}
                isGenerating={isGenerating}
                hasError={insightError}
                onGenerateInsight={handleGenerateInsight}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(500).springify()}>
              <MentalHealthCheckCard theme={theme} />
            </Animated.View>
          </>
        )}

        {activeTab === 'patterns' && (
          <Animated.View entering={FadeInUp.duration(500).springify()}>
            <PatternAnalysisCard
              phaseCounts={stats?.phaseCounts}
              symptomsByPhase={stats?.symptomsByPhase || {}}
              selectedPhase={activePatternsPhase}
              onPhaseSelect={setSelectedPhase}
            />
          </Animated.View>
        )}

        {activeTab === 'health' && (
          <Animated.View
            entering={FadeInUp.duration(500).springify()}
            className="items-center mt-4 p-8 rounded-[28px] border border-rove-stone/10 bg-white/80"
          >
            <View className={`w-16 h-16 rounded-full bg-white items-center justify-center mb-4 ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`} style={{ shadowColor: theme.color, shadowOpacity: 0.1, shadowRadius: 10 }}>
              <Feather name="file-text" size={24} color={theme.color} />
            </View>
            <Text className="text-2xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Health Report</Text>
            <Text className="text-rove-stone text-center max-w-[220px]">
              A shareable PDF summary for your doctor isn't built yet — it's on the roadmap, not available right now.
            </Text>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
