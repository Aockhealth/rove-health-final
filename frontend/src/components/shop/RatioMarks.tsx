"use client";

import { useEffect, useRef, useState } from "react";
import type { FormulationItem } from "@/data/products";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function RatioMarks({ formulation }: { formulation: FormulationItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const reduced = useReducedMotion();
  const shown = reduced || seen;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const myo = formulation.find((f) => f.nutrient === "Myo-Inositol");
  const dchiro = formulation.find((f) => f.nutrient === "D-Chiro-Inositol");
  if (!myo || !dchiro) return null;

  const myoMg = parseFloat(myo.dose);
  const dchiroMg = parseFloat(dchiro.dose);
  const units = dchiroMg > 0 ? myoMg / dchiroMg : null;
  const isCleanRatio = units !== null && Number.isInteger(units) && units > 0 && units <= 100;

  return (
    <div ref={ref}>
      <div className="flex items-baseline gap-3">
        <span className="font-sans text-[5.5rem] font-semibold leading-none tracking-[-0.04em] text-obsidian md:text-[8rem]">
          {isCleanRatio ? units : "—"}
        </span>
        <span className="font-serif text-4xl italic text-obsidian/70">to</span>
        <span className="font-sans text-[5.5rem] font-semibold leading-none tracking-[-0.04em] text-obsidian md:text-[8rem]">
          1
        </span>
      </div>

      {isCleanRatio && (
        <div className="mt-8 flex items-end gap-1 md:gap-[7px]" role="img" aria-label={`${units} to 1 ratio, shown as ${units} marks to one`}>
          {Array.from({ length: units }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className="w-px origin-bottom bg-obsidian/40 transition-transform duration-[420ms] ease-out md:w-[2px]"
              style={{
                height: "4rem",
                transform: shown ? "scaleY(1)" : "scaleY(0)",
                transitionDelay: `${i * 16}ms`,
              }}
            />
          ))}
          <span
            aria-hidden
            className={cn(
              "ml-5 w-[3px] origin-bottom bg-sage-teal transition-transform duration-[520ms] ease-out md:w-1"
            )}
            style={{
              height: "5rem",
              transform: shown ? "scaleY(1)" : "scaleY(0)",
              transitionDelay: "900ms",
            }}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-obsidian/20 pt-4 font-sans text-xs tabular-nums text-obsidian/70">
        <span>
          <span className="font-semibold text-obsidian">Myo-Inositol</span> {myo.dose}
        </span>
        <span>
          <span className="font-semibold text-obsidian">D-Chiro-Inositol</span> {dchiro.dose}
        </span>
      </div>

      {isCleanRatio && (
        <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.18em] text-obsidian/70">
          Each mark = {dchiroMg}mg
        </p>
      )}
    </div>
  );
}
