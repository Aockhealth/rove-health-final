export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export function calculatePhase(
  targetDate: Date,
  lastPeriodStart: string,
  cycleLength: number = 28,
  periodLength: number = 5
): { phase: Phase; day: number } {
  const start = new Date(lastPeriodStart);
  const d = new Date(targetDate);
  const s = new Date(start);

  d.setHours(0, 0, 0, 0);
  s.setHours(0, 0, 0, 0);

  const diffTime = d.getTime() - s.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let dayInCycle = (diffDays % cycleLength) + 1;
  if (dayInCycle <= 0) dayInCycle += cycleLength;

  const estimatedOvulationDay = cycleLength - 14;

  if (dayInCycle <= periodLength) return { phase: "Menstrual", day: dayInCycle };
  if (dayInCycle < estimatedOvulationDay - 1) return { phase: "Follicular", day: dayInCycle };
  if (dayInCycle <= estimatedOvulationDay + 1) return { phase: "Ovulatory", day: dayInCycle };
  return { phase: "Luteal", day: dayInCycle };
}
