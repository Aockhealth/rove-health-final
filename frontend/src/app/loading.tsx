export default function Loading() {
    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#FAF9F6] px-6">
        <div className="relative w-28 h-28 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
          <img 
            src="/images/rove_logo_updated.png" 
            alt="Rove Health" 
            className="w-full h-full object-contain" 
          />
        </div>
        
        <p className="mt-6 text-sm font-medium text-rove-stone/70 tracking-wide text-center opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
          Aligning your cycle, one phase at a time...
        </p>

        <div className="absolute bottom-12 opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards] flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-rove-stone/20 border-t-rove-stone/80 rounded-full animate-spin"></div>
        </div>
      </div>
    );
}
