import type { Metadata } from "next";
import Image from "next/image";
import { LAUNCHED_PRODUCTS, LOCAL_PRODUCTS } from "@/data/products";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { MechanismChain } from "@/components/shop/MechanismChain";
import { RatioMarks } from "@/components/shop/RatioMarks";
import { FormulationTable } from "@/components/shop/FormulationTable";
import { StickyBuyBar } from "@/components/shop/StickyBuyBar";
import { RuleDraw } from "@/components/shop/RuleDraw";
import { ThreadDraw } from "@/components/shop/ThreadDraw";
import { Cite } from "@/components/shop/Cite";
import { ReferencesList, type ReferenceItem } from "@/components/shop/ReferencesList";
import { FourJobs, type Job } from "@/components/shop/FourJobs";
import { getProductPricingByVariant } from "@/lib/shopify/client";

export const metadata: Metadata = {
  title: "Shop | Rove Health",
  description:
    "Cycle Sync Balance: doctor-formulated support for cycles that don't follow a predictable rhythm.",
};

const RECOGNITIONS = [
  "Your period shows up whenever it feels like it",
  "You've been told to just lose weight and come back",
  "Nobody explained why any of it was happening",
];

const JOBS: Job[] = [
  {
    label: "Metabolic & Glycemic",
    scene: "The cravings were never a discipline problem.",
    headline: (
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
    label: "Healthy Ovulation",
    scene: "Ovulation doesn't send a calendar invite.",
    headline: (
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
    label: "Cycle Regularity",
    scene: "A calendar that skips weeks isn't broken.",
    headline: (
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
    label: "Acne Control",
    scene: "Skin is the last place PMOS gets blamed, and the first place it shows.",
    headline: (
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

const REFERENCES: ReferenceItem[] = [
  {
    n: 1,
    label:
      "A Combined Therapy with Myo-Inositol and D-Chiro-Inositol Improves Endocrine Parameters and Insulin Resistance in PCOS Young Overweight Women",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4963579/",
  },
  {
    n: 2,
    label: "Chromium picolinate reduces insulin resistance in polycystic ovary syndrome: Randomized controlled trial",
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
    label: "Effects of Vitamin D3 Treatment on Polycystic Ovary Symptoms: A Prospective Double-Blind Two-Phase Randomized Controlled Clinical Trial",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11990587/",
  },
  {
    n: 6,
    label: "The 40:1 myo-inositol/D-chiro-inositol plasma ratio is able to restore ovulation in PCOS patients: comparison with other ratios",
    url: "https://pubmed.ncbi.nlm.nih.gov/31298405/",
  },
  {
    n: 7,
    label: "Serum zinc levels and efficacy of zinc treatment in acne vulgaris: A systematic review and meta-analysis",
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/dth.14252",
  },
  {
    n: 8,
    label: "Efficacy and Safety of Tracnil administration in patients with dermatological manifestations of PCOS: An open-label single-arm study",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7128037/",
  },
  {
    n: 9,
    label: "Erythrocyte glutathione peroxidase activity in acne vulgaris and the effect of selenium and vitamin E treatment",
    url: "https://pubmed.ncbi.nlm.nih.gov/6203294/",
  },
];

function Masthead({
  featured,
  className,
  livePrice,
  compareAtPrice,
}: {
  featured: (typeof LAUNCHED_PRODUCTS)[number];
  className?: string;
  livePrice?: string | null;
  compareAtPrice?: string | null;
}) {
  return (
    <div className={className}>
      <div className="h-0.5 w-full origin-left bg-obsidian animate-rule-draw" />
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-obsidian/12 pb-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian">
          Cycle Sync Balance
        </span>
        <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-obsidian/70">
          {featured.phaseLabel}
        </span>
        <span className="ml-auto font-sans text-[11px] uppercase tracking-[0.16em] tabular-nums text-obsidian/70">
          {featured.unitCount} {featured.unitLabel} ·{" "}
          {compareAtPrice ? (
            <>
              <span className="mr-1.5 opacity-60 line-through decoration-obsidian/40">₹{compareAtPrice}</span>
              ₹{livePrice}
            </>
          ) : (
            `₹${livePrice || featured.price}`
          )}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <>
      <RuleDraw />
      <span className="mt-4 block font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
        {eyebrow}
      </span>
      <h2 className="mt-3">{children}</h2>
    </>
  );
}

export default async function ShopPage() {
  const featured = LAUNCHED_PRODUCTS[0];
  const comingSoon = LOCAL_PRODUCTS.filter((product) => !product.launched);

  if (!featured) return null;

  let livePrice: string | null = null;
  let compareAtPrice: string | null = null;
  if (featured.shopifyVariantId) {
    const pricing = await getProductPricingByVariant(featured.shopifyVariantId);
    if (pricing?.price) {
      livePrice = pricing.price.amount.replace(/\.0+$/, "");
      if (pricing.compareAtPrice) {
        compareAtPrice = pricing.compareAtPrice.amount.replace(/\.0+$/, "");
      }
    }
  }

  const keyIngredients = featured.ingredients
    .map((name) => ({
      name,
      detail: featured.formulation.find((item) =>
        item.nutrient.toLowerCase().includes(name.split(" ")[0].toLowerCase())
      ),
    }))
    .filter((item): item is { name: string; detail: (typeof featured.formulation)[number] } =>
      Boolean(item.detail)
    );

  return (
    <>
      {/* ─── 1. Hero ──────────────────────────────────────────── */}
      <section id="shop-hero" className="relative bg-paper">
        <Masthead featured={featured} className="px-6 pt-10 md:hidden" livePrice={livePrice} compareAtPrice={compareAtPrice} />

        <div className="grid md:min-h-[calc(100svh-5rem)] md:grid-cols-[minmax(0,1fr)_46vw] [@media(min-width:1900px)]:grid-cols-[minmax(0,1fr)_875px]">
          <div className="relative order-first h-[54svh] w-full overflow-hidden md:order-last md:h-auto">
            <Image
              src="/product/balance-stone-sage.jpg"
              alt="A bottle of Cycle Sync Balance resting on a sandstone slab beside sage-green linen"
              fill
              priority
              sizes="(min-width: 1900px) 875px, (min-width: 768px) 46vw, 100vw"
              className="animate-photo-settle object-cover object-center"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-paper to-transparent md:block"
            />
          </div>

          <div className="flex flex-col justify-end px-6 pb-16 pt-10 md:pl-[7vw] md:pr-14 md:pb-[11vh] md:pt-[16vh]">
            <Masthead featured={featured} className="hidden md:block" livePrice={livePrice} compareAtPrice={compareAtPrice} />

            <h1
              className="animate-fade-in mt-8 max-w-[18ch] font-sans text-[2.55rem] font-semibold leading-[1.05] tracking-[-0.02em] text-obsidian md:text-6xl lg:text-[5rem] lg:leading-[0.98]"
              style={{ animationDelay: "140ms" }}
            >
              For cycles that don&apos;t run on schedule.{" "}
              <span className="font-serif italic font-medium">Formulated for the reason why.</span>
            </h1>

            <p
              className="animate-fade-in mt-7 max-w-[38ch] font-sans text-base leading-[1.75] text-obsidian/70 md:text-lg"
              style={{ animationDelay: "280ms" }}
            >
              {featured.tagline}
            </p>

            <div
              className="animate-fade-in mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
              style={{ animationDelay: "400ms" }}
            >
              <AddToCartButton product={featured} />
              <a
                href="#formulation"
                className="font-sans text-sm font-medium text-obsidian underline decoration-obsidian/25 underline-offset-4 hover:decoration-obsidian"
              >
                Read the full formulation
              </a>
            </div>

            <p
              className="animate-fade-in mt-6 font-sans text-xs font-medium tracking-wide text-obsidian/70"
              style={{ animationDelay: "500ms" }}
            >
              1–2 tablets a day, for as long as it&apos;s useful. No course to finish.
            </p>

            <ul
              className="animate-fade-in mt-11 border-t border-obsidian/12 md:grid md:grid-cols-2 md:gap-x-10"
              style={{ animationDelay: "580ms" }}
            >
              {featured.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-baseline gap-4 border-b border-obsidian/12 py-3"
                >
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 bg-sage-teal" />
                  <span className="font-sans text-sm text-obsidian/70">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <span id="shop-hero-sentinel" aria-hidden className="block h-px w-full" />
      </section>

      {/* ─── 2. Recognition (dark) ────────────────────────────── */}
      <section className="bg-rove-plum px-6 py-32 md:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white-bone/70">
              If this is your calendar
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col gap-7 md:gap-9">
            {RECOGNITIONS.map((line, i) => (
              <Reveal key={line} delay={i * 200} className="duration-[1000ms]">
                <p className="text-center font-serif text-2xl italic font-medium leading-snug text-white-bone/90 md:text-4xl">
                  {line}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={620}>
            <p className="mt-16 text-center font-sans text-2xl font-semibold leading-tight tracking-tight text-white-bone md:text-4xl">
              There&apos;s a reason underneath all of it.{" "}
              <span className="font-serif italic font-medium">And it isn&apos;t willpower.</span>
            </p>
          </Reveal>

          <ThreadDraw />
        </div>
      </section>

      {/* ─── 3. Why it happens ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="md:ml-[6%]">
          <SectionHeader eyebrow="Why it happens">
            <span className="max-w-[26ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              An irregular cycle is the last thing to go wrong.{" "}
              <span className="font-serif italic font-medium">Not the first.</span>
            </span>
          </SectionHeader>
        </Reveal>

        <div className="mt-16 grid gap-14 md:grid-cols-[1fr_0.75fr] md:gap-20">
          <Reveal>
            <MechanismChain />
          </Reveal>

          <Reveal delay={150}>
            <p className="max-w-[30ch] font-sans text-xl font-semibold leading-snug tracking-tight text-obsidian md:text-2xl">
              {featured.goal}
            </p>
            <p className="mt-6 max-w-[38ch] font-sans text-sm leading-[1.7] text-obsidian/70">
              Dosed to that mechanism: the insulin-sensitising ratio and cofactors used in the
              research behind it, not a general multivitamin.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. No Day One ────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 md:items-stretch">
        <div className="relative order-first h-[68svh] md:order-first md:h-auto md:min-h-[78svh]">
          <Image
            src="/product/balance-counter.jpg"
            alt="A hand reaching for the Cycle Sync Balance bottle on a marble counter beside a glass of water"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_48%]"
          />
        </div>
        <div className="flex flex-col justify-center bg-white-bone px-6 py-24 md:px-[6vw] md:py-32">
          <Reveal>
            <SectionHeader eyebrow="How you take it">
              <span className="font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-obsidian md:text-5xl">
                No Day 1 to count from.{" "}
                <span className="font-serif italic font-medium">So it doesn&apos;t ask you to.</span>
              </span>
            </SectionHeader>

            <p className="mt-6 max-w-[46ch] font-sans text-base leading-[1.8] text-obsidian/70 md:text-lg">
              Balance is taken daily, whatever day of your cycle it is. There&apos;s no phase to time
              it to and nothing to track. Irregular cycles don&apos;t have a predictable Day 1 to
              count from.
            </p>

            <p className="mt-10 border-t border-obsidian/12 pt-8 font-sans text-lg font-semibold tracking-tight text-obsidian">
              {featured.dosage}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 5. One formula, four jobs ────────────────────────── */}
      <section className="bg-paper mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader eyebrow="One formula, four jobs">
            <span className="font-sans text-3xl font-semibold tracking-tight text-obsidian md:text-5xl">
              Four functions.{" "}
              <span className="font-serif italic font-medium">One tablet behind all of them.</span>
            </span>
          </SectionHeader>
        </Reveal>

        <div className="mt-16 grid items-start gap-14 md:grid-cols-[1.05fr_0.8fr] md:gap-20">
          <Reveal>
            <FourJobs jobs={JOBS} />
          </Reveal>

          <Reveal delay={150}>
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src="/product/balance-held.jpg"
                alt="A woman in a cream linen shirt holding the Cycle Sync Balance bottle in both hands"
                fill
                sizes="(min-width: 768px) 34vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </Reveal>
        </div>

      </section>

      {/* ─── 6. The ratio ─────────────────────────────────────── */}
      <section className="bg-taupe-light px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="md:ml-[3%]">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
              Fig. 01 — The ratio
            </p>
            <h2 className="mt-3 font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              The clinically-studied <span className="font-serif italic font-medium">40:1</span> ratio
            </h2>
            <p className="mt-4 font-serif text-xl italic font-medium text-obsidian/70 md:text-2xl">
              Forty parts to one. Not a blend, a dose.
            </p>
          </Reveal>

          <div className="mt-16 grid items-start gap-16 md:grid-cols-[1.15fr_0.85fr] md:gap-20">
            <Reveal>
              <RatioMarks formulation={featured.formulation} />
            </Reveal>

            <Reveal delay={150}>
              <p className="font-sans text-base leading-[1.8] text-obsidian/70 md:text-lg">
                {featured.scienceHighlight.detail}
                <Cite n={6} />
              </p>
              {featured.scienceHighlight.caveat && (
                <p className="mt-5 font-sans text-sm italic leading-relaxed text-obsidian/70">
                  {featured.scienceHighlight.caveat}
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 7. What's inside ─────────────────────────────────── */}
      <section id="formulation" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader eyebrow="What's inside">
            <span className="font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              Fifteen ingredients.{" "}
              <span className="font-serif italic font-medium">Four at the centre of it.</span>
            </span>
          </SectionHeader>
        </Reveal>

        <div className="mt-16 grid gap-16 md:grid-cols-[1fr_0.62fr] md:gap-20">
          <div>
            {keyIngredients.map(({ name, detail }, i) => (
              <Reveal key={name} delay={i * 120}>
                <div className="border-t border-obsidian/12 py-9 last:border-b md:py-11">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-sans text-2xl font-semibold tracking-tight text-obsidian md:text-3xl">
                      {detail!.nutrient}
                    </span>
                    <span className="w-28 shrink-0 text-right font-sans text-sm font-medium tabular-nums text-obsidian/70">
                      {detail!.dose}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[52ch] font-sans text-sm leading-[1.75] text-obsidian/70 md:text-base">
                    {detail!.why}
                  </p>
                </div>
              </Reveal>
            ))}

            <Reveal>
              <div className="mt-14">
                <details className="group border-t border-obsidian/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian [&::-webkit-details-marker]:hidden">
                    <span>Tbl. 01 — Full formulation</span>
                    <span
                      aria-hidden
                      className="font-sans text-base font-normal leading-none text-obsidian/70 transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="pb-8">
                    <FormulationTable formulation={featured.formulation} />
                  </div>
                </details>
                <p className="border-t border-obsidian/20 pt-6 font-sans text-base font-medium text-obsidian">
                  {featured.dosage}
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div className="md:sticky md:top-28">
              <div className="relative aspect-[768/1365] w-full max-h-[70svh] overflow-hidden bg-white-bone">
                <Image
                  src="/product/balance-bottle.jpg"
                  alt="Cycle Sync Balance bottle, studio shot"
                  fill
                  sizes="(min-width: 768px) 27vw, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 9.5 References ───────────────────────────────────── */}
      <section className="bg-paper px-6 pb-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
              References
            </p>
            <div className="mt-6 border-t border-obsidian/12 pt-6">
              <ReferencesList items={REFERENCES} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 10. Questions ────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        <Reveal>
          <span aria-hidden className="mb-8 block h-px w-16 bg-taupe-dark" />
          <p className="font-serif text-2xl italic font-medium leading-[1.3] text-obsidian md:text-3xl">
            {featured.whoItsFor}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="mt-20 font-sans text-3xl font-semibold tracking-tight text-obsidian md:text-4xl">
            Questions about <span className="font-serif italic font-medium">Balance.</span>
          </h2>
          <div className="mt-10">
            <Accordion items={featured.faqs} defaultOpenIndex={null} variant="editorial" />
          </div>
        </Reveal>
      </section>

      {/* ─── 11. Close (dark) ─────────────────────────────────── */}
      <section className="bg-rove-plum px-6 py-24 text-center md:py-32">
        <Reveal className="mx-auto max-w-2xl">
          <span aria-hidden className="mx-auto block h-0.5 w-16 bg-sage-teal" />
          <h2 className="mt-8 font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-white-bone md:text-5xl">
            It starts tomorrow morning.{" "}
            <span className="font-serif italic font-medium">Then the one after that.</span>
          </h2>
          <p className="mt-5 font-sans text-base leading-[1.8] text-white-bone/70 md:text-lg">{featured.goal}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <span className="font-sans text-2xl font-semibold tabular-nums text-white-bone">
              {compareAtPrice && (
                <span className="mr-2 opacity-60 line-through decoration-white-bone/40 text-xl font-normal">
                  ₹{compareAtPrice}
                </span>
              )}
              ₹{livePrice || featured.price}
            </span>
            <AddToCartButton product={featured} />
          </div>
          <p className="mt-6 font-sans text-[11px] uppercase tracking-[0.18em] text-white-bone/70">
            {featured.unitCount} {featured.unitLabel} per bottle · 1–2 a day
          </p>
        </Reveal>
      </section>

      {/* ─── 12. In development ───────────────────────────────── */}
      {comingSoon.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-14 pb-28 md:pb-14">
          <Reveal>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
              The rest of the system, in development
            </p>
          </Reveal>
          {comingSoon.map((product, i) => (
            <Reveal key={product.handle} delay={i * 120}>
              <div className="border-t border-obsidian/12 py-6">
                <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-obsidian/70">
                  {product.phaseLabel}
                </p>
                <p className="mt-2 font-sans text-lg font-medium tracking-tight text-obsidian/70">
                  {product.title}
                </p>
                <p className="mt-1.5 font-sans text-sm leading-relaxed text-obsidian/70">{product.tagline}</p>
              </div>
            </Reveal>
          ))}
        </section>
      )}

      <StickyBuyBar product={featured} livePrice={livePrice} compareAtPrice={compareAtPrice} />
    </>
  );
}
