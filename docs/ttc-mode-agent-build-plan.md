# TTC Mode — Agent Build Plan (Day-by-Day)

_Created 2026-08-01. Written to be executed literally by Claude Code as a solo build agent, one day at a time. Originally scoped to 8 days for the manual-signal engine; extended to 14 after the founder confirmed the Apple Developer account + EAS dev-client build are already ready and chose to extend rather than cut scope for HealthKit._

**Cross-references, not duplicated here:** `ttc-mode-spec.md` (states, tone, screens), `ttc-mode-implementation-plan.md` (LH kit specifics), `multi-signal-ovulation-algorithm.md` (the fusion engine and the two-tier confirmation fix).

**Facts this plan is grounded in, verified against the repo directly — not assumed:**
- `lh_surge_threshold` was **never applied** to the database — it only exists in the unbuilt `lh_fsh_strip_integration_plan.md` design doc. Day 1 creates the baseline column fresh; there is nothing to migrate away from.
- `daily_logs.disruptors` already includes `'Alcohol'` and `'Illness'` chips, and `daily_logs.sleep_minutes` is already a numeric column. BBT exclusion logic reuses both — no new UI needed for those two exclusions.
- The generic `'Painkillers'` disruptor chip is **too coarse for the NSAID/LUF flag** — paracetamol isn't an NSAID and doesn't carry the LUF-suppression risk; ibuprofen and mefenamic acid do. This needs one new, specific input (Day 3).
- `CycleOverviewCard.tsx` is a plain presentational component with no state awareness — extending it for cross-mode reuse (§10b of the algorithm doc) is additive, not a rewrite.

---

## Safety rule — the live app must not be affected while this is being built

**Founder direction, 2026-08-01.** This is non-negotiable and mechanically enforced, not just a promise:

1. **All 14 days happen on a feature branch — never on `main`, never against production.** Existing users on the Play Store / App Store build are running a *compiled artifact* — nothing in a feature branch touches their phones until it is explicitly released. This is the strongest guarantee available and it costs nothing to keep: **don't publish an OTA update or a new store build until the full regression pass at the end of Phase A (Day 8) and Phase B (Day 14) has passed.**
2. **Every migration in this plan is additive only** — `CREATE TABLE` or `ADD COLUMN`, never `ALTER`/`DROP` on a column an existing screen reads. Verified true of every migration already specified (Days 1, 10): `lh_readings`, `health_metrics`, `health_sync_state` are new tables; `user_cycle_settings` and `daily_logs` only gain columns. An old build talking to a migrated database still works unchanged, because nothing it already selects has moved or disappeared.
3. **Two days touch code shared by every existing user, not just TTC — and only these two need an explicit before/after regression gate:**
   - **Day 2** rewrites `shared/cycle/phase.ts`, which every mode's Home/Plan/Insights screens call today. **Before this day is marked done:** run the existing textbook-28-day and standard test accounts through the new code and confirm the phase, cycle day, and fertile window match what today's default-mode users see now — not just that the new TTC test cases pass. A regression here would silently break cycle predictions for every existing user, TTC or not.
   - **Day 4** extends `CycleOverviewCard.tsx` with optional props. It's designed additively (verified: existing callers pass no new props, so their render path is untouched) — but "designed additively" gets *verified*, not assumed: confirm the default-mode Insights screen renders pixel-identical to today before this day is marked done.
   - Every other day either touches new files (Days 5, 6's new content data, 9–13's HealthKit work) or code already gated behind `tracker_mode === 'ttc'` (Day 3, 6, 7) — those cannot affect a default-mode user by construction, so they don't need this same before/after check.
4. **Day 6's `home.tsx:247` deletion is lower-risk than it looks.** That branch only ever fires for `trackerMode === 'ttc'`. Deleting it changes what *existing TTC-mode users* see (replacing a dead placeholder with a working dashboard) — it cannot touch a default-mode (`'menstruation'`) user's Home screen at all, since that code path is never reached for them.
5. **The regression check itself is cheap — it's the existing app, unchanged, on the same real-device checkpoint this project already requires.** No new tooling: open the current default-mode Tracker/Home/Insights on a real phone before starting a shared-code day, note what it shows, repeat after, confirm no difference beyond what that day intentionally added.

---

## Phase A — Manual-signal TTC engine (Days 1–8)

Everything here is fully within the agent's control: no external accounts, no native-module builds, no clinician sign-off blocking the code itself (clinical copy ships flagged ⚕ pending review, per Day 8).

### Day 1 — Schema + honesty fixes

