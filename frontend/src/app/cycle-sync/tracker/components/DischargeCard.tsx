import { Waves, ChevronRight, Info, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONSISTENCY_OPTIONS, APPEARANCE_OPTIONS, SENSATION_OPTIONS } from "../constants";

export type Consistency = "Tacky" | "Creamy" | "Stretchy" | "Bloody";
export type Appearance = "White/Yellow" | "Clear" | "Red";
export type Sensation = "Dry" | "Moist" | "Wet" | "Slippery";

interface DischargeCardProps {
    isDischargeExpanded: boolean;
    setIsDischargeExpanded: (expanded: boolean) => void;
    mpiqConsistency: Consistency | null;
    setMpiqConsistency: (consistency: Consistency | null) => void;
    mpiqAppearance: Appearance | null;
    setMpiqAppearance: (appearance: Appearance | null) => void;
    mpiqSensation: Sensation | null;
    setMpiqSensation: (sensation: Sensation | null) => void;
    selectedDate: Date;
    currentPhase?: string | null;
}

// Local options removed in favor of constants.ts

export default function DischargeCard({
    isDischargeExpanded,
    setIsDischargeExpanded,
    mpiqConsistency,
    setMpiqConsistency,
    mpiqAppearance,
    setMpiqAppearance,
    mpiqSensation,
    setMpiqSensation,
    selectedDate,
    currentPhase,
}: DischargeCardProps) {
    const [showInfo, setShowInfo] = useState(false);
    const waveProgress =
        ((mpiqConsistency ? 33.3 : 0) +
            (mpiqAppearance ? 33.3 : 0) +
            (mpiqSensation ? 33.3 : 0)) *
        1;

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
        <div
            className={cn(
                "relative overflow-hidden bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl rounded-[2rem] shadow-xl transition-all duration-300 border-2",
                phaseColor === "rose" ? "border-rose-100 shadow-rose-100/20" :
                    phaseColor === "teal" ? "border-teal-100 shadow-teal-100/20" :
                        phaseColor === "amber" ? "border-amber-100 shadow-amber-100/20" :
                            "border-indigo-100 shadow-indigo-100/20"
            )}
        >
            {!isDischargeExpanded ? (
                <div className="w-full p-5 flex items-center justify-between group transition-colors relative">
                    {/* Main expansion click area - using a button that covers most of the card */}
                    <button
                        onClick={() => setIsDischargeExpanded(true)}
                        className="absolute inset-0 z-10 w-full h-full pointer-events-auto"
                        aria-label="Expand Discharge"
                    />

                    <div className="flex items-center gap-3 flex-grow text-left relative z-20 pointer-events-none">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform",
                            phaseColor === "rose" ? "bg-rose-100" :
                                phaseColor === "teal" ? "bg-teal-100" :
                                    phaseColor === "amber" ? "bg-amber-100" :
                                        "bg-indigo-100"
                        )}>
                            <Waves className={cn(
                                "w-5 h-5",
                                phaseColor === "rose" ? "text-rose-500" :
                                    phaseColor === "teal" ? "text-teal-500" :
                                        phaseColor === "amber" ? "text-amber-500" :
                                            "text-indigo-500"
                            )} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-heading font-semibold text-gray-900 pointer-events-auto cursor-pointer" onClick={() => setIsDischargeExpanded(true)}>
                                    Discharge
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowInfo(!showInfo);
                                        if (!isDischargeExpanded) setIsDischargeExpanded(true);
                                    }}
                                    className="text-blue-400 hover:text-blue-600 transition-colors relative z-30 pointer-events-auto"
                                >
                                    <Info className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 pointer-events-auto cursor-pointer" onClick={() => setIsDischargeExpanded(true)}>
                                Please fill out 3 questions for accurate phase prediction
                            </p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center relative z-20 pointer-events-none">
                        <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Wave Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-gray-100/50 z-0">
                        <motion.div
                            className="h-full bg-gradient-to-r from-teal-300 via-blue-400 to-indigo-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${waveProgress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                        <svg
                            className="absolute top-0 w-full h-full text-white/30"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 10"
                        >
                            <path d="M0 10 Q 25 0 50 10 T 100 10 V 10 H 0 Z" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="p-6 pt-8 relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Waves className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-heading font-semibold text-gray-900">Cervical Discharge</h3>
                                        <button
                                            onClick={() => setShowInfo(!showInfo)}
                                            className="text-blue-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Answer 3 questions for accurate phase prediction</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDischargeExpanded(false)}
                                className="p-2 hover:bg-blue-50/50 rounded-full transition-colors text-blue-400 hover:text-blue-600"
                            >
                                <div className="sr-only">Collapse</div>
                                <ChevronRight className="w-5 h-5 -rotate-90" />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showInfo && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 overflow-hidden"
                                >
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 relative">
                                        <button
                                            onClick={() => setShowInfo(false)}
                                            className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <p className="text-xs text-blue-800 leading-relaxed pr-4">
                                            This questionnaire (MPIQ) helps predict your cycle phase with <strong>more than 95% accuracy</strong> by analyzing your body's biological markers.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            {/* Q1: Consistency */}
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                <div className="mb-3">
                                    <p className="text-sm font-heading font-bold text-gray-800">
                                        1. Vaginal Fluid
                                    </p>
                                    <p className="text-[11px] text-gray-500 leading-tight">
                                        On touch and feel, what is the consistency of the discharge?
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {CONSISTENCY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setMpiqConsistency(opt.label as Consistency)}
                                            className={cn(
                                                "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                mpiqConsistency === opt.label
                                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                                    : "bg-white border-gray-100 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-2 overflow-hidden shadow-inner">
                                                {opt.type === "video" ? (
                                                    <video
                                                        src={opt.src}
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={opt.src}
                                                        alt={opt.label}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-xs font-heading font-semibold text-gray-800">{opt.label}</span>
                                            <span className="text-[10px] text-gray-400 leading-tight mt-1">
                                                {opt.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q2: Appearance */}
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                <div className="mb-3">
                                    <p className="text-sm font-heading font-bold text-gray-800">
                                        2. How does it look?
                                    </p>
                                    <p className="text-[11px] text-gray-500 leading-tight">
                                        Observe the color and clarity of your cervical fluid.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {APPEARANCE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setMpiqAppearance(opt.label as Appearance)}
                                            className={cn(
                                                "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                mpiqAppearance === opt.label
                                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                                    : "bg-white border-gray-100 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-2 overflow-hidden shadow-inner">
                                                {opt.type === "video" ? (
                                                    <video
                                                        src={opt.src}
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={opt.src}
                                                        alt={opt.label}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-xs font-heading font-semibold text-gray-800">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q3: Sensation */}
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                <div className="mb-3">
                                    <p className="text-sm font-heading font-bold text-gray-800">
                                        3. Vaginal Sensation
                                    </p>
                                    <p className="text-[11px] text-gray-500 leading-tight">
                                        How does it feel down there throughout the day?
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {SENSATION_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setMpiqSensation(opt.label as Sensation)}
                                            className={cn(
                                                "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                mpiqSensation === opt.label
                                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                                    : "bg-white border-gray-100 hover:bg-gray-50"
                                            )}
                                        >
                                            <span className="text-xs font-heading font-semibold text-gray-800">{opt.label}</span>
                                            <span className="text-[10px] text-gray-400 leading-tight mt-1">
                                                {opt.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}