/**
 * TTC (trying-to-conceive) diet & lifestyle guidance for the Plan tab.
 *
 * Framed around preparing for pregnancy over the coming weeks/months, not
 * around today's cycle phase — this content leads the TTC Guide tab, ahead
 * of the phase-focus banner, on purpose: a TTC user's Plan tab should read as
 * "getting ready for a baby", not "syncing with today's hormones".
 *
 * General, educational, non-diagnostic — matches the disclaimer already shown
 * at onboarding ("does not intend to diagnose, cure, treat, or prevent any
 * condition"). Two traditions side by side rather than blended into one
 * generic list, because they come from different evidence bases and readers
 * should be able to tell which is which:
 *
 *  - "Clinical" reflects what's consistently supported in reproductive-health
 *    nutrition literature (Mediterranean-pattern eating, specific micronutrients,
 *    reducing trans fats/processed food).
 *  - "Ayurvedic" reflects Garbhadhana Samskar preconception practice (seasonal,
 *    home-cooked food; warmth; daily rhythm; stress reduction) as commonly
 *    described for a general readership.
 *
 * Meal ideas are everyday Indian home cooking, not a prescribed diet plan —
 * the point is to make "eat more lentils and leafy greens" concrete enough to
 * actually cook, not to dictate exactly what to eat.
 *
 * Deliberately excludes specific herbs (e.g. Shatavari, Ashwagandha) and any
 * dosing — herb-drug interactions and dosing are a clinical decision for a
 * qualified practitioner, not something an app should hand out generically.
 *
 * IMPORTANT: this copy has not been reviewed by a clinician. Flagged for the
 * founder / a qualified clinician to review before shipping, per the original
 * build plan — do not treat the content below as final.
 *
 * Sources consulted (see conversation for full search results):
 * - Preconception diet & female fertility, systematic scoping review — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10663051/
 * - Anti-inflammatory diets in fertility, evidence review — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9570802/
 * - Garbhadhana Samskar / Ayurveda preconception care — https://www.apollopharmacy.in/momverse/a/garbhadhana-preconception-care
 * - Ayurveda and pregnancy: fertility, diet, guidelines — https://www.weljii.com/blog/ayurveda-and-pregnancy-part-ii-conception/
 */

export interface TtcGuidanceSection {
  title: string;
  points: string[];
}

export interface TtcMealIdea {
  time: 'Morning' | 'Mid-Morning' | 'Lunch' | 'Evening' | 'Dinner';
  idea: string;
  /** Why this one made the list — ties it back to a nutrient, not just "healthy". */
  why: string;
}

export interface TtcSession {
  title: string;
  desc: string;
  length: string;
}

export interface TtcGuidance {
  /** Leads the section — sets the "preparing for pregnancy", not
   * "today's phase", framing before anything else. */
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  mealIdeas: TtcMealIdea[];
  emphasize: string[];
  limit: string[];
  clinical: TtcGuidanceSection;
  ayurvedic: TtcGuidanceSection;
  /** Shown only when the user's onboarding goals/conditions include PCOS. */
  pcosNote: string;
  disclaimer: string;
  /** Nourish tab's own disclaimer — food has established preconception roles, but no outcome is promised. */
  noClaimsNote: string;
  /** Move tab's weekly session list. */
  sessions: TtcSession[];
  /** Move tab's "how hard to push" bullets. */
  moveNotes: string[];
  /** Move tab's PCOS-specific movement note, shown only with PCOS. */
  movePcosNote: string;
}