- **Delete the false accuracy claim** at `mobile/src/components/tracker/DischargeQuestionnaire.tsx:235` (*"more than 95% accuracy"*).
- **Wire MPIQ end-to-end.** Columns `mpiq_consistency`/`mpiq_appearance`/`mpiq_sensation`/`mpiq_score` exist (`003_enhanced_tracking.sql`) but nothing writes to them. Wire the questionnaire's save path to populate all four and compute `mpiq_score` from consistency+appearance+sensation.
- **New migration:**
  ```sql
  create table lh_readings (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) on delete cascade not null,
    date date not null, test_time timestamptz not null,
    cycle_day int, band_level int,              -- 0=none..4=darker-than-control
    kit_strip_number int, surge_flag boolean default false,
    created_at timestamptz default now()
  );
  alter table user_cycle_settings
    add column baseline_lh_band numeric,
    add column recommended_test_start_day int;
  alter table daily_logs
    add column bbt_celsius numeric,
    add column bbt_wake_time time,
    add column medications text[] default '{}';  -- values: 'Ibuprofen','Mefenamic acid','Diclofenac/other NSAID','Non-NSAID painkiller','None'
  ```
  Full RLS on `lh_readings`, matching the existing `daily_logs` policy shape.
- **Definition of done:** migrations apply cleanly; RLS test proves cross-user reads fail on `lh_readings`; saving an MPIQ questionnaire produces a non-null `mpiq_score`.

### Day 2 — Engine: variance-aware fertile window + real confidence + ordinal LH

- **Rewrite `isInFertileWindow()` / `calculatePhase()`** in `shared/cycle/phase.ts`. Currently fixed `−5/+1` days around `ovulationDay = cycleLength − lutealLength` (verified, lines 353–361), asymmetric window widens with `σ_cycle` per `multi-signal-ovulation-algorithm.md` §5.1/§2.1 of the mode spec. Above `σ > 5 days`, stop drawing a window at all — switch to "test daily from day X."
- **Make `confidence` (currently a data-source proxy at `phase.ts:322`) into a real statistical value** — keep `dataSource` as a separate field, don't conflate them.
- **Implement the ordinal LH baseline/surge algorithm** (`ttc-mode-implementation-plan.md` §2): `baseline_band` from her own low-tertile readings, `surge_flag = band_level >= baseline_band + 2, floor 3`, first-cycle fallback.
- **Implement `recommended_test_start_day`** (mode spec §0): default day 10, personalised from `μ_ov` at ≥3 logged cycles, honest "may need a second kit" messaging for wide-σ cycles.
- **Definition of done:** unit tests for — textbook 28-day cycle window shape, wide-σ irregular cycle switching out of narrow-window mode, first-cycle LH fallback, elevated-baseline (PCOS-like) LH not falsely surging. **Plus the safety-rule gate above: this touches `shared/cycle/phase.ts`, used by every existing mode — before marking this day done, confirm an existing default-mode test account shows the identical phase/day/fertile-window as before the change, on a real device.**

### Day 3 — Engine: seven-state model + BBT + NSAID flag

