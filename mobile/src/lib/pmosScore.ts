/**
 * Composite PMOS-pattern score — combines a few things Rove already collects
 * (cycle-length irregularity, an anovulatory-signal read when BBT/OPK data
 * exists, BMI) into one educational count. Framed the same careful,
 * non-diagnostic way as the existing anovulatory-pattern card: this states
 * what her logged patterns show, never a risk level or a diagnosis. Each
 * indicator only counts toward the score if there's enough data to actually
 * judge it — a missing signal reads as "not enough data yet," never as a
 * quiet "no."
 *
 * @module mobile/src/lib/pmosScore
 */

// Cycles shorter than this (oligomenorrhea territory) or longer than this
// are the commonly-cited irregular-cycle thresholds.
const SHORT_CYCLE_DAYS = 21;
const LONG_CYCLE_DAYS = 35;
// Variability beyond this many days (stdev across her own logged cycles)
// reads as "irregular" even if no single cycle crosses the short/long line.
const HIGH_VARIABILITY_DAYS = 8;

const MIN_CYCLES_FOR_IRREGULARITY_CHECK = 3;

// WHO Asian-population BMI cutoff (≥23 "overweight") — more clinically
// appropriate for an Indian user base than the Western ≥25 cutoff.
const ASIAN_OVERWEIGHT_BMI = 23;

export type PmosIndicatorKey = 'cycle_irregularity' | 'anovulatory_signals' | 'bmi';

export interface PmosIndicatorResult {
  key: PmosIndicatorKey;
  label: string;
  assessable: boolean;
  flagged: boolean;
  detail: string;
}

export interface PmosPatternScore {
  flaggedCount: number;
  assessableCount: number;
  indicators: PmosIndicatorResult[];
}

function stdDev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function assessCycleIrregularity(cycleLengths: number[]): PmosIndicatorResult {
  if (cycleLengths.length < MIN_CYCLES_FOR_IRREGULARITY_CHECK) {
    return {
      key: 'cycle_irregularity',
      label: 'Cycle regularity',
      assessable: false,
      flagged: false,
      detail: `Log ${MIN_CYCLES_FOR_IRREGULARITY_CHECK}+ cycles to assess this.`,
    };
  }

  const outOfRangeCount = cycleLengths.filter((l) => l < SHORT_CYCLE_DAYS || l > LONG_CYCLE_DAYS).length;
  const avg = cycleLengths.reduce((s, v) => s + v, 0) / cycleLengths.length;
  const variability = stdDev(cycleLengths, avg);
  const flagged = outOfRangeCount > 0 || variability > HIGH_VARIABILITY_DAYS;

  return {
    key: 'cycle_irregularity',
    label: 'Cycle regularity',
    assessable: true,
    flagged,
    detail: flagged
      ? outOfRangeCount > 0
        ? `${outOfRangeCount} of your last ${cycleLengths.length} cycles ran shorter than ${SHORT_CYCLE_DAYS} or longer than ${LONG_CYCLE_DAYS} days.`
        : `Your cycle lengths have varied by about ${Math.round(variability)} days across your logged history.`
      : `Your last ${cycleLengths.length} cycles have stayed within a fairly consistent range.`,
  };
}

function assessAnovulatorySignals(
  assessment: { flaggedCycles: number; totalCycles: number } | null
): PmosIndicatorResult {
  if (!assessment || assessment.totalCycles === 0) {
    return {
      key: 'anovulatory_signals',
      label: 'Ovulation signal patterns',
      assessable: false,
      flagged: false,
      detail: 'Log basal temperature to include this indicator.',
    };
  }

  const ratio = assessment.flaggedCycles / assessment.totalCycles;
  const flagged = ratio >= 0.5;

  return {
    key: 'anovulatory_signals',
    label: 'Ovulation signal patterns',
    assessable: true,
    flagged,
    detail: flagged
      ? `${assessment.flaggedCycles} of your last ${assessment.totalCycles} assessed cycles showed a pattern often discussed alongside PMOS (a test that never peaked, or no sustained temperature rise).`
      : `Most of your assessed cycles showed a typical ovulatory signature.`,
  };
}

function assessBmi(bmi: number | null | undefined): PmosIndicatorResult {
  if (!bmi || !Number.isFinite(bmi) || bmi <= 0) {
    return {
      key: 'bmi',
      label: 'BMI',
      assessable: false,
      flagged: false,
      detail: 'Add your weight and height in Health Passport to include this indicator.',
    };
  }

  const flagged = bmi >= ASIAN_OVERWEIGHT_BMI;
  return {
    key: 'bmi',
    label: 'BMI',
    assessable: true,
    flagged,
    detail: flagged
      ? `Your BMI (${bmi.toFixed(1)}) is in a range commonly discussed alongside PMOS.`
      : `Your BMI (${bmi.toFixed(1)}) is below the range commonly discussed alongside PMOS.`,
  };
}

export function computePmosPatternScore(input: {
  cycleLengths: number[];
  anovulatoryAssessment?: { flaggedCycles: number; totalCycles: number } | null;
  bmi?: number | null;
}): PmosPatternScore {
  const indicators = [
    assessCycleIrregularity(input.cycleLengths),
    assessAnovulatorySignals(input.anovulatoryAssessment ?? null),
    assessBmi(input.bmi),
  ];

  return {
    flaggedCount: indicators.filter((i) => i.assessable && i.flagged).length,
    assessableCount: indicators.filter((i) => i.assessable).length,
    indicators,
  };
}
