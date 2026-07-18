export type OnboardingStatus =
  | "privacy_pending"
  | "onboarding_in_progress"
  | "onboarding_complete";

export type SymptomCategory = "Physical" | "Emotional";

export type SymptomInput = {
  name: string;
  category: SymptomCategory;
  severity: number;
};

export type PeriodRangeInput = {
  start_date: string;
  end_date: string;
};

export type ConsentRecord = {
  agreed: true;
  policyVersion: string;
};

export type OnboardingDraftV2 = {
  step: number;
  name: string;
  dateOfBirth: string;
  periodHistory: Array<{ startDate: string; endDate: string | null }>;
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
  updatedAt: string;
};

export type OnboardingSubmissionV2 = {
  name: string;
  dateOfBirth: string;
  goals: string[];
  conditions: string[];
  symptoms: SymptomInput[];
  periodHistory: PeriodRangeInput[];
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  isIrregular: boolean;
  trackerMode?: "menstruation" | "ttc" | "menopause";
  heightCm?: number | null;
  weightKg?: number | null;
  dietPreference?: string;
  privacyConsented: boolean;
};
