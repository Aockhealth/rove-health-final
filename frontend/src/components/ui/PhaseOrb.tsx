import { OrbCenterContent } from "@/components/ui/OrbCenterContent";

const CYCLE_GRADIENT =
  "conic-gradient(from 0deg, #af6b6b, #8daa9d, #d4a25f, #7b82a8, #af6b6b)";

/**
 * `size` is a ceiling, not a fixed width. On narrow screens the orb caps at a
 * share of the viewport instead of eating three quarters of it — every inner
 * measurement is a percentage so the whole thing scales as one piece.
 */
export function PhaseOrb({ size = 280, className = "" }: { size?: number; className?: string }) {
  const dimension = `min(${size}px, 56vw)`;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-hidden
    >
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          inset: "-18%",
          background:
            "radial-gradient(circle, rgba(198,143,63,0.28) 0%, rgba(175,107,107,0.14) 45%, transparent 75%)",
        }}
      />

      <div className="orb-ring orb-ring-outer" style={{ background: CYCLE_GRADIENT }} />
      <div className="orb-ring orb-ring-inner" style={{ background: CYCLE_GRADIENT }} />

      <div className="absolute rounded-full bg-white-bone shadow-sm" style={{ inset: "18%" }} />
      <OrbCenterContent />
    </div>
  );
}
