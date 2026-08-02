# Rove Health — Patent Landscape & Freedom-to-Operate

_Generated 2026-08-01 by a 4-agent research workflow (3 parallel patent sweeps + consolidation), reading Google Patents claim text directly._

> **THIS IS ENGINEERING RESEARCH, NOT A LEGAL OPINION.** A registered patent attorney — an Indian agent for India, US counsel for any US exposure — must run a formal FTO search and issue a written opinion before any filing or launch decision. Several conclusions rest on the *absence* of Indian filings, which was NOT verified against the Indian Patent Office register (InPASS is CAPTCHA-gated). Closing that gap is the first action item.

# ROVE HEALTH — CONSOLIDATED FREEDOM-TO-OPERATE PICTURE

**Sources:** three independent patent sweeps (wearable/physiological layer; urine-strip + smartphone-colorimetry layer; algorithm/PCOS layer), merged and reconciled. **No new searching was performed in this consolidation** — every finding below inherits the verification status of the underlying sweep, and where the sweeps disagree I say so rather than picking a winner.

> ⚠️ **THIS IS ENGINEERING RESEARCH, NOT A LEGAL OPINION.** Claim-scope reasoning below is technical inference from claim language read through web tools, much of it truncated or unverified. It is not a freedom-to-operate opinion and cannot be relied on as one. **A registered patent attorney (Indian agent for India; US counsel for any US exposure) must run a formal FTO search and issue a written opinion before any filing or launch decision.** Several conclusions rest on the *absence* of Indian filings, which was never confirmed against the Indian Patent Office register.

---

## 0. THE ONE-PAGE ANSWER

1. **Nobody owns Rove's concept.** No granted claim anywhere in three sweeps reads "fuse LH/FSH strip data + HRV + RHR + skin temperature + mucus + BBT and output a confirmed ovulation day." Every blocking claim in this landscape is anchored to **one mandatory physical input** — an HR/HRV skin-contact sensor, a ring housing, continuous wearable temperature, an intravaginal probe, a hardware reader, a colour board, or a test-line-to-control-line ratio. **Sensor-agnostic multi-modal fusion is the freedom-to-operate strategy, not just the product position.**

2. **The strip reader is the real exposure, not the wearable layer.** Rove's smartphone-camera colorimetry is the component most likely to land inside someone's granted US claim (Easy Healthcare, MFB, Oova, Cornell, Healthy.io, Reliant — four different mechanisms, ~2034–2042). The wearable-fusion layer is comparatively easy to walk between.

3. **India may be permanently clear for almost the entire landscape — and the reason is a deadline, not a search result.** The 31-month PCT national-phase window into India has now *closed* for every family here with a priority date before ~January 2024. That is all of Ava, all of Oura, Apple, Fitbit, Roche, MFB, Cornell, Healthy.io, Reliant, Oova, and Easy Healthcare's core 2020 family. If they did not enter India by now, **they can never enter India for those inventions.** The two live India exposures are Inito's already-entered application and post-2024-priority filings.

4. **One competitor matters in India: Inito.** IN 202317046017 (entered 2023-07-08) claims, as filed, mapping urinary hormone concentration *or rate of change* onto cycle phase to predict a health condition. As filed that would read on Rove's product thesis. **An Indian pre-grant opposition is the single highest-value, lowest-cost action available.**

5. **The most dangerous single product decision Rove could make is adding a contraception / "safe days" mode.** Ava US12502162B2 runs to 2042, uses the broadest sensing language in the landscape, and is anchored precisely to emitting a contraception interval.

6. **The incumbents' moat is regulatory, not patent.** Natural Cycles, Flo, Clue, Glow and Ovia hold **no enforceable cycle-algorithm patents** — Ovia's and Kindara's were abandoned, Natural Cycles relies on FDA De Novo + trade secret. Rove's binding constraint in India is CDSCO software-as-medical-device, not IP.

---

## 1. CONFIDENCE MAP — WHERE THE SWEEPS DISAGREE

These conflicts are load-bearing and must be resolved before architecture is frozen.

| Patent | Sweep A said | Sweep C said | Why it matters |
|---|---|---|---|
| **Oura US12558022B2** | Claim 1 verbatim: requires a **finger ring with ring-shaped housing**, processors inside it, and **invert-the-derivative** morphology. Narrow. | Claims truncated; inferred as generic **wearable temperature morphology** phase identification to 2044. Broad. | If Sweep C is right, this is a major granted obstacle to any temperature-phase feature. If Sweep A is right, it is irrelevant to a phone-first product. **Resolve first.** |
| **Ava US10779802B2** | Claims 1 and 12 both require the fertility phase be **displayed on the wearable's own screen**. | Describes per-user TPup/TPlow thresholds; **no display limitation mentioned**. | The display limitation is the cleanest single escape from Ava's foundational claim. Do not rely on it until re-read verbatim. |
| **Fitbit US10765409B2** | Granted claim 1 requires **hemoglobin-to-water ratio / hemoglobin concentration** → clean non-infringement. | Read the *pre-grant publication* claims: HR-driven **predict → observe → update loop**, no hemoglobin. | Reconciled: the loop language was almost certainly narrowed out during prosecution. The residual risk is continuation **US11889994B2**, whose claims nobody read. |
| **Oura US20220313223A1** | Claims not read. | Read as close paraphrase: temperature morphology → anovulatory cycle → notify. | Medium confidence. Pending either way. |
| **Prima-Temp US10828015B2** | **Expired**, fee-related. | "Granted — status not confirmed." | Low stakes (intravaginal), but the discrepancy shows how unreliable status fields were. |
| **Apple US20220387003A1** | "Most dangerous pending claim in the landscape." | "Device-bound apparatus claim; not readable against a phone app." | Both correct. It is broad *as to signal* (HR only, no temp/HRV) but narrow *as to embodiment* (all modules inside the wearable). Dangerous only if Rove ships hardware, or if method continuations issue. |

