export type ProductHandle =
  | "hormone-balance"
  | "cycle-sync-rise"
  | "cycle-sync-restore";

export type EvidenceLevel = "foundational" | "emerging" | "traditional";

export type SourceLink = {
  label: string;
  url: string;
};

export type LocalProduct = {
  handle: ProductHandle;
  title: string;
  shortName: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  phaseFit: string[];
  bestFor: string[];
  highlights: string[];
  ingredientSlugs: string[];
  image: string;
  accent: "menstrual" | "follicular" | "ovulatory" | "luteal";
  shopifyHandle: string;
  fallbackPrice: string;
};

export type IngredientEntry = {
  slug: string;
  name: string;
  category:
    | "Vitamin"
    | "Mineral"
    | "Botanical"
    | "Amino acid"
    | "Nutrient"
    | "Phytonutrient";
  foundIn: ProductHandle[];
  dosages: Partial<Record<ProductHandle, string>>;
  role: string;
  evidenceLevel: EvidenceLevel;
  evidenceNote: string;
  safetyNote: string;
  sourceLinks: SourceLink[];
};

export const SOURCE_LINKS = {
  shopifyStorefront: {
    label: "Shopify Storefront API",
    url: "https://shopify.dev/docs/api/storefront/latest",
  },
  ods: {
    label: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/list-all/",
  },
  nccih: {
    label: "NCCIH supplement guidance",
    url: "https://www.nccih.nih.gov/health/supplements",
  },
  fssai: {
    label: "FSSAI health supplement guidance",
    url: "https://fssai.gov.in/cms/health-supplements.php",
  },
  fssaiRda: {
    label: "FSSAI RDA declaration direction",
    url: "https://fssai.gov.in/upload/advisories/2022/02/61fb7270d464fDirection_RDA_03_02_2022.pdf",
  },
} satisfies Record<string, SourceLink>;

export const PRODUCT_LABELS: Record<ProductHandle, string> = {
  "hormone-balance": "Hormone Balance",
  "cycle-sync-rise": "Cycle Sync Rise",
  "cycle-sync-restore": "Cycle Sync Restore",
};

export const LOCAL_PRODUCTS: LocalProduct[] = [
  {
    handle: "hormone-balance",
    shopifyHandle: "hormone-balance",
    title: "Hormone Balance",
    shortName: "Balance",
    eyebrow: "PCOS and metabolic rhythm support",
    subtitle: "For steady glucose, ovulatory rhythm, and daily hormone support.",
    description:
      "A targeted blend built around myo-inositol, NAC, chromium, zinc, vitamin D3, and antioxidant nutrients to support metabolic and hormonal wellbeing.",
    phaseFit: ["Daily foundation", "Irregular rhythm support", "Metabolic support"],
    bestFor: [
      "Women looking for steady cycle support",
      "Those tracking PCOS-related wellbeing with a clinician",
      "Daily mineral and inositol support",
    ],
    highlights: ["Myo-inositol", "NAC", "Chromium", "Vitamin D3", "Zinc"],
    ingredientSlugs: [
      "chromium-picolinate",
      "berberis-vulgaris",
      "vitamin-d3",
      "vitamin-c",
      "vitamin-k2",
      "zinc",
      "vitamin-e",
      "folic-acid",
      "sodium-selenate",
      "vitamin-b12",
      "vitamin-b6",
      "myo-inositol",
      "inositol",
      "nac",
    ],
    image: "/images/rove_product_set_1764583837494.png",
    accent: "follicular",
    fallbackPrice: "Coming soon",
  },
  {
    handle: "cycle-sync-rise",
    shopifyHandle: "cycle-sync-rise",
    title: "Cycle Sync Rise",
    shortName: "Rise",
    eyebrow: "PMS and luteal support",
    subtitle: "For the days when mood, cravings, sleep, and calm need more care.",
    description:
      "A luteal-phase support formula with chasteberry, magnesium bisglycinate, saffron, L-theanine, ashwagandha, zinc, and B vitamins.",
    phaseFit: ["Luteal phase", "Pre-period support", "Calm and mood support"],
    bestFor: [
      "Pre-period mood and calm support",
      "Cycle-aware magnesium and B vitamin support",
      "Women who want a ritual for the late-cycle window",
    ],
    highlights: ["Chasteberry", "Magnesium bisglycinate", "Saffron", "L-theanine", "B-complex"],
    ingredientSlugs: [
      "zinc",
      "chasteberry",
      "vitamin-d3",
      "ashwagandha",
      "vitamin-e",
      "dim",
      "saffron",
      "l-theanine",
      "fennel",
      "b-complex",
      "magnesium-bisglycinate",
      "ginger",
    ],
    image: "/images/hormone_flow_background_1764584093305.png",
    accent: "luteal",
    fallbackPrice: "Coming soon",
  },
  {
    handle: "cycle-sync-restore",
    shopifyHandle: "cycle-sync-restore",
    title: "Cycle Sync Restore",
    shortName: "Restore",
    eyebrow: "Iron, energy, and egg-health support",
    subtitle: "For low-energy days, period recovery, and micronutrient replenishment.",
    description:
      "A replenishing formula with chelated iron, vitamin C, CoQ10, folate, methylcobalamin, shatavari, magnesium malate, and antioxidant support.",
    phaseFit: ["Menstrual phase", "Recovery window", "Energy support"],
    bestFor: [
      "Period-related replenishment",
      "Iron and vitamin C support",
      "Cycle-aware antioxidant and methylated B vitamin support",
    ],
    highlights: ["Chelated iron", "Vitamin C", "CoQ10", "5-MTHF", "Magnesium malate"],
    ingredientSlugs: [
      "iron-bisglycinate",
      "vitamin-c",
      "ginger",
      "piperine",
      "amla",
      "zinc",
      "vitamin-d3",
      "coq10",
      "folate-5-mthf",
      "vitamin-b12",
      "b-complex",
      "vitamin-e",
      "selenium",
      "shatavari",
      "manganese",
      "astaxanthin",
      "nac",
      "magnesium-malate",
    ],
    image: "/images/hormone_balance_art_1764265060774.png",
    accent: "menstrual",
    fallbackPrice: "Coming soon",
  },
];

