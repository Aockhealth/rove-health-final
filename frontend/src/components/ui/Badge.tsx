import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        neutral: "bg-obsidian/8 text-obsidian",
        menstrual: "bg-phase-menstrual/15 text-phase-menstrual",
        follicular: "bg-phase-follicular/15 text-phase-follicular",
        ovulatory: "bg-phase-ovulatory/15 text-phase-ovulatory",
        luteal: "bg-phase-luteal/15 text-phase-luteal",
        balance: "bg-rove-gold/15 text-rove-gold",
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
