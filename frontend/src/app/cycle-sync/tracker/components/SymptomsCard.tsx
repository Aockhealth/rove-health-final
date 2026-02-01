import { Activity, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SymptomsCardProps {
  selectedSymptoms: string[];
  setSelectedSymptoms: (symptoms: string[]) => void;
  currentPhase?: string | null;
}

import { SYMPTOM_OPTIONS } from "../constants";

export default function SymptomsCard({
  selectedSymptoms,
  setSelectedSymptoms,
  currentPhase,
}: SymptomsCardProps) {
  const toggleItem = (item: string) => {
    if (selectedSymptoms.includes(item)) {
      setSelectedSymptoms(selectedSymptoms.filter((i) => i !== item));
    } else {
      setSelectedSymptoms([...selectedSymptoms, item]);
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
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
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
          <Activity className={cn(
            "w-4 h-4",
            phaseColor === "rose" ? "text-rose-500" :
              phaseColor === "teal" ? "text-teal-500" :
                phaseColor === "amber" ? "text-amber-500" :
                  "text-indigo-500"
          )} />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Symptoms</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {SYMPTOM_OPTIONS.map((label) => {
          const isActive = selectedSymptoms.includes(label);

          let activeClass = "";
          let inactiveClass = "";

          switch (phaseColor) {
            case "rose":
              activeClass = "bg-rose-100 text-rose-800 border-rose-300 shadow-sm";
              inactiveClass = "bg-white text-gray-600 border-rose-100 ring-1 ring-rose-50/50 hover:bg-rose-50/50";
              break;
            case "teal":
              activeClass = "bg-teal-100 text-teal-800 border-teal-300 shadow-sm";
              inactiveClass = "bg-white text-gray-600 border-teal-100 ring-1 ring-teal-50/50 hover:bg-teal-50/50";
              break;
            case "amber":
              activeClass = "bg-amber-100 text-amber-800 border-amber-300 shadow-sm";
              inactiveClass = "bg-white text-gray-600 border-amber-100 ring-1 ring-amber-50/50 hover:bg-amber-50/50";
              break;
            case "indigo":
              activeClass = "bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm";
              inactiveClass = "bg-white text-gray-600 border-indigo-100 ring-1 ring-indigo-50/50 hover:bg-indigo-50/50";
              break;
            default:
              activeClass = "bg-rose-100 text-rose-800 border-rose-300";
              inactiveClass = "bg-white text-gray-600 border-rose-50";
          }

          return (
            <button
              key={label}
              onClick={() => toggleItem(label)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                isActive ? activeClass : inactiveClass
              )}
            >
              {isActive && <Check className="w-3 h-3" />}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}