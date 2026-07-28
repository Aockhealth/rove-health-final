import { cn } from "@/lib/utils";

const PHASE_GLOWS = {
  menstrual: "blob-glow-menstrual",
  follicular: "blob-glow-follicular",
  ovulatory: "blob-glow-ovulatory",
  luteal: "blob-glow-luteal",
} as const;

export function AnimatedBackground({
  phases = ["menstrual", "luteal"],
  className,
}: {
  phases?: Array<keyof typeof PHASE_GLOWS>;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className={cn("blob-glow -top-1/4 -left-1/4 h-[36rem] w-[36rem]", PHASE_GLOWS[phases[0]])}
      />
      <div
        className={cn(
          "blob-glow -bottom-1/4 -right-1/4 h-[30rem] w-[30rem]",
          PHASE_GLOWS[phases[1] ?? phases[0]]
        )}
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}
