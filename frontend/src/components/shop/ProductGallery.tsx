"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const PLACEHOLDER_SLOTS = ["Ingredients close-up", "Lifestyle shot", "Nutrition label", "Size reference"];

export function ProductGallery({ image, alt }: { image: string; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-taupe-light">
        {active === 0 ? (
          <Image src={image} alt={alt} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-obsidian/30">
            <Camera className="h-10 w-10" />
            <span className="font-sans text-sm font-medium text-obsidian/40">
              {PLACEHOLDER_SLOTS[active - 1]} coming soon
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setActive(0)}
          className={cn(
            "relative aspect-square overflow-hidden rounded-[12px] ring-1 ring-obsidian/10 transition-opacity",
            active === 0 ? "ring-2 ring-obsidian" : "opacity-70 hover:opacity-100"
          )}
        >
          <Image src={image} alt={alt} fill className="object-cover" />
        </button>
        {PLACEHOLDER_SLOTS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActive(i + 1)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-[12px] bg-taupe-light text-obsidian/30 ring-1 ring-obsidian/10 transition-opacity",
              active === i + 1 ? "ring-2 ring-obsidian" : "opacity-70 hover:opacity-100"
            )}
          >
            <Camera className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
