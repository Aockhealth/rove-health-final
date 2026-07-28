import { OrbCenterContent } from "@/components/ui/OrbCenterContent";

const CYCLE_GRADIENT =
  "conic-gradient(from 0deg, #af6b6b, #8daa9d, #d4a25f, #7b82a8, #af6b6b)";

export function PhaseOrb({ size = 280, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden>
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          inset: `-${size * 0.18}px`,
          background:
            "radial-gradient(circle, rgba(198,143,63,0.28) 0%, rgba(175,107,107,0.14) 45%, transparent 75%)",
        }}
      />

      <div className="orb-ring orb-ring-outer" style={{ background: CYCLE_GRADIENT }} />
      <div className="orb-ring orb-ring-inner" style={{ background: CYCLE_GRADIENT }} />

      <div className="absolute rounded-full bg-white-bone shadow-sm" style={{ inset: "18%" }} />
      <OrbCenterContent logoSize={Math.round(size * 0.22)} />
    </div>
  );
}
