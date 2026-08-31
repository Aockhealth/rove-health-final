/**
 * Synthetic accuracy backtest for the TTC ovulation engine.
 *
 * The unit tests in ttc.test.ts check that the code does what it's designed
 * to do (edge cases, thresholds, exclusions). This file asks a different
 * question: across many simulated women's cycles with a *known* true
 * ovulation day plus realistic biomarker noise and imperfect logging, how
 * close does detectOvulation() actually land?
 *
 * Not wired into the permanent suite — ad hoc analysis, printed as a report.
 */

import { detectOvulation, type TtcDailyLog, addDays } from '../ttc';
import { formatDate, parseLocalDate, type CycleSettings } from '../phase';

// ---------------------------------------------------------------------------
// Seeded RNG so results are reproducible run to run
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
let rand = mulberry32(20260818);
const uniform = (a: number, b: number) => a + rand() * (b - a);
const gauss = (mean: number, sd: number) => {
    // Box-Muller
    const u1 = Math.max(rand(), 1e-9);
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * sd;
};
const chance = (p: number) => rand() < p;

const CYCLE_START = '2026-01-01';

interface Persona {
    name: string;
    avgCycleLength: number;
    cycleSd: number; // biological cycle-length variability
    logsBbt: boolean;
    logsOpk: boolean;
    loggingSkipRate: number; // probability a given day just isn't logged
    disruptorRate: number; // probability a logged BBT day is alcohol/illness
    hasHistory: boolean; // whether she has 4+ past cycles logged (personalizes window)
    anovulatory: boolean;
}

const PERSONAS: Persona[] = [
    { name: 'Regular, logs both diligently', avgCycleLength: 28, cycleSd: 1.2, logsBbt: true, logsOpk: true, loggingSkipRate: 0.03, disruptorRate: 0.03, hasHistory: true, anovulatory: false },
    { name: 'Regular, BBT only', avgCycleLength: 28, cycleSd: 1.5, logsBbt: true, logsOpk: false, loggingSkipRate: 0.05, disruptorRate: 0.04, hasHistory: true, anovulatory: false },
    { name: 'Regular, OPK only', avgCycleLength: 28, cycleSd: 1.5, logsBbt: false, logsOpk: true, loggingSkipRate: 0.05, disruptorRate: 0, hasHistory: true, anovulatory: false },
    { name: 'Irregular cycles, logs both', avgCycleLength: 32, cycleSd: 5, logsBbt: true, logsOpk: true, loggingSkipRate: 0.08, disruptorRate: 0.05, hasHistory: true, anovulatory: false },
    { name: 'New user, no cycle history yet', avgCycleLength: 27, cycleSd: 2, logsBbt: true, logsOpk: true, loggingSkipRate: 0.05, disruptorRate: 0.03, hasHistory: false, anovulatory: false },
    { name: 'Sparse / imperfect logger', avgCycleLength: 29, cycleSd: 2.5, logsBbt: true, logsOpk: true, loggingSkipRate: 0.35, disruptorRate: 0.08, hasHistory: true, anovulatory: false },
    { name: 'Logs nothing (date-math only)', avgCycleLength: 28, cycleSd: 2, logsBbt: false, logsOpk: false, loggingSkipRate: 1, disruptorRate: 0, hasHistory: false, anovulatory: false },
    { name: 'Anovulatory (PCOS-like) cycle', avgCycleLength: 45, cycleSd: 8, logsBbt: true, logsOpk: true, loggingSkipRate: 0.1, disruptorRate: 0.03, hasHistory: false, anovulatory: true },
];

const N_PER_PERSONA = 120;

interface CycleResult {
    persona: string;
    trueOvulationDay: number | null; // day-in-cycle, null if anovulatory
    confirmedErrorDays: number | null; // |confirmedDate - trueDate|, null if never confirmed
    firstConfirmedOnCycleDay: number | null; // how late (days after true ovulation) confirmation landed
    predictedErrorDays: number | null; // |first opk-based predictedDate - trueDate|
    predictedLeadDays: number | null; // true ovulation day - day-in-cycle when first predicted (positive = advance warning)
    earlyWindowContainedTrue: boolean | null; // did the fertile window, viewed early (day 6), contain the true date?
    finalAnovulatoryDetected: boolean;
    finalStatus: string;
}

