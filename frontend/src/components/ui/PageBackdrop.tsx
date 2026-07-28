import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Full-bleed section background, image swappable via a single prop.
 */
export function PageBackdrop({
  image,
  alt,
  scrimClassName = "bg-obsidian/70",
}: {
  image: string;
  alt: string;
  scrimClassName?: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="ken-burns absolute inset-0">
        <Image src={image} alt={alt} fill className="object-cover" />
      </div>
      <div className={cn("absolute inset-0", scrimClassName)} />
    </div>
  );
}