export const TTC_GUIDANCE: TtcGuidance = {
  heroTitle: 'Preparing for Pregnancy',
  heroSubtitle: 'The months before conception',
  intro:
    'Fertility-supportive eating and lifestyle changes are generally most useful when started a few months before conception, not just after — there’s time for this to help even if you’re just getting started. Most of what makes a real difference is steady daily habits, not any single food or supplement.',
  mealIdeas: [
    {
      time: 'Morning',
      idea: 'Moong dal chilla or besan chilla with a side of curd',
      why: 'Lentil/gram-flour batter is a good plant protein and iron source to start the day on.',
    },
    {
      time: 'Morning',
      idea: 'Vegetable poha or upma with peanuts, plus a boiled egg if you eat eggs',
      why: 'Peanuts add healthy fats; egg adds choline and complete protein.',
    },
    {
      time: 'Mid-Morning',
      idea: 'A handful of soaked almonds and walnuts',
      why: 'Walnuts are one of the few plant sources with meaningful omega-3s.',
    },
    {
      time: 'Lunch',
      idea: 'Dal or rajma/chana, a millet roti (jowar/bajra) or rice, sabzi, and curd',
      why: 'This combination is the everyday version of the "whole grains, legumes, vegetables" pattern that shows up repeatedly in fertility nutrition research.',
    },
    {
      time: 'Evening',
      idea: 'Roasted chana or makhana instead of fried snacks',
      why: 'Same idea as the "cut back on fried food" point below, just made concrete for snack time.',
    },
    {
      time: 'Dinner',
      idea: 'Khichdi with a spoon of ghee, or a simple vegetable + dal soup',
      why: 'Lighter, warm, and easy to digest — the kind of evening meal Ayurvedic preconception guidance generally favors over heavy or late-night eating.',
    },
    {
      time: 'Dinner',
      idea: 'Warm milk with a pinch of turmeric before bed, if dairy agrees with you',
      why: 'A traditional wind-down habit that also fits the "consistent evening rhythm" theme below — not included for any specific medicinal claim.',
    },
  ],
  emphasize: [
    'Leafy greens (spinach, methi, sarson)',
    'Lentils and dals — protein and iron together',
    'Whole grains and millets (jowar, bajra, ragi)',
    'Nuts and seeds, especially walnuts and flaxseed',
    'Dairy — paneer, curd, milk, in the amount that agrees with you',
    'Seasonal fruit',
    'Fish or eggs, if you eat them — good sources of omega-3s and choline',
  ],
  limit: [
    'Fried and packaged snacks',
    'Sugar-sweetened drinks',
    'Excess caffeine',
    'Alcohol',
    'Refined-flour (maida) heavy foods in place of whole grains',
    'Leftovers, canned, or heavily preserved food — an Ayurvedic preference for freshly cooked meals, not a food-safety warning',
  ],
  clinical: {
    title: 'What the research generally supports',
    points: [
      'A Mediterranean-style pattern — vegetables, fruit, whole grains, legumes, olive oil, fish — is the dietary pattern most consistently linked to better reproductive outcomes.',
      'Folate, iron, vitamin D and omega-3s are the nutrients most often flagged as worth getting enough of; a prenatal or preconception multivitamin is the usual way people cover folate specifically — ask your doctor which one and what dose fits you.',
      'Cutting back on trans fats, fried food, and sugar-sweetened drinks shows up repeatedly as unhelpful for fertility, more consistently than any single "superfood" helps.',
      'Reducing alcohol and quitting smoking, if applicable, are two of the highest-impact changes for both partners.',
    ],
  },
  ayurvedic: {
    title: 'Ayurvedic-inspired daily rhythm',
    points: [
      'Favor freshly cooked, warm meals over packaged, frozen, or leftover food — a preference that shows up throughout Ayurvedic preconception (Garbhadhana Samskar) guidance.',
      'Keep a regular daily rhythm — consistent meal times, and winding down before a late night — rather than irregular eating and sleeping hours.',
      'Gentle daily movement and breath-focused practice (a simple yoga or pranayama routine) are traditionally paired with diet changes, not treated as separate from it.',
      'Garbhadhana Samskar frames the few months before conception as being about both partners’ wellbeing, not just the person carrying — worth keeping in mind if you have a partner in this with you.',
    ],
  },
  pcosNote:
    'With PCOS, the general research above still applies — a Mediterranean-style pattern and cutting back on refined carbs/sugary drinks are commonly discussed specifically for PCOS-related insulin resistance. Anovulatory cycles are common with PCOS, so treat any month without a confirmed ovulation as normal for now rather than a setback, and bring your logged cycles to your doctor if you’d like to discuss options.',
  disclaimer:
    'General educational information, not medical advice — it doesn’t diagnose or treat anything. Talk to your doctor before starting any supplement, and before making significant diet changes if you have an existing condition.',
  noClaimsNote:
    'Nutrients with established preconception roles, yes. Promises about outcomes, no — nothing on this page will tell you a food makes conception happen.',
  sessions: [
    { title: 'Gentle yoga and pranayama', desc: 'Breath-led, unhurried. The daily anchor rather than the workout.', length: '20 min' },
    { title: 'Walk after your largest meal', desc: 'Steadier blood sugar, and the easiest habit here to keep.', length: '15 min' },
    { title: 'Full-body strength, twice a week', desc: 'Squats, rows, carries. Moderate load, nothing near failure.', length: '30 min' },
    { title: 'One genuinely easy day', desc: 'Rest is part of the week, not what is left when it goes wrong.', length: '—' },
  ],
  moveNotes: [
    'Moderate, regular activity is what the preconception literature supports. Very high training volumes are associated with cycle disruption in some people, which is the one thing worth watching for.',
    'Nothing in your training needs to change around ovulation. If you want an easier couple of days, take them because you feel like it — not because a harder session costs you anything.',
    'If your cycles are irregular and you are training hard, that is worth raising with a doctor before adding more.',
  ],
  movePcosNote:
    'Resistance work and walking after meals are the two most commonly discussed for insulin resistance. Consistency across the week matters more than the intensity of any one session.',
};
