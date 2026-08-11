import { supabase } from './supabase';
import { calculatePhase, type CycleSettings, type DailyLog } from '@shared/cycle/phase';
import { PHASE_CONTENT } from '@shared/content/phase-content';

const LOG_WINDOW_DAYS = 90;

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
  };
  settings: CycleSettings;
  monthLogs: Record<string, DailyLog>;
  nutrients: { title: string; desc: string; icon: string; detail: string }[];
  phaseFocus: { title: string; desc: string; icon: string; detail: string }[];
  trackerMode: 'menstruation' | 'menopause';
  lifestyle: { diet_preference: string } | null;
};

/**
 * TTC isn't in this release, but accounts that picked it before it was pulled still have
 * 'ttc' stored in onboarding.tracker_mode. Fall those back to the standard cycle dashboard
 * rather than a dead placeholder. The stored value is left alone, so these users return to
 * TTC automatically once the real dashboard ships.
 */
function normaliseTrackerMode(stored: string | null | undefined): DashboardData['trackerMode'] {
  return stored === 'menopause' ? 'menopause' : 'menstruation';
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

  const [profileResult, onboardingResult, settingsResult, logsResult, lifestyleResult] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('user_onboarding').select('tracker_mode, goals, conditions').eq('user_id', user.id).single(),
    supabase.from('user_cycle_settings').select('*').eq('user_id', user.id).single(),
    supabase.from('daily_logs').select('date, is_period').eq('user_id', user.id).gte('date', formatDate(pastDate)).order('date', { ascending: false }),
    supabase.from('user_lifestyle').select('diet_preference').eq('user_id', user.id).maybeSingle(),
  ]);

  const profile = profileResult.data;
  const onboarding = onboardingResult.data;
  const settings = settingsResult.data;
  const logs = logsResult.data || [];
  const lifestyle = lifestyleResult.data;

  if (!settings) return null;

  const monthLogs: Record<string, DailyLog> = {};
  logs.forEach((l: any) => { monthLogs[l.date] = { date: l.date, is_period: l.is_period }; });

  const phaseSettings: CycleSettings = {
    last_period_start: settings.last_period_start || '',
    cycle_length_days: settings.cycle_length_days || 28,
    period_length_days: settings.period_length_days || 5,
  };

  const phaseResult = calculatePhase(new Date(), phaseSettings, monthLogs);
  const phase = phaseResult.phase || 'Menstrual';
  const day = phaseResult.day || 1;

  const cycleLength = settings.cycle_length_days || 28;
  const nextPeriodDate = settings.last_period_start
    ? (() => {
        const [py, pm, pd] = settings.last_period_start.split('-').map(Number);
        const next = new Date(py, pm - 1, pd);
        next.setDate(next.getDate() + cycleLength);
        return formatDate(next);
      })()
    : null;

  const content = PHASE_CONTENT[phase] || PHASE_CONTENT['Menstrual'];

  return {
    user: { id: user.id, name: profile?.full_name || 'Rove Member' },
    phase: { name: phase, day, length: cycleLength, nextPeriodDate },
    settings: phaseSettings,
    monthLogs,
    nutrients: content.nutrients || [],
    phaseFocus: content.phaseFocus || [],
    trackerMode: normaliseTrackerMode(onboarding?.tracker_mode),
    lifestyle: lifestyle ? { diet_preference: lifestyle.diet_preference } : null,
  };
}
