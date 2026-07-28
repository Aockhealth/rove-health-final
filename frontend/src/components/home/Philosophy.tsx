import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

const MOMENTS = [
  {
    phase: "Menstrual",
    color: "text-phase-menstrual",
    image: "/brand/phases/menstrual.jpg",
    line: "A time for inward reflection, deep rest, and honoring your body's sacred reset.",
  },
  {
    phase: "Follicular",
    color: "text-phase-follicular",
    image: "/brand/phases/follicular-v2.jpg",
    line: "A quiet return of energy: clarity, momentum, and the pull to build again.",
  },
  {
    phase: "Ovulatory",
    color: "text-phase-ovulatory-text",
    image: "/brand/phases/ovulatory.jpg",
    line: "Peak vitality. You are radiant, communicative, and vibrating with confidence.",
  },
  {
    phase: "Luteal",
    color: "text-phase-luteal",
    image: "/brand/phases/luteal.jpg",
    line: "A gentle wind-down: permission to slow your pace before the cycle begins again.",
  },
];

export function Philosophy() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-obsidian/50">
            Living in Sync
          </span>
          <h2 className="mt-3 font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-4xl">
            Every phase asks something different of you.{" "}
            <span className="font-serif italic font-medium">That&apos;s not a flaw to fix.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 grid-cols-2 md:grid-cols-4">
          {MOMENTS.map((moment, i) => (
            <Reveal key={moment.phase} delay={i * 120} className="flex flex-col">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px]">
                <Image src={moment.image} alt={moment.phase} fill className="object-cover" />
              </div>
              <span className={cn("mt-4 font-sans text-xs font-semibold uppercase tracking-[0.1em]", moment.color)}>
                {moment.phase}
              </span>
              <p className="mt-2 font-serif text-lg italic leading-snug text-obsidian">{moment.line}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
