import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CalendarPlus } from 'lucide-react-native';

import type { DashboardData } from '../../lib/dashboard';
import { getTtcStateMeta, TTC_CONFIDENCE_LABEL, TTC_METHOD_LABEL, TTC_OPK_LABEL } from '../../lib/ttcEngine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import ProfileAvatar from './ProfileAvatar';
import { TtcOrbRing } from './TtcOrbRing';
import { TtcQuickLogSheet } from './TtcQuickLogSheet';
import { RiverTrack, type RiverItem } from './RiverTrack';

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

type SnapshotKey = 'lh' | 'mucus' | 'temp' | 'confirmation';

const SIGNAL_RAIL_META = [
  { key: 'lh', title: 'LH Strip', desc: 'Manual band read', icon: 'Droplets', color: '#C97B7B', bg: '#F5E8E8' },
  { key: 'mucus', title: 'Cervical Mucus', desc: 'Consistency & look', icon: 'Waves', color: '#7B82A8', bg: '#ECEEF5' },
  { key: 'bbt', title: 'BBT', desc: 'Waking temperature', icon: 'Beaker', color: '#D4A25F', bg: '#F3E7D3' },
  { key: 'sex', title: 'Intercourse', desc: 'Timing vs. window', icon: 'Heart', color: '#C97B7B', bg: '#F5E8E8' },
  { key: 'med', title: 'Medication', desc: 'NSAID & flag check', icon: 'Pill', color: '#B58F52', bg: '#F1E7D6' },
];

const READS_RAIL: RiverItem[] = [
  { title: 'Why LH has less lead time than mucus', desc: 'Engine notes', icon: 'Lightbulb', color: '#7B82A8', bg: '#ECEEF5' },
  { title: 'NSAIDs and the fertile window', desc: 'Medication', icon: 'Pill', color: '#B58F52', bg: '#F1E7D6' },
  { title: 'What irregular really means', desc: 'PCOS basics', icon: 'Circle', color: '#C77D8F', bg: '#F6E7EB' },
  { title: 'Reading your own BBT chart', desc: 'Guide', icon: 'TrendingUp', color: '#D4A25F', bg: '#F3E7D3' },
];

