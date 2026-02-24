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

    // Organic Chromatics Styling
    const phase = currentPhase || "Menstrual";

    const themes: Record<string, any> = {
        "Menstrual": {
            border: "border-phase-menstrual/30",
            shadow: "shadow-phase-menstrual/5",
            iconBg: "bg-phase-menstrual/10",
            iconColor: "text-phase-menstrual",
            active: "bg-phase-menstrual text-white border-phase-menstrual shadow-md shadow-phase-menstrual/20",
            inactive: "bg-white text-gray-600 border-phase-menstrual/20 hover:bg-phase-menstrual/5",
            activeNegative: "bg-red-100 text-red-800 border-red-300 shadow-sm",
            activeBlue: "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
        },
        "Follicular": {
            border: "border-phase-follicular/30",
            shadow: "shadow-phase-follicular/5",
            iconBg: "bg-phase-follicular/10",
            iconColor: "text-phase-follicular",
            active: "bg-phase-follicular text-white border-phase-follicular shadow-md shadow-phase-follicular/20",
            inactive: "bg-white text-gray-600 border-phase-follicular/20 hover:bg-phase-follicular/5",
            activeNegative: "bg-red-100 text-red-800 border-red-300 shadow-sm",
            activeBlue: "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
        },
        "Ovulatory": {
            border: "border-phase-ovulatory/30",
            shadow: "shadow-phase-ovulatory/5",
            iconBg: "bg-phase-ovulatory/10",
            iconColor: "text-phase-ovulatory",
            active: "bg-phase-ovulatory text-white border-phase-ovulatory shadow-md shadow-phase-ovulatory/20",
            inactive: "bg-white text-gray-600 border-phase-ovulatory/20 hover:bg-phase-ovulatory/5",
            activeNegative: "bg-red-100 text-red-800 border-red-300 shadow-sm",
            activeBlue: "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
        },
        "Luteal": {
            border: "border-phase-luteal/30",
            shadow: "shadow-phase-luteal/5",
            iconBg: "bg-phase-luteal/10",
            iconColor: "text-phase-luteal",
            active: "bg-phase-luteal text-white border-phase-luteal shadow-md shadow-phase-luteal/20",
            inactive: "bg-white text-gray-600 border-phase-luteal/20 hover:bg-phase-luteal/5",
            activeNegative: "bg-red-100 text-red-800 border-red-300 shadow-sm",
            activeBlue: "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
        }
    };

    const theme = themes[phase] || themes["Menstrual"];

    return (
        <div className={cn(
            "bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-xl border transition-all space-y-6 sm:space-y-8",
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
