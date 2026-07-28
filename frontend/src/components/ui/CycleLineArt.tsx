/**
 * Original fine-line illustration in the spirit of vintage botanical/anatomical
 * engravings — thin strokes, sparse stippling, restrained monochrome. Themed
 * around Rove's own cycle/orbit motif rather than literal anatomy.
 */
export function CycleLineArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 800"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g stroke="currentColor" strokeLinecap="round">
        <path
          d="M120 760 C 260 700, 300 600, 260 520 C 220 440, 300 400, 380 430 C 470 465, 470 380, 400 340 C 330 300, 340 220, 430 210 C 520 200, 540 120, 470 60"
          strokeWidth="1.6"
          opacity="0.6"
        />
        <path
          d="M180 780 C 300 730, 330 640, 300 560 C 270 480, 340 440, 410 470 C 490 505, 500 420, 430 385"
          strokeWidth="1"
          opacity="0.35"
        />
        <path
          d="M470 60 C 560 40, 640 80, 660 160 C 680 240, 620 280, 560 250"
          strokeWidth="1.6"
          opacity="0.55"
        />
        <path
          d="M560 250 C 640 260, 700 320, 690 400 C 680 480, 610 500, 560 460"
          strokeWidth="1.3"
          opacity="0.45"
        />
        <path
          d="M560 460 C 630 480, 670 550, 640 620 C 610 690, 530 700, 490 650"
          strokeWidth="1"
          opacity="0.35"
        />

        {/* Solid accent nodes — give the piece real graphic weight instead of uniform faint lines */}
        <circle cx="470" cy="60" r="19" fill="currentColor" opacity="0.9" stroke="none" />
        <circle cx="502" cy="40" r="6" fill="currentColor" opacity="0.55" stroke="none" />
        <circle cx="437" cy="38" r="4" opacity="0.4" />

        <circle cx="400" cy="340" r="11" fill="currentColor" opacity="0.7" stroke="none" />
        <circle cx="423" cy="362" r="4" opacity="0.35" />

        <circle cx="660" cy="160" r="10" fill="currentColor" opacity="0.75" stroke="none" />
        <circle cx="681" cy="186" r="4" opacity="0.35" />

        <circle cx="690" cy="400" r="12" fill="currentColor" opacity="0.7" stroke="none" />
        <circle cx="716" cy="416" r="4.5" opacity="0.35" />

        <circle cx="640" cy="620" r="10" fill="currentColor" opacity="0.6" stroke="none" />
        <circle cx="614" cy="646" r="4" opacity="0.32" />

        <circle cx="260" cy="520" r="8" opacity="0.4" strokeWidth="1.3" />
        <circle cx="380" cy="430" r="6" opacity="0.35" strokeWidth="1.1" />
      </g>
    </svg>
  );
}
