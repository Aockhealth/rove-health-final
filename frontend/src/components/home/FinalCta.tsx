import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="bg-paper px-6 py-16 text-center md:py-20">
      <Reveal className="mx-auto max-w-2xl">
        <h2 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-4xl">
          Start living in sync with your cycle.
        </h2>
        <p className="mt-4 font-sans text-base leading-relaxed text-obsidian/70">
          Cycle Sync reads your phase and turns it into a plan for the day. No cost, and nothing
          you have to log.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" href="/app">
            Get Cycle Sync
          </Button>
          <Button
            size="lg"
            variant="ghost"
            href="/shop"
            className="text-obsidian hover:bg-obsidian/10"
          >
            Or visit the shop
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
