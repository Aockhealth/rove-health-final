import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// Legacy API: the SDK 54 File/Directory rewrite doesn't cover the cache-directory
// move we need here, and the legacy surface is still shipped and supported.
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { calculatePhase, type CycleSettings, type DailyLog } from '@shared/cycle/phase';
import { renderHealthReportHtml } from './healthReportHtml';

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
  area: 'Hydration' | 'Sleep' | 'Movement' | 'Cycle' | 'Tracking' | 'Symptoms';
  finding: string;
  action: string;
};

export type ClinicalFlag = {
  finding: string;
  why: string;
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
  sleepDisruptors: Counted[];
  suggestions: Suggestion[];
  clinicalFlags: ClinicalFlag[];
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

function observedFrom(logs: ReportLog[], pick: (l: ReportLog) => number | null | undefined): Observed {
  const values = logs
    .map(pick)
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v) && v > 0);
  return { average: average(values), daysLogged: values.length };
}

/**
 * Derives real cycle boundaries from logged period days rather than from the
 * settings average, so the report reflects what actually happened. Consecutive
 * period days (tolerating a one-day gap, matching how people log) collapse into
 * one bleed; the gap between consecutive bleed starts is one observed cycle.
 */
function deriveCycles(logs: ReportLog[]): { starts: string[]; bleedLengths: number[] } {
  const periodDates = logs
    .filter((l) => l.is_period === true)
    .map((l) => l.date)
    .sort();

  const starts: string[] = [];
  const bleedLengths: number[] = [];
  let currentStart: string | null = null;
  let currentLength = 0;
  let previous: Date | null = null;

  for (const dateStr of periodDates) {
    const d = new Date(`${dateStr}T00:00:00`);
    const gapDays = previous ? Math.round((d.getTime() - previous.getTime()) / 86400000) : null;

    if (currentStart === null || (gapDays !== null && gapDays > 2)) {
      if (currentStart !== null) bleedLengths.push(currentLength);
      currentStart = dateStr;
      starts.push(dateStr);
      currentLength = 1;
    } else {
      currentLength += 1;
    }
    previous = d;
  }
  if (currentStart !== null) bleedLengths.push(currentLength);

  return { starts, bleedLengths };
}

// ── suggestions (deterministic, non-diagnostic) ─────────────────────────────