- **Implement the state machine** from `multi-signal-ovulation-algorithm.md` §7 (post-revision): `INSUFFICIENT_DATA → PREDICTED → SURGE_DETECTED → LIKELY_CONFIRMED → SURGE_UNCONFIRMED → ANOVULATORY_SUSPECTED`. **`CONFIRMED` is not reachable in Phase A** — it needs RHR, which doesn't exist until Phase B — and that's correct behaviour, not a bug: the evidence-driven gate naturally defers it without any special-casing.
- **BBT logic** (§5.2 of the algorithm doc): Rule A (3-over-6) + Rule B (step-function), **both required to agree** for `LIKELY_CONFIRMED`. Exclusions reuse existing data — `disruptors` array for Alcohol/Illness, `sleep_minutes < 240` for poor sleep, new `bbt_wake_time` compared against her rolling average wake time this cycle (exclude if >90 min off, per the algorithm doc's preprocessing rule).
- **NSAID/LUF flag:** medication log + periovulatory timing rule. Only `'Ibuprofen'`, `'Mefenamic acid'`, `'Diclofenac/other NSAID'` trigger it — explicitly not the generic disruptor chip, and not `'Non-NSAID painkiller'`. ⚕ wording flagged for clinician review, not blocking.
- **Anovulation screening:** cycle-length median/SD/CV against the 2023 guideline's gynaecological-age-dependent thresholds (mode spec, algorithm doc §8), gated by menarche date at onboarding.
- **Definition of done (Tier 0 adversarial tests, from algorithm doc §9, the subset not requiring wearable data):** double LH surge doesn't confirm on the first surge; fever excludes BBT; anovulatory cycle → `ANOVULATORY_SUSPECTED` never `LIKELY_CONFIRMED`; 45-day cycle → wide window; alcohol on a BBT day excludes it; shift-worker wake-time variance gates BBT out entirely.

### Day 4 — Persistence + mode-agnostic reuse

- **`ovulation_estimates` table** per algorithm doc §10 (`state`, `predicted_day`, `confidence`, `posterior jsonb`, `contributing_signals text[]`, `excluded_signals jsonb`, `algorithm_version`). Recompute and upsert on every new signal event — a strip read, mucus log, BBT entry, period log — not on a schedule.
- **Extend `CycleOverviewCard.tsx`** with optional `ovulationState`/`confidence` props (verified: currently plain props, no state awareness — additive change, existing callers unaffected). Render one line when present: *"This cycle: ovulation confirmed, day 15"* / *"This cycle didn't show a typical ovulation pattern."*
- **Wire the anovulation card into Insights for both modes** — per Decision 13, never gated behind TTC.
- **Definition of done:** a hand-built test account with 4 days of logs produces a correct `ovulation_estimates` row; the default (non-TTC) Insights screen shows the anovulation card when triggered, with zero visual regression to existing callers of `CycleOverviewCard`. **Safety-rule gate: this extends a component every mode renders — confirm the default-mode Insights screen is pixel-identical to today's build wherever the new props aren't passed, on a real device, before marking this day done.**

### Day 5 — TTC Tracker UI

- **"Test LH" card:** `SegmentedControl` 5-level band picker (reuses existing component, verified), mandatory `test_time`, strip countdown ("Strip 3 of 5"), static reference-image row (use placeholder assets if real strip photography isn't available yet — flag as a follow-up, don't block on it).
- **BBT entry:** single daily reading, reuses `NumericStepper`-style pattern (verified component exists), plus the new `bbt_wake_time` capture.
- **Medication quick-log:** the 5-option picker from Day 1's schema.
- **Reorder the TTC Tracker** per mode spec §4: LH → mucus (existing `DischargeQuestionnaire`, promoted) → BBT → intercourse (existing) → medication → existing symptoms/moods/sleep.
- **Definition of done:** on a real phone, log a full day's TTC inputs (LH + mucus + BBT + medication) in under 60 seconds; each write lands in the correct table/column from Day 1.

### Day 6 — TTC Home content + state copy

- **Delete the `home.tsx:247` placeholder branch entirely** — the "Log Temperature" button with no `onPress`, per the verified regression. TTC renders the normal Home path with TTC content.
- **New content data files**, mirroring the existing `phaseThemes`/`PHASE_SNAPSHOTS` pattern in `data/home-content.ts`: a TTC snapshot-icon set (LH · Mucus · Temp · Confirmation) and `STATE_COPY[mode][state]` for all seven states, including the lighter default-mode Insights phrasing from algorithm doc §10b.
- **`PhaseOrbRing`:** fertile-probability ring that visibly widens with lower confidence (mode spec §3).
- **`RiverTrack`:** shade the fertile window; mark `LIKELY_CONFIRMED`/predicted visually distinct from each other.
- **TTC onboarding question** (skippable): "Do you have a thermometer? A fitness wearable?" — sets expectations per the signal-availability matrix (mode spec §3a).
- **Definition of done:** four-phase checkpoint on a real device, TTC mode is a strict *superset* of the default dashboard (fixes the verified regression), all seven states render correct copy.

### Day 7 — Plan-tab fallback + reorder flow

- **Plan tab condition-based fallback:** when the posterior is diffuse or `ANOVULATORY_SUSPECTED`, Plan falls back from phase-keyed guidance to condition-based guidance, per the standing decision that a 45-day anovulatory cycle must never be told "you're on day 23, here's your luteal plan."
- **Reorder nudges** (`ttc-mode-implementation-plan.md` §6): strip 4-of-5 nudge linking to the existing Shopify cart (`frontend/src/app/api/shopify`, verified real); proactive "you may need a second kit" for wide-σ cycles, computed at cycle start.
- **Definition of done:** a hand-built 45-day-cycle test account gets condition-based Plan content, not a false luteal-phase claim; a hand-built wide-σ account sees the proactive reorder nudge before running out of strips, not after.

### Day 8 — Full QA + wrap

- **Real-device pass across the signal-availability matrix (mode spec §3a):** P0 (dates only) through P4 (manual BBT only, no strip) — P5/P6 (wearable) are Phase B.
- **Regression check:** existing default-mode users see no visual or behavioural change outside the new Insights line from Day 4.
- **Compile the ⚕ clinician-review checklist** — every state string, the NSAID card wording, the anovulation card wording — into one document for the founder to send out. This does not block shipping the code; it blocks the *claims* going live, per Decision 7.
- **Written note of what's still out of scope:** Android Health Connect, camera LH reading, doctor PDF, lab uploads, WhatsApp — none of this phase.

---

## Phase B — Apple HealthKit integration (Days 9–14)

Layers RHR, HRV and wrist temperature into the **same** engine built in Phase A as new optional likelihood inputs — not a redesign. Sequenced after Phase A deliberately: the manual-signal engine has zero external dependency risk, so it de-risks the sprint first; HealthKit's real-device permission quirks land in the back half where a schedule bump doesn't threaten the whole build.

### Day 9 — Setup + read spike

- Install `@kingstinct/react-native-healthkit` + its Expo config plugin; add the HealthKit capability to the iOS config; rebuild the EAS dev client (should be a straightforward rebuild, not first-time provisioning — dev account and dev client are already confirmed ready).
- Scratch screen: read yesterday's resting heart rate, HRV (SDNN), and wrist temperature if the test device supports it (Apple's wrist-temperature estimate needs Series 8+/Ultra — the app must handle "not available on this device" gracefully, falling back to RHR+HRV only).
- **Definition of done:** real numbers from a real device for RHR and HRV at minimum; delete the scratch screen before Day 10 merges.

