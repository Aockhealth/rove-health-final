export type ProductHandle = "cycle-sync-rise" | "cycle-sync-restore" | "cycle-sync-balance";

export interface FormulationItem {
  nutrient: string;
  dose: string;
  rda?: string;
  why: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ScienceHighlight {
  title: string;
  detail: string;
}

export interface LocalProduct {
  handle: ProductHandle;
  launched: boolean;
  title: string;
  phaseLabel: string;
  phaseVariant: "menstrual" | "follicular" | "ovulatory" | "luteal" | "balance";
  tagline: string;
  description: string;
  goal: string;
  whoItsFor: string;
  benefits: string[];
  scienceHighlight: ScienceHighlight;
  ingredients: string[];
  formulation: FormulationItem[];
  dosage: string;
  faqs: ProductFaq[];
  price: number;
  currency: string;
  image: string;
  shopifyVariantId?: string;
}

export const LOCAL_PRODUCTS: LocalProduct[] = [
  {
    handle: "cycle-sync-rise",
    launched: false,
    title: "Cycle Sync Rise",
    phaseLabel: "Menses + Follicular",
    phaseVariant: "follicular",
    tagline: "For the build: energy, clarity, and momentum as your body moves into its cycle.",
    description:
      "During menstruation, oestrogen and progesterone fall to their monthly low, triggering the shedding of the uterine lining, and with it, a real, measurable loss of iron, zinc, and B-vitamins. As bleeding tapers and the Follicular phase begins, rising oestrogen shifts the body into an anabolic, building state: insulin sensitivity improves, metabolic rate climbs, and the ovaries begin recruiting the next cohort of follicles. Rise is dosed to that exact window, pairing a chelated iron to replace what menstruation removes with the cofactors and antioxidants that support the follicular recruitment happening underneath it.",
    goal: "Replaces what menstruation depletes, eases cramping and inflammation, and primes the body for the oestrogen surge ahead.",
    whoItsFor:
      "For anyone who wants to feel like themselves again during their period and the two weeks after, especially if fatigue, heavy flow, or low iron are part of your story.",
    benefits: ["Replaces lost iron", "Eases period cramps", "Builds energy", "Supports egg quality"],
    scienceHighlight: {
      title: "Chelated, not crude",
      detail:
        "Rise uses ferrous bisglycinate, an amino-acid-bound iron shown in absorption research to cause meaningfully less nausea and constipation than standard ferrous sulfate, at a comparable absorption rate.",
    },
    ingredients: ["Ferrous Bisglycinate (Iron)", "Shatavari", "Astaxanthin", "Magnesium Malate"],
    formulation: [
      {
        nutrient: "Iron (Ferrous Bisglycinate, chelated)",
        dose: "29mg elemental (~100mg bisglycinate)",
        rda: "100%",
        why: "A gentler, chelated form of iron that replaces what menstruation takes without the digestive upset of standard iron salts.",
      },
      {
        nutrient: "Vitamin C (Ascorbic Acid)",
        dose: "65mg",
        rda: "100%",
        why: "Significantly increases how much of that iron your body actually absorbs.",
      },
      {
        nutrient: "Zinc (Zinc Bisglycinate)",
        dose: "13.2mg elemental",
        rda: "100%",
        why: "A cofactor for over 300 enzymes, including those driving the immune response and tissue repair through the shedding phase.",
      },
      {
        nutrient: "Manganese",
        dose: "4mg",
        rda: "100%",
        why: "A cofactor for superoxide dismutase, an antioxidant enzyme, and for the collagen-building enzymes active during tissue repair.",
      },
      {
        nutrient: "Ginger extract (10% gingerol)",
        dose: "100mg",
        why: "Clinically studied for easing menstrual cramping and nausea.",
      },
      {
        nutrient: "Piperine extract (95%)",
        dose: "5mg",
        why: "Improves the bioavailability of the other nutrients in the formula.",
      },
      {
        nutrient: "Amla extract (40% tannin)",
        dose: "50mg",
        why: "A whole-food vitamin C source with additional antioxidant support.",
      },
      {
        nutrient: "Coenzyme Q10",
        dose: "50mg",
        why: "Supports cellular energy production and egg quality.",
      },
      {
        nutrient: "B-complex (B1, B6, B7)",
        dose: "100% RDA each",
        rda: "100%",
        why: "B1 and B7 act as direct cofactors in the citric acid cycle, the pathway cells use to convert food into usable energy, while B6 supports nervous system function.",
      },
      {
        nutrient: "Vitamin B12 (Methylcobalamin)",
        dose: "2.2mcg",
        rda: "100%",
        why: "The active form of B12, easier for the body to use, especially on a vegetarian diet.",
      },
      {
        nutrient: "Folate (5-MTHF)",
        dose: "220mcg",
        rda: "100%",
        why: "The pre-activated form of folate, which works around the common MTHFR gene variant.",
      },
      {
        nutrient: "Vitamin D3 (Veg-Lichen)",
        dose: "600 IU",
        rda: "100%",
        why: "Vitamin D receptors are expressed directly in ovarian and endometrial tissue, and deficiency remains one of the most widespread nutrient gaps among Indian women.",
      },
      {
        nutrient: "Selenium",
        dose: "40mcg",
        why: "A cofactor for glutathione peroxidase and the deiodinase enzymes that activate thyroid hormone, linking it to both antioxidant defense and thyroid function.",
      },
      {
        nutrient: "Shatavari Extract (standardised)",
        dose: "150mg",
        why: "An Ayurvedic adaptogen traditionally used for female hormonal balance.",
      },
      {
        nutrient: "Astaxanthin (10%)",
        dose: "~40mg (4mg active)",
        why: "A potent antioxidant studied for supporting egg quality.",
      },
      {
        nutrient: "NAC",
        dose: "150mg",
        why: "Supports the body's antioxidant defenses and healthy ovulation.",
      },
      {
        nutrient: "Magnesium Malate",
        dose: "75mg elemental (~500mg malate)",
        rda: "20%",
        why: "Eases cramping and supports cellular energy production.",
      },
      {
        nutrient: "Vitamin E",
        dose: "7.5mg",
        rda: "100%",
        why: "A lipid-soluble antioxidant that protects cell membranes from the oxidative stress generated during the shedding phase.",
      },
    ],
    dosage: "2 capsules with the largest meal of the day, Days 1–14",
    faqs: [
      {
        question: "When do I start taking Rise?",
        answer: "From Day 1 of your period through Day 14, alongside your largest meal.",
      },
      {
        question: "Can I take Rise and Restore together?",
        answer:
          "No. Rise carries you through Days 1–14, then you switch to Restore for Days 15–28. They're built to alternate with your cycle, not stack.",
      },
      {
        question: "Will Rise help with period cramps?",
        answer:
          "It's formulated with ginger extract and magnesium malate, both included specifically to help ease menstrual cramping.",
      },
    ],
    price: 1499,
    currency: "INR",
    image: "/brand/phases/follicular-v2.jpg",
    shopifyVariantId: "", // Replace with real Shopify Variant ID
  },
  {
    handle: "cycle-sync-restore",
    launched: false,
    title: "Cycle Sync Restore",
    phaseLabel: "Ovulatory + Luteal",
    phaseVariant: "luteal",
    tagline: "For the wind-down: calm, comfort, and steadiness through your luteal phase.",
    description:
      "Oestrogen peaks just before ovulation, delivering the cycle's sharpest metabolic and cognitive high. Once the egg releases, progesterone becomes the dominant hormone through the Luteal phase, and with it comes a well-documented physiological shift: insulin sensitivity drops, cortisol reactivity rises, and the serotonin and GABA signalling that keep mood and sleep steady both come under more pressure in the days before your period. Restore is built around the specific botanicals and cofactors studied against that exact shift, rather than masking the symptoms it causes.",
    goal: "Calms the PMS storm at its root: easing bloating and mood dysregulation, lowering cortisol, stabilising insulin, and supporting restorative sleep.",
    whoItsFor:
      "For anyone whose luteal phase comes with a side of irritability, bloating, cravings, or restless nights before it hands off to the next cycle.",
    benefits: ["Eases PMS mood swings", "Lowers cortisol", "Reduces bloating", "Supports sleep"],
    scienceHighlight: {
      title: "Standardised, not generic",
      detail:
        "Restore's Vitex Agnus Castus is standardised to 0.5% agnusides, the specific compound most research points to for its effect on pituitary hormone signalling, rather than an unstandardised, crude extract.",
    },
    ingredients: ["Vitex (Chasteberry)", "Ashwagandha", "Magnesium Bisglycinate", "DIM"],
    formulation: [
      {
        nutrient: "Vitex Agnus Castus (Chasteberry, 0.5% agnusides)",
        dose: "40mg",
        why: "One of the most-studied botanicals for easing PMS mood changes and breast tenderness.",
      },
      {
        nutrient: "Magnesium Bisglycinate",
        dose: "75mg elemental (~500mg bisglycinate)",
        rda: "20%",
        why: "Eases bloating and cramping, and supports deeper, more restorative sleep.",
      },
      {
        nutrient: "Ashwagandha extract",
        dose: "200mg",
        why: "A gold-standard adaptogen shown in clinical research to help lower serum cortisol, the stress hormone that rises alongside progesterone through this phase.",
      },
      {
        nutrient: "L-theanine",
        dose: "150mg",
        why: "Promotes calm focus without sedation, pairs naturally with ashwagandha.",
      },
      {
        nutrient: "Saffron extract",
        dose: "20mg",
        why: "Studied for supporting serotonin activity, the neurotransmitter most closely tied to PMS-related mood changes.",
      },
      {
        nutrient: "DIM",
        dose: "75mg",
        why: "Supports healthy oestrogen metabolism as levels shift through the luteal phase.",
      },
      {
        nutrient: "Fennel extract",
        dose: "200mg",
        why: "Contains anethole, a compound studied for relaxing digestive smooth muscle, traditionally used to ease bloating and discomfort.",
      },
      {
        nutrient: "Ginger extract (10% gingerol)",
        dose: "50mg",
        why: "Gingerol compounds act on the same inflammatory pathway as common anti-inflammatories, easing digestive discomfort and cramping.",
      },
      {
        nutrient: "Zinc (Zinc Bisglycinate)",
        dose: "13.2mg elemental",
        rda: "100%",
        why: "A cofactor in the enzyme that converts testosterone to oestrogen, tying it directly to hormone metabolism through the luteal phase.",
      },
      {
        nutrient: "Vitamin D3 (Veg-Lichen)",
        dose: "600 IU",
        rda: "100%",
        why: "Vitamin D receptors are present in mood-regulating regions of the brain, linking this widespread deficiency to the luteal dip.",
      },
      {
        nutrient: "Vitamin E",
        dose: "7.5mg",
        rda: "75%",
        why: "Eases breast tenderness and late-luteal discomfort.",
      },
      {
        nutrient: "B-complex (B1, B6, B7, B9, B12)",
        dose: "100% RDA each",
        rda: "100%",
        why: "B6 is a direct precursor to serotonin and dopamine, easing mood swings.",
      },
    ],
    dosage: "2 capsules with dinner, Days 15–28",
    faqs: [
      {
        question: "When do I start taking Restore?",
        answer: "From Day 15 through the end of your cycle, with dinner.",
      },
      {
        question: "Does Restore help with PMS specifically?",
        answer:
          "Yes. Vitex and saffron extract are both included specifically for PMS-related mood changes.",
      },
      {
        question: "Is it safe to take Restore alongside Rise?",
        answer:
          "They're designed to alternate, not overlap: Rise for Days 1–14, Restore for Days 15–28.",
      },
    ],
    price: 1499,
    currency: "INR",
    image: "/brand/phases/luteal.jpg",
    shopifyVariantId: "", // Replace with real Shopify Variant ID
  },
  {
    handle: "cycle-sync-balance",
    launched: true,
    title: "Cycle Sync Balance",
    phaseLabel: "Irregular Cycles + PMOS",
    phaseVariant: "balance",
    tagline: "For the reset: bringing structure back to cycles that don't follow a predictable rhythm.",
    description:
      "Balance is built for cycles that don't run on a predictable rhythm, most often because of PMOS. At its root, PMOS is closely tied to insulin resistance: cells respond less efficiently to insulin, the pancreas compensates by producing more of it, and that excess insulin drives the ovaries to overproduce androgens, disrupting ovulation. Balance is formulated around the exact insulin-sensitising ratio and cofactors used in the clinical research behind that mechanism, rather than a generic multivitamin approach to an irregular cycle.",
    goal: "Supports insulin sensitivity and hormone regulation, helping bring a more predictable rhythm back to irregular cycles.",
    whoItsFor:
      "For anyone whose cycle doesn't follow a predictable rhythm, including those managing PMOS or insulin resistance.",
    benefits: ["Supports insulin sensitivity", "Supports regular ovulation", "Built for irregular cycles", "PMOS-focused"],
    scienceHighlight: {
      title: "The clinically-studied 40:1 ratio",
      detail:
        "Myo-Inositol and D-Chiro-Inositol are dosed at a 40:1 ratio (1000mg to 25mg), the ratio shown most effective for restoring ovulation across head-to-head PMOS clinical research comparing multiple ratios, rather than an arbitrary blend of the two.",
    },
    ingredients: ["Myo-Inositol", "D-Chiro-Inositol", "Berberine HCl", "Chromium Picolinate"],
    formulation: [
      {
        nutrient: "Myo-Inositol",
        dose: "1000mg",
        why: "The most-studied nutrient for supporting insulin sensitivity and ovulatory function in PMOS.",
      },
      {
        nutrient: "D-Chiro-Inositol",
        dose: "25mg",
        why: "Works alongside Myo-Inositol in the ratio most used in clinical research.",
      },
      {
        nutrient: "Berberine HCl",
        dose: "100mg",
        why: "Activates AMPK, a cellular energy-sensing pathway central to insulin sensitivity research, helping cells take up glucose more efficiently.",
      },
      {
        nutrient: "Chromium Picolinate",
        dose: "100mcg",
        why: "Enhances insulin receptor sensitivity, supporting how efficiently cells respond to insulin and regulate blood sugar.",
      },
      {
        nutrient: "Methyl Folate (Vitamin B9)",
        dose: "110mcg",
        rda: "50%",
        why: "The active form of folate, supporting cell regeneration.",
      },
      {
        nutrient: "N-Acetyl-Cysteine (NAC)",
        dose: "300mg",
        why: "An antioxidant studied for supporting ovulatory function in PMOS.",
      },
      {
        nutrient: "Magnesium (Magnesium Hydroxide)",
        dose: "125mg",
        rda: "38.40%",
        why: "Supports insulin sensitivity and eases tension.",
      },
      {
        nutrient: "Vitamin D3",
        dose: "300 IU",
        rda: "50%",
        why: "Commonly deficient in PMOS, and closely linked to insulin resistance.",
      },
      {
        nutrient: "Zinc (Zinc Gluconate)",
        dose: "6.6mg",
        rda: "50%",
        why: "Involved in regulating androgen metabolism, relevant to the skin and hair symptoms common in PMOS.",
      },
      {
        nutrient: "Selenium (Sodium Selenate)",
        dose: "20mcg",
        rda: "50%",
        why: "Supports thyroid function, closely linked to PMOS.",
      },
      {
        nutrient: "Vitamin B6",
        dose: "0.95mg",
        rda: "50%",
        why: "A cofactor in oestrogen and progesterone metabolism.",
      },
      {
        nutrient: "Vitamin K2",
        dose: "13.75mcg",
        rda: "50%",
        why: "Works alongside D3 to support bone and metabolic health.",
      },
      {
        nutrient: "Vitamin B12",
        dose: "1.1mcg",
        rda: "50%",
        why: "Supports energy metabolism.",
      },
      {
        nutrient: "Vitamin C",
        dose: "32.5mg",
        rda: "50%",
        why: "An antioxidant supporting overall immune health.",
      },
      {
        nutrient: "Vitamin E",
        dose: "3.75mg",
        rda: "50%",
        why: "An antioxidant supporting cellular health.",
      },
    ],
    dosage: "1–2 tablets daily, or as directed by your dietician",
    faqs: [
      {
        question: "Is Balance only for people diagnosed with PMOS?",
        answer:
          "No. Balance is built for anyone with irregular cycles, though its insulin-sensitising ingredients are especially studied for PMOS.",
      },
      {
        question: "How is Balance different from Rise and Restore?",
        answer:
          "Rise and Restore are phase-timed to a regular 28-day cycle. Balance is taken daily regardless of cycle day, since irregular cycles don't have a predictable Day 1.",
      },
      {
        question: "Can I take Balance alongside Rise or Restore?",
        answer:
          "Check with your doctor first if you're considering combining formulas, since some ingredients overlap.",
      },
    ],
    price: 1599,
    currency: "INR",
    image: "/brand/phases/balance-v2.png",
    shopifyVariantId: "gid://shopify/ProductVariant/62123218108786",
  },
];

export const LAUNCHED_PRODUCTS = LOCAL_PRODUCTS.filter((p) => p.launched);

export function getLocalProduct(handle: string) {
  return LOCAL_PRODUCTS.find((p) => p.handle === handle);
}
