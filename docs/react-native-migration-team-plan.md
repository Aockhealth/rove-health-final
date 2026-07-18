# Rove Health — React Native Migration: 3-Engineer Team Plan

_Last updated: 2026-07-18 (v2 — full screen inventory added; schedule extended to ship the complete app with nothing deferred). Technical decisions (library choices, safety rules, phase checkpoints) live in [react-native-migration-plan.md](react-native-migration-plan.md) — read that first. This doc turns it into parallel workstreams with day estimates._

## Timeline at a glance

- **~20 working days (4 weeks) to a release candidate**, then **~1 week of Play Store review + staged rollout** (calendar time, not effort).
- v1 of this plan estimated 15 days but missed hidden scope (see screen inventory below). The founder chose **completeness over speed**: every screen ships in v1, nothing is deferred to a follow-up update.

## Where we are today (verified 2026-07-18)

- ✅ Phase 0 done and committed (`8720d92`): Expo skeleton in `mobile/`, on branch `react-native-migration`.
- ✅ Project pinned to **Expo SDK 54** (downgraded from 57 so the app runs in Expo Go on the founder's iPhone — do not upgrade the SDK mid-project).
- 🟡 **Uncommitted work exists**: auth screens (`mobile/src/app/(auth)/`), `mobile/src/lib/supabase.ts`, and 5 UI components. **Day 1 task: review, test, and commit this.**

## Complete screen inventory (from code audit of `frontend/src`)

**31 destinations; ~26 native builds.** All of it ships in v1.

| Area | Screens | Count |
|---|---|---|
| Auth (Track B) | Login, Signup, Forgot password, Reset password | 4 |
| Onboarding (Track B) | One flow, 5 step-screens: Welcome, Intro, About You, History, Goals | 5 |
| Core routes | Home hub ("Daily Flow River" dashboard), Tracker (18 logging cards — biggest single screen), Plan, Plan phase detail, Insights (5 cards + charts), Learn, Learn article reader, Profile (3 sub-sections), Wellbeing intro, Wellbeing assessment | 10 |
| Full-screen experiences (hidden inside pages on web; own screens in RN) | AI chat with voice (905 lines, largest component), Guided workout session player, Rove Chef (552 lines), Exercise builder (475 lines), Workout history (491 lines), Plan setup wizard | 6 |
| Webviews (one reusable in-app browser screen) | Shop, Science, Story, Ingredient glossary, Privacy, Privacy pledge | 6 dest. / ~1 build |
| Not needed | Marketing landing page (app opens to login/home); splash/loading/error are part of the app shell | — |

**One template, four costumes:** Home, Plan, Plan-phase, and Tracker are single screens whose content, artwork, and accent colors change with the cycle phase (menstrual / follicular / ovulatory / luteal). They are built **once** — but must be tested **four times** (see testing rule below).

## Team structure

| | Track | Owns |
|---|---|---|
| **Engineer A** | Design system & core screens | UI kit, theme parity, tracker, home hub, plan + phase detail, insights. Integration lead: reviews all PRs touching `mobile/src/components/ui`. |
| **Engineer B** | Auth & user flows | Auth, onboarding, profile, wellbeing, plan setup wizard, workout history, marketing webviews, EAS/analytics setup. |
| **Engineer C** | Platform & risk | Risk spikes (voice, charts), shared-logic package, AI chat, learn, Rove Chef, exercise builder, guided session player, native polish, release. |

## Ground rules (non-negotiable)

1. `frontend/` and `backend/` are never modified except the shared-logic extraction (Phase 3), which must keep all existing web tests green.
2. Feature branches off `react-native-migration`; PR + review before merge; the branch must always build and run via Expo Go / EAS. Stay on **Expo SDK 54**.
3. Same Supabase project, same package name `com.rovehealth.app`, same API routes on rovehealth.in.
4. Every checkpoint happens on a **real phone** (founder's iPhone via Expo Go day-to-day; a real Android device before release — never emulator-only).
5. **Four-phase testing rule:** for phase-aware screens (home hub, plan, plan phase detail, tracker), the side-by-side checkpoint must be run in **all four phases** — temporarily adjust the cycle start date on a test account to land in each phase. A bug can hide in just one variant (e.g. longer luteal content overflowing a layout).
6. The Capacitor app stays live on the Play Store until the RN app has completed staged rollout.

## Week 1 — Foundation, risk, and first screens (Days 1–5)

**Day 1 (everyone):**
- Setup, EAS access, walk through `frontend/src` and both plan docs.
- Review + commit the existing uncommitted `mobile/` work.
- **Eng C: verify Play Store signing-key situation TODAY** (Play Console → Setup → App signing) and back up any keystore in two places — the one irreversible risk in the project.

**Days 1–3:**
- **Eng A:** finish the design system — theme tokens from `globals.css`, fonts, remaining UI kit (sheets, dialogs, selects, toasts). Component-gallery demo screen. ✅ _Checkpoint: gallery matches web side-by-side._
- **Eng B:** finish auth — SecureStore sessions, `rovehealth://` deep links for password-reset, error states. ✅ _Checkpoint: real login survives app restart._
- **Eng C:** risk spikes — ElevenLabs voice (mic permissions, streaming audio) and one chart in victory-native. **Voice fallback decision (in-app webview) by end of Day 3 if the spike fails.** ✅ _Checkpoint: voice + chart demos on device._

**Days 4–5:**
- **Eng A:** start **tracker** (18 logging cards — budget 4 days total).
- **Eng B:** start **onboarding** (5 steps; verify saved data appears on the website under the same account).
- **Eng C:** **shared-logic package** (cycle math, schemas) imported by both web and mobile; full existing web test suite must pass. A and B stub imports until this lands (~Day 5), then switch.

## Weeks 2–3 — All screens (Days 6–15)

| Days | Eng A | Eng B | Eng C |
|---|---|---|---|
| 6–8 | Finish **tracker** ✅ (4-phase check) | Finish **onboarding** ✅ (6–7); **Profile** ✅ (8–9) | **AI chat** incl. voice ✅ (streaming, markdown) |
| 9–10 | **Home hub** ✅ (4-phase check) | **Wellbeing** intro + assessment ✅ (10) | **Learn** + **article reader** ✅ |
| 11–13 | **Plan** + **phase detail** ✅ (4-phase check) | **Plan setup wizard** ✅ (11); **Workout history** ✅ (12–13) | **Rove Chef** ✅ (11–12); **Exercise builder** ✅ (13) |
| 14–15 | **Insights** ✅ (charts) | **Marketing webviews** ✅ (14; test shop order completes); **EAS build profiles + PostHog + error reporting** (15) | **Guided workout session player** ✅ |

✅ _Checkpoint per screen: side-by-side with the website on the same account — same data, same numbers. Phase-aware screens: all four phases. A screen merges only after this check._

## Week 4 — Polish, testing, release candidate (Days 16–20)

**Days 16–17:**
- **Eng A:** visual QA pass on every screen, including the four-phase sweep.
- **Eng B:** write + start the full manual test checklist.
- **Eng C:** native polish — splash screen, status bar, app icons from `resources/`, offline caching (MMKV + TanStack Query persist), push-notification scaffolding. ✅ _Checkpoint: airplane-mode test._

**Days 18–19 (everyone): bug bash.**
- Full manual script on real devices — **including at least one real Android phone**.
- Maestro e2e tests: login, tracker, chat.
- Fix everything found. **No new features after Day 17.**

**Day 20: release build.**
- versionCode above current (3), signed per the Day-1 verification.
- Upload to Play Console **internal testing track**; team + founder install from the Play Store link and re-run the checklist.

✅ _End-of-week-4 checkpoint: release candidate installed from Play Store internal track, checklist 100% green._

## Week 5 — Rollout (calendar time)

- Staged rollout 10% → 50% → 100%, watching crash-free rate and PostHog between steps.
- Engineers on bug-fix duty; non-blocking issues go to a backlog.
- Capacitor code stays in the repo, unused, for one month as fallback.
- In parallel (near-free with Expo): iOS TestFlight build → App Store as fast-follow.

## What can slip, and what to do

| If… | Then… |
|---|---|
| Voice spike fails (Day 3) | Voice screen ships as an in-app webview (the feature still works); native voice revisited post-launch. Costs 0 days. |
| Tracker takes longer than 4 days | It's the hardest screen — B or C picks up home hub so A stays on tracker. |
| Screens run over in weeks 2–3 | Extend build by up to 3 days before touching the testing week. **The testing week (Days 16–20) is never compressed** — completeness includes quality. |
| Play review is slow | Nothing to do — Google's clock. Use the time on the iOS build. |

## Founder's role

- **End of each week:** install the latest build and run that week's checkpoints on your phone. Your sign-off gates the next week.
- **Day 3:** tiebreaker on the voice fallback decision if the spike fails.
- **Day 20:** approve the internal-track build before staged rollout begins.
