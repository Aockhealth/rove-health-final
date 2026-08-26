import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { phaseThemes } from '../../data/home-content';
import { getLocalizedFontFamily } from '../../lib/fonts';
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
  Calendar as CalendarIcon,
  Edit3,
  NotebookPen,
  CheckCircle2,
} from 'lucide-react-native';

// Already-abbreviated per locale (not sliced from a full name at render
// time) — slicing Devanagari by character index can cut a conjunct or matra
// in half, unlike Latin abbreviations where slice(0, 3) is a no-op.
function getDaysOfWeek(t: TFunction): string[] {
  return t('tracker.calendar.daysOfWeek', { returnObjects: true }) as string[];
}
function getMonths(t: TFunction): string[] {
  return t('tracker.calendar.months', { returnObjects: true }) as string[];
}

export type Phase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal' | null;

export type CategoryKey =
  | 'discharge'
  | 'bodySignals'
  | 'innerWeather'
  | 'exerciseLog'
  | 'hydration'
  | 'sleepLog'
  | 'disruptors'
  | 'sexualWellness';

export interface DayInfo {
  phase: Phase;
  isPeriod: boolean;
  fertile: boolean;
  categories: CategoryKey[];
}

// Keyed by full "YYYY-MM-DD" date string (not day-of-month) — a day-of-month
// key can't tell July 5th apart from August 5th, which used to make every
// month show the same coloring. Use formatDate() from @shared/cycle/phase to
// build keys.
export type DayInfoMap = Record<string, DayInfo>;

// Visual Identity 2.0 — matches web (frontend/src/app/cycle-sync/tracker/components/PeriodLoggingCard.tsx)
export const PHASE_COLORS: Record<'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal', string> = {
  Menstrual: '#AF6B6B', // Terra Rose
  Follicular: '#8DAA9D', // Sage Dew
  Ovulatory: '#D4A25F', // Soleil Ochre
  Luteal: '#7B82A8', // Dusk Slate
};

export const TODAY_COLOR = '#1C1C1E';
export const FERTILE_LEGEND_COLOR = '#FBBF24';

export const CATEGORY_COLORS: Record<CategoryKey, string> = {
  discharge: '#7CB9E8',
  bodySignals: '#E07B7B',
  innerWeather: '#B07FC0',
  exerciseLog: '#E07B7B',
  hydration: '#4DB6AC',
  sleepLog: '#7986CB',
  disruptors: '#D4A82A',
  sexualWellness: '#E8924E',
};

const CATEGORY_LEGEND: { key: CategoryKey; label: string }[] = [
  { key: 'discharge', label: 'Discharge' },
  { key: 'bodySignals', label: 'Body Signals' },
  { key: 'innerWeather', label: 'Inner Weather' },
  { key: 'exerciseLog', label: 'Exercise' },
  { key: 'hydration', label: 'Hydration' },
  { key: 'sleepLog', label: 'Sleep' },
  { key: 'disruptors', label: 'Disruptors' },
  { key: 'sexualWellness', label: 'Sexual Wellness' },
];

const PHASE_LEGEND: { key: keyof typeof PHASE_COLORS; label: string }[] = [
  { key: 'Menstrual', label: 'Menstrual' },
  { key: 'Follicular', label: 'Follicular' },
  { key: 'Ovulatory', label: 'Ovulatory' },
  { key: 'Luteal', label: 'Luteal' },
];

function withAlpha(hex: string, alphaHex: string) {
  return `${hex}${alphaHex}`;
}

export interface CycleCalendarProps {
  month: number; // 0-indexed
  year: number;
  dayInfo: DayInfoMap; // keyed by "YYYY-MM-DD"
  selectedDate: Date;
  onDateTap: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;

  isPeriodLoggingMode: boolean;
  onTogglePeriodDate: (dateStr: string) => void;
  onEnablePeriodLogging: () => void;
  onExitPeriodLogging: () => void;
  onEndPeriod: () => void;

  headline: string;
  subtext?: string;
  currentPhase: Phase;
}

