# Rove Health — React Native Migration: Day-by-Day Checklist

_Last updated: 2026-07-19 (v4 — this is now the single source of truth; the earlier `react-native-migration-plan.md` has been folded in and deleted). Shareable Word version: `Rove-Health-RN-Migration-Intern-Plan.docx` in this same folder._

## Project context

- **Website:** Next.js app at rovehealth.in — 22 screens, ~110 components. Keeps running untouched throughout the migration.
- **Current Android app:** a Capacitor shell that loads the live website in a webview (`com.rovehealth.app`, already on the Play Store). It stays live until the RN app finishes staged rollout.
- **Backend:** Supabase (accounts, cycle data), Next.js API routes (AI chat, learn, Shopify), OpenAI/Gemini, Pinecone, Upstash. **None of this changes** — the RN app talks to the exact same backend, so existing users keep their accounts and data automatically.
- **What "converting to React Native" means:** the ~110 UI components get rebuilt as true native UI. Reused as-is: the Supabase database, all API routes, and the pure-TypeScript business logic (cycle math, Zod schemas). Rewritten: every screen's UI, navigation (Next.js routing → Expo Router), animations (framer-motion → Reanimated), local storage, splash screen, status bar.

## Library mapping (decided up front so there are no mid-project surprises)

| Today (web) | React Native replacement | Risk |
|---|---|---|
| Next.js App Router | Expo Router (file-based, very similar) | Low |
| Tailwind CSS | **NativeWind** (same Tailwind classes — biggest reuse win) | Low |
| TanStack Query | Same library, works in RN | None |
| Supabase (`@supabase/ssr`) | `@supabase/supabase-js` + SecureStore session | Low |
| framer-motion | react-native-reanimated + moti | Medium |
| lucide-react icons | lucide-react-native | Low |
| sonner toasts | sonner-native | Low |
| @nivo/pie charts | victory-native | Medium |
| react-markdown | react-native-markdown-display | Low |
| canvas-confetti | react-native-confetti-cannon or Lottie | Low |
| idb-keyval (offline cache) | react-native-mmkv | Low |
| posthog-js | posthog-react-native | Low |
| ElevenLabs voice (`@11labs/react`) | `@elevenlabs/react-native` | **High — verify early (Item 6 spike)** |
| Serwist PWA / service worker | Not needed (it's a native app) | — |

## Decisions log (so the reasoning isn't lost)

- **iOS testing devices:** day-to-day checkpoints run on the founder's iPhone via Expo Go — same code builds both platforms. From the voice spike (Item 6) onward, custom native modules need an Apple Developer account ($99/yr — needed anyway for the App Store launch) to install on the iPhone directly; until purchased, fall back to the iOS simulator on the Mac. **Ship both Play Store and App Store at release, not iOS as an afterthought** (Phase 6 already schedules the TestFlight build as a fast-follow).
- **Offline logging (writing new data with no signal) is explicitly out of scope for v1.** Researched how Flo and Clue handle this: Flo caches new log entries on-device and syncs when back online; Clue deliberately *removed* most offline functionality in a redesign because offline sync was their biggest source of data loss and bugs. Given that a mature, funded competitor got burned by exactly this, v1 requires a live connection to save a new log entry. Viewing already-cached data offline (Item 27) is still in scope. Revisit true offline writes as a deliberate v1.1+ project with its own conflict-resolution design if the founder wants it later.
- **App Store internet-requirement note:** Apple has no rule against apps requiring internet — the vast majority of apps do. What reviewers check is graceful failure with no connection (a clean "no internet" message, never a crash or infinite spinner). Build this into each screen's normal loading/error states rather than as a separate checklist item — check it as part of every screen's Definition of done.
- **Play Store signing-key verification (Item 3) moved from Phase 1 to Phase 6** — founder's explicit decision (2026-07-19). Originally scheduled for week 1 precisely so a signing problem would be caught with weeks of runway to fix it; doing it right before release instead means any issue found there has no buffer and could delay the release date directly. Accepted knowingly — do not silently move it back or forward again without asking.

## How to use this document

This is a **backlog of self-contained tasks**, not a roster. Nobody owns "Track A" — anyone free picks the next unclaimed item whose dependencies (listed under each item) are done. Each item is sized to roughly one working day and written so a person who has never seen this codebase can research and complete it without asking what to build.

**Claiming a task:** write your name next to it in this file (or your team's task board) and open a branch. **Definition of done** at the bottom of each item is what a reviewer checks before merging — it's phone-testable wherever possible, per the project's checkpoint rule.

**Sizing:** ~30 items (Item 29 added 2026-07-19 — see below), most 0.5–2 days. With 3 people working in parallel where dependencies allow, this lands at **~4 weeks (20 working days) to a release candidate**, then ~1 week of Play Store review/rollout.

## Verified status as of 2026-07-19 — read this before claiming anything

A code audit found more already built than the last update assumed. **Phase 1 is done except Item 3 (moved to Phase 6 — see Decisions log). Do not redo any of this:**

| Done | Evidence |
|---|---|
| Phase 0 Expo skeleton | Committed `8720d92` |
| Pinned to Expo SDK 54 | `mobile/package.json` — do not upgrade the SDK mid-project (Expo Go on the founder's iPhone depends on this) |
| Login, Signup, Forgot password, Reset password, **Verify OTP** screens | `mobile/src/app/(auth)/*.tsx` — 5 screens, all genuinely wired to `supabase.auth.*` calls, not placeholders. Verify-OTP was a bonus screen not in the original inventory. |
| **Item 1 — Session persistence** | `mobile/src/app/index.tsx` checks `supabase.auth.getSession()`, shows a loading state, redirects to `/(app)/home` or `/(auth)/login` correctly |
| **Item 2 — Deep links for password reset** | `mobile/src/app/(auth)/reset-password.tsx` uses `expo-linking` to parse the incoming email link and calls `supabase.auth.setSession()` |
| **Item 4 — Rest of the UI kit** | `Accordion`, `BottomSheet`, `Dialog`, `Select`, `Skeleton`, `SegmentedControl` built, `sonner-native` added for toasts, all exercised in `mobile/src/app/gallery.tsx` |
| **Item 5 — Theme token completeness** | All four phase colors + paper background present in `mobile/tailwind.config.js`, matching `globals.css` |
| Brand fonts loaded | Inter, Outfit, Cormorant Garamond wired in `mobile/src/app/_layout.tsx` |

**Explicitly NOT done yet** (checked directly, by reading the actual files — not by trusting this doc's own checkboxes, which had drifted stale more than once): Item 3 (signing-key verification — deliberately deferred to Phase 6, see Decisions log), both risk spikes (Items 6/7), Item 9b (tab shell — though the 5-tab navigator already exists and looks functional; not re-verified against 9b's full definition of done), Items 10/11 (Tracker — genuinely an 11-line stub), 18 (Profile — only the header avatar button exists), 19 (AI chat — no files, no ElevenLabs dependency), 25 (Guided session player), 26 (Marketing webviews — dependency installed, unused, this also covers Privacy/Privacy pledge), **29 (post-signup onboarding wizard — not even tracked in this doc until today; zero files, new users currently skip it entirely on mobile)**, and everything in native polish / testing / release. Item 27 (splash/icons/status bar/offline/push) is **partially** done — icons, basic splash, and status bar exist; offline caching (MMKV) and push scaffolding don't. Items 9, 12, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24 are code-complete but still need the real-phone checkpoint per ground rule 4 before they're truly closed out. **Before assuming any `[ ]` item here is unbuilt, actually read the relevant files first** — several were already substantially built and just never got their checkbox updated.

## Ground rules (non-negotiable, unchanged)

1. Never modify `frontend/` or `backend/` except the shared-logic extraction (Item 8), which must keep all existing web tests green.
2. Feature branch off `react-native-migration` → PR → review by someone else before merging. Never merge your own PR. Branch must always build and run in Expo Go, on **SDK 54**.
3. Same Supabase project, same package name `com.rovehealth.app`, same API routes on rovehealth.in.
4. Every checkpoint on a **real phone** — Expo Go on the founder's iPhone day-to-day; a real Android device before release, never emulator-only.
5. **Four-phase testing rule:** Home, Plan, Plan-phase-detail, and Tracker are each *one* screen whose content/art/color swap by cycle phase. Build once, but the checkpoint must be run in **all four phases** (menstrual/follicular/ovulatory/luteal) — temporarily edit the cycle start date on a test account to land in each one.
6. The current Capacitor app stays live on the Play Store until the RN app finishes staged rollout.
7. **No-internet graceful failure:** every screen must show a clean "no connection" message when offline, never a crash or an infinite spinner — this is what App Store review actually checks for (Apple doesn't require offline support, but does reject apps that break with no signal). Check this as part of every screen's Definition of done, not as a separate task.
8. Stuck more than 30 minutes → post in team chat with what you tried. Silent blocking is the only real way to fall behind on a shared checklist.

---

## Phase 1 — Finish the foundation (no dependencies, start immediately)

### [x] 1. Session persistence + app entry logic
**What:** `mobile/src/app/index.tsx` currently always redirects to `/login`. It needs to check for a real Supabase session and route accordingly.
**Research:** `@supabase/supabase-js` session handling + `expo-secure-store` for token storage (already a dependency in `package.json`, unused so far). Look at how `frontend/src/app/providers.tsx` and `frontend/src/lib/supabase` (client) handle auth state on web for the equivalent logic.
**Build:** wire Supabase's session storage to `expo-secure-store` (custom storage adapter), add a loading state while the session check runs, redirect to the home hub if logged in, login if not.
**Definition of done:** log in on your phone, force-quit the app, reopen it — you land on the home stub (or a placeholder screen) without re-entering credentials. Log out — you land back on login.

### [x] 2. Deep links for password reset
**What:** the `rovehealth://` scheme is registered but nothing listens for the incoming link from a password-reset email.
**Research:** Expo Router's automatic deep-link handling (file-based routes already respond to `rovehealth:///reset-password`); check what the reset-password email template actually sends (Supabase auth email templates, likely in Supabase dashboard or `supabase/` config) — the link format must match a route you have.
**Build:** confirm `mobile/src/app/(auth)/reset-password.tsx` correctly reads the token/params from the incoming link and calls the right Supabase method.
**Definition of done:** request a password reset on your phone, tap the email link — the app opens directly to the reset screen with the reset flow working.

### [x] 4. Rest of the UI kit
**What:** the design system needs the components no screen has needed yet: Sheet/bottom-sheet, Dialog/Modal, Select/Dropdown, Toast, Accordion (the tracker screen is built from accordion cards — see `frontend/src/app/cycle-sync/tracker/components/TrackerAccordion.tsx`), Skeleton/loading states, Tabs.
**Research:** compare against every component in `frontend/src/components/ui/` — that's the full source-of-truth list to port. Toasts → `sonner-native` per the library mapping above.
**Build:** one file per component in `mobile/src/components/ui/`, matching the visual language of the 6 already built (check `Button.tsx`/`Card.tsx` for the established style conventions).
**Definition of done:** a component-gallery demo screen (`mobile/src/app/gallery.tsx` or similar, removable before release) showing every component, checked side-by-side against the equivalent web component.

### [x] 5. Theme token completeness check
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

### [x] 7. Chart spike — resolved by avoiding victory-native entirely
**What happened:** `victory-native` is not in `package.json` and was never added. Item 15 (Insights) built its visuals as custom `react-native-svg` components instead — `SegmentedDoughnut.tsx` for the segmented/gapped donut, plus `ExerciseOrb.tsx` and `MacroFuelGauge.tsx` on the Plan screen — because the per-segment tap-to-select interaction didn't map cleanly onto a charting library anyway. This satisfies the item's actual goal (prove Insights' visuals are buildable natively) without the dependency; the original library-mapping table's "victory-native" row is superseded by this approach.

---

## Phase 3 — Shared logic (start anytime; blocks nothing else, but screens should switch to it once ready)

### [x] 8. Shared-logic package extraction — DONE 2026-07-19
**What it turned out to be:** cycle-phase math (`shared/cycle/phase.ts`) was already fully extracted and already used by 12 frontend files via `@shared/cycle/phase` — nothing to do there. What was still frontend-only and got moved: auth Zod schemas (`shared/schemas/auth.ts`) and onboarding Zod schemas + types + constants + date helpers (`shared/onboarding/`). `frontend/src/lib/schemas.ts` and `frontend/src/lib/onboarding/*.ts` are now thin re-export shims (same pattern as the existing `shared/cycle/smart-phase.ts` shim) so no other frontend file needed to change its imports.
**Real bug found and fixed along the way:** `shared/` had no `node_modules` of its own, so `zod` resolution walked up the filesystem and landed on an unrelated Zod install outside the repo — a different major version than `frontend/` uses, which silently produced type errors. Fixed by adding `zod` as a pinned dependency at the **repo root** `package.json` (`^3.23.8`, matching `frontend/`), so `shared/` resolves it consistently for every consumer, on any machine.
**Mobile wiring:** `mobile/tsconfig.json` and `mobile/metro.config.js` now resolve `@shared/*` (Metro needed `watchFolders` + `extraNodeModules` since `shared/` sits outside `mobile/`'s own root — TypeScript path mapping alone isn't enough for the bundler). Verified for real, not just type-checked: temporarily wired `@shared/cycle/phase` into `gallery.tsx` and ran a full `expo export`, confirming Metro actually bundles across the monorepo boundary, then reverted the temporary wiring.
**Verified:** `npm test` at repo root — 45/45 real tests pass (unchanged); `npx tsc --noEmit` clean in both `frontend/` and `mobile/`; `npm run build --prefix frontend` succeeds, including the onboarding route that now imports from `@shared/`.
**Side effect worth knowing about:** running `expo export` also auto-linked `mobile/app.json` to an EAS project (`extra.eas.projectId`) and added a memory flag to `eas.json`'s production profile — normal EAS behavior, but flagging since nobody asked for it explicitly. Review before committing.

---

## Phase 4 — Screens (each item below depends on: Items 1, 4, 5 done; phase-aware ones also need Item 8 or a temporary copy of the logic)

For every item in this phase, the **reference is the equivalent page in `frontend/src/app/cycle-sync/`** (paths given per item) plus any component folder listed. Read the web version fully before writing any native code — that page *is* the spec.

### [x] 9. Home hub (dashboard) — code complete 2026-07-19, phone checkpoint still pending
**What was built:** `mobile/src/app/(app)/home.tsx` (full dashboard: phase orb, next-period/ovulation/fertile-window stat cards, Daily Flow River, Today's Snapshot 2x2 grid with detail dialogs, empty-cycle-data state, TTC/menopause placeholder states), `mobile/src/lib/dashboard.ts` (data layer), `mobile/src/components/home/{RiverTrack,ProfileAvatar,WelcomeTour}.tsx`, `mobile/src/data/home-content.ts` (phase theme/snapshot copy, mirrored from the web page's inline constants since they aren't exported there).
**Architecture note:** Next.js Server Actions (`fetchDashboardData` etc.) aren't reachable from React Native, so `dashboard.ts` re-implements the same Supabase queries directly via the client SDK (RLS-scoped to `auth.uid()`), then reuses `@shared/cycle/phase` for the actual phase math — same calculation, same result, different transport. Static phase content (`PHASE_CONTENT`) was moved to `shared/content/phase-content.ts` and bundled into the app rather than fetched, per the earlier decision that this content is static per-phase copy, not per-user data — `frontend/`'s original file is now a re-export shim, unchanged behavior.
**Verified:** `npm test` (45/45 pass), `tsc --noEmit` clean in both `frontend/` and `mobile/`, `npm run build --prefix frontend` succeeds, and a real `expo export` bundle succeeds with the screen's imports resolved (not just type-checked).
**Not yet verified — needs a human on a real phone:** the actual **Definition of done** (side-by-side against the website, same account, checked in all four phases) requires manual testing per ground rule 4, which Claude Code can't do. Someone should log into the mobile build with a test account, adjust its cycle start date to land in each of the four phases, and compare against the website before this item is fully closed out.

### [x] 9b. App tab navigation shell — built, done
**What's there:** `mobile/src/app/(app)/_layout.tsx` is a proper 5-tab `Tabs` navigator (Home, Tracker, Insights, Plan, Learn, in that order — matches `CycleSyncShell.tsx`'s `navItems`), phase-themed active color pulled live from dashboard data, blurred floating tab bar. Profile is correctly excluded from the tab bar (`href: null`) and reached via the header avatar instead, matching the web. This entry was stale — the shell has existed since early in the project; whoever wrote items 10/11 against a since-replaced placeholder file didn't come back and update this one.

### [x] 10 & 11. Tracker — full screen, all logging cards, real backend — built 2026-07-20
**What's there:** `mobile/src/app/(app)/tracker.tsx` (~1100 lines) + `mobile/src/components/tracker/*` — status card (phase badge, fertile indicator, late-period badge, first-period hint), full month calendar with period-logging mode, Quick Phase Log, Discharge questionnaire (MPIQ, video/photo previews), Body Signals, Inner Weather, Self Love, collapsible Lifestyle group (Exercise/Hydration/Sleep), collapsible Intimacy group (Sexual Wellness/Disruptors), Note card, floating Save + Chat FAB — all 18 web cards accounted for, some combined/reorganized rather than 1:1 file-for-file.
**Backend, real as of 2026-07-20:** `mobile/src/lib/tracker.ts` mirrors `fetchTrackerPageDataFast`/`fetchMonthLogs`/`logDailySymptoms`/`updateLastPeriodDate` from `frontend/src/app/actions/cycle-sync.ts` via direct RLS-scoped Supabase queries. Phase/period math runs through the canonical `calculatePhase()` from `@shared/cycle/phase` (previously the screen had its own simplified hand-rolled copy with no late-period handling and a day-of-month-keyed calendar that showed the same coloring for every month regardless of which one was open — both fixed). Calendar navigation fetches real logs per month; period-logging mode persists via `logDailySymptoms` and re-anchors `last_period_start` off the real streak, same algorithm as web.
**Known gap carried over intentionally:** no Flow Card / period-vs-discharge mode toggle yet (web's `FlowCard` for flow intensity on menstrual days) — `flowIntensity` is sent as `undefined` in every save. Worth its own small follow-up item if flow-intensity tracking matters for v1.
**Not yet verified — needs a human on a real phone:** side-by-side against the website, in all four phases including a "late period" test case, per ground rule 4.

### [x] 12. Plan (overview) — found already built during 2026-07-19 audit, phone checkpoint still pending
**What's there:** `mobile/src/app/(app)/plan/index.tsx` (790 lines) — Guide/Nourish/Move tab bar, wired to real Supabase data via `mobile/src/lib/plan.ts` (`fetchPlanPageDataFast` queries `user_cycle_settings`, `daily_logs`, `user_lifestyle`, `user_weight_goals`, `user_onboarding` in parallel; `savePlanSettings` persists changes). Not a stub — genuinely pulls and computes real account data, same shape as the web reference.
**Not yet verified — needs a human on a real phone:** side-by-side against the website, in all four phases, per ground rule 4. This item predates this session's work; nobody had gone back and checked it off, so it was incorrectly still showing as `[ ]` — same situation Item 9's audit note already warned about ("more already built than the last update assumed"). Re-verify by reading the actual file before assuming any `[ ]` item here is really unbuilt.

### [x] 13. Plan phase detail — found already built during 2026-07-19 audit, phone checkpoint still pending
**What's there:** `mobile/src/app/(app)/plan/[phase].tsx` (114 lines) — the one-template-four-phases pattern from the reference, driven by `phaseThemes` and `@shared/content/plan-blueprints`.
**Not yet verified — needs a human on a real phone:** all four phase variants checked individually against the website.

### [x] 14. Plan setup wizard — found already built during 2026-07-19 audit, phone checkpoint still pending
**What's there:** built inline inside `plan/index.tsx` rather than a separate file (`hasPlanSetup` / `setupStep` state drives a multi-step setup flow that calls `savePlanSettings`), not a standalone component like the web reference — same behavior, different file organization.
**Not yet verified — needs a human on a real phone:** completing the wizard on a test account and confirming it produces the same saved plan data as the website.

### [x] 15. Insights — code complete 2026-07-19, phone checkpoint still pending
**What was built:** all 5 cards from the web reference now exist under `mobile/src/components/insights/`: `CycleOverviewCard`, `HabitsOverviewCard`, `PhaseInsightCard`, `MentalHealthCheckCard` (links into Items 20/21), and `PatternAnalysisCard` (the RN name for `AiAnalysisCard` — includes a from-scratch `SegmentedDoughnut.tsx` built on `react-native-svg` rather than `victory-native`, since the segmented/gapped donut with per-segment tap-to-select didn't map cleanly onto a charting library; symptom icons are the real per-symptom illustrations converted from the web's `frontend/public/assets/symptoms/*.svg` via `rsvg-convert` into `mobile/assets/images/symptoms/*.png`, not placeholders). Wired into `mobile/src/app/(app)/insights.tsx`'s three tabs (Cycle / Patterns / Health — Health stays a "Coming Soon" placeholder, matching the website's own placeholder there).
**Real bug found and fixed along the way:** `PhaseInsightCard.tsx` had a stray `h-full` class on a View whose parent has no fixed height (it's sized by its own content inside a ScrollView). React Native's layout engine mis-measured that as a huge/undefined height, which silently made every sibling rendered after it in the same ScrollView unreachable by scrolling — not a crash, just a hard-to-diagnose "content quietly stops here" bug. Root-caused via a bisection test (bright test blocks placed at different positions in the list) rather than guessing. Worth checking for the same `h-full`-on-auto-height-parent pattern if a future screen has content that mysteriously won't scroll into view.
**Also fixed:** the wellbeing modal's `Done` button was looping back into the questionnaire instead of returning to Insights — caused by `wellbeing/` having its own nested Stack navigator, so `router.dismissTo('/insights')` couldn't cross into the tab navigator's stack. Fixed by removing `wellbeing/_layout.tsx` and declaring `wellbeing/intro` and `wellbeing/assessment` directly as modal-presented screens in the root `_layout.tsx`'s Stack instead, so both live in the same navigator Insights does.
**Verified:** `tsc --noEmit` clean, `expo export` / live Metro bundle fetch confirms all new modules resolve with no bundling errors.
**Gap found 2026-07-20, not yet fixed:** the "Generate Insight" AI button (`handleGenerateInsight` in `insights.tsx`) is fully fake — a `setTimeout` returning one hardcoded string, not wired to anything. The web equivalent (`frontend/src/app/cycle-sync/insights/page.tsx`) calls real actions, `generatePhaseAIInsight` (hits the AI backend) and `getCachedPhaseInsight` (checks for a cached result first). Needs its own small item: port those two calls the same way `dashboard.ts`/`tracker.ts` port their web actions.
**Not yet verified — needs a human on a real phone:** side-by-side against the website with a real account, in all four phases, per ground rule 4.

### [x] 20. Wellbeing intro — code complete 2026-07-19, phone checkpoint still pending
**What was built:** `mobile/src/app/wellbeing/intro.tsx` — reuses the existing `Accordion` component for the "What is this check-in?" / "How accurate is it?" sections rather than rebuilding a custom expand/collapse, same copy as the web page.
**Verified:** `tsc --noEmit` clean, confirmed present in the live Metro bundle.
**Not yet verified — needs a human on a real phone:** side-by-side check against the website.

### [x] 21. Wellbeing assessment — code complete 2026-07-19, phone checkpoint still pending
**What was built:** `mobile/src/app/wellbeing/assessment.tsx` — same PHQ-9/GAD-7 question banks, scoring thresholds, and result-screen copy as the web page, question-by-question flow with a progress bar.
**Correction to this item's original Definition of done:** "saves the same result the website would" assumed the website persists a result. It doesn't — `frontend/src/app/cycle-sync/wellbeing/assessment/page.tsx` computes and displays the score client-side only, with no Supabase write anywhere in that flow. The mobile version intentionally matches that actual (not assumed) behavior; there is no result to save on either platform today. If persisting assessment history becomes a real requirement, it needs a schema/backend decision first, on web and mobile both — not a mobile-only gap.
**Verified:** `tsc --noEmit` clean, confirmed present in the live Metro bundle.
**Not yet verified — needs a human on a real phone:** side-by-side check against the website.

### [x] 16. Learn (article library) — code complete 2026-07-19, phone checkpoint still pending
**What was built:** `mobile/src/app/(app)/learn.tsx` + `mobile/src/components/learn/` (`LearnHero`, `ContentRow`, `ArticleCard`, `LearnSkeleton`, plus two RN-native additions beyond the web spec: `CategoryPillBar` — a sticky pill row that jumps straight to a category section via `SectionList.scrollToLocation` instead of only scrolling through everything — and a "Continue Reading" row surfacing articles with saved-but-incomplete reading progress). Data layer in `mobile/src/lib/learn.ts` (mirrors `backend/src/actions/cycle-sync/learn/learn-actions.ts`'s Supabase queries directly, since Next.js Server Actions aren't reachable from RN — same pattern as Item 9's `dashboard.ts`).
**Performance work (raised directly as a concern, not just "port it"):** images use `expo-image` with `cachePolicy="disk"` (RN's plain `Image` has a much weaker cache) plus `Image.prefetch()` on the hero + first row as soon as the article list loads; the article list itself is cached via React Query with a 5-minute `staleTime`. Native touches: haptic feedback (`expo-haptics`) on pill/card taps, pull-to-refresh on the list.
**Definition of done:** article list matches website, loading skeleton works. ✅ both, pending phone checkpoint.

### [x] 17. Learn article reader — code complete 2026-07-19, phone checkpoint still pending
**What was built:** `mobile/src/app/learn/[id].tsx` — same hero/metadata/markdown-body layout as the web article page, rendered with `react-native-markdown-display` (added as a new dependency, per this item's own research note). Reading-progress tracking is a live scroll-percentage bar (matching `ArticleControls.tsx`'s behavior) that also persists locally via `mobile/src/lib/readingProgress.ts` (AsyncStorage-backed), which is what powers Item 16's "Continue Reading" row and the small in-progress bar shown on article cards. A floating Share button (RN's built-in `Share` API) replaces the web's copy-link/`navigator.share` handling.
**Performance:** the article's markdown body is fetched from a separate Supabase Storage bucket (same two-round-trip shape as the website: one for the DB row, one for the raw `.md` file) but cached per-article via React Query with `staleTime: Infinity`, so re-opening an article already visited is instant with no network call at all.
**Verified (both items):** `tsc --noEmit` clean, confirmed present and error-free in the live Metro bundle fetch.
**Not yet verified — needs a human on a real phone:** open an article from Item 16's screen, side-by-side against the website, per ground rule 4.

### [x] 18. Profile — built 2026-07-19, phone checkpoint still pending
**What's there:** `mobile/src/app/(app)/profile.tsx` (header identity edit + Cycle Settings card) wired to `mobile/src/components/profile/{CycleSignature,HealthPassport,AccountSettings}.tsx` and the data layer in `mobile/src/lib/profile.ts` (same Supabase tables/queries as the website's `actions.ts` — `profiles`, `user_onboarding`, `user_lifestyle`, `user_cycle_settings`, plus the real typed-DELETE account deletion flow). Reached via the header avatar (`ProfileAvatar.tsx`), hidden from the tab bar (`href: null` in `(app)/_layout.tsx`).
**Not yet verified — needs a human on a real phone:** matches website functionality for a test account, per ground rule 4.

### [ ] 19. AI chat with voice — confirmed NOT built (2026-07-19 audit)
**Checked directly:** no chat-related files anywhere in `mobile/src`, and no ElevenLabs dependency in `package.json` — Item 6's voice spike hasn't been started either. Still open, and still blocked on Item 6.
**Reference:** `frontend/src/components/cycle-sync/ChatInterface.tsx` (905 lines — the largest single component in the app) and `ChatWidget.tsx` (how it's triggered — a floating button on every core screen, not a menu item).
**Research:** calls the existing `/api/ai-chat` and `/api/chat` routes on rovehealth.in — no backend work needed. `StructuredResponseRenderer.tsx` shows how responses are formatted.
**Depends on:** Item 6 (voice spike) resolved — including its fallback decision if voice failed.
**Definition of done:** a full conversation round-trips correctly, matches web behavior, voice works (or the agreed webview fallback is in place).

### [x] 22. Rove Chef — found already built during 2026-07-19 audit, phone checkpoint still pending
**What's there:** `mobile/src/components/plan/RoveChef.tsx` (187 lines) + `DietCheatSheet.tsx` (98), `SymptomDecoder.tsx` (172), `MacroFuelGauge.tsx` (307), wired into the Plan screen's "Nourish" tab, backed by `mobile/src/data/diet-recommendations.ts`.
**Not yet verified — needs a human on a real phone:** matches website functionality for a test account.

### [x] 23. Exercise builder — found already built during 2026-07-19 audit, phone checkpoint still pending
**What's there:** `mobile/src/components/plan/ExerciseBuilder.tsx` (375 lines) + `ExerciseOrb.tsx` (125), wired into the Plan screen's "Move" tab.
**Not yet verified — needs a human on a real phone:** matches website.

### [x] 24. Workout history — found already built during 2026-07-19 audit, phone checkpoint still pending
**What's there:** `mobile/src/components/plan/WorkoutHistory.tsx` (280 lines). No `WeightProgressCard` equivalent found under this name — check whether that's covered elsewhere in `WorkoutHistory.tsx` or is a genuine gap before closing this item out.
**Not yet verified — needs a human on a real phone:** matches website with real account data.

### [ ] 25. Guided workout session player — confirmed NOT built (2026-07-19 audit)
**Checked directly:** no `GuidedSession` file or reference anywhere in `mobile/src`. Still open.
**Reference:** `frontend/src/app/cycle-sync/plan/[phase]/components/GuidedSession.tsx` — a full-screen player experience, dynamically loaded on web.
**Definition of done:** a full guided session plays through correctly on device.

### [ ] 26. Marketing webviews — Privacy built natively (deviation), rest NOT built (2026-07-19)
**Checked directly:** `react-native-webview` (13.15.0) is still installed but unused — the plan's original "one reusable in-app browser screen" approach was not taken. Instead `mobile/src/app/privacy.tsx` is a full native screen (not a webview) with its own copy, matching app fonts/theme, linked from onboarding's consent step and from Account Settings. This is a deliberate scope split from the rest of the item, not an oversight — flagging so nobody "fixes" it back into the webview later without asking.
**Still open:** Shop (`(marketing)/shop/`), Science, Story, Ingredient glossary, Privacy pledge — none built yet. Decide per-page whether each gets the native treatment like Privacy did, or the original shared-webview approach; Shop in particular needs real checkout, which argues for native or a very solid webview bridge either way.
**Definition of done (remaining pages):** a test shop order completes end-to-end.

---

## Phase 5 — Native polish (claimable once most of Phase 4 is merged)

### [ ] 27. Splash screen, status bar, app icons, offline caching, push scaffolding — push scaffolding built 2026-07-25, offline caching still open
**What's actually there, checked directly:** real app icons configured in `app.json` (`icon.png`, `expo.icon`, Android adaptive icon foreground/background/monochrome layers — not placeholders), a basic branded splash screen (`expo-splash-screen` plugin, `#FAF9F6` background + logo image), and `<StatusBar style="dark" />` set in `mobile/src/app/_layout.tsx`. None of this has been checked side-by-side against `frontend/capacitor.config.ts` for exact color/timing parity.
**Push scaffolding (2026-07-25):** `expo-notifications` + `expo-clipboard` installed, plugin configured in `app.json` (Android notification icon/color, `googleServicesFile` path referenced). Client code in `mobile/src/lib/notifications.ts` — permission request, Android notification channel, Expo push token fetch, Supabase token upsert, foreground/response listeners — wired into `mobile/src/app/(app)/_layout.tsx` on app mount. Migration `backend/supabase/migrations/018_push_tokens.sql` adds `user_push_tokens` (not yet applied to the live project — needs to be run via Supabase SQL editor or `supabase db push`). A `NotificationDebugCard` on the Profile screen shows live permission/token status and can fire a test local notification. **Still needed before Android can receive a real remote push:** a Firebase project + `mobile/google-services.json` + an FCM service-account key uploaded via `eas credentials`, and a development build (`eas build --profile development --platform android` or `npx expo run:android`) — Expo Go itself has blocked remote push on Android since SDK 53, this project is on SDK 54, so Expo Go was never going to be able to test the remote-delivery half of this regardless of app code. iOS APNs (needs an Apple Developer account key) intentionally left as a TODO in `notifications.ts` per the same constraint on that side.
**What's still missing:** no `react-native-mmkv` dependency and no `persistQueryClient` anywhere — offline caching of learn content / last-known cycle data isn't built. This part of the item is still open.
**Reference:** current Capacitor config at `frontend/capacitor.config.ts` (splash/status bar colors to match) and `resources/` (existing icon source files).
**Build:** splash + status bar parity (verify, don't just assume, against the reference), offline caching of learn content and last-known cycle data via MMKV + TanStack Query persist.
**Definition of done:** airplane-mode test — app opens and shows cached data. (Push scaffolding's own done-criteria: a test push sent via Expo's push tool arrives on a dev-build Android device.)

### [ ] 28. EAS build profiles + analytics/error reporting — build profiles done, analytics/crash reporting not started
**What's already there:** `eas.json` has `development`/`preview`/`production` profiles configured and `app.json` is linked to a real EAS project (`extra.eas.projectId`, auto-linked during Item 8's `expo export` verification).
**What's still missing:** no `posthog-react-native` dependency, no crash/error reporting (Sentry or similar) — neither has been started.
**Definition of done (remaining):** a test event shows up in PostHog; a forced crash shows up in the crash-reporting dashboard.

### [x] 29. Post-signup onboarding wizard — built 2026-07-19, phone checkpoint still pending
**What's there:** `mobile/src/app/onboarding.tsx` (5-step wizard: Intro → Welcome/DOB → Period History calendar → About You → Goals + privacy consent) wired to `mobile/src/components/onboarding/Step*.tsx`, state in `mobile/src/lib/onboarding-state.ts` (reducer ported from the website's `state.ts`), and saves through `mobile/src/lib/onboarding.ts` → the same `complete_onboarding_v2` Supabase RPC the website uses. Draft auto-saves to `AsyncStorage` (web used `localStorage`). `mobile/src/app/index.tsx` now checks `profiles.onboarding_completed` and redirects un-onboarded users to `/onboarding` before `/(app)/home`. Since this file was first drafted, the team has iterated further on `StepWelcome`/`StepGoals` (swapped the DOB inputs for a `DateSelect` component, expanded the privacy/disclaimer copy, linked the consent line to the new native Privacy screen from Item 26) — check the current files rather than assuming this description is exact.
**Not yet verified — needs a human on a real phone:** completing the wizard on a fresh test account produces the same saved onboarding data the website would, per ground rule 4.

---

## Phase 6 — Testing and release (whole team, after Phase 4 + 5 are merged — do not compress this phase)

### [ ] 3. Play Store signing-key verification
**What:** the one irreversible risk in the whole project. **Deliberately deferred to this phase by founder decision** (2026-07-19) — originally scheduled for week 1 so a problem would surface with weeks of runway left instead of none; moved here knowingly, accepting that a signing issue found now has to be resolved without that buffer, right before release.
**Research:** Play Console → your app → Setup → App signing. Determine whether Google Play App Signing is enabled (likely, since the app already ships) and locate the existing upload keystore used for `com.rovehealth.app`.
**Build:** nothing to code — this is a verification + backup task. Back up the keystore file in two separate places (e.g. password manager + a second cloud drive).
**Definition of done:** written confirmation (a note in this repo's `docs/` or shared with the founder) of where the keystore lives and that it's backed up twice. **Do this before the release build below, not after.**

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
