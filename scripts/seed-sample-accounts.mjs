// Seeds 50 tagged sample accounts into the (single, production) Supabase
// project: 25 "general" regular-cycle accounts and 25 "TTC + irregular
// cycle" accounts with a full year of history. Every account is tagged with
// the email domain SAMPLE_EMAIL_DOMAIN so it can be found and torn down
// later (see cleanup-sample-accounts.mjs) without touching real users.
//
// Re-running this script is safe: it looks up each sample email first and
// skips accounts that already exist rather than duplicating data.
//
// Usage: node scripts/seed-sample-accounts.mjs

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SAMPLE_EMAIL_DOMAIN = 'rovehealth-sample.internal';
const SAMPLE_PASSWORD = process.env.SAMPLE_ACCOUNT_PASSWORD;

if (!SAMPLE_PASSWORD) {
  console.error('Missing SAMPLE_ACCOUNT_PASSWORD in .env.local — set it to the shared password for the seeded sample accounts.');
  process.exit(1);
}

const ALGORITHM_VERSION = '2026.08.16-lh-mucus-exclusions';

// ---------------------------------------------------------------------------
// RNG helpers
// ---------------------------------------------------------------------------
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const chance = (p) => Math.random() < p;
const pickSome = (arr, minN, maxN) => {
  const n = Math.min(arr.length, randInt(minN, maxN));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
};
const dateStr = (d) => d.toISOString().slice(0, 10);
const atTime = (d, hour, min = 0) => {
  const t = new Date(d);
  t.setUTCHours(hour, min, 0, 0);
  return t.toISOString();
};
// bbt_wake_time is a plain `time without time zone` column live (not
// timestamptz, despite the migration file) — needs "HH:MM:SS", not an ISO datetime.
const timeStr = (hour, min = 0) => `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;

// ---------------------------------------------------------------------------
// Name pools (unique combos, 50 needed)
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Aanya', 'Priya', 'Ishita', 'Neha', 'Ananya', 'Riya', 'Diya', 'Kavya', 'Sneha', 'Pooja',
  'Meera', 'Tanvi', 'Aditi', 'Isha', 'Sanya', 'Radhika', 'Nisha', 'Divya', 'Shreya', 'Anjali',
  'Kritika', 'Simran', 'Aarushi', 'Vidya', 'Ruchika', 'Manasi', 'Swati', 'Prerna', 'Trisha', 'Zara',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Iyer', 'Nair', 'Reddy', 'Gupta', 'Menon', 'Rao', 'Kapoor', 'Chatterjee',
  'Bose', 'Mehta', 'Joshi', 'Malhotra', 'Pillai', 'Desai', 'Agarwal', 'Bhatt', 'Kulkarni', 'Chawla',
];
function uniqueNames(count) {
  const used = new Set();
  const out = [];
  while (out.length < count) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    if (!used.has(name)) {
      used.add(name);
      out.push(name);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Exact value-lists the real UI writes (mobile/src/components/tracker/constants.ts
// and friends) — kept faithful so Insights/health-report/phase-engine reads work.
// ---------------------------------------------------------------------------
const SYMPTOMS = ['Headache', 'Cramps', 'Bloating', 'Acne', 'Muscle pain', 'Fatigue', 'Breast Pain', 'Nausea', 'Diarrhoea', 'Constipation'];
const MOODS_LOW_PHASE = ['Anxious', 'Irritable', 'Low mood', 'Overwhelmed', 'Unfocused'];
const MOODS_HIGH_PHASE = ['Energetic', 'Calm'];
const EXERCISE = ['Rest Day', 'Light (Walk, Yoga)', 'Moderate (Gym, Pilates)', 'Intense (HIIT, Run)'];
const DISRUPTORS = ['Alcohol', 'Caffeine overload', 'High sugar', 'Travel/Jet lag', 'Illness', 'High stress event'];
const SLEEP_QUALITY = ['Restful', 'Light/Broken', 'Vivid dreams', 'Insomnia', 'Night sweats'];
const SEX_ACTIVITY = ['Sex', 'Painful', 'High sex drive', 'Low sex drive', 'Enjoyable'];
const CONTRACEPTION_GENERAL = ['OC pill', 'Condom', 'Withdrawal', 'None'];
const FLOW_BY_DAY_POSITION = ['Low', 'Normal', 'High', 'Normal', 'Low', 'Spotting']; // heaviest mid-period

const MEDICAL_CONDITIONS_POOL = ['None', 'None', 'None', 'None', 'None', 'PCOS / PCOD', 'Endometriosis', 'Thyroid', 'Recurrent UTI'];
const GOALS_POOL = ['tracking', 'syncing', 'weight_loss'];
const DIET_PREFS = ['vegetarian', 'non_vegetarian', 'vegan', 'jain', 'eggetarian', 'pescatarian'];
const ACTIVITY_LEVELS = ['sedentary', 'moderate', 'active', 'athlete'];
const PHYSICAL_SYMPTOM_LABELS = ['Cramps', 'Bloating', 'Fatigue', 'Headache', 'Backache', 'Acne', 'Breast pain'];
const EMOTIONAL_SYMPTOM_LABELS = ['Mood swings', 'Feeling low', 'Irritability', 'Anger', 'Food cravings'];

const MEALS = [
  { name: 'Poha with peanuts', cal: [220, 320], p: [5, 9], c: [35, 50], f: [6, 12] },
  { name: 'Idli + sambar', cal: [200, 300], p: [7, 12], c: [30, 45], f: [3, 8] },
  { name: 'Dal + rice + sabzi', cal: [420, 600], p: [12, 20], c: [60, 85], f: [8, 16] },
  { name: 'Roti + paneer sabzi', cal: [400, 580], p: [15, 24], c: [40, 60], f: [14, 24] },
  { name: 'Grilled chicken salad', cal: [350, 480], p: [28, 38], c: [12, 22], f: [12, 20] },
  { name: 'Greek yogurt + fruit + oats', cal: [250, 380], p: [12, 20], c: [30, 45], f: [4, 10] },
  { name: 'Paneer wrap', cal: [380, 520], p: [16, 24], c: [38, 55], f: [12, 20] },
  { name: 'Rajma chawal', cal: [420, 560], p: [14, 20], c: [65, 90], f: [6, 12] },
  { name: 'Egg bhurji + toast', cal: [280, 400], p: [14, 20], c: [20, 32], f: [12, 20] },
  { name: 'Vegetable khichdi', cal: [300, 420], p: [8, 14], c: [48, 65], f: [6, 12] },
  { name: 'Fruit + nuts bowl', cal: [150, 260], p: [3, 7], c: [20, 32], f: [6, 14] },
  { name: 'Masala dosa', cal: [350, 480], p: [7, 12], c: [50, 68], f: [12, 20] },
];

const LAB_TESTS = [
  { name: 'Testosterone', unit: 'ng/dL', range: [20, 70] },
  { name: 'AMH', unit: 'ng/mL', range: [1.0, 6.5] },
  { name: 'TSH', unit: 'mIU/L', range: [0.5, 4.5] },
  { name: 'Prolactin', unit: 'ng/mL', range: [5, 25] },
  { name: 'LH:FSH Ratio', unit: 'ratio', range: [0.5, 3.0] },
];

const FERTILITY_MEDS = ['Letrozole', 'Clomiphene'];

// ---------------------------------------------------------------------------
// Cycle generation
// ---------------------------------------------------------------------------
function buildCycles({ historyDays, cycleLenRange, periodLenRange, irregular }) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const cycles = []; // oldest -> newest
  let currentLen = randInt(cycleLenRange[0], cycleLenRange[1]);
  const daysIntoCurrentCycle = randInt(1, currentLen);
  let cursorStart = addDays(today, -daysIntoCurrentCycle + 1);

  // Walk forward pushing the "current" (possibly ongoing) cycle first,
  // then keep prepending earlier cycles until we cover historyDays.
  cycles.push({ start: cursorStart, length: currentLen, periodLength: randInt(periodLenRange[0], periodLenRange[1]) });

  let earliestCovered = cursorStart;
  const horizon = addDays(today, -historyDays);
  while (earliestCovered > horizon) {
    const len = randInt(cycleLenRange[0], cycleLenRange[1]);
    const start = addDays(earliestCovered, -len);
    cycles.unshift({ start, length: len, periodLength: randInt(periodLenRange[0], periodLenRange[1]) });
    earliestCovered = start;
  }

  // Assign luteal phase (~12-14 days, stays fairly fixed even when cycles
  // are irregular — irregularity mostly comes from the follicular phase)
  // and mark some cycles anovulatory when irregular.
  for (let i = 0; i < cycles.length; i++) {
    const c = cycles[i];
    const isLastIncomplete = i === cycles.length - 1;
    const lutealLength = randInt(12, 14);
    c.ovulationDay = Math.max(8, c.length - lutealLength);
    c.isCurrentIncomplete = isLastIncomplete;
    c.anovulatory = irregular && !isLastIncomplete && chance(0.18);
  }

  return { cycles, today };
}

function cycleForDate(cycles, date) {
  for (const c of cycles) {
    const end = addDays(c.start, c.length);
    if (date >= c.start && date < end) {
      const cycleDay = Math.round((date - c.start) / 86400000) + 1;
      return { cycle: c, cycleDay };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Per-day builders
// ---------------------------------------------------------------------------
function buildDailyLog(userId, date, cycleDay, cycle, isTtc, baselineTemp) {
  const dstr = dateStr(date);
  const isPeriod = cycleDay <= cycle.periodLength;
  const daysToNextPeriod = cycle.length - cycleDay; // luteal/PMS window as this shrinks
  const inLutealPms = !isPeriod && daysToNextPeriod <= 5;
  const inFollicularHigh = !isPeriod && cycleDay > cycle.periodLength && cycleDay < cycle.ovulationDay - 1;

  const row = {
    user_id: userId,
    date: dstr,
    is_period: isPeriod,
    symptoms: [],
    updated_at: atTime(date, 20, randInt(0, 59)),
    created_at: atTime(date, 20, randInt(0, 59)),
  };

  if (isPeriod) {
    row.flow_intensity = pick(FLOW_BY_DAY_POSITION);
  }

  // Symptoms/moods skew toward period + late-luteal (PMS), lighter mid-cycle
  const symptomChance = isPeriod ? 0.7 : inLutealPms ? 0.55 : 0.15;
  if (chance(symptomChance)) {
    row.symptoms = pickSome(SYMPTOMS, 1, isPeriod ? 3 : 2);
  }
  if (chance(0.75)) {
    row.moods = inFollicularHigh || (!isPeriod && !inLutealPms)
      ? pickSome([...MOODS_HIGH_PHASE, ...MOODS_HIGH_PHASE, ...MOODS_LOW_PHASE], 1, 2)
      : pickSome([...MOODS_LOW_PHASE, ...MOODS_LOW_PHASE, ...MOODS_HIGH_PHASE], 1, 2);
  }
  if (row.symptoms.length) {
    const severity = {};
    for (const s of row.symptoms) severity[s] = randInt(isPeriod ? 2 : 1, isPeriod ? 5 : 3);
    row.symptom_severity = severity;
  }

  if (chance(0.55)) {
    row.exercise_types = [isPeriod && chance(0.4) ? 'Rest Day' : pick(EXERCISE)];
    if (row.exercise_types[0] !== 'Rest Day') row.exercise_minutes = randInt(20, 60);
  }
  if (chance(0.65)) row.water_intake = randInt(4, 12); // glasses
  if (chance(0.55)) {
    row.sleep_quality = [isPeriod || inLutealPms ? pick(['Light/Broken', 'Insomnia', 'Restful', 'Vivid dreams']) : pick(SLEEP_QUALITY)];
    row.sleep_minutes = randInt(330, 510);
  }
  if (chance(0.12)) row.disruptors = pickSome(DISRUPTORS, 1, 2);
  if (!isPeriod && chance(isTtc ? 0.25 : 0.18)) {
    row.sex_activity = pickSome(SEX_ACTIVITY, 1, 2);
  }
  if (!isTtc && chance(0.25)) {
    row.contraception = [pick(CONTRACEPTION_GENERAL)];
  } else if (isTtc) {
    row.contraception = ['None'];
  }

  if (isTtc) {
    const { anovulatory, ovulationDay } = cycle;
    // BBT: flat-ish follicular baseline, sustained rise after ovulation unless anovulatory
    if (chance(0.85)) {
      const noise = randFloat(-0.08, 0.08);
      const risen = !anovulatory && cycleDay > ovulationDay;
      row.bbt_celsius = Number((baselineTemp + (risen ? randFloat(0.28, 0.55) : 0) + noise).toFixed(2));
      row.bbt_wake_time = timeStr(6 + randInt(0, 1), randInt(0, 45));
    }

    // OPK only tested in a window around ovulation
    const testWindowStart = ovulationDay - 6;
    const testWindowEnd = ovulationDay + 2;
    if (cycleDay >= testWindowStart && cycleDay <= testWindowEnd && chance(0.85)) {
      if (anovulatory) {
        row.opk_result = pick(['negative', 'negative', 'low']);
      } else if (cycleDay === ovulationDay - 1) {
        row.opk_result = 'peak';
      } else if (cycleDay === ovulationDay - 2) {
        row.opk_result = pick(['high', 'peak']);
      } else if (cycleDay === ovulationDay) {
        row.opk_result = pick(['high', 'negative']);
      } else if (cycleDay >= testWindowStart && cycleDay < ovulationDay - 2) {
        row.opk_result = pick(['negative', 'low']);
      } else {
        row.opk_result = 'negative';
      }
    }

    // Cervical mucus, structural JSON [vaginalFluid, appearance, sensation]
    if (chance(0.7)) {
      let mucus;
      if (!anovulatory && (cycleDay === ovulationDay - 1 || cycleDay === ovulationDay)) {
        mucus = ['Stretchy', pick(['Clear', 'White/Yellow']), pick(['Wet', 'Slippery'])];
      } else if (!anovulatory && cycleDay >= ovulationDay - 4 && cycleDay < ovulationDay - 1) {
        mucus = ['Creamy', 'White/Yellow', 'Moist'];
      } else if (isPeriod) {
        mucus = ['Bloody', 'Red', 'Wet'];
      } else {
        mucus = ['Tacky', pick(['White/Yellow', 'Clear']), 'Dry'];
      }
      row.cervical_discharge = JSON.stringify(mucus);
    }

    if (chance(0.03)) row.nsaid_taken = true;
  }

  return row;
}

function buildLhReading(userId, date, cycleDay, cycle, stripCounter) {
  const { ovulationDay, anovulatory } = cycle;
  const testWindowStart = ovulationDay - 6;
  const testWindowEnd = ovulationDay + 1;
  if (cycleDay < testWindowStart || cycleDay > testWindowEnd) return null;
  if (!chance(0.85)) return null;

  let band = 0;
  let surge = false;
  if (!anovulatory) {
    if (cycleDay === ovulationDay - 1) { band = 4; surge = true; }
    else if (cycleDay === ovulationDay - 2) band = 3;
    else if (cycleDay === ovulationDay) band = randInt(2, 3);
    else band = randInt(0, 1);
  } else {
    band = randInt(0, 1);
  }

  return {
    user_id: userId,
    date: dateStr(date),
    test_time: atTime(date, randInt(14, 20), randInt(0, 59)),
    cycle_day: cycleDay,
    band_level: band,
    kit_strip_number: stripCounter,
    surge_flag: surge,
    created_at: atTime(date, randInt(14, 20), randInt(0, 59)),
  };
}

function buildOvulationEstimate(userId, cycle) {
  if (cycle.isCurrentIncomplete) return null; // only completed cycles get an audit row
  const cycleStart = dateStr(cycle.start);
  if (cycle.anovulatory) {
    return {
      user_id: userId,
      cycle_start: cycleStart,
      status: 'monitoring',
      method: 'bbt_only',
      confirmed_date: null,
      predicted_date: null,
      fertile_window_start: null,
      fertile_window_end: null,
      confidence: 'low',
      contributing_signals: ['bbt'],
      anovulatory_detected: true,
      anovulatory_reasons: ['no_sustained_bbt_rise'],
      periovulatory_nsaid_flag: false,
      explanation: 'No sustained temperature rise detected this cycle.',
      signal_snapshot: { note: 'seeded-sample-data', cycleLength: cycle.length },
      algorithm_version: ALGORITHM_VERSION,
      computed_at: atTime(addDays(cycle.start, cycle.length), 9, 0),
    };
  }
  const ovDate = addDays(cycle.start, cycle.ovulationDay - 1);
  return {
    user_id: userId,
    cycle_start: cycleStart,
    status: 'ovulation_confirmed',
    method: 'combined',
    confirmed_date: dateStr(ovDate),
    predicted_date: dateStr(ovDate),
    fertile_window_start: dateStr(addDays(ovDate, -5)),
    fertile_window_end: dateStr(addDays(ovDate, 1)),
    confidence: 'high',
    contributing_signals: ['bbt', 'opk', 'mucus'],
    anovulatory_detected: false,
    anovulatory_reasons: [],
    periovulatory_nsaid_flag: false,
    explanation: 'BBT rise confirmed by LH surge and peak mucus.',
    signal_snapshot: { note: 'seeded-sample-data', cycleLength: cycle.length, ovulationDay: cycle.ovulationDay },
    algorithm_version: ALGORITHM_VERSION,
    computed_at: atTime(addDays(cycle.start, cycle.length), 9, 0),
  };
}

// ---------------------------------------------------------------------------
// Insert helpers
// ---------------------------------------------------------------------------
async function insertChunked(table, rows, chunkSize = 400) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
  }
}

// Upsert so the script is safely re-runnable: resuming a partially-seeded
// user (e.g. after a mid-run failure) overwrites that user's own rows for
// the same conflict key instead of erroring or duplicating.
async function upsertChunked(table, rows, onConflict, chunkSize = 400) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) throw new Error(`Upsert into ${table} failed: ${error.message}`);
  }
}

async function userExists(email) {
  // Paginate through admin listUsers looking for this email (small volumes, fine).
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 1000) return null;
    page++;
  }
}

// ---------------------------------------------------------------------------
// Per-user pipeline
// ---------------------------------------------------------------------------
async function seedUser({ index, group, fullName, config }) {
  const emailLocal = `sample.${group}.${String(index).padStart(2, '0')}`;
  const email = `${emailLocal}@${SAMPLE_EMAIL_DOMAIN}`;

  const existing = await userExists(email);
  let userId;
  let resuming = false;
  if (existing) {
    userId = existing.id;
    resuming = true;
    console.log(`  [resume] ${email} already exists — reapplying/completing data`);
  } else {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: SAMPLE_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createErr) throw new Error(`createUser(${email}) failed: ${createErr.message}`);
    userId = created.user.id;
  }

  const isTtc = config.trackerMode === 'ttc';
  const { cycles, today } = buildCycles(config);
  const mostRecent = cycles[cycles.length - 1];

  // --- profile / onboarding lifecycle -------------------------------------
  const { error: profErr } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      onboarding_status: 'onboarding_complete',
      onboarding_step: 6,
      onboarding_flow_version: 'v2',
      privacy_consented_at: new Date(addDays(today, -config.historyDays)).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (profErr) throw new Error(`profiles update failed: ${profErr.message}`);

  const dob = addDays(today, -randInt(22, 38) * 365 - randInt(0, 364));
  const typicalSymptoms = pickSome([...PHYSICAL_SYMPTOM_LABELS, ...EMOTIONAL_SYMPTOM_LABELS], 2, 4);
  const conditions = isTtc ? ['None'] : [pick(MEDICAL_CONDITIONS_POOL)];

  const { error: onbErr } = await supabase.from('user_onboarding').upsert({
    user_id: userId,
    date_of_birth: dateStr(dob),
    goals: isTtc ? ['syncing'] : pickSome(GOALS_POOL, 1, 2),
    conditions,
    typical_symptoms: JSON.stringify(typicalSymptoms),
    tracker_mode: config.trackerMode,
    created_at: new Date(addDays(today, -config.historyDays)).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (onbErr) throw new Error(`user_onboarding upsert failed: ${onbErr.message}`);

  const { error: cycErr } = await supabase.from('user_cycle_settings').upsert({
    user_id: userId,
    last_period_start: dateStr(mostRecent.start),
    cycle_length_days: mostRecent.length,
    period_length_days: mostRecent.periodLength,
    is_irregular: config.irregular,
    created_at: new Date(addDays(today, -config.historyDays)).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (cycErr) throw new Error(`user_cycle_settings upsert failed: ${cycErr.message}`);

  const heightCm = randFloat(150, 172, 1);
  let weightKg = randFloat(50, 78, 1);
  const { error: lifeErr } = await supabase.from('user_lifestyle').upsert({
    user_id: userId,
    height_cm: heightCm,
    weight_kg: weightKg,
    activity_level: pick(ACTIVITY_LEVELS),
    diet_preference: pick(DIET_PREFS),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (lifeErr) throw new Error(`user_lifestyle upsert failed: ${lifeErr.message}`);

  if (resuming) {
    // Wipe this user's own time-series rows that have no unique conflict key
    // (meal_logs, lab_results) so a resumed run doesn't duplicate them.
    await supabase.from('meal_logs').delete().eq('user_id', userId);
    await supabase.from('lab_results').delete().eq('user_id', userId);
  }

  // --- daily logs + weight + meals across the full window ------------------
  const startDate = cycles[0].start;
  const baselineTemp = randFloat(36.1, 36.4, 2);
  const dailyLogs = [];
  const weightLogs = [];
  const mealLogs = [];
  const lhReadings = [];
  let stripCounter = 1;
  let lastStripResetCycleStart = null;

  for (let d = new Date(startDate); d <= today; d = addDays(d, 1)) {
    const hit = cycleForDate(cycles, d);
    if (!hit) continue;
    const { cycle, cycleDay } = hit;

    if (chance(0.88)) {
      dailyLogs.push(buildDailyLog(userId, d, cycleDay, cycle, isTtc, baselineTemp));
    }

    if (isTtc) {
      if (lastStripResetCycleStart !== dateStr(cycle.start)) {
        stripCounter = 1;
        lastStripResetCycleStart = dateStr(cycle.start);
      }
      const lh = buildLhReading(userId, d, cycleDay, cycle, stripCounter);
      if (lh) {
        lhReadings.push(lh);
        // Kits come in packs of 5 (live CHECK constrains this to 1-5); wrap
        // around to represent opening a new pack.
        stripCounter = stripCounter >= 5 ? 1 : stripCounter + 1;
      }
    }

    if (chance(1 / 4)) {
      weightKg = Number((weightKg + randFloat(-0.25, 0.2, 2)).toFixed(1));
      weightLogs.push({
        user_id: userId,
        date: dateStr(d),
        weight_kg: Math.max(42, Math.min(110, weightKg)),
        created_at: atTime(d, 7, randInt(0, 30)),
        updated_at: atTime(d, 7, randInt(0, 30)),
      });
    }

    if (chance(0.42)) {
      const mealCount = randInt(1, 2);
      for (let m = 0; m < mealCount; m++) {
        const meal = pick(MEALS);
        mealLogs.push({
          user_id: userId,
          date: dateStr(d),
          name: meal.name,
          calories: randInt(meal.cal[0], meal.cal[1]),
          protein_g: randInt(meal.p[0], meal.p[1]),
          carbs_g: randInt(meal.c[0], meal.c[1]),
          fat_g: randInt(meal.f[0], meal.f[1]),
          logged_at: atTime(d, 8 + m * 6, randInt(0, 59)),
        });
      }
    }

    if (isTtc && chance(0.02)) {
      const med = pick(FERTILITY_MEDS);
      const last = dailyLogs[dailyLogs.length - 1];
      if (last && last.date === dateStr(d)) {
        last.fertility_medication = med;
        last.fertility_medication_dose = med === 'Letrozole' ? '2.5mg' : '50mg';
      }
    }
  }

  if (dailyLogs.length) await upsertChunked('daily_logs', dailyLogs, 'user_id,date');
  if (weightLogs.length) await upsertChunked('weight_logs', weightLogs, 'user_id,date');
  if (mealLogs.length) await insertChunked('meal_logs', mealLogs);
  if (isTtc && lhReadings.length) await upsertChunked('lh_readings', lhReadings, 'user_id,date');

  if (isTtc) {
    const estimates = cycles.map((c) => buildOvulationEstimate(userId, c)).filter(Boolean);
    if (estimates.length) await upsertChunked('ovulation_estimates', estimates, 'user_id,cycle_start');

    if (chance(0.6)) {
      const labs = pickSome(LAB_TESTS, 1, 3).map((t) => ({
        user_id: userId,
        date: dateStr(addDays(today, -randInt(10, config.historyDays - 10))),
        test_name: t.name,
        value: randFloat(t.range[0], t.range[1], 1),
        unit: t.unit,
        notes: null,
        logged_at: new Date().toISOString(),
      }));
      await insertChunked('lab_results', labs);
    }
  }

  return {
    email,
    userId,
    fullName,
    group,
    trackerMode: config.trackerMode,
    isIrregular: config.irregular,
    cyclesGenerated: cycles.length,
    daysLogged: dailyLogs.length,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function argCount(flag, fallback) {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  return arg ? Number(arg.split('=')[1]) : fallback;
}

async function main() {
  const GROUPS = [
    {
      key: 'general',
      count: argCount('general', 25),
      config: {
        historyDays: 180,
        trackerMode: 'menstruation',
        irregular: false,
        cycleLenRange: [26, 32],
        periodLenRange: [4, 6],
      },
    },
    {
      key: 'ttc',
      count: argCount('ttc', 25),
      config: {
        historyDays: 365,
        trackerMode: 'ttc',
        irregular: true,
        cycleLenRange: [24, 45],
        periodLenRange: [3, 8],
      },
    },
  ];

  const names = uniqueNames(50);
  const manifest = [];
  let nameIdx = 0;

  for (const group of GROUPS) {
    console.log(`\n=== Seeding ${group.count} "${group.key}" accounts ===`);
    for (let i = 1; i <= group.count; i++) {
      const fullName = names[nameIdx++];
      try {
        const result = await seedUser({ index: i, group: group.key, fullName, config: group.config });
        manifest.push(result);
        console.log(`  [ok] ${result.email} — ${result.fullName} — ${result.daysLogged ?? 0} daily logs, ${result.cyclesGenerated ?? 0} cycles`);
      } catch (err) {
        console.error(`  [FAIL] ${group.key} #${i} (${fullName}): ${err.message}`);
        manifest.push({ group: group.key, index: i, fullName, error: err.message });
      }
    }
  }

  fs.mkdirSync(path.resolve(process.cwd(), 'scripts/output'), { recursive: true });
  const outPath = path.resolve(process.cwd(), 'scripts/output/sample-accounts-manifest.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify({ emailDomain: SAMPLE_EMAIL_DOMAIN, password: SAMPLE_PASSWORD, generatedAt: new Date().toISOString(), accounts: manifest }, null, 2)
  );
  console.log(`\nManifest written to ${outPath}`);
  console.log(`Shared login password for all sample accounts: ${SAMPLE_PASSWORD}`);
  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
