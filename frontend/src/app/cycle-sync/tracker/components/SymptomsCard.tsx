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

  // Category color: Body Signals → Warm Red
  const CAT_COLOR = "#E07B7B";
  const theme = {
    border: "border-[#E07B7B]/30",
    shadow: "shadow-[#E07B7B]/5",
    iconBg: "bg-[#E07B7B]/10",
    iconColor: "text-[#E07B7B]",
    active: "bg-[#E07B7B] text-white border-[#E07B7B] shadow-md",
    inactive: "bg-white text-gray-600 border-[#E07B7B]/20 hover:bg-[#E07B7B]/5"
  };

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border transition-all",
      theme.border,
      theme.shadow
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
            theme.iconBg
          )}
        >
          <Activity className={cn("w-4 h-4", theme.iconColor)} />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Body Signals</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {SYMPTOM_OPTIONS.map((label) => {
          const isActive = selectedSymptoms.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggleItem(label)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border",
                isActive ? theme.active : theme.inactive
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
