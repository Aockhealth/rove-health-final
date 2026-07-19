import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, FadeInUp, withSpring, interpolate, Extrapolation, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Droplets, Baby, Heart, Flower2, CalendarPlus, ChevronRight } from 'lucide-react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';

import { fetchDashboardData, type DashboardData } from '../../lib/dashboard';
import { phaseThemes, PHASE_KEYWORDS, PHASE_EXPLAINERS, PHASE_SNAPSHOTS } from '../../data/home-content';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import ProfileAvatar from '../../components/home/ProfileAvatar';
import { PhaseOrbRing } from '../../components/home/PhaseOrbRing';
import { RiverTrack, iconMap, type RiverItem } from '../../components/home/RiverTrack';
import WelcomeTour from '../../components/home/WelcomeTour';
import { HormoneWave, MindSynapse, BodyDNA, GlowHalo } from '../../components/home/SnapshotIcons';
import LoadingScreen from '../../components/ui/LoadingScreen';

function formatDate(d: Date | null): string {
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';
}

function formatDateRange(start: Date | null, end: Date | null): string {
  if (!start || !end) return '--';
  if (start.getMonth() === end.getMonth()) {
    const month = start.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${start.getDate()}–${end.getDate()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function AnimatedWatermark({ icon: Icon, color, itemKey }: { icon: any, color: string, itemKey: string }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Subtle, organic, premium floating and breathing effects instead of rigid spinning
    if (itemKey === 'skin') {
      rotation.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1, false);
      scale.value = withRepeat(withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else if (itemKey === 'mind') {
      scale.value = withRepeat(withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      translateY.value = withRepeat(withTiming(-6, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else if (itemKey === 'hormones') {
      translateY.value = withRepeat(withTiming(-10, { duration: 3500, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else if (itemKey === 'body') {
      scale.value = withRepeat(withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      rotation.value = withRepeat(withTiming(8, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, true);
    }
  }, [itemKey]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
      { translateY: translateY.value }
    ]
  }));

  return (
    <Animated.View style={[{ position: 'absolute', top: -10, right: -15, opacity: 0.18 }, style]}>
      <Icon size={85} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
}

function SnapshotCard({ itemKey, label, Icon, color, theme, snapshot, onPress }: any) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Pressable
      style={{ width: '48%' }}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress(itemKey);
      }}
    >
      <Animated.View
        className="rounded-[28px] relative overflow-hidden"
        style={[{
          minHeight: 180,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.5)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 4,
        }, animatedStyle]}
      >
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
        <LinearGradient
          colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View className="p-5 justify-between" style={{ minHeight: 180 }}>
          <AnimatedWatermark icon={Icon} color={color} itemKey={itemKey} />

          <Text className="text-[11px] font-extrabold uppercase tracking-[2px] mt-1" style={{ color: theme.color }}>{label}</Text>

          <View className="mt-8">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text numberOfLines={2} className="text-[17px] font-bold text-rove-charcoal leading-tight flex-1" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                {snapshot[itemKey].title}
              </Text>
              <ChevronRight size={14} color="rgba(0,0,0,0.15)" style={{ marginLeft: 4 }} />
            </View>
            <Text numberOfLines={3} className="text-xs text-rove-stone/90 font-medium leading-relaxed">{snapshot[itemKey].desc}</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const SNAPSHOT_META = [
  { key: 'hormones' as const, label: 'Hormones', Icon: HormoneWave, color: '#FB7185' },
  { key: 'mind' as const, label: 'Mind', Icon: MindSynapse, color: '#64748B' },
  { key: 'body' as const, label: 'Body', Icon: BodyDNA, color: '#10B981' },
  { key: 'skin' as const, label: 'Skin', Icon: GlowHalo, color: '#F59E0B' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [expandedRiverItem, setExpandedRiverItem] = useState<RiverItem | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<(typeof SNAPSHOT_META)[number]['key'] | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  useEffect(() => {
    if (!isPending && !data) {
      router.replace('/onboarding' as any);
    }
  }, [data, isPending]);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const orbParallax = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scrollY.value * 0.4 }]
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [100, 200], [0, 1], Extrapolation.CLAMP),
    };
  });

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!data) return null;

  const hasCycleData = !!data.settings.last_period_start || Object.values(data.monthLogs).some((l) => l.is_period);
  const theme = phaseThemes[data.phase.name] || phaseThemes.Follicular;
  const snapshot = PHASE_SNAPSHOTS[data.phase.name] || PHASE_SNAPSHOTS.Follicular;
  const firstName = data.user.name.split(' ')[0] || 'Love';

  const Header = (
    <View className="flex-row items-center justify-between mb-8 px-2 pt-2">
      <View>
        <Text className="text-[10px] font-bold uppercase tracking-[3px] text-rove-charcoal/65 mb-0.5">ROVE</Text>
        <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Hey, {firstName}</Text>
        <Text className="text-[10px] font-medium text-rove-stone uppercase tracking-wider">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <ProfileAvatar />
    </View>
  );

  if (!hasCycleData) {
    return (
      <SafeAreaView className="flex-1 bg-rove-cream/20 px-4">
        {Header}
        <View className="bg-white/80 border border-rove-stone/10 rounded-3xl p-6">
          <Text className="text-xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Log your first period</Text>
          <Text className="text-sm text-rove-stone mb-4">
            Once you log a period start, your phase, fertile window, and insights will appear here.
          </Text>
          <Button onPress={() => router.push('/(app)/tracker' as any)} className="self-start">
            Go to Tracker
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (data.trackerMode === 'ttc') {
    return (
      <SafeAreaView className="flex-1 bg-rove-cream/20 px-4">
        {Header}
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View className="w-20 h-20 rounded-full bg-amber-100 items-center justify-center">
            <Baby size={36} color="#F59E0B" />
          </View>
          <Text className="text-3xl text-rove-charcoal text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Fertility Window</Text>
          <Text className="text-rove-stone text-center">
            Your dedicated fertility dashboard is being prepared. Soon you'll track BBT, cervical mucus, and peak ovulation days here.
          </Text>
          <Button className="rounded-full">Log Temperature</Button>
        </View>
      </SafeAreaView>
    );
  }

  if (data.trackerMode === 'menopause') {
    return (
      <SafeAreaView className="flex-1 bg-rove-cream/20 px-4">
        {Header}
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center">
            <Flower2 size={36} color="#A855F7" />
          </View>
          <Text className="text-3xl text-rove-charcoal text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Symptom Management</Text>
          <Text className="text-rove-stone text-center">
            Your menopause support hub is coming soon. Track hot flashes, sleep quality, and HRT adherence.
          </Text>
          <Button className="rounded-full">Log Symptom</Button>
        </View>
      </SafeAreaView>
    );
  }

  const nextPeriod = data.phase.nextPeriodDate ? new Date(data.phase.nextPeriodDate) : null;
  const ovulationDate = nextPeriod ? new Date(nextPeriod.getTime() - 14 * 24 * 60 * 60 * 1000) : null;
  const fertileStart = ovulationDate ? new Date(ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000) : null;
  const fertileEnd = ovulationDate ? new Date(ovulationDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null;
  const daysToNext = nextPeriod ? Math.ceil((nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <View className="flex-1 bg-white relative overflow-hidden">
      {/* Dynamic Frosted Header */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }, headerStyle]}>
        <BlurView intensity={80} tint="light" className="pt-14 pb-4 px-4 flex-row items-center justify-between border-b border-black/5">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-[2px] text-rove-stone/60">Current Phase</Text>
            <Text className="text-xl" style={{ fontFamily: 'CormorantGaramond-Bold', color: theme.color }}>{data.phase.name} • Day {data.phase.day}</Text>
          </View>
          <ProfileAvatar />
        </BlurView>
      </Animated.View>

      <Animated.ScrollView 
        className="flex-1 px-4 pt-14" 
        contentContainerStyle={{ paddingBottom: 100, position: 'relative', zIndex: 1 }} 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {Header}

        {/* Phase Orb */}
        <Animated.View style={orbParallax} className="items-center py-4 mt-8">
          {/* Ambient phase-colored glow, concentrated behind the orb and fading
              to nothing before it reaches the cards below — keeps the page
              white/classy while still reading as phase-specific mood lighting. */}
          <Svg width={380} height={380} style={{ position: 'absolute', top: -95, left: '50%', marginLeft: -190 }}>
            <Defs>
              <SvgRadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={theme.color} stopOpacity={0.16} />
                <Stop offset="55%" stopColor={theme.color} stopOpacity={0.05} />
                <Stop offset="100%" stopColor={theme.color} stopOpacity={0} />
              </SvgRadialGradient>
            </Defs>
            <Rect width="380" height="380" fill="url(#orbGlow)" />
          </Svg>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(app)/tracker' as any);
            }} 
            className="items-center"
          >
            <View style={{ width: 170, height: 170 }} className="items-center justify-center relative">
              <PhaseOrbRing colors={theme.orbRingColors} size={170} />
              <View
                className="rounded-full items-center justify-center border overflow-hidden"
                style={{ width: 144, height: 144, backgroundColor: '#FAF9F6', borderColor: 'rgba(0,0,0,0.03)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15 }}
              >
                <Text className="text-[8px] font-bold tracking-[2px] text-rove-stone/60 uppercase mb-1">Current Phase</Text>
                <Text className="text-2xl mb-0.5" style={{ fontFamily: 'CormorantGaramond-Bold', color: theme.color }}>
                  {data.phase.name}
                </Text>
                <Text className="text-[10px] font-semibold text-rove-charcoal/70 tracking-wide mb-1">{PHASE_KEYWORDS[data.phase.name]}</Text>
                <View className="w-5 h-1 rounded-full border mt-0.5" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
              </View>

              {/* Day Badge positioned on top edge of the ring */}
              <View className="absolute bg-white px-2.5 py-1 rounded-full border border-rove-stone/10" style={{ top: -10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }}>
                <Text className="text-[11px] font-extrabold text-rove-charcoal">Day {data.phase.day}</Text>
              </View>

              {/* Log FAB */}
              <View className="absolute right-0 bottom-0 w-[40px] h-[40px] rounded-full bg-rove-charcoal items-center justify-center border-[3px] border-[#FAF9F6]" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 }}>
                <CalendarPlus size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text className="absolute -bottom-4 text-[8px] font-bold text-rove-charcoal tracking-widest">LOG</Text>
              </View>
            </View>
          </Pressable>
          <Text className="text-xs text-rove-charcoal/70 italic text-center max-w-[220px] mt-6">
            {PHASE_EXPLAINERS[data.phase.name]}
          </Text>
        </Animated.View>

        <View className="flex-row gap-2.5 mt-4">
          <Animated.View entering={FadeInUp.delay(100).duration(600).springify()} className="flex-1">
            <LinearGradient
              colors={phaseThemes.Menstrual.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 overflow-hidden"
              style={{ height: 130, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', shadowColor: '#AF6B6B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 }}
            >
              <View className="p-3.5 flex-1 justify-between">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Droplets size={14} color={phaseThemes.Menstrual.color} />
                  <Text className="text-[10px] font-extrabold uppercase tracking-[1px]" style={{ color: phaseThemes.Menstrual.color }}>Period</Text>
                </View>
                <View>
                  <Text className="text-xl font-semibold text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{formatDate(nextPeriod)}</Text>
                  <Text className="text-[11px] text-rove-stone/90 font-medium mt-1">{daysToNext !== null ? `in ${daysToNext} days` : 'Next cycle'}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} className="flex-1">
            <LinearGradient
              colors={phaseThemes.Ovulatory.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 overflow-hidden"
              style={{ height: 130, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', shadowColor: '#D4A25F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 }}
            >
              <View className="p-3.5 flex-1 justify-between">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Baby size={14} color={phaseThemes.Ovulatory.color} />
                  <Text className="text-[10px] font-extrabold uppercase tracking-[1px]" style={{ color: phaseThemes.Ovulatory.color }}>Ovulation</Text>
                </View>
                <View>
                  <Text className="text-xl font-semibold text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{formatDate(ovulationDate)}</Text>
                  <Text className="text-[11px] text-rove-stone/90 font-medium mt-1">Peak fertility</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(600).springify()} className="flex-1">
            <LinearGradient
              colors={phaseThemes.Follicular.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 overflow-hidden"
              style={{ height: 130, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', shadowColor: '#8DAA9D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 }}
            >
              <View className="p-3.5 flex-1 justify-between">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Heart size={14} color={phaseThemes.Follicular.color} />
                  <Text className="text-[10px] font-extrabold uppercase tracking-[1px]" style={{ color: phaseThemes.Follicular.color }}>Fertile</Text>
                </View>
                <View>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className="text-xl font-semibold text-rove-charcoal leading-tight"
                    style={{ fontFamily: 'CormorantGaramond-Bold' }}
                  >
                    {formatDateRange(fertileStart, fertileEnd)}
                  </Text>
                  <Text className="text-[11px] text-rove-stone/90 font-medium mt-1">Highest chance</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Daily Flow */}
        <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} className="mt-10">
          <Text className="text-xl text-rove-charcoal mb-4 px-2" style={{ fontFamily: 'CormorantGaramond-Medium' }}>Daily Flow</Text>
          <View className="gap-4 -mx-4">
            <RiverTrack
              label="Nutrients For This Phase"
              items={data.nutrients.map((n) => ({ ...n, color: theme.iconColor, bg: theme.iconBg }))}
              direction="right"
              speed={40}
              onCardClick={(item) => setExpandedRiverItem(item)}
            />
            <RiverTrack
              label="What To Focus On"
              items={data.phaseFocus.map((n) => ({ ...n, color: theme.iconColor, bg: theme.iconBg }))}
              direction="left"
              speed={38}
              onCardClick={(item) => setExpandedRiverItem(item)}
            />
          </View>
        </Animated.View>

        {/* Section divider — keeps Daily Flow and Today's Snapshot visually separate */}
        <View className="h-px bg-rove-stone/10 mx-2 mt-10" />

        {/* Today's Snapshot */}
        <Animated.View entering={FadeInUp.delay(500).duration(600).springify()} className="mt-8 mb-4" style={{ position: 'relative' }}>
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Today's Snapshot</Text>
          </View>
          <Text onPress={() => router.push('/(app)/plan' as any)} className="text-rove-stone text-[13px] font-semibold mb-4 px-2">View Full Plan →</Text>

          <View className="flex-row flex-wrap gap-3 justify-between">
            {SNAPSHOT_META.map(({ key, label, Icon, color }) => (
              <SnapshotCard
                key={key}
                itemKey={key}
                label={label}
                Icon={Icon}
                color={color}
                theme={theme}
                snapshot={snapshot}
                onPress={setSelectedSnapshot}
              />
            ))}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* River card detail dialog */}
      <Dialog open={!!expandedRiverItem} onOpenChange={(o) => !o && setExpandedRiverItem(null)}>
        <DialogContent>
          {expandedRiverItem && (
            <View>
              <View className="mb-4">
                <View className="w-16 h-16 rounded-2xl items-center justify-center mb-5" style={{ backgroundColor: expandedRiverItem.bg }}>
                  {React.createElement(iconMap[expandedRiverItem.icon] || require('lucide-react-native').Circle, { size: 32, color: expandedRiverItem.color })}
                </View>
                <Text className="text-[28px] font-bold text-rove-charcoal mb-1 leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {expandedRiverItem.title}
                </Text>
                {!!expandedRiverItem.desc && (
                  <Text className="text-[11px] font-bold text-rove-charcoal/70 uppercase tracking-[1.5px]">
                    {expandedRiverItem.desc}
                  </Text>
                )}
              </View>
              
              <Text className="text-[15px] text-rove-charcoal/90 leading-relaxed font-medium mb-6">
                {expandedRiverItem.detail?.split('Sources:')[0]?.trim()}
              </Text>
              
              {expandedRiverItem.detail?.includes('Sources:') && (
                <View className="rounded-[20px] p-4 border border-white" style={{ backgroundColor: theme.cardTint }}>
                  <View className="flex-row items-center gap-2 mb-3">
                    {React.createElement(iconMap['Utensils'] || require('lucide-react-native').Utensils, { size: 14, color: theme.color })}
                    <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.color }}>Food Sources</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {expandedRiverItem.detail
                      .split('Sources:')[1]
                      .split(',')
                      .map((source: string) => source.trim())
                      .filter((s: string) => s.length > 0)
                      .map((source: string, idx: number) => (
                        <View key={idx} className="bg-white/90 px-3 py-1.5 rounded-xl border border-white">
                          <Text className="text-rove-charcoal font-semibold text-xs">{source}</Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </DialogContent>
      </Dialog>

      {/* Snapshot detail dialog */}
      <Dialog open={!!selectedSnapshot} onOpenChange={(o) => !o && setSelectedSnapshot(null)}>
        <DialogContent>
          {selectedSnapshot && (
            <>
              <DialogHeader>
                <DialogTitle>{snapshot[selectedSnapshot].title}</DialogTitle>
                <DialogDescription>{snapshot[selectedSnapshot].desc}</DialogDescription>
              </DialogHeader>
              <Text className="text-[15px] text-rove-charcoal/80 leading-relaxed font-medium">
                {snapshot[selectedSnapshot].detail}
              </Text>
              <View className="mt-5 rounded-2xl p-4 border border-rove-stone/10 bg-white/50">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: theme.color }}>Protocol</Text>
                <Text className="text-rove-charcoal/90 text-[13px] leading-relaxed font-semibold">
                  {snapshot[selectedSnapshot].protocol}
                </Text>
              </View>
            </>
          )}
        </DialogContent>
      </Dialog>

      <WelcomeTour />
    </View>
  );
}
