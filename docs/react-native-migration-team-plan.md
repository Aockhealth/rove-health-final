# Rove Health — React Native Migration: Day-by-Day Checklist

_Last updated: 2026-07-19 (v3 — restructured from 3 named tracks into a shared checklist anyone on the team can pick up. Technical decisions (library choices, safety rules) live in [react-native-migration-plan.md](react-native-migration-plan.md) — read that first._

## How to use this document

This is a **backlog of self-contained tasks**, not a roster. Nobody owns "Track A" — anyone free picks the next unclaimed item whose dependencies (listed under each item) are done. Each item is sized to roughly one working day and written so a person who has never seen this codebase can research and complete it without asking what to build.

**Claiming a task:** write your name next to it in this file (or your team's task board) and open a branch. **Definition of done** at the bottom of each item is what a reviewer checks before merging — it's phone-testable wherever possible, per the project's checkpoint rule.

**Sizing:** ~28 items, most 0.5–2 days. With 3 people working in parallel where dependencies allow, this lands at **~4 weeks (20 working days) to a release candidate**, then ~1 week of Play Store review/rollout.

## Verified status as of 2026-07-19 — read this before claiming anything

A code audit found more already built than the last update assumed. **Do not redo any of this:**

| Done | Evidence |
|---|---|
| Phase 0 Expo skeleton | Committed `8720d92` |
| Pinned to Expo SDK 54 | `mobile/package.json` — do not upgrade the SDK mid-project (Expo Go on the founder's iPhone depends on this) |
| Login, Signup, Forgot password, Reset password, **Verify OTP** screens | `mobile/src/app/(auth)/*.tsx` — 5 screens, all genuinely wired to `supabase.auth.*` calls, not placeholders. Verify-OTP was a bonus screen not in the original inventory. |
| 6 UI kit components | `Button`, `Card`, `Input`, `Badge`, `Avatar`, `AnimatedBackground` in `mobile/src/components/ui/` |
| Brand fonts loaded | Inter, Outfit, Cormorant Garamond wired in `mobile/src/app/_layout.tsx` |
| Deep link scheme registered | `rovehealth://` set in `mobile/app.json` — **not yet handled anywhere** (see Item 2) |

**Explicitly NOT done yet** (checked directly): session persistence (`index.tsx` still hard-redirects to login with a TODO comment), any deep-link handler, the rest of the UI kit (sheets, dialogs, selects, toasts, accordion), all 26 app screens, both risk spikes, the shared-logic package, and everything in native polish / testing / release.

## Ground rules (non-negotiable, unchanged)

1. Never modify `frontend/` or `backend/` except the shared-logic extraction (Item 8), which must keep all existing web tests green.
2. Feature branch off `react-native-migration` → PR → review by someone else before merging. Never merge your own PR. Branch must always build and run in Expo Go, on **SDK 54**.
3. Same Supabase project, same package name `com.rovehealth.app`, same API routes on rovehealth.in.
4. Every checkpoint on a **real phone** — Expo Go on the founder's iPhone day-to-day; a real Android device before release, never emulator-only.
5. **Four-phase testing rule:** Home, Plan, Plan-phase-detail, and Tracker are each *one* screen whose content/art/color swap by cycle phase. Build once, but the checkpoint must be run in **all four phases** (menstrual/follicular/ovulatory/luteal) — temporarily edit the cycle start date on a test account to land in each one.
6. The current Capacitor app stays live on the Play Store until the RN app finishes staged rollout.
7. Stuck more than 30 minutes → post in team chat with what you tried. Silent blocking is the only real way to fall behind on a shared checklist.

---

## Phase 1 — Finish the foundation (no dependencies, start immediately)

### [ ] 1. Session persistence + app entry logic
**What:** `mobile/src/app/index.tsx` currently always redirects to `/login`. It needs to check for a real Supabase session and route accordingly.
**Research:** `@supabase/supabase-js` session handling + `expo-secure-store` for token storage (already a dependency in `package.json`, unused so far). Look at how `frontend/src/app/providers.tsx` and `frontend/src/lib/supabase` (client) handle auth state on web for the equivalent logic.
**Build:** wire Supabase's session storage to `expo-secure-store` (custom storage adapter), add a loading state while the session check runs, redirect to the home hub if logged in, login if not.
**Definition of done:** log in on your phone, force-quit the app, reopen it — you land on the home stub (or a placeholder screen) without re-entering credentials. Log out — you land back on login.

### [ ] 2. Deep links for password reset
**What:** the `rovehealth://` scheme is registered but nothing listens for the incoming link from a password-reset email.
**Research:** Expo Router's automatic deep-link handling (file-based routes already respond to `rovehealth:///reset-password`); check what the reset-password email template actually sends (Supabase auth email templates, likely in Supabase dashboard or `supabase/` config) — the link format must match a route you have.
**Build:** confirm `mobile/src/app/(auth)/reset-password.tsx` correctly reads the token/params from the incoming link and calls the right Supabase method.
**Definition of done:** request a password reset on your phone, tap the email link — the app opens directly to the reset screen with the reset flow working.

### [ ] 3. Play Store signing-key verification ⚠️ do this in week 1, not later
**What:** the one irreversible risk in the whole project.
**Research:** Play Console → your app → Setup → App signing. Determine whether Google Play App Signing is enabled (likely, since the app already ships) and locate the existing upload keystore used for `com.rovehealth.app`.
**Build:** nothing to code — this is a verification + backup task. Back up the keystore file in two separate places (e.g. password manager + a second cloud drive).
**Definition of done:** written confirmation (a note in this repo's `docs/` or shared with the founder) of where the keystore lives and that it's backed up twice.

### [ ] 4. Rest of the UI kit
**What:** the design system needs the components no screen has needed yet: Sheet/bottom-sheet, Dialog/Modal, Select/Dropdown, Toast, Accordion (the tracker screen is built from accordion cards — see `frontend/src/app/cycle-sync/tracker/components/TrackerAccordion.tsx`), Skeleton/loading states, Tabs.
**Research:** compare against every component in `frontend/src/components/ui/` — that's the full source-of-truth list to port. Toasts → `sonner-native` per the library mapping in the main plan.
**Build:** one file per component in `mobile/src/components/ui/`, matching the visual language of the 6 already built (check `Button.tsx`/`Card.tsx` for the established style conventions).
**Definition of done:** a component-gallery demo screen (`mobile/src/app/gallery.tsx` or similar, removable before release) showing every component, checked side-by-side against the equivalent web component.

### [ ] 5. Theme token completeness check
**What:** confirm every design token from the web app exists in the mobile NativeWind config, not just fonts.
**Research:** `frontend/src/app/globals.css` — specifically the phase colors (`--phase-menstrual-rgb`, `--phase-follicular-rgb`, `--phase-ovulatory-rgb`, `--phase-luteal-rgb`) and the paper background (`--color-paper: #FAF9F6`). Compare against `mobile/tailwind.config.js`.
**Build:** add any missing tokens (the four phase colors are the most likely gap — they drive every phase-aware screen in Phase 3 below).
**Definition of done:** a small test screen renders all four phase colors and the paper background correctly on device.

---

## Phase 2 — Risk spikes (start after Item 4/5 land or in parallel — these don't depend on the UI kit)

### [ ] 6. Voice spike — ElevenLabs in React Native
**What:** prove `@elevenlabs/react-native` works before any screen depends on it.
**Research:** mic permissions on iOS (`Info.plist` via `app.json` `ios.infoPlist`) and Android, streaming audio playback in Expo.
**Build:** a throwaway test screen that records/streams and plays back one exchange.
**Definition of done:** works on a real phone. **If it fails, write the fallback decision here in this doc** (most likely: the voice/chat screen ships as an in-app webview of the live site instead of native) — flag to the founder for sign-off before Item 19 (AI chat) is claimed.

### [ ] 7. Chart spike — victory-native
**What:** prove one chart from Insights can be rebuilt natively before claiming the full Insights screen.
**Research:** `frontend/src/components/cycle-sync/insights/` — pick the simplest card (e.g. `CycleOverviewCard.tsx`) as the one to rebuild.
**Build:** the same chart, same data shape, in `victory-native`.
**Definition of done:** visually matches the web version side-by-side on device.

---

## Phase 3 — Shared logic (start anytime; blocks nothing else, but screens should switch to it once ready)

### [ ] 8. Shared-logic package extraction
**What:** move pure TypeScript (no React, no DOM) out of `frontend/` into something both `frontend/` and `mobile/` import — cycle-phase math, Zod schemas, onboarding logic.
**Research:** `shared/cycle/` (already partially separated) and `frontend/src/lib/schemas.ts` — anything with zero React/DOM imports is a candidate.
**Build:** confirm/extend the `shared/` package, update `frontend/`'s imports to point at it, run the full existing test suite (`npm test` at repo root, plus `comprehensive_cycle_logic_test` if that's a named script — check `package.json`).
**Definition of done:** the website builds and every existing test passes unchanged. Until this lands, screen-builders (Phase 4) may temporarily copy-paste the logic they need and switch the import later — don't block on this.

---

## Phase 4 — Screens (each item below depends on: Items 1, 4, 5 done; phase-aware ones also need Item 8 or a temporary copy of the logic)

For every item in this phase, the **reference is the equivalent page in `frontend/src/app/cycle-sync/`** (paths given per item) plus any component folder listed. Read the web version fully before writing any native code — that page *is* the spec.

### [ ] 9. Home hub (dashboard)
**Reference:** `frontend/src/app/cycle-sync/page.tsx` (the "Daily Flow River"), `frontend/src/components/cycle-sync/RiverTrack.tsx`, `WelcomeTour.tsx`, `ProfileAvatar.tsx`.
**Note:** this screen was missing from the original plan entirely — it's the first thing a logged-in user sees.
**Definition of done:** side-by-side with the website on the same account, same data — checked in **all four phases** (ground rule 5).

### [ ] 10. Tracker — shell + first 6 logging cards
**Reference:** `frontend/src/app/cycle-sync/tracker/page.tsx` and `.../tracker/components/` — this folder has 18 card components; split across two checklist items so no single person is blocked for 4 days straight. Take: `Header`, `CalendarCard`, `CurrentPhaseBadge`, `FlowCard`, `PeriodLoggingCard`, `QuickPhaseLog`.
**Definition of done:** these 6 cards render and save data correctly against a real account, in all four phases.

### [ ] 11. Tracker — remaining 12 logging cards
**Reference:** same folder as Item 10 — the rest: `MoodsCard`, `SleepCard`, `SymptomsCard`, `WaterIntakeCard`, `ExerciseCard`, `DischargeCard`, `DisruptorsCard`, `NoteCard`, `SelfLoveCard`, `SexualWellnessCard`, `EditCycleBanner`, `SaveButton`, plus wiring them into `TrackerAccordion`.
**Depends on:** Item 10 (shares the same screen shell).
**Definition of done:** full tracker screen matches the website card-for-card, in all four phases, and a save persists correctly.

### [ ] 12. Plan (overview)
**Reference:** `frontend/src/app/cycle-sync/plan/page.tsx`. Note this page also links out to Rove Chef, Exercise builder, and Workout history — those are separate items (14/25/26), just build the overview screen's own content here.
**Definition of done:** side-by-side check, all four phases.

### [ ] 13. Plan phase detail
**Reference:** `frontend/src/app/cycle-sync/plan/[phase]/page.tsx` — one template, four phases (menstrual/follicular/ovulatory/luteal), driven by `phase-data` and `PHASE_ACCENT`. Also review `.../plan/[phase]/components/ExerciseDemo.tsx`.
**Definition of done:** all four phase variants checked individually against the website.

### [ ] 14. Plan setup wizard
**Reference:** `frontend/src/components/cycle-sync/PlanSetupWizard.tsx`.
**Definition of done:** completing the wizard on a test account produces the same saved plan data as the website.

### [ ] 15. Insights
**Reference:** `frontend/src/app/cycle-sync/insights/page.tsx` + all 5 cards in `frontend/src/components/cycle-sync/insights/` (`AiAnalysisCard`, `CycleOverviewCard`, `HabitsOverviewCard`, `MentalHealthCheckCard`, `PhaseInsightCard`).
**Depends on:** Item 7 (chart spike) resolved.
**Definition of done:** all 5 cards render real data matching the website.

### [ ] 16. Learn (article library)
**Reference:** `frontend/src/app/cycle-sync/learn/page.tsx` + `frontend/src/components/cycle-sync/learn/` (`LearnHero`, `ContentRow`, `ArticleCard`, `LearnSkeleton`).
**Definition of done:** article list matches website, loading skeleton works.

### [ ] 17. Learn article reader
**Reference:** `frontend/src/app/cycle-sync/learn/[id]/page.tsx`, `ArticleControls.tsx`, `ArticleTracker.tsx`.
**Research:** `react-native-markdown-display` for rendering article body content (per the library mapping in the main plan).
**Definition of done:** open an article from Item 16's screen, content renders correctly, reading-progress tracking works.

### [ ] 18. Profile
**Reference:** `frontend/src/app/cycle-sync/profile/page.tsx` + all of `.../profile/components/` (`AccountSettings`, `CycleSignature`, `HealthPassport`, `LuxurySelect`) — three real sub-sections, not one flat screen.
**Definition of done:** each of the three sub-sections works and matches the website with real account data.

### [ ] 19. AI chat with voice
**Reference:** `frontend/src/components/cycle-sync/ChatInterface.tsx` (905 lines — the largest single component in the app) and `ChatWidget.tsx` (how it's triggered — a floating button on every core screen, not a menu item).
**Research:** calls the existing `/api/ai-chat` and `/api/chat` routes on rovehealth.in — no backend work needed. `StructuredResponseRenderer.tsx` shows how responses are formatted.
**Depends on:** Item 6 (voice spike) resolved — including its fallback decision if voice failed.
**Definition of done:** a full conversation round-trips correctly, matches web behavior, voice works (or the agreed webview fallback is in place).

### [ ] 20. Wellbeing intro
**Reference:** `frontend/src/app/cycle-sync/wellbeing/intro/page.tsx`.
**Definition of done:** matches website.

### [ ] 21. Wellbeing assessment
**Reference:** `frontend/src/app/cycle-sync/wellbeing/assessment/page.tsx` — a question-by-question flow with a progress bar.
**Definition of done:** completing the assessment on a test account saves the same result the website would.

### [ ] 22. Rove Chef
**Reference:** `frontend/src/components/cycle-sync/RoveChef.tsx` (552 lines) + `frontend/src/components/cycle-sync/diet/` (`DietCheatSheet`, `MacroFuelGauge`, `SymptomDecoder`).
**Definition of done:** matches website functionality for a test account.

### [ ] 23. Exercise builder
**Reference:** `frontend/src/components/cycle-sync/ExerciseBuilder.tsx` (475 lines), `ExerciseOrb.tsx`.
**Definition of done:** matches website.

### [ ] 24. Workout history
**Reference:** `frontend/src/components/cycle-sync/WorkoutHistory.tsx` (491 lines), `WeightProgressCard.tsx`.
**Definition of done:** matches website with real account data.

### [ ] 25. Guided workout session player
**Reference:** `frontend/src/app/cycle-sync/plan/[phase]/components/GuidedSession.tsx` — a full-screen player experience, dynamically loaded on web.
**Definition of done:** a full guided session plays through correctly on device.

### [ ] 26. Marketing webviews
**Reference:** Shop (`(marketing)/shop/`), Science, Story, Ingredient glossary, Privacy, Privacy pledge — per the main plan, these become **one reusable in-app browser screen** pointed at the live URLs, not six separate native rebuilds.
**Definition of done:** a test shop order completes end-to-end inside the webview.

---

## Phase 5 — Native polish (claimable once most of Phase 4 is merged)

### [ ] 27. Splash screen, status bar, app icons, offline caching, push scaffolding
**Reference:** current Capacitor config at `frontend/capacitor.config.ts` (splash/status bar colors to match) and `resources/` (existing icon source files).
**Build:** splash + status bar parity, app icons, offline caching of learn content and last-known cycle data via MMKV + TanStack Query persist, push-notification scaffolding for phase reminders.
**Definition of done:** airplane-mode test — app opens and shows cached data.

### [ ] 28. EAS build profiles + analytics/error reporting
**Build:** EAS build profiles (dev/preview/production), PostHog wired in (`posthog-react-native` per the library mapping), crash/error reporting.
**Definition of done:** a preview build installs via EAS on a real device; a test event shows up in PostHog.

---

## Phase 6 — Testing and release (whole team, after Phase 4 + 5 are merged — do not compress this phase)

- Write and run a full manual test script on real devices, **including at least one real Android phone**.
- Maestro e2e tests for the critical paths: login, tracker, AI chat.
- Fix everything the bug bash finds. No new features once this phase starts.
- Signed release build (versionCode above current, using the keystore verified in Item 3), uploaded to the Play Console internal testing track.
- Whole team + founder install from the Play Store internal link and re-run the checklist.
- Staged rollout 10% → 50% → 100%, watching crash-free rate and PostHog between steps.
- Capacitor app stays in the repo, unused, for one month as fallback.
- In parallel, nearly free with Expo: start an iOS TestFlight build as a fast-follow.

## If something's blocked

| If… | Then… |
|---|---|
| Voice spike (Item 6) fails | Ship AI chat (Item 19) as an in-app webview instead. Note the decision in this doc. Costs no schedule time. |
| A screen's dependency isn't merged yet | Copy the logic you need temporarily and switch the import once the dependency lands — don't sit idle. |
| Testing phase (Phase 6) finds a lot of bugs | The release date moves, not the quality bar — this project ships complete, not fast. |
| Play review is slow | Nothing to do — it's Google's clock. Use the time on the iOS build. |

## Founder's role

- Whenever a screen item is marked done, install the latest build and check it yourself — your sign-off is what actually closes an item, not just code review.
- Tiebreaker on the voice fallback decision (Item 6) if the spike fails.
- Final approval on the internal-track release build before staged rollout begins (Phase 6).
