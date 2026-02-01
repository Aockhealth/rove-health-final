import { Sparkles, Check, Info } from "lucide-react";
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
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            phaseColor === "rose" ? "bg-rose-100" :
              phaseColor === "teal" ? "bg-teal-100" :
                phaseColor === "amber" ? "bg-amber-100" :
                  "bg-indigo-100"
          )}
        >
          <Sparkles className={cn(
            "w-4 h-4 fill-current",
            phaseColor === "rose" ? "text-rose-500" :
              phaseColor === "teal" ? "text-teal-500" :
                phaseColor === "amber" ? "text-amber-500" :
                  "text-indigo-500"
          )} />
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
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 p-3 bg-gray-900 text-white text-[11px] rounded-xl z-[100] text-center shadow-2xl font-sans normal-case tracking-normal leading-relaxed"
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
                  "px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                  isActive
                    ? phaseColor === "rose" ? "bg-rose-100 text-rose-800 border-rose-300 shadow-sm" :
                      phaseColor === "teal" ? "bg-teal-100 text-teal-800 border-teal-300 shadow-sm" :
                        phaseColor === "amber" ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm" :
                          "bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm"
                    : phaseColor === "rose" ? "bg-white border-rose-100 text-gray-600 hover:border-rose-200" :
                      phaseColor === "teal" ? "bg-white border-teal-100 text-gray-600 hover:border-teal-200" :
                        phaseColor === "amber" ? "bg-white border-amber-100 text-gray-600 hover:border-amber-200" :
                          "bg-white border-indigo-100 text-gray-600 hover:border-indigo-200"
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
            phaseColor === "rose" ? "border-rose-100 focus:ring-rose-100" :
              phaseColor === "teal" ? "border-teal-100 focus:ring-teal-100" :
                phaseColor === "amber" ? "border-amber-100 focus:ring-amber-100" :
                  "border-indigo-100 focus:ring-indigo-100"
          )}
        />
      </div>
    </div>
  );
}