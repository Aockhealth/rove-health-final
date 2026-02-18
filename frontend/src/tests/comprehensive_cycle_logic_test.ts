
// ============================================================================
// INLINED LOGIC FROM @shared/cycle/phase
// ============================================================================

export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export interface CycleSettings {
    last_period_start: string;
    cycle_length_days: number;
    period_length_days: number;
    luteal_length_days?: number; // Optional: defaults to 14
}

export interface DailyLog {
    date: string;
    is_period?: boolean;
}

export interface PhaseResult {
    phase: Phase | null;           // null = insufficient data
    day: number;                   // 0 if no data
    latePeriod: boolean;           // true if past expected cycle length without new period
    confidence: 'low' | 'medium' | 'high';
    dataSource: 'logs' | 'settings' | 'none';
}

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const DEFAULT_LUTEAL_LENGTH = 14;
export const OVULATION_PHASE_WINDOW = 1;
export const FERTILE_WINDOW_BEFORE = 5;
export const FERTILE_WINDOW_AFTER = 2;

export const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const normalizeToLocalMidnight = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const parseLocalDate = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
};

export const daysBetween = (start: Date, end: Date): number => {
    const s = normalizeToLocalMidnight(start);
    const e = normalizeToLocalMidnight(end);
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};

export function findStreakStart(
    targetDateStr: string,
    monthLogs: Record<string, DailyLog>
): string {
    let cur = parseLocalDate(targetDateStr);
    let first = targetDateStr;

    let lookback = 0;
    while (lookback < 45) {
        cur.setDate(cur.getDate() - 1);
        const prevStr = formatDate(cur);
        if (monthLogs[prevStr]?.is_period) {
            first = prevStr;
        } else {
            break;
        }
        lookback++;
    }
    return first;
}

export function getRelevantPeriodStart(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog>
): { start: string | null; source: 'logs' | 'settings' | 'none' } {
    const target = normalizeToLocalMidnight(targetDate);
    const dateStr = formatDate(target);

    // 1. If target date is logged as period, find streak start
    if (monthLogs[dateStr]?.is_period) {
        return { start: findStreakStart(dateStr, monthLogs), source: 'logs' };
    }

    // 2. Find most recent logged period before target date
    const loggedDates = Object.keys(monthLogs)
        .filter(d => monthLogs[d]?.is_period)
        .sort()
        .reverse();

    for (const dStr of loggedDates) {
        if (dStr < dateStr) {
            return { start: findStreakStart(dStr, monthLogs), source: 'logs' };
        }
    }

    // 3. Fall back to settings
    if (settings.last_period_start && settings.last_period_start <= dateStr) {
        return { start: settings.last_period_start, source: 'settings' };
    }

    return { start: null, source: 'none' };
}

export function calculatePhase(
    targetDate: Date,
    settings: CycleSettings,
    monthLogs: Record<string, DailyLog> = {}
): PhaseResult {
    const target = normalizeToLocalMidnight(targetDate);
    const today = normalizeToLocalMidnight(new Date());
    const dateStr = formatDate(target);

    // 1. Explicit OVERRIDE: If logged as period = Menstrual
    if (monthLogs[dateStr]?.is_period === true) {
        const streakStart = findStreakStart(dateStr, monthLogs);
        const start = parseLocalDate(streakStart);
        const diff = daysBetween(start, target);
        return {
            phase: "Menstrual",
            day: diff + 1,
            latePeriod: false,
            confidence: 'high',
            dataSource: 'logs'
        };
    }

    // 2. Find relevant period start
    const { start: relevantStart, source } = getRelevantPeriodStart(target, settings, monthLogs);

    // 3. Handle no data
    if (!relevantStart) {
        return {
            phase: null,
            day: 0,
            latePeriod: false,
            confidence: 'low',
            dataSource: 'none'
        };
    }

    const start = parseLocalDate(relevantStart);
    const diffDays = daysBetween(start, target);

    const cycleLength = settings.cycle_length_days || DEFAULT_CYCLE_LENGTH;
    const periodLength = settings.period_length_days || DEFAULT_PERIOD_LENGTH;
    const lutealLength = settings.luteal_length_days || DEFAULT_LUTEAL_LENGTH;
    const ovulationDay = cycleLength - lutealLength;

    // 4. Check for late period (past expected cycle length, no new period logged)
    const isLate = diffDays >= cycleLength && target <= today;

    // 5. Calculate day in cycle
    let dayInCycle: number;
    if (isLate) {
        dayInCycle = diffDays + 1;
    } else {
        dayInCycle = (diffDays % cycleLength) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleLength;
    }

    // 6. Explicit END: If logged as NOT period, don't show Menstrual
    const isExplicitlyNotPeriod = monthLogs[dateStr]?.is_period === false;

    // 7. Determine phase
    let phase: Phase;

    if (isLate) {
        phase = "Luteal";
    } else if (dayInCycle <= periodLength && !isExplicitlyNotPeriod) {
        phase = "Menstrual";
    } else if (dayInCycle >= ovulationDay - OVULATION_PHASE_WINDOW &&
        dayInCycle <= ovulationDay + OVULATION_PHASE_WINDOW) {
        phase = "Ovulatory";
    } else if (dayInCycle > ovulationDay + OVULATION_PHASE_WINDOW) {
        phase = "Luteal";
    } else {
        phase = "Follicular";
    }

    const confidence: 'low' | 'medium' | 'high' =
        source === 'logs' ? 'high' :
            source === 'settings' ? 'medium' : 'low';

    return {
        phase,
        day: dayInCycle,
        latePeriod: isLate,
        confidence,
        dataSource: source
    };
}

