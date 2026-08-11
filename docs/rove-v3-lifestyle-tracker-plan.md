# Rove v3 — "Best Lifestyle Tracker for Women": Implementation Plan

_Created 2026-08-01. Covers the six Tier-1 features approved by the founder. Same format and ground rules as `react-native-migration-team-plan.md` — a backlog of self-contained, roughly one-day items with phone-testable definitions of done, plus a **day-by-day schedule** at the bottom._

**Jump to:** [Decisions](#decisions-made-up-front-so-there-are-no-mid-project-surprises) · [Day-by-day schedule](#day-by-day-schedule--32-items-3-engineers-7-weeks-35-working-days) · [Risk register](#risk-register--the-six-things-most-likely-to-hurt)

## What this plan covers

| # | Feature | Why it wins |
|---|---|---|
| 1 | Passive health sync (Apple Health / Health Connect) | App keeps working when she forgets to log; imports years of existing cycle history on day one _(scope revised 2026-08-11 — was "unlocks confirmed ovulation", now out of scope with TTC)_ |
| 2 | Food logging — AI-assisted text + voice + quick-add (India-native) | **Rove has no calorie tracker today.** This builds one, and closes the loop between the AI diet plan and what she actually ate. *Photo capture deferred to v4 — Decision 11.* |
| 3 | Blood report upload → living Health Passport | Turns a tracker into a health record; real data moat |
| 4 | Doctor-ready PDF export | Most shareable feature in the app; word-of-mouth engine |
| 5 | Voice + WhatsApp logging | Removes the app-open friction that kills every tracker |
| 6 | Home screen + lock screen widget | Dozens of daily impressions, zero app opens |

## The one-line summary of the whole plan

Rove today only knows what the user manually types into `daily_logs` — and on the food side it does not even know that much: it prescribes calorie and macro targets but has **no way to record what she actually ate.** All six features exist to break that ceiling: one **captures data automatically** (1), two **capture data with near-zero effort** (2, 5), one **imports data she already has** (3), one **gives the data back in a form that earns trust** (4), and one **puts it where she'll see it without opening the app** (6).

---

## Existing foundation — do not rebuild any of this

A code audit on 2026-08-01 confirmed the following are live. Read the files before assuming otherwise.

| Already built | Where |
|---|---|
| 5-tab shell, Home / Tracker / Plan / Insights / Profile | `mobile/src/app/(app)/*` |
| Manual daily log: flow, symptoms, moods, sleep, disruptors, hydration, discharge (MPIQ), sex + contraception, self-love | `mobile/src/components/tracker/*`, vocabulary in `constants.ts` |
| Cycle maths — phase, fertile window, ovulation day | `mobile/src/lib/` + `supabase/functions/cycle-phase-calculator` |
| AI diet + workout generation; personalised calorie/macro **targets** (Mifflin-St Jeor, activity multiplier, 1200 kcal floor) | `supabase/functions/diet-plan-generator`, `workout-plan-generator`, `mobile/src/lib/calorieCalculator.ts`, `mobile/src/lib/plan.ts:80-98` |
| Fuel gauge — **displays targets only, has no concept of "consumed"** | `mobile/src/components/plan/MacroFuelGauge.tsx` (rebuilt in Item 17) |
| `user_food_choices` — **which suggested dish she tapped. Dish name only: no quantity, no macros, no daily total.** A preference signal for the Chef prompt, *not* a food log | `supabase/migrations/20260722210000_user_food_choices.sql` |
| Insights cards incl. pattern analysis | `mobile/src/components/insights/*` |
| Health Passport (static), Cycle Signature | `mobile/src/components/profile/HealthPassport.tsx` |
| Local notifications (daily reminder, period-in-2-days) | `mobile/src/lib/notifications.ts` |
| AI provider abstraction + auth guard + prompt rate limiting | `frontend/src/lib/ai/service.ts`, `mobile/src/components/ui/PromptLimitIndicator.tsx` |
| Sentry, PostHog, TanStack Query with AsyncStorage persistence | `mobile/package.json` |
| LH/FSH strip fertility engine — **designed, not built** | `docs/lh_fsh_strip_integration_plan.md` |

**Nothing in the codebase uses Supabase Storage yet.** Features 2 and 3 both need it — Item 3 sets it up once for both.

---

## Decisions made up front (so there are no mid-project surprises)

**1. Expo Go is no longer sufficient. Ground rule 4 of the migration plan must be amended.**
HealthKit, Health Connect, and both widget platforms are native modules that **cannot run in Expo Go**. Day-to-day checkpoints move to an **EAS development build** installed on the founder's iPhone and a real Android device. `expo-dev-client` is already a dependency, so this is a build-config change, not a rewrite. This is the single biggest process change in the plan and needs the founder's explicit sign-off before Item 1 starts.

**2. An Apple Developer account ($99/yr) is now a hard blocker, not a nice-to-have.**
HealthKit and the widget's App Group are both *entitlements* — Apple issues them against a paid team ID. Without it, features 1 and 6 cannot be built or tested on iOS at all. Buy this in week 1.

**3. No direct Oura / Whoop / Fitbit integrations in v3.**
Those devices already mirror their data into Apple Health and Health Connect through their own apps. Reading one system per platform gets us most wearables for free, versus building and maintaining three OAuth integrations. Verify per-device during the Item 4 spike; revisit direct APIs in v3.2 only if a device we care about is missing.

**4. All AI vision work goes through the existing Next.js API routes, not new edge functions.**
`frontend/src/lib/ai/service.ts` already owns provider selection (Gemini 2.5 Flash / GPT-4.1), the auth guard, and rate limiting. Meal photos and lab reports are new routes there. Reason: one place for prompts, one place for cost control, one place for the model swap. Supabase edge functions stay for deterministic cycle maths.

**5. Gemini 2.5 Flash is the default model for food parsing (text) and lab reports (vision).**
It reads PDFs and images natively — no separate OCR step for lab reports — it is already wired up, and it is the cheapest option that is good enough. Escalate a specific route to GPT-4.1 only if measured accuracy on the Item 14 / Item 25 golden set falls short. (Food *vision* is deferred to v4 — Decision 11.)

**6. Voice logging ships before WhatsApp logging, as a separate release.**
Same natural-language pipeline, but in-app voice has zero external dependency, while WhatsApp needs Meta business verification with an unpredictable timeline (days to weeks in India). Building voice first means the NLU is already proven and load-tested when WhatsApp clears. **WhatsApp must never be allowed to block the release.**

**7. Nothing in the lab feature diagnoses anything.**
The app may display a value, its reference range, its trend, and educational content. It may not name a condition or recommend treatment. Every lab-derived string ships behind a clinician review (Item 26) and carries a visible disclaimer. This is both a regulatory line and a trust line.

**8. Two releases, not one.**

| Release | Contents | Gating risk |
|---|---|---|
| **v3.0** | Health sync, food logging (text + voice), voice symptom logging, widgets | Native builds + store compliance only — all in our control |
| **v3.1** | Lab reports, Health Passport, doctor PDF export, WhatsApp | Clinician review + Meta verification — timelines we don't control |

v3.0 is the retention release; v3.1 is the trust-and-moat release. Shipping them together means the slowest external approval sets the date for everything.

**9. Calorie numbers are OFF by default. The qualitative view is the default view.**
Rove's audience — women 18–40 with hormonal-health concerns — overlaps heavily with the population most vulnerable to disordered eating, and a prominent daily calorie number is the single feature most likely to do harm here. So:
- **Default view is qualitative:** "protein: good today · fibre: light · iron-rich foods: 2 servings." No calorie total on screen.
- **Numbers are available on explicit opt-in**, in Profile, for the users who want them (someone with a fat-loss goal reasonably does).
- **No screen ever congratulates a user for eating less**, no "under budget" celebration, no streaks for restriction. Streaks may exist for *logging* and for *hitting* protein or fibre, never for a deficit.
- The existing 1200 kcal floor in `calorieCalculator.ts` shows the codebase already has the right instinct. Extend it: if logged intake stays implausibly low for several days, the app responds with concern, not encouragement.
This is a product decision with an ethical floor under it, not a preference. It applies to Items 13, 17, and 18.

**10. AI identifies the food; the database calculates the nutrition. AI is never asked for a number we can look up.**
The model's only job is "which dish, and roughly how much" → a dish name plus a household quantity. Every calorie and macro then comes from the IFCT-backed table in Item 11. Three reasons: the numbers become **consistent** (the same dal always yields the same macros, so week-over-week trends mean something), **auditable** (every number traces to a cited source, which matters for a health app), and **cheap** (a short identification response instead of a long nutritional one). It is also what makes Item 14 cheap enough that per-user AI cost is a rounding error.

**12. Lab reports: paid-tier only, India region, and PII stripped on-device before anything leaves the phone (founder question, 2026-08-01).**
"Does the AI get the lab data?" — under the architecture as first written, **yes: the entire PDF, including her name, date of birth, referring doctor, and every blood value, would have been sent to Google.** That is not acceptable for blood test data and the design changes as follows.

The codebase currently calls `https://generativelanguage.googleapis.com` (`frontend/src/app/api/ai-chat/route.ts:394`) — the **Google AI Studio / Gemini Developer API**. Three consequences, in order of severity:

1. **Free-tier AI Studio usage may be used by Google to improve their products.** Paid-tier is contractually excluded from training. **Which tier the existing `GEMINI_API_KEY` sits on is a blocking, five-minute check** — added to Item 2. If it is free tier, no lab report may be processed through it, ever.
2. **Data leaves India.** The DPDP Act makes cross-border processing of health data something we must disclose and justify, not something to discover after launch.
3. **We send far more than we need.** The model needs analyte names and values. It does not need her identity — we already know who she is from the auth token.

**The three fixes, all in v3.1:**
- **Paid tier, and move lab extraction specifically to Vertex AI with the `asia-south1` (Mumbai) regional endpoint.** Enterprise no-training terms plus in-country processing. This is also a genuine, checkable marketing claim: *your blood reports are processed in India and never used to train anyone's AI.* No competitor in this market says that.
- **On-device OCR + PII stripping before upload (new Item 24a).** Apple Vision and Android ML Kit both do text recognition on-device for free. Extract the text on her phone, strip name / address / phone / UHID / doctor / lab-account patterns there, and send only the de-identified analyte text. It is cheaper than sending images, faster, and it means the raw identified document never reaches any third party.
- **Do not retain the source document by default.** Extract, verify, then delete — with an explicit opt-in if she wants the original kept in her passport.

**The same question, answered for every other feature** (this table belongs in the privacy policy too):

| Data | Goes to a third-party AI? | Notes |
|---|---|---|
| Lab reports | De-identified text only, Vertex `asia-south1`, paid tier | Per this decision |
| Food descriptions ("2 roti, ek katori dal") | Yes — Gemini | Low sensitivity, no identity attached |
| Voice recordings | Transcribed via Groq, then discarded | **Audio is never stored.** Transcript is health data — same paid-tier rule applies |
| Symptom text | Yes — Gemini | Health data; disclose explicitly |
| WhatsApp messages | Meta sees them inherently | Unavoidable property of the channel — say so plainly at opt-in |
| **Health metrics (HRV, sleep, RHR, temperature)** | **No — never sent to any AI** | Processed by deterministic code only. Keep it that way; it is the most sensitive continuous dataset we hold |

⚕ The whole table is reviewed by the clinician and by counsel before v3.1 ships.

**13. TTC is the right container for the fertility stack — but the sensors run for everyone. Collect universally, surface contextually (founder direction, 2026-08-01).**

**The mode framework already exists and is already shipping a promise we haven't kept.** `user_onboarding.tracker_mode` is live end-to-end — set in onboarding (`mobile/src/app/onboarding.tsx:137`), switchable in Profile (`FocusGoals.tsx`), read by the dashboard (`dashboard.ts:93`) — and `home.tsx:247` **already branches on `'ttc'` today.** What it renders is a placeholder: a Baby icon, the words *"Your dedicated fertility dashboard is being prepared. Soon you'll track BBT, cervical mucus, and peak ovulation days here,"* and a **non-functional "Log Temperature" button.** A `'menopause'` stub sits right below it at line 265.

So this is not a new mode to design. It is a live dead end in the shipped app, and v3.2 fills it. Infrastructure cost: near zero.

**What belongs inside TTC mode** (surfaced only when `tracker_mode = 'ttc'`):
- Fertile window with confidence, and the predicted/confirmed distinction (§2 of the algorithm doc)
- LH strip logging and surge display · BBT entry and chart · cervical mucus promoted to a primary daily log
- Intercourse timing guidance (sex activity is already logged)
- A TTC dashboard replacing the Home phase orb — which is what the stub already promises

**What must NOT be gated behind TTC:**
- Passive health sync, food logging, lab reports, doctor PDF, widgets, voice logging
- **Anovulation and PCOS screening — most of all this one**

**Why the sensors stay universal — three reasons, and the first is the important one:**

1. **PCOS screening is worth more to the woman who is *not* trying to conceive.** Roughly 1 in 5 urban Indian women per `rove_master_pitch.md`. Most of them are 22, have irregular periods and acne, and have never been told they may not be ovulating. Putting that finding behind a "trying to conceive" switch hides the single most valuable clinical output in the product from exactly the population that needs it. It would be a product decision that harms users.
2. **A mode switch with no history is a mode switch with no value.** If collection only starts when she flips to TTC, she arrives at the moment of highest intent with zero data — population defaults, a 4-day-wide window, and "check back in three cycles." A woman whose phone has been quietly logging temperature and resting HR for eight months arrives with a personalised luteal length and a tuned prior. That difference is the whole product.
3. **Passive signals cost her nothing.** HRV, resting HR, sleep, and wrist temperature arrive from the wearable whether or not she is TTC. There is no user burden to justify gating.

**The rule: one data layer, three narrative layers.** Modes change presentation and emphasis, never collection or storage. Lab reports are a good test of the rule — the *feature* is universal, but TTC mode surfaces AMH, LH, FSH and prolactin first while the default mode leads with ferritin, vitamin D, B12 and thyroid. Same data, same pipeline, different ordering.

**The cost to accept:** ground rule 5 is a four-phase testing rule. Three modes makes it 4 × 3 = 12 combinations. Keeping mode differences strictly in the presentation layer is what stops that becoming twelve times the QA — and it is a merge-blocking rule, not a preference. A mode that forks the data layer must be rejected in review.

**11. Image capture is deferred to v4. v3 food logging is text, voice, and quick-add (founder decision, 2026-08-01).**
The v3 tracker is built on *her describing the meal* — typed or spoken — not on photographing it. Reasons this is the right call, not a compromise:
- **Mixed Indian food is the worst case for food vision.** Gravies hide their contents, oil is invisible, and a katori's depth cannot be judged from above. Item 15 was the highest-risk item in the plan.
- **She already knows what she ate and how much.** "Ek katori dal" is *more* precise than any photo-derived estimate, not less.
- **It collapses two features into one pipeline.** Item 14 (food parsing) and Item 20 (symptom parsing) become one module with two vocabularies, and Item 21's voice transcription serves both. Voice food logging comes nearly free.
- **It removes ~4 days, the `meal-photos` bucket, `expo-camera`, and the golden-set photo-shoot from v3.**

Photo capture returns in v4 as a *convenience layer on a working tracker* (Items 15, 15a, 19 are kept as v4 stubs with their design intact). Nothing in the v3 schema blocks it: `meal_logs.photo_path` and `entry_method = 'photo'` are already reserved.

---

## PHASE 0 — Prerequisites (week 1, all three engineers in parallel)

These unblock everything else. None of them produce user-visible features, and skipping any of them stalls a whole track later.

### Item 1 — EAS development build on both platforms
Configure and ship a dev-client build the team installs once and keeps. Update `mobile/eas.json` with a `development` profile (internal distribution, dev client true) for iOS device + Android APK. Document the install steps in `mobile/README.md`.
**Depends on:** Apple Developer account purchased (founder task, day 1).
**Definition of done:** every engineer has the dev build on a real device, `npx expo start --dev-client` connects, and one existing screen (Tracker) works exactly as it did in Expo Go. Founder has the build on her iPhone.
**Size:** 1 day. **Risk:** medium — first EAS device build on a new Apple team always surfaces provisioning-profile problems. Do it first, not later.

### Item 2 — Founder + admin tasks kicked off (long lead times)
Not an engineering item, but on the critical path. All four start in week 1:
- Apple Developer Program enrolment (blocks Items 1, 4, 22).
- Meta Business account + WhatsApp Business Platform verification (blocks Item 28 — **start now, it is the longest lead time in the plan**).
- A named clinician retained for Item 26 review (blocks all of v3.1).
- Google Play "Health Apps" declaration form started (blocks Item 7 Android release).
- **Verify which tier the existing `GEMINI_API_KEY` is on — free vs paid (Decision 12). Five minutes, and it is blocking for the entire lab feature.** If free, open a paid Google Cloud billing account and provision a Vertex AI `asia-south1` endpoint.
- **Email Sarvam and get written answers on (a) training/retention of public-API uploads and (b) whether public-API data is processed in India** (Item 24b). Their Doc AI is the better technical fit for Indian lab reports; these two answers decide whether we can use it.
**Definition of done:** all four have a confirmed owner and a submitted-on date recorded in this file.

### Item 3 — Supabase Storage buckets + RLS
Create the **private** `lab-reports` bucket (and `meal-photos` too, unused until v4 — one migration is cheaper than two). Path convention `{user_id}/{yyyy-mm}/{uuid}.{ext}`. RLS: a user may insert/select/delete only under their own `user_id` prefix; no anonymous access, ever; no public URLs anywhere in the codebase — reads only via signed URLs with a 60-second TTL. Add the buckets and policies as a migration in `supabase/migrations/` so they are reproducible, not clicked in the dashboard.
**Definition of done:** a test proving user A cannot read user B's object even with the full path; a signed URL expires and returns 403 after its TTL. Both buckets show `public = false`.
**Size:** 0.5 day.

### Item 4 — Native health module spike (both platforms)
A throwaway spike, before any product work. Install `@kingstinct/react-native-healthkit` (iOS) and `react-native-health-connect` (Android) with their Expo config plugins. Prove you can read, on a real device: steps, sleep stages, resting heart rate, HRV, weight — **and menstrual flow / period records**, which Item 8a depends on entirely. ~~wrist/skin temperature~~ dropped 2026-08-11, see the scope correction above. Also prove one *write* of a menstrual flow record round-trips into the platform's own health app, since Item 9a rests on it. Then check what a real Oura or Whoop account actually writes into each system, and record the answer in this file — decision 3 above depends on it.
**Depends on:** Items 1, 2.
**Definition of done:** a scratch screen in the dev build printing yesterday's five metrics plus the most recent period record on iPhone and on a real Android phone; one written flow record visible in the iOS Health app and in Health Connect; plus a written note on which metrics are missing per platform. **Delete the scratch screen before merging Item 7.**
**Size:** 1.5 days. **Risk:** high — this is the spike that most likely changes the plan. HRV availability varies by device and OS version, and flow-level vocabularies differ between the two platforms. Find out now.

### Item 5 — Privacy policy, consent copy, and store declarations
`mobile/src/app/privacy.tsx` predates all of this. It must now cover: health data read from Apple Health / Health Connect, meal photographs, lab reports, voice recordings and transcripts, and WhatsApp message content. Apple additionally forbids using HealthKit data for advertising and requires the policy to say so. Update the App Store privacy worksheet in `docs/app-store-privacy-worksheet.md` and the Play Data Safety form to match.
**Definition of done:** updated policy live on rovehealth.in and rendered in-app; both store forms updated in draft; a written mapping of every new data type → why we collect it → retention period → **which third-party processor sees it** (the table in Decision 12 is the source for that last column).
**Size:** 1 day (plus founder/legal review time).

---

## PHASE 1 — v3.0 features (weeks 2–4)

Three independent tracks. Engineer A takes health sync, B takes meals, C takes voice.

### TRACK A — Passive health sync

> **Scope correction, 2026-08-11 (founder).** Current focus is **cycle tracking only — TTC is out of scope.** The TTC engine stays parked on `ttc-mode-build` and does not ship in v3. Three consequences for this track:
>
> 1. **No fertility data types.** Basal body temperature, LH/ovulation test results, and cervical mucus quality are not read or written, on either platform. They are TTC signals and pulling them in now drags the schema and the sync engine toward a use case we are not shipping.
> 2. **Skin/wrist temperature comes out of the Item 4 spike.** Its only real use is retrospective ovulation estimation. Do not spend a day proving reads for a signal nothing in v3 acts on. `health_metrics.skin_temp_delta_c` stays in the Item 6 migration — the column is free and re-adding it later costs a migration — but nothing writes to it in v3.
> 3. **Two new items, 8a and 9a below.** The original Track A is read-only. Reading alone makes us a consumer of Apple's data; writing period data back makes us the source of record, and it is a small surface once Item 8 exists.
>
> **Priority change:** Item 8a (history import) is the highest-value item in this track and should land before Item 9, not after. Every downstream feature — Insights, the doctor report, prediction quality — demos badly against an empty account and well against an imported one.
>
> **Schedule impact — not yet reflected below.** Items 8a and 9a add **3.5 days** to Track A; dropping temperature from Item 4 gives back roughly half a day. The day-by-day schedule at the bottom of this file still shows the original Track A ordering and has **not** been re-planned — that is a founder/lead call, not something to absorb silently into an existing 35-day schedule.
>
> **Already built since this plan was written:** the doctor-ready PDF export (feature 4) shipped on 2026-08-11 — `mobile/src/lib/healthReport.ts`, surfaced in Insights → Health. It is entirely self-reported today, which is the clearest argument for this track: its Sleep row reads *"— 0 nights logged"* because nobody hand-logs sleep.

### Item 6 — Health data schema + sync state
Two new tables:

```sql
-- one row per user per day per source
health_metrics (
  user_id, date, source,              -- 'apple_health' | 'health_connect' | 'manual'
  steps, active_energy_kcal,
  sleep_minutes, sleep_deep_minutes, sleep_rem_minutes,
  resting_hr, hrv_ms, respiratory_rate,
  skin_temp_delta_c,                  -- deviation from baseline, the ovulation signal
  weight_kg,
  synced_at,
  unique (user_id, date, source)
)

-- incremental sync bookkeeping, so we never re-read the full history
health_sync_state (
  user_id, source, data_type,
  anchor text,                        -- HealthKit anchored-query token
  last_synced_at,
  unique (user_id, source, data_type)
)
```
Full RLS, user-scoped, matching the existing `daily_logs` policy style. `source` is in the unique key so a user switching from Android to iOS doesn't collide or silently overwrite.
**Depends on:** Item 4.
**Definition of done:** migration applied; RLS test proving cross-user reads fail; a hand-inserted row visible via the mobile client.
**Size:** 0.5 day.

### Item 7 — Permission flow + connect screen
A new "Connect your health data" screen, reachable from Profile and offered once during onboarding. Explains in plain language what we read and why, then requests permission. Handle every rejection path: permission denied, partially granted (iOS lets the user grant per-type and **never tells you which types were refused** — you must detect "no data" and offer a re-prompt), Health Connect not installed (Android 13 and below need the Play Store APK; 14+ has it built in), and unsupported device.
On Android, Health Connect additionally requires the permissions declared in the manifest plus a privacy-policy activity intent filter — without it Play rejects the build.
**Depends on:** Items 4, 5, 6.
**Definition of done:** on a real iPhone and a real Android phone: grant → success state; deny → a non-dead-end screen explaining what she loses and how to change her mind in system settings; Android 13 device → correct "install Health Connect" prompt. Screenshot each.
**Size:** 1.5 days.

### Item 8 — Sync engine
A background-capable incremental sync. On app foreground, and on iOS via HealthKit background delivery: read each data type from its stored anchor forward, aggregate to per-day rows, upsert into `health_metrics`, advance the anchor only on a successful write. Must be idempotent — running it twice produces the same rows. Handle the first-ever sync by backfilling **90 days** (enough for ~3 cycles of pattern analysis, small enough not to hang the UI) behind a progress indicator.
**Depends on:** Items 6, 7.
**Definition of done:** wear a watch overnight, open the app, see last night's sleep and resting HR appear; kill and reopen the app 5× and confirm no duplicate rows; airplane-mode mid-sync leaves the anchor unadvanced and recovers on the next run.
**Size:** 2 days. **Risk:** medium — anchor handling is where this class of feature usually leaks duplicates.

### Item 8a — Cycle history import on permission grant
**The highest-value item in this track. Schedule it immediately after Item 8.**

Apple's own Cycle Tracking writes menstrual flow into HealthKit, and Health Connect exposes `MenstruationPeriodRecord` / `MenstruationFlowRecord`. A woman arriving from Apple's tracker — or from any app that mirrors into these systems — is carrying years of period history that we can have the moment she taps Allow.

On first successful permission grant, read **all available** menstrual flow and period records (not the 90-day metrics backfill — history is cheap and the whole point), collapse them into period streaks using the same gap tolerance as `shared/cycle/phase.ts` `findStreakStart`, and write them into `daily_logs.is_period` / `flow_intensity` for dates the user has not already logged herself. **Manual entries always win** — never overwrite a day the user typed. Re-anchor `user_cycle_settings.last_period_start` from the most recent imported streak afterwards.

Show what happened: "We found 14 cycles going back to March 2024." That sentence is the entire onboarding pitch for the integration.

**Depends on:** Items 7, 8.
**Definition of done:** on a real iPhone with ≥6 months of Apple Cycle Tracking history, granting permission produces correct period streaks in the Tracker calendar and a non-null average cycle length in Insights within one screen of onboarding; a day the user had already logged manually is byte-identical before and after import; running the import twice creates no duplicates and no drift.
**Size:** 2 days. **Risk:** medium — flow-level mapping differs between platforms, and the "don't clobber manual entries" rule is where this will leak.

### Item 9a — Write period data back to Apple Health / Health Connect
Read-only integrations are replaceable; two-way ones are not. When the user logs or edits a period in Rove, mirror it out as `HKCategoryTypeIdentifierMenstrualFlow` (iOS) and `MenstruationPeriodRecord` / `MenstruationFlowRecord` (Android), so her cycle shows up in Apple Health, on her watch, and in every other app that reads those systems.

Scope is deliberately narrow: **period and flow only.** No fertility types (see the scope correction at the top of this track). Write access is a separate permission from read on both platforms and must be requested and refused independently — a user who grants read and denies write is a normal state, not an error.

Guard against the obvious loop: records we wrote must be tagged as ours and skipped on the next import, or Item 8a will re-import our own writes.

**Depends on:** Items 8, 8a.
**Definition of done:** log a period in Rove → it appears in the iOS Health app and in Health Connect within one sync; delete it in Rove → it disappears from both; write permission denied → the app works exactly as it does today with no error state; run import and write-back back-to-back 5× and confirm no duplicated or ballooning streaks.
**Size:** 1.5 days. **Risk:** medium — the write/import loop is the failure mode to test hardest.

### Item 9 — Surface passive data in Home and Insights
Wire the new metrics into `SnapshotIcons` on Home (steps, sleep, resting HR for today) and add a card to Insights showing each metric across the current cycle with phase bands behind it — the point being that she *sees* her resting HR climb in luteal. Every widget must degrade gracefully to the existing manual-entry state when no source is connected.
**Depends on:** Item 8. **Four-phase testing rule applies** (ground rule 5 of the migration plan).
**Definition of done:** checkpoint in all four cycle phases on a real device, with and without a connected source.
**Size:** 1.5 days.

### Item 10 — Replace self-reported activity with measured activity in the AI plans
`user_onboarding.activity_level` is currently a one-time self-assessment, and `diet-plan-generator` trusts it for calorie targets. Feed real data instead: derive an effective activity level from the trailing 7-day average of steps and active energy, and pass yesterday's actual activity into the workout generator so it stops prescribing a hard session the day after one. Keep the self-reported value as the fallback when no source is connected, and keep the existing cache-key behaviour intact.
**Depends on:** Items 8, 9.
**Definition of done:** two test accounts with identical onboarding but different step data receive measurably different calorie targets; an account with no health source connected gets byte-identical output to today's.
**Size:** 1 day.

> **Deferred on purpose — confirmed ovulation.** Full algorithm and validation protocol now specified in `docs/multi-signal-ovulation-algorithm.md` (created 2026-08-01). **Deferred further, 2026-08-11:** TTC is out of scope for v3 entirely, so this is not a v3.2 item either until TTC returns to the roadmap.
>
> **Original note:** Fusing skin-temperature shift + resting-HR rise + MPIQ + LH strips into a "we confirmed you ovulated on day 15" claim is the biggest prize in this whole plan, and it is *impossible to validate before we have collected a cycle of real temperature data from real users.* It becomes the headline v3.2 item, built on Items 6–8 plus `docs/lh_fsh_strip_integration_plan.md`. Do not let anyone ship a confirmation claim in v3.0 on synthetic data.

### TRACK B — Food logging (there is no calorie tracker today — this track builds one)

_Live in v3: Items 11, 12, 13, 14, 16, 17, 18. Deferred to v4: Items 15, 15a, 19._

> **Scope correction, 2026-08-01 (founder).** An earlier draft of this plan described feature 2 as "adding photo logging to the fuel gauge." That was wrong, and the difference matters for the schedule. A code audit confirms:
>
> | What exists | What it actually is |
> |---|---|
> | `mobile/src/lib/calorieCalculator.ts` | Computes a **target** — Mifflin-St Jeor BMR, activity multiplier, goal adjustment, 1200 kcal safety floor, obesity-adjusted weight. Solid, reusable, already personalised. |
> | `mobile/src/lib/plan.ts:80-98` + `MacroFuelGauge.tsx` | Displays that target. The component takes `{calories, protein, fats, carbs}` **as props and renders them.** It has no concept of "consumed". |
> | `user_food_choices` table | Logs *which suggested dish she tapped* — dish name only. **No quantity, no calories, no macros, no date-level total.** It is a preference signal for the Chef prompt, not a food log. |
>
> **So: the target side is built and the intake side does not exist at all.** No food diary, no daily total, no food database, no manual entry, no history. Feature 2 is not a photo feature bolted onto a tracker — **it is the calorie tracker, with photo as its fastest input.** Track B is rescoped to 7 live items / ~11 days and is the critical path of v3.0. Three items below (11, 13, 18) are new as a direct result; Items 15, 15a and 19 are deferred to v4 per Decision 11.

### Item 11 — Indian food database (NEW — build this before any AI work)
The hidden cost of the whole track. Photo analysis can produce macros per image, but **manual entry, quick-add, and any aggregation across days all need a lookup table** — and if AI output is free text rather than snapped to canonical food IDs, we can never answer "how much dal does she actually eat", which is the entire long-term value of the data.

Build a `food_items` reference table: canonical name, aliases, default household measure (1 katori / 1 roti / 1 cup / 1 tbsp), grams per that measure, kcal, protein, carbs, fat, fibre, and a glycemic index value with its source.

Sources, in order of authority: **IFCT 2017 (Indian Food Composition Tables, ICMR-NIN)** for raw ingredients and staples; a curated set of ~300–500 *composed dishes* as actually eaten (dal tadka, rajma chawal, poha, upma, misal pav, chicken curry, biryani, dosa + sambar + chutney) which is the part no public database does well; Open Food Facts for packaged items at scan time (Item 19), not seeded.

Scope discipline: 300–500 dishes covers the large majority of real logging. Trying to be exhaustive is how this feature never ships.
**Definition of done:** seeded reference table in a migration; every row has a source recorded; a household-measure conversion test suite; 20 real meals the founder ate last week fully expressible from the table.
**Size:** 2 days. **Risk:** medium — it's unglamorous data work, and it is genuinely on the critical path. Do not let it slip to "later".

### Item 12 — Food log schema
```sql
meal_logs (
  id, user_id, date,
  meal_type,                          -- breakfast | lunch | dinner | snack
  entry_method,                        -- ai_text | ai_voice | manual | quick_add | chef_pick | copy_day
                                       -- ('photo' and 'barcode' reserved for v4)
  photo_path,                          -- reserved for v4, always null in v3
  items jsonb,                         -- [{food_item_id, name, household_qty, grams, kcal, p, c, f, fiber}]
  calories, protein_g, carbs_g, fats_g, fiber_g,
  glycemic_load, gl_band,              -- low | moderate | high
  ai_confidence, ai_raw jsonb,         -- the raw parse; null for manual/quick_add entries
  user_corrected boolean default false,
  created_at, updated_at
)
```
`items[].food_item_id` references Item 11 wherever a match exists — that link is what makes the data aggregable later. `entry_method` is what tells us, post-launch, which input people actually use — and it is the evidence base for whether v4's photo capture is worth building at all.

Plus a per-day rollup (view or RPC) returning consumed totals. Keep `ai_raw` — the diff between it and the user's correction is the only training signal we will ever get, and it is worthless if not captured from day one.
**Depends on:** Item 11.
**Definition of done:** migration + RLS test; rollup returns correct totals for a day containing one of each `entry_method`.
**Size:** 0.5 day.

### Item 13 — Food diary screen + manual and quick-add entry (NEW — the backbone)
This is the part that makes it a tracker rather than a novelty, and it must exist **before** the camera work so photos have somewhere to land.

A day view: today's meals grouped by meal type, each row showing its items and calories, tap to edit, swipe to delete, and left/right day navigation to any past date. A running consumed total at the top.

Four input methods, all landing in the same `meal_logs` row shape:
- **Text search** over Item 11's table with quantity selection in household measures.
- **Quick-add from recents/frequents.** This is how real trackers survive past week one — most people eat the same twenty things. One tap to re-log yesterday's breakfast.
- **"I ate what Rove suggested"** — a one-tap conversion of a `user_food_choices` pick into a real logged meal with macros attached. This finally closes the gap between the Chef *recommending* and us *knowing*, and it is the cheapest high-value entry path in the whole track.
- **Copy a previous day / previous meal.**

Photo-only would be a trap: she cannot photograph chai in a meeting or four almonds at her desk, and a diary with holes produces a wrong daily total — which is worse than no total, because it silently discredits every number downstream.
**Depends on:** Items 11, 12.
**Definition of done:** on a real phone, log a full day (4 meals, 12 items) using only manual and quick-add in **under 90 seconds total**; edit and delete both work and update the day total instantly; navigate back 7 days and see correct history; quick-add surfaces her actual frequent foods after 3 days of use.
**Size:** 2.5 days.

### Item 14 — AI-assisted food entry: she describes the meal, we structure it (founder direction, 2026-08-01)
**This replaces photo capture as the flagship input for v3.** She types or speaks the meal the way she'd say it out loud — *"2 roti, ek katori dal, thoda dahi and chai"* — and a text LLM turns it into structured items snapped to Item 11's food IDs. Nutrition then comes from the table, never from the model (Decision 10).

A new Next.js route `/api/food-parse` on `frontend/src/lib/ai/service.ts`, behind the existing auth guard and rate limiter. Requirements:
- **Snap to `food_item_id` wherever possible.** Pass her top ~20 frequent foods plus fuzzy-matched candidates from Item 11 as the candidate list; free text only when there is genuinely no match.
- **Resolve household quantities, including vague ones.** "Ek katori", "thoda", "a small bowl", "2 pieces" all have to land on a number. Vague quantifiers resolve to the table's default measure and are **flagged as assumed**, so the confirm step can surface them.
- **Handle Hinglish and code-mixing**, same as Item 20 — "aaj lunch mein rajma chawal khaya" is the realistic input.
- **Never invent a food or a number.** No match plus no candidate means "I didn't catch that one", not a guess.
- Always return a confirm-before-save payload. Decision 7 of the non-negotiables: no AI-derived log is written silently.

**Share the parser architecture with Item 20.** The symptom parser and the food parser are the same shape — free text → closed vocabulary → Zod-validated structure → confirm sheet. The vocabulary differs (tracker enums vs. the food table), nothing else does. Build them as one module with two vocabularies, not two codebases. Whoever picks up Item 14 and Item 20 should coordinate on day one.

**Voice comes nearly free.** Item 21 already adds `expo-audio` + Groq whisper-large-v3 transcription. Point that transcript at this parser instead of the symptom parser and she can *speak* a meal — hands-free, which matters when the alternative is photographing food with one hand while eating with the other.

Build a **golden set of 60 real meal descriptions** (half Hinglish, a third containing vague quantities) before writing the prompt. Record accuracy in this file.
**Depends on:** Items 11, 12, 13.
**Definition of done:** ≥90% of golden-set descriptions produce the correct item list, ≥85% of items snapped to a real `food_item_id`, every assumed quantity visibly flagged in the confirm sheet; p95 latency under 2.5 seconds; logging a 4-item meal by typing takes **under 20 seconds** end to end on a real phone.
**Size:** 2 days.

### Item 15 — [DEFERRED TO v4] Camera capture + photo recognition
**Deferred by founder decision, 2026-08-01 — see Decision 11.** The design work below is kept so v4 starts from a plan rather than a blank page.

Scope when it returns: `expo-camera` + `expo-image-manipulator`, downscale to 1024px before upload (that resize sets the AI bill), upload to a `meal-photos` bucket, optimistic pending row in the diary, then a Gemini Vision route that identifies dishes and portions and snaps them to `food_item_id` — nutrition still coming from Item 11's table, never from the model. Needs a golden set of 50 photographed Indian meals before the prompt is written, and a target of ≥80% component identification with calories within ±25%.

Why it was the right thing to defer: mixed Indian dishes are close to the worst case for food vision — gravies hide their contents, oil is invisible, and a katori's depth is unknowable from above. Item 14 sidesteps all three, because **she already knows what she ate and how much.** Photo is a convenience layer on top of a working tracker, not the foundation of one.
**Size when built:** ~4 days (capture 1.5 + recognition 2.5).

### Item 15a — [DEFERRED TO v4] Recognition cache
**Deferred with Item 15.** Two parts of the original analysis survive into v3 and are already implemented elsewhere, because they were never really about photos:
- **Nutrition comes from the table, not the model** — now Decision 10, and it is what makes Item 14 cheap.
- **Quick-add from frequents costs zero AI calls** — now part of Item 13, and it is where the bulk of avoided cost actually lives.

What is genuinely deferred is only the image-hash dedupe table and candidate-primed *visual* recognition. Kept here for v4:
```sql
meal_recognition_cache (
  image_sha256 text primary key,
  result jsonb, model text, prompt_version text,
  created_at
)
```
`prompt_version` is not optional whenever this is built: without it, a prompt improvement silently serves stale worse results forever. **Explicitly rejected then and now: a cross-user photo cache** — two women's "same dal" have different portions, oil, and bowls.

### Item 16 — Correction UI (this is what makes the feature trustworthy)
The parser will misread quantities, especially vague ones. Every item must be editable in the diary: change the quantity with the existing `NumericStepper`, rename or delete an item, add a missed one, re-snap a free-text item to a database food. Show which quantities were *assumed* rather than stated, so a correction feels like collaboration rather than fixing a broken robot. Set `user_corrected` and preserve `ai_raw` — the diff between the parse and her correction is the only training signal we will ever get.
**Depends on:** Items 13, 14.
**Definition of done:** correcting a meal updates the day total and the gauge instantly; the original parse is still in the database afterwards; the whole correction takes under 15 seconds on a real phone.
**Size:** 1 day.

### Item 17 — Rebuild the fuel gauge as consumed-vs-target, plus gap coaching and the glycemic lens
`MacroFuelGauge` currently renders a target and nothing else. It needs a second data series (consumed), an over/under state, and — importantly — a tone that does not feel punishing when she is under. Then the two payoffs:
- **Gap coaching.** Compare the day's rollup against the target `calorieCalculator.ts` already computes and surface it as one specific action: "22g protein short — a katori of curd or 100g paneer closes it." Not a chart. One sentence, one action.
- **Glycemic lens.** Compute glycemic load per meal from the GI values seeded in Item 11 — **rule-based, not AI**, so it is deterministic and defensible. Flag high-GL meals harder in the luteal phase, when insulin sensitivity is lowest. This is the insulin-resistance thesis from `rove_master_pitch.md` finally delivered daily instead of asserted in a deck.

Respects the calorie-display decision (Decision 9): qualitative by default, numbers on opt-in.
**Depends on:** Items 12, 13, 14, 16. **Four-phase testing rule applies.**
**Definition of done:** consumed vs target correct for a hand-built day; a day with zero logs shows a clean empty state, not 0/1800; the same meal logged in follicular and luteal produces appropriately different guidance; gap coaching never fires a negative or nonsensical number; checkpoint in all four phases with numbers both on and off.
**Size:** 2.5 days.

### Item 18 — Weekly and by-phase nutrition trends (NEW)
A tracker that only shows today does not retain anyone, and "today" is also the least interesting view of cycle-linked eating. Add: 7-day and 28-day average intake, protein and fibre adequacy streaks, and **average intake and craving patterns broken down by cycle phase** — which is the view no general calorie tracker on the market can produce, and the reason someone would use Rove instead of MyFitnessPal.
**Depends on:** Items 12, 13, 14, 17.
**Definition of done:** with 14 days of seeded logs, the weekly view and the by-phase breakdown are both correct against hand-computed numbers; fewer than 7 days of data shows an honest "keep logging" state rather than a misleading average.
**Size:** 1.5 days.

### Item 19 — [DEFERRED TO v4] Barcode scanning for packaged foods
**Deferred with Items 15 and 15a** — it needs the camera, which v3 no longer ships (Decision 11). Scope when it returns: `expo-camera`'s barcode scanner + the free Open Food Facts API for packaged Indian snacks and drinks, falling back to Item 13's manual entry on a miss. **Size when built:** 1 day.

In v3, packaged foods are handled by Item 11 seeding the ~50 most common packaged items (Maggi, Amul dahi, Britannia biscuits, Tropicana) directly into the food table, plus Item 14's text parsing. That covers the realistic majority without a camera.

### TRACK C — Voice logging (and WhatsApp on top of it)

### Item 20 — Natural-language log parser
One shared pipeline, used by both voice and WhatsApp. Free text in → a structured `daily_logs` patch out. Two rules that matter:
- **The allowed vocabulary is exactly the enums in `mobile/src/components/tracker/constants.ts`** — `SYMPTOM_OPTIONS`, `MOODS_LIST`, `SLEEP_OPTIONS`, `DISRUPTORS_LIST`, `EXERCISE_OPTIONS`. Pass them into the prompt as a closed list and validate the output against them with Zod. A voice log and a tap log must produce *identical rows*, or every insight downstream splits into two incompatible datasets.
- **Handle Hinglish and code-mixing.** "Aaj bahut cramps hain, slept only 5 hours" is the realistic input, not "I have cramps today."
Return a confidence score and an explicit "I didn't understand" path.
**Definition of done:** a golden set of 40 real-shape utterances (half Hinglish) parsed correctly ≥90% of the time, results recorded here; every output validates against the existing enums; no output ever invents a symptom name.
**Size:** 2 days.

### Item 21 — In-app voice logging
Record with `expo-audio`, transcribe with **whisper-large-v3 via Groq** (the project already has a `GROQ_API_KEY` — see `supabase/functions/_shared/groq.ts`), then run Item 20's parser. Ships as a mic button on the Tracker next to the existing `ChatFAB`.
**Critical UX rule: always show her what was understood and let her fix it before saving.** Never silently write a log from a transcript. Transcription plus parsing is two lossy steps in a row; a wrong silent write destroys trust in the whole dataset.
**Depends on:** Item 20.
**Definition of done:** on a real phone, speak a three-symptom sentence in Hinglish → confirmation sheet with correct chips pre-selected → save → row matches what a manual log would have produced. Works with background noise. Denied mic permission degrades to text entry.
**Size:** 2 days.

---

## PHASE 2 — v3.1 features (weeks 4–7)

### Item 22 — iOS widget (WidgetKit)
Add a Swift widget extension target via the `@bacons/apple-targets` config plugin. Widget UI is **SwiftUI — it cannot be React**, so this is genuinely native work; budget accordingly.
Content: cycle day, phase name, phase colour, and one action for today. Families: `systemSmall`, `systemMedium`, plus `accessoryCircular` and `accessoryRectangular` for the lock screen.
Data handoff: a shared App Group container. The app writes a small JSON file after any log or cycle change and calls `WidgetCenter.reloadAllTimelines()`. Because cycle day is deterministic, **pre-compute a 7-day timeline** so the widget stays correct without any background execution — this is the trick that makes it reliable.
Tapping deep-links into the Tracker via the existing `rovehealth://` scheme.
**Depends on:** Items 1, 2 (App Group entitlement needs the paid Apple team).
**Definition of done:** on a real iPhone (not the simulator): widget on the home screen showing the right day and phase; lock-screen complication working; correct at midnight rollover without opening the app; tap opens the Tracker. Checkpoint in all four phases.
**Size:** 3 days. **Risk:** medium-high — first native target in this project, and the App Group plumbing is fiddly.

### Item 23 — Android widget
Use `react-native-android-widget`, which lets the widget UI be written in JSX and renders it to a real AppWidget — avoiding a Kotlin/Glance implementation entirely. Same content and deep-link behaviour as iOS. Refresh on log save plus a daily alarm.
**Depends on:** Item 1.
**Definition of done:** on a real Android device: widget added from the picker, correct content, survives a reboot, correct after midnight, tap deep-links. All four phases.
**Size:** 2 days.

### Item 24 — Lab analyte dictionary (build this before the OCR)
The unglamorous core of feature 3. Labs name the same test a dozen ways — "Vit D 25-OH", "25 Hydroxy Vitamin D", "VITAMIN D (25-OH)" — and report in different units. A reference table of canonical analytes with alias lists, canonical units, and conversion factors:

TSH, free T3, free T4, haemoglobin, ferritin, vitamin D (25-OH), vitamin B12, HbA1c, fasting glucose, fasting insulin, HOMA-IR (computed, not read), total testosterone, DHEA-S, LH, FSH, prolactin, AMH, and the standard lipid panel.

Scope it to exactly these. Trying to support every analyte on an Indian lab report is how this feature never ships.
**Definition of done:** a seeded reference table; a unit-conversion test suite (ng/mL ↔ nmol/L for vitamin D, µIU/mL for TSH, and the rest); ten real lab reports from different Indian labs mapped by hand to prove the alias lists are adequate.
**Size:** 1.5 days.

### Item 24a — On-device OCR + PII stripping (NEW — required by Decision 12)
The privacy layer that sits between her phone and any AI provider. Nothing identified leaves the device.

- **On-device text extraction.** Apple Vision (iOS) and ML Kit text recognition (Android) both run locally, free, offline. For PDFs, render pages to images first, then recognise. No network call.
- **PII stripping, on-device, before upload.** Remove: patient name, age/DOB, sex, address, phone, email, UHID/patient/registration/accession numbers, referring doctor, and lab account IDs. Use both pattern rules (Indian phone formats, dates, long alphanumeric IDs) and positional heuristics (Indian lab reports concentrate identity in the header block).
- **Show her exactly what we're about to send.** A preview of the de-identified text with removals highlighted, and a "this still shows my name" report button. Never a silent redaction — if we miss something, she must be able to stop it.
- **Fail closed.** If on-device OCR produces unusable text, the fallback is *manual value entry*, **not** "send the raw image to the cloud instead." That fallback would defeat the entire item.
- Keep the redaction map locally so extracted values can be re-attached to her record; it is never uploaded.

**Depends on:** Item 24.
**Definition of done:** ten real lab reports from four different labs produce de-identified text containing **zero** patient names, IDs, or phone numbers — verified by hand, one report at a time; analyte lines survive stripping intact; a report that fails OCR routes to manual entry and makes no network call; the preview screen shows every removal.
**Size:** 1.5 days. **Risk:** medium — Indian lab layouts vary wildly, and a miss here is a privacy incident rather than a bug.

### Item 24b — Provider bake-off: Sarvam Doc AI vs on-device OCR (research spike, 2026-08-01)
Sarvam **does** do document extraction — verified against their docs, not assumed:

| | Finding |
|---|---|
| Product | **Sarvam Doc AI** / Document Digitisation API, powered by **Sarvam Vision** (3B-param VLM purpose-built for Indian-language OCR + document parsing) |
| Modes | **Extract** — schema-based structured fields → JSON/CSV/XLSX (exactly our use case) · **Digitise** — full document → HTML/Markdown/DOCX/text |
| Inputs | PDF, JPEG, PNG · ≤50 MB · **≤10 pages per job** |
| Languages | 22 Indian languages + English |
| Tables | Handles merged cells, multi-level headers, invisible borders — **and an Indian lab report is a table** |
| Pricing | ~₹0.5–1.5 per page (sources disagree — confirm before committing) |
| Compliance claims | DPDPA 2023, SOC 2 Type II, ISO 27001, GDPR/CCPA |

**Why it is a genuinely better fit than Vertex for this one job:** it is trained on Indian document layouts and Indian languages, it is priced per page rather than per token, it returns a schema you define, and the vendor is Indian — which makes the DPDP story simpler rather than a cross-border justification exercise.

**The two things that decide it are NOT documented and must be answered in writing by Sarvam before any commitment:**
1. **Does the public `api.sarvam.ai` train on, or retain, customer uploads — and for how long?** Their privacy policy was not retrievable during this review. Unanswered = disqualifying for blood reports.
2. **Is public-API data actually processed in India?** The data-residency language found publicly attaches to **Arya**, their enterprise/on-prem deployment platform — *not* demonstrably to the public API. Do not assume the two are the same thing.

**The architectural tension this creates — resolve it with measurement, not preference.** Item 24a and Sarvam Doc AI are **alternatives, not complements**: you cannot strip PII on-device *and* send the document to a document-parsing model. Two architectures:

- **A — privacy-max (Item 24a):** on-device OCR → strip PII → de-identified text → any LLM structures it. The document never leaves the phone. Weaker on scanned, regional-language, or badly-formatted reports, because Apple Vision / ML Kit are general-purpose.
- **B — accuracy-max (Sarvam):** send the document, get structured fields. Materially better on hard Indian layouts. But an identified document leaves the phone.

**Recommended resolution — A by default, B as an explicit user choice.** Try on-device OCR first. If the text is clean and the analyte lines parse, use A and nothing leaves the device. If it fails, do **not** silently fall back to the cloud — show her the choice: *"We couldn't read this on your phone. Send it to our India-based processing partner, or type the values in yourself."* Privacy stays the default, accuracy stays available, and the tradeoff becomes hers rather than ours.

This amends Item 24a's fail-closed rule: fail-closed now means *fail to an explicit user choice*, never a silent upload.
**Definition of done:** the same 10 real lab reports run through both architectures, accuracy compared per analyte and written into this file; Sarvam's written answers to questions 1 and 2 above recorded here with a date; a recommendation with numbers behind it.
**Size:** 1 day. **Do this before Item 25 is built, not after.**

### Item 25 — Lab report extraction (de-identified text only)
`expo-document-picker` for PDFs (most Indian lab reports arrive as multi-page PDFs) and `expo-camera` for printed copies. **The document itself is never uploaded to an AI provider** (Decision 12): Item 24a extracts and de-identifies the text on-device, and only that text goes to `/api/lab-report`. That route runs on **Vertex AI, `asia-south1`, paid tier** — a different provider config from every other AI route in the app, and deliberately so — returning `{analyte, value, unit, ref_low, ref_high, flag}` rows, normalised through Item 24's dictionary and stored in a new `lab_results` table with the report date, not the upload date.

The original file goes to the `lab-reports` bucket **only if she opts in to keeping it**; the default is extract-then-delete.
Anything the dictionary doesn't recognise is stored raw and shown as "not yet supported" rather than dropped or guessed.
**Depends on:** Items 3, 24, 24a, 24b (the bake-off picks the provider), and a confirmed paid-tier endpoint (Item 2).
**Definition of done:** ten real reports from at least four different labs, ≥90% of in-scope analytes extracted with correct value *and* unit, zero values silently mis-unit-ed (a wrong unit is far more dangerous than a missed value); **a network trace proving no identified document ever leaves the device**; accuracy recorded here.
**Size:** 2.5 days. **Risk:** high — lab PDF layouts are chaotic.

### Item 26 — Health Passport upgrade: trends + the connection to symptoms
Rebuild `HealthPassport.tsx` around real data: per-analyte value-over-time chart with the reference band shaded behind it, drawn with `react-native-svg` (already a dependency — do not add a charting library for this).

Then the moment that makes the feature: cross-reference out-of-range values against logged symptoms. *"Your ferritin is 11 µg/L, below the reference range. You logged fatigue on 18 of the last 20 days."* Rule-based mapping table, phrased as observation only.

**Three hard requirements:**
1. Every mapping rule and every user-facing string reviewed and signed off by the retained clinician (Item 2) before merge. No exceptions, no "we'll get it reviewed after."
2. Never name a condition, never suggest a treatment or a dose. Describe the value, describe what she logged, stop.
3. **Critical-value escalation must exist and must not be suppressible.** If a value crosses a genuinely urgent threshold, the card says see a doctor — prominently, above any other content.
**Depends on:** Item 25, clinician retained.
**Definition of done:** clinician sign-off recorded in this file with a date; the disclaimer is visible without scrolling; a seeded critical value produces the escalation card; a user with no labs uploaded sees a clean empty state, not a broken screen.
**Size:** 2 days.

### Item 27 — Doctor-ready PDF export
Generate **on-device** with `expo-print` from an HTML template, share via `expo-sharing` (WhatsApp, email, AirDrop, print). On-device generation means the export costs nothing to run and her data never leaves the phone to be assembled — which is also the honest privacy claim to put on the screen.

**Design constraint: two pages maximum.** A gynaecologist has seven minutes. A twelve-page dump gets put down. Contents, in priority order: age and cycle history header; last 6 cycles (start date, cycle length, period length, flow); symptom frequency by phase; mood and sleep trend; medication and supplement adherence; latest labs with reference ranges and trend arrows; and a free-text "questions I want to ask" field she fills in beforehand.

Ship the general **"export all my data"** (JSON + CSV) in the same item — it is nearly the same query layer, and it is what the India DPDP Act's portability right and both app stores' data rules require anyway.
**Depends on:** Items 8, 12, 25, 26 (it summarises everything).
**Definition of done:** a real account with 3 cycles of data produces a legible 2-page PDF that opens correctly in WhatsApp and in a printer dialog; **an actual doctor reviews one and confirms it is usable** — this is the definition of done, not our opinion of it; export-all-data returns a complete, parseable archive.
**Size:** 2.5 days.

### Item 28 — WhatsApp logging
Only start this once Meta verification (Item 2) has actually cleared. Built entirely on Item 20's parser and Item 21's confirmation pattern.

- **Webhook:** `/api/whatsapp/webhook` — GET for Meta's verification challenge, POST for inbound messages. Must return 200 within seconds and do all real work asynchronously, or Meta will retry and duplicate.
- **Account linking:** in-app "Connect WhatsApp" generates a 6-digit code and a `wa.me` deep link pre-filled with `LINK-123456`; the webhook matches the code to a `user_id` and stores a `whatsapp_identities` row. **Never trust an inbound phone number as identity on its own** — numbers get recycled and spoofed, and this table is a direct path to someone else's health data.
- **Text messages:** straight into Item 20's parser.
- **Voice notes:** WhatsApp delivers an audio media ID; download via the Graph API, transcribe with Groq whisper-large-v3, then the same parser.
- **Always reply with what was understood** plus an undo instruction. Same rule as Item 21, and more important here because there is no UI to correct.
- **Rate limit per user per day** and log every inbound message for abuse review.
- Note the platform constraint: free-form replies are only permitted inside the 24-hour customer-service window after her message; anything we initiate outside it needs a pre-approved template. **Verify current India pricing and the health-content rules in Meta's Business Policy before launch** — both have changed recently and neither should be assumed.
**Depends on:** Items 20, 21, and Meta verification cleared.
**Definition of done:** a real WhatsApp message from the founder's phone creates the correct `daily_logs` row and gets a correct confirmation reply; a voice note in Hinglish does the same; an unlinked number gets a linking prompt and writes nothing; replying "no" undoes the last log.
**Size:** 3 days. **Risk:** high, and mostly external. This is why it is last.

---

## PHASE 3 — Release (weeks 7–8)

### Item 29 — Cost and abuse controls
Meal photos are the volume driver: three photos a day per user is three vision calls a day per user. Before launch: per-user daily caps on every AI route (extend the existing `PromptLimitIndicator` mechanism), a PostHog dashboard of calls and estimated spend per feature per day, and a documented kill switch per route. Write the projected cost per active user per month into this file so the number is a decision rather than a surprise on the first invoice.
**Size:** 1 day.

### Item 30 — Store compliance pass
Apple: HealthKit entitlement and privacy strings present; the policy explicitly states health data is not used for advertising; guideline 1.4.1 (medical accuracy, cited sources) satisfied for every lab and nutrition claim. Google: Health Connect declaration form approved, Data Safety section matching reality, permissions justified. Both: camera, microphone, and photo-library usage strings that describe the actual purpose.
**Depends on:** Items 5, 7, 26.
**Definition of done:** both store submissions pass pre-submission review without a metadata rejection.
**Size:** 1.5 days.

### Item 31 — Full QA sweep
Every new surface, in all four cycle phases (ground rule 5), on a real iPhone and a real Android device, in three states: no health source connected, source connected with data, and source connected but empty. Plus: fresh install, upgrade-from-v2 install (existing users must lose nothing), no-network, and permission-denied on each of health, camera, microphone.
**Size:** 2 days.

### Item 32 — Staged rollout
v3.0 to 10% → 50% → 100% on Play, phased release on the App Store, with Sentry crash-rate and PostHog retention gates at each step. v3.1 follows as a separate release once Items 24–28 close.
**Size:** ongoing.

---

## Day-by-day schedule — 32 items, 3 engineers, 7 weeks (35 working days)

**Total build work: 47.5 engineer-days** across three people ≈ 16 days each. The remaining days in this calendar are **not padding** — they are PR review, four-phase checkpoints (ground rule 5), rework from QA, and the overruns that the two high-risk items (4 and 25) will produce. A plan with no slack is a plan that reports "done" three weeks late.

### How to read this

- **One cell = one engineer-day.** `½` means a half-day; two half-day tasks share a cell.
- **`▸`** = continues from the previous day. **`✓`** = item completes that day and goes to PR.
- **⚠** = blocked on a founder or external gate (see Item 2). If that gate isn't clear by the day listed, the cell's fallback is named in the notes under each week.
- **Checkpoint rows** are the phone-testable state that must be true before the next week starts. If a checkpoint fails, fix it before moving on — do not carry a broken week forward.
- Nobody "owns" a track permanently. A, B, C are just three parallel lanes; if someone finishes early they pull the next unblocked item.

---

### Week 1 — foundations (D1–D5)

| Day | Engineer A — health + widgets | Engineer B — food (critical path) | Engineer C — parsing + labs |
|---|---|---|---|
| **D1** | Item 1 — EAS dev build, Android side ⚠ iOS needs Apple acct | ½ Item 3 — Storage buckets + RLS ✓ · ½ Item 11 — food DB, source IFCT 2017 | Item 5 — privacy policy + consent copy ✓ |
| **D2** | Item 1 ▸ iOS dev build ✓ · install on founder's iPhone | Item 11 ▸ staples + household measures | **Parser interface design session with B (AM)** · Item 20 — symptom parser |
| **D3** | Item 4 — health spike, iOS HealthKit reads | Item 11 ▸ ~300–500 composed dishes + GI values | Item 20 ▸ closed-vocabulary + Zod validation |
| **D4** | Item 4 ▸ Android Health Connect · **write up which metrics exist per device** ✓ | ½ Item 11 ✓ · ½ Item 12 — food log schema ✓ | Item 20 ▸ golden set of 40 utterances ✓ |
| **D5** | ½ Item 6 — health schema ✓ · ½ Item 7 — permissions start | Item 13 — food diary screen, day view + edit/delete | Item 21 — voice logging, expo-audio + Groq whisper |

**⚠ Week 1 gates:** Apple Developer account must clear by D2 or A's iOS work stalls — fallback is A pulls Item 23 (Android widget) forward and returns to Item 1 when the account lands. Meta verification and the clinician search must both be *submitted* this week (Item 2); neither blocks week 1 work.

**Checkpoint (end D5):** dev build on the founder's iPhone and one Android device, running the existing Tracker screen unchanged. A written note in this file naming which health metrics each test device actually exposes. Food database queryable with 20 real meals expressible.

---

### Week 2 — the two engines (D6–D10)

| Day | Engineer A | Engineer B | Engineer C |
|---|---|---|---|
| **D6** | Item 7 ▸ grant/deny/partial-grant paths | Item 13 ▸ text search + quantity in household measures | Item 21 ▸ transcript → parser → confirm sheet |
| **D7** | Item 7 ✓ · both platforms on real devices | Item 13 ▸ quick-add from frequents + "I ate what Rove suggested" ✓ | Item 21 ✓ · Hinglish + background-noise test on a real phone |
| **D8** | Item 8 — sync engine, anchors + incremental read | Item 14 — AI food parser, `/api/food-parse` | Item 24 — lab analyte dictionary, aliases + units |
| **D9** | Item 8 ▸ 90-day backfill + idempotency ✓ | Item 14 ▸ golden set of 60 descriptions, ⅓ vague quantities ✓ | ½ Item 24 ✓ · ½ **Item 24a** — on-device OCR (Vision / ML Kit) |
| **D10** | Item 9 — surface in Home snapshot + Insights | Item 16 — correction UI ✓ | Item 24a ▸ PII stripping rules + "what we're sending" preview |

**Checkpoint (end D10):** wear a watch overnight → last night's sleep and resting HR visible in the app the next morning, with no duplicate rows after 5 app restarts. Speak *"aaj do roti aur ek katori dal khaya"* → correct meal logged with macros from the food table.

---

### Week 3 — surfacing and widgets (D11–D15)

| Day | Engineer A | Engineer B | Engineer C |
|---|---|---|---|
| **D11** | Item 9 ▸ **four-phase checkpoint** ✓ | Item 17 — fuel gauge, consumed-vs-target series | Item 24a ✓ hand-verify 10 reports leak zero names/IDs · **Item 24b** — Sarvam bake-off ⚠ needs Sarvam's written answers |
| **D12** | Item 10 — measured activity into diet/workout AI ✓ | Item 17 ▸ gap coaching + glycemic lens | Item 25 — extraction on Vertex `asia-south1` ⚠ needs paid tier |
| **D13** | Item 22 — iOS widget, `@bacons/apple-targets` target | Item 17 ▸ **four-phase checkpoint**, numbers on *and* off ✓ | Item 25 ▸ unit normalisation + network trace proof |
| **D14** | Item 22 ▸ SwiftUI UI + App Group handoff | Item 18 — weekly + by-phase nutrition trends | Item 25 ✓ · ≥90% accuracy across 4 labs |
| **D15** | Item 22 ▸ 7-day pre-computed timeline + lock screen ✓ | Item 18 ✓ · ½ Item 29 — cost caps + PostHog dashboard | Item 26 — Health Passport trends ⚠ needs clinician |

**⚠ D12 gate:** Item 25 needs a confirmed **paid-tier Vertex `asia-south1` endpoint** (Item 2, Decision 12). If billing isn't provisioned, C continues on Item 24a hardening rather than pointing lab data at the free-tier key — that substitution is forbidden, not a fallback.

**⚠ D15 gate:** if no clinician is retained, C skips Item 26 and pulls Item 27 (doctor PDF) forward. **Item 26 must not merge unreviewed** — non-negotiable #6.

**Checkpoint (end D15):** iOS widget on the founder's home screen showing the correct cycle day, still correct after midnight without opening the app. A full day of food logged in under 90 seconds using only quick-add.

---

### Week 4 — v3.0 hardening and release candidate (D16–D20)

| Day | Engineer A | Engineer B | Engineer C |
|---|---|---|---|
| **D16** | Item 23 — Android widget (`react-native-android-widget`) | ½ Item 29 ✓ · **projected cost/user/month written into this file** | Item 26 ▸ symptom cross-reference + critical-value escalation ✓ |
| **D17** | Item 23 ▸ reboot + midnight + deep-link ✓ | Item 31 — QA sweep: fresh install, upgrade-from-v2 | Item 27 — doctor PDF, expo-print template |
| **D18** | Item 30 — store compliance, HealthKit + Health Connect forms | Item 31 ▸ all four phases × 3 health-source states | Item 27 ▸ 2-page constraint + export-all-data ✓ |
| **D19** | Item 30 ▸ Data Safety + privacy strings ✓ | Item 31 ▸ permission-denied and no-network paths ✓ | Item 28 — WhatsApp webhook + linking ⚠ Meta |
| **D20** | **v3.0 release candidate built and signed** | Rework from QA findings | Rework from QA findings |

**Checkpoint (end D20):** v3.0 RC installed on a real iPhone *and* a real Android device, passing every four-phase checkpoint, with a clean upgrade from the current v2 build that loses no existing user data.

---

### Week 5 — v3.0 rollout, v3.1 build (D21–D25)

| Day | Engineer A | Engineer B | Engineer C |
|---|---|---|---|
| **D21** | Item 32 — submit to both stores, Play at 10% | Buffer — carried v3.0 rework | Item 28 ▸ text + voice-note path, rate limits |
| **D22–D23** | Monitor Sentry crash rate + PostHog retention; hotfix lane | Buffer / cut-list items if ahead (Item 18 polish) | v3.1 integration: labs + passport + PDF together |
| **D24–D25** | Play 10% → 50% if crash-free ≥ 99.5% | v3.1 QA support | v3.1 QA support |

**Rollout gates — do not advance on schedule, advance on numbers:** 10% → 50% needs 48h at ≥99.5% crash-free; 50% → 100% needs a further 72h with no retention regression against v2.

---

### Weeks 6–7 — v3.1 (D26–D35)

| Days | Focus |
|---|---|
| **D26–D28** | v3.1 QA sweep — lab extraction across ≥10 real reports, doctor PDF reviewed by an actual doctor (that review *is* the definition of done for Item 27), WhatsApp end-to-end from the founder's own phone |
| **D29–D30** | Clinician sign-off pass on every lab-derived and nutrition-derived string ⚕ · store compliance delta for the new data types |
| **D31–D32** | v3.1 release candidate, rework |
| **D33–D35** | v3.1 staged rollout; v3.0 reaches 100% |

---

### Cross-cutting rules for the whole 35 days

- **Items 14 and 20 are one module with two vocabularies** (Decision 11). The D2 morning design session between B and C is a scheduled task, not a nicety — skip it and you get two near-identical parsers that drift apart by week 3.
- **PR review is not free time.** Every item ends in a PR reviewed by someone else (ground rule 2). Reviews are expected to consume roughly half a day per person per week, and that is already priced into the slack.
- **The founder's real-phone checkpoint** at the end of each week is a blocking gate, not a demo. A week that fails its checkpoint does not roll forward.
- **If the schedule slips, cut in this order:** Item 18 (trends — hurts retention, survivable) → Item 10 (measured activity into the AI plans) → Item 29 down to hard caps only. **Never cut Items 13 or 16** — a food tracker without a usable diary or without the ability to fix a wrong parse is worse than no food tracker, because it produces numbers nobody trusts.
- **v3.0 is the release to protect.** It contains nothing gated on Meta or the clinician, by design (Decision 8). If v3.1 slips a month, v3.0 must still be live.

## Risk register — the six things most likely to hurt

| Risk | Impact | What we do about it |
|---|---|---|
| **Track B is underestimated a second time** | v3.0 slips as a whole, since it is the critical path | Items 11 and 13 are explicitly separated out and sequenced first; barcodes and trends are pre-designated as the cut list; B carries no secondary work after week 1 |
| Meta WhatsApp verification drags for weeks | Item 28 slips indefinitely | Decisions 6 + 8: voice ships first, WhatsApp is in the *second* release and gates nothing |
| Food parsing misreads quantities ("thoda", "ek katori") | Daily totals are wrong, which discredits every number downstream | Golden set of 60 descriptions built before the prompt (Item 14), a third of them deliberately vague; assumed quantities are visibly flagged; correction UI (Item 16) makes a wrong parse a 10-second fix; manual and quick-add (Item 13) mean the tracker works even if the AI disappoints |
| **Lab data reaches a free-tier AI endpoint** | Blood reports used to improve someone else's model; a privacy incident, not a bug | Decision 12: tier verified in week 1 as a founder task; Item 24a strips PII on-device so even a misconfiguration leaks no identity; Item 25's definition of done requires a network trace as proof |
| Deferring photos turns out to be wrong — users expected a camera | Feature 2 under-adopted | `entry_method` telemetry (Item 12) answers this with data within weeks; the v4 design is already written (Items 15, 15a, 19) so building it is ~4 days, not a restart |
| Lab PDFs too varied to parse reliably | Feature 3 stalls | Analyte dictionary first (Item 24), scope hard-capped to ~18 analytes, unknowns shown as unsupported rather than guessed |
| HRV / skin temperature unavailable on the devices our users actually own | Confirmed ovulation never becomes possible | Item 4 spike answers this in week 1, before anything is built on the assumption |
| Apple Developer account delayed | Items 1, 22 and all iOS work blocked | Started day 1 as Item 2; escalate if not through by end of week 1 |

## Non-negotiables carried forward

1. Never modify `frontend/` or `backend/` beyond the new API routes named here.
2. Feature branch → PR → reviewed by someone else. Never merge your own PR.
3. Same Supabase project, same package name `com.rovehealth.app`. Existing users keep their data.
4. **Amended:** every checkpoint on a real device using the **EAS dev build** — Expo Go can no longer run this feature set.
5. Four-phase testing rule still applies to Home, Plan, Plan-detail, Tracker, and now the widgets and Item 17.
6. **New:** no lab-derived or nutrition-derived health claim merges without clinician sign-off recorded in this file, with a date.
7. **New:** no AI-derived log is ever written silently. She sees what we understood and can correct it, every time.
8. **New:** calorie numbers are off by default (Decision 9), and no screen ever congratulates a user for eating less. Every food-logging PR is checked against this.
