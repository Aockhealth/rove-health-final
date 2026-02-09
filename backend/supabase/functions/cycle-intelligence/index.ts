
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- TYPES ---
interface CycleIntelligenceResponse {
    currentPhase: {
        name: "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";
        day: number;
        daysUntilNextPhase: number;
        superpower: string;
    };
    cycle: {
        length: number;
        periodDuration: number;
        daysUntilPeriod: number;
        predictedNextPeriod: string;
        confidence: "low" | "medium" | "high";
    };
    fertility: {
        status: "low" | "medium" | "high" | "peak";
        isFertileWindow: boolean;
        ovulationDate: string;
        ovulationDaysAway: number;
    };
    mpiq?: {
        score: number;
        interpretation: string;
    };
}

// --- CONSTANTS ---
const LUTEAL_LENGTH = 14; // Constant biological phase
const OVULATORY_WINDOW = 5; // Days fertile around ovulation

// Superpowers per phase
const PHASE_SUPERPOWERS = {
    Menstrual: "Rest & Reset",
    Follicular: "Creativity & Strategy",
    Ovulatory: "Communication & Magnetism",
    Luteal: "Focus & Completion"
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { user_id } = await req.json();

        if (!user_id) throw new Error("Missing user_id");

        // 1. FETCH DATA
        const { data: events } = await supabase
            .from("period_events")
            .select("period_start_date")
            .eq("user_id", user_id)
            .order("period_start_date", { ascending: false })
            .limit(5);

        const { data: settings } = await supabase
            .from("user_cycle_settings")
            .select("cycle_length_days, period_length_days")
            .eq("user_id", user_id)
            .single();

        // 2. DETERMINE CYCLE PARAMETERS
        // Use historical average if available (>2 cycles), else settings, else default
        let avgCycleLength = settings?.cycle_length_days || 28;
        if (events && events.length >= 2) {
            // Simple average of last few cycles
            let totalDays = 0;
            let count = 0;
            for (let i = 0; i < events.length - 1; i++) {
                const start = new Date(events[i].period_start_date);
                const prev = new Date(events[i + 1].period_start_date);
                const diff = (start.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
                if (diff > 20 && diff < 45) { // Filter outliers
                    totalDays += diff;
                    count++;
                }
            }
            if (count > 0) avgCycleLength = Math.round(totalDays / count);
        }

        const parseLocalDate = (dateStr: string) => {
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d, 0, 0, 0, 0);
        };

        const lastPeriodStart = events?.[0]?.period_start_date
            ? parseLocalDate(events[0].period_start_date)
            : new Date();
        const today = new Date();

        // Normalize to local midnight to avoid partial-day drift
        lastPeriodStart.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Day of Cycle (1-indexed)
        const diffTime = today.getTime() - lastPeriodStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const dayOfCycle = Math.max(1, diffDays + 1);

        // 3. LUTEAL-ANCHORED CALCULATION
        // Ovulation is calculated BACKWARDS from next expected period
        const nextPeriodDate = new Date(lastPeriodStart);
        nextPeriodDate.setDate(lastPeriodStart.getDate() + avgCycleLength);

        const ovulationDate = new Date(nextPeriodDate);
        ovulationDate.setDate(nextPeriodDate.getDate() - LUTEAL_LENGTH);

        const ovulDayOfCycle = avgCycleLength - LUTEAL_LENGTH; // e.g., 28-14=14, 32-14=18

        // Determine Phase
        let phaseName: "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";
        const periodLength = settings?.period_length_days || 5;

        if (dayOfCycle <= periodLength) {
            phaseName = "Menstrual";
        } else if (dayOfCycle < ovulDayOfCycle - 2) {
            phaseName = "Follicular";
        } else if (dayOfCycle <= ovulDayOfCycle + 1) { // 4 day window around ovulation
            phaseName = "Ovulatory";
        } else {
            phaseName = "Luteal";
        }

        // 4. MPIQ & FERTILITY LOGIC
        // TODO: Fetch today's log to check for MPIQ data overrides
        // For MVP, we stick to calendar + luteal anchor

        const daysUntilOvulation = Math.ceil((ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isFertileWindow = daysUntilOvulation >= -1 && daysUntilOvulation <= 4;

        let fertilityStatus: "low" | "medium" | "high" | "peak" = "low";
        if (phaseName === "Ovulatory") fertilityStatus = "peak";
        else if (isFertileWindow) fertilityStatus = "high";
        else if (phaseName === "Follicular" && daysUntilOvulation < 7) fertilityStatus = "medium";

        // 5. CONSTRUCT RESPONSE
        const response: CycleIntelligenceResponse = {
            currentPhase: {
                name: phaseName,
                day: dayOfCycle,
                daysUntilNextPhase: 0, // Simplified for now
                superpower: PHASE_SUPERPOWERS[phaseName]
            },
            cycle: {
                length: avgCycleLength,
                periodDuration: periodLength,
                daysUntilPeriod: Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
                predictedNextPeriod: nextPeriodDate.toISOString().split('T')[0],
                confidence: events && events.length > 3 ? "high" : "medium"
            },
            fertility: {
                status: fertilityStatus,
                isFertileWindow: isFertileWindow,
                ovulationDate: ovulationDate.toISOString().split('T')[0],
                ovulationDaysAway: daysUntilOvulation
            }
        };

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
