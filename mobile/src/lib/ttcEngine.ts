/**
 * TTC state-engine: maps the real 5-status `OvulationSignal` (see
 * `@shared/cycle/ttc`) onto the richer 7-bucket presentation used across the
 * TTC-mode Home, Plan and Insights screens, plus the copy/visuals each bucket
 * needs.
 *
 * The 7 buckets come from the imported design (claude.ai/design project
 * "TTC mode home screen"). The design's own STATE_META objects invent
 * demo-specific numbers ("Day 12", "3 days", literal week-strip arrays) that
 * don't exist in the real engine — those are left out here and computed by
 * each screen from the real `OvulationSignal` fields instead, so nothing
 * shown is fabricated.
 *
 * All display text is resolved through i18next (see `src/locales`) rather
 * than stored as literal strings here — callers pass their `t` function in,
 * since this module has no component of its own to hook `useTranslation`
 * into.
 *
 * @module mobile/src/lib/ttcEngine
 */

import type { TFunction } from 'i18next';
import type { OvulationSignal } from '@shared/cycle/ttc';

export type TtcStateKey =
  | 'insufficient'
  | 'predicted'
  | 'surge'
  | 'likely_confirmed'
  | 'confirmed'
  | 'surge_unconfirmed'
  | 'anovulatory';

export interface TtcRingVisual {
  /** Progress-arc fill, 0-1. Ignored (rendered as a soft dashed ring) when `arcDashed` is true. */
  arcFraction: number;
  /** True for the three "diffuse estimate" buckets, where a precise fill would overstate confidence. */
  arcDashed: boolean;
  haloWidth: number;
  haloOpacity: number;
  haloBlur: number;
}

export interface TtcStateVisual {
  key: TtcStateKey;
  color: string;
  colorLight: string;
  colorText: string;
  ring: TtcRingVisual;
  /** Plan: true when the estimate is too diffuse to time — the week strip drops away for a "paused" note instead. */
  gated: boolean;
}

export interface TtcStateMeta extends TtcStateVisual {
  /** Short label in the Home orb's center. */
  orbTitle: string;
  /** Short, non-day-specific action prompt under the Home status card. Pair with `signal.explanation` for the dynamic part. */
  actionLabel: string;
  gateReason: string;
  timingKicker: string;
  timingTitle: string;
  /** Plan timing-card body. Generic per-bucket framing; day-specific detail comes from `signal.explanation`. */
  timingBody: string;
  /** 3 focus bullets for the Plan timing card. Deliberately free of specific day numbers — those come from the real week strip. */
  focus: string[];
  /** Plan Move-tab intro line for this bucket. */
  moveIntro: string;
}

export const TTC_STATE_VISUALS: Record<TtcStateKey, TtcStateVisual> = {
  insufficient: {
    key: 'insufficient',
    color: '#B7AFA6',
    colorLight: '#F1EFEC',
    colorText: '#6E6862',
    ring: { arcFraction: 0, arcDashed: true, haloWidth: 42, haloOpacity: 0.12, haloBlur: 22 },
    gated: true,
  },
  predicted: {
    key: 'predicted',
    color: '#D4A25F',
    colorLight: '#F3E7D3',
    colorText: '#8B6A2E',
    ring: { arcFraction: 0.45, arcDashed: false, haloWidth: 20, haloOpacity: 0.16, haloBlur: 12 },
    gated: false,
  },
  surge: {
    key: 'surge',
    color: '#C97B7B',
    colorLight: '#F5E8E8',
    colorText: '#9C4F4F',
    ring: { arcFraction: 0.9, arcDashed: false, haloWidth: 8, haloOpacity: 0.22, haloBlur: 6 },
    gated: false,
  },
  likely_confirmed: {
    key: 'likely_confirmed',
    color: '#7FB0A0',
    colorLight: '#E7F2EE',
    colorText: '#3F6E5E',
    ring: { arcFraction: 0.7, arcDashed: false, haloWidth: 16, haloOpacity: 0.14, haloBlur: 10 },
    gated: false,
  },
  confirmed: {
    key: 'confirmed',
    color: '#5B9A8B',
    colorLight: '#E0F0ED',
    colorText: '#3F6E5E',
    ring: { arcFraction: 1, arcDashed: false, haloWidth: 0, haloOpacity: 0, haloBlur: 0 },
    gated: false,
  },
  surge_unconfirmed: {
    key: 'surge_unconfirmed',
    color: '#B58F52',
    colorLight: '#F1E7D6',
    colorText: '#7A5F2E',
    ring: { arcFraction: 0.55, arcDashed: true, haloWidth: 24, haloOpacity: 0.16, haloBlur: 14 },
    gated: true,
  },
  anovulatory: {
    key: 'anovulatory',
    color: '#7B82A8',
    colorLight: '#ECEEF5',
    colorText: '#565C82',
    ring: { arcFraction: 0.25, arcDashed: true, haloWidth: 30, haloOpacity: 0.12, haloBlur: 18 },
    gated: true,
  },
};

