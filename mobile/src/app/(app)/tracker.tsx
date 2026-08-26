import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Smile,
  Heart,
  Zap,
  Dumbbell,
  Droplet,
  Moon,
  Flame,
  Shield,
  PenLine,
  ZapOff,
  Check,
  ChevronRight,
} from 'lucide-react-native';

import ProfileAvatar from '../../components/home/ProfileAvatar';
import { Link } from 'expo-router';
import { phaseThemes } from '../../data/home-content';
import {
  CycleCalendar,
  DayInfoMap,
  Phase,
  PHASE_COLORS,
  CategoryKey,
} from '../../components/tracker/CycleCalendar';
import { SymptomChip } from '../../components/tracker/SymptomChip';
import { LogCard } from '../../components/tracker/LogCard';
import { NumericStepper } from '../../components/tracker/NumericStepper';
import { DurationInput } from '../../components/tracker/DurationInput';
import { HydrationTracker } from '../../components/tracker/HydrationTracker';
import { DischargeQuestionnaire, DischargeAnswers } from '../../components/tracker/DischargeQuestionnaire';
import { FlowCard } from '../../components/tracker/FlowCard';

import { QuickPhaseLog } from '../../components/tracker/QuickPhaseLog';
import { SectionJumpBar, JumpSection } from '../../components/tracker/SectionJumpBar';
import { FertilityCard } from '../../components/tracker/FertilityCard';
import type { OpkResult } from '@shared/cycle/ttc';
import LoadingScreen from '../../components/ui/LoadingScreen';
import {
  CATEGORY_COLORS,
  SYMPTOM_OPTIONS,
  MOODS_LIST,
  EXERCISE_OPTIONS,
  SELF_LOVE_OPTIONS,
  SLEEP_OPTIONS,
  DISRUPTORS_LIST,
  SEX_ACTIVITY_OPTIONS,
  CONTRACEPTION_OPTIONS,
  TYPE_COLORS,
  TypedOption,
  PlainOption,
} from '../../components/tracker/constants';
import { getLocalizedFontFamily, getLocalizedTracking } from '../../lib/fonts';
import {
  calculatePhase,
  getRelevantPeriodStart,
  findStreakStart,
  isInFertileWindow,
  deriveRecentCycleLengths,
  stalePeriodEndMarkersAfter,
  daysBetween,
  parseLocalDate,
  formatDate,
  type CycleSettings,
  type DailyLog,
} from '@shared/cycle/phase';
import {
  fetchTrackerData,
  fetchMonthLogs,
  logDailySymptoms,
  updateLastPeriodDate,
  savePeriodPredictionFeedback,
  type TrackerLog,
} from '../../lib/tracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';

// ─── Category derivation ────────────────────────────────────────────────────
// Mirrors getLoggedCategories() in
// frontend/src/app/cycle-sync/tracker/components/PeriodLoggingCard.tsx — maps
// a saved daily_logs row onto which colored activity bars show on its
// calendar cell.
function getLoggedCategories(log?: TrackerLog): CategoryKey[] {
  if (!log) return [];
  const categories: CategoryKey[] = [];
  if (log.cervical_discharge) categories.push('discharge');
  if ((log.symptoms ?? []).length > 0) categories.push('bodySignals');
  if ((log.moods ?? []).length > 0) categories.push('innerWeather');
  if ((log.exercise_types ?? []).length > 0 || log.exercise_minutes) categories.push('exerciseLog');
  if (log.water_intake && log.water_intake > 0) categories.push('hydration');
  if ((log.sleep_quality ?? []).length > 0 || log.sleep_minutes) categories.push('sleepLog');
  if ((log.disruptors ?? []).length > 0) categories.push('disruptors');
  if ((log.sex_activity ?? []).length > 0 || (log.contraception ?? []).length > 0) categories.push('sexualWellness');
  return categories;
}

function monthKey(year: number, month0: number): string {
  return `${year}-${String(month0 + 1).padStart(2, '0')}`;
}

function parseCervicalDischarge(raw: string | null): DischargeAnswers {
  if (!raw) return { vaginalFluid: null, appearance: null, sensation: null };
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return { vaginalFluid: parsed[0] ?? null, appearance: parsed[1] ?? null, sensation: parsed[2] ?? null };
    }
  } catch {
    // Not our JSON array format (e.g. a legacy web string) — no safe way to
    // split it back into three answers, so leave the questionnaire blank
    // rather than show something wrong.
  }
  return { vaginalFluid: null, appearance: null, sensation: null };
}

// Looks up the localized display text for an already-selected symptom (a
// persisted SYMPTOM_OPTIONS[].label value) — used by the "How bad?" severity
// rows, which only have the raw persisted string, not the option's `key`.
function getSymptomLabel(symptom: string, t: (key: string) => string): string {
  const option = SYMPTOM_OPTIONS.find((o) => o.label === symptom);
  return option ? t(`tracker.options.symptoms.${option.key}`) : symptom;
}

// ─── Chip toggle helper ────────────────────────────────────────────────────────
function toggleChip(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

// ─── SeverityRow ────────────────────────────────────────────────────────────
// A compact 1-5 rating for one already-selected symptom. Lives directly under
// the Body Signals ChipGrid — presence (the chip) and severity (this row) are
// deliberately two separate taps, so a quick "yes I have this" log still only
// takes one tap and severity stays optional-but-easy to add.
function SeverityRow({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', color: '#2D2420' }} numberOfLines={1}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 7 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value;
          return (
            <TouchableOpacity
              key={n}
              hitSlop={6}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(n);
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: active ? color : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: active ? color : '#E5E0DB',
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Section group header ─────────────────────────────────────────────────────
function SectionGroup({
  icon,
  title,
  iconBgColor,
  accentColor,
  cardTint,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  iconBgColor: string;
  /** Small icon-badge glow color only — the fill itself uses the shared
   * `cardTint`, same reasoning as LogCard. */
  accentColor?: string;
  cardTint?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionGroup, accentColor && { shadowColor: accentColor }]}>
      {/* Same frosted-glass fill as LogCard, so Lifestyle/Intimacy match the
          individual cards inside them instead of looking like a plainer
          wrapper. */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
      )}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: cardTint ?? 'rgba(168,162,158,0.12)' },
        ]}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />
      <TouchableOpacity
        style={styles.sectionGroupHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={[styles.sectionGroupIcon, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        <Text style={styles.sectionGroupTitle}>{title}</Text>
        <ChevronRight
          size={18}
          color="#A8A29E"
          style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      {open && <View style={styles.sectionGroupBody}>{children}</View>}
    </View>
  );
}

// ─── SubSection label ─────────────────────────────────────────────────────────
function SubSectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.subSectionRow}>
      {icon}
      <Text style={styles.subSectionLabel}>{label}</Text>
    </View>
  );
}

// ─── ChipGrid ────────────────────────────────────────────────────────────────
// Uniform category-colored chips (Body Signals, Inner Weather, Exercise
// types, Self Love, Contraception) — active state fills solid with
// `activeColor`, matching the web's flat per-card theme.
// `item.label` is the value persisted to `selected` (and, on save, to
// daily_logs) — stays in English. `namespace` + `item.key` look up the
// localized display text via `tracker.options.<namespace>.<key>`.
function ChipGrid({
  items,
  selected,
  onToggle,
  activeColor,
  namespace,
}: {
  items: PlainOption[];
  selected: string[];
  onToggle: (v: string) => void;
  activeColor?: string;
  namespace: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.chipWrap}>
      {items.map((item) => {
        const isActive = selected.includes(item.label);
        return (
          <SymptomChip
            key={item.label}
            label={t(`tracker.options.${namespace}.${item.key}`)}
            isSelected={isActive}
            onToggle={() => onToggle(item.label)}
            accentColor={activeColor}
            activeColor={activeColor}
            icon={isActive ? <Check size={12} color="#FFFFFF" /> : undefined}
          />
        );
      })}
    </View>
  );
}

