import { Waves, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Consistency = "Tacky" | "Creamy" | "Stretchy" | "Bloody";
export type Appearance = "White/Yellow" | "Clear" | "Red";
export type Sensation = "Dry" | "Moist" | "Wet" | "Lubricative";

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
    getRelevantPeriodStart: (date: Date) => string | null;
}

const consistencyOptions = [
    {
        label: "Tacky" as Consistency,
        desc: "Sticky, glue-like",
        type: "video",
        src: "/images/gifs/tacky.mp4",
    },
    {
        label: "Creamy" as Consistency,
        desc: "Lotion-like, smooth",
        type: "video",
        src: "/images/gifs/creamy.mp4",
    },
    {
        label: "Stretchy" as Consistency,
        desc: "Raw egg white, elastic",
        type: "video",
        src: "/images/gifs/stretchy.mp4",
    },
    {
        label: "Bloody" as Consistency,
        desc: "Red/brown tint",
        type: "video",
        src: "/images/gifs/bloody.mp4",
    },
];

const appearanceOptions = [
    {
        label: "White/Yellow" as Appearance,
        type: "image",
        src: "/images/gifs/white yellow appearance.jpeg",
    },
    {
        label: "Clear" as Appearance,
        type: "image",
        src: "/images/gifs/clear appearance.jpeg",
    },
    {
        label: "Red" as Appearance,
        type: "image",
        src: "/images/gifs/red appearance.jpeg",
    },
];

const sensationOptions = [
    {
        label: "Dry" as Sensation,
        desc: "No moisture felt",
    },
    {
        label: "Moist" as Sensation,
        desc: "Slightly damp",
    },
    {
        label: "Wet" as Sensation,
        desc: "Noticeably wet",
    },
    {
        label: "Lubricative" as Sensation,
        desc: "Slippery feeling",
    },
];

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
    getRelevantPeriodStart,
}: DischargeCardProps) {
    const waveProgress =
        ((mpiqConsistency ? 25 : 0) +
            (mpiqAppearance ? 25 : 0) +
            (mpiqSensation ? 25 : 0) +
            25) *
        1;

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-100/20 border border-blue-100 transition-all duration-300",
                isDischargeExpanded ? "p-0" : "p-0"
            )}
        >
            {!isDischargeExpanded ? (
                <button
                    onClick={() => setIsDischargeExpanded(true)}
                    className="w-full p-5 flex items-center justify-between group hover:bg-white/40 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Waves className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-heading font-semibold text-gray-900">Discharge</h3>
                            <p className="text-xs text-gray-500">
                                Please fill out 3 questions for accurate phase prediction
                            </p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                </button>
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
                                    <h3 className="text-lg font-heading font-semibold text-gray-900">Cervical Discharge</h3>
                                    <p className="text-xs text-gray-500">Answer 4 questions to track fertility</p>
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

                        <div className="space-y-6">
                            {/* Q1: Last Period Date */}
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-heading font-medium text-gray-700">
                                        1. First day of last period?
                                    </p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={getRelevantPeriodStart(selectedDate) || ""}
                                        disabled
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                                    />
                                    <div className="absolute inset-y-0 right-2 flex items-center">
                                        <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
                                            From Calendar
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Q2: Consistency */}
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                <p className="text-sm font-heading font-medium text-gray-700 mb-3">
                                    2. Consistency of discharge?
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {consistencyOptions.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setMpiqConsistency(opt.label)}
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

                            {/* Q3: Appearance */}
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                <p className="text-sm font-heading font-medium text-gray-700 mb-3">
                                    3. Appearance of discharge?
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {appearanceOptions.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setMpiqAppearance(opt.label)}
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

                            {/* Q4: Sensation */}
                            <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                <p className="text-sm font-heading font-medium text-gray-700 mb-3">4. Vaginal sensation?</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {sensationOptions.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setMpiqSensation(opt.label)}
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