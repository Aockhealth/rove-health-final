import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CycleLineArt } from "@/components/ui/CycleLineArt";

export const metadata: Metadata = {
  title: "Our Story | Rove Health",
  description:
    "We built Rove because managing with lifestyle was never one-size-fits-all: two doctors on why Cycle Sync exists.",
};

const NARRATIVE_OPEN = [
  "This didn't start as a business plan. It started as something we kept noticing and got tired of ignoring.",
  "We're doctors, based in Mumbai. Different patients, same story, over and over. A woman comes in: PMOS, or PMS bad enough to plan her month around it, or anaemia she's been living with so long she's forgotten what normal energy feels like.",
  "She gets a diagnosis. She gets told to eat better, sleep more, stress less. Nobody tells her what that actually means on a Tuesday. She walks out with a multivitamin that doesn't know what day of her cycle it is, and maybe a period app built for a woman who's never cooked dal in her life.",
];

const PULL_QUOTE =
  "Three different industries were all supposed to be helping her, and not one of them was actually built around her.";

const NARRATIVE_CLOSE = [
  "Medicine gave her a line and moved on. The supplement aisle gave her the same pill regardless of what her body needed that week. The apps gave her a chart and left her to work out the rest herself.",
  "We're not going to pretend we've lived this. We haven't. What we have is a few hundred charts between us, and a long list of women we couldn't give a better answer to at the time. That's not the same as living it. But it's not nothing either.",
];

const GAP_PARAGRAPHS = [
  "Here's the part that made us angriest, and the part that finally made us build something: for most of modern medicine, a woman's body was studied as a variant of a man's, not as a system in its own right. Trials defaulted to male subjects for decades.",
  "Nobody has published the definitive, phase-by-phase playbook for how a woman should eat, move, and rest across her own cycle. That playbook doesn't exist yet.",
  "We didn't want to wait for someone else to write it.",
];

const RESOLUTION =
  "So we stopped complaining about it and built it instead. Not another tracker. Not another bottle on a shelf. Something that does what we wished we'd had time to do for every single patient: tell her what to eat, what to move, what to take, for the day she's actually in, for a body that's actually hers.";

export default function StoryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-taupe px-6 py-24 text-center md:py-32">
        <CycleLineArt className="absolute inset-y-0 right-0 h-full w-[70%] text-obsidian/35 [mask-image:linear-gradient(to_right,transparent,black_55%)] md:w-1/2 md:text-obsidian/70 md:[mask-image:linear-gradient(to_right,transparent,black_35%)]" />
        <div className="relative mx-auto max-w-2xl">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/60">
            Our Story
          </span>
          <h1 className="mt-4 font-sans text-4xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
            We built Rove because managing with lifestyle is never{" "}
            <span className="font-serif italic font-medium">one-size-fits-all.</span>
          </h1>
        </div>
      </section>

      {/* Narrative */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="text-center">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/50">
                How This Started
              </span>
            </div>
          </Reveal>

          <div className="mt-10 space-y-8 font-sans text-base leading-relaxed text-obsidian/80">
            {NARRATIVE_OPEN.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p>{p}</p>
              </Reveal>
            ))}

            <Reveal delay={240}>
              <p className="py-4 text-center font-serif text-2xl italic leading-snug text-obsidian md:text-3xl">
                &ldquo;{PULL_QUOTE}&rdquo;
              </p>
            </Reveal>

            {NARRATIVE_CLOSE.map((p, i) => (
              <Reveal key={i} delay={320 + i * 80}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Gap */}
      <section className="bg-rove-plum px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="text-center">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-white-bone/50">
                The Gap We Kept Running Into
              </span>
            </div>
          </Reveal>

          <div className="mt-10 space-y-7 text-center font-serif text-xl italic leading-relaxed text-white-bone/90 md:text-2xl">
            {GAP_PARAGRAPHS.map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Answer */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="text-center">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/50">
                Our Answer
              </span>
            </div>
          </Reveal>

          <div className="mt-10 space-y-8 font-sans text-base leading-relaxed text-obsidian/80">
            <Reveal>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                <Image src="/brand/phases/follicular-v2.jpg" alt="" fill className="object-cover" />
              </div>
            </Reveal>

            <Reveal delay={80}>
              <p>{RESOLUTION}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="bg-obsidian px-6 py-20 text-center md:py-24">
        <Reveal className="mx-auto max-w-2xl">
          <p className="font-serif text-xl italic text-white-bone/90">
            Dr. Aditya Oswal &amp; Dr. Chaitanya Kalra, Founders
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" href="/shop">
              Shop the system
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
