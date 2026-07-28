// Ported from frontend/src/app/cycle-sync/tracker/constants.ts — keep option
// lists and phase copy in sync with that file if it changes.
import { CATEGORY_COLORS } from './CycleCalendar';

export type ChipType = 'positive' | 'negative' | 'orange' | 'blue';

export interface TypedOption {
  label: string;
  type: ChipType;
}

export const SYMPTOM_OPTIONS = [
  'Headache', 'Cramps', 'Bloating', 'Acne',
  'Muscle pain', 'Fatigue', 'Breast Pain', 'Nausea',
  'Diarrhoea', 'Constipation', 'Hot flushes', 'Vulvular pain',
];

export const MOODS_LIST: TypedOption[] = [
  { label: 'Energetic', type: 'blue' },
  { label: 'Calm', type: 'blue' },
  { label: 'Anxious', type: 'orange' },
  { label: 'Unfocused', type: 'orange' },
  { label: 'Irritable', type: 'negative' },
  { label: 'Low mood', type: 'negative' },
  { label: 'Overwhelmed', type: 'negative' },
];

export const EXERCISE_OPTIONS = [
  'Rest Day',
  'Light (Walk, Yoga)',
  'Moderate (Gym, Pilates)',
  'Intense (HIIT, Run)',
];

export const SELF_LOVE_OPTIONS = ['Travel', 'Meditation', 'Journal', 'Hobbies'];

export const SLEEP_OPTIONS: TypedOption[] = [
  { label: 'Restful', type: 'positive' },
  { label: 'Light/Broken', type: 'negative' },
  { label: 'Vivid dreams', type: 'orange' },
  { label: 'Insomnia', type: 'negative' },
  { label: 'Night sweats', type: 'negative' },
];

export const DISRUPTORS_LIST: TypedOption[] = [
  { label: 'Alcohol', type: 'negative' },
  { label: 'Caffeine overload', type: 'orange' },
  { label: 'High sugar', type: 'orange' },
  { label: 'Travel/Jet lag', type: 'orange' },
  { label: 'Illness', type: 'negative' },
  { label: 'High stress event', type: 'negative' },
  { label: 'Painkillers', type: 'orange' },
  { label: 'Emergency contraceptive', type: 'orange' },
];

export const SEX_ACTIVITY_OPTIONS: TypedOption[] = [
  { label: 'Sex', type: 'positive' },
  { label: 'Painful', type: 'negative' },
  { label: 'High sex drive', type: 'positive' },
  { label: 'Low sex drive', type: 'negative' },
  { label: 'Enjoyable', type: 'positive' },
];

export const CONTRACEPTION_OPTIONS = ['OC pill', 'Emergency pill', 'Condom', 'IUD', 'Withdrawal', 'None'];

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
