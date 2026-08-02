# TTC Mode — Implementation Plan (LH Kit Integration)

_Created 2026-08-01. Turns `ttc-mode-spec.md` into a build plan, now grounded in a real physical asset: a semi-quantitative LH kit, tested days 10–14, already in hand. Same one-item-per-day format as `react-native-migration-team-plan.md`._

> **Assumption stated up front — correct me if wrong.** "Semi-quant, day 10/11/12/13/14" is read here as a **5-strip kit**, one strip per day, each read as a **graded band intensity** (e.g., no line / faint / medium / dark / darker-than-control) rather than a numeric concentration. If the kit instead has a reader device producing a number, §2 changes (numeric input, richer per-user model) but nothing else does — the schema and UI shell are the same either way.

---

## 0. The conflict this kit creates — solve this before writing any code

**A fixed day-10–14 kit assumes a ~28-day cycle ovulating around day 14. That is precisely the population TTC+PCOS is *not*.**

Verified from the clinical research: PCOS cycles routinely run 35–90+ days, with ovulation — when it happens at all — landing anywhere from day 20 to day 45. A woman with a 45-day cycle who tests days 10–14 **will burn her entire kit before her fertile window opens**, get five negative reads, and reasonably conclude either that the product is broken or that she isn't ovulating — when the truth is simply that the kit tested the wrong week.

