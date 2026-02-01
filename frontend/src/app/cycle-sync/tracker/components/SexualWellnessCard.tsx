import { Flame, Check, Shield, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SEX_ACTIVITY_OPTIONS, CONTRACEPTION_OPTIONS } from "../constants";

interface SexualWellnessCardProps {
    selectedSexActivity: string[];
    setSelectedSexActivity: (activity: string[]) => void;
    selectedContraception: string[];
    setSelectedContraception: (contraception: string[]) => void;
    currentPhase?: string | null;
}

export default function SexualWellnessCard({
    selectedSexActivity,
    setSelectedSexActivity,
    selectedContraception,
    setSelectedContraception,
    currentPhase,
}: SexualWellnessCardProps) {
    const toggleActivity = (label: string) => {
        if (selectedSexActivity.includes(label)) {
            setSelectedSexActivity(selectedSexActivity.filter((i) => i !== label));
        } else {
            setSelectedSexActivity([...selectedSexActivity, label]);
        }
    };

    const toggleContraception = (label: string) => {
        if (selectedContraception.includes(label)) {
            setSelectedContraception(selectedContraception.filter((i) => i !== label));
        } else {
            setSelectedContraception([...selectedContraception, label]);
        }
    };

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
        <div className={cn(
            "bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border-2 transition-all space-y-8",
            phaseColor === "rose" ? "border-rose-100 shadow-rose-100/20" :
                phaseColor === "teal" ? "border-teal-100 shadow-teal-100/20" :
                    phaseColor === "amber" ? "border-amber-100 shadow-amber-100/20" :
                        "border-indigo-100 shadow-indigo-100/20"
        )}>
            {/* Header */}
            <div className="flex items-center gap-3">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        phaseColor === "rose" ? "bg-rose-100" :
                            phaseColor === "teal" ? "bg-teal-100" :
                                phaseColor === "amber" ? "bg-amber-100" :
                                    "bg-indigo-100"
                    )}
                >
                    <Flame className={cn(
                        "w-5 h-5 fill-current",
                        phaseColor === "rose" ? "text-rose-500" :
                            phaseColor === "teal" ? "text-teal-500" :
                                phaseColor === "amber" ? "text-amber-500" :
                                    "text-indigo-500"
                    )} />
                </motion.div>
                <div>
                    <h3 className="text-base font-heading font-semibold text-gray-900">Sexual Wellness</h3>
                    <p className="text-xs text-gray-500">Track activity & contraception</p>
                </div>
            </div>

            {/* 1. Sexual Activity */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Heart className={cn(
                        "w-3.5 h-3.5",
                        phaseColor === "rose" ? "text-rose-400" :
                            phaseColor === "teal" ? "text-teal-400" :
                                phaseColor === "amber" ? "text-amber-400" :
                                    "text-indigo-400"
                    )} />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sexual Activity</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SEX_ACTIVITY_OPTIONS.map((m) => {
                        const isActive = selectedSexActivity.includes(m.label);
                        let activeClass = "";
                        let inactiveClass = cn(
                            "bg-white text-gray-600 ring-1 ring-gray-100 hover:bg-gray-50/30",
                            phaseColor === "rose" ? "border-rose-50" :
                                phaseColor === "teal" ? "border-teal-50" :
                                    phaseColor === "amber" ? "border-amber-50" :
                                        "border-indigo-50"
                        );

                        switch (m.type) {
                            case "positive":
                                activeClass = "bg-rose-100 text-rose-800 border-rose-300 shadow-sm";
                                break;
                            case "negative":
                                activeClass = "bg-red-100 text-red-800 border-red-300 shadow-sm";
                                break;
                            default:
                                activeClass = "bg-blue-100 text-blue-800 border-blue-300 shadow-sm";
                        }

                        return (
                            <button
                                key={m.label}
                                onClick={() => toggleActivity(m.label)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border-2",
                                    isActive ? activeClass : inactiveClass
                                )}
                            >
                                {isActive && <Check className="w-3 h-3" />}
                                {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Contraception */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className={cn(
                        "w-3.5 h-3.5",
                        phaseColor === "rose" ? "text-rose-400" :
                            phaseColor === "teal" ? "text-teal-400" :
                                phaseColor === "amber" ? "text-amber-400" :
                                    "text-blue-400"
                    )} />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contraception & Protection</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {CONTRACEPTION_OPTIONS.map((label) => {
                        const isActive = selectedContraception.includes(label);
                        return (
                            <button
                                key={label}
                                onClick={() => toggleContraception(label)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border-2",
                                    isActive
                                        ? phaseColor === "rose" ? "bg-rose-500 text-white border-rose-600 shadow-md" :
                                            phaseColor === "teal" ? "bg-teal-500 text-white border-teal-600 shadow-md" :
                                                phaseColor === "amber" ? "bg-amber-500 text-white border-amber-600 shadow-md" :
                                                    "bg-indigo-500 text-white border-indigo-600 shadow-md"
                                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                )}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