function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CycleCalendar({
  month,
  year,
  dayInfo,
  selectedDate,
  onDateTap,
  onMonthChange,
  isPeriodLoggingMode,
  onTogglePeriodDate,
  onEnablePeriodLogging,
  onExitPeriodLogging,
  onEndPeriod,
  headline,
  subtext,
  currentPhase,
}: CycleCalendarProps) {
  const { t, i18n } = useTranslation();
  const resolvedSubtext = subtext ?? t('tracker.calendar.defaultSubtext');
  const DAYS_OF_WEEK = getDaysOfWeek(t);
  const MONTHS = getMonths(t);
  const [gridWidth, setGridWidth] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Subtracting 0.1 to prevent Android floating point layout bugs where
  // 7 * (gridWidth/7) is slightly larger than gridWidth, causing the 7th item (Saturday)
  // to wrap to the next line and leaving the 7th column entirely empty.
  // We only apply this to Android so iOS remains perfectly untouched!
  const cellSize = gridWidth > 0 
    ? Platform.OS === 'android' ? (gridWidth / 7) - 0.1 : (gridWidth / 7)
    : 0;

  const today = new Date();
  const todayStr = formatDateStr(today);
  const selectedDateStr = formatDateStr(selectedDate);

  const changeMonth = (dir: 'prev' | 'next') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMonthChange(dir);
  };

  // Swipe left/right across the grid to change months, in addition to the
  // arrow buttons. Requires 20px of horizontal movement before activating so
  // plain taps on a day cell still pass straight through to it. failOffsetY
  // is deliberately tighter than activeOffsetX (10pt vs 20pt) so a slow,
  // mostly-vertical drag concedes to the page's ScrollView quickly instead of
  // sitting in the ambiguous zone where both recognizers are still
  // negotiating — that negotiation window was reading as a stutter on slow
  // scrolls (a fast flick clears it in one frame, so it never showed there).
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onEnd((e) => {
      if (e.translationX < -50) {
        runOnJS(changeMonth)('next');
      } else if (e.translationX > 50) {
        runOnJS(changeMonth)('prev');
      }
    });

  const cardTint = phaseThemes[currentPhase ?? 'Menstrual']?.cardTint ?? 'rgba(168,162,158,0.12)';

  return (
    <View style={[styles.card, currentPhase && { shadowColor: PHASE_COLORS[currentPhase] }]}>
      {/* Frosted-glass fill, matching every other card on the tracker
          screen (and Home/Plan app-wide) instead of a flat tinted fill. */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
      )}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: cardTint }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top info row / period logging banner */}
      {!isPeriodLoggingMode ? (
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headline, { fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }]}>{headline}</Text>
            <Text style={styles.subtext}>{resolvedSubtext}</Text>
          </View>
          <TouchableOpacity
            style={styles.periodBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onEnablePeriodLogging();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.periodBtnText}>
              {currentPhase === 'Menstrual' ? t('tracker.calendar.editPeriod') : t('tracker.calendar.logPeriod')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loggingBanner}>
          <Text style={[styles.loggingTitle, { fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }]}>
            {t('tracker.calendar.selectPeriodDates')}
          </Text>
          <Text style={styles.loggingSub}>{t('tracker.calendar.tapDaysHint')}</Text>
          <View style={styles.loggingBtnRow}>
            <TouchableOpacity
              style={styles.endPeriodBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEndPeriod();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.endPeriodText}>{t('tracker.calendar.endPeriodHere')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onExitPeriodLogging();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneText}>{t('common.buttons.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Month header */}
      <View style={styles.monthHeader}>
        <View style={styles.monthTitleRow}>
          <Text style={[styles.monthTitle, { fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }]}>
            {MONTHS[month].toUpperCase()} {year}
          </Text>
          <TouchableOpacity onPress={() => setShowGuide(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <HelpCircle size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.navButtons}>
          <TouchableOpacity
            onPress={() => changeMonth('prev')}
            style={styles.navBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={18} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeMonth('next')}
            style={styles.navBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronRight size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <GestureDetector gesture={swipeGesture}>
      <View>
      {/* Week header */}
      <View
        style={styles.weekHeader}
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
      >
        {DAYS_OF_WEEK.map((d) => (
          <View key={d} style={{ width: cellSize || undefined, flex: cellSize ? undefined : 1, alignItems: 'center' }}>
            <Text style={styles.weekLabel}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      {cellSize > 0 && (
        <View style={styles.grid}>
          {cells.map((day, idx) => {
            if (day === null) {
              return <View key={idx} style={{ width: cellSize, height: cellSize }} />;
            }

            const cellDate = new Date(year, month, day);
            const dateStr = formatDateStr(cellDate);
            const info = dayInfo[dateStr];
            const phase = info?.phase ?? null;
            const isPeriod = info?.isPeriod ?? false;
            const fertile = info?.fertile ?? false;
            const categories = info?.categories ?? [];

            cellDate.setHours(0, 0, 0, 0);
            const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isFuture = cellDate.getTime() > todayMidnight.getTime();
            const isToday = dateStr === todayStr;
            const isSelected = !isPeriodLoggingMode && dateStr === selectedDateStr;

            // Android has no blur layer softening this fill (see the frosted
            // card fallback above), so a stronger tint is needed there to
            // read as clearly as the same alpha does under iOS's blur.
            const dayAlpha = Platform.OS === 'ios' ? '30' : '55';
            let bg = 'transparent';
            if (isSelected) bg = TODAY_COLOR;
            else if (isPeriod) bg = withAlpha(PHASE_COLORS.Menstrual, dayAlpha);
            // A computed Menstrual phase without an actual log is just the
            // cycle-length projection landing on this day (e.g. exactly one
            // average cycle before/after a real logged period) — tinting it
            // the same red as a real logged day reads as "you bled here,"
            // which isn't something the engine actually knows. Follicular/
            // Ovulatory/Luteal don't carry that same false claim, so those
            // still get their light estimate tint as before.
            else if (phase && phase !== 'Menstrual') bg = withAlpha(PHASE_COLORS[phase], dayAlpha);
            // A genuinely upcoming predicted period still deserves a preview —
            // that's a real forward prediction, not a false claim about the
            // past — but at a visibly lighter alpha than a logged day, so it
            // never reads as "you bled here already."
            else if (phase === 'Menstrual' && isFuture) bg = withAlpha(PHASE_COLORS.Menstrual, '18');

            let numberColor = '#4B5563';
            if (isPeriod && !isSelected) numberColor = PHASE_COLORS.Menstrual;
            if (isSelected) numberColor = '#FFFFFF';

            return (
              <TouchableOpacity
                key={idx}
                disabled={isFuture}
                activeOpacity={0.75}
                onPress={() => {
                  if (isPeriodLoggingMode) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onTogglePeriodDate(dateStr);
                  } else {
                    onDateTap(cellDate);
                  }
                }}
                style={{ width: cellSize, height: cellSize, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={[
                    styles.dayInner,
                    {
                      width: cellSize - 4,
                      height: cellSize - 4,
                      backgroundColor: bg,
                      borderWidth: isToday && !isSelected ? 2 : 0,
                      borderColor: TODAY_COLOR,
                    },
                  ]}
                >
                  {isPeriod && (
                    <View
                      style={[styles.periodBar, { backgroundColor: withAlpha(PHASE_COLORS.Menstrual, '33') }]}
                    />
                  )}

                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: numberColor,
                        fontFamily: isPeriod && !isSelected ? 'Raleway-Bold' : 'Raleway-SemiBold',
                      },
                    ]}
                  >
                    {day}
                  </Text>

                  {isPeriod && <View style={styles.periodPip} />}

                  {fertile && !isPeriod && phase !== 'Menstrual' && (
                    <View style={[styles.fertileDot, { backgroundColor: PHASE_COLORS.Ovulatory }]} />
                  )}

                  {categories.length > 0 && (
                    <View style={styles.activityBars} pointerEvents="none">
                      {categories.slice(0, 5).map((cat) => (
                        <View
                          key={cat}
                          style={[
                            styles.activityBar,
                            { backgroundColor: isSelected ? 'rgba(255,255,255,0.75)' : CATEGORY_COLORS[cat] },
                          ]}
                        />
                      ))}
                      {categories.length > 5 && (
                        <View
                          style={[
                            styles.activityBar,
                            { width: 2, backgroundColor: isSelected ? 'rgba(255,255,255,0.4)' : '#9CA3AF' },
                          ]}
                        />
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      </View>
      </GestureDetector>


      <TrackerGuideModal visible={showGuide} onClose={() => setShowGuide(false)} />
    </View>
  );
}

// ─── Tracker Guide modal ────────────────────────────────────────────────────
// Content ported from the web's tutorial modal
// (frontend/src/app/cycle-sync/tracker/components/PeriodLoggingCard.tsx)
// `sub` text is looked up via `tracker.calendar.guide.phases.<phase>.sub` —
// `phase` itself reuses `tracker.quickPhaseLog.phaseNames.<phase>` so the
// phase name matches what Quick Phase Log already shows.
const PHASE_GUIDE = [
  { phase: 'Menstrual' as const, tint: '#F5E8E8', border: withAlpha(PHASE_COLORS.Menstrual, '33'), textColor: PHASE_COLORS.Menstrual },
  { phase: 'Follicular' as const, tint: '#E0F5F0', border: '#B8E0D4', textColor: '#0F7A5C' },
  { phase: 'Ovulatory' as const, tint: '#FDF0DC', border: '#F0D6A8', textColor: '#9A6B1E' },
  { phase: 'Luteal' as const, tint: '#ECEEF5', border: '#CBD1E8', textColor: '#4C5590' },
];

function TrackerGuideModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const fontHeading = getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={guideStyles.backdrop} onPress={onClose}>
        <Pressable style={guideStyles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={guideStyles.header}>
            <View style={guideStyles.headerLeft}>
              <View style={guideStyles.headerIcon}>
                <HelpCircle size={20} color={PHASE_COLORS.Menstrual} />
              </View>
              <Text style={[guideStyles.headerTitle, { fontFamily: fontHeading }]}>{t('tracker.calendar.guide.title')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={guideStyles.body} showsVerticalScrollIndicator={false}>
            {/* Step 1 */}
            <View style={guideStyles.step}>
              <View style={[guideStyles.stepIcon, { backgroundColor: '#E8F0FE' }]}>
                <CalendarIcon size={20} color="#3B82F6" />
              </View>
              <View style={guideStyles.stepBody}>
                <Text style={[guideStyles.stepTitle, { fontFamily: fontHeading }]}>{t('tracker.calendar.guide.step1.title')}</Text>
                <Text style={guideStyles.stepText}>
                  {t('tracker.calendar.guide.step1.body')}
                </Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={guideStyles.step}>
              <View style={[guideStyles.stepIcon, { backgroundColor: withAlpha(PHASE_COLORS.Menstrual, '1A') }]}>
                <Edit3 size={20} color={PHASE_COLORS.Menstrual} />
              </View>
              <View style={guideStyles.stepBody}>
                <Text style={[guideStyles.stepTitle, { fontFamily: fontHeading }]}>{t('tracker.calendar.guide.step2.title')}</Text>
                <Text style={guideStyles.stepText}>
                  {t('tracker.calendar.guide.step2.bodyPrefix')}
                  <Text style={guideStyles.stepTextEmphasis}>{t('tracker.calendar.guide.step2.bodyEmphasis')}</Text>
                  {t('tracker.calendar.guide.step2.bodySuffix')}
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={guideStyles.step}>
              <View style={[guideStyles.stepIcon, { backgroundColor: '#FEF3E2' }]}>
                <NotebookPen size={20} color="#D97706" />
              </View>
              <View style={guideStyles.stepBody}>
                <Text style={[guideStyles.stepTitle, { fontFamily: fontHeading }]}>{t('tracker.calendar.guide.step3.title')}</Text>
                <Text style={guideStyles.stepText}>
                  {t('tracker.calendar.guide.step3.body')}
                </Text>
              </View>
            </View>

            {/* Cycle Phases */}
            <View style={guideStyles.phasesHeader}>
              <CheckCircle2 size={18} color="#22C55E" />
              <Text style={[guideStyles.phasesTitle, { fontFamily: fontHeading }]}>{t('tracker.calendar.guide.cyclePhases')}</Text>
            </View>
            <View style={guideStyles.phaseGrid}>
              {[0, 2].map((rowStart) => (
                <View key={rowStart} style={guideStyles.phaseRow}>
                  {PHASE_GUIDE.slice(rowStart, rowStart + 2).map((p) => (
                    <View
                      key={p.phase}
                      style={[guideStyles.phaseCard, { backgroundColor: p.tint, borderColor: p.border }]}
                    >
                      <View style={[guideStyles.phaseDot, { backgroundColor: PHASE_COLORS[p.phase] }]} />
                      <Text style={[guideStyles.phaseName, { color: p.textColor }]}>
                        {t(`tracker.quickPhaseLog.phaseNames.${p.phase}`)}
                      </Text>
                      <Text style={[guideStyles.phaseSub, { color: p.textColor }]}>
                        {t(`tracker.calendar.guide.phases.${p.phase}.sub`)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <TouchableOpacity style={guideStyles.ctaBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={guideStyles.ctaText}>{t('tracker.calendar.guide.startTracking')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const guideStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: withAlpha(PHASE_COLORS.Menstrual, '26'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: 'Raleway-Regular',
    color: '#6B7280',
  },
  stepTextEmphasis: {
    fontFamily: 'Raleway-Bold',
    color: '#2D2420',
  },
  phasesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
  },
  phasesTitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
  },
  phaseGrid: {
    gap: 10,
    marginBottom: 20,
  },
  phaseRow: {
    flexDirection: 'row',
    gap: 10,
  },
  phaseCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 12,
    fontFamily: 'Raleway-Bold',
    marginBottom: 2,
  },
  phaseSub: {
    fontSize: 10,
    fontFamily: 'Raleway-Regular',
    opacity: 0.85,
  },
  ctaBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Raleway-Bold',
    color: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === 'ios' ? 4 : 0,
  },

  // Top info row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headline: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
  },
  subtext: {
    fontSize: 12,
    fontFamily: 'Raleway-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  periodBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  periodBtnText: {
    fontSize: 13,
    fontFamily: 'Raleway-SemiBold',
    color: '#FFFFFF',
  },

  // Period logging mode banner
  loggingBanner: {
    backgroundColor: withAlpha(PHASE_COLORS.Menstrual, '0D'),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: withAlpha(PHASE_COLORS.Menstrual, '1A'),
    padding: 16,
    marginBottom: 20,
  },
  loggingTitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: PHASE_COLORS.Menstrual,
  },
  loggingSub: {
    fontSize: 11,
    fontFamily: 'Raleway-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  loggingBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  endPeriodBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: withAlpha(PHASE_COLORS.Menstrual, '33'),
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
  },
  endPeriodText: {
    fontSize: 12,
    fontFamily: 'Raleway-SemiBold',
    color: PHASE_COLORS.Menstrual,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: PHASE_COLORS.Menstrual,
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 13,
    fontFamily: 'Raleway-SemiBold',
    color: '#FFFFFF',
  },

  // Month header
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#2D2420',
    letterSpacing: 0.8,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F9F9F5',
  },

  // Week header
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 9,
    fontFamily: 'Raleway-SemiBold',
    color: '#A8A29E',
    letterSpacing: 0.5,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  dayInner: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 13,
  },
  periodBar: {
    position: 'absolute',
    width: 3,
    height: 18,
    borderRadius: 2,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -1.5 }, { translateY: -9 }],
  },
  periodPip: {
    position: 'absolute',
    bottom: -3,
    width: 4,
    height: 10,
    borderRadius: 2,
    backgroundColor: PHASE_COLORS.Menstrual,
    left: '50%',
    marginLeft: -2,
  },
  fertileDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  activityBars: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 1.5,
  },
  activityBar: {
    width: 3,
    height: 9,
    borderRadius: 2,
  },

  // Phase legend
  phaseLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 9,
    fontFamily: 'Raleway-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Category legend
  categoryLegendWrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,236,232,0.7)',
  },
  categoryLegendTitle: {
    fontSize: 8,
    fontFamily: 'Raleway-Bold',
    color: '#A8A29E',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  categoryLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryLegendBar: {
    width: 2.5,
    height: 11,
    borderRadius: 2,
    opacity: 0.9,
  },
  categoryLegendLabel: {
    fontSize: 9,
    fontFamily: 'Raleway-Regular',
    color: '#A8A29E',
  },
});
