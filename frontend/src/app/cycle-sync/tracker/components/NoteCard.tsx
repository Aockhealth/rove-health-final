import { PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: string;
  setNote: (note: string) => void;
  currentPhase?: string | null;
}

export default function NoteCard({ note, setNote, currentPhase }: NoteCardProps) {
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
            x: [0, 2, -2, 0],
            y: [0, -2, 2, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            phaseColor === "rose" ? "bg-rose-100" :
              phaseColor === "teal" ? "bg-teal-100" :
                phaseColor === "amber" ? "bg-amber-100" :
                  "bg-indigo-100"
          )}
        >
          <PenLine className={cn(
            "w-4 h-4",
            phaseColor === "rose" ? "text-rose-500" :
              phaseColor === "teal" ? "text-teal-500" :
                phaseColor === "amber" ? "text-amber-500" :
                  "text-indigo-500"
          )} />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Note</h3>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="How are you feeling today?"
        className={cn(
          "w-full bg-white/50 border rounded-2xl p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all resize-none h-32",
          phaseColor === "rose" ? "border-rose-100 focus:ring-rose-200" :
            phaseColor === "teal" ? "border-teal-100 focus:ring-teal-200" :
              phaseColor === "amber" ? "border-amber-100 focus:ring-amber-200" :
                "border-indigo-100 focus:ring-indigo-200"
        )}
      />
      <div className="mt-2 text-xs text-gray-400 text-right">{note.length} characters</div>
    </div>
  );
}