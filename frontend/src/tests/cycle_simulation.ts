
import { calculatePhase, CycleSettings, DailyLog, formatDate } from "@shared/cycle/phase";

// ===================================
// TEST UTILS
// ===================================

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

interface SimulatedUser {
    id: number;
    settings: CycleSettings;
    logs: Record<string, DailyLog>;
}

// ===================================
// GENERATORS
// ===================================

function generateUser(id: number): SimulatedUser {
    // Generate realistic cycle parameters
    const cycleLength = randomInt(21, 35);
    const periodLength = randomInt(3, 7);
    const lutealLength = randomInt(10, 16);

    // Initial last period start (randomly within last 2 cycles)
    const today = new Date();
    const cyclesAgo = randomInt(0, 2);
    const daysAgo = (cyclesAgo * cycleLength) + randomInt(0, cycleLength - 1);

    const lastPeriodStart = new Date(today);
    lastPeriodStart.setDate(today.getDate() - daysAgo);

    const settings: CycleSettings = {
        last_period_start: formatDate(lastPeriodStart),
        cycle_length_days: cycleLength,
        period_length_days: periodLength,
        luteal_length_days: lutealLength
    };

    // Generate initial logs based on settings
    const logs: Record<string, DailyLog> = {};

    // Log the "last period" streak
    const current = new Date(lastPeriodStart);
    for (let i = 0; i < periodLength; i++) {
        const dateStr = formatDate(current);
        logs[dateStr] = { date: dateStr, is_period: true };
        current.setDate(current.getDate() + 1);
    }

    return { id, settings, logs };
}

// ===================================
// TEST LOGIC
// ===================================

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string) {
    if (condition) {
        passed++;
    } else {
        failed++;
        failures.push(message);
    }
}

function runSimulation() {
    console.log("🚀 Starting Comprehensive Cycle Simulation (100 Users)...");

    const users: SimulatedUser[] = [];
    for (let i = 0; i < 100; i++) {
        users.push(generateUser(i + 1));
    }

    users.forEach(user => {
        const { settings, logs } = user;
        const today = new Date(); // Use real today for simplicity in relative checks

        // --- TEST 1: Baseline Calculation ---
        const result = calculatePhase(today, settings, logs);

        // Validate basic constraints
        assert(result.phase !== null, `User ${user.id}: Phase should not be null given valid data`);
        assert(result.day > 0, `User ${user.id}: Day should be > 0`);

        // Validate specific phase logic based on "days ago"
        const start = new Date(settings.last_period_start);
        const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const dayInCycle = (diffDays % settings.cycle_length_days) + 1;

        // Check Menstrual
        if (dayInCycle <= settings.period_length_days) {
            // Check if explicitly NOT period (not possible in this generator yet)
            assert(result.phase === "Menstrual", `User ${user.id}: Day ${dayInCycle} should be Menstrual`);
        }

        // Check Ovulatory (approx)
        const ovulationDay = settings.cycle_length_days - (settings.luteal_length_days || 14);
        if (dayInCycle === ovulationDay) {
            assert(result.phase === "Ovulatory", `User ${user.id}: Day ${dayInCycle} (Ovulation Day) should be Ovulatory`);
        }

        // --- TEST 2: Update Scenario (User changes period date) ---
        // Simulate user realizing their period actually started 2 days LATER
        const originalStart = new Date(settings.last_period_start);
        const newStart = new Date(originalStart);
        newStart.setDate(newStart.getDate() + 2); // Shifted forward

        // Create new logs for this shifted period
        const newLogs = { ...logs };

        // Remove old logs (simulated)
        // In reality, user might just add new ones, but let's clear old ones for cleaner test
        for (let i = 0; i < settings.period_length_days; i++) {
            const d = new Date(originalStart);
            d.setDate(d.getDate() + i);
            delete newLogs[formatDate(d)];
        }

        // Add new logs
        const current = new Date(newStart);
        for (let i = 0; i < settings.period_length_days; i++) {
            const dateStr = formatDate(current);
            newLogs[dateStr] = { date: dateStr, is_period: true };
            current.setDate(current.getDate() + 1);
        }

        // We assume settings.last_period_start is updated to newStart OR the calculator finds it from logs
        // The calculator logic prioritizes LOGS over settings.
        // So even if settings still say old date, the logs (if closer?) might override?
        // Actually, `getRelevantPeriodStart` prioritizes logs.

        const newResult = calculatePhase(today, settings, newLogs);

        // The day in cycle should be roughly 2 days LESS than before (since start moved forward)
        // (Unless we wrapped around a cycle, but let's assume we are in same cycle)
        if (diffDays < settings.cycle_length_days && diffDays > 5) {
            // Logic check:
            // Old start: Day 10
            // New start: Day 10 + 2 = Day 12 (wait, if start moved forward, today is CLOSER to start)
            // Example: Today is 15th. Old sit: 1st. Day = 15.
            // New start: 3rd. Day = 13.
            // So day should utilize new start.

            // The calculator should pick up the NEW start from `newLogs`.

            const expectedNewDay = dayInCycle - 2;
            if (expectedNewDay > 0) {
                assert(newResult.day === expectedNewDay, `User ${user.id}: Update Sync Failed. Expected day ${expectedNewDay}, got ${newResult.day}`);
            }
        }
    });

    console.log("\n--- Simulation Summary ---");
    console.log(`Total Checks: ${passed + failed}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failures.length > 0) {
        console.log("\n--- Failures ---");
        failures.slice(0, 10).forEach(f => console.log(f)); // Show first 10
        if (failures.length > 10) console.log(`...and ${failures.length - 10} more.`);
    }
}

runSimulation();
