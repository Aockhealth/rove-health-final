import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
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
  User,
  ChevronRight,
} from 'lucide-react-native';

import {
  CycleCalendar,
  DayInfoMap,
  Phase,
  PHASE_COLORS,
  CategoryKey,
} from '../components/tracker/CycleCalendar';
import { SymptomChip } from '../components/tracker/SymptomChip';
import { LogCard } from '../components/tracker/LogCard';
import { NumericStepper } from '../components/tracker/NumericStepper';
import { DurationInput } from '../components/tracker/DurationInput';
import { HydrationTracker } from '../components/tracker/HydrationTracker';
import { DischargeQuestionnaire, DischargeAnswers } from '../components/tracker/DischargeQuestionnaire';
import { ChatFAB } from '../components/tracker/ChatFAB';
import { QuickPhaseLog } from '../components/tracker/QuickPhaseLog';
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
} from '../components/tracker/constants';

// ─── Cycle math ported from shared/cycle/phase.ts ──────────────────────────────
// This mirrors calculatePhase()/isInFertileWindow() from the canonical
// web/backend module (shared/cycle/phase.ts). Mobile can't import that file
// directly yet (no cross-package Metro alias set up), so the constants and
// branch logic below are kept in lockstep with it by hand. When real cycle
// data gets wired in from the backend, swap buildJulyDayInfo() for the actual
// API response and delete this local port — the shapes already match.
const CYCLE_LENGTH_DAYS = 28; // DEFAULT_CYCLE_LENGTH
const PERIOD_LENGTH_DAYS = 5; // DEFAULT_PERIOD_LENGTH
const LUTEAL_LENGTH_DAYS = 14; // DEFAULT_LUTEAL_LENGTH
const OVULATION_PHASE_WINDOW = 1; // ±1 day around ovulation counts as "Ovulatory"
const FERTILE_WINDOW_BEFORE = 5; // days before ovulation counted as fertile
const FERTILE_WINDOW_AFTER = 1; // days after ovulation counted as fertile

const OVULATION_DAY = CYCLE_LENGTH_DAYS - LUTEAL_LENGTH_DAYS; // getOvulationDay()

function phaseForDayInCycle(dayInCycle: number): Exclude<Phase, null> {
  if (dayInCycle <= PERIOD_LENGTH_DAYS) return 'Menstrual';
  if (
    dayInCycle >= OVULATION_DAY - OVULATION_PHASE_WINDOW &&
    dayInCycle <= OVULATION_DAY + OVULATION_PHASE_WINDOW
  ) {
    return 'Ovulatory';
  }
  if (dayInCycle > OVULATION_DAY + OVULATION_PHASE_WINDOW) return 'Luteal';
  return 'Follicular';
}

function isInFertileWindow(dayInCycle: number): boolean {
  return (
    dayInCycle >= OVULATION_DAY - FERTILE_WINDOW_BEFORE &&
    dayInCycle <= OVULATION_DAY + FERTILE_WINDOW_AFTER
  );
}

// ─── Mock cycle data for July 2026 ─────────────────────────────────────────────
// Last period start: July 1. Day-of-month == day-in-cycle for the whole
// visible month, which keeps this table easy to reason about until real
// cycle data is wired in from the backend.
function buildJulyDayInfo(): DayInfoMap {
  const map: DayInfoMap = {};
  for (let d = 1; d <= 31; d++) {
    const cycleDay = d <= CYCLE_LENGTH_DAYS ? d : d - CYCLE_LENGTH_DAYS; // 29,30,31 -> next cycle's day 1,2,3
    const phase = phaseForDayInCycle(cycleDay);

    map[d] = {
      phase,
      isPeriod: d <= PERIOD_LENGTH_DAYS,
      fertile: isInFertileWindow(cycleDay),
      categories: [],
    };
  }

  const withCategories: Record<number, DayInfoMap[number]['categories']> = {
    1: ['bodySignals'],
    3: ['discharge'],
    5: ['sleepLog'],
    7: ['exerciseLog'],
    10: ['innerWeather'],
    12: ['discharge', 'hydration'],
    14: ['sexualWellness'],
    16: ['bodySignals'],
    18: ['hydration'],
    19: ['innerWeather', 'sleepLog'],
  };
  Object.entries(withCategories).forEach(([day, categories]) => {
    map[Number(day)].categories = categories;
  });

  return map;
}

