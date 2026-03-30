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

const SCREENS = [
  {
    id: 0,
    title: "Welcome to Rove",
    subtitle: "Your body runs on a continuous biological cycle. Every day is different.",
    colorClass: "text-phase-menstrual",
    gradientClass: "from-phase-menstrual/40 to-phase-menstrual/10",
    orbGlow: "shadow-[0_0_80px_rgba(175,107,107,0.5)]"
  },
  {
    id: 1,
    title: "Most apps just count days.",
    subtitle: "Rove reads your biology. We track your hormones, not just your calendar.",
    colorClass: "text-phase-follicular",
    gradientClass: "from-phase-follicular/40 to-phase-follicular/10",
    orbGlow: "shadow-[0_0_80px_rgba(141,170,157,0.5)]"
  },
  {
    id: 2,
    title: "Diet. Movement. Skin.",
    subtitle: "Personalized daily plans that shift with your cycle — rooted in bespoke wellness.",
    colorClass: "text-phase-ovulatory",
    gradientClass: "from-phase-ovulatory/40 to-phase-ovulatory/10",
    orbGlow: "shadow-[0_0_80px_rgba(212,162,95,0.5)]"
  },
  {
    id: 3,
    title: "Ready to feel in sync?",
    subtitle: "It takes 2 minutes to set up. Your data stays private. Always.",
    colorClass: "text-phase-luteal",
    gradientClass: "from-phase-luteal/40 to-phase-luteal/10",
    orbGlow: "shadow-[0_0_80px_rgba(123,130,168,0.5)]"
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

  // Auto-advance the splash screens
  useEffect(() => {
    if (isFirstTime === false || isFirstTime === null) return;
    
    // Stop auto-scrolling on the last screen so they can read the CTA
    if (currentStep >= SCREENS.length - 1) return;

    const autoScrollTimer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 2500); // 2.5 seconds per screen

    return () => clearTimeout(autoScrollTimer);
  }, [currentStep, isFirstTime]);

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
          className="pointer-events-none absolute -left-24 -top-20 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-phase-menstrual/15 via-phase-menstrual/10 to-transparent blur-3xl"
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
            You are not inconsistent.<br /><span className="italic text-phase-menstrual">You are cyclical.</span>
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
                  <Button variant="outline" className="h-12 w-full rounded-full border-rove-charcoal/30 bg-white text-base font-semibold text-rove-charcoal hover:bg-phase-menstrual/10">
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

            {/* The Pulsing Orb Container */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center pt-4">
              {/* Outer soft glow ring */}
              <motion.div
                className={cn("absolute inset-0 rounded-full blur-2xl transition-all duration-1000 opacity-50", screen.orbGlow)}
                animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Orb Body */}
              <motion.div
                className={cn(
                  "relative w-36 h-36 md:w-48 md:h-48 rounded-full border border-white/40 shadow-inner bg-gradient-to-br transition-colors duration-1000 overflow-hidden",
                  screen.gradientClass,
                  screen.orbGlow
                )}
                animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Light reflection highlight on orb */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8)_0%,transparent_60%)] opacity-70 mix-blend-overlay" />
                
                {/* Inner deep core */}
                <motion.div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 rounded-full blur-xl transition-all duration-1000",
                    screen.colorClass.replace("text-", "bg-")
                  )}
                  animate={reduceMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
              </motion.div>
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
