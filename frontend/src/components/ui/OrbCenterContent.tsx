"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Slide = { type: "logo" } | { type: "word"; text: string; colorClass: string };

const SLIDES: Slide[] = [
  { type: "logo" },
  { type: "word", text: "Rest.", colorClass: "text-phase-menstrual" },
  { type: "word", text: "Rise.", colorClass: "text-phase-follicular" },
  { type: "word", text: "Glow.", colorClass: "text-phase-ovulatory-text" },
  { type: "word", text: "Release.", colorClass: "text-phase-luteal" },
  { type: "word", text: "In sync.", colorClass: "text-obsidian" },
];

export function OrbCenterContent({ logoSize = 64 }: { logoSize?: number }) {
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
      <div key={index} className="animate-fade-in">
        {slide.type === "logo" ? (
          <Image
            src="/brand/mark.png"
            alt="Rove"
            width={logoSize}
            height={logoSize}
            style={{ width: logoSize, height: logoSize }}
            className="object-contain"
          />
        ) : (
          <span className={`font-serif text-3xl italic font-medium ${slide.colorClass}`}>
            {slide.text}
          </span>
        )}
      </div>
    </div>
  );
}
