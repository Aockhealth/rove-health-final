/**
 * Nourish target maths — the numbers behind Plan → Nourish's calorie and
 * macro rows. Pure functions, no RN imports, so they run under the repo's
 * root jest config alongside the shared/cycle suites.
 */
import { calculateTDEE, applyGoalAdjustment, getPhaseMacros, calculateEarnedCalories } from '../calorieCalculator';

const WEIGHT = 60;
const HEIGHT = 165;
const AGE = 30;

const targetFor = (activity: string, phase: string, goal: string, rate: number) =>
  applyGoalAdjustment(calculateTDEE(WEIGHT, HEIGHT, AGE, phase, activity), goal, rate);

describe('calorie target responds to every input it claims to', () => {
  it('rises with activity level', () => {
    const sedentary = targetFor('Sedentary', 'Luteal', 'weight_loss', 0.31);
    const active = targetFor('Active', 'Luteal', 'weight_loss', 0.31);
    const high = targetFor('Highly Active', 'Luteal', 'weight_loss', 0.31);
    expect(sedentary).toBeLessThan(active);
    expect(active).toBeLessThan(high);
  });

  it('adds the luteal metabolic bump', () => {
    const follicular = targetFor('Active', 'Follicular', 'weight_loss', 0.31);
    const luteal = targetFor('Active', 'Luteal', 'weight_loss', 0.31);
    expect(luteal - follicular).toBe(150);
  });

  it('cuts for weight loss and adds for muscle gain, around maintenance', () => {
    const loss = targetFor('Active', 'Luteal', 'weight_loss', 0.31);
    const maintain = targetFor('Active', 'Luteal', 'maintenance', 0.31);
    const gain = targetFor('Active', 'Luteal', 'muscle_gain', 0.31);
    expect(loss).toBeLessThan(maintain);
    expect(gain).toBeGreaterThan(maintain);
  });

  it('deepens the deficit as the chosen pace gets faster', () => {
    const gentle = targetFor('Active', 'Luteal', 'weight_loss', 0.25);
    const fast = targetFor('Active', 'Luteal', 'weight_loss', 0.75);
    expect(fast).toBeLessThan(gentle);
  });

  it('never recommends an unsafe target, however aggressive the inputs', () => {
    // Sedentary + the fastest pace would land near 900 kcal unclamped.
    expect(targetFor('Sedentary', 'Follicular', 'weight_loss', 0.75)).toBe(1200);
  });
});

describe('macros', () => {
  it('shifts the split by cycle phase', () => {
    const menstrual = getPhaseMacros('Menstrual', 1800, 'weight_loss');
    const follicular = getPhaseMacros('Follicular', 1800, 'weight_loss');
    // Menstrual leans to protein and fat; follicular leans to carbs.
    expect(menstrual.protein.g).toBeGreaterThan(follicular.protein.g);
    expect(menstrual.fats.g).toBeGreaterThan(follicular.fats.g);
    expect(follicular.carbs.g).toBeGreaterThan(menstrual.carbs.g);
  });

  it('splits the whole calorie target, whatever the phase', () => {
    for (const phase of ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal']) {
      const m = getPhaseMacros(phase, 1800, 'weight_loss');
      const kcal = m.protein.g * 4 + m.carbs.g * 4 + m.fats.g * 9;
      expect(Math.abs(kcal - 1800)).toBeLessThanOrEqual(10); // rounding only
    }
  });

  it('caps sugar at the WHO share, tightened for weight loss', () => {
    // 10% of energy normally, 5% on a weight-loss goal.
    expect(getPhaseMacros('Luteal', 2000, 'maintenance').sugar.g).toBe(50);
    expect(getPhaseMacros('Luteal', 2000, 'weight_loss').sugar.g).toBe(25);
  });

  it('moves the sugar ceiling with the calorie target, not as a fixed number', () => {
    const low = getPhaseMacros('Luteal', 1400, 'weight_loss').sugar.g;
    const high = getPhaseMacros('Luteal', 2100, 'weight_loss').sugar.g;
    expect(low).toBeLessThan(high);
  });

  it('does not raise the sugar ceiling in the luteal phase', () => {
    // Cravings are real, but relaxing a health guideline to accommodate them
    // would be presenting a preference as nutrition advice.
    const luteal = getPhaseMacros('Luteal', 1800, 'weight_loss').sugar.g;
    const follicular = getPhaseMacros('Follicular', 1800, 'weight_loss').sugar.g;
    expect(luteal).toBe(follicular);
  });
});

describe('calculateEarnedCalories', () => {
  it('returns 0 with no exercise logged', () => {
    expect(calculateEarnedCalories([], 30, 60)).toBe(0);
    expect(calculateEarnedCalories(['Light (Walk, Yoga)'], 0, 60)).toBe(0);
    expect(calculateEarnedCalories(null, 30, 60)).toBe(0);
    expect(calculateEarnedCalories(['Light (Walk, Yoga)'], null, 60)).toBe(0);
  });

  it('scales with intensity tier', () => {
    const light = calculateEarnedCalories(['Light (Walk, Yoga)'], 30, 60);
    const moderate = calculateEarnedCalories(['Moderate (Gym, Pilates)'], 30, 60);
    const intense = calculateEarnedCalories(['Intense (HIIT, Run)'], 30, 60);
    expect(light).toBeLessThan(moderate);
    expect(moderate).toBeLessThan(intense);
  });

  it('scales with minutes and body weight', () => {
    const short = calculateEarnedCalories(['Moderate (Gym, Pilates)'], 15, 60);
    const long = calculateEarnedCalories(['Moderate (Gym, Pilates)'], 60, 60);
    expect(long).toBeGreaterThan(short);

    const lighter = calculateEarnedCalories(['Moderate (Gym, Pilates)'], 30, 50);
    const heavier = calculateEarnedCalories(['Moderate (Gym, Pilates)'], 30, 80);
    expect(heavier).toBeGreaterThan(lighter);
  });

  it('uses the highest logged tier when more than one is logged the same day', () => {
    const both = calculateEarnedCalories(['Light (Walk, Yoga)', 'Intense (HIIT, Run)'], 30, 60);
    const intenseOnly = calculateEarnedCalories(['Intense (HIIT, Run)'], 30, 60);
    expect(both).toBe(intenseOnly);
  });

  it('ignores "Rest Day" as a real workout', () => {
    expect(calculateEarnedCalories(['Rest Day'], 20, 60)).toBe(0);
  });

  it('never earns back more than the cap, however long the session', () => {
    const massive = calculateEarnedCalories(['Intense (HIIT, Run)'], 600, 90);
    expect(massive).toBe(500);
  });
});
