"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";



const FLOW_POINTS = [
    { day: 1, val: 10, label: "Heavy" },
    { day: 2, val: 15, label: "Heavy" },
    { day: 3, val: 50, label: "Medium" },
    { day: 4, val: 80, label: "Light" },
    { day: 5, val: 95, label: "Spotting" },
];

export function FlowPatternCard({ phase = "Luteal", theme }: { phase?: string, theme: any }) {
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);
    // theme passed from parent

    const wavePath = `
        M 0,100 L 0,${FLOW_POINTS[0].val} 
        C 20,${FLOW_POINTS[0].val} 40,${FLOW_POINTS[1].val} 50,${FLOW_POINTS[1].val} 
        S 80,${FLOW_POINTS[2].val} 125,${FLOW_POINTS[2].val} 
        S 180,${FLOW_POINTS[3].val} 225,${FLOW_POINTS[3].val} 
        S 280,${FLOW_POINTS[4].val} 320,${FLOW_POINTS[4].val} L 320,100 Z
    `;

    const linePath = `
        M 0,${FLOW_POINTS[0].val} 
        C 20,${FLOW_POINTS[0].val} 40,${FLOW_POINTS[1].val} 50,${FLOW_POINTS[1].val} 
        S 80,${FLOW_POINTS[2].val} 125,${FLOW_POINTS[2].val} 
        S 180,${FLOW_POINTS[3].val} 225,${FLOW_POINTS[3].val} 
        S 280,${FLOW_POINTS[4].val} 320,${FLOW_POINTS[4].val}
    `;

    return (
        <div
            className={cn("relative overflow-hidden rounded-[2rem] border shadow-sm p-8 h-full flex flex-col group transition-all duration-700", theme.cardBg, theme.border, theme.color)}
        >
            <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{
                    backgroundImage: "url('/textures/card-bg.png')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "140%",
                    backgroundPosition: "bottom right",
                    opacity: 0.8,
                }}
            />

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-heading text-lg text-rove-charcoal flex items-center gap-2">
                        {/* ✅ Icon color matches theme text via currentColor */}
                        <Droplets className="w-4 h-4 text-current" />
                        Flow Velocity
                    </h3>
                    <p className="text-xs text-rove-stone mt-1">
                        Heaviest on <span className="font-bold text-current">Days 1-2</span>, tapering by Day 4.
                    </p>
                </div>
            </div>

            <div className="relative z-10 flex-1 w-full min-h-[100px] flex items-end">
                <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`flowGradient-${phase}`} x1="0" y1="0" x2="0" y2="1">
                            {/* ✅ Gradient stop color now uses currentColor */}
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <motion.path
                        d={wavePath}
                        fill={`url(#flowGradient-${phase})`}
                        initial={{ opacity: 0, scaleY: 0 }}
                        whileInView={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ originY: 1 }}
                    />

                    <motion.path
                        d={linePath}
                        fill="none"
                        stroke="currentColor" // ✅ Surface line color matches theme
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {FLOW_POINTS.map((pt, i) => {
                        const xPos = [10, 50, 125, 225, 310][i];
                        const isHovered = hoveredDay === pt.day;

                        return (
                            <g key={pt.day} onMouseEnter={() => setHoveredDay(pt.day)} onMouseLeave={() => setHoveredDay(null)}>
                                <circle cx={xPos} cy={pt.val} r="15" fill="transparent" className="cursor-pointer" />
                                <motion.circle
                                    cx={xPos}
                                    cy={pt.val}
                                    r={isHovered ? 6 : 4}
                                    fill="#fff"
                                    stroke="currentColor" // ✅ Data point border color matches theme
                                    strokeWidth={isHovered ? 3 : 2}
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 1 + (i * 0.1) }}
                                />
                                {isHovered && (
                                    <foreignObject x={xPos - 40} y={pt.val - 45} width="80" height="40">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-rove-charcoal text-white text-[10px] py-1 px-2 rounded-lg shadow-lg font-bold whitespace-nowrap">
                                                {pt.label}
                                            </div>
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-rove-charcoal" />
                                        </div>
                                    </foreignObject>
                                )}
                            </g>
                        );
                    })}
                </svg>

                <div className="w-full flex justify-between text-[10px] font-bold text-rove-stone uppercase tracking-widest mt-2 px-2 z-10 select-none">
                    <span>D1</span>
                    <span>D2</span>
                    <span>D3</span>
                    <span>D4</span>
                    <span>D5</span>
                </div>
            </div>
        </div>
    );
}