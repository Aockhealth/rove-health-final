"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Flame, Moon, Brain, Leaf, Sun } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect } from "react";

interface PhaseInsightCardProps {
  phase: "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";
  day?: number;
  insight?: any;
  theme: any;
}

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(intervalId);
        }
      }, 20); // Speed of typing (20ms per character)

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
        />
      )}
    </>
  );
}

export function PhaseInsightCard({ phase, insight, day, theme }: PhaseInsightCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get phase icon
  const PhaseIcon = {
    Menstrual: Moon,
    Follicular: Leaf,
    Ovulatory: Sun,
    Luteal: Flame,
  }[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      {/* Container */}
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-8 h-full flex flex-col shadow-sm transition-all duration-700",
        )}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Top-Right Blob */}
        <div className={cn(
          "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none",
          theme.blob
        )} />


        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={cn("absolute w-1 h-1 rounded-full", theme.blob.replace("bg-", "bg-opacity-40 bg-"))}
              initial={{
                x: Math.random() * 100 + "%",
                y: "100%",
              }}
              animate={{
                y: "-20%",
                x: [
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`,
                ],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col gap-5 h-full">
          {/* Header with animated day badge */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={cn("text-[10px] font-bold uppercase tracking-[0.25em]", theme.color)}
              >
                DAY {day} INSIGHT
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={cn("font-heading text-2xl mt-1 text-rove-charcoal")}
              >
                Personalized AI Analysis
              </motion.h3>
            </div>

            {/* Animated phase icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-stone-50 border border-stone-100")}
            >
              <PhaseIcon className={cn("w-6 h-6", theme.color)} />
            </motion.div>
          </div>

          {/* Insight text with TYPING animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative"
          >
            <motion.div
              className={cn(
                "absolute -left-3 top-0 w-1 rounded-full",
                theme.blob
              )}
              initial={{ height: 0 }}
              animate={{ height: insight?.insight ? "100%" : "0%" }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
            <p className="text-sm leading-relaxed max-w-[90%] text-rove-stone min-h-[3.5rem] pl-3">
              {insight?.insight ? (
                <TypingText text={insight.insight} delay={600} />
              ) : (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="italic text-rove-stone/60"
                >
                  Groq AI is analyzing your specific symptoms...
                </motion.span>
              )}
            </p>
          </motion.div>

          <div className="mt-auto space-y-6">
            {/* Dynamic mood pills with stagger animation */}
            {insight?.moods && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-2"
              >
                {insight.moods.map((mood: string, index: number) => (
                  <motion.span
                    key={mood}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm bg-white border border-stone-100 text-rove-charcoal"
                    )}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      ✨
                    </motion.span>
                    {mood}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Dynamic focus pills */}
            {insight?.focus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <p className="font-heading text-[10px] font-bold uppercase tracking-wider mb-2 text-rove-stone opacity-60">
                  Symptom-Specific Recommendations
                </p>
                <div className="flex flex-wrap gap-2">
                  {insight.focus.map((f: string, index: number) => (
                    <motion.span
                      key={f}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.08 }}
                      whileHover={{ scale: 1.05, x: 2 }}
                      className="px-3 py-1 rounded-full bg-stone-50 border border-stone-100 text-[11px] font-medium text-rove-charcoal"
                    >
                      {f}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>


          {/* Footer with animated sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="pt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rove-stone/40 border-t border-stone-100 mt-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
            <span>Powered by Llama 3.3 70B</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}