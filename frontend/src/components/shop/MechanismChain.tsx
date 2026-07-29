"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type MechanismStep = { scene: string; detail: string };

const STEPS: MechanismStep[] = [
  {
    scene: "Cells stop listening.",
    detail: "Cells respond less efficiently to insulin.",
  },
  {
    scene: "So the body sends more.",
    detail: "The pancreas compensates by producing more of it.",
  },
  {
    scene: "The ovaries answer.",
    detail: "That excess insulin drives the ovaries to overproduce androgens.",
  },
  {
    scene: "And ovulation loses the thread.",
    detail: "Disrupting ovulation.",
  },
  {
    scene: "Which is never just a late period.",
    detail: "The same androgens show up in your cycle, and on your skin.",
  },
];

export function MechanismChain({ steps = STEPS }: { steps?: MechanismStep[] }) {
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [scrolled, setScrolled] = useState<boolean[]>(() => steps.map(() => false));
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const update = () => {
      const trigger = window.innerHeight * 0.75;
      setScrolled(
        stepRefs.current.map((el) => {
          if (!el) return false;
          return el.getBoundingClientRect().top < trigger;
        })
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduced]);

  const active = reduced ? steps.map(() => true) : scrolled;

  return (
    <ol className="relative">
      {/* The spine the steps hang off */}
      <span
        aria-hidden
        className="absolute left-[15px] top-2 bottom-2 w-px bg-phase-follicular/40 md:left-[19px]"
      />

      {steps.map((step, i) => {
        const isOn = active[i];
        return (
          <li
            key={step.scene}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="relative flex gap-5 pb-9 last:pb-0"
          >
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 md:h-10 md:w-10",
                isOn ? "border-obsidian bg-obsidian scale-100" : "border-obsidian/15 bg-white-bone scale-90"
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <span
                className={cn(
                  "font-sans text-xs font-semibold transition-colors duration-500 md:text-sm",
                  isOn ? "text-white-bone" : "text-obsidian/70"
                )}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {i + 1}
              </span>
            </span>

            <div
              className="transition-all duration-700 ease-out"
              style={{
                opacity: isOn ? 1 : 0.3,
                transform: isOn ? "translateY(0)" : "translateY(6px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <p className="font-sans text-xl font-semibold tracking-tight text-obsidian md:text-2xl">
                {step.scene}
              </p>
              <p className="mt-1 font-sans text-sm leading-relaxed text-obsidian/70 md:text-base">
                {step.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
