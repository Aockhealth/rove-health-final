"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function ThreadDraw() {
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
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <span
      ref={ref}
      aria-hidden
      className="mx-auto mt-14 block h-14 w-px origin-top bg-white-bone/20 transition-transform duration-[900ms] ease-out"
      style={{ transform: drawn ? "scaleY(1)" : "scaleY(0)" }}
    />
  );
}
