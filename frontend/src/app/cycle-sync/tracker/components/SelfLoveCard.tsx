import { Check, Info, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SelfLoveCardProps {
  selectedSelfLove: string[];
  setSelectedSelfLove: (selfLove: string[]) => void;
  selfLoveOther: string;
  setSelfLoveOther: (other: string) => void;
  currentPhase?: string | null;
}

const selfLoveOptions = ["Travel", "Meditation", "Journal", "Hobbies"];

export default function SelfLoveCard({
  selectedSelfLove,
  setSelectedSelfLove,
  selfLoveOther,
  setSelfLoveOther,
  currentPhase,
}: SelfLoveCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const toggleItem = (item: string) => {
    if (selectedSelfLove.includes(item)) {
      setSelectedSelfLove(selectedSelfLove.filter((i) => i !== item));
    } else {
      setSelectedSelfLove([...selectedSelfLove, item]);
    }
  };

  // Organic Chromatics Styling
  const phase = currentPhase || "Menstrual";

  const themes: Record<string, any> = {
    "Menstrual": {
      border: "border-phase-menstrual/30",
      shadow: "shadow-phase-menstrual/5",
      iconBg: "bg-phase-menstrual/10",
      iconColor: "text-phase-menstrual",
      active: "bg-phase-menstrual text-white border-phase-menstrual shadow-md shadow-phase-menstrual/20",
      inactive: "bg-white text-gray-600 border-phase-menstrual/20 hover:bg-phase-menstrual/5",
      inputBorder: "border-phase-menstrual/20 focus:ring-phase-menstrual/30"
    },
    "Follicular": {
      border: "border-phase-follicular/30",
      shadow: "shadow-phase-follicular/5",
      iconBg: "bg-phase-follicular/10",
      iconColor: "text-phase-follicular",
      active: "bg-phase-follicular text-white border-phase-follicular shadow-md shadow-phase-follicular/20",
      inactive: "bg-white text-gray-600 border-phase-follicular/20 hover:bg-phase-follicular/5",
      inputBorder: "border-phase-follicular/20 focus:ring-phase-follicular/30"
    },
    "Ovulatory": {
      border: "border-phase-ovulatory/30",
      shadow: "shadow-phase-ovulatory/5",
      iconBg: "bg-phase-ovulatory/10",
      iconColor: "text-phase-ovulatory",
      active: "bg-phase-ovulatory text-white border-phase-ovulatory shadow-md shadow-phase-ovulatory/20",
      inactive: "bg-white text-gray-600 border-phase-ovulatory/20 hover:bg-phase-ovulatory/5",
      inputBorder: "border-phase-ovulatory/20 focus:ring-phase-ovulatory/30"
    },
    "Luteal": {
      border: "border-phase-luteal/30",
      shadow: "shadow-phase-luteal/5",
      iconBg: "bg-phase-luteal/10",
      iconColor: "text-phase-luteal",
      active: "bg-phase-luteal text-white border-phase-luteal shadow-md shadow-phase-luteal/20",
      inactive: "bg-white text-gray-600 border-phase-luteal/20 hover:bg-phase-luteal/5",
      inputBorder: "border-phase-luteal/20 focus:ring-phase-luteal/30"
    }
  };

  const theme = themes[phase] || themes["Menstrual"];

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border transition-all",
      theme.border,
      theme.shadow
    )}>
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            theme.iconBg
          )}
        >
          <Heart className={cn("w-4 h-4 fill-current", theme.iconColor)} />
        </motion.div>
        <div className="flex items-center gap-2 relative">
          <h3 className="text-base font-heading font-semibold text-gray-900">Self Love Log</h3>
          <div
            className="relative"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Self Love Information"
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
                  Dedicate at least 15-30 mins daily to activities that recharge your soul, reduce stress, and improve mental well-being.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {selfLoveOptions.map((option) => {
            const isActive = selectedSelfLove.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleItem(option)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border",
                  isActive ? theme.active : theme.inactive
                )}
              >
                {isActive && <Check className="w-3.5 h-3.5" />}
                {option}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Others (log here)..."
          value={selfLoveOther}
          onChange={(e) => setSelfLoveOther(e.target.value)}
          className={cn(
            "w-full bg-white/60 border rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all shadow-sm",
            theme.inputBorder
          )}
        />
      </div>
    </div>
  );
}
