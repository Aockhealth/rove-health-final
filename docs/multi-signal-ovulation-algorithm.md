# Multi-Signal Ovulation Algorithm — Specification & Validation Protocol

_Created 2026-08-01. Fills the "Multi-Signal Fusion (Bayesian Model)" box that `lh_fsh_strip_integration_plan.md` names but never specifies. Signals: semi-quantitative LH strips, HRV, resting heart rate, menstrual cycle history, plus optional cervical mucus and BBT._

> **Status: specification, not approved clinical logic.** Every threshold in this document is a *starting point for tuning*, not a validated constant. Nothing here ships to users before the Tier 3 validation in §9 and clinician sign-off (Decision 7 of the v3 plan). Two named clinician review gates are marked ⚕ below.

---

## 1. What this replaces

`lh_fsh_strip_integration_plan.md` currently specifies `user_cycle_settings.lh_surge_threshold numeric DEFAULT 40` — a **fixed** LH cutoff shared by all users. That has to go.

Basal LH varies severalfold between women, and in PCOS it is frequently *chronically elevated*. A fixed threshold means a PCOS user reads "surge" on most days of her cycle — she is exactly the user we most want to serve, and a fixed threshold serves her worst. **Everything below is ratio-based against the woman's own baseline.** This is the single most important design decision in the document, and it is the main reason semi-quantitative strips are worth the extra cost over binary ones: binary strips physically cannot express "elevated but not surging."

---

## 2. The rule the whole design hangs on: predict ≠ confirm

Two different questions, two different answers, never merged into one number:

| | **Prediction** | **Confirmation** |
|---|---|---|
| Question | "When is ovulation likely?" | "Did ovulation happen, and when?" |
| Available | Always, from cycle day 1 | Only 2–4 days *after* the fact |
| Driven by | Cycle history, LH trend, mucus | BBT shift, RHR rise, LH peak-then-fall |
| Honest phrasing | "Fertile window likely days 12–17" | "Ovulation confirmed, day 15" |

Every consumer cycle app blurs these, presents a predicted day with the confidence of a measured one, and burns user trust when the period arrives four days "late." Rove's differentiation is being the app that says **"we don't know yet"** when it doesn't, and **"confirmed"** only when a lagging physiological signal actually confirms it.

The UI must never show a predicted ovulation day and a confirmed one in the same visual treatment.

---

## 3. Regulatory line — read before building

**This is a fertility-awareness and cycle-insight feature. It is not contraception, and must never be presented as such.** An app that claims to prevent pregnancy is a regulated medical device (Natural Cycles obtained FDA clearance for precisely this claim, via a large prospective trial — a multi-year regulatory path, not a feature).

Permitted framing: identifying the likely fertile window, confirming that ovulation occurred, tracking cycle patterns over time, and flagging patterns worth discussing with a doctor.

Forbidden framing: "safe days", "you cannot get pregnant today", any birth-control positioning, and any diagnosis of PCOS or infertility.

A persistent, non-dismissible line on every fertility screen: **not for preventing pregnancy.** ⚕ Wording reviewed by clinician and by counsel before release.

---

## 4. Signal inventory

| Signal | Source | Timing vs ovulation | Reliability | Main confounders |
|---|---|---|---|---|
| **Semi-quant LH** | Strip scan / manual | Surge onset ~24–36 h *before* | **High** — best predictive signal | PCOS elevated baseline; multiple surges; test timing of day; hydration/dilution |
| **Cervical mucus (MPIQ)** | Self-logged (optional) | Peak day ≈ ovulation ±1–2 d | Medium — subjective but a real estrogen proxy | Semen, lubricants, infection, some medications |
| **BBT** | Manual thermometer or wearable skin temp (optional) | Rise begins ~1 d *after* | Medium-high, **confirmatory only** | Alcohol, fever/illness, short or broken sleep, inconsistent wake time, shift work, alcohol the night before |
| **Resting HR** | Wearable | Sustained rise through luteal | Medium, confirmatory | Illness, alcohol, hard training, heat, travel, poor sleep |
| **HRV** | Wearable | Generally higher follicular, lower luteal; often a dip near ovulation | **Low — corroboration only** | Training load, stress, alcohol, sleep, measurement method differences between devices |
| **Cycle history** | `daily_logs.is_period` | Provides the prior | Medium; poor when irregular | Irregular/PCOS cycles, missed logging |

**On HRV specifically — a deliberate warning.** HRV is the noisiest and most confounded signal in this list, and it is also the one most likely to be over-trusted because wearables present it so prominently. It gets the lowest weight in §6 and is **never permitted to move a cycle between output states on its own.** An algorithm that leans on HRV to call ovulation will produce confident nonsense.

---

## 5. The model

A Bayesian posterior over "which cycle day was ovulation day", recomputed every time new data arrives.

