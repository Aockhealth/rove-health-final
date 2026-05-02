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

const QUOTES = [
  "Loading good vibes and balanced hormones...",
  "Aligning your cycle, one phase at a time...",
  "Your daily dose of cycle clarity is arriving...",
  "Syncing your rhythm with nature..."
];

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
    
    // Ensure the splash screen quote is visible for at least 2 seconds 
    // before hydrating into the main app to provide a premium feel
    const splashTimer = setTimeout(() => {
      setMounted(true);
    }, 2000);

    return () => clearTimeout(splashTimer);
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

  // Only render once we know the state to prevent hydration mismatch.
  // During SSR, we show a clean, premium minimalist splash screen to avoid a white flash.
  if (!mounted || isFirstTime === null) {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#FDFBF7] px-6">
        <div className="relative w-28 h-28 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
          <Image 
            src="/images/rove_icon_transparent.png" 
            alt="Rove Health" 
            fill 
            priority 
            className="object-contain" 
            unoptimized 
          />
        </div>
        
        <p 
          suppressHydrationWarning 
          className="mt-6 text-sm font-medium text-rove-stone/70 tracking-wide text-center opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]"
        >
          {randomQuote}
        </p>

        <div className="absolute bottom-12 opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards] flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-rove-stone/20 border-t-rove-stone/80 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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

    const CUTE_HEADINGS = [
      { pt1: "You are not inconsistent.", pt2: "You are cyclical.", desc: "Your biology isn't broken. Rove is translating your cycle into practical daily choices for meals, movement, and rest." },
      { pt1: "Your body isn't a machine.", pt2: "It's a garden.", desc: "Blooming in phases. Allow Rove to tune your daily choices to match your natural rhythm perfectly." },
      { pt1: "Stop fighting your biology.", pt2: "Start flowing with it.", desc: "Your energy naturally ebbs and flows. Rove is calibrating your personalized plan to honor your cycle." },
      { pt1: "No more guesswork.", pt2: "Just perfect timing.", desc: "Syncing your lifestyle to your cycle changes everything. Rove keeps you one step ahead of your hormonal shifts." },
      { pt1: "Your energy shifts?", pt2: "That's your superpower.", desc: "Every phase has a unique advantage. Rove helps you harness your shifts for peak performance and recovery." },
      { pt1: "Honor your rest.", pt2: "Maximize your rise.", desc: "Rove learns your biological rhythm to tell you exactly when to push and when to pause." }
    ];

    // Pick a stable quote based on the day of the year (deterministic, no hydration mismatch)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const CURRENT_CUTE = CUTE_HEADINGS[dayOfYear % CUTE_HEADINGS.length];

    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-rove-cream grain-overlay px-6">
        {/* Ambient atmospheric background (Fluid Ecosystem) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70 pointer-events-none">
          <motion.div
            className="absolute w-[120%] h-[120%] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-phase-menstrual/20 via-phase-follicular/15 to-phase-ovulatory/20 blur-[100px]"
            animate={fluidAnimation}
            transition={fluidTransition}
          />
          <motion.div
            className="absolute w-[90%] h-[90%] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-phase-luteal/30 to-transparent blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -45, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Foreground Content Stack */}
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">
          
          {/* Logo with Ripple/Halo Effect */}
          <div className="relative mb-14 flex items-center justify-center w-24 h-24">
            <motion.div 
              className="absolute inset-[0px] rounded-full border border-rove-stone/20"
              animate={reduceMotion ? {} : { scale: [1, 1.5, 1], opacity: [0, 0.4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div 
              className="absolute inset-[0px] rounded-full border border-rove-charcoal/10"
              animate={reduceMotion ? {} : { scale: [1, 2, 1], opacity: [0, 0.2, 0] }}
              transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeOut" }}
            />
            <div className="relative h-16 w-16 opacity-90 drop-shadow-xl saturate-150">
              <Image src="/images/rove_icon_transparent.png" alt="Rove Health" fill priority className="object-contain drop-shadow-sm" unoptimized />
            </div>
          </div>

          {/* Premium editorial content card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative flex flex-col items-center"
          >
            {/* Pill Badge */}
            <div className="mb-8 overflow-hidden rounded-full border border-white/40 bg-white/30 backdrop-blur-md shadow-sm">
              <div className="px-5 py-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rove-charcoal/80">
                  Biology First
                </span>
              </div>
            </div>

            {/* High-Contrast Typography */}
            <h1 className="font-serif text-[2.5rem] md:text-6xl leading-[1.1] text-rove-charcoal tracking-tight drop-shadow-sm">
              {CURRENT_CUTE.pt1}
            </h1>
            <h1 className="font-serif text-[2.75rem] md:text-[4rem] leading-[1.2] italic text-phase-menstrual mt-2 drop-shadow-sm w-full block">
              {CURRENT_CUTE.pt2}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-8 max-w-[340px] md:max-w-md text-[15px] font-medium leading-relaxed text-rove-stone/90">
              {CURRENT_CUTE.desc}
            </p>

            {/* CTA Buttons */}
            <div className="mt-14 w-full flex flex-col gap-4 sm:max-w-xs mx-auto relative z-20">
              {isLoggedIn ? (
                <Link href="/cycle-sync" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "dashboard" })}>
                  <Button className="group h-14 w-full rounded-full bg-rove-charcoal shadow-xl shadow-rove-charcoal/10 transition-all hover:bg-black hover:-translate-y-1">
                    <span className="text-[15px] font-semibold text-white tracking-wide">Enter Dashboard</span>
                    <ChevronRight className="w-4 h-4 ml-2 text-white/70 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/signup" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "signup" })}>
                    <Button className="h-12 w-full rounded-full bg-rove-charcoal text-[13px] font-semibold text-white hover:bg-black">
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "login" })}>
                    <Button variant="outline" className="h-12 w-full rounded-full border-rove-charcoal/30 bg-white/60 backdrop-blur-sm text-[13px] font-semibold text-rove-charcoal hover:bg-white">
                      Log In
                    </Button>
                  </Link>
                </div>
              )}
              <p className="mt-6 text-[10px] text-center text-rove-stone/60">
                By continuing, you agree to our <Link href="/privacy" className="underline hover:text-rove-charcoal">Privacy Policy</Link>.
              </p>
            </div>
          </motion.div>
        </div>
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

      {/* Top Bar with Safe Area */}
      <div className="absolute pl-6 pr-6 left-0 right-0 top-[max(1.5rem,env(safe-area-inset-top))] flex justify-between items-center z-50">
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
        onClick={(e: React.MouseEvent) => {
          // Tap right side of screen to advance, left side to go back
          const tapX = e.clientX;
          if (tapX > window.innerWidth / 2) {
            if (currentStep < 3) setCurrentStep(s => s + 1);
          } else {
            if (currentStep > 0) setCurrentStep(s => s - 1);
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
                <div className="text-center flex flex-col gap-3">
                  <Link href="/login" onClick={handleSkip} className="text-sm font-medium text-rove-stone hover:text-rove-charcoal transition-colors">
                    Already have an account? Log in
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always Visible Privacy Link for Google Crawler */}
          <p className="mt-2 text-[10px] text-rove-stone/60 pointer-events-auto">
            By continuing, you agree to our <Link href="/privacy" className="underline hover:text-rove-charcoal">Privacy Policy</Link>.
          </p>

        </div>
      </div>

    </div>
  );
}
