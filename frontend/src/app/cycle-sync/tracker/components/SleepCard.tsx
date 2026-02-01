import { Moon, Clock, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SLEEP_OPTIONS } from "../constants";

interface SleepCardProps {
  selectedSleepQuality: string[];
  setSelectedSleepQuality: (quality: string[]) => void;
  sleepHours: string;
  setSleepHours: (hours: string) => void;
  sleepMinutes: string;
  setSleepMinutes: (minutes: string) => void;
  currentPhase?: string | null;
}

export default function SleepCard({
  selectedSleepQuality,
  setSelectedSleepQuality,
  sleepHours,
  setSleepHours,
  sleepMinutes,
  setSleepMinutes,
  currentPhase,
}: SleepCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const toggleItem = (item: string) => {
    if (selectedSleepQuality.includes(item)) {
      setSelectedSleepQuality(selectedSleepQuality.filter((i) => i !== item));
    } else {
      setSelectedSleepQuality([...selectedSleepQuality, item]);
    }
  };

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
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{
            y: [0, -3, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            phaseColor === "rose" ? "bg-rose-100" :
              phaseColor === "teal" ? "bg-teal-100" :
                phaseColor === "amber" ? "bg-amber-100" :
                  "bg-indigo-100"
          )}
        >
          <Moon className={cn(
            "w-4 h-4 fill-current",
            phaseColor === "rose" ? "text-rose-500" :
              phaseColor === "teal" ? "text-teal-500" :
                phaseColor === "amber" ? "text-amber-500" :
                  "text-indigo-500"
          )} />
        </motion.div>
        <div className="flex items-center gap-2 relative">
          <h3 className="text-base font-heading font-semibold text-gray-900">Sleep Log</h3>
          <div
            className="relative"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Sleep Information"
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
                  7-9 hours of quality sleep is recommended for optimal hormonal balance, mood regulation, and physical recovery.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {SLEEP_OPTIONS.map((m) => {
            const isActive = selectedSleepQuality.includes(m.label);
            return (
              <button
                key={m.label}
                onClick={() => toggleItem(m.label)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border-2",
                  isActive
                    ? m.type === "positive"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : m.type === "negative"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-orange-100 text-orange-800 border-orange-300"
                    : phaseColor === "rose" ? "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200" :
                      phaseColor === "teal" ? "bg-white border-teal-100/50 text-gray-600 hover:border-teal-200" :
                        phaseColor === "amber" ? "bg-white border-amber-100/50 text-gray-600 hover:border-amber-200" :
                          "bg-white border-indigo-100/50 text-gray-600 hover:border-indigo-200"
                )}
              >
                {isActive && <Check className="w-3 h-3 inline mr-1" />}
                {m.label}
              </button>
            );
          })}
        </div>

        <div className={cn(
          "flex items-center gap-4 bg-white/60 p-4 rounded-2xl border",
          phaseColor === "rose" ? "border-rose-100/50" :
            phaseColor === "teal" ? "border-teal-100/50" :
              phaseColor === "amber" ? "border-amber-100/50" :
                "border-indigo-100/50"
        )}>
          <Clock className={cn(
            "w-5 h-5",
            phaseColor === "rose" ? "text-rose-400" :
              phaseColor === "teal" ? "text-teal-400" :
                phaseColor === "amber" ? "text-amber-400" :
                  "text-indigo-400"
          )} />
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">Hours</span>
              <input
                type="number"
                placeholder="0"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
              />
            </div>
            <span className="text-xl font-mono font-bold text-gray-300">:</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">Mins</span>
              <input
                type="number"
                placeholder="00"
                value={sleepMinutes}
                onChange={(e) => setSleepMinutes(e.target.value)}
                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
              />
            </div>
          </div>
          <div className={cn(
            "ml-auto text-xs font-medium bg-white/50 px-2 py-1 rounded-lg border",
            phaseColor === "rose" ? "text-rose-400 border-rose-100" :
              phaseColor === "teal" ? "text-teal-400 border-teal-100" :
                phaseColor === "amber" ? "text-amber-400 border-amber-100" :
                  "text-indigo-400 border-indigo-100"
          )}>
            TOTAL DURATION
          </div>
        </div>
      </div>
    </div>
  );
}