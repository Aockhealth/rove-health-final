import { Reveal } from "@/components/ui/Reveal";

const MOMENTS = [
  {
    time: "7:00 AM",
    body: "Morning notification: “Luteal Day 5. Progesterone is peaking. Energy may dip by 3 PM. Here's your plan.”",
  },
  {
    time: "8:00 AM",
    body: "A curated ragi porridge with roasted pumpkin seeds and a jaggery-date smoothie: phased, glycaemic-controlled, protein-prioritised.",
  },
  {
    time: "12:00 PM",
    body: "A 20-minute somatic yoga flow instead of the usual HIIT session.",
  },
  {
    time: "3:00 PM",
    body: "Pre-empts the afternoon crash: “Try roasted chana with a cup of spearmint tea right now.”",
  },
  {
    time: "8:00 PM",
    body: "Symptoms logged. The app notices bloating correlates with dairy, and adjusts tonight's plan.",
  },
  {
    time: "3 cycles later",
    body: "The app has learned: bloating drops when dairy is avoided on Luteal Days 3–7, and adjusts future plans automatically.",
  },
];

export function DayTimeline() {
  return (
    <div className="mx-auto max-w-3xl">
      {MOMENTS.map((m, i) => (
        <Reveal key={m.time} delay={i * 90}>
          <div className="grid gap-2 border-t border-obsidian/12 py-7 last:border-b md:grid-cols-[9rem_1fr] md:gap-8 md:py-8">
            <span className="font-sans text-[11px] font-semibold uppercase tabular-nums tracking-[0.16em] text-obsidian/70">
              {m.time}
            </span>
            <p className="max-w-[54ch] font-sans text-base leading-[1.75] text-obsidian md:text-lg">
              {m.body}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
