import type { Metadata } from "next";
import { Apple, BookOpen, Brain, Dumbbell, ShieldPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { PhoneMockup } from "@/components/app/PhoneMockup";
import { DayTimeline } from "@/components/app/DayTimeline";
import { ScreenshotGallery } from "@/components/app/ScreenshotGallery";

export const metadata: Metadata = {
  title: "The App | Rove Health",
  description:
    "The Rove app is a hormonal lifestyle operating system: a daily plan for what to eat, how to move, and what to take, built for the Indian cycle.",
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "Cycle Intelligence Engine",
    body: "Your last period date and cycle length become the input that drives every recommendation, not just a number on a screen.",
  },
  {
    icon: Apple,
    title: "AI Diet Coach",
    body: "Fresh meal plans daily, built for Indian kitchens (jowar, bajra, ragi, sattu, dal), with an automatic iron boost during your period.",
  },
  {
    icon: Dumbbell,
    title: "Phase-Synced Movement",
    body: "Push harder in Follicular and Ovulatory. Wind down with yoga and somatic flows in Luteal. Gentle movement during Menstrual.",
  },
  {
    icon: Brain,
    title: "Insights Engine",
    body: "Predictive alerts before symptoms hit, like a nudge to cut caffeine three days before your Luteal phase begins.",
  },
  {
    icon: ShieldPlus,
    title: "PMOS & Condition Modes",
    body: "Flag PMOS, thyroid, or insulin resistance at onboarding, and the plan adjusts: dairy deprioritised, anti-androgenic foods foregrounded.",
  },
  {
    icon: BookOpen,
    title: "The Learn Library",
    body: "A science-backed editorial library, written for Indian bodies, from cycle-synced protein to the PMOS epidemic in India.",
  },
];

export default function AppPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <AnimatedBackground phases={["ovulatory", "menstrual"]} />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div>
            <span
              className="animate-fade-in font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/50"
            >
              The Cycle Sync App
            </span>
            <h1
              className="animate-fade-in mt-4 font-sans text-4xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl"
              style={{ animationDelay: "100ms" }}
            >
              Not a tracker.{" "}
              <span className="font-serif italic font-medium">A hormonal lifestyle operating system.</span>
            </h1>
            <p
              className="animate-fade-in mt-4 font-sans text-base leading-relaxed text-obsidian/70"
              style={{ animationDelay: "220ms" }}
            >
              Every morning, Rove gives you three things: what to eat, how to move, and what to
              take, for the exact phase you&apos;re in. The third part of the Rove system, free to
              use.
            </p>
            <div
              className="animate-fade-in mt-8 flex flex-wrap gap-4"
              style={{ animationDelay: "340ms" }}
            >
              <Button size="lg" disabled title="Coming soon to the App Store">
                Download on the App Store
              </Button>
              <Button size="lg" variant="outline" disabled title="Coming soon to Google Play">
                Get it on Google Play
              </Button>
            </div>
            <p
              className="animate-fade-in mt-3 font-sans text-xs text-obsidian/50"
              style={{ animationDelay: "420ms" }}
            >
              Links go live at launch. Join the waitlist via{" "}
              <a href="/contact" className="underline">
                Contact
              </a>
              .
            </p>
          </div>

          <div className="animate-fade-in flex justify-center" style={{ animationDelay: "200ms" }}>
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* A day with Rove */}
      <section className="bg-taupe-light px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/50">
              One Day, From The Inside
            </span>
            <h2 className="mt-3 font-serif text-3xl italic font-medium leading-tight text-obsidian md:text-4xl">
              Priya, 28. Delhi. PMOS. Vegetarian. Luteal Day 5.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={150}>
          <div className="mt-14">
            <DayTimeline />
          </div>
        </Reveal>
      </section>

      {/* Screenshot gallery */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="text-center">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/50">
                Inside The App
              </span>
              <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-obsidian md:text-4xl">
                A look at the real thing.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-12">
              <ScreenshotGallery />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center font-sans text-3xl font-semibold tracking-tight text-obsidian md:text-4xl">
              Built to work alongside Balance.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="h-full rounded-[20px] bg-white border border-obsidian/8 p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-obsidian text-white-bone">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight text-obsidian">
                    {title}
                  </h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-obsidian/70">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-obsidian px-6 py-20 text-center md:py-24">
        <Reveal>
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-white-bone md:text-3xl">
            The app is free. The system works better together.
          </h2>
          <div className="mt-8">
            <Button size="lg" variant="secondary" href="/shop">
              Shop the supplements
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
