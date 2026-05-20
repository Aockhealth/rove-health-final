import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, HeartHandshake, Quote, Sprout, Waves } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Our Story: Why We Built India's First Hormonal Health App | Rove Health",
  description:
    "Rove was built because women deserve health guidance that changes with their cycle, not generic advice that ignores their biology. Read the Rove Health story.",
  keywords: [
    "Rove Health story",
    "women's health app India founders",
    "cycle syncing app India",
    "hormonal health for Indian women",
  ],
};

const beliefs = [
  {
    icon: Waves,
    title: "Your body has rhythm",
    body: "The month is not one flat line. Energy, mood, appetite, sleep, and recovery shift for real biological reasons.",
    accent: "phase-menstrual",
  },
  {
    icon: Sprout,
    title: "Care should be specific",
    body: "Women deserve guidance that changes with context, not generic advice copied across every week of the cycle.",
    accent: "phase-follicular",
  },
  {
    icon: HeartHandshake,
    title: "Trust is part of the product",
    body: "Rove is built to feel beautiful, but never vague. The why behind every recommendation should be visible.",
    accent: "phase-ovulatory",
  },
];

const accentBgs: Record<string, string> = {
  "phase-menstrual": "bg-phase-menstrual/8",
  "phase-follicular": "bg-phase-follicular/8",
  "phase-ovulatory": "bg-phase-ovulatory/8",
};

const accentTexts: Record<string, string> = {
  "phase-menstrual": "text-phase-menstrual",
  "phase-follicular": "text-phase-follicular",
  "phase-ovulatory": "text-phase-ovulatory",
};

export default function StoryPage() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-rove-charcoal">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle_benefit_1764583852005.png"
            alt="Rove hormonal flow sculpture"
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rove-charcoal via-rove-charcoal/75 to-rove-charcoal/40" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[82svh] max-w-7xl flex-col justify-end px-5 pb-12 pt-24 sm:px-6 lg:min-h-[85svh] lg:justify-center lg:px-8">
          <Badge variant="luxury" className="mb-4 w-fit border-white/20 bg-white/10 text-white/90 backdrop-blur-sm sm:mb-5">
            <Heart className="mr-1.5 h-3 w-3" /> Our story
          </Badge>
          <h1 className="font-serif text-[2.5rem] leading-[0.95] tracking-tight text-white sm:text-6xl lg:max-w-3xl lg:text-7xl">
            We are done treating women like one constant.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/60 sm:text-lg">
            Rove began with a quiet frustration: women are asked to track everything, buy
            everything, optimize everything, and still receive advice that ignores the cycle
            running underneath it all.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop">
              <Button className="h-12 w-full rounded-full bg-white px-7 text-rove-charcoal hover:bg-white/90 sm:w-auto">
                Explore formulas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/science">
              <Button variant="outline" className="h-12 w-full rounded-full border-white/25 bg-transparent px-7 text-white hover:bg-white/10 sm:w-auto">
                Read the method
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── The Problem ───────────────────────────────────────── */}
      <section className="bg-paper px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-phase-menstrual">
              The problem
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-rove-charcoal sm:text-5xl lg:max-w-2xl">
              Generic wellness made the body feel like a mystery.
            </h2>
          </div>

          {/* Editorial pull-quote layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1px_1fr]">
            <div className="space-y-5 text-[15px] leading-8 text-rove-stone">
              <p>
                A woman can know her period date, her steps, her calories, her sleep score, and still
                not know why she feels powerful one week and depleted the next. She can buy a shelf of
                supplements and still wonder what is for today, what is for later, and what was just
                a good ad.
              </p>
              <p>
                Rove exists for the space between data and daily life. We turn cycle signals into
                practical care: what to eat, how to move, when to rest, and which nutrients may make
                sense for the current window.
              </p>
            </div>

            {/* Vertical divider — hidden on mobile */}
            <div className="hidden bg-rove-stone/15 lg:block" />

            {/* Pull quote */}
            <div className="flex flex-col justify-center rounded-2xl border border-rove-stone/10 bg-white p-6 shadow-sm lg:p-8">
              <Quote className="mb-4 h-8 w-8 text-phase-ovulatory/30" />
              <blockquote className="font-serif text-xl leading-snug text-rove-charcoal sm:text-2xl">
                &ldquo;Women are asked to optimize everything, and still receive advice that ignores the cycle running underneath it all.&rdquo;
              </blockquote>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-rove-stone">
                Rove founding insight
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Believe ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-rove-charcoal px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-phase-menstrual/8 blur-[100px]" />
        <div className="absolute -right-24 bottom-1/4 h-48 w-48 rounded-full bg-phase-follicular/8 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
              What we believe
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-white sm:text-5xl lg:max-w-xl">
              Body literacy should feel calm, not clinical.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {beliefs.map((belief) => (
              <div
                key={belief.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/8 sm:p-6"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${accentBgs[belief.accent]}`}>
                  <belief.icon className={`h-5 w-5 ${accentTexts[belief.accent]}`} />
                </div>
                <h3 className="font-serif text-xl leading-tight text-white sm:text-2xl">
                  {belief.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-white/50">{belief.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Promise ───────────────────────────────────────── */}
      <section className="bg-paper px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-rove-cream shadow-sm lg:aspect-auto lg:min-h-[480px]">
              <Image
                src="/images/anatomy-wireframe-user.jpg"
                alt="Abstract Rove anatomy artwork"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 52vw, 100vw"
              />
              {/* Subtle overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-rove-charcoal/20 to-transparent" />
            </div>

            <div className="lg:pl-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-phase-follicular">
                The promise
              </p>
              <h2 className="mt-2 font-serif text-[2rem] leading-tight text-rove-charcoal sm:text-5xl">
                A kinder operating system for the month.
              </h2>
              <p className="mt-4 text-[15px] leading-8 text-rove-stone">
                Rove is not here to make women hyper-optimize their bodies. It is here to make the
                body legible. To replace confusion with pattern recognition. To make care feel
                precise enough to trust and soft enough to return to.
              </p>
              <Link
                href="/ingredient-glossary"
                className="group mt-6 inline-flex items-center rounded-full border border-rove-stone/15 bg-white px-5 py-2.5 text-sm font-bold text-rove-charcoal shadow-sm transition-all hover:border-rove-stone/30 hover:shadow-md"
              >
                See how we explain ingredients
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
