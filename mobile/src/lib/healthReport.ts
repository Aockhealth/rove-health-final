import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// Legacy API: the SDK 54 File/Directory rewrite doesn't cover the cache-directory
// move we need here, and the legacy surface is still shipped and supported.
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';
import {
  calculatePhase,
  deriveRecentCycleHistory,
  resolveCycleSettings,
  CYCLE_HISTORY_LOOKBACK,
  type CycleHistoryEntry,
  type CycleSettings,
  type DailyLog,
} from '@shared/cycle/phase';
import { type AnovulatorySignal, type BbtReading, type OpkReading, type OvulationSignal, type TtcDailyLog } from '@shared/cycle/ttc';
import { detectCycleAnomalies, type CycleAnomaly } from '@shared/cycle/anomaly';
import type { LhBandReading } from '@shared/cycle/lh';
import { parseMucusJson, type MucusReading } from '@shared/cycle/mucus';
import { renderHealthReportHtml } from './healthReportHtml';
import {
  deriveCycleStarts,
  getPersonalizedLutealLength,
  latestCycleChart,
  scoreTtcCycles,
  summarizePcosPatterns,
  type PcosPatternInsight,
  type TtcHistoryCycle,
} from './ttcCycleHistory';
import { computePmosPatternScore, type PmosPatternScore } from './pmosScore';
import { hasPcosFlag } from './pcos';

/**
 * Health report data layer.
 *
 * Everything here runs on the device against RLS-scoped queries. No health data is
 * sent to an AI service, an analytics pipeline, or any third party — the statistics
 * and the suggestions are both computed from deterministic rules below, so the
 * report can be generated offline and nothing leaves the phone until the user
 * chooses to share the finished PDF themselves.
 */

export const REPORT_WINDOW_DAYS = 90;
/**
 * How far back cycle-structural analysis (cycle stats, TTC scoring, anomaly
 * detection, PMOS indicators) looks — wider than REPORT_WINDOW_DAYS on
 * purpose, since those need enough cycles to be statistically meaningful
 * (see MIN_CYCLES_FOR_ANOMALY_DETECTION, MIN_CYCLES_FOR_PCOS_PATTERNS) and
 * 90 days rarely holds enough at a typical cycle length. Sized the same way
 * the rest of the app now sizes its cycle-history windows — see the log
 * windows in lib/dashboard.ts / lib/plan.ts / lib/tracker.ts.
 */
export const CYCLE_HISTORY_WINDOW_DAYS = 270;

// Thresholds used for both the stats and the suggestions. Kept together so the
// numbers quoted in the PDF and the advice derived from them can't drift apart.
export const HYDRATION_TARGET_ML = 2000;
/** daily_logs.water_intake counts glasses, not millilitres — matches ML_PER_GLASS
 *  in components/tracker/HydrationTracker.tsx, which is what the user pours into. */
export const ML_PER_GLASS = 250;
export const SLEEP_TARGET_HOURS = 7;
export const EXERCISE_TARGET_MINS_PER_WEEK = 150;
/** Cycles shorter/longer than this are worth raising with a clinician. */
export const CYCLE_SHORT_DAYS = 21;
export const CYCLE_LONG_DAYS = 35;
/** Standard deviation above which a cycle is treated as irregular. */
export const CYCLE_VARIATION_FLAG_DAYS = 7;
/** Bleeding beyond this many days is a recognised reason to seek review. */
export const PROLONGED_BLEED_DAYS = 7;

export type ReportLog = {
  date: string;
  is_period: boolean | null;
  flow_intensity: string | null;
  symptoms: string[] | null;
  moods: string[] | null;
  exercise_types: string[] | null;
  exercise_minutes: number | null;
  water_intake: number | null;
  sleep_quality: string[] | null;
  sleep_minutes: number | null;
  disruptors: string[] | null;
  bbt_celsius: number | null;
  opk_result: TtcDailyLog['opk_result'];
  bbt_wake_time: string | null;
  nsaid_taken: boolean | null;
  cervical_discharge: string | null;
  /** Apple Health / Health Connect only — see 20260819010000_add_secondary_health_signals.sql, 20260819020000_add_daily_steps.sql. No manual-entry path for any of these four. */
  steps: number | null;
  hrv_ms: number | null;
  hrv_source: string | null;
  resting_heart_rate_bpm: number | null;
  skin_temp_delta_celsius: number | null;
};

export type ReportMealLog = {
  date: string;
  name: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  sugarG: number | null;
  glycemicIndex: number | null;
};

export type Observed = {
  /** Average across days that actually have a value — never across missing days. */
  average: number | null;
  daysLogged: number;
};

