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
    moodMatrix: [],
    sleepDisruptors: [],
    suggestions: [],
    clinicalFlags: [],
    cycleAnomalies: [],
    pmosScore: { flaggedCount: 0, assessableCount: 0, indicators: [] },
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

  it('renders a clean "no flags" summary when nothing was flagged', () => {
    const html = renderHealthReportHtml(baseReport());
    expect(html).toContain('No patterns flagged for review in this period.');
  });

  it('counts clinical flags, cycle anomalies and PMOS flags into one summary total', () => {
    const html = renderHealthReportHtml(
      baseReport({
        clinicalFlags: [{ finding: 'Shortest observed cycle was 18 days.', why: 'Outside the typical range.' }],
        cycleAnomalies: [
          { start: '2026-06-01', length: 45, personalMean: 29.5, zScore: 3.1, likelyExplanation: 'Travel' },
        ],
        pmosScore: {
          flaggedCount: 1,
          assessableCount: 2,
          indicators: [
            { key: 'cycle_irregularity', label: 'Cycle regularity', assessable: true, flagged: true, detail: 'Varied by 9 days.' },
            { key: 'bmi', label: 'BMI', assessable: true, flagged: false, detail: 'Within range.' },
          ],
        },
      }),
    );
    // 1 clinical flag + 1 anomaly + 1 flagged PMOS indicator = 3
    expect(html).toContain('3 patterns flagged for review below.');
  });

  it('renders cycle anomalies with her own mean and a likely explanation, never as a population comparison', () => {
    const html = renderHealthReportHtml(
      baseReport({
        cycleAnomalies: [
          { start: '2026-06-01', length: 45, personalMean: 29.5, zScore: 3.1, likelyExplanation: 'Travel' },
        ],
      }),
    );
    expect(html).toContain('Cycle pattern analysis');
    expect(html).toContain('her average is 29.5');
    expect(html).toContain('Longer than usual for her');
    expect(html).toContain('Travel');
  });

  it('omits the PMOS section entirely when nothing was assessable', () => {
    const html = renderHealthReportHtml(baseReport());
    expect(html).not.toContain('PMOS / PCOS Pattern Indicators');
  });

  it('renders PMOS indicators, distinguishing flagged from typical', () => {
    const html = renderHealthReportHtml(
      baseReport({
        pmosScore: {
          flaggedCount: 1,
          assessableCount: 2,
          indicators: [
            { key: 'cycle_irregularity', label: 'Cycle regularity', assessable: true, flagged: true, detail: 'Varied by 9 days across your logged history.' },
            { key: 'bmi', label: 'BMI', assessable: true, flagged: false, detail: 'Your BMI (21.0) is below the range commonly discussed alongside PMOS.' },
            { key: 'anovulatory_signals', label: 'Ovulation signal patterns', assessable: false, flagged: false, detail: 'Log basal temperature to include this indicator.' },
          ],
        },
      }),
    );
    expect(html).toContain('PMOS / PCOS Pattern Indicators');
    expect(html).toContain('1 of 2 assessable indicators flagged');
    expect(html).toContain('Cycle regularity — flagged');
    expect(html).toContain('BMI — typical');
    expect(html).not.toContain('Ovulation signal patterns — flagged');
    expect(html).not.toContain('Ovulation signal patterns — typical');
  });

  it('renders a mood-by-phase matrix alongside the symptom matrix', () => {
    const html = renderHealthReportHtml(
      baseReport({
        moodMatrix: [
          {
            name: 'Irritable',
            total: 6,
            byPhase: { Menstrual: 1, Follicular: 0, Ovulatory: 0, Luteal: 5 },
            peakPhase: 'Luteal',
          },
        ],
      }),
    );
    expect(html).toContain('Mood by phase');
    expect(html).toContain('Irritable');
  });

  it('omits the mood-by-phase matrix when there is nothing to show', () => {
    const html = renderHealthReportHtml(baseReport());
    expect(html).not.toContain('Mood by phase');
  });

  it('carries anovulatory notes and recurring PCOS patterns into the TTC section', () => {
    const html = renderHealthReportHtml(
      baseReport({
        ttc: {
          cycles: [
            {
              cycleStart: '2026-06-01',
              cycleEnd: '2026-06-30',
              isOngoing: false,
              status: 'monitoring',
              confirmedDate: null,
              method: 'date_math',
              confidence: 'low',
              anovulatory: {
                detected: true,
                reasons: ['persistent_opk_highs_no_peak'],
                note: 'Your tests have stayed high without reaching a clear peak.',
              },
            },
          ],
          chart: null,
          pcosPatterns: [
            {
              reason: 'persistent_opk_highs_no_peak',
              title: 'Tests stayed high without a clear peak',
              body: '2 of your last 3 cycles showed persistently high ovulation-test readings that never reached a clear peak.',
              count: 2,
              totalCycles: 3,
            },
          ],
        },
      }),
    );
    expect(html).toContain('Your tests have stayed high without reaching a clear peak.');
    expect(html).toContain('Recurring patterns across her cycles');
    expect(html).toContain('Tests stayed high without a clear peak');
  });
});
