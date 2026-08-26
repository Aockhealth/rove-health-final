# Balance — Source Data & Citation Verification

_Compiled 2026-08-25. Primary source: the live product page at rovehealth.in/shop (the "Balance" product — retail name for Hormone Balance / Cycle Sync Balance), scraped directly from its rendered HTML, including the collapsed "View full formulation & references" panel and FAQ accordion, which are not visible without expanding them on-page. Each of the 9 numbered references Rove cites was then checked against the primary literature (PubMed, journal publisher pages, or a secondary abstract source where the publisher blocked automated access) rather than taken on faith. Built to ground the Hormone Balance pamphlets and the month-wise tracking section in verifiable numbers — not a substitute for Rove's own regulatory/medical sign-off before anything goes to print._

**How to read this file:** each reference below states what the trial actually did, then compares the trial's dose/form to what's actually in Balance. Where they don't match, that's flagged in bold — this is the same "publish the weakness of our own evidence" standard [docs/rove-brand-and-strategy-brief.md](rove-brand-and-strategy-brief.md) says is the brand's whole differentiator, so treat a flagged mismatch as information to keep in copy, not a problem to quietly drop.

---

## 1. What's actually on the label (per tablet)

Scraped from the live "View full formulation" table — this is the authoritative composition, more complete than `commerce.ts` in the repo (which lists ingredient names only, no doses).

| Nutrient | Dose | %RDA |
|---|---|---|
| Myo-Inositol | 1000mg | – |
| D-Chiro-Inositol | 25mg | – |
| Berberine HCl | 100mg | – |
| Chromium Picolinate | 100mcg | – |
| Methyl Folate (Vitamin B9) | 110mcg | 50% |
| N-Acetyl-Cysteine (NAC) | 300mg | – |
| Magnesium (Magnesium Hydroxide) | 125mg | 38.40% |
| Vitamin D3 | 300 IU | 50% |
| Zinc (Zinc Gluconate) | 6.6mg | 50% |
| Selenium (Sodium Selenate) | 20mcg | 50% |
| Vitamin B6 | 0.95mg | 50% |
| Vitamin K2 | 13.75mcg | 50% |
| Vitamin B12 | 1.1mcg | 50% |
| Vitamin C | 32.5mg | 50% |
| Vitamin E | 3.75mg | 50% |

Myo-Inositol : D-Chiro-Inositol = 40:1, matching the ratio Rove markets as "the clinical 40:1 ratio."

---

## 2. Claim → citation → verified study

### [1] Combined myo-inositol + D-chiro-inositol — insulin resistance & endocrine parameters
- **Citation:** Benelli E, Del Ghianda S, Di Cosmo C, Tonacchera M. "A Combined Therapy with Myo-Inositol and D-Chiro-Inositol Improves Endocrine Parameters and Insulin Resistance in PCOS Young Overweight Women." *International Journal of Endocrinology*, 2016;2016:3204083.
- **Design:** RCT, 46 obese (BMI>30) PCOS women — 21 treatment / 25 placebo — 6 months.
- **Trial dose:** 550mg MI + 13.75mg DCI, twice daily (1100mg MI + 27.5mg DCI/day, 40:1 ratio).
- **Balance's dose:** 1000mg MI + 25mg DCI/day, same 40:1 ratio — **~9% lower total, close match.**
- **Result:** fasting insulin 20.19→10.74 μU/mL (p<0.001); HOMA-IR 3.38→1.97 (p<0.05); free testosterone and LH also improved.
- **Authors' own limitation:** "more studies on a higher number of patients and with greater statistical significance are needed to confirm these striking posttreatment outcomes."

### [2] Chromium picolinate — insulin resistance
- **Citation:** Ashoush S, et al. "Chromium picolinate reduces insulin resistance in polycystic ovary syndrome: Randomized controlled trial." *Journal of Obstetrics and Gynaecology Research*, 2016. (Wiley — abstract only, publisher blocked full-text scraping; verified via indexed abstract.)
- **Design:** double-blind RCT, Ain Shams University Women's Hospital. 100 women enrolled, 85 completed (44 chromium / 41 placebo), 6 months. Primary outcome: fasting glucose-insulin ratio.
- **Trial dose:** 1000mcg (1mg) chromium picolinate/day.
- **Balance's dose:** 100mcg/day — **10x lower than the trialled dose.** Cannot responsibly claim trial-equivalent effect at this dose; frame as directional/adjunct only.

