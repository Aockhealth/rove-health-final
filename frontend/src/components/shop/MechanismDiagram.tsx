import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Inflammation" },
  { id: 2, label: "Insulin Resistance" },
  { id: 3, label: "Excess Insulin" },
  { id: 4, label: "High Androgens" },
  { id: 5, label: "Follicular Arrest" },
  { id: 6, label: "Anovulation" },
];

export function MechanismDiagram({ className }: { className?: string }) {
  // SVG viewBox and center
  const size = 500;
  const center = size / 2;
  const radius = 130;

  return (
    <div className={cn("relative mx-auto flex w-full max-w-md flex-col items-center", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {/* Draw the connecting circular dashed line */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-obsidian/15"
          strokeDasharray="4 4"
        />

        {/* Draw nodes and labels */}
        {STEPS.map((step, index) => {
          // Calculate angle for 6 nodes. We start at the top (-90 degrees).
          const angle = (index * (360 / STEPS.length)) - 90;
          const angleRad = (angle * Math.PI) / 180;
          
          const x = center + radius * Math.cos(angleRad);
          const y = center + radius * Math.sin(angleRad);

          // Calculate label offsets
          const labelOffset = 30;
          const lx = center + (radius + labelOffset) * Math.cos(angleRad);
          const ly = center + (radius + labelOffset) * Math.sin(angleRad);

          // Adjust text anchor based on x position
          let textAnchor: "middle" | "start" | "end" = "middle";
          if (Math.abs(Math.cos(angleRad)) > 0.1) {
            textAnchor = Math.cos(angleRad) > 0 ? "start" : "end";
          }

          // Calculate arrow position (slightly before the node)
          const arrowAngle = angle - 15;
          const arrowAngleRad = (arrowAngle * Math.PI) / 180;
          const ax = center + radius * Math.cos(arrowAngleRad);
          const ay = center + radius * Math.sin(arrowAngleRad);
          // Tangent angle for the arrow direction (clockwise motion)
          const arrowRotation = arrowAngle + 90;

          return (
            <g key={step.id}>
              {/* Arrowhead */}
              <polygon
                points="-5,-4 3,0 -5,4"
                fill="currentColor"
                className="text-obsidian/25"
                transform={`translate(${ax}, ${ay}) rotate(${arrowRotation})`}
              />
              {/* Point Node */}
              <circle
                cx={x}
                cy={y}
                r={6}
                className="fill-obsidian"
              />
              {/* Outer halo */}
              <circle
                cx={x}
                cy={y}
                r={12}
                className="fill-obsidian/12"
              />
              
              {/* Label */}
              <text
                x={lx}
                y={ly + 4} // slight vertical adjustment
                textAnchor={textAnchor}
                className="fill-obsidian font-sans text-xs font-semibold tracking-tight sm:text-sm"
              >
                {step.label}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Central Intervention text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian">
          Balance
        </span>
        <p className="mt-2 font-serif text-sm italic leading-tight text-obsidian/70">
          Breaks the cycle at its root by supporting insulin sensitivity.
        </p>
      </div>
    </div>
  );
}
