// Cycle Phase Calculator Edge Function
// Calculates current menstrual phase, day in cycle, and hormone state

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface CyclePhaseRequest {
    lastPeriodStart: string;    // YYYY-MM-DD
    cycleLength?: number;       // days (default 28)
    periodLength?: number;      // days (default 5)
    isIrregular?: boolean;
    targetDate?: string;        // Optional, defaults to today
}

interface CyclePhaseResponse {
    phase: 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';
    dayInCycle: number;
    daysUntilNextPeriod: number;
    hormoneState: 'low' | 'rising' | 'peak' | 'falling';
    fertileWindow: { start: number; end: number };
    nextPeriodDate: string;
    cycleLength: number;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    try {
        const body: CyclePhaseRequest = await req.json();

        const {
            lastPeriodStart,
            cycleLength = 28,
            periodLength = 5,
            targetDate
        } = body;

        if (!lastPeriodStart) {
            return new Response(
                JSON.stringify({ error: 'lastPeriodStart is required' }),
                { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }

        const parseLocalDate = (dateStr: string) => {
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d, 0, 0, 0, 0);
        };

        // Parse dates (local day semantics)
        const target = targetDate ? parseLocalDate(targetDate) : new Date();
        const start = parseLocalDate(lastPeriodStart);

        // Normalize to local midnight
        target.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        // Calculate day in cycle
        const diffTime = target.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let dayInCycle = (diffDays % cycleLength) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleLength;

        // Calculate ovulation day (typically 14 days before next period)
        const ovulationDay = cycleLength - 14;

        // Determine phase and hormone state
        let phase: CyclePhaseResponse['phase'];
        let hormoneState: CyclePhaseResponse['hormoneState'];

        if (dayInCycle <= periodLength) {
            phase = 'Menstrual';
            hormoneState = 'low';
        } else if (dayInCycle < ovulationDay - 1) {
            phase = 'Follicular';
            hormoneState = 'rising';
        } else if (dayInCycle <= ovulationDay + 1) {
            phase = 'Ovulatory';
            hormoneState = 'peak';
        } else {
            phase = 'Luteal';
            hormoneState = 'falling';
        }

        // Calculate days until next period
        const daysUntilNextPeriod = cycleLength - dayInCycle + 1;

        // Calculate next period date
        const nextPeriod = new Date(target);
        nextPeriod.setDate(nextPeriod.getDate() + daysUntilNextPeriod);

        // Fertile window (5 days before ovulation to 2 days after)
        const fertileWindow = {
            start: Math.max(1, ovulationDay - 5),
            end: Math.min(cycleLength, ovulationDay + 2)
        };

        const response: CyclePhaseResponse = {
            phase,
            dayInCycle,
            daysUntilNextPeriod,
            hormoneState,
            fertileWindow,
            nextPeriodDate: nextPeriod.toISOString().split('T')[0],
            cycleLength
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'  // HIPAA: No caching of health data
                }
            }
        );

    } catch (error) {
        console.error('Error in cycle-phase-calculator:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
    }
});
