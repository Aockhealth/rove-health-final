"use client";
import Image from "next/image";
import { Activity } from "lucide-react";

// Standardized mapping from page.tsx
const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    "Follicular": { bg: "rgba(236, 253, 245, 0.5)", text: "#065f46", border: "rgba(16, 185, 129, 0.1)" }, 
    "Luteal": { bg: "rgba(255, 251, 235, 0.5)", text: "#92400e", border: "rgba(245, 158, 11, 0.1)" },     
    "Menstrual": { bg: "rgba(255, 241, 242, 0.5)", text: "#9f1239", border: "rgba(225, 29, 72, 0.1)" },    
    "Ovulatory": { bg: "rgba(245, 243, 255, 0.5)", text: "#5b21b6", border: "rgba(139, 92, 246, 0.1)" },   
};

export function CycleOverviewCard({ 
    cycleLength, 
    periodLength, 
    isRegular,
    phase = "Luteal" 
}: { 
    cycleLength: number, 
    periodLength: number, 
    isRegular: boolean,
    phase?: string
}) {
    const theme = PHASE_COLORS[phase] || PHASE_COLORS["Luteal"];

    return (
        <div 
            className="relative overflow-hidden rounded-[2rem] border shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] p-7 h-full flex flex-col transition-all duration-700"
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
            {/* 🌸 TEXTURE BACKGROUND */}
            <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80"
                style={{
                    backgroundImage: "url('/textures/card-bg.png')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "140%",
                    backgroundPosition: "bottom right",
                }}
            />

            <div className="relative z-10 flex flex-col h-full justify-between">
                
                {/* TOP SECTION: Stats Grid */}
                <div className="grid grid-cols-2 w-full flex-1 items-center">
                    {/* AVG FLOW */}
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
                            <Image 
                                src="/assets/icon1.png" 
                                alt="Flow Icon" 
                                width={20} 
                                height={20} 
                                className="object-contain opacity-90"
                            />
                        </div>
                        <div>
                            <span className="block text-3xl font-heading text-rove-charcoal leading-none">
                                <span style={{ color: theme.text }}>{periodLength}</span>
                                <span className="text-sm font-sans text-rove-stone font-medium ml-1">days</span>
                            </span>
                            <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">Avg Flow</span>
                        </div>
                    </div>

                    {/* ✅ VERTICAL SEPARATOR: Increased visibility with border-rove-stone/20 */}
                    <div className="flex flex-col gap-3 border-l-2 border-rove-stone/20 pl-6">
                        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
                            <Image 
                                src="/assets/icon2.png" 
                                alt="Cycle Icon" 
                                width={20} 
                                height={20} 
                                className="object-contain opacity-90"
                            />
                        </div>
                        <div>
                            <span className="block text-3xl font-heading text-rove-charcoal leading-none">
                                <span style={{ color: theme.text }}>{cycleLength}</span>
                                <span className="text-sm font-sans text-rove-stone font-medium ml-1">days</span>
                            </span>
                            <span className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">Avg Cycle</span>
                        </div>
                    </div>
                </div>

                {/* ✅ HORIZONTAL SEPARATOR: Increased height to 2px and opacity to /20 for clarity */}
                <div className="h-[2px] w-full bg-rove-stone/20 my-6" />

                {/* BOTTOM SECTION: Regularity */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                            <Activity className="w-5 h-5" style={{ color: theme.text }} />
                        </div>
                        <div>
                            <p className="font-heading text-rove-charcoal text-base">
                                {isRegular ? "Regular" : "Irregular"} <span style={{ color: theme.text }}>Rhythm</span>
                            </p>
                            <p className="text-[10px] text-rove-stone uppercase tracking-wider font-bold opacity-70">
                                {isRegular ? "Normal Deviation" : "Variation Detected"}
                            </p>
                        </div>
                    </div>
                    
                    {/* Visual Sparkline - Tints based on phase */}
                    <div className="flex gap-1 items-end h-8 opacity-30">
                        {[3, 5, 4, 6, 4, 5, 3, 6].map((h, i) => (
                            <div 
                                key={i} 
                                className="w-1 rounded-full" 
                                style={{ 
                                    height: `${h * 10 + 20}%`,
                                    backgroundColor: theme.text 
                                }} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}