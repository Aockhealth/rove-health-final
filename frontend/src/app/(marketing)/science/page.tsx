import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FlaskConical, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EVIDENCE_LABELS, SCIENCE_PILLARS, SOURCE_LINKS } from "@/data/commerce";

export const metadata: Metadata = {
  title: "The Science of Cycle Syncing & Hormone Balance | Rove Health",
  description:
    "Discover the science behind Rove Health: how cycle-aware AI intelligence and transparent supplement formulations work together to support hormonal balance for Indian women.",
  keywords: [
    "cycle syncing science",
    "hormone balance India",
    "women's health supplements science",
    "cycle sync app how it works",
    "menstrual phase nutrition",
  ],
};

const cycleSignals = [
  "Cycle day and period history",
  "Logged symptoms, mood, sleep, and recovery patterns",
  "Phase-specific nutrition and movement context",
  "Privacy-minded personalization with clear user control",
];

const formulationRules = [
  "Every ingredient needs a job in the formula.",
  "The product page explains what is foundational, emerging, or traditional.",
  "Safety notes are written beside ingredient benefits, not hidden away.",
  "Supplement language stays supportive and non-diagnostic.",
];

const evidenceColors: Record<string, string> = {
  foundational: "text-phase-follicular bg-phase-follicular/10",
  emerging: "text-phase-ovulatory bg-phase-ovulatory/10",
  traditional: "text-phase-menstrual bg-phase-menstrual/10",
};

const evidenceDescriptions: Record<string, string> = {
  foundational: "Essential nutrients with established roles in normal body function.",
  emerging: "Ingredients with growing research interest and context-specific support.",
  traditional: "Botanicals with long-standing use, presented without cure-style claims.",
};