function buildSuggestions(report: Omit<HealthReport, 'suggestions' | 'clinicalFlags'>): Suggestion[] {
  const out: Suggestion[] = [];
  const { hydration, sleep, exercise, cycle, coverage, symptoms } = report;

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

  // Profile data is spread across three tables (see fetchProfilePageData) — the
  // name lives on `profiles`, conditions on `user_onboarding`, and the body/diet
  // fields on `user_lifestyle`.
  const [settingsRes, profileRes, onboardingRes, lifestyleRes, logsRes] = await Promise.all([
    supabase.from('user_cycle_settings').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase.from('user_onboarding').select('conditions').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('user_lifestyle')
      .select('weight_kg, height_cm, activity_level, diet_preference')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('daily_logs')
      .select(
        'date, is_period, flow_intensity, symptoms, moods, exercise_types, exercise_minutes, water_intake, sleep_quality, sleep_minutes, disruptors',
      )
      .eq('user_id', user.id)
      .gte('date', formatDate(windowStart))
      .lte('date', formatDate(windowEnd))
      .order('date', { ascending: true }),
  ]);

  const settingsRow = settingsRes.data;
  if (!settingsRow) return null;

  const profile: { full_name?: string | null } = profileRes.data ?? {};
  const onboarding: { conditions?: string[] | null } = onboardingRes.data ?? {};
  const lifestyle: {
    weight_kg?: number | null;
    height_cm?: number | null;
    activity_level?: string | null;
    diet_preference?: string | null;
  } = lifestyleRes.data ?? {};
  const logs: ReportLog[] = logsRes.data ?? [];

  const settings: CycleSettings = {
    last_period_start: settingsRow.last_period_start,
    cycle_length_days: settingsRow.cycle_length_days || 28,
    period_length_days: settingsRow.period_length_days || 5,
    luteal_length_days: settingsRow.luteal_length_days,
  };

  // ── cycle statistics from observed data ──────────────────────────────────
  const { starts, bleedLengths } = deriveCycles(logs);
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

  // ── symptoms by cycle phase ──────────────────────────────────────────────
  const phaseLogs: Record<string, ReportLog[]> = {
    Menstrual: [],
    Follicular: [],
    Ovulatory: [],
    Luteal: [],
  };
  const monthLogs: Record<string, DailyLog> = {};
  for (const l of logs) monthLogs[l.date] = { date: l.date, is_period: l.is_period === true };

  for (const l of logs) {
    const result = calculatePhase(new Date(`${l.date}T00:00:00`), settings, monthLogs);
    if (result.phase) phaseLogs[result.phase].push(l);
  }

  const symptomsByPhase: Record<string, Counted[]> = {};
  for (const phase of Object.keys(phaseLogs)) {
    symptomsByPhase[phase] = tally(phaseLogs[phase].map((l) => l.symptoms)).slice(0, 5);
  }

  // Symptom × phase matrix, ordered by overall frequency so the most significant
  // rows sit at the top where a clinician will actually look.
  const allSymptoms = tally(logs.map((l) => l.symptoms));
  const symptomMatrix: SymptomRow[] = allSymptoms.slice(0, 10).map(({ name, count }) => {
    const byPhase: Record<string, number> = {};
    for (const phase of PHASE_ORDER) {
      byPhase[phase] = phaseLogs[phase].filter((l) => (l.symptoms || []).includes(name)).length;
    }
    const peak = PHASE_ORDER.reduce((best, p) => (byPhase[p] > byPhase[best] ? p : best), PHASE_ORDER[0]);
    // Only call it a peak when one phase genuinely leads — a flat spread shouldn't
    // be dressed up as a pattern.
    const isFlat = PHASE_ORDER.every((p) => byPhase[p] === byPhase[peak]);
    return { name, total: count, byPhase, peakPhase: isFlat ? null : peak };
  });

  const daysWithSymptoms = logs.filter((l) => (l.symptoms || []).length > 0).length;

  const exerciseObserved = observedFrom(logs, (l) => l.exercise_minutes);
  const totalExerciseMinutes = logs.reduce((acc, l) => acc + (l.exercise_minutes || 0), 0);
  const weeks = REPORT_WINDOW_DAYS / 7;

  const heightCm = typeof lifestyle.height_cm === 'number' ? lifestyle.height_cm : null;
  const weightKg = typeof lifestyle.weight_kg === 'number' ? lifestyle.weight_kg : null;
  const bmi =
    heightCm && weightKg && heightCm > 0 ? weightKg / (heightCm / 100) ** 2 : null;

  const daysWithAnyLog = new Set(logs.map((l) => l.date)).size;

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
    hydration: observedFrom(logs, (l) => (l.water_intake ? l.water_intake * ML_PER_GLASS : null)),
    sleep: {
      // sleep_minutes is stored in minutes; the report speaks in hours throughout.
      ...observedFrom(logs, (l) => (l.sleep_minutes ? l.sleep_minutes / 60 : null)),
    },
    exercise: {
      ...exerciseObserved,
      weeklyAverage: totalExerciseMinutes > 0 ? totalExerciseMinutes / weeks : null,
      topTypes: tally(logs.map((l) => l.exercise_types)).slice(0, 5),
    },
    symptoms: {
      top: allSymptoms.slice(0, 8),
      byPhase: symptomsByPhase,
      matrix: symptomMatrix,
      daysWithSymptoms,
    },
    moods: tally(logs.map((l) => l.moods)).slice(0, 6),
    sleepDisruptors: tally(logs.map((l) => l.disruptors)).slice(0, 5),
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
