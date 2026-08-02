# Rove v3 — TTC and TTC+PCOS

_Created 2026-08-01. Supersedes the scope of `rove-v3-lifestyle-tracker-plan.md`, which remains valid for its architecture decisions (1–13) and for the food/labs/widget items now deferred. Built on `patent-landscape-fto.md`, `multi-signal-ovulation-algorithm.md`, and a 22-agent research workflow covering patent law, CDSCO/DMR regulation, TTC and PCOS clinical science, and a competitive teardown._

> **Research status.** Legal and regulatory findings below are cited to statute and case law but were gathered by AI research, not counsel. Every item marked ⚖ needs an Indian patent agent or regulatory consultant to confirm before it drives a decision. Items marked ⚕ need a clinician. Nothing here is a legal opinion.

---

## 1. The honest answer to "make it patentable and unique"

**Corrected 2026-08-01 after the full research returned.** An earlier draft of this section said flatly that you cannot patent this. That was too blunt in one direction and not blunt enough in another. The accurate picture:

### 1.0 The binding constraint is PRIOR ART, not the exclusions

This is the finding that resets the strategy. Of twelve invented mechanisms, **ten died on novelty and inventive step — not on s.3(i) or s.3(k).** They were anticipated by patents and papers that already exist, mostly foreign, mostly granted years ago:

| Mechanism you might want to own | Who already has it |
|---|---|
| On-housing colour bar + greyscale + fiducials + homography | US11275020B2 / US12174123B2 (priority Jun 2020) |
| 1-D reflectance profile, baseline correction, integrated area, T/C ratio | Cornell US9787815 / EP2946198B1 (2013) — in **independent claim 1** |
| Flash / no-flash ambient cancellation for phone colorimetry | Nixon, Outlaw & Leung, PLOS One, Mar 2020 (non-patent art) |
| Analyte:creatinine ratio, single pad, single aperture | US9804154B2 (2013); US5804452A (Quidel, 1995 — names PdG); US6844200B2 |
| Lot-specific calibration curve to a phone reader by imaged QR | R-Biopharm RIDA SMART — **shipping since 2021** |
| Exposure-sweep camera-response ID, per-device-model keyed | Calpro AS AU2024306776A1 (2023) |
| Subject-adaptive assay scheduling with per-user reference values | Unipath EP0656120B1 / US6451619B1 (1993) — the Clearblue Fertility Monitor |
| Anovulatory detection from wearable temperature | **Oura** US20220313223A1 (2021) |

**⚠️ The critical inference, and it corrects §2.1 below: the absence of competitor patents *in India* is not the absence of prior art.** Indian examiners cite foreign prior art under s.2(1)(j)/(ja). The closed national-phase window gives Rove **freedom to operate** in India — it does **not** make these inventions patentable *by Rove*. Those are two different assets and conflating them would be an expensive mistake.

### 1.1 What Indian law actually permits — narrower than hoped, wider than I first said

**s.3(i) is a PROCESS-only exclusion.** The Delhi HC in *Sequenom v Controller of Patents* (9 Oct 2025, Prathiba M. Singh J.) held at para 79(i) that *"products used for diagnosis or therapeutic purposes, including kits, equipment, machines, and physical products... do not fall within the scope of exclusions"*, and at 79(ii)(e) that *"diagnostic products, diagnostic tools, diagnostic devices are patentable"*. ⚖

**So: own the device and the system, never the diagnosis.** Every Indian claim set leads with an apparatus/system claim.

**The court imported the EPO's G1/04 four-step test.** A method is excluded only if it contains all of: (a) examination, (b) comparison with standard values, (c) finding a significant deviation, and (d) **the deductive medical decision phase**. Para 44: *"steps dedicated solely for intermediate steps or screening methods that may have diagnostic relevance are not hit by the exclusion."*

**Drafting rule: end the claim before step (d).** "Outputting a normalised, colour-corrected analyte value" survives. "Determining that the subject has PCOS" does not. And do **not** argue "it's in vitro so 3(i) doesn't apply" — Sequenom expressly rejected that; both Sequenom's and Natera's non-invasive in vitro methods were refused.

