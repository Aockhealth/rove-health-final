import { Button } from "@/components/ui/Button";
import { PhaseOrb } from "@/components/ui/PhaseOrb";
import { HormoneWave } from "@/components/ui/HormoneWave";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-taupe-light">
      <HormoneWave
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-80 [mask-image:linear-gradient(to_right,transparent,black_35%)] md:block"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-24 pt-14 text-center md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:pb-24 md:pt-20 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <span
            className="animate-rise-in inline-flex items-center rounded-full border border-obsidian/15 bg-white-bone/70 px-3.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/70"
            style={{ animationDelay: "0ms" }}
          >
            Not another period tracker
          </span>

          <h1
            className="animate-rise-in mt-6 font-sans text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-obsidian md:text-6xl"
            style={{ animationDelay: "100ms" }}
          >
            Your cycle isn&apos;t just dates.{" "}
            <span className="font-serif italic font-medium">Stop treating it like one.</span>
          </h1>

          <p
            className="animate-rise-in mt-6 max-w-[52ch] mx-auto font-sans text-base leading-[1.75] text-obsidian/80 md:hidden"
            style={{ animationDelay: "240ms" }}
          >
            Rove reads what&apos;s happening in your body, from PCOS to PMS to irregular cycles,
            and gives you a daily plan for it.
          </p>
          <p
            className="animate-rise-in mt-6 hidden max-w-[52ch] font-sans text-base leading-[1.75] text-obsidian/80 md:block md:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            Rove reads what&apos;s actually happening in your body, from PCOS to PMS to irregular
            cycles, and turns it into a daily plan: what to eat, how to move, what to take.
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