function buildLog(day: number, opts: { bbt?: number; disruptor?: boolean; opk?: TtcDailyLog['opk_result'] }): TtcDailyLog {
    const date = addDays(CYCLE_START, day - 1);
    return {
        date,
        bbt_celsius: opts.bbt ?? null,
        opk_result: opts.opk ?? null,
        disruptors: opts.disruptor ? ['Illness'] : [],
        sleep_minutes: 420,
        bbt_wake_time: '06:30',
    };
}

function simulateCycle(persona: Persona): CycleResult {
    const lutealActual = Math.round(gauss(14, 0.6));
    let trueOvulationDay: number | null;
    let cycleLength: number;

    if (persona.anovulatory) {
        trueOvulationDay = null;
        cycleLength = Math.max(35, Math.round(gauss(persona.avgCycleLength, persona.cycleSd)));
    } else {
        const avgOvDay = persona.avgCycleLength - 14;
        trueOvulationDay = Math.max(8, Math.round(gauss(avgOvDay, persona.cycleSd)));
        cycleLength = trueOvulationDay + lutealActual;
    }

    const scanDays = cycleLength + 6;
    const cycleLogs: Record<string, TtcDailyLog> = {};

    const baseTemp = uniform(36.35, 36.55);
    const shiftAmount = uniform(0.28, 0.45);

    for (let day = 1; day <= scanDays; day++) {
        const date = addDays(CYCLE_START, day - 1);
        const isPastOvulation = trueOvulationDay !== null && day > trueOvulationDay;

        let bbt: number | undefined;
        let disruptor = false;
        if (persona.logsBbt && !chance(persona.loggingSkipRate)) {
            const noise = gauss(0, 0.06);
            bbt = round2((isPastOvulation ? baseTemp + shiftAmount : baseTemp) + noise);
            disruptor = chance(persona.disruptorRate);
        }

        let opk: TtcDailyLog['opk_result'] | undefined;
        if (persona.logsOpk && !chance(persona.loggingSkipRate)) {
            if (persona.anovulatory) {
                // Persistently elevated, never peaks — the classic anovulatory OPK shape.
                opk = chance(0.55) ? 'high' : chance(0.5) ? 'low' : 'negative';
            } else if (trueOvulationDay !== null) {
                const daysToSurge = trueOvulationDay - 1 - day; // surge ~1 day before ovulation
                if (daysToSurge === 0) opk = 'peak';
                else if (daysToSurge === 1 || daysToSurge === -1) opk = chance(0.7) ? 'high' : 'peak';
                else if (daysToSurge > 0 && daysToSurge <= 3) opk = 'low';
                else opk = 'negative';
            }
        }

        if (bbt !== undefined || opk !== undefined) {
            cycleLogs[date] = buildLog(day, { bbt, disruptor, opk });
        }
    }

    function round2(n: number): number {
        return Math.round(n * 100) / 100;
    }

    const settings: CycleSettings = {
        last_period_start: CYCLE_START,
        cycle_length_days: persona.avgCycleLength,
        period_length_days: 5,
        luteal_length_days: 14,
    };

    const recentCycleLengths = persona.hasHistory
        ? [0, 0, 0, 0].map(() => Math.max(21, Math.round(gauss(persona.avgCycleLength, persona.cycleSd))))
        : [];

    let firstConfirmed: { date: string; onCycleDay: number } | null = null;
    let firstPredicted: { date: string; onCycleDay: number } | null = null;
    let earlyWindowContainedTrue: boolean | null = null;
    let finalSignal: ReturnType<typeof detectOvulation> | null = null;

    for (let day = 1; day <= scanDays; day++) {
        const target = parseLocalDate(addDays(CYCLE_START, day - 1));
        const signal = detectOvulation(CYCLE_START, target, cycleLogs, settings, {
            recentCycleLengths,
        });
        finalSignal = signal;

        if (!firstConfirmed && signal.status === 'ovulation_confirmed' && signal.confirmedDate) {
            firstConfirmed = { date: signal.confirmedDate, onCycleDay: day };
        }
        if (!firstPredicted && signal.status === 'ovulation_likely' && signal.predictedDate) {
            firstPredicted = { date: signal.predictedDate, onCycleDay: day };
        }
        if (day === 6) {
            if (signal.fertileWindowStart && signal.fertileWindowEnd && trueOvulationDay !== null) {
                const trueDateStr = addDays(CYCLE_START, trueOvulationDay - 1);
                earlyWindowContainedTrue =
                    trueDateStr >= signal.fertileWindowStart && trueDateStr <= signal.fertileWindowEnd;
            } else {
                earlyWindowContainedTrue = trueOvulationDay === null ? null : 'no_window' as unknown as boolean;
            }
        }
    }

    const trueDateStr = trueOvulationDay !== null ? addDays(CYCLE_START, trueOvulationDay - 1) : null;

    const confirmedErrorDays =
        firstConfirmed && trueDateStr
            ? Math.abs(daysBetweenStr(firstConfirmed.date, trueDateStr))
            : null;
    const predictedErrorDays =
        firstPredicted && trueDateStr ? Math.abs(daysBetweenStr(firstPredicted.date, trueDateStr)) : null;
    const predictedLeadDays =
        firstPredicted && trueOvulationDay !== null ? trueOvulationDay - firstPredicted.onCycleDay : null;

    return {
        persona: persona.name,
        trueOvulationDay,
        confirmedErrorDays,
        firstConfirmedOnCycleDay: firstConfirmed ? firstConfirmed.onCycleDay - (trueOvulationDay ?? 0) : null,
        predictedErrorDays,
        predictedLeadDays,
        earlyWindowContainedTrue,
        finalAnovulatoryDetected: finalSignal?.anovulatory?.detected === true,
        finalStatus: finalSignal?.status ?? 'unknown',
    };
}