### Day 10 — Schema + permission flow

- **Migration:**
  ```sql
  create table health_metrics (
    user_id uuid, date date, source text,        -- 'apple_health' | 'manual'
    resting_hr numeric, hrv_ms numeric, skin_temp_delta_c numeric,
    synced_at timestamptz,
    unique (user_id, date, source)
  );
  create table health_sync_state (
    user_id uuid, source text, data_type text,
    anchor text, last_synced_at timestamptz,
    unique (user_id, source, data_type)
  );
  ```
  Full RLS.
- **"Connect Apple Health" screen**, off Profile and offered once in TTC onboarding (extends Day 6's signal-availability question). Handle: granted, denied, and **partially granted** — iOS never tells you which specific types were refused, so detect "no data arriving for a type" and offer a re-prompt rather than silently failing.
- **Definition of done:** on the real dev-client build — grant → success; deny → a clear, non-dead-end explanation with a path to change her mind in system settings; partial grant doesn't crash anything downstream.

### Day 11 — Sync engine

- Anchored-query incremental sync for RHR, HRV, and wrist temperature where available. Upsert into `health_metrics`; advance the anchor only after a successful write. First-ever sync backfills 90 days behind a progress indicator.
- **Definition of done:** wear a device overnight, open the app, see last night's RHR/HRV; kill and reopen the app 5× with no duplicate rows; airplane-mode mid-sync leaves the anchor unadvanced and recovers cleanly on the next run.

### Day 12 — Wire into the ovulation engine

- Implement `L_RHR(d)` and the temperature-shift likelihood exactly per `multi-signal-ovulation-algorithm.md` §5.2: follicular baseline, sustained rolling-mean rise threshold, same exclusion list as manual BBT (illness/alcohol/hard training/travel/heat — cross-referenced from the existing `disruptors` log, no new UI).
- Fold both into the **same** posterior built in Days 2–4 — this is two more optional likelihood inputs into an already-gated fusion, not new architecture.
- **Definition of done:** a test account with wearable data only (no strip) reaches true `CONFIRMED` — closing the P5 row of the signal matrix; a strip+wearable account reaches `CONFIRMED` reliably (P6); manual-BBT-only accounts from Phase A are provably unaffected and still correctly cap at `LIKELY_CONFIRMED`.

### Day 13 — Surfacing + cross-mode reuse

- TTC Home: RHR/temperature trend joins the LH/mucus sparkline row; state copy updated to name which signals actually contributed this cycle (using `contributing_signals` from Day 4's schema — no new bookkeeping needed).
- Default-mode Insights: Day 4's `CycleOverviewCard` extension picks up wearable-derived `CONFIRMED` automatically — same code path, no branch added for "has wearable."
- **Definition of done:** four-phase checkpoint with a wearable connected, checked in both TTC and default mode.

### Day 14 — Full-stack QA + wrap

- Real-device pass: grant/deny/partial-grant, background delivery firing without opening the app, no duplicates across restarts, airplane-mode recovery.
- Regression pass: every Phase A account (P1–P4) is provably unaffected by Phase B's changes.
- Finalise the ⚕ clinician-review checklist to include the wearable-signal states.
- Written note of what's still out of scope after both phases: **Android Health Connect** (same architecture, straightforward follow-on — do not rebuild the sync engine, just add a second `source`), camera LH reading, doctor PDF, lab uploads, WhatsApp.

---

## What this plan deliberately does not attempt

- **True `CONFIRMED` for a manual-signal-only user.** Per the algorithm doc, that requires two independent lagging signals, and BBT alone is only one. This is correct, not a gap — see the `LIKELY_CONFIRMED` tier.
- **Clinical sign-off.** Every ⚕-marked string ships with placeholder-but-considered copy and a compiled checklist; the founder still needs to close that loop before any claim goes live.
- **Android Health Connect, camera-based LH reading, doctor PDF export, lab uploads, WhatsApp logging.** All previously scoped elsewhere; none of them are in these 14 days.
