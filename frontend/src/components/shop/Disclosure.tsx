import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The shop page's compression valve. Deliberately a native <details> rather
 * than a state-driven panel: the content stays in the DOM for search engines
 * and for anyone without JS, and it costs no hydration on a page that already
 * ships several client components.
 */
export function Disclosure({
  label,
  hint,
  children,
  defaultOpen = false,
  /** "row" stacks into a bordered list; "inline" tucks inside a card. */
  variant = "row",
  className,
}: {
  label: string;
  /** Optional right-aligned counter, e.g. "15 ingredients". */
  hint?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: "row" | "inline";
  className?: string;
}) {
  const inline = variant === "inline";

  return (
    <details
      open={defaultOpen}
      className={cn(
        "group",
        inline ? "border-t border-obsidian/10" : "border-t border-obsidian/15 last:border-b",
        className
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden",
          inline ? "py-3.5" : "py-5"
        )}
      >
        <span
          className={cn(
            "font-sans font-medium tracking-tight text-obsidian",
            inline ? "text-xs uppercase tracking-[0.1em] text-obsidian/70" : "text-base md:text-lg"
          )}
        >
          {label}
        </span>
        {hint && (
          <span className="ml-auto font-sans text-[11px] uppercase tracking-[0.14em] text-obsidian/65">
            {hint}
          </span>
        )}
        <span
          aria-hidden
          className={cn(
            "shrink-0 font-sans font-normal leading-none text-obsidian/70 transition-transform duration-300 group-open:rotate-45",
            inline ? "text-base" : "text-xl",
            !hint && "ml-auto"
          )}
        >
          +
        </span>
      </summary>
      <div className={inline ? "pb-4" : "pb-10"}>{children}</div>
    </details>
  );
}
