import { Moon, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SleepCardProps {
  selectedSleepQuality: string[];
  setSelectedSleepQuality: (quality: string[]) => void;
  sleepHours: string;
  setSleepHours: (hours: string) => void;
  sleepMinutes: string;
  setSleepMinutes: (minutes: string) => void;
}

const sleepOptions = [
  { label: "Restful", type: "positive" },
  { label: "Light/Broken", type: "negative" },
  { label: "Vivid dreams", type: "orange" },
  { label: "Insomnia", type: "negative" },
  { label: "Night sweats", type: "negative" },
];

export default function SleepCard({
  selectedSleepQuality,
  setSelectedSleepQuality,
  sleepHours,
  setSleepHours,
  sleepMinutes,
  setSleepMinutes,
}: SleepCardProps) {
  const toggleItem = (item: string) => {
    if (selectedSleepQuality.includes(item)) {
      setSelectedSleepQuality(selectedSleepQuality.filter((i) => i !== item));
    } else {
      setSelectedSleepQuality([...selectedSleepQuality, item]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-indigo-100/20 border border-indigo-100">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{
            y: [0, -3, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"
        >
          <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500" />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Sleep Log</h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {sleepOptions.map((m) => {
            const isActive = selectedSleepQuality.includes(m.label);
            return (
              <button
                key={m.label}
                onClick={() => toggleItem(m.label)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border-2",
                  isActive
                    ? m.type === "positive"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : m.type === "negative"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-orange-100 text-orange-800 border-orange-300"
                    : "bg-white border-indigo-50 text-gray-600 hover:border-indigo-100"
                )}
              >
                {isActive && <Check className="w-3 h-3 inline mr-1" />}
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-indigo-100/50">
          <Clock className="w-5 h-5 text-indigo-400" />
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">Hours</span>
              <input
                type="number"
                placeholder="0"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
              />
            </div>
            <span className="text-xl font-mono font-bold text-gray-300">:</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">Mins</span>
              <input
                type="number"
                placeholder="00"
                value={sleepMinutes}
                onChange={(e) => setSleepMinutes(e.target.value)}
                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
              />
            </div>
          </div>
          <div className="ml-auto text-xs font-medium text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg">
            TOTAL DURATION
          </div>
        </div>
      </div>
    </div>
  );
}