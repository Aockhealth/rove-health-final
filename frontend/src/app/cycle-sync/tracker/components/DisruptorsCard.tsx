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
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            phaseColor === "rose" ? "bg-rose-100" :
              phaseColor === "teal" ? "bg-teal-100" :
                phaseColor === "amber" ? "bg-amber-100" :
                  "bg-indigo-100"
          )}
        >
          <ZapOff className={cn(
            "w-4 h-4",
            phaseColor === "rose" ? "text-rose-500" :
              phaseColor === "teal" ? "text-teal-500" :
                phaseColor === "amber" ? "text-amber-500" :
                  "text-indigo-500"
          )} />
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
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border-2",
                isActive
                  ? item.type === "negative"
                    ? "bg-red-100 text-red-800 border-red-300 shadow-sm"
                    : "bg-orange-100 text-orange-800 border-orange-300 shadow-sm"
                  : phaseColor === "rose" ? "bg-white border-rose-100 text-gray-600 hover:border-rose-200" :
                    phaseColor === "teal" ? "bg-white border-teal-100 text-gray-600 hover:border-teal-200" :
                      phaseColor === "amber" ? "bg-white border-amber-100 text-gray-600 hover:border-amber-200" :
                        "bg-white border-indigo-100 text-gray-600 hover:border-indigo-200"
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