# TTC Mode — Design Specification

_Created 2026-08-01. Grounded in verified codebase state (not inferred), the competitive teardown, and the TTC/PCOS clinical research. Companion to `multi-signal-ovulation-algorithm.md` (the engine) and `rove-v3-ttc-pcos-plan.md` (the strategy)._

---

## 0. What is actually true in the code today — all four verified directly

| Finding | Evidence | Severity |
|---|---|---|
| **TTC mode is a dead end.** Selecting it *removes* the phase orb, next-period countdown, ovulation date, fertile window, nutrients, phase focus and content rail, replacing them with a placeholder and a "Log Temperature" button with **no `onPress`** | `mobile/src/app/(app)/home.tsx:247-263` | **Ships today** |
| **An unsubstantiated accuracy claim is live in production** — the literal string *"more than 95% accuracy"* | `mobile/src/components/tracker/DischargeQuestionnaire.tsx:235` | **Fix this week** |
| **Cervical mucus data is collected and thrown away.** `mpiq_consistency / mpiq_appearance / mpiq_sensation / mpiq_score` exist in `003_enhanced_tracking.sql` — **zero writes anywhere** in `mobile/src` or `frontend/src`. `mpiq_score` is never computed | grep across whole tree | High |
| **The fertile window is variance-blind.** `isInFertileWindow()` is `day >= (cycleLength − lutealLength) − 5 && day <= +1`. `is_irregular` never reaches it | `shared/cycle/phase.ts:353-361` | **This is the core defect** |
| **`confidence` is not statistical and is never shown.** It is a data-source proxy — `logs`→high, `settings`→medium, else low — computed at `phase.ts:322` and referenced once in `insights.ts:199`, rendered on no screen | `shared/cycle/phase.ts:30,322` | High |

**Read together:** the app is *most confident where it should be least*, tells a woman with a 45-day irregular cycle the same ±1-day story it tells a textbook 28-day user, and hides the one field that could qualify it. For a general tracker that's a flaw. **For TTC it is the whole product.**

---

## 1. The design thesis

Every competitor answers *"when is your fertile window?"* — a question that presupposes ovulation happens. Verified from the teardown: **Ava hard-caps at 24–35 day cycles. Clearblue Advanced excludes PCOS outright. Glow assumes regularity. Natural Cycles degrades to near-all-red. Oura explicitly disclaims anovulation detection.**

> **Rove's TTC mode answers a different question: "is this cycle working, and what should I do today?"**

Three principles, in priority order:

1. **Honest uncertainty beats false precision.** A window that widens when we know less is more useful than a fixed one that's confidently wrong — and it is the only claim in this category that nobody else makes.
2. **Predict and confirm are different screens.** Prediction is always available. Confirmation only exists 2–4 days later. Never render them alike.
3. **Never leave her without today's action.** TTC is a daily loop. Every state — including "we don't know" — resolves to one concrete thing to do.

---

## 2. Engine changes (do these first — the UI is worthless without them)

### 2.1 Variance-aware fertile window — replaces the fixed ±5/+1

```
σ_cycle = SD of her last 6 observed cycle lengths      (from daily_logs.is_period)
L̂       = her observed luteal length, default 13
μ_ov    = median(cycleLength) − L̂

window_before = 5 + ceil(σ_cycle)
window_after  = 1 + ceil(σ_cycle / 2)
```

Rules:
- **< 3 recorded cycles** → population σ ≈ 4 days, and the UI says so explicitly.
- **σ > 5 days** (irregular / PCOS) → **stop drawing a window at all.** Switch to *"Test daily from day X — we'll tell you when."* A confident 6-day window drawn from a 45-day-variable cycle is a lie the maths cannot support, and it is exactly what makes clinicians dismiss consumer apps.
- **Sperm survival is asymmetric** — the window must extend further *before* than after. Never symmetric.

### 2.2 Make `confidence` mean something