**Technical effect must be machine-level.** *Ferid Allani* (Delhi HC, 2019) is real but narrow — the court's examples were speed, access time, compression. **"More accurate fertility prediction" is not a technical effect, and neither is "fewer strips consumed at equal precision"** — that is an economic outcome in engineering clothes, and examiners are directed to look through it. *This kills the information-gain-scheduling filing idea for India.* What does qualify: illumination-invariant colour recovery, reduced measurement variance across handset camera ISPs, compensation for auto-white-balance drift.

**Good news on hardware:** *Microsoft Technology Licensing v Assistant Controller* (Delhi HC, 2023) held that **absence of novel hardware does not preclude patentability**. A commodity phone + a moulded accessory + a novel processing pipeline can be patentable — if the technical effect is *pleaded and evidenced in the specification*, not asserted later at prosecution. ⚖

**Still absolutely closed:** business methods. *OpenTV v Controller* (Delhi HC, 2023): *"an absolute bar without analysing issues relating to technical effect."* Subscription, refill scheduling, strip budgeting, care routing — unpatentable in India however drafted. Protect by execution. Also watch **s.3(f)** — "mere arrangement of known devices" is a live objection against a printed card combining a known graticule, known colour patches and known fiducials.

### 1.2 The four-way convergence — build to this deliberately

The **"intermediate indicator requiring further testing"** framing simultaneously satisfies:

1. **Indian patent law** — stops the method claim before G1/04 step (d), per Madras HC's *Chinese University of Hong Kong* reasoning ⚖
2. **CDSCO classification** — matches the MDR 2017 Sch. I Pt. II para 2(iii) carve-out keeping a self-test IVD out of Class C ⚖
3. **Clinical honesty** — you genuinely cannot claim ovulation from an LH surge (§3.1②)
4. **Product ethics** — Decision 7's no-diagnosis rule

Four independent constraints, one answer. That almost never happens. **Design to it from day one; it cannot be retrofitted.**

### 1.3 The three walls, for reference

| Wall | What it blocks | Authority |
|---|---|---|
| **India s.3(i)** | Any method claim for diagnosing, screening, detecting or determining PCOS or any condition | Patents Act 1970. Delhi HC in **Sequenom v Controller of Patents, 9 Oct 2025** refused claims *even though* the method was non-invasive and performed entirely in vitro — because its *purpose* was diagnostic ⚖ |
| **India s.3(k)** | Any bare software, algorithm, model or mathematical method claimed as such — a cycle model or PCOS risk score is excluded | Patents Act 1970 + CRI Guidelines 2025 ⚖ |
| **US Mayo line** | "Measure hormone X, correlate with fertility status" using conventional detection | *Mayo* 566 U.S. 66 (2012); *Athena* 915 F.3d 743; *CareDx* 40 F.4th 1371. The Federal Circuit has invalidated essentially every diagnostic-correlation claim since Mayo ⚖ |

Two further traps: under the CRI Guidelines 2025 the **business-method screen is applied first and a hit is an automatic rejection** — demonstrating technical effect does not rescue it (*OpenTV v Controller*, Delhi HC, 2023) — and **means-plus-function "module" claims** with no disclosed structure are treated as computer programme *per se* and refused.

**And the invention exercise confirmed it empirically.** Twelve candidate mechanisms were invented across hardware, algorithmic and clinical-integration lenses, then each was adversarially attacked. **Zero survived. Top score 5/10.** They died on verified miscitations, on prior art the inventors hadn't seen (Cornell EP2946198B1, Easy Healthcare US11519909, Abbott US12274549B2), and on physics — one needed a glucose contrast of 0.15 mmol/L, below the CGM noise floor; another needed to resolve 40–150 µm hair shafts on a phone camera.

**So stop treating patents as the moat.** File narrowly where the FTO report identified real gaps, but build the business on the four things below.

---

## 2. The actual defensibility stack, ranked

### 2.1 — The India timing gift: FREEDOM TO OPERATE, not patentability

The PCT national-phase deadline into India is **31 months from priority**. As of today that window has **closed** for every family in this landscape with priority before ~January 2024: **Ava (all four), Oura, Apple, Fitbit, Roche, MFB/Proov, Oova, Cornell, Healthy.io, and Easy Healthcare's core 2020 family.** None entered India. They now **cannot** — not "haven't yet."

