"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  image,
  alt,
  gallery = [],
}: {
  image: string;
  alt: string;
  gallery?: string[];
}) {
  const shots = [image, ...gallery];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-taupe-light">
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
      </div>

      {shots.length > 1 && (
        <div className="mt-4 flex gap-3">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${shots.length}`}
              aria-current={active === i}
              className={cn(
                "relative aspect-square flex-1 overflow-hidden rounded-[12px] ring-1 ring-obsidian/10 transition-opacity",
                active === i ? "ring-2 ring-obsidian" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
