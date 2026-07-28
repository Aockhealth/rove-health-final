import { cn } from "@/lib/utils";

export interface RiverItem {
  label: string;
  colorClass: string;
}

export function River({
  items,
  reverse = false,
  durationSeconds = 90,
  className,
}: {
  items: RiverItem[];
  reverse?: boolean;
  durationSeconds?: number;
  className?: string;
}) {
  // Repeat the set enough times that one "segment" alone is wider than any
  // realistic viewport — otherwise the doubled track is narrower than the
  // screen and the marquee shows blank space instead of a continuous flow.
  const REPEATS = 6;
  const segment = Array.from({ length: REPEATS }, () => items).flat();
  const track = [...segment, ...segment];

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn("river-track", reverse && "river-track-reverse")}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {track.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border bg-white px-5 py-2.5 font-sans text-sm font-medium whitespace-nowrap",
              item.colorClass
            )}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
