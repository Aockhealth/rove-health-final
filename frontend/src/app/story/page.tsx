import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CycleLineArt } from "@/components/ui/CycleLineArt";
import { RuleDraw } from "@/components/shop/RuleDraw";
import { ThreadDraw } from "@/components/shop/ThreadDraw";
import { ADVISORS } from "@/data/advisors";

export const metadata: Metadata = {
  title: "Our Story | Rove Health",
  description:
    "We built Rove because managing with lifestyle was never one-size-fits-all: two doctors on why Cycle Sync exists.",
};

const WHAT_SHE_LEFT_WITH = [
  "A diagnosis, and advice to eat better and stress less",
  "A multivitamin that doesn't know what day of her cycle it is",
  "An app built for a woman who has never cooked dal in her life",
];

const NARRATIVE_OPEN = [
  "We're doctors. Different patients, same story, over and over. A woman comes in: PMOS, or PMS bad enough to plan her month around it, or anaemia she's been living with so long she's forgotten what normal energy feels like.",
  "She gets a diagnosis. She gets told to eat better, sleep more, stress less.",
];

const NARRATIVE_PULL = "Nobody tells her what that actually means on a Tuesday.";

const NARRATIVE_CLOSE = [
  "Medicine gave her a line and moved on. The supplement aisle gave her the same pill regardless of what her body needed that week. The apps gave her a chart and left her to work out the rest herself.",
  "We're not going to pretend we've lived this. We haven't. What we have is a few hundred charts between us, and a long list of women we couldn't give a better answer to at the time. That's not the same as living it. But it's not nothing either.",
];

const GAP = [
  {
    index: "01",
    heading: "Her body was studied as a variant",
    body: "For most of modern medicine, a woman's body was treated as a variant of a man's, not as a system in its own right. Trials defaulted to male subjects for decades.",
  },
  {
    index: "02",
    heading: "The advice stopped at the diagnosis",
    body: "Eat better, move more, stress less. What that means on a given day of her cycle, in her kitchen, with her constraints, was left for her to work out alone.",
  },
  {
    index: "03",
    heading: "And nobody was closing it for her",
    body: "We didn't think the women sitting in front of us should have to wait for someone else to do it, so we stopped waiting too.",
  },
];

const RESOLUTION =
  "Not another tracker. Not another bottle on a shelf. Something that does what we wished we'd had time to do for every single patient: tell her what to eat, what to move, what to take, for the day she's actually in, for a body that's actually hers.";

