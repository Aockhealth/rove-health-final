import { Calendar, Edit2 } from "lucide-react";

interface HeaderProps {
  onEditClick: () => void;
}

export default function Header({ onEditClick }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 pt-safe">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-phase-menstrual/20 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-phase-menstrual" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Tracker</h1>
            <p className="text-xs text-gray-500">Log your daily rhythm</p>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}