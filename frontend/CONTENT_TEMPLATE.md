# Daily Flow Content Templates

Copy and paste these blocks into your `frontend/src/data/phase-content.ts` file (inside the `nutrients` or `phaseFocus` arrays).

## 1. ROW 1: Nutrients Template
*Use this for the top row (Green items)*

```typescript
{
    title: "TITLE HERE",       // e.g. "Magnesium" or "Ginger Tea"
    desc: "SHORT BENEFIT",     // e.g. "Muscle Relaxant" (Max 2-3 words)
    icon: "ICON_NAME",         // Choose from Icon List below
    detail: "LONG DESCRIPTION goes here. Explain the science or why it is good for this phase."
},
```

## 2. ROW 2: Phase Focus Template
*Use this for the bottom row (Purple items)*

```typescript
{
    title: "ACTIVITY NAME",    // e.g. "Rest Day" or "Journaling"
    desc: "SHORT ACTION",      // e.g. "Slow Down" (Max 2-3 words)
    icon: "ICON_NAME",         // Choose from Icon List below
    detail: "LONG DESCRIPTION goes here. Explain why this activity supports the hormones in this phase."
},
```

---

## 🏗️ Available Icons
*Copy the name exactly (case-sensitive)*

### 🏥 Health & Body
- `Droplets` (Blood, Water)
- `Sparkles` (Magic, General)
- `Heart` (Self-care, Love)
- `Brain` (Mood, Mind)
- `Pill` (Supplement)
- `Shield` (Immunity, Protection)
- `Dna` (Genetics)

### 🥗 Food & Drink
- `Utensils` (Meal)
- `Soup` (Warm food, Comfort)
- `Coffee` (Caffeine, Energy)
- `Fish` (Omega-3)
- `Carrot` (Veggie)
- `Wheat` (Fiber, Grains)
- `Beaker` (Probiotics/Science)

### ⚡ Energy & Nature
- `Zap` (High Energy)
- `Moon` (Rest, Sleep)
- `Sun` (Morning, Day)
- `Wind` (Breath, Air)
- `Leaf` (Nature, Fresh)
- `Waves` (Flow, Bath)
- `Flame` (Metabolism)

### 🏃‍♀️ Activity
- `Dumbbell` (Strength)
- `Activity` (Cardio, Pulse)
- `Footprints` (Walking)
- `Bike` (Cycling)
- `Music` (Dance)

### 🧘‍♀️ Mind & Soul
- `Book` (Reading, Journal)
- `Lightbulb` (Ideas)
- `Star` (Goals)
- `Home` (Nesting, Cleaning)
- `Users` (Socializing)
- `Smartphone` (Detox)
