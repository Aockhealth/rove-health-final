import { Zap, Check, Activity, Smile, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickPhaseLogProps {
  currentPhase?: string | null;
  // State updaters
  selectedSymptoms: string[];
  setSelectedSymptoms: (s: string[]) => void;
  selectedMoods: string[];
  setSelectedMoods: (s: string[]) => void;
  selectedSexActivity: string[];
  setSelectedSexActivity: (s: string[]) => void;
  selectedDisruptors: string[];
  setSelectedDisruptors: (s: string[]) => void;
}

type SuggestionType = "symptom" | "mood" | "sex" | "disruptor";

interface Suggestion {
  label: string;
  type: SuggestionType;
}

const PHASE_SUGGESTIONS: Record<string, Suggestion[]> = {
  Menstrual: [
    { label: "Cramps", type: "symptom" },
    { label: "Fatigue", type: "symptom" },
    { label: "Low mood", type: "mood" },
    { label: "Painkillers", type: "disruptor" }
  ],
  Follicular: [
    { label: "Energetic", type: "mood" },
    { label: "Calm", type: "mood" }
  ],
  Ovulatory: [
    { label: "High sex drive", type: "sex" },
    { label: "Energetic", type: "mood" },
    { label: "Breast Pain", type: "symptom" }
  ],
  Luteal: [
    { label: "Bloating", type: "symptom" },
    { label: "Acne", type: "symptom" },
    { label: "Irritable", type: "mood" },
    { label: "High sugar", type: "disruptor" }
  ]
};

export default function QuickPhaseLog({
  currentPhase,
  selectedSymptoms,
  setSelectedSymptoms,
  selectedMoods,
  setSelectedMoods,
  selectedSexActivity,
  setSelectedSexActivity,
  selectedDisruptors,
  setSelectedDisruptors,
}: QuickPhaseLogProps) {
  if (!currentPhase) return null;

  const suggestions = PHASE_SUGGESTIONS[currentPhase] || [];

  if (suggestions.length === 0) return null;

  const handleToggle = (suggestion: Suggestion) => {
    if (suggestion.type === "symptom") {
      if (selectedSymptoms.includes(suggestion.label)) {
        setSelectedSymptoms(selectedSymptoms.filter((i) => i !== suggestion.label));
      } else {
        setSelectedSymptoms([...selectedSymptoms, suggestion.label]);
      }
    } else if (suggestion.type === "mood") {
      if (selectedMoods.includes(suggestion.label)) {
        setSelectedMoods(selectedMoods.filter((i) => i !== suggestion.label));
      } else {
        setSelectedMoods([...selectedMoods, suggestion.label]);
      }
    } else if (suggestion.type === "sex") {
      if (selectedSexActivity.includes(suggestion.label)) {
        setSelectedSexActivity(selectedSexActivity.filter((i) => i !== suggestion.label));
      } else {
        setSelectedSexActivity([...selectedSexActivity, suggestion.label]);
      }
    } else if (suggestion.type === "disruptor") {
      if (selectedDisruptors.includes(suggestion.label)) {
        setSelectedDisruptors(selectedDisruptors.filter((i) => i !== suggestion.label));
      } else {
        setSelectedDisruptors([...selectedDisruptors, suggestion.label]);
      }
    }
  };

  const isSelected = (suggestion: Suggestion) => {
    if (suggestion.type === "symptom") return selectedSymptoms.includes(suggestion.label);
    if (suggestion.type === "mood") return selectedMoods.includes(suggestion.label);
    if (suggestion.type === "sex") return selectedSexActivity.includes(suggestion.label);
    if (suggestion.type === "disruptor") return selectedDisruptors.includes(suggestion.label);
    return false;
  };

  const getIconForType = (type: SuggestionType, active: boolean) => {
    if (active) return <Check className="w-3.5 h-3.5 text-white" />;
    switch(type) {
        case "symptom": return <Activity className="w-3.5 h-3.5 text-[#E07B7B]" />;
        case "mood": return <Smile className="w-3.5 h-3.5 text-[#B07FC0]" />;
        case "sex": return <Heart className="w-3.5 h-3.5 text-[#E8924E]" />;
        case "disruptor": return <Zap className="w-3.5 h-3.5 text-[#D4A25F]" />;
    }
  };

  const getThemeClass = (type: SuggestionType, active: boolean) => {
    if (active) return "bg-[#2D2420] text-white border-[#2D2420] shadow-md";
    switch(type) {
        case "symptom": return "bg-white text-gray-700 border-[#E07B7B]/30 hover:bg-[#E07B7B]/10 hover:border-[#E07B7B]/50";
        case "mood": return "bg-white text-gray-700 border-[#B07FC0]/30 hover:bg-[#B07FC0]/10 hover:border-[#B07FC0]/50";
        case "sex": return "bg-white text-gray-700 border-[#E8924E]/30 hover:bg-[#E8924E]/10 hover:border-[#E8924E]/50";
        case "disruptor": return "bg-white text-gray-700 border-[#D4A25F]/30 hover:bg-[#D4A25F]/10 hover:border-[#D4A25F]/50";
    }
  };

  // Determine dynamic accent color based on phase
  let accentColor = "text-[#D4A25F]";
  let accentBg = "bg-[#D4A25F]/20";
  if (currentPhase === "Menstrual") {
    accentColor = "text-[#AF6B6B]";
    accentBg = "bg-[#AF6B6B]/20";
  } else if (currentPhase === "Follicular") {
    accentColor = "text-[#8DAA9D]";
    accentBg = "bg-[#8DAA9D]/20";
  } else if (currentPhase === "Ovulatory") {
    accentColor = "text-[#D4A25F]";
    accentBg = "bg-[#D4A25F]/20";
  } else if (currentPhase === "Luteal") {
    accentColor = "text-[#7B82A8]";
    accentBg = "bg-[#7B82A8]/20";
  }

  return (
    <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 shadow-xl border border-white/60 mb-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center shadow-sm", accentBg)}>
          <Zap className={cn("w-4 h-4", accentColor)} />
        </div>
        <div>
            <h3 className="text-sm font-heading font-bold text-gray-900 tracking-wide">
            {currentPhase} Patterns
            </h3>
            <p className="text-[10px] text-gray-500 font-medium">Quick log common symptoms</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2.5">
        {suggestions.map((suggestion) => {
          const active = isSelected(suggestion);
          return (
            <button
              key={suggestion.label}
              onClick={() => handleToggle(suggestion)}
              className={cn(
                "pl-2.5 pr-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-2 border shadow-sm",
                getThemeClass(suggestion.type, active)
              )}
            >
              {getIconForType(suggestion.type, active)}
              {suggestion.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
