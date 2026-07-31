import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * One quiet line after the problem section. Deliberately not a product grid —
 * the homepage's job is the problem; /shop and /app do the selling.
 */
export function OnwardLinks() {
  return (
    <section className="px-6 py-14 md:py-16">
      <Reveal className="mx-auto flex max-w-3xl flex-col gap-6 border-y border-obsidian/15 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <p className="max-w-[38ch] font-serif text-xl italic font-medium leading-snug text-obsidian md:text-2xl">
          Your hormones shift week to week. The formulas are dosed to those shifts — Cycle Sync
          tells you which one you&apos;re in.
        </p>

        {/* Both doors carry equal weight. Styling one of them down made the app
            read as the consolation prize. */}
        <div className="flex shrink-0 flex-col gap-3">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 font-sans text-sm font-medium text-obsidian underline decoration-obsidian/25 underline-offset-4 hover:decoration-obsidian"
          >
            Shop the formulas
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href="/app"
            className="group inline-flex items-center gap-2 font-sans text-sm font-medium text-obsidian underline decoration-obsidian/25 underline-offset-4 hover:decoration-obsidian"
          >
            Meet Cycle Sync
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