> **Read this as a shield, not a sword** (see §1.0). It means the incumbents cannot sue Rove in India. It does **not** mean Rove can patent their inventions in India — foreign prior art still anticipates.

**Four ways to throw this away, all of them product decisions:**
1. Shipping to US/EU app stores → use and sale in a patented jurisdiction. **Geo-restrict deliberately.**
2. Running inference on US servers → a US *method* claim is infringed there even for Indian users. **Keep the engine on-device; any cloud component India-resident.**
3. Manufacturing strips in India for export to the US.
4. Any market expansion — every patent in the FTO report goes live the day you sell abroad.

**The two live exposures:** **Inito** (Bengaluru) — IN 202317046017, entered national phase 2023-07-08, claiming as filed the mapping of urinary hormone concentration *or rate of change* onto cycle phase to predict a health condition. That reads on this product thesis. An **Indian pre-grant opposition is the cheapest high-value action available** ⚖. And **Easy Healthcare WO2025250702A1** (priority May 2024) — India deadline ~**December 2026**, aimed squarely at semi-quantitative strip reading. **Docket it.**

> ⚖ **The gap that must close first:** none of this was verified against **InPASS** (CAPTCHA-gated, and Google Patents indexes Indian filings poorly). The entire India strategy rests on an *inferred* absence of filings. Commission an Indian patent agent to search InPASS across all the families above plus CPC classes A61B5/4875 and G16H50/20 restricted to Indian applicants. Small spend; load-bearing.

### 2.2 — Regulatory clearance as the barrier (this is the real moat)

Natural Cycles, Flo, Clue, Glow, Ovia and Kindara hold **no enforceable cycle-algorithm patents between them**. Natural Cycles' moat is FDA De Novo plus trade secret. In this category **regulatory position is the barrier, not IP** — and India has no wellness safe harbour, so getting the classification right is both the constraint and the advantage.

### 2.3 — An ultrasound-referenced Indian PCOS dataset

**Almost every consumer accuracy claim in this category is circularly validated** — referenced to urinary LH strips, whose own PPV for ovulation within 24h is **0.50** (Leiva 2017). Oura, Apple, Ava and Inito are all LH- or urinary-marker-referenced. Ultrasound-referenced consumer validation barely exists, and none of it is Indian or PCOS-enriched. Build that dataset and you own something no competitor can buy, patent, or design around.

### 2.4 — DMR Act fluency as an entry barrier

See §4. The advertising rules in India are criminal, obscure, and exactly the thing a foreign entrant gets wrong.

---

## 3. The product thesis — and it is not "a better fertile window"

Three independent research sweeps converged on the same gap without being prompted to:

> **"Am I ovulating at all?" is the unserved question, and PCOS/irregular cycles are where every product on the market fails.**

The evidence, all verified:

- **Oura explicitly disclaims it** — "a lack of detected ovulation by the algorithm should not be interpreted as indicative of an anovulatory cycle." Every wearable validation dataset consists solely of cycles presumed ovulatory.
- **State-of-the-art fusion collapses on the target user.** AUC **0.899 → 0.581**, sensitivity **21%**, in irregular menstruators (Yu 2022, ultrasound-referenced).
- **OPKs fail structurally in PCOS** — chronically elevated tonic LH. Every OPK on the market, including the quantitative ones (Mira, Inito, Premom), uses a fixed threshold or hands over a raw number. **Nobody does per-user adaptive LH baselining.**
- **Products actively exclude her.** Ava hard-caps at 24–35 day cycles. Clearblue Advanced excludes PCOS outright. Glow assumes regularity. Natural Cycles degrades to near-all-red.
- **The androgen leg of Rotterdam is untouched** — not one product measures testosterone, FAI, DHEA-S or SHBG, though hyperandrogenism drives the symptoms patients actually present with.
- **Indian unit economics are unserved** — consumers anchor at ~₹58/test (i-know, 5 strips at ₹289); Inito refills run ~₹275/strip. Nobody has engineered a sub-₹100 quantifiable ovulation signal.

**Rove's position, in one sentence:** *the first cycle product designed from first principles for the woman whose cycle does not behave — who may have four cycles a year, elevated baseline LH, and no idea whether she is ovulating at all.*

### 3.1 — Three hard clinical truths that constrain the build

