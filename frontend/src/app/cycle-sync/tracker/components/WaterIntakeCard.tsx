import { Droplet, Plus, Minus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface WaterIntakeCardProps {
  waterIntake: number;
  setWaterIntake: (intake: number) => void;
  isPouring: boolean;
  setIsPouring: (pouring: boolean) => void;
  currentPhase?: string | null;
}

export default function WaterIntakeCard({
  waterIntake,
  setWaterIntake,
  isPouring,
  setIsPouring,
  currentPhase
}: WaterIntakeCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  // Confetti Effect for Water Goal
  useEffect(() => {
    if (waterIntake === 8) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#3B82F6', '#93C5FD', '#FFFFFF']
      });
    }
  }, [waterIntake]);

  // Organic Chromatics Styling
  const phase = currentPhase || "Menstrual";

  const themes: Record<string, any> = {
    "Menstrual": {
      border: "border-phase-menstrual/30",
      shadow: "shadow-phase-menstrual/5",
      iconBg: "bg-phase-menstrual/10",
      iconColor: "text-phase-menstrual",
      btnPlus: "bg-phase-menstrual shadow-phase-menstrual/30 hover:bg-phase-menstrual/90",
      btnMinus: "border-phase-menstrual/20 text-gray-400 hover:bg-phase-menstrual/5",
      glassBorder: "border-phase-menstrual/30"
    },
    "Follicular": {
      border: "border-phase-follicular/30",
      shadow: "shadow-phase-follicular/5",
      iconBg: "bg-phase-follicular/10",
      iconColor: "text-phase-follicular",
      btnPlus: "bg-phase-follicular shadow-phase-follicular/30 hover:bg-phase-follicular/90",
      btnMinus: "border-phase-follicular/20 text-gray-400 hover:bg-phase-follicular/5",
      glassBorder: "border-phase-follicular/30"
    },
    "Ovulatory": {
      border: "border-phase-ovulatory/30",
      shadow: "shadow-phase-ovulatory/5",
      iconBg: "bg-phase-ovulatory/10",
      iconColor: "text-phase-ovulatory",
      btnPlus: "bg-phase-ovulatory shadow-phase-ovulatory/30 hover:bg-phase-ovulatory/90",
      btnMinus: "border-phase-ovulatory/20 text-gray-400 hover:bg-phase-ovulatory/5",
      glassBorder: "border-phase-ovulatory/30"
    },
    "Luteal": {
      border: "border-phase-luteal/30",
      shadow: "shadow-phase-luteal/5",
      iconBg: "bg-phase-luteal/10",
      iconColor: "text-phase-luteal",
      btnPlus: "bg-phase-luteal shadow-phase-luteal/30 hover:bg-phase-luteal/90",
      btnMinus: "border-phase-luteal/20 text-gray-400 hover:bg-phase-luteal/5",
      glassBorder: "border-phase-luteal/30"
    }
  };

  const theme = themes[phase] || themes["Menstrual"];

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border transition-all",
      theme.border,
      theme.shadow
    )}>
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{
            y: [0, 3, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            theme.iconBg
          )}
        >
          <Droplet className={cn("w-4 h-4 fill-current", theme.iconColor)} />
        </motion.div>
        <div className="flex items-center gap-2 relative">
          <h3 className="text-base font-heading font-semibold text-gray-900">Hydration</h3>
          <div
            className="relative"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Hydration Information"
            >
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            </button>

            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 max-w-[calc(100vw-2rem)] p-3 bg-gray-900 text-white text-[11px] rounded-xl z-[100] text-center shadow-2xl font-sans normal-case tracking-normal leading-relaxed"
                >
                  Drink at least 2L of water (8 glasses) daily to stay hydrated, support detoxification, and maintain healthy cognitive function.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 justify-center">
        {/* Glass Animation */}
        <div className={cn(
          "relative w-20 h-28 sm:w-24 sm:h-32 border-4 border-t-0 rounded-b-3xl bg-white/10 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-inner",
          theme.glassBorder
        )}>
          {/* Liquid */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-blue-400/80"
            initial={{ height: 0 }}
            animate={{ height: `${Math.min(waterIntake, 8) * 12.5}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 animate-pulse" />

            {/* Bubbles */}
            <div className="absolute w-full h-full overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white/30 rounded-full w-2 h-2"
                  initial={{ bottom: -10, left: `${20 + i * 30}%`, opacity: 0 }}
                  animate={{ bottom: "100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2 + i,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Pouring Stream */}
          <AnimatePresence>
            {isPouring && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "105%", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-12"
                style={{ originY: 0 }}
              >
                <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="w-full h-full fill-current drop-shadow-sm text-blue-400">
                  <path d="M 18 0 Q 21 30 15 90 Q 5 100 0 100 L 40 100 Q 35 100 25 90 Q 19 30 22 0 Z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-center h-16 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {waterIntake >= 8 ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-40"
                >
                  <p className="text-[10px] uppercase tracking-wide text-green-500 font-bold mb-0.5">Woohoo!</p>
                  <p className="text-xs text-green-600 font-medium leading-tight">You're taking care of yourself 💧</p>
                </motion.div>
              ) : (
                <motion.div
                  key="count"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <p className="text-3xl font-bold text-gray-900">{waterIntake * 250}<span className="text-sm font-medium text-gray-400 ml-1">ml</span></p>
                  <p className="text-xs text-gray-500">{waterIntake} / 8 glasses</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
              className={cn(
                "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
                theme.btnMinus
              )}
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setWaterIntake(waterIntake + 1);
                setIsPouring(true);
                setTimeout(() => setIsPouring(false), 600);
              }}
              className={cn(
                "w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-all",
                theme.btnPlus
              )}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
