interface SaveButtonProps {
  onClick: () => void;
  isPending: boolean;
  isFutureDate: boolean;
}

export default function SaveButton({ onClick, isPending, isFutureDate }: SaveButtonProps) {
  return (
    <div className="pt-4">
      <button
        onClick={onClick}
        disabled={isPending || isFutureDate}
        className="w-full py-4 bg-gradient-to-r from-phase-menstrual to-phase-menstrual/90 text-white text-base font-semibold rounded-full hover:from-phase-menstrual/90 hover:to-phase-menstrual disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-phase-menstrual/20 hover:shadow-xl hover:shadow-phase-menstrual/30"
      >
        {isPending ? "Saving..." : "Save Log"}
      </button>
    </div>
  );
}