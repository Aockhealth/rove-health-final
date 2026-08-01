import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  Check,
  FileText,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sun,
  Stethoscope,
  X,
} from "lucide-react";
import { LAUNCHED_PRODUCTS } from "@/data/products";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { BuyBox, type BuyOption, type PricedBuyOption } from "@/components/shop/BuyBox";
import { SectionChips, type SectionChip } from "@/components/shop/SectionChips";
import { Disclosure } from "@/components/shop/Disclosure";
import { RiverRow } from "@/components/ui/RiverRow";
import { ProductGallery, type GalleryBadge } from "@/components/shop/ProductGallery";
import { MechanismDiagram } from "@/components/shop/MechanismDiagram";
import { RatioMarks } from "@/components/shop/RatioMarks";
import { FormulationTable } from "@/components/shop/FormulationTable";
import { StickyBuyBar } from "@/components/shop/StickyBuyBar";
import { Cite } from "@/components/shop/Cite";
import { ReferencesList, type ReferenceItem } from "@/components/shop/ReferencesList";
import { getProductPricingByVariant, getQuantityQuote } from "@/lib/shopify/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Balance | Rove Health",
  description:
    "Balance: a doctor-formulated daily tablet for cycles that don't run on schedule, dosed to the insulin-sensitising ratio used in the research behind it.",
};

const TRUST = [
  { icon: Stethoscope, label: "Doctor-formulated" },
  { icon: FlaskConical, label: "Clinically-backed" },
  { icon: Leaf, label: "Vegetarian" },
];

/** Printed onto the product shot, the way a label carries its own credentials. */
const GALLERY_BADGES: GalleryBadge[] = [
  { kicker: "Doctor", emphasis: "formulated" },
  { kicker: "The clinical", emphasis: "40:1", footer: "ratio" },
];

/** The three lines that decide the purchase, above the fold and unhedged. */
const HERO_BENEFITS = [
  "Formulated by doctors",
  "Built for irregular cycles and PMOS",
  "Dosed to the clinically-studied 40:1 inositol ratio",
];

const SECTION_CHIPS: SectionChip[] = [
  { label: "What's inside", href: "#ingredients" },
  { label: "Is it safe?", href: "#standards" },
  { label: "How it works", href: "#science" },
  { label: "All questions", href: "#faq" },
];

/** Packs, not plans. Each one's real total is quoted from Shopify at render, so
 *  an automatic bundle discount shows up here instead of only at checkout. */
const BUY_OPTIONS: BuyOption[] = [
  {
    id: "three-bottle",
    quantity: 3,
    label: "3 bottles",
    priceUnit: "3 bottles",
    recommended: true,
    perks: [
      "180 tablets · one delivery",
      "Long enough to judge whether it's working",
      "Nothing to reorder in between",
    ],
  },
  {
    id: "one-bottle",
    quantity: 1,
    label: "One bottle",
    priceUnit: "bottle",
    perks: ["60 tablets · 1–2 a day"],
  },
];

/** Each card pairs a real finding with the dose gap between the study and this
 *  tablet. The hedge is not optional — it is the honest half of the claim. */