```
P(ovulation = d | data) ∝ P(d) · Π_s L_s(d)^w_s
```

- `P(d)` — prior from her own cycle history (§5.1)
- `L_s(d)` — likelihood contributed by signal `s` (§5.2)
- `w_s` — signal weight (§6)
- Any signal without usable data contributes a **flat likelihood** — no influence, rather than a bad guess. This gating is what lets the same algorithm serve a woman with only period dates and a woman with strips, a wearable, and a thermometer.

### 5.1 Prior — from her own cycles

The luteal phase is far more stable than the follicular phase (typically ~12–14 days), so ovulation is better estimated backwards from the *next* period than forwards from the last one.

```
L̂     = her median observed luteal length, default 13 when unknown
μ_ov  = median(cycle_length) − L̂
σ_ov  = max(1.5, SD(cycle_length))        // her own variability, floored
P(d)  = Normal(d; μ_ov, σ_ov)
```

Rules:
- Fewer than 3 recorded cycles → population prior with **deliberately wide** σ (≈ 4 days) and a UI state that says so.
- σ_ov > 5 days (irregular / PCOS) → the app **must stop showing a narrow predicted window** and switch messaging to "test daily from day X; we'll tell you when." A confident 3-day window drawn from a 45-day-variable cycle is a lie the maths can't support.
- Once ovulation is confirmed (§7), feed the observed luteal length back into `L̂`. This is the compounding-data advantage from `rove_master_pitch.md`, made concrete: her fourth cycle is predicted better than her first.

### 5.2 Per-signal likelihoods

**LH — semi-quantitative, ratio-based**

```
baseline_LH = rolling median of the lowest tertile of her readings
              over the trailing 60 days (per-user, never a global constant)

ratio(t)    = LH(t) / baseline_LH
surge_onset = first t where ratio(t) ≥ 2.0 AND LH(t) ≥ absolute_floor
peak        = argmax LH(t) within the surge

L_LH(d) = Normal(d; day(peak) + 1.0, 0.7)
```

- `absolute_floor` exists only to stop a noisy near-zero baseline from producing a 2× "surge" out of nothing. ⚕ Value set by clinician against the chosen strip's calibration.
- **Test-timing correction:** LH is commonly higher in afternoon/evening urine, and dilution matters. Store `test_time`, warn on inconsistent timing, and prefer same-time-of-day comparisons within a cycle.
- **Multiple surges are common in PCOS.** Do not treat the first surge as definitive: an LH surge with *no* subsequent BBT or RHR shift is a **failed/false surge**, and the algorithm must be able to say so rather than quietly confirming.
- If the strip is an LH+FSH strip, also record LH:FSH ratio — a persistently elevated ratio is a recognised PCOS-associated pattern and feeds §8's screening flag. **Screening flag only, never a diagnosis.**

**Cervical mucus (optional)**

```
peak_day = last day with peak-type mucus (mpiq_score ≥ threshold)
L_MUC(d) = Normal(d; peak_day + 0.5, 1.2)
```
Wider σ than LH — it is self-assessed. Its value is that it *precedes* LH, extending the useful window earlier for TTC users.

**BBT (optional, confirmatory)**

Use both a classic rule and a change-point fit, and require agreement:

```
Rule A ("3 over 6"): 3 consecutive temps > max(previous 6 lows) + 0.15°C
Rule B: two-level step-function fit over the cycle; take best breakpoint
        by residual sum of squares; require step size ≥ 0.2°C

shift_day = first elevated day
L_BBT(d)  = Normal(d; shift_day − 1, 0.8)
```

Preprocessing is not optional — without it BBT is noise:
- Exclude days flagged as illness/fever (cross-reference symptom logs), alcohol, or sleep < 4 h.
- Exclude readings taken > 90 min outside her usual wake time.
- Winsorise outliers > 0.5 °C from local trend rather than deleting them.
- If using **wearable skin/wrist temperature** instead of an oral BBT, use the device's own nightly *deviation from baseline*, never a spot reading, and keep the two sources in separate columns — they are not interchangeable and must not be mixed within one cycle.

**Resting heart rate (confirmatory)**

```
follicular_baseline = median RHR over cycle days 5–11
rise_day = first day where the 3-day rolling mean RHR
           ≥ follicular_baseline + 1.5 bpm, sustained ≥ 3 days
L_RHR(d) = Normal(d; rise_day − 1.5, 1.2)
```
Same exclusion list as BBT (illness, alcohol, hard training, travel/heat).

**HRV (corroboration only)**

```
z(t) = (HRV(t) − rolling_30d_mean) / rolling_30d_SD
L_HRV(d) = mild peak where a sustained negative z-shift begins,
           σ = 2.0 (deliberately broad)
```
Capped contribution. Cannot change an output state by itself (§7).

---

