/**
 * The doctor loop — her side of it.
 *
 * She publishes one frozen snapshot of her health report to a passcode-
 * protected link, hands the link and the 4-digit code to her gynaecologist,
 * and he replies in one line from a browser with no Rove account. His reply
 * comes back as a *pending* note that only becomes advice inside the app once
 * she confirms it came from the doctor she gave the link to.
 *
 * Why a snapshot and not live access: the entire report is computed on this
 * device (see healthReport.ts, and the promise in its header comment). A
 * browser can't run that, and re-implementing it server-side would fork the
 * analysis — the exact drift healthReport.ts's own comments already guard
 * against. Snapshotting keeps one implementation, keeps the privacy claim
 * intact, and is the clinically correct object anyway: the record as it stood
 * at the consultation, which is what a printed PDF always was.
 *
 * @module mobile/src/lib/doctorShare
 */
import { supabase } from './supabase';
import { buildHealthReport, type HealthReport } from './healthReport';
import { fetchLabResults, type LabResult } from './labResults';

// TODO(founder): this must resolve to the Next.js route at
// frontend/src/app/report/[token]/page.tsx. Unlike the partner link (see
// SHARE_BASE_URL in partnerShare.ts, whose web page was never deployed and
// so only ever opened for someone who already had the app), this one is
// useless without the web page — a doctor with the Rove app installed is not
// the case we are building for.
export const DOCTOR_SHARE_BASE_URL = 'https://rovehealth.in/report/';

export function buildDoctorShareUrl(token: string): string {
  return `${DOCTOR_SHARE_BASE_URL}${token}`;
}

/** Bumped whenever the snapshot shape changes; stored alongside each snapshot so an old link still renders. */
export const SNAPSHOT_VERSION = 1;

export const DEFAULT_VALID_DAYS = 30;

/**
 * What actually gets published. The health report as computed on-device,
 * serialised, plus the two things a clinician asks for that the PDF doesn't
 * currently carry: her logged lab values and any fertility medication.
 */
export type DoctorSnapshot = Omit<HealthReport, 'generatedAt'> & {
  generatedAt: string;
  labs: LabResult[];
  medications: { date: string; name: string; dose: string | null }[];
};

export interface DoctorShareLink {
  id: string;
  token: string;
  doctorLabel: string | null;
  createdAt: string;
  expiresAt: string;
  lastViewedAt: string | null;
  viewCount: number;
  /** True once someone burned all ten passcode attempts. She must regenerate — and should be told why. */
  isLocked: boolean;
}

/** Returned exactly once, at creation. The passcode is never stored in plaintext and cannot be recovered. */
export interface CreatedDoctorShare {
  token: string;
  passcode: string;
  expiresAt: string;
  url: string;
}

function mapLink(row: any): DoctorShareLink {
  return {
    id: row.id,
    token: row.token,
    doctorLabel: row.doctor_label,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastViewedAt: row.last_viewed_at,
    viewCount: row.view_count ?? 0,
    isLocked: !!row.locked_at,
  };
}

async function fetchMedications(windowStart: string, windowEnd: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('daily_logs')
    .select('date, fertility_medication, fertility_medication_dose')
    .eq('user_id', user.id)
    .gte('date', windowStart)
    .lte('date', windowEnd)
    .not('fertility_medication', 'is', null)
    .order('date', { ascending: false });

  if (error || !data) return [];
  return data
    .filter((r: any) => r.fertility_medication)
    .map((r: any) => ({ date: r.date, name: r.fertility_medication, dose: r.fertility_medication_dose ?? null }));
}

export type BuildSnapshotResult =
  | { ok: true; snapshot: DoctorSnapshot }
  | { ok: false; reason: 'no-data' | 'failed' };

/**
 * Runs the same buildHealthReport the in-app viewer and the PDF export run,
 * so what her doctor opens and what she read are the same numbers — this is
 * deliberately not a second, "web-flavoured" report.
 */
