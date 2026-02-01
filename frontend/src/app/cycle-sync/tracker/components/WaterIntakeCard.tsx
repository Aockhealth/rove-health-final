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

  const getPhaseColor = (p: string | null | undefined) => {
    switch (p) {
      case "Menstrual": return "rose";
      case "Follicular": return "teal";
      case "Ovulatory": return "amber";
      case "Luteal": return "indigo";
      default: return "rose";
    }
  };

  const phaseColor = getPhaseColor(currentPhase);

  return (
    <div className={cn(
      "bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 transition-all",
      phaseColor === "rose" ? "border-rose-100 shadow-rose-100/20" :
        phaseColor === "teal" ? "border-teal-100 shadow-teal-100/20" :
          phaseColor === "amber" ? "border-amber-100 shadow-amber-100/20" :
            "border-indigo-100 shadow-indigo-100/20"
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
            phaseColor === "rose" ? "bg-rose-100" :
              phaseColor === "teal" ? "bg-teal-100" :
                phaseColor === "amber" ? "bg-amber-100" :
                  "bg-indigo-100"
          )}
        >
          <Droplet className={cn(
            "w-4 h-4 fill-current",
            phaseColor === "rose" ? "text-rose-500" :
              phaseColor === "teal" ? "text-teal-500" :
                phaseColor === "amber" ? "text-amber-500" :
                  "text-indigo-500"
          )} />
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
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 p-3 bg-gray-900 text-white text-[11px] rounded-xl z-[100] text-center shadow-2xl font-sans normal-case tracking-normal leading-relaxed"
                >
                  Drink at least 2L of water (8 glasses) daily to stay hydrated, support detoxification, and maintain healthy cognitive function.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 justify-center">
        {/* Glass Animation */}
        <div className={cn(
          "relative w-24 h-32 border-4 border-t-0 rounded-b-3xl bg-white/10 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-inner",
          phaseColor === "rose" ? "border-rose-200" :
            phaseColor === "teal" ? "border-teal-200" :
              phaseColor === "amber" ? "border-amber-200" :
                "border-indigo-200"
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
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 active:scale-95 transition-all"
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
                phaseColor === "rose" ? "bg-rose-500 shadow-rose-200 hover:bg-rose-600" :
                  phaseColor === "teal" ? "bg-teal-500 shadow-teal-200 hover:bg-teal-600" :
                    phaseColor === "amber" ? "bg-amber-500 shadow-amber-200 hover:bg-amber-600" :
                      "bg-indigo-500 shadow-indigo-200 hover:bg-indigo-600"
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