Today it reports data provenance. It must report **statistical confidence in the ovulation-day estimate**, derived from σ_cycle, number of observed cycles, and which signals are present. Keep the provenance value as a separate `dataSource` field — it already exists.

### 2.3 Wire MPIQ end-to-end

The questionnaire already collects consistency, appearance and sensation. Write them to their columns, compute `mpiq_score`, and feed it to the engine. **Peak-type mucus is the only signal available today with genuine *lead time*** — it precedes ovulation, where temperature and RHR both lag. For a TTC product that is not a nice-to-have; it is the most valuable signal already sitting unused in the codebase.

### 2.4 Delete the accuracy claim

`DischargeQuestionnaire.tsx:235`. Unsubstantiated medical accuracy claim in a shipping health app — and under the CCPA Guidelines 2022 a disclaimer cannot cure it. **Independent of this spec. Do it this week.**

---

## 3. The TTC Home screen

**Same components, same layout, content swapped** (Decision 14). Delete the `home.tsx:247` early return; TTC renders the normal path with TTC content. No new screens.

| Slot | Default mode | TTC mode |
|---|---|---|
| `PhaseOrbRing` | Phase colour + cycle day | Same orb; ring renders **fertile probability**, and **visibly widens when confidence is low** — the uncertainty is the design, not a caveat under it |
| Countdown | "Period in 9 days" | "Ovulation likely in 3 days" / "Peak fertility today" / **"Ovulation confirmed — day 15"** |
| `SnapshotIcons` ×4 | Hormones · Mind · Body · Skin | **LH · Mucus · Temp · Confirmation** |
| `PHASE_EXPLAINERS` | What's happening | **Today's one action** — "Test LH this afternoon", "High fertility — today and tomorrow matter most" |
| `RiverTrack` | Cycle timeline | Same timeline, fertile window shaded, **confirmed ovulation marked distinctly from predicted** |
| Content rail | General articles | TTC / PCOS articles |

### The seven states, and the action each resolves to

> **Updated 2026-08-01** — `multi-signal-ovulation-algorithm.md` §7 was revised to split confirmation into two tiers. The original single `CONFIRMED` state required BBT **and** RHR, which only a wearable can supply — meaning a strip + a manual thermometer, the realistic near-term majority of TTC users, could never reach it. `LIKELY_CONFIRMED` is the fix: one clean lagging signal, honestly labelled as one signal rather than silently upgraded.

| State | Home reads | Action |
|---|---|---|
| `INSUFFICIENT_DATA` | "Still learning your cycle" | Log your period — that's what we need |
| `PREDICTED` | "Ovulation likely around day 15 ± 3" | Start testing day 11 |
| `SURGE_DETECTED` | "LH surging — today and tomorrow matter most" | The clearest signal in the whole product |
| `LIKELY_CONFIRMED` **(new)** | "Your temperature suggests ovulation happened around day 15" | Fertile window likely closed. If you'd like full confirmation, connect a wearable |
| `CONFIRMED` | "Ovulation confirmed — day 15" | Fertile window closed. Rest. |
| `SURGE_UNCONFIRMED` | "We saw a surge but no confirming shift" | Keep testing; mention at your next appointment |
| `ANOVULATORY_SUSPECTED` | "This cycle didn't show an ovulation pattern" | Worth discussing with a doctor — **not** an alarm |

**The last three states are the differentiator.** Nobody ships them. They are also the honest output of an engine that refuses to overclaim — and `LIKELY_CONFIRMED` exists specifically so that honesty doesn't come at the cost of leaving most real users permanently stuck one rung below where their actual data supports.

---

## 3a. Signal availability — designing for every real combination