const vitaminSources = [SOURCE_LINKS.ods, SOURCE_LINKS.fssaiRda];
const botanicalSources = [SOURCE_LINKS.nccih, SOURCE_LINKS.fssai];

export const INGREDIENT_GLOSSARY: IngredientEntry[] = [
  {
    slug: "iron-bisglycinate",
    name: "Iron bisglycinate",
    category: "Mineral",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "29 mg elemental iron" },
    role: "Supports normal red blood cell formation and oxygen transport.",
    evidenceLevel: "foundational",
    evidenceNote: "Iron is an essential mineral with well-established roles in oxygen transport and energy metabolism.",
    safetyNote: "Iron is not suitable for everyone. Avoid extra iron unless advised if you have high ferritin, hemochromatosis, or are taking iron-containing medicines.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "vitamin-c",
    name: "Vitamin C",
    category: "Vitamin",
    foundIn: ["cycle-sync-restore", "hormone-balance"],
    dosages: { "cycle-sync-restore": "65 mg", "hormone-balance": "32.5 mg" },
    role: "Supports antioxidant protection and helps the body absorb non-heme iron.",
    evidenceLevel: "foundational",
    evidenceNote: "Vitamin C is an essential vitamin with established antioxidant and collagen-support roles.",
    safetyNote: "High doses can cause digestive discomfort in some people.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "ginger",
    name: "Ginger extract",
    category: "Botanical",
    foundIn: ["cycle-sync-restore", "cycle-sync-rise"],
    dosages: { "cycle-sync-restore": "100 mg", "cycle-sync-rise": "50 mg" },
    role: "Traditionally used for digestive comfort and formulated here as warm cycle support.",
    evidenceLevel: "traditional",
    evidenceNote: "Ginger is a widely used botanical with research interest in nausea and inflammatory pathways.",
    safetyNote: "Check with a clinician if you use blood thinners, have gallbladder concerns, or are pregnant.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "piperine",
    name: "Piperine extract",
    category: "Phytonutrient",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "5 mg" },
    role: "Included as a bioavailability-supporting botanical extract.",
    evidenceLevel: "emerging",
    evidenceNote: "Piperine is studied for its effect on absorption of some compounds.",
    safetyNote: "May affect medication levels. Use caution if taking prescription medicines.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "amla",
    name: "Amla extract",
    category: "Botanical",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "50 mg" },
    role: "Provides polyphenol-rich antioxidant botanical support.",
    evidenceLevel: "traditional",
    evidenceNote: "Amla has a long history of food and botanical use, with modern research interest in antioxidant activity.",
    safetyNote: "Discuss use with a clinician if pregnant, breastfeeding, or taking medication.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "zinc",
    name: "Zinc",
    category: "Mineral",
    foundIn: ["cycle-sync-restore", "cycle-sync-rise", "hormone-balance"],
    dosages: {
      "cycle-sync-restore": "13.2 mg elemental zinc",
      "cycle-sync-rise": "13.2 mg elemental zinc",
      "hormone-balance": "6.6 mg",
    },
    role: "Supports normal immune function, skin health, and reproductive wellbeing.",
    evidenceLevel: "foundational",
    evidenceNote: "Zinc is an essential mineral with established roles in immunity, cell division, and reproductive function.",
    safetyNote: "Long-term high zinc intake can affect copper status and may cause nausea.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "vitamin-d3",
    name: "Vitamin D3",
    category: "Vitamin",
    foundIn: ["cycle-sync-restore", "cycle-sync-rise", "hormone-balance"],
    dosages: {
      "cycle-sync-restore": "600 IU",
      "cycle-sync-rise": "600 IU",
      "hormone-balance": "300 IU",
    },
    role: "Supports immune, bone, muscle, and endocrine wellbeing.",
    evidenceLevel: "foundational",
    evidenceNote: "Vitamin D is an essential fat-soluble vitamin with well-established roles in calcium balance and bone health.",
    safetyNote: "Avoid stacking multiple high-dose vitamin D products unless monitored.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "coq10",
    name: "Coenzyme Q10",
    category: "Nutrient",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "50 mg" },
    role: "Supports cellular energy pathways and antioxidant capacity.",
    evidenceLevel: "emerging",
    evidenceNote: "CoQ10 is involved in mitochondrial energy production and is studied in fertility and cardiometabolic contexts.",
    safetyNote: "May interact with anticoagulants and some medications.",
    sourceLinks: [SOURCE_LINKS.ods, SOURCE_LINKS.nccih],
  },
  {
    slug: "folate-5-mthf",
    name: "Folate as 5-MTHF",
    category: "Vitamin",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "220 mcg" },
    role: "Supports methylation, red blood cell formation, and preconception nutrient status.",
    evidenceLevel: "foundational",
    evidenceNote: "Folate has established roles in cell division and neural tube development when taken before and during early pregnancy.",
    safetyNote: "If pregnant, trying to conceive, or using anti-seizure medication, confirm folate needs with a clinician.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "folic-acid",
    name: "Folic acid",
    category: "Vitamin",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "110 mcg" },
    role: "Supports normal cell division and folate status.",
    evidenceLevel: "foundational",
    evidenceNote: "Folic acid is the supplement form of folate and has well-established reproductive health relevance.",
    safetyNote: "High intake can mask vitamin B12 deficiency; use with care if B12 status is unknown.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "vitamin-b12",
    name: "Vitamin B12",
    category: "Vitamin",
    foundIn: ["cycle-sync-restore", "hormone-balance"],
    dosages: { "cycle-sync-restore": "2.2 mcg", "hormone-balance": "1.1 mcg" },
    role: "Supports red blood cell formation, nerve function, and energy metabolism.",
    evidenceLevel: "foundational",
    evidenceNote: "Vitamin B12 is an essential vitamin, especially relevant for people with low intake from animal foods.",
    safetyNote: "People with known deficiency may need clinician-guided dosing beyond a daily wellness formula.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "b-complex",
    name: "B-complex vitamins",
    category: "Vitamin",
    foundIn: ["cycle-sync-restore", "cycle-sync-rise"],
    dosages: {
      "cycle-sync-restore": "B1, B6, B7 at 100% RDA each",
      "cycle-sync-rise": "B1, B6, B7, B9, B12 at 100% RDA each",
    },
    role: "Supports energy metabolism, nervous system function, and cycle-aware daily resilience.",
    evidenceLevel: "foundational",
    evidenceNote: "B vitamins are essential micronutrients with established metabolic roles.",
    safetyNote: "Avoid combining many high-dose B vitamin products without checking total intake.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "vitamin-b6",
    name: "Vitamin B6",
    category: "Vitamin",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "0.95 mg" },
    role: "Supports neurotransmitter metabolism and normal hormone activity.",
    evidenceLevel: "foundational",
    evidenceNote: "Vitamin B6 is essential for amino acid metabolism and nervous system function.",
    safetyNote: "Very high long-term B6 intake can affect nerves; avoid high-dose stacking.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "vitamin-e",
    name: "Vitamin E",
    category: "Vitamin",
    foundIn: ["cycle-sync-restore", "cycle-sync-rise", "hormone-balance"],
    dosages: {
      "cycle-sync-restore": "7.5 mg",
      "cycle-sync-rise": "7.5 mg",
      "hormone-balance": "3.75 mg",
    },
    role: "Supports antioxidant protection for cell membranes.",
    evidenceLevel: "foundational",
    evidenceNote: "Vitamin E is an essential fat-soluble antioxidant nutrient.",
    safetyNote: "High-dose vitamin E can interact with anticoagulant therapy.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "selenium",
    name: "Selenium",
    category: "Mineral",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "40 mcg" },
    role: "Supports antioxidant enzymes and thyroid hormone metabolism.",
    evidenceLevel: "foundational",
    evidenceNote: "Selenium is an essential trace mineral with established roles in selenoproteins.",
    safetyNote: "Avoid stacking high-selenium products; excess intake can be harmful.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "sodium-selenate",
    name: "Sodium selenate",
    category: "Mineral",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "20 mcg" },
    role: "Provides selenium for antioxidant enzyme support.",
    evidenceLevel: "foundational",
    evidenceNote: "Sodium selenate is a selenium source used to support selenium intake.",
    safetyNote: "Avoid combining with other high-selenium supplements unless advised.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "shatavari",
    name: "Shatavari extract",
    category: "Botanical",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "150 mg" },
    role: "Traditionally used in women's wellness formulas for nourishment and reproductive wellbeing.",
    evidenceLevel: "traditional",
    evidenceNote: "Shatavari has traditional Ayurvedic use, with emerging modern research.",
    safetyNote: "Avoid if advised against phytoestrogenic botanicals; consult during pregnancy, breastfeeding, or hormone-sensitive conditions.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "manganese",
    name: "Manganese",
    category: "Mineral",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "4 mg" },
    role: "Supports antioxidant enzymes and normal connective tissue formation.",
    evidenceLevel: "foundational",
    evidenceNote: "Manganese is an essential trace mineral involved in enzyme systems.",
    safetyNote: "Do not combine multiple high-manganese products without checking total intake.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "astaxanthin",
    name: "Astaxanthin",
    category: "Phytonutrient",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "4 mg active astaxanthin" },
    role: "Provides carotenoid antioxidant support.",
    evidenceLevel: "emerging",
    evidenceNote: "Astaxanthin is a carotenoid studied for antioxidant and inflammatory pathway support.",
    safetyNote: "Discuss use if pregnant, breastfeeding, or taking medications.",
    sourceLinks: [SOURCE_LINKS.nccih, SOURCE_LINKS.fssai],
  },
  {
    slug: "nac",
    name: "N-acetyl cysteine",
    category: "Amino acid",
    foundIn: ["cycle-sync-restore", "hormone-balance"],
    dosages: { "cycle-sync-restore": "150 mg", "hormone-balance": "300 mg" },
    role: "Supports glutathione pathways and antioxidant resilience.",
    evidenceLevel: "emerging",
    evidenceNote: "NAC is studied for antioxidant support and metabolic health contexts.",
    safetyNote: "Check with a clinician if you have asthma, take nitroglycerin, use blood thinners, or are pregnant.",
    sourceLinks: [SOURCE_LINKS.nccih, SOURCE_LINKS.fssai],
  },
  {
    slug: "magnesium-malate",
    name: "Magnesium malate",
    category: "Mineral",
    foundIn: ["cycle-sync-restore"],
    dosages: { "cycle-sync-restore": "75 mg elemental magnesium" },
    role: "Supports muscle function, energy metabolism, and magnesium repletion.",
    evidenceLevel: "foundational",
    evidenceNote: "Magnesium is an essential mineral involved in hundreds of enzyme reactions.",
    safetyNote: "Can cause loose stools. Ask a clinician if you have kidney disease or take medications affected by magnesium.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "magnesium-bisglycinate",
    name: "Magnesium bisglycinate",
    category: "Mineral",
    foundIn: ["cycle-sync-rise"],
    dosages: { "cycle-sync-rise": "75 mg elemental magnesium" },
    role: "Supports muscle relaxation, calm, and normal nervous system function.",
    evidenceLevel: "foundational",
    evidenceNote: "Magnesium is an essential mineral; bisglycinate is commonly used for gentler daily supplementation.",
    safetyNote: "Ask a clinician if you have kidney disease or take medicines that bind minerals.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "chasteberry",
    name: "Vitex agnus-castus (chasteberry)",
    category: "Botanical",
    foundIn: ["cycle-sync-rise"],
    dosages: { "cycle-sync-rise": "40 mg standardized extract" },
    role: "Traditionally used in cycle formulas for pre-period wellbeing.",
    evidenceLevel: "emerging",
    evidenceNote: "Chasteberry has clinical research interest for premenstrual symptoms, but it is not a substitute for medical care.",
    safetyNote: "Avoid during pregnancy unless advised. Check with a clinician if using hormonal contraception, fertility medication, or dopamine-related medication.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha extract",
    category: "Botanical",
    foundIn: ["cycle-sync-rise"],
    dosages: { "cycle-sync-rise": "200 mg" },
    role: "Traditionally used as an adaptogenic botanical for stress resilience.",
    evidenceLevel: "traditional",
    evidenceNote: "Ashwagandha has traditional use and growing research interest in stress and sleep support.",
    safetyNote: "Avoid during pregnancy unless advised. Check with a clinician if you have thyroid, autoimmune, or liver concerns.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "dim",
    name: "DIM",
    category: "Phytonutrient",
    foundIn: ["cycle-sync-rise"],
    dosages: { "cycle-sync-rise": "75 mg" },
    role: "Supports estrogen-metabolism pathways as part of a cycle-aware formula.",
    evidenceLevel: "emerging",
    evidenceNote: "DIM is a compound related to cruciferous vegetable metabolism and is studied in estrogen metabolism contexts.",
    safetyNote: "Consult a clinician if pregnant, using hormonal medication, or managing a hormone-sensitive condition.",
    sourceLinks: [SOURCE_LINKS.nccih, SOURCE_LINKS.fssai],
  },
  {
    slug: "saffron",
    name: "Saffron powder",
    category: "Botanical",
    foundIn: ["cycle-sync-rise"],
    dosages: { "cycle-sync-rise": "20 mg" },
    role: "Included for mood and calm support in the pre-period window.",
    evidenceLevel: "emerging",
    evidenceNote: "Saffron is studied for mood-related outcomes, with dosage and extract form varying by study.",
    safetyNote: "Avoid high-dose saffron. Consult during pregnancy, breastfeeding, or with psychiatric medication.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "l-theanine",
    name: "L-theanine",
    category: "Amino acid",
    foundIn: ["cycle-sync-rise"],
    dosages: { "cycle-sync-rise": "150 mg" },
    role: "Supports calm focus and nervous system ease.",
    evidenceLevel: "emerging",
    evidenceNote: "L-theanine is an amino acid from tea studied for relaxation and attention.",
    safetyNote: "Use caution with sedatives or blood pressure medication.",
    sourceLinks: [SOURCE_LINKS.nccih, SOURCE_LINKS.fssai],
  },
  {
    slug: "fennel",
    name: "Fennel extract",
    category: "Botanical",
    foundIn: ["cycle-sync-rise"],
    dosages: { "cycle-sync-rise": "200 mg" },
    role: "Traditionally used for digestive comfort and cycle-time ease.",
    evidenceLevel: "traditional",
    evidenceNote: "Fennel is a culinary botanical with traditional use in digestive and women's wellness contexts.",
    safetyNote: "Consult if pregnant, breastfeeding, allergic to Apiaceae plants, or avoiding phytoestrogenic botanicals.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "chromium-picolinate",
    name: "Chromium picolinate",
    category: "Mineral",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "200 mcg" },
    role: "Supports normal macronutrient metabolism and glucose handling.",
    evidenceLevel: "foundational",
    evidenceNote: "Chromium is an essential trace mineral with research interest in insulin-related pathways.",
    safetyNote: "Check with a clinician if you use diabetes medication or monitor blood glucose.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "berberis-vulgaris",
    name: "Berberis vulgaris",
    category: "Botanical",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "100 mg" },
    role: "Botanical support for metabolic wellness in the Balance formula.",
    evidenceLevel: "emerging",
    evidenceNote: "Berberis species contain bioactive alkaloids and are studied in metabolic health contexts.",
    safetyNote: "Avoid during pregnancy or breastfeeding. Consult if using diabetes, blood pressure, antibiotic, or anticoagulant medication.",
    sourceLinks: botanicalSources,
  },
  {
    slug: "vitamin-k2",
    name: "Vitamin K2 MK-7",
    category: "Vitamin",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "27.5 mcg" },
    role: "Supports normal blood clotting and bone-related nutrient pathways.",
    evidenceLevel: "foundational",
    evidenceNote: "Vitamin K is an essential fat-soluble vitamin with established roles in coagulation.",
    safetyNote: "Do not use with warfarin or similar anticoagulants unless your clinician approves.",
    sourceLinks: vitaminSources,
  },
  {
    slug: "myo-inositol",
    name: "Myo-inositol",
    category: "Nutrient",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "1000 mg" },
    role: "Supports cellular signaling pathways involved in metabolic and ovarian wellbeing.",
    evidenceLevel: "emerging",
    evidenceNote: "Myo-inositol is widely studied in PCOS and metabolic contexts, but individual needs vary.",
    safetyNote: "Check with a clinician if pregnant, trying to conceive, using fertility medication, or using glucose-lowering medication.",
    sourceLinks: [SOURCE_LINKS.nccih, SOURCE_LINKS.fssai],
  },
  {
    slug: "inositol",
    name: "Inositol",
    category: "Nutrient",
    foundIn: ["hormone-balance"],
    dosages: { "hormone-balance": "25 mg" },
    role: "Complements myo-inositol as part of the metabolic-support blend.",
    evidenceLevel: "emerging",
    evidenceNote: "Inositols are involved in cell signaling and are studied in metabolic health contexts.",
    safetyNote: "Can cause digestive discomfort in some people, especially at higher total intakes.",
    sourceLinks: [SOURCE_LINKS.nccih, SOURCE_LINKS.fssai],
  },
];

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  foundational: "Foundational nutrient",
  emerging: "Emerging research",
  traditional: "Traditional use",
};

