import { River } from "@/components/ui/River";

const ROW_ONE = [
  { label: "Rest without guilt", colorClass: "border-phase-menstrual/20 text-phase-menstrual" },
  { label: "Rise without rushing", colorClass: "border-phase-follicular/20 text-phase-follicular" },
  { label: "Glow without apology", colorClass: "border-phase-ovulatory/20 text-phase-ovulatory" },
  { label: "Release without shame", colorClass: "border-phase-luteal/20 text-phase-luteal" },
  { label: "Live in rhythm, not resistance", colorClass: "border-obsidian/10 text-obsidian" },
];

const ROW_TWO = [
  { label: "Heard, not dismissed", colorClass: "border-phase-menstrual/20 text-phase-menstrual" },
  { label: "Understood, not managed", colorClass: "border-phase-follicular/20 text-phase-follicular" },
  { label: "Confident in your own body", colorClass: "border-phase-ovulatory/20 text-phase-ovulatory" },
  { label: "At ease with your own cycle", colorClass: "border-phase-luteal/20 text-phase-luteal" },
  { label: "In sync, not in spite of it", colorClass: "border-obsidian/10 text-obsidian" },
];

export function RiverMoment() {
  return (
    <section className="py-14 md:py-20">
      <div className="flex flex-col gap-4">
        <River
          items={ROW_ONE}
          durationSeconds={95}
          className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        />
        <River
          items={ROW_TWO}
          reverse
          durationSeconds={110}
          className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        />
      </div>
    </section>
  );
}