const EVIDENCE = [
  {
    icon: Activity,
    label: "Metabolic & glycemic",
    refs: [1, 2, 3, 4],
    claim: (
      <>
        A 24-week placebo-controlled trial of this exact 40:1 ratio significantly lowered insulin
        resistance and fasting insulin in women with PMOS.
        <Cite n={1} />
      </>
    ),
    actives: ["Myo-Inositol 1000mg", "D-Chiro-Inositol 25mg", "Chromium 100mcg", "Berberine 100mg"],
    hedge:
      "That trial's inositol dosing matches this tablet's. The chromium trial that found similar results used 1000mcg, ten times what's here. Berberine and magnesium sit in the same pathway on thinner evidence, so we don't rest a claim on them.",
  },
  {
    icon: Sun,
    label: "Healthy ovulation",
    refs: [5],
    claim: (
      <>
        In vitamin-D-deficient women with PMOS, ovulation rates rose from about 40% to 59–65% after
        repletion over 24 weeks.
        <Cite n={5} />
      </>
    ),
    actives: ["Vitamin D3 300 IU", "Myo-Inositol 1000mg", "NAC 300mg"],
    hedge:
      "That result came from 30,000 IU a week, roughly 14× this tablet's 300 IU/day, in women correcting an existing deficiency. It doesn't tell us what 300 IU/day does on its own.",
  },
  {
    icon: CalendarCheck,
    label: "Cycle regularity",
    refs: [6, 5],
    claim: (
      <>
        The 40:1 ratio restored menstruation in 5 of 8 women, the strongest result of any ratio
        tested.
        <Cite n={6} /> Vitamin D3 separately shortened average cycles by close to 12 days versus
        placebo.
        <Cite n={5} />
      </>
    ),
    actives: ["Myo-Inositol 1000mg", "D-Chiro-Inositol 25mg", "Vitamin D3 300 IU"],
    hedge:
      "Both are small, early studies their own authors call for confirming at scale, and the vitamin D arm again used ~14× this dose. Not a guarantee of what one tablet a day will do.",
  },
  {
    icon: ShieldCheck,
    label: "Acne control",
    refs: [7, 8, 9],
    claim: (
      <>
        A meta-analysis of oral zinc trials found a significant drop in inflammatory breakouts.
        <Cite n={7} /> Myo-inositol was separately linked to a 69% fall in inflammatory lesions.
        <Cite n={8} />
      </>
    ),
    actives: ["Zinc 6.6mg", "Myo-Inositol 1000mg", "Selenium 20mcg"],
    hedge:
      "The effective zinc doses studied ran 2–4× the 6.6mg here; the myo-inositol study used 4g/day with no placebo group. The selenium signal is older and uncontrolled.",
  },
];

const WHO_ITS_FOR = [
  "Your period arrives on a different date every month, or skips months entirely",
  "You've been diagnosed with PMOS, or suspect it",
  "You're managing insulin resistance alongside an irregular cycle",
  "Cravings and energy crashes track with your cycle, not your discipline",
  "Breakouts flare along the jaw and chin",
  "You've been told to lose weight and come back, without being told why",
];

const STANDARDS = [
  "Formulated by practising doctors, not a marketing team",
  "Dosed to the 40:1 ratio the published research actually tested",
  "Every claim on this page linked to its study, including where our dose is lower than the one trialled",
  "Vegetarian, and manufactured under an FSSAI licence",
  "A supplement, not a medicine — and we don't market it as a replacement for treatment",
];

const COMPARISON = [
  "Formulated by doctors",
  "Dosed to a published clinical ratio",
  "Built for irregular cycles and PMOS",
  "Insulin-sensitising actives, not just vitamins",
  "Every claim linked to its source study",
];

const REFERENCES: ReferenceItem[] = [
  {
    n: 1,
    label:
      "A Combined Therapy with Myo-Inositol and D-Chiro-Inositol Improves Endocrine Parameters and Insulin Resistance in PCOS Young Overweight Women",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4963579/",
  },
  {
    n: 2,
    label:
      "Chromium picolinate reduces insulin resistance in polycystic ovary syndrome: Randomized controlled trial",
    url: "https://obgyn.onlinelibrary.wiley.com/doi/abs/10.1111/jog.12907",
  },
  {
    n: 3,
    label:
      "The Effect of Berberine on Polycystic Ovary Syndrome Patients with Insulin Resistance (PCOS-IR): A Meta-Analysis and Systematic Review",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6261244/",
  },
  {
    n: 4,
    label:
      "The Effect of Magnesium Supplementation on Insulin Resistance and Metabolic Profiles in Women with Polycystic Ovary Syndrome: a Randomized Clinical Trial",
    url: "https://link.springer.com/article/10.1007/s12011-023-03744-7",
  },
  {
    n: 5,
    label:
      "Effects of Vitamin D3 Treatment on Polycystic Ovary Symptoms: A Prospective Double-Blind Two-Phase Randomized Controlled Clinical Trial",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11990587/",
  },
  {
    n: 6,
    label:
      "The 40:1 myo-inositol/D-chiro-inositol plasma ratio is able to restore ovulation in PCOS patients: comparison with other ratios",
    url: "https://pubmed.ncbi.nlm.nih.gov/31298405/",
  },
  {
    n: 7,
    label:
      "Serum zinc levels and efficacy of zinc treatment in acne vulgaris: A systematic review and meta-analysis",
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/dth.14252",
  },
  {
    n: 8,
    label:
      "Efficacy and Safety of Tracnil administration in patients with dermatological manifestations of PCOS: An open-label single-arm study",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7128037/",
  },
  {
    n: 9,
    label:
      "Erythrocyte glutathione peroxidase activity in acne vulgaris and the effect of selenium and vitamin E treatment",
    url: "https://pubmed.ncbi.nlm.nih.gov/6203294/",
  },
];