export function TtcHomeScreen({ data }: { data: DashboardData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [expandedRiverItem, setExpandedRiverItem] = useState<RiverItem | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotKey | null>(null);

  const signal = data.ovulation;
  const firstName = data.user.name.split(' ')[0] || 'Love';
  const todayKey = formatDateKey(new Date());
  const todayLog = data.monthLogs[todayKey];

  const Header = (
    <View className="flex-row items-center justify-between mb-6 px-2 pt-2">
      <View>
        <Text className="text-[10px] font-bold uppercase tracking-[3px] text-rove-charcoal/65 mb-0.5">
          ROVE · TTC MODE
        </Text>
        <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          Hey, {firstName}
        </Text>
        <Text className="text-[10px] font-medium text-rove-stone uppercase tracking-wider">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <ProfileAvatar />
    </View>
  );

  if (!signal) {
    return (
      <View className="flex-1 bg-white px-4 pt-16">
        {Header}
        <View className="bg-rove-cream/40 border border-rove-stone/10 rounded-3xl p-6 mt-4">
          <Text className="text-xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            Getting started
          </Text>
          <Text className="text-sm text-rove-stone">
            Log a period start in the Tracker and your fertility status will appear here.
          </Text>
        </View>
      </View>
    );
  }

  const meta = getTtcStateMeta(signal);
  const showNsaidBanner = meta.key === 'predicted' || meta.key === 'surge';

  const openSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.present();
  };

  const railItems: RiverItem[] = SIGNAL_RAIL_META.map((it) => ({
    title: it.title,
    desc: it.desc,
    detail: it.desc,
    icon: it.icon,
    color: it.color,
    bg: it.bg,
  }));

  const onRailPress = (item: RiverItem) => {
    if (item.title === 'LH Strip' || item.title === 'BBT' || item.title === 'Medication') {
      openSheet();
    } else {
      router.push('/(app)/tracker' as any);
    }
  };

  const headlineDate = signal.confirmedDate || signal.predictedDate;

  const snapshotContent: Record<SnapshotKey, { title: string; label: string; detail: string }> = {
    lh: {
      label: 'LH',
      title: todayLog?.opk_result ? TTC_OPK_LABEL[todayLog.opk_result] : 'Not logged today',
      detail: signal.opkPeakDate
        ? `Your test peaked on ${formatDay(signal.opkPeakDate)}.`
        : 'Log a strip test today to start building this read.',
    },
    mucus: {
      label: 'Cervical mucus',
      title: data.cervicalDischargeByDate[todayKey] || 'Not logged today',
      detail: 'Logged from the Tracker screen — mucus consistency is one of the earliest fertility signs.',
    },
    temp: {
      label: 'Basal temperature',
      title: todayLog?.bbt_celsius != null ? `${todayLog.bbt_celsius.toFixed(1)}°C` : 'Not logged today',
      detail:
        signal.coverline != null
          ? `Your coverline is ${signal.coverline.toFixed(2)}°C — three readings at or above it confirm a shift.`
          : 'Keep logging a waking temperature — a coverline needs a few mornings of baseline first.',
    },
    confirmation: {
      label: 'Confirmation status',
      title: TTC_CONFIDENCE_LABEL[signal.confidence] + ' confidence',
      detail: signal.explanation + ` (${TTC_METHOD_LABEL[signal.method]}.)`,
    },
  };

  return (
    <View className="flex-1 bg-white">
      <Animated.ScrollView
        className="flex-1 px-4 pt-14"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {Header}

        {/* Orb + FAB */}
        <View className="items-center py-2">
          <View className="relative" style={{ width: 172, height: 172 }}>
            <View className="absolute -top-3 self-center z-10 bg-white px-3 py-1.5 rounded-full border border-black/[0.06]" style={{ left: '50%', marginLeft: -30 }}>
              <Text className="text-[10.5px] font-extrabold text-rove-charcoal">Day {data.phase.day}</Text>
            </View>
            <Pressable onPress={() => router.push('/(app)/tracker' as any)}>
              <TtcOrbRing color={meta.color} ring={meta.ring}>
                <View
                  className="rounded-full items-center justify-center border overflow-hidden"
                  style={{ width: 142, height: 142, backgroundColor: '#FAF9F6', borderColor: 'rgba(0,0,0,0.03)' }}
                >
                  <Text className="text-[8px] font-extrabold tracking-[2px] uppercase text-rove-stone mb-1">
                    TTC Status
                  </Text>
                  <Text
                    className="text-[22px] leading-none"
                    style={{ fontFamily: 'CormorantGaramond-Bold', color: meta.colorText }}
                  >
                    {meta.orbTitle}
                  </Text>
                  <Text className="text-[10px] font-bold text-rove-charcoal/70 mt-1.5">
                    {TTC_CONFIDENCE_LABEL[signal.confidence]} confidence
                  </Text>
                </View>
              </TtcOrbRing>
            </Pressable>
            <Pressable
              onPress={openSheet}
              className="absolute right-0.5 bottom-0.5 w-[38px] h-[38px] rounded-full bg-rove-charcoal items-center justify-center border-[3px] border-[#FAF9F6]"
            >
              <CalendarPlus size={15} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Status card */}
          <View
            className="mt-5 w-full rounded-3xl p-4 flex-row gap-2.5 items-start"
            style={{ backgroundColor: meta.colorLight, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            <View className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: meta.colorText }} />
            <View className="flex-1">
              {headlineDate ? (
                <Text
                  className="text-[15px] text-rove-charcoal leading-tight mb-0.5"
                  style={{ fontFamily: 'CormorantGaramond-Bold' }}
                >
                  {formatDay(headlineDate)}
                </Text>
              ) : null}
              <Text className="text-xs font-bold" style={{ color: meta.colorText }}>
                {meta.actionLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Testing / Fertile Window / Confidence */}
        <View className="flex-row gap-2 mt-3">
          <LinearGradient
            colors={['#E8D6BD', '#FFFFFF']}
            style={{ flex: 1, height: 108, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            <View className="p-3 flex-1 justify-between">
              <Text className="text-[9px] font-extrabold uppercase tracking-wide text-[#996929]">Testing</Text>
              <View>
                <Text className="text-[14px] text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {todayLog?.opk_result ? TTC_OPK_LABEL[todayLog.opk_result] : 'Not tested'}
                </Text>
                <Text className="text-[9.5px] text-rove-stone font-semibold mt-0.5">
                  {signal.opkPeakDate ? `Peaked ${formatDay(signal.opkPeakDate)}` : 'Log a strip to begin'}
                </Text>
              </View>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={['#CDE0D7', '#FFFFFF']}
            style={{ flex: 1, height: 108, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            <View className="p-3 flex-1 justify-between">
              <Text className="text-[9px] font-extrabold uppercase tracking-wide text-[#577568]">Fertile Window</Text>
              <View>
                <Text className="text-[14px] text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {signal.fertileWindowStart && signal.fertileWindowEnd
                    ? `${formatDay(signal.fertileWindowStart)} – ${formatDay(signal.fertileWindowEnd)}`
                    : '—'}
                </Text>
                <Text className="text-[9.5px] text-rove-stone font-semibold mt-0.5">
                  {signal.confirmedDate ? 'Closed' : 'Estimate, sharpens with signals'}
                </Text>
              </View>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={['#E5E7F0', '#FFFFFF']}
            style={{ flex: 1, height: 108, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            <View className="p-3 flex-1 justify-between">
              <Text className="text-[9px] font-extrabold uppercase tracking-wide text-[#68709C]">Confidence</Text>
              <View>
                <Text className="text-[14px] text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {TTC_CONFIDENCE_LABEL[signal.confidence]}
                </Text>
                <Text className="text-[9.5px] text-rove-stone font-semibold mt-0.5">{TTC_METHOD_LABEL[signal.method]}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text className="text-center text-[10.5px] text-rove-stone font-medium mt-2.5 px-4">{signal.explanation}</Text>

        {showNsaidBanner ? (
          <View className="mt-3.5 rounded-2xl p-3.5" style={{ backgroundColor: '#FBF3E4', borderWidth: 1, borderColor: 'rgba(181,143,82,0.25)' }}>
            <Text className="text-[9.5px] font-extrabold uppercase tracking-wide text-[#8B6A2E] mb-1">Worth knowing</Text>
            <Text className="text-xs leading-relaxed text-rove-charcoal">
              Taking ibuprofen or another NSAID this week? They're linked to suppressed ovulation around your fertile
              window — worth mentioning to your doctor before your next cycle.
            </Text>
          </View>
        ) : null}

        <View className="h-px bg-rove-stone/10 mx-2 mt-6" />

        <View className="mt-5 gap-4 -mx-4">
          <RiverTrack label="Log Your Signals" items={railItems} direction="left" speed={26} onCardClick={onRailPress} />
          <RiverTrack label="Reads" items={READS_RAIL} direction="right" speed={30} hideIcon />
        </View>

        <View className="h-px bg-rove-stone/10 mx-2 mt-6" />

        <View className="mt-6 mb-4">
          <Text className="text-xl text-rove-charcoal px-2 mb-1" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            Today's Snapshot
          </Text>
          <Text
            onPress={() => router.push('/(app)/tracker' as any)}
            className="text-rove-stone text-[13px] font-semibold mb-4 px-2"
          >
            View Full Tracker →
          </Text>

          <View className="flex-row flex-wrap gap-3 justify-between">
            {(['lh', 'mucus', 'temp', 'confirmation'] as SnapshotKey[]).map((key) => (
              <Pressable
                key={key}
                style={{ width: '48%' }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedSnapshot(key);
                }}
              >
                <View
                  className="rounded-[22px] p-3.5"
                  style={{ minHeight: 128, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}
                >
                  <Text className="text-[9.5px] font-extrabold uppercase tracking-wide text-rove-stone mb-9">
                    {snapshotContent[key].label}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="text-[15px] text-rove-charcoal leading-tight"
                    style={{ fontFamily: 'CormorantGaramond-Bold' }}
                  >
                    {snapshotContent[key].title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      <Dialog open={!!selectedSnapshot} onOpenChange={(o) => !o && setSelectedSnapshot(null)}>
        <DialogContent>
          {selectedSnapshot && (
            <>
              <DialogHeader>
                <DialogTitle>{snapshotContent[selectedSnapshot].title}</DialogTitle>
                <DialogDescription>{snapshotContent[selectedSnapshot].label}</DialogDescription>
              </DialogHeader>
              <Text className="text-[15px] text-rove-charcoal/80 leading-relaxed font-medium">
                {snapshotContent[selectedSnapshot].detail}
              </Text>
            </>
          )}
        </DialogContent>
      </Dialog>

      <TtcQuickLogSheet
        ref={sheetRef}
        dateKey={todayKey}
        initialBbtCelsius={todayLog?.bbt_celsius ?? null}
        initialOpkResult={todayLog?.opk_result ?? null}
        initialNsaidTaken={!!data.nsaidTakenByDate[todayKey]}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
      />
    </View>
  );
}
