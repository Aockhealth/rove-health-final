import { computePmosPatternScore } from '../pmosScore';

describe('computePmosPatternScore', () => {
  it('marks every indicator unassessable with no data at all', () => {
    const score = computePmosPatternScore({ cycleLengths: [] });
    expect(score.assessableCount).toBe(0);
    expect(score.flaggedCount).toBe(0);
    expect(score.indicators.every((i) => !i.assessable)).toBe(true);
  });

  it('flags cycle irregularity from an out-of-range cycle', () => {
    const score = computePmosPatternScore({ cycleLengths: [28, 27, 40] });
    const indicator = score.indicators.find((i) => i.key === 'cycle_irregularity')!;
    expect(indicator.assessable).toBe(true);
    expect(indicator.flagged).toBe(true);
  });

  it('flags cycle irregularity from high variability even with in-range lengths', () => {
    const score = computePmosPatternScore({ cycleLengths: [21, 35, 21, 35] });
    const indicator = score.indicators.find((i) => i.key === 'cycle_irregularity')!;
    expect(indicator.assessable).toBe(true);
    expect(indicator.flagged).toBe(true);
  });

  it('does not flag a consistent, in-range cycle history', () => {
    const score = computePmosPatternScore({ cycleLengths: [28, 27, 29, 28] });
    const indicator = score.indicators.find((i) => i.key === 'cycle_irregularity')!;
    expect(indicator.assessable).toBe(true);
    expect(indicator.flagged).toBe(false);
  });

  it('leaves anovulatory signals unassessable with no BBT data', () => {
    const score = computePmosPatternScore({ cycleLengths: [28, 27, 29], anovulatoryAssessment: null });
    const indicator = score.indicators.find((i) => i.key === 'anovulatory_signals')!;
    expect(indicator.assessable).toBe(false);
  });

  it('flags anovulatory signals when at least half of assessed cycles showed a pattern', () => {
    const score = computePmosPatternScore({
      cycleLengths: [28, 27, 29],
      anovulatoryAssessment: { flaggedCycles: 2, totalCycles: 3 },
    });
    const indicator = score.indicators.find((i) => i.key === 'anovulatory_signals')!;
    expect(indicator.assessable).toBe(true);
    expect(indicator.flagged).toBe(true);
  });

  it('leaves BMI unassessable with no weight/height logged', () => {
    const score = computePmosPatternScore({ cycleLengths: [28, 27, 29], bmi: null });
    const indicator = score.indicators.find((i) => i.key === 'bmi')!;
    expect(indicator.assessable).toBe(false);
  });

  it('flags BMI at or above the Asian-cutoff threshold', () => {
    const score = computePmosPatternScore({ cycleLengths: [28, 27, 29], bmi: 24 });
    const indicator = score.indicators.find((i) => i.key === 'bmi')!;
    expect(indicator.assessable).toBe(true);
    expect(indicator.flagged).toBe(true);
  });

  it('does not flag BMI below the threshold', () => {
    const score = computePmosPatternScore({ cycleLengths: [28, 27, 29], bmi: 21 });
    const indicator = score.indicators.find((i) => i.key === 'bmi')!;
    expect(indicator.flagged).toBe(false);
  });

  it('totals flaggedCount and assessableCount across all three indicators', () => {
    const score = computePmosPatternScore({
      cycleLengths: [21, 40, 24, 33],
      anovulatoryAssessment: { flaggedCycles: 3, totalCycles: 4 },
      bmi: 26,
    });
    expect(score.assessableCount).toBe(3);
    expect(score.flaggedCount).toBe(3);
  });
});
