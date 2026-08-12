"use client";

import { useEffect, useRef, useState } from "react";

const FRUSTRATIONS = [
  "I was told the pain was normal",
  "I was put on a pill and sent home",
  "I was never asked what phase I was in",
];

/**
 * The centre of the homepage. Each line strikes through once, on entry, from a
 * single IntersectionObserver — the earlier version recalculated a per-line
 * offset on every scroll event.
 */
export function ProblemStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-paper px-6 py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-3xl">
        <p
          className="text-center font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/60 transition-opacity duration-700"
          style={{ opacity: seen ? 1 : 0 }}
        >
          What we kept hearing
        </p>

        <div className="mt-10 flex flex-col items-center gap-6 md:gap-8">
          {FRUSTRATIONS.map((line, i) => (
            <div key={line} className="relative inline-block">
              <p className="text-center font-serif text-2xl italic font-medium leading-tight text-obsidian/90 md:text-4xl">
                {line}
              </p>
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-obsidian/80 transition-transform duration-[900ms] ease-out"
                style={{
                  transform: `scaleX(${seen ? 1 : 0})`,
                  transitionDelay: `${i * 260}ms`,
                }}
              />
            </div>
          ))}
        </div>

        <p
          className="mt-12 text-center font-sans text-2xl font-semibold leading-tight tracking-tight text-obsidian transition-all duration-700 md:text-3xl"
          style={{
            opacity: seen ? 1 : 0,
            transform: `translateY(${seen ? 0 : 8}px)`,
            transitionDelay: "1000ms",
          }}
        >
          Sound familiar?{" "}
          <span className="font-serif italic font-medium">It shouldn&apos;t.</span>
        </p>
      </div>
    </section>
  );
}