**① Passive signals are retrospective. They cannot tell you when to test.**
Apple states its wrist-temperature estimate is explicitly retrospective. Oura's validation is retrospective across 1,155 cycles. BBT rises *after* ovulation. femSense, ultrasound-referenced, hit the exact ovulation day **21.7%** of the time.

This kills the intuitive "the wearable decides which days are worth a strip" idea — it needs prospective information from a channel that only speaks after the fact. **The wearable confirms; it never predicts.** Strip scheduling must run off cycle history plus the strips already spent this cycle.

**② A progesterone rise is not proof an egg was released.** LUF syndrome produces a normal LH surge, normal PdG rise, normal thermal shift and normal luteal phase with no oocyte — ~5% of fertile cycles but **25% of first cycles in unexplained infertility**. Never claim "you ovulated"; claim "your cycle showed an ovulatory signature."

**③ Do not interpret luteal adequacy.** ASRM: no reliable LPD test exists; luteal phase <10 days occurs in 9–13% of normal cycles; a shortened luteal phase does not reduce 12-month fecundity; single progesterone draws swing 5–40 ng/mL on pulsatility alone. Products that "diagnose" low progesterone are manufacturing anxiety. ⚕

### 3.2 — The cheapest high-value feature in the entire plan

**Periovulatory NSAID exposure raises LUF from 3.4% to 35.6% of cycles** — and to 94.2% with etoricoxib (Micu 2011). This requires **zero hardware**: medication logging plus a timing rule. **No consumer cycle product flags it.**

A woman taking mefenamic acid for period pain — extremely common in India — may be suppressing her own ovulation, and nothing on the market tells her. It is free to build, mechanistically grounded, immediately actionable, and it is the single best demonstration that Rove understands the problem. **Ship it in the first release.** ⚕

---

## 4. Regulatory architecture — now load-bearing, not a footnote

### 4.1 The DMR Act is a criminal statute and it aims directly at this product ⚖

The **Drugs and Magic Remedies (Objectionable Advertisements) Act 1954** prohibits advertising a product for:

- **s.3(c)** — correction of menstrual disorders in women
- **s.3(a)** — prevention of conception
- **s.3(d) + Schedule** — including entry 12 *disorders of the uterus*, 13 *disorders of menstrual flow*, 18 *female diseases in general*, 48 *sterility in women*, 38 *obesity*, 9 *diabetes*
- **s.4** — any advertisement false or misleading in a material particular

Penalty under s.7: **up to six months imprisonment** on first conviction. This is not a fine-and-move-on regime.

**What this means concretely:** "Rove treats PCOS", "regulate your periods", "get pregnant faster" are not aggressive marketing — they are potential criminal exposure. Add the **CCPA Guidelines 2022**: health claims must be scientifically substantiated by a recognised body, and **a disclaimer cannot cure a misleading claim** (penalty ₹10 lakh, ₹50 lakh repeat).

**⚖ Action: every line of consumer-facing copy goes through Indian regulatory counsel before launch.** This is a named gate, not a review.

### 4.2 CDSCO classification — the one carve-out that matters

India has **no general-wellness safe harbour**. CDSCO's 21 Oct 2025 Medical Device Software guidance does not mention wellness, fitness or lifestyle anywhere in 44 pages. MDR 2017 covers software supporting *"a physiological process"* — which a cycle app plainly does.

Worse: **MDR 2017 First Schedule Part II para 2(iii) puts self-testing IVDs in Class C** — *unless* the results are "preliminary test results which require confirmation by appropriate laboratory tests."

**That clause is the entire regulatory strategy.** Every output must be constructed as a **preliminary screening result requiring clinical confirmation**, never a determination. It also happens to be exactly what Decision 7 already required and what §3.1 says is clinically honest. **Regulatory necessity, clinical honesty and product ethics all point the same way here — that is rare, so build to it deliberately.** ⚖

**Never:** deliver a PCOS *determination* direct to consumer (CDSCO SaMD guidance pushes non-clinical-user serious-condition software toward Class C and central licensing). **Never:** a contraception mode — barred by DMR s.3(a) in India regardless of any clearance, and Ava's US12502162B2 runs to 2042.

---

## 5. Scope — what is in v3, what is out

