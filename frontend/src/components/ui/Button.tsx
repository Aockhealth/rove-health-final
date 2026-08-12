import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-sans text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // The signature CTA: one flat high-chroma lime on an otherwise
        // warm-neutral page. Always obsidian ink — white on lime is 1.13:1
        // and completely unreadable.
        // The taupe-dark hairline is not decoration: lime is only 1.04-1.13:1
        // against paper / taupe-light / white-bone, so without a boundary the
        // control has no discernible edge (WCAG 1.4.11 wants 3:1). taupe-dark
        // reaches 3.48:1 on the taupe-light band, 3.88:1 on paper, 4.08:1 on
        // white-bone — and 3.61:1 against the lime fill, so it reads as an edge
        // rather than a smudge. rove-lime-deep and obsidian/15 both top out at
        // 1.30:1 on the band, so neither actually solves it.
        default:
          "bg-rove-lime text-obsidian border border-taupe-dark hover:bg-rove-lime-deep",
        // For placing on top of lime or on photography, where the lime
        // itself would have nothing to contrast against.
        dark: "bg-obsidian text-paper hover:bg-rove-plum",
        outline: "border border-obsidian/25 text-obsidian hover:bg-obsidian/5",
        ghost: "text-obsidian hover:bg-obsidian/5",
        secondary: "bg-white-bone text-obsidian hover:bg-taupe-light",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, href, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
