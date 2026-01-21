import { Smile, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodsCardProps {
  selectedMoods: string[];
  setSelectedMoods: (moods: string[]) => void;
}

const moodsList = [
  { label: "Energetic", type: "blue" },
  { label: "Calm", type: "blue" },
  { label: "Anxious", type: "orange" },
  { label: "Unfocused", type: "orange" },
  { label: "Irritable", type: "negative" },
  { label: "Low mood", type: "negative" },
  { label: "Overwhelmed", type: "negative" },
];

export default function MoodsCard({ selectedMoods, setSelectedMoods }: MoodsCardProps) {
  const toggleItem = (item: string) => {
    if (selectedMoods.includes(item)) {
      setSelectedMoods(selectedMoods.filter((i) => i !== item));
    } else {
      setSelectedMoods([...selectedMoods, item]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{
            y: [0, -2, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
        >
          <Smile className="w-4 h-4 text-rose-500" />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Moods</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {moodsList.map((m) => {
          const isActive = selectedMoods.includes(m.label);

          let activeClass = "";
          let inactiveClass = "";

          switch (m.type) {
            case "positive":
              activeClass = "bg-green-100 text-green-800 border-green-300 shadow-sm";
              inactiveClass =
                "bg-white text-gray-600 border-green-100 ring-1 ring-green-50 hover:bg-green-50/50";
              break;
            case "blue":
              activeClass = "bg-blue-100 text-blue-800 border-blue-300 shadow-sm";
              inactiveClass =
                "bg-white text-gray-600 border-blue-100 ring-1 ring-blue-50 hover:bg-blue-50/50";
              break;
            case "orange":
              activeClass = "bg-orange-100 text-orange-800 border-orange-300 shadow-sm";
              inactiveClass =
                "bg-white text-gray-600 border-orange-100 ring-1 ring-orange-50 hover:bg-orange-50/50";
              break;
            case "negative":
              activeClass = "bg-red-100 text-red-800 border-red-300 shadow-sm";
              inactiveClass =
                "bg-white text-gray-600 border-red-100 ring-1 ring-red-50 hover:bg-red-50/50";
              break;
            default:
              activeClass = "bg-gray-200 text-gray-900";
              inactiveClass = "bg-white text-gray-600 border-gray-100";
          }

          return (
            <button
              key={m.label}
              onClick={() => toggleItem(m.label)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                isActive ? activeClass : inactiveClass
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