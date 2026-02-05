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

  // Organic Chromatics Styling
  const phase = currentPhase || "Menstrual";

  const themes: Record<string, any> = {
    "Menstrual": {
      border: "border-phase-menstrual/20",
      shadow: "shadow-phase-menstrual/5",
      iconBg: "bg-phase-menstrual/10",
      iconColor: "text-phase-menstrual",
      active: "bg-phase-menstrual text-white border-phase-menstrual shadow-md shadow-phase-menstrual/20",
      inactive: "bg-white text-gray-600 border-phase-menstrual/20 hover:bg-phase-menstrual/5"
    },
    "Follicular": {
      border: "border-phase-follicular/20",
      shadow: "shadow-phase-follicular/5",
      iconBg: "bg-phase-follicular/10",
      iconColor: "text-phase-follicular",
      active: "bg-phase-follicular text-white border-phase-follicular shadow-md shadow-phase-follicular/20",
      inactive: "bg-white text-gray-600 border-phase-follicular/20 hover:bg-phase-follicular/5"
    },
    "Ovulatory": {
      border: "border-phase-ovulatory/20",
      shadow: "shadow-phase-ovulatory/5",
      iconBg: "bg-phase-ovulatory/10",
      iconColor: "text-phase-ovulatory",
      active: "bg-phase-ovulatory text-white border-phase-ovulatory shadow-md shadow-phase-ovulatory/20",
      inactive: "bg-white text-gray-600 border-phase-ovulatory/20 hover:bg-phase-ovulatory/5"
    },
    "Luteal": {
      border: "border-phase-luteal/20",
      shadow: "shadow-phase-luteal/5",
      iconBg: "bg-phase-luteal/10",
      iconColor: "text-phase-luteal",
      active: "bg-phase-luteal text-white border-phase-luteal shadow-md shadow-phase-luteal/20",
      inactive: "bg-white text-gray-600 border-phase-luteal/20 hover:bg-phase-luteal/5"
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