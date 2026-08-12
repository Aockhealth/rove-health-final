"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An ambient, textless estrogen/progesterone wave — a decorative background
 * layer, not a data chart. Ported from a standalone Claude Design
 * composition (Hormone Wave Hero) that told a one-shot 7.5s draw-in/dissolve
 * story with labels baked into the SVG; this drops all of that in favor of
 * fully-drawn curves under a slow, genuinely unbounded breathing motion —
 * nothing here ever resets or seams.
 */

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const W = 1920;
const H = 823;
const X0 = 140;
const X1 = 1800;
const PLOT = X1 - X0;
const BASE = 500;
const A_E = 285;
const A_M = 76;
const A_P = 205;

/**
 * Read from the token system instead of repeating the palette as literals.
 * `rgb(var(--phase-*-rgb))` rather than `var(--color-rove-gold)` because
 * globals.css declares its colours in `@theme inline`: the hex is inlined into
 * utility classes and `--color-*` is never published as a runtime custom
 * property, so `var(--color-rove-gold)` would resolve to nothing here. The rgb
 * triples live in a plain `:root` block and do resolve. 212,162,95 is exactly
 * #d4a25f (rove-gold / the ovulatory peak) and 123,130,168 is exactly #7b82a8
 * (phase-luteal), so the wave renders identically.
 *
 * Applied via `style` rather than as `stroke=`/`fill=` attributes: var() is not
 * dependable inside SVG presentation attributes, but is fine in a CSS property.
 */
const C = {
  accent: "rgb(var(--phase-ovulatory-rgb))",
  prog: "rgb(var(--phase-luteal-rgb))",
};

const PULSE_PERIOD = 1.6; // seconds per ovulation-node pulse

function gA(d: number, mu: number, sl: number, sr: number) {
  const s = d < mu ? sl : sr;
  const z = (d - mu) / s;
  return Math.exp(-0.5 * z * z);
}
const eRaw = (d: number) => 0.15 + 0.92 * gA(d, 13, 2.9, 1.9) + 0.44 * gA(d, 21, 4.2, 3.0) + 0.12 * gA(d, 1, 2.0, 2.5);
const pRaw = (d: number) => 0.025 + 0.95 * gA(d, 21, 3.6, 2.8);

const N = 300;
function peak(fn: (d: number) => number) {
  let m = 0;
  for (let i = 0; i <= 560; i++) m = Math.max(m, fn((28 * i) / 560));
  return m;
}
const EMAX = peak(eRaw);
const PMAX = peak(pRaw);
const eN = (d: number) => eRaw(d) / EMAX;
const pN = (d: number) => pRaw(d) / PMAX;
const xd = (d: number) => X0 + PLOT * (d / 28);

function toPath(fn: (d: number) => number, amp: number, sign: number) {
  let s = "";
  for (let i = 0; i <= N; i++) {
    const d = (28 * i) / N;
    const x = X0 + PLOT * (i / N);
    const y = BASE - sign * amp * fn(d);
    s += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2) + " ";
  }
  return s;
}
const P_E = toPath(eN, A_E, 1);
const P_M = toPath(eN, A_M, -1);
const P_P = toPath(pN, A_P, 1);

const HATCH: [number, number, number][] = [];
for (let x = X0 + 6; x < X1; x += 13) {
  const d = (28 * (x - X0)) / PLOT;
  HATCH.push([x, BASE - A_E * eN(d), BASE + A_M * eN(d)]);
}

/** Elapsed seconds since mount, growing without bound — sin/cos are already
 * periodic, so there's no wrap-around seam to manage. Always runs: the
 * motion here is slow and low-amplitude (a breathing scale, a small pulse),
 * not the kind prefers-reduced-motion is meant to suppress. */
function useElapsedTime() {
  const [t, setT] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      setT((ts - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return t;
}

export function HormoneWave({
  className = "",
  preserveAspectRatio = "xMidYMid meet",
}: {
  className?: string;
  /** Use "xMidYMid slice" to cover a container whose aspect ratio doesn't match the chart's. */
  preserveAspectRatio?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const T = useElapsedTime();

  // Server and client compute Math.exp/Math.cos with ULP-level differences,
  // which shows up as a hydration mismatch on every numeric SVG attribute
  // derived from them. Rendering nothing until after mount means the first
  // client paint matches the server's empty markup exactly.
  if (!mounted) {
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio={preserveAspectRatio}
        className={className}
        aria-hidden
      />
    );
  }

  const ph = clamp((T % PULSE_PERIOD) / PULSE_PERIOD, 0, 1);
  const ringR = 13 + 17 * ph;
  const ringO = (1 - ph) * 0.5;

  const yE14 = BASE - A_E * eN(14);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      aria-hidden
    >
      {HATCH.map(([x, yTop, yBot], i) => (
        <line key={i} x1={x} y1={yTop} x2={x} y2={yBot} style={{ stroke: C.accent }} strokeWidth="1" opacity="0.16" />
      ))}
      <path d={P_M} fill="none" style={{ stroke: C.accent }} strokeWidth="1.1" opacity="0.5" strokeLinecap="round" />
      <path d={P_P} fill="none" style={{ stroke: C.prog }} strokeWidth="1.6" strokeLinecap="round" />
      <path d={P_E} fill="none" style={{ stroke: C.accent }} strokeWidth="2.2" strokeLinecap="round" />

      <circle cx={xd(14)} cy={yE14} r={ringR} fill="none" style={{ stroke: C.accent }} strokeWidth="1" opacity={ringO} />
      <circle cx={xd(14)} cy={yE14} r={6} style={{ fill: C.accent }} />
    </svg>
  );
}
