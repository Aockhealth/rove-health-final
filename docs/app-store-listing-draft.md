# App Store Connect — Listing Draft

Draft copy for the App Store Connect "App Information" and "Version" pages. Everything here is a starting point for you to edit, not final legal or marketing copy.

## Age Rating

Apple's Age Rating questionnaire (App Store Connect → App Information → Age Rating) asks about content categories. Based on what's actually in the app (cycle/symptom tracking, AI-generated wellness insights, no graphic imagery, no user-generated public content, no gambling):

| Category | Suggested answer |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content or Nudity | None |
| Profanity or Crude Humor | None |
| Alcohol, Tobacco, or Drug Use | None |
| Mature/Suggestive Themes | None or Infrequent/Mild (cycle/reproductive health topics can trigger this even without explicit content — answer honestly based on what the AI chat can discuss) |
| Medical/Treatment Information | Infrequent/Mild |
| Horror/Fear Themes | None |
| Gambling/Contests | None |
| Unrestricted Web Access | No (unless the AI chat can browse/link out freely — check with the team) |

**Likely result: 12+.** The "Medical/Treatment Information" and possible "Mature/Suggestive Themes" flags are what typically push a cycle-tracking app from 4+ to 12+; nothing here should push it to 17+. Answer the live questionnaire yourself since Apple updates the exact wording periodically — this table is a guide, not a substitute.

## Subtitle (30 characters max)
Options (all under 30 chars):
- "AI Cycle Sync & Wellness" (24)
- "Cycle Tracking, Reimagined" (27)
- "Your Cycle, Understood" (22)

## Promotional Text (170 characters max, editable after release without a new build)
> Built by clinicians. Science-led, cycle-personalized guidance for nutrition, fitness, and health — plus AI-powered insights. More than a period tracker.

*(154 characters)*

## Description (4000 characters max — refined from your draft, 3,542 characters)
> • Built by clinicians
> • Science-led and evidence-informed
> • Personalized to your unique cycle
> • Cycle syncing made simple
> • AI-powered health insights
> • Nutrition, fitness, and health in one app
> • More than a period tracker
>
> Rove Health is a doctor-built women's health and lifestyle app designed to help you understand your body, not just track your period.
>
> Your hormones influence energy, mood, focus, exercise performance, nutrition needs, sleep, skin health, and overall wellbeing. Rove Health helps you connect the dots through cycle tracking, symptom logging, personalized insights, nutrition guidance, fitness recommendations, and AI-powered analysis.
>
> Whether you're looking to understand your symptoms, optimize your lifestyle, improve fitness, or feel more in sync with your body, Rove Health provides practical, science-led guidance tailored to your cycle.
>
> **TRACK YOUR CYCLE**
> Stay informed with:
> • Period predictions
> • Ovulation estimates
> • Fertile window tracking
> • Current cycle phase identification
> • Cycle history and trends
>
> Know where you are in your cycle and what to expect next.
>
> **DAILY FLOW: PERSONALIZED CYCLE SYNCING**
> Your body's needs change throughout the menstrual cycle. Receive daily guidance on:
> • Key nutrients to prioritize
> • Foods that support hormonal health
> • Recommended activities
> • Lifestyle habits aligned with your current phase
>
> Cycle syncing made practical and personalized.
>
> **UNDERSTAND YOUR BODY**
> Today's Snapshot explains how your cycle phase may influence:
> • Hormones
> • Mood and mental performance
> • Energy and physical health
> • Skin health
>
> Each insight includes actionable recommendations to support your wellbeing.
>
> **COMPREHENSIVE HEALTH TRACKING**
> Track what matters most:
> • Symptoms
> • Mood
> • Exercise
> • Sleep
> • Hydration
> • Lifestyle disruptors
> • Sexual wellness
> • Discharge
>
> View your data in a monthly calendar and identify meaningful trends over time. The more you track, the stronger the insights.
>
> **PERSONALIZED INSIGHTS & AI ANALYSIS**
> Move beyond tracking. Rove Health analyzes your data to uncover patterns and explain the science behind them. Learn why symptoms like cramps, bloating, mood changes, or energy fluctuations occur, and discover evidence-informed strategies to manage them.
>
> Our AI transforms daily health data into personalized insights that help you make better decisions about nutrition, fitness, recovery, and self-care.
>
> **NOURISH: CYCLE-SYNCED NUTRITION**
> Receive personalized guidance including:
> • Daily calorie requirements
> • Protein targets
> • Phase-specific nutrients
> • Recommended foods and meals
>
> Generate personalized snacks, smoothies, and salads with Rove Chef, tailored to your cycle and preferences.
>
> **EXERCISE WITH YOUR CYCLE**
> Get cycle-aware fitness guidance designed to support performance and recovery. Use the AI Workout Generator to create personalized workouts based on your goals, available equipment, location, and current cycle phase.
>
> **LEARN WITH CONFIDENCE**
> Access evidence-informed content on:
> • Menstrual health
> • Hormones
> • Nutrition
> • Fitness
> • Mental wellbeing
> • Fertility awareness
> • Women's health topics
>
> Understand your cycle. Decode your symptoms. Make informed decisions.
>
> Rove Health helps women move from simply tracking their cycle to truly understanding their health.
>
> Rove Health is a wellness and lifestyle app. It is not a substitute for professional medical advice and is not a form of contraception. Always consult a healthcare professional for medical concerns.

