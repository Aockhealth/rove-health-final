"use client";

import { motion } from "framer-motion";

export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

interface Props {
  size?: number;
  thickness?: number;
  selectedPhase: string;
  onPhaseSelect: (phase: string) => void;
}

// Helper to calculate coordinates
function polar(cx: number, cy: number, r: number, angle: number) {
  const a = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Helper to create SVG path
function donutPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number
) {
  const p1 = polar(cx, cy, rOuter, start);
  const p2 = polar(cx, cy, rOuter, end);
  const p3 = polar(cx, cy, rInner, end);
  const p4 = polar(cx, cy, rInner, start);
  const large = end - start > 180 ? 1 : 0;

  return `
    M ${p1.x} ${p1.y}
    A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}
    L ${p3.x} ${p3.y}
    A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}
    Z
  `;
}

export function SegmentedDoughnut({
  size = 180,
  thickness = 36,
  selectedPhase,
  onPhaseSelect,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 8;
  const innerRadius = outerRadius - thickness;

  const gap = 4;
  const segmentSweep = (360 - gap * 4) / 4;

  let angle = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size}>
        <defs>
          {/* ✅ UPDATED GRADIENTS: Using Rove Brand Colors from globals.css
             Structure: Base Color -> Lighter Tint (Shine) -> Base Color
          */}
          
          {/* Menstrual: #AF6B6B (Rose) */}
          <linearGradient id="grad-menstrual" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#AF6B6B" /> 
            <stop offset="50%" stopColor="#DDB4B4" /> {/* Light Rose */}
            <stop offset="100%" stopColor="#AF6B6B" />
          </linearGradient>

          {/* Follicular: #8DAA9D (Sage) */}
          <linearGradient id="grad-follicular" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8DAA9D" />
            <stop offset="50%" stopColor="#B8D3C8" /> {/* Light Sage */}
            <stop offset="100%" stopColor="#8DAA9D" />
          </linearGradient>

          {/* Ovulatory: #D4A25F (Ochre) */}
          <linearGradient id="grad-ovulatory" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A25F" />
            <stop offset="50%" stopColor="#F0D6B5" /> {/* Light Ochre */}
            <stop offset="100%" stopColor="#D4A25F" />
          </linearGradient>

          {/* Luteal: #7B82A8 (Slate) */}
          <linearGradient id="grad-luteal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B82A8" />
            <stop offset="50%" stopColor="#A8AED0" /> {/* Light Slate */}
            <stop offset="100%" stopColor="#7B82A8" />
          </linearGradient>
        </defs>

        {["Menstrual", "Follicular", "Ovulatory", "Luteal"].map((phase) => {
          const start = angle;
          const end = angle + segmentSweep;
          angle += segmentSweep + gap;

          const mid = (start + end) / 2;
          const isActive = selectedPhase === phase;
          const pop = isActive ? 8 : 0;
          const offset = polar(0, 0, pop, mid);
          const gradientId = `grad-${phase.toLowerCase()}`;

          return (
            <motion.path
              key={phase}
              d={donutPath(cx, cy, outerRadius, innerRadius, start, end)}
              fill={`url(#${gradientId})`}
              initial={{
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1
              }}
              animate={{
                x: offset.x,
                y: offset.y,
                scale: isActive ? 1.06 : 1,
                opacity: selectedPhase && !isActive ? 0.4 : 1, // Slight adjustment to opacity for better contrast
              }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={() => onPhaseSelect(phase)}
              className="cursor-pointer hover:opacity-100 transition-opacity"
              style={{
                filter: isActive
                  ? "drop-shadow(0 10px 20px rgba(0,0,0,0.15))"
                  : "drop-shadow(0 4px 10px rgba(0,0,0,0.05))",
              }}
            />
          );
        })}
      </svg>

      {/* CENTER TEXT */}
      <div className="absolute text-center pointer-events-none">
        <p className="text-[10px] uppercase tracking-widest text-rove-stone font-semibold mb-1">
          Phase
        </p>
        <p className="text-sm font-heading text-rove-charcoal font-bold">
          {selectedPhase}
        </p>
      </div>
    </div>
  );
}