## 6. Weights and fusion

Starting weights, to be tuned against Tier 3 ground truth — **not to be treated as settled**:

| Signal | Weight | Role |
|---|---|---|
| LH (semi-quant) | 0.35 | Primary predictive |
| BBT | 0.25 | Primary confirmatory |
| Resting HR | 0.20 | Confirmatory, always-on (no user effort) |
| Cervical mucus | 0.15 | Early predictive |
| HRV | 0.05 | Corroboration only |

Weights renormalise across whichever signals actually have usable data this cycle, so a user with only LH + RHR gets a properly scaled posterior rather than a degraded one.

**Data-quality gate before any signal contributes:** minimum readings present, confounder flags absent, and for LH at least 3 baseline readings in the trailing 60 days. Failing the gate → flat likelihood, and the UI names which signal is missing and what it would add. "Add a thermometer and we can confirm, not just predict" is both honest and the best possible upsell.

---

## 7. Output states

```ts
type OvulationState =
  | 'INSUFFICIENT_DATA'      // say so; never guess
  | 'PREDICTED'              // forward estimate + explicit ± band
  | 'SURGE_DETECTED'         // LH surging; ovulation likely in 12–36h
  | 'CONFIRMED'              // ≥2 independent lagging signals agree
  | 'SURGE_UNCONFIRMED'      // LH surged, no thermal/RHR shift followed
  | 'ANOVULATORY_SUSPECTED'  // screening flag only — never a diagnosis
```

Promotion rules:
- → `CONFIRMED` requires **at least two independent lagging signals** (BBT shift, RHR rise) consistent within ±2 days, and posterior mass ≥ 0.6 within ±1 day of the modal day. LH alone can never confirm — it precedes ovulation and a surge does not prove release occurred. HRV alone can never contribute to promotion.
- → `SURGE_UNCONFIRMED` when a surge was detected but no lagging shift followed within 5 days. This is a real and clinically meaningful pattern (LUF, failed surge), and reporting it honestly is more valuable than a fake confirmation.
- → `ANOVULATORY_SUSPECTED` when no surge *and* no thermal/RHR shift by `μ_ov + 2σ_ov`, or by day 21 of a long cycle, whichever is later.

**Confidence must be calibrated, not decorative.** If the app says 80%, it must be right about 80% of the time (§9 measures this). A confidence number that is really a design flourish is worse than none.

⚕ All six user-facing state strings reviewed by clinician before release.

---

## 8. PCOS handling — the reason this matters commercially

Roughly 1 in 5 urban Indian women per `rove_master_pitch.md`, and the population every fixed-threshold competitor serves worst.

1. **Ratio-based surge detection against her own baseline** (§5.2) — chronically elevated LH no longer reads as a permanent surge.
2. **Never confirm on LH alone** — multiple surges per cycle are common; require a lagging signal.
3. **Honest wide priors** — σ_ov > 5 days switches the UI out of narrow-window mode instead of inventing precision.
4. **Anovulatory cycles are a first-class, non-alarming output**, not an error state. Wording matters enormously here.
5. **Cross-cycle pattern flag** — anovulation suspected in ≥2 of 3 consecutive cycles, or a persistently elevated LH:FSH ratio, surfaces a *"worth discussing with a doctor"* card that feeds the doctor PDF (Item 27 of the v3 plan). This is genuinely the highest-value clinical output in the whole product: many women go years without knowing they are not ovulating.
6. **It never says the word "PCOS" as a conclusion.** Pattern description, then a doctor. ⚕

---

## 9. Validation protocol — how we test this

Four tiers. **No user-facing "confirmed" claim ships before Tier 3.**

### Tier 0 — Synthetic cycles (runs in CI, every commit)
Generate cycles with a known ovulation day and realistic per-signal noise. Assert accuracy *and* appropriate refusal.

Adversarial cases that must each be a named test:
- Textbook 28-day cycle, all signals present → confirmed within ±1 day
- Double LH surge (PCOS pattern) → does not confirm on the first surge
- Fever on days 14–16 → BBT excluded, not misread as a thermal shift
- Anovulatory cycle → `ANOVULATORY_SUSPECTED`, never `CONFIRMED`
- 45-day irregular cycle → wide window, no false precision
- LH only, no wearable → `PREDICTED`/`SURGE_DETECTED`, never `CONFIRMED`
- Missing 5 days mid-cycle → degrades gracefully
- Chronically elevated baseline LH → no permanent-surge state
- Alcohol spike in RHR on day 13 → excluded
- Shift worker with irregular wake times → BBT gated out entirely

### Tier 1 — Retrospective replay
Replay any available public or partner cycle datasets containing ground truth. Frozen as a regression corpus so a weight change can never silently degrade accuracy.

