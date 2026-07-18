import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Droplets, Baby, Heart, Waves, Brain, Activity as ActivityIcon, Sun, Flower2 } from 'lucide-react-native';

import { fetchDashboardData, type DashboardData } from '../../lib/dashboard';
import { phaseThemes, PHASE_KEYWORDS, PHASE_EXPLAINERS, PHASE_SNAPSHOTS } from '../../data/home-content';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import ProfileAvatar from '../../components/home/ProfileAvatar';
import { RiverTrack, iconMap } from '../../components/home/RiverTrack';
import WelcomeTour from '../../components/home/WelcomeTour';

function formatDate(d: Date | null): string {
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';
}

function PhaseOrbRing({ color, size = 220 }: { color: string; size?: number }) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 6}
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${size * 1.1} ${size * 0.6}`}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

const SNAPSHOT_META = [
  { key: 'hormones' as const, label: 'Hormones', icon: Waves, color: '#FB7185' },
  { key: 'mind' as const, label: 'Mind', icon: Brain, color: '#64748B' },
  { key: 'body' as const, label: 'Body', icon: ActivityIcon, color: '#10B981' },
  { key: 'skin' as const, label: 'Skin', icon: Sun, color: '#F59E0B' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [expandedRiverItem, setExpandedRiverItem] = useState<{ title: string; desc?: string; detail?: string } | null>(null);
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

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 bg-rove-cream/20 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-8">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </View>
        <Skeleton className="w-full h-64 rounded-full self-center" style={{ width: 220, height: 220, alignSelf: 'center' }} />
        <View className="flex-row gap-3 mt-8">
          <Skeleton className="flex-1 h-24 rounded-3xl" />
          <Skeleton className="flex-1 h-24 rounded-3xl" />
          <Skeleton className="flex-1 h-24 rounded-3xl" />
        </View>
      </SafeAreaView>
    );
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
    <SafeAreaView className="flex-1 bg-rove-cream/20" edges={['top']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {Header}

        {/* Phase Orb */}
        <View className="items-center py-4">
          <Pressable onPress={() => router.push('/(app)/tracker' as any)} className="items-center">
            <View style={{ width: 220, height: 220 }} className="items-center justify-center">
              <PhaseOrbRing color={theme.ringFrom} size={220} />
              <View
                className="w-[190px] h-[190px] rounded-full bg-white/80 items-center justify-center border"
                style={{ borderColor: theme.badgeBorder }}
              >
                <Text className="text-[10px] font-bold tracking-[2px] text-rove-stone/80 uppercase mb-1">Current Phase</Text>
                <Text className="text-3xl mb-1" style={{ fontFamily: 'CormorantGaramond-Bold', color: theme.color }}>
                  {data.phase.name}
                </Text>
                <Text className="text-xs font-medium text-rove-charcoal/60 mb-2">{PHASE_KEYWORDS[data.phase.name]}</Text>
                <Badge variant="secondary" style={{ backgroundColor: theme.iconBg }}>
                  <Text style={{ color: theme.color, fontSize: 10, fontWeight: '700' }}>{PHASE_KEYWORDS[data.phase.name]}</Text>
                </Badge>
              </View>
              <View className="absolute top-0 bg-white px-3 py-1 rounded-full border border-rove-stone/10">
                <Text className="text-xs font-bold text-rove-charcoal">Day {data.phase.day}</Text>
              </View>
            </View>
          </Pressable>
          <Text className="text-xs text-rove-stone/80 italic text-center max-w-[220px] mt-3">
            {PHASE_EXPLAINERS[data.phase.name]}
          </Text>
        </View>

        {/* Stat Cards */}
        <View className="flex-row gap-2 mt-6">
          <View className="flex-1 rounded-3xl p-3 border" style={{ backgroundColor: 'rgba(175,107,107,0.12)', borderColor: 'rgba(175,107,107,0.3)' }}>
            <View className="flex-row items-center gap-1.5 mb-2">
              <Droplets size={14} color="#AF6B6B" />
              <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#AF6B6B' }}>Period</Text>
            </View>
            <Text className="text-lg font-semibold text-rove-charcoal">{formatDate(nextPeriod)}</Text>
            <Text className="text-[9px] text-rove-stone/80">{daysToNext !== null ? `in ${daysToNext} days` : 'Next cycle'}</Text>
          </View>

          <View className="flex-1 rounded-3xl p-3 border" style={{ backgroundColor: 'rgba(212,162,95,0.12)', borderColor: 'rgba(212,162,95,0.3)' }}>
            <View className="flex-row items-center gap-1.5 mb-2">
              <Baby size={14} color="#D4A25F" />
              <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#D4A25F' }}>Ovulation</Text>
            </View>
            <Text className="text-lg font-semibold text-rove-charcoal">{formatDate(ovulationDate)}</Text>
            <Text className="text-[9px] text-rove-stone/80">Peak fertility</Text>
          </View>

          <View className="flex-1 rounded-3xl p-3 border" style={{ backgroundColor: 'rgba(141,170,157,0.12)', borderColor: 'rgba(141,170,157,0.3)' }}>
            <View className="flex-row items-center gap-1.5 mb-2">
              <Heart size={14} color="#8DAA9D" />
              <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#8DAA9D' }}>Fertile</Text>
            </View>
            <Text className="text-lg font-semibold text-rove-charcoal">
              {fertileStart && fertileEnd ? `${formatDate(fertileStart)} - ${formatDate(fertileEnd)}` : '--'}
            </Text>
            <Text className="text-[9px] text-rove-stone/80">Highest chance</Text>
          </View>
        </View>

        {/* Daily Flow */}
        <View className="mt-8">
          <Text className="text-xl text-rove-charcoal mb-4 px-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Daily Flow</Text>
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
        </View>

        {/* Today's Snapshot */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Today's Snapshot</Text>
            <Text onPress={() => router.push('/(app)/plan' as any)} className="text-rove-stone text-sm font-medium">View Full Plan</Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {SNAPSHOT_META.map(({ key, label, icon: Icon, color }) => (
              <Pressable
                key={key}
                onPress={() => setSelectedSnapshot(key)}
                className="rounded-[1.5rem] border border-white/40 bg-white/70 p-4"
                style={{ width: '47%', aspectRatio: 1 }}
              >
                <Text className="text-xs font-extrabold uppercase tracking-[2px] mb-2" style={{ color: theme.color }}>{label}</Text>
                <View className="absolute top-3 right-3 opacity-70">
                  <Icon size={28} color={color} />
                </View>
                <View className="absolute bottom-4 left-4 right-4">
                  <Text numberOfLines={2} className="text-base font-bold text-rove-charcoal leading-tight mb-0.5" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                    {snapshot[key].title}
                  </Text>
                  <Text numberOfLines={2} className="text-[11px] text-rove-stone font-medium">{snapshot[key].desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* River card detail dialog */}
      <Dialog open={!!expandedRiverItem} onOpenChange={(o) => !o && setExpandedRiverItem(null)}>
        <DialogContent>
          {expandedRiverItem && (
            <>
              <DialogHeader>
                <DialogTitle>{expandedRiverItem.title}</DialogTitle>
                {!!expandedRiverItem.desc && <DialogDescription>{expandedRiverItem.desc}</DialogDescription>}
              </DialogHeader>
              <Text className="text-sm text-rove-charcoal/90 leading-relaxed">
                {expandedRiverItem.detail?.split('Sources:')[0]}
              </Text>
            </>
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
              </DialogHeader>
              <Text className="text-base text-rove-charcoal/90 leading-relaxed mb-4" style={{ fontFamily: 'CormorantGaramond-Medium' }}>
                {snapshot[selectedSnapshot].detail}
              </Text>
              <View className="rounded-xl p-4 border" style={{ borderColor: theme.badgeBorder, backgroundColor: theme.iconBg }}>
                <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.color }}>Protocol</Text>
                <Text className="text-rove-stone text-sm leading-relaxed font-medium">
                  {snapshot[selectedSnapshot].protocol}
                </Text>
              </View>
            </>
          )}
        </DialogContent>
      </Dialog>

      <WelcomeTour />
    </SafeAreaView>
  );
}
