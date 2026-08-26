/**
 * Shareable, read-only partner link for TTC fertile-window status — a
 * token-based link (see the fertility_share_links migration and its
 * get_shared_fertility_status function), not a second Rove account for the
 * partner. Revocable by regenerating the token, which orphans the old one.
 *
 * @module mobile/src/lib/partnerShare
 */
import { supabase } from './supabase';

// TODO(founder): confirm the actual public host before shipping. This
// assumes a web route at /fertility/:token is deployed and reachable — see
// mobile/src/app/fertility/[token].tsx, which is the Expo Router page this
// URL is meant to resolve to. If that page isn't hosted on the web yet, the
// link only resolves for a partner who already has the Rove app installed
// (Expo Router serves the same route as an app deep link).
export const SHARE_BASE_URL = 'https://rovehealth.in/fertility/';

export function buildShareUrl(token: string): string {
  return `${SHARE_BASE_URL}${token}`;
}

export interface ShareLink {
  id: string;
  token: string;
  createdAt: string;
  lastViewedAt: string | null;
}

function mapRow(row: any): ShareLink {
  return { id: row.id, token: row.token, createdAt: row.created_at, lastViewedAt: row.last_viewed_at };
}

/** The current, non-revoked share link, if she's ever generated one. */
export async function getActiveShareLink(): Promise<ShareLink | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('fertility_share_links')
    .select('id, token, created_at, last_viewed_at')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

/** Revokes any existing link, then creates a fresh one — "regenerate" as one call, since a stale copied link should stop working the moment a new one exists. */
export async function createShareLink(): Promise<ShareLink | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await revokeAllShareLinks(user.id);

  const { data, error } = await supabase
    .from('fertility_share_links')
    .insert({ user_id: user.id })
    .select('id, token, created_at, last_viewed_at')
    .single();

  if (error || !data) {
    console.error('[partnerShare] createShareLink failed:', error?.message);
    return null;
  }
  return mapRow(data);
}

export async function revokeShareLink(linkId: string): Promise<boolean> {
  const { error } = await supabase
    .from('fertility_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', linkId);
  if (error) console.error('[partnerShare] revokeShareLink failed:', error.message);
  return !error;
}

async function revokeAllShareLinks(userId: string): Promise<void> {
  const { error } = await supabase
    .from('fertility_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
  if (error) console.error('[partnerShare] revokeAllShareLinks failed:', error.message);
}

export interface SharedFertilityStatus {
  status: string;
  confidence: string;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  confirmedDate: string | null;
  predictedDate: string | null;
  computedAt: string | null;
}

/**
 * The partner-facing read. Goes through get_shared_fertility_status only —
 * never queries fertility_share_links or ovulation_estimates directly, so an
 * unauthenticated visitor (this is called from a public page, no session)
 * can only ever reach the narrow subset that function returns.
 *
 * Null means either an unknown/revoked token or no TTC data logged yet —
 * deliberately indistinguishable, so a revoked link can't be used to probe
 * whether a token ever existed.
 */
export async function fetchSharedFertilityStatus(token: string): Promise<SharedFertilityStatus | null> {
  const { data, error } = await supabase.rpc('get_shared_fertility_status', { p_token: token });
  if (error) {
    console.error('[partnerShare] fetchSharedFertilityStatus failed:', error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;

  return {
    status: row.status,
    confidence: row.confidence,
    fertileWindowStart: row.fertile_window_start,
    fertileWindowEnd: row.fertile_window_end,
    confirmedDate: row.confirmed_date,
    predictedDate: row.predicted_date,
    computedAt: row.computed_at,
  };
}
