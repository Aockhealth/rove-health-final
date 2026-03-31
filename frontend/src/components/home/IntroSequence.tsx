"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { trackOnboardingEvent } from "@/lib/onboarding/telemetry";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntroSequenceProps {
  isLoggedIn: boolean;
}

// Complex SVG paths for the continuous line animation.
// Shape 1: Lotus/Leaf (Delicate, folded)
const pathLotus = "M 50,80 C 30,70 10,40 50,10 C 90,40 70,70 50,80 Z";

// Shape 2: Converging Droplets (Hormones/Dual forces) 
const pathDroplets = "M 30,70 C 10,70 10,30 30,30 C 50,30 50,70 30,70 Z M 70,70 C 90,70 90,30 70,30 C 50,30 50,70 70,70 Z";

// Shape 3: Flowing Path/River (Movement/Time)
const pathRiver = "M 10,80 C 40,80 30,20 50,50 C 70,80 60,20 90,20";

// Shape 4: Aura/Sun (Wholeness/Completion)
const pathAura = "M 50,10 C 72,10 90,28 90,50 C 90,72 72,90 50,90 C 28,90 10,72 10,50 C 10,28 28,10 50,10 Z";

const SCREENS = [
  {
    id: 0,
    title: "Welcome to Rove",
    subtitle: "Your body runs on a continuous biological cycle. Every day is different.",
    path: pathLotus,
    colorClass: "text-phase-menstrual",
    gradientClass: "from-phase-menstrual/20 to-transparent",
    orbGlow: "shadow-[0_0_60px_rgba(175,107,107,0.4)]"
  },
  {
    id: 1,
    title: "Most apps just count days.",
    subtitle: "Rove reads your biology. We track your hormones, not just your calendar.",
    path: pathDroplets,
    colorClass: "text-phase-follicular",
    gradientClass: "from-phase-follicular/20 to-transparent",
    orbGlow: "shadow-[0_0_60px_rgba(141,170,157,0.4)]"
  },
  {
    id: 2,
    title: "Diet. Movement. Skin.",
    subtitle: "Personalized daily plans that shift with your cycle — rooted in bespoke wellness.",
    path: pathRiver,
    colorClass: "text-phase-ovulatory",
    gradientClass: "from-phase-ovulatory/20 to-transparent",
    orbGlow: "shadow-[0_0_60px_rgba(212,162,95,0.4)]"
  },
  {
    id: 3,
    title: "Ready to feel in sync?",
    subtitle: "It takes 2 minutes to set up. Your data stays private. Always.",
    path: pathAura,
    colorClass: "text-phase-luteal",
    gradientClass: "from-phase-luteal/20 to-transparent",
    orbGlow: "shadow-[0_0_60px_rgba(123,130,168,0.4)]"
  }
];

