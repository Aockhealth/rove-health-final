"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { trackOnboardingEvent } from "@/lib/onboarding/telemetry";
import { ChevronRight, BookOpen, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

import { createClient } from "@/utils/supabase/client";

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

export function IntroSequence() {
  const [mounted, setMounted] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let _isLoggedIn = false;
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
        _isLoggedIn = true;
      }
      
      const hasSeen = localStorage.getItem("rove-splash-seen") === "true";
      if (hasSeen || _isLoggedIn) {
        setIsFirstTime(false);
      } else {
        setIsFirstTime(true);
      }
      
      // If the user has seen the splash before or is logged in, use a shorter delay
      // Otherwise, use 2000ms for first time users.
      const delay = (hasSeen || _isLoggedIn) ? 500 : 2000;
      
      const splashTimer = setTimeout(() => {
        setMounted(true);
      }, delay);

      return () => clearTimeout(splashTimer);
    };
    checkAuth();
  }, []);

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
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#FAF9F6] px-6">
        <div className="relative w-28 h-28 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
          <img 
            src="/images/rove_logo_final.png" 
            alt="Rove Health" 
            className="w-full h-full object-contain" 
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

  // --- LANDING PAGE (For returning/logged-in users) ---
  if (!isFirstTime) {
    const CUTE_HEADINGS = [
      { pt1: "The new basics", pt2: "of cycle sync.", desc: "Meals, movement, and rest — redesigned around your biology." },
      { pt1: "Your cycle is", pt2: "your compass.", desc: "Every phase tells you what your body needs. We translate it." },
      { pt1: "Built different.", pt2: "Built for you.", desc: "Not another period tracker. A complete cycle-synced lifestyle." },
      { pt1: "Live in rhythm.", pt2: "Feel the shift.", desc: "When you align with your cycle, everything clicks into place." },
      { pt1: "Science meets", pt2: "self-care.", desc: "Evidence-backed plans that adapt to every phase of your month." }
    ];

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const CURRENT_CUTE = CUTE_HEADINGS[dayOfYear % CUTE_HEADINGS.length];

    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#FAF9F6] grain-overlay px-6">
        {/* Living atmospheric background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="absolute w-[120%] h-[120%] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-phase-menstrual/15 via-phase-follicular/12 to-phase-ovulatory/15 blur-[100px] opacity-70"
            animate={reduceMotion ? {} : {
              scale: [1, 1.15, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" as const }}
          />
          <motion.div
            className="absolute w-[90%] h-[90%] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-phase-luteal/20 to-transparent blur-[120px] opacity-60"
            animate={reduceMotion ? {} : {
              scale: [1, 1.2, 1],
              rotate: [0, -45, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Centered Content */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">

          {/* Logo */}
          <div className="relative mb-12 flex items-center justify-center w-40 h-16 opacity-90 drop-shadow-lg">
            <Image src="/images/rove_logo_final.png" alt="Rove" fill priority className="object-contain" unoptimized />
          </div>

          {/* Welcome tagline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-rove-stone/50">Welcome to Rove</span>
          </motion.div>

          {/* Editorial Quote */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <h1 className="font-serif text-[2.4rem] sm:text-[3rem] md:text-[3.5rem] leading-[1.08] text-rove-charcoal tracking-tight">
              {CURRENT_CUTE.pt1}
            </h1>
            <h1 className="font-serif text-[2.6rem] sm:text-[3.2rem] md:text-[3.8rem] leading-[1.15] italic text-phase-menstrual mt-1">
              {CURRENT_CUTE.pt2}
            </h1>
            <p className="mx-auto mt-6 max-w-xs text-[15px] font-medium leading-relaxed text-rove-stone/80">
              {CURRENT_CUTE.desc}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center gap-6"
          >
            {isLoggedIn ? (
              <>
                {/* Hero Dashboard Button */}
                <Link href="/cycle-sync" className="w-full sm:max-w-xs" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "dashboard" })}>
                  <Button className="group relative h-[3.5rem] w-full rounded-full bg-rove-charcoal text-white shadow-[0_8px_32px_rgba(45,36,32,0.2)] hover:shadow-[0_12px_40px_rgba(45,36,32,0.3)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-phase-menstrual/15 via-transparent to-phase-ovulatory/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 text-[15px] font-semibold tracking-wide">Enter Dashboard</span>
                    <ChevronRight className="relative z-10 w-4 h-4 ml-2 text-white/60 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                {/* Elegant secondary links */}
                <div className="flex items-center gap-6">
                  <Link
                    href="/cycle-sync/learn"
                    onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "learn" })}
                    className="group flex items-center gap-2 text-rove-stone/60 hover:text-rove-charcoal transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-phase-follicular/60 group-hover:text-phase-follicular transition-colors" />
                    <span className="text-[13px] font-semibold tracking-wide">Learn</span>
                  </Link>

                  <div className="w-px h-3.5 bg-rove-stone/20" />

                  <Link
                    href="https://rovediagnostics.com"
                    target="_blank"
                    onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "shop" })}
                    className="group flex items-center gap-2 text-rove-stone/60 hover:text-rove-charcoal transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-phase-ovulatory/60 group-hover:text-phase-ovulatory transition-colors" />
                    <span className="text-[13px] font-semibold tracking-wide">Shop</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:max-w-xs" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "signup" })}>
                  <Button className="h-[3.5rem] w-full rounded-full bg-rove-charcoal text-[15px] font-semibold text-white shadow-[0_8px_32px_rgba(45,36,32,0.2)] hover:shadow-[0_12px_40px_rgba(45,36,32,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login" onClick={() => trackOnboardingEvent("splash_cta_clicked", { cta: "login" })} className="text-sm font-medium text-rove-stone/60 hover:text-rove-charcoal transition-colors">
                  Already have an account? <span className="underline">Log in</span>
                </Link>
              </>
            )}

            <p className="mt-4 text-[10px] text-rove-stone/40">
              By continuing, you agree to our <Link href="/privacy" className="underline hover:text-rove-charcoal/60 transition-colors">Privacy Policy</Link>.
            </p>
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
          <Image src="/images/rove_logo_final.png" alt="Rove" fill className="object-contain" unoptimized />
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