export type CycleStats = {
  observedCycles: number[];
  averageLength: number | null;
  shortestLength: number | null;
  longestLength: number | null;
  /** Population standard deviation of observed cycle lengths, in days. */
  variationDays: number | null;
  observedPeriodLengths: number[];
  averagePeriodLength: number | null;
  longestPeriodLength: number | null;
  settingsCycleLength: number;
  settingsPeriodLength: number;
  markedIrregular: boolean;
};

export type Suggestion = {
  area: 'Hydration' | 'Sleep' | 'Movement' | 'Cycle' | 'Tracking' | 'Symptoms' | 'Nutrition';
  finding: string;
  action: string;
};

export type NutritionStats = {
  calories: Observed;
  proteinG: Observed;
  carbsG: Observed;
  fatG: Observed;
  sugarG: Observed;
  /** Average across meals that had a GI estimate — not every logged meal gets one. */
  avgGlycemicIndex: number | null;
  mealsLogged: number;
  daysLogged: number;
  topFoods: Counted[];
};

/** Apple Health / Health Connect only — informational, same as HormoneRhythmCard/daily_logs itself: never an input to detectOvulation. */
export type WearableStats = {
  restingHeartRate: Observed;
  hrv: Observed;
  steps: Observed;
  /** Deviation from her own recent baseline, in Celsius — can be negative, unlike the other three. */
  skinTempDelta: Observed;
};

export type ClinicalFlag = {
  finding: string;
  why: string;
};

export type TtcReportCycle = {
  cycleStart: string;
  /** Last day the cycle was scored over — either the day before the next
   * logged period, or the report window end for the current, ongoing cycle. */
  cycleEnd: string;
  isOngoing: boolean;
  status: OvulationSignal['status'];
  confirmedDate: string | null;
  method: OvulationSignal['method'];
  confidence: OvulationSignal['confidence'];
  /** Why this cycle looks like it may not have ovulated, if the engine flagged one — same read the in-app Insights screen shows. Null on a cycle with no anovulatory signs. */
  anovulatory: AnovulatorySignal | null;
};

export type TtcReportData = {
  /** Most recent cycle first. */
  cycles: TtcReportCycle[];
  /** Chart data for the most recent cycle only — the one still relevant to read. */
  chart: {
    cycleStart: string;
    bbt: BbtReading[];
    opk: OpkReading[];
    coverline: number | null;
  } | null;
  /** How often each anovulatory pattern recurred across her logged cycles — see summarizePcosPatterns. Empty when there isn't enough history yet, or PCOS isn't flagged. */
  pcosPatterns: PcosPatternInsight[];
};

export type HealthReport = {
  generatedAt: Date;
  windowDays: number;
  windowStart: string;
  windowEnd: string;
  person: {
    name: string;
    heightCm: number | null;
    weightKg: number | null;
    bmi: number | null;
    conditions: string[];
    dietPreference: string | null;
    activityLevel: string | null;
  };
  coverage: {
    daysWithAnyLog: number;
    completenessPct: number;
  };
  cycle: CycleStats;
  hydration: Observed;
  sleep: Observed;
  exercise: Observed & { weeklyAverage: number | null; topTypes: Counted[] };
  symptoms: {
    top: Counted[];
    byPhase: Record<string, Counted[]>;
    /** Symptom × phase counts — the view that shows where a symptom clusters. */
    matrix: SymptomRow[];
    /** Days that carried at least one symptom, for "on N of M logged days". */
    daysWithSymptoms: number;
  };
  moods: Counted[];
  /** Mood × phase matrix, same shape and same "is one phase genuinely leading" rule as symptoms.matrix. */
  moodMatrix: SymptomRow[];
  sleepDisruptors: Counted[];
  suggestions: Suggestion[];
  clinicalFlags: ClinicalFlag[];
  /**
   * Cycles that deviate from HER OWN rolling mean/stdev — never a population
   * number — with a likely explanation pulled from her own disruptor tags
   * where one stands out. See shared/cycle/anomaly.ts. Computed from a wider
   * cycle-history window than the report's own 90-day reporting window (see
   * CYCLE_HISTORY_WINDOW_DAYS), since 4+ cycles are needed before a mean/stdev
   * means anything and 90 days rarely holds that many. Empty with fewer than
   * 4 cycles logged.
   */
  cycleAnomalies: CycleAnomaly[];
  /**
   * Composite PMOS-pattern indicator count (cycle irregularity, ovulation
   * signal patterns, BMI) — same educational, non-diagnostic score the
   * Insights screen already shows. Always present; each indicator reports
   * "not enough data" rather than a false negative when it can't be assessed.
   */
  pmosScore: PmosPatternScore;
  /** Only populated for accounts in TTC (trying-to-conceive) mode. */
  ttc: TtcReportData | null;
  /** Null when no meals were logged in the window — section is omitted rather than shown empty. */
  nutrition: NutritionStats | null;
  /** Null when no Apple Health / Health Connect signal appears anywhere in the window — section is omitted rather than shown empty. */
  wearable: WearableStats | null;
};

