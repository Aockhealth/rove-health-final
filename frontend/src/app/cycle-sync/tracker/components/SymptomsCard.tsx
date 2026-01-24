import { Activity, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SymptomsCardProps {
  selectedSymptoms: string[];
  setSelectedSymptoms: (symptoms: string[]) => void;
}

const symptomOptions = [
  { label: "Headache", type: "orange" },
  { label: "Cramps", type: "negative" },
  { label: "Bloating", type: "orange" },
  { label: "Acne", type: "orange" },
  { label: "Backache", type: "negative" },
  { label: "Fatigue", type: "blue" },
  { label: "Breast Pain", type: "negative" },
  { label: "Nausea", type: "orange" },
];

export default function SymptomsCard({
  selectedSymptoms,
  setSelectedSymptoms,
}: SymptomsCardProps) {
  const toggleItem = (item: string) => {
    if (selectedSymptoms.includes(item)) {
      setSelectedSymptoms(selectedSymptoms.filter((i) => i !== item));
    } else {
      setSelectedSymptoms([...selectedSymptoms, item]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
        >
          <Activity className="w-4 h-4 text-rose-500" />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Symptoms</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {symptomOptions.map((s) => {
          const isActive = selectedSymptoms.includes(s.label);

          let activeClass = "";
          let inactiveClass = "";

          switch (s.type) {
            case "blue":
              activeClass = "bg-blue-100 text-blue-800 border-blue-300 shadow-sm";
              inactiveClass = "bg-white text-gray-600 border-blue-100 ring-1 ring-blue-50 hover:bg-blue-50/50";
              break;
            case "orange":
              activeClass = "bg-orange-100 text-orange-800 border-orange-300 shadow-sm";
              inactiveClass = "bg-white text-gray-600 border-orange-100 ring-1 ring-orange-50 hover:bg-orange-50/50";
              break;
            case "negative":
              activeClass = "bg-red-100 text-red-800 border-red-300 shadow-sm";
              inactiveClass = "bg-white text-gray-600 border-red-100 ring-1 ring-red-50 hover:bg-red-50/50";
              break;
            default:
              activeClass = "bg-gray-200 text-gray-900";
              inactiveClass = "bg-white text-gray-600 border-gray-100";
          }

          return (
            <button
              key={s.label}
              onClick={() => toggleItem(s.label)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                isActive ? activeClass : inactiveClass
              )}
            >
              {isActive && <Check className="w-3 h-3" />}
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}