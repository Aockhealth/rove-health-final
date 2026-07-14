# Rove Health — React Native Migration Plan

_Last updated: 2026-07-14. Written for a non-coder working with Claude Code. Each phase ends with a checkpoint you can verify yourself on your own phone._

## What we have today

- **Website:** Next.js app at rovehealth.in — 22 screens, ~110 components. This keeps running untouched throughout the migration.
- **Android app:** A Capacitor shell that loads the live website in a webview (`com.rovehealth.app`, already on Play Store).
- **Backend:** Supabase (accounts, cycle data), Next.js API routes (AI chat, learn content, Shopify), OpenAI/Gemini, Pinecone, Upstash. **None of this changes.** The React Native app talks to the exact same backend, so all existing users keep their accounts and data automatically.

## What "converting to React Native" actually means

The screens get rebuilt as truly native UI (faster, smoother, offline-capable, supports push notifications and iOS later). The logic, data, and backend are reused. Roughly:

| Reused as-is | Rewritten |
|---|---|
| Supabase database & user accounts | Every screen's UI (~110 components) |
| All API routes (AI chat, learn, shop) | Navigation (Next.js routing → Expo Router) |
| Business logic in `shared/` and `frontend/src/lib` (pure TypeScript) | Animations (framer-motion → Reanimated) |
| Zod schemas, cycle calculations | Local storage, splash screen, status bar |

## Golden safety rules (why this plan is hard to break)

