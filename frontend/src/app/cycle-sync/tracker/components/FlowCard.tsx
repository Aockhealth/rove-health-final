import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowCardProps {
  flowIntensity: string | null;
  setFlowIntensity: (intensity: string | null) => void;
}

const flowOptions = ["Spotting", "Low", "Normal", "High", "Heavy"];

export default function FlowCard({ flowIntensity, setFlowIntensity }: FlowCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
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
                "px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                isActive
                  ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-transparent shadow-md shadow-rose-200"
                  : "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30"
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