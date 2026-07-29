"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

export interface Job {
  /** On-pack function name, verbatim from the carton. */
  label: string;
  /** Short human line — the felt version. */
  scene: string;
  /** The single strongest verified finding, compressed. */
  headline: ReactNode;
  /** Ingredients doing the work. */
  actives: string[];
  /** Honest dose/design hedge. */
  hedge: string;
}

export function FourJobs({ jobs }: { jobs: Job[] }) {
  const [open, setOpen] = useState(0);
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
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div ref={ref}>
      {/* One bar per job — length is fixed and equal; this is a selector, not a data chart. */}
      <div className="flex gap-1.5" aria-hidden>
        {jobs.map((job, i) => (
          <span
            key={job.label}
            className={cn(
              "h-1 flex-1 origin-left transition-all duration-700 ease-out",
              open === i ? "bg-obsidian" : "bg-obsidian/15"
            )}
            style={{
              transform: shown ? "scaleX(1)" : "scaleX(0)",
              transitionDelay: `${i * 110}ms`,
            }}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2" role="tablist" aria-label="Four functions">
        {jobs.map((job, i) => (
          <button
            key={job.label}
            type="button"
            role="tab"
            aria-selected={open === i}
            onClick={() => setOpen(i)}
            className={cn(
              "font-sans text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
              open === i ? "text-obsidian" : "text-obsidian/70 hover:text-obsidian"
            )}
          >
            {job.label}
          </button>
        ))}
      </div>

      {jobs.map((job, i) => (
        <div
          key={job.label}
          role="tabpanel"
          hidden={open !== i}
          className={cn("mt-9", open === i && "animate-fade-in")}
        >
          <p className="font-sans text-2xl font-semibold leading-snug tracking-tight text-obsidian md:text-3xl">
            {job.scene}
          </p>
          <p className="mt-5 max-w-[46ch] font-sans text-base leading-[1.7] text-obsidian/70">
            {job.headline}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {job.actives.map((a) => (
              <span
                key={a}
                className="border border-obsidian/12 px-2.5 py-1 font-sans text-[11px] font-medium tabular-nums text-obsidian/70"
              >
                {a}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-[52ch] border-t border-obsidian/12 pt-4 font-sans text-xs italic leading-relaxed text-obsidian/70">
            {job.hedge}
          </p>
        </div>
      ))}
    </div>
  );
}
