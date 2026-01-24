import { Dumbbell, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  selectedExercise: string[];
  setSelectedExercise: (exercise: string[]) => void;
  exerciseMinutes: string;
  setExerciseMinutes: (minutes: string) => void;
}

const exerciseOptions = [
  "Rest Day",
  "Light (Walk, Yoga)",
  "Moderate (Gym, Pilates)",
  "Intense (HIIT, Run)",
];

export default function ExerciseCard({
  selectedExercise,
  setSelectedExercise,
  exerciseMinutes,
  setExerciseMinutes,
}: ExerciseCardProps) {
  const toggleItem = (item: string) => {
    if (selectedExercise.includes(item)) {
      setSelectedExercise(selectedExercise.filter((i) => i !== item));
    } else {
      setSelectedExercise([...selectedExercise, item]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-green-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-green-100/20 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 45, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"
          >
            <Dumbbell className="w-4 h-4 text-green-500" />
          </motion.div>
          <h3 className="text-base font-heading font-semibold text-gray-900">Exercise Log</h3>
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
          {exerciseOptions.map((e) => {
            const isActive = selectedExercise.includes(e);
            return (
              <button
                key={e}
                onClick={() => toggleItem(e)}
                className={cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                  isActive
                    ? "bg-green-100 text-green-800 border-green-300 shadow-sm"
                    : "bg-white border-green-100/50 text-gray-600 hover:border-green-200 hover:bg-green-50/30"
                )}
              >
                {isActive && <Check className="w-3.5 h-3.5" />}
                {e}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-green-100/50">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-green-600" />
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