import { Button } from "@/components/ui/Button";
import { PhaseOrb } from "@/components/ui/PhaseOrb";
import { CycleLineArt } from "@/components/ui/CycleLineArt";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-taupe">
      <CycleLineArt className="absolute inset-y-0 right-0 h-full w-[70%] text-obsidian/35 [mask-image:linear-gradient(to_right,transparent,black_55%)] md:w-1/2 md:text-obsidian/70 md:[mask-image:linear-gradient(to_right,transparent,black_35%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-20 pb-20 md:grid-cols-[1.1fr_0.9fr] md:pt-28 md:pb-28">
        <div>
          <span
            className="animate-fade-in inline-flex items-center rounded-full border border-obsidian/15 bg-white-bone/70 px-3.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/70"
            style={{ animationDelay: "0ms" }}
          >
            Founded by doctors
          </span>

          <h1
            className="animate-fade-in mt-6 font-sans text-5xl font-semibold leading-[1.05] tracking-tight text-obsidian md:text-7xl"
            style={{ animationDelay: "100ms" }}
          >
            You deserve to live with your cycle.{" "}
            <span className="font-serif italic font-medium">Not against it.</span>
          </h1>

          <div
            className="animate-fade-in mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "340ms" }}
          >
            <Button size="lg" href="/shop">
              Shop the system
            </Button>
            <Button size="lg" variant="outline" href="/story">
              Read our story
            </Button>
          </div>
        </div>

        <div
          className="animate-fade-in flex justify-center md:justify-end"
          style={{ animationDelay: "420ms" }}
        >
          <PhaseOrb size={300} />
        </div>
      </div>
    </section>
  );
}
