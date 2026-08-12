export default function Loading() {
    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-paper px-6">
        <div className="relative w-40 sm:w-48 h-16 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
          <img 
            src="/images/rove_logo_final.png" 
            alt="Rove Health" 
            className="w-full h-full object-contain" 
          />
        </div>
        
        <p className="mt-6 text-sm font-medium text-obsidian/70 tracking-wide text-center opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
          Aligning your cycle, one phase at a time...
        </p>

        <div className="absolute bottom-12 opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards] flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-obsidian/12 border-t-obsidian/70 rounded-full animate-spin"></div>
        </div>
      </div>
    );
}