**Claim sets never read at all** (ordered by risk): Oura US20240071624A1 (PCOS/endometriosis), Oura US12558022B2, Oura US12551197B2, Fitbit US11889994B2 + US10765409B2 claims 11/16, MFB US12061196B2 numbered claims, Oova US12591974B2 granted claims, Cornell US9787815B2, Fertility Focus US9155522/523B2, Inito US10606051B2. Plus the unresolved lead **WO2021092595A1** (reference marks on a sample holder for optical-system calibration — squarely on Rove's calibration question, never fetched).

---

## 2. THE BLOCKING SET

Organised by which part of Rove's stack each one touches. Titles are ignored throughout — several patents with alarming titles ("Fertility window prediction using a CNN", "Menstrual cycle tracking") turn out to claim a box with a camera in it.

### 2A. Strip reader + smartphone colorimetry — **the densest and highest-risk layer**

**① Easy Healthcare (Premom / Easy@Home) — US11519909B2 + US12287293B2 (+ ≥2 pending continuations, + WO2025250702A1). Expiry 2041.**
*Scope (verified verbatim):* claim 1 is nothing more than a strip with a **test line and a control line**, plus a camera device that computes a **colour-density value for each line** and takes their **ratio (T/C)**. Analyte-agnostic; LH and FSH are named in the family's analyte list. This is close to the minimum description of what Rove intends to build.
*Design-around:* **never compute a test-to-control ratio.** Normalise the test line against an absolute reference that is *not* the control line — the unreacted nitrocellulose membrane as a white point, or a camera-metadata-derived illuminant estimate — and derive the reading from calibrated absolute reflectance. Secondary: claim 1 is a *combination* (test device + user device), so who supplies both affects liability. Tertiary: substantial invalidity ammunition exists (Cornell 2013, Healthy.io 2014, Reliant 2016, MFB 2017, Oova 2018 all predate the 2020 priority).
*The real problem is the continuations.* Two were pending. Easy Healthcare can keep drafting new claims aimed at whatever Rove ships, which means a one-off FTO clearance here has a short shelf life. **Order the file wrapper (US 16/890,443 family)** — the prosecution history is the cheapest reliable map of what they surrendered.

**② MFB Fertility (Proov) — US12061196B2. Expiry 2042 (longest-lived obstacle found).**
*Scope (partially verified):* the **image pipeline itself**, analyte-agnostic — sweep a **1-D vector of colour values across horizontal pixel positions**, locate control and test lines within that vector, **normalise against control-line "depth"** to compensate for lighting, and **calibrate to a hormone or analyte level**. This is the textbook implementation every team writes first.
*Design-around:* locate lines by **2-D segmentation or CNN keypoint detection** on the whole strip image, not a 1-D horizontal sweep; do lighting correction from anything other than control-line depth; and output an **ordinal band** ("low / rising / peak") rather than a hormone level. Note: 2017 priority but filed 2021 with a 2042 expiry, implying heavy narrowing — pull the file wrapper for prosecution-history estoppel.

**③ Oova — US12591974B2 (+ PCT WO2019246361A1). Expiry 2040.**
*Scope (partially verified):* the closest analogue to Rove's whole strip product — no accessory, phone camera only, **HSV / hue-saturation-value / lightness pixel intensities**, plus an **orientation element on the lateral flow device** encoding batch data used to normalise the control area, plus a personalised hormone curve that improves per user.
*Design-around:* (a) work in **CIELAB/CIEXYZ**, not HSV/HSL; (b) carry lot calibration **out-of-band** — code on the foil pouch or carton, not an element printed on the strip.

**④ Cornell University — US9445749B2 + US9787815B2. Expiry 2034.**
*Scope (verified):* a **constant-colour calibration region on the test platform**, imaged in the same frame as the test region; **median RGBA** over a pixel array; convert to **HSL/HSV**; **hue-to-concentration calibration curve**. Expressly aimed at calibrating away phone-to-phone camera differences. Academic assignee → licensing posture, but Cornell licenses actively.
*Design-around:* four stackable limitations, drop any one. Best combination: no purpose-printed constant-colour region (use the blank membrane as white point) **and** no HSL/HSV (use CIELAB), **and** map calibrated reflectance/optical density rather than hue.

**⑤ Healthy.io — US10068329B2. Expiry 2034.**
*Scope (verified verbatim):* the gold-standard version — a **colour board with a grid of grey patches plus multiple sets of reference colour patches, each set gamut-matched to a respective reagent**, used to derive **local** illumination parameters.
*Design-around:* essentially impossible to infringe accidentally on a single-colour gold-nanoparticle LH/FSH strip — you cannot have per-reagent gamut-matched patch *sets* with one reagent colour. A greyscale-only reference ladder plus a **global** (not local) illuminant estimate clears it comfortably.

**⑥ Reliant Immune Diagnostics — US11579145B2 (+ parent US9857373B1, reportedly ~108-patent family). Expiry 2037.**
*Scope (verified verbatim):* a **server** that receives a mobile image, determines RGB values, **normalises them into a single value**, compares to a **control value stored on the server**, and returns a risk indicator — requiring an **alignment target on the test device** and a **plurality of immunoassay test strips**.
*Design-around:* **run the entire pipeline on-device.** Every step of claim 1 is performed by the server. This is also the best privacy story and the best India latency story. Secondarily: no printed alignment target — register geometrically. The ~108-patent surround is a thicket, not a single patent; it needs professional clearance before any US shipment.

**⑦ MFB Fertility PdG family — US11573225B2, US11029321B2 (+ apparent system sibling 11061026), US12282029B2.**
*Scope:* the working chemistry of a consumer PdG strip (antibody isotypes, 8–32 hapten molecules per carrier, 3–20 µg/mL threshold), the **multi-day testing protocol** for corpus-luteum assessment, and **PdG multiplexed with any second hormone on one cassette**. MFB has litigated (MFB v. Easy Healthcare, N.D. Ill. 1:20-cv-07833).
*Design-around:* **do not put a PdG line on the strip, and never ship "confirm ovulation by repeated progesterone-metabolite testing" in the US.** Rove is LH/FSH; none of this reaches LH/FSH. This is a hard product rule, not a nuanced one. Note MFB's EP position is partial and no Indian counterpart surfaced.

### 2B. Wearable / physiological fusion layer

**⑧ Ava — US11766248B2 ("temperature nadir"). Expiry 2037. The single closest patent to Rove's fusion concept.**
*Scope (verified verbatim):* genuine temperature **+ HR/HRV fusion to pinpoint the ovulation event** — but with two hard hooks. (i) The fertile-phase start must be found by **absolute interbeat-interval threshold crossings** (a set time after IBI exceeds a defined threshold, or when it drops below after having exceeded it). (ii) The ovulation marker must be a **temperature NADIR — a temporary DECREASE**.
*Design-around:* both hooks fail together if Rove (a) confirms ovulation from the **sustained post-ovulatory biphasic RISE plus an RHR step change** — which is clinically the stronger signal and what Apple, Oura and Natural Cycles do — and (b) gates on **personalised rolling-baseline z-score deviation or a learned posterior**, never on absolute IBI thresholds. *Engineering instruction:* ensure no nadir detector exists anywhere in the pipeline, including as an intermediate feature.

**⑨ Ava — US10779802B2 (foundational). Expiry 2036.**
*Scope:* skin-contact HR+HRV wearable that brackets the fertile window from **IBI direction reversal** (short→longer = start, long→shorter = end), with per-user thresholds — and, per Sweep A's verbatim read, **outputs the phase on the wearable's own display** in both independent claims.
*Design-around:* three independent exits — no on-wearable display (phone-first naturally clears it, *pending re-verification*); no IBI direction-reversal trigger; and territorially the PCT WO2016131630A1 entered **only CN, EP, US** and is itself listed Ceased. **Ownership flag:** now recorded through Ava Woman LLC / Ava Sciences-FMTC LLC to **Femtec Health, which wound down.** A distressed-asset chain in the hands of a non-practising holder changes the risk profile materially. **Run a corporate-records check.**

**⑩ Ava — US12502162B2 ("contraception"). Expiry 2042. Highest strategic risk in the landscape.**
*Scope (verified verbatim):* broadest sensing language of the four — generic **"physiological data"** from a wearable, an **ML model producing cycle-phase probabilities**, conversion via **pre-determined probability thresholds** into **"the time interval for using contraception,"** and a message containing it.
*Design-around:* **do not ship a contraception or "safe days" mode, ever.** Also avoid the architecture: emit a **confirmed-ovulation event with a calibrated confidence**, not per-phase probabilities compared against fixed thresholds. Note the tension this creates with the Ava-'248 design-around: the answer is a posterior over **ovulation day** (a point event, per-user calibrated), not a posterior over **phase membership** against pre-set cut-offs.

**⑪ Ava — US12446865B2. Expiry 2041.**
*Scope:* the only granted claim reciting HR **and** HRV **and** skin temperature together for an ovulation determination — but drafted with the **closed "consisting of"** transition, requiring **manual user entry of actual menses**, windows starting **exactly ten days after ovulation**, and the processor performing conception **and** miscarriage **and** ovulatory-cycle detection. And it only labels a whole cycle ovulatory vs anovulatory.
*Design-around:* unusually easy — per-day ovulation confirmation, menses inferred automatically from physiology, no pregnancy/miscarriage features. Rove is outside on at least four independent grounds.

**⑫ Oura portfolio — US12558022B2 (granted, to 2044), US12551197B2 (granted), US20220313223A1 (pending), EP4312797A1 (pending).**
*Scope:* phase identification from **morphological features of a continuous wearable temperature series**; menses-onset prediction by **fitting temperature to trigonometric/polynomial functions**; anovulation detection from temperature morphology; fertility scoring from **cycle-length statistics including anovulatory-cycle count**. Oura is by far the largest holder here (≥18 filings) and is filing roughly annually toward diagnosis.
*Design-around:* no compute-then-invert-the-derivative; no slope/extremum morphology as the phase mechanism; no trig/polynomial curve fitting for onset prediction; and — decisively — **ship no wearable and require no continuous temperature series**. Territorially: PCT WO2022192684A1 entered CA, EP, JP, CN, AU, US — **no India**, and the window has closed.

**⑬ Fitbit/Google — US10765409B2 (to 2039) + continuation US11889994B2 (unread).**
*Scope:* the granted claim requires **hemoglobin-to-water ratio or hemoglobin concentration change** fused with heart-rate data → Rove cannot infringe, since hemoglobin is a mandatory element. The *published* claim was the broader **predict → observe HR → update prediction** loop, structurally the closest thing in the landscape to Bayesian updating.
*Design-around:* trivially satisfied today (no hemoglobin metric). The residual risk is the unread continuation. **Rule: treat wearable heart rate as an optional convenience input; the core inference loop must run correctly without it.**

**⑭ Apple — US20220387003A1 (pending).**
*Scope:* an apparatus claim — a wearable containing a calendar module, HR sensor, preprocessing module, **ovulation estimator**, and **period estimator** fed by the ovulation estimator. HR-only; no temperature, no HRV.
*Design-around:* Rove ships no wearable, so as published it is not readable. Two cautions: watch for **method-claim continuations**, and avoid literally structuring the codebase as `preprocessing → ovulation estimator → period estimator` with HR as the driver.

**⑮ Fertility Focus / Vio HealthTech (OvuSense) — US9155522B2 / US9155523B2. Expires Sept–Nov 2027.**
*Scope:* **multiple temperature readings per extended period**, artefact rejection, representative values, repeated **across multiple cycles**, analysed for ovulation-predictive patterns. Would read on a BBT-heavy app that samples more than once daily. Broader than expected for a temperature method.
*Design-around:* **time is the answer** — this dies in ~14 months and then becomes free prior art. Until then: single daily BBT reading, and do not build the artefact-rejection → representative-value → multi-cycle-pattern pipeline as the mechanism.

### 2C. PCOS / anovulation output layer

**⑯ Oura — US20240071624A1 (PCOS + endometriosis, pending, US-only). THE BIGGEST UNKNOWN.**
*Scope (claims never read):* per the abstract, identifying irregular cycles, PCOS and endometriosis by comparing wearable measurements against **both a personal baseline and population benchmarks** and computing a risk metric; a **binary classifier** for PCOS risk. Signals: continuous/nighttime temperature, HR, HRV, respiratory rate, sleep architecture, SpO2, GSR, actigraphy.
*Design-around:* keep the PCOS score off wearable-sensor inputs entirely — build it from cycle history, at-home LH/FSH strip results, mucus logging and androgenic self-report. Avoid the "personal baseline vs population benchmark deviation" framing if it survives into the granted claims. **Pull these claims before freezing the PCOS architecture. This is open risk, not cleared risk.**

**⑰ Roche — US20230221335A1 (pending).**
*Scope (verified):* PCOS risk from an **OA-value (cycle irregularity) + HA-value (androgen status) + an AMH concentration**, optionally age/weight, combined into **one combined value** by weighted mathematical operations, compared to a **reference population**. LH and FSH are *not* recited.
*Design-around:* **the AMH element is the escape hatch** — an AMH measurement is a mandatory claim element. No AMH assay = no read. Second exit: output a calibrated per-user posterior probability, not a single combined value against a population reference. **And note what this leaves open: LH/FSH-ratio-based PCOS screening is unclaimed by the only serious PCOS-score filer.**

**⑱ Inito — WO2022123600A1 / IN 202317046017 / US 18/266,250 (US20240053362A1) / GB2617503A. THE INDIA ONE.**
*Scope (verified as filed):* determine concentrations **or rate of change** of E3G, LH, PdG, FSH or hCG; **map at least one analyte concentration to a phase of the cycle**; **predict a health condition**. "Health condition" is unqualified. As filed this covers Rove's entire product thesis.
*Assessment:* almost certainly unpatentable as filed — anticipated by Unipath (US6454726B1, US6234974B1) and Manawatu (WO2007049157A2), and vulnerable under Indian s.3(k)/3(i). The WO has **ceased** and the **EP national phase was never entered**, suggesting constrained budget or examiner pushback. But India *was* entered.
*Design-around (India):* derive the output from the **timing and presence/absence of events** — "surge detected on day N" / "no surge in this cycle" — fed to a temporal model, **not** from an analyte concentration or rate of change mapped to a cycle phase. This converges with the strip-layer rule to emit ordinal states rather than concentrations.

---

## 3. THE CONSOLIDATED DESIGN-AROUND RULEBOOK

A single engineering spec that threads every blocker above. This is the most directly actionable output.

**Strip reader**
1. Never compute a test-line-to-control-line ratio.
2. Never derive lighting normalisation from the control line's depth or density.
3. Locate lines by 2-D segmentation / keypoint detection — not a 1-D horizontal colour-value sweep.
4. Work in linear sRGB → CIEXYZ → CIELAB with chromatic adaptation. Never HSV/HSL/hue/lightness.
5. Do not use a median RGBA over a pixel array as the measurement statistic; fit a line-profile model.
6. No printed constant-colour calibration region, no colour board with a grey grid, no per-reagent gamut-matched patch sets. Prefer **no printed reference at all**.
7. Global illuminant estimate, not spatially-local illumination parameters.
8. No orientation element / lot-code printed on the lateral-flow device. Lot calibration comes from the pouch or carton, out-of-band.
9. Entire pipeline **on-device**. No server-side RGB normalisation, no server-stored control value.
10. No printed alignment target — geometric registration only.
11. Output an **ordinal band relative to the user's own history** ("baseline / rising / peak / post-peak"), never a hormone concentration.
12. **No PdG line on the cassette.**
13. No clip-on optic or waveguide accessory; no hardware reader body; single-frame capture, never scan-by-relative-motion.

**Wearable fusion**
14. Confirm ovulation from the **sustained post-ovulatory rise**. No nadir / temporary-decrease detector anywhere in the pipeline.
15. Gate on **personalised rolling-baseline deviation** or a learned posterior. Never absolute IBI threshold crossings, never IBI direction reversal.
16. Never render a fertility phase on a wearable's own display.
17. **Ship no wearable.** Ingest third-party streams (Apple Health, Google Fit, Mi Band, Noise, boAt). This single decision removes the mandatory "wearable device" element from the majority of apparatus claims in the landscape at once.
18. No compute-then-invert-the-derivative; no slope/extremum morphology of a temperature series as the phase mechanism; no trig/polynomial curve fitting for menses-onset prediction.
19. No hemoglobin concentration or hemoglobin-to-water ratio.
20. Wearable HR is an **optional** input; the core loop must run without it.
21. Single daily BBT reading until Q4 2027.
22. No manual menses entry to set analysis windows; no windows hard-coded to ten days post-ovulation; no conception/miscarriage detection shipped alongside ovulatory-cycle classification.

**Output layer**
23. **No contraception mode, no "safe days," no "use protection on these days," in any jurisdiction, ever.**
24. Output a **confirmed ovulation day + calibrated confidence** — not a fertile window, not a cycle label, not a vector of per-phase probabilities compared against pre-determined thresholds.
25. No AMH requirement in the PCOS score; no reduction to a single combined value compared to a population reference.
26. Derive anovulation from **multi-modal absence-of-signature**, not from morphology of any single time series.
27. In India: outputs derive from **event timing and presence/absence**, not from analyte concentration or rate of change mapped to a cycle phase.

---

## 4. THE CLEAR GROUND

Low infringement risk on the evidence gathered. Rove can build these with confidence, subject to the rulebook above.

- **Cervical mucus logging and its fusion into the model.** Genuinely clean. The only mucus patents found are **imaging** rigs — Bridging Biosciences US11521401B2 (a box with a slide holder, light source and camera looking for ferning and white blood cells) and HiLin US9568463B2 (lapsed March 2025). Kindara's BBT + cervical-fluid dual-axis charting application was **abandoned**. User self-report of mucus consistency, fused probabilistically, is unclaimed by anyone.
- **BBT from a single daily reading.** Acc Syndicate US8540644B2 (expired) and Tepsync US8834389B2 (expired) put the core ideas in the public domain in 2006 and 2011. Only Fertility Focus is live, and only until 2027.
- **Per-user adaptive hormone thresholds.** Unipath/Clearblue US6454726B1 and US6234974B1 claimed exactly this — a threshold for an individual woman derived from her own previous cycles — and both **expired August 2013**. Freely practisable, and strong §102/§103 ammunition against anyone asserting a personalised-threshold claim later.
- **Population-model-plus-personalisation for ovulation prediction.** Ovia/Ovuline US20150112706A1 claimed it and was **abandoned** at both the 2013 parent and the 2023 continuation. Published (2015) → blocks others, owned by nobody → does not block Rove. This is the single most useful negative finding in the landscape.
- **Third-party wearable data ingestion.** Nearly every claim recites a wearable device as a positive system element. Consuming streams someone else's hardware already collected leaves no wearable to attribute.
- **Phone- and cloud-side inference.** Ava '802 requires on-wearable display; Apple's pending claim puts every module inside the wearable; Oura '022 requires processors inside a ring housing; Reliant requires a server. A dumb-sensor + on-device-inference architecture steps outside all four simultaneously.
- **LH/FSH-only strip chemistry.** MFB's genuinely strong position is PdG-specific. Nothing in it reaches LH or FSH.
- **Fluorescence-free colorimetric reading.** Mira/Quanovate's position is fluorescence + a $100+ benchtop analyser — a different modality, largely lapsed outside CN. Their hardware dependence is the market gap Rove is attacking, not an obstacle.
- **Accessory-free capture.** Inito's optical light-collection patent (US10606051B2) is hardware optics; removing the clip-on lens is a differentiator, not an infringement (claim 1 unread — confirm).
- **The app incumbents.** Natural Cycles (zero patents; FDA De Novo DEN170052 + six 510(k)s + trade secret), Flo (zero), Clue/Biowink (one German hardware patent; their generative cycle model is published and free), Glow (zero), Ovia (abandoned), Kindara (abandoned).

---

## 5. THE WHITE SPACE — RANKED BY VALUE TO ROVE

*This is where Rove's own filings should go. Ranked by (defensibility × strategic value to Rove × India relevance).*

**1. Cross-modal semi-supervised personalisation: using smartphone-read LH/FSH strip events as ground-truth labels to personalise a physiological ovulation model.**
Unclaimed, and structurally hard for anyone else to reach: **nobody else has both modalities.** Ava, Oura, Apple, Fitbit have physiology and no strips. Easy Healthcare, MFB, Oova, Inito have strips and no physiology model. This is Rove's genuine crown jewel — it is simultaneously the product moat, the data moat, and the cleanest patentable delta.

**2. Adaptive test scheduling as a closed loop — telling the user when to test next based on the current posterior, and minimising strips consumed per cycle.**
Nobody claims scheduling. Inito's claim has a mapping step but no scheduling step. Manawatu disclosed *prompting* in a 2007 specification but never claimed it — which kills a broad claim to "prompt the user to test" while leaving a specific expected-information-gain scheduler wide open. Commercially this is the India feature: strips cost money, and halving strips per cycle at equal confidence is the entire value proposition in a price-sensitive market.

**3. Anovulation and PCOS screening from non-wearable, non-AMH evidence.**
Only three filings exist in this whole area (Oura ×2, Roche ×1), **all pending, none granted**, and each has a clean structural exit (wearable temperature morphology / AMH assay). The academic ML-for-PCOS literature is enormous — including a large Indian contingent on the Kerala PCOS dataset — while the patent literature is nearly bare. That mismatch is the classic signature of real white space, *and* it means the literature constrains how broadly Oura and Roche can ultimately claim. **The window is closing: Oura is filing annually in this exact direction.**

**4. LH:FSH ratio trajectory from smartphone-read home strips, for PCOS screening and perimenopause staging.**
Roche — the only serious PCOS-score filer — recites AMH, testosterone and SHBG, and **does not recite LH or FSH at all**. FSH appears only in ovarian-reserve device claims and Inito's unexamined disclosure. Rove is already building an LH+FSH panel; the ratio trajectory is a classic PCOS marker and a perimenopause staging signal. Nobody found has claimed either.

**5. Reference-free device-independent colour calibration.**
Every granted calibration claim requires a **physical reference in the frame** — Cornell needs a constant-colour region, Healthy.io needs a colour board, MFB and Easy Healthcare both normalise against the control line. Unclaimed: illuminant estimation from camera RAW/EXIF metadata, paired flash-on/flash-off differencing, dual-exposure bracketing, or the blank nitrocellulose membrane as white point. This is both the largest patentable opening in the strip layer **and** the required design-around from blocker ①. *Caveat: run a computational-photography prior-art search before filing — flash-differencing illuminant estimation is well developed outside this field.*

**6. Ovulation confirmation from the post-ovulatory sustained RISE fused with an RHR step change.**
Ava's US11766248B2 — the only granted temperature+HR/HRV ovulation-pinpointing claim — requires a **nadir**. Rise-based confirmation is outside it and is clinically the stronger signal.

**7. Explicit hierarchical Bayesian machinery with per-user priors over a heterogeneous evidence set.**
No claim anywhere recites Bayesian updating, posteriors, hierarchical/partial-pooling priors or shrinkage in a fertility context. The nearest live claim (Ava '802) personalises only a *threshold*; the nearest conceptual claim (Ovia) was abandoned. Sensor-agnostic likelihood functions that degrade gracefully when any input is missing have no counterpart in the claimed art.

**8. Per-day ovulation-day confirmation with calibrated confidence as the primary output.**
The granted claims split cleanly into fertile-*window* bracketing and cycle-*level* ovulatory/anovulatory labelling. "Ovulation occurred on day N, confidence X" is neither, and is squarely claimed by nothing verified.

**9. Longitudinal transition detection — change-point over the cycle-parameter trajectory.**
All existing anovulation art classifies a *single* cycle. Detecting a user's transition into or out of a chronically anovulatory state across many cycles — which is what actually matters clinically for PCOS and for treatment response — is unclaimed.

**10. Population-specific priors calibrated on an Indian cohort.**
Nothing claims conditioning cycle-model priors on population, ethnicity or geography. Given documented differences in cycle characteristics and PCOS prevalence/presentation in South Asian populations — and given that **no incumbent holds Indian-cohort data at scale** — this is both open and structurally defensible.

**11. Calibrated uncertainty presentation and abstention logic.**
No claim surfaces a calibrated confidence interval to the user, or has the system decline to predict when the posterior is too diffuse. Given that this is the core safety and regulatory story for a cycle app, it is both open and strategically valuable.

**12. Perimenopause / anovulatory-transition detection.** No patent found in any sweep claims wearable- or strip-based detection of the perimenopausal transition. Entirely open.

**13. Per-user baselines applied to image-derived intensity rather than hormone concentration.** Unipath claimed personal thresholds on *concentration* and expired in 2013. Learning a per-user mapping from smartphone-image line intensity directly to a personal surge threshold — skipping concentration entirely — is unclaimed, though Easy Healthcare and Oova both *disclose* per-user trending, so the claim must be narrow and well-drafted.

**14. HRV frequency-domain dynamics (LF/HF, RMSSD trajectory) as the phase discriminator.** Ava's claims are time-domain (interbeat intervals, SDNN). Frequency-domain autonomic balance is thinly claimed.

---

## 6. INDIA-SPECIFIC PICTURE

### Does a US or EP patent constrain an India-only product? **No.**

Patents are territorial. A US or EP grant confers no rights in India. Under the Indian Patents Act 1970 s.48, only an **Indian** patent gives the right to exclude making, using, selling, offering for sale or importing **in India**. An India-only product, sold to Indian users, is unconstrained by every US and EP patent in this report. *(Statutory characterisation is my own and must be confirmed by an Indian patent agent.)*

**Four ways Rove could accidentally lose that protection:**
1. **App store distribution.** If the app is downloadable in the US or EU, that is use and sale in a patented jurisdiction. Geo-restrict deliberately, not by default.
2. **Server location.** If inference runs on servers physically in the US, a US **method** claim can be directly infringed there even for Indian users. **Keep the fusion engine on-device and keep any cloud component India-resident.**
3. **Strip manufacture for export.** Manufacturing in India for import into the US is infringement of the US patent at the point of import.
4. **Any expansion.** The moment Rove sells into the US, EU, UK, China, Japan, Canada or Australia, every patent in §2 becomes live and every rule in §3 becomes mandatory rather than prudent.

### The decisive structural finding: **the India door has already closed on almost everyone**

The PCT national-phase deadline into India is **31 months from priority**. Today is 2026-08-01, so that window has expired for any family with a priority date before roughly **January 2024**. That is:

- **Ava** — all four families (2015, 2016, 2017, 2019 priorities)
- **Oura** — all families (2021, 2022 priorities); WO2022192684A1 verified as CA/EP/JP/CN/AU/US only
- **Apple** (2020, 2021), **Fitbit** (2018), **Roche** (2020), **Fertility Focus** (2006), **Prima-Temp**
- **Easy Healthcare** core T/C-ratio family (2020), **MFB** (2017), **Oova** (2018), **Cornell** (2013), **Healthy.io** (2014), **Reliant** (2016)

If no Indian national phase was entered for these — and none was found for any of them — **they can never enter India for those inventions.** Not "haven't yet"; **cannot.** For an India-first company this converts a hopeful absence into a permanent structural advantage across essentially the entire landscape.

**The two exceptions — the only live India exposures found:**

**(a) Inito — IN 202317046017**, entered 2023-07-08 from PCT/IN2021/051149 (priority 2020-12-08). Bengaluru-based, publicly claims 20+ patents and ~40M hormone datapoints. **This is the one entity Rove must clear before shipping any strip-derived inference in India.**

**(b) Post-January-2024 priorities.** Chiefly **Easy Healthcare WO2025250702A1** (priority 2024-05-28; semi-quantitative reading with a calibration chart and greyscale T/C against a white background — aimed squarely at Rove's chosen approach). Its Indian national-phase deadline is approximately **December 2026**. **Docket this.** Any new PCT from Oura, Ava or Easy Healthcare from 2024 onward can still reach India and must be watched.

### Indian subject-matter law cuts both ways

- **s.3(k)** — algorithms and computer programmes *per se* are unpatentable. Post-*Ferid Allani* (Delhi HC, 2019), a computer program demonstrating a **technical effect** or technical contribution is patentable. This makes it hard for Oura, Ava or Roche to obtain Indian claims of the shape they hold in the US — **and equally hard for Rove**, unless every Indian claim is framed as a technical system producing a concrete technical effect.
- **s.3(i)** — diagnostic methods practised on the human body are unpatentable. A PCOS output framed as **diagnosis** is likely excluded; framed as **screening / risk indication prompting clinical referral**, it has a better path. This is also a strong ground of attack against Inito's "predict a health condition" claim.

*Both statutory points are my own contribution and were not verified against a primary source in any sweep. Treat as leads for counsel, not findings.*

### The India verification gap you must close

**None of the above was checked against InPASS.** The Indian Patent Office search portal is CAPTCHA-gated and Google Patents indexes Indian applications poorly. The "no Indian filings" conclusion is inferred from PCT worldwide-application listings, and three Ava families (nadir, pregnancy-events, contraception) plus most of the strip families were never checked at all. **Commission an Indian patent agent to run a proper InPASS search** on: all Ava, Oura, Apple, Fitbit, Roche, Easy Healthcare, MFB, Oova, Cornell, Healthy.io and Reliant families; on Inito's full portfolio; and on IPC/CPC classes **A61B5/4875** and **G16H50/20** restricted to Indian applicants. This is a small spend against a conclusion the entire India strategy rests on.

---

## 7. TOP 3 FILING OPPORTUNITIES

*Claim sketches are engineering framings intended as drafting input for a patent attorney, not draft claims. Each needs a novelty search before filing.*

### FILING 1 — Cross-modal supervised personalisation: strip-derived events as labels for a physiological ovulation model

**Independent claim would cover:** A computer-implemented method of confirming ovulation, comprising: receiving at a mobile device a sequence of images of lateral-flow assay devices captured across days of a menstrual cycle; deriving from each image an **ordinal assay state relative to a user-specific historical distribution of image-derived line intensities** for that user; identifying from the sequence a **hormone-surge event and its time of occurrence**; receiving a plurality of physiological time series for the same user from **one or more sensor sources of unspecified type**, the method being operable when any proper subset of those sources is present; **using the identified surge-event time as a supervisory label to update a user-specific parameter set** of a probabilistic model mapping features of the physiological time series to a probability distribution over ovulation day; and, in a subsequent cycle in which no assay image is received on one or more days, computing from the physiological time series alone a **posterior distribution over ovulation day** and outputting a confirmed ovulation day with a calibrated confidence.

**Why it is available:** no prior claim couples hormone-strip-derived labels to a physiological inference model, for the structural reason that no prior party held both modalities. Ovia's community-model personalisation was abandoned; Unipath's per-user threshold expired in 2013 and operated on measured concentration, not on image intensity, and trained no physiological model. **Technical effect for s.3(k):** the method reduces the number of physical consumables required and enables confirmation on days when no assay is performed — a concrete effect on system operation, not an abstract algorithm.

### FILING 2 — Expected-information-gain scheduling of assay tests

**Independent claim would cover:** A computer-implemented method of scheduling assay tests, comprising: maintaining a posterior distribution over the time of ovulation in a current cycle, initialised from a user-specific prior derived from that user's previous cycles; computing, for each of a plurality of candidate future test times, an **expected reduction in the entropy of the posterior** conditional on a hypothetical assay result at that time, using a likelihood model of assay output given ovulation timing; **selecting a next test time that maximises expected information gain subject to a constraint on the number of assay devices to be consumed in the cycle** (or, equivalently, minimises expected assay consumption subject to a target posterior confidence); prompting the user at the selected time; receiving an assay result; updating the posterior; and iterating until posterior confidence in a confirmed ovulation day exceeds a threshold — with physiological observations optionally folded into the posterior between tests so the schedule adapts without consuming an assay.

**Why it is available:** nobody claims scheduling. Inito's claim 1 goes concentration → cycle phase → condition, with no scheduling step. Manawatu's 2007 disclosure of test prompting is prior art that kills a *broad* prompting claim, while leaving a specific information-theoretic scheduler clean. **Commercially this is the India feature** — strips are a recurring cost and halving them at equal confidence is the value proposition. It is also hard to design around if a competitor wants the same cost saving, which is what makes a patent here worth holding.

### FILING 3 — Multi-modal anovulation and PCOS screening from absence-of-signature and LH:FSH trajectory, without wearable temperature morphology and without AMH

**Independent claim would cover:** A computer-implemented method of screening for a chronically anovulatory state, comprising: acquiring across a plurality of cycles a multi-modal evidence set comprising image-derived ordinal LH and FSH assay states from smartphone-captured lateral-flow devices, user-logged cervical-mucus observations, and optionally one or more physiological time series; computing per cycle a set of **per-modality ovulation-evidence scores** (surge-event score, luteal thermal-shift score, resting-heart-rate step score, mucus-pattern score); classifying a cycle as anovulatory **on the joint failure of a plurality of those scores to exceed their respective user-specific thresholds** — that is, on the coordinated **absence** of the ovulatory signature across modalities, rather than on the presence of a morphological feature of any single time series; computing a trajectory of an **LH-to-FSH ratio** derived from the ordinal assay states across cycles; **detecting a change point** in the sequence of per-cycle classifications and/or the ratio trajectory; and outputting a risk indication for a chronically anovulatory state — **without requiring a measurement of anti-Müllerian hormone and without requiring a continuous temperature time series from a wearable device.**

**Why it is available:** it threads both filers in this space — Oura's filings are anchored to wearable temperature morphology; Roche's requires an AMH value and does not recite LH or FSH at all. Absence-of-signature reasoning, LH:FSH ratio trajectory from home strips, and longitudinal change-point detection are each unclaimed. **Directly aligned with Rove's PCOS positioning and with India, where AMH testing is expensive and unevenly accessible. Highest urgency of the three — Oura is filing annually toward diagnosis.** Draft as **screening / risk indication**, never diagnosis, for s.3(i).

**Strong candidate #4 (file or defensively publish): reference-free device-independent colorimetric calibration** — illuminant estimation from camera metadata, flash-differencing, or the blank membrane as white point. If a computational-photography prior-art search kills novelty, **publish it defensively anyway**: Easy Healthcare's continuation practice is the live threat in the strip layer, and a dated Rove publication becomes §102/§103 art against any continuation filed afterward. That is a very cheap way to cap the scope of the single broadest claim in the landscape.

---

## 8. IMMEDIATE ACTIONS

**Defensive (cheap, high value, do now)**
1. **Indian pre-grant opposition (s.25(1)) against Inito IN 202317046017.** Any person may file, at any time before grant, at minimal cost. Grounds: anticipation/obviousness over Unipath US6454726B1 and US6234974B1 and Manawatu WO2007049157A2, plus s.3(k) and s.3(i) subject-matter. **This is the highest-value single action available to an India-first Rove** and it is materially more important than the US equivalent.
2. **US third-party pre-issuance submission (37 CFR 1.290) against US20240053362A1** (Inito's US member), same prior art. Cheap; would likely force drastic narrowing.
3. **Order the Easy Healthcare file wrapper** (US 16/890,443 → US11519909B2, plus continuations 18/433,900 and 19/182,381). The prosecution history is the most reliable public map of a design-around, and should be read **before** the image-processing spec is written.

**Verification (must complete before architecture freeze)**
4. Pull granted claims for: **Oura US20240071624A1** (PCOS — highest priority), **Oura US12558022B2** (resolve the ring-only vs broad conflict), **Oura US12551197B2**, **Fitbit US11889994B2** and US10765409B2 claims 11/16, **Ava US10779802B2** (does the on-wearable-display limitation exist?), **MFB US12061196B2** numbered claims, **Oova US12591974B2**, **Cornell US9787815B2**, **Fertility Focus US9155522/523B2**.
5. **Commission an Indian agent for an InPASS search** — the entire India strategy rests on an unverified absence.
6. Fetch **WO2021092595A1**, the unresolved calibration lead.
7. **Corporate-records check on Ava → Femtec Health.** A wound-down company's patents in the hands of a licensing entity is a different risk profile from a competitor's defensive portfolio.

**Docket watch**
8. Easy Healthcare continuations and **WO2025250702A1's India deadline (~Dec 2026)**; Oura's continuation practice (the only assignee actively expanding toward diagnosis); Apple US20220387003A1 for method-claim continuations; Roche US20230221335A1.

**Finally:** in this field the binding constraint on a diagnostic or contraceptive claim is **regulatory, not patent**. Natural Cycles took years to clear FDA De Novo and holds no patents at all. A PCOS *screening* output will likely pull Rove into CDSCO software-as-medical-device territory in India. Budget for that pathway as the real barrier — and note that it is also Rove's most durable moat, since it is the one thing a fast follower cannot copy from a published claim.

---

> **Restating the boundary:** this consolidation merges three web-search-derived sweeps with acknowledged verification gaps. Several claim sets central to the conclusions were never read; two sweeps materially disagree on three patents; and the India conclusion rests on an absence never checked against the Indian register. It is engineering-level scope reasoning to guide architecture and filing strategy. **It is not a freedom-to-operate opinion. Engage a registered patent attorney — an Indian agent for the domestic position and US counsel for any US exposure — before any filing or launch decision.**

---

# APPENDIX — Raw sweep data

```json
[
  {
    "patents": [
      {
        "number": "US10779802B2",
        "assignee": "Ava AG (now recorded to Ava Woman LLC / Ava Sciences FMTC LLC)",
        "title": "System and method for determining the fertility phase of a female",
        "priority_date": "2015-02-16",
        "status": "granted / active (reinstated); anticipated expiry 2036-11-21",
        "url": "https://patents.google.com/patent/US10779802B2/en",
        "independent_claim_gist": "VERIFIED (read claim 1 and claim 12 verbatim). A wearable worn in skin contact that determines HEART RATE AND HRV, plus a processor that: (a) finds a change in pulse during the cycle; (b) sets the fertile-phase START at the time the interbeat interval changes from comparatively SHORT to comparatively LONGER; (c) sets the fertile-phase END at the time the interbeat interval changes from comparatively LONG to comparatively SHORTER; and (d) OUTPUTS THE FERTILITY PHASE ON A DISPLAY OF THE WEARABLE DEVICE. Claim 12 is the mirror-image method claim and carries the SAME on-wearable display limitation. No temperature in claim 1.",
        "blocks_what": "A competitor cannot ship a skin-worn HR/HRV wearable that brackets the fertile window by detecting the direction-reversal of interbeat intervals and then shows that fertile window on the wearable's own screen. This is the foundational Ava claim and the one that most directly reads on 'HRV-based fertile window on a wrist device'.",
        "designed_around_how": "Three independent exits, any one of which defeats literal infringement of BOTH independent claims: (1) do not render the fertility phase on a display of the wearable \u2014 surface it only in the phone app or web dashboard (Ava's own claim drafting boxed them in here, and a phone-first Indian product naturally sits outside it); (2) do not use IBI short->long / long->short direction changes as the start/end trigger \u2014 use a temperature-rise confirmation, an RHR baseline-deviation z-score, or a learned per-day posterior instead; (3) territorial \u2014 family is US, EP (EP3258853B1) and CN (CN107278139B) only; the PCT parent WO2016131630A1 is listed as Ceased and shows NO Indian national-phase entry."
      },
      {
        "number": "US11766248B2",
        "assignee": "Ava AG",
        "title": "System and method for determining temperature nadir of a female",
        "priority_date": "2016-07-28",
        "status": "granted 2023-09-26 / active; anticipated expiry 2037-07-05",
        "url": "https://patents.google.com/patent/US11766248B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim via FreePatentsOnline). Wearable temperature sensor in skin contact + processor that receives temperature AND one or more further parameters 'comprising at least one of: heart rate or heart rate variability'. The processor determines a DETECTED STARTING POINT of the fertility phase from a change in those further parameters, and that start point must be found specifically by either (i) a defined length of time after the interbeat interval EXCEEDS a defined threshold, or (ii) when the interbeat interval DROPS BELOW that threshold after having previously exceeded it. Only then, inside a time window after that start point, it detects the TEMPERATURE NADIR as a TEMPORARY DECREASE in temperature \u2014 the nadir time being indicative of ovulation and peak oestrogen. Independent claims are 1, 14 and 16.",
        "blocks_what": "This is the single closest patent to Rove's concept: it is genuine temperature + HR/HRV FUSION used to pinpoint the ovulation event, not merely to predict a window. It blocks a wearable that uses an HR/HRV-derived fertile-window opening to gate a search window, then calls ovulation off a temperature dip inside that window.",
        "designed_around_how": "The claim is far narrower than its title suggests and has two hard hooks. (1) The ovulation marker MUST be a NADIR \u2014 a temporary DECREASE in temperature. If ovulation is confirmed instead from the post-ovulatory sustained temperature RISE / biphasic thermal shift (which is what Apple, Oura and Natural Cycles do, and what is clinically standard), claim 1 is not met. (2) The fertile-phase start MUST be derived from absolute interbeat-interval THRESHOLD CROSSINGS. Using a personalised rolling-baseline RHR deviation, an HRV-ratio trend, or an ML phase probability instead avoids limitation (i)/(ii). Doing both \u2014 rise-based confirmation plus baseline-deviation gating \u2014 puts a product cleanly outside. Note: no Indian family member surfaced; the only other publication found was the US pre-grant pub US20190167237A1."
      },
      {
        "number": "US12446865B2",
        "assignee": "Ava AG",
        "title": "System and method for detecting pregnancy related events",
        "priority_date": "2017-09-20",
        "status": "granted / active; anticipated expiry 2041-11-30",
        "url": "https://patents.google.com/patent/US12446865B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim). Notably drafted with CLOSED transitional language \u2014 'the system CONSISTING OF: a wearable device... and a processor'. Requires the user to ENTER the time of actual menses, which is then used to set analysis time windows. The processor must do all three of: (a) detect CONCEPTION when late-luteal breathing rate / heart rate / skin temperature in cycle 2 exceed cycle 1 by a threshold, with both windows starting EXACTLY TEN DAYS AFTER OVULATION; (b) detect MISCARRIAGE on a corresponding decrease in HR or skin temperature; and (c) detect an OVULATORY CYCLE when the variation in heart rate, SDNN of HRV, an HRV ratio, an HRV parameter, or skin temperature exceeds what would be expected for an anovulatory cycle.",
        "blocks_what": "Limb (c) is the only granted claim language found anywhere that puts heart rate + HRV + skin temperature together for an ovulation-related determination. But it only blocks CYCLE-LEVEL, RETROSPECTIVE classification of a cycle as ovulatory vs anovulatory \u2014 it does not block confirming an ovulation DAY. Practically it fences Ava's conception/miscarriage detection product.",
        "designed_around_how": "Unusually easy to avoid, for four reasons. (1) The closed 'consisting of' transition means a system containing additional recited elements arguably falls outside literal scope. (2) It requires manual user entry of actual menses \u2014 an app that infers menses onset automatically from physiology does not meet it. (3) It hard-codes windows starting ten days after ovulation. (4) The processor must perform conception AND miscarriage AND ovulatory-cycle detection; a product that only confirms ovulation does not practise the claim as a whole. Rove confirming a per-day ovulation event, without menses entry and without pregnancy/miscarriage detection, is outside."
      },
      {
        "number": "US12502162B2",
        "assignee": "Ava AG (recorded to Ava Woman LLC / Ava Sciences FMTC LLC)",
        "title": "System and method for contraception",
        "priority_date": "2019-08-29",
        "status": "granted / active; anticipated expiry 2042-12-21",
        "url": "https://patents.google.com/patent/US12502162B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim). Computer-implemented method: receive, in a processor, PHYSIOLOGICAL DATA from a sensor system of a wearable device; generate CYCLE PHASE PROBABILITIES that the user is in one or more cycle phases on a given day using a MACHINE LEARNING MODEL and that physiological data, the phases comprising early follicular phase, fertile window and/or luteal phase; determine THE TIME INTERVAL FOR USING CONTRACEPTION from the physiological data, the phase probabilities and PRE-DETERMINED PROBABILITY THRESHOLDS; and generate a message for the user containing that contraception interval. Parallel system and computer-program-product independent claims exist.",
        "blocks_what": "Broadest sensing language of the four \u2014 'physiological data' generically, no named sensor. It blocks any wearable-plus-ML engine that outputs discrete cycle-phase probabilities and converts them via thresholds into a 'use contraception on these days' instruction. This is the claim that fences digital-contraception positioning.",
        "designed_around_how": "Every limitation after the first is escapable. The claim is anchored to CONTRACEPTION \u2014 the determined output must be 'the time interval for using contraception' and the message must contain it. A product positioned for conception support, cycle insight, PCOS/PMS tracking or symptom forecasting, which never emits a contraception instruction, does not practise it. Secondarily, avoid the discrete phase-probability-plus-fixed-threshold architecture (e.g. emit a continuous fertility score, or a confirmed-ovulation event, rather than per-phase probabilities compared against pre-determined thresholds). Note the strategic risk: this is the Ava claim most likely to be asserted against a femtech app that later adds a birth-control mode."
      },
      {
        "number": "US12558022B2",
        "assignee": "Oura Health Oy",
        "title": "Menstrual cycle tracking",
        "priority_date": "2021-03-12",
        "status": "granted / active; anticipated expiry 2044-05-09",
        "url": "https://patents.google.com/patent/US12558022B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim via FreePatentsOnline; independent claims 1 and 24). Method requiring measurement using a WEARABLE RING DEVICE WORN ON A FINGER, with a RING-SHAPED HOUSING, temperature sensors arranged WITHIN the ring housing, processors disposed at least partially WITHIN the ring housing, and a communication module. The algorithm must: build a temperature time series over days spanning multiple cycles; COMPUTE THE DERIVATIVE of that time series; INVERT the derivative; identify MORPHOLOGICAL FEATURES OF THE INVERTED DERIVATIVE; identify menstrual cycle phases from those features; and transmit signals causing a GUI to display the phases.",
        "blocks_what": "Only blocks finger-ring hardware running the specific invert-the-derivative morphology pipeline on skin temperature. Despite the generic title, this is a narrow claim \u2014 it is Oura protecting the Oura Ring, not the concept of temperature-based cycle phasing.",
        "designed_around_how": "Two trivially independent exits: (1) form factor \u2014 a wrist band, patch, or ingestion of third-party wearable data is not a ring-shaped housing with processors inside it; (2) signal processing \u2014 do not compute-then-invert the derivative and read morphology off the inverted curve. Territorially the PCT parent WO2022192684A1 entered national phase only in CA, EP, JP, CN, AU and US \u2014 NO Indian filing was listed."
      },
      {
        "number": "US12551197B2",
        "assignee": "Oura Health Oy",
        "title": "Techniques for predicting menstrual cycle onset",
        "priority_date": "2021-08-31",
        "status": "granted / active",
        "url": "https://patents.google.com/patent/US12551197B2/en",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 page read, assignee/dates/abstract confirmed, but Google Patents truncated the claim text so claim 1 was NOT read verbatim. Per the abstract and specification: receive continuous physiological data (skin temperature primary) from a wearable; FIT the temperature measurements to mathematical functions (trigonometric or polynomial); identify features of the fitted function; compute durations between those features and known menstrual-cycle onset days; project a future cycle start date from the most recent feature.",
        "blocks_what": "Prediction of NEXT MENSES onset by curve-fitting a temperature series. It is about period prediction, not ovulation confirmation, so it sits adjacent to rather than on top of Rove's core.",
        "designed_around_how": "Predict menses onset from a learned model over multi-parameter features (RHR, HRV, respiratory rate) rather than by fitting temperature to trigonometric/polynomial functions and measuring feature-to-onset durations. Claim text should be pulled from FreePatentsOnline or the USPTO full-text PDF before relying on this design-around."
      },
      {
        "number": "US20220313223A1",
        "assignee": "Oura Health Oy",
        "title": "Anovulatory cycle detection from wearable-based physiological data",
        "priority_date": "2021-04-01",
        "status": "pending (published application, not granted)",
        "url": "https://patents.google.com/patent/US20220313223A1/en",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 assignee, title, priority date and pending status confirmed from the page; claim text was truncated and NOT read. Specification: detect ANOVULATORY cycles by identifying morphological features / temperature deviations in a wearable-derived temperature time series; supporting parameters described include temperature, heart rate, HRV, respiratory rate and blood oxygen.",
        "blocks_what": "Nothing yet \u2014 it is an unexamined/pending application with no enforceable claims. If granted it would fence temperature-morphology-based detection of cycles in which ovulation did not occur, which matters for a PCOS-facing product.",
        "designed_around_how": "Monitor prosecution rather than design around now. If it grants, the likely escape is to detect anovulation from a multi-parameter absence-of-signature (no RHR shift AND no thermal shift AND no HRV inflection) rather than from temperature-curve morphological features. Note this is the pending application closest to a PCOS/irregular-cycle positioning."
      },
      {
        "number": "EP4312797A1",
        "assignee": "Oura Health Oy",
        "title": "Fertility prediction from wearable-based physiological data",
        "priority_date": "2021-04-01",
        "status": "pending (EP application; PCT/US2022/022887, published WO2022212741A1; EP22718450.4)",
        "url": "https://patents.google.com/patent/EP4312797A1/en",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 assignee, title, priority, pending status and family (PCT/US2022/022887, WO2022212741A1, EP22718450.4) confirmed from the page; claim 1 text was NOT retrievable. Specification: derive a FERTILITY PREDICTION SCORE from a wearable temperature time series plus cycle-length statistics (average cycle length, standard deviation, follicular/luteal phase lengths, regularity); description discusses temperature, heart rate, HRV and respiratory rate, and states that increased respiratory rate + increased heart rate + decreased HRV indicate declining fertility while the inverse indicates increasing fertility.",
        "blocks_what": "Nothing enforceable yet. If granted in EP it would fence scoring a user's overall fertility/reproductive capacity from wearable physiology plus cycle-regularity statistics \u2014 a 'fertility health score' feature, distinct from per-cycle ovulation detection.",
        "designed_around_how": "EP only in this record; no US or IN member was visible. If Rove ships a fertility-score feature it should avoid deriving the score from cycle-length statistics (mean, SD, phase lengths, regularity) layered on a temperature series, and should not use the specific directional rule set out in the specification. Track the EP prosecution."
      },
      {
        "number": "US20220387003A1",
        "assignee": "Apple Inc.",
        "title": "Menstrual cycle tracking and prediction",
        "priority_date": "2021-06-06",
        "status": "pending (published application, not granted)",
        "url": "https://patents.google.com/patent/US20220387003A1/en",
        "independent_claim_gist": "VERIFIED (as-published claim 1 read verbatim via FreePatentsOnline; independent claims 1, 6 and 11). A WEARABLE DEVICE for estimating portions of a menstrual cycle, comprising: a CALENDAR MODULE; a HEART RATE SENSOR; a preprocessing module that receives an initial period estimate from the calendar and heart rate data from the sensor and produces a processed data set; an OVULATION ESTIMATOR that uses the processed data set to ESTIMATE A FERTILITY WINDOW; and a PERIOD ESTIMATOR that uses the processed data set plus the ovulation estimator's output to estimate a period date. No temperature is recited in claim 1.",
        "blocks_what": "This is the most dangerous PENDING claim in the landscape for Rove \u2014 as published it covers heart-rate-only fertility-window estimation on a wearable, without any temperature or HRV limitation. If it issued in this form it would be broader than anything Ava holds on HR-based fertile-window estimation.",
        "designed_around_how": "As drafted it is an APPARATUS claim in which the calendar module, HR sensor, preprocessing module, ovulation estimator and period estimator all sit inside the wearable device. A phone-app or cloud architecture, where the wearable only streams raw PPG/HR and all estimation happens off-device, does not read on it. It also requires an initial period estimate supplied by a calendar module. Caveat: US applications routinely narrow during prosecution and Apple may also pursue method and system claims \u2014 this one needs re-checking before any US launch. Not verified as filed in India."
      },
      {
        "number": "US12426858B2",
        "assignee": "Apple Inc.",
        "title": "In-bed temperature array for menstrual cycle tracking",
        "priority_date": "2020-08-12",
        "status": "granted / active; anticipated expiry 2040-12-04",
        "url": "https://patents.google.com/patent/US12426858B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim). Method requiring temperature measurements from ONE OR MORE TEMPERATURE SENSORS IN AN ARRAY POSITIONED UNDER THE USER ON A BED; determine a 'use period' when a sensor exceeds a first temperature threshold for a duration; identify temperatures within the use period exceeding a second threshold; derive a user temperature per use period; identify at least one change in that temperature between use periods; and ESTIMATE AN OVULATION DAY from that change.",
        "blocks_what": "Only under-mattress / in-bed sensor arrays. It does not touch wearables at all. Its significance is evidentiary: Apple holds a granted claim to estimating an ovulation DAY from a night-to-night temperature CHANGE \u2014 confirming that ovulation-day-from-temperature-shift is fenced by form factor, not owned outright.",
        "designed_around_how": "Not applicable to a wrist or ring product \u2014 no sensor array under the user on a bed. Only relevant if Rove ever ships a bed/mattress sensor for the Indian market, which would need a fresh clearance."
      },
      {
        "number": "US10765409B2",
        "assignee": "Fitbit, Inc. (Google)",
        "title": "Menstrual cycle tracking",
        "priority_date": "2018-06-28",
        "status": "granted 2020-09-08 / active",
        "url": "https://patents.google.com/patent/US20200000441A1/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim via FreePatentsOnline; independent claims 1, 11, 16). Computer-implemented method: obtain, using a non-invasive measurement sub-system of a worn monitoring device, HEART-RATE-DERIVED DATA over a period; obtain, using the same sub-system, HEMOGLOBIN DATA over that period \u2014 specifically a HEMOGLOBIN-TO-WATER RATIO or a CHANGE IN HEMOGLOBIN CONCENTRATION; analyse both to determine a health pattern; CORRELATE MENSTRUAL CYCLE EVENTS with features in that pattern to generate a cycle model; generate determinations from the model; and display them.",
        "blocks_what": "Only multi-wavelength optical systems that actually derive hemoglobin concentration or hemoglobin-to-water ratio and fuse it with heart-rate data for cycle modelling. Despite the bare title 'Menstrual cycle tracking', the hemoglobin limitation is dispositive and makes this claim narrow.",
        "designed_around_how": "Do not compute hemoglobin-to-water ratio or hemoglobin concentration change. Any product built on RHR + HRV + skin temperature \u2014 with no hemoglobin metric \u2014 simply cannot infringe claim 1, because hemoglobin data is a mandatory element. This is a clean, high-confidence non-infringement position. Fitbit's independent claims 11 and 16 should still be pulled and read before a US launch."
      },
      {
        "number": "US9155522B2",
        "assignee": "viO HealthTech Limited (formerly Fertility Focus Ltd) \u2014 OvuSense",
        "title": "Method of detecting and predicting ovulation and the period of fertility",
        "priority_date": "2006-09-05",
        "status": "granted / active but SHORT RUNWAY \u2014 anticipated expiry 2027-11-11",
        "url": "https://patents.google.com/patent/US9155522B2",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 assignee, title, priority date, status and abstract read from the page; the claims section was truncated so claim 1 was NOT read verbatim. Per the abstract and specification: take many temperature readings over extended periods, discard spurious/faulty data, derive representative temperature values, and analyse those values across multiple cycles to identify patterns indicative and predictive of ovulation. Measurement is primarily INTRAVAGINAL, though the specification states temperature 'may also be measured on the skin surface, under the armpit, in the ear or at any other suitable site'. Siblings: US9155523B2, US8496597B2, EP2061380B2.",
        "blocks_what": "Potentially the broadest temperature-pattern ovulation-detection family in the landscape, and the specification's skin-surface language means it is not automatically confined to vaginal sensors. This family is the main reason a temperature-only ovulation-confirmation approach is not obviously clear space.",
        "designed_around_how": "The decisive factor is TIME, not claim scope: with a 2006 priority the family expires in late 2027, roughly a year from now. Anything Rove launches at scale is effectively unencumbered by it, and after expiry the whole disclosure becomes freely practisable prior art. Before then, the practical distance is that Rove's confirmation is multi-parameter (RHR + HRV + temperature) rather than a temperature-pattern analysis across cycles. Claim 1 must be pulled verbatim from FreePatentsOnline or USPTO before relying on this."
      },
      {
        "number": "US8540644B2",
        "assignee": "Acc Syndicate LLP",
        "title": "System and method for estimating a basal body temperature and forming an indication of ovulation",
        "priority_date": "2006-05-04",
        "status": "EXPIRED \u2014 fee related",
        "url": "https://patents.google.com/patent/US8540644B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim). Claim 1 is a generic data-logger apparatus: power source; sensors; data store; control logic; antenna; transmitter configured for PASSIVE transmission. The valuable content is in the specification, which teaches ESTIMATING BASAL BODY TEMPERATURE BY EXTRAPOLATION FROM MULTIPLE SKIN-TEMPERATURE READINGS TAKEN DURING SLEEP, and using that estimate to indicate ovulation \u2014 worn as an adhesive skin patch, a band around the upper arm, or in clothing.",
        "blocks_what": "Nothing \u2014 it is expired. Its value to Rove is entirely defensive: it is excellent PRIOR ART with a 2006 priority date that publicly disclosed the core idea of inferring BBT from skin temperature during sleep and deriving ovulation from it, on a wearable band.",
        "designed_around_how": "No design-around needed. Cite it affirmatively. Because this disclosure is public and pre-2007, no later party can validly claim the bare concept of sleep-window skin-temperature-to-BBT extrapolation for ovulation indication, which materially caps how broadly Ava, Oura or Apple can enforce their temperature claims."
      },
      {
        "number": "US8834389B2",
        "assignee": "Deborah Lawrence Schafer (originally Tepsync)",
        "title": "Temperature based fertility monitoring system and related method",
        "priority_date": "2011-11-25",
        "status": "EXPIRED \u2014 fee related",
        "url": "https://patents.google.com/patent/US8834389B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim). A portable computing device comprising a receiver for wirelessly receiving information and a processor programmed to receive FIRST TEMPERATURE DATA and ELECTRICAL RESISTIVITY DATA of a user and to calculate A LEVEL OF FERTILITY from both. The specification covers oral, vaginal and skin-surface temperature measurement (including at the base of the neck) and basal-body-temperature rise of 0.2-0.6 F around ovulation, with wireless delivery to a phone/tablet/laptop for analysis and display.",
        "blocks_what": "Nothing \u2014 expired. Defensive prior art establishing, as of 2011, the architecture of a body-worn sensor streaming physiological data wirelessly to a smartphone which computes a fertility level.",
        "designed_around_how": "No design-around needed. Useful as invalidity ammunition against any later claim asserting the generic 'sensor streams to phone, phone computes fertility' architecture."
      },
      {
        "number": "US10828015B2",
        "assignee": "Prima-Temp, Inc.",
        "title": "Vaginal temperature sensing apparatus and methods",
        "priority_date": "2018-07-12",
        "status": "EXPIRED \u2014 fee related",
        "url": "https://patents.google.com/patent/US10828015B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim). Claim 1 is PURELY MECHANICAL: a vaginal temperature sensing ring comprising a cured flexible outer ring shell of a first material; temperature-sensing electrical componentry established in that shell; and a cured second material established within the shell between the componentry and the shell. The inventive content is a two-step silicone moulding process protecting the battery from curing heat, magnetic reed-switch power management, and a transparent window for battery status. No algorithm is claimed.",
        "blocks_what": "Nothing, on two counts \u2014 it is expired, and even when live it claimed ring construction, not ovulation detection. Prima-Temp's Priya product is therefore not an algorithmic obstacle.",
        "designed_around_how": "Irrelevant to a wrist wearable. Prima-Temp's other family member US8715204B2 ('Wireless vaginal sensor probe') was seen in search listings but its page was NOT read and its status is unverified; it should be checked only if Rove ever moves into intravaginal core-temperature hardware."
      },
      {
        "number": "US11521401B2",
        "assignee": "Bridging Biosciences LLC",
        "title": "Fertility window prediction using a convolutional neural network (CNN) and other learning methods",
        "priority_date": "2020-07-31",
        "status": "granted / active; anticipated expiry 2040-07-31",
        "url": "https://patents.google.com/patent/US11521401B2/en",
        "independent_claim_gist": "VERIFIED (full claim 1 read verbatim). Despite an alarming title, claim 1 is a WET-LAB IMAGING method: provide a housing with slide holder, light source and camera; provide a slide with two reservoirs; place a first cervical mucous sample mixed with saline at at least 1:50 in one reservoir and a second mucous sample in the other; insert the slide; capture images; analyse the images to determine whether WHITE BLOOD CELLS are present and to identify FERNING PATTERNS.",
        "blocks_what": "Nothing relevant. It requires physical cervical mucus samples, slides and a camera rig. No wearable, no physiological time series, no machine learning limitation that reaches sensor data.",
        "designed_around_how": "No action needed. Flagged only because a keyword search for 'fertility window prediction using machine learning' surfaces this patent and could wrongly alarm a non-specialist reader \u2014 the claim scope has nothing to do with wearables."
      }
    ],
    "white_space": [
      "OVULATION CONFIRMATION FROM THE POST-OVULATORY TEMPERATURE RISE FUSED WITH AN RHR SHIFT. This is the biggest opening. Ava's US11766248B2 \u2014 the only granted claim fusing temperature with HR/HRV to pinpoint ovulation \u2014 requires detecting a temperature NADIR, i.e. a temporary DECREASE. Confirming ovulation from the sustained biphasic RISE plus a resting-heart-rate step change, with no nadir detection anywhere in the pipeline, sits outside it. Clinically this is also the stronger signal.",
      "PER-DAY OVULATION-DAY CONFIRMATION AS THE PRIMARY OUTPUT. The granted claims split into two buckets: fertile-WINDOW bracketing (Ava US10779802B2, Apple US20220387003A1 pending) and cycle-LEVEL ovulatory-vs-anovulatory classification (Ava US12446865B2). A system whose output is 'ovulation occurred on day N, confidence X' \u2014 neither a window nor a cycle label \u2014 is not squarely claimed by anything verified.",
      "GATING BY PERSONALISED ROLLING-BASELINE DEVIATION RATHER THAN ABSOLUTE THRESHOLD CROSSINGS. Both blocking Ava claims (US10779802B2 and US11766248B2) hinge on interbeat-interval behaviour described in absolute terms \u2014 direction reversals, or crossing a defined threshold value. Z-scores against a per-user rolling baseline, or a learned posterior, are a different mechanism and appear unclaimed.",
      "PHONE- AND CLOUD-SIDE INFERENCE ARCHITECTURE. Ava US10779802B2 claims 1 and 12 both require output on a display OF THE WEARABLE DEVICE. Apple US20220387003A1 recites the ovulation estimator and period estimator as modules INSIDE the wearable. Oura US12558022B2 requires processors inside a ring housing. An architecture where the wearable is a dumb sensor and all inference plus all display happens in the app or cloud steps outside all three at once.",
      "INGESTION OF THIRD-PARTY WEARABLE DATA. Nearly every claim recites a wearable device as a positive element of the system. An algorithm that consumes RHR, HRV and wrist-temperature streams already collected by Apple Health, Google Fit, a Mi Band or a Noise/boAt device \u2014 with Rove shipping no hardware at all \u2014 has no wearable element to attribute and is very hard to reach with these apparatus claims.",
      "HRV FREQUENCY-DOMAIN DYNAMICS (LF/HF, RMSSD TRAJECTORY) AS THE PHASE DISCRIMINATOR. Ava's claims speak in the time domain \u2014 interbeat intervals, SDNN, an unspecified 'HRV ratio'. A phase detector driven by frequency-domain autonomic balance appears only thinly claimed.",
      "PCOS AND IRREGULAR-CYCLE POPULATIONS WHERE 'NO OVULATION DETECTED' IS THE PRODUCT. Oura's anovulatory-detection application US20220313223A1 is still PENDING and is temperature-morphology-only. Multi-parameter anovulation detection \u2014 absence of a thermal shift AND absence of an RHR step AND absence of an HRV inflection \u2014 is currently open, and is directly aligned with Rove's existing PCOS positioning.",
      "PERIMENOPAUSE AND ANOVULATORY-TRANSITION DETECTION. No patent found in this search claims wearable-based detection of the perimenopausal transition. Entirely open.",
      "SEMI-SUPERVISED PERSONALISATION AGAINST USER-LOGGED LH STRIPS. Using cheap LH test results that Indian users already buy as ground-truth labels to personalise a per-user ovulation model is not claimed in anything verified, and is a strong fit for the Indian market.",
      "SYMPTOM AND CONTEXT FUSION (SLEEP DEBT, CYCLE-PHASE-SPECIFIC PMS SYMPTOM FORECASTING) LAYERED ON THE PHYSIOLOGICAL CONFIRMATION. Ava US12446865B2 recites breathing rate but only for conception detection; nothing verified claims fusing logged symptoms with RHR/HRV/temperature for phase-specific forecasting.",
      "INDIA ITSELF. Across the two patent families whose worldwide filings were actually verified \u2014 Ava's foundational WO2016131630A1 (CN, EP, US only; PCT listed as Ceased) and Oura's WO2022192684A1 (CA, EP, JP, CN, AU, US) \u2014 NO Indian national-phase entry appears. On the evidence gathered, the entire technical space is unclaimed in India."
    ],
    "notes": "METHOD AND HONESTY BOUNDARY. Worked entirely through WebSearch and WebFetch as instructed; no Bash, no scripts, no shell scraping. Every patent number reported below was seen on a page that I fetched. Google Patents consistently truncates the claims section when converted to markdown, so for verbatim claim text I fell back to FreePatentsOnline, which returns full claims reliably. Justia returned HTTP 403 on every attempt (assignee pages for both Ava AG and Whoop), which is why no exhaustive assignee-level portfolio listing was possible.\n\nVERIFIED vs INFERRED, per patent. Claim 1 read VERBATIM and quoted in full: US10779802B2 (plus claim 12), US11766248B2, US12446865B2, US12502162B2, US12558022B2, US20220387003A1 (as published), US12426858B2, US10765409B2, US8540644B2, US8834389B2, US10828015B2, US11521401B2. Page read but claim text TRUNCATED and therefore NOT verbatim-verified: US12551197B2, US20220313223A1, EP4312797A1, US9155522B2. Everything in the blocks_what and designed_around_how fields is my INFERENCE from the claim language \u2014 it is engineering-level reasoning about scope, not a legal freedom-to-operate opinion, and it is not a substitute for one.\n\nON THE '~32 PATENTS' FIGURE. I could NOT verify that Ava holds roughly 32 patents. Justia's assignee page was blocked and Google Patents' assignee search is JavaScript-rendered and not fetchable. What I did verify is four granted, in-force US patents plus the ceased PCT parent WO2016131630A1 and the pre-grant publication US20190167237A1. Treat the 32 figure as unconfirmed; if it is accurate, most of the remainder are likely foreign family members (EP, CN, JP) of the same four inventions rather than 32 distinct inventions. Assignee records now show Ava Woman LLC and Ava Sciences FMTC LLC alongside Ava AG on several of these, consistent with an asset transfer out of the original Swiss entity after Ava wound down its consumer business \u2014 which raises the possibility that these are now held by a party whose business model is licensing/assertion rather than product. That is speculation on my part, but it is worth a corporate-records check because it changes the risk profile materially.\n\nANSWER TO THE CRITICAL QUESTION \u2014 IS 'RHR + HRV + SKIN TEMPERATURE FUSED TO CONFIRM OVULATION' ALREADY CLAIMED? Short answer: NO, not as a clean standalone claim, but Ava has built a fence with three overlapping panels and you need to walk between them deliberately. There is no granted claim anywhere in what I read of the form 'receive resting heart rate, HRV and skin temperature from a wearable, fuse them, and output a confirmed ovulation day'. The three closest, in descending order of threat: (1) Ava US11766248B2 is the real one \u2014 genuine temperature + HR/HRV fusion to pinpoint ovulation \u2014 but it is saved for you by two hooks: the ovulation marker MUST be a temperature NADIR (a temporary decrease), and the search window MUST be opened by absolute interbeat-interval threshold crossings. Confirm off the post-ovulatory RISE and gate with personalised baseline deviation and you are outside it. (2) Ava US12446865B2 is the only claim that literally recites heart rate AND HRV AND skin temperature together for an ovulation determination, but only to label a whole cycle ovulatory vs anovulatory, only inside windows anchored to a manually entered menses date and starting exactly ten days after ovulation, and it uses closed 'consisting of' transitional language, and the processor must ALSO detect conception and miscarriage. Confirming a per-day ovulation event without menses entry and without pregnancy features does not practise it. (3) Ava US10779802B2 covers HR + HRV fertile-window bracketing but has NO temperature element at all and \u2014 a genuine drafting gift \u2014 requires the result to be displayed on the wearable's own screen in BOTH independent claims. HOW BROAD, overall: narrower than the titles suggest. Every single granted claim in this space carries at least one mechanism-specific or output-specific limitation. Nobody owns the concept of multi-parameter physiological fusion for ovulation; they own particular pipelines. The genuinely broad document in the landscape is Apple's US20220387003A1, whose published claim 1 covers heart-rate-only fertility-window estimation on a wearable with no temperature and no HRV limitation \u2014 but it is PENDING, will likely narrow in prosecution, and needs re-checking before any US launch.\n\nCOULD AN INDIAN COMPANY PRACTISE IT? On the evidence, yes \u2014 with high confidence for the Indian domestic market and much lower confidence for export. VERIFIED: patents are territorial, and neither of the two families whose worldwide filings I could actually read shows an Indian national-phase entry. Ava's foundational PCT WO2016131630A1 entered only China, Europe and the US, and the PCT itself is listed as Ceased. Oura's core menstrual-cycle-tracking PCT WO2022192684A1 entered Canada, Europe, Japan, China, Australia and the US. No IN in either. INFERRED: with no granted Indian patent there is nothing to infringe by making, using, selling or importing within India. INFERRED and flagged as needing professional confirmation: Indian patent law is additionally hostile to this claim type \u2014 Section 3(k) of the Patents Act excludes algorithms and computer programmes per se, and Section 3(i) excludes diagnostic methods practised on the human body \u2014 so even if Ava or Oura filed in India tomorrow, claims of this shape would face real subject-matter resistance. I did NOT verify either statutory point against a primary source in this search; treat it as a lead for counsel, not a finding.\n\nTHREE CAVEATS THAT MATTER MORE THAN THE GOOD NEWS. First, I verified the absence of Indian filings for TWO families only. I could not check the Indian national phase for Ava's temperature-nadir, pregnancy-events or contraception families, because Google Patents truncated the worldwide-applications section on all three of those pages. Before relying on the India conclusion, someone should run those three families through the Indian Patent Office InPASS database and Espacenet directly. Second, the moment Rove sells into the US, EU, UK, China, Japan, Canada or Australia, every one of these patents becomes live and the design-arounds above stop being optional. Third, and most actionable: the single highest-risk product decision Rove could make is adding a contraception or 'safe days' mode. Ava US12502162B2 runs to 2042, uses the broadest sensing language of the four ('physiological data', no named sensor), and is anchored precisely to generating a message containing a contraception interval. Conception support, cycle insight and PCOS/PMS positioning are comparatively clear; digital contraception is not.\n\nCOMPANIES REQUESTED THAT I COULD NOT VERIFY, stated plainly rather than guessed at. WHOOP: no menstrual or cycle-phase patent verified. Search snippets described Whoop technology correlating respiratory rate and HRV to hormonal cycles with phase-specific coaching, but I could not attach that to a patent number I had read. The one Whoop document I did fetch, US20170188847A1 (Whoop Inc / Bobo Analytics, 'Physiological measurement system with motion sensing'), is ABANDONED and contains no reproductive-health content at all. US9750415B2 appeared in listings as a Whoop HRV/sleep patent but I did not read it. GARMIN: nothing verified \u2014 the search engine conflated Garmin with Oura documents, and I am reporting no Garmin patent rather than repeating that conflation. KEGG / LADY TECHNOLOGIES: no patent number surfaced despite two targeted searches; secondary sources say they hold patents on kegg's design and impedance-spectroscopy operation, but I read none. Low relevance to Rove regardless \u2014 intravaginal cervical-fluid impedance is a different sensing modality. TEMPDROP: no patent verified; their marketing cites a patented 'Active Temperature-Noise Cancellation' filtering algorithm but no number was findable through these tools. BLOOMLIFE: their portfolio (e.g. US10499844B2, Bloom Technologies) is electrohysterography, uterine activity and fetal/maternal heart rate for PREGNANCY monitoring \u2014 adjacent to but not overlapping cycle or ovulation detection, so I did not pursue claim text. NATURAL CYCLES was not on the brief but is the most conspicuous gap in this landscape given they hold FDA clearance for contraception using Apple Watch wrist temperature; their portfolio should be the first target of any follow-up search.\n\nSUGGESTED NEXT STEPS, in priority order: (1) pull the Indian national-phase status of Ava's US11766248B2, US12446865B2 and US12502162B2 families via InPASS and Espacenet; (2) search Natural Cycles Nordic AB's portfolio; (3) monitor prosecution of Apple US20220387003A1 and Oura US20220313223A1, the two pending applications that could still land on Rove's core; (4) pull verbatim claim 1 for US12551197B2, US20220313223A1, EP4312797A1 and US9155522B2 from FreePatentsOnline or USPTO full-text, which this search could not retrieve; (5) confirm current ownership of the four Ava patents, given the Ava Woman LLC / Ava Sciences FMTC LLC assignment records."
  },
  {
    "patents": [
      {
        "number": "US11519909B2",
        "assignee": "Easy Healthcare Corporation (Premom / Easy@Home)",
        "title": "Quantitative hormone and chemical analyte test result systems and methods",
        "independent_claim_gist": "VERIFIED (claim 1 read verbatim). A testing SYSTEM = (a) a test device with a visually identifiable test line and control line + (b) a user device with a camera, processor, display and memory, where the processor receives an image of the test device from the camera, determines a test-line value defined as a numerical value of the COLOR DENSITY of the test line, determines a control-line value the same way, and calculates a T/C ratio (relative value of test-line value to control-line value). That is the entire independent claim. No requirement for a phone specifically ('user device'), no requirement for a calibration card, no requirement for a lighting model. Dependent claims add: comparing the T/C ratio to a data structure relating T/C ratios to quantitative hormone levels, and aggregating a user's T/C ratio across menstrual cycles.",
        "blocks_what": "This is the single broadest live claim in the space and the biggest direct threat to Rove. Anyone who sells (or supplies for combined use) a lateral-flow strip plus an app that photographs it, measures test-line and control-line colour density, and divides one by the other, is inside claim 1. Rove's stated plan \u2014 smartphone-camera semi-quantitative LH/FSH strip reading \u2014 lands squarely in it if the pipeline computes any test-to-control intensity ratio. Analyte-agnostic (LH, FSH, hCG, PdG, E3 all recited in the spec). Runs to 2041.",
        "designed_around_how": "Three routes. (1) Do not compute a T/C ratio: normalise the test line against an absolute reference that is NOT the control line \u2014 e.g. the blank nitrocellulose membrane, a printed grey patch, or a camera-metadata-derived illuminant estimate \u2014 and derive concentration from the calibrated absolute test-line reflectance. Claim 1 requires a control-line VALUE and a ratio of test to control; absolute-reflectance calibration avoids the element. (2) Split the system: claim 1 is a combination claim requiring both the test device and the user device, so it is only directly infringed by whoever supplies/uses both. This is weak protection (inducement/contributory) but affects who is liable. (3) Validity attack: T/C-ratio quantification from a camera image was extensively published and patented before the June-2020 priority date \u2014 Cornell US9445749B2 (2013), Healthy.io US10068329B2 (2014), Reliant US11579145B2 (2016), MFB US12061196B2 (2017), Oova US12591974B2 (2018), plus a large academic literature. An IPR or a validity opinion is realistically available here. Note the odd preamble ('A testing system includes:') also invites a \u00a7112 indefiniteness argument.",
        "url": "https://patents.google.com/patent/US11519909B2/en",
        "priority_date": "2020-06-02",
        "status": "granted (active; grant 2022-12-06; anticipated expiry 2041-06-02)"
      },
      {
        "number": "US12287293B2",
        "assignee": "Easy Healthcare Corporation",
        "title": "Quantitative hormone and chemical analyte test result systems and methods (continuation)",
        "independent_claim_gist": "VERIFIED. Claim 1 as rendered is essentially identical in scope to US11519909B2: test device with test line + control line, user device with camera, colour-density values for both lines, T/C ratio. The family adds coverage for the lookup/data-structure step (T/C ratio to quantitative hormone level, per device type) and for aggregating a user's T/C ratio over menstrual cycles.",
        "blocks_what": "Continuation coverage means Easy Healthcare can keep prosecuting new claims tailored to whatever a competitor ships. Two further continuations were pending (US 18/433,900 and US 19/182,381 in the published family data), so claim scope in this family is a moving target \u2014 a freedom-to-operate opinion taken today can be obsoleted by a claim drafted tomorrow to read on Rove's shipped app.",
        "designed_around_how": "Same as US11519909B2, plus: monitor this family's continuation prosecution actively (Public PAIR / Patent Center) rather than relying on a one-off FTO clearance. If Rove publishes its per-user-baseline method early (defensive publication), it becomes \u00a7102/\u00a7103 art against continuations filed after that date, which is a cheap way to cap this family's future scope.",
        "url": "https://patents.google.com/patent/US12287293B2/en",
        "priority_date": "2020-06-02",
        "status": "granted (active; grant 2025-04-29; anticipated expiry 2041-06-02)"
      },
      {
        "number": "US12061196B2",
        "assignee": "MFB Fertility, Inc. (Proov)",
        "title": "Method for detection and interpretation of results indicated on a photographed diagnostic test",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 the Google Patents page rendered abstract/summary but not the numbered claims. Method scope as disclosed and summarised: sweeping a photographed diagnostic test (or a cropped region of it); creating a VECTOR of colour values from a plurality of horizontal pixel positions across the strip; identifying the location of the control line and each test line within that vector; and CALIBRATING to determine a hormone or analyte level corresponding to the colour value of a test line \u2014 with normalisation against the 'depth' of the control line specifically to compensate for lighting conditions, shadows and colour temperature. The claims are recited as running on a 'computing device, optionally a smartphone'.",
        "blocks_what": "This is the most dangerous MFB patent for Rove because it is NOT about PdG chemistry \u2014 it is about the image-processing pipeline itself, and it is analyte-agnostic. The 1-D horizontal colour-vector sweep to locate lines, plus control-line-depth normalisation for uncontrolled lighting, plus calibration to a hormone level, is the textbook implementation almost every team writes first. Expiry 2042 makes it the longest-lived obstacle found.",
        "designed_around_how": "Avoid the specific mechanics: (a) locate lines by 2-D segmentation / CNN keypoint detection on the whole strip image rather than by sweeping a 1-D vector of colour values along horizontal pixel positions; (b) do the illumination correction from something other than control-line depth \u2014 an on-housing grey reference, the blank membrane, or paired flash-on/flash-off frames \u2014 so the lighting compensation is not derived from the control line; (c) output an ordinal semi-quantitative BAND (e.g. 'low / rising / peak') rather than 'a hormone or analyte level', since the claim step is calibrating to a hormone/analyte level. (b) and (c) together also help against Easy Healthcare. Validity: priority is 2017-02-17 but this specific application was filed 2021-11-09 with a 2042 expiry, which implies substantial claim-scope narrowing during prosecution \u2014 pull the file wrapper for prosecution-history estoppel before assuming the claims are broad.",
        "url": "https://patents.google.com/patent/US12061196B2/en",
        "priority_date": "2017-02-17",
        "status": "granted (active; grant 2024-08-13; anticipated expiry 2042-11-04)"
      },
      {
        "number": "US11573225B2",
        "assignee": "MFB Fertility, Inc. (Proov)",
        "title": "System for evaluating urine for the presence or absence of pregnanediol glucuronide and other hormones and analytes",
        "independent_claim_gist": "VERIFIED via FreePatentsOnline (opening of claim 1 read verbatim; remainder from the specification/abstract). 'A fertility tracking system for evaluating a menstrual cycle, comprising: a plurality of diagnostic tests, wherein each diagnostic test comprises: a sample pad configured to collect an applied sample, a conjugate pad comprising one or more antibodies conjugated with one or more visual labels, one or more testing zones, positioned downstream from the one or more antibodies...'. The distinguishing chemistry limitations recited in the family: anti-PdG antibodies of isotype IgG1, IgG1-kappa, IgG2b or IgG3 conjugated to label; PdG conjugated to a globulin or BSA carrier at 8\u201332 molecules per carrier protein; membrane giving a perceptible result at or above a PdG threshold in the 3\u201320 \u00b5g/mL range (1\u201310 \u00b5g/mL in the related filing). Results interpreted through a mobile device application. Claims 2, 15, 16 and 17 are also independent.",
        "blocks_what": "Covers the practical working chemistry of a consumer home PdG strip \u2014 the antibody isotypes, the hapten-carrier loading ratio, and the clinically useful \u00b5g/mL cut-off range. A competitor cannot readily build a PdG home strip that both works at the right threshold and stays outside these ranges. Combined with the corpus-luteum method patents below, this is what 'MFB owns PdG' actually means.",
        "designed_around_how": "Not relevant to Rove as currently scoped \u2014 Rove is LH/FSH, and this patent is PdG-chemistry-specific. It becomes relevant the moment Rove adds a progesterone-metabolite line. If PdG is ever added: use an antibody outside the recited isotypes, a carrier/hapten loading ratio outside 8\u201332 molecules per carrier, and a detection threshold outside the recited \u00b5g/mL windows \u2014 all three are hard, which is why MFB's PdG position is genuinely strong in the US.",
        "url": "https://patents.google.com/patent/US11573225B2/en",
        "priority_date": "2017-02-17",
        "status": "granted (active; grant 2023-02-07; anticipated expiry 2038-02-20)"
      },
      {
        "number": "US12282029B2",
        "assignee": "MFB Fertility, Inc. (Proov)",
        "title": "Portable diagnostic system for ovulation cycle monitoring",
        "independent_claim_gist": "VERIFIED (claim 1 opening read verbatim). 'A diagnostic system for monitoring ovulation cycles, comprising: a lateral flow assay test cassette configured to simultaneously measure at least two hormones and/or analytes present within a single sample, wherein the lateral flow assay test cassette comprises: a sample well configured to collect and receive the single sample; and a test strip configured to receive the single sample from the sample well and to detect the presence of pregnanediol glucuronide (PdG) and at least one other hormone and/or analyte in the single sample...'. Dependent claim 7 adds the reading method: applying a sample to the cassette, IMAGING THE SAMPLE WITH A SMART DEVICE, quantifying the hormones/analytes, and computing results with an application on the smart device.",
        "blocks_what": "Blocks the multi-analyte home panel where PdG shares a cassette with any second hormone \u2014 i.e. PdG+LH, PdG+E3G, PdG+FSH, PdG+hCG. This is the patent MFB publicised as covering 'PdG plus a second hormone in one test', with a third zone for estrogen. Reaches to 2040. Also captures smart-device imaging + quantification as a dependent limitation, so the reading method travels with the cassette claim.",
        "designed_around_how": "The independent claim is anchored on PdG being one of the analytes. A Rove LH+FSH cassette with no PdG zone does not read on claim 1. The clean design-around is simply: do not put PdG on the strip. If a progesterone readout is ever needed, run it as a physically separate single-analyte cassette on a different day rather than multiplexed into the same cassette \u2014 the claim requires the two analytes in a SINGLE sample on a single cassette.",
        "url": "https://patents.google.com/patent/US12282029B2/en",
        "priority_date": "2017-05-08",
        "status": "granted (active; grant 2025-04-22; anticipated expiry 2040-06-30)"
      },
      {
        "number": "US11029321B2",
        "assignee": "MFB Fertility, Inc. (Proov)",
        "title": "Method of evaluating corpus luteum function by recurrently evaluating progesterone non-serum bodily fluids on multiple days",
        "independent_claim_gist": "INFERRED \u2014 the Google Patents page did not render the claims section and I could not retrieve claim 1 before rate-limiting. From title, abstract and the family: a METHOD of assessing corpus luteum function / ovulation by measuring a progesterone metabolite (PdG) in a non-serum bodily fluid (urine) repeatedly on multiple days across the luteal window, and inferring luteal adequacy from the multi-day pattern. This is the 'test on days 7\u201310 past peak, need N positives' protocol that Proov Confirm sells.",
        "blocks_what": "Blocks the PROTOCOL rather than the device \u2014 a competitor could design a non-infringing PdG strip and still be caught by instructing users to test PdG on multiple days to confirm ovulation or assess luteal-phase adequacy. This is why 'PdG-based ovulation confirmation' is fairly described as locked up in the US: MFB holds both the chemistry and the multi-day method. Note the paired system claim US11061026 (same title, 'System of evaluating corpus luteum function...') \u2014 I saw this number in a USPTO search result but did not read its claims; treat it as unverified.",
        "designed_around_how": "For Rove: avoid entirely by not offering PdG-based ovulation confirmation or luteal-phase adequacy scoring in the US. Confirm ovulation instead from the LH-surge trajectory plus an independent signal (BBT, cycle-history model). If PdG confirmation is commercially essential, the realistic paths are a licence or launching that feature outside the US first \u2014 MFB's EP position is partial (EP3731751B1 active, EP4017375A1 not active) and I found no Indian counterpart.",
        "url": "https://patents.google.com/patent/US11029321B2/en",
        "priority_date": "2017-02-17",
        "status": "granted (active; grant 2021-06-08; anticipated expiry 2038-02-20)"
      },
      {
        "number": "US11579145B2",
        "assignee": "Reliant Immune Diagnostics, LLC",
        "title": "System and method for image analysis of medical test results",
        "independent_claim_gist": "VERIFIED (claim 1 read verbatim). A system comprising a SERVER configured to: receive information from a mobile device regarding test results from a test performed using a testing device, where the testing device includes an ALIGNMENT TARGET disposed on it and a plurality of immunoassay test strips; receive an image of the testing device from the mobile device; determine RGB values for a plurality of pixels of the image; NORMALIZE the RGB values into a single value; compare that single value to a CONTROL VALUE STORED ON THE SERVER; and provide a risk indicator indicating likelihood of presence of a medical condition.",
        "blocks_what": "Covers the cloud-backed architecture: phone captures, server does the RGB normalisation and compares against a stored reference. Requires (i) an alignment target printed on the test device, (ii) a PLURALITY of immunoassay strips, and (iii) server-side processing. Reliant reportedly holds ~108 patents in this area, so this is a thicket rather than a single patent \u2014 the surrounding family should be cleared before shipping a US product. Parent US9857373B1 (referenced on this patent's own page) predates it.",
        "designed_around_how": "Three independent escapes, any one of which is sufficient: (1) do the colour analysis ON-DEVICE rather than on a server \u2014 claim 1 is a server claim and every step is performed by the server; (2) omit the alignment target from the printed strip housing and register the image geometrically (edge/contour detection, ArUco-free homography) instead; (3) use a single test strip rather than 'a plurality of immunoassay test strips' \u2014 though Rove's LH/FSH panel probably cannot use this one. On-device processing is the cheapest and also the best privacy story, so it is the recommended route.",
        "url": "https://patents.google.com/patent/US11579145B2/en",
        "priority_date": "2016-10-17",
        "status": "granted (active; grant 2023-02-14; anticipated expiry 2037-08-22)"
      },
      {
        "number": "US12591974B2",
        "assignee": "Oova, Inc. (Hilin/Oova \u2014 Aparna Divaraniya)",
        "title": "Methods, devices, and systems for detecting analyte levels",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 metadata and specification read; the claims section did not render on Google Patents before rate-limiting. Scope as disclosed: a computer-implemented method that processes PIXEL INTENSITIES IN A HUE, SATURATION, VALUE OR LIGHTNESS COLOUR SPACE from an image (captured by 'a camera of a mobile telecommunications device') of an indicator associated with a health status, thereby quantifying the indicator and reporting health status; plus a lateral flow device comprising labelled particles with a first capture agent, a test area with a second capture agent, a control area with a control agent, and an ORIENTATION ELEMENT \u2014 where the orientation element encodes batch information used to NORMALISE the control area across manufacturing batches. Specification also covers tracking a personalised hormone curve that improves with each user interaction.",
        "blocks_what": "This is the closest analogue to Rove's intended product: no hardware accessory, phone camera only, HSV-space quantification of LH/E3G/PdG, plus a machine-readable element on the strip used for batch-level normalisation and a per-user hormone baseline. If Rove prints a QR/datamatrix or fiducial on the strip that carries lot-calibration data and uses HSV/HSL pixel intensities, this reads on it. Runs to 2040.",
        "designed_around_how": "(1) Work in a device-independent colour space that is not HSV/HSL/value/lightness \u2014 CIELAB or CIEXYZ with a proper illuminant transform. This is both a design-around and technically better for cross-phone consistency. (2) Carry lot-calibration data out-of-band (app fetches the lot curve from a code on the FOIL POUCH or the box, not from an orientation element on the lateral flow device itself) \u2014 the device claim recites the orientation element as part of the lateral flow device. (3) Get the claims read properly by counsel before committing; I could not retrieve them and the granted scope is very likely narrower than the disclosure.",
        "url": "https://patents.google.com/patent/US12591974B2/en",
        "priority_date": "2018-06-22",
        "status": "granted (active; grant 2026-03-31; anticipated expiry 2040-05-19)"
      },
      {
        "number": "WO2019246361A1",
        "assignee": "Oova, Inc.",
        "title": "Methods, devices, and systems for detecting analyte levels",
        "independent_claim_gist": "VERIFIED metadata; claims not rendered. PCT parent of US12591974B2. Inventors Aparna Divaraniya and Jerome Scelza. Same disclosure: mobile-camera imaging of a lateral flow strip, orientation element for batch normalisation of the control area, HSV/lightness colour-space pixel processing, personalised hormone curve.",
        "blocks_what": "Establishes Oova's international priority position from 2018-06-22. Relevant for checking national-phase entries in any market Rove plans to enter (including whether an Indian national phase exists).",
        "designed_around_how": "Same as US12591974B2. Practical action: run a national-phase check on this PCT for India, EP and any other target market \u2014 if Oova did not enter a given jurisdiction, the whole family is a non-issue there and the published PCT becomes free prior art Rove can practise.",
        "url": "https://patents.google.com/patent/WO2019246361A1/en",
        "priority_date": "2018-06-22",
        "status": "pending/national-phase (PCT published 2019-12-26; US member granted as US12591974B2)"
      },
      {
        "number": "US9445749B2",
        "assignee": "Cornell University",
        "title": "Smartphone-based apparatus and method for obtaining repeatable, quantitative colorimetric measurement",
        "independent_claim_gist": "VERIFIED (claim 1 recovered in substance from the patent page). Method: providing a modular colorimetric reactive test platform having a TEST REGION and a CALIBRATION REGION (the calibration region maintains a CONSTANT COLOUR regardless of analyte amount); applying analyte; obtaining a colour image of the test region and the calibration region together; selecting an array of pixels from each; determining a MEDIAN RGBA value for each array; converting each median RGBA value to a HUE-SATURATION-LIGHTNESS (HSL/HSV) colour space value; and providing a CALIBRATION INDICIA \u2014 a calibration curve relating the quantitative amount of analyte to a hue value \u2014 to derive concentration. Explicit purpose: 'calibrate away differences in light intensity and camera function from smartphone platform to smartphone platform.'",
        "blocks_what": "This is the direct answer to Rove's question about device-independent colour calibration using an ON-STRIP reference. Cornell claimed it in 2013 and it runs to 2034. Any implementation that prints a constant-colour patch on the strip, images it in the same frame as the test line, converts both to HSL/HSV, and uses a hue-based calibration curve to output concentration is inside this claim. It is an academic assignee, so the enforcement posture is licensing rather than injunctions \u2014 but Cornell does licence aggressively and the family has two grants (US9445749B2 and US9787815B2).",
        "designed_around_how": "The claim has four stackable limitations and dropping any one exits it. Cleanest: (1) do not use HSL/HSV \u2014 calibrate in CIELAB/XYZ with an illuminant estimate; (2) do not use a MEDIAN RGBA over a pixel array \u2014 use a fitted line-profile model or trimmed mean over a 2-D region; (3) do not use a purpose-printed constant-colour calibration region \u2014 use the unreacted nitrocellulose membrane / white housing as the white point, which is not a 'calibration region' of the test platform in the claimed sense; (4) do not map hue to concentration \u2014 map calibrated absolute reflectance or optical density. Option (3) plus (1) is the strongest combination and also happens to be the better engineering answer.",
        "url": "https://patents.google.com/patent/US9445749B2/en",
        "priority_date": "2013-01-21",
        "status": "granted (active; grant 2016-09-20; anticipated expiry 2034-01-21)"
      },
      {
        "number": "US9787815B2",
        "assignee": "Cornell University",
        "title": "Smartphone-based apparatus and method for obtaining repeatable, quantitative colorimetric measurement",
        "independent_claim_gist": "VERIFIED as a family member of WO2014113770A1 (identified on the PCT's Google Patents page as a granted US sibling of US9445749B2); the individual page 503'd before I could read claim 1. Same disclosure: on-platform constant-colour calibration regions used to normalise away smartphone-to-smartphone camera and lighting differences, RGBA to HSL/HSV conversion, calibration curve to analyte concentration. Likely the apparatus/system counterpart to the US9445749B2 method claims.",
        "blocks_what": "Closes the apparatus side of the Cornell family, so switching between 'method' and 'system' framing does not escape it. Same 2034 horizon.",
        "designed_around_how": "Same as US9445749B2 \u2014 the design-arounds are colour-space and reference-source choices, not claim-category choices. Read claim 1 of this one specifically before finalising the calibration architecture; I was not able to.",
        "url": "https://patents.google.com/patent/US9787815B2/en",
        "priority_date": "2013-01-21",
        "status": "granted (active; anticipated expiry ~2034)"
      },
      {
        "number": "US10068329B2",
        "assignee": "Healthy.io Ltd",
        "title": "Method and system for automated visual analysis of a dipstick using standard user equipment",
        "independent_claim_gist": "VERIFIED (claim 1 read verbatim, in full). Capturing, with a mobile device camera, an image containing BOTH a dipstick with coloured test reagents AND a COLOUR BOARD comprising a GRID OF GREY PATCHES and A PLURALITY OF SETS OF REFERENCE COLOUR PATCHES, where the reference patches reflect variations in illumination conditions, capture capabilities of potential mobile devices, and camera response functions, and where each SET of reference patches is TAILORED TO SPAN THE COLOUR GAMUT of a respective test reagent; deriving LOCAL ILLUMINATION PARAMETERS from the reference patches and grey grid; normalising local illumination of the captured image; and interpreting the reagents from the normalised image.",
        "blocks_what": "The gold-standard implementation of device-independent colorimetry under uncontrolled lighting. Blocks the 'print a colour card, photograph it next to the test, solve for the illuminant, then read the result' architecture \u2014 which is the obvious and most robust engineering answer to Rove's white-balance problem. Healthy.io has FDA clearance on this and treats it as core IP. Expires 2034.",
        "designed_around_how": "Claim 1 is loaded with specific structural requirements, and each is a clean exit: (1) a GRID of grey patches \u2014 use a single grey reference or none; (2) A PLURALITY OF SETS of reference colour patches with EACH SET TAILORED TO SPAN the gamut of a respective reagent \u2014 a single monochrome/greyscale reference ladder, or a set not gamut-matched per reagent, is outside; (3) LOCAL illumination parameters \u2014 a global white-balance/illuminant estimate rather than spatially local parameters; (4) a separate 'colour board' \u2014 the reference on the strip housing itself rather than a board the dipstick is placed on. For a single-analyte-colour gold-nanoparticle LH/FSH strip (one reagent colour, one gamut) requirement (2) is essentially impossible to meet accidentally, so a greyscale-only reference ladder printed on the housing is a comfortable distance away.",
        "url": "https://patents.google.com/patent/US10068329B2/en",
        "priority_date": "2014-05-12",
        "status": "granted (active; grant 2018-09-04; anticipated expiry 2034-05-12)"
      },
      {
        "number": "US6454726B1",
        "assignee": "Alere Switzerland GmbH (originally Unilever/Unipath \u2014 Clearblue/Persona lineage)",
        "title": "Monitoring method",
        "independent_claim_gist": "VERIFIED (claim 1 read verbatim, in full). A method of predicting the fertile period during a current ovulation cycle by detecting an elevated urinary E3G concentration in the pre-ovulation phase, wherein the elevated concentration is determined by reference to a THRESHOLD CONCENTRATION DETERMINED FOR THAT INDIVIDUAL WOMAN from measurements of E3G in HER OWN urine during the pre-ovulation phase of at least one PREVIOUS cycle \u2014 the threshold adopted for the current cycle being the concentration that, in a previous cycle, was exceeded more frequently during the transition phase than during the same number of days in the preceding infertile phase.",
        "blocks_what": "Nothing \u2014 it is EXPIRED (2013-08-20, 'Expired - Fee Related'). Reported here because of its offensive value, not its defensive threat.",
        "designed_around_how": "No design-around needed. This is the single most useful find for Rove: PER-USER BASELINE CALIBRATION of a urinary fertility hormone threshold, derived from that same user's prior cycles, was claimed by Unipath from a 1992 priority and fell into the public domain in 2013. Rove can practise it freely, AND it is powerful \u00a7102/\u00a7103 prior art against anyone who tries to assert a modern claim over per-user adaptive hormone thresholds. Cite it in any FTO opinion and in any defensive publication. Sibling US6234974B1 (Unilever Patent Holdings, filed 1996-12-24, 'Expired - Lifetime', anticipated expiry 2013-08-20) covers the same personalised-reference-value concept for E3G/LH.",
        "url": "https://patents.google.com/patent/US6454726B1/en",
        "priority_date": "1992-08-21",
        "status": "expired (2013-08-20)"
      },
      {
        "number": "US6234974B1",
        "assignee": "Unilever Patent Holdings BV / Unipath (Clearblue lineage)",
        "title": "Monitoring method",
        "independent_claim_gist": "VERIFIED via patent page summary (claims not individually read). A method of monitoring the status of a current ovulation cycle of an individual woman by testing body-fluid concentration of an analyte relevant to cycle status (urinary E3G, and in the family LH) during at least part of the pre-ovulation phase, using PERSONALISED REFERENCE VALUES adapted to that individual subject based on data from her previous ovulation cycles.",
        "blocks_what": "Nothing \u2014 expired 2013-08-20 ('Expired - Lifetime').",
        "designed_around_how": "No design-around needed. Second pillar of the expired per-user-baseline prior art alongside US6454726B1. Together these two mean that the conceptual core of Rove's differentiator \u2014 adaptive, individually-calibrated hormone thresholds \u2014 is free to use. Rove's patentable delta must therefore lie in HOW the baseline is built from smartphone-image-derived intensity values, not in the idea of a personal baseline itself.",
        "url": "https://patents.google.com/patent/US6234974B1/en",
        "priority_date": "1996-12-24 (filing)",
        "status": "expired (2013-08-20)"
      },
      {
        "number": "US7632460B2",
        "assignee": "Alere Switzerland GmbH (originally Inverness Medical Switzerland / Unipath)",
        "title": "Test kits and devices",
        "independent_claim_gist": "VERIFIED (claim 1 opening read verbatim). A test kit for determining one or more analytes in a fluid sample comprising an assay device within a housing, the housing having a displacing portion and an accommodating portion on a face of the housing with the displacing portion adjacent the accommodating portion, plus a reading device configured to read a result of an assay performed using the assay device. The core invention is the mechanical lock-and-key interface between a disposable assay device and its reader; deliberately drafted analyte-agnostic, with ovulation (LH and E3G) given as an example application.",
        "blocks_what": "Nothing \u2014 EXPIRED 2018-05-24 ('Expired - Fee Related'). Included as evidence that the Clearblue/Unipath 'strip plus reader for LH and E3G' platform patents from the 1996-era filings have now lapsed.",
        "designed_around_how": "No design-around needed. Confirms that the foundational Clearblue reader-plus-strip architecture is in the public domain. SPD's own remaining portfolio (US9151749B2 bubble-forming assay device, US20160123977A1 assay device with shared zones, EP3052944B1, plus a run of design patents USD922607S1/USD922608S1/USD875965S1/USD735351S1) is device-mechanics and industrial design, not smartphone image processing \u2014 SPD is therefore a low FTO threat to Rove's software approach, though its design patents matter if Rove's strip housing or app icons resemble Clearblue's.",
        "url": "https://patents.google.com/patent/US7632460B2/en",
        "priority_date": "1996-09-27",
        "status": "expired (2018-05-24)"
      },
      {
        "number": "US20150094227A1 / US10228377B2",
        "assignee": "SPD Swiss Precision Diagnostics GmbH",
        "title": "Pregnancy test device and method",
        "independent_claim_gist": "VERIFIED metadata and specification (claim 1 not rendered). Device with assay means to measure the absolute or relative amount of hCG, of FSH, and of one or more progesterone metabolites in a sample from the subject. Primary embodiment uses an INTEGRAL optical reader \u2014 LEDs and photodiodes on a PCB with an LCD display \u2014 not a smartphone. The specification does mention in passing that 'extrinsic assay result reading means may comprise a mobile phone or other portable electronic device provided with a camera', but that is fallback disclosure, not the claimed embodiment.",
        "blocks_what": "Limited relevance to Rove. It is notable mainly as evidence that SPD, the largest incumbent, did NOT pursue smartphone-camera colorimetric quantification as its claimed approach and let this filing lapse ('Expired - Fee Related' on the publication). Its passing mention of camera-phone reading is, however, useful third-party prior art against later camera-reading claims by others.",
        "designed_around_how": "Not a live obstacle. Do note that this filing recites hCG + FSH + progesterone metabolite measurement in one device, which is worth citing as prior art if Rove ever needs to attack a multi-analyte panel claim asserted against it.",
        "url": "https://patents.google.com/patent/US20150094227A1/en",
        "priority_date": "2013-10-02",
        "status": "lapsed/expired - fee related (granted US member US10228377B2; publication marked expired)"
      },
      {
        "number": "US10295472B2",
        "assignee": "Alverix, Inc. (Becton Dickinson group)",
        "title": "Assay reader operable to scan a test strip",
        "independent_claim_gist": "VERIFIED (claim 1 read verbatim). An assay test strip reader with a body sized to receive an assay strip, at least one detector positioned within the body such that the OPERATOR'S ACT OF INSERTING OR REMOVING the strip \u2014 i.e. relative motion of strip and detector \u2014 causes the detector to sense a first signal at a first point on the strip and a second signal at a different second point; plus a signal converter that generates a result signal from the first and second optical signals. Detector may be a photodiode or an imager; the strip's manual motion generates the scan profile with no motorised stage.",
        "blocks_what": "Blocks cheap hardware readers that scan a strip by hand motion past a fixed detector. Alverix/BD holds a family here (US11204328 appears in the same family per USPTO search results, though I did not read it). Runs to 2031.",
        "designed_around_how": "Not applicable to Rove's architecture \u2014 claim 1 requires a physical reader body that receives the strip and a detector inside it. A phone photographing a strip lying on a table has no 'body sized to receive an assay strip' and no insertion/removal-driven scan. This patent is only a concern if Rove later ships a hardware dock or sleeve; if so, capture the whole strip in a single frame rather than scanning it by relative motion.",
        "url": "https://patents.google.com/patent/US10295472B2/en",
        "priority_date": "2010-05-05",
        "status": "granted (active; grant 2019-05-21; anticipated expiry 2031-02-21)"
      },
      {
        "number": "WO2022123600A1 / US20240053362A1 / GB2617503A",
        "assignee": "Varun Akur Venkatesan, Siddharth Pattnaik, Dipankar Das (Inito founders; filed in individual names, Inito Inc. related)",
        "title": "Dynamic monitoring of E3G, LH, PdG, FSH levels in female subjects to predict health conditions",
        "independent_claim_gist": "VERIFIED (claim 1 read verbatim as filed). 'A method for determining a plurality of health conditions for a female subject comprising: determining concentrations or levels, and/or RATE OF CHANGE in concentration or levels of analytes selected from one or more of Estradiol glucuronide (E3G), Luteinizing Hormone (LH), Pregnanediol Glucuronide (PdG), Follicle-stimulating hormone (FSH), and human chorionic gonadotropin (hCG); mapping concentration of at least one analyte with respect to a phase of the cycle; and predicting a health condition of the female subject.' The specification adds a smartphone user device coupled to the strip via an optical waveguide, and comparison of measured concentration against pre-defined values 'defined by the user or the system'.",
        "blocks_what": "As filed this claim is breathtakingly broad \u2014 it would cover essentially any app that takes a urinary hormone level or its rate of change, maps it to a cycle phase, and predicts a health condition. That is Rove's entire product thesis. It is almost certainly unpatentable as filed (abstract idea under \u00a7101, and anticipated by the Unipath/Clearblue and Mira/Proov art), and the US member US20240053362A1 remains unexamined-to-granted as far as I could determine.",
        "designed_around_how": "Do not design around a pending claim of this breadth \u2014 monitor it and, if it approaches allowance, file third-party prior-art submissions (37 CFR 1.290) citing US6454726B1, US6234974B1 and the Mira/Proov literature. This is the highest-value cheap defensive action available to Rove: a pre-issuance submission costs almost nothing and would very likely force this family into a much narrower scope. Also note the WO's smartphone embodiment uses an OPTICAL WAVEGUIDE coupling the strip to the phone \u2014 Rove's accessory-free approach differs structurally.",
        "url": "https://patents.google.com/patent/WO2022123600A1/en",
        "priority_date": "2020-12-08",
        "status": "pending (PCT published 2022-06-16; US member US20240053362A1 published 2024-02-15, listed ACTIVE)"
      },
      {
        "number": "US10606051B2",
        "assignee": "Varun Akur Venkatesan (Inito)",
        "title": "Optical system for light collection",
        "independent_claim_gist": "NUMBER, TITLE, ASSIGNEE, DATES VERIFIED from a Google Patents search-result page; CLAIM SCOPE IS INFERRED \u2014 the patent page returned HTTP 503 on every attempt and I did not read claim 1. Inferred from title, assignee and Inito's publicly described product: the 'flat-lens' optical light-collection element that sits between the test strip and the phone camera in Inito's clip-on reader, enabling close-focus imaging of the strip. Sibling application US20180188423A1 ('Optical system', same inventor, priority 2015-06-29).",
        "blocks_what": "Inferred: blocks accessory-based phone-camera strip readers that use this class of flat/planar light-collection optic. Inito's own product is built on it. Because it is a hardware-optics patent, it should not reach a software-only, accessory-free reading approach \u2014 but this is an inference, not a verified reading of the claims.",
        "designed_around_how": "Rove's plan \u2014 bare phone camera, no clip-on optic \u2014 is very likely outside a claim directed to an optical light-collection system. Confirm by reading claim 1 directly before relying on it. Also relevant strategically: Inito's need for a physical lens accessory is precisely the constraint Rove is trying to remove, and doing so accessory-free is a differentiator rather than an infringement. Two further Inito Health Inc. applications appeared in the same search (US20260092915A1 'Test device and method for analyzing biological samples using bifurcated...' and US20260092916A1 'Test strips and method for extending sample flow path in lateral flow assays', both priority 2019-06-20, filed 2025-12-08) \u2014 strip-architecture filings, not image processing.",
        "url": "https://patents.google.com/patent/US10606051B2/en",
        "priority_date": "2013-09-01",
        "status": "granted (listed ACTIVE; grant 2020; claim text unread)"
      },
      {
        "number": "WO2025250702A1",
        "assignee": "Easy Healthcare Corporation",
        "title": "Systems and Methods for Semi-Quantitative and Quantitative Detection of Metabolites of Progesterone",
        "independent_claim_gist": "VERIFIED metadata and disclosure (numbered claims not rendered). A test system comprising a test device AND A CALIBRATION CHART, using a NON-COMPETITIVE lateral flow assay in which the test line INCREASES in darkness with increasing analyte concentration; semi-quantitative results read by visual comparison against a standardised calibration chart, and a camera-equipped user device that automatically interprets the semi-quantitative result into a quantitative hormone level using a T/C ratio computed from greyscale values of test and control lines against a white background, expressly to account for ambient lighting variation.",
        "blocks_what": "Directly targets the SEMI-QUANTITATIVE reading approach Rove has chosen, including the printed comparison chart and greyscale T/C computation against a white background reference. Only a 2024 priority and not yet granted anywhere, so it blocks nothing today \u2014 but it signals that Easy Healthcare is actively extending its 2020 T/C-ratio family to cover exactly this territory, and it will publish as prior art that constrains what Rove itself can patent.",
        "designed_around_how": "Two implications. (1) Timing: Rove's own filings on smartphone semi-quantitative reading should be prioritised \u2014 this PCT published 2025-12-04 and becomes citable art against later Rove applications. (2) Substance: the greyscale-versus-white-background T/C computation described here is one more reason to normalise against an absolute reference rather than the control line. Also note this is a PROGESTERONE-METABOLITE filing; the semi-quantitative machinery is described in that context, which may limit how far the granted claims can reach into LH/FSH.",
        "url": "https://patents.google.com/patent/WO2025250702A1/en",
        "priority_date": "2024-05-28",
        "status": "pending (PCT published 2025-12-04)"
      },
      {
        "number": "US20230023292A1",
        "assignee": "Quanovate Inc. / Quanovate Tech Inc. (Mira)",
        "title": "Lateral flow immunoassay devices and methods of using same",
        "independent_claim_gist": "NUMBER, TITLE, ASSIGNEE AND DATES VERIFIED from a Google Patents search-result page; claims not read. Mira's core lateral-flow device filing. Related Quanovate filings found in the same search: US20230393155A1 'Lateral flow immunoassay devices with dynamic tracking and methods of using them' (priority 2022-06-02), US20250102503A1 'Lateral flow immunoassay device and system for assessing assay flowability' (priority 2023-09-21), USD1041024S1 design patent for an immunoassay device (granted 2024-09-03), and EP3460469A4 'Detection device and detection method' (Quanovate Global Ltd, priority 2016-05-19).",
        "blocks_what": "Mira's protectable position is in the fluorescence-labelled test wand and the dedicated benchtop fluorescence analyser, not in smartphone camera colorimetry \u2014 Mira requires a reader device precisely because immunofluorescence cannot be read by a bare phone camera. Quanovate is therefore a LOW direct threat to Rove's approach. Note EP3460469A4 is listed NOT ACTIVE in WO, EP and US and active only in CN, i.e. Mira's detection-device family has largely lapsed outside China.",
        "designed_around_how": "Rove's colorimetric gold-nanoparticle strip read by an unmodified phone camera is a fundamentally different detection modality from Mira's fluorescence-plus-reader architecture, so no design-around is required. The strategic read is the opposite: Mira's dependence on a $100+ hardware analyser is the market gap Rove is attacking. Read the claims of US20230023292A1 before finalising strip architecture, since device-level LFA claims can be modality-agnostic.",
        "url": "https://patents.google.com/patent/US20230023292A1/en",
        "priority_date": "2017-08-01",
        "status": "pending (published 2022/2023; listed ACTIVE in US and CN)"
      },
      {
        "number": "US20210373010A1",
        "assignee": "Easy Healthcare Corporation",
        "title": "Quantitative hormone and chemical analyte test result systems and methods",
        "independent_claim_gist": "VERIFIED (claim 1 read verbatim \u2014 identical to the granted US11519909B2 claim 1: camera, test-line colour density value, control-line colour density value, T/C ratio). Published application from which US11519909B2 and US12287293B2 issued. Analytes recited across the family: LH, hCG, FSH, progesterone, estrogen and estriol.",
        "blocks_what": "As a publication it blocks nothing itself, but it is the public record of when Easy Healthcare's T/C-ratio disclosure entered the art (published 2021-12-02) and it names the exact hormone list \u2014 including LH and FSH \u2014 confirming that Rove's LH/FSH panel is within the family's intended analyte coverage.",
        "designed_around_how": "Use the file wrapper. Because two patents have already issued from this application and further continuations were pending, the prosecution history will show exactly what Easy Healthcare surrendered to get allowance \u2014 that is the cheapest source of a reliable design-around, and it is public. Order it before writing the image-processing spec.",
        "url": "https://patents.google.com/patent/US20210373010A1/en",
        "priority_date": "2020-06-02",
        "status": "granted as US11519909B2 (publication superseded)"
      }
    ],
    "white_space": [
      "Per-user baseline calibration applied to IMAGE-DERIVED intensity values, rather than to hormone concentrations. The Unipath/Clearblue patents that claimed personalised thresholds (US6454726B1, US6234974B1) expired in 2013 and claimed thresholds on measured E3G CONCENTRATION. Nobody appears to have granted claims on learning a per-user mapping from smartphone-image line intensity directly to a personal surge threshold \u2014 i.e. skipping the concentration step entirely and calibrating the optical signal itself against that woman's own longitudinal series. Easy Healthcare and Oova both DISCLOSE per-user trending in their specifications, which is a warning that the idea is in the art, but disclosure without a granted claim leaves room for a narrow, well-drafted Rove claim. This is Rove's strongest patentable position and should be filed promptly.",
      "Reference-free device-independent colour calibration. Every granted calibration patent found requires a physical colour reference in the frame: Cornell US9445749B2 needs a constant-colour calibration REGION on the test platform; Healthy.io US10068329B2 needs a separate COLOUR BOARD with a grey-patch grid and gamut-matched reference patch sets; MFB US12061196B2 normalises against CONTROL-LINE DEPTH; Easy Healthcare US11519909B2 normalises against the CONTROL LINE. Unclaimed: estimating the illuminant from camera RAW/EXIF metadata, from paired flash-on/flash-off frames, from a dual-exposure bracket, or from the unreacted nitrocellulose membrane treated as a white point. Any of these gives device independence with no printed reference and appears to sit outside all of the above.",
      "Calibration in CIELAB / CIEXYZ / spectral-estimation space. The granted art is concentrated in RGB (Reliant US11579145B2), HSL/HSV (Cornell US9445749B2, Oova US12591974B2) and greyscale/colour-density ratios (Easy Healthcare US11519909B2, Easy Healthcare WO2025250702A1). A properly colorimetric pipeline \u2014 sRGB to linear to XYZ with a chromatic-adaptation transform to a fixed illuminant, then Delta-E against a calibrated reference \u2014 is both a design-around and technically superior for cross-phone consistency, and appears unclaimed in this field.",
      "Semi-quantitative ORDINAL output rather than a hormone concentration. Multiple key claims recite converting the image to a hormone or analyte LEVEL (MFB US12061196B2 'calibrating to determine a hormone or analyte level'; Easy Healthcare's dependent claims mapping T/C ratio to 'quantitative hormone levels'). Classifying into ordinal bands relative to the user's own history \u2014 'baseline / rising / peak / post-peak' \u2014 without ever emitting a concentration may sit outside those steps while being clinically sufficient for LH surge detection and arguably better for regulatory positioning.",
      "Multiplexed LH + FSH on a single semi-quantitative home strip read for PERIMENOPAUSE / ovarian-reserve staging, as distinct from ovulation prediction. The granted claim density is overwhelmingly on LH/E3G/PdG for fertility and ovulation. FSH appears mainly in ovarian-reserve device claims (CA2437618C) and in Inito's unexamined disclosure of a sandwich-format LH+FSH assay. A menopause-transition staging method built on the LH:FSH ratio trajectory from smartphone-read strips looks genuinely open.",
      "Non-US territory generally, and India specifically. The blocking rights found are almost entirely US patents. MFB's European position is partial (EP3731751B1 active but EP4017375A1 NOT active). Quanovate's EP3460469A4 is NOT ACTIVE in WO, EP and US and survives only in CN. Easy Healthcare's T/C-ratio family looks US-centric, with only a design patent and a 2025 PCT beyond it. No Indian counterparts surfaced for any of the core image-processing patents. For an India-first launch the freedom-to-operate picture is dramatically more open than the US picture \u2014 but this needs a proper national-phase and Indian-register search to confirm, which I could not run with web tools alone.",
      "On-device (edge) inference rather than server-side analysis. Reliant US11579145B2 \u2014 one of the broadest image-analysis claims found \u2014 is drafted entirely as a SERVER performing the RGB normalisation and comparison. Running the full pipeline on the handset avoids it outright and is unclaimed as a distinguishing architecture in this field.",
      "Lot calibration carried out-of-band. Oova US12591974B2 recites an ORIENTATION ELEMENT on the lateral flow device encoding batch information used to normalise the control area. Carrying the lot calibration curve on the foil pouch or carton, or fetching it from a server keyed to a code that is not on the strip itself, appears to sidestep that structural limitation while achieving the same batch normalisation."
    ],
    "notes": "METHOD AND VERIFICATION STATUS. All work done via WebSearch and WebFetch only; no shell, no scripts. Every patent number reported was seen on a fetched page or a search-result page. Claim texts marked VERIFIED were read on the page; those marked INFERRED or PARTIALLY VERIFIED were not, and are flagged individually. Google Patents began returning HTTP 503 for roughly the last dozen requests, which blocked reading claim 1 of US10606051B2 (Inito), US9787815B2 (Cornell), US11029321B2 (MFB), US9857373B1 (Reliant) and US20210364512A1. Google Patents also frequently renders the description but truncates before the CLAIMS section, which is why several entries carry claim gists drawn from the abstract and summary rather than the claims. Justia, uspto.report and patentguru all returned 403 to WebFetch; FreePatentsOnline worked once then dropped the connection. One useful technique that did work and is worth reusing: the Google Patents JSON search endpoint at https://patents.google.com/xhr/query?url=assignee%3D%22NAME%22 returns full assignee portfolios and was how the MFB, Easy Healthcare, Quanovate, Inito and SPD portfolios were enumerated.\n\nDIRECT ANSWERS TO ROVE'S FOUR CRITICAL QUESTIONS.\n\n(1) IS SMARTPHONE-CAMERA COLORIMETRIC STRIP QUANTIFICATION ALREADY CLAIMED, AND HOW BROADLY? Yes, and very broadly, by at least four independent parties with overlapping claims. The worst is Easy Healthcare US11519909B2 / US12287293B2: claim 1 is nothing more than a strip with a test line and a control line, plus a camera device that computes a colour-density value for each line and takes their ratio. That is close to the minimum description of what Rove intends to build, it is analyte-agnostic, and it runs to 2041. Layered on top: MFB US12061196B2 (photographed test, horizontal colour-value vector sweep, control-line-depth normalisation for lighting, calibration to a hormone level \u2014 to 2042), Reliant US11579145B2 (mobile image, RGB normalisation, alignment target on the device, server-side comparison \u2014 to 2037), and Oova US12591974B2 (HSV/lightness pixel intensities, on-strip orientation element for batch normalisation \u2014 to 2040). The practical conclusion is that the naive implementation is unavoidably inside someone's claims, but the four patents block by DIFFERENT mechanisms \u2014 T/C ratio, 1-D colour vector plus control-line depth, alignment target plus server, HSV plus orientation element \u2014 and no single design choice is required by all four. A pipeline that (a) runs on-device, (b) normalises against an absolute reference rather than the control line, (c) works in CIELAB rather than HSV or raw RGB, (d) locates lines by 2-D segmentation rather than a 1-D horizontal sweep, and (e) outputs ordinal bands rather than a hormone level threads all four. Get a formal FTO opinion before launch regardless; this is a genuinely crowded field, not a paper thicket.\n\n(2) DEVICE-INDEPENDENT COLOUR CALIBRATION USING AN ON-STRIP REFERENCE \u2014 IS IT CLAIMED? Yes, and this is the most heavily and most specifically claimed sub-area, but the claims are structurally narrow and readily avoided. Cornell US9445749B2 (to 2034) claims a constant-colour calibration region on the test platform imaged alongside the test region, median RGBA converted to HSL/HSV, and a hue-based calibration curve \u2014 expressly for calibrating away smartphone-to-smartphone camera and lighting differences. Healthy.io US10068329B2 (to 2034) claims a colour board with a grid of grey patches plus multiple sets of reference colour patches, each set gamut-matched to a respective reagent, used to derive LOCAL illumination parameters. Both are loaded with specific requirements. For a single-colour gold-nanoparticle LH/FSH strip, Healthy.io's per-reagent gamut-matched patch SETS are essentially impossible to infringe accidentally, and a plain greyscale reference ladder printed on the housing plus a global (not local) illuminant estimate in CIELAB clears both. The stronger recommendation is to go reference-free \u2014 illuminant estimation from camera metadata, flash-differencing, or the blank membrane as white point \u2014 which appears entirely unclaimed and is the single largest patentable opening identified.\n\n(3) IS PdG-BASED OVULATION CONFIRMATION LOCKED UP BY MFB FERTILITY? In the United States, substantially yes. MFB holds the chemistry (US11573225B2: anti-PdG antibody isotypes, 8\u201332 hapten molecules per carrier protein, 3\u201320 \u00b5g/mL threshold \u2014 the parameters any working consumer PdG strip needs), the multi-day protocol (US11029321B2, and apparently the paired system patent numbered 11061026 which I saw referenced but did not read), the multi-analyte cassette combining PdG with a second hormone (US12282029B2, to 2040), and the image-reading method (US12061196B2, to 2042). MFB has also demonstrated willingness to litigate: MFB Fertility Inc. v. Easy Healthcare Corporation, N.D. Ill. 1:20-cv-07833, arising from a confidentiality and non-competition relationship that broke down, with the court compelling arbitration in part. A new US entrant into PdG should assume conflict. The important qualification for Rove is that this barely matters given the current plan \u2014 Rove is LH/FSH, and none of the PdG chemistry or protocol claims reach that. The rule to hold to is: do not add a PdG line to the strip, and do not ship a 'confirm ovulation by repeated progesterone-metabolite testing' feature in the US. Also note MFB's coverage outside the US is materially weaker (EP3731751B1 active, EP4017375A1 not active), so the PdG lock is a US phenomenon, not a global one.\n\n(4) EXPIRIES \u2014 WHICH OLD STRIP-READING PATENTS HAVE LAPSED? Several, and one of them is a genuine gift. US6454726B1 and US6234974B1 (Unipath/Unilever, Clearblue and Persona lineage) both EXPIRED IN AUGUST 2013 and claimed exactly what Rove describes as its differentiator: determining a hormone threshold for an individual woman from measurements taken in her own previous cycles. Per-user baseline calibration for urinary fertility hormones is therefore in the public domain, freely practicable by Rove, AND is strong invalidity art against anyone who later asserts a personalised-threshold claim. Both should be cited in Rove's FTO opinion and in any pre-issuance submission against the pending Inito founders' application. Also expired: US7632460B2 (Alere/Unipath strip-plus-reader kit, expired 2018-05-24) and SPD's US20150094227A1 pregnancy-test publication (expired, fee related). Still live but structurally irrelevant to a camera-only approach: Alverix US10295472B2 (hardware reader, to 2031), which requires a reader body that physically receives the strip.\n\nTWO CHEAP DEFENSIVE ACTIONS WORTH TAKING NOW. First, file a third-party pre-issuance submission (37 CFR 1.290) against US20240053362A1, the US member of the Inito founders' family. Its claim 1 as filed would cover any method that takes a urinary hormone level or rate of change, maps it to a cycle phase, and predicts a health condition \u2014 which is Rove's entire product. Citing US6454726B1, US6234974B1 and the published Mira and Proov validation literature costs very little and would likely force a drastic narrowing. Second, order the file wrappers for the Easy Healthcare family (US 16/890,443 leading to US11519909B2, and the continuations). Because two patents have issued and more continuations were pending, the prosecution history is the cheapest reliable map of what Easy Healthcare gave up to get allowance, and therefore the most reliable basis for a design-around.\n\nONE UNRESOLVED LEAD WORTH CHASING. WO2021092595A1 ('Improvements of lateral flow assay and vertical flow assay') surfaced in search as claiming reference marks on a sample holder or adaptor used to calibrate the optical system \u2014 light spectrum, image scale, image distortion and image colour uniformity. That is squarely on Rove's calibration question but I was unable to fetch it before Google Patents began rate-limiting, so its assignee, status and claim scope are unknown. It should be the first item in the next research pass, along with reading claim 1 of US9787815B2, US11029321B2 and US10606051B2, all of which remain unread."
  },
  {
    "patents": [
      {
        "number": "US10779802B2",
        "assignee": "Ava AG (now assigned to Femtec Health, Inc. via Ava Woman LLC / Ava Sciences-Fmtc LLC)",
        "title": "System and method for determining the fertility phase of a female",
        "priority_date": "2015-02-16",
        "status": "granted \u2014 active (reinstated after lapse); anticipated expiry 2036-11-21",
        "independent_claim_gist": "VERIFIED. Claim 1 is an ELECTRONIC SYSTEM = (a) a wearable device with a first sensor system worn in skin contact that determines heart rate AND heart rate variability, plus (b) a processor that determines a change in pulse across the menstrual cycle and sets the fertility phase from the TIME of that pulse change \u2014 start = transition from shorter to longer inter-beat interval, end = transition from longer to shorter. Claim 12 is the mirror method claim. Both recite that upper/lower thresholds TPup/TPlow are 'determined individually for the female user by the processor'. This is the single closest live claim to 'multi-signal fusion with per-user learned parameters' \u2014 but the personalisation is a per-user THRESHOLD, not a learned prior, and the whole claim is anchored to a skin-contact HR/HRV wearable.",
        "blocks_what": "Selling a wrist/skin wearable that derives the fertile window from HR + HRV inter-beat-interval transitions with user-specific thresholds. Blocks the Ava bracelet architecture specifically.",
        "designed_around_how": "Do not require a skin-contact HR/HRV sensor as a claim element. An app that fuses self-reported cycle dates, BBT from an ordinary thermometer, LH/PdG strip readings and symptoms does not read on claim 1 (no 'first sensor system... determine heart rate and heart rate variability'). Also avoid deriving the fertile window from the TIMING OF A PULSE CHANGE \u2014 infer it from a posterior over ovulation day instead. Note this patent is in a distressed-asset chain (Femtec Health wound down), so watch for assertion by an acquirer.",
        "url": "https://patents.google.com/patent/US10779802B2/en"
      },
      {
        "number": "US20220313223A1",
        "assignee": "Oura Health Oy",
        "title": "Anovulatory cycle detection from wearable-based physiological data",
        "priority_date": "2021-04-01",
        "status": "pending (US); family: WO2022212739A1, JP2023560351A, AU2022246657A1, CA3215585A1",
        "independent_claim_gist": "VERIFIED (claim read, rendered as close paraphrase \u2014 Google Patents truncated exact text). Claim 1: receive physiological data INCLUDING TEMPERATURE from a wearable device worn by the user over a plurality of days; determine a temperature time series; identify morphological features of that time series (positive slopes, temperature deviations); identify an anovulatory cycle based on those morphological features; generate a notification to the user indicating the anovulatory cycle. Scope is narrow-ish: it is a temperature-morphology classifier, not anovulation detection in general.",
        "blocks_what": "Detecting anovulatory cycles by shape-analysis of a continuous temperature curve captured by a wearable, and telling the user about it. Directly targets Oura/Apple Watch/\u014cura-class ring competitors.",
        "designed_around_how": "Two clean exits. (1) Do not use wearable-derived continuous temperature as a required input \u2014 detect anovulation from cycle-length variance, absent LH surge, absent PdG rise, and symptom pattern. (2) Do not classify from 'morphological features' of a temperature time series \u2014 use a probabilistic model over hormone/event observations. Also note this is still only a pending application; the eventual granted claims may narrow further.",
        "url": "https://patents.google.com/patent/US20220313223A1/en"
      },
      {
        "number": "US20240071624A1",
        "assignee": "Oura Health Oy",
        "title": "Techniques for identifying polycystic ovary syndrome and endometriosis from wearable-based physiological data",
        "priority_date": "2022-08-24",
        "status": "pending; appears to be US-only (no PCT located)",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 bibliographic data and abstract read on the Google Patents page; the CLAIMS SECTION COULD NOT BE RETRIEVED (page exceeds fetch limit; Justia/Espacenet/PatentGuru mirrors returned 403). From the abstract and specification: the system identifies irregular menstrual cycles, PCOS and endometriosis by comparing a user's wearable measurements against BOTH a personal baseline AND population benchmarks, and computing a risk metric; the spec recites a 'binary classifier' for PCOS risk. Signals recited: continuous/nighttime temperature, HR, HRV, respiratory rate, sleep architecture, SpO2, galvanic skin response, actigraphy. PCOS and endometriosis are handled jointly via deviation analysis rather than as separate independent claims.",
        "blocks_what": "This is THE most directly competitive filing to a PCOS-screening product. If it grants broadly it would block: computing a PCOS risk score by comparing a user's physiological signals against her own baseline and a population reference. The wearable-data limitation is the key question \u2014 treat the exact granted scope as an OPEN RISK until the claims can be read.",
        "designed_around_how": "Keep the risk score off wearable-sensor inputs: build it from self-reported cycle history (length, variance, oligomenorrhoea), at-home LH/PdG strip results, and androgenic-symptom self-report. Avoid the 'personal baseline vs population benchmark deviation' framing if the granted claims lock onto it \u2014 use a calibrated posterior probability from a generative cycle model instead. ACTION: pull the file wrapper and granted claims before freezing Rove's PCOS architecture.",
        "url": "https://patents.google.com/patent/US20240071624A1/en"
      },
      {
        "number": "US20230221335A1",
        "assignee": "Roche Diagnostics Operations, Inc.",
        "title": "A method of assessing a female's risk of having PCOS as well as products and uses relating thereto",
        "priority_date": "2020-03-31",
        "status": "pending (US); CN115398238A in family (Roche Holding AG)",
        "independent_claim_gist": "VERIFIED. Claim 1: a COMPUTER-IMPLEMENTED method of assessing PCOS risk = (a) provide a data set containing an OA-value reflecting menstrual cycle irregularity (oligo-anovulation), an HA-value reflecting androgen status (hyperandrogenism), and an AMH-value reflecting anti-M\u00fcllerian hormone concentration, optionally plus AGE and WEIGHT; (b) combine those values into ONE COMBINED VALUE by mathematical operations with optional weighting factors; (c) compare the combined value to a reference population; (d) indicate the risk. Machine learning is NOT claimed (spec uses weighted logistic regression). LH and FSH are NOT recited \u2014 the recited biomarkers are AMH, testosterone (total/free) and SHBG.",
        "blocks_what": "Blocks a PCOS risk score whose required inputs are cycle-irregularity + androgen status + a measured AMH concentration, combined into a single weighted score and compared to a population reference. This is essentially a digitised Rotterdam-minus-ultrasound score gated on a lab AMH assay.",
        "designed_around_how": "THE AMH ELEMENT IS THE ESCAPE HATCH. Claim 1 requires an AMH-value in the data set. A screening score built from cycle irregularity + self-reported androgenic signs + at-home LH/PdG dynamics, with NO AMH measurement, does not read on it. Second exit: do not reduce to 'one combined value compared to a reference population' \u2014 output a calibrated probability from a per-user model. Third: LH/FSH-ratio-based screening is explicitly outside Roche's recited biomarker set.",
        "url": "https://patents.google.com/patent/US20230221335A1/en"
      },
      {
        "number": "US12558022B2",
        "assignee": "Oura Health Oy",
        "title": "Menstrual cycle tracking",
        "priority_date": "2021-03-12",
        "status": "granted \u2014 active; anticipated expiry 2044-05-09",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 bibliographic data and specification read; the claims section was truncated on the Google Patents page and the USPTO PDF is scanned images. From the abstract and description, the invention: receives physiological data including temperature over multiple days from a wearable; determines a temperature time series spanning multiple cycles; identifies morphological features (negative slopes, positive slopes, maxima/minima); identifies menstrual cycle PHASES from those features; and displays them in a GUI. The spec (not necessarily the claims) recites 'tailored, individualized circadian rhythm adjustment models which are specific to each respective user' and an ML classifier for sleep staging.",
        "blocks_what": "Granted and long-lived (2044). Covers phase identification by morphological analysis of a wearable-derived continuous temperature series with per-user circadian adjustment. The anchor patent of Oura's cycle portfolio.",
        "designed_around_how": "Same escape as the anovulation filing: no wearable continuous-temperature series as a required input, and do not identify phases by slope/extremum morphology. A once-daily BBT reading plus hormone strips plus self-report, processed through a state-space model, is a different mechanism. VERIFY THE EXACT CLAIMS before relying on this \u2014 the wearable limitation is inferred from the description, not read from claim 1.",
        "url": "https://patents.google.com/patent/US12558022B2/en"
      },
      {
        "number": "US12551197B2",
        "assignee": "Oura Health Oy",
        "title": "Techniques for predicting menstrual cycle onset",
        "priority_date": "2021-08-31",
        "status": "granted \u2014 active",
        "independent_claim_gist": "PARTIALLY VERIFIED \u2014 assignee, inventors, priority and status read from the page; claims section truncated. Specification recites: fitting received temperature data to a TRIGONOMETRIC OR POLYNOMIAL FUNCTION; computing durations between identified temperature features and the cycle onset day; machine-learning classifiers for identifying cycle onset; classifiers TRAINED ON USER INPUT; per-user baseline physiological data and circadian rhythm adjustment models. Whether the per-user training and ML are in the independent claims is UNCONFIRMED.",
        "blocks_what": "If the ML-trained-on-user-input language made it into the claims, this is the closest granted art to 'a model that learns per user'. Even on the narrower reading, it covers predicting period onset by curve-fitting a wearable temperature series.",
        "designed_around_how": "Avoid trigonometric/polynomial curve-fitting of a temperature series as the prediction mechanism. Avoid framing the product as predicting CYCLE ONSET from temperature features. Rove's differentiation should be that the learned object is a per-user posterior over OVULATION TIMING and ovulatory status, driven by hormone-test evidence, not a temperature-curve fit. HIGH PRIORITY: obtain the granted claims.",
        "url": "https://patents.google.com/patent/US12551197B2/en"
      },
      {
        "number": "EP4312797A1",
        "assignee": "Oura Health Oy",
        "title": "Fertility prediction from wearable-based physiological data",
        "priority_date": "2021-04-01",
        "status": "pending (EP); PCT WO2022212741A1",
        "independent_claim_gist": "VERIFIED (structure read; exact wording not fully rendered). Claim 1: receive physiological data including temperature from a wearable; determine a temperature time series across multiple days; calculate menstrual cycle length parameters \u2014 average cycle length, standard deviation, phase lengths, cycle range, AND COUNT OF ANOVULATORY CYCLES; generate a fertility prediction from those parameters. Further independent claims cover the system, apparatus and computer-implemented variants. The description recites ML classifiers, personalised cycling patterns, per-user circadian adjustment, and 'probability of becoming pregnant within the time interval'.",
        "blocks_what": "Notable because it treats ANOVULATORY CYCLE COUNT as an input feature to a fertility prediction \u2014 i.e. Oura has already staked the 'use anovulation history to predict conception odds' idea in Europe.",
        "designed_around_how": "The claim is again gated on wearable temperature. A fertility/conception-odds estimate driven by hormone-strip evidence and cycle self-report, with anovulatory status inferred from absent LH surge / absent PdG rise rather than from a temperature series, sits outside it.",
        "url": "https://patents.google.com/patent/EP4312797A1/en"
      },
      {
        "number": "US20200000441A1 (granted as US10765409B2; continuation US11889994B2)",
        "assignee": "Fitbit LLC",
        "title": "Menstrual cycle tracking",
        "priority_date": "2018-06-28",
        "status": "granted \u2014 active; anticipated expiry 2039-06-14",
        "independent_claim_gist": "VERIFIED at publication (claims read on the A1 page; the granted B2 claim text could not be re-fetched before Google Patents began rate-limiting, so treat the grant scope as slightly uncertain). Published claim 1: obtain historical menstrual cycle information for a user; predict event dates for an upcoming cycle; monitor heart rate data; analyse patterns in heart-rate variation correlated with cycle events; USE THE DETERMINED PATTERNS TO UPDATE PREDICTIONS for upcoming cycle events based on current heart-rate readings. Claim 10: a device with optical and motion sensors that collects metrics, filters noise, correlates metric patterns with cycle-event timing, predicts future timing, and exposes predictions to the user.",
        "blocks_what": "This is the broadest-sounding 'adaptive per-user cycle model' claim in the set: history \u2192 prediction \u2192 observe physiology \u2192 UPDATE the prediction. That closed loop is exactly the shape of a Bayesian updating architecture. Its saving grace for Rove is that the loop is driven by HEART RATE from an optical wearable sensor.",
        "designed_around_how": "Keep heart rate out of the required inputs. If Rove ever ingests Fitbit/Apple Watch/Oura HR to refine predictions, this claim becomes a live read. Safer architecture: treat wearable HR as an optional, non-claimed convenience input and make the core loop hormone-test + self-report driven. Also note the grant is 2039 and Google (Fitbit) is a well-resourced holder.",
        "url": "https://patents.google.com/patent/US20200000441A1/en"
      },
      {
        "number": "US20220387003A1",
        "assignee": "Apple Inc.",
        "title": "Menstrual cycle tracking and prediction",
        "priority_date": "2021-06-06",
        "status": "pending",
        "independent_claim_gist": "VERIFIED. Claim 1: a WEARABLE DEVICE comprising a calendar module; a heart rate sensor; a preprocessing module that receives an initial period estimate from the calendar plus heart rate data and produces a processed data set; an OVULATION ESTIMATOR that uses the processed data set to estimate a fertility window; and a PERIOD ESTIMATOR that uses the processed data set plus the ovulation estimator's output to estimate a period date. The spec covers comparing prediction accuracy against user-logged data and feeding that back to refine future predictions.",
        "blocks_what": "An apparatus claim to the two-stage estimator pipeline (ovulation estimator feeding a period estimator) inside a wearable with a HR sensor. Narrow as drafted \u2014 it is a device-architecture claim, not a method claim on the maths.",
        "designed_around_how": "Rove is software, not a wearable device with an integrated HR sensor, so claim 1 as published is not readable against a phone app. Watch for method-claim continuations. Also avoid literally structuring the codebase as 'preprocessing module \u2192 ovulation estimator \u2192 period estimator' with HR as the driving input, in case a continuation broadens.",
        "url": "https://patents.google.com/patent/US20220387003A1/en"
      },
      {
        "number": "US9155523B2",
        "assignee": "Fertility Focus Limited (now Vio HealthTech Ltd) \u2014 OvuSense",
        "title": "Method of detecting and predicting ovulation and the period of fertility",
        "priority_date": "2006-09-05",
        "status": "granted \u2014 active; anticipated expiry 2027-09-05 (expires in ~1 year)",
        "independent_claim_gist": "VERIFIED. Claim 1: (i) take MULTIPLE temperature readings during an extended period; (ii) identify and DISREGARD readings with characteristics of faulty or irrelevant data; (iii) obtain one or several representative temperature values for that extended period; (iv) repeat over multiple extended periods AND MULTIPLE OVULATORY CYCLES; (v) analyse the representative values across those periods and cycles for patterns indicative or predictive of ovulation, and provide fertility information to a user. Anovulation and PCOS are NOT recited in the claims.",
        "blocks_what": "Surprisingly broad for a temperature method: any multi-reading-per-day, artefact-filtered, multi-cycle temperature-pattern ovulation predictor. Would read on a BBT-heavy app that samples more than once a day.",
        "designed_around_how": "Expires September 2027 \u2014 by Rove's likely scale date this is close to dead, and any pre-expiry exposure is limited to the 2006 filing's jurisdictions. To avoid it entirely: single daily BBT reading (not 'multiple temperature readings during an extended period'), and do not make the artefact-rejection + representative-value + multi-cycle-pattern pipeline the mechanism. Note Vio HealthTech markets OvuSense explicitly for PCOS/irregular cycles even though PCOS is unclaimed \u2014 commercial overlap without patent coverage.",
        "url": "https://patents.google.com/patent/US9155523B2/en"
      },
      {
        "number": "US20150112706A1 (and continuation US20230245781A1)",
        "assignee": "Ovuline, Inc. (Ovia Health)",
        "title": "System and Methods for Personal Health Analytics",
        "priority_date": "2013-10-17",
        "status": "ABANDONED (both the 2013 parent and the 2023 continuation); no granted US patent in the family",
        "independent_claim_gist": "VERIFIED. Claim 1 as filed: acquire a plurality of personal datasets through personal electronic devices; SELECT A COMMUNITY DATASET from that plurality; GENERATE A STATISTICAL MODEL of a health event from the selected community dataset; estimate a likelihood of a personal health attribute using that model; and predict a date of ovulation and a fertility window. The spec describes generating a 'personalized statistical model' per participant. Bayesian methods are not named.",
        "blocks_what": "NOTHING \u2014 abandoned. This matters enormously for Rove: the single closest prior attempt to claim 'build a population statistical model from community data, then personalise it to predict ovulation' was ABANDONED without grant. Ovia Health, one of the largest players, has no enforceable algorithm patent.",
        "designed_around_how": "No design-around needed. Treat it instead as PRIOR ART \u2014 it is published (2015) and therefore anticipates/obviates later attempts by others to claim population-model-plus-personalisation for ovulation prediction. This is defensive ammunition for Rove, not a threat.",
        "url": "https://patents.google.com/patent/US20150112706A1/en"
      },
      {
        "number": "WO2022123600A1 (US 18/266,250 pending; IN 202317046017; GB2617503A)",
        "assignee": "Inito \u2014 inventors Varun Akur Venkatesan, Siddharth Pattnaik, Dipankar Das (Bengaluru); recorded on the PCT as 'Individual'",
        "title": "Dynamic monitoring of E3G, LH, PdG, FSH levels in female subjects to predict health conditions",
        "priority_date": "2020-12-08 (Indian priority; PCT/IN2021/051149)",
        "status": "WO ceased; US national phase pending; INDIAN national phase entered 2023-07-08 (202317046017); EP did not enter national phase",
        "independent_claim_gist": "VERIFIED. Claim 1: determine concentrations or levels, AND/OR RATE OF CHANGE in concentration or levels, of analytes selected from E3G, LH, PdG, FSH and hCG; MAP the concentration of at least one analyte with respect to A PHASE OF THE CYCLE; and predict a health condition of the female subject. PCOS and anovulation are not explicitly claimed; adaptive test timing is not claimed (the spec mentions timing IVF stimulation). Note: this is a hormone-measurement-to-condition claim, NOT a scheduling or Bayesian-inference claim.",
        "blocks_what": "THE MOST IMPORTANT INDIAN FILING IN THIS SPACE. If granted in India, it covers mapping multi-analyte urinary hormone levels (or their rate of change) onto cycle phase to predict a health condition. Because 'health condition' is unqualified, an Indian grant could reach a PCOS or anovulation output derived from LH/E3G/PdG strip data. Inito publicly claims 20+ patents and holds ~40M hormone-test datapoints.",
        "designed_around_how": "If Rove reads hormone strips, this is the filing to clear first in India. Options: (a) do not derive the output from analyte CONCENTRATION or RATE OF CHANGE mapped to cycle phase \u2014 derive it from the TIMING/PRESENCE of events (surge detected / no surge detected) fed to a temporal model; (b) source the hormone reading from a third-party device and claim only the inference layer; (c) prosecute Rove's own Indian claims to the Bayesian-fusion and test-scheduling layer, which Inito has not claimed. WATCH the Indian prosecution \u2014 the WO already ceased and EP was abandoned, which suggests limited budget or examiner pushback.",
        "url": "https://patents.google.com/patent/WO2022123600A1/en"
      },
      {
        "number": "US11521401B2",
        "assignee": "Bridging Biosciences LLC (inventor Tapley Holland)",
        "title": "Fertility window prediction using a convolutional neural network (CNN) and other learning methods",
        "priority_date": "2020-07-31",
        "status": "granted \u2014 active; anticipated expiry 2040-07-31",
        "independent_claim_gist": "VERIFIED. Despite the alarming title, claim 1 is tightly device- and assay-bound: a housing with a slide holder, light source and camera; a slide with first and second reservoirs; a first sample of cervical mucus mixed with saline at \u22651:50; a second dried cervical mucus sample for ferning; capturing images; analysing them to determine whether WHITE BLOOD CELLS are present and to identify FERNING PATTERNS. Claims 6 and 9 add a 'visual learning algorithm'. CNN/deep learning appear as the analysis technique for images only.",
        "blocks_what": "Only imaging-based ferning/WBC fertility readers. It does NOT block ML fertility prediction generally \u2014 a good illustration that scary patent TITLES in this space are not matched by claim scope.",
        "designed_around_how": "Irrelevant to a non-imaging app. Cite it as evidence that the 'ML fertility prediction' territory is claimed only in narrow, apparatus-bound slices.",
        "url": "https://patents.google.com/patent/US11521401B2/en"
      },
      {
        "number": "US20160174946A1 (family: WO2015061471A1, EP2568884A4, USD728389S1)",
        "assignee": "Kindara, Inc.",
        "title": "System for tracking female fertility",
        "priority_date": "2010-05-07",
        "status": "ABANDONED",
        "independent_claim_gist": "VERIFIED. Claim 1: receive fertility data comprising a temperature and at least a CERVICAL FLUID CONSISTENCY, and SUPERIMPOSE AT LEAST TWO TWO-DIMENSIONAL COORDINATE SYSTEMS IN A SINGLE GRAPH of a GUI. Other independents cover a Bluetooth thermometer apparatus, a client-server charting system, and data-sharing permissions. This is a charting/UI claim, not an algorithm claim.",
        "blocks_what": "Nothing (abandoned). Even if live, it would only have covered the dual-axis charting UI.",
        "designed_around_how": "No action needed. Useful as prior art against any later attempt to claim BBT+cervical-fluid dual-axis charting.",
        "url": "https://patents.google.com/patent/US20160174946A1/en"
      },
      {
        "number": "US9568463B2",
        "assignee": "HiLin Life Products Inc.",
        "title": "Ovulation prediction device",
        "priority_date": "2013-03-14",
        "status": "EXPIRED \u2014 fee-related lapse, 2025-03-24",
        "independent_claim_gist": "VERIFIED. Claim 1: a standalone electronic device (housing, display, user controls, data transfer port, sample receptacle; internal optics unit, microprocessor, light source, heating/drying unit, autofocus, CCD array) that images crystal (ferning) formation in a mucus sample and saves/downloads the digital image. Pure apparatus claim.",
        "blocks_what": "Nothing \u2014 lapsed for non-payment in March 2025.",
        "designed_around_how": "N/A. Included because it is the patent most often surfaced by naive searches for 'Natural Cycles ovulation prediction patent' \u2014 it is unrelated to Natural Cycles.",
        "url": "https://patents.google.com/patent/US9568463B2/en"
      },
      {
        "number": "WO2007049157A2 (US20100312137A1; granted AU2006307604B2)",
        "assignee": "Manawatu Biotech Investments Ltd (inventors Robert Gilmour, Leonard F. Blackwell)",
        "title": "Ovulation cycle monitoring and management",
        "priority_date": "2005-10-24",
        "status": "WO ceased; AU granted; US application published, no US grant located",
        "independent_claim_gist": "VERIFIED. Claim 1: obtain a body fluid sample; contact it with a capture element having a first binding agent for an ESTROGEN METABOLITE and a second for a PROGESTERONE METABOLITE; quantify the EXCRETION RATES of both; determine ovulation cycle status from the RELATIVE EXCRETION RATES. The description covers instructing the user when to test based on detected metabolite rises, and identifying absence of ovulation from absent metabolite patterns \u2014 but neither is in claim 1.",
        "blocks_what": "Little, in practice \u2014 mostly ceased. Its real value is as PRIOR ART: it publicly disclosed (2007) both adaptive test prompting and anovulation inference from E3G/PdG excretion, which limits how broadly a later filer could claim either.",
        "designed_around_how": "N/A. Use defensively \u2014 it is the cleanest published disclosure of 'tell the user when to test next based on hormone metabolite trend', which is helpful if a competitor later tries to claim that idea against Rove.",
        "url": "https://patents.google.com/patent/WO2007049157A2/en"
      },
      {
        "number": "US20240215904A1",
        "assignee": "University of Cincinnati (inventor Jason Heikenfeld)",
        "title": "Ovulation Monitoring Platform",
        "priority_date": "2021-08-23",
        "status": "pending",
        "independent_claim_gist": "VERIFIED. Claim 1: a device for measuring analytes in interstitial fluid and/or blood comprising at least one ELECTROCHEMICAL APTAMER-BASED (EAB) SENSOR with redox couples, measuring progesterone, LH, estrogen, FSH or their metabolites, plus means to establish fluid communication with the sample (microneedle access). No machine learning, no adaptive test timing, no PCOS/anovulation.",
        "blocks_what": "Only continuous minimally-invasive hormone biosensing hardware.",
        "designed_around_how": "N/A for a software product. Relevant only if Rove later builds its own sensing hardware.",
        "url": "https://patents.google.com/patent/US20240215904A1/en"
      },
      {
        "number": "DE102013101751B4",
        "assignee": "Biowink GmbH (Clue)",
        "title": "Device and method for determining and outputting state information and/or the value of a physical quantity",
        "priority_date": "2013-02-21",
        "status": "granted (DE) \u2014 status not independently confirmed",
        "independent_claim_gist": "NOT VERIFIED \u2014 this record was seen only in a Google Patents assignee-search result, not on the patent page itself; claims were not read. It is, however, the ONLY patent record returned for assignee 'Biowink' in the entire Google Patents corpus, and the title indicates a hardware/display device rather than a cycle-prediction algorithm. Clue/Biowink therefore appears to have NO cycle-prediction algorithm patent anywhere.",
        "blocks_what": "Almost certainly nothing relevant to Rove. Clue built one of the best-known generative cycle-length models (published on arXiv) and evidently did not patent it.",
        "designed_around_how": "N/A. Clue's published generative cycle-length model is free prior art that Rove can build on, and that also blocks others from claiming it.",
        "url": "https://patents.google.com/patent/DE102013101751B4/en"
      },
      {
        "number": "US10828015B2 (family incl. US8715204B2, US8930147B2, EP3820356A1, US11253234)",
        "assignee": "Prima-Temp, Inc.",
        "title": "Vaginal temperature sensing apparatus and methods",
        "priority_date": "2018-07-12 (EP3820356A1 family); earlier probe patents from 2010",
        "status": "granted \u2014 status not independently confirmed",
        "independent_claim_gist": "NOT FULLY VERIFIED \u2014 seen in Google Patents search results with quoted specification text; the claims page was not successfully fetched. Quoted spec: an 'automatic data transform recalculator' transforms and recalculates diurnal high body temperatures, uses temperature DIPS to predict an ovulation event, and signals via a 'zenith based ovulation indicator'; the spec additionally contemplates 'neural network based artificial intelligence to automatically self-improve by using historical or even other, MULTI USER data and user input'. The recited claim elements visible are device-bound (battery power-on indicator, user-initiated activation, auto-terminating timer).",
        "blocks_what": "On the visible language, an intravaginal continuous-temperature sensor with an ovulation-indicator readout. The multi-user self-improving-AI language sits in the SPECIFICATION, which means it is prior art against others but is not itself an enforceable claim unless it also appears in the claims.",
        "designed_around_how": "No intravaginal sensor in Rove's stack = no read. Worth a proper claims review only if Rove ever ships a continuous internal temperature sensor. Independently valuable as PRIOR ART for 'self-improving model trained on multi-user historical data' in the fertility context, disclosed as of 2018.",
        "url": "https://patents.google.com/patent/US10828015B2/en"
      }
    ],
    "white_space": [
      "ANOVULATION DETECTION WITHOUT A WEARABLE. Every live claim to anovulatory-cycle detection (Oura US20220313223A1, and the anovulatory-count feature in EP4312797A1) requires continuous temperature from a wearable device and classifies from temperature-curve MORPHOLOGY. Detecting anovulation from cycle-length distribution, absent LH surge, absent PdG rise, and symptom self-report \u2014 with no wearable and no temperature time series \u2014 appears entirely unclaimed. This is the single cleanest opening found.",
      "PCOS RISK SCORING THAT DOES NOT REQUIRE AN AMH ASSAY. Roche's US20230221335A1 claim 1 mandates an AMH-value as a required element of the data set. A screening score built from cycle irregularity + at-home LH/PdG dynamics + self-reported androgenic signs (acne, hirsutism, hair loss), with no lab biomarker, sits outside that claim. Roche also does not recite LH or FSH, leaving LH/FSH-ratio-based screening unclaimed by the one serious PCOS-score filer.",
      "EXPLICIT BAYESIAN INFERENCE WITH HIERARCHICAL PER-USER PRIORS. No claim was found anywhere reciting Bayesian updating, posterior distributions, hierarchical/partial-pooling priors, or shrinkage of a population prior toward a per-user posterior, in the fertility context. The closest live claim (Ava US10779802B2) recites only per-user THRESHOLDS; the closest conceptual claim (Ovia US20150112706A1: community statistical model + personalisation) was ABANDONED. The specific machinery of 'population prior updated per user as evidence accrues' is open \u2014 and, importantly, is patentable-over-the-art rather than merely free to practise.",
      "MULTI-SIGNAL FUSION WHERE NO SINGLE SIGNAL IS MANDATORY. Every blocking claim in this landscape is anchored to one required sensor: HR+HRV (Ava), HR (Fitbit, Apple), continuous wearable temperature (all Oura), intravaginal temperature (Prima-Temp), multi-reading BBT (Fertility Focus), a urine analyte concentration (Inito), or an image (Bridging Biosciences, HiLin). A fusion engine whose claims recite an ARBITRARY SET of heterogeneous evidence sources with sensor-agnostic likelihood functions \u2014 degrading gracefully when any one is missing \u2014 has no counterpart in the claimed art.",
      "ADAPTIVE TEST TIMING AS A CLOSED LOOP. Telling a user WHEN to take her next LH/PdG test based on the current posterior over ovulation timing, and then updating that posterior from the result, is not claimed by anyone found. Inito's claim 1 is analyte-concentration-to-cycle-phase-to-condition, with no scheduling step. Manawatu (WO2007049157A2) disclosed test prompting in its 2007 description but never claimed it \u2014 so it is prior art against a broad claim, yet a specific closed-loop scheduler that minimises expected tests or maximises expected information gain looks both free and claimable.",
      "LONGITUDINAL TRANSITION DETECTION. All the anovulation art classifies a SINGLE cycle as ovulatory or not. Detecting a user's transition INTO or OUT OF a chronically anovulatory state across many cycles \u2014 a change-point over the cycle-parameter trajectory, which is what actually matters clinically for PCOS and for treatment response \u2014 is unclaimed.",
      "CALIBRATED UNCERTAINTY AND ABSTENTION. No claim found surfaces a calibrated confidence interval or probability to the user, or has the system ABSTAIN from a prediction when the posterior is too diffuse. Given that this is the core safety/regulatory story for a cycle app, and given Natural Cycles' entire moat is regulatory rather than patent, claims covering calibrated-uncertainty presentation and abstention logic are both open and strategically valuable.",
      "POPULATION-SPECIFIC PRIORS. Nothing found claims conditioning a cycle model's priors on population/ethnicity/geography-specific cycle statistics. Given documented differences in cycle characteristics and PCOS prevalence and presentation in South Asian populations, priors calibrated on an Indian cohort is a genuinely open and defensible claim area \u2014 with the added advantage that no incumbent holds Indian-cohort data at scale.",
      "THE ENTIRE 'APP-ONLY ALGORITHM' LAYER IN INDIA. Beyond Inito's hormone-reader family, no Indian-origin algorithmic cycle/PCOS filings were located. India also excludes pure algorithms and business methods per se under s.3(k), so Indian claims must be framed as a technical system producing a technical effect \u2014 but that framing is available and essentially unoccupied."
    ],
    "notes": "METHOD AND LIMITS. All work done via WebSearch and WebFetch against Google Patents pages (plus the Google Patents /xhr/query JSON endpoint for assignee and full-text searching, until it began returning HTTP 503). Every patent number reported was seen on a Google Patents page or in Google Patents search output; each entry is tagged VERIFIED, PARTIALLY VERIFIED or NOT VERIFIED in its claim gist.\n\nVERIFICATION GAPS YOU SHOULD CLOSE. Google Patents truncates very long pages before the claims section, and Justia, Espacenet and PatentGuru all returned 403. As a result I could NOT read the exact independent claims of four documents that matter: Oura's PCOS/endometriosis application US20240071624A1 (the most competitively dangerous filing in the set), Oura's granted US12558022B2 and US12551197B2, and Fitbit's granted US10765409B2 / US11889994B2 (I read Fitbit's claims only in the pre-grant publication US20200000441A1, and grant-stage narrowing is likely). Order these four claim sets from counsel before any architecture is frozen. The USPTO PDF for US12558022 is a scanned image, so OCR or a paid database will be needed.\n\nTHE HEADLINE NEGATIVE FINDING \u2014 THE APP INCUMBENTS HAVE NO PATENTS. Natural Cycles Nordic AB returned ZERO results across every assignee spelling tried (\"Natural Cycles Nordic\", \"NaturalCycles\", assignee=Natural Cycles combined with q=ovulation) and an inventor search on Scherwitzl returned only an unrelated NYU immunologist. Flo Health returned zero. Glow, Inc. returned zero (only unrelated \"Glow\" companies \u2014 pet LED harnesses, golf balls). Biowink/Clue returned exactly one German hardware patent. Ovia/Ovuline's only algorithm family is ABANDONED at both the 2013 parent and the 2023 continuation. Kindara's is ABANDONED. In other words: not one of the six named app companies in the brief holds an enforceable algorithm patent. Natural Cycles in particular \u2014 the company most often assumed to own this space \u2014 protects itself with FDA De Novo DEN170052 plus six subsequent 510(k) clearances (K202897, K231274, K250561) and trade secret, NOT patents. Its FDA-cleared \"statistical modelling combined with machine learning for individualised fertility prediction\" is unpatented, which means it is not blocking, but also means the regulatory pathway, not the patent, is the real barrier to entry.\n\nWHO ACTUALLY OWNS THIS SPACE: THE HARDWARE COMPANIES. The real portfolio holders are Oura Health Oy (by a wide margin \u2014 at least 18 patents in this area, spanning menstrual cycle tracking, cycle-onset prediction, fertility prediction, anovulation, miscarriage, pregnancy complications, labour onset, menopause, and PCOS/endometriosis), then Fitbit/Google, Apple, Ava/Femtec, Fertility Focus/Vio HealthTech, Prima-Temp and Roche. The strategic consequence is that THE MOAT IN THIS FIELD IS BUILT AROUND SENSORS, NOT AROUND MATHS. Every single blocking claim recites a required physical input \u2014 HR+HRV, optical HR, continuous wearable temperature, intravaginal temperature, multi-reading BBT, a urine analyte concentration, or an image. Sensor-independence is therefore not just Rove's product position, it is its freedom-to-operate strategy.\n\nDIRECT ANSWER TO QUESTION 1 \u2014 IS \"BAYESIAN FUSION OF MULTIPLE FERTILITY SIGNALS WITH PER-USER LEARNED PRIORS\" ALREADY CLAIMED? Essentially no, and the near misses are instructive. No claim found anywhere recites Bayesian methods, posteriors, or hierarchical priors in a fertility context. Three claims approach the idea from different angles and each stops short: Ava US10779802B2 personalises but only via per-user thresholds, and is bound to an HR/HRV wearable; Fitbit's published claim recites the closed predict-observe-update loop, which is structurally the closest thing to Bayesian updating, but drives it with optical heart rate; Ovia's US20150112706A1 claimed community-model-plus-personalisation for ovulation prediction and was ABANDONED \u2014 the strongest single piece of good news in this report, because it means the idea is published prior art (blocking others) while being unowned (not blocking Rove). Two real cautions: first, the Fitbit loop becomes a live infringement question the moment Rove ingests wearable heart rate to refine predictions, so treat HR as an optional non-core input; second, Oura's US12551197B2 specification describes ML classifiers TRAINED ON USER INPUT and per-user baselines, and until its granted claims are read, the possibility that per-user learning made it into a granted claim cannot be excluded.\n\nDIRECT ANSWER TO QUESTION 2 \u2014 IS THE ANOVULATION/PCOS ANGLE MORE OPEN THAN TTC PREDICTION? Yes, clearly, but it is not empty and the window is closing. TTC prediction has roughly 15+ live or recently-live families across seven well-funded assignees, densest in the 2018-2022 wearable era. Anovulation and PCOS screening have essentially three: Oura's anovulation application (2021, pending), Oura's PCOS/endometriosis application (2022, pending), and Roche's PCOS risk score (2020, pending). All three are PENDING, none is granted, and each has a clean structural exit \u2014 the two Oura filings require wearable-derived physiological data, and Roche requires a measured AMH value. The academic literature on ML for PCOS is enormous (dozens of papers, including a large Indian contingution using the Kerala PCOS dataset) while the patent literature is nearly bare, which is the classic signature of a real white space \u2014 and it also means that body of published research is prior art that constrains how broadly Oura or Roche can ultimately claim. Recommendation: file on the anovulation-and-PCOS-from-non-wearable-evidence axis quickly, because Oura is filing roughly annually in this exact direction and its 2022 PCOS application shows intent to expand from cycle tracking into diagnosis.\n\nWHO IS FILING IN INDIA. Coverage caveat first: the Indian Patent Office public search (iprsearch.ipindia.gov.in) is CAPTCHA-gated and I did not attempt to bypass it, and Google Patents' indexing of Indian applications is weak \u2014 country=IN queries returned zero across several formulations. So the Indian picture below is derived from PCT and national-phase records rather than from a direct IPO search, and should be confirmed by an Indian agent doing a proper InPASS search. What I could establish: the only substantive Indian-origin filer found in this space is INITO (Bengaluru), via PCT/IN2021/051149 \u2192 WO2022123600A1, with Indian national phase 202317046017 entered 2023-07-08, plus GB2617503A and US 18/266,250; the WO has ceased and the EP national phase was not entered, which suggests a constrained prosecution budget. Inito publicly claims 20+ patents and around 40 million hormone-test datapoints, so assume more filings exist than Google Patents surfaces. Beyond Inito the field is strikingly thin: none of Oura, Fitbit, Apple, Roche, Ava, Natural Cycles, Flo, Clue, Glow or Ovia was found to have an Indian national-phase entry for any of the cycle-prediction or PCOS families above. Other named Indian femtech players (Arva Health, FemoraAI, and the broader Bengaluru fertility cluster) surfaced only in press coverage, with no patent records located. The practical read: India is close to open territory for the algorithm layer, Inito is the one entity to clear before shipping any hormone-strip-derived inference, and Indian claims must be drafted around s.3(k) (algorithms and business methods per se are unpatentable) by reciting a technical system with a technical effect.\n\nTITLES LIE \u2014 READ THE CLAIMS. Two examples worth internalising. US11521401B2 is titled \"Fertility window prediction using a convolutional neural network (CNN) and other learning methods\", which sounds like it owns ML fertility prediction; claim 1 is actually a box with a camera, a light source and a slide holder imaging cervical mucus for ferning and white blood cells. US9568463B2 \"Ovulation prediction device\" is the top hit for most Natural Cycles patent searches and has nothing to do with Natural Cycles \u2014 it is a lapsed HiLin ferning-imaging device. Do not let a competitor's press release about \"our patented algorithm\" substitute for reading claim 1.\n\nSUGGESTED NEXT STEPS. (1) Order the four missing claim sets named above, prioritising Oura US20240071624A1. (2) Run a professional Indian InPASS search on Inito and on IPC/CPC classes A61B5/4875 and G16H50/20 restricted to Indian applicants. (3) Set a docket watch on Oura's continuation practice \u2014 it is the only assignee actively expanding toward diagnosis. (4) Consider provisional filings on the four strongest white-space items: hierarchical Bayesian fusion with per-user priors over an arbitrary evidence set, sensor-free anovulation detection, non-AMH PCOS risk scoring, and expected-information-gain test scheduling. (5) Recognise that in this field the binding constraint on a contraception or diagnostic claim is REGULATORY, not patent \u2014 Natural Cycles' De Novo pathway, not its IP, is what actually took years to clear."
  }
]
```