function Masthead({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-0.5 w-full origin-left bg-obsidian animate-rule-draw" />
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-obsidian/12 pb-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian">
          Our Story
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

export default function StoryPage() {
  return (
    <>
      {/* ─── 1. Hero ──────────────────────────────────────────── */}
      <section className="relative bg-paper">
        <Masthead className="px-6 pt-10 md:hidden" />

        <div className="grid md:min-h-[calc(100svh-5rem)] md:grid-cols-[minmax(0,1fr)_42vw]">
          <div className="relative order-first h-[42svh] overflow-hidden bg-taupe md:order-last md:h-auto">
            <CycleLineArt className="absolute inset-0 h-full w-full text-obsidian/60" />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-paper to-transparent md:block"
            />
          </div>

          <div className="flex flex-col justify-end px-6 pb-16 pt-10 md:pl-[7vw] md:pr-14 md:pb-[11vh] md:pt-[16vh]">
            <Masthead className="hidden md:block" />

            <h1
              className="animate-fade-in mt-8 max-w-[17ch] font-sans text-[2.55rem] font-semibold leading-[1.05] tracking-[-0.02em] text-obsidian md:text-6xl lg:text-[4.6rem] lg:leading-[0.98]"
              style={{ animationDelay: "140ms" }}
            >
              The same story, over and over.{" "}
              <span className="font-serif italic font-medium">
                From women with nothing else in common.
              </span>
            </h1>

            <p
              className="animate-fade-in mt-7 max-w-[38ch] font-sans text-base leading-[1.75] text-obsidian/70 md:text-lg"
              style={{ animationDelay: "280ms" }}
            >
              We&apos;re two doctors. This is the gap we kept running into across a few hundred
              charts, and what we built instead of waiting for someone else to close it.
            </p>

            <p
              className="animate-fade-in mt-10 border-t border-obsidian/12 pt-8 font-serif text-xl italic font-medium leading-snug text-obsidian md:text-2xl"
              style={{ animationDelay: "420ms" }}
            >
              We built Rove because managing with lifestyle is never one-size-fits-all.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. What she left with (dark) ─────────────────────── */}
      <section className="bg-rove-plum px-6 py-32 md:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white-bone/70">
              What she walked out with
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col gap-7 md:gap-9">
            {WHAT_SHE_LEFT_WITH.map((line, i) => (
              <Reveal key={line} delay={i * 200} className="duration-[1000ms]">
                <p className="text-center font-serif text-2xl italic font-medium leading-snug text-white-bone/90 md:text-4xl">
                  {line}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={620}>
            <p className="mt-16 text-center font-sans text-2xl font-semibold leading-tight tracking-tight text-white-bone md:text-4xl">
              Three industries were supposed to be helping her.{" "}
              <span className="font-serif italic font-medium">
                Not one of them was built around her.
              </span>
            </p>
          </Reveal>

          <ThreadDraw />
        </div>
      </section>

      {/* ─── 3. How this started ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="md:ml-[6%]">
          <SectionHeader eyebrow="How this started">
            <span className="max-w-[24ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              It didn&apos;t start as a business plan.{" "}
              <span className="font-serif italic font-medium">
                It started as something we got tired of ignoring.
              </span>
            </span>
          </SectionHeader>
        </Reveal>

        <div className="mt-14 max-w-[42rem] md:ml-[6%]">
          <div className="space-y-7">
            {NARRATIVE_OPEN.map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <p className="font-sans text-base leading-[1.8] text-obsidian md:text-lg">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="my-12 border-y border-obsidian/15 py-10 font-serif text-2xl italic font-medium leading-snug text-obsidian md:text-3xl">
              {NARRATIVE_PULL}
            </p>
          </Reveal>

          <div className="space-y-7">
            {NARRATIVE_CLOSE.map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <p className="font-sans text-base leading-[1.8] text-obsidian/70 md:text-lg">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="mt-12 border-t border-obsidian/15 pt-8 font-sans text-lg font-semibold leading-snug tracking-tight text-obsidian md:text-xl">
              A few hundred charts between us, and the same gap at the end of every one of them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. The gap ───────────────────────────────────────── */}
      <section className="bg-taupe-light px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
              Fig. 01 — The gap we kept running into
            </p>
            <h2 className="mt-3 max-w-[22ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              Three gaps she never opened.{" "}
              <span className="font-serif italic font-medium">And nobody was closing them.</span>
            </h2>
          </Reveal>

          <div className="mt-14">
            {GAP.map(({ index, heading, body }, i) => (
              <Reveal key={index} delay={i * 120}>
                <div className="border-t border-obsidian/15 py-9 last:border-b md:py-11">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-sans text-2xl font-semibold tracking-tight text-obsidian md:text-3xl">
                      {heading}
                    </span>
                    <span className="shrink-0 font-sans text-[11px] tabular-nums tracking-[0.18em] text-obsidian/70">
                      {index}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[58ch] font-sans text-sm leading-[1.75] text-obsidian/70 md:text-base">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Our answer ────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 md:items-stretch">
        <div className="relative order-first h-[58svh] md:order-first md:h-auto md:min-h-[72svh]">
          <Image
            src="/brand/rose-pad.jpg"
            alt="A single red rose resting on a sanitary pad against a pink backdrop"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_72%]"
          />
        </div>
        <div className="flex flex-col justify-center bg-white-bone px-6 py-24 md:px-[6vw] md:py-32">
          <Reveal>
            <SectionHeader eyebrow="Our answer">
              <span className="font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-obsidian md:text-5xl">
                So we stopped complaining about it.{" "}
                <span className="font-serif italic font-medium">And built it instead.</span>
              </span>
            </SectionHeader>

            <p className="mt-6 max-w-[46ch] font-sans text-base leading-[1.8] text-obsidian/70 md:text-lg">
              {RESOLUTION}
            </p>

            <p className="mt-10 border-t border-obsidian/12 pt-8 font-sans text-lg font-semibold tracking-tight text-obsidian">
              One formula, one app, one library. All of it built around her cycle, not the calendar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 6. The founders ──────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-obsidian/20 pt-6">
            <p className="font-sans text-base font-semibold tracking-tight text-obsidian md:text-lg">
              {ADVISORS.map((a) => a.name).join(" & ")}
            </p>
            <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-obsidian/70">
              MBBS · Co-founders
            </p>
          </div>
          <a
            href="/advisors"
            className="mt-6 inline-block font-sans text-sm text-obsidian underline decoration-obsidian/25 underline-offset-4 hover:decoration-obsidian"
          >
            Meet the doctors
          </a>
        </Reveal>
      </section>

      {/* ─── 7. Close (dark) ──────────────────────────────────── */}
      <section className="bg-rove-plum px-6 py-24 text-center md:py-32">
        <Reveal className="mx-auto max-w-2xl">
          <span aria-hidden className="mx-auto block h-0.5 w-16 bg-sage-teal" />
          <h2 className="mt-8 font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-white-bone md:text-5xl">
            We couldn&apos;t give her a better answer then.{" "}
            <span className="font-serif italic font-medium">This is the one we have now.</span>
          </h2>
          <div className="mt-10 flex justify-center">
            <Button size="lg" variant="secondary" href="/shop">
              Shop the system
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
