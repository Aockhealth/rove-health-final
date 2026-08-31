/**
 * The shape of what a phone published, as the web reads it.
 *
 * Mirrors HealthReport in mobile/src/lib/healthReport.ts plus the two
 * additions in DoctorSnapshot (labs, medications). Declared separately rather
 * than imported because the two apps don't share a build — if the mobile type
 * changes, bump SNAPSHOT_VERSION there and widen this to match, so an old
 * link keeps rendering rather than half-blanking.
 *
 * Every field is optional on read: this renders snapshots written by older
 * app versions, and a missing section must be omitted, never shown empty or
 * shown as a zero. A clinician reading a zero that means "not recorded" is
 * the one failure this file exists to prevent.
 */

export type Observed = { average: number | null; daysLogged: number };
export type Counted = { name: string; count: number };

export type SymptomRow = {
  name: string;
  total: number;
  byPhase: Record<string, number>;
  peakPhase: string | null;
};

export type CycleStats = {
  observedCycles: number[];
  averageLength: number | null;
  shortestLength: number | null;
  longestLength: number | null;
  variationDays: number | null;
  observedPeriodLengths: number[];
  averagePeriodLength: number | null;
  longestPeriodLength: number | null;
  settingsCycleLength: number;
  settingsPeriodLength: number;
  markedIrregular: boolean;
};

export type ClinicalFlag = { finding: string; why: string };
export type Suggestion = { area: string; finding: string; action: string };

export type CycleAnomaly = {
  start: string;
  length: number;
  personalMean: number;
  zScore: number;
  likelyExplanation: string | null;
};

export type PmosIndicator = {
  key: string;
  label: string;
  assessable: boolean;
  flagged: boolean;
  detail: string;
};

export type PmosPatternScore = {
  flaggedCount: number;
  assessableCount: number;
  indicators: PmosIndicator[];
};

export type NutritionStats = {
  calories: Observed;
  proteinG: Observed;
  carbsG: Observed;
  fatG: Observed;
  sugarG: Observed;
  avgGlycemicIndex: number | null;
  mealsLogged: number;
  daysLogged: number;
  topFoods: Counted[];
};

export type WearableStats = {
  restingHeartRate: Observed;
  hrv: Observed;
  steps: Observed;
  skinTempDelta: Observed;
};

export type TtcReportCycle = {
  cycleStart: string;
  cycleEnd: string;
  isOngoing: boolean;
  status: string;
  confirmedDate: string | null;
  method: string | null;
  confidence: string | null;
  anovulatory: { reason?: string; title?: string; body?: string } | null;
};

export type PcosPatternInsight = {
  reason: string;
  title: string;
  body: string;
  count: number;
  totalCycles: number;
};

export type TtcReportData = {
  cycles: TtcReportCycle[];
  pcosPatterns: PcosPatternInsight[];
};

export type LabResult = {
  id: string;
  date: string;
  testName: string;
  value: number | null;
  unit: string | null;
  notes: string | null;
};

export type DoctorSnapshot = {
  generatedAt: string;
  windowDays: number;
  windowStart: string;
  windowEnd: string;
  person: {
    name: string;
    heightCm: number | null;
    weightKg: number | null;
    bmi: number | null;
    conditions: string[];
    dietPreference: string | null;
    activityLevel: string | null;
  };
  coverage: { daysWithAnyLog: number; completenessPct: number };
  cycle: CycleStats;
  hydration: Observed;
  sleep: Observed;
  exercise: Observed & { weeklyAverage: number | null; topTypes: Counted[] };
  symptoms: {
    top: Counted[];
    byPhase: Record<string, Counted[]>;
    matrix: SymptomRow[];
    daysWithSymptoms: number;
  };
  moods: Counted[];
  moodMatrix: SymptomRow[];
  sleepDisruptors: Counted[];
  suggestions: Suggestion[];
  clinicalFlags: ClinicalFlag[];
  cycleAnomalies: CycleAnomaly[];
  pmosScore: PmosPatternScore | null;
  ttc: TtcReportData | null;
  nutrition: NutritionStats | null;
  wearable: WearableStats | null;
  labs: LabResult[];
  medications: { date: string; name: string; dose: string | null }[];
};

export const PHASE_ORDER = ["Menstrual", "Follicular", "Ovulatory", "Luteal"] as const;

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * One decimal, and an em dash for null. Never 0 — a missing average and an
 * average of zero mean completely different things to someone reading this
 * clinically, and the app's own report is careful about the same distinction.
 */
export function num(value: number | null | undefined, unit = ""): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}${unit}`;
}