### [3] Berberine — PCOS with insulin resistance (meta-analysis)
- **Citation:** Li MF, Zhou XM, Li XL. "The Effect of Berberine on Polycystic Ovary Syndrome Patients with Insulin Resistance (PCOS-IR): A Meta-Analysis and Systematic Review." *Evidence-Based Complementary and Alternative Medicine*, 2018;2018:2532935.
- **Design:** meta-analysis/systematic review pooling 9 RCTs.
- **Trial doses pooled:** 300–500mg, 2–3x daily (900–1500mg/day), ~3 months.
- **Balance's dose:** 100mg/day — **well below the pooled trial range** (roughly 7–15% of it).
- **Result:** berberine performed comparably to metformin alone on HOMA-IR/fasting insulin/lipids; berberine+metformin or berberine+CPA combinations outperformed monotherapy on LH, testosterone and HOMA-IR.
- **Authors' own limitation — important:** the review concludes there is "insufficient data to make any conclusions on the effect of BBR on PCOS-IR" and calls for more rigorous double-blind, placebo-controlled trials. **This is a genuinely hedged, non-confirmatory conclusion — don't let front-of-pack copy oversell it.**

### [4] Magnesium — insulin resistance & metabolic profile
- **Citation:** Shahmoradi et al. "The Effect of Magnesium Supplementation on Insulin Resistance and Metabolic Profiles in Women with Polycystic Ovary Syndrome: a Randomized Clinical Trial." *Biological Trace Element Research*, 2023.
- **Design:** triple-blind RCT, n=40 (20 treatment / 20 placebo), assessed at 2 and 5 months.
- **Trial dose/form:** magnesium **oxide**, 250mg/day, 2 months.
- **Balance's dose/form:** magnesium **hydroxide**, 125mg — **different salt, half the dose.** Absorption differs by salt form, so equivalence isn't established.
- **Result:** improved insulin resistance and lipid profile vs placebo.
- **Limitation:** very small sample (n=40).

### [5] Vitamin D3 — ovulation rate & cycle length
- **Citation:** Tóth BE, Takács I, Valkusz Z, et al. "Effects of Vitamin D3 Treatment on Polycystic Ovary Symptoms: A Prospective Double-Blind Two-Phase Randomized Controlled Clinical Trial." *Nutrients*, 2025;17(7):1246. Registered NCT04840238.
- **Design:** prospective, multicentre (8 Hungarian sites, 2016–2020), double-blind, two-phase RCT. 177 screened → 115 enrolled → 84 in the intention-to-treat analysis.
- **Trial dose:** 30,000 IU/week for 12 weeks (≈4,286 IU/day equivalent), then 12 more weeks open-label at the same dose.
- **Balance's dose:** 300 IU/day — **roughly 14x lower than the trial's weekly-equivalent daily dose.** This is the largest dose gap found in the whole formulation.
- **Result:** ovulation rate ~40%→59–65% by week 12; mean cycle length 51.1→40.42 days (p=0.031); testosterone reductions in hyperandrogenic subgroups (p=0.047, p=0.0082).
- **Authors' own limitation:** "the relatively low number of trial subjects as well as the relatively short post-treatment period" limits generalizability.
- **Flag for compliance review:** the ovulation-rate and cycle-length figures are real and well-designed-trial-sourced, but at 1/14th the dose — any patient-facing use of "40%→59-65%" or "12 days shorter" needs the dose caveat attached every time, not just linked as a footnote.

### [6] 40:1 MI:DCI ratio — cycle regularity (the ratio-comparison study)
- **Citation:** Nordio M, Basciani S, Camajani E. "The 40:1 myo-inositol/D-chiro-inositol plasma ratio is able to restore ovulation in PCOS patients: comparison with other ratios." PMID 31298405.
- **Design:** 56 PCOS women, 8 per arm, 7 ratios compared head-to-head (DCI alone, and MI:DCI at 1:3.5, 2.5:1, 5:1, 20:1, 40:1, 80:1). 2g total inositols, twice daily (4g/day), 3 months. Primary outcome: ovulation.
- **Result:** 40:1 identified as the most effective ratio for restoring ovulation and normalizing FSH/LH/SHBG/E2/free testosterone/insulin/HOMA-IR/BMI; effectiveness dropped when the ratio shifted toward more DCI. The "restored menstruation in 5 of 8 women" figure matches this study's 8-women-per-arm design.
- **Limitation:** very small per-arm sample (n=8) — this is a ratio-*optimization* study, not a large confirmatory trial. Rove's own page already states this correctly ("the strongest result of any ratio tested," not "proven"). Note also: this trial's total daily inositol dose (4g/day) is far above Balance's 1.025g/day — the study established which *ratio* works, not that this *absolute dose* replicates the result.

