# Rove Health

A monorepo containing the Rove Health website, mobile app, and the shared logic
that powers both.

## What lives where

| Folder      | What it is                                                        |
|-------------|-------------------------------------------------------------------|
| `frontend/` | The Next.js website and web app (rovehealth.in). Deployed to Vercel. |
| `mobile/`   | The Expo / React Native app for iOS and Android.                   |
| `shared/`   | Cycle maths, phase content, and schemas used by *both* apps.       |
| `backend/`  | Server actions and the AI orchestrator that `frontend/` calls into.|
| `supabase/` | Database migrations, edge functions, and seed content.             |
| `scripts/`  | One-off maintenance scripts (seeding, cache clearing, DB reads).   |
| `docs/`     | Product plans, specs, and strategy documents.                      |

Anything imported by both the website and the app belongs in `shared/`.
It is aliased as `@shared/*` everywhere.

## Getting started

Install dependencies once at the root, then per app:

```bash
npm install
npm install --prefix frontend
npm install --prefix mobile
```

### Run the website

```bash
npm run dev
```

Opens http://localhost:3000.

### Run the mobile app

```bash
npm start --prefix mobile
```

Then scan the QR code with Expo Go, or press `i` for the iOS simulator.

### Run the tests

```bash
npm test
```

This runs the Jest suite over `shared/` — the cycle and phase calculations.

## Import aliases

| Alias        | Points to        |
|--------------|------------------|
| `@shared/*`  | `shared/*`       |
| `@/*`        | `frontend/src/*` |
| `@backend/*` | `backend/src/*`  |

Always use the alias rather than a relative path like `../../../../backend/...`.

## Deploying

- **Website** — Vercel deploys automatically from the `aock-final` remote.
- **Mobile (JS-only changes)** — `eas update --branch <channel> --platform ios`
  ships over the air without an app-store review.
- **Mobile (native changes)** — requires a full `eas build` and store submission.

## A caution on Supabase config

Running `supabase config push` overwrites **all** live Auth and Storage
settings from `config.toml`, not just the section you edited. Do not run it
casually — it has caused a production incident before.