export async function buildDoctorSnapshot(): Promise<BuildSnapshotResult> {
  try {
    const report = await buildHealthReport();
    if (!report) return { ok: false, reason: 'no-data' };

    const [labs, medications] = await Promise.all([
      fetchLabResults(30).catch(() => [] as LabResult[]),
      fetchMedications(report.windowStart, report.windowEnd).catch(() => []),
    ]);

    return {
      ok: true,
      snapshot: {
        ...report,
        generatedAt: report.generatedAt.toISOString(),
        labs,
        medications,
      },
    };
  } catch (error) {
    console.error('[doctorShare] buildDoctorSnapshot failed:', error);
    return { ok: false, reason: 'failed' };
  }
}

/** The current live link, if she has one. Expired links are treated as gone. */
export async function getActiveDoctorShare(): Promise<DoctorShareLink | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('doctor_share_links')
    .select('id, token, doctor_label, created_at, expires_at, last_viewed_at, view_count, locked_at')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapLink(data);
}

/**
 * Publishes a fresh snapshot and returns the passcode once. Any previous link
 * is revoked server-side by create_doctor_share — one live link at a time, so
 * a link she believes she turned off isn't still sitting in someone's chat.
 */
export async function createDoctorShare(
  snapshot: DoctorSnapshot,
  doctorLabel?: string,
  validDays: number = DEFAULT_VALID_DAYS,
): Promise<CreatedDoctorShare | null> {
  const { data, error } = await supabase.rpc('create_doctor_share', {
    p_snapshot: snapshot,
    p_patient_label: snapshot.person.name,
    p_doctor_label: doctorLabel ?? null,
    p_valid_days: validDays,
  });

  if (error) {
    console.error('[doctorShare] createDoctorShare failed:', error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.token) return null;

  return {
    token: row.token,
    passcode: row.passcode,
    expiresAt: row.expires_at,
    url: buildDoctorShareUrl(row.token),
  };
}

export async function revokeDoctorShare(linkId: string): Promise<boolean> {
  const { error } = await supabase
    .from('doctor_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', linkId);
  if (error) console.error('[doctorShare] revokeDoctorShare failed:', error.message);
  return !error;
}

// ---------------------------------------------------------------------------
// Notes coming back
// ---------------------------------------------------------------------------

/**
 * Structured follow-ups the clinician can attach alongside his sentence.
 * Advisory only — `noteText` is the authoritative instruction, and nothing
 * here may contradict or stand in for it.
 */
export type DoctorAction =
  | { type: 'recheck'; test: string; inWeeks: number }
  | { type: 'followup'; inWeeks: number }
  | { type: 'supplement'; product: string; action: 'start' | 'continue' | 'stop' };

export interface DoctorNote {
  id: string;
  doctorName: string;
  doctorClinic: string | null;
  doctorRegistration: string | null;
  /** Verbatim. Never summarise, rephrase, translate, or send this to a model. */
  noteText: string;
  actions: DoctorAction[];
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt: string | null;
}

function mapNote(row: any): DoctorNote {
  return {
    id: row.id,
    doctorName: row.doctor_name,
    doctorClinic: row.doctor_clinic,
    doctorRegistration: row.doctor_registration,
    noteText: row.note_text,
    actions: Array.isArray(row.actions) ? row.actions : [],
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

/** Everything she hasn't answered yet — the confirmation prompt. */
export async function fetchPendingDoctorNotes(): Promise<DoctorNote[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('doctor_notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapNote);
}

/** Notes she has confirmed — these are what show in Plan. */
export async function fetchAcceptedDoctorNotes(limit = 5): Promise<DoctorNote[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('doctor_notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapNote);
}

/**
 * Her verdict on a pending note. Only `status` moves — a database trigger
 * rejects any UPDATE that touches the content, so what the clinician wrote
 * reads the same in a year as it did the day he wrote it.
 */
export async function respondToDoctorNote(
  noteId: string,
  status: 'accepted' | 'declined',
): Promise<boolean> {
  const { error } = await supabase
    .from('doctor_notes')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', noteId);
  if (error) console.error('[doctorShare] respondToDoctorNote failed:', error.message);
  return !error;
}