### [7] Zinc — acne (meta-analysis)
- **Citation:** Yee BE, Richards P, Sui JY, Marsch AF. "Serum zinc levels and efficacy of zinc treatment in acne vulgaris: A systematic review and meta-analysis." *Dermatologic Therapy*, 2020. doi:10.1111/dth.14252.
- **Design:** systematic review + meta-analysis, 25 studies, 2445 participants, PRISMA methodology.
- **Doses:** heterogeneous across the 25 pooled studies (not a single dose) — dermatology-literature acne trials commonly run 30–400mg elemental zinc/day, well above Balance's 6.6mg zinc gluconate.
- **Balance's dose:** 6.6mg zinc gluconate — **a food-supplement-level dose, not confirmed to match the therapeutic range in the pooled acne trials.** Treat as directional support for zinc as a nutrient class, not confirmation at this dose.
- **Result:** significant reduction in inflammatory papule count with zinc treatment; acne patients had lower serum zinc than controls at baseline.

### [8] Tracnil (myo-inositol + folic acid + vitamin D3) — PCOS dermatological manifestations
- **Citation:** Ramanan EA, Ravi S, Anbu KR, Michael M. "Efficacy and Safety of Tracnil™ Administration in Patients with Dermatological Manifestations of PCOS: An Open-Label Single-Arm Study." *Dermatology Research and Practice*, 2020;2020:7019126.
- **Design: open-label, single-arm** — no control group. 2 dermatology centres in India, n=33, 24 weeks.
- **Trial dose:** 2000mg myo-inositol + 1mg folic acid + 1000 IU vitamin D3 per 5g sachet, twice daily — a different, higher-dose combination product, not Balance itself.
- **Result:** inflammatory lesions −69.3% (p<0.01), non-inflammatory lesions −63% (p<0.01), hirsutism score 10→5.8, menstrual regularity 10%→68%.
- **Authors' own limitation — the important one:** open-label single-arm design "cannot distinguish treatment effects from placebo response or natural improvement," and the authors themselves call for a randomized controlled trial to validate it. **This is the source of the "69% fall in inflammatory lesions" figure — it is the weakest-design study in the whole reference list (uncontrolled, unblinded) and should never appear without its open-label caveat attached.**

### [9] Selenium + vitamin E — acne (via glutathione peroxidase)
- **Citation:** Michaëlsson G, Edqvist LE. "Erythrocyte glutathione peroxidase activity in acne vulgaris and the effect of selenium and vitamin E treatment." *Acta Dermato-Venereologica*, 1984. PMID 6203294.
- **Design:** open, uncontrolled trial, n=29, 6–12 weeks.
- **Trial dose/form:** selenium as sodium **selenite** (Na₂SeO₃), 0.2mg, + tocopheryl succinate (vitamin E) 10mg, twice daily.
- **Balance's dose/form:** selenium as sodium **selenate** — a different salt than the one trialled — at 20mcg (~0.02mg), **roughly 100x lower than the trial dose.**
- **Limitation:** 42-year-old paper, uncontrolled/open design, small n, different chemical form and far lower dose than what's in Balance. **Weakest citation in the set — supports selenium/vitamin E as a class for skin oxidative stress, nothing more specific.**

---

## 3. Safety / positioning language already live and compliance-reviewed (verbatim)

Pulled from the live FAQ accordion. Use these as-is — Rove has already committed to this exact framing publicly, so pamphlet copy should match it, not soften or strengthen it:

- **"Is Balance only for people diagnosed with PMOS?"** → *"No. Balance is built for anyone with irregular cycles, though its insulin-sensitising ingredients are especially studied for PMOS."*
- **"When do I take it?"** → *"One to two tablets daily, or as directed by your dietician. There's no phase to time it to — irregular cycles don't have a predictable Day 1 to count from."*
- **"Can I take it with my prescription?"** → *"Check with your doctor first. Balance is a supplement, not a medicine, and we don't market it as a replacement for treatment."*
- **"Is it safe while pregnant or breastfeeding?"** → *"Speak to your doctor before starting. We'd say the same for anyone already on prescription medication."*