export type Counted = { name: string; count: number };

export type SymptomRow = {
  name: string;
  total: number;
  byPhase: Record<string, number>;
  /** Phase carrying the most occurrences, or null when it's an even spread. */
  peakPhase: string | null;
};

export const PHASE_ORDER = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'] as const;

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function tally(values: (string[] | null | undefined)[]): Counted[] {
  const counts: Record<string, number> = {};
  for (const list of values) {
    for (const v of list || []) {
      if (!v) continue;
      counts[v] = (counts[v] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function standardDeviation(nums: number[]): number | null {
  if (nums.length < 2) return null;
  const mean = average(nums)!;
  const variance = nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

/**
 * `requirePositive` (default true) drops zero/negative readings, which is
 * correct for fields where this app's UI uses 0 as "not logged" (water
 * glasses, sleep minutes, exercise minutes). Pass false for fields where 0 or
 * negative is a real, meaningful reading — skin_temp_delta_celsius (can run
 * below baseline) and daily nutrition totals (a genuinely zero-sugar day is
 * a real day, not a missing one — see dailyNutritionTotals, whose rows only
 * exist for days with at least one logged meal).
 */
function observedFrom<T>(items: T[], pick: (t: T) => number | null | undefined, requirePositive = true): Observed {
  const values = items
    .map(pick)
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v) && (!requirePositive || v > 0));
  return { average: average(values), daysLogged: values.length };
}

type DailyNutritionTotal = { date: string; calories: number; proteinG: number; carbsG: number; fatG: number; sugarG: number };

/** One row per day that had at least one meal logged, summed across that day's meals. */
function dailyNutritionTotals(meals: ReportMealLog[]): DailyNutritionTotal[] {
  const byDate = new Map<string, DailyNutritionTotal>();
  for (const m of meals) {
    const cur = byDate.get(m.date) ?? { date: m.date, calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 };
    cur.calories += m.calories ?? 0;
    cur.proteinG += m.proteinG ?? 0;
    cur.carbsG += m.carbsG ?? 0;
    cur.fatG += m.fatG ?? 0;
    cur.sugarG += m.sugarG ?? 0;
    byDate.set(m.date, cur);
  }
  return Array.from(byDate.values());
}

/**
 * Scores every cycle her logged history covers, most recent first, using the
 * same `detectOvulation`/`scoreTtcCycles` the Insights screen runs — a doctor
 * comparing this page to what the app showed at the time should see the same
 * answer. Runs the personalized-luteal-length second pass Insights already
 * does (see the comment this used to carry): the first pass establishes her
 * own confirmed-cycle history, and re-scoring with that value can't disturb
 * any cycle that already confirmed on its own, since luteal_length_days only
 * ever changes the date-math fallback.
 *
 * Kept as its own step (not folded into buildHealthReport) because both the
 * TTC section and the PMOS/PCOS analysis below need the same scored cycles —
 * computing them once here and passing the result to both keeps the report
 * and the in-app screen from ever disagreeing about which cycle looked
 * anovulatory.
 */
function scoreCyclesForReport(
  logs: ReportLog[],
  cycleStarts: string[],
  settings: CycleSettings,
  windowEnd: Date,
  hasPcos: boolean,
  lhReadings: LhBandReading[] = [],
  mucusReadings: MucusReading[] = [],
): TtcHistoryCycle[] {
  if (cycleStarts.length === 0) return [];
  const baseCycles = scoreTtcCycles(logs, cycleStarts, settings, windowEnd, hasPcos, lhReadings, mucusReadings);
  const personalizedLuteal = getPersonalizedLutealLength(baseCycles);
  return personalizedLuteal === null
    ? baseCycles
    : scoreTtcCycles(logs, cycleStarts, { ...settings, luteal_length_days: personalizedLuteal }, windowEnd, hasPcos, lhReadings, mucusReadings);
}

/** Trims scoreCyclesForReport's richer per-cycle result down to the fields the TTC section of the PDF actually renders. */
function buildTtcReportData(
  scoredCycles: TtcHistoryCycle[],
  logs: ReportLog[],
  cycleStarts: string[],
  windowEnd: Date,
): TtcReportData | null {
  if (cycleStarts.length === 0) return null;

  const cycles: TtcReportCycle[] = scoredCycles.map((c) => ({
    cycleStart: c.cycleStart,
    cycleEnd: c.cycleEnd,
    isOngoing: c.isOngoing,
    status: c.signal.status,
    confirmedDate: c.signal.confirmedDate,
    method: c.signal.method,
    confidence: c.signal.confidence,
    anovulatory: c.signal.anovulatory,
  }));

  return { cycles, chart: latestCycleChart(logs, cycleStarts, windowEnd), pcosPatterns: summarizePcosPatterns(scoredCycles) };
}

// ── suggestions (deterministic, non-diagnostic) ─────────────────────────────

// WHO's stricter "for additional benefits" free-sugar guideline (<5% of a
// 2000 kcal reference diet). Expressed as an absolute gram figure since the
// report doesn't have a personalized calorie target to compare against.
const WHO_FREE_SUGAR_MAX_G = 25;

function buildSuggestions(report: Omit<HealthReport, 'suggestions' | 'clinicalFlags'>): Suggestion[] {
  const out: Suggestion[] = [];
  const { hydration, sleep, exercise, cycle, coverage, symptoms, nutrition } = report;

  if (hydration.average !== null && hydration.average < HYDRATION_TARGET_ML) {
    const shortfall = Math.round(HYDRATION_TARGET_ML - hydration.average);
    out.push({
      area: 'Hydration',
      finding: `Averaging ${Math.round(hydration.average)} ml a day, about ${shortfall} ml below a common ${HYDRATION_TARGET_ML} ml target.`,
      action: 'Try a glass with each meal and one on waking — that alone usually closes a gap this size.',
    });
  }

  if (sleep.average !== null && sleep.average < SLEEP_TARGET_HOURS) {
    out.push({
      area: 'Sleep',
      finding: `Averaging ${sleep.average.toFixed(1)} hours a night, below the ${SLEEP_TARGET_HOURS}-hour mark.`,
      action: 'Aim to shift bedtime earlier by 20–30 minutes rather than changing wake time, which is usually fixed.',
    });
  }

  if (exercise.weeklyAverage !== null && exercise.weeklyAverage < EXERCISE_TARGET_MINS_PER_WEEK) {
    out.push({
      area: 'Movement',
      finding: `About ${Math.round(exercise.weeklyAverage)} minutes of logged activity a week, against a commonly cited ${EXERCISE_TARGET_MINS_PER_WEEK} minutes.`,
      action: 'Three 20-minute walks would close most of this gap without needing gym time.',
    });
  }

  if (cycle.variationDays !== null && cycle.variationDays >= CYCLE_VARIATION_FLAG_DAYS) {
    out.push({
      area: 'Cycle',
      finding: `Cycle lengths varied by about ${cycle.variationDays.toFixed(1)} days across ${cycle.observedCycles.length} observed cycles.`,
      action: 'Keep logging period start dates consistently and share this report at your next appointment.',
    });
  }

  if (coverage.completenessPct < 50) {
    out.push({
      area: 'Tracking',
      finding: `Days logged on ${coverage.completenessPct}% of the last ${REPORT_WINDOW_DAYS} days.`,
      action: 'More consistent logging — even just period days and one symptom — makes every figure in this report more reliable.',
    });
  }

  const topSymptom = symptoms.top[0];
  if (topSymptom && topSymptom.count >= 5) {
    out.push({
      area: 'Symptoms',
      finding: `${topSymptom.name} was the most frequently logged symptom, on ${topSymptom.count} days.`,
      action: 'Note which cycle phase it clusters in — the phase breakdown overleaf is the useful part for a clinician.',
    });
  }

  if (nutrition && nutrition.sugarG.average !== null && nutrition.sugarG.average > WHO_FREE_SUGAR_MAX_G) {
    out.push({
      area: 'Nutrition',
      finding: `Averaging ${Math.round(nutrition.sugarG.average)} g of sugar a day across ${nutrition.daysLogged} logged days, above the WHO's ${WHO_FREE_SUGAR_MAX_G} g guideline for additional health benefits.`,
      action: 'Swapping one sugary drink or dessert a day for a lower-sugar alternative usually closes most of this gap.',
    });
  }

  return out;
}

/**
 * Findings a clinician would want surfaced. Deliberately descriptive, never
 * diagnostic — each entry states what was observed and why it is commonly
 * considered worth reviewing, and stops there.
 */
function buildClinicalFlags(report: Omit<HealthReport, 'suggestions' | 'clinicalFlags'>): ClinicalFlag[] {
  const out: ClinicalFlag[] = [];
  const { cycle } = report;

  if (cycle.shortestLength !== null && cycle.shortestLength < CYCLE_SHORT_DAYS) {
    out.push({
      finding: `Shortest observed cycle was ${cycle.shortestLength} days.`,
      why: `Cycles under ${CYCLE_SHORT_DAYS} days fall outside the range usually considered typical.`,
    });
  }

  if (cycle.longestLength !== null && cycle.longestLength > CYCLE_LONG_DAYS) {
    out.push({
      finding: `Longest observed cycle was ${cycle.longestLength} days.`,
      why: `Cycles over ${CYCLE_LONG_DAYS} days fall outside the range usually considered typical.`,
    });
  }

  if (cycle.variationDays !== null && cycle.variationDays >= CYCLE_VARIATION_FLAG_DAYS) {
    out.push({
      finding: `Cycle length varied by ±${cycle.variationDays.toFixed(1)} days (standard deviation).`,
      why: 'Wide cycle-to-cycle variation is one of the features commonly assessed when investigating irregular cycles.',
    });
  }

  if (cycle.longestPeriodLength !== null && cycle.longestPeriodLength > PROLONGED_BLEED_DAYS) {
    out.push({
      finding: `Longest recorded bleed was ${cycle.longestPeriodLength} days.`,
      why: `Bleeding beyond ${PROLONGED_BLEED_DAYS} days is commonly considered prolonged.`,
    });
  }

  return out;
}

// ── main entry point ───────────────────────────────────────────────────────

export async function buildHealthReport(): Promise<HealthReport | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const windowEnd = new Date();
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - REPORT_WINDOW_DAYS);
  // Cycle-length statistics need real history to mean anything — anomaly
  // detection alone needs 4+ cycles (see MIN_CYCLES_FOR_ANOMALY_DETECTION in
  // shared/cycle/anomaly.ts) and the 90-day printed window rarely holds that
  // many. daily_logs is fetched over this wider bound instead; the printed
  // "reporting window" figures (sleep, hydration, symptoms, coverage %, …)
  // are then filtered back down to the 90-day slice below (`windowLogs`), so
  // what the PDF says the window is stays true. Cycle-structural analysis —
  // cycle stats, TTC scoring, anomaly detection, PMOS indicators — reads from
  // the full wide `logs` on purpose.
  const windowStartWide = new Date();
  windowStartWide.setDate(windowStartWide.getDate() - CYCLE_HISTORY_WINDOW_DAYS);

  // Profile data is spread across three tables (see fetchProfilePageData) — the
  // name lives on `profiles`, conditions on `user_onboarding`, and the body/diet
  // fields on `user_lifestyle`.
  const [settingsRes, profileRes, onboardingRes, lifestyleRes, logsRes, lhReadingsRes, mealsRes] = await Promise.all([
    supabase.from('user_cycle_settings').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase.from('user_onboarding').select('conditions, goals, tracker_mode').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('user_lifestyle')
      .select('weight_kg, height_cm, activity_level, diet_preference')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('daily_logs')
      .select(
        'date, is_period, flow_intensity, symptoms, moods, exercise_types, exercise_minutes, water_intake, sleep_quality, sleep_minutes, disruptors, bbt_celsius, opk_result, bbt_wake_time, nsaid_taken, cervical_discharge, steps, hrv_ms, hrv_source, resting_heart_rate_bpm, skin_temp_delta_celsius',
      )
      .eq('user_id', user.id)
      .gte('date', formatDate(windowStartWide))
      .lte('date', formatDate(windowEnd))
      .order('date', { ascending: true }),
    supabase
      .from('lh_readings')
      .select('date, test_time, band_level')
      .eq('user_id', user.id)
      .gte('date', formatDate(windowStartWide))
      .lte('date', formatDate(windowEnd))
      .order('date', { ascending: true }),
    supabase
      .from('meal_logs')
      .select('date, name, calories, protein_g, carbs_g, fat_g, sugar_g, glycemic_index')
      .eq('user_id', user.id)
      .gte('date', formatDate(windowStart))
      .lte('date', formatDate(windowEnd))
      .order('date', { ascending: true }),
  ]);
  const lhReadings: LhBandReading[] = (lhReadingsRes.data ?? []).map((r: any) => ({
    date: r.date,
    testTime: r.test_time,
    bandLevel: Number(r.band_level),
  }));
  const meals: ReportMealLog[] = (mealsRes.data ?? []).map((m: any) => ({
    date: m.date,
    name: m.name,
    calories: m.calories,
    proteinG: m.protein_g,
    carbsG: m.carbs_g,
    fatG: m.fat_g,
    sugarG: m.sugar_g,
    glycemicIndex: m.glycemic_index,
  }));

  const settingsRow = settingsRes.data;
  if (!settingsRow) return null;

  const profile: { full_name?: string | null } = profileRes.data ?? {};
  const onboarding: { conditions?: string[] | null; goals?: string[] | null; tracker_mode?: string | null } =
    onboardingRes.data ?? {};
  const lifestyle: {
    weight_kg?: number | null;
    height_cm?: number | null;
    activity_level?: string | null;
    diet_preference?: string | null;
  } = lifestyleRes.data ?? {};
  // bbt_celsius is a Postgres `numeric`, which PostgREST returns as a string —
  // coerce here rather than letting a string reach the coverline arithmetic.
  const logs: ReportLog[] = (logsRes.data ?? []).map((l: any) => ({
    ...l,
    bbt_celsius: l.bbt_celsius === null || l.bbt_celsius === undefined ? null : Number(l.bbt_celsius),
  }));
  const mucusReadings: MucusReading[] = logs
    .map((l) => parseMucusJson(l.cervical_discharge, l.date))
    .filter((m): m is MucusReading => m !== null);

  // Printed daily-measure figures (sleep, hydration, symptoms, coverage %, …)
  // stay scoped to the documented 90-day reporting window even though `logs`
  // itself now covers more (see CYCLE_HISTORY_WINDOW_DAYS).
  const windowStartStr = formatDate(windowStart);
  const windowLogs: ReportLog[] = logs.filter((l) => l.date >= windowStartStr);

  // Her observed cycle length wins over the stored one here too — a report
  // that predicts off a number her own logs contradict is worse than no
  // report. Uses the full wide history for the best available observed
  // length, same reasoning as the rest of the app (see resolveCycleSettings).
  const storedSettings: CycleSettings = {
    last_period_start: settingsRow.last_period_start,
    cycle_length_days: settingsRow.cycle_length_days || 28,
    period_length_days: settingsRow.period_length_days || 5,
    luteal_length_days: settingsRow.luteal_length_days,
  };
  const settingsLogMap: Record<string, DailyLog> = {};
  logs.forEach((l) => {
    settingsLogMap[l.date] = { date: l.date, is_period: l.is_period ?? undefined };
  });
  const settings: CycleSettings = resolveCycleSettings(windowEnd, storedSettings, settingsLogMap);

  // ── cycle statistics, scoped to the reporting window (unchanged behavior) ─
  const { starts, bleedLengths } = deriveCycleStarts(windowLogs);
  const observedCycles: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const prev = new Date(`${starts[i - 1]}T00:00:00`);
    const cur = new Date(`${starts[i]}T00:00:00`);
    observedCycles.push(Math.round((cur.getTime() - prev.getTime()) / 86400000));
  }

  const cycle: CycleStats = {
    observedCycles,
    averageLength: observedCycles.length ? Math.round(average(observedCycles)!) : null,
    shortestLength: observedCycles.length ? Math.min(...observedCycles) : null,
    longestLength: observedCycles.length ? Math.max(...observedCycles) : null,
    variationDays: standardDeviation(observedCycles),
    observedPeriodLengths: bleedLengths,
    averagePeriodLength: bleedLengths.length ? Math.round(average(bleedLengths)!) : null,
    longestPeriodLength: bleedLengths.length ? Math.max(...bleedLengths) : null,
    settingsCycleLength: settings.cycle_length_days,
    settingsPeriodLength: settings.period_length_days,
    markedIrregular: settingsRow.is_irregular === true,
  };

  // ── cycle-pattern analysis, from the full wide history ───────────────────
  // Needs more cycles than 90 days reliably holds (see CYCLE_HISTORY_WINDOW_DAYS).
  // Runs the same detectCycleAnomalies the Insights screen already shows, so a
  // doctor reading this on paper sees the same read the member sees live.
  const { starts: wideStarts } = deriveCycleStarts(logs);
  const wideCycleHistory: CycleHistoryEntry[] = [];
  for (let i = 1; i < wideStarts.length; i++) {
    const length = Math.round(
      (new Date(`${wideStarts[i]}T00:00:00`).getTime() - new Date(`${wideStarts[i - 1]}T00:00:00`).getTime()) / 86400000,
    );
    if (length > 0) wideCycleHistory.push({ start: wideStarts[i - 1], length });
  }
  const recentCycleHistory = wideCycleHistory.slice(-CYCLE_HISTORY_LOOKBACK);

  const wideDisruptorsByDate: Record<string, string[]> = {};
  for (const l of logs) {
    if (l.disruptors?.length) wideDisruptorsByDate[l.date] = l.disruptors;
  }
  const cycleAnomalies: CycleAnomaly[] = detectCycleAnomalies(recentCycleHistory, wideDisruptorsByDate);

  // ── symptoms & moods by cycle phase, scoped to the reporting window ──────
  const phaseLogs: Record<string, ReportLog[]> = {
    Menstrual: [],
    Follicular: [],
    Ovulatory: [],
    Luteal: [],
  };
  // The lookup map calculatePhase walks needs the FULL history, so it can
  // correctly resolve a period streak that started before the window did —
  // only the bucketing loop below is scoped to windowLogs.
  const monthLogs: Record<string, DailyLog> = {};
  for (const l of logs) monthLogs[l.date] = { date: l.date, is_period: l.is_period === true };

  for (const l of windowLogs) {
    const result = calculatePhase(new Date(`${l.date}T00:00:00`), settings, monthLogs);
    if (result.phase) phaseLogs[result.phase].push(l);
  }

  const symptomsByPhase: Record<string, Counted[]> = {};
  for (const phase of Object.keys(phaseLogs)) {
    symptomsByPhase[phase] = tally(phaseLogs[phase].map((l) => l.symptoms)).slice(0, 5);
  }

  // Symptom × phase and mood × phase matrices — same "only call it a peak when
  // one phase genuinely leads" rule for both, so a flat spread never gets
  // dressed up as a pattern, and both ordered by overall frequency so the
  // most significant rows sit where a clinician will actually look first.
  function buildPhaseMatrix(counted: Counted[], pick: (l: ReportLog) => string[] | null | undefined): SymptomRow[] {
    return counted.slice(0, 10).map(({ name, count }) => {
      const byPhase: Record<string, number> = {};
      for (const phase of PHASE_ORDER) {
        byPhase[phase] = phaseLogs[phase].filter((l) => (pick(l) || []).includes(name)).length;
      }
      const peak = PHASE_ORDER.reduce((best, p) => (byPhase[p] > byPhase[best] ? p : best), PHASE_ORDER[0]);
      const isFlat = PHASE_ORDER.every((p) => byPhase[p] === byPhase[peak]);
      return { name, total: count, byPhase, peakPhase: isFlat ? null : peak };
    });
  }

  const allSymptoms = tally(windowLogs.map((l) => l.symptoms));
  const symptomMatrix: SymptomRow[] = buildPhaseMatrix(allSymptoms, (l) => l.symptoms);

  const allMoods = tally(windowLogs.map((l) => l.moods));
  const moodMatrix: SymptomRow[] = buildPhaseMatrix(allMoods, (l) => l.moods);

  const daysWithSymptoms = windowLogs.filter((l) => (l.symptoms || []).length > 0).length;

  const exerciseObserved = observedFrom(windowLogs, (l) => l.exercise_minutes);
  const totalExerciseMinutes = windowLogs.reduce((acc, l) => acc + (l.exercise_minutes || 0), 0);
  const weeks = REPORT_WINDOW_DAYS / 7;

  const heightCm = typeof lifestyle.height_cm === 'number' ? lifestyle.height_cm : null;
  const weightKg = typeof lifestyle.weight_kg === 'number' ? lifestyle.weight_kg : null;
  const bmi =
    heightCm && weightKg && heightCm > 0 ? weightKg / (heightCm / 100) ** 2 : null;

  const daysWithAnyLog = new Set(windowLogs.map((l) => l.date)).size;

  const hasPcos = hasPcosFlag(onboarding.goals, onboarding.conditions);

  // Scored once from the full wide history, reused by the TTC section (when
  // she's in TTC mode) and the PMOS indicator below (in every mode) — so the
  // two can never disagree about which cycle looked anovulatory. Cheap to
  // run even outside TTC mode: with no BBT/OPK logged, the anovulatory read
  // just comes back null, same as detectOvulation's own date-math fallback.
  const scoredCycles = scoreCyclesForReport(logs, wideStarts, settings, windowEnd, hasPcos, lhReadings, mucusReadings);
  const ttc =
    onboarding.tracker_mode === 'ttc' ? buildTtcReportData(scoredCycles, logs, wideStarts, windowEnd) : null;

  // ── PMOS-pattern indicators — same composite score Insights already shows ─
  const scoredForAnovulatoryCheck = scoredCycles.filter((c) => !c.isOngoing);
  const anovulatoryAssessment =
    scoredForAnovulatoryCheck.length > 0
      ? {
          flaggedCycles: scoredForAnovulatoryCheck.filter((c) => (c.signal.anovulatory?.reasons?.length ?? 0) > 0).length,
          totalCycles: scoredForAnovulatoryCheck.length,
        }
      : null;
  const pmosScore: PmosPatternScore = computePmosPatternScore({
    cycleLengths: recentCycleHistory.map((c) => c.length),
    anovulatoryAssessment,
    bmi,
  });

  // ── nutrition, from meal logging ─────────────────────────────────────────
  const dailyTotals = dailyNutritionTotals(meals);
  const mealGiValues = meals.map((m) => m.glycemicIndex).filter((v): v is number => typeof v === 'number');
  const nutrition: NutritionStats | null = meals.length
    ? {
        // requirePositive: false — every row here is already a real logged day
        // (dailyNutritionTotals only emits rows for days with ≥1 meal), and a
        // genuinely zero-sugar day is a real, informative day, not a missing one.
        calories: observedFrom(dailyTotals, (d) => d.calories, false),
        proteinG: observedFrom(dailyTotals, (d) => d.proteinG, false),
        carbsG: observedFrom(dailyTotals, (d) => d.carbsG, false),
        fatG: observedFrom(dailyTotals, (d) => d.fatG, false),
        sugarG: observedFrom(dailyTotals, (d) => d.sugarG, false),
        avgGlycemicIndex: mealGiValues.length ? Math.round(average(mealGiValues)!) : null,
        mealsLogged: meals.length,
        daysLogged: dailyTotals.length,
        topFoods: tally(meals.map((m) => [m.name])).slice(0, 8),
      }
    : null;

  // ── wearable signals, from Apple Health / Health Connect ────────────────
  const wearableCandidate: WearableStats = {
    restingHeartRate: observedFrom(windowLogs, (l) => l.resting_heart_rate_bpm),
    hrv: observedFrom(windowLogs, (l) => l.hrv_ms),
    steps: observedFrom(windowLogs, (l) => l.steps),
    // requirePositive: false — a below-baseline delta is a real, meaningful
    // reading here, unlike the app's "0 means not logged" convention elsewhere.
    skinTempDelta: observedFrom(windowLogs, (l) => l.skin_temp_delta_celsius, false),
  };
  const hasAnyWearableData = [
    wearableCandidate.restingHeartRate,
    wearableCandidate.hrv,
    wearableCandidate.steps,
    wearableCandidate.skinTempDelta,
  ].some((o) => o.daysLogged > 0);
  const wearable = hasAnyWearableData ? wearableCandidate : null;

  const base: Omit<HealthReport, 'suggestions' | 'clinicalFlags'> = {
    generatedAt: new Date(),
    windowDays: REPORT_WINDOW_DAYS,
    windowStart: formatDate(windowStart),
    windowEnd: formatDate(windowEnd),
    person: {
      name: profile.full_name || 'Rove member',
      heightCm,
      weightKg,
      bmi: bmi ? Number(bmi.toFixed(1)) : null,
      conditions: Array.isArray(onboarding.conditions) ? onboarding.conditions : [],
      dietPreference: lifestyle.diet_preference || null,
      activityLevel: lifestyle.activity_level || null,
    },
    coverage: {
      daysWithAnyLog,
      completenessPct: Math.round((daysWithAnyLog / REPORT_WINDOW_DAYS) * 100),
    },
    cycle,
    hydration: observedFrom(windowLogs, (l) => (l.water_intake ? l.water_intake * ML_PER_GLASS : null)),
    sleep: {
      // sleep_minutes is stored in minutes; the report speaks in hours throughout.
      ...observedFrom(windowLogs, (l) => (l.sleep_minutes ? l.sleep_minutes / 60 : null)),
    },
    exercise: {
      ...exerciseObserved,
      weeklyAverage: totalExerciseMinutes > 0 ? totalExerciseMinutes / weeks : null,
      topTypes: tally(windowLogs.map((l) => l.exercise_types)).slice(0, 5),
    },
    symptoms: {
      top: allSymptoms.slice(0, 8),
      byPhase: symptomsByPhase,
      matrix: symptomMatrix,
      daysWithSymptoms,
    },
    moods: allMoods.slice(0, 6),
    moodMatrix,
    sleepDisruptors: tally(windowLogs.map((l) => l.disruptors)).slice(0, 5),
    cycleAnomalies,
    pmosScore,
    ttc,
    nutrition,
    wearable,
  };

  return {
    ...base,
    suggestions: buildSuggestions(base),
    clinicalFlags: buildClinicalFlags(base),
  };
}

