/**
 * Glycemic index (GI) categorization shared by the meal-logging flow.
 *
 * GI itself is estimated per logged meal by the estimate-meal-macros edge
 * function (same AI call already used for calories/macros — see
 * mobile/src/lib/nutrition.ts) and stored on the meal record, rather than
 * looked up from a fixed list — a free-text meal description ("dal, rice,
 * sabzi") doesn't map cleanly onto single foods a static table could cover.
 * This module only holds the shared Low/Medium/High banding, on the standard
 * clinical convention (Low ≤55, Medium 56–69, High ≥70, glucose=100 scale),
 * so the same colors/labels are used everywhere a GI value is shown.
 */

export type GiCategory = 'Low' | 'Medium' | 'High';

export function giCategory(gi: number): GiCategory {
  if (gi <= 55) return 'Low';
  if (gi <= 69) return 'Medium';
  return 'High';
}

export const GI_CATEGORY_COLOR: Record<GiCategory, string> = {
  Low: '#5B9A8B',
  Medium: '#D4A25F',
  High: '#AF6B6B',
};

export const GI_DISCLAIMER =
  'AI-estimated per meal, not a lab measurement. Treat as a general reference. Talk to your doctor or a dietitian before making changes for a diagnosed condition.';
