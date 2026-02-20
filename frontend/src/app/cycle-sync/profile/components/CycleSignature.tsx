import { Zap, Clock, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface CycleSignatureProps {
    cycleLength: number;
    periodLength: number;
    isIrregular: boolean;
    phaseName: string; // "Menstrual", "Follicular", etc.
    theme: any;
}

export function CycleSignature({ cycleLength, periodLength, isIrregular, phaseName, theme }: CycleSignatureProps) {
    // Determine "Signature" type based on stats (Simple logic for now)
    const getSignatureType = () => {
        if (isIrregular) return { label: "Adaptive Flow", icon: Activity, desc: "Variable rhythm" };
        if (cycleLength < 26) return { label: "Rapid Cycle", icon: Zap, desc: "Fast metabolism" };
        if (cycleLength > 32) return { label: "Extended Rhythm", icon: Clock, desc: "Slower pace" };
        return { label: "Classic Rhythm", icon: Activity, desc: "Steady balance" };
    };

    const signature = getSignatureType();
    const SignatureIcon = signature.icon;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-md border border-white/50 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-heading text-lg text-stone-800 flex items-center gap-2">
                        <SignatureIcon className={cn("w-5 h-5", theme.accent)} />
                        Cycle Signature
                    </h3>
                    <p className="text-xs text-stone-500 font-medium mt-1">Your unique biological pattern</p>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", theme.badge)}>
                    {signature.label}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Visual Representation */}
                <div className="col-span-2 relative h-16 bg-white/40 rounded-xl border border-white/50 overflow-hidden flex items-center px-4">
                    {/* Simplified Wave Visualization */}
                    <div className="absolute inset-0 opacity-20 flex items-center">
                        <svg viewBox="0 0 100 20" className="w-full h-full preserve-3d">
                            <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="2" className={theme.accent} />
                        </svg>
                    </div>

                    <div className="relative z-10 grid grid-cols-4 w-full text-center">
                        <div className="flex flex-col items-center">
                            <span className="w-2 h-2 rounded-full bg-rose-400 mb-1" />
                            <span className="text-[9px] text-stone-400 uppercase">Men</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="w-2 h-2 rounded-full bg-teal-400 mb-1" />
                            <span className="text-[9px] text-stone-400 uppercase">Fol</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mb-1" />
                            <span className="text-[9px] text-stone-400 uppercase">Ovu</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 mb-1" />
                            <span className="text-[9px] text-stone-400 uppercase">Lut</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <div className="flex-1 bg-white/60 rounded-xl p-3 border border-white/50 text-center">
                    <span className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Total Cycle</span>
                    <span className="font-heading text-lg text-stone-700">{cycleLength} Days</span>
                </div>
                <div className="flex-1 bg-white/60 rounded-xl p-3 border border-white/50 text-center">
                    <span className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Bleed</span>
                    <span className="font-heading text-lg text-stone-700">{periodLength} Days</span>
                </div>
            </div>
        </div>
    );
}
