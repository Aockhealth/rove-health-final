# Rove — Brand & Strategy Brief

_For investors and marketing strategists. Created 2026-08-11._
_Sources: `rove shop and website/src/data/products.ts`, `src/app/story`, `src/data/advisors.ts`, the Rove Health mobile app, `Cycle Sync Formulation - 2 capsules with Mg.pdf`, and `docs/rove_pitch_deck.md`. Claims not traceable to those sources are flagged in [Open items](#open-items--founder-input-needed) at the end rather than invented._

> **Read open item 1 before circulating this.** The formulation sheet and the live website use the names *Rise* and *Restore* for opposite products. The doses agree; only the labels are swapped.

---

## 1. Who we are

**Two practising doctors in Mumbai — Dr. Aditya Oswal and Dr. Chaitanya Kalra — who kept giving the same inadequate answer to the same patient.**

A woman comes in with PCOS, or PMS severe enough that she plans her month around it, or anaemia she has lived with so long she has forgotten what normal energy feels like. She gets a diagnosis. She gets told to eat better, sleep more, stress less.

Nobody tells her what that means on a Tuesday.

Rove exists to close that gap — the distance between a correct diagnosis and a usable instruction. We are not a wellness brand that hired a doctor for the label. The product decisions, the formulations, and the refusal to overclaim all come from the same two people who were sitting across the desk.

> **Positioning line:** Medicine gave her a line and moved on. The supplement aisle gave her the same pill regardless of what her body needed that week. The apps gave her a chart and left her to work it out herself.

---

## 2. What we're building

**A women's health system with three layers that feed each other — not an app with a shop bolted on.**

| Layer | What it does | Status |
|---|---|---|
| **Track** | Cycle, symptoms, sleep, food, movement — the daily record | **Live** |
| **Understand** | Phase intelligence, pattern analysis, doctor-ready health report | **Live** |
| **Act** | Phase-matched supplements, AI diet and exercise plans | **Balance live; Rise + Restore ready to launch** |
| **Test** | At-home hormone strips read by the app | **In development** |

The compounding effect is the business: tracking makes the recommendation specific, the supplement gives her a reason to keep tracking, and testing turns both from inference into measurement. No single layer is defensible alone. Together they are difficult to copy, because a competitor has to be credible at software, at formulation, and at diagnostics simultaneously.

---

## 3. Why the app is better

Most cycle apps are calendars with a prediction. Four differences, all verifiable in the product today:

**It works when her cycle doesn't.** Prediction models built on a regular 28-day assumption degrade exactly where help is most needed — irregular cycles, PCOS, post-partum, perimenopause. Rove's engine derives cycle length from what she actually logged rather than an onboarding guess, and states its own confidence instead of projecting false certainty.

**It interprets rather than reports.** A late period in most apps is a number in large type. In Rove it comes with what that number usually means, what commonly shifts a cycle, and — past a week — what to do next. Symptoms aren't just stored; they are analysed by cycle phase, so "I get headaches" becomes "your headaches cluster in the two days before your period."

**It produces something she can hand to a doctor.** The Health Report is a two-page PDF: cycle statistics, symptoms mapped against phase, sleep, hydration and movement, plus observations worth clinical review — with her own guidance kept on a separate page so it is never confused with clinical findings. In a market where the average PCOS diagnosis takes years and only a minority of women see a gynaecologist annually, walking in with a record instead of a memory is a material change.

**It is built for Indian women specifically.** Indian foods and diets in the nutrition guidance, Indian conditions in the content library, and a vitamin D assumption that reflects the deficiency levels actually seen here rather than a Western baseline.

**And it is honest about its own data.** The report prints its own log coverage, averages only across days that were actually recorded, and marks a cycle statistic as indicative when fewer than two cycles exist. Every figure is computed on her phone — no health data is sent to any AI service or third party. In a category where trust is the entire moat, we would rather show a modest number than a confident wrong one.

---

## 4. Why the supplements are better

### The problem with the shelf

| The supplement aisle today | Cycle Sync |
|---|---|
| One formula, taken every day of the month | Formulated to the phase the body is actually in |
| Doses chosen for label appeal | Doses matched to the research being cited |
| Cheapest mineral salts | Chelated, bioavailable forms |
| "Clinically proven" | The study named, **and its limitations stated** |
| No idea whether it worked | Symptoms tracked in the app before and after |

### The Cycle Sync system

Three products covering the two states a cycle can be in — predictable, or not.

**Cycle Sync Rise** · Days 1–14 · ₹1,499 · _ready to launch_
For the build. Menstruation depletes iron, zinc and B-vitamins measurably; the follicular phase that follows is an anabolic, building window. Rise replaces what bleeding removes and supports the follicular recruitment happening underneath it.
→ **The differentiator:** ferrous **bisglycinate**, an amino-acid-chelated iron with meaningfully less nausea and constipation than the ferrous sulfate most Indian iron supplements use, at comparable absorption. Iron that women will actually keep taking is worth more than iron they abandon in week two.

**Cycle Sync Restore** · Days 15–28 · ₹1,499 · _ready to launch_
For the wind-down. After ovulation, progesterone dominates: insulin sensitivity drops, cortisol reactivity rises, and the serotonin and GABA signalling that steady mood and sleep come under pressure.
→ **The differentiator:** Vitex standardised to **0.5% agnusides** — the specific compound the research points to — rather than a crude, unstandardised extract. Paired with ashwagandha and saffron, chosen against the mechanism rather than to mask the symptom.

**Cycle Sync Balance** · Daily · ₹1,599 · 60 tablets · **LIVE**
For the reset. Built for cycles without a predictable rhythm, most often driven by PCOS. Insulin resistance drives compensatory insulin, which drives ovarian androgen excess, which disrupts ovulation — Balance is formulated at that mechanism, not around it.
→ **The differentiator:** the **40:1 myo- to D-chiro-inositol ratio**. Seven ratios were compared head-to-head in women with PCOS-related anovulation; at 40:1, five of eight resumed menstruation — the strongest result of any ratio tested.

### The thing worth showing investors

Our own product page states the caveat next to that headline result: eight women per arm, open-label, and roughly four times our tablet's total inositol dose. **We publish the weakness of our own evidence.**

In a category built on unfalsifiable claims, that is not a compliance burden — it is the brand. It is what makes a doctor comfortable recommending us, it is defensible when regulation tightens, and it is very hard for an influencer-led competitor to copy, because their entire model depends on not doing it.

---

## 5. The ecosystem we are completing

Today Rove serves the menstruating years. The formulation platform, the tracking engine and the customer relationship all extend across a woman's life — each stage is a new SKU sold to a customer already inside the system, at near-zero acquisition cost.

```
                    ┌──── AT-HOME TESTING ────┐
                    │  LH / FSH hormone strips │
                    │  read by the app         │
                    └────────────┬─────────────┘
                                 │  turns inference into measurement
                                 ▼
   ADOLESCENCE → REGULAR CYCLES → IRREGULAR / PCOS → PRECONCEPTION →
                                                     PREGNANCY → POSTPARTUM →
                                                     PERIMENOPAUSE → MENOPAUSE
   ·············································································
   [future]        RISE + RESTORE      BALANCE ✅     [future]      [future]
                   (ready to launch)   (live)
```

**At-home testing is the unlock.** Hormone strips read through the phone camera move Rove from "based on what you logged" to "based on what we measured." It raises the credibility of every recommendation above it, it is a consumable with natural repeat purchase, and it is the piece competitors on either side — app-only or supplement-only — cannot easily reach.

**Each life stage is a new formulation sold to an existing customer.** The woman who buys Balance for PCOS at 27 is the same woman who needs preconception support at 31 and perimenopause support at 44. Most supplement brands re-acquire a customer for every product. We keep her, because the app knows where she is.

---

## 6. Brand and logo

**The wordmark.** ROVE, set in a heavy geometric sans — deliberately plain, close to clinical. The restraint is the point: this is a category drowning in soft pinks, script fonts and flower motifs, all of which signal "lifestyle" precisely when a woman is trying to work out whether something is wrong with her.

**The mark.** The **O** is replaced by a custom glyph: a closed circle above, narrowing into a tapered drop below.

It reads on three levels at once:

- **The ovum and the cycle** — a circle, closed and complete, the shape of a cycle that returns to where it began
- **Female anatomy, abstracted** — the rounded form above a tapering descent, stated in geometry rather than illustration, recognisable without being explicit
- **A compass needle or plumb line** — direction, orientation, a fixed point. *Rove* is to wander; the mark is what keeps the wandering from being lost

**Palette.** Obsidian, paper, taupe, sage. Grounded and material rather than pastel — closer to a pharmacy than a spa.

**Voice.** Plain, specific, unhurried, and willing to say what we don't know. Two doctors talking to one woman — not a brand broadcasting to a market.

> _Note: no written logo rationale exists in the repository. The reading above is a proposed articulation of what the mark already communicates, for founder approval — not a record of stated design intent._

---

## 7. The one-paragraph version

Rove is a women's health system built by two Mumbai doctors, for the 400 million Indian women who are told to "eat better and stress less" and given no instructions. The app tracks and — unlike a calendar with a prediction — interprets, working hardest where other apps fail: irregular cycles and PCOS. It produces a doctor-ready report that shortens a diagnostic journey measured in years. The Cycle Sync supplement line is formulated to the phase the body is actually in, in bioavailable forms, at research-matched doses, with the limits of the evidence stated on the page. At-home hormone strips will turn inference into measurement, and each further life stage adds a formulation sold to a customer already inside the system. Track, understand, act, test — each layer makes the next one more accurate, and the whole is very difficult to assemble from any single side.

---

## Open items — founder input needed

Flagged rather than guessed. None of these should reach an investor unresolved.

1. **⚠️ Rise and Restore are named the opposite way round in the formulation sheet and on the website. Resolve before anything is printed or manufactured.**

   `Cycle Sync Formulation - 2 capsules with Mg.pdf` labels the **iron + energy + egg-health** formula as **SKU-1 "Restore"** and the **PMS / Vitex + ashwagandha** formula as **SKU-2 "Rise"**. `products.ts` and the live site use those names the other way around: **Rise** is the iron formula for Days 1–14, **Restore** is the PMS formula for Days 15–28.

   The **compositions are identical** between the two sources — every dose matches — so this is purely a naming conflict, not a formulation error. But if a manufacturer fills from the sheet while the site sells from `products.ts`, a customer buying Rise for Day 1 of her period receives the luteal PMS formula, with Vitex and DIM instead of the iron she is bleeding out. That is a recall-class error, and it is invisible until someone compares the two documents.

   The website's usage is the semantically coherent one — *Rise* for the follicular build, *Restore* for the luteal wind-down — and this brief follows it. Confirm which is canonical, then correct the other. Worth checking any label artwork, purchase orders or manufacturer briefs already issued against the PDF's naming.

2. **"PMOS" vs "PCOS."** `products.ts` uses **PMOS** throughout — in Balance's description, benefits, FAQs and phase label. This brief uses PCOS. If PMOS is a typo it is currently live on the shop page for the one product that is selling, and should be fixed today. If it is deliberate, say why and this brief will follow it.
3. **Traction is absent from this brief on purpose.** Users, revenue, retention, repeat rate, unit economics — no verifiable figures exist in the repo. `docs/rove_pitch_deck.md` contains projections, not results. Investors will ask first; supply the real numbers.
4. **The pitch deck is out of date on commerce.** It describes supplements as affiliate partnerships at 15–25% commission with own-brand as a future step. You now have three own-brand formulations and one live. The deck should be corrected before it goes out again.
5. **Rise and Restore launch date** — both are `launched: false` with empty Shopify variant IDs. The ecosystem story is much stronger with three products live than one.
6. **Test-kit timeline and regulatory path** — an at-home hormone strip has a different approval and liability profile from a supplement. Investors will ask; the answer should be ready.
7. **Team and advisory board** — `advisors.ts` currently lists only the two co-founders. The deck's team slide should match what actually exists.
