import { ZapOff, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DisruptorsCardProps {
  selectedDisruptors: string[];
  setSelectedDisruptors: (disruptors: string[]) => void;
}

const disruptorsList = [
  { label: "Alcohol", type: "negative" },
  { label: "Caffeine overload", type: "orange" },
  { label: "High sugar", type: "orange" },
  { label: "Travel/Jet lag", type: "orange" },
  { label: "Illness", type: "negative" },
  { label: "High stress event", type: "negative" },
  { label: "Painkillers", type: "orange" },
  { label: "Contraceptive", type: "orange" },
];

export default function DisruptorsCard({
  selectedDisruptors,
  setSelectedDisruptors,
}: DisruptorsCardProps) {
  const toggleItem = (item: string) => {
    if (selectedDisruptors.includes(item)) {
      setSelectedDisruptors(selectedDisruptors.filter((i) => i !== item));
    } else {
      setSelectedDisruptors([...selectedDisruptors, item]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-orange-100/20 border border-orange-100">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
        >
          <ZapOff className="w-4 h-4 text-orange-500" />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Disruptors</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {disruptorsList.map((item) => {
          const isActive = selectedDisruptors.includes(item.label);
          return (
            <button
              key={item.label}
              onClick={() => toggleItem(item.label)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border-2",
                isActive
                  ? item.type === "negative"
                    ? "bg-red-100 text-red-800 border-red-300 shadow-sm"
                    : "bg-orange-100 text-orange-800 border-orange-300 shadow-sm"
                  : "bg-white border-orange-100/50 text-gray-600 hover:border-orange-200"
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