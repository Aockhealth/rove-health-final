import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="bg-obsidian px-6 py-24 text-center md:py-32">
      <Reveal className="mx-auto max-w-2xl">
        <h2 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-white-bone md:text-5xl">
          Start living in sync with your cycle.
        </h2>
        <div className="mt-8">
          <Button size="lg" variant="secondary" href="/app">
            Get the app
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
