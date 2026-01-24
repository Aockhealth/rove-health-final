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
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-base font-semibold rounded-full hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300"
      >
        {isPending ? "Saving..." : "Save Log"}
      </button>
    </div>
  );
}