function SectionHeading({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/50">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-sans text-2xl font-semibold leading-tight tracking-tight text-obsidian md:text-4xl">
        {children}
      </h2>
    </div>
  );
}

export default async function ShopPage() {
  const product = LAUNCHED_PRODUCTS[0];
  if (!product) return null;

  let livePrice: string | null = null;
  let compareAtPrice: string | null = null;
  if (product.shopifyVariantId) {
    const pricing = await getProductPricingByVariant(product.shopifyVariantId);
    if (pricing?.price) {
      livePrice = pricing.price.amount.replace(/\.0+$/, "");
      if (pricing.compareAtPrice) {
        compareAtPrice = pricing.compareAtPrice.amount.replace(/\.0+$/, "");
      }
    }
  }

  const liveProduct = {
    ...product,
    price: livePrice ? parseInt(livePrice, 10) : product.price,
  };

  const displayPrice = livePrice || String(product.price);

  // Quote every pack size at once — an automatic discount lives on the cart, not
  // the variant, so multiplying the unit price would miss it entirely.
  const pricedOptions: PricedBuyOption[] = await Promise.all(
    BUY_OPTIONS.map(async (option) => {
      const quote = product.shopifyVariantId
        ? await getQuantityQuote(product.shopifyVariantId, option.quantity)
        : null;
      const subtotal = quote?.subtotal ?? liveProduct.price * option.quantity;
      return {
        ...option,
        pricing: {
          subtotal,
          total: quote?.total ?? subtotal,
          compareAtTotal: compareAtPrice ? Number(compareAtPrice) * option.quantity : null,
        },
      };
    })
  );

  const keyIngredients = product.ingredients
    .map((name) => ({
      name,
      detail: product.formulation.find((item) =>
        item.nutrient.toLowerCase().includes(name.split(" ")[0].toLowerCase())
      ),
    }))
    .filter((item): item is { name: string; detail: (typeof product.formulation)[number] } =>
      Boolean(item.detail)
    );

  return (
    <>
      {/* ─── 1. Buy box ───────────────────────────────────────── */}
      <section id="shop-hero" className="bg-paper px-6 pt-8 pb-14 md:pt-12 md:pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 md:gap-14">
          <div className="min-w-0 md:sticky md:top-28 md:self-start">
            <ProductGallery
              image={product.image}
              alt={product.title}
              gallery={product.gallery}
              badges={GALLERY_BADGES}
            />
          </div>

          <div className="flex min-w-0 flex-col">
            {/* The credentials row sits where a star rating would — we don't have
                verified reviews yet, and won't print a number we can't stand behind. */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 md:gap-x-5">
              {TRUST.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon
                    className="h-3 w-3 text-obsidian/45 md:h-3.5 md:w-3.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="font-sans text-[9px] font-medium uppercase tracking-[0.08em] text-obsidian/55 md:text-[11px] md:tracking-[0.12em]">
                    {label}
                  </span>
                </span>
              ))}
            </div>

            <h1 className="mt-3 font-sans text-3xl font-semibold leading-[1.05] tracking-tight text-obsidian md:mt-4 md:text-5xl">
              {product.title}
            </h1>

            <p className="mt-2 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-obsidian/60 md:mt-2.5 md:text-[13px] md:tracking-[0.16em]">
              To get the perfect rhythm
            </p>

            <RiverRow
              className="mt-4 md:mt-5"
              durationSeconds={56}
              items={[
                { label: product.phaseLabel, phase: true },
                ...product.benefits.map((benefit) => ({ label: benefit, phase: false })),
              ]}
              renderItem={({ label, phase }, decorative, i) =>
                phase ? (
                  <Badge
                    key={`${label}-${i}`}
                    variant={product.phaseVariant}
                    aria-hidden={decorative || undefined}
                    className="w-fit shrink-0 whitespace-nowrap"
                  >
                    {label}
                  </Badge>
                ) : (
                  <span
                    key={`${label}-${i}`}
                    aria-hidden={decorative || undefined}
                    className="shrink-0 whitespace-nowrap rounded-full border border-obsidian/15 px-3 py-1.5 font-sans text-xs font-medium text-obsidian/75"
                  >
                    {label}
                  </span>
                )
              }
            />

            <div className="mt-5 md:mt-6">
              <SectionChips chips={SECTION_CHIPS} />
            </div>

            <ul className="mt-6 space-y-2.5 md:mt-7 md:space-y-3">
              {HERO_BENEFITS.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <Check
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-sage-teal"
                    strokeWidth={3}
                    aria-hidden
                  />
                  <span className="font-sans text-sm leading-[1.6] text-obsidian/80 md:text-base">
                    {line}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 md:mt-8">
              <BuyBox product={liveProduct} options={pricedOptions} />
            </div>


            <a
              href="#supplement-facts"
              className="mt-5 inline-flex w-fit items-center gap-2 font-sans text-sm font-medium text-obsidian underline decoration-obsidian/25 underline-offset-4 hover:decoration-obsidian"
            >
              <FileText className="h-4 w-4" aria-hidden />
              View supplement facts
            </a>
          </div>
        </div>

        <span id="shop-hero-sentinel" aria-hidden className="block h-px w-full" />
      </section>

      {/* ─── 2. Description ───────────────────────────────────── */}
      <section className="border-t border-obsidian/10 bg-gradient-menstrual px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading eyebrow="Product description">
              An irregular cycle is the last thing to go wrong.{" "}
              <span className="font-serif italic font-medium">Not the first.</span>
            </SectionHeading>
          </Reveal>

          <div className="mt-10 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
            <Reveal>
              <MechanismDiagram className="mt-4 md:mt-8" />
            </Reveal>

            <Reveal delay={120}>
              <SectionHeading eyebrow="Who this is for" className="mb-6 md:mb-8">
                If this is your calendar.
              </SectionHeading>
              <ul className="space-y-4">
                {WHO_ITS_FOR.map((line) => (
                  <li key={line} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-teal-light text-sage-teal">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="font-sans text-base leading-[1.6] text-obsidian/80">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 border-l-2 border-taupe-dark pl-5 font-serif text-lg italic font-medium leading-[1.5] text-obsidian/80">
                {product.whoItsFor}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 3. Benefits / evidence ───────────────────────────── */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading eyebrow="Benefits">
              What it&apos;s dosed to do.{" "}
              <span className="font-serif italic font-medium">And what the study actually said.</span>
            </SectionHeading>
            <p className="mt-4 max-w-[60ch] font-sans text-sm leading-[1.75] text-obsidian/60">
              Every claim below is linked to the research behind it, including where our dose is
              lower than the one that was tested.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {EVIDENCE.map(({ icon: Icon, label, claim, actives, hedge, refs }, i) => (
              <Reveal key={label} delay={i * 90}>
                <div className="flex h-full flex-col rounded-[24px] border border-obsidian/8 bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-teal-light text-sage-teal">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>

                  <p className="mt-5 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian/50">
                    {label}
                  </p>

                  <p className="mt-3 font-sans text-base leading-[1.7] text-obsidian/85">{claim}</p>

                  {/* The card shows the claim. The dose gap, the actives, and the
                      papers themselves are one tap away rather than buried. */}
                  <Disclosure
                    variant="inline"
                    label="The study behind it"
                    className="mt-auto pt-3"
                  >
                    <ul className="mt-4 space-y-2">
                      {refs.map((n) => {
                        const reference = REFERENCES.find((r) => r.n === n);
                        if (!reference) return null;
                        return (
                          <li key={n} className="flex gap-2">
                            <span className="shrink-0 font-sans text-[11px] tabular-nums text-obsidian/45">
                              [{n}]
                            </span>
                            <a
                              href={reference.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-sans text-xs leading-[1.55] text-obsidian underline decoration-obsidian/25 underline-offset-2 hover:decoration-obsidian"
                            >
                              {reference.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </Disclosure>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. The 40:1 ratio ────────────────────────────────── */}
      <section id="science" className="scroll-mt-24 bg-gradient-follicular px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading eyebrow="The science">
              {product.scienceHighlight.title}
            </SectionHeading>
          </Reveal>

          <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
            <Reveal>
              <RatioMarks formulation={product.formulation} />
            </Reveal>

            <Reveal delay={120}>
              <p className="font-serif text-xl italic font-medium leading-snug text-obsidian md:text-2xl">
                Forty parts to one. Not a blend, a dose.
              </p>
              <p className="mt-5 font-sans text-sm leading-[1.75] text-obsidian/70">
                {product.scienceHighlight.detail}
                <Cite n={6} />
              </p>
              {product.scienceHighlight.caveat && (
                <p className="mt-4 font-sans text-xs italic leading-relaxed text-obsidian/55">
                  {product.scienceHighlight.caveat}
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </section>


      {/* ─── 6. Key ingredients ───────────────────────────────── */}
      <section id="ingredients" className="scroll-mt-24 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading eyebrow="Key ingredients">
              So, what&apos;s inside?
            </SectionHeading>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {keyIngredients.map(({ name, detail }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div className="h-full rounded-[20px] border border-obsidian/8 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-sans text-lg font-semibold tracking-tight text-obsidian">
                      {detail.nutrient}
                    </span>
                    <span className="shrink-0 font-sans text-xs font-medium tabular-nums text-obsidian/60">
                      {detail.dose}
                    </span>
                  </div>
                  <p className="mt-2.5 font-sans text-sm leading-[1.7] text-obsidian/70">
                    {detail.why}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={160}>
            <div id="supplement-facts" className="mx-auto mt-16 max-w-3xl scroll-mt-32">
              <Disclosure label="View full formulation & references" variant="row">
                <div className="pt-4">
                  <FormulationTable formulation={product.formulation} />
                </div>
                <div className="mt-12">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian/50">
                    References · {REFERENCES.length} studies
                  </p>
                  <div className="mt-5">
                    <ReferencesList items={REFERENCES} />
                  </div>
                </div>
              </Disclosure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 7. The Rove difference & Standards ───────────────── */}
      <section className="bg-gradient-ovulatory px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <SectionHeading eyebrow="The difference">
              Built for one problem.{" "}
              <span className="font-serif italic font-medium">Not for a shelf.</span>
            </SectionHeading>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-obsidian/15">
                    <th className="py-4 pr-4 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-obsidian/50">
                      &nbsp;
                    </th>
                    <th className="w-24 py-4 text-center font-sans text-xs font-semibold tracking-tight text-obsidian md:w-32 md:text-sm">
                      {product.title}
                    </th>
                    <th className="w-24 py-4 text-center font-sans text-xs font-medium tracking-tight text-obsidian/50 md:w-32 md:text-sm">
                      A generic multivitamin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row} className="border-b border-obsidian/10">
                      <td className="py-4 pr-4 font-sans text-sm leading-snug text-obsidian/80">
                        {row}
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sage-teal-light text-sage-teal">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                          <span className="sr-only">Yes</span>
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-obsidian/5 text-obsidian/35">
                          <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                          <span className="sr-only">No</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={120} className="scroll-mt-24">
            <span id="standards" aria-hidden className="block scroll-mt-24" />
            <SectionHeading eyebrow="Our standards">What we hold it to.</SectionHeading>
            <ul className="mt-10 space-y-3.5">
              {STANDARDS.map((line) => (
                <li key={line} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-teal-light text-sage-teal">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="font-sans text-sm leading-[1.6] text-obsidian/75">{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ─── 10. FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-24 bg-gradient-luteal px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <SectionHeading eyebrow="Questions & answers">
              Questions about {product.title}.
            </SectionHeading>
          </Reveal>
          <Reveal delay={100} className="mt-8">
            <Accordion items={product.faqs} defaultOpenIndex={null} variant="editorial" />
          </Reveal>
        </div>
      </section>


      {/* ─── 12. Close ────────────────────────────────────────── */}
      <section className="px-6 py-16 text-center md:py-20">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-obsidian md:text-4xl">
            It starts tomorrow morning.{" "}
            <span className="font-serif italic font-medium">Then the one after that.</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <span className="font-sans text-2xl font-semibold tabular-nums text-obsidian">
              {compareAtPrice && (
                <span className="mr-2 text-xl font-normal line-through opacity-60">
                  ₹{compareAtPrice}
                </span>
              )}
              ₹{displayPrice}
            </span>
            <AddToCartButton product={liveProduct} />
          </div>
          <p className="mt-5 font-sans text-[11px] uppercase tracking-[0.18em] text-obsidian/60">
            {product.unitCount} {product.unitLabel} per bottle · 1–2 a day
          </p>
        </Reveal>
      </section>

      {/* ─── 13. App nudge ────────────────────────────────────── */}
      <section className="px-6 py-12 pb-24 md:pb-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-sm leading-relaxed text-obsidian/60">
            Want a daily plan built around your phase, not just a supplement?{" "}
            <Link href="/app" className="font-medium text-obsidian underline underline-offset-4">
              Get the Cycle Sync app
            </Link>.
          </p>
        </Reveal>
      </section>

      <StickyBuyBar product={liveProduct} livePrice={livePrice} compareAtPrice={compareAtPrice} />
    </>
  );
}
