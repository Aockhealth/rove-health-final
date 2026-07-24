# App Store Connect — App Privacy Worksheet

Fill this in under **App Store Connect → App Privacy → Get Started**. Based on what the mobile app (`com.rovehealth.app`) actually collects as of 2026-07-24.

## Do you or your third-party partners collect data from this app?
**Yes.**

## Data types collected

| Apple category | Specific type | Collected? | Linked to identity? | Used for tracking? |
|---|---|---|---|---|
| Health & Fitness | Health (cycle dates, flow, symptoms, moods, BBT/cervical fluid) | Yes | Yes | No |
| Contact Info | Email address | Yes | Yes | No |
| Contact Info | Name | Yes | Yes | No |
| Identifiers | User ID (Supabase account ID) | Yes | Yes | No |
| User Content | Other user content (AI chat messages, onboarding answers, journal-style inputs) | Yes | Yes | No |
| Diagnostics | Crash data, performance data | Yes (standard Expo/EAS diagnostics) | No | No |
| Usage Data | Product interaction (app usage patterns, mentioned in your privacy policy) | Yes | No | No |

Not collected (confirmed no SDK present in `mobile/package.json` as of this check): Location, Financial Info, Contacts, Browsing History, Search History, Photos/Videos, Audio Data, Purchases, Advertising Data.

## "Used for Tracking" question
Answer **No**. There is no advertising/analytics SDK (no PostHog, Mixpanel, Amplitude, ad-network SDK, etc.) in the mobile app — only the web frontend uses PostHog. This means you can also answer **No** to needing an App Tracking Transparency (ATT) prompt.

## Third-party data sharing to disclose
Because AI insight/chat requests are sent to external model providers, list these under "Data used by third parties":
- **OpenAI** — receives user content (chat/insight requests) for processing. Not used to train their models if you've set that via API settings — confirm your OpenAI account has training opt-out enabled, since your own Privacy Policy promises "No Model Training."
- **Google Gemini** — same as above; confirm data-use settings match the no-training promise.
- **Azure OpenAI** — Microsoft's enterprise terms already default to no training on API data, but worth a line item anyway.
- **Supabase** — service provider storing account + health data (this is "processing on your behalf," not third-party sharing, so it doesn't need to be listed as shared — just as collected/stored).

## Purpose for each data type (Apple asks this per type)
- Health & Fitness data → **App Functionality** (core feature)
- Contact Info → **App Functionality** (account creation/login)
- User Content → **App Functionality** (AI insights)
- Diagnostics → **App Functionality** / **Analytics** (crash reporting only)

## Data retention / deletion
Your privacy policy already promises account + data deletion on request (Section 6/7). Make sure the in-app account-deletion flow actually works end-to-end before submission — Apple has been checking this manually for health apps since 2023.

## One thing to double check before submitting
Your Privacy Policy says AI processing is "anonymized" and identifiers are "stripped" before hitting OpenAI/Gemini/Azure. Verify this is literally true in [backend/src/actions/ai-orchestrator/orchestrator.ts](../backend/src/actions/ai-orchestrator/orchestrator.ts) — if any request payload still includes email, name, or a non-anonymized user ID, either fix the code or soften the policy language. Apple reviewers and app privacy audits treat a mismatch between your stated policy and actual behavior as a rejection/removal risk, and it's a real legal exposure given this is reproductive health data.
