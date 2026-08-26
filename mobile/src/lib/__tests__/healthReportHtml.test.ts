/**
 * Sanity checks for renderHealthReportHtml — mobile/src/lib/healthReportHtml.ts.
 * Focused on the Nutrition/Wearable Signals sections added alongside meal
 * logging + Apple Health/Health Connect data: they must render without
 * throwing, and be omitted (not shown empty) when there's nothing to show.
 */

import { renderHealthReportHtml } from '../healthReportHtml';
import type { HealthReport, Observed } from '../healthReport';

const emptyObserved: Observed = { average: null, daysLogged: 0 };

function baseReport(overrides: Partial<HealthReport> = {}): HealthReport {
  return {
    generatedAt: new Date('2026-08-25T00:00:00Z'),
    windowDays: 90,
    windowStart: '2026-05-27',
    windowEnd: '2026-08-25',
    person: {
      name: 'Test User',
      heightCm: 165,
      weightKg: 60,
      bmi: 22.0,
      conditions: [],
      dietPreference: 'Veg',
      activityLevel: 'moderate',
    },
    coverage: { daysWithAnyLog: 45, completenessPct: 50 },
    cycle: {
      observedCycles: [28, 30],
      averageLength: 29,
      shortestLength: 28,
      longestLength: 30,
      variationDays: 1.4,
      observedPeriodLengths: [5, 4],
      averagePeriodLength: 5,
      longestPeriodLength: 5,
      settingsCycleLength: 28,
      settingsPeriodLength: 5,
      markedIrregular: false,
    },
    hydration: emptyObserved,
    sleep: emptyObserved,
    exercise: { ...emptyObserved, weeklyAverage: null, topTypes: [] },
    symptoms: { top: [], byPhase: {}, matrix: [], daysWithSymptoms: 0 },
    moods: [],
    sleepDisruptors: [],
    suggestions: [],
    clinicalFlags: [],
    ttc: null,
    nutrition: null,
    wearable: null,
    ...overrides,
  };
}

describe('renderHealthReportHtml', () => {
  it('renders without throwing and omits Nutrition/Wearable sections when there is no data', () => {
    const html = renderHealthReportHtml(baseReport());
    expect(html).toContain('<h2>Cycle</h2>');
    expect(html).not.toContain('<h2>Nutrition</h2>');
    expect(html).not.toContain('<h2>Wearable Signals</h2>');
  });

  it('renders the Nutrition section from meal-logging data', () => {
    const html = renderHealthReportHtml(
      baseReport({
        nutrition: {
          calories: { average: 1850, daysLogged: 20 },
          proteinG: { average: 75, daysLogged: 20 },
          carbsG: { average: 210, daysLogged: 20 },
          fatG: { average: 60, daysLogged: 20 },
          sugarG: { average: 32, daysLogged: 20 },
          avgGlycemicIndex: 54,
          mealsLogged: 55,
          daysLogged: 20,
          topFoods: [{ name: 'Dal Rice', count: 8 }],
        },
      }),
    );
    expect(html).toContain('<h2>Nutrition</h2>');
    expect(html).toContain('1850 kcal');
    expect(html).toContain('avg GI 54');
    expect(html).toContain('Dal Rice');
  });

  it('renders the Wearable Signals section, including a negative skin-temp delta', () => {
    const html = renderHealthReportHtml(
      baseReport({
        wearable: {
          restingHeartRate: { average: 64, daysLogged: 30 },
          hrv: { average: 42, daysLogged: 30 },
          steps: { average: 7200, daysLogged: 30 },
          skinTempDelta: { average: -0.15, daysLogged: 30 },
        },
      }),
    );
    expect(html).toContain('<h2>Wearable Signals</h2>');
    expect(html).toContain('64 bpm');
    expect(html).toContain('-0.15 °C');
  });

  it('formats a positive skin-temp delta with an explicit +', () => {
    const html = renderHealthReportHtml(
      baseReport({
        wearable: {
          restingHeartRate: emptyObserved,
          hrv: emptyObserved,
          steps: emptyObserved,
          skinTempDelta: { average: 0.22, daysLogged: 5 },
        },
      }),
    );
    expect(html).toContain('+0.22 °C');
  });
});