// ─── TypedChipGrid ──────────────────────────────────────────────────────────
// Per-item colored chips (Sleep Quality, Disruptors) — active state is a
// soft tint colored by the item's semantic type (green=positive,
// red=negative, orange=orange), matching the web's typed active classes.
// Inactive border stays uniform (the card's category color).
function TypedChipGrid({
  items,
  selected,
  onToggle,
  accentColor,
  namespace,
}: {
  items: TypedOption[];
  selected: string[];
  onToggle: (v: string) => void;
  accentColor?: string;
  namespace: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.chipWrap}>
      {items.map((item) => {
        const isActive = selected.includes(item.label);
        const color = TYPE_COLORS[item.type];
        return (
          <SymptomChip
            key={item.label}
            label={t(`tracker.options.${namespace}.${item.key}`)}
            isSelected={isActive}
            onToggle={() => onToggle(item.label)}
            accentColor={accentColor}
            activeColor={color}
            activeVariant="soft"
            icon={isActive ? <Check size={12} color={color} /> : undefined}
          />
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function TrackerScreen() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  // The tab bar is absolutely positioned over screen content (see
  // (app)/_layout.tsx), so a fixed `bottom` on the floating Save bar left it
  // hidden behind the blurred tab bar — this reads its real rendered height
  // so the bar always clears it.
  const tabBarHeight = useBottomTabBarHeight();
  const { data: trackerData, isLoading } = useQuery({
    queryKey: ['trackerData'],
    queryFn: fetchTrackerData,
  });

  // Gates the Fertility card and its jump target. Defaults to off, so a failed
  // or still-loading profile fetch simply shows the standard tracker.
  const isTtcMode = trackerData?.trackerMode === 'ttc';

  // PCOS and irregular cycles both make date-math cycle prediction unreliable
  // — a BBT/LH signal is the more accurate read for these users even when
  // they're not trying to conceive, so the Fertility card unlocks for them
  // too, not just TTC mode.
  const showFertilityTracking = isTtcMode || !!trackerData?.hasPcos || !!trackerData?.isIrregular;
  const fertilityTrackingSuggested = !isTtcMode && (!!trackerData?.hasPcos || !!trackerData?.isIrregular);

  // Calendar / selection state
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calMonth, setCalMonth] = useState(selectedDate.getMonth());
  const [calYear, setCalYear] = useState(selectedDate.getFullYear());
  const [isPeriodLoggingMode, setIsPeriodLoggingMode] = useState(false);
  // `null` means "clear this day back to no data" — distinct from `false`,
  // which is an explicit "not bleeding" that only "End Period Here" writes.
  const [pendingPeriodChanges, setPendingPeriodChanges] = useState<Map<string, boolean | null>>(new Map());

  // Real cycle settings + logs, seeded from the initial query then kept in
  // sync locally as the user edits/saves/navigates months.
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({
    last_period_start: '',
    cycle_length_days: 28,
    period_length_days: 5,
  });
  const [monthLogs, setMonthLogs] = useState<Record<string, TrackerLog>>({});
  const loadedMonthsRef = useRef<Set<string>>(new Set());
  const dataReadyRef = useRef(false);
  // `isLoading` alone isn't enough to gate the first paint: a cached/persisted
  // query resolves with `isLoading: false` on the very first render, while the
  // state below is still holding its empty defaults until the effect runs a
  // tick later. That one frame rendered `last_period_start: ''`, which reads as
  // "no cycle data" and flashed the log-your-first-period empty state before
  // snapping to the real calendar. This tracks whether the seeding has actually
  // landed, so the screen can hold the loading view until it has.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!trackerData) return;
    setCycleSettings(trackerData.settings);
    setMonthLogs(trackerData.monthLogs);
    const now = new Date();
    for (let offset = -1; offset <= 1; offset++) {
      const m = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      loadedMonthsRef.current.add(monthKey(m.getFullYear(), m.getMonth()));
    }
    dataReadyRef.current = true;
    setHydrated(true);
  }, [trackerData]);

  // Fetch logs for the visible month (+ its neighbors) whenever navigation
  // lands on a month outside the initial 90-day window — this is what makes
  // the calendar show real data for any month instead of nothing.
  useEffect(() => {
    if (!dataReadyRef.current) return;
    let cancelled = false;

    const monthsToLoad = [
      new Date(calYear, calMonth - 1, 1),
      new Date(calYear, calMonth, 1),
      new Date(calYear, calMonth + 1, 1),
    ].filter((d) => !loadedMonthsRef.current.has(monthKey(d.getFullYear(), d.getMonth())));

    if (monthsToLoad.length === 0) return;
    monthsToLoad.forEach((d) => loadedMonthsRef.current.add(monthKey(d.getFullYear(), d.getMonth())));

    (async () => {
      const results = await Promise.all(
        monthsToLoad.map((d) => fetchMonthLogs(d.getFullYear(), d.getMonth()))
      );
      if (cancelled) return;
      setMonthLogs((prev) => {
        const next = { ...prev };
        results.flat().forEach((l) => {
          next[l.date] = l;
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [calYear, calMonth]);

  // Shared-module view of the logs (just date + is_period), what
  // calculatePhase()/getRelevantPeriodStart() actually consume.
  const sharedLogs: Record<string, DailyLog> = useMemo(() => {
    const logs: Record<string, DailyLog> = {};
    for (const [dateStr, log] of Object.entries(monthLogs)) {
      logs[dateStr] = { date: dateStr, is_period: log.is_period ?? undefined };
    }
    return logs;
  }, [monthLogs]);

  // ─── Real phase calculation — same canonical module the website and every
  // other mobile screen (dashboard/plan/insights/profile) use. ───────────────
  const phaseResult = useMemo(
    () => calculatePhase(selectedDate, cycleSettings, sharedLogs),
    [selectedDate, cycleSettings, sharedLogs]
  );
  const currentPhase: Phase = phaseResult.phase;
  const dayInCycle = phaseResult.day > 0 ? phaseResult.day : null;
  const hasPhaseData = phaseResult.phase !== null;
  const lateByDays = phaseResult.daysLate;
  // Her own recent cycle lengths, so the shading below widens (or disappears)
  // for her real variability instead of drawing the same fixed 5-day window for
  // everyone — the same input Home's fertile window already uses.
  const recentCycleLengths = useMemo(
    () => deriveRecentCycleLengths(new Date(), sharedLogs),
    [sharedLogs]
  );
  // All four arguments, every time. Dropping the luteal length and her cycle
  // history is what made this disagree with Home — and passing the history is
  // also what lets isInFertileWindow suppress the window entirely once her
  // cycles are too irregular for one to mean anything, instead of the calendar
  // shading days 9-15 while Home says it can't call a window at all.
  const fertileFor = useCallback(
    (day: number) =>
      isInFertileWindow(
        day,
        cycleSettings.cycle_length_days || 28,
        cycleSettings.luteal_length_days,
        recentCycleLengths,
        cycleSettings.period_length_days
      ),
    [cycleSettings, recentCycleLengths]
  );

  const isFertileDay =
    dayInCycle && !phaseResult.latePeriod
      ? fertileFor(dayInCycle) && currentPhase !== 'Menstrual'
      : false;

  const phaseThemeColor = currentPhase ? PHASE_COLORS[currentPhase] : '#A8A29E';
  // Frosted-card tint — same token Home/Plan pull from for their
  // BlurView+gradient card fills, so tracker's cards match that recipe
  // instead of the flat opaque fill they used to have.
  const phaseCardTint = currentPhase ? phaseThemes[currentPhase]?.cardTint ?? 'rgba(168,162,158,0.12)' : 'rgba(168,162,158,0.12)';

  const todayResult = useMemo(
    () => calculatePhase(new Date(), cycleSettings, sharedLogs),
    [cycleSettings, sharedLogs]
  );
  // Separate from `lateByDays` above — the headline reports how late
  // *today's* period is, not the selected date's, matching the web's
  // PeriodLoggingCard (which computes this from its own todayResult).
  const todayLateByDays = todayResult.daysLate;

  const daysUntilPeriod = useMemo(() => {
    const cycleLength = cycleSettings.cycle_length_days || 28;
    if (!cycleSettings.last_period_start && Object.keys(sharedLogs).length === 0) return 0;
    if (todayResult.phase === null || todayResult.latePeriod) return 0;

    const anchor = getRelevantPeriodStart(new Date(), cycleSettings, sharedLogs);
    if (!anchor.start) return 0;

    const anchorDate = parseLocalDate(anchor.start);
    const nextStart = new Date(anchorDate);
    nextStart.setDate(anchorDate.getDate() + cycleLength);
    return Math.max(0, daysBetween(new Date(), nextStart));
  }, [cycleSettings, sharedLogs, todayResult]);

  const headline = todayResult.phase === null
    ? t('tracker.headline.logFirstPeriod')
    : currentPhase === 'Menstrual'
      ? t('tracker.headline.periodDay', { day: Math.max(1, dayInCycle || 1) })
      : todayResult.staleAnchor
        // Months past an onboarding date she never logged against, the count is
        // noise, not information — "423 days late" helps nobody. Ask for a
        // period instead of asserting a number.
        ? t('tracker.headline.staleAnchor')
        : todayResult.latePeriod
          ? todayLateByDays === 0
            ? t('tracker.headline.periodDueToday')
            : t('tracker.headline.lateBy', { count: todayLateByDays })
          : daysUntilPeriod === 0
            ? t('tracker.headline.startsToday')
            : t('tracker.headline.periodIn', { count: daysUntilPeriod });

  // A late period is the most anxious moment in the cycle, and a bare number with no
  // context is what makes it worse. Normalise the common case, and only at a week or
  // more point toward an actual next step. Deliberately non-diagnostic.
  const LATE_ADVICE_THRESHOLD_DAYS = 7;
  const headlineSubtext = todayResult.staleAnchor
    ? t('tracker.headline.staleAnchorAdvice')
    : todayResult.latePeriod && todayLateByDays > 0
      ? todayLateByDays >= LATE_ADVICE_THRESHOLD_DAYS
        ? t('tracker.headline.lateAdviceLong')
        : t('tracker.headline.lateAdviceShort')
      : t('tracker.calendar.defaultSubtext');

  // ─── Per-cell calendar data for the visible month, keyed by real date ─────
  const dayInfo: DayInfoMap = useMemo(() => {
    const map: DayInfoMap = {};
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calYear, calMonth, day);
      const dateStr = formatDate(date);
      const result = calculatePhase(date, cycleSettings, sharedLogs);
      const log = monthLogs[dateStr];
      const fertile =
        result.phase && !result.latePeriod && result.day > 0
          ? fertileFor(result.day)
          : false;
      map[dateStr] = {
        phase: result.phase,
        isPeriod: log?.is_period === true,
        fertile,
        categories: getLoggedCategories(log),
      };
    }
    return map;
  }, [calYear, calMonth, cycleSettings, sharedLogs, monthLogs, fertileFor]);

  // ─── Period-mode toggling — staged locally, persisted on "Done" ──────────
  // Tapping a day fills forward a typical period length (Cycle Settings'
  // Period Length) from it, in whichever direction that tap moves — marking
  // day one auto-fills the days after it as bleeding, and un-marking it
  // clears the same forward span, so undoing a period doesn't require
  // tapping every day by hand either.
  // A date is the start of a new period streak when the day right before it
  // isn't already logged as period. Used both to scope the auto-fill-forward
  // convenience to genuine period starts, and to tell HealthKit which day is
  // the cycle start via HKMenstrualCycleStart metadata.
  const isPeriodStreakStart = (dateStr: string): boolean => {
    const prevDay = parseLocalDate(dateStr);
    prevDay.setDate(prevDay.getDate() - 1);
    return monthLogs[formatDate(prevDay)]?.is_period !== true;
  };

  // Tapping a day toggles only that day — no auto-fill of a "typical"
  // period length. That convenience used to fill forward period_length_days
  // from whatever day was tapped, but tying it to the stored average caused
  // real confusion: re-adding a single day within an existing streak could
  // spill into unrelated days, and logging an actual period that ran
  // shorter/longer/earlier than the stored average would mark days beyond
  // what was actually true. "End Period Here" already covers the "fill the
  // rest of a range" case explicitly, so a plain tap should just mean this
  // one day, nothing more.
  const handleTogglePeriodDate = (dateStr: string) => {
    const turningOn = monthLogs[dateStr]?.is_period !== true;

    // Un-marking clears the day (null), it does not record "not bleeding"
    // (false). Those mean different things to the phase engine: an explicit
    // false ends the period from that day on, which is right when she taps
    // "End Period Here" but wrong when she is just undoing a mis-tap. Writing
    // false here made an accidental tap permanently truncate her period.
    const nextValue: boolean | null = turningOn ? true : null;

    const updates: Record<string, TrackerLog> = {};
    const staged = new Map<string, boolean | null>([[dateStr, nextValue]]);
    updates[dateStr] = { ...(monthLogs[dateStr] ?? emptyLog(dateStr)), is_period: nextValue };

    // Marking a period start has to clear any "not bleeding" markers sitting
    // on the days right after it. Those were written earlier — an old "End
    // Period Here" trail (which writes false to the next 7 days), or a
    // pre-fix un-tap — so relative to a period she is starting *now* they are
    // stale, and the engine has no way to tell that from the data alone.
    // Left in place, one of them ends the period on day 2 and "my period
    // started today" projects no days forward at all.
    //
    // Scoped to the typical period length, and only ever clears `false` — a
    // day she actually logged as bleeding is never touched.
    if (turningOn) {
      for (const dStr of stalePeriodEndMarkersAfter(
        dateStr,
        cycleSettings.period_length_days || 5,
        sharedLogs
      )) {
        updates[dStr] = { ...(monthLogs[dStr] ?? emptyLog(dStr)), is_period: null };
        staged.set(dStr, null);
      }
    }

    setPendingPeriodChanges((prev) => {
      const next = new Map(prev);
      staged.forEach((v, k) => next.set(k, v));
      return next;
    });
    setMonthLogs((prev) => ({ ...prev, ...updates }));
  };

  const handleEndPeriod = () => {
    const dateStr = formatDate(selectedDate);
    const changed = new Map(pendingPeriodChanges);
    const updates: Record<string, TrackerLog> = {};

    if (!monthLogs[dateStr]?.is_period) {
      updates[dateStr] = { ...(monthLogs[dateStr] ?? emptyLog(dateStr)), is_period: true };
      changed.set(dateStr, true);
    }

    const cur = new Date(selectedDate);
    for (let i = 1; i <= 7; i++) {
      cur.setDate(cur.getDate() + 1);
      const dStr = formatDate(cur);
      if (monthLogs[dStr]?.is_period !== false) {
        updates[dStr] = { ...(monthLogs[dStr] ?? emptyLog(dStr)), is_period: false };
        changed.set(dStr, false);
      }
    }

    setMonthLogs((prev) => ({ ...prev, ...updates }));
    setPendingPeriodChanges(changed);
    toast.info('Period ended here. Future days cleared.');
  };

  // After a batch of period toggles, persist each changed day and re-anchor
  // last_period_start to the most recent streak — mirrors the web's
  // handleSavePeriodChanges in frontend/.../tracker/page.tsx.
  const handleSavePeriodChanges = async () => {
    if (pendingPeriodChanges.size === 0) {
      setIsPeriodLoggingMode(false);
      return;
    }

    const entries = Array.from(pendingPeriodChanges.entries());
    const results = await Promise.all(
      entries.map(([dateStr, isPeriod]) => {
        const log = monthLogs[dateStr] ?? emptyLog(dateStr);
        return logDailySymptoms({
          date: dateStr,
          symptoms: log.symptoms ?? [],
          isPeriod,
          isPeriodStart: isPeriod === true ? isPeriodStreakStart(dateStr) : undefined,
          flowIntensity: isPeriod === true ? log.flow_intensity || 'Normal' : undefined,
          moods: log.moods ?? [],
          notes: log.notes ?? '',
          cervicalDischarge: log.cervical_discharge ?? undefined,
          exerciseTypes: log.exercise_types ?? [],
          exerciseMinutes: log.exercise_minutes ?? null,
          waterIntake: log.water_intake ?? 0,
          selfLoveTags: log.self_love_tags ?? [],
          selfLoveOther: log.self_love_other ?? '',
          sleepQuality: log.sleep_quality ?? [],
          sleepMinutes: log.sleep_minutes ?? null,
          disruptors: log.disruptors ?? [],
          sexActivity: log.sex_activity ?? [],
          contraception: log.contraception ?? [],
        });
      })
    );

    if (results.some((r) => !r.success)) {
      toast.error(t('tracker.toasts.periodSaveFailed'), { description: t('tracker.toasts.tryAgain') });
      return;
    }

    const merged: Record<string, DailyLog> = { ...sharedLogs };
    pendingPeriodChanges.forEach((isPeriod, dateStr) => {
      // DailyLog spells "no data" as undefined, the DB as null.
      merged[dateStr] = { date: dateStr, is_period: isPeriod ?? undefined };
    });
    await reanchorLastPeriodStart(merged);

    setPendingPeriodChanges(new Map());
    setIsPeriodLoggingMode(false);
    toast.success(t('tracker.toasts.periodDatesUpdated'));

    // This path can move last_period_start (see reanchorLastPeriodStart) —
    // every screen reading cycle data needs to know, same as the regular
    // daily-log save below already does. That includes this screen's own
    // ['trackerData'] query: without it, the cached copy keeps the pre-change
    // anchor, so Tracker itself drifts out of step with the database it just
    // wrote to, and reads as "correct" while every other screen looks wrong.
    queryClient.invalidateQueries({ queryKey: ['trackerData'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    queryClient.invalidateQueries({ queryKey: ['plan'] });
  };

  // Finds the start of the most recent logged period streak and persists it as
  // the anchor whenever it differs from what's stored — in either direction.
  //
  // This used to only ever move the anchor *forward*
  // (`streakStart >= last_period_start`), which meant un-marking period days
  // could never correct it: `user_cycle_settings.last_period_start` would stay
  // pinned to a date with no logged period days behind it. Every screen that
  // falls back to that column when no period days are logged (see
  // getRelevantPeriodStart's step 3) then reported a phase anchored to a period
  // that doesn't exist, disagreeing with the calendar right next to it. Logged
  // days are the truth; the column is a cache of where they start.
  const reanchorLastPeriodStart = async (logs: Record<string, DailyLog>) => {
    const periodDates = Object.keys(logs)
      .filter((d) => logs[d]?.is_period === true)
      .sort((a, b) => b.localeCompare(a));
    // Nothing logged in the loaded window — can't derive an anchor. Deliberately
    // leaves the stored one alone rather than clearing it, since the window is
    // partial (90 days plus whatever months were browsed) and an older period
    // may simply not be loaded.
    if (periodDates.length === 0) return;

    const mostRecent = periodDates[0];
    const streakStart = findStreakStart(mostRecent, logs);

    if (streakStart !== cycleSettings.last_period_start) {
      // Snapshot what the app was predicting BEFORE this anchor moves, so the
      // "were we right?" prompt below compares against the old prediction —
      // once `updateLastPeriodDate` lands, last_period_start becomes the new
      // streak start and the old prediction is gone.
      const isGenuinelyNewPeriod = cycleSettings.last_period_start && streakStart > cycleSettings.last_period_start;
      let priorPrediction: { predictedDate: string; daysOff: number } | null = null;
      if (isGenuinelyNewPeriod) {
        const predicted = parseLocalDate(cycleSettings.last_period_start);
        predicted.setDate(predicted.getDate() + (cycleSettings.cycle_length_days || 28));
        const predictedDate = formatDate(predicted);
        const daysOff = daysBetween(predicted, parseLocalDate(streakStart));
        // Outside this range the comparison isn't meaningful (long tracking
        // gaps, a settings change) — skip asking rather than show nonsense.
        if (Math.abs(daysOff) <= 60) {
          priorPrediction = { predictedDate, daysOff };
        }
      }

      const result = await updateLastPeriodDate(streakStart);
      if (result.success) {
        setCycleSettings((prev) => ({ ...prev, last_period_start: streakStart }));
        if (priorPrediction) {
          setPredictionPrompt({
            periodStartDate: streakStart,
            predictedDate: priorPrediction.predictedDate,
            daysOff: priorPrediction.daysOff,
          });
        }
      }
    }
  };

  const answerPredictionPrompt = async (wasAccurate: boolean) => {
    if (!predictionPrompt) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await savePeriodPredictionFeedback({
      periodStartDate: predictionPrompt.periodStartDate,
      predictedDate: predictionPrompt.predictedDate,
      daysOff: predictionPrompt.daysOff,
      wasAccurate,
    });
    setPredictionPrompt(null);
  };

  // Section visibility
  // Both start collapsed — not everyone tracks Lifestyle/Intimacy day to
  // day, and they sit far enough down the page that leaving them open by
  // default just adds scroll distance for people who skip them. The jump
  // bar above the fold opens + scrolls to whichever one someone does want.
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [intimacyOpen, setIntimacyOpen] = useState(false);

  // Scroll-to-section — refs the ScrollView and remembers where Lifestyle
  // and Intimacy land so the jump bar can animate straight to them instead
  // of making people scroll past everything in between.
  const trackerScrollRef = useRef<ScrollView>(null);
  const [lifestyleSectionY, setLifestyleSectionY] = useState(0);
  const [intimacySectionY, setIntimacySectionY] = useState(0);
  const [fertilitySectionY, setFertilitySectionY] = useState(0);

  const handleJumpToSection = (section: JumpSection) => {
    if (section === 'daily') {
      trackerScrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (section === 'fertility') {
      trackerScrollRef.current?.scrollTo({ y: Math.max(0, fertilitySectionY - 12), animated: true });
      return;
    }
    if (section === 'lifestyle') {
      setLifestyleOpen(true);
      trackerScrollRef.current?.scrollTo({ y: Math.max(0, lifestyleSectionY - 12), animated: true });
      return;
    }
    setIntimacyOpen(true);
    trackerScrollRef.current?.scrollTo({ y: Math.max(0, intimacySectionY - 12), animated: true });
  };

  // Per-date edit state — repopulated from monthLogs whenever the selected
  // date (or its underlying data) changes, matching the web's load-on-select
  // effect in page.tsx.
  const [bodySignals, setBodySignals] = useState<string[]>([]);
  const [symptomSeverity, setSymptomSeverity] = useState<Record<string, number>>({});
  // "Were we right?" prompt — shown once when a genuinely new period start is
  // logged, comparing what the app had predicted against where it actually landed.
  const [predictionPrompt, setPredictionPrompt] = useState<{
    periodStartDate: string;
    predictedDate: string | null;
    daysOff: number | null;
  } | null>(null);
  const [innerWeather, setInnerWeather] = useState<string[]>([]);
  const [selfLove, setSelfLove] = useState<string[]>([]);
  const [selfLoveNote, setSelfLoveNote] = useState('');
  const [exerciseType, setExerciseType] = useState<string[]>([]);
  const [exerciseMins, setExerciseMins] = useState(0);
  const [hydrationGlasses, setHydrationGlasses] = useState(0);
  const [sleepQuality, setSleepQuality] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepMins, setSleepMins] = useState(0);
  const [sexualActivity, setSexualActivity] = useState<string[]>([]);
  const [contraception, setContraception] = useState<string[]>([]);
  const [disruptors, setDisruptors] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [dischargeAnswers, setDischargeAnswers] = useState<DischargeAnswers>({
    vaginalFluid: null,
    appearance: null,
    sensation: null,
  });

  const [flowIntensity, setFlowIntensity] = useState<string | null>(null);

  // TTC biomarkers — only collected (and only saved) when the Fertility card
  // is actually on screen.
  const [bbtCelsius, setBbtCelsius] = useState<number | null>(null);
  const [opkResult, setOpkResult] = useState<OpkResult | null>(null);

  const noteMax = 1000;

  // Autosave — debounced background save of whatever's been entered so far,
  // so nothing is lost if she never taps "Save Log". `skipNextAutosaveRef`
  // suppresses the run that fires when fields are reset by loading a day's
  // data (switching dates, or the reflow after a save) rather than by an
  // actual edit.
  const skipNextAutosaveRef = useRef(true);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The exact log object a save just wrote into monthLogs, so the
  // field-reset effect below can recognize "this selectedLog change is just
  // an echo of my own save" and skip re-deriving fields entirely — see the
  // comment at its use for why that distinction matters.
  const justSavedLogRef = useRef<TrackerLog | null>(null);

  // Deliberately keyed on the *specific day's* log entry (`selectedLog`), not
  // the whole `monthLogs` object. Depending on `monthLogs` directly was a
  // real bug: that object gets a new reference on every mutation — toggling
  // a period day, a background month fetch landing — even for a completely
  // different date, which re-ran this effect and silently overwrote whatever
  // the user had typed/toggled but not yet saved. Individual `TrackerLog`
  // entries keep their same reference when unrelated keys change (every
  // `setMonthLogs` call spreads `{...prev, ...updates}`), so `selectedLog`
  // only changes when this exact day's data actually changes.
  const selectedDateStr = formatDate(selectedDate);
  const selectedLog = monthLogs[selectedDateStr];

  useEffect(() => {
    // This selectedLog change is just the echo of a save this same screen
    // just performed (autosave or the manual button) — fields already match
    // it exactly, so resetting them would be a no-op at best. It was worse
    // than a no-op: when every field happens to already match (the normal
    // case right after a save), React skips re-rendering for all of them,
    // which meant the effect below that's supposed to *consume*
    // `skipNextAutosaveRef` never ran again — leaving it stuck `true` and
    // silently swallowing the next real edit's autosave (e.g. selecting a
    // symptom worked, but deselecting it right after didn't). Bailing out
    // here before touching any state or the flag avoids that trap entirely.
    if (selectedLog && selectedLog === justSavedLogRef.current) {
      return;
    }
    setBodySignals(selectedLog?.symptoms ?? []);
    setSymptomSeverity(selectedLog?.symptom_severity ?? {});
    setInnerWeather(selectedLog?.moods ?? []);
    setExerciseType(selectedLog?.exercise_types ?? []);
    setExerciseMins(selectedLog?.exercise_minutes ?? 0);
    setHydrationGlasses(selectedLog?.water_intake ?? 0);
    setSelfLove(selectedLog?.self_love_tags ?? []);
    setSelfLoveNote(selectedLog?.self_love_other ?? '');
    setSleepQuality(selectedLog?.sleep_quality ?? []);
    setSleepHours(selectedLog?.sleep_minutes ? Math.floor(selectedLog.sleep_minutes / 60) : 0);
    setSleepMins(selectedLog?.sleep_minutes ? selectedLog.sleep_minutes % 60 : 0);
    setDisruptors(selectedLog?.disruptors ?? []);
    setSexualActivity(selectedLog?.sex_activity ?? []);
    setContraception(selectedLog?.contraception ?? []);
    setNote(selectedLog?.notes ?? '');
    setFlowIntensity(selectedLog?.flow_intensity ?? null);
    setBbtCelsius(selectedLog?.bbt_celsius ?? null);
    setOpkResult(selectedLog?.opk_result ?? null);
    // parseCervicalDischarge always builds a fresh object, which would
    // otherwise look like a "change" to the autosave effect below on every
    // reload even when nothing's different — compare fields and keep the
    // existing object when they match so autosave doesn't re-fire forever.
    const nextDischarge = parseCervicalDischarge(selectedLog?.cervical_discharge ?? null);
    setDischargeAnswers((prev) =>
      prev.vaginalFluid === nextDischarge.vaginalFluid &&
      prev.appearance === nextDischarge.appearance &&
      prev.sensation === nextDischarge.sensation
        ? prev
        : nextDischarge
    );
    // This reload just happened because the date (or its underlying data)
    // changed — not because the person edited anything — so the autosave
    // effect below should skip the run it's about to see from these resets.
    skipNextAutosaveRef.current = true;
  }, [selectedDate, selectedLog]);

  const handleMonthChange = (dir: 'prev' | 'next') => {
    if (dir === 'next') {
      if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
      else setCalMonth((m) => m + 1);
    } else {
      if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
      else setCalMonth((m) => m - 1);
    }
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compare = new Date(date);
    compare.setHours(0, 0, 0, 0);
    return compare > today;
  };

  const [isSaving, setIsSaving] = useState(false);

  // Shared by the manual "Save Log" button and the autosave effect below.
  // `silent` skips the spinner/toast/haptic so background autosaves stay
  // quiet — errors still surface (softly), since silently losing an entry
  // would be worse than a small interruption.
  const performSave = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (isFutureDate(selectedDate)) return;
    const dateStr = formatDate(selectedDate);
    const existingIsPeriod = monthLogs[dateStr]?.is_period === true;

    // Which card was showing determines which field gets saved — matches the
    // web's FlowCard/DischargeCard split (only one is ever relevant for a
    // given day).
    const showingFlowCard = currentPhase === 'Menstrual';
    const resolvedFlowIntensity = showingFlowCard ? flowIntensity || 'Normal' : undefined;
    const cervicalDischarge = showingFlowCard
      ? undefined
      : dischargeAnswers.vaginalFluid || dischargeAnswers.appearance || dischargeAnswers.sensation
        ? JSON.stringify([dischargeAnswers.vaginalFluid, dischargeAnswers.appearance, dischargeAnswers.sensation])
        : undefined;

    if (!silent) setIsSaving(true);
    const result = await logDailySymptoms({
      date: dateStr,
      symptoms: bodySignals,
      symptomSeverity,
      moods: innerWeather,
      exerciseTypes: exerciseType,
      exerciseMinutes: exerciseMins || null,
      waterIntake: hydrationGlasses,
      selfLoveTags: selfLove,
      selfLoveOther: selfLoveNote,
      sleepQuality,
      sleepMinutes: (sleepHours || sleepMins) ? sleepHours * 60 + sleepMins : null,
      disruptors,
      sexActivity: sexualActivity,
      contraception,
      // Save doesn't change period status on its own — that's set via the
      // calendar's "Log Period" mode — but it must preserve whatever is
      // already logged for the day instead of silently clearing it.
      isPeriod: existingIsPeriod,
      flowIntensity: resolvedFlowIntensity,
      cervicalDischarge,
      // Left undefined when fertility tracking isn't shown so the write
      // doesn't touch these columns at all — someone who switches modes (or
      // stops qualifying for PCOS/irregular tracking) mid-cycle keeps the
      // readings she already logged.
      bbtCelsius: showFertilityTracking ? bbtCelsius : undefined,
      opkResult: showFertilityTracking ? opkResult : undefined,
      notes: note,
    });
    if (!silent) setIsSaving(false);

    if (!result.success) {
      toast.error(silent ? t('tracker.toasts.autoSaveFailed') : t('tracker.toasts.saveEntryFailed'), {
        description: silent ? t('tracker.toasts.tapSaveLogRetry', { saveLog: t('tracker.saveLog') }) : result.error,
      });
      return;
    }

    if (!silent) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setMonthLogs((prev) => {
      const updatedLog: TrackerLog = {
        ...(prev[dateStr] ?? emptyLog(dateStr)),
        symptoms: bodySignals,
        symptom_severity: symptomSeverity,
        moods: innerWeather,
        exercise_types: exerciseType,
        exercise_minutes: exerciseMins || null,
        water_intake: hydrationGlasses,
        self_love_tags: selfLove,
        self_love_other: selfLoveNote,
        sleep_quality: sleepQuality,
        sleep_minutes: (sleepHours || sleepMins) ? sleepHours * 60 + sleepMins : null,
        disruptors,
        sex_activity: sexualActivity,
        contraception,
        is_period: existingIsPeriod,
        flow_intensity: resolvedFlowIntensity ?? null,
        cervical_discharge: cervicalDischarge ?? null,
        // Mirrors the omit-when-fertility-tracking-is-hidden rule above: keep
        // whatever the row already held rather than blanking the local copy too.
        ...(showFertilityTracking ? { bbt_celsius: bbtCelsius, opk_result: opkResult } : {}),
        notes: note,
      };
      // Recorded so the field-reset effect can tell this exact update apart
      // from a real external change once it shows up as the new selectedLog.
      justSavedLogRef.current = updatedLog;
      return { ...prev, [dateStr]: updatedLog };
    });

    if (!silent) {
      toast.success(t('tracker.toasts.entrySaved'), { description: t('tracker.toasts.entrySavedDescription') });
    }

    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    queryClient.invalidateQueries({ queryKey: ['plan'] });
  };

  const handleSaveLog = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    performSave({ silent: false });
  };

  // Debounced autosave — waits for a pause in editing, then quietly persists
  // whatever's currently entered so an entry never gets lost just because
  // she closed the app without tapping Save Log.
  useEffect(() => {
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }
    if (isPeriodLoggingMode || isFutureDate(selectedDate)) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      performSave({ silent: true });
    }, 2000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bodySignals,
    symptomSeverity,
    innerWeather,
    selfLove,
    selfLoveNote,
    exerciseType,
    exerciseMins,
    hydrationGlasses,
    sleepQuality,
    sleepHours,
    sleepMins,
    sexualActivity,
    contraception,
    disruptors,
    note,
    dischargeAnswers,
    flowIntensity,
    bbtCelsius,
    opkResult,
  ]);

  // `trackerData && !hydrated` covers the cached-resolve case described above.
  // Deliberately not `!hydrated` on its own: when the query legitimately
  // resolves to null (no signed-in user / no settings row) nothing ever seeds
  // the state, and gating on that would hang here forever instead of falling
  // through to the empty state that case is supposed to show.
  if (isLoading || (trackerData && !hydrated)) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Top Nav — left-aligned eyebrow + serif title, phase-tinted,
          matching Home/Insights/Plan's header instead of the centered,
          bordered bar this screen used to have on its own. ── */}
      <View style={styles.nav}>
        <View>
          <Text style={[styles.navEyebrow, { letterSpacing: getLocalizedTracking(2, i18n.language) }]}>
            {t('tracker.navEyebrow')}
          </Text>
          <Text style={[styles.navTitle, { color: phaseThemeColor, fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }]}>
            {t('common.tabs.tracker')}
          </Text>
        </View>
        <ProfileAvatar />
      </View>

      <ScrollView
        ref={trackerScrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Cycle Status Card — frosted glass (Blur + gradient sheen +
            phase tint) matching Home/Plan's card recipe, phase-tinted
            shadow glow like before. ── */}
        <View
          style={[
            styles.statusCard,
            currentPhase && { shadowColor: PHASE_COLORS[currentPhase], shadowOpacity: 0.1 },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
          )}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: phaseCardTint }]} />
          <LinearGradient
            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 0.7 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.statusCardInner}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusDate}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              {/* `latePeriod` is already true on the day the period is merely
                  due, when daysLate is correctly 0 — without this guard the
                  badge read "Late 0d" while the headline directly above it
                  said "Period due today". */}
              {hasPhaseData && phaseResult.latePeriod && lateByDays > 0 && !phaseResult.staleAnchor && (
                <Text style={styles.statusLateText}>Late {lateByDays}d</Text>
              )}
            </View>

            <View style={styles.statusCenter}>
              <View style={[styles.statusDot, currentPhase && { backgroundColor: PHASE_COLORS[currentPhase] }]} />
              <View
                style={[
                  styles.phaseBadge,
                  currentPhase ? { backgroundColor: `${PHASE_COLORS[currentPhase]}1A` } : styles.phaseBadgeNeutral,
                ]}
              >
                <Text style={[styles.phaseBadgeText, currentPhase && { color: PHASE_COLORS[currentPhase] }]}>
                  {currentPhase ? t(`tracker.quickPhaseLog.phaseNames.${currentPhase}`) : t('tracker.phaseUnknown')}
                </Text>
                {isFertileDay && <Text style={styles.fertileInline}> • {t('tracker.fertileInline')}</Text>}
              </View>
            </View>

            <Text style={styles.statusDay}>{dayInCycle ? t('home.dayLabel', { day: dayInCycle }) : '—'}</Text>
          </View>

          {!hasPhaseData && (
            <View style={styles.statusHint}>
              <Text style={styles.statusHintText}>
                {t('tracker.logFirstPeriodHint')}
              </Text>
            </View>
          )}
          </View>
        </View>

        {/* ── Calendar ── */}
        <CycleCalendar
          month={calMonth}
          year={calYear}
          dayInfo={dayInfo}
          selectedDate={selectedDate}
          onDateTap={setSelectedDate}
          onMonthChange={handleMonthChange}
          isPeriodLoggingMode={isPeriodLoggingMode}
          onTogglePeriodDate={handleTogglePeriodDate}
          onEnablePeriodLogging={() => {
            setPendingPeriodChanges(new Map());
            setIsPeriodLoggingMode(true);
          }}
          onExitPeriodLogging={handleSavePeriodChanges}
          onEndPeriod={handleEndPeriod}
          headline={headline}
          subtext={headlineSubtext}
          currentPhase={currentPhase}
        />

        {/* ────────────────────────────────
            Logging Sections — hidden while the calendar is in period-logging
            mode, matching the web (`{!isEditingCycle && !isPeriodLoggingMode
            && (...)}`). Mobile previously kept these visible and editable at
            the same time, which is what let unsaved edits collide with the
            monthLogs mutations period-toggling makes (see the effect above).
        ──────────────────────────────── */}
        {!isPeriodLoggingMode && (
        <>
        {/* 6.5 Section jump bar — Lifestyle and Intimacy both start
            collapsed and sit far down the page, so this jumps straight to
            (and opens) whichever one someone actually wants, instead of
            making them scroll past everything else first. */}
        <SectionJumpBar onJump={handleJumpToSection} accentColor={phaseThemeColor} showFertility={showFertilityTracking} />

        {/* 7. Quick Phase Log — dynamic per currentPhase, matching the web's
            QuickPhaseLog.tsx. Title/suggestions change with the selected
            day's phase (e.g. "Menstrual Patterns" on period days, "Luteal
            Patterns" during the luteal phase); toggles route straight into
            the Body Signals / Inner Weather / Sexual Wellness / Disruptors
            state below, so a tap here is reflected in those cards too. */}
        <QuickPhaseLog
          currentPhase={currentPhase}
          selectedSymptoms={bodySignals}
          onToggleSymptom={(label) => setBodySignals(toggleChip(bodySignals, label))}
          selectedMoods={innerWeather}
          onToggleMood={(label) => setInnerWeather(toggleChip(innerWeather, label))}
          selectedSexActivity={sexualActivity}
          onToggleSexActivity={(label) => setSexualActivity(toggleChip(sexualActivity, label))}
          selectedDisruptors={disruptors}
          onToggleDisruptor={(label) => setDisruptors(toggleChip(disruptors, label))}
        />

        {/* 8. Flow (menstrual days) / Discharge (every other day) — mirrors
            the web's `currentPhase === "Menstrual" ? <FlowCard/> :
            <DischargeCard/>` swap. Mobile previously always showed the
            Discharge questionnaire regardless of phase, since FlowCard was
            never built. */}
        {currentPhase === 'Menstrual' ? (
          <FlowCard flowIntensity={flowIntensity} onFlowIntensityChange={setFlowIntensity} cardTint={phaseCardTint} />
        ) : (
          <DischargeQuestionnaire
            answers={dischargeAnswers}
            onAnswersChange={setDischargeAnswers}
            cardTint={phaseCardTint}
          />
        )}

        {/* 8b. Fertility (TTC mode, or PCOS/irregular cycles) — the morning
            temperature and ovulation test the detection algorithm runs on.
            Sits directly under Flow/Discharge because it's the same kind of
            once-a-day body reading, and high enough up to be quick to reach
            each morning. PCOS/irregular users see this even outside TTC mode
            because date-math prediction is unreliable for them — a BBT/LH
            signal (or a synced wearable) is the more accurate read. */}
        {showFertilityTracking && (
          <View onLayout={(e) => setFertilitySectionY(e.nativeEvent.layout.y)}>
            {fertilityTrackingSuggested && (
              <View className="mb-3 rounded-2xl bg-white/60 p-4 border border-white/60">
                <Text className="mb-1 text-[9.5px] font-extrabold uppercase tracking-wide text-rove-stone">
                  {t('tracker.fertility.suggestionTitle')}
                </Text>
                <Text className="text-xs font-medium leading-relaxed text-rove-charcoal">
                  {t('tracker.fertility.suggestionBody')}
                </Text>
                <Link href="/profile" asChild>
                  <Text className="mt-2 text-xs font-bold text-rove-charcoal underline">
                    {t('tracker.fertility.suggestionWearableLink')}
                  </Text>
                </Link>
              </View>
            )}
            <FertilityCard
              bbtCelsius={bbtCelsius}
              onBbtChange={setBbtCelsius}
              opkResult={opkResult}
              onOpkChange={setOpkResult}
              dateKey={selectedDateStr}
              cardTint={phaseCardTint}
            />
          </View>
        )}

        {/* 9. Body Signals */}
        <LogCard
          title={t('tracker.sections.bodySignals')}
          icon={<Activity size={18} color={CATEGORY_COLORS.bodySignals} />}
          iconBgColor={`${CATEGORY_COLORS.bodySignals}1A`}
          accentColor={CATEGORY_COLORS.bodySignals}
          cardTint={phaseCardTint}
        >
          <ChipGrid
            items={SYMPTOM_OPTIONS}
            namespace="symptoms"
            selected={bodySignals}
            onToggle={(v) => {
              const next = toggleChip(bodySignals, v);
              setBodySignals(next);
              if (next.includes(v)) {
                // Newly selected — seed a default "moderate" severity so the
                // row below never shows an unset/zero state.
                setSymptomSeverity((sev) => (v in sev ? sev : { ...sev, [v]: 3 }));
              } else {
                setSymptomSeverity((sev) => {
                  if (!(v in sev)) return sev;
                  const { [v]: _removed, ...rest } = sev;
                  return rest;
                });
              }
            }}
            activeColor={CATEGORY_COLORS.bodySignals}
          />
          {bodySignals.length > 0 && (
            <View style={{ marginTop: 10, gap: 2 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Raleway-SemiBold', color: '#8A8378', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                {t('tracker.howBad')}
              </Text>
              {bodySignals.map((symptom) => (
                <SeverityRow
                  key={symptom}
                  label={getSymptomLabel(symptom, t)}
                  value={symptomSeverity[symptom] ?? 3}
                  onChange={(v) => setSymptomSeverity((sev) => ({ ...sev, [symptom]: v }))}
                  color={CATEGORY_COLORS.bodySignals}
                />
              ))}
            </View>
          )}
        </LogCard>

        {/* 10. Inner Weather */}
        <LogCard
          title={t('tracker.sections.innerWeather')}
          icon={<Smile size={18} color={CATEGORY_COLORS.innerWeather} />}
          iconBgColor={`${CATEGORY_COLORS.innerWeather}1A`}
          accentColor={CATEGORY_COLORS.innerWeather}
          cardTint={phaseCardTint}
        >
          <ChipGrid
            items={MOODS_LIST}
            namespace="moods"
            selected={innerWeather}
            onToggle={(v) => setInnerWeather(toggleChip(innerWeather, v))}
            activeColor={CATEGORY_COLORS.innerWeather}
          />
        </LogCard>



        {/* 12. Lifestyle (collapsible group) */}
        <View onLayout={(e) => setLifestyleSectionY(e.nativeEvent.layout.y)}>
        <SectionGroup
          icon={<Zap size={18} color="#4DB6AC" />}
          title={t('tracker.sections.lifestyle')}
          iconBgColor="#4DB6AC1A"
          accentColor="#4DB6AC"
          cardTint={phaseCardTint}
          open={lifestyleOpen}
          onToggle={() => setLifestyleOpen((o) => !o)}
        >
          {/* 12a. Exercise Log */}
          <LogCard
            title={t('tracker.sections.exerciseLog')}
            icon={<Dumbbell size={16} color={CATEGORY_COLORS.exerciseLog} />}
            iconBgColor={`${CATEGORY_COLORS.exerciseLog}1A`}
            accentColor={CATEGORY_COLORS.exerciseLog}
            cardTint={phaseCardTint}
            infoText={t('tracker.sections.exerciseInfo')}
          >
            <ChipGrid
              items={EXERCISE_OPTIONS}
              namespace="exercise"
              selected={exerciseType}
              onToggle={(v) => setExerciseType(toggleChip(exerciseType, v))}
              activeColor={CATEGORY_COLORS.exerciseLog}
            />
            <View style={styles.durationRow}>
              <View
                style={[
                  styles.exerciseDurationWrap,
                  { borderWidth: 1, borderColor: `${CATEGORY_COLORS.exerciseLog}33` },
                ]}
              >
                <Text style={styles.exerciseDurationLabel}>{t('tracker.exerciseDurationLabel')}</Text>
                <View style={styles.exerciseDurationInner}>
                  {/* Type it directly, or use the stepper below */}
                  <TextInput
                    style={styles.exerciseDurationNum}
                    value={String(exerciseMins)}
                    onChangeText={(txt) => {
                      const digits = txt.replace(/[^0-9]/g, '');
                      const n = digits === '' ? 0 : parseInt(digits, 10);
                      setExerciseMins(Math.min(300, n));
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                    selectTextOnFocus
                  />
                  <Text style={styles.exerciseDurationUnit}>{t('tracker.minAbbrev')}</Text>
                </View>
                {/* Stepper using +/- touch */}
                <NumericStepper
                  value={exerciseMins}
                  onChange={setExerciseMins}
                  min={0}
                  max={300}
                  unit="min"
                  accentColor={CATEGORY_COLORS.exerciseLog}
                />
              </View>
            </View>
          </LogCard>

          {/* 12b. Hydration */}
          <LogCard
            title={t('tracker.sections.hydration')}
            icon={<Droplet size={16} color={CATEGORY_COLORS.hydration} fill={CATEGORY_COLORS.hydration} />}
            iconBgColor={`${CATEGORY_COLORS.hydration}1A`}
            accentColor={CATEGORY_COLORS.hydration}
            cardTint={phaseCardTint}
            infoText={t('tracker.sections.hydrationInfo')}
          >
            <HydrationTracker
              glasses={hydrationGlasses}
              onGlassesChange={setHydrationGlasses}
              accentColor={CATEGORY_COLORS.hydration}
            />
          </LogCard>

          {/* 12c. Sleep Log */}
          <LogCard
            title={t('tracker.sections.sleepLog')}
            icon={<Moon size={16} color={CATEGORY_COLORS.sleepLog} fill={CATEGORY_COLORS.sleepLog} />}
            iconBgColor={`${CATEGORY_COLORS.sleepLog}1A`}
            accentColor={CATEGORY_COLORS.sleepLog}
            cardTint={phaseCardTint}
            infoText={t('tracker.sections.sleepInfo')}
          >
            <TypedChipGrid
              items={SLEEP_OPTIONS}
              namespace="sleep"
              selected={sleepQuality}
              onToggle={(v) => setSleepQuality(toggleChip(sleepQuality, v))}
              accentColor={CATEGORY_COLORS.sleepLog}
            />
            <View style={styles.durationWrap}>
              <DurationInput
                hours={sleepHours}
                minutes={sleepMins}
                onChangeHours={setSleepHours}
                onChangeMinutes={setSleepMins}
                accentColor={CATEGORY_COLORS.sleepLog}
              />
            </View>
          </LogCard>
        </SectionGroup>
        </View>

        {/* 13. Intimacy (collapsible group) */}
        <View onLayout={(e) => setIntimacySectionY(e.nativeEvent.layout.y)}>
        <SectionGroup
          icon={<Heart size={18} color="#E8924E" />}
          title={t('tracker.sections.intimacy')}
          iconBgColor="#E8924E1A"
          accentColor="#E8924E"
          cardTint={phaseCardTint}
          open={intimacyOpen}
          onToggle={() => setIntimacyOpen((o) => !o)}
        >
          {/* 13a. Sexual Wellness */}
          <LogCard
            title={t('tracker.sections.sexualWellness')}
            subtitle={t('tracker.sections.sexualWellnessSubtitle')}
            icon={<Flame size={16} color={CATEGORY_COLORS.sexualWellness} fill={CATEGORY_COLORS.sexualWellness} />}
            iconBgColor={`${CATEGORY_COLORS.sexualWellness}1A`}
            accentColor={CATEGORY_COLORS.sexualWellness}
            cardTint={phaseCardTint}
          >
            <SubSectionLabel
              icon={<Heart size={12} color={CATEGORY_COLORS.sexualWellness} />}
              label={t('tracker.sexualActivity')}
            />
            {/* Positive options solid-fill the category color (matches web's
                theme.active); the one negative option ("Painful") gets a
                soft red tint instead — same per-item override as web. */}
            <View style={styles.chipWrap}>
              {SEX_ACTIVITY_OPTIONS.map((item) => {
                const isActive = sexualActivity.includes(item.label);
                const isNegative = item.type === 'negative';
                const color = isNegative ? TYPE_COLORS.negative : CATEGORY_COLORS.sexualWellness;
                return (
                  <SymptomChip
                    key={item.label}
                    label={t(`tracker.options.sexActivity.${item.key}`)}
                    isSelected={isActive}
                    onToggle={() => setSexualActivity(toggleChip(sexualActivity, item.label))}
                    accentColor={CATEGORY_COLORS.sexualWellness}
                    activeColor={color}
                    activeVariant={isNegative ? 'soft' : 'solid'}
                    icon={isActive ? <Check size={12} color={isNegative ? color : '#FFFFFF'} /> : undefined}
                  />
                );
              })}
            </View>
            <SubSectionLabel
              icon={<Shield size={12} color={CATEGORY_COLORS.sexualWellness} />}
              label={t('tracker.contraceptionProtection')}
            />
            <ChipGrid
              items={CONTRACEPTION_OPTIONS}
              namespace="contraception"
              selected={contraception}
              onToggle={(v) => setContraception(toggleChip(contraception, v))}
              activeColor={CATEGORY_COLORS.sexualWellness}
            />
          </LogCard>
        </SectionGroup>
        </View>

        {/* 14. Disruptors */}
        <LogCard
          title={t('tracker.sections.disruptors')}
          icon={<ZapOff size={18} color={CATEGORY_COLORS.disruptors} />}
          iconBgColor={`${CATEGORY_COLORS.disruptors}1A`}
          accentColor={CATEGORY_COLORS.disruptors}
          cardTint={phaseCardTint}
          defaultOpen={false}
        >
          <TypedChipGrid
            items={DISRUPTORS_LIST}
            namespace="disruptors"
            selected={disruptors}
            onToggle={(v) => setDisruptors(toggleChip(disruptors, v))}
            accentColor={CATEGORY_COLORS.disruptors}
          />
        </LogCard>

        {/* 15. Note — phase-themed like the web's NoteCard */}
        <LogCard
          title={t('tracker.sections.note')}
          icon={<PenLine size={18} color={phaseThemeColor} />}
          iconBgColor={`${phaseThemeColor}1A`}
          accentColor={phaseThemeColor}
          cardTint={phaseCardTint}
          collapsible={false}
        >
          <View style={[styles.noteContainer, { borderColor: `${phaseThemeColor}33` }]}>
            <TextInput
              style={styles.noteInput}
              placeholder={t('tracker.notePlaceholder')}
              placeholderTextColor="#C0BAB4"
              value={note}
              onChangeText={(txt) => setNote(txt.slice(0, noteMax))}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.noteCounter}>
              {t('tracker.charactersLeft', { count: noteMax - note.length })}
            </Text>
          </View>
        </LogCard>
        </>
        )}

        {/* Spacer so content can scroll clear of the floating bar below */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ── Floating Save Log + Chat bar — pinned to the bottom of the
          screen, stays put while the content above scrolls. Save hides
          along with the rest of the log cards during period-logging mode. ── */}
      <View style={[styles.floatingBar, { bottom: tabBarHeight + 12 }]} pointerEvents="box-none">
        {!isPeriodLoggingMode && (
          <TouchableOpacity
            style={[styles.saveBtn, (isSaving || isFutureDate(selectedDate)) && { opacity: 0.5 }]}
            onPress={handleSaveLog}
            disabled={isSaving || isFutureDate(selectedDate)}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{isSaving ? t('tracker.saving') : t('tracker.saveLog')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Dialog open={!!predictionPrompt} onOpenChange={(o) => !o && setPredictionPrompt(null)}>
        <DialogContent showClose={false}>
          {predictionPrompt && (
            <>
              <DialogHeader>
                <DialogTitle>{t('tracker.predictionPrompt.title')}</DialogTitle>
                <DialogDescription>
                  {predictionPrompt.daysOff === 0
                    ? t('tracker.predictionPrompt.exact')
                    : predictionPrompt.daysOff! > 0
                      ? t('tracker.predictionPrompt.early', { count: predictionPrompt.daysOff })
                      : t('tracker.predictionPrompt.late', { count: Math.abs(predictionPrompt.daysOff!) })}
                </DialogDescription>
              </DialogHeader>
              <Text className="text-sm text-rove-charcoal/80 text-center mb-6">
                {t('tracker.predictionPrompt.question')}
              </Text>
              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 px-2"
                  textClassName="text-sm"
                  onPress={() => answerPredictionPrompt(false)}
                >
                  {t('tracker.predictionPrompt.notReally')}
                </Button>
                <Button
                  className="flex-1 px-2"
                  textClassName="text-sm"
                  onPress={() => answerPredictionPrompt(true)}
                >
                  {t('tracker.predictionPrompt.spotOn')}
                </Button>
              </View>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}

function emptyLog(dateStr: string): TrackerLog {
  return {
    date: dateStr,
    is_period: null,
    flow_intensity: null,
    symptoms: [],
    symptom_severity: {},
    moods: [],
    exercise_types: [],
    exercise_minutes: null,
    water_intake: 0,
    self_love_tags: [],
    self_love_other: '',
    sleep_quality: [],
    sleep_minutes: null,
    disruptors: [],
    sex_activity: [],
    contraception: [],
    cervical_discharge: null,
    bbt_celsius: null,
    opk_result: null,
    nsaid_taken: null,
    notes: '',
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },

  // Nav — matches Home/Insights/Plan's header recipe: small uppercase
  // eyebrow label, larger phase-tinted serif title, no divider line.
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  navEyebrow: {
    fontSize: 10,
    fontFamily: 'Raleway-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(45, 36, 32, 0.65)',
    marginBottom: 2,
  },
  navTitle: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#2D2420',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Status Card — frosted-glass recipe (Blur + gradient sheen, layered on
  // in JSX) matching Home/Plan's cards instead of a flat tinted fill.
  statusCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === 'ios' ? 4 : 0,
  },
  statusCardInner: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDate: {
    fontSize: 17,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
  },
  statusLateText: {
    fontSize: 10,
    fontFamily: 'Raleway-Medium',
    color: PHASE_COLORS.Menstrual,
    marginTop: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  fertileInline: {
    fontSize: 10,
    fontFamily: 'Raleway-Medium',
    color: '#B45309',
    opacity: 0.8,
  },
  statusHint: {
    marginTop: 12,
    backgroundColor: '#F9F9F5',
    borderWidth: 1,
    borderColor: '#F0ECE8',
    borderRadius: 16,
    padding: 12,
  },
  statusHintText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Raleway-Regular',
    color: '#6B7280',
  },
  phaseBadgeNeutral: {
    backgroundColor: '#F3F4F6',
  },
  phaseBadgeText: {
    fontSize: 12,
    fontFamily: 'Raleway-SemiBold',
    color: '#9CA3AF',
    paddingRight: 2,
  },
  statusDay: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#78716C',
  },

  // Floating Save Log + Chat bar (pinned to bottom of screen, stays fixed
  // while the ScrollView content behind it scrolls — mirrors the web's
  // `position: fixed` SaveButton). `bottom` is set inline from
  // useBottomTabBarHeight() so it always clears the tab bar.
  floatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#C97B7B',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C97B7B',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === 'ios' ? 6 : 0,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#FFFFFF',
  },

  // Section groups (Lifestyle / Intimacy) — same frosted-glass recipe as
  // LogCard (borderRadius/border/shadow), the Blur+tint+gradient fill is
  // layered on in the SectionGroup component itself.
  sectionGroup: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === 'ios' ? 4 : 0,
    overflow: 'hidden',
  },
  sectionGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  sectionGroupIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionGroupTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
  },
  sectionGroupBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },

  // Sub-section label row (SEXUAL ACTIVITY, CONTRACEPTION)
  subSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  subSectionLabel: {
    fontSize: 10,
    fontFamily: 'Raleway-SemiBold',
    color: '#A8A29E',
    letterSpacing: 0.8,
  },

  // Chip wrap
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Explicit full width — a wrap container that shrink-wraps instead of
    // filling its parent silently reduces how many chips fit per row.
    width: '100%',
    // Without this, RN's default `alignItems: 'stretch'` stretches every
    // chip on a wrapped row to match the tallest one in that row (icon vs.
    // no-icon chips, longer labels) — the "misaligned pills" look.
    alignItems: 'flex-start',
  },

  // Free text
  freeTextInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E0DB',
    borderRadius: 12,
    padding: 12,
    minHeight: 44,
    fontFamily: 'Raleway-Regular',
    fontSize: 13,
    color: '#2D2420',
  },

  // Duration / exercise
  durationRow: {
    marginTop: 12,
  },
  durationIcon: {},
  exerciseDurationWrap: {
    backgroundColor: '#F9F9F5',
    borderRadius: 14,
    padding: 12,
  },
  exerciseDurationLabel: {
    fontSize: 11,
    fontFamily: 'Raleway-Medium',
    color: '#A8A29E',
    marginBottom: 6,
  },
  exerciseDurationInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  exerciseDurationNum: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#2D2420',
    minWidth: 44,
    padding: 0,
  },
  exerciseDurationUnit: {
    fontSize: 12,
    fontFamily: 'Raleway-SemiBold',
    color: '#A8A29E',
    letterSpacing: 0.5,
  },

  // Sleep duration
  durationWrap: {
    marginTop: 12,
  },

  // Note
  noteContainer: {
    borderWidth: 1,
    borderColor: '#E5E0DB',
    borderRadius: 14,
    padding: 12,
  },
  noteInput: {
    minHeight: 100,
    fontFamily: 'Raleway-Regular',
    fontSize: 13,
    color: '#2D2420',
    textAlignVertical: 'top',
  },
  noteCounter: {
    textAlign: 'right',
    fontSize: 11,
    fontFamily: 'Raleway-Regular',
    color: '#A8A29E',
    marginTop: 6,
  },
});
