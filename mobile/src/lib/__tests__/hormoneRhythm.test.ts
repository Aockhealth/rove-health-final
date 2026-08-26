import { computeHormoneRhythm, type DailySignalReading } from '../hormoneRhythm';

function dateAt(cycleStart: string, dayOffset: number): string {
  const d = new Date(`${cycleStart}T00:00:00`);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

describe('computeHormoneRhythm', () => {
  const cycleStart = '2026-06-01';

  it('reports no baseline with insufficient early-cycle data', () => {
    const readings: DailySignalReading[] = [
      { date: dateAt(cycleStart, 0), skinTempDeltaCelsius: 0.1, restingHeartRateBpm: null, hrvMs: null },
    ];
    const result = computeHormoneRhythm(cycleStart, 28, readings);
    expect(result.hasBaseline).toBe(false);
    expect(result.points).toEqual([]);
  });

  it('produces a null index for days with no reading', () => {
    const jitter = [-0.05, 0.04, -0.02, 0.03, 0.0, -0.03, 0.02, -0.04];
    const readings: DailySignalReading[] = Array.from({ length: 8 }, (_, i) => ({
      date: dateAt(cycleStart, i),
      skinTempDeltaCelsius: jitter[i],
      restingHeartRateBpm: 60 + Math.round(jitter[i] * 20),
      hrvMs: 50 + Math.round(jitter[i] * 20),
    }));
    const result = computeHormoneRhythm(cycleStart, 28, readings);
    const day20 = result.points.find((p) => p.cycleDay === 20)!;
    expect(day20.index).toBeNull();
  });

  it('rises after ovulation when temp/RHR climb and HRV drops, consistent with a post-ovulatory shift', () => {
    const readings: DailySignalReading[] = [];
    // Realistic-noise baseline for the first 10 days (follicular) — a
    // little day-to-day jitter, same as any real physiological signal.
    const jitter = [-0.05, 0.04, -0.02, 0.03, 0.0, -0.03, 0.02, -0.04, 0.05, -0.01];
    for (let i = 0; i < 10; i++) {
      readings.push({
        date: dateAt(cycleStart, i),
        skinTempDeltaCelsius: jitter[i],
        restingHeartRateBpm: 60 + Math.round(jitter[i] * 20),
        hrvMs: 50 + Math.round(jitter[i] * 20),
      });
    }
    // Post-ovulatory shift: temp/RHR up, HRV down — day 14 onward.
    for (let i = 14; i < 26; i++) {
      readings.push({ date: dateAt(cycleStart, i), skinTempDeltaCelsius: 0.4, restingHeartRateBpm: 65, hrvMs: 40 });
    }
    const result = computeHormoneRhythm(cycleStart, 28, readings);
    expect(result.hasBaseline).toBe(true);

    const follicularPoint = result.points.find((p) => p.cycleDay === 5)!;
    const lutealPoint = result.points.find((p) => p.cycleDay === 20)!;
    expect(follicularPoint.index).not.toBeNull();
    expect(lutealPoint.index).not.toBeNull();
    expect(lutealPoint.index!).toBeGreaterThan(follicularPoint.index!);
  });

  it('still computes from a single available signal when the others are missing', () => {
    const readings: DailySignalReading[] = [];
    const jitter = [-0.05, 0.04, -0.02, 0.03, 0.0, -0.03, 0.02, -0.04, 0.05, -0.01];
    for (let i = 0; i < 10; i++) {
      readings.push({ date: dateAt(cycleStart, i), skinTempDeltaCelsius: jitter[i], restingHeartRateBpm: null, hrvMs: null });
    }
    for (let i = 14; i < 20; i++) {
      readings.push({ date: dateAt(cycleStart, i), skinTempDeltaCelsius: 0.5, restingHeartRateBpm: null, hrvMs: null });
    }
    const result = computeHormoneRhythm(cycleStart, 28, readings);
    expect(result.hasBaseline).toBe(true);
    const lutealPoint = result.points.find((p) => p.cycleDay === 16)!;
    expect(lutealPoint.index).not.toBeNull();
    expect(lutealPoint.index!).toBeGreaterThan(50);
  });

  it('keeps every index within the 0-100 bounds', () => {
    const readings: DailySignalReading[] = [];
    const jitter = [-0.05, 0.04, -0.02, 0.03, 0.0, -0.03, 0.02, -0.04, 0.05, -0.01];
    for (let i = 0; i < 10; i++) {
      readings.push({
        date: dateAt(cycleStart, i),
        skinTempDeltaCelsius: jitter[i],
        restingHeartRateBpm: 60 + Math.round(jitter[i] * 20),
        hrvMs: 50 + Math.round(jitter[i] * 20),
      });
    }
    // Extreme outlier day, well beyond +/-2 SD.
    readings.push({ date: dateAt(cycleStart, 15), skinTempDeltaCelsius: 5.0, restingHeartRateBpm: 120, hrvMs: 1 });
    const result = computeHormoneRhythm(cycleStart, 28, readings);
    for (const p of result.points) {
      if (p.index !== null) {
        expect(p.index).toBeGreaterThanOrEqual(0);
        expect(p.index).toBeLessThanOrEqual(100);
      }
    }
  });
});
