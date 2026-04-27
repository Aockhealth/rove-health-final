import { ZapOff, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DISRUPTORS_LIST } from "../constants";

interface DisruptorsCardProps {
  selectedDisruptors: string[];
  setSelectedDisruptors: (disruptors: string[]) => void;
  currentPhase?: string | null;
}

export default function DisruptorsCard({
  selectedDisruptors,
  setSelectedDisruptors,
  currentPhase,
}: DisruptorsCardProps) {
  const toggleItem = (item: string) => {
    if (selectedDisruptors.includes(item)) {
      setSelectedDisruptors(selectedDisruptors.filter((i) => i !== item));
    } else {
      setSelectedDisruptors([...selectedDisruptors, item]);
    }
  };

  // Category color: Disruptors → Warm Amber/Yellow
  const theme = {
    border: "border-[#D4A82A]/30",
    shadow: "shadow-[#D4A82A]/5",
    iconBg: "bg-[#D4A82A]/10",
    iconColor: "text-[#D4A82A]",
    active: "bg-[#D4A82A] text-white border-[#D4A82A] shadow-md",
    inactive: "bg-white text-gray-600 border-[#D4A82A]/20 hover:bg-[#D4A82A]/5"
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
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            theme.iconBg
          )}
        >
          <ZapOff className={cn("w-4 h-4", theme.iconColor)} />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Disruptors</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {DISRUPTORS_LIST.map((item) => {
          const isActive = selectedDisruptors.includes(item.label);
          return (
            <button
              key={item.label}
              onClick={() => toggleItem(item.label)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                isActive
                  ? item.type === "negative"
                    ? "bg-red-100 text-red-800 border-red-300 shadow-sm"
                    : "bg-orange-100 text-orange-800 border-orange-300 shadow-sm"
                  : theme.inactive
              )}
            >
              {isActive && <Check className="w-3 h-3 inline mr-1" />}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}