The site's own "Our Standards" block states: *"A supplement, not a medicine — and we don't market it as a replacement for treatment."*

---

## 4. What this means for pamphlet / month-wise copy

**Strong enough to state with normal confidence (RCT or ratio-comparison design, dose reasonably close):**
- [1] combined MI+DCI insulin/endocrine improvement
- [6] 40:1 ratio restoring ovulation (5 of 8 women)
- [5] vitamin D3 ovulation/cycle-length data — strong trial, **but must always carry the ~14x dose-gap caveat**

**Real but should be hedged hard, or kept off patient-facing print entirely:**
- [3] berberine — the meta-analysis's own authors say the evidence is insufficient to conclude
- [7] zinc — dose in Balance not shown to match therapeutic range
- [8] Tracnil / 69% acne figure — open-label, single-arm, no control group
- [9] selenium/vitamin E — 1984, uncontrolled, wrong salt form, 100x dose gap
- [2] chromium, [4] magnesium — real RCTs, but Balance's dose is well below (chromium 10x, magnesium 2x) what was trialled

**For the month-wise section specifically:** none of these 9 studies report a month-by-month trajectory — [1], [4], [5] and [6] report a single pre/post measurement at trial's end (6 months, 2–5 months, 12–24 weeks, and 3 months respectively). There is no citable numeric timeline to put on a Month 1/3/6/12 graphic. This confirms the earlier call to keep that section as "what to track with your clinician," not numbers — and gives it real grounding: **Month 6 lines up with the ~24-week window [1] and [5] actually used**, so that's a defensible checkpoint to anchor the timeline to, not an arbitrary one.

---

## 5. Live compliance flag: "PMOS" vs "PCOS"

Confirmed still live on rovehealth.in/shop as of 2026-08-25 — the page uses "PMOS" throughout (badges, FAQ, benefit copy), never "PCOS." This matches the unresolved item already flagged in [rove-brand-and-strategy-brief.md](rove-brand-and-strategy-brief.md) (Open item #2). "PMOS" is not a recognized clinical term — every citation in this file, and PCOS literature generally, uses PCOS. If "PMOS" is an unintentional typo rather than a deliberate brand term, it's a live accuracy issue on the production site, not just an internal-doc note, and should be resolved before it's carried into new print material.

---

## Sources

- [rovehealth.in/shop — Balance product page](https://rovehealth.in/shop) (live page, scraped 2026-08-25, including collapsed formulation/reference panel and FAQ accordion)
- [1] [PMC4963579](https://pmc.ncbi.nlm.nih.gov/articles/PMC4963579/)
- [2] [Wiley J Obstet Gynaecol Res 10.1111/jog.12907](https://obgyn.onlinelibrary.wiley.com/doi/10.1111/jog.12907) · [abstract via ResearchGate](https://www.researchgate.net/publication/287000778_Chromium_picolinate_reduces_insulin_resistance_in_polycystic_ovary_syndrome_Randomized_controlled_trial)
- [3] [PMC6261244](https://pmc.ncbi.nlm.nih.gov/articles/PMC6261244/)
- [4] [Biol Trace Elem Res 10.1007/s12011-023-03744-7](https://link.springer.com/article/10.1007/s12011-023-03744-7) · [Semantic Scholar](https://www.semanticscholar.org/paper/The-Effect-of-Magnesium-Supplementation-on-Insulin-Shahmoradi-Chiti/d11727d236b078b523027c7cd8a4dad52f9ac52e)
- [5] [PMC11990587](https://pmc.ncbi.nlm.nih.gov/articles/PMC11990587/)
- [6] [PubMed 31298405](https://pubmed.ncbi.nlm.nih.gov/31298405/) · [full text PDF, europeanreview.org](https://www.europeanreview.org/wp/wp-content/uploads/5512-5521.pdf)
- [7] [Wiley Dermatol Ther 10.1111/dth.14252](https://onlinelibrary.wiley.com/doi/abs/10.1111/dth.14252)
- [8] [PMC7128037](https://pmc.ncbi.nlm.nih.gov/articles/PMC7128037/)
- [9] [PubMed 6203294](https://pubmed.ncbi.nlm.nih.gov/6203294/) · [abstract, medicaljournals.se](https://www.medicaljournals.se/acta/content/abstract/10.2340/0001555564914)
