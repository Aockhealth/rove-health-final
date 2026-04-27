import { calculatePhase } from "./shared/cycle/phase";

const settings = {
    last_period_start: "2026-02-25",
    cycle_length_days: 28,
    period_length_days: 5
};

const monthLogs = {
    "2026-02-25": { date: "2026-02-25", is_period: true },
    "2026-03-24": { date: "2026-03-24", is_period: false },
};

console.log("Without false:");
console.log(calculatePhase(new Date("2026-03-24"), settings, { "2026-02-25": { date: "2026-02-25", is_period: true } }));

console.log("\nWith false:");
console.log(calculatePhase(new Date("2026-03-24"), settings, monthLogs));

// Wait, the complaint is:
// "if i log period today again future date are not auto changing to menses whereas they should"
// Let's test what happens when I log today + 1 (future date)
const monthLogs2 = {
    "2026-02-25": { date: "2026-02-25", is_period: true }
};
console.log("\nFuture date (Feb 26) with only today logged:");
console.log(calculatePhase(new Date("2026-02-26"), settings, monthLogs2));
