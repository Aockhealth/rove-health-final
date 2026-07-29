"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function RuleDraw({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  const reduced = useReducedMotion();
  const drawn = reduced || seen;

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
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn("block h-px w-full origin-left bg-obsidian/20 transition-transform duration-700 ease-out", className)}
      style={{ transform: drawn ? "scaleX(1)" : "scaleX(0)" }}
    />
  );
}
