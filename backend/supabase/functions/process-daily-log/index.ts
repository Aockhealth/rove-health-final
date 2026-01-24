
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        const {
            user_id,
            date,
            symptoms,
            flow_intensity,
            moods,
            mpiq,
            ...otherLogData
        } = await req.json();

        if (!user_id || !date) throw new Error("Missing user_id or date");

        // 1. AUTO-DETECT PERIOD
        let periodEventCreated = false;
        if (flow_intensity && flow_intensity !== 'None') {
            // Check if a period start already exists nearby (e.g. within last 7 days)
            const nearbyDate = new Date(date);
            nearbyDate.setDate(nearbyDate.getDate() - 7);

            const { data: existingEvents } = await supabase
                .from('period_events')
                .select('id')
                .eq('user_id', user_id)
                .gte('period_start_date', nearbyDate.toISOString().split('T')[0])
                .lte('period_start_date', date);

            if (!existingEvents || existingEvents.length === 0) {
                // No recent period event, so this is likely a NEW period start
                await supabase.from('period_events').insert({
                    user_id,
                    period_start_date: date,
                    source: 'auto-detected'
                });
                periodEventCreated = true;

                // Trigger recompute-cycle asynchronously
                // fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/recompute-cycle`, { ... })
            }
        }

        // 2. SAVE LOG
        // Upsert the daily log with new fields
        const { error: logError } = await supabase
            .from('daily_logs')
            .upsert({
                user_id,
                date,
                symptoms: symptoms || [],
                flow_intensity,
                moods: moods || [],
                mpiq_consistency: mpiq?.consistency,
                mpiq_appearance: mpiq?.appearance,
                mpiq_sensation: mpiq?.sensation,
                ...otherLogData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, date' });

        if (logError) throw logError;

        // 3. GENERATE INSIGHTS (Mini-version of symptom-insights)
        // For MVP, we'll return static insights based on symptoms, 
        // but this is where we'd call the AI engine later.
        const insights = [];
        if (symptoms && symptoms.length > 0) {
            if (symptoms.includes("Cramps")) insights.push("Try heat therapy or magnesium for cramps.");
            if (symptoms.includes("Bloating")) insights.push("Avoid salty foods and stay hydrated.");
            if (symptoms.includes("Fatigue")) insights.push("Listen to your body and rest early tonight.");
        }

        // MPIQ Feedback
        if (mpiq?.consistency === 'Egg white' && mpiq?.sensation === 'Wet') {
            insights.push("High fertility signs detected based on your fluid observations.");
        }

        return new Response(JSON.stringify({
            success: true,
            periodEventCreated,
            insights
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
