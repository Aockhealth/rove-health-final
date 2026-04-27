import type { OnboardingDraftV2, SymptomInput } from "@/lib/onboarding/types";
import { addDays, compareDateStrings, formatLocalDate, parseLocalDate } from "@/lib/onboarding/date";

export type PeriodRangeDraft = {
  startDate: string;
  endDate: string | null;
};

export type OnboardingState = {
  step: number;
  name: string;
  dateOfBirth: string;
  periodHistory: PeriodRangeDraft[];
  manualLastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  regularity: "Regular" | "Irregular";
  conditions: string[];
  symptoms: SymptomInput[];
  goals: string[];
  trackerMode: "menstruation" | "ttc" | "menopause";
  heightCm: number | null;
  weightKg: number | null;
  dietPreference: string;
  privacyConsented: boolean;
  errors: Record<string, string>;
};

export type OnboardingAction =
  | { type: "hydrate"; payload: Partial<OnboardingDraftV2> }
  | { type: "set_step"; step: number }
  | { type: "set_name"; name: string }
  | { type: "set_dob"; dob: string }
  | { type: "start_period_range"; date: string }
  | { type: "complete_period_range"; date: string }
  | { type: "clear_month"; monthStart: string; monthEnd: string }
  | { type: "set_manual_last_period_start"; date: string }
  | { type: "set_cycle_length"; value: number }
  | { type: "set_period_length"; value: number }
  | { type: "set_regularity"; value: "Regular" | "Irregular" }
  | { type: "toggle_condition"; condition: string }
  | { type: "toggle_symptom"; symptom: SymptomInput }
  | { type: "set_symptom_severity"; name: string; severity: number }
  | { type: "toggle_goal"; goalId: string }
  | { type: "set_height"; value: number | null }
  | { type: "set_weight"; value: number | null }
  | { type: "set_diet"; value: string }
  | { type: "set_privacy_consent"; value: boolean }
  | { type: "set_errors"; errors: Record<string, string> }
  | { type: "clear_errors" };

export type AutoStats = {
  avgCycle: number;
  avgBleed: number;
  isIrregular: boolean;
};

export const initialOnboardingState: OnboardingState = {
  step: 1,
  name: "",
  dateOfBirth: "",
  periodHistory: [],
  manualLastPeriodStart: formatLocalDate(new Date()),
  cycleLength: 28,
  periodLength: 5,
  regularity: "Regular",
  conditions: [],
  symptoms: [],
  goals: [],
  trackerMode: "menstruation",
  heightCm: null,
  weightKg: null,
  dietPreference: "",
  privacyConsented: false,
  errors: {},
};

function clampStep(step: number): number {
  if (step < 1) return 1;
  if (step > 5) return 5;
  return step;
}

function orderRange(range: PeriodRangeDraft): PeriodRangeDraft {
  if (!range.endDate) return range;
  if (compareDateStrings(range.endDate, range.startDate) < 0) {
    return { startDate: range.endDate, endDate: range.startDate };
  }
  return range;
}

function rangesOverlapOrTouch(a: PeriodRangeDraft, b: PeriodRangeDraft): boolean {
  if (!a.endDate || !b.endDate) return false;
  return compareDateStrings(addDays(a.endDate, 1), b.startDate) >= 0;
}

export function normalizePeriodRanges(ranges: PeriodRangeDraft[]): PeriodRangeDraft[] {
  const complete = ranges
    .filter((range) => range.endDate)
    .map(orderRange)
    .sort((a, b) => compareDateStrings(a.startDate, b.startDate));

  const open = ranges.filter((range) => !range.endDate);
  const merged: PeriodRangeDraft[] = [];

  for (const range of complete) {
    if (merged.length === 0) {
      merged.push(range);
      continue;
    }

    const current = merged[merged.length - 1];
    if (rangesOverlapOrTouch(current, range)) {
      merged[merged.length - 1] = {
        startDate: current.startDate,
        endDate:
          compareDateStrings(current.endDate!, range.endDate!) >= 0 ? current.endDate : range.endDate,
      };
      continue;
    }

    merged.push(range);
  }

  if (open.length > 0) {
    merged.push(open[open.length - 1]);
  }

  return merged;
}

function intersectsMonth(range: PeriodRangeDraft, monthStart: string, monthEnd: string): boolean {
  const rangeStart = range.startDate;
  const rangeEnd = range.endDate ?? range.startDate;
  return compareDateStrings(rangeStart, monthEnd) <= 0 && compareDateStrings(rangeEnd, monthStart) >= 0;
}

