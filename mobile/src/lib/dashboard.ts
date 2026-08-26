import { supabase } from './supabase';
import {
  calculatePhase,
  deriveRecentCycleLengths,
  getRelevantPeriodStart,
  type CycleSettings,
  type DailyLog,
} from '@shared/cycle/phase';
import { detectOvulation, type OvulationSignal, type TtcDailyLog } from '@shared/cycle/ttc';
import type { LhBandReading } from '@shared/cycle/lh';
import { parseMucusJson, type MucusReading } from '@shared/cycle/mucus';
import { resolvePhaseSettings, toTtcLogs } from './phaseSettings';
import { persistOvulationEstimate } from './ovulationEstimates';
import { syncOvulationStatusNotification } from './notifications';
import { PHASE_CONTENT } from '@shared/content/phase-content';
import { hasPcosFlag } from './pcos';

// Sized to CYCLE_HISTORY_LOOKBACK (6) cycles at the long end of
// MAX_PLAUSIBLE_CYCLE_LENGTH. A flat 90 days held ~3 cycles at 28 days and
// only 2 at 45 — below the 4 that anomaly detection needs and the 3 that
// fertile-window personalization needs, so the longer a woman's cycles were,
// the less personalization she got.
const LOG_WINDOW_DAYS = 270;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type DashboardData = {
  user: { id: string; name: string };
  phase: {
    name: string;
    day: number;
    length: number;
    nextPeriodDate: string | null;
    confidence: 'low' | 'medium' | 'high';
    dataSource: 'logs' | 'settings' | 'none';
  };
  settings: CycleSettings;
  monthLogs: Record<string, TtcDailyLog>;
  nutrients: { title: string; desc: string; icon: string; detail: string }[];
  phaseFocus: { title: string; desc: string; icon: string; detail: string }[];
  trackerMode: 'menstruation' | 'menopause' | 'ttc';
  lifestyle: { diet_preference: string } | null;
  /**
   * Combined BBT + OPK ovulation read. Only computed in TTC mode — the other
   * modes don't surface it, and it would be dead work on every dashboard load.
   */
  ovulation: OvulationSignal | null;
  /**
   * NSAID/mucus/intercourse logs, by date. Kept separate from `monthLogs`
   * rather than added to the shared `TtcDailyLog` type — that type is
   * algorithm-facing (consumed by `detectOvulation`), and none of these three
   * play any role in ovulation detection. They only back Home's TTC
   * "Today's Snapshot" cards.
   */
  nsaidTakenByDate: Record<string, boolean>;
  cervicalDischargeByDate: Record<string, string>;
  sexActivityByDate: Record<string, string[]>;
  /** This cycle's start date, resolved once here so every TTC surface (and the quick-log sheet) anchors to the same cycle. Null outside TTC mode or with no data yet. */
  cycleStart: string | null;
  /** How many LH strips she's already logged this cycle — drives the "Strip N of 5" countdown. */
  lhReadingsThisCycleCount: number;
  /** LH band level already logged, by date — lets the quick-log sheet prefill today's reading if she reopens it. */
  lhBandByDate: Record<string, number>;
};

function normaliseTrackerMode(stored: string | null | undefined): DashboardData['trackerMode'] {
  if (stored === 'menopause' || stored === 'ttc') return stored;
  return 'menstruation';
}

/**
 * Mirrors frontend/src/app/actions/cycle-sync.ts's fetchDashboardData authenticated
 * path. Runs as direct client queries (RLS-scoped to auth.uid()) instead of a Next.js
 * Server Action, since RN can't reach those. Phase content itself is bundled locally
 * via @shared/content/phase-content rather than the optional Supabase CMS override
 * table the web app checks first — that table is for occasional copy edits, not
 * something the mobile app needs to poll on every dashboard load.
 */
