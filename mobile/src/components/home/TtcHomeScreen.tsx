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
import { useTranslation } from 'react-i18next';

import type { DashboardData } from '../../lib/dashboard';
import { getTtcStateMeta, getTtcConfidenceLabel, getTtcConfidenceWithLabel, getTtcMethodLabel, getTtcOpkLabel, getLhBandLabels } from '../../lib/ttcEngine';
import { getDateLocaleTag } from '../../lib/i18n';
import { getLocalizedFontFamily, getLocalizedTracking } from '../../lib/fonts';
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
  return new Date(y, m - 1, d).toLocaleDateString(getDateLocaleTag(), { day: 'numeric', month: 'long' });
}

type SnapshotKey = 'lh' | 'mucus' | 'temp' | 'confirmation';

const SIGNAL_RAIL_VISUALS = [
  { key: 'lh', icon: 'Droplets', color: '#C97B7B', bg: '#F5E8E8' },
  { key: 'mucus', icon: 'Waves', color: '#7B82A8', bg: '#ECEEF5' },
  { key: 'bbt', icon: 'Beaker', color: '#D4A25F', bg: '#F3E7D3' },
  { key: 'sex', icon: 'Heart', color: '#C97B7B', bg: '#F5E8E8' },
  { key: 'med', icon: 'Pill', color: '#B58F52', bg: '#F1E7D6' },
] as const;

const READS_RAIL_VISUALS = [
  { key: 'lhLeadTime', icon: 'Lightbulb', color: '#7B82A8', bg: '#ECEEF5' },
  { key: 'nsaid', icon: 'Pill', color: '#B58F52', bg: '#F1E7D6' },
  { key: 'irregular', icon: 'Circle', color: '#C77D8F', bg: '#F6E7EB' },
  { key: 'bbtChart', icon: 'TrendingUp', color: '#D4A25F', bg: '#F3E7D3' },
] as const;

