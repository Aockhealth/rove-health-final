import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A single line of pills drifting sideways, the same river the home page uses.
 *
 * The list is repeated enough times to outrun any viewport, then doubled so the
 * loop is seamless. Hovering or focusing anything inside stops the track, so a
 * moving pill is never something you have to chase.
 *
 * `min-w-0` is load-bearing: the track is `width: max-content`, and without it
 * that width leaks out and stretches whatever grid column the river sits in.
 * `renderItem` receives `decorative` for the repeated copies — mark those
 * `aria-hidden` (and `tabIndex={-1}` if they're interactive) so assistive tech
 * hears the list once instead of eight times.
 */
export function RiverRow<T>({
  items,
  renderItem,
  reverse = false,
  durationSeconds = 44,
  repeats = 4,
  className,
}: {
  items: T[];
  renderItem: (item: T, decorative: boolean, index: number) => ReactNode;
  reverse?: boolean;
  durationSeconds?: number;
  repeats?: number;
  className?: string;
}) {
  if (items.length === 0) return null;

  const segment = Array.from({ length: repeats }, () => items).flat();
  const track = [...segment, ...segment];

  return (
    <div
      className={cn(
        "relative -mx-6 min-w-0 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:overflow-hidden md:px-0 [&::-webkit-scrollbar]:hidden",
        className
      )}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 24px, black calc(100% - 40px), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 24px, black calc(100% - 40px), transparent)",
      }}
    >
      <div
        className={cn(
          "river-track hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]",
          reverse && "river-track-reverse"
        )}
        style={{ animationDuration: `${durationSeconds}s`, gap: "0.5rem" }}
      >
        {track.map((item, i) => renderItem(item, i >= items.length, i))}
      </div>
    </div>
  );
}
