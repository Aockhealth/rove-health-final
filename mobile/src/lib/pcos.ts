/**
 * PCOS is captured several different ways depending on when the user
 * onboarded and which term the UI used at the time: as a goal chip ('pcos'),
 * as a free-text health condition ('PCOS'), or as a structured condition
 * picker entry ('PMOS' — the in-app content library standardized on this
 * spelling; see the PMOS learn-article seed). Any of them count.
 *
 * Single source of truth — was previously reimplemented inline in dashboard.ts,
 * plan.ts, insights.ts and healthReport.ts, which risked the four checks
 * drifting apart and PCOS-gated content showing inconsistently across pages.
 */
function isPcosLike(value: unknown): boolean {
  const lower = String(value).toLowerCase();
  return lower.includes('pcos') || lower.includes('pmos');
}

export function hasPcosFlag(goals: unknown, conditions: unknown): boolean {
  const toLower = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
  return [...toLower(goals), ...toLower(conditions)].some(isPcosLike);
}

/**
 * Strips any legacy 'pcos' goal entry (see hasPcosFlag's doc comment) from a
 * goals list. Used when a user removes PCOS/PMOS from Health Passport's
 * conditions picker so the old goal-chip era doesn't leave a stale flag that
 * keeps PCOS-gated content (like Tracker's fertility card) showing after
 * she thought she'd turned it off.
 */
export function withoutLegacyPcosGoal(goals: string[]): string[] {
  return goals.filter((g) => !isPcosLike(g));
}