Changes made to your draft:
- Removed the stray leading spaces before each "•" bullet (copy-paste artifact — Apple would have shown uneven indentation)
- Turned section labels into a consistent CAPS + line-break pattern so each block reads as its own section
- Fixed minor grammar ("well-being" → "wellbeing" consistently, "The more you track - the stronger" → "The more you track, the stronger")
- Replaced the ✓ checkmarks with plain "•" bullets — App Store Connect's description field rejected the checkmark character ("invalid characters"); the bullet character is standard and works fine
- Left every claim and feature bullet as you wrote it — no content cut or added

One thing to flag: this description doesn't mention TTC (trying-to-conceive) mode, which you've been actively building (`de32749 Add TTC mode screens and logic`). If that's shipping in this build, it's worth a short section — happy to draft one if you want it in.

## Keywords (100 characters max, comma-separated, no spaces needed, don't repeat the app name or category words like "health")
> `cycle,period,tracker,hormone,ovulation,fertility,ttc,pregnancy,wellness,ai,nutrition,fitness`

*(92 characters — added "ttc" and "pregnancy" since that mode is now in the app; swap "pregnancy" out if TTC mode isn't in this build yet.)*

(Count this against the live 100-char field before submitting — keyword limits are strict and Apple silently truncates over the limit.)

## Support URL
> `https://rovehealth.in/privacy`

**Correction:** App Store Connect's Support URL field only accepts `http(s)` links — `mailto:` gets rejected ("The URL is formatted incorrectly"), so my earlier suggestion was wrong for this field specifically. (A plain email address *is* accepted elsewhere in App Store Connect, under Contact Information — just not here.)

Since no dedicated `/support` page exists yet, use `https://rovehealth.in/privacy` — it's already live and has a "Contact Us" section with the support email. Swap it for a real `rovehealth.in/support` page later if you want something more polished than pointing reviewers/users at the privacy page.

## Marketing URL (optional)
`https://rovehealth.in` — leave blank if you'd rather not commit to keeping the homepage evergreen for App Store visitors.

## Version
`2.0.0` — matches `mobile/app.json`. This is the *app* version shown in "What's New"; App Store Connect's build number is separate and comes from EAS at submission time, so no action needed here beyond confirming this matches what you intend to ship.

## Copyright
> `© 2026 Rove Health`

Use the legal entity name here if incorporation differs from the brand name (e.g. "© 2026 Aock Health Ventures" — matches the Sentry org `aock-health-ventures` in `app.json`). Worth double-checking which entity actually owns the App Store Connect account before submitting.
