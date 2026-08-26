/**
 * Mirrors the inline phaseThemes / PHASE_SNAPSHOTS / PHASE_KEYWORDS / PHASE_EXPLAINERS
 * constants in frontend/src/app/cycle-sync/page.tsx. Kept as a local copy (not moved to
 * shared/) because the web version isn't exported/reusable there either — this is
 * screen-local presentation data, not shared business logic.
 */

export type PhaseThemeTokens = {
  color: string;
  /** Same hue as `color`, darkened to clear 4.5:1 contrast against the app's
   * cream backgrounds. `color` itself only hits 2.2-3.9:1 depending on phase,
   * which is fine for dots/gradients/tints but fails WCAG AA as text — use
   * this instead anywhere the phase color renders as actual text. */
  textColor: string;
  blob: string;
  /** Snapshot-card background tint. Mirrors the web page's actual computed value
   * (`theme.blob` run through a `/30`→`/5` opacity swap, `/10` left unchanged for
   * Menstrual) — NOT the same as iconBg, which is ~2-4x more saturated and meant
   * for small icon-badge containers, not full card backgrounds. */
  cardTint: string;
  orbRingColors: readonly [string, string, ...string[]];
  badgeBorder: string;
  iconBg: string;
  iconColor: string;
  gradientColors: readonly [string, string, ...string[]];
  borderColor: string;
  bgGradient: readonly [string, string, ...string[]];
};

export const phaseThemes: Record<string, PhaseThemeTokens> = {
  Menstrual: {
    color: '#AF6B6B',
    textColor: '#A75D5D',
    blob: 'rgba(175, 107, 107, 0.1)',
    cardTint: 'rgba(175, 107, 107, 0.28)',
    orbRingColors: ['rgba(175, 107, 107, 0.4)', 'rgba(255, 255, 255, 1)', 'rgba(175, 107, 107, 0.2)'],
    badgeBorder: 'rgba(175, 107, 107, 0.2)',
    iconBg: 'rgba(175, 107, 107, 0.1)',
    iconColor: '#AF6B6B',
    gradientColors: ['#E2C3C3', '#FFFFFF'],
    borderColor: 'rgba(175, 107, 107, 0.15)',
    bgGradient: ['rgba(175, 107, 107, 0.05)', 'rgba(255, 255, 255, 0)'],
  },
  Follicular: {
    color: '#8DAA9D',
    textColor: '#577568',
    blob: 'rgba(141, 170, 157, 0.3)',
    cardTint: 'rgba(141, 170, 157, 0.24)',
    orbRingColors: ['rgba(141, 170, 157, 0.6)', 'rgba(255, 255, 255, 1)', 'rgba(141, 170, 157, 0.3)'],
    badgeBorder: 'rgba(141, 170, 157, 0.3)',
    iconBg: 'rgba(141, 170, 157, 0.2)',
    iconColor: '#8DAA9D',
    gradientColors: ['#CDE0D7', '#FFFFFF'],
    borderColor: 'rgba(141, 170, 157, 0.15)',
    bgGradient: ['rgba(141, 170, 157, 0.2)', 'rgba(255, 255, 255, 0)'],
  },
  Ovulatory: {
    color: '#D4A25F',
    textColor: '#996929',
    blob: 'rgba(212, 162, 95, 0.3)',
    cardTint: 'rgba(212, 162, 95, 0.24)',
    orbRingColors: ['rgba(212, 162, 95, 0.6)', 'rgba(255, 255, 255, 1)', 'rgba(212, 162, 95, 0.3)'],
    badgeBorder: 'rgba(212, 162, 95, 0.3)',
    iconBg: 'rgba(212, 162, 95, 0.2)',
    iconColor: '#D4A25F',
    gradientColors: ['#E8D6BD', '#FFFFFF'],
    borderColor: 'rgba(212, 162, 95, 0.15)',
    bgGradient: ['rgba(212, 162, 95, 0.2)', 'rgba(255, 255, 255, 0)'],
  },
  Luteal: {
    color: '#7B82A8',
    textColor: '#68709C',
    blob: 'rgba(123, 130, 168, 0.3)',
    cardTint: 'rgba(123, 130, 168, 0.24)',
    orbRingColors: ['rgba(123, 130, 168, 0.6)', 'rgba(255, 255, 255, 1)', 'rgba(123, 130, 168, 0.4)'],
    badgeBorder: 'rgba(123, 130, 168, 0.3)',
    iconBg: 'rgba(123, 130, 168, 0.2)',
    iconColor: '#7B82A8',
    gradientColors: ['#E5E7F0', '#FFFFFF'],
    borderColor: 'rgba(123, 130, 168, 0.15)',
    bgGradient: ['rgba(123, 130, 168, 0.2)', 'rgba(255, 255, 255, 0)'],
  },
};

// PHASE_KEYWORDS / PHASE_EXPLAINERS / PHASE_SNAPSHOTS used to live here as
// hardcoded English strings — that meant the cycle-sync Home screen never
// went through i18next at all, so Hindi users saw English regardless of
// their language setting (unlike the TTC Home screen, which was localized
// from the start via home.json). Moved to home.json's `phases.<PhaseName>`
// tree (en + hi) so it's translated like everything else — see
// getPhaseKeyword/getPhaseExplainer/getPhaseSnapshot below, which read
// through `t()` instead of importing a static object.

export type SnapshotEntry = { title: string; desc: string; detail: string; protocol: string };
export type PhaseSnapshot = { hormones: SnapshotEntry; mind: SnapshotEntry; body: SnapshotEntry; skin: SnapshotEntry };

import type { TFunction } from 'i18next';

const DEFAULT_PHASE = 'Follicular';

export function getPhaseKeyword(phase: string | undefined, t: TFunction): string {
  return t(`home.phases.${phase && phaseThemes[phase] ? phase : DEFAULT_PHASE}.keyword`);
}

export function getPhaseExplainer(phase: string | undefined, t: TFunction): string {
  return t(`home.phases.${phase && phaseThemes[phase] ? phase : DEFAULT_PHASE}.explainer`);
}

export function getPhaseSnapshot(phase: string | undefined, t: TFunction): PhaseSnapshot {
  return t(`home.phases.${phase && phaseThemes[phase] ? phase : DEFAULT_PHASE}.snapshot`, { returnObjects: true }) as PhaseSnapshot;
}
