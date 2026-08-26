import { detectCycleAnomalies, MIN_CYCLES_FOR_ANOMALY_DETECTION } from '../anomaly';
import type { CycleHistoryEntry } from '../phase';

describe('detectCycleAnomalies', () => {
  it('returns [] with fewer than the minimum cycles', () => {
    const cycles: CycleHistoryEntry[] = [
      { start: '2026-01-01', length: 28 },
      { start: '2026-01-29', length: 27 },
    ];
    expect(detectCycleAnomalies(cycles)).toEqual([]);
  });

  it('returns [] when the history is perfectly regular (stdev 0)', () => {
    const cycles: CycleHistoryEntry[] = Array.from({ length: 5 }, (_, i) => ({
      start: `2026-0${i + 1}-01`,
      length: 28,
    }));
    expect(detectCycleAnomalies(cycles)).toEqual([]);
  });

  it('flags a cycle that deviates well beyond her personal stdev', () => {
    const cycles: CycleHistoryEntry[] = [
      { start: '2026-01-01', length: 28 },
      { start: '2026-01-29', length: 27 },
      { start: '2026-02-25', length: 29 },
      { start: '2026-03-26', length: 28 },
      { start: '2026-04-23', length: 45 }, // way out of line
    ];
    const anomalies = detectCycleAnomalies(cycles);
    expect(anomalies.length).toBe(1);
    expect(anomalies[0].start).toBe('2026-04-23');
    expect(anomalies[0].length).toBe(45);
    expect(anomalies[0].zScore).toBeGreaterThan(1.5);
  });

  it('sorts flagged anomalies most-recent-first', () => {
    // Five regular 28-day cycles plus one long and one short outlier — needs
    // enough tight-cluster cycles that the two outliers don't inflate the
    // sample stdev enough to mask each other's z-score.
    const cycles: CycleHistoryEntry[] = [
      { start: '2026-01-01', length: 28 },
      { start: '2026-01-29', length: 28 },
      { start: '2026-02-26', length: 60 },
      { start: '2026-04-27', length: 28 },
      { start: '2026-05-25', length: 28 },
      { start: '2026-06-22', length: 28 },
      { start: '2026-07-20', length: 4 },
    ];
    const anomalies = detectCycleAnomalies(cycles);
    expect(anomalies.length).toBe(2);
    expect(anomalies[0].start).toBe('2026-07-20');
    expect(anomalies[1].start).toBe('2026-02-26');
  });

  it('explains a flagged cycle from the disruptor tag that stands out most', () => {
    const cycles: CycleHistoryEntry[] = [
      { start: '2026-01-01', length: 28 },
      { start: '2026-01-29', length: 27 },
      { start: '2026-02-25', length: 29 },
      { start: '2026-03-26', length: 28 },
      { start: '2026-04-23', length: 45 },
    ];
    // Written out as literal local dates, the way daily_logs.date actually
    // stores them. Building this fixture with toISOString() (as it used to)
    // shifted it by the same day the implementation was shifting by, so the
    // two cancelled out and the test passed against a real IST off-by-one.
    const disruptorsByDate: Record<string, string[]> = {
      '2026-04-23': ['High stress event'], '2026-04-24': ['High stress event'],
      '2026-04-25': ['High stress event'], '2026-04-26': ['High stress event'],
      '2026-04-27': ['High stress event'], '2026-04-28': ['High stress event'],
      '2026-04-29': ['High stress event'], '2026-04-30': ['High stress event'],
      '2026-05-01': ['High stress event'], '2026-05-02': ['High stress event'],
      '2026-05-03': ['High stress event'], '2026-05-04': ['High stress event'],
    };
    const anomalies = detectCycleAnomalies(cycles, disruptorsByDate);
    expect(anomalies[0].likelyExplanation).toBe('High stress event');
  });

  it('counts disruptors on the cycle\'s own local dates, not the day before', () => {
    const cycles: CycleHistoryEntry[] = [
      { start: '2026-01-01', length: 28 },
      { start: '2026-01-29', length: 27 },
      { start: '2026-02-25', length: 29 },
      { start: '2026-03-26', length: 28 },
      { start: '2026-04-23', length: 45 },
    ];
    // The flagged cycle is 2026-04-23 + 45 days, so its last two days are
    // 5 and 6 June. Placing 'Travel' on exactly those two puts it right on
    // the boundary the off-by-one crosses: a local-date lookup counts both
    // (2, which clears findLikelyExplanation's >= 2 gate), while a
    // UTC-shifted lookup sees only 5 June and drops below the gate entirely.
    const disruptorsByDate: Record<string, string[]> = {
      '2026-06-05': ['Travel'], '2026-06-06': ['Travel'],
    };
    const anomalies = detectCycleAnomalies(cycles, disruptorsByDate);
    expect(anomalies[0].start).toBe('2026-04-23');
    expect(anomalies[0].likelyExplanation).toBe('Travel');
  });

  it('returns null explanation when no disruptor tag stands out', () => {
    const cycles: CycleHistoryEntry[] = [
      { start: '2026-01-01', length: 28 },
      { start: '2026-01-29', length: 27 },
      { start: '2026-02-25', length: 29 },
      { start: '2026-03-26', length: 28 },
      { start: '2026-04-23', length: 45 },
    ];
    expect(detectCycleAnomalies(cycles, {})[0].likelyExplanation).toBeNull();
  });

  it('exports the minimum-cycles constant used by callers', () => {
    expect(MIN_CYCLES_FOR_ANOMALY_DETECTION).toBeGreaterThanOrEqual(3);
  });
});