const JULY_DAY_INFO = buildJulyDayInfo();

// ─── Chip toggle helper ────────────────────────────────────────────────────────
function toggleChip(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

// ─── Section group header ─────────────────────────────────────────────────────
function SectionGroup({
  icon,
  title,
  iconBgColor,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  iconBgColor: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionGroup}>
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
function ChipGrid({
  items,
  selected,
  onToggle,
  activeColor,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
  activeColor?: string;
}) {
  return (
    <View style={styles.chipWrap}>
      {items.map((item) => {
        const isActive = selected.includes(item);
        return (
          <SymptomChip
            key={item}
            label={item}
            isSelected={isActive}
            onToggle={() => onToggle(item)}
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
}: {
  items: TypedOption[];
  selected: string[];
  onToggle: (v: string) => void;
  accentColor?: string;
}) {
  return (
    <View style={styles.chipWrap}>
      {items.map((item) => {
        const isActive = selected.includes(item.label);
        const color = TYPE_COLORS[item.type];
        return (
          <SymptomChip
            key={item.label}
            label={item.label}
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
  // Calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // Cycle/day data for the currently displayed month (mock — only populated
  // for July 2026 until real cycle data is wired in from the backend)
  const [dayInfo, setDayInfo] = useState<DayInfoMap>(JULY_DAY_INFO);
  const [isPeriodLoggingMode, setIsPeriodLoggingMode] = useState(false);

  const selectedInfo = dayInfo[selectedDay];
  const currentPhase: Phase = selectedInfo?.phase ?? null;
  // Self Love Log / Note cards theme by phase, defaulting to Menstrual when
  // there's no phase data yet — matches the web's `currentPhase || "Menstrual"`.
  const phaseThemeColor = PHASE_COLORS[currentPhase ?? 'Menstrual'];

  const daysUntilPeriod = useMemo(() => {
    for (let d = selectedDay; d <= 31; d++) {
      const info = dayInfo[d];
      if (info?.phase === 'Menstrual' && !info.isPeriod) return d - selectedDay;
    }
    return null;
  }, [dayInfo, selectedDay]);

  const headline = currentPhase === null
    ? 'Log your first period'
    : currentPhase === 'Menstrual'
      ? `Period Day ${selectedDay}`
      : daysUntilPeriod !== null
        ? `Period in ${daysUntilPeriod} day${daysUntilPeriod === 1 ? '' : 's'}`
        : 'Tracking your cycle';

  const handleTogglePeriodDate = (day: number) => {
    setDayInfo((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] ?? { phase: null, fertile: false, categories: [] }),
        isPeriod: !prev[day]?.isPeriod,
      },
    }));
  };

  const handleEndPeriod = () => {
    setDayInfo((prev) => {
      const next = { ...prev };
      next[selectedDay] = { ...(next[selectedDay] ?? { phase: 'Menstrual', fertile: false, categories: [] }), isPeriod: true };
      for (let i = 1; i <= 7; i++) {
        const d = selectedDay + i;
        if (d > 31) break;
        next[d] = { ...(next[d] ?? { phase: null, fertile: false, categories: [] }), isPeriod: false };
      }
      return next;
    });
  };

  // Section visibility
  const [lifestyleOpen, setLifestyleOpen] = useState(true);
  const [intimacyOpen, setIntimacyOpen] = useState(false);

  // Log data
  const [bodySignals, setBodySignals] = useState<string[]>([]);
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

  const noteMax = 1000;

  const handleMonthChange = (dir: 'prev' | 'next') => {
    if (dir === 'next') {
      if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
      else setCalMonth((m) => m + 1);
    } else {
      if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
      else setCalMonth((m) => m - 1);
    }
  };

  const handleSaveLog = () => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    // Shape mirrors what `logDailySymptoms()` expects on the web
    // (frontend/src/app/actions/cycle-sync.ts -> backend/src/actions/cycle-sync/cycle-sync.ts),
    // so wiring the real backend later is a drop-in swap of the console.log
    // below for the actual call:
    //   const result = await logDailySymptoms(payload);
    //   if (!result.success) { /* show an error toast, same as web */ return; }
    //   /* then invalidate/refetch whatever local cache mirrors dashboard/insights/plan */
    const payload = {
      date: dateStr,                          // daily_logs.date
      symptoms: bodySignals,                  // daily_logs.symptoms          <- "Body Signals" card (+ Quick Phase Log)
      moods: innerWeather,                    // daily_logs.moods             <- "Inner Weather" card (+ Quick Phase Log)
      exerciseTypes: exerciseType,             // daily_logs.exercise_types    <- "Exercise Log" card
      exerciseMinutes: exerciseMins || null,   // daily_logs.exercise_minutes  <- "Exercise Log" card
      waterIntake: hydrationGlasses,           // daily_logs.water_intake      <- "Hydration" card
      selfLoveTags: selfLove,                  // daily_logs.self_love_tags    <- "Self Love Log" card
      selfLoveOther: selfLoveNote,             // daily_logs.self_love_other   <- "Self Love Log" card
      sleepQuality,                            // daily_logs.sleep_quality     <- "Sleep Log" card
      sleepMinutes: (sleepHours || sleepMins) ? sleepHours * 60 + sleepMins : null, // daily_logs.sleep_minutes <- "Sleep Log" card
      disruptors,                              // daily_logs.disruptors        <- "Disruptors" card (+ Quick Phase Log)
      sexActivity: sexualActivity,             // daily_logs.sex_activity      <- "Sexual Wellness" card (+ Quick Phase Log)
      contraception,                           // daily_logs.contraception     <- "Sexual Wellness" card
      isPeriod: dayInfo[selectedDay]?.isPeriod ?? false, // daily_logs.is_period <- set via the calendar's "Log Period" mode, not this button
      // FlowCard (flow intensity on menstrual days) hasn't been built for
      // mobile yet — wire it here once it exists; the web only sends
      // flowIntensity at all when currentPhase === 'Menstrual'.
      flowIntensity: undefined as string | undefined,
      // MPIQ-encoded the same way the web does it (see
      // frontend/.../tracker/helpers.ts `deriveCervicalDischarge` and
      // page.tsx's `JSON.stringify([consistency, appearance, sensation])`).
      cervicalDischarge:
        dischargeAnswers.vaginalFluid || dischargeAnswers.appearance || dischargeAnswers.sensation
          ? JSON.stringify([dischargeAnswers.vaginalFluid, dischargeAnswers.appearance, dischargeAnswers.sensation])
          : undefined,
      notes: note,                             // daily_logs.notes             <- "Note" card
    };

    // TODO(backend): swap this for the real `logDailySymptoms(payload)` call once Supabase is wired in.
    console.log('[Tracker] Save log — placeholder until backend is wired:', payload);

    // Reflect what just got saved onto the calendar day cell — mirrors the
    // web's getLoggedCategories() (PeriodLoggingCard.tsx), which derives the
    // colored activity bars from the same fields. Once the backend is wired,
    // this should instead come from refetching monthLogs after a successful
    // save, same as web does.
    const loggedCategories: CategoryKey[] = [];
    if (payload.cervicalDischarge) loggedCategories.push('discharge');
    if (bodySignals.length > 0) loggedCategories.push('bodySignals');
    if (innerWeather.length > 0) loggedCategories.push('innerWeather');
    if (exerciseType.length > 0 || exerciseMins > 0) loggedCategories.push('exerciseLog');
    if (hydrationGlasses > 0) loggedCategories.push('hydration');
    if (sleepQuality.length > 0 || sleepHours > 0 || sleepMins > 0) loggedCategories.push('sleepLog');
    if (disruptors.length > 0) loggedCategories.push('disruptors');
    if (sexualActivity.length > 0 || contraception.length > 0) loggedCategories.push('sexualWellness');

    setDayInfo((prev) => ({
      ...prev,
      [selectedDay]: {
        ...(prev[selectedDay] ?? { phase: currentPhase, isPeriod: false, fertile: false }),
        categories: loggedCategories,
      },
    }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Top Nav ── */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navIcon}>
          <Calendar size={22} color="#2D2420" />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Rove Tracker</Text>
          <Text style={styles.navSubtitle}>Log your daily rhythm</Text>
        </View>

        <TouchableOpacity style={styles.avatarBtn}>
          <View style={styles.avatar}>
            <User size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Cycle Status Card ── */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusDate}>
              {new Date(calYear, calMonth, selectedDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <View style={[styles.statusDot, currentPhase && { backgroundColor: PHASE_COLORS[currentPhase] }]} />
            <View
              style={[
                styles.phaseBadge,
                currentPhase ? { backgroundColor: `${PHASE_COLORS[currentPhase]}1A` } : styles.phaseBadgeNeutral,
              ]}
            >
              <Text style={[styles.phaseBadgeText, currentPhase && { color: PHASE_COLORS[currentPhase] }]}>
                {currentPhase ?? 'Unknown'}
              </Text>
            </View>
          </View>
          <Text style={styles.statusDay}>Day {selectedDay}</Text>
        </View>

        {/* ── Calendar ── */}
        <CycleCalendar
          month={calMonth}
          year={calYear}
          dayInfo={dayInfo}
          selectedDate={selectedDay}
          onDateTap={setSelectedDay}
          onMonthChange={handleMonthChange}
          isPeriodLoggingMode={isPeriodLoggingMode}
          onTogglePeriodDate={handleTogglePeriodDate}
          onEnablePeriodLogging={() => setIsPeriodLoggingMode(true)}
          onExitPeriodLogging={() => setIsPeriodLoggingMode(false)}
          onEndPeriod={handleEndPeriod}
          headline={headline}
          currentPhase={currentPhase}
        />

        {/* ────────────────────────────────
            Logging Sections
        ──────────────────────────────── */}

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

        {/* 8. Discharge */}
        <DischargeQuestionnaire
          answers={dischargeAnswers}
          onAnswersChange={setDischargeAnswers}
        />

        {/* 9. Body Signals */}
        <LogCard
          title="Body Signals"
          icon={<Activity size={18} color={CATEGORY_COLORS.bodySignals} />}
          iconBgColor={`${CATEGORY_COLORS.bodySignals}1A`}
          accentColor={CATEGORY_COLORS.bodySignals}
        >
          <ChipGrid
            items={SYMPTOM_OPTIONS}
            selected={bodySignals}
            onToggle={(v) => setBodySignals(toggleChip(bodySignals, v))}
            activeColor={CATEGORY_COLORS.bodySignals}
          />
        </LogCard>

        {/* 10. Inner Weather */}
        <LogCard
          title="Inner Weather"
          icon={<Smile size={18} color={CATEGORY_COLORS.innerWeather} />}
          iconBgColor={`${CATEGORY_COLORS.innerWeather}1A`}
          accentColor={CATEGORY_COLORS.innerWeather}
        >
          <ChipGrid
            items={MOODS_LIST.map((m) => m.label)}
            selected={innerWeather}
            onToggle={(v) => setInnerWeather(toggleChip(innerWeather, v))}
            activeColor={CATEGORY_COLORS.innerWeather}
          />
        </LogCard>

        {/* 11. Self Love Log — themed by the SELECTED day's phase (falls back
            to Menstrual when there's no phase data yet), matching the web's
            SelfLoveCard "Organic Chromatics" theming. */}
        <LogCard
          title="Self Love Log"
          icon={<Heart size={18} color={phaseThemeColor} fill={phaseThemeColor} />}
          iconBgColor={`${phaseThemeColor}1A`}
          accentColor={phaseThemeColor}
          infoText="Dedicate at least 15-30 mins daily to activities that recharge your soul, reduce stress, and improve mental well-being."
        >
          <ChipGrid
            items={SELF_LOVE_OPTIONS}
            selected={selfLove}
            onToggle={(v) => setSelfLove(toggleChip(selfLove, v))}
            activeColor={phaseThemeColor}
          />
          <TextInput
            style={[styles.freeTextInput, { borderColor: `${phaseThemeColor}33` }]}
            placeholder="Others (log here)..."
            placeholderTextColor="#C0BAB4"
            value={selfLoveNote}
            onChangeText={setSelfLoveNote}
            multiline
          />
        </LogCard>

        {/* 12. Lifestyle (collapsible group) */}
        <SectionGroup
          icon={<Zap size={18} color="#4DB6AC" />}
          title="Lifestyle"
          iconBgColor="#4DB6AC1A"
          open={lifestyleOpen}
          onToggle={() => setLifestyleOpen((o) => !o)}
        >
          {/* 12a. Exercise Log */}
          <LogCard
            title="Exercise Log"
            icon={<Dumbbell size={16} color={CATEGORY_COLORS.exerciseLog} />}
            iconBgColor={`${CATEGORY_COLORS.exerciseLog}1A`}
            accentColor={CATEGORY_COLORS.exerciseLog}
            infoText="Aim for at least 30 minutes of moderate activity daily for better cycle regularity and hormonal health."
          >
            <ChipGrid
              items={EXERCISE_OPTIONS}
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
                <Text style={styles.exerciseDurationLabel}>Duration (minutes)</Text>
                <View style={styles.exerciseDurationInner}>
                  {/* Type it directly, or use the stepper below */}
                  <TextInput
                    style={styles.exerciseDurationNum}
                    value={String(exerciseMins)}
                    onChangeText={(t) => {
                      const digits = t.replace(/[^0-9]/g, '');
                      const n = digits === '' ? 0 : parseInt(digits, 10);
                      setExerciseMins(Math.min(300, n));
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                    selectTextOnFocus
                  />
                  <Text style={styles.exerciseDurationUnit}>MIN</Text>
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
            title="Hydration"
            icon={<Droplet size={16} color={CATEGORY_COLORS.hydration} fill={CATEGORY_COLORS.hydration} />}
            iconBgColor={`${CATEGORY_COLORS.hydration}1A`}
            accentColor={CATEGORY_COLORS.hydration}
            infoText="Drink at least 2L of water (8 glasses) daily to stay hydrated, support detoxification, and maintain healthy cognitive function."
          >
            <HydrationTracker
              glasses={hydrationGlasses}
              onGlassesChange={setHydrationGlasses}
              accentColor={CATEGORY_COLORS.hydration}
            />
          </LogCard>

          {/* 12c. Sleep Log */}
          <LogCard
            title="Sleep Log"
            icon={<Moon size={16} color={CATEGORY_COLORS.sleepLog} fill={CATEGORY_COLORS.sleepLog} />}
            iconBgColor={`${CATEGORY_COLORS.sleepLog}1A`}
            accentColor={CATEGORY_COLORS.sleepLog}
            infoText="7-9 hours of quality sleep is recommended for optimal hormonal balance, mood regulation, and physical recovery."
          >
            <TypedChipGrid
              items={SLEEP_OPTIONS}
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
                label="TOTAL DURATION"
              />
            </View>
          </LogCard>
        </SectionGroup>

        {/* 13. Intimacy (collapsible group) */}
        <SectionGroup
          icon={<Heart size={18} color="#E8924E" />}
          title="Intimacy"
          iconBgColor="#E8924E1A"
          open={intimacyOpen}
          onToggle={() => setIntimacyOpen((o) => !o)}
        >
          {/* 13a. Sexual Wellness */}
          <LogCard
            title="Sexual Wellness"
            subtitle="Track activity & contraception"
            icon={<Flame size={16} color={CATEGORY_COLORS.sexualWellness} fill={CATEGORY_COLORS.sexualWellness} />}
            iconBgColor={`${CATEGORY_COLORS.sexualWellness}1A`}
            accentColor={CATEGORY_COLORS.sexualWellness}
          >
            <SubSectionLabel
              icon={<Heart size={12} color={CATEGORY_COLORS.sexualWellness} />}
              label="SEXUAL ACTIVITY"
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
                    label={item.label}
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
              label="CONTRACEPTION & PROTECTION"
            />
            <ChipGrid
              items={CONTRACEPTION_OPTIONS}
              selected={contraception}
              onToggle={(v) => setContraception(toggleChip(contraception, v))}
              activeColor={CATEGORY_COLORS.sexualWellness}
            />
          </LogCard>
        </SectionGroup>

        {/* 14. Disruptors */}
        <LogCard
          title="Disruptors"
          icon={<ZapOff size={18} color={CATEGORY_COLORS.disruptors} />}
          iconBgColor={`${CATEGORY_COLORS.disruptors}1A`}
          accentColor={CATEGORY_COLORS.disruptors}
        >
          <TypedChipGrid
            items={DISRUPTORS_LIST}
            selected={disruptors}
            onToggle={(v) => setDisruptors(toggleChip(disruptors, v))}
            accentColor={CATEGORY_COLORS.disruptors}
          />
        </LogCard>

        {/* 15. Note — phase-themed like the web's NoteCard */}
        <LogCard
          title="Note"
          icon={<PenLine size={18} color={phaseThemeColor} />}
          iconBgColor={`${phaseThemeColor}1A`}
          accentColor={phaseThemeColor}
          collapsible={false}
        >
          <View style={[styles.noteContainer, { borderColor: `${phaseThemeColor}33` }]}>
            <TextInput
              style={styles.noteInput}
              placeholder="How are you feeling today?"
              placeholderTextColor="#C0BAB4"
              value={note}
              onChangeText={(t) => setNote(t.slice(0, noteMax))}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.noteCounter}>
              {noteMax - note.length} characters left
            </Text>
          </View>
        </LogCard>

        {/* Spacer so content can scroll clear of the floating bar below */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ── Floating Save Log + Chat bar — pinned to the bottom of the
          screen, stays put while the content above scrolls ── */}
      <View style={styles.floatingBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveLog}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Save Log</Text>
        </TouchableOpacity>
        <ChatFAB hasNotification />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },

  // Nav
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FAF9F6',
  },
  navIcon: {
    padding: 6,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#2D2420',
  },
  navSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
  },
  avatarBtn: {
    padding: 4,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#A8A29E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDate: {
    fontSize: 15,
    fontFamily: 'Outfit-Bold',
    color: '#2D2420',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  phaseBadge: {
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  phaseBadgeNeutral: {
    backgroundColor: '#F3F4F6',
  },
  phaseBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  statusDay: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
  },

  // Floating Save Log + Chat bar (pinned to bottom of screen, stays fixed
  // while the ScrollView content behind it scrolls — mirrors the web's
  // `position: fixed` SaveButton)
  floatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#C97B7B',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#C97B7B',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#FFFFFF',
  },

  // Section groups (Lifestyle / Intimacy)
  sectionGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionGroupTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Outfit-SemiBold',
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
    fontFamily: 'Inter-SemiBold',
    color: '#A8A29E',
    letterSpacing: 0.8,
  },

  // Chip wrap
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Free text
  freeTextInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E0DB',
    borderRadius: 12,
    padding: 12,
    minHeight: 44,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Outfit-Bold',
    color: '#2D2420',
    minWidth: 44,
    padding: 0,
  },
  exerciseDurationUnit: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
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
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#2D2420',
    textAlignVertical: 'top',
  },
  noteCounter: {
    textAlign: 'right',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginTop: 6,
  },
});
