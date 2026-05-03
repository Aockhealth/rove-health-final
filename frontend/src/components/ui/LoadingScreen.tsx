"use client";

import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const FUN_FACTS = [
  "Cycle Syncing Tip: Focus on high-intensity workouts like HIIT during your Follicular phase.",
  "Cycle Syncing Tip: Seed cycling with flax and pumpkin seeds can naturally support estrogen levels.",
  "Cycle Syncing Tip: Your pain tolerance peaks during Ovulation—it's the best time for deep tissue massages!",
  "Cycle Syncing Tip: Progesterone rises in your Luteal phase, making it the perfect time for gentle yoga and relaxation.",
  "Cycle Syncing Tip: Warm, iron-rich foods like stews and spinach help replenish your body during menstruation.",
  "Did you know? Estrogen peaks in your follicular phase, naturally boosting your memory and verbal skills.",
  "Cycle Syncing Tip: Insulin sensitivity drops pre-period. Pair carbs with protein to avoid sugar crashes.",
  "Cycle Syncing Tip: The follicular phase brings a wave of creativity—ideal for starting new work projects.",
  "Did you know? Your resting metabolic rate increases in the luteal phase, meaning you naturally burn more calories.",
  "Cycle Syncing Tip: Bone broth and magnesium-rich foods are your best friends during the menstrual phase."
];

export default function LoadingScreen() {
  const reduceMotion = useReducedMotion();
  const [factIndex, setFactIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Pick a random fact once the component mounts
    const randomIndex = Math.floor(Math.random() * FUN_FACTS.length);
    setFactIndex(randomIndex);
    setMounted(true);

    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 4500); // Increased interval to let users read longer facts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FDFBF7] px-6 relative overflow-hidden">
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={reduceMotion ? undefined : {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={reduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-phase-menstrual/15 blur-[80px]"
        />
        <motion.div
          animate={reduceMotion ? undefined : {
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 -z-10 h-72 w-72 rounded-full bg-orange-100/40 blur-[80px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Logo Container - Clean Breathing Animation */}
        <div className="relative mb-10 w-40 sm:w-48 h-16 flex items-center justify-center">
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Image
              src="/images/rove_logo_final.png"
              alt="Rove Health"
              fill
              sizes="112px"
              className="object-contain"
              priority
            />
          </motion.div>
        </div>

        {/* Fact Container (Glassmorphism) */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 15 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="w-full bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rove-stone/60 mb-5">
              Did you know?
            </span>

            <div className="min-h-[5rem] flex items-center justify-center w-full px-2">
              <AnimatePresence mode="wait">
                {mounted && (
                  <motion.p
                    key={factIndex}
                    initial={reduceMotion ? undefined : { opacity: 0, filter: "blur(4px)", y: 5 }}
                    animate={reduceMotion ? undefined : { opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, filter: "blur(4px)", y: -5 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-sm md:text-base font-medium text-rove-charcoal leading-relaxed"
                  >
                    {FUN_FACTS[factIndex].replace(/^(Did you know\? |Cycle Syncing Tip: )/, "")}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Indeterminate loading bar */}
            <div className="w-full h-1 bg-rove-stone/10 rounded-full mt-6 overflow-hidden relative">
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1/3 bg-phase-menstrual/50 rounded-full"
                animate={{
                  x: ['-100%', '300%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
