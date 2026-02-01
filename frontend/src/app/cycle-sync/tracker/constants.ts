import type { MPIQOption, MoodOption, SleepOption, DisruptorOption } from './type';

// Flow Options
export const FLOW_OPTIONS = ["Spotting", "Low", "Normal", "High", "Heavy"];

// Symptom Options
export const SYMPTOM_OPTIONS = [
  "Headache", "Cramps", "Bloating", "Acne",
  "Muscle pain", "Fatigue", "Breast Pain", "Nausea",
  "Diarrheoa", "Constipation", "Hot flushes", "Vulvular pain"
];

// MPIQ Options
export const CONSISTENCY_OPTIONS: MPIQOption[] = [
  {
    label: "Tacky",
    score: 4,
    desc: "Sticky, glue-like",
    type: "video",
    src: "/images/gifs/tacky.mp4"
  },
  {
    label: "Creamy",
    score: 3,
    desc: "Lotion-like, smooth",
    type: "video",
    src: "/images/gifs/creamy.mp4"
  },
  {
    label: "Stretchy",
    score: 2,
    desc: "Raw egg white, elastic",
    type: "video",
    src: "/images/gifs/stretchy.mp4"
  },
  {
    label: "Bloody",
    score: 1,
    desc: "Red/brown tint",
    type: "video",
    src: "/images/gifs/bloody.mp4"
  },
];

export const APPEARANCE_OPTIONS: MPIQOption[] = [
  {
    label: "White/Yellow",
    score: 3,
    desc: "Cloudy or cream colored",
    type: "image",
    src: "/images/gifs/white yellow appearance.jpeg"
  },
  {
    label: "Clear",
    score: 2,
    desc: "Transparent like glass",
    type: "image",
    src: "/images/gifs/clear appearance.jpeg"
  },
  {
    label: "Red",
    score: 1,
    desc: "Pink to bright red",
    type: "image",
    src: "/images/gifs/red appearance.jpeg"
  },
];

export const SENSATION_OPTIONS = [
  { label: "Dry", score: 4, desc: "No fluid felt" },
  { label: "Moist", score: 3, desc: "Slightly damp" },
  { label: "Wet", score: 2, desc: "Distinctly wet" },
  { label: "Slippery", score: 1, desc: "Lubricated, sliding" },
];

// Moods List
export const MOODS_LIST: MoodOption[] = [
  { label: "Energetic", type: "blue" },
  { label: "Calm", type: "blue" },
  { label: "Anxious", type: "orange" },
  { label: "Unfocused", type: "orange" },
  { label: "Irritable", type: "negative" },
  { label: "Low mood", type: "negative" },
  { label: "Overwhelmed", type: "negative" },
];

// Exercise Options
export const EXERCISE_OPTIONS = [
  "Rest Day",
  "Light (Walk, Yoga)",
  "Moderate (Gym, Pilates)",
  "Intense (HIIT, Run)"
];

// Self Love Options
export const SELF_LOVE_OPTIONS = ["Travel", "Meditation", "Journal", "Hobbies"];

// Sleep Options
export const SLEEP_OPTIONS: SleepOption[] = [
  { label: "Restful", type: "positive" },
  { label: "Light/Broken", type: "negative" },
  { label: "Vivid dreams", type: "orange" },
  { label: "Insomnia", type: "negative" },
  { label: "Night sweats", type: "negative" },
];

// Disruptors List
export const DISRUPTORS_LIST: DisruptorOption[] = [
  { label: "Alcohol", type: "negative" },
  { label: "Caffeine overload", type: "orange" },
  { label: "High sugar", type: "orange" },
  { label: "Travel/Jet lag", type: "orange" },
  { label: "Illness", type: "negative" },
  { label: "High stress event", type: "negative" },
  { label: "Painkillers", type: "orange" },
  { label: "Emergency contraceptive", type: "orange" },
];

// Sexual Wellness
export const SEX_ACTIVITY_OPTIONS = [
  { label: "Sex", type: "positive" },
  { label: "Painful", type: "negative" },
  { label: "High sex drive", type: "positive" },
  { label: "Low sex drive", type: "negative" },
  { label: "Enjoyable", type: "positive" },
];

export const CONTRACEPTION_OPTIONS = [
  "Pill", "Condom", "IUD", "Withdrawal", "None"
];

// Calendar
export const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];