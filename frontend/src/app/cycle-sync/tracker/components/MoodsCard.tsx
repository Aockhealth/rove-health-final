import { Smile, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOODS_LIST } from "../constants";

interface MoodsCardProps {
  selectedMoods: string[];
  setSelectedMoods: (moods: string[]) => void;
  currentPhase?: string | null;
}

export default function MoodsCard({ selectedMoods, setSelectedMoods, currentPhase }: MoodsCardProps) {
  const toggleItem = (item: string) => {
    if (selectedMoods.includes(item)) {
      setSelectedMoods(selectedMoods.filter((i) => i !== item));
    } else {
      setSelectedMoods([...selectedMoods, item]);
    }
  };

  // Category color: Inner Weather → Soft Purple
  const theme = {
    border: "border-[#B07FC0]/30",
    shadow: "shadow-[#B07FC0]/5",
    iconBg: "bg-[#B07FC0]/10",
    iconColor: "text-[#B07FC0]",
    active: "bg-[#B07FC0] text-white border-[#B07FC0] shadow-md",
    inactive: "bg-white text-gray-600 border-[#B07FC0]/20 hover:bg-[#B07FC0]/5"
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
            y: [0, -2, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            theme.iconBg
          )}
        >
          <Smile className={cn("w-4 h-4", theme.iconColor)} />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Inner Weather</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {MOODS_LIST.map((m) => {
          const isActive = selectedMoods.includes(m.label);
          return (
            <button
              key={m.label}
              onClick={() => toggleItem(m.label)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border",
                isActive ? theme.active : theme.inactive
              )}
            >
              {isActive && <Check className="w-3 h-3" />}
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}