export default function SciencePage() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-rove-charcoal">
        <div className="absolute inset-0">
          <Image
            src="/images/hormone_flow_background_1764584093305.png"
            alt="Abstract hormone flow artwork"
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rove-charcoal via-rove-charcoal/80 to-rove-charcoal/50" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[80svh] max-w-7xl flex-col justify-end px-5 pb-12 pt-24 sm:px-6 lg:min-h-[85svh] lg:justify-center lg:px-8">
          <Badge variant="luxury" className="mb-4 w-fit border-white/20 bg-white/10 text-white/90 backdrop-blur-sm sm:mb-5">
            <FlaskConical className="mr-1.5 h-3 w-3" /> Rove method
          </Badge>
          <h1 className="font-serif text-[2.5rem] leading-[0.95] tracking-tight text-white sm:text-6xl lg:max-w-3xl lg:text-7xl">
            Science that respects the whole cycle.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/60 sm:text-lg">
            Rove is built around a simple idea: women should not have to choose between
            cold data and intuitive self-care. The app reads cycle context; the formulas
            support specific needs with transparent ingredient logic.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop">
              <Button className="h-12 w-full rounded-full bg-white px-7 text-rove-charcoal hover:bg-white/90 sm:w-auto">
                Shop formulas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ingredient-glossary">
              <Button variant="outline" className="h-12 w-full rounded-full border-white/25 bg-transparent px-7 text-white hover:bg-white/10 sm:w-auto">
                Read glossary <FlaskConical className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Two Pillars ───────────────────────────────────────── */}
      <section className="bg-paper px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-phase-menstrual">
              Two pillars
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-rove-charcoal sm:text-5xl">
              App intelligence plus product discipline
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Pillar 1 */}
            <div className="overflow-hidden rounded-2xl border border-rove-stone/10 bg-white shadow-sm">
              {/* Decorative top bar */}
              <div className="h-1 bg-gradient-to-r from-phase-menstrual via-phase-follicular to-phase-ovulatory" />
              <div className="p-5 sm:p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-phase-menstrual/8">
                  <FlaskConical className="h-5 w-5 text-phase-menstrual" />
                </div>
                <h3 className="font-serif text-[1.5rem] leading-tight text-rove-charcoal sm:text-3xl">
                  Cycle-sync app science
                </h3>
                <p className="mt-3 text-[13px] leading-6 text-rove-stone">
                  Rove uses cycle settings and daily logs to place advice in the right biological
                  context. It does not diagnose; it helps users notice patterns and make better
                  daily choices.
                </p>
                <ul className="mt-5 space-y-3">
                  {cycleSignals.map((signal) => (
                    <li key={signal} className="flex gap-2.5 text-[13px] text-rove-charcoal">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-phase-follicular" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="overflow-hidden rounded-2xl border border-rove-stone/10 bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-phase-ovulatory via-phase-luteal to-phase-menstrual" />
              <div className="p-5 sm:p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-phase-ovulatory/8">
                  <ShieldCheck className="h-5 w-5 text-phase-ovulatory" />
                </div>
                <h3 className="font-serif text-[1.5rem] leading-tight text-rove-charcoal sm:text-3xl">
                  Supplement formulation
                </h3>
                <p className="mt-3 text-[13px] leading-6 text-rove-stone">
                  The formulas are organized around clear jobs: replenishment, pre-period support,
                  and daily hormone-rhythm support. Each page names what an ingredient is doing and
                  when caution matters.
                </p>
                <ul className="mt-5 space-y-3">
                  {formulationRules.map((rule) => (
                    <li key={rule} className="flex gap-2.5 text-[13px] text-rove-charcoal">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-phase-follicular" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Evidence Language ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-rove-charcoal px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute -right-40 top-0 h-72 w-72 rounded-full bg-phase-follicular/8 blur-[100px]" />
        <div className="absolute -left-32 bottom-0 h-56 w-56 rounded-full bg-phase-luteal/8 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
              Evidence language
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-white sm:text-4xl">
              How we label confidence
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
              Not every ingredient has the same kind of support. Rove keeps the labels visible
              so shoppers can tell the difference.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(EVIDENCE_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/8 sm:p-6"
              >
                <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${evidenceColors[key]}`}>
                  {key}
                </div>
                <h3 className="font-serif text-xl text-white sm:text-2xl">{label}</h3>
                <p className="mt-2 text-[13px] leading-6 text-white/50">
                  {evidenceDescriptions[key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Rove Standard ─────────────────────────────────── */}
      <section className="bg-paper px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-phase-ovulatory">
              Principles
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-rove-charcoal sm:text-4xl">
              The Rove standard
            </h2>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {SCIENCE_PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className="min-w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-rove-stone/10 bg-white shadow-sm transition-all duration-200 hover:shadow-md sm:min-w-0"
              >
                <div className="h-1 bg-gradient-to-r from-phase-menstrual via-phase-follicular to-phase-ovulatory" style={{ opacity: 0.5 + i * 0.15 }} />
                <div className="p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-phase-ovulatory/10 text-phase-ovulatory">
                    <Layers className="h-4 w-4" />
                  </div>
                  <h3 className="font-serif text-lg text-rove-charcoal sm:text-xl">{pillar.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-rove-stone">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Source Families ────────────────────────────────────── */}
      <section className="bg-white-bone px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-rove-stone">
              Source families
            </p>
            <h2 className="mt-2 font-serif text-[2rem] leading-tight text-rove-charcoal sm:text-4xl">
              Where the research points
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[SOURCE_LINKS.ods, SOURCE_LINKS.nccih, SOURCE_LINKS.fssai, SOURCE_LINKS.shopifyStorefront].map(
              (source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start justify-between rounded-2xl border border-rove-stone/10 bg-white p-5 transition-all duration-300 hover:border-rove-stone/20 hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-semibold leading-6 text-rove-charcoal">
                      {source.label}
                    </p>
                    <p className="mt-1 text-[11px] text-rove-stone">External resource →</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-phase-menstrual/50 transition-all group-hover:translate-x-0.5 group-hover:text-phase-menstrual" />
                </a>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
