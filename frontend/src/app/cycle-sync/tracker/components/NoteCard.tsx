import { PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: string;
  setNote: (note: string) => void;
  currentPhase?: string | null;
}

export default function NoteCard({ note, setNote, currentPhase }: NoteCardProps) {
  // Organic Chromatics Styling
  const phase = currentPhase || "Menstrual";

  const themes: Record<string, any> = {
    "Menstrual": {
      border: "border-phase-menstrual/30",
      shadow: "shadow-phase-menstrual/5",
      iconBg: "bg-phase-menstrual/10",
      iconColor: "text-phase-menstrual",
      inputBorder: "border-phase-menstrual/20 focus:ring-phase-menstrual/30"
    },
    "Follicular": {
      border: "border-phase-follicular/30",
      shadow: "shadow-phase-follicular/5",
      iconBg: "bg-phase-follicular/10",
      iconColor: "text-phase-follicular",
      inputBorder: "border-phase-follicular/20 focus:ring-phase-follicular/30"
    },
    "Ovulatory": {
      border: "border-phase-ovulatory/30",
      shadow: "shadow-phase-ovulatory/5",
      iconBg: "bg-phase-ovulatory/10",
      iconColor: "text-phase-ovulatory",
      inputBorder: "border-phase-ovulatory/20 focus:ring-phase-ovulatory/30"
    },
    "Luteal": {
      border: "border-phase-luteal/30",
      shadow: "shadow-phase-luteal/5",
      iconBg: "bg-phase-luteal/10",
      iconColor: "text-phase-luteal",
      inputBorder: "border-phase-luteal/20 focus:ring-phase-luteal/30"
    }
  };

  const theme = themes[phase] || themes["Menstrual"];

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border transition-all",
      theme.border,
      theme.shadow
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
            theme.iconBg
          )}
        >
          <PenLine className={cn("w-4 h-4", theme.iconColor)} />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Note</h3>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="How are you feeling today?"
        className={cn(
          "w-full bg-white/50 border rounded-2xl p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all resize-none h-32",
          theme.inputBorder
        )}
      />
      <div className="mt-2 text-xs text-gray-400 text-right">{note.length} characters</div>
    </div>
  );
}