import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { PhoneMockup } from "@/components/app/PhoneMockup";
import { DayTimeline } from "@/components/app/DayTimeline";
import { ScreenshotGallery } from "@/components/app/ScreenshotGallery";
import { MechanismChain, type MechanismStep } from "@/components/shop/MechanismChain";
import { RuleDraw } from "@/components/shop/RuleDraw";
import { ThreadDraw } from "@/components/shop/ThreadDraw";

export const metadata: Metadata = {
  title: "The App | Rove Health",
  description:
    "The Rove app turns your cycle into a daily plan: what to eat, how to move, and what to take, built for the Indian cycle.",
};

const RECOGNITIONS = [
  "You logged the same symptom for a year",
  "The app gave you a date and stopped there",
  "Nobody told you what to do with any of it",
];

const HOW_IT_WORKS: MechanismStep[] = [
  {
    scene: "You give it two things.",
    detail: "The date your last period started, and roughly how long your cycle usually runs.",
  },
  {
    scene: "It works out where you are.",
    detail: "Which phase today falls in, and which one is coming next.",
  },
  {
    scene: "It reads your constraints.",
    detail: "PMOS, thyroid, insulin resistance, vegetarian, all flagged once at onboarding.",
  },
  {
    scene: "Then it writes the day.",
    detail: "What to eat, how to move, what to take, for today, not for the month.",
  },
  {
    scene: "And it keeps learning.",
    detail: "Log what you actually felt, and next cycle's plan comes back different.",
  },
];


const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rovehealth.app";

