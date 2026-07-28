# AI Chef v2 — "Pick Your Plate" (built 2026-07-22)

**Why:** v1 generated one invented-sounding recipe per tap ("Warm Ginger Nutmeg Banana Blend") — not something a user would actually make. v2 shows **4 real, familiar dishes as options**; the user picks one, gets the full recipe for that dish, and the pick itself becomes preference data Rove learns from.

## What was built (all code-complete, typechecked clean in frontend + mobile)

### Backend (frontend/ + backend/ — API layer, stays deployed on rovehealth.in even after the website goes shop-only)
- **Prompts** (`frontend/src/lib/ai/prompts.json`): `chef_options` (temp **0.9** — founder's call: creativity goes into the *spread* of real dishes; a hard "never invent a dish, only dishes an Indian home cook knows by name" rule is the realism guardrail instead of low temperature) and `chef_detail` (temp **0.4** — the chosen dish gets its standard, authentic preparation, no creative riffs). Both Gemini; model label fixed to `gemini-flash-latest` (the old "gpt-4.1" label was cosmetic — code always routed Gemini to `DEFAULT_GEMINI_MODEL`).
- **Schemas** (`frontend/src/lib/ai/schemas.ts`): `ChefOptionSchema` (name/description/prep_time_minutes/key_ingredients/why/serving_style), `ChefOptionsResponseSchema` (3–4 options), `ChefDetailSchema`.
- **Actions** (`frontend/src/app/actions/ai-actions.ts`): `generateChefOptions` + `generateChefDetail`. Options call is short (no instructions) → faster first response; detail is only generated for the picked dish. Retry policy matches the 2026-07-22 latency fix: retry **only** on hard failures (bad payload / safety flag / phase-rule violation), never on soft genericness; telemetry logging is fire-and-forget.
- **Quality gate** (`evaluateChefOptionsQuality`): no "cold" `serving_style` during Menstrual/Luteal; all options distinct; hard-fails if any option repeats a dish the user recently **chose**.
- **Routes**: `/api/rove-chef-options`, `/api/rove-chef-detail`. Old `/api/rove-chef` + `generateRoveChefProtocol` left untouched as fallback until v2 is verified on-device; retire later.
- **Orchestrator** (`backend/src/actions/ai-orchestrator/orchestrator.ts`): `chef_options`/`chef_detail` added to the diet_coach feature allowlist; context envelope extended with `mealType`, `preferenceSummary`, `recentChosen`, `dishName`, `keyIngredients`.

### Data (the new asset)
- **Migration** `supabase/migrations/20260722210000_user_food_choices.sql`: `user_food_choices` (user, phase, meal_type, options_shown JSONB, chosen_name, chosen_index, timestamp), RLS user-scoped. `chosen_name = NULL` = "regenerated without picking" (all 4 rejected — also a signal).
- **Preference loop** (`mobile/src/lib/foodChoices.ts`): mobile reads its own history (RLS) and passes derived hints in the request body — `preferenceSummary` (top repeated ingredients, quick-prep tendency, warm-dish tendency; only after ≥3 picks), `recentChosen` (8 most recent picks, hard do-not-repeat), `recentShown` (last 3 generations of the same meal type). This hint-passing pattern is required because mobile's API calls carry no Supabase auth cookie, so the server can't look the user up itself.

### Mobile
- **`RoveChef.tsx` rework**: Generate → 4 tappable option cards (dish name, one-liner, prep-time chip, warm/cold icon, key ingredients, phase-specific "why") → tap = pick is logged + full recipe fetched → detail view (ingredients with quantities, numbered steps) with "Back to options" / "Fresh menu". "None of these — show me others" logs the rejection then regenerates. Haptics throughout.
- **`api.ts`**: `fetchChefOptions`/`fetchChefDetail` + the production-URL bug fixed (`EXPO_PUBLIC_API_URL` env var, defaulting to `https://rovehealth.in` — the old literal `your-production-url.com` placeholder is gone). This same fix un-breaks Rove Coach (AI Move) in production builds.
- **`.env`**: `EXPO_PUBLIC_API_URL=https://rovehealth.in` added (and pre-existing duplicate Supabase lines deduped).

## Before this works end-to-end (deployment checklist)
1. **Apply the migration** to the live Supabase project (`user_food_choices` table) — until then, choice logging silently no-ops and preferences stay empty (options still generate fine).
2. **Deploy frontend/** to rovehealth.in so the two new API routes exist in production. In dev, mobile hits `localhost:3000`, so run the frontend dev server alongside Expo.
3. **Phone checkpoint** (ground rule 4): in each phase — generate options (all 4 must be recognizable real dishes; Menstrual/Luteal show no cold options), pick one (row lands in `user_food_choices`), regenerate-without-picking (row with NULL chosen_name), and after ~3 picks confirm the next menus lean toward those picks without repeating them.

## Deliberately not done
- No web UI rebuild (website is going shop-only — mobile-only feature).
- AI Move / Coach kept on v1 flow (only its production-URL bug was fixed). If v2's pick-based pattern tests well for Chef, consider the same treatment for Coach later.
