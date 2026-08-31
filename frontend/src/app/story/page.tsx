import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CycleLineArt } from "@/components/ui/CycleLineArt";
import { RuleDraw } from "@/components/shop/RuleDraw";
import { ADVISORS } from "@/data/advisors";

export const metadata: Metadata = {
  title: "Our Story | Rove Health",
  description:
    "We built Rove because lifestyle management is never one-size-fits-all.",
};

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
          <div className="relative order-first h-[42svh] overflow-hidden bg-taupe-light md:order-last md:h-auto">
            <CycleLineArt className="absolute inset-0 h-full w-full text-obsidian/75" />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-taupe-light to-transparent md:block"
            />
          </div>

          <div className="flex flex-col justify-center px-6 pb-16 pt-10 md:pl-[7vw] md:pr-14 md:pb-[11vh] md:pt-[16vh]">
            <Masthead className="hidden md:block absolute top-10 left-[7vw] right-14" />

            <h1
              className="animate-rise-in mt-8 max-w-[17ch] font-sans text-[2.55rem] font-semibold leading-[1.05] tracking-[-0.02em] text-obsidian md:text-6xl lg:text-[4.6rem] lg:leading-[0.98]"
              style={{ animationDelay: "140ms" }}
            >
              Medicine gave her a line and moved on.
            </h1>

            <p
              className="animate-rise-in mt-7 max-w-[38ch] font-sans text-base leading-[1.75] text-obsidian/70 md:text-lg"
              style={{ animationDelay: "280ms" }}
            >
              We're two doctors who saw the same gap across hundreds of charts. A woman is told to &quot;eat better&quot; and &quot;stress less.&quot; But nobody tells her what that actually means on a Tuesday.
            </p>

            <p
              className="animate-rise-in mt-10 border-t border-obsidian/12 pt-8 font-serif text-xl italic font-medium leading-snug text-obsidian md:text-2xl"
              style={{ animationDelay: "420ms" }}
            >
              We built Rove because managing with lifestyle is never one-size-fits-all.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. Our Answer ────────────────────────────────────── */}
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
            <SectionHeader eyebrow="Our Answer">
              <span className="font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-obsidian md:text-5xl">
                So we stopped complaining about it.{" "}
                <span className="font-serif italic font-medium">And built it instead.</span>
              </span>
            </SectionHeader>

            <p className="mt-6 max-w-[46ch] font-sans text-base leading-[1.8] text-obsidian/70 md:text-lg">
              Not another tracker. Not another bottle on a shelf. Something that does what we wished we'd had time to do for every single patient: tell her what to eat, what to move, what to take, for the day she's actually in, for a body that's actually hers.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 3. Close ──────────────────────────────────── */}
      <section className="bg-rove-plum px-6 py-24 text-center md:py-32">
        <Reveal className="mx-auto max-w-2xl">
          <span aria-hidden className="mx-auto block h-0.5 w-16 bg-white-bone" />

          <div className="mt-12 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
            <p className="font-sans text-lg font-semibold tracking-tight text-white-bone/90 md:text-xl">
              {ADVISORS.map((a) => a.name).join(" & ")}
            </p>
            <p className="font-sans text-xs uppercase tracking-[0.16em] text-white-bone/70">
              MBBS · Co-founders
            </p>
          </div>

          <h2 className="mt-8 font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-white-bone md:text-5xl">
            We couldn&apos;t give her a better answer then.{" "}
            <span className="font-serif italic font-medium">This is the one we have now.</span>
          </h2>
          <div className="mt-12 flex flex-col items-center gap-6">
            <Button size="lg" href="/shop">
              Shop the system
            </Button>
            <a
              href="/advisors"
              className="font-sans text-sm text-white-bone underline decoration-white-bone/25 underline-offset-4 hover:decoration-white-bone"
            >
              Meet the doctors
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
