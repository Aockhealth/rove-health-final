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

    // Category color: Discharge → Soft Blue
    const theme = {
        border: "border-[#7CB9E8]/30",
        shadow: "shadow-[#7CB9E8]/5",
        iconBg: "bg-[#7CB9E8]/10",
        iconColor: "text-[#7CB9E8]",
        active: "bg-[#7CB9E8]/10 border-[#7CB9E8]/40 shadow-sm",
        inactive: "bg-white border-gray-100 hover:bg-[#7CB9E8]/5",
        waveFrom: "from-[#7CB9E8]/30",
        waveTo: "to-[#7CB9E8]"
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] shadow-xl transition-all duration-300 border",
                theme.border,
                theme.shadow
            )}
        >
            {!isDischargeExpanded ? (
                <div className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between group transition-colors relative">
                    {/* Main expansion click area - using a button that covers most of the card */}
                    <button
                        onClick={() => setIsDischargeExpanded(true)}
                        className="absolute inset-0 z-10 w-full h-full pointer-events-auto"
                        aria-label="Expand Discharge"
                    />

                    <div className="flex items-start sm:items-center gap-3 flex-grow text-left relative z-20 pointer-events-none min-w-0">
                        <div className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0",
                            theme.iconBg
                        )}>
                            <Waves className={cn("w-4 h-4 sm:w-5 sm:h-5", theme.iconColor)} />
                        </div>
                        <div className="min-w-0">
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
                                    className="text-gray-400 hover:text-gray-600 transition-colors relative z-30 pointer-events-auto"
                                >
                                    <Info className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 pointer-events-auto cursor-pointer" onClick={() => setIsDischargeExpanded(true)}>
                                Please fill out 3 questions for accurate phase prediction
                            </p>
                        </div>
                    </div>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center relative z-20 pointer-events-none transition-colors shrink-0", theme.iconBg)}>
                        <ChevronRight className={cn("w-4 h-4 transition-colors", theme.iconColor)} />
                    </div>
                </div>
            ) : (
                <>
                    {/* Wave Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-gray-100/50 z-0">
                        <motion.div
                            className={cn("h-full bg-gradient-to-r", theme.waveFrom, theme.waveTo)}
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

                    <div className="p-4 sm:p-6 pt-7 sm:pt-8 relative z-10">
                        <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0", theme.iconBg)}>
                                    <Waves className={cn("w-4 h-4 sm:w-5 sm:h-5", theme.iconColor)} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">Cervical Discharge</h3>
                                        <button
                                            onClick={() => setShowInfo(!showInfo)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Answer 3 questions for accurate phase prediction</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDischargeExpanded(false)}
                                className={cn("p-2 rounded-full transition-colors", theme.iconBg, theme.iconColor)}
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
                                    <div className={cn("border rounded-2xl p-3 sm:p-4 relative", theme.iconBg, theme.border)}>
                                        <button
                                            onClick={() => setShowInfo(false)}
                                            className={cn("absolute top-2 right-2", theme.iconColor)}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <p className={cn("text-xs leading-relaxed pr-4", theme.iconColor)}>
                                            This questionnaire (MPIQ) helps predict your cycle phase with <strong>more than 95% accuracy</strong> by analyzing your body's biological markers.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4 sm:space-y-6">
                            {/* Q1: Consistency */}
                            <div className="bg-white/60 rounded-2xl p-3 sm:p-4 border border-white/50">
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
                                                "relative flex flex-col items-center p-2.5 sm:p-3 rounded-xl border text-center transition-all",
                                                mpiqConsistency === opt.label ? theme.active : theme.inactive
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
                            <div className="bg-white/60 rounded-2xl p-3 sm:p-4 border border-white/50">
                                <div className="mb-3">
                                    <p className="text-sm font-heading font-bold text-gray-800">
                                        2. How does it look?
                                    </p>
                                    <p className="text-[11px] text-gray-500 leading-tight">
                                        Observe the color and clarity of your cervical fluid.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {APPEARANCE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setMpiqAppearance(opt.label as Appearance)}
                                            className={cn(
                                                "relative flex flex-col items-center p-2.5 sm:p-3 rounded-xl border text-center transition-all",
                                                mpiqAppearance === opt.label ? theme.active : theme.inactive
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
                            <div className="bg-white/60 rounded-2xl p-3 sm:p-4 border border-white/50">
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
                                                "relative flex flex-col items-center p-2.5 sm:p-3 rounded-xl border text-center transition-all",
                                                mpiqSensation === opt.label ? theme.active : theme.inactive
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