This is not a hardware problem, it's a **scheduling problem**, and it's exactly the one the patent research killed as unpatentable in India (economic scheduling isn't a technical effect) — so we build it anyway, just don't file on it.

### The fix: the kit's 5 strips are a resource the algorithm allocates, not a fixed calendar

- **Default (< 3 cycles logged, or a regular cycle):** anchor the 5-day window to **day 10–14**, matching the kit as designed. This is correct for most non-PCOS TTC users and requires no change.
- **Personalised (≥ 3 cycles logged):** anchor the window to **her own predicted ovulation day − 4 to ovulation day**, using the same `μ_ov` the fertile-window engine already computes (`multi-signal-ovulation-algorithm.md` §5.1). A woman with a 40-day median cycle gets prompted to start testing around day 22, not day 10.
- **Irregular / wide-σ cycles:** be honest that 5 strips may not cover it. Surface **"your cycles vary enough that ovulation could land outside a single 5-day kit — here's when we recommend starting, and you may need a second kit"** rather than silently letting her burn strips on the wrong week. This is a store-listing and reorder-flow decision, not just a UI string — see Item 6.
- **Never let the app blame her cycle for the kit running out.** If she reaches strip 5 with no surge and her own variability suggests ovulation hasn't happened yet, the message is **"you may ovulate later than this kit covers — here's what to do next,"** never "no surge detected" presented as a normal negative result.

This single decision — *personalise the testing window, don't hand every user the same 5 days* — is the difference between this being a generic OPK-in-an-app and it being the TTC+PCOS product from `ttc-mode-spec.md` §1.

---

## 1. Data model

```sql
-- one row per strip read
lh_readings (
  id, user_id, date, test_time timestamptz,   -- test_time matters — see §3
  cycle_day int,                               -- computed at write time, not recomputed later
  band_level int,                              -- 0=none 1=faint 2=medium 3=dark 4=darker-than-control
  kit_strip_number int,                        -- 1-5, which strip of the box this was
  surge_flag boolean default false,             -- set by the algorithm, not the user
  created_at
)

-- extends user_cycle_settings, replacing the fixed default per the algorithm doc
alter table user_cycle_settings
  add column baseline_lh_band numeric,          -- rolling median of her own low-tertile band_levels
  add column recommended_test_start_day int;    -- computed each cycle — see §0
```

`kit_strip_number` is not cosmetic — it's what lets the app say "2 strips left" and drive the reorder nudge in Item 6.

## 2. The band-level algorithm (adapts `multi-signal-ovulation-algorithm.md` §5.2 to ordinal data)

The algorithm doc's `ratio(t) = LH(t) / baseline_LH ≥ 2.0` assumes a continuous number. A 5-level band read needs an ordinal version:

```
baseline_band = median of her own lowest-tertile band_level readings,
                across all cycles logged (not just this one) — a new user's
                first cycle has no personal baseline, see fallback below

surge_flag(t) = band_level(t) >= baseline_band + 2 levels
                AND band_level(t) >= 3   // absolute floor: never call a
                                          // "faint" reading a surge even if
                                          // her baseline is 0/none

peak = the highest band_level day within a run of elevated readings
```

**Fallback for a first-time user with no personal baseline:** default `baseline_band = 0` (no line) and require `band_level(t) >= 3` alone to flag a surge — i.e., fall back to something close to the kit's own printed instructions until we have her own history. **This is exactly the population the LH data eventually personalises for** — her second cycle already reads better than her first, which is the compounding-data story from the original pitch deck made concrete in the cheapest possible feature.

**PCOS caution carries over unchanged:** a woman with an elevated baseline (e.g., her low-tertile reads are already "medium") needs +2 levels *from her own baseline* to register, not from zero — this is the direct band-level analogue of the ratio-based fix in the algorithm doc, and it's the reason a fixed threshold was wrong in the first place.

## 2a. Wiring into the Bayesian posterior — this was left implicit above, made explicit here

`§2`'s `surge_flag`/`peak` are not a separate output. They plug directly into the existing likelihood slot in `multi-signal-ovulation-algorithm.md` §5.2:

```
L_LH(d) = Normal(d; day(peak) + 1.0, 0.7)      // unchanged — same as the continuous version
```

**Why the ordinal-to-continuous swap costs nothing here:** the likelihood only needs *which day* the peak fell on, not the reading's magnitude. A 5-level band identifies the peak day exactly as well as a continuous number does. The one thing ordinal data can't support — sub-day surge-onset interpolation from an intensity curve — needs more than 1 reading/day anyway, and it's precisely what killed the "Tonic/Transient LH Deconvolution" candidate in the patent stress-test (scored 3/10 — *"the discriminator is not observable"* at one sample per day, `patent-landscape-fto.md`). So nothing is being given up by using a graded strip instead of a numeric reader; that capability was never reachable at this test frequency regardless.

**What genuinely changes:**
- **The data-quality gate is unchanged in spirit.** LH only contributes to the posterior once `baseline_lh_band` is established from ≥3 of her own low-tertile readings — same rule as the continuous version's 60-day baseline requirement (algorithm doc §6). Before that, LH contributes via the §2 fallback (`band_level >= 3` alone).
- **Weight stays at 0.35, even for first-cycle fallback readings.** The ambiguity of "no personal baseline yet" is absorbed by using the wider, more conservative fallback threshold — not by silently down-weighting the signal. Down-weighting would make the app worse for exactly the new users it most needs to prove itself to.
- **Multiple surges are easier to flag with bands, not harder.** A second elevated day after the peak has already fallen back to baseline reads cleanly as "day 18 shows another elevated read after day 14's peak — a multi-surge pattern" — and per algorithm doc §7, LH alone still cannot promote to `CONFIRMED`; each surge without a following BBT/RHR shift is independently marked `SIGNATURE_UNCONFIRMED` rather than the app picking the first surge as truth.
- **Recompute the posterior on every new signal event** — a band read, a mucus log, a BBT entry, a wearable sync — not on a fixed schedule. It's a cheap update over the cycle-day grid, not a heavy retrain.
- **`ovulation_estimates.contributing_signals`** (algorithm doc §10) should record `'lh_band'` specifically, distinct from a future `'lh_quant'` if a numeric reader is ever added — so accuracy can later be reported stratified by input type, which the algorithm doc's validation protocol already requires stratifying by signal set and cycle regularity.

### The loop that actually compounds — this is the product's real moat, not the algorithm alone

Prior and likelihood aren't two separate systems here; they're one loop, and each confirmed cycle tightens the next:

```
μ_ov, σ_ov  (her cycle history, algorithm doc §5.1)
     │
     ▼
recommended_test_start_day (§0 above) — "test around day 22," not a fixed day 10
     │
     ▼
She tests → band_level readings → surge_flag / peak (§2)
     │
     ▼
L_LH(d) folds into the SAME posterior alongside mucus / BBT / RHR / HRV (algorithm doc §5)
     │
     ▼
Posterior drives: fertile-window width, the six Home states (algorithm doc §7), the BBT-reminder trigger (§5 above)
     │
     ▼
If CONFIRMED (≥2 independent lagging signals agree):
observed luteal length feeds back into L̂ (algorithm doc §5.1)
     │
     ▼
NEXT cycle's μ_ov is sharper → recommended_test_start_day is more accurate
→ fewer strips wasted, a tighter window, next cycle
```

Her fourth cycle's test window is personalised off three cycles of real data; her first isn't. That gap, compounding every cycle, is the thing the patent research ranked **first** in the defensibility stack — *above patents* (`patent-landscape-fto.md` §2: "a proprietary validated dataset in a population nobody has measured"). The Bayesian model isn't a separate clever feature sitting next to the kit — the kit is what feeds it, cycle after cycle.

## 3. Manual entry UI

Reuses existing components — no new primitives needed:

- **`SegmentedControl`** for band selection: 5 tabs, "No line / Faint / Medium / Dark / Darker than control" — matches the pattern already used elsewhere in the tracker.
- **Time-of-day capture is mandatory, not optional.** LH reads higher in afternoon/evening urine (algorithm doc §5.2). Log `test_time`; if she tests at a wildly different hour than her prior reads this cycle, show a small inline note — *not* a blocking warning — "LH can vary with time of day; try testing around the same time each day for the clearest trend."
- **Strip countdown, visible on the entry screen:** "Strip 3 of 5" — sets expectations and is the natural trigger point for the Item 6 reorder nudge.
- A **reference image row** showing what each band level looks like against a photographed real strip, not just text labels — band intensity is genuinely hard to self-assess consistently without a visual anchor, and this is cheap to build (static images, no CV).

## 4. Screen changes

| Screen | Change |
|---|---|
| **TTC Tracker** | New "Test LH" card, ordered first among daily inputs per `ttc-mode-spec.md` §4. Shows today's recommended action: "Test today" / "You've got 2 days before your window opens" / "Last strip — make it count" |
| **TTC Home** | `SnapshotIcons` LH slot shows band trend as a small sparkline (5 dots, current cycle) rather than a raw number — legible at a glance, matches the existing snapshot-icon visual language |
| **Onboarding (TTC path only)** | One new question: "Do you know your typical cycle length?" — if yes, compute `recommended_test_start_day` immediately rather than waiting for 3 logged cycles. If no, default to day 10 and refine as data arrives |

## 5. The confirmation handoff — connects to the fusion engine

A detected surge (`surge_flag = true`) does **not** by itself set `CONFIRMED` (per `multi-signal-ovulation-algorithm.md` §7 — LH alone can never confirm, only BBT/RHR lagging shift can). What it *does* do:

- Sets `SURGE_DETECTED` immediately — the clearest, most actionable state in the whole product.
- Triggers a **BBT reminder** for the next 3 mornings if BBT isn't already being logged — this is the moment a lagging signal is most valuable, so ask for it exactly then rather than every day regardless of relevance.
- If no BBT/RHR shift follows within 5 days, degrades to `SIGNATURE_UNCONFIRMED`, per spec — never silently drops the surge.

## 6. The reorder flow (commercial, not just UX)

Because the kit is a **consumed physical good**, running out mid-cycle is a real failure mode with a real fix:

- **Strip 4 of 5, no surge yet:** in-app nudge — "1 strip left. If you'd like a backup kit before your window closes, order here" — linking to the existing Shopify integration (`frontend/src/app/api/shopify`).
- **Personalised window predicted to extend past 5 strips** (irregular cycle, computed at cycle start per §0): proactive nudge *before* she starts testing — "Based on your cycle history, you may need a second kit this cycle" — set expectations before disappointment, not after.
- This is also the natural trigger for a **multi-kit subscription** tied to her personal cycle length rather than a flat monthly cadence — longer cycles need more strips, and the app already knows her `μ_ov`.

## 7. Build order

**Day 1** — Schema (`lh_readings`, `user_cycle_settings` additions) + RLS. Delete `lh_surge_threshold DEFAULT 40` per the algorithm doc, replaced by `baseline_lh_band`.

**Day 2** — Band-level algorithm (§2): baseline computation, surge detection, new-user fallback. Unit tests covering: first-cycle fallback, elevated-baseline PCOS case, a run of same-level reads not falsely triggering.

**Day 3** — `recommended_test_start_day` computation (§0): default day 10, personalised from `μ_ov` at ≥3 cycles, wide-σ messaging. This is the highest-value logic in the whole feature — the thing that stops this being "just an OPK app."

**Day 4** — Manual entry UI: `SegmentedControl` band picker, mandatory `test_time`, strip countdown, reference-image row.

**Day 5** — Screen wiring: Tracker card, Home sparkline, onboarding question. Confirmation handoff to BBT reminder (§5).

**Day 6** — Reorder nudges (§6) wired to the existing Shopify cart. QA: a hand-built 45-day-cycle test account must receive a personalised (not day-10) test window and an honest "may need a second kit" message — this is the one checkpoint that proves the feature works for the population it's built for, not just the textbook case.

**~6 engineer-days total.** No new dependencies, no camera work, no new UI primitives — the entire feature reuses `SegmentedControl` and the existing Shopify plumbing. The cost is concentrated in Days 2–3: the personalisation logic, not the interface.

## 8. Definition of done

1. A textbook 28-day-cycle user sees day 10–14 by default, tests, and gets a surge read.
2. A 40-day-cycle user with ≥3 logged cycles gets a **personalised** window, not day 10–14.
3. A user who reaches strip 5 with no surge, on a cycle whose variability predicted this, sees **"you may ovulate later than this kit covers"** — never a bare negative.
4. A PCOS user with an elevated baseline needs a genuinely elevated read (+2 bands from *her* baseline) to trigger `SURGE_DETECTED` — a chronically "medium" reader never falsely surges.
5. A detected surge prompts BBT logging for the following 3 days, and degrades honestly to `SIGNATURE_UNCONFIRMED` if nothing follows.
6. Nothing here computes or displays a diagnosis — band level and cycle-day trend only, per `rove-v3-ttc-pcos-plan.md` §1.2's four-way convergence framing.
