
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1️⃣ Fetch period events (Source of Truth)
    const { data: events, error: fetchError } = await supabase
      .from("period_events")
      .select("period_start_date")
      .eq("user_id", user_id)
      .order("period_start_date", { ascending: true });

    if (fetchError) throw fetchError;

    // If no events, clear summary and return
    if (!events || events.length < 1) {
      await supabase.from("cycle_summary").delete().eq("user_id", user_id);
      return new Response(JSON.stringify({ message: "No events found, cleared summary" }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2️⃣ Delete old summaries (Rebuild Strategy)
    const { error: deleteError } = await supabase
      .from("cycle_summary")
      .delete()
      .eq("user_id", user_id);

    if (deleteError) throw deleteError;

    // 3️⃣ Recompute cycles
    // Default assumptions if not enough data
    const DEFAULT_CYCLE_LENGTH = 28;
    const DEFAULT_PERIOD_LENGTH = 5;

    interface Cycle {
      start: Date;
      end: Date | null;
      length: number | null;
      is_projected?: boolean;
    }

    const cycles: Cycle[] = [];
    const cycleLengths: number[] = [];

    for (let i = 0; i < events.length; i++) {
      const start = new Date(events[i].period_start_date);
      // Ensure time is stripped / consistent
      start.setUTCHours(0, 0, 0, 0);

      const nextEvent = events[i + 1];
      let end = null;
      let length = null;

      if (nextEvent) {
        const nextStart = new Date(nextEvent.period_start_date);
        nextStart.setUTCHours(0, 0, 0, 0);

        // Cycle ends the day before the next period starts
        // Or strictly speaking, the duration is (Next - Start)
        const diffTime = nextStart.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        length = diffDays;
        // Clean bad data (e.g. negative length if sorted wrong, though we sorted DB side)
        if (length > 0) {
          cycleLengths.push(length);
          end = new Date(nextStart.getTime() - (24 * 60 * 60 * 1000)); // Day before next period
        }
      }

      cycles.push({ start, end, length });
    }

    // 4️⃣ Predict Next Cycle (if last cycle is complete or just started)
    const lastCycle = cycles[cycles.length - 1];

    // Determine average cycle length
    let avgCycleLength = DEFAULT_CYCLE_LENGTH;
    if (cycleLengths.length > 0) {
      const sum = cycleLengths.reduce((a, b) => a + b, 0);
      avgCycleLength = Math.round(sum / cycleLengths.length);
    }

    // If the last event didn't have a "next event", it's the CURRENT open cycle.
    // We already pushed it to `cycles` with length=null. 
    // Let's populate its projected end date for the summary.
    if (!lastCycle.length) {
      lastCycle.length = avgCycleLength; // Projected
      lastCycle.end = new Date(lastCycle.start.getTime() + (avgCycleLength * 24 * 60 * 60 * 1000));
      lastCycle.is_projected = true;
    }

    // 5️⃣ Insert new summaries
    const summariesToAdd = [];

    for (const c of cycles) {
      // Calculate Ovulation (typically 14 days before end)
      let ovulation = null;
      if (c.length) {
        const lutealLength = 14;
        const ovulationTime = c.start.getTime() + ((c.length - lutealLength) * 24 * 60 * 60 * 1000);
        ovulation = new Date(ovulationTime);
      }

      // Confidence Score calculation
      const validHistoryCount = cycleLengths.length;
      let confidence = "low";
      if (validHistoryCount >= 6) confidence = "high";
      else if (validHistoryCount >= 3) confidence = "medium";

      summariesToAdd.push({
        user_id,
        cycle_start_date: c.start.toISOString().split('T')[0],
        cycle_end_date: c.end ? c.end.toISOString().split('T')[0] : null,
        cycle_length: c.length,
        ovulation_date: ovulation ? ovulation.toISOString().split('T')[0] : null,
        confidence_score: confidence,
        phase_data: {
          is_projected: !!c.is_projected,
          avg_length_used: avgCycleLength
        }
      });
    }

    const { error: insertError } = await supabase.from("cycle_summary").insert(summariesToAdd);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      message: "Cycle recomputed successfully",
      cycles_count: summariesToAdd.length,
      avg_length: avgCycleLength
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
