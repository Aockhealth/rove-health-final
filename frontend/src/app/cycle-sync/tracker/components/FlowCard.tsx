import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowCardProps {
  flowIntensity: string | null;
  setFlowIntensity: (intensity: string | null) => void;
}

const flowOptions = ["Spotting", "Low", "Normal", "High", "Heavy"];

export default function FlowCard({ flowIntensity, setFlowIntensity }: FlowCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-rose-100 shadow-rose-100/20">
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="w-5 h-5 text-rose-500" />
        <h3 className="text-base font-heading font-semibold text-gray-900">Flow</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {flowOptions.map((f) => {
          const isActive = flowIntensity === f;
          return (
            <button
              key={f}
              onClick={() => setFlowIntensity(isActive ? null : f)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border-2",
                isActive
                  ? "bg-rose-100 text-rose-800 border-rose-300 shadow-sm"
                  : "bg-white text-gray-600 border-rose-100 ring-1 ring-rose-50/50 hover:bg-rose-50/50"
              )}
            >
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}