### Tier 2 — Internal dogfood cohort
10–20 volunteers (team + friendly testers), 3 cycles, all signals. This is the only way to meet real-world noise: forgotten tests, inconsistent timing, travel, illness. Primary output is a list of failure modes Tier 0 didn't imagine.

### Tier 3 — Clinical ground-truth pilot (the one that matters) ⚕
Nothing else licenses the accuracy claim.

- **Gold standard:** serial transvaginal ultrasound follicular monitoring (observed follicle collapse) — the true reference for ovulation *timing*.
- **Practical secondary:** mid-luteal serum progesterone, which establishes that ovulation *occurred* (commonly cited threshold ~3 ng/mL) but not precisely when. Cheaper, scalable, appropriate for the larger arm.
- **Design:** partner with one fertility clinic. ~25–30 women, one cycle each, deliberately enriched with PCOS and irregular-cycle participants — the hard cases are the point, and a cohort of textbook 28-day cycles would flatter the algorithm and teach us nothing.
- **Ethics:** informed consent, ethics-committee approval, no clinical decisions made from app output during the study.

### Metrics and acceptance thresholds

| Metric | Definition | Ship gate |
|---|---|---|
| **False-confirmation rate** | `CONFIRMED` when ovulation did not occur, or off by > 2 days | **< 5% — the one that matters most** |
| Confirmation accuracy | ‖predicted − true‖ ≤ 1 day, among confirmed cycles | ≥ 80% |
| Confirmation coverage | share of ovulatory cycles reaching `CONFIRMED` | ≥ 70% (full-signal users) |
| Fertile-window capture | predicted window contained true ovulation day | ≥ 90% |
| Anovulation sensitivity | vs. progesterone | ≥ 80% |
| Anovulation specificity | vs. progesterone | ≥ 90% |
| Calibration error | \|stated confidence − observed accuracy\| | ≤ 10 points |

**A wrong "confirmed" is far more damaging than an honest "unsure"** — for a woman trying to conceive it wastes a month, and for anyone misreading it as contraception the consequence is a pregnancy. Every ambiguous tuning decision resolves toward refusing to confirm.

Also report accuracy **stratified by signal set** (LH-only / LH+wearable / full) and **by cycle regularity**. A single headline number would hide exactly the population we built this for.

---

## 10. Data model additions

Builds on `strip_readings` from `lh_fsh_strip_integration_plan.md` and `health_metrics` from Item 6 of the v3 plan.

```sql
-- replaces user_cycle_settings.lh_surge_threshold (fixed) — see §1
alter table user_cycle_settings
  drop column if exists lh_surge_threshold,
  add column baseline_lh numeric,           -- per-user, recomputed rolling
  add column observed_luteal_length numeric; -- learned from confirmations

create table ovulation_estimates (
  user_id uuid, cycle_start date,
  state text,                        -- see §7
  predicted_day int, predicted_sd numeric,
  confirmed_day int, confidence numeric,
  posterior jsonb,                   -- full distribution, for audit + debugging
  contributing_signals text[],       -- which passed the quality gate
  excluded_signals jsonb,            -- which were gated out, and why
  algorithm_version text,            -- REQUIRED — see below
  computed_at timestamptz,
  primary key (user_id, cycle_start)
);
```

`algorithm_version` and the stored `posterior` are not optional. Without them we cannot answer "why did the app tell me day 15 last month?" — which is a support question, a debugging question, and eventually possibly a regulatory one.

---

## 11. Sequencing

This is the **v3.2 headline feature**, and it cannot be pulled earlier — not for lack of engineering time, but because it needs real collected data to validate against. Dependencies:

- Item 6–8 of the v3 plan (health sync) — supplies RHR, HRV, wearable temperature
- `lh_fsh_strip_integration_plan.md` strip capture — supplies semi-quant LH
- MPIQ mucus logging — already schema-present
- **≥ 1 full cycle of real user data** before any tuning is meaningful
- Tier 3 clinical pilot — runs in parallel with v3.1, gates the claim not the code

Suggested order: build the engine and Tier 0 tests during v3.1 (they need no users), run Tier 2 dogfood as v3.0 data accumulates, start the clinic conversation now since ethics approval is slow, and ship user-facing confirmation only once Tier 3 clears.

---

## 12. Open questions for the clinician ⚕

1. `absolute_floor` for LH surge detection, against the specific strip product chosen.
2. Is 1.5 bpm the right RHR rise threshold for an Indian cohort, or should it be relative (percentage of baseline)?
3. BBT step-size threshold — 0.2 °C is the conventional figure; does it hold for wearable wrist temperature, which is measured differently?
4. LH:FSH ratio threshold for the PCOS screening flag, and how it should be worded to a user.
5. How many consecutive suspected-anovulatory cycles should trigger the "see a doctor" card — 2 or 3?
6. Exact wording of all six output states, plus the not-for-contraception disclaimer.
