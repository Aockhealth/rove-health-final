import { Droplet, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface WaterIntakeCardProps {
  waterIntake: number;
  setWaterIntake: (intake: number) => void;
  isPouring: boolean;
  setIsPouring: (pouring: boolean) => void;
}

export default function WaterIntakeCard({
  waterIntake,
  setWaterIntake,
  isPouring,
  setIsPouring
}: WaterIntakeCardProps) {
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

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-blue-100/20 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{
            y: [0, 3, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
        >
          <Droplet className="w-4 h-4 text-blue-500 fill-blue-500" />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Hydration</h3>
      </div>

      <div className="flex items-center gap-8 justify-center">
        {/* Glass Animation */}
        <div className="relative w-24 h-32 border-4 border-blue-200 border-t-0 rounded-b-3xl bg-blue-50/10 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-inner">
          {/* Liquid */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-blue-400/80 backdrop-blur-md"
            initial={{ height: 0 }}
            animate={{ height: `${Math.min(waterIntake, 8) * 12.5}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300/50 animate-pulse" />

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
                <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="w-full h-full text-blue-400 fill-current drop-shadow-sm">
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
              className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}