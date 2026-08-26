// Ported from frontend/src/app/cycle-sync/tracker/constants.ts — keep option
// lists and phase copy in sync with that file if it changes.
import { CATEGORY_COLORS } from './CycleCalendar';

export type ChipType = 'positive' | 'negative' | 'orange' | 'blue';

// `label` is the exact string persisted to the selected* state arrays (and,
// on save, to daily_logs) — it stays in English regardless of app language.
// `key` looks up the localized display text via
// `tracker.options.<listName>.<key>` (see ChipGrid/TypedChipGrid's
// `getLabel` prop in tracker.tsx, which is what actually renders it).
export interface TypedOption {
  label: string;
  key: string;
  type: ChipType;
}

export interface PlainOption {
  label: string;
  key: string;
}

export const SYMPTOM_OPTIONS: PlainOption[] = [
  { label: 'Headache', key: 'headache' },
  { label: 'Cramps', key: 'cramps' },
  { label: 'Bloating', key: 'bloating' },
  { label: 'Acne', key: 'acne' },
  { label: 'Muscle pain', key: 'musclePain' },
  { label: 'Fatigue', key: 'fatigue' },
  { label: 'Breast Pain', key: 'breastPain' },
  { label: 'Nausea', key: 'nausea' },
  { label: 'Diarrhoea', key: 'diarrhoea' },
  { label: 'Constipation', key: 'constipation' },
  { label: 'Hot flushes', key: 'hotFlushes' },
  { label: 'Vulvular pain', key: 'vulvularPain' },
];

export const MOODS_LIST: TypedOption[] = [
  { label: 'Energetic', key: 'energetic', type: 'blue' },
  { label: 'Calm', key: 'calm', type: 'blue' },
  { label: 'Anxious', key: 'anxious', type: 'orange' },
  { label: 'Unfocused', key: 'unfocused', type: 'orange' },
  { label: 'Irritable', key: 'irritable', type: 'negative' },
  { label: 'Low mood', key: 'lowMood', type: 'negative' },
  { label: 'Overwhelmed', key: 'overwhelmed', type: 'negative' },
];

export const EXERCISE_OPTIONS: PlainOption[] = [
  { label: 'Rest Day', key: 'restDay' },
  { label: 'Light (Walk, Yoga)', key: 'light' },
  { label: 'Moderate (Gym, Pilates)', key: 'moderate' },
  { label: 'Intense (HIIT, Run)', key: 'intense' },
];

export const SELF_LOVE_OPTIONS: PlainOption[] = [
  { label: 'Travel', key: 'travel' },
  { label: 'Meditation', key: 'meditation' },
  { label: 'Journal', key: 'journal' },
  { label: 'Hobbies', key: 'hobbies' },
];

export const SLEEP_OPTIONS: TypedOption[] = [
  { label: 'Restful', key: 'restful', type: 'positive' },
  { label: 'Light/Broken', key: 'lightBroken', type: 'negative' },
  { label: 'Vivid dreams', key: 'vividDreams', type: 'orange' },
  { label: 'Insomnia', key: 'insomnia', type: 'negative' },
  { label: 'Night sweats', key: 'nightSweats', type: 'negative' },
];

export const DISRUPTORS_LIST: TypedOption[] = [
  { label: 'Alcohol', key: 'alcohol', type: 'negative' },
  { label: 'Caffeine overload', key: 'caffeineOverload', type: 'orange' },
  { label: 'High sugar', key: 'highSugar', type: 'orange' },
  { label: 'Travel/Jet lag', key: 'travelJetLag', type: 'orange' },
  { label: 'Illness', key: 'illness', type: 'negative' },
  { label: 'High stress event', key: 'highStressEvent', type: 'negative' },
  { label: 'Painkillers', key: 'painkillers', type: 'orange' },
  { label: 'Emergency contraceptive', key: 'emergencyContraceptive', type: 'orange' },
];

export const SEX_ACTIVITY_OPTIONS: TypedOption[] = [
  { label: 'Sex', key: 'sex', type: 'positive' },
  { label: 'Painful', key: 'painful', type: 'negative' },
  { label: 'High sex drive', key: 'highSexDrive', type: 'positive' },
  { label: 'Low sex drive', key: 'lowSexDrive', type: 'negative' },
  { label: 'Enjoyable', key: 'enjoyable', type: 'positive' },
];

export const CONTRACEPTION_OPTIONS: PlainOption[] = [
  { label: 'OC pill', key: 'ocPill' },
  { label: 'Emergency pill', key: 'emergencyPill' },
  { label: 'Condom', key: 'condom' },
  { label: 'IUD', key: 'iud' },
  { label: 'Withdrawal', key: 'withdrawal' },
  { label: 'None', key: 'none' },
];

// RN color for each chip "type" — used with SymptomChip's activeVariant="soft"
// to mirror the web's green/red/orange/blue tinted active states (Sleep
// Quality, Disruptors, Sexual Activity).
export const TYPE_COLORS: Record<ChipType, string> = {
  positive: '#16A34A',
  negative: '#DC2626',
  orange: '#D97706',
  blue: '#3B82F6',
};

// Re-exported so tracker.tsx can pull both option lists and category colors
// from one place.
export { CATEGORY_COLORS };