| Was in the lifestyle plan | Now |
|---|---|
| Health sync (Items 6–10) | **Core.** RHR/HRV/temperature are the confirmation channel. But retrospective only — see §3.1① |
| Food logging (11–18, ~11 days) | **Cut to ~2 days** — quick-add from frequents + "I ate what Rove suggested". No AI parser, no diary screen, no trends, no gauge rebuild. Keep the low-GI nudge for PCOS only |
| Lab uploads (24–26) | **Kept and refocused** — AMH, LH, FSH, prolactin, testosterone, DHEA-S, SHBG, fasting insulin. The androgen leg nobody serves |
| Doctor PDF (27) | **Promoted to core.** TTC/PCOS patients see clinicians. This is the clinical bridge and the referral mechanism the Class B framing depends on |
| Widgets (22–23), WhatsApp (28) | **Deferred to v4.** Mass-market retention features, not differentiators here |
| LH strips + ovulation engine | **This is now the product** |
| Camera/photo food (15, 15a, 19) | Stays deferred (Decision 11) |

**Content architecture is unchanged** — Decisions 13 and 14 hold. Same five tabs, same components, content layered `phasic → +TTC → +PCOS`, PCOS read from `metabolic_conditions` not a fourth mode. Delete the `home.tsx:247` early return; TTC gets a superset, never a stub.

**One addition:** when the engine's confidence is low or the cycle looks anovulatory, the Plan tab must **fall back from phase-based to condition-based guidance**. Telling a woman with a 45-day anovulatory cycle that she is "on day 23, here's your luteal plan" is the exact failure that makes clinicians dismiss consumer apps.

---

## 6. Build plan

### Track 1 — Make the existing engine honest (week 1, ~4 days)

**T1.1 — Delete `lh_surge_threshold DEFAULT 40`.** Replace with per-user rolling baseline and ratio-based surge detection. Confirmed three separate times in this research: fixed thresholds read positive continuously in PCOS, and Leiva 2017 puts the PPV of an LH strip for ovulation within 24h at **0.50**. *0.5 days.*

**T1.2 — Anovulatory-safe cycle model.** Remove any assumption of a 24–35 day cycle. Support 60–90+ day and absent cycles as first-class states. This is what Ava, Clearblue and Glow structurally cannot do. *1.5 days.*

**T1.3 — Phase-confidence gating.** Every phase-keyed surface (Home orb, Plan, Insights) must degrade to condition-based content when the posterior is diffuse. *1 day.*

**T1.4 — NSAID/LUF flag.** Medication logging + periovulatory timing rule + a plainly worded card. Zero hardware, high clinical value, unserved by every competitor. ⚕ *1 day.*

### Track 2 — The ovulation engine (weeks 2–4)

Per `multi-signal-ovulation-algorithm.md`, **with these corrections applied**:

