import { Heart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelfLoveCardProps {
  selectedSelfLove: string[];
  setSelectedSelfLove: (selfLove: string[]) => void;
  selfLoveOther: string;
  setSelfLoveOther: (other: string) => void;
}

const selfLoveOptions = ["Travel", "Meditation", "Journal", "Hobbies"];

export default function SelfLoveCard({
  selectedSelfLove,
  setSelectedSelfLove,
  selfLoveOther,
  setSelfLoveOther,
}: SelfLoveCardProps) {
  const toggleItem = (item: string) => {
    if (selectedSelfLove.includes(item)) {
      setSelectedSelfLove(selectedSelfLove.filter((i) => i !== item));
    } else {
      setSelectedSelfLove([...selectedSelfLove, item]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-pink-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-pink-100/20 border border-pink-100">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center"
        >
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Self Love Log</h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {selfLoveOptions.map((option) => {
            const isActive = selectedSelfLove.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleItem(option)}
                className={cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                  isActive
                    ? "bg-pink-100 text-pink-800 border-pink-300 shadow-sm"
                    : "bg-white border-pink-100/50 text-gray-600 hover:border-pink-200 hover:bg-pink-50/30"
                )}
              >
                {isActive && <Check className="w-3.5 h-3.5" />}
                {option}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Others (log here)..."
          value={selfLoveOther}
          onChange={(e) => setSelfLoveOther(e.target.value)}
          className="w-full bg-white/60 border border-pink-100/50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all shadow-sm"
        />
      </div>
    </div>
  );
}