function daysBetweenStr(a: string, b: string): number {
    return Math.round((parseLocalDate(a).getTime() - parseLocalDate(b).getTime()) / 86400000);
}

function mean(xs: number[]): number {
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}
function pct(n: number, d: number): string {
    return d ? `${((100 * n) / d).toFixed(0)}%` : 'n/a';
}

describe('TTC engine — synthetic accuracy backtest', () => {
    it('reports accuracy metrics across simulated personas', () => {
        const allResults: CycleResult[] = [];

        for (const persona of PERSONAS) {
            for (let i = 0; i < N_PER_PERSONA; i++) {
                allResults.push(simulateCycle(persona));
            }
        }

        const lines: string[] = [];
        lines.push('');
        lines.push('='.repeat(78));
        lines.push('TTC ENGINE — SYNTHETIC ACCURACY BACKTEST');
        lines.push(`${PERSONAS.length} personas × ${N_PER_PERSONA} simulated cycles = ${allResults.length} total`);
        lines.push('='.repeat(78));

        for (const persona of PERSONAS) {
            const rows = allResults.filter((r) => r.persona === persona.name);

            if (persona.anovulatory) {
                const detected = rows.filter((r) => r.finalAnovulatoryDetected).length;
                lines.push('');
                lines.push(`— ${persona.name} (${rows.length} cycles, no true ovulation) —`);
                lines.push(`  Correctly flagged as possibly anovulatory: ${pct(detected, rows.length)} (${detected}/${rows.length})`);
                const confirmed = rows.filter((r) => r.finalStatus === 'ovulation_confirmed').length;
                lines.push(`  False "ovulation_confirmed" (should be 0): ${confirmed}/${rows.length}`);
                continue;
            }

            const confirmedRows = rows.filter((r) => r.confirmedErrorDays !== null);
            const predictedRows = rows.filter((r) => r.predictedErrorDays !== null);
            const windowRows = rows.filter((r) => r.earlyWindowContainedTrue !== null);
            const windowHits = windowRows.filter((r) => r.earlyWindowContainedTrue === true).length;
            const windowDeclined = windowRows.filter((r) => (r.earlyWindowContainedTrue as unknown) === 'no_window').length;
            const windowWrong = windowRows.length - windowHits - windowDeclined;
            const falseAnov = rows.filter((r) => r.finalAnovulatoryDetected).length;

            lines.push('');
            lines.push(`— ${persona.name} (${rows.length} cycles) —`);
            if (persona.logsBbt) {
                const within0 = confirmedRows.filter((r) => (r.confirmedErrorDays as number) === 0).length;
                const within1 = confirmedRows.filter((r) => (r.confirmedErrorDays as number) <= 1).length;
                lines.push(
                    `  BBT confirmation reached: ${pct(confirmedRows.length, rows.length)} of cycles ` +
                    `(${confirmedRows.length}/${rows.length})`
                );
                if (confirmedRows.length) {
                    lines.push(
                        `    exact day: ${pct(within0, confirmedRows.length)}   within ±1 day: ${pct(within1, confirmedRows.length)}   ` +
                        `mean error: ${mean(confirmedRows.map((r) => r.confirmedErrorDays as number)).toFixed(2)}d   ` +
                        `mean confirmation lag: ${mean(confirmedRows.map((r) => r.firstConfirmedOnCycleDay as number)).toFixed(2)}d after true ovulation`
                    );
                }
            }
            if (persona.logsOpk) {
                const within0 = predictedRows.filter((r) => (r.predictedErrorDays as number) === 0).length;
                const within1 = predictedRows.filter((r) => (r.predictedErrorDays as number) <= 1).length;
                lines.push(
                    `  OPK-based prediction reached: ${pct(predictedRows.length, rows.length)} of cycles ` +
                    `(${predictedRows.length}/${rows.length})`
                );
                if (predictedRows.length) {
                    lines.push(
                        `    exact day: ${pct(within0, predictedRows.length)}   within ±1 day: ${pct(within1, predictedRows.length)}   ` +
                        `mean error: ${mean(predictedRows.map((r) => r.predictedErrorDays as number)).toFixed(2)}d   ` +
                        `mean advance warning: ${mean(predictedRows.map((r) => r.predictedLeadDays as number)).toFixed(2)}d before true ovulation`
                    );
                }
            }
            lines.push(
                `  Fertile window (drawn on cycle day 6, before signals) contained true ovulation day: ` +
                `${pct(windowHits, windowRows.length)} (${windowHits}/${windowRows.length})` +
                (windowDeclined ? `  [declined to draw one — "too irregular": ${pct(windowDeclined, windowRows.length)}, wrong: ${pct(windowWrong, windowRows.length)}]` : '')
            );
            if (falseAnov > 0) {
                lines.push(`  ⚠ False "possibly anovulatory" flags on a real ovulatory cycle: ${pct(falseAnov, rows.length)} (${falseAnov}/${rows.length})`);
            }
        }

        lines.push('');
        lines.push('='.repeat(78));
        // eslint-disable-next-line no-console
        console.log(lines.join('\n'));

        // Raw per-cycle results, for building a visual report from real data
        // rather than re-typed summary numbers.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const os = require('os');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('path');
        // Set TTC_BACKTEST_OUT to keep the raw results somewhere specific;
        // otherwise they land in the OS temp directory.
        const outPath =
            process.env.TTC_BACKTEST_OUT ??
            path.join(os.tmpdir(), 'ttc-backtest-results.json');
        fs.writeFileSync(
            outPath,
            JSON.stringify(
                {
                    generatedAt: new Date().toISOString(),
                    nPerPersona: N_PER_PERSONA,
                    personas: PERSONAS.map((p) => p.name),
                    results: allResults,
                },
                null,
                2
            )
        );

        // Loose sanity floors so this fails loudly if a future change tanks accuracy.
        const diligent = allResults.filter((r) => r.persona === 'Regular, logs both diligently' && r.confirmedErrorDays !== null);
        expect(diligent.length).toBeGreaterThan(N_PER_PERSONA * 0.8);
        expect(mean(diligent.map((r) => r.confirmedErrorDays as number))).toBeLessThan(1.5);
    });
});
