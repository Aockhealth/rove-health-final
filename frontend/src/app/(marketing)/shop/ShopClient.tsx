"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FlaskConical, Info, ShoppingBag, Sparkles, Star } from "lucide-react";
import { useCart } from "@/components/marketing/CartProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getIngredientBySlug,
  PRODUCT_LABELS,
  type ProductHandle,
} from "@/data/commerce";
import { formatMoney } from "@/lib/shopify/mappers";
import type { CommerceProduct } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

const accentStyles = {
  menstrual: "bg-phase-menstrual text-white border-phase-menstrual",
  follicular: "bg-phase-follicular text-white border-phase-follicular",
  ovulatory: "bg-phase-ovulatory text-white border-phase-ovulatory",
  luteal: "bg-phase-luteal text-white border-phase-luteal",
};

const accentGradients: Record<string, string> = {
  menstrual: "from-phase-menstrual/8 to-transparent",
  follicular: "from-phase-follicular/8 to-transparent",
  ovulatory: "from-phase-ovulatory/8 to-transparent",
  luteal: "from-phase-luteal/8 to-transparent",
};

export function ShopClient({
  products,
  recommendedHandles,
  phaseName,
}: {
  products: CommerceProduct[];
  recommendedHandles: ProductHandle[];
  phaseName: string | null;
}) {
  const { addLine, isLoading } = useCart();

  return (
    <main className="shop-page">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-rove-charcoal">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/rove_product_set_1764583837494.png"
            alt="Rove supplement bottles"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rove-charcoal via-rove-charcoal/70 to-rove-charcoal/40" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[85svh] max-w-7xl flex-col justify-end px-5 pb-12 pt-24 sm:px-6 lg:min-h-[90svh] lg:justify-center lg:pb-16 lg:px-8">
          <Badge variant="luxury" className="mb-4 w-fit border-white/20 bg-white/10 text-white/90 backdrop-blur-sm sm:mb-5">
            <Star className="mr-1.5 h-3 w-3" /> Rove Essentials
          </Badge>
          <h1 className="font-serif text-[2.75rem] leading-[0.95] tracking-tight text-white sm:text-6xl lg:max-w-2xl lg:text-7xl">
            Supplements that move with your cycle.
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/65 sm:text-lg">
            Three targeted formulas for replenishment, pre-period calm, and daily hormone-rhythm
            support. Built with transparent ingredients and clear safety notes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#products">
              <Button className="h-12 w-full rounded-full bg-white px-7 text-rove-charcoal hover:bg-white/90 sm:w-auto">
                Shop formulas <ShoppingBag className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/science">
              <Button variant="outline" className="h-12 w-full rounded-full border-white/25 bg-transparent px-7 text-white hover:bg-white/10 sm:w-auto">
                See the science <FlaskConical className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-6">
            {["Cycle-aware", "Ingredient-led", "Transparent sourcing"].map((label) => (
              <span key={label} className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Cards ─────────────────────────────────────── */}
      <section id="products" className="bg-paper px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-phase-menstrual">
              Shop by formula
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-rove-charcoal sm:text-5xl">
              Your cycle shelf
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-rove-stone">
              {phaseName
                ? `Because you are currently in your ${phaseName} phase, Rove has marked the formulas that may fit this window.`
                : "Sign in to see gentle phase-aware recommendation badges based on your Rove cycle data."}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {products.map((product) => {
              const isRecommended = recommendedHandles.includes(product.handle);
              return (
                <article
                  key={product.handle}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                    isRecommended
                      ? "border-phase-follicular/30 shadow-lg shadow-phase-follicular/5"
                      : "border-rove-stone/10 shadow-sm hover:shadow-md"
                  )}
                >
                  {/* Accent gradient wash */}
                  <div className={cn(
                    "absolute inset-x-0 top-0 h-40 bg-gradient-to-b opacity-60",
                    accentGradients[product.accent]
                  )} />

                  <div className="relative">
                    <div className="relative aspect-[4/3] overflow-hidden bg-rove-cream">
                      <Image
                        src={product.productImage.url}
                        alt={product.productImage.altText || product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, 100vw"
                      />
                      {/* Subtle bottom gradient on image */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/60 to-transparent" />

                      {isRecommended && (
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-rove-charcoal shadow-sm backdrop-blur-sm">
                          <Sparkles className="h-3 w-3 text-phase-ovulatory" />
                          Rove recommends
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rove-stone">
                            {product.eyebrow}
                          </p>
                          <h3 className="mt-1.5 font-serif text-[1.65rem] leading-none text-rove-charcoal">
                            {product.title}
                          </h3>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-3 py-1 text-xs font-bold",
                            accentStyles[product.accent]
                          )}
                        >
                          {formatMoney(product.price)}
                        </span>
                      </div>

                      <p className="mt-3 text-[13px] leading-6 text-rove-stone">
                        {product.description}
                      </p>

                      {/* Ingredient pills */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {product.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="rounded-full border border-rove-stone/10 bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-rove-charcoal"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Best for */}
                      <div className="mt-5 border-t border-rove-stone/8 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rove-stone">
                          Best for
                        </p>
                        <ul className="mt-2.5 space-y-2">
                          {product.bestFor.map((item) => (
                            <li key={item} className="flex gap-2 text-[13px] leading-5 text-rove-charcoal">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-phase-follicular" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        disabled={!product.availableForSale || !product.variant?.id || isLoading}
                        onClick={() => addLine(product.variant?.id, 1)}
                        className="mt-6 h-11 w-full rounded-full bg-rove-charcoal text-sm text-white transition-all hover:bg-rove-charcoal/90 disabled:bg-rove-stone/40"
                      >
                        {product.availableForSale ? "Add to cart" : "Coming soon"}
                        <ShoppingBag className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Formula Guide ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-rove-charcoal px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        {/* Decorative glow */}
        <div className="absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-phase-menstrual/10 blur-[100px]" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-phase-ovulatory/10 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
              Formula guide
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-white sm:text-5xl">
              Which one is for me?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
              Match the formula to your current need, then read the ingredient notes before you buy.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <Link
                href="/ingredient-glossary"
                key={product.handle}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 sm:p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-phase-ovulatory/15">
                  <Sparkles className="h-4 w-4 text-phase-ovulatory" />
                </div>
                <h3 className="font-serif text-xl leading-tight text-white sm:text-2xl">
                  {PRODUCT_LABELS[product.handle]}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-white/50">{product.subtitle}</p>
                <div className="mt-4 flex items-center text-[12px] font-bold text-white/70 transition-colors group-hover:text-white">
                  See ingredients <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ingredient Transparency ───────────────────────────── */}
      <section className="bg-paper px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-phase-follicular">
                Ingredient transparency
              </p>
              <h2 className="mt-2 font-serif text-[2rem] leading-tight text-rove-charcoal sm:text-4xl">
                What is inside
              </h2>
            </div>
            <Link
              href="/ingredient-glossary"
              className="inline-flex items-center text-sm font-bold text-rove-charcoal transition-colors hover:text-phase-menstrual"
            >
              Open full glossary <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {products
              .flatMap((product) => product.ingredientSlugs.slice(0, 3))
              .map((slug) => getIngredientBySlug(slug))
              .filter(Boolean)
              .slice(0, 8)
              .map((ingredient) => (
                <div
                  key={ingredient!.slug}
                  className="min-w-[260px] shrink-0 snap-start rounded-2xl border border-rove-stone/10 bg-white p-5 transition-all duration-200 hover:border-rove-stone/20 hover:shadow-sm sm:min-w-0"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-phase-follicular">
                    {ingredient!.category}
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-rove-charcoal">
                    {ingredient!.name}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-rove-stone">{ingredient!.role}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────────────── */}
      <section className="bg-white-bone px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl gap-3 rounded-2xl border border-rove-stone/10 bg-white p-5 text-[13px] leading-6 text-rove-stone shadow-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-phase-menstrual/60" />
          <p>
            Rove supplements are not intended to diagnose, treat, cure, or prevent any disease.
            If you are pregnant, breastfeeding, managing a medical condition, or taking medication,
            consult a qualified clinician before use.
          </p>
        </div>
      </section>

      <style jsx>{`
        @keyframes shop-fade-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .shop-page section {
          animation: shop-fade-up 0.6s ease-out both;
        }
      `}</style>
    </main>
  );
}
