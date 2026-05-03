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

    // Category color: Sexual Wellness → Warm Orange
    const theme = {
        border: "border-[#E8924E]/30",
        shadow: "shadow-[#E8924E]/5",
        iconBg: "bg-[#E8924E]/10",
        iconColor: "text-[#E8924E]",
        active: "bg-[#E8924E] text-white border-[#E8924E] shadow-md",
        inactive: "bg-white text-gray-600 border-[#E8924E]/20 hover:bg-[#E8924E]/5",
        activeNegative: "bg-red-100 text-red-800 border-red-300 shadow-sm",
        activeBlue: "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
    };

    return (
        <div className={cn(
            "py-3 transition-all space-y-6 sm:space-y-8",
            theme.border,
            theme.shadow
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
                        theme.iconBg
                    )}
                >
                    <Flame className={cn("w-5 h-5 fill-current", theme.iconColor)} />
                </motion.div>
                <div>
                    <h3 className="text-base font-heading font-semibold text-gray-900">Sexual Wellness</h3>
                    <p className="text-xs text-gray-500">Track activity & contraception</p>
                </div>
            </div>

            {/* 1. Sexual Activity */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Heart className={cn("w-3.5 h-3.5", theme.iconColor)} />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sexual Activity</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SEX_ACTIVITY_OPTIONS.map((m) => {
                        const isActive = selectedSexActivity.includes(m.label);
                        let activeClass = "";

                        // Use consistent phase color unless negative type
                        switch (m.type) {
                            case "positive":
                                activeClass = theme.active; // Use themed active color
                                break;
                            case "negative":
                                activeClass = theme.activeNegative;
                                break;
                            default:
                                activeClass = theme.activeBlue;
                        }

                        return (
                            <button
                                key={m.label}
                                onClick={() => toggleActivity(m.label)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border",
                                    isActive ? activeClass : theme.inactive
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
                    <Shield className={cn("w-3.5 h-3.5", theme.iconColor)} />
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
                                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                                    isActive ? theme.active : theme.inactive
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
