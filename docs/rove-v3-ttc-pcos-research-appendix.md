# Rove v3 TTC/PCOS — Research Appendix

_22-agent workflow, 2026-08-01. Raw synthesis output. See rove-v3-ttc-pcos-plan.md for the acted-upon conclusions._

> AI-gathered research. Legal/clinical claims need counsel/clinician confirmation.

# ROVE v3 — STRATEGIC RECOMMENDATION: TTC AND TTC+PCOS

**Framing note before anything else.** Twelve mechanisms were put through adversarial review. **Zero survived.** Ten of them died not on patent eligibility but on **novelty and inventive step** — prior art that already exists, mostly outside India, mostly granted years ago. That single empirical result should reset the strategy: the research brief's headline that "Indian apparatus claims are wide open and nobody is taking them" is true about *Indian filings* and false about *prior art*. Indian examiners cite foreign prior art under s.2(1)(j)/(ja). Absence of Indian filings is not absence of prior art. Everything below follows from that.

---

## 1. THE HARD TRUTH ON PATENTABILITY

### What is closed in India, stated without softening

**Your software is not patentable in India. Not the cycle model, not the Bayesian ovulation engine, not the PCOS risk score, not the scheduler, not the subscription logic.**

- **s.3(k), Patents Act 1970** excludes "a mathematical or business method or a computer programme per se or algorithms." A cycle-prediction model or a PCOS risk model, claimed as such, is excluded. Full stop.
- The *Ferid Allani* (Delhi HC, W.P.(C) 7/2014, 12 Dec 2019) technical-effect escape is real but narrow: the effect must be a technical contribution — the examples the court gave are machine-level (speed, access time, compression). "More accurate fertility prediction" is not a technical effect. "Fewer strips consumed at equal precision" is not a technical effect either — it is an economic outcome wearing engineering clothes, and the guidelines direct examiners to look through exactly that.
- **The business-method screen is absolute and unrescuable.** *OpenTV Inc v Controller* (Delhi HC, 11 May 2023): "The bar in India to grant of business method patents has to be read as an absolute bar without analysing issues relating to technical effect, implementation, technical advancement or technical contribution." Your subscription, refill-scheduling, strip-budgeting, care-routing and marketplace logic is unpatentable in India regardless of how it is drafted. Do not spend money on it. Protect it with execution.
- **s.3(i)** excludes any *process* for diagnostic treatment of human beings. Any claim of the form "a method of determining/screening/detecting PCOS in a subject" is dead on filing. The Delhi HC in the *Sequenom/Natera* line (9 Oct 2025) held there is **no in vivo / in vitro distinction** — "it's just a urine strip read outside the body" was expressly rejected. Devices, kits, systems and products are outside s.3(i); processes are not.
- **s.3(f)** ("mere arrangement or re-arrangement of known devices each functioning independently") was raised by reviewers against every physical-accessory candidate and is a live objection against a printed card that combines a known graticule, known colour patches and known fiducials.
- **The CRI Guidelines (2025)** additionally require that a "means" or "module" claim disclose structural features in the specification. A spec that describes only software modules collapses the system claim back into s.3(k).

### What actually killed every candidate: prior art, not exclusions

This is the part the research brief under-weighted. The specific walls:

