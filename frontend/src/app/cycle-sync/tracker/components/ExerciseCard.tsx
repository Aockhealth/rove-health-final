import { Dumbbell, Clock, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EXERCISE_OPTIONS } from "../constants";

interface ExerciseCardProps {
  selectedExercise: string[];
  setSelectedExercise: (exercise: string[]) => void;
  exerciseMinutes: string;
  setExerciseMinutes: (minutes: string) => void;
  currentPhase?: string | null;
}

export default function ExerciseCard({
  selectedExercise,
  setSelectedExercise,
  exerciseMinutes,
  setExerciseMinutes,
  currentPhase,
}: ExerciseCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const toggleItem = (item: string) => {
    if (selectedExercise.includes(item)) {
      setSelectedExercise(selectedExercise.filter((i) => i !== item));
    } else {
      setSelectedExercise([...selectedExercise, item]);
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
      inputBorder: "border-phase-menstrual/50"
    },
    "Follicular": {
      border: "border-phase-follicular/20",
      shadow: "shadow-phase-follicular/5",
      iconBg: "bg-phase-follicular/10",
      iconColor: "text-phase-follicular",
      active: "bg-phase-follicular text-white border-phase-follicular shadow-md shadow-phase-follicular/20",
      inactive: "bg-white text-gray-600 border-phase-follicular/20 hover:bg-phase-follicular/5",
      inputBorder: "border-phase-follicular/50"
    },
    "Ovulatory": {
      border: "border-phase-ovulatory/20",
      shadow: "shadow-phase-ovulatory/5",
      iconBg: "bg-phase-ovulatory/10",
      iconColor: "text-phase-ovulatory",
      active: "bg-phase-ovulatory text-white border-phase-ovulatory shadow-md shadow-phase-ovulatory/20",
      inactive: "bg-white text-gray-600 border-phase-ovulatory/20 hover:bg-phase-ovulatory/5",
      inputBorder: "border-phase-ovulatory/50"
    },
    "Luteal": {
      border: "border-phase-luteal/20",
      shadow: "shadow-phase-luteal/5",
      iconBg: "bg-phase-luteal/10",
      iconColor: "text-phase-luteal",
      active: "bg-phase-luteal text-white border-phase-luteal shadow-md shadow-phase-luteal/20",
      inactive: "bg-white text-gray-600 border-phase-luteal/20 hover:bg-phase-luteal/5",
      inputBorder: "border-phase-luteal/50"
    }
  };

  const theme = themes[phase] || themes["Menstrual"];

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl transition-all",
      theme.border,
      theme.shadow
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 45, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              theme.iconBg
            )}
          >
            <Dumbbell className={cn("w-4 h-4", theme.iconColor)} />
          </motion.div>
          <div className="flex items-center gap-2 relative">
            <h3 className="text-base font-heading font-semibold text-gray-900">Exercise Log</h3>
            <div
              className="relative"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            >
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Exercise Information"
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
                    Aim for at least 30 minutes of moderate activity daily for better cycle regularity and hormonal health.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedExercise([]);
            setExerciseMinutes("");
          }}
          className="text-[10px] font-medium text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-full bg-white border border-gray-100 hover:border-red-100"
        >
          Didn't Exercise
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {EXERCISE_OPTIONS.map((e) => {
            const isActive = selectedExercise.includes(e);
            return (
              <button
                key={e}
                onClick={() => toggleItem(e)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border",
                  isActive ? theme.active : theme.inactive
                )}
              >
                {isActive && <Check className="w-3.5 h-3.5" />}
                {e}
              </button>
            );
          })}
        </div>

        <div className={cn(
          "flex items-center gap-3 bg-white/60 p-3 rounded-2xl border",
          theme.inputBorder
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            theme.iconBg
          )}>
            <Clock className={cn("w-4 h-4", theme.iconColor)} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={exerciseMinutes}
              onChange={(e) => setExerciseMinutes(e.target.value)}
              placeholder="00"
              className="w-full bg-transparent text-xl font-mono font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none"
            />
          </div>
          <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
            MIN
          </div>
        </div>
      </div>
    </div>
  );
}