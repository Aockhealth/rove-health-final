"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryBadge {
  /** Small line above the emphasis, e.g. "clinically". */
  kicker?: string;
  /** The line that carries the weight, e.g. "dosed". */
  emphasis: string;
  /** Optional third line, e.g. "FSSAI". */
  footer?: string;
}

/**
 * Product shot with the badges printed onto the image and arrows for the rest
 * of the roll — the layout the buy box on this page is built around. Swipe is
 * handled on touch so the arrows are decoration on a phone, not the only way
 * through.
 */
export function ProductGallery({
  image,
  alt,
  gallery = [],
  badges = [],
}: {
  image: string;
  alt: string;
  gallery?: string[];
  badges?: GalleryBadge[];
}) {
  const shots = [image, ...gallery];
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const go = (delta: number) =>
    setActive((i) => (i + delta + shots.length) % shots.length);

  return (
    <div>
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-[20px] bg-taupe-light md:aspect-[4/5]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        {shots.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? alt : `${alt} — view ${i + 1}`}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            priority={i === 0}
            className={cn(
              "object-cover transition-opacity duration-500",
              active === i ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        {/* Badges are printed on the shot, not listed beside it. */}
        {badges.length > 0 && (
          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between md:inset-x-6 md:top-6">
            {badges.slice(0, 2).map((badge, i) => (
              <span
                key={badge.emphasis}
                className={cn(
                  "flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full px-2 text-center md:h-[104px] md:w-[104px]",
                  i === 0
                    ? "bg-white/80 text-obsidian/70 backdrop-blur-sm"
                    : "bg-sage-teal-light/85 text-sage-teal backdrop-blur-sm",
                  badges.length === 1 && "mr-auto"
                )}
              >
                {badge.kicker && (
                  <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.14em] md:text-[9px]">
                    {badge.kicker}
                  </span>
                )}
                <span className="font-serif text-[13px] italic font-medium leading-tight md:text-[15px]">
                  {badge.emphasis}
                </span>
                {badge.footer && (
                  <span className="mt-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.14em] md:text-[9px]">
                    {badge.footer}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {shots.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-obsidian shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-sm transition hover:bg-white md:left-5 md:h-11 md:w-11"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-obsidian shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-sm transition hover:bg-white md:right-5 md:h-11 md:w-11"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
          </>
        )}
      </div>

      {shots.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${shots.length}`}
              aria-current={active === i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                active === i ? "w-6 bg-obsidian" : "w-1.5 bg-obsidian/25 hover:bg-obsidian/45"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
