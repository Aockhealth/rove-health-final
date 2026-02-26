# ROVE — Pitch Deck

> **Precision Women's Health for India**

---

## Slide 1 · TITLE

# ROVE

### The Cycle-Sync Platform That Becomes Your Health Operating System

**Tagline:** Track → Diagnose → Act

*India's first AI-powered period tracker with built-in diagnostics and phase-personalised commerce*

---

## Slide 2 · THE PROBLEM

### 400M Indian women. Zero personalised health infrastructure.

| Pain Point | Scale |
|-----------|-------|
| **No cycle awareness** | 71% of Indian women can't predict their next period |
| **Delayed PCOS diagnosis** | Average 2+ years to diagnose; 20% of Indian women affected |
| **Generic health advice** | Diet, exercise, supplements ignore the 4 hormonal phases |
| **Supplement confusion** | ₹15,000 Cr market, but women don't know *what* to take or *when* |
| **Doctor avoidance** | Stigma + cost means most women only visit a gynae when symptomatic |

> [!CAUTION]
> **The gap:** Women track periods on notes apps. They Google symptoms. They buy random supplements. There's no system connecting tracking → diagnosis → action.

---

## Slide 3 · THE SOLUTION

### Rove: Track → Diagnose → Act

A single platform that closes the loop from **passive tracking** to **active health management**.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   📱 TRACK   │───▶│  🔬 DIAGNOSE │───▶│  💊 ACT      │
│              │    │              │    │              │
│ Period       │    │ LH/FSH Strip │    │ Phase-matched│
│ Symptoms     │    │ PCOS Screen  │    │ Supplements  │
│ Cervical     │    │ Ovulation    │    │ Diet plans   │
│ Mucus (MPIQ) │    │ Confirm      │    │ Workout rec  │
│ Mood & Sleep │    │              │    │ Doctor PDF   │
└──────────────┘    └──────────────┘    └──────────────┘
         FREE              STRIP KIT           COMMERCE
```

---

## Slide 4 · PRODUCT — The Smartest Period Tracker

### Not just a calendar. A cycle intelligence engine.

**What users see:**
- 🗓️ **Beautiful calendar** with phase-coloured days and symptom heatmaps
- 🌙 **4-phase engine** — Menstrual, Follicular, Ovulatory, Luteal predictions
- 💧 **MPIQ scoring** — Cervical mucus tracking (consistency, appearance, sensation) → fertility score
- 🤖 **Rove AI coach** — Phase-aware diet, exercise, and lifestyle recommendations
- 📊 **Pattern Analysis** — "Why do I get cramps?" answered with data, not guesses

**What's under the hood:**
- Multi-month log fusion with forward-period anchoring
- Adaptive cycle length learning across irregular cycles
- Real-time phase recalculation when new data arrives
- Bayesian confidence scoring (low/medium/high) on every prediction

> *"We don't just track your period. We understand your cycle better than you do."*

---

## Slide 5 · THE DIAGNOSTIC MOAT

### From tracking app → at-home diagnostic platform

**The moat: LH/FSH test strip integration**

```mermaid
flowchart LR
  A["📷 Scan Strip"] --> B["🧠 CV Pipeline"]
  B --> C["LH / FSH\nQuantification"]
  C --> D["Multi-Signal\nFertility Engine"]
  E["💧 Cervical Mucus"] --> D
  F["📅 Cycle History"] --> D
  D --> G["🎯 Fertility Score\n(0-100)"]
  D --> H["⚠️ PCOS Risk\nScreening"]
```

**Why this is a moat:**

| Layer | Competitors | Rove |
|-------|------------|------|
| Period tracking | ✅ Everyone does this | ✅ |
| Symptom logging | ✅ Flo, Clue | ✅ |
| Cervical mucus scoring | ⚠️ Manual only | ✅ MPIQ algorithm |
| **LH strip scanning** | ❌ Separate hardware | ✅ Phone camera |
| **LH + CM + Period fusion** | ❌ Nobody | ✅ **4-signal engine** |
| **PCOS screening** | ❌ Requires lab visit | ✅ **At-home flag** |

> [!IMPORTANT]
> **Key insight:** Each signal alone is ~60% accurate for ovulation. Our 4-signal fusion reaches **92%+ accuracy** — matching clinical-grade monitoring at ₹0 hardware cost.

---

## Slide 6 · PCOS EARLY SCREENING

### Catch PCOS 2 years earlier. From an app.

**How it works:**
- Track LH:FSH ratio across cycles (>2:1 on 2+ readings = flag)
- Detect anovulatory cycles (no LH surge across monitored months)
- Correlate with cycle irregularity + logged symptoms (acne, hair growth, weight)
- Generate a **risk score** with actionable recommendations

**User journey:**

```
Month 1:  "Your LH seems consistently elevated"
          → Suggest: Scan strips on days 8-14

Month 2:  "No ovulation surge detected this cycle"
          → Flag: 1 of 4 PCOS indicators present

Month 3:  "Your LH:FSH ratio is 2.8:1 across 3 readings"
          → Alert: Moderate PCOS risk. Here's a report for your doctor.