export function IntroSequence({ isLoggedIn }: IntroSequenceProps) {
  const [mounted, setMounted] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Check if user has seen splash before
    const hasSeen = localStorage.getItem("rove-splash-seen") === "true";
    if (hasSeen || isLoggedIn) {
      setIsFirstTime(false);
    } else {
      setIsFirstTime(true);
    }
    setMounted(true);
  }, [isLoggedIn]);

  const handleSkip = () => {
    localStorage.setItem("rove-splash-seen", "true");
    setIsFirstTime(false);
  };

  const handleNext = () => {
    if (currentStep < SCREENS.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem("rove-splash-seen", "true");
    trackOnboardingEvent("splash_cta_clicked", { cta: "get_started_story" });
  };

  // Only render once we know the state to prevent hydration mismatch
  if (!mounted || isFirstTime === null) return null;

  // --- EXISTING SIMPLE LANDING PAGE (For returning/logged-in users) ---
  if (!isFirstTime) {
    const fluidAnimation = reduceMotion ? {} : {
      scale: [1, 1.15, 1],
      x: [0, 20, 0],
      y: [0, -20, 0],
    };

    const fluidTransition = reduceMotion ? { duration: 0 } : {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut" as const,
    };

    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#FDFBF7] px-4 py-8 grain-overlay">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_24px_80px_-40px_rgba(45,36,32,0.45)] backdrop-blur-md md:p-12"
        >
          <div className="mx-auto mb-6 h-16 w-16 md:h-20 md:w-20 opacity-90">
            <div className="relative h-full w-full">
              <Image src="/images/rove_icon_transparent.png" alt="Rove Health" fill priority className="object-contain" unoptimized />
            </div>
          </div>
          <p className="mb-4 inline-flex items-center rounded-full border border-rove-charcoal/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rove-charcoal/70">
            Biology First
          </p>
          <h1 className="font-serif text-4xl leading-tight text-rove-charcoal md:text-6xl">
            You are not inconsistent.<br /><span className="italic text-rose-600">You are cyclical.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-rove-stone md:text-base">
            Rove translates your cycle into practical daily choices for meals, movement, and recovery.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {isLoggedIn ? (
              <Link href="/cycle-sync" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "dashboard" })}>
                <Button className="h-12 w-full rounded-full bg-rove-charcoal text-base font-semibold text-white hover:bg-rove-charcoal/90">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "signup" })}>
                  <Button className="h-12 w-full rounded-full bg-rove-charcoal text-base font-semibold text-white hover:bg-rove-charcoal/90">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "login" })}>
                  <Button variant="outline" className="h-12 w-full rounded-full border-rove-charcoal/30 bg-white text-base font-semibold text-rove-charcoal hover:bg-rose-50">
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

  // --- NEW INTERACTIVE SPLASH STORY (For First-Time Visitors) ---
  const screen = SCREENS[currentStep];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#FDFBF7] grain-overlay">

      {/* Dynamic Background Gradient Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div
          className={cn("w-[120vw] h-[120vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] bg-gradient-radial mix-blend-multiply opacity-40 transition-all duration-1000", screen.gradientClass)}
          // Gentle breathing animation for the background
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="w-8 h-8 relative opacity-80">
          <Image src="/images/rove_icon_transparent.png" alt="Rove" fill className="object-contain" unoptimized />
        </div>
        {currentStep < 3 && (
          <button onClick={handleSkip} className="text-[10px] font-bold uppercase tracking-[0.2em] text-rove-stone hover:text-rove-charcoal transition-colors p-2">
            Skip
          </button>
        )}
      </div>

      {/* Main Swipeable Area */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 cursor-grab active:cursor-grabbing pb-24"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = offset.x;
          if (swipe < -50 && currentStep < 3) setCurrentStep(s => s + 1);
          if (swipe > 50 && currentStep > 0) setCurrentStep(s => s - 1);
        }}
        onClick={() => {
          // Tap right side of screen to advance, left side to go back (desktop friendly)
          if (typeof window !== 'undefined') {
            const tapX = (window.event as MouseEvent)?.clientX;
            if (tapX > window.innerWidth / 2) {
              if (currentStep < 3) setCurrentStep(s => s + 1);
            } else {
              if (currentStep > 0) setCurrentStep(s => s - 1);
            }
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-12"
          >

            {/* The SVG Canvas Container */}
            <div className={cn("relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center transition-all duration-1000", screen.orbGlow)}>
              <svg
                viewBox="0 0 100 100"
                className={cn("w-full h-full transform transition-colors duration-1000", screen.colorClass)}
                style={{ overflow: 'visible' }}
              >
                {/* Subtle base ring */}
                <circle cx="50" cy="50" r="48" fill="transparent" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />

                {/* The Continuous Animating Line */}
                <motion.path
                  d={screen.path}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={reduceMotion ? false : { pathLength: 1 }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    // For the morph transition between shapes
                    d: { duration: 1.5, ease: [0.32, 0.72, 0, 1] }
                  }}
                />
              </svg>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <h2 className="font-serif text-3xl md:text-5xl text-rove-charcoal leading-tight tracking-tight">
                {screen.title}
              </h2>
              <p className="text-[15px] md:text-base text-rove-stone leading-relaxed max-w-[280px] mx-auto font-medium">
                {screen.subtitle}
              </p>
            </div>

          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex flex-col items-center justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm mx-auto flex flex-col items-center gap-6">

          {/* Progress Dots */}
          <div className="flex gap-2.5">
            {SCREENS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  currentStep === i ? "w-6 bg-rove-charcoal" : "w-1.5 bg-rove-stone/20"
                )}
              />
            ))}
          </div>

          {/* Action CTA (Only appears on last screen) */}
          <AnimatePresence>
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full flex-col items-center space-y-4"
              >
                <Link href="/signup" onClick={handleGetStarted} className="w-full block">
                  <Button className="w-full h-14 rounded-full bg-rove-charcoal text-white font-bold text-lg shadow-[0_10px_30px_rgba(45,36,32,0.2)] hover:scale-105 hover:bg-black transition-all">
                    Get Started <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <div className="text-center">
                  <Link href="/login" onClick={handleSkip} className="text-sm font-medium text-rove-stone hover:text-rove-charcoal transition-colors">
                    Already have an account? Log in
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