export function TtcHomeScreen({ data }: { data: DashboardData }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [expandedRiverItem, setExpandedRiverItem] = useState<RiverItem | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotKey | null>(null);

  const signal = data.ovulation;
  const firstName = data.user.name.split(' ')[0] || t('home.defaultName');
  const todayKey = formatDateKey(new Date());
  const todayLog = data.monthLogs[todayKey];

  const Header = (
    <View className="flex-row items-center justify-between mb-6 px-2 pt-2">
      <View>
        <Text className="text-[10px] font-bold uppercase text-rove-charcoal/65 mb-0.5" style={{ letterSpacing: getLocalizedTracking(3, i18n.language) }}>
          {t('home.brandLine')}
        </Text>
        <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
          {t('home.greeting', { name: firstName })}
        </Text>
        <Text className="text-[10px] font-medium text-rove-stone uppercase tracking-wider">
          {new Date().toLocaleDateString(getDateLocaleTag(), { weekday: 'long', month: 'short', day: 'numeric' })}
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
          <Text className="text-xl text-rove-charcoal mb-2" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
            {t('home.gettingStarted.title')}
          </Text>
          <Text className="text-sm text-rove-stone">
            {t('home.gettingStarted.body')}
          </Text>
        </View>
      </View>
    );
  }

  const meta = getTtcStateMeta(signal, t);
  // Real rule now, not a status guess: only shows when an NSAID was actually
  // logged within the periovulatory window (see shared/cycle/ttc.ts).
  const showNsaidBanner = signal.periovulatoryNsaidFlag;

  const openSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.present();
  };

  const railItems: RiverItem[] = SIGNAL_RAIL_VISUALS.map((it) => ({
    id: it.key,
    title: t(`home.signalRail.${it.key}.title`),
    desc: t(`home.signalRail.${it.key}.desc`),
    detail: t(`home.signalRail.${it.key}.desc`),
    icon: it.icon,
    color: it.color,
    bg: it.bg,
  }));

  const readsRail: RiverItem[] = READS_RAIL_VISUALS.map((it) => ({
    id: it.key,
    title: t(`home.reads.${it.key}.title`),
    desc: t(`home.reads.${it.key}.desc`),
    icon: it.icon,
    color: it.color,
    bg: it.bg,
  }));

  const onRailPress = (item: RiverItem) => {
    if (item.id === 'lh' || item.id === 'bbt' || item.id === 'med') {
      openSheet();
    } else {
      router.push('/(app)/tracker' as any);
    }
  };

  const headlineDate = signal.confirmedDate || signal.predictedDate;

  const snapshotContent: Record<SnapshotKey, { title: string; label: string; detail: string }> = {
    lh: {
      label: t('home.snapshot.lh.label'),
      title:
        data.lhBandByDate?.[todayKey] !== undefined
          ? getLhBandLabels(t)[data.lhBandByDate[todayKey]] ?? t('home.snapshot.lh.loggedToday')
          : todayLog?.opk_result
            ? getTtcOpkLabel(todayLog.opk_result, t)
            : t('home.snapshot.lh.notLoggedToday'),
      detail: signal.opkPeakDate
        ? t('home.snapshot.lh.peaked', { date: formatDay(signal.opkPeakDate) })
        : t('home.snapshot.lh.startBuilding'),
    },
    mucus: {
      label: t('home.snapshot.mucus.label'),
      title: data.cervicalDischargeByDate[todayKey] || t('home.snapshot.mucus.notLoggedToday'),
      detail: t('home.snapshot.mucus.detail'),
    },
    temp: {
      label: t('home.snapshot.temp.label'),
      title: todayLog?.bbt_celsius != null ? `${todayLog.bbt_celsius.toFixed(1)}°C` : t('home.snapshot.temp.notLoggedToday'),
      detail:
        signal.coverline != null
          ? t('home.snapshot.temp.coverline', { value: signal.coverline.toFixed(2) })
          : t('home.snapshot.temp.keepLogging'),
    },
    confirmation: {
      label: t('home.snapshot.confirmation.label'),
      title: getTtcConfidenceWithLabel(signal.confidence, t),
      detail: `${signal.explanation} (${getTtcMethodLabel(signal.method, t)}.)`,
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
              <Text className="text-[10.5px] font-extrabold text-rove-charcoal">{t('home.dayLabel', { day: data.phase.day })}</Text>
            </View>
            <Pressable onPress={() => router.push('/(app)/tracker' as any)}>
              <TtcOrbRing color={meta.color} ring={meta.ring}>
                <View
                  className="rounded-full items-center justify-center border overflow-hidden"
                  style={{ width: 142, height: 142, backgroundColor: '#FAF9F6', borderColor: 'rgba(0,0,0,0.03)' }}
                >
                  <Text className="text-[8px] font-extrabold uppercase text-rove-stone mb-1" style={{ letterSpacing: getLocalizedTracking(2, i18n.language) }}>
                    {t('home.ttcStatus')}
                  </Text>
                  <Text
                    className="text-[22px] px-2"
                    style={{
                      fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language),
                      color: meta.colorText,
                      textAlign: 'center',
                      // Devanagari matras (e.g. ो, ई) extend further above/below
                      // the baseline than this Latin serif's metrics — the
                      // `leading-none` this used to have clipped their tops
                      // against the circle's `overflow-hidden`, which read as
                      // wrong glyphs. A real line box fixes it in both scripts.
                      lineHeight: 30,
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {meta.orbTitle}
                  </Text>
                  <Text className="text-[10px] font-bold text-rove-charcoal/70 mt-1.5">
                    {t('home.confidenceSuffix', { label: getTtcConfidenceLabel(signal.confidence, t) })}
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
                  style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}
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
              <Text className="text-[9px] font-extrabold uppercase tracking-wide text-[#996929]">{t('home.cards.testing')}</Text>
              <View>
                <Text className="text-[14px] text-rove-charcoal leading-tight" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                  {data.lhBandByDate?.[todayKey] !== undefined
                    ? getLhBandLabels(t)[data.lhBandByDate[todayKey]] ?? t('home.snapshot.lh.loggedToday')
                    : todayLog?.opk_result
                      ? getTtcOpkLabel(todayLog.opk_result, t)
                      : t('home.testing.notTested')}
                </Text>
                <Text className="text-[9.5px] text-rove-stone font-semibold mt-0.5">
                  {signal.opkPeakDate ? t('home.testing.peaked', { date: formatDay(signal.opkPeakDate) }) : t('home.testing.logStrip')}
                </Text>
              </View>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={['#CDE0D7', '#FFFFFF']}
            style={{ flex: 1, height: 108, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            <View className="p-3 flex-1 justify-between">
              <Text className="text-[9px] font-extrabold uppercase tracking-wide text-[#577568]">{t('home.cards.fertileWindow')}</Text>
              <View>
                <Text className="text-[14px] text-rove-charcoal leading-tight" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                  {signal.fertileWindowStart && signal.fertileWindowEnd
                    ? `${formatDay(signal.fertileWindowStart)} – ${formatDay(signal.fertileWindowEnd)}`
                    : t('home.fertileWindow.placeholder')}
                </Text>
                <Text className="text-[9.5px] text-rove-stone font-semibold mt-0.5">
                  {signal.confirmedDate ? t('home.fertileWindow.closed') : t('home.fertileWindow.estimate')}
                </Text>
              </View>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={['#E5E7F0', '#FFFFFF']}
            style={{ flex: 1, height: 108, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            <View className="p-3 flex-1 justify-between">
              <Text className="text-[9px] font-extrabold uppercase tracking-wide text-[#68709C]">{t('home.cards.confidence')}</Text>
              <View>
                <Text className="text-[14px] text-rove-charcoal leading-tight" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                  {getTtcConfidenceLabel(signal.confidence, t)}
                </Text>
                <Text className="text-[9.5px] text-rove-stone font-semibold mt-0.5">{getTtcMethodLabel(signal.method, t)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text className="text-center text-[10.5px] text-rove-stone font-medium mt-2.5 px-4">{signal.explanation}</Text>

        {showNsaidBanner ? (
          <View className="mt-3.5 rounded-2xl p-3.5" style={{ backgroundColor: '#FBF3E4', borderWidth: 1, borderColor: 'rgba(181,143,82,0.25)' }}>
            <Text className="text-[9.5px] font-extrabold uppercase tracking-wide text-[#8B6A2E] mb-1">{t('home.worthKnowing.title')}</Text>
            <Text className="text-xs leading-relaxed text-rove-charcoal">
              {t('home.worthKnowing.body')}
            </Text>
          </View>
        ) : null}

        <View className="h-px bg-rove-stone/10 mx-2 mt-6" />

        <View className="mt-5 gap-4 -mx-4">
          <RiverTrack label={t('home.logSignals')} items={railItems} direction="left" speed={26} onCardClick={onRailPress} />
          <RiverTrack label={t('home.readsLabel')} items={readsRail} direction="right" speed={30} hideIcon />
        </View>

        <View className="h-px bg-rove-stone/10 mx-2 mt-6" />

        <View className="mt-6 mb-4">
          <Text className="text-xl text-rove-charcoal px-2 mb-1" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
            {t('home.todaysSnapshot')}
          </Text>
          <Text
            onPress={() => router.push('/(app)/tracker' as any)}
            className="text-rove-stone text-[13px] font-semibold mb-4 px-2"
          >
            {t('home.viewFullTracker')}
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
                    style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}
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
        cycleStart={data.cycleStart}
        initialBbtCelsius={todayLog?.bbt_celsius ?? null}
        initialNsaidTaken={!!data.nsaidTakenByDate[todayKey]}
        initialLhBandLevel={data.lhBandByDate?.[todayKey] ?? null}
        stripsUsedThisCycle={data.lhReadingsThisCycleCount}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
      />
    </View>
  );
}