function Masthead({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-0.5 w-full origin-left bg-obsidian animate-rule-draw" />
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-obsidian/12 pb-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian">
          The Cycle Sync App
        </span>
        <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-obsidian/70">
          iOS + Android
        </span>
        <span className="ml-auto font-sans text-[11px] uppercase tracking-[0.16em] text-obsidian/70">
          Now on Google Play
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

export default function AppPage() {
  return (
    <>
      {/* ─── 1. Hero ──────────────────────────────────────────── */}
      <section className="relative bg-paper">
        <Masthead className="px-6 pt-10 md:hidden" />

        <div className="grid md:min-h-[calc(100svh-5rem)] md:grid-cols-[minmax(0,1fr)_42vw]">
          <div className="order-first flex items-center justify-center bg-taupe-light px-6 py-14 md:order-last md:py-0">
            <PhoneMockup priority className="md:w-[19rem] lg:w-[21rem]" />
          </div>

          <div className="flex flex-col justify-end px-6 pb-16 pt-10 md:pl-[7vw] md:pr-14 md:pb-[11vh] md:pt-[16vh]">
            <Masthead className="hidden md:block" />

            <h1
              className="animate-rise-in mt-8 max-w-[18ch] font-sans text-[2.55rem] font-semibold leading-[1.05] tracking-[-0.02em] text-obsidian md:text-6xl lg:text-[4.6rem] lg:leading-[0.98]"
              style={{ animationDelay: "140ms" }}
            >
              Not a tracker.{" "}
              <span className="font-serif italic font-medium">
                A plan for the day you&apos;re actually in.
              </span>
            </h1>

            <p
              className="animate-rise-in mt-7 max-w-[38ch] font-sans text-base leading-[1.75] text-obsidian/70 md:text-lg"
              style={{ animationDelay: "280ms" }}
            >
              Every morning, Rove tells you what to eat, how to move, and what to take, for the
              exact phase you&apos;re in. The third part of the Rove system.
            </p>

            <div
              className="animate-rise-in mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
              style={{ animationDelay: "400ms" }}
            >
              <Button size="lg" href={PLAY_STORE_URL}>
                Get it on Google Play
              </Button>
              <Button size="lg" variant="outline" disabled title="Coming soon to the App Store">
                Download on the App Store
              </Button>
            </div>

            <p
              className="animate-rise-in mt-6 font-sans text-xs font-medium tracking-wide text-obsidian/70"
              style={{ animationDelay: "500ms" }}
            >
              Android is live today. iOS is close behind. Join the waitlist via{" "}
              <a
                href="/contact"
                className="underline decoration-obsidian/25 underline-offset-4 hover:decoration-obsidian"
              >
                Contact
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. Recognition ────────────────────────────── */}
      <section className="bg-gradient-menstrual px-6 py-32 md:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
              If this is your phone
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col gap-7 md:gap-9">
            {RECOGNITIONS.map((line, i) => (
              <Reveal key={line} delay={i * 200} className="duration-[1000ms]">
                <p className="text-center font-serif text-2xl italic font-medium leading-snug text-obsidian/90 md:text-4xl">
                  {line}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={620}>
            <p className="mt-16 text-center font-sans text-2xl font-semibold leading-tight tracking-tight text-obsidian md:text-4xl">
              Knowing what&apos;s coming was never the hard part.{" "}
              <span className="font-serif italic font-medium">Knowing what to do about it is.</span>
            </p>
          </Reveal>

          <ThreadDraw />
        </div>
      </section>

      {/* ─── 3. How it works ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="md:ml-[6%]">
          <SectionHeader eyebrow="How it works">
            <span className="max-w-[26ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              Two inputs in.{" "}
              <span className="font-serif italic font-medium">A whole day out.</span>
            </span>
          </SectionHeader>
        </Reveal>

        <div className="mt-16 grid gap-14 md:grid-cols-[1fr_0.75fr] md:gap-20">
          <Reveal>
            <MechanismChain steps={HOW_IT_WORKS} />
          </Reveal>

          <Reveal delay={150}>
            <div className="md:sticky md:top-28">
              <p className="max-w-[30ch] font-sans text-xl font-semibold leading-snug tracking-tight text-obsidian md:text-2xl">
                The same day handled four different ways, depending on where your body is in the
                cycle.
              </p>
              <p className="mt-6 max-w-[38ch] font-sans text-sm leading-[1.7] text-obsidian/70">
                Built around the Indian kitchen and the Indian cycle, not a Western template with the
                names swapped out.
              </p>
              
              <div className="mt-10">
                <PhoneMockup
                  src="/app-screenshots/blueprint-of-rhythm.jpg"
                  alt="The Rove app's Blueprint of Your Rhythm screen"
                  className="w-full max-w-[19rem]"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. One day, from the inside ──────────────────────── */}
      <section className="bg-gradient-follicular px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-3xl">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
              Fig. 01 — One day, from the inside
            </p>
            <h2 className="mt-3 font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              Priya, 28. Delhi.{" "}
              <span className="font-serif italic font-medium">Luteal Day 5.</span>
            </h2>
            <p className="mt-4 font-serif text-xl italic font-medium text-obsidian/70 md:text-2xl">
              PMOS. Vegetarian. One ordinary Tuesday.
            </p>
          </Reveal>

          <div className="mt-16">
            <DayTimeline />
          </div>
        </div>
      </section>


      {/* ─── 6. Inside the app ────────────────────────────────── */}
      <section className="bg-white-bone px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/70">
              Fig. 02 — Inside the app
            </p>
            <h2 className="mt-3 font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
              A look at <span className="font-serif italic font-medium">the real thing.</span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-14">
              <ScreenshotGallery />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 7. Close ──────────────────────────────────── */}
      <section className="bg-gradient-luteal px-6 py-24 text-center md:py-32">
        <Reveal className="mx-auto max-w-2xl">
          <span aria-hidden className="mx-auto block h-0.5 w-16 bg-sage-teal" />
          <h2 className="mt-8 font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-obsidian md:text-5xl">
            The app builds the plan.{" "}
            <span className="font-serif italic font-medium">The tablet is the other half.</span>
          </h2>
          <p className="mt-5 font-sans text-base leading-[1.8] text-obsidian/70 md:text-lg">
            Rove tells you what your body needs today. Balance is what you take while it settles.
          </p>
          <div className="mt-10 flex justify-center">
            <Button size="lg" href="/shop">
              Shop the supplements
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
