"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { trackOnboardingEvent } from "@/lib/onboarding/telemetry";

interface IntroSequenceProps {
  isLoggedIn: boolean;
}

export function IntroSequence({ isLoggedIn }: IntroSequenceProps) {
  const reduceMotion = useReducedMotion();

  const fluidAnimation = reduceMotion
    ? {}
    : {
      scale: [1, 1.15, 1],
      x: [0, 20, 0],
      y: [0, -20, 0],
    };

  const fluidTransition = reduceMotion
    ? { duration: 0 }
    : {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut" as const,
    };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#FDFBF7] px-4 py-8">
      <motion.div
        className="pointer-events-none absolute -left-24 -top-20 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-rose-200/40 via-rose-100/40 to-transparent blur-3xl"
        animate={fluidAnimation}
        transition={fluidTransition}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 -right-20 h-[440px] w-[440px] rounded-full bg-gradient-to-tr from-amber-100/50 via-white/60 to-transparent blur-3xl"
        animate={fluidAnimation}
        transition={{ ...fluidTransition, delay: 1.2 }}
      />

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_24px_80px_-40px_rgba(45,36,32,0.45)] backdrop-blur-md md:p-12"
      >
        <div className="mx-auto mb-6 h-16 w-16 md:h-20 md:w-20 opacity-90 drop-shadow-sm">
          <div className="relative h-full w-full">
            <Image
              src="/images/rove_icon_transparent.png"
              alt="Rove Health"
              fill
              priority
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        <p className="mb-4 inline-flex items-center rounded-full border border-rove-charcoal/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rove-charcoal/70">
          Biology First
        </p>

        <h1 className="font-serif text-4xl leading-tight text-rove-charcoal md:text-6xl">
          You are not inconsistent.
          <br />
          <span className="italic text-rose-600">You are cyclical.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-rove-stone md:text-base">
          Rove translates your cycle into practical daily choices for meals, movement, and recovery.
          Start with privacy-first onboarding and get a plan that adapts to your phase.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {isLoggedIn ? (
            <Link
              href="/cycle-sync"
              onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "dashboard" })}
            >
              <Button className="h-12 w-full rounded-full bg-rove-charcoal text-base font-semibold text-white hover:bg-rove-charcoal/90">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "signup" })}
              >
                <Button className="h-12 w-full rounded-full bg-rove-charcoal text-base font-semibold text-white hover:bg-rove-charcoal/90">
                  Sign Up
                </Button>
              </Link>
              <Link
                href="/login"
                onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "login" })}
              >
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-rove-charcoal/30 bg-white text-base font-semibold text-rove-charcoal hover:bg-rose-50"
                >
                  Log In
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
