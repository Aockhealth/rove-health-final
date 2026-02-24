"use client";

import { lazy, Suspense, useReducedMotion } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ExerciseId = "pushup" | "wallsit" | "reverselunge" | "squat" | "plank";

interface ExerciseDemoProps {
    exerciseId: ExerciseId;
    videoSrc?: string;
    className?: string;
    /** Phase accent color (hex) for highlights */
    accentColor?: string;
}

// ─── SVG Stick Figure Demos ────────────────────────────────────────────────────

function StickBody({
    color = "#2F363F",
    accent = "#E07B7B",
    // Body part positions
    headCx = 50, headCy = 15,
    shoulderL = [30, 30], shoulderR = [70, 30],
    hipL = [35, 60], hipR = [65, 60],
    kneeL = [32, 80], kneeR = [68, 80],
    footL = [28, 95], footR = [72, 95],
    elbowL = [18, 45], elbowR = [82, 45],
    handL = [10, 55], handR = [90, 55],
}: {
    color?: string; accent?: string;
    headCx?: number; headCy?: number;
    shoulderL?: [number, number]; shoulderR?: [number, number];
    hipL?: [number, number]; hipR?: [number, number];
    kneeL?: [number, number]; kneeR?: [number, number];
    footL?: [number, number]; footR?: [number, number];
    elbowL?: [number, number]; elbowR?: [number, number];
    handL?: [number, number]; handR?: [number, number];
}) {
    const torsoMidX = (shoulderL[0] + shoulderR[0]) / 2;
    const torsoMidY = (shoulderL[1] + shoulderR[1]) / 2;
    const hipMidX = (hipL[0] + hipR[0]) / 2;
    const hipMidY = (hipL[1] + hipR[1]) / 2;

    return (
        <g stroke={color} strokeWidth="3" strokeLinecap="round" fill="none">
            {/* Head */}
            <circle cx={headCx} cy={headCy} r="8" fill={color} stroke="none" />
            {/* Neck + Torso */}
            <line x1={headCx} y1={headCy + 8} x2={torsoMidX} y2={torsoMidY} />
            <line x1={torsoMidX} y1={torsoMidY} x2={hipMidX} y2={hipMidY} />
            {/* Shoulders */}
            <line x1={shoulderL[0]} y1={shoulderL[1]} x2={shoulderR[0]} y2={shoulderR[1]} />
            {/* Hips */}
            <line x1={hipL[0]} y1={hipL[1]} x2={hipR[0]} y2={hipR[1]} />
            {/* Left arm */}
            <line x1={shoulderL[0]} y1={shoulderL[1]} x2={elbowL[0]} y2={elbowL[1]} />
            <line x1={elbowL[0]} y1={elbowL[1]} x2={handL[0]} y2={handL[1]} />
            {/* Right arm */}
            <line x1={shoulderR[0]} y1={shoulderR[1]} x2={elbowR[0]} y2={elbowR[1]} />
            <line x1={elbowR[0]} y1={elbowR[1]} x2={handR[0]} y2={handR[1]} />
            {/* Left leg */}
            <line x1={hipL[0]} y1={hipL[1]} x2={kneeL[0]} y2={kneeL[1]} />
            <line x1={kneeL[0]} y1={kneeL[1]} x2={footL[0]} y2={footL[1]} />
            {/* Right leg */}
            <line x1={hipR[0]} y1={hipR[1]} x2={kneeR[0]} y2={kneeR[1]} />
            <line x1={kneeR[0]} y1={kneeR[1]} x2={footR[0]} y2={footR[1]} />
            {/* Accent joints */}
            {[elbowL, elbowR, kneeL, kneeR].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill={accent} stroke="none" />
            ))}
        </g>
    );
}