/**
 * Maps the real 5-status engine output onto the design's 7 buckets.
 *
 * `anovulatory.detected` outranks status, matching how `detectOvulation`
 * itself treats it (an anovulatory hint outranks a bare date guess). The one
 * subtlety: `anovulatory` can appear alongside `status: 'ovulation_likely'`
 * (a surge was seen, but the cycle has since run late enough with no thermal
 * shift to trip `no_thermal_shift_late_in_cycle`) — that combination is
 * exactly what "surge, unconfirmed" means, so it's handled first.
 */
export function deriveTtcState(signal: OvulationSignal): TtcStateKey {
  if (signal.anovulatory?.detected) {
    return signal.status === 'ovulation_likely' ? 'surge_unconfirmed' : 'anovulatory';
  }

  switch (signal.status) {
    case 'insufficient_data':
      return 'insufficient';
    case 'ovulation_confirmed':
      return signal.method === 'combined' ? 'confirmed' : 'likely_confirmed';
    case 'ovulation_likely':
      return 'surge';
    case 'fertile_window':
    case 'monitoring':
    default:
      return 'predicted';
  }
}

export function getTtcStateMetaByKey(key: TtcStateKey, t: TFunction): TtcStateMeta {
  return {
    ...TTC_STATE_VISUALS[key],
    orbTitle: t(`ttcEngine.states.${key}.orbTitle`),
    actionLabel: t(`ttcEngine.states.${key}.actionLabel`),
    gateReason: t(`ttcEngine.states.${key}.gateReason`),
    timingKicker: t(`ttcEngine.states.${key}.timingKicker`),
    timingTitle: t(`ttcEngine.states.${key}.timingTitle`),
    timingBody: t(`ttcEngine.states.${key}.timingBody`),
    focus: t(`ttcEngine.states.${key}.focus`, { returnObjects: true }) as string[],
    moveIntro: t(`ttcEngine.states.${key}.moveIntro`),
  };
}

export function getTtcStateMeta(signal: OvulationSignal, t: TFunction): TtcStateMeta {
  return getTtcStateMetaByKey(deriveTtcState(signal), t);
}

export function getTtcMethodLabel(method: OvulationSignal['method'], t: TFunction): string {
  return t(`ttcEngine.method.${method}`);
}

export function getTtcConfidenceLabel(confidence: OvulationSignal['confidence'], t: TFunction): string {
  return t(`ttcEngine.confidence.${confidence}`);
}

/** "High confidence" style combined phrase, kept as its own key set so word order can differ by language. */
export function getTtcConfidenceWithLabel(confidence: OvulationSignal['confidence'], t: TFunction): string {
  return t(`ttcEngine.confidenceWithLabel.${confidence}`);
}

export function getTtcOpkLabel(result: 'negative' | 'low' | 'high' | 'peak', t: TFunction): string {
  return t(`ttcEngine.opk.${result}`);
}

/**
 * Labels for the graded LH strip picker, index-matched to band_level (0 to
 * LH_BAND_LEVELS - 1 from @shared/cycle/lh). Must stay the same length as
 * that constant — the wording is specific to each grade, unlike the
 * algorithm, which is written generically against the count.
 */
export function getLhBandLabels(t: TFunction): string[] {
  return t('ttcEngine.lhBand', { returnObjects: true }) as string[];
}

export function getWeekStripDow(t: TFunction): string[] {
  return t('ttcEngine.weekStrip.dow', { returnObjects: true }) as string[];
}

export function getWeekStripMarkLabel(mark: 'test' | 'try' | 'rest' | 'none', t: TFunction): string {
  return t(`ttcEngine.weekStrip.marks.${mark}`);
}

export function getWeekStripCaption(key: TtcStateKey, t: TFunction): string {
  if (key !== 'predicted' && key !== 'surge' && key !== 'likely_confirmed' && key !== 'confirmed') return '';
  return t(`ttcEngine.weekStrip.captions.${key}`);
}
