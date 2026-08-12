import { OrbCenterContent } from "@/components/ui/OrbCenterContent";

/**
 * The four phase hues, read from the token system rather than repeated as
 * literals, so the brand mark can never desync from the palette the app shares.
 *
 * These use the `--phase-*-rgb` triples from globals.css rather than
 * `var(--color-phase-*)` on purpose: globals.css declares its colours in
 * `@theme inline`, which inlines the hex into utility classes and does NOT
 * publish `--color-*` as runtime custom properties — `var(--color-phase-luteal)`
 * resolves to nothing in an inline style. The rgb triples are declared in a
 * plain `:root` block, so they do resolve. rgb(175,107,107) etc. are the exact
 * values of the hexes they replace, so nothing here renders differently.
 */
const CYCLE_GRADIENT =
  "conic-gradient(from 0deg, rgb(var(--phase-menstrual-rgb)), rgb(var(--phase-follicular-rgb)), rgb(var(--phase-ovulatory-rgb)), rgb(var(--phase-luteal-rgb)), rgb(var(--phase-menstrual-rgb)))";

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
          // The inner stop is a hand-darkened gold that matches no token —
          // deliberately left literal, because pulling it to rove-gold would
          // visibly lighten the halo.
          background:
            "radial-gradient(circle, rgba(198,143,63,0.28) 0%, rgba(var(--phase-menstrual-rgb),0.14) 45%, transparent 75%)",
        }}
      />

      <div className="orb-ring orb-ring-outer" style={{ background: CYCLE_GRADIENT }} />
      <div className="orb-ring orb-ring-inner" style={{ background: CYCLE_GRADIENT }} />

      <div className="absolute rounded-full bg-white-bone shadow-sm" style={{ inset: "18%" }} />
      <OrbCenterContent />
    </div>
  );
}
