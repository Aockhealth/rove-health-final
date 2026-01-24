export function calculatePhase(
    targetDate: Date,
    lastPeriodStart: string,
    cycleLength: number = 28,
    periodLength: number = 5
) {
    const start = new Date(lastPeriodStart);
    const d = new Date(targetDate);
    const s = new Date(start);
    d.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);

    const diffTime = d.getTime() - s.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle += cycleLength;

    // Calculate Next Period Date
    const completedCycles = Math.floor(diffDays / cycleLength);
    const nextCycleIndex = diffDays >= 0 ? completedCycles + 1 : 0;

    // Determine next period date
    const daysUntilNext = cycleLength - dayInCycle + 1;
    const nextPeriod = new Date(d);
    nextPeriod.setDate(d.getDate() + daysUntilNext);
    const nextPeriodDate = nextPeriod.toISOString().split('T')[0];

    const estimatedOvulationDay = cycleLength - 14;

    const response = {
        day: dayInCycle,
        nextPeriodDate,
        daysSinceLastPeriod: diffDays
    };

    if (dayInCycle <= periodLength) return { ...response, phase: "Menstrual" };
    if (dayInCycle < (estimatedOvulationDay - 1)) return { ...response, phase: "Follicular" };
    if (dayInCycle <= (estimatedOvulationDay + 1)) return { ...response, phase: "Ovulatory" };
    return { ...response, phase: "Luteal" };
}
