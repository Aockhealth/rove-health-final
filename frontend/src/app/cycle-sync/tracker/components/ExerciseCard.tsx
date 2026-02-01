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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 45, 0],
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
            <Dumbbell className={cn(
              "w-4 h-4",
              phaseColor === "rose" ? "text-rose-500" :
                phaseColor === "teal" ? "text-teal-500" :
                  phaseColor === "amber" ? "text-amber-500" :
                    "text-indigo-500"
            )} />
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
                  "px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                  isActive
                    ? phaseColor === "rose" ? "bg-rose-100 text-rose-800 border-rose-300 shadow-sm" :
                      phaseColor === "teal" ? "bg-teal-100 text-teal-800 border-teal-300 shadow-sm" :
                        phaseColor === "amber" ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm" :
                          "bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm"
                    : phaseColor === "rose" ? "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30" :
                      phaseColor === "teal" ? "bg-white border-teal-100/50 text-gray-600 hover:border-teal-200 hover:bg-teal-50/30" :
                        phaseColor === "amber" ? "bg-white border-amber-100/50 text-gray-600 hover:border-amber-200 hover:bg-amber-50/30" :
                          "bg-white border-indigo-100/50 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50/30"
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
          phaseColor === "rose" ? "border-rose-100/50" :
            phaseColor === "teal" ? "border-teal-100/50" :
              phaseColor === "amber" ? "border-amber-100/50" :
                "border-indigo-100/50"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            phaseColor === "rose" ? "bg-rose-100" :
              phaseColor === "teal" ? "bg-teal-100" :
                phaseColor === "amber" ? "bg-amber-100" :
                  "bg-indigo-100"
          )}>
            <Clock className={cn(
              "w-4 h-4",
              phaseColor === "rose" ? "text-rose-600" :
                phaseColor === "teal" ? "text-teal-600" :
                  phaseColor === "amber" ? "text-amber-600" :
                    "text-indigo-600"
            )} />
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