export const SCIENCE_PILLARS = [
  {
    title: "Cycle context comes first",
    body: "Rove starts with the menstrual cycle because nutrient needs, energy, temperature, cravings, and recovery do not feel the same every week.",
  },
  {
    title: "Formulas are built around jobs",
    body: "Each SKU has a clear role: Restore for replenishment, Rise for the pre-period window, and Balance for daily metabolic and hormone-rhythm support.",
  },
  {
    title: "Evidence is labeled honestly",
    body: "Ingredients are framed as foundational, emerging, or traditional so a shopper understands what is established and what is still developing.",
  },
  {
    title: "Care has guardrails",
    body: "Rove does not diagnose or promise cures. The pages include safety notes, clinician prompts, and supplement interaction reminders.",
  },
];

export function getRecommendedProductHandles(
  phase?: string | null,
  hasMetabolicSignal = false
): ProductHandle[] {
  const normalized = phase?.toLowerCase();
  const recommendations: ProductHandle[] = [];

  if (hasMetabolicSignal) recommendations.push("hormone-balance");
  if (normalized === "luteal") recommendations.push("cycle-sync-rise");
  if (normalized === "menstrual" || normalized === "follicular") {
    recommendations.push("cycle-sync-restore");
  }

  if (recommendations.length === 0) recommendations.push("cycle-sync-restore");
  return Array.from(new Set(recommendations));
}

export function getIngredientBySlug(slug: string): IngredientEntry | undefined {
  return INGREDIENT_GLOSSARY.find((ingredient) => ingredient.slug === slug);
}

export function searchGlossaryEntries(
  query: string,
  filters: {
    category?: IngredientEntry["category"] | "All";
    product?: ProductHandle | "All";
    evidenceLevel?: EvidenceLevel | "All";
  } = {}
): IngredientEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return INGREDIENT_GLOSSARY.filter((entry) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [entry.name, entry.role, entry.evidenceNote, entry.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesCategory =
      !filters.category || filters.category === "All" || entry.category === filters.category;
    const matchesProduct =
      !filters.product || filters.product === "All" || entry.foundIn.includes(filters.product);
    const matchesEvidence =
      !filters.evidenceLevel ||
      filters.evidenceLevel === "All" ||
      entry.evidenceLevel === filters.evidenceLevel;

    return matchesQuery && matchesCategory && matchesProduct && matchesEvidence;
  });
}