Users will arrive with wildly different hardware. The engine already degrades signal-by-signal (`multi-signal-ovulation-algorithm.md` §5–§6: any missing signal contributes a flat likelihood, weights renormalise across whatever's present) — so this is not N special cases to build, it's one engine plus **honest state ceilings per profile**, computed live from what she's actually logging, never stored as a fixed label that could go stale.

| Profile | Has | Ceiling reachable | What's missing to go further |
|---|---|---|---|
| **P0 — Dates only** | Period dates | `PREDICTED` | Everything — this is the floor, and it's available to literally every user from day one |
| **P1 — Strip only** | + LH strip | `SURGE_DETECTED` | No lagging signal at all. Stays here forever without one — **the UI must say why**, not just stop advancing |
| **P2 — Strip + mucus** | + cervical mucus | `SURGE_DETECTED` (tighter confidence) | Same ceiling as P1 — **mucus is coincident-timing, not lagging, and can never promote to either confirmation tier** (§7). It measurably improves *which day* is predicted; it cannot confirm |
| **P3 — Strip + manual BBT** | + thermometer, no wearable | **`LIKELY_CONFIRMED`** | A second independent lagging signal (RHR), which requires a wearable |
| **P4 — Manual BBT only** | Thermometer, no strip | **`LIKELY_CONFIRMED`** | Promotes directly from `PREDICTED` on a clean thermal shift — **never gated behind a preceding surge she has no way to detect** |
| **P5 — Wearable only** | HRV/RHR/temp, no strip | **`CONFIRMED`** | Nothing, for confirmation — a wearable alone supplies both lagging channels. Loses the strip's early lead time on *predicting* the window, not on confirming it |
| **P6 — Strip + wearable** | + optionally mucus/manual BBT | **`CONFIRMED`**, reliably | This is the target full-signal experience, not the only viable one |

**This table is the actual product requirement, not documentation of a nice-to-have.** P3 and P4 — strip and/or thermometer, no wearable — are very likely the majority of real users for months, since wearable ingestion needs the EAS dev-client migration and a paid Apple Developer account (v3 plan, Decisions 1–2) that hasn't shipped yet. If `LIKELY_CONFIRMED` didn't exist, the entire "confirmed ovulation, not predicted" headline claim — the single biggest differentiator in this whole plan — would be unreachable for most people using the product on day one.

### The signal-availability onboarding question (TTC path only)

One optional, skippable question early in TTC onboarding: *"Do you have a thermometer? A fitness wearable?"* Two things this buys, cheaply:

1. **Correct expectations from the first screen**, instead of a user discovering her ceiling by disappointment three cycles in — *"With your kit alone, we'll tell you when a surge happens. Add a ₹150 thermometer and we can tell you the likely day."*
2. **The right upsell at the right moment.** The existing surge → BBT-reminder trigger (`ttc-mode-implementation-plan.md` §5) already asks for a thermometer reading right when a surge fires — the single best-timed moment in the whole cycle to ask. Extend the same trigger to nudge a wearable connection for users who have neither, at that identical moment, rather than nagging on a fixed schedule.

Never make this question required, and never let a skipped answer silently cap what the engine will attempt — always compute the reachable ceiling live from what's actually logged that cycle, since a user's situation changes (she buys a thermometer, a wearable, or stops using one) and a stored answer would drift stale.

---

## 4. TTC Tracker — what she logs daily

Existing components, reordered for TTC, plus one new input:

1. **LH strip** — *new.* Manual entry first (band intensity: none / faint / medium / dark / darker-than-control). Camera reading later. **Per-user baseline, never a fixed threshold** — a fixed cut reads positive continuously in PCOS, and `lh_surge_threshold DEFAULT 40` in the LH plan must be deleted before this ships.
2. **Cervical mucus** — existing `DischargeQuestionnaire`, promoted to primary and finally *wired*.
3. **BBT** — *new.* One reading, waking, before activity. With honest exclusion prompts: illness, alcohol, sleep < 4h, unusual wake time. A BBT series without those exclusions is noise.
4. **Intercourse** — already logged via `SEX_ACTIVITY_OPTIONS`. Surfaces in the doctor export as timing relative to the fertile window, which is a real clinical question.
5. **Medication** — *new, and cheap.* See §5.

## 5. The NSAID flag — build this in the first release

**Periovulatory NSAID exposure raises luteinized-unruptured-follicle rates from 3.4% to 35.6% of cycles** (Micu 2011), and to 94.2% with etoricoxib. **No consumer cycle product flags this.**

Mefenamic acid and ibuprofen for period pain are extremely common in India. A woman may be suppressing her own ovulation and nothing tells her.

Implementation: medication logging + a periovulatory timing rule + one plainly worded card. **Zero hardware, ~1 day of work.** ⚕ Clinician-reviewed wording; frame as "worth discussing with your doctor before your next cycle," never "stop taking your medication."

This is the single best demonstration that Rove understands the problem better than the category does.

---

## 6. Deliberately NOT in TTC mode

- **No contraception or "safe days" mode**, ever. DMR Act s.3(a) makes it a criminal advertising offence in India, and Ava US12502162B2 runs to 2042.
- **No luteal-phase-deficiency finding.** ASRM: no reliable LPD test exists; a short luteal phase occurs in 9–13% of normal cycles and does not reduce 12-month fecundity. Products that diagnose it manufacture anxiety.
- **No "you ovulated."** LUF produces a normal surge, normal thermal shift and no oocyte — ~5% of fertile cycles, **25% of first cycles in unexplained infertility**. Say *"your cycle showed an ovulatory signature."*
- **No fertility-boosting food claims.** Nutrients with established preconception roles, yes. Outcome promises, no — unsupportable, and cruel to someone eighteen months in.
- **No streaks or gamification on conception.** She is not failing a challenge.

---

## 7. Tone — this matters more here than anywhere else in the app

TTC users are frequently distressed, and many arrive after months of trying. Rules:

- **Never imply control over the outcome.** Support the body; never promise a result.
- **Never celebrate a negative.** No confetti for a closed fertile window.
- **Say "we don't know" plainly** when the posterior is diffuse. It builds more trust than a confident guess that turns out wrong — and it is the brand position no competitor can copy without rebuilding their engine.
- **An anovulatory cycle is information, not failure.** Wording ⚕ clinician-reviewed before it ships.

---

## 8. Build order

**Week 1 — honesty and foundations (~4 days)**
1. Delete the "95% accuracy" string · *0.25d*
2. Wire MPIQ end-to-end + compute `mpiq_score` · *1d*
3. Variance-aware fertile window + real `confidence` · *1.5d*
4. Delete `lh_surge_threshold DEFAULT 40`; per-user baseline · *0.5d*
5. NSAID/LUF flag · *1d*

**Week 2 — TTC content layer (~4 days)**
6. Delete the `home.tsx:247` stub; TTC content in every slot · *2d*
7. Phase-confidence gating — Plan falls back to condition-based guidance when the posterior is diffuse · *1d*
8. Six-state Home copy ⚕ · *1d*

**Weeks 3–4 — daily inputs (~5 days)**
9. LH strip manual entry + per-user baseline surge detection · *2d*
10. BBT entry with exclusion prompts · *1.5d*
11. TTC Tracker reordering · *1d*

**Weeks 5–6 — engine + bridge**
12. Multi-signal fusion per the algorithm spec, with the corrections applied (rise not nadir, baseline-deviation not IBI thresholds, no wearable in the trigger path)
13. Doctor export — cycles, ovulation ledger, intercourse timing, medications

---

## 9. Definition of "best" — how we'd know

1. A woman with a **45-day irregular cycle** gets an honest, useful experience — not a 28-day model stretched over her.
2. Every day, in every state, she knows **the one thing to do today**.
3. The app **says "we don't know"** when it doesn't, and she trusts it more for that.
4. She learns something **no other app would have told her** — the NSAID flag, the anovulatory pattern, the mucus lead time.
5. She can hand a gynaecologist **one page they'll actually read**.

Nobody in this category clears all five. Three of them nobody clears at all.
