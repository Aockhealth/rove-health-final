# Rove — Brand & Strategy Brief

_For investors and marketing strategists. Updated 2026-08-29 — repositioned as a software-only women's health platform. The Cycle Sync supplement line (Rise, Restore, Balance) is no longer part of Rove's strategy and is not referenced below; prior versions of this brief and the pitch deck that centered it have been retired._
_Sources: `src/app/story`, the Rove Health mobile app, `docs/gynae-ecosystem-expansion-plan.md`. Claims not traceable to those sources are flagged in [Open items](#open-items--founder-input-needed) rather than invented._

---

## 1. Who we are

**Two practising doctors in Mumbai — Dr. Aditya Oswal and Dr. Chaitanya Kalra — who kept giving the same inadequate answer to the same patient.**

A woman comes in with PCOS, or PMS severe enough that she plans her month around it, or anaemia she has lived with so long she has forgotten what normal energy feels like. She gets a diagnosis. She gets told to eat better, sleep more, stress less.

Nobody tells her what that means on a Tuesday.

Rove exists to close that gap — the distance between a correct diagnosis and a usable instruction. We are not a wellness brand that hired a doctor for the label. The product decisions come from the same two people who were sitting across the desk.

> **Positioning line:** Medicine gave her a line and moved on. The supplement aisle gave her the same pill regardless of what her body needed that week. The apps gave her a chart and left her to work it out herself. Rove is the software layer that was actually missing — the one that connects what she logs to what she should do about it, and to a doctor when she needs one.

---

## 2. What we're building

**A complete gynaecological companion — one system that covers a woman's reproductive life, not a calendar with a prediction bolted on.**

| Layer | What it does | Status |
|---|---|---|
| **Understand** | Her cycle, symptom, and fertility-signal history read into phase intelligence, pattern analysis, PCOS-specific detection, and a doctor-ready health report | **Live** |
| **Guide** | Phase-matched nutrition (with Indian-cuisine-aware AI recipes), movement, and self-care guidance | **Live** |
| **Expand** | Trying-to-conceive and menopause modes; pattern detection for endometriosis, fibroids, thyroid, recurrent UTI, and sexual wellness; lab result tracking | **In build — see `docs/gynae-ecosystem-expansion-plan.md`** |
| **Connect** | In-app telehealth consultations with real doctors, booked and paid for inside the app | **Planned** |

Logging her cycle and symptoms is how the system knows her, not the pitch — the same way a fitness app needs steps data without being "a step-counting app." The compounding effect is the business: the more of a woman's reproductive life the app covers — irregular cycles and PCOS today, then TTC, then menopause, then the conditions in between — the less reason she ever has to leave for a competitor built around a single life stage. No single layer is defensible alone. Together, one system that actually understands where a woman is in her life is very hard for a single-purpose tracker to copy.

---

## 3. Why the app is better

Most cycle apps are calendars with a prediction. Five differences, all verifiable in the product today:

**It works when her cycle doesn't.** Prediction models built on a regular 28-day assumption degrade exactly where help is most needed — irregular cycles, PCOS, post-partum, perimenopause. Rove's engine derives cycle length from what she actually logged rather than an onboarding guess, and states its own confidence instead of projecting false certainty.

**It interprets rather than reports.** A late period in most apps is a number in large type. In Rove it comes with what that number usually means, what commonly shifts a cycle, and — past a week — what to do next. Symptoms aren't just stored; they are analysed by cycle phase, so "I get headaches" becomes "your headaches cluster in the two days before your period."

**It produces something she can hand to a doctor.** The Health Report is a two-page PDF: cycle statistics, symptoms mapped against phase, sleep, hydration and movement, plus observations worth clinical review — with her own guidance kept on a separate page so it is never confused with clinical findings. In a market where the average PCOS diagnosis takes years and only a minority of women see a gynaecologist annually, walking in with a record instead of a memory is a material change.

**It is built for Indian women specifically.** Indian foods and diets in the nutrition guidance (a dedicated Indian-cuisine mode in the AI recipe engine, not a Western default), Indian conditions in the content library, and clinical thresholds — like the PCOS pattern indicator's BMI cutoff — set to the Asian-population standard actually appropriate for this population, not a Western baseline.

**And it is honest about its own data.** The report prints its own log coverage, averages only across days that were actually recorded, and marks a cycle statistic as indicative when fewer than two cycles exist. Every pattern indicator is explicitly non-diagnostic — it states what her own logged data shows and never a risk score or a diagnosis. Every figure is computed on her phone — no health data is sent to any AI service or third party. In a category where trust is the entire moat, we would rather show a modest number than a confident wrong one.

---

## 4. The ecosystem we are completing

Today Rove serves the menstruating years well, with a real depth advantage in PCOS. The tracking engine, the pattern-detection approach, and the customer relationship all extend across a woman's life — each stage and condition is a reason to stay inside the same system rather than switch to a single-purpose app, at near-zero incremental acquisition cost.

```
ADOLESCENCE → REGULAR CYCLES → IRREGULAR / PCOS → TRYING TO CONCEIVE →
                                                    PREGNANCY → POSTPARTUM →
                                                    PERIMENOPAUSE → MENOPAUSE
·····································································
                    ENDOMETRIOSIS · FIBROIDS · THYROID · RECURRENT UTI
                    · SEXUAL WELLNESS  (condition modules, any life stage)
```

**Telehealth is the unlock.** Right now the app can tell her something is worth discussing with a doctor; it can't yet get her to one. In-app consultations close that loop — booking, payment, and the call itself all inside Rove — and turn every pattern the app surfaces into an actual next step, not just information. This is the single feature most likely to change what Rove *is*, not just what it tracks.

**Each life stage and condition is a reason to stay, not a reason to churn.** The woman who uses Rove for PCOS at 27 is the same woman who needs TTC support at 31 and menopause support at 44. Most single-purpose apps lose her at every transition. We keep her, because the app knows where she is and grows with her.

Full build plan: `docs/gynae-ecosystem-expansion-plan.md`.

---

## 5. Brand and logo

**The wordmark.** ROVE, set in a heavy geometric sans — deliberately plain, close to clinical. The restraint is the point: this is a category drowning in soft pinks, script fonts and flower motifs, all of which signal "lifestyle" precisely when a woman is trying to work out whether something is wrong with her.

**The mark.** The **O** is replaced by a custom glyph: a closed circle above, narrowing into a tapered drop below.

It reads on three levels at once:

- **The ovum and the cycle** — a circle, closed and complete, the shape of a cycle that returns to where it began
- **Female anatomy, abstracted** — the rounded form above a tapering descent, stated in geometry rather than illustration, recognisable without being explicit
- **A compass needle or plumb line** — direction, orientation, a fixed point. *Rove* is to wander; the mark is what keeps the wandering from being lost

**Palette.** Obsidian, paper, taupe, sage. Grounded and material rather than pastel — closer to a clinic than a spa.

**Voice.** Plain, specific, unhurried, and willing to say what we don't know. Two doctors talking to one woman — not a brand broadcasting to a market.

> _Note: no written logo rationale exists in the repository. The reading above is a proposed articulation of what the mark already communicates, for founder approval — not a record of stated design intent._

---

## 6. The one-paragraph version

Rove is a complete gynaecological companion built by two Mumbai doctors, for the 400 million Indian women who are told to "eat better and stress less" and given no instructions. Unlike a calendar with a prediction, it interprets — working hardest where other apps fail: irregular cycles and PCOS. It produces a doctor-ready report that shortens a diagnostic journey measured in years. It is expanding across a woman's full reproductive life — trying-to-conceive, menopause, and condition-specific support for endometriosis, fibroids, thyroid, and recurrent UTI — and adding in-app telehealth so the pattern the app surfaces turns into a doctor visit, not just information. Track, understand, guide, connect — each layer makes the next one more useful, and the whole is very hard to assemble from a single-purpose competitor.

---

## Open items — founder input needed

Flagged rather than guessed. None of these should reach an investor unresolved.

1. **Traction is absent from this brief on purpose.** Users, revenue, retention, repeat rate — no verifiable figures exist in the repo. Investors will ask first; supply the real numbers.
2. **The pivot away from commerce needs a clean answer ready.** This brief and the strategy behind it changed from a tracking-plus-supplement business to an app-only platform. An investor who saw an earlier version, or who diligences the live shop, will ask why — have the reasoning ready (focus, regulatory simplicity, faster iteration on the software moat) rather than let it look like commerce didn't work.
3. **Team and advisory board** — currently only the two co-founders are listed anywhere. Any deck or pitch document should match what actually exists.
4. **Telehealth's regulatory and staffing path** — booking real doctors for paid consultations has a different compliance and liability profile from a tracking app. Investors will ask before this ships; the answer should be ready alongside the build plan.
