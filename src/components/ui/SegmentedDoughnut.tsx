"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Segment {
  value: number;
  color: string; // gradient id
  label: string;
}

function polar(cx: number, cy: number, r: number, angle: number) {
  const a = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

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

interface Props {
  data: Segment[];
  size?: number;
  thickness?: number;
  gap?: number;
  onHoverChange?: (index: number | null) => void;
}

export function SegmentedDoughnut({
  data,
  size = 160,
  thickness = 34,
  gap = 4,
  onHoverChange,
}: Props) {
  const [active, setActive] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius - thickness;

  let angle = 0;

  const handleHover = (i: number | null) => {
    setActive(i);
    onHoverChange?.(i);
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* ===== DEFINITIONS ===== */}
        <defs>
          {/* Period */}
          <linearGradient id="grad-period" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#ffb3c1" />
          </linearGradient>

          {/* Follicular */}
          <linearGradient id="grad-follicular" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>

          {/* Ovulatory */}
          <linearGradient id="grad-ovulatory" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>

          {/* Luteal */}
          <linearGradient id="grad-luteal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>

          {/* Grain texture */}
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="3"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.08" />
            </feComponentTransfer>
          </filter>
        </defs>

        {/* White inner ring for separation */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius + thickness / 2}
          fill="none"
          stroke="white"
          strokeWidth={2}
          opacity={0.7}
        />

        {/* ===== SEGMENTS ===== */}
        {data.map((d, i) => {
          const sweep = (d.value / total) * (360 - gap * data.length);
          const start = angle;
          const end = angle + sweep;
          angle += sweep + gap;

          const mid = (start + end) / 2;
          const isActive = active === i;
          const pop = isActive ? 8 : 0;
          const offset = polar(0, 0, pop, mid);

          return (
            <motion.path
              key={i}
              d={donutPath(cx, cy, outerRadius, innerRadius, start, end)}
              fill={`url(#${d.color})`}
              filter="url(#grain)"
              animate={{
                x: offset.x,
                y: offset.y,
                opacity: active !== null && !isActive ? 0.4 : 1,
                scale: isActive ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={() => handleHover(null)}
              onTap={() => handleHover(i)}
              className="cursor-pointer"
              style={{
                transformOrigin: "center",
                filter: isActive
                  ? "drop-shadow(0 8px 20px rgba(0,0,0,0.15))"
                  : "drop-shadow(0 4px 10px rgba(0,0,0,0.08))",
              }}
            />
          );
        })}
      </svg>

      {/* CENTER TEXT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-heading text-4xl text-rove-charcoal">
          {total}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-rove-stone font-bold">
          Logs
        </span>
      </div>
    </div>
  );
}
