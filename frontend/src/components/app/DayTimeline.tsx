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
    <div className="mx-auto max-w-2xl">
      <div className="relative border-l border-obsidian/15 pl-8">
        {MOMENTS.map((m) => (
          <div key={m.time} className="relative pb-9 last:pb-0">
            <span className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-obsidian" />
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-obsidian/50">
              {m.time}
            </span>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-obsidian/80">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
