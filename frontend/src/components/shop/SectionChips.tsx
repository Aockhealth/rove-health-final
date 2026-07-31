import { HelpCircle } from "lucide-react";
import { RiverRow } from "@/components/ui/RiverRow";

export interface SectionChip {
  label: string;
  /** In-page anchor, e.g. "#directions". */
  href: string;
}

/**
 * The questions people stall on, drifting past in a single line — each one jumps
 * to the section that answers it in full. Runs against the pill river above it
 * so the two lines read as a current rather than a conveyor belt.
 *
 * The repeated copies stay clickable but are kept out of the tab order and off
 * assistive tech, so a keyboard or screen reader meets each question once.
 */
export function SectionChips({ chips }: { chips: SectionChip[] }) {
  return (
    <RiverRow
      items={chips}
      reverse
      durationSeconds={44}
      renderItem={({ label, href }, decorative, i) => (
        <a
          key={`${href}-${i}`}
          href={href}
          aria-hidden={decorative || undefined}
          tabIndex={decorative ? -1 : undefined}
          className="flex shrink-0 items-center gap-2 rounded-full border border-rove-red/40 px-4 py-2.5 font-sans text-xs whitespace-nowrap text-rove-red transition-colors hover:border-rove-red hover:bg-rove-red/[0.06]"
        >
          <HelpCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          {label}
        </a>
      )}
    />
  );
}
