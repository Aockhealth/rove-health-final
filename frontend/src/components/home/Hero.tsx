import { Button } from "@/components/ui/Button";
import { PhaseOrb } from "@/components/ui/PhaseOrb";
import { CycleLineArt } from "@/components/ui/CycleLineArt";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-menstrual">
      {/* Soft wash of the app's four phase colors (menstrual/follicular/ovulatory/luteal
          — same hexes as PhaseOrb's gradient ring) instead of a flat neutral block, so
          the hero reads as the same "system" as the app rather than an invented tan. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 12% 15%, rgba(175,107,107,0.16) 0%, transparent 60%), radial-gradient(60% 70% at 88% 10%, rgba(212,162,95,0.18) 0%, transparent 60%), radial-gradient(65% 75% at 82% 92%, rgba(141,170,157,0.16) 0%, transparent 60%), radial-gradient(60% 70% at 8% 88%, rgba(123,130,168,0.16) 0%, transparent 60%)",
        }}
      />

      <CycleLineArt className="absolute inset-y-0 right-0 h-full w-[70%] text-obsidian/25 [mask-image:linear-gradient(to_right,transparent,black_55%)] md:w-1/2 md:text-obsidian/40 md:[mask-image:linear-gradient(to_right,transparent,black_35%)]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-24 pt-14 text-center md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:pb-24 md:pt-20 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <span
            className="animate-rise-in inline-flex items-center rounded-full border border-obsidian/15 bg-white-bone/70 px-3.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/70"
            style={{ animationDelay: "0ms" }}
          >
            Science-backed cycle care
          </span>

          <h1
            className="animate-rise-in mt-6 font-sans text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-obsidian md:text-6xl"
            style={{ animationDelay: "100ms" }}
          >
            Smarter hormone health{" "}
            <span className="font-serif italic font-medium">starts here.</span>
          </h1>

          <p
            className="animate-rise-in mt-6 max-w-[52ch] mx-auto font-sans text-base leading-[1.75] text-obsidian/80 md:mx-0 md:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            Track your cycle, understand your hormones, and support your body with science-backed
            supplements and personalized guidance.
          </p>

          <div
            className="animate-rise-in mt-9 flex flex-wrap items-center justify-center gap-4 md:justify-start"
            style={{ animationDelay: "360ms" }}
          >
            <Button size="lg" href="/app">
              Get Cycle Sync
            </Button>
            <Button size="lg" variant="outline" href="/shop">
              Shop
            </Button>
          </div>
        </div>

        <div
          className="animate-rise-in mt-6 flex justify-center md:mt-0 md:justify-end"
          style={{ animationDelay: "420ms" }}
        >
          <PhaseOrb size={260} />
        </div>
      </div>
    </section>
  );
}