1. **The website never stops working.** The RN app is built in a brand-new `mobile/` folder on a separate git branch. Nothing in `frontend/` or `backend/` is modified except extracting shared logic (copy, verify, then switch).
2. **The current Play Store app stays live** until the RN app is fully approved and tested. The Capacitor project is not deleted until then.
3. **Checkpoint after every phase:** the app must build, run on your physical phone, and get a git commit. If a phase goes wrong, we roll back to the last commit — nothing is ever half-broken for long.
4. **Same Supabase project, same app ID** (`com.rovehealth.app`) — updating the existing Play Store listing requires the same package name and signing key (see Phase 9 risk).
5. **Expo + EAS Build** so you never need Android Studio or local build toolchains — builds happen in the cloud, you install via a link/QR code.

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
| ElevenLabs voice (`@11labs/react`) | `@elevenlabs/react-native` | **High — verify early (Phase 2 spike)** |
| Serwist PWA / service worker | Not needed (it's a native app) | — |

## Phases

### Phase 0 — Foundation (½ day)
- Create branch `react-native-migration`; confirm clean git state.
- Scaffold Expo app in `mobile/` with TypeScript + Expo Router + NativeWind.
- Set up EAS account for cloud builds.
- ✅ **Checkpoint:** "Hello Rove" app runs on your phone via Expo Go.

**Testing devices (user has an iPhone):** day-to-day checkpoints happen on the user's iPhone via Expo Go — same code builds both platforms, so this validates the app. From Phase 2 onward (custom native modules like ElevenLabs voice), on-iPhone installs need an Apple Developer account ($99/yr — needed anyway for the App Store launch); until purchased, fall back to the iOS simulator on the Mac. Final Android verification (Phases 8–9) must happen on a real Android phone — a teammate's device or a cheap dedicated test phone, never emulator-only. Plan to ship BOTH Play Store and App Store at release, not iOS-as-afterthought.

### Phase 1 — Design system (2–3 days)
- Port the theme: colors (warm paper `#FAF9F6`, etc.), fonts, spacing from `globals.css` into NativeWind config.
- Rebuild the core UI kit from `frontend/src/components/ui` (buttons, cards, inputs, sheets).
- ✅ **Checkpoint:** a storybook-style demo screen showing every component, matching the web look.

### Phase 2 — Risk spikes (1–2 days, do early on purpose)
- Prove ElevenLabs voice works in RN (mic permissions, streaming audio).
- Prove one @nivo chart rebuilt in victory-native.
- If either fails, decide fallback (e.g. voice screen as an in-app webview) **before** investing in screens.
- ✅ **Checkpoint:** demo screens for voice + chart working on device.

### Phase 3 — Shared logic (2–3 days)
- Move pure TypeScript (cycle math in `shared/cycle`, `lib/schemas.ts`, onboarding logic) into a shared package both `frontend/` and `mobile/` import.
- Run the existing jest tests + `comprehensive_cycle_logic_test` to prove nothing broke on the web side.
- ✅ **Checkpoint:** website still builds and all tests pass; mobile imports the same logic.

### Phase 4 — Auth (2–3 days)
- Supabase login/signup/forgot-password screens; session stored in SecureStore.
- Deep links (`rovehealth://`) for password-reset emails.
- ✅ **Checkpoint:** you log in on the phone with your real account and see your real data.

### Phase 5 — Core app screens (2–3 weeks, the bulk)
Rebuild in this order (most-used first), one screen per session, checkpoint each:
1. Cycle-sync **tracker** (home)
2. **Plan** + plan/[phase]
3. **Insights**
4. **Learn** + learn/[id]
5. **Profile**
6. **Onboarding** flow
7. **Wellbeing** intro + assessment
- AI chat screens call the existing `/api/ai-chat` and `/api/chat` routes on rovehealth.in.
- ✅ **Checkpoint per screen:** side-by-side with the website on the same account — same data, same numbers.

### Phase 6 — Marketing & shop (2–3 days)
- Shop/science/story/glossary: keep as lightweight in-app webviews of the live site (they change often and don't need native feel), or rebuild later.
- ✅ **Checkpoint:** shop checkout completes a test order.

### Phase 7 — Native polish (2–3 days)
- Splash screen + status bar (matching current Capacitor config), app icons via existing `resources/`.
- Offline caching of learn content and last-known cycle data (MMKV + TanStack Query persist).
- Optional new win: push notifications for cycle-phase reminders.
- ✅ **Checkpoint:** airplane-mode test — app opens and shows cached data.

### Phase 8 — Testing pass (3–5 days)
- Full manual test script (I'll generate a tap-by-tap checklist you follow on your phone).
- Maestro e2e tests for login, tracker, chat, so future changes can't silently break them.
- PostHog + error reporting wired in so we see real-world crashes.
- ✅ **Checkpoint:** checklist 100% green; e2e suite passes.

### Phase 9 — Release (1 week incl. review time)
- **⚠️ Signing-key risk (the one truly irreversible thing):** to update the existing Play Store listing, the new build must use the same package name and be signed correctly. Check Play Console → Setup → App signing: if Google Play App Signing is enabled (likely), we generate a new upload key request or reuse the existing upload keystore. We verify this **before** building the release, and back up any keystore file in two places.
- versionCode continues above the current one (currently 3).
- Internal testing track first → install on your phone from Play Store → then staged rollout (10% → 50% → 100%).
- Keep the Capacitor code in the repo, unused, for one month as a fallback.
- ✅ **Checkpoint:** RN app live at 100%, crash-free rate healthy in Play Console.

### Phase 10 — Bonus (optional, later)
- iOS app: Expo makes this ~80% free once Android ships (needs Apple Developer account, $99/yr, and a Mac — you have one).

## Honest expectations

- **Total effort:** roughly 5–7 weeks of working sessions with Claude Code, mostly Phase 5. Not a weekend project.
- **What can't go wrong if we follow the rules:** your website, your users' data, and the current Play Store app — all untouched until the very last phase.
- **Where surprises are most likely:** ElevenLabs voice (Phase 2 spike catches it), chart parity, and Play Store signing (Phase 9 checklist catches it).
- **Worth asking first:** the current Capacitor app already ships your full site. RN buys real native smoothness, offline mode, push notifications, and a clean iOS path. If those aren't priorities yet, the migration can wait — the plan will still be here.

## How to run this as a non-coder

Open Claude Code in this repo and say: _"Continue the React Native migration — read docs/react-native-migration-plan.md, check which phase we're on, and do the next checkpoint."_ Each session: I do the work, you test on your phone, we commit. Never skip a checkpoint.
