"use client";

import { useEffect, useRef, useState } from "react";

const FRUSTRATIONS = [
  "I was told the pain was normal",
  "I was put on a pill and sent home",
  "I was never asked what phase I was in",
];

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function ProblemStatement() {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closingRef = useRef<HTMLParagraphElement>(null);
  const [lineProgress, setLineProgress] = useState<number[]>(() =>
    FRUSTRATIONS.map(() => 0)
  );
  const [closingProgress, setClosingProgress] = useState(0);

  useEffect(() => {
    // Deliberately not gated behind requestAnimationFrame — rAF is throttled
    // to zero on hidden/backgrounded tabs, and this calculation is cheap
    // enough to run directly on every scroll/resize event.
    const update = () => {
      const vh = window.innerHeight;
      // Each line's own center — not the section's top — drives its strike,
      // so a line draws in as *it* nears the middle of the screen instead of
      // finishing early just because the section as a whole is on screen.
      const start = vh * 0.8;
      const end = vh * 0.35;
      const progressFor = (el: HTMLElement | null) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        return clamp01((start - center) / (start - end));
      };

      setLineProgress(lineRefs.current.map(progressFor));
      setClosingProgress(progressFor(closingRef.current));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section className="bg-rove-plum px-6 py-32 md:py-40">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-8 md:gap-10">
          {FRUSTRATIONS.map((line, i) => (
            <div
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="relative inline-block self-center"
            >
              <p className="font-serif text-3xl italic font-medium leading-tight text-white-bone/90 md:text-5xl">
                {line}
              </p>
              <span
                className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-white-bone/80"
                style={{ transform: `scaleX(${lineProgress[i] ?? 0})` }}
              />
            </div>
          ))}
        </div>

        <p
          ref={closingRef}
          className="mt-14 text-center font-sans text-2xl font-semibold leading-tight tracking-tight text-white-bone md:text-3xl"
          style={{
            opacity: closingProgress,
            transform: `translateY(${(1 - closingProgress) * 8}px)`,
          }}
        >
          Sound familiar? <span className="font-serif italic font-medium">It shouldn&apos;t.</span>
        </p>
      </div>
    </section>
  );
}
