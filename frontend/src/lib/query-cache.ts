/**
 * Rove Health — React Query Cache Configuration
 *
 * SAFETY RULES
 * ─────────────
 *  • IndexedDB key is scoped per user: `rove-query-cache-v1:{userId}`
 *  • Only truly public data (articles) is persisted to disk.
 *  • Dashboard, insights, plan, and tracker data stay memory-only
 *    because they contain cycle settings, period logs, notes,
 *    biometric data, and symptom details.
 *  • The persisted cache expires after 12 hours.
 *  • Background refetch always fires after showing persisted data.
 */

import { QueryClient, type Query } from '@tanstack/react-query';
import { get, set, del, keys } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

// ─── IndexedDB key prefix ───────────────────────────────────────────
const IDB_KEY_PREFIX = 'rove-query-cache-v1';

/**
 * Builds a user-scoped IndexedDB key.
 * If no userId is provided, returns the bare prefix (used for cleanup).
 */
function getIdbKey(userId?: string): string {
  return userId ? `${IDB_KEY_PREFIX}:${userId}` : IDB_KEY_PREFIX;
}

// ─── Persist allowlist: ONLY public/non-sensitive data ──────────────
//
// We intentionally do NOT persist:
//   dashboard  — contains cycle settings, monthLogs (period dates)
//   insights   — contains recentNote, symptomsByPhase
//   plan       — contains monthLogs, weight, height, lifestyle
//   trackerData — contains daily symptom/mood/period logs
//   chat, profile, onboarding, auth — sensitive by definition
//
const PERSIST_ALLOWLIST = new Set([
  'articles',  // public learn content — safe to persist
]);

/**
 * Returns true only for queries whose first key segment is in the
 * allowlist AND the query succeeded.
 */
export function shouldDehydrateQuery(query: Query): boolean {
  const firstKey = query.queryKey[0];
  if (typeof firstKey !== 'string') return false;
  return PERSIST_ALLOWLIST.has(firstKey) && query.state.status === 'success';
}

// ─── QueryClient factory ────────────────────────────────────────────
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,        // 5 min — tab switch is instant
        gcTime: 24 * 60 * 60 * 1000,      // 24 hr — keep in memory for persister
        refetchOnWindowFocus: true,        // refresh when user returns to tab
        retry: 1,
      },
    },
  });
}

// ─── User-scoped IndexedDB Persister ────────────────────────────────
export function createIdbPersister(userId: string): Persister {
  const key = getIdbKey(userId);
  return {
    persistClient: async (client: PersistedClient) => {
      await set(key, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(key);
    },
    removeClient: async () => {
      await del(key);
    },
  };
}

// ─── Logout / cleanup helpers ───────────────────────────────────────

/**
 * Call from every sign-out handler BEFORE supabase.auth.signOut().
 * Wipes both in-memory React Query cache and the persisted IDB store.
 */
export async function clearRoveQueryCache(queryClient?: QueryClient) {
  queryClient?.cancelQueries();
  queryClient?.clear();

  // Remove ALL user-scoped caches (covers current + any stale user keys)
  try {
    const allKeys = await keys();
    for (const k of allKeys) {
      if (typeof k === 'string' && k.startsWith(IDB_KEY_PREFIX)) {
        await del(k);
      }
    }
  } catch {
    // IndexedDB might be unavailable (SSR, private browsing edge cases)
  }
}

/**
 * Nuclear option — removes every Rove query cache from IndexedDB.
 * Used for "Clear local data on this device" setting.
 */
export async function removeAllRoveQueryCaches() {
  try {
    const allKeys = await keys();
    for (const k of allKeys) {
      if (typeof k === 'string' && k.startsWith(IDB_KEY_PREFIX)) {
        await del(k);
      }
    }
  } catch {
    // Silently fail in environments without IndexedDB
  }
}
