"use client";

import { useEffect, useState } from "react";
type Slide = { type: "word"; text: string; colorClass: string };

const SLIDES: Slide[] = [
  { type: "word", text: "Heal.", colorClass: "text-phase-menstrual" },
  { type: "word", text: "Build.", colorClass: "text-phase-follicular" },
  { type: "word", text: "Thrive.", colorClass: "text-phase-ovulatory-text" },
  { type: "word", text: "Nourish.", colorClass: "text-phase-luteal" },
  { type: "word", text: "In rhythm.", colorClass: "text-obsidian" },
];

/**
 * Sits inside the orb's white disc. Everything is sized as a percentage of that
 * disc: at a fixed pixel size the mark shrank to about a third of the circle on
 * small screens and read as an image that had failed to load.
 */
export function OrbCenterContent() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className="absolute inset-[18%] flex items-center justify-center overflow-hidden rounded-full">
      <div key={index} className="animate-rise-in flex w-full items-center justify-center">
        <span
          className={`font-serif text-[clamp(1.35rem,5.5vw,1.875rem)] italic font-medium ${slide.colorClass}`}
        >
          {slide.text}
        </span>
      </div>
    </div>
  );
}
