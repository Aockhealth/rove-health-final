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
    const disruptorsByDate: Record<string, string[]> = {};
    // Log "High stress event" on 12 separate days within the long cycle.
    const start = new Date('2026-04-23T00:00:00');
    for (let i = 0; i < 12; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      disruptorsByDate[d.toISOString().slice(0, 10)] = ['High stress event'];
    }
    const anomalies = detectCycleAnomalies(cycles, disruptorsByDate);
    expect(anomalies[0].likelyExplanation).toBe('High stress event');
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
