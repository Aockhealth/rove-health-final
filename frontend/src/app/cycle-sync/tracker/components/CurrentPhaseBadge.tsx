"use client";

import { cn } from "@/lib/utils";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal" | null;

export default function CurrentPhaseBadge({
    selectedDate,
    phase,
    dayInCycle,
    isFertile,
}: {
    selectedDate: Date;
    phase: Phase;
    dayInCycle: number | null;
    isFertile: boolean;
}) {
    const phaseMeta = (() => {
        switch (phase) {
            case "Menstrual":
                return { label: "Menstrual", dot: "bg-[#fb7185]", pill: "bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]/20" };
            case "Follicular":
                return { label: "Follicular", dot: "bg-[#2dd4bf]", pill: "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20" };
            case "Ovulatory":
                return { label: "Ovulatory", dot: "bg-[#fbbf24]", pill: "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20" };
            case "Luteal":
                return { label: "Luteal", dot: "bg-[#818cf8]", pill: "bg-[#818cf8]/10 text-[#818cf8] border-[#818cf8]/20" };
            default:
                return { label: "Phase Unknown", dot: "bg-gray-400", pill: "bg-gray-50 text-gray-700 border-gray-100" };
        }
    })();

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", phaseMeta.dot)} />
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phase</p>
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold", phaseMeta.pill)}>
                            {phaseMeta.label}
                            {isFertile && <span className="text-[11px] font-medium opacity-80">• Fertile</span>}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Selected</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[11px] text-gray-500">
                        {dayInCycle ? `Day ${dayInCycle} of cycle` : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}
