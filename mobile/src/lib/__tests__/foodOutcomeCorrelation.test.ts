import { correlateIngredientsWithSeverity, describeTopOutcome, type ChosenDish } from '../foodOutcomeCorrelation';

describe('correlateIngredientsWithSeverity', () => {
  it('returns [] with no rated days at all', () => {
    const choices: ChosenDish[] = [{ date: '2026-06-01', ingredients: ['Ginger'] }];
    expect(correlateIngredientsWithSeverity(choices, {})).toEqual([]);
  });

  it('ignores an ingredient chosen fewer than the minimum number of times', () => {
    const choices: ChosenDish[] = [
      { date: '2026-06-01', ingredients: ['Ginger'] },
      { date: '2026-06-02', ingredients: ['Ginger'] },
    ];
    const severityByDate: Record<string, number | null> = {
      '2026-06-01': 2,
      '2026-06-02': 2,
      '2026-06-03': 4,
      '2026-06-04': 4,
      '2026-06-05': 4,
    };
    expect(correlateIngredientsWithSeverity(choices, severityByDate)).toEqual([]);
  });

  it('flags an ingredient with a meaningfully lower average severity on days it was chosen', () => {
    const choices: ChosenDish[] = [
      { date: '2026-06-01', ingredients: ['Ginger', 'Lemon'] },
      { date: '2026-06-02', ingredients: ['Ginger'] },
      { date: '2026-06-03', ingredients: ['Ginger'] },
      { date: '2026-06-04', ingredients: ['Peanuts'] },
    ];
    const severityByDate: Record<string, number | null> = {
      '2026-06-01': 2,
      '2026-06-02': 2,
      '2026-06-03': 2.5,
      '2026-06-04': 4,
      '2026-06-05': 4,
      '2026-06-06': 4.5,
    };
    const results = correlateIngredientsWithSeverity(choices, severityByDate);
    const ginger = results.find((r) => r.ingredient === 'ginger');
    expect(ginger).toBeDefined();
    expect(ginger!.avgSeverityWith).toBeLessThan(ginger!.avgSeverityWithout);
    expect(ginger!.diff).toBeGreaterThanOrEqual(0.5);
  });

  it('does not flag an ingredient with no meaningful severity difference', () => {
    const choices: ChosenDish[] = [
      { date: '2026-06-01', ingredients: ['Peanuts'] },
      { date: '2026-06-02', ingredients: ['Peanuts'] },
      { date: '2026-06-03', ingredients: ['Peanuts'] },
    ];
    const severityByDate: Record<string, number | null> = {
      '2026-06-01': 3,
      '2026-06-02': 3,
      '2026-06-03': 3,
      '2026-06-04': 3,
      '2026-06-05': 3,
      '2026-06-06': 3,
    };
    expect(correlateIngredientsWithSeverity(choices, severityByDate)).toEqual([]);
  });

  it('never flags an ingredient associated with a HIGHER average severity', () => {
    const choices: ChosenDish[] = [
      { date: '2026-06-01', ingredients: ['Chili'] },
      { date: '2026-06-02', ingredients: ['Chili'] },
      { date: '2026-06-03', ingredients: ['Chili'] },
    ];
    const severityByDate: Record<string, number | null> = {
      '2026-06-01': 5,
      '2026-06-02': 5,
      '2026-06-03': 4.5,
      '2026-06-04': 2,
      '2026-06-05': 2,
      '2026-06-06': 2,
    };
    expect(correlateIngredientsWithSeverity(choices, severityByDate)).toEqual([]);
  });

  it('skips unrated (null-severity) days entirely, on both sides', () => {
    const choices: ChosenDish[] = [
      { date: '2026-06-01', ingredients: ['Ginger'] },
      { date: '2026-06-02', ingredients: ['Ginger'] },
      { date: '2026-06-03', ingredients: ['Ginger'] },
    ];
    const severityByDate: Record<string, number | null> = {
      '2026-06-01': 2,
      '2026-06-02': 2,
      '2026-06-03': null, // logged a choice, but no severity rating that day
      '2026-06-04': 4,
      '2026-06-05': 4,
      '2026-06-06': 4,
    };
    // Only 2 rated "with" days now — below MIN_SAMPLE_PER_SIDE (3), so no result.
    expect(correlateIngredientsWithSeverity(choices, severityByDate)).toEqual([]);
  });

  it('sorts multiple findings strongest-diff first', () => {
    const choices: ChosenDish[] = [
      { date: '2026-06-01', ingredients: ['Ginger'] },
      { date: '2026-06-02', ingredients: ['Ginger'] },
      { date: '2026-06-03', ingredients: ['Ginger'] },
      { date: '2026-06-07', ingredients: ['Turmeric'] },
      { date: '2026-06-08', ingredients: ['Turmeric'] },
      { date: '2026-06-09', ingredients: ['Turmeric'] },
    ];
    const severityByDate: Record<string, number | null> = {
      '2026-06-01': 1,
      '2026-06-02': 1,
      '2026-06-03': 1,
      '2026-06-04': 5,
      '2026-06-05': 5,
      '2026-06-06': 5,
      '2026-06-07': 3,
      '2026-06-08': 3,
      '2026-06-09': 3,
      '2026-06-10': 4,
      '2026-06-11': 4,
      '2026-06-12': 4,
    };
    const results = correlateIngredientsWithSeverity(choices, severityByDate);
    expect(results[0].ingredient).toBe('ginger');
  });
});

describe('describeTopOutcome', () => {
  it('returns null with no outcomes', () => {
    expect(describeTopOutcome([])).toBeNull();
  });

  it('describes the strongest finding by name', () => {
    const text = describeTopOutcome([
      { ingredient: 'ginger', withCount: 3, withoutCount: 3, avgSeverityWith: 2, avgSeverityWithout: 4, diff: 2 },
    ]);
    expect(text).toContain('ginger');
  });
});