- **Confirm from the sustained post-ovulatory rise, never a nadir** (Ava US11766248B2 requires a nadir — design-around #14).
- **Gate on personalised rolling-baseline deviation, never absolute IBI threshold crossings** (Ava US10779802B2 — #15).
- **Never render a fertility phase on a wearable display** (#16). **Ship no wearable** (#17) — ingest Apple Health / Health Connect streams. This one decision removes the mandatory "wearable device" element from most apparatus claims in the landscape at once.
- **Output a confirmed ovulation *day* with calibrated confidence** — not a fertile window, not per-phase probabilities against thresholds (#24). The granted claims split into window-bracketing and cycle-labelling; per-day confirmation is neither.
- **Derive anovulation from multi-modal absence-of-signature**, not the morphology of any single series (#26).
- Add `SIGNATURE_PRESENT_UNCONFIRMED` for LUF (§3.1②). Never say "you ovulated."

### Track 3 — Strip reading (weeks 3–6)

Follow the FTO design-around rulebook exactly — this is the densest patent layer:

1. **Never compute a test-line/control-line ratio** (Easy Healthcare US11519909, to 2041).
2. **Never derive lighting normalisation from control-line depth** (MFB US12061196B2, to 2042) — independently, Siemens US8101429 teaches away from it as physically unmotivated.
3. 2-D segmentation, not a 1-D horizontal sweep.
4. Linear sRGB → CIEXYZ → CIELAB. **Never HSV/HSL** (Oova US12591974B2).
5. On-device pipeline; no server-side normalisation.
6. **Output an ordinal band relative to her own history** — "baseline / rising / peak / post-peak" — never a hormone concentration. This is simultaneously the design-around, the Mayo-avoidance, and the Class B framing.
7. No PdG line on the cassette (MFB).
8. No printed colour reference, no clip-on optic, no reader body.

**Target: sub-₹100 per quantified test.** That is the Indian market gap and no incumbent is near it.

### Track 4 — Clinical bridge (weeks 5–7)

Lab uploads refocused on the androgen and metabolic legs; the doctor PDF as the primary output; escalation to referral wherever a screening threshold is crossed. **The referral pathway is not a nice-to-have — it is what makes the "preliminary result requiring confirmation" classification true rather than a label.**

---

## 7. Validation — the thing that actually creates the moat

**Break the circular-validation loop.** Everyone validates against LH strips with PPV 0.50. Rove should validate against **transvaginal ultrasound follicular monitoring**, in an **Indian, PCOS-enriched cohort**.

Design: one fertility clinic, ~25–30 women, one cycle each, deliberately enriched for PCOS and irregular cycles — the hard cases are the entire point, and a cohort of textbook 28-day cycles would flatter the algorithm and teach nothing. Secondary endpoint: mid-luteal serum progesterone. Ethics approval, informed consent, no clinical decisions made from app output during the study. ⚕

Ship gates unchanged from the algorithm spec, with **false-confirmation rate < 5%** as the one that governs. Report accuracy **stratified by cycle regularity** — a single headline number would hide exactly the population this product is for.

**Start the clinic conversation now.** Ethics approval is slow, it gates the *claim* not the code, and it can run in parallel with the build.

---

## 8. Immediate actions

| # | Action | Owner | Why it's first |
|---|---|---|---|
| 1 | **InPASS search** via an Indian patent agent ⚖ | Founder | The entire India strategy rests on an unverified absence |
| 2 | **Assess pre-grant opposition to Inito IN 202317046017** ⚖ | Founder + agent | The one live India exposure; cheapest high-value IP action |
| 3 | **Docket Easy Healthcare WO2025250702A1** — India deadline ~Dec 2026 | Founder | Still open; aimed at exactly this approach |
| 4 | **Regulatory counsel on DMR Act + CDSCO class** ⚖ | Founder | Criminal exposure; determines what can be said and built |
| 5 | **Retain a reproductive endocrinologist** ⚕ | Founder | Gates every clinical string and the validation design |
| 6 | **Approach one fertility clinic** for the ultrasound cohort | Founder | Long lead; gates the claim, not the code |
| 7 | Start T1.1–T1.4 | Engineering | Four days, no dependencies, immediate credibility |

---

## 9. Risks

| Risk | Why it bites | Response |
|---|---|---|
| **InPASS reveals competitor Indian filings** | The India timing gift evaporates and §2.1 collapses | Action 1, before anything is built on it |
| **CDSCO classifies as Class C** | Central licensing, clinical evidence, long delay | Build to the "preliminary result requiring lab confirmation" carve-out from day one — retrofitting is not possible |
| **DMR Act exposure in marketing** | Criminal, and the natural way to describe this product violates it | Counsel-gated copy; never "treats", "corrects", "cures" |
| **Ultrasound cohort shows poor accuracy in PCOS** | The AUC 0.581 finding says this is the likely outcome for naive fusion | Better to find out at n=30 than at launch. This is the reason to run the study, not a reason to avoid it |
| **Inito moves first** | Bengaluru, ~40M hormone datapoints, already in the Indian national phase | They are strip-only with no physiological model. The cross-modal combination is the defensible delta |
| **Patents deliver nothing** | Likely, per §1 | Already assumed. The plan does not depend on them |

---

## 10. What I would tell an REI to earn their attention

Not the fusion engine. This:

> *"We flag when a patient's own NSAID use is likely suppressing ovulation, we refuse to claim ovulation when the signature is ambiguous, and we validate against ultrasound in Indian PCOS cycles rather than against LH strips."*

Every one of those is a statement about **what the product declines to do**. In a category defined by overclaiming to women who are anxious and underserved, restraint is the differentiator — and it happens to be what the Indian regulator requires anyway.
