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

  // Organic Chromatics Styling
  const phase = currentPhase || "Menstrual";

  const themes: Record<string, any> = {
    "Menstrual": {
      border: "border-phase-menstrual/20",
      shadow: "shadow-phase-menstrual/5",
      iconBg: "bg-phase-menstrual/10",
      iconColor: "text-phase-menstrual",
      active: "bg-phase-menstrual text-white border-phase-menstrual shadow-md shadow-phase-menstrual/20",
      inactive: "bg-white text-gray-600 border-phase-menstrual/20 hover:bg-phase-menstrual/5",
      inputBorder: "border-phase-menstrual/30",
      pillText: "text-phase-menstrual",
      pillBorder: "border-phase-menstrual/20"
    },
    "Follicular": {
      border: "border-phase-follicular/20",
      shadow: "shadow-phase-follicular/5",
      iconBg: "bg-phase-follicular/10",
      iconColor: "text-phase-follicular",
      active: "bg-phase-follicular text-white border-phase-follicular shadow-md shadow-phase-follicular/20",
      inactive: "bg-white text-gray-600 border-phase-follicular/20 hover:bg-phase-follicular/5",
      inputBorder: "border-phase-follicular/30",
      pillText: "text-phase-follicular",
      pillBorder: "border-phase-follicular/20"
    },
    "Ovulatory": {
      border: "border-phase-ovulatory/20",
      shadow: "shadow-phase-ovulatory/5",
      iconBg: "bg-phase-ovulatory/10",
      iconColor: "text-phase-ovulatory",
      active: "bg-phase-ovulatory text-white border-phase-ovulatory shadow-md shadow-phase-ovulatory/20",
      inactive: "bg-white text-gray-600 border-phase-ovulatory/20 hover:bg-phase-ovulatory/5",
      inputBorder: "border-phase-ovulatory/30",
      pillText: "text-phase-ovulatory",
      pillBorder: "border-phase-ovulatory/20"
    },
    "Luteal": {
      border: "border-phase-luteal/20",
      shadow: "shadow-phase-luteal/5",
      iconBg: "bg-phase-luteal/10",
      iconColor: "text-phase-luteal",
      active: "bg-phase-luteal text-white border-phase-luteal shadow-md shadow-phase-luteal/20",
      inactive: "bg-white text-gray-600 border-phase-luteal/20 hover:bg-phase-luteal/5",
      inputBorder: "border-phase-luteal/30",
      pillText: "text-phase-luteal",
      pillBorder: "border-phase-luteal/20"
    }
  };

  const theme = themes[phase] || themes["Menstrual"];

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl transition-all",
      theme.border,
      theme.shadow
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
            theme.iconBg
          )}
        >
          <Moon className={cn("w-4 h-4 fill-current", theme.iconColor)} />
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
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                  isActive
                    ? m.type === "positive"
                      ? "bg-green-100 text-green-800 border-green-300 shadow-sm"
                      : m.type === "negative"
                        ? "bg-red-100 text-red-800 border-red-300 shadow-sm"
                        : "bg-orange-100 text-orange-800 border-orange-300 shadow-sm"
                    : theme.inactive
                )}
              >
                {isActive && <Check className="w-3 h-3 inline mr-1" />}
                {m.label}
              </button>
            );
          })}
        </div>

        <div className={cn(
          "flex items-center gap-4 bg-white/40 p-4 rounded-2xl border",
          theme.inputBorder
        )}>
          <Clock className={cn("w-5 h-5", theme.iconColor)} />
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
            "ml-auto text-xs font-bold bg-white/50 px-2.5 py-1.5 rounded-xl border",
            theme.pillText,
            theme.pillBorder
          )}>
            TOTAL DURATION
          </div>
        </div>
      </div>
    </div>
  );
}