export function getCompletedRanges(ranges: PeriodRangeDraft[]): PeriodRangeDraft[] {
  return normalizePeriodRanges(ranges).filter((range) => Boolean(range.endDate)) as PeriodRangeDraft[];
}

export function calculateAutoStats(ranges: PeriodRangeDraft[]): AutoStats | null {
  const completed = getCompletedRanges(ranges).sort((a, b) => compareDateStrings(a.startDate, b.startDate));
  if (completed.length < 2) return null;

  const cycleLengths: number[] = [];
  for (let i = 0; i < completed.length - 1; i += 1) {
    const current = parseLocalDate(completed[i].startDate);
    const next = parseLocalDate(completed[i + 1].startDate);
    const diff = Math.round((next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    cycleLengths.push(diff);
  }

  const bleedLengths = completed.map((range) => {
    const start = parseLocalDate(range.startDate);
    const end = parseLocalDate(range.endDate!);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  });

  const avgCycle = Math.round(cycleLengths.reduce((sum, value) => sum + value, 0) / cycleLengths.length);
  const avgBleed = Math.round(bleedLengths.reduce((sum, value) => sum + value, 0) / bleedLengths.length);
  const minCycle = Math.min(...cycleLengths);
  const maxCycle = Math.max(...cycleLengths);
  const isIrregular = maxCycle - minCycle >= 8 || avgCycle < 21 || avgCycle > 35;

  return { avgCycle, avgBleed, isIrregular };
}

export function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        ...action.payload,
        step: clampStep(action.payload.step ?? state.step),
        errors: {},
      };
    case "set_step":
      return { ...state, step: clampStep(action.step) };
    case "set_name":
      return { ...state, name: action.name };
    case "set_dob":
      return { ...state, dateOfBirth: action.dob };
    case "start_period_range":
      return {
        ...state,
        periodHistory: normalizePeriodRanges([
          ...state.periodHistory.filter((range) => Boolean(range.endDate)),
          { startDate: action.date, endDate: null },
        ]),
      };
    case "complete_period_range": {
      const updated = [...state.periodHistory];
      const index = updated.findIndex((range) => !range.endDate);
      if (index === -1) return state;
      updated[index] = orderRange({
        startDate: updated[index].startDate,
        endDate: action.date,
      });
      return {
        ...state,
        periodHistory: normalizePeriodRanges(updated),
      };
    }
    case "clear_month":
      return {
        ...state,
        periodHistory: state.periodHistory.filter(
          (range) => !intersectsMonth(range, action.monthStart, action.monthEnd)
        ),
      };
    case "set_manual_last_period_start":
      return { ...state, manualLastPeriodStart: action.date };
    case "set_cycle_length":
      return { ...state, cycleLength: action.value };
    case "set_period_length":
      return { ...state, periodLength: action.value };
    case "set_regularity":
      return { ...state, regularity: action.value };
    case "toggle_condition":
      if (action.condition === "None") {
        return { ...state, conditions: ["None"] };
      }
      if (state.conditions.includes(action.condition)) {
        return {
          ...state,
          conditions: state.conditions.filter((c) => c !== action.condition),
        };
      }
      return {
        ...state,
        conditions: [...state.conditions.filter((c) => c !== "None"), action.condition],
      };
    case "toggle_symptom": {
      const exists = state.symptoms.find((s) => s.name === action.symptom.name);
      if (exists) {
        return { ...state, symptoms: state.symptoms.filter((s) => s.name !== action.symptom.name) };
      }
      return { ...state, symptoms: [...state.symptoms, action.symptom] };
    }
    case "set_symptom_severity":
      return {
        ...state,
        symptoms: state.symptoms.map((s) =>
          s.name === action.name ? { ...s, severity: action.severity } : s
        ),
      };
    case "toggle_goal":
      if (state.goals.includes(action.goalId)) {
        return { ...state, goals: state.goals.filter((g) => g !== action.goalId) };
      }
      return { ...state, goals: [...state.goals, action.goalId] };
    case "set_height":
      return { ...state, heightCm: action.value };
    case "set_weight":
      return { ...state, weightKg: action.value };
    case "set_diet":
      return { ...state, dietPreference: action.value };
    case "set_privacy_consent":
      return { ...state, privacyConsented: action.value };
    case "set_errors":
      return { ...state, errors: action.errors };
    case "clear_errors":
      return { ...state, errors: {} };
    default:
      return state;
  }
}