| Mechanism you might want to own | Who already owns it |
|---|---|
| On-housing colour bar + greyscale + fiducials + homography for LFA reading | US11275020B2 / US12174123B2 (Hatamian, priority 11 Jun 2020) |
| 1-D reflectance profile, baseline correction, **integrated area**, T/C ratio | Cornell US9787815 / EP2946198B1 (priority 21 Jan 2013) — this is in *independent claim 1*, and the light-tight housing is only dependent claim 6 |
| Flash / no-flash ambient cancellation for phone colorimetry | Published non-patent art: Nixon, Outlaw & Leung, PLOS One, 26 Mar 2020 — including a per-read SNR quality gate |
| Analyte:creatinine ratio, one sample pad, one aperture | US9804154B2 (Medytox, 2013); US5804452A (Quidel, 1995 — literally "creatinine and a steroid hormone," names PdG); US6844200B2 (Bayer/Siemens, 1999) |
| Parallel flow paths from a common sample region, single optical means | US20120201720A1 (SPD — Clearblue's own maker, 2007) |
| Lot-specific calibration curve delivered to a phone reader by imaged QR | R-Biopharm RIDA SMART APP — **shipping since 2021** (J AOAC Int, PMID 33751069); US8101415 (Bayer, 2005) |
| Exposure-sweep camera-response identification, per-device-model keyed | Calpro AS AU2024306776A1 (priority 28 Jun 2023) — anticipates the entire pipeline including fleet keying |
| Subject-adaptive assay scheduling with per-user reference values | Unipath EP0656120B1 / US6451619B1 (1993) — this is the Clearblue Fertility Monitor |
| Continuous sensor gating a discrete consumable, result recalibrating the sensor | Abbott Diabetes Care US12274549B2 (priority 30 Sep 2008) |
| Anovulatory cycle detection from wearable temperature | **Oura** US20220313223A1 / WO2022212739A1 (priority 1 Apr 2021) |
| Adhesive skin patch calibrating phone images for colour + size | Scarletred Vision (patented, CE Class I, since 2015); Swift Medical HealX (FDA-registered) |

### What Rove can realistically get

1. **A design registration** on any physical accessory (Designs Act 2000). Cheap, fast, weeks not years, untouched by s.3(i)/3(k)/3(f). Protects appearance only and is designed around by relaying the layout. Do it if you ever mould anything; do not mistake it for protection.
2. **At most one narrow apparatus or manufacturing-process claim,** and only with bench data in the specification. The three residues that no reviewer could find anticipated anywhere:
   - **Depilation-state normalisation** — modelling/gating a longitudinal cutaneous metric against logged hair-removal events. Pure software, but framed as correcting measurement invalidation by a confounding behaviour. Nothing in Scarletred, Swift, the phone-mFG literature or the dermatoscopy literature addresses it.
   - **Per-read uncertainty derived from in-frame reference-fit residual + profile SNR + geometry residual, propagated as an observation weight into a per-subject longitudinal baseline** whose decision is a ratio to that subject's own baseline. Cornell, Hatamian, Novarum and Nixon each have pieces; none has the closed loop.
   - **A manufacturing-process claim**: measure a production lot's dose-response → compute densities → print from that lot's conjugate → assemble. Outside 3(i) (not a diagnostic process), outside 3(k) (physical), and arguably outside 3(f). Honest cost: manufacturing-process claims are hard to detect infringement of, which materially cuts their value.
3. **Nothing in the US worth chasing.** *Mayo* (566 U.S. 66), *Athena* (915 F.3d 743), *CareDx* (40 F.4th 1371) close the diagnostic-correlation route, and *Recentive Analytics v Fox* (Fed. Cir., 18 Apr 2025) closes "apply machine learning to scheduling." What survives — sample preparation (*Illumina v Ariosa*), method of treatment (*Vanda*) — is unavailable to you.

### What this means for strategy, in one sentence

**Stop budgeting patents as the moat.** Cap total IP spend at one professional FTO search (~₹3–5 lakh) plus one design registration plus, conditionally, one provisional. Redirect the ₹15–25 lakh and the founder-months a full prosecution programme would consume into the dataset and the clinical partnership, which are the things that actually compound.

> ⚖️ **Requires patent attorney confirmation.** I could not verify from primary sources within this work: the exact paragraph numbering of the Delhi HC *Sequenom* holding (para 79(i)); the existence and URL of a formally published "CRI Guidelines 2025" (ipindia.gov.in returned 404/DNS failures across multiple reviewers); and the current status of the divergence between Delhi HC (screening subject to confirmation is still "diagnostic") and Madras HC (*CUHK & Sequenom*, 12 Oct 2023, "intermediate indicator" safe harbour). That divergence is forum-dependent and materially affects whether *any* method claim is worth filing. Do not put those citations in a filing memo or investor deck until counsel confirms them.

---

## 2. THE DEFENSIBILITY STACK — RANKED FOR ROVE

**1. A proprietary validated dataset in a population nobody has measured.** *(Pursue first, immediately, continuously.)*
There is no published ovulation-detection validation in any Indian or South Asian cohort. Where fusion models have been tested on irregular menstruators, they collapse — AUC 0.899 → **0.581 with 21% sensitivity** (Yu 2022, TVUS-referenced). Every major wearable validation dataset consists solely of cycles pre-selected as ovulatory, and every vendor disclaims anovulation detection in writing. Meanwhile Indian PCOS prevalence is 19.6% by Rotterdam (ICMR, JAMA Netw Open 2024, n=8,993 assessed, PMID 39441596). This asset cannot be retroactively acquired by an incumbent, it compounds with retention, and CDSCO's Algorithm Change Protocol is what makes it *legally usable* for continuous model improvement rather than a re-approval per retrain.

**2. Regulatory posture engineered as a barrier.** *(Start in parallel, month 1.)*
Three concrete moves: (a) file an early written classification request via the CDSCO online risk-classification module — cheap, creates documented good faith, and if you shape the request you set the reference point competitors are measured against, since no fertility-SaMD classification precedent appears to exist; (b) engineer the intended-use statement to land at Class A/B rather than Class C, and then *constrain the marketing to it*; (c) get an ACP written into the first licence application. **Be honest about what this is:** a cost-of-compliance advantage over an unprepared competitor, not an exclusive right. An ACP is available to any applicant who asks.

**3. Clinical partnership and clinician workflow lock-in.** *(Start recruiting month 1; it gates everything in §5.)*
One tertiary reproductive-medicine unit with in-house folliculometry is the single unlock for every performance claim you will ever make. Separately, an Indian gynaecologist today receives a recalled LMP and nothing else. A guideline-structured handoff is a distribution moat via referral that no app-only competitor has built.

**4. Trade secrets.** *(Free, immediate.)*
Calibration transforms, lot-response corpus, per-user baseline model parameters, and — if you ever do camera reading — the Indian handset-fleet calibration dataset. This is precisely the layer India will not patent, so secrecy is not second-best, it is the correct instrument. **Resolve the publish-vs-secret tension explicitly:** publish the *clinical* findings (they build clinician trust and pre-empt competitor patents on correlations that are unpatentable anyway in both jurisdictions); keep the *engineering* secret.

**5. Brand and trust, specifically privacy and honest uncertainty.** *(Cheap, differentiating.)*
The FTC finalised an order against Flo (June 2021) and barred Easy Healthcare/Premom from sharing health data for advertising (2023). No Indian player has made verifiable no-adtech data handling a headline promise. DPDP Act compliance is mandatory regardless — turn a cost into a claim. Second: **no consumer product in this category displays calibrated confidence.** Your own engine already computes `confidence: 'low'|'medium'|'high'` and `dataSource` in `shared/cycle/phase.ts` and **no screen renders it.**

**6. Patents. Last.** Design registration + conditionally one narrow provisional. See §1.

---

## 3. TOP 3 MECHANISMS TO BUILD

### #1 — The PdG-anchored luteal record (highest-scoring candidate, stripped to software)

**What it is.** A quantitative-capable urinary PdG channel feeding four derived outputs no one ships:
- **Luteal rise detected / not detected**, referenced to *her own* follicular baseline (median + k·MAD over cycle days 5–10), not a fixed 5 µg/mL cut.
- **Luteal integral** — area above her follicular baseline, in index-days — and **luteal duration**.
- **Coverage fraction** — measured luteal days ÷ luteal days elapsed. Any cycle below 0.5 is stamped non-comparable and excluded from trend lines.
- **12-month ovulation ledger** — "a luteal rise was detected in 4 of 11 tracked cycles" — which maps directly onto the 2023 international guideline's *<8 cycles per year* ovulatory-dysfunction criterion.

**Report an index on an arbitrary within-woman scale, not µg/mL.** That sidesteps the quantitative-IVD regulatory escalation, needs no lot calibration, and is honest — a relative within-woman trend is what the physiology actually supports.

**Why it is defensible.** Not by patent. By being the only output that unmasks **phenotype C — 40.8% of Indian PCOS women** (501 of 1,224, ICMR/JAMA Netw Open 2024), who have hyperandrogenism plus polycystic morphology with *apparently regular cycles*. Every cycle-tracking app on earth tells this plurality that nothing is wrong. The guideline itself says ovulatory dysfunction can occur with regular cycles and must be confirmed with progesterone — and serial progesterone is never done in practice. Chronic anovulation is currently established from *recalled* cycle history plus at most one blood draw. A PdG-anchored count over 6–12 cycles is a genuinely new clinical datum.

**Cost.** ~10–12 weeks of engineering if built **strip-agnostic and camera-optional**: ingest a semi-quantitative or numeric PdG reading (manual entry first), plus the records layer, plus the ledger. **No tray, no injection mould, no lot registry, no CDSCO manufacturing licence.** The hardware version — a moulded cassette with a lot-calibrated ladder — is 12–18 months, six-figure MOQs, and makes you an IVD manufacturer. Do not do it now.

**Validation needed.** PCOS-specific PdG thresholds cannot be inherited from healthy-cycle validation and must be derived. Two algorithm defects to fix before shipping:
- **MAD_f → 0 degeneracy.** Follicular PdG sits at or below the assay LoQ; with 5–6 censored readings the threshold collapses to the median regardless of k, and any three-day upward noise excursion fires a false rise. Add a variance floor keyed to assay LoQ and observed pad CV.
- **The self-referencing paradox.** A woman with a genuinely deficient corpus luteum clears her own depressed baseline and scores "rise detected." Report *both*: self-referenced ("did a rise occur" — correct for PCOS) and population-referenced ("was it adequate" — observation only, **never** an LPD finding, per ASRM 2021: "No diagnostic test for LPD has proven to be reliable").

**Corrections to make before this reaches any deck.** The "Blackwell 2018 threshold of 0.208 mmol/mmol" is not verifiable and appears misattributed — Blackwell's thresholds are excretion rates in µmol/24h, and that school treats creatinine correction as *inferior* to excretion rate. The "AUC 0.951 vs 0.944" comparison is **urinary PdG vs urinary progesterone**, both run on hospital analysers against an ultrasound reference — not urine vs serum. The "PCOS luteal progesterone 4.9 vs 21.6 ng/mL" figure comes from a study with n=19 PCOS and **n=5 controls** in which the cohort appears partly defined by low luteal progesterone. Use none of these three as written.

### #2 — Anovulation and cycle-irregularity screening from data you already have

**What it is.** Cycle-length median, SD and CV computed from `daily_logs.is_period` history, scored against the 2023 guideline's **gynaecological-age-dependent** thresholds:
- 1 to <3 years post-menarche: <21 or >45 days
- ≥3 years post-menarche to perimenopause: <21 or >35 days, **or <8 cycles per year**
- >90 days for any single cycle at >1 year post-menarche
- Menarche date captured at onboarding, hard-gating every PCOM/AMH code path within 8 years of menarche

Plus: render the `confidence` field the engine already computes. Plus: widen or suppress the fertile window when variance is high or `is_irregular` is true — today a self-declared irregular user gets the identical ±1-day ovulatory window as a textbook 28-day user, which your own spec calls unshippable.

**Why it is defensible.** It isn't, in IP terms — and it doesn't need to be. It is the largest gap between what Rove could honestly say today and what it says today, it costs almost nothing, and it is the correct clinical priority. **Critically: it must NOT be gated behind TTC mode.** Most women who are not ovulating are not trying to conceive. This is already a standing architecture decision in your own spec and a pivot that buries PCOS screening inside TTC contradicts it.

**Cost.** 2–4 weeks, after these prerequisites (all verified in the current tree):
- Delete the **"more than 95% accuracy"** string at `mobile/src/components/tracker/DischargeQuestionnaire.tsx:235`. It is a live, unbacked accuracy claim in a health app for a questionnaire whose answers feed nothing. **Do this this week, independent of the pivot.**
- Backfill MPIQ: answers are stringified into `daily_logs.cervical_discharge` while `mpiq_consistency/appearance/sensation/score` sit unwritten. `mpiq_score` is never computed anywhere in the repo, and both design docs assume it is populated.
- Fix the discharge-not-saved-on-menstrual-days bug (`tracker.tsx:722-728` writes NULL over existing values on any day the engine *predicts* as menstrual — arbitrary days for irregular users).
- Fix Home vs Tracker disagreeing about the fertile window (`home.tsx:284-286` anchors to `last_period_start + cycle_length`; `tracker.tsx` anchors to logged periods).
- Collapse the four competing cycle-maths implementations to one. `shared/cycle/phase.ts` is what ships; the three edge functions are unreachable from mobile and disagree with it on the ovulatory window and on day-of-cycle arithmetic.
- **Dump the live database (project ref `jicmptpnhapbycdxutng`) before writing any new migration.** Two divergent migration trees exist with ten files unique to each and files 016/017 differing in content.

**Validation needed.** None for the honest version — it is a measurement plus a published guideline threshold, not a performance claim.

### #3 — Per-user adaptive LH baselining (prediction only, never confirmation)

**What it is.** Two deletions and one replacement.
- **Delete `lh_surge_threshold DEFAULT 40`** (`docs/lh_fsh_strip_integration_plan.md:148`). Leiva 2017 (107 women, 283 ovulatory cycles, TVUS-referenced) tested six thresholds: at 25 mIU/mL sensitivity 0.54 / PPV 0.50; at 30, sensitivity 0.46 / PPV 0.60; **at 40, sensitivity 0.23 / PPV 0.23.** Your current default is the worst available choice.
- **Delete the LH:FSH PCOS Risk Score** (`docs/lh_fsh_strip_integration_plan.md:45, 51, 283, 294–309`). Cho 2006, *Ann Clin Biochem*, is titled "The LH/FSH ratio has little use in diagnosing polycystic ovarian syndrome": only **7.6% of PCOS samples exceeded a ratio of 3 versus 15.6% of controls.** It fires *more often in healthy women*. It is absent from the 2023 guideline. Shipping it would be shipping a worse-than-chance signal to your core users.
- **Replace with ratio-to-own-baseline.** A local-level random walk on log test-line intensity with a Student-t observation and a per-user drift variance. Report "your LH relative to your own recent baseline," and when the baseline is high and drifting upward, **refuse to call a surge and say why.**

**Why it is on the list.** ~50% of women with PCOS have chronically elevated tonic LH driven by ~40% higher GnRH pulse frequency, with multiple sub-surges per cycle. A fixed threshold misfires for half the target population. Clearblue Advanced Digital states in its own instructions that it is not suitable for PCOS. Ava hard-caps at 24–35 days.

**Be honest about the ceiling.** Clearblue's Fertility Monitor already establishes per-user baselines (patented in 1993, Unipath EP0656120B1), and Mira hands you a number. **This is table stakes, not a moat.** It is on the list because #1 and #2 do not work in PCOS without it.

**What to drop from the ambitious version.** The two-component tonic/transient deconvolution with a surge-morphology prior is unidentifiable — at one urine sample per day you get 3–4 points across a ~48h surge and cannot recover an asymmetric two-parameter kinetic plus amplitude; the prior would dominate and the "goodness-of-fit score" would report how well the data match something you wrote down. Drop the diurnal term and replace it with a **first-morning-void collection protocol** (free, removes the effect rather than modelling it). Drop the dilution-from-control-line term: Siemens US8101415 teaches directly away from it — "the immunochemical reagents for the control line are different than those for the test line and are not impacted, to the same degree, by variations in SG."

### Ship this quarter regardless: the periovulatory NSAID flag

Continuous NSAID exposure raises luteinized-unruptured-follicle incidence from 3.4% to **35.6%** of cycles, and to **94.2%** with etoricoxib in inactive disease (Micu 2011, intravaginal ultrasound monitoring). Zero hardware, zero regulatory exposure, driven entirely by the medication log, and highly relevant in a market where OTC analgesics are routine for dysmenorrhoea. **Informational flag plus "worth mentioning to your doctor" only — never a dosing instruction.** No consumer product ships this. It may be the highest value-per-rupee item in the whole package.

### Explicitly not building, and why

Coplanar reference cassette; exposure-sweep ISP identification; in-frame lot-referenced density ladder; adhesive graticule + hair densitometry; the closed-loop assay scheduler; the attested cycle record; the ovulation-anchored metabolic contrast. Every one requires Rove to become a hardware or IVD manufacturer, and every one is anticipated by the prior art in §1. The scheduler deserves a specific note because it is seductive: **it cannot work.** Your own spec classifies BBT, RHR and HRV as lagging and confirmatory. At 06:00 on a pre-ovulatory day, under your own data-quality gate, all three passive likelihoods are necessarily flat. "The wearable decides which day to spend a strip" collapses to "cycle history decides," which is Clearblue's 1993 patent.

---

## 4. WHAT TO CUT, AND WHAT "FOOD AS A SIMPLE PUSH" MEANS

### Cut outright
- **The CV/camera strip pipeline.** Phase 1 of your own strip plan is explicitly camera-free. Manual/semi-quantitative entry gets the signal, the schema and the user habit at ~10% of the cost. The CV pipeline is the glamorous part and the wrong part to build first.
- **LH:FSH ratio and the PCOS Risk Score.** See §3.
- **HOMA-IR as a clinical verdict.** The 2023 guideline: "clinically available insulin assays are of limited clinical relevance and should not be used in routine care." Replace with a *recall ledger* — has she had a 75-g OGTT, when, and is she due at the 1–3 year interval. That is guideline-aligned, non-diagnostic, and no Indian app owns it.
- **CGM as a shipped feature.** The only stratified PCOS CGM study (n=36, Libre 2, 14 days) found coefficient of variation **lower** in the insulin-resistant group (13.5 vs 17.1, p=0.04) and no difference in time in range. The intuitive "spiky glucose = insulin resistance" story is contradicted by the only data that exists. If you touch CGM at all it is consented prospective research, never a shipped claim.
- **Phase-matched meal plans and the AI diet-plan generator as a headline surface.** Wilcox 2000 (221 women, 696 cycles): the fertile window falls entirely within days 10–17 in only ~30% of women, and among 28-day cycles ovulation occurred 14 days before next menses in only 10%. Calendar-driven phase products run on calendar-hostile biology. Also delete rather than repair the `metabolic_conditions` path in `diet-plan-generator` — the field was dropped in `008_update_onboarding_schema.sql` and its string match ('PCOS'/'PCOS/PCOD') wouldn't match what onboarding writes ('PCOS / PCOD') anyway.
- **Any hard-coded AMH threshold.** The guideline specifies none; published cutoffs span 1.40–7.98 ng/mL, and Indian studies alone range 4.70–7.51 ng/mL. Display against the assay's own reference range with a plain-language note that no international threshold exists.
- **Adolescent PCOS signalling.** No PCOM or AMH logic within 8 years of menarche. An app that deliberately *withholds* a PCOS signal from young users and explains why is differentiated, correct, and protects a young user base from a sticky wrong label.
- **The menopause branch.** Park it. Don't build the same dead stub twice.

### Do not cut
Sexual-activity logging — it is 80% of the highest-value everyday TTC feature. `sex_activity @> ARRAY['Sex']` intersected with the fertile window gives "you covered 3 of your 6 fertile days" with **zero new data collection**. Hydration/sleep/exercise stay as the retention surface, demoted out of the clinical narrative.

### "Food can be a simple push" — the concrete spec

- **One card, one push per day.** Keyed to phase + logged symptoms. Drawn from a **fixed, clinician-reviewed content library**. No generation, no personalisation engine, no macro tracking, no meal logging, no LLM anywhere in the daily path.
- **Scope:** roughly 120 cards — 4 phases × ~10 states × Indian foods — written once, reviewed once by a dietitian and the clinical reviewer, shipped as static content. Two weeks of work, then zero marginal cost and zero inference spend.
- **Claim ceiling, set by the guideline, not by copywriting.** Low-GI framing is fine. Inositol's ceiling is the guideline's own words: "limited harm, potential for improvement in metabolic measures, yet with limited clinical benefits," with no recommendable type, dose or combination. The supporting RCT figure is ovulation frequency 25% vs 15% placebo — real but modest, and must be quoted with its comparator.
- **Never:** "restores ovulation," "improves fertility," "regulates your cycle," "corrects your periods." DMR Act 1954 s.3(c) prohibits advertising for correction of menstrual disorder in women; s.3(d) plus Schedule entries 12 (uterine disorders), 13 (disorders of menstrual flow), 18 (female diseases in general), 38 (obesity) and 48 (sterility in women) catch PCOS marketing four ways simultaneously. This is **criminal** (s.7: up to six months, first conviction), not a civil risk to be priced. And CCPA Guidelines 2022 mean a disclaimer cannot cure a misleading claim (₹10 lakh; ₹50 lakh on repeat).
- **The commerce hook is not a supplement claim.** It is "your cycles went from 45 days to 34 days over four months." That uses only period logs, needs no substantiation beyond her own data, and is simultaneously the strongest retention hook you have.

---

## 5. THE CLINICAL VALIDATION PATH

| Tier | What | When / Cost | Unlocks |
|---|---|---|---|
| **0** | The 10 adversarial synthetic cycles already enumerated in your spec §9 — double LH surge, fever days 14–16, anovulatory cycle, 45-day irregular, chronically elevated baseline LH, shift worker, alcohol RHR spike | Now. Free. No users, no data needed | Nothing publicly — but it is the only cheap real progress available and it de-risks everything downstream |
| **1** | Retrospective replay on public data. mcPHASES (*Sci Data* 2026, PMID 41667516; Fitbit + hormones, 42 participants, 3 months) is the only public wearable+hormone pairing found | 0–3 months, ₹0–2 lakh | Internal calibration. No claims |
| **2** | Consented observational in-app cohort, 300–500 users, no gold standard. Measures adherence, coverage fraction, strip consumption, Indian cycle-length distributions | 3–9 months, ₹8–15 lakh | **Cohort-descriptive** statements only. Also the go/no-go on the whole measurement thesis (see Risk 1) |
| **3** | The real one: **100–150 women, ≥40 PCOS-enriched, 3–6 cycles each**, serial TVUS folliculometry (2–3 scans per cycle around the predicted window) + mid-luteal serum progesterone, ethics committee approval + CTRI registration, one tertiary reproductive-medicine partner | 12–18 months, **₹40 lakh – 1 crore** | Performance-backed "sustained luteal rise detected"; an accuracy number usable in marketing; clinician credibility |

**Why Tier 3 must be bigger than the repo currently plans.** The spec's ~25–30 women × one cycle each cannot validate anything longitudinal: with no within-user replication, per-user variance parameters and any "cycle 4 is better than cycle 1" claim are **unestimable by construction**. If you only ever run the 30-woman version, never make a compounding claim.

**Reference-standard ceiling — design to it.** No single ultrasound sign exceeds ~84% sensitivity for dating ovulation (Ecochard 2000, 271 cycles / 107 women / 794 scans; follicle disappearance 84.0/89.2, free fluid 71.0/88.2). TVUS itself misclassifies ~10–15% of events. **A device cannot legitimately score above ~85–90% agreement.** Do not set an internal target you cannot physically hit.

**Ship gates already written into your own spec** — keep them: false-confirmation rate <5%, confirmation accuracy ≥80%, fertile-window capture ≥90%, anovulation sensitivity ≥80% / specificity ≥90%, calibration error ≤10 points.

**The window is closing.** The Quantum Menstrual Health Monitoring Study (Bouchard, Fehring et al., *Medicina* 2023;59:1513) has published its protocol — 150 cycles of urinary FSH/E13G/LH/PDG against serial endovaginal ultrasound — but **not its results.** Nobody in the at-home hormone category currently owns ultrasound-referenced evidence. That is roughly one study cycle of head start.

**Partnerships, in priority order.**
1. A **tertiary reproductive-medicine unit with in-house folliculometry.** Single biggest unlock. Start recruiting month 1; ethics approval alone runs 2–3 months and gates the *claim*, not the code.
2. A **named clinical reviewer with FOGSI standing** who signs off every user-facing string. Your spec has six ⚕ review gates and **none have been passed.** There is no clinician in the loop today and every threshold in the algorithm is explicitly labelled a tuning starting point.
3. A **biostatistician on the protocol before enrolment**, not after.
4. An **IVD contract manufacturer for strip supply only** — not for a bespoke cassette. ⚠️ The claim that Ubio (Kerala), Immunoscience (Pune), Biowick (Bhopal) or Centum (Bangalore) manufacture for Inito is **unsubstantiated** and was flagged by two reviewers. Confirm directly before it enters any supply-chain plan.

**What no study ever unlocks:** "ovulation confirmed" (LUF is invisible to every home signal); "you have PCOS" (Rotterdam needs 2 of 3 and two axes are unreachable from wearables and urine strips); an LPD diagnosis (ASRM 2021 says no reliable test exists for anyone); contraception (separate device class — Natural Cycles De Novo DEN170052, 21 CFR 884.5370); "safe days."

---

## 6. THE THREE BIGGEST RISKS

### Risk 1 — The measurement thesis may simply be wrong for India

A 7-hormone serum panel with **free home phlebotomy costs ₹1,999** (Thyrocare AMH ₹1,910; PCOD profile including testosterone and fasting insulin ₹1,799; Redcliffe PCOS panel ₹2,499). That is less than half an Inito device. Meanwhile Indian PCOS spend flows overwhelmingly to consumables: Gynoveda ₹2,000–2,400/bottle, Bebodywise ₹329–1,199, and Veera — the most prominent Indian PCOS brand, once "the world's largest online PCOS clinic" — has **retreated to supplements plus a dietitian**. Indian consumers are conditioned to buy pills, not data.

**Mitigation.** Home testing cannot win on access or price. Its only defensible claim is **longitudinal frequency** — serial measurement across a whole cycle, which a venous snapshot structurally cannot deliver. Prove that with a hard retention/adherence number in Tier 2 *before* spending on hardware. And attach an action to every measurement: if the number does not change what she does that week, it is a hobby. Also note the Indian strip price anchor is unreliable — the brief's ₹58 is not verifiable, observed bulk LH listings run **₹23–27/strip**, and no domestically manufactured PdG strip at any price could be located. **Get written OEM quotes for a PdG strip landed in India before any pricing model.**

### Risk 2 — A better-capitalised Indian incumbent is already executing

Inito is Bangalore-based (Samplytics Technologies Pvt Ltd), measures E3G, LH, PdG and FSH **on one strip**, publishes analytical CVs of 4.95–5.57% and R² of 0.95–0.98 versus ELISA, raised **$29M Series B in Dec 2025** (Bertelsmann India Investments + Fireside Ventures), retails on Amazon.in and Flipkart, and holds filings including IN 202317046017 and US 2024/0044919 (handheld PCOS hormone monitoring, with letrozole in an example).

**Mitigation.** Do not compete on strip chemistry or reader precision — that race is lost and re-running it is how you burn 18 months. Compete on: (a) the **derived longitudinal layer** Inito does not ship — ovulation count, luteal integral, coverage fraction, guideline-mapped clinician handoff; (b) the **Indian validation dataset**, which nobody has; (c) price, via camera-optional manual entry against commodity strips. Have counsel review IN 202317046017 for freedom to operate and for whether a pre-grant opposition is warranted.

### Risk 3 — Rove ships a confident number it cannot support, inside a criminal advertising regime

Today, verified in the tree: the app renders **"more than 95% accuracy"** for a questionnaire whose answers are stringified into a text column and read by nothing; `shared/cycle/phase.ts` computes ovulation as `cycle_length − 14` with a **±1-day** ovulatory window and a fixed −5/+1 fertile band for *every* user including self-declared irregular ones; and Home and Tracker can disagree about the fertile window on the same day. There is no persistent "not for preventing pregnancy" line anywhere, which your own spec mandates on every fertility screen.

**Mitigation.** (a) Remove the 95% string this week. (b) Widen or suppress the window when variance is high — a confident 3-day window drawn from a 45-day-variable cycle is a claim the mathematics cannot support. (c) **One named person owns consistency** between the CDSCO intended-use statement, the app-store listing, packaging, website and in-app copy — and the intended-use statement is drafted by counsel *before* the marketing copy, per CDSCO's own §4.3 requirement. (d) Every quantitative claim needs a citable dataset before it appears in copy; CCPA Guidelines 2022 mean fine print will not save you.

**Fourth, operational, worth naming:** the moment passive wearable signals enter, you are forced into an EAS dev-client build and a paid Apple Developer account for HealthKit entitlements — which **breaks the founder's Expo Go testing loop**, against a `mobile/AGENTS.md` that pins Expo SDK 54 with an explicit do-not-upgrade instruction, during an in-flight React Native migration with three engineers. Do not let a mechanism you are not going to build pull that decision forward.

---

## 7. WHAT WOULD MAKE A REPRODUCTIVE ENDOCRINOLOGIST TAKE THIS SERIOUSLY

**The single highest-leverage thing: a PdG-anchored, per-cycle ovulation ledger, delivered as a one-page clinician-readable record scored against the 2023 guideline's own criteria, that arrives with the patient at her first appointment.**

Not accuracy. Not a better fertile-window prediction. The REI's decision problem is not "when is she fertile" — it is **"is she ovulating, how often, and is the letrozole working."** Today she answers that from a recalled LMP plus at most one day-21 progesterone, and in India that answer costs 4–5 additional clinic visits per stimulation cycle, entirely out of pocket, with no government subsidy, against a mean infertility duration of 6.5 years in one rural Central India series.

The record that changes the conversation reads roughly:

> Cycles: 34, 52, 41, 38, 47 days (median 41; <8 cycles/year criterion met)
> Luteal rise detected in 4 of 11 tracked cycles; coverage ≥0.5 in 9 of 11
> No luteal rise in the two cycles with logged periovulatory NSAID exposure
> Total testosterone 68 ng/dL (uploaded 12-Mar, direct immunoassay — interpret with caution)
> Days not measured: enumerated
> *Preliminary results requiring confirmation by laboratory testing. A detected luteal rise is not confirmation that an egg was released; follicle rupture is confirmable only by ultrasound. Not a diagnosis of PCOS. Does not replace follicular monitoring.*

**But here is the caveat that decides it, and it is the whole reason PdG is non-negotiable.** An REI will not escalate a letrozole dose on a temperature-derived luteal rise. Standard practice confirms ovulation on mid-luteal serum progesterone (ASRM: >3 ng/mL is indicative; Leiva 2015: ≥5 ng/mL gives specificity 98.4%, sensitivity 89.6%) or on follicle collapse. Wrist skin temperature has specificity **0.26** and BBT sensitivity **0.23**; physicians reading BBT charts agree on ovulation timing within one day in only 22.1% of cases. **Without a progesterone-class signal, the ledger is a beautiful safe around an empty box.**

**The second-highest-leverage thing costs nothing: never say "ovulation confirmed."** Say "sustained rise in urinary progesterone metabolite detected — this is not confirmation that an egg was released." LUF produces a normal LH surge, a normal progesterone rise, a normal thermal shift and a normal luteal phase with no oocyte; it occurs in ~4.9% of cycles in normally fertile women but **25% of first IUI cycles in unexplained infertility, recurring in 78.6%** (Qublan 2006). No consumer product makes that distinction, and no consumer product even tells users LUF exists. It is one sentence, and it is the fastest credibility signal available to you.

**The test to run before building any of it.** Mock the one-page record. Show it to ten Indian REIs. Ask: *"Would you change a letrozole dose on this without a day-21 progesterone draw?"* If the answer is no even with PdG on the page, the entire clinician-artefact thesis is dead and you learned it for the cost of a PDF.

⚠️ **Fix the letrozole ladder on that mock before you show it.** Verified Indian and international practice is **sequential dose escalation 2.5 → 5 → 7.5 mg daily for 5 days** (J Hum Reprod Sci 2022, South India series, PMID 35494195; also PMID 40740630). The "5 mg × 5 → × 7 → × 10 days" in the research brief conflates dose escalation with separate experimental extended-duration regimens. Put the wrong ladder in front of an REI and you lose the room in the first sixty seconds.

---

## RECOMMENDED SEQUENCE

**Weeks 1–2 (do regardless of anything else):** delete the 95% string; add the persistent "not for preventing pregnancy" line; dump the live DB and reconcile the migration trees; delete the LH:FSH PCOS Risk Score and the `lh_surge_threshold DEFAULT 40` from the specs.

**Weeks 1–4 (parallel, non-engineering):** recruit the tertiary REI partner and the clinical reviewer; start ethics-committee paperwork; commission the FTO search (Inito IN 202317046017, Oura US20220313223A1 India status, Calpro, eMed, Scarletred/Swift); get counsel's opinion on the DMR Act's application to software versus strips.

**Weeks 3–8:** mechanism #2 (cycle-variability screening + honest confidence + MPIQ backfill + the fertile-window bug fixes), plus the NSAID flag, plus intercourse-timing feedback. All from existing data. **This is a shippable, honest, differentiated TTC+PCOS v3.1 with no hardware and no new claims.**

**Weeks 6–10:** onboarding question for `tracker_mode` (requires a signature change to the `complete_onboarding_v2` SECURITY DEFINER RPC and a coordinated client release) and making the TTC branch a **superset** of the existing dashboard, never a replacement. Today switching to TTC is a strict downgrade — you lose the orb, the countdown, the ovulation date, the fertile window, the nutrients and the content rail, and get an inert "Log Temperature" button.

**Weeks 8–20:** mechanism #1 (PdG ledger, manual entry, index scale, strip-agnostic) + mechanism #3 (per-user LH baselining) + Tier 2 cohort.

**Month 6 onward, gated on Tier 2's retention number:** Tier 3 clinical study. **Do not start the hardware programme until Tier 3 has read out.**