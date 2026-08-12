import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        // The phase hue stays as the /15 wash — that is what carries the
        // colour coding — but the ink is obsidian. Self-tinted labels (hue on a
        // 15% wash of itself) ran 1.79-3.43:1 at 11px; obsidian on the same
        // washes measures 11.88-14.54:1 on every surface in the palette.
        // phase-ovulatory-text was tried first for the two gold variants and
        // only reaches 3.75:1 on the taupe-light band, so it does not clear AA
        // at this size either.
        neutral: "bg-obsidian/8 text-obsidian",
        menstrual: "bg-phase-menstrual/15 text-obsidian",
        follicular: "bg-phase-follicular/15 text-obsidian",
        ovulatory: "bg-phase-ovulatory/15 text-obsidian",
        luteal: "bg-phase-luteal/15 text-obsidian",
        balance: "bg-rove-gold/15 text-obsidian",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