export async function fetchDashboardData(): Promise<DashboardData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - LOG_WINDOW_DAYS);

  const [profileResult, onboardingResult, settingsResult, logsResult, lifestyleResult, lhReadingsResult] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('user_onboarding').select('tracker_mode, goals, conditions').eq('user_id', user.id).single(),
    supabase.from('user_cycle_settings').select('*').eq('user_id', user.id).single(),
    // NOTE: every column named here must exist in the deployed database.
    // PostgREST rejects the *entire* query for one unknown column, and the
    // `|| []` fallback below then turns that error into "this user has no
    // logs" — which reads as a wrong phase/day on Home rather than as a
    // failure. Check a new column exists remotely before adding it here.
    supabase.from('daily_logs').select('date, is_period, bbt_celsius, opk_result, nsaid_taken, cervical_discharge, sex_activity, disruptors, sleep_minutes, bbt_wake_time').eq('user_id', user.id).gte('date', formatDate(pastDate)).order('date', { ascending: false }),
    supabase.from('user_lifestyle').select('diet_preference').eq('user_id', user.id).maybeSingle(),
    // Her LH baseline needs "all logged cycles", not just this cycle — but
    // this shares the same 90-day practical window as everything else here
    // for now, same tradeoff as monthLogs below.
    supabase.from('lh_readings').select('date, test_time, band_level').eq('user_id', user.id).gte('date', formatDate(pastDate)).order('date', { ascending: false }),
  ]);

  const profile = profileResult.data;
  const onboarding = onboardingResult.data;
  const settings = settingsResult.data;
  // A failed logs query is not the same as "no logs", but `|| []` makes them
  // indistinguishable downstream: the phase calculation quietly falls back to
  // the settings column and reports a confident, wrong day. Surface it instead.
  if (logsResult.error) {
    console.error('[dashboard] daily_logs query failed:', logsResult.error.message);
  }
  // Same trap as daily_logs above: `.single()` on a transient network/timeout
  // failure and `.single()` on a genuinely missing settings row both land here
  // as settingsResult.error with settingsResult.data === null. The `!settings`
  // check below can't tell them apart, so a blip (e.g. concurrent requests
  // from Profile loading at the same time) reads as "user never finished
  // onboarding" and Home's caller redirects an onboarded user back into the
  // onboarding flow. PGRST116 is PostgREST's real "no rows" code — anything
  // else is a fetch failure and must not be treated as "not onboarded".
  if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
    console.error('[dashboard] user_cycle_settings query failed:', settingsResult.error.message);
    throw new Error(`user_cycle_settings fetch failed: ${settingsResult.error.message}`);
  }
  const logs = logsResult.data || [];
  const lifestyle = lifestyleResult.data;
  if (lhReadingsResult.error) {
    console.error('[dashboard] lh_readings query failed:', lhReadingsResult.error.message);
  }
  const lhReadings: LhBandReading[] = (lhReadingsResult.data || []).map((r: any) => ({
    date: r.date,
    testTime: r.test_time,
    bandLevel: Number(r.band_level),
  }));
  const lhBandByDate: Record<string, number> = {};
  lhReadings.forEach((r) => {
    lhBandByDate[r.date] = r.bandLevel;
  });

  if (!settings) return null;

  const monthLogs: Record<string, TtcDailyLog> = {};
  const nsaidTakenByDate: Record<string, boolean> = {};
  const cervicalDischargeByDate: Record<string, string> = {};
  const sexActivityByDate: Record<string, string[]> = {};
  const mucusReadings: MucusReading[] = [];
  logs.forEach((l: any) => {
    monthLogs[l.date] = {
      date: l.date,
      is_period: l.is_period,
      // Coerced defensively: bbt_celsius is a Postgres `numeric`, and a string
      // slipping through would compare wrong against the coverline rather than
      // failing loudly.
      bbt_celsius: l.bbt_celsius === null || l.bbt_celsius === undefined ? null : Number(l.bbt_celsius),
      opk_result: l.opk_result ?? null,
      disruptors: l.disruptors ?? null,
      sleep_minutes: l.sleep_minutes === null || l.sleep_minutes === undefined ? null : Number(l.sleep_minutes),
      bbt_wake_time: l.bbt_wake_time ?? null,
      nsaid_taken: l.nsaid_taken ?? null,
    };
    if (l.nsaid_taken) nsaidTakenByDate[l.date] = true;
    if (l.cervical_discharge) {
      cervicalDischargeByDate[l.date] = l.cervical_discharge;
      const mucus = parseMucusJson(l.cervical_discharge, l.date);
      if (mucus) mucusReadings.push(mucus);
    }
    if (Array.isArray(l.sex_activity) && l.sex_activity.length > 0) sexActivityByDate[l.date] = l.sex_activity;
  });

  const trackerMode = normaliseTrackerMode(onboarding?.tracker_mode);
  const hasPcos = hasPcosFlag(onboarding?.goals, onboarding?.conditions);

  const baseSettings: CycleSettings = {
    last_period_start: settings.last_period_start || '',
    cycle_length_days: settings.cycle_length_days || 28,
    period_length_days: settings.period_length_days || 5,
  };

  // Her observed cycle length + (in TTC) her own luteal length, resolved once
  // by the module every screen now shares — see lib/phaseSettings.ts.
  const phaseSettings = resolvePhaseSettings({
    base: baseSettings,
    monthLogs,
    ttcLogs: toTtcLogs(logs),
    trackerMode,
    hasPcos,
    lhReadings,
    mucusReadings,
  });

  const phaseResult = calculatePhase(new Date(), phaseSettings, monthLogs);
  const phase = phaseResult.phase || 'Menstrual';
  const day = phaseResult.day || 1;

  // Single resolved period start for this whole payload — prefers an actual
  // logged period day over the (possibly stale) settings column, exactly like
  // calculatePhase already does internally, and exactly like Tracker/Insights/
  // Plan/Profile already resolve it. `nextPeriodDate` used to read
  // settings.last_period_start directly, bypassing this — the one place on
  // this screen that could disagree with everywhere else in the app about
  // which cycle "today" belongs to.
  const { start: cycleStart } = getRelevantPeriodStart(new Date(), phaseSettings, monthLogs);

  // Resolved, not stored: counting her down to a 28 she typed at onboarding
  // while her own logs say 34 is exactly the bug this fixes.
  const cycleLength = phaseSettings.cycle_length_days;
  const nextPeriodDate = cycleStart
    ? (() => {
        const [py, pm, pd] = cycleStart.split('-').map(Number);
        const next = new Date(py, pm - 1, pd);
        next.setDate(next.getDate() + cycleLength);
        return formatDate(next);
      })()
    : null;

  const content = PHASE_CONTENT[phase] || PHASE_CONTENT['Menstrual'];

  const recentCycleLengths = deriveRecentCycleLengths(new Date(), monthLogs);
  const lhReadingsThisCycleCount = cycleStart
    ? lhReadings.filter((r) => r.date >= cycleStart && r.date <= formatDate(new Date())).length
    : 0;

  const ovulation =
    trackerMode === 'ttc' && cycleStart
      ? detectOvulation(cycleStart, new Date(), monthLogs, phaseSettings, { hasPcos, recentCycleLengths, lhReadings, mucusReadings })
      : null;

  // Fire-and-forget audit write — never blocks or fails the dashboard load
  // the user is actually looking at (see persistOvulationEstimate).
  if (ovulation && cycleStart) {
    void persistOvulationEstimate(user.id, cycleStart, ovulation);
    void syncOvulationStatusNotification(cycleStart, ovulation);
  }

  return {
    user: { id: user.id, name: profile?.full_name || 'Rove Member' },
    phase: {
      name: phase,
      day,
      length: cycleLength,
      nextPeriodDate,
      confidence: phaseResult.confidence,
      dataSource: phaseResult.dataSource,
    },
    settings: phaseSettings,
    monthLogs,
    nutrients: content.nutrients || [],
    phaseFocus: content.phaseFocus || [],
    trackerMode,
    lifestyle: lifestyle ? { diet_preference: lifestyle.diet_preference } : null,
    ovulation,
    nsaidTakenByDate,
    cervicalDischargeByDate,
    sexActivityByDate,
    cycleStart,
    lhReadingsThisCycleCount,
    lhBandByDate,
  };
}