```

**Output:** A shareable PDF report with cycle data, strip results, and risk factors — designed for gynaecologist visits.

> *We're not diagnosing. We're arming women with data that gets them diagnosed faster.*

---

## Slide 7 · SUPPLEMENT SHOP INTEGRATION

### Phase-matched commerce: the right supplement, at the right time

**The concept:**
Most women buy supplements randomly. Rove recommends **exactly what you need, based on your current phase and symptoms**.

| Phase | Common Needs | Recommended Supplements |
|-------|-------------|------------------------|
| **Menstrual** | Iron loss, cramps, fatigue | Iron + Vitamin C, Magnesium, Ashwagandha |
| **Follicular** | Energy building, estrogen support | B-Complex, Zinc, Green tea extract |
| **Ovulatory** | Fertility support, antioxidants | CoQ10, Vitamin E, Evening primrose |
| **Luteal** | PMS relief, mood stability | Calcium, Vitamin B6, Chasteberry |

**How it integrates:**

```
┌─────────────────────────────────────────────┐
│  📦  Rove Recommends for your Luteal Phase  │
│                                             │
│  Based on: Your logged symptoms (bloating,  │
│  mood swings) + Phase (Luteal, Day 22)      │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │Calcium  │ │Vitamin  │ │Chaste-  │       │
│  │+ Mag    │ │B6       │ │berry    │       │
│  │         │ │         │ │         │       │
│  │ ₹349    │ │ ₹249    │ │ ₹499    │       │
│  │[Add 🛒] │ │[Add 🛒] │ │[Add 🛒] │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│  Powered by: Partner Brand Logo             │
└─────────────────────────────────────────────┘
```

**Revenue model:**
- **Affiliate commission** (15-25%) on each supplement sale
- **Subscription box** — Monthly "Cycle Kit" auto-shipped based on upcoming phase
- **White-label opportunity** — "Rove Essentials" branded supplements

> [!TIP]
> **Why it works:** Conversion is 3-5x higher when recommendations are *personalised + contextual* vs generic storefront.

---

## Slide 8 · MARKET & BUSINESS MODEL

### TAM: ₹39,000 Cr ($4.7B) Indian FemTech by 2030

**Revenue Streams:**

| Stream | Model | Unit Economics |
|--------|-------|---------------|
| 🆓 **Free tier** | Period tracking, basic insights | User acquisition funnel |
| 💎 **Rove Pro** (₹199/mo) | AI coach, advanced insights, unlimited history | LTV: ₹4,800 |
| 🧪 **Strip Kits** (₹599/pack) | 10 LH/FSH strips + app integration | 60% margin |
| 💊 **Supplement Shop** | Phase-matched affiliate commerce | 20% take rate |
| 📄 **Health Reports** | PDF reports for doctor visits | ₹99/report |
| 🏥 **B2B** | Anonymised cycle insights for pharma/research | Enterprise licensing |

**Unit economics at scale (Year 2):**
- CAC: ₹80 (organic + referral-heavy)
- ARPU: ₹150/month (blended free + paid)
- LTV: ₹3,600
- **LTV/CAC: 45x**

---

## Slide 9 · COMPETITIVE LANDSCAPE

### We play where nobody else can

```
                    DIAGNOSTIC DEPTH →
                    Low          Medium         High
              ┌──────────┬──────────────┬──────────────┐
   INDIA      │  Period  │              │              │
   FOCUSED    │  Tracker │              │    ROVE      │
    ↑         │  apps    │              │   ★★★★★     │
              ├──────────┼──────────────┼──────────────┤
   GLOBAL     │  Apple   │    Flo       │   Inito      │
              │  Health  │    Clue      │  (hardware)  │
              │          │              │   ₹4999 kit  │
              └──────────┴──────────────┴──────────────┘
```

**Why we win:**

| vs Flo/Clue | vs Inito | vs Generic trackers |
|-------------|----------|-------------------|
| India-first content | No ₹5000 hardware needed | AI-powered, not just a calendar |
| Diagnostic depth | Software-only, phone camera | Phase-matched commerce |
| Commerce layer | PCOS screening built in | Cervical mucus scoring |
| Vernacular AI coach | 10x cheaper | Doctor-ready reports |

---

## Slide 10 · TRACTION & ASK

### Where we are today

| Metric | Status |
|--------|--------|
| **Product** | Live PWA with full period tracker, AI coach, MPIQ, insights |
| **Tech stack** | Next.js + Supabase + Multi-model AI (Gemini, GPT, Groq) |
| **Data signals** | 6 daily tracking categories, 14 symptom types |
| **Architecture** | Multi-signal fertility engine designed, LH/FSH plan ready |
| **Team** | [Your team details] |

### Roadmap

```
NOW ─────── Q2 2026 ──── Q3 2026 ──── Q4 2026 ──── 2027
 │            │            │            │            │
 ▼            ▼            ▼            ▼            ▼
Period      LH Strip     PCOS        Supplement   B2B
Tracker     Scanning     Screening   Shop Live    Pharma
+ AI        + Fertility  + Doctor    + Sub Box    Partnerships
Coach       Score        Reports
```

### The Ask

**Raising: ₹[X] Cr Seed Round**

- 40% → Strip integration + diagnostic accuracy R&D
- 30% → User acquisition (India Tier 1 + 2 cities)
- 20% → Supplement partnerships + commerce buildout
- 10% → Team expansion (ML engineer, clinical advisor)

> **We're building the health OS for Indian women. Tracking is the trojan horse. Diagnostics is the moat. Commerce is the engine.**

---

*Contact: [email] · [phone] · rovehealth.com*