export type PreparedReport = { report: HealthReport; html: string };

export type PrepareResult =
  | { ok: true; prepared: PreparedReport }
  | { ok: false; reason: 'no-data' | 'failed' };

/**
 * Builds the report and renders its HTML, without writing a PDF. The card shows
 * this in a WebView so the user can read the report inside the app before
 * deciding whether to export it.
 */
export async function prepareHealthReport(): Promise<PrepareResult> {
  try {
    const report = await buildHealthReport();
    if (!report) return { ok: false, reason: 'no-data' };
    return { ok: true, prepared: { report, html: renderHealthReportHtml(report) } };
  } catch (error) {
    console.error('Health report build failed:', error);
    return { ok: false, reason: 'failed' };
  }
}

/**
 * Writes the prepared report to a PDF and hands it to the OS share sheet, so the
 * user decides where it goes (mail to a doctor, save to files, print). Nothing is
 * uploaded by this function.
 */
export async function shareHealthReportPdf(prepared: PreparedReport): Promise<boolean> {
  try {
    const { uri } = await Print.printToFileAsync({ html: prepared.html, base64: false });

    // printToFileAsync names the file with a UUID, which is what the share sheet and
    // the recipient's inbox would show. Give it a name a doctor can file.
    const safeName = prepared.report.person.name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
    const target = `${FileSystem.cacheDirectory}Rove-Health-Report-${safeName || 'Member'}-${prepared.report.windowEnd}.pdf`;
    await FileSystem.deleteAsync(target, { idempotent: true });
    await FileSystem.moveAsync({ from: uri, to: target });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(target, {
        mimeType: 'application/pdf',
        dialogTitle: 'Health Report',
        UTI: 'com.adobe.pdf',
      });
    }
    return true;
  } catch (error) {
    console.error('Health report export failed:', error);
    return false;
  }
}
