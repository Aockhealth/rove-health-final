import Image from "next/image";
import { cn } from "@/lib/utils";

export function PhoneMockup({
  src = "/app-screenshots/today-snapshot.jpg",
  alt = "The Rove app's Today's Snapshot screen",
  priority = false,
  className,
}: {
  src?: string;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/16] w-56 overflow-hidden rounded-[36px] border-4 border-obsidian bg-taupe-light shadow-xl md:w-64",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        sizes="(max-width: 768px) 224px, 288px"
      />
    </div>
  );
}
