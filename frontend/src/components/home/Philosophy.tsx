import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Four phases, no photography. Each line is the action that phase asks for,
 * which is also what the formula covering it is dosed to do.
 */
const MOMENTS = [
  {
    phase: "Menstrual",
    text: "text-phase-menstrual",
    bar: "bg-phase-menstrual",
    line: "Iron leaves. Replace it.",
  },
  {
    phase: "Follicular",
    text: "text-phase-follicular",
    bar: "bg-phase-follicular",
    line: "Energy climbs. Build on it.",
  },
  {
    phase: "Ovulatory",
    text: "text-phase-ovulatory-text",
    bar: "bg-phase-ovulatory",
    line: "Output peaks. Protect it.",
  },
  {
    phase: "Luteal",
    text: "text-phase-luteal",
    bar: "bg-phase-luteal",
    line: "PMS builds. Ease it.",
  },
];

export function Philosophy() {
  return (
    <section className="bg-taupe-light px-6 py-14 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian/60">
            Why phases
          </span>
          <h2 className="mt-2 font-sans text-2xl font-semibold leading-tight tracking-tight text-obsidian md:text-3xl">
            Your body runs on four phases.{" "}
            <span className="font-serif italic font-medium">
              Most supplements ignore all of them.
            </span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-8">
          {MOMENTS.map((moment, i) => (
            <Reveal key={moment.phase} delay={i * 90} className="flex flex-col">
              <span aria-hidden className={cn("h-[3px] w-full rounded-full", moment.bar)} />
              <span
                className={cn(
                  "mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.12em]",
                  moment.text
                )}
              >
                {moment.phase}
              </span>
              <p className="mt-2 font-serif text-lg italic font-medium leading-snug text-obsidian md:text-xl">
                {moment.line}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
