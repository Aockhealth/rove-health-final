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
 * @module mobile/src/lib/ttcEngine
 */

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

export interface TtcStateMeta {
  key: TtcStateKey;
  color: string;
  colorLight: string;
  colorText: string;
  /** Short label in the Home orb's center. */
  orbTitle: string;
  /** Short, non-day-specific action prompt under the Home status card. Pair with `signal.explanation` for the dynamic part. */
  actionLabel: string;
  ring: TtcRingVisual;
  /** Plan: true when the estimate is too diffuse to time — the week strip drops away for a "paused" note instead. */
  gated: boolean;
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

export const TTC_STATE_META: Record<TtcStateKey, TtcStateMeta> = {
  insufficient: {
    key: 'insufficient',
    color: '#B7AFA6',
    colorLight: '#F1EFEC',
    colorText: '#6E6862',
    orbTitle: 'Learning',
    actionLabel: 'Log your period to begin',
    ring: { arcFraction: 0, arcDashed: true, haloWidth: 42, haloOpacity: 0.12, haloBlur: 22 },
    gated: true,
    gateReason: 'There is no cycle history to work from yet.',
    timingKicker: 'While we learn your cycle',
    timingTitle: 'Steady habits, no timing yet',
    timingBody:
      "We haven't seen enough of your cycle to time anything, and we'd rather say that than put a day in front of you.",
    focus: [
      'Log the first day of your next period — that unlocks everything else',
      'Ask your doctor which preconception multivitamin fits you',
      'Keep meals and sleep on a regular rhythm while we watch a cycle',
    ],
    moveIntro: 'Nothing here is timed to a cycle day — this is the steady week.',
  },
  predicted: {
    key: 'predicted',
    color: '#D4A25F',
    colorLight: '#F3E7D3',
    colorText: '#8B6A2E',
    orbTitle: 'Predicted',
    actionLabel: 'Testing window ahead',
    ring: { arcFraction: 0.45, arcDashed: false, haloWidth: 20, haloOpacity: 0.16, haloBlur: 12 },
    gated: false,
    gateReason: '',
    timingKicker: 'Ovulation window ahead',
    timingTitle: 'Start testing, start trying',
    timingBody:
      'This is an estimate from your cycle lengths, not something observed. Treat the window as wide until a signal narrows it.',
    focus: [
      'Test LH once daily, early afternoon',
      'Intercourse every one to two days across the window beats aiming at a single day',
      'Take a waking temperature each morning — it is what confirms afterwards',
    ],
    moveIntro: 'Ordinary week — keep intensity where it usually sits.',
  },
  surge: {
    key: 'surge',
    color: '#C97B7B',
    colorLight: '#F5E8E8',
    colorText: '#9C4F4F',
    orbTitle: 'Surging',
    actionLabel: 'Peak fertility — test and try',
    ring: { arcFraction: 0.9, arcDashed: false, haloWidth: 8, haloOpacity: 0.22, haloBlur: 6 },
    gated: false,
    gateReason: '',
    timingKicker: 'LH surging',
    timingTitle: 'Today and tomorrow matter most',
    timingBody: 'A surge is the clearest read in the cycle. It predicts ovulation; it does not confirm one happened.',
    focus: [
      'Today and tomorrow are the two days that matter most',
      'Keep testing until the band fades, so the peak can be dated',
      'Take a waking temperature tomorrow — a shift is how this gets confirmed',
    ],
    moveIntro: 'Keep it easy for a day or two if that suits you — there is no evidence it changes the outcome either way.',
  },
  likely_confirmed: {
    key: 'likely_confirmed',
    color: '#7FB0A0',
    colorLight: '#E7F2EE',
    colorText: '#3F6E5E',
    orbTitle: 'Likely confirmed',
    actionLabel: 'One signal confirms it',
    ring: { arcFraction: 0.7, arcDashed: false, haloWidth: 16, haloOpacity: 0.14, haloBlur: 10 },
    gated: false,
    gateReason: '',
    timingKicker: 'Window likely closed',
    timingTitle: 'One signal says ovulation happened',
    timingBody:
      'A sustained temperature shift places ovulation. One lagging signal dates it; it cannot corroborate itself.',
    focus: [
      'Nothing left to time this cycle',
      'Keep the waking temperature going — the shift has to hold to mean anything',
      'A wearable or ovulation test would add the second independent signal full confirmation needs',
    ],
    moveIntro: 'Back to whatever your normal week looks like.',
  },
  confirmed: {
    key: 'confirmed',
    color: '#5B9A8B',
    colorLight: '#E0F0ED',
    colorText: '#3F6E5E',
    orbTitle: 'Confirmed',
    actionLabel: 'Fertile window closed',
    ring: { arcFraction: 1, arcDashed: false, haloWidth: 0, haloOpacity: 0, haloBlur: 0 },
    gated: false,
    gateReason: '',
    timingKicker: 'Ovulation confirmed',
    timingTitle: 'Fertile window closed',
    timingBody: 'Two independent signals agree on the day. Your cycle showed an ovulatory signature.',
    focus: [
      'Nothing to time until your next period',
      'Keep logging temperature through the luteal phase',
      'If your period is late, a test is reasonable',
    ],
    moveIntro: 'Back to whatever your normal week looks like.',
  },
  surge_unconfirmed: {
    key: 'surge_unconfirmed',
    color: '#B58F52',
    colorLight: '#F1E7D6',
    colorText: '#7A5F2E',
    orbTitle: 'Unconfirmed',
    actionLabel: 'Signals disagree',
    ring: { arcFraction: 0.55, arcDashed: true, haloWidth: 24, haloOpacity: 0.16, haloBlur: 14 },
    gated: true,
    gateReason: 'A surge appeared but no shift confirmed it, so we cannot place the day.',
    timingKicker: 'Signals disagree',
    timingTitle: 'A surge, but no confirming shift',
    timingBody:
      "We saw the surge and then nothing followed it. We don't know what happened this cycle, and we'd rather say so.",
    focus: [
      'Keep testing — a late surge is possible',
      'Keep taking a waking temperature; a delayed shift would still show',
      'Worth mentioning at your next appointment, with your logged cycles',
    ],
    moveIntro: 'Nothing here is timed to a cycle day — this is the steady week.',
  },
  anovulatory: {
    key: 'anovulatory',
    color: '#7B82A8',
    colorLight: '#ECEEF5',
    colorText: '#565C82',
    orbTitle: 'No pattern found',
    actionLabel: 'No pattern this cycle',
    ring: { arcFraction: 0.25, arcDashed: true, haloWidth: 30, haloOpacity: 0.12, haloBlur: 18 },
    gated: true,
    gateReason: 'No ovulatory signature was found this cycle.',
    timingKicker: 'No ovulatory signature this cycle',
    timingTitle: 'Information, not failure',
    timingBody: 'This cycle did not show an ovulation pattern. One cycle on its own is common and is not a diagnosis.',
    focus: [
      'Nothing to time — keep logging as normal',
      'Bring these logged cycles to a doctor if it happens again',
      'The habits below matter more across months than any single cycle',
    ],
    moveIntro: 'Nothing here is timed to a cycle day — this is the steady week.',
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

export function getTtcStateMeta(signal: OvulationSignal): TtcStateMeta {
  return TTC_STATE_META[deriveTtcState(signal)];
}

export const TTC_METHOD_LABEL: Record<OvulationSignal['method'], string> = {
  combined: 'Temperature + test',
  bbt_only: 'Temperature',
  opk_only: 'Ovulation test',
  date_math: 'Cycle dates',
};

export const TTC_CONFIDENCE_LABEL: Record<OvulationSignal['confidence'], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const TTC_OPK_LABEL: Record<'negative' | 'low' | 'high' | 'peak', string> = {
  negative: 'Negative',
  low: 'Low',
  high: 'High',
  peak: 'Peak',
};