// Push-Up Demo: alternates between "up" (arms extended) and "down" (arms bent)
function PushUpDemo({ accent }: { accent: string }) {
    const reduced = useReducedMotion();

    const upFrame = {
        headCy: 18, headCx: 50,
        shoulderL: [25, 30] as [number, number], shoulderR: [75, 30] as [number, number],
        hipL: [28, 52] as [number, number], hipR: [72, 52] as [number, number],
        kneeL: [28, 68] as [number, number], kneeR: [72, 68] as [number, number],
        footL: [24, 82] as [number, number], footR: [76, 82] as [number, number],
        elbowL: [15, 42] as [number, number], elbowR: [85, 42] as [number, number],
        handL: [10, 60] as [number, number], handR: [90, 60] as [number, number],
    };

    const downFrame = {
        headCy: 28, headCx: 50,
        shoulderL: [28, 40] as [number, number], shoulderR: [72, 40] as [number, number],
        hipL: [28, 58] as [number, number], hipR: [72, 58] as [number, number],
        kneeL: [28, 72] as [number, number], kneeR: [72, 72] as [number, number],
        footL: [24, 85] as [number, number], footR: [76, 85] as [number, number],
        elbowL: [18, 48] as [number, number], elbowR: [82, 48] as [number, number],
        handL: [10, 60] as [number, number], handR: [90, 60] as [number, number],
    };

    return (
        <motion.g
            animate={reduced ? {} : { opacity: [1, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
        >
            {/* Ground */}
            <line x1="5" y1="88" x2="95" y2="88" stroke="#E5E7EB" strokeWidth="2" />
            <motion.g
                animate={reduced ? {} : {
                    // We animate a vertical "nudge" to represent the up/down pop
                    y: [0, 12, 0],
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
                <StickBody
                    accent={accent}
                    headCx={upFrame.headCx} headCy={upFrame.headCy}
                    shoulderL={upFrame.shoulderL} shoulderR={upFrame.shoulderR}
                    hipL={upFrame.hipL} hipR={upFrame.hipR}
                    kneeL={upFrame.kneeL} kneeR={upFrame.kneeR}
                    footL={upFrame.footL} footR={upFrame.footR}
                    elbowL={upFrame.elbowL} elbowR={upFrame.elbowR}
                    handL={upFrame.handL} handR={upFrame.handR}
                />
            </motion.g>
        </motion.g>
    );
}

// Wall-Sit Demo: static seated position, pulses slightly
function WallSitDemo({ accent }: { accent: string }) {
    const reduced = useReducedMotion();
    return (
        <g>
            {/* Wall */}
            <rect x="72" y="5" width="6" height="85" fill="#F3F4F6" rx="2" />
            {/* Floor */}
            <line x1="5" y1="90" x2="95" y2="90" stroke="#E5E7EB" strokeWidth="2" />
            <motion.g
                animate={reduced ? {} : { scaleY: [1, 0.98, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "50px 90px" }}
            >
                <StickBody
                    accent={accent}
                    headCx={40} headCy={20}
                    shoulderL={[25, 35] as [number, number]} shoulderR={[55, 35] as [number, number]}
                    hipL={[22, 62] as [number, number]} hipR={[58, 62] as [number, number]}
                    kneeL={[18, 78] as [number, number]} kneeR={[54, 78] as [number, number]}
                    footL={[15, 90] as [number, number]} footR={[52, 90] as [number, number]}
                    elbowL={[20, 50] as [number, number]} elbowR={[60, 50] as [number, number]}
                    handL={[20, 65] as [number, number]} handR={[72, 60] as [number, number]}
                />
            </motion.g>
        </g>
    );
}

// Reverse Lunge: shifts weight forward/backward
function ReverseLungeDemo({ accent }: { accent: string }) {
    const reduced = useReducedMotion();
    return (
        <g>
            {/* Floor */}
            <line x1="5" y1="92" x2="95" y2="92" stroke="#E5E7EB" strokeWidth="2" />
            <motion.g
                animate={reduced ? {} : { x: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <StickBody
                    accent={accent}
                    headCx={50} headCy={12}
                    shoulderL={[36, 28] as [number, number]} shoulderR={[64, 28] as [number, number]}
                    hipL={[40, 54] as [number, number]} hipR={[60, 54] as [number, number]}
                    kneeL={[28, 72] as [number, number]} kneeR={[68, 74] as [number, number]}
                    footL={[22, 90] as [number, number]} footR={[74, 92] as [number, number]}
                    elbowL={[30, 40] as [number, number]} elbowR={[70, 40] as [number, number]}
                    handL={[28, 55] as [number, number]} handR={[72, 55] as [number, number]}
                />
            </motion.g>
        </g>
    );
}

// Squat Demo
function SquatDemo({ accent }: { accent: string }) {
    const reduced = useReducedMotion();
    return (
        <g>
            <line x1="5" y1="92" x2="95" y2="92" stroke="#E5E7EB" strokeWidth="2" />
            <motion.g
                animate={reduced ? {} : { y: [0, 14, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <StickBody
                    accent={accent}
                    headCx={50} headCy={12}
                    shoulderL={[30, 28] as [number, number]} shoulderR={[70, 28] as [number, number]}
                    hipL={[32, 52] as [number, number]} hipR={[68, 52] as [number, number]}
                    kneeL={[24, 72] as [number, number]} kneeR={[76, 72] as [number, number]}
                    footL={[20, 88] as [number, number]} footR={[80, 88] as [number, number]}
                    elbowL={[20, 35] as [number, number]} elbowR={[80, 35] as [number, number]}
                    handL={[14, 45] as [number, number]} handR={[86, 45] as [number, number]}
                />
            </motion.g>
        </g>
    );
}

// Plank Demo
function PlankDemo({ accent }: { accent: string }) {
    const reduced = useReducedMotion();
    return (
        <g>
            <line x1="5" y1="78" x2="95" y2="78" stroke="#E5E7EB" strokeWidth="2" />
            <motion.g
                animate={reduced ? {} : { y: [0, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <StickBody
                    accent={accent}
                    headCx={18} headCy={52}
                    shoulderL={[25, 60] as [number, number]} shoulderR={[35, 60] as [number, number]}
                    hipL={[62, 62] as [number, number]} hipR={[74, 62] as [number, number]}
                    kneeL={[70, 70] as [number, number]} kneeR={[82, 70] as [number, number]}
                    footL={[72, 78] as [number, number]} footR={[88, 78] as [number, number]}
                    elbowL={[22, 68] as [number, number]} elbowR={[32, 68] as [number, number]}
                    handL={[18, 76] as [number, number]} handR={[30, 76] as [number, number]}
                />
            </motion.g>
        </g>
    );
}

// ─── Demo Map ─────────────────────────────────────────────────────────────────
const DEMO_MAP: Record<ExerciseId, React.FC<{ accent: string }>> = {
    pushup: PushUpDemo,
    wallsit: WallSitDemo,
    reverselunge: ReverseLungeDemo,
    squat: SquatDemo,
    plank: PlankDemo,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExerciseDemo({ exerciseId, videoSrc, className = "", accentColor = "#E07B7B" }: ExerciseDemoProps) {
    const DemoComponent = DEMO_MAP[exerciseId];

    if (videoSrc) {
        return (
            <div className={`relative rounded-2xl overflow-hidden bg-gray-50 ${className}`}>
                <video
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className={`relative flex items-center justify-center bg-white/40 rounded-2xl backdrop-blur-sm border border-white/50 ${className}`}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                role="img"
                aria-label={`${exerciseId} demonstration`}
            >
                {DemoComponent && <DemoComponent accent={accentColor} />}
            </svg>
        </div>
    );
}

// ─── Inline label util ────────────────────────────────────────────────────────
export function exerciseDemoId(title: string): ExerciseId | null {
    const t = title.toLowerCase();
    if (t.includes("push")) return "pushup";
    if (t.includes("wall")) return "wallsit";
    if (t.includes("lunge")) return "reverselunge";
    if (t.includes("squat")) return "squat";
    if (t.includes("plank")) return "plank";
    return null;
}
