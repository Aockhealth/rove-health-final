import { PenLine } from "lucide-react";
import { motion } from "framer-motion";

interface NoteCardProps {
  note: string;
  setNote: (note: string) => void;
}

export default function NoteCard({ note, setNote }: NoteCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{
            x: [0, 2, -2, 0],
            y: [0, -2, 2, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
        >
          <PenLine className="w-4 h-4 text-rose-500" />
        </motion.div>
        <h3 className="text-base font-heading font-semibold text-gray-900">Note</h3>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="How are you feeling today?"
        className="w-full bg-white/50 border border-rose-100 rounded-2xl p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent transition-all resize-none h-32"
      />
      <div className="mt-2 text-xs text-gray-400 text-right">{note.length} characters</div>
    </div>
  );
}