// ===================================
// TEST UTILS
// ===================================

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    const cycleLength = randomInt(21, 35);
    const periodLength = randomInt(3, 7);
    const lutealLength = randomInt(10, 16);

    const today = new Date();
    // Restrict to current cycle (0 ago) to strictly test standard phase logic
    // without "Late Period" interference provided by calculatePhase for older cycles.
    const cyclesAgo = 0;
    const daysAgo = (cyclesAgo * cycleLength) + randomInt(0, cycleLength - 1);

    const lastPeriodStart = new Date(today);
    lastPeriodStart.setDate(today.getDate() - daysAgo);

    const settings: CycleSettings = {
        last_period_start: formatDate(lastPeriodStart),
        cycle_length_days: cycleLength,
        period_length_days: periodLength,
        luteal_length_days: lutealLength
    };

    const logs: Record<string, DailyLog> = {};
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
        const today = new Date();

        // --- TEST 1: Baseline Calculation ---
        const todayNormalized = normalizeToLocalMidnight(today);
        const result = calculatePhase(todayNormalized, settings, logs);

        // Validate basic constraints
        assert(result.phase !== null, `User ${user.id}: Phase should not be null`);
        assert(result.day > 0, `User ${user.id}: Day should be > 0`);

        // Validate specific phase logic based on "days ago"
        // MUST use normalized dates to match calculatePhase logic exactly
        const startNormalized = normalizeToLocalMidnight(new Date(settings.last_period_start));
        const diffDays = Math.floor((todayNormalized.getTime() - startNormalized.getTime()) / (1000 * 60 * 60 * 24));
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

        // --- TEST 2: Update Scenario ---
        // Normalize EVERYTHING to midnight to avoid time-of-day flakes
        // todayNormalized is already defined above
        const originalStart = normalizeToLocalMidnight(new Date(settings.last_period_start));
        const newStart = new Date(originalStart);
        newStart.setDate(newStart.getDate() + 2); // Shifted forward 2 days (still normalized)

        const newLogs = { ...logs };
        // Clear old streak
        for (let i = 0; i < settings.period_length_days; i++) {
            const d = new Date(originalStart);
            d.setDate(d.getDate() + i);
            delete newLogs[formatDate(d)];
        }
        // Add new streak
        const current = new Date(newStart);
        for (let i = 0; i < settings.period_length_days; i++) {
            const dateStr = formatDate(current);
            // newLogs[dateStr] = { date: dateStr, is_period: true };
            // Ensure we don't accidentally overwrite if the shift overlaps?
            // (Shift +2 means we just move fwd, simpler).
            newLogs[dateStr] = { date: dateStr, is_period: true };
            current.setDate(current.getDate() + 1);
        }

        const newResult = calculatePhase(todayNormalized, settings, newLogs);

        // Check if logs were prioritized
        if (newStart <= todayNormalized) {
            if (newResult.dataSource !== 'logs') {
                assert(false, `User ${user.id}: Failed to pick up new logs as source. Expected 'logs', got '${newResult.dataSource}'`);
            } else {
                // Exact Logic Mirror for Assertion
                const newDiffDays = Math.floor((todayNormalized.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24));
                const isLate = newDiffDays >= settings.cycle_length_days;

                let calculatedExpectedDay: number;
                if (isLate) {
                    calculatedExpectedDay = newDiffDays + 1;
                } else {
                    calculatedExpectedDay = (newDiffDays % settings.cycle_length_days) + 1;
                    if (calculatedExpectedDay <= 0) calculatedExpectedDay += settings.cycle_length_days;
                }

                if (calculatedExpectedDay > 0) {
                    // Normalized math should coincide EXACTLY
                    if (newResult.day === calculatedExpectedDay) {
                        passed++;
                    } else {
                        assert(false, `User ${user.id}: Update Sync Failed. Expected ${calculatedExpectedDay}, got ${newResult.day} (Diff: ${newDiffDays}, Cycle: ${settings.cycle_length_days}, Late: ${isLate})`);
                    }
                } else {
                    passed++;
                }
            }
        } else {
            passed++;
        }
    });

    console.log("\n--- Simulation Summary ---");
    console.log(`Total Checks: ${passed + failed}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failures.length > 0) {
        console.log("\n--- Failures ---");
        failures.slice(0, 10).forEach(f => console.log(f));
    }
}

runSimulation();
