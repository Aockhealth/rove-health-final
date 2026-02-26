"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { trackOnboardingEvent } from "@/lib/onboarding/telemetry";
import { ChevronRight, Sparkles, Flower2, HeartPulse, ArrowLeft } from "lucide-react";

interface IntroSequenceProps {
  isLoggedIn: boolean;
}

const SLIDES = [
  {
    id: "welcome",
    title: "You are not inconsistent.",
    subtitle: "You are cyclical.",
    desc: "Rove translates your cycle into practical daily choices for meals, movement, and recovery.",
    icon: null, // Uses the logo
    badge: "Welcome to Rove",
  },
  {
    id: "phases",
    title: "Sync with your nature",
    subtitle: "Four inner seasons",
    desc: "From Winter's rest to Summer's peak, discover how your hormones shape your energy, skin, and mood.",
    icon: Flower2,
    badge: "Cycle Syncing",
  },
  {
    id: "ai",
    title: "Meet your AI sister",
    subtitle: "Guidance, not rules",
    desc: "Log your symptoms and get warm, personalized advice rooted in science and traditional Indian wisdom.",
    icon: Sparkles,
    badge: "Personal Companion",
  },
  {
    id: "action",
    title: "Ready to feel understood?",
    subtitle: "Join the movement",
    desc: "Start with a privacy-first onboarding and get a plan that finally adapts to your body.",
    icon: HeartPulse,
    badge: "Your Journey",
  }
];

export function IntroSequence({ isLoggedIn }: IntroSequenceProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
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

  const isLastSlide = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 40 : -40,
      opacity: 0,
      filter: "blur(4px)",
    })
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#FDFBF7] px-4 py-8">
      {/* Background Atmospheric Orbs */}
      <motion.div
        className="pointer-events-none absolute -left-24 -top-20 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-rose-200/40 via-rose-100/40 to-transparent blur-3xl mix-blend-multiply"
        animate={fluidAnimation}
        transition={fluidTransition}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 -right-20 h-[440px] w-[440px] rounded-full bg-gradient-to-tr from-amber-100/50 via-white/60 to-transparent blur-3xl mix-blend-multiply"
        animate={fluidAnimation}
        transition={{ ...fluidTransition, delay: 1.2 }}
      />

      <div className="relative z-10 w-full max-w-md md:max-w-lg">
        {/* Main Card */}
        <div className="relative min-h-[540px] w-full rounded-[2.5rem] border border-white/70 bg-white/80 p-8 pt-10 text-center shadow-[0_24px_80px_-40px_rgba(45,36,32,0.45)] backdrop-blur-xl flex flex-col items-center justify-between">

          {/* Top Pagination Dots & Back Button */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="w-8">
              {currentSlide > 0 && (
                <button onClick={handlePrev} className="text-rove-stone/60 hover:text-rove-charcoal transition-colors p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {SLIDES.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 bg-rose-500" : "w-1.5 bg-rove-stone/20"}`}
                />
              ))}
            </div>
            <div className="w-8" /> {/* Spacer to center dots */}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full mt-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center w-full"
              >
                {/* Dynamic Icon / Image Container with Glow */}
                <div className="relative mx-auto mb-8 h-24 w-24">
                  <div className="absolute inset-0 bg-rose-200/40 blur-xl rounded-full scale-150" />
                  <div className="relative h-full w-full flex items-center justify-center bg-white/90 backdrop-blur-md rounded-2xl border border-rose-100/50 shadow-sm overflow-hidden">
                    {SLIDES[currentSlide].icon ? (
                      <div className="text-rose-500">
                        {
                          (() => {
                            const Icon = SLIDES[currentSlide].icon;
                            return <Icon className="w-10 h-10" strokeWidth={1.5} />;
                          })()
                        }
                      </div>
                    ) : (
                      <div className="relative h-16 w-16 opacity-90 drop-shadow-sm p-1">
                        <Image
                          src="/images/rove_icon_transparent.png"
                          alt="Rove Health"
                          fill
                          priority
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                </div>

                <p className="mb-4 inline-flex items-center rounded-full border border-rose-200/50 px-4 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-rose-600 bg-rose-50/50">
                  {SLIDES[currentSlide].badge}
                </p>

                <h1 className="font-serif text-3xl sm:text-4xl leading-tight text-rove-charcoal">
                  {SLIDES[currentSlide].title}
                  <br />
                  <span className="italic text-rose-500 block mt-1">{SLIDES[currentSlide].subtitle}</span>
                </h1>

                <p className="mx-auto mt-5 max-w-[280px] sm:max-w-sm text-sm sm:text-base leading-relaxed text-rove-stone font-medium">
                  {SLIDES[currentSlide].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Actions Area */}
          <div className="w-full mt-6 h-[100px] flex flex-col justify-end">
            <AnimatePresence mode="wait">
              {!isLastSlide ? (
                <motion.div
                  key="next-btn"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="w-full flex justify-center pb-2"
                >
                  <button
                    onClick={handleNext}
                    className="group flex h-16 w-16 items-center justify-center rounded-full bg-rove-charcoal text-white shadow-[0_10px_30px_rgba(45,36,32,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="absolute bottom-1 text-[9px] font-bold uppercase tracking-widest text-rove-stone/40 w-full text-center pointer-events-none">
                    Tap or Swipe
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="action-btns"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col gap-3"
                >
                  {isLoggedIn ? (
                    <Link
                      href="/cycle-sync"
                      onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "dashboard" })}
                      className="block w-full"
                    >
                      <Button className="h-14 w-full rounded-2xl bg-rove-charcoal text-base font-semibold text-white shadow-xl hover:bg-black transition-all">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/signup"
                        onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "signup" })}
                        className="block w-full"
                      >
                        <Button className="h-14 w-full rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 text-base font-semibold text-white shadow-[0_8px_25px_rgba(225,29,72,0.35)] hover:opacity-90 hover:scale-[1.02] transition-transform border-none">
                          Sign Up Free
                        </Button>
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "login" })}
                        className="block w-full"
                      >
                        <Button
                          variant="outline"
                          className="h-14 w-full rounded-2xl border-2 border-rove-stone/10 bg-white/50 backdrop-blur-sm text-base font-semibold text-rove-charcoal hover:bg-rose-50 hover:border-rose-200 transition-colors"
                        >
                          Log In to Account
                        </Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
