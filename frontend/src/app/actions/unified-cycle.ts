"use server";

import { createClient } from "@/utils/supabase/server";
import { calculateSmartPhase, CycleSettings, DailyLog } from "@/lib/cycle/smart-calc";

// Types
export interface UnifiedCycleData {
    settings: CycleSettings;
    monthLogs: Record<string, DailyLog>; // Sparse map: "YYYY-MM-DD" -> Log
    smartPhase: { phase: string; day: number };
    userId: string;
}

/**
 * FETCH UNIFIED CYCLE DATA
 * Single source of truth for Home, Plan, and Tracker.
 * Fetches:
 * 1. User Cycle Settings
 * 2. Recent Daily Logs (last 45 days to cover current + previous cycle)
 * 3. Calculates "Smart Phase" on server for initial render
 */
export async function fetchUnifiedCycleData(): Promise<UnifiedCycleData | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Fetch Settings
    const { data: settings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!settings) return null;

    // 2. Fetch Recent Logs (last 60 days to be safe for streak calculation)
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 60);

    const { data: rawLogs } = await supabase
        .from("daily_logs")
        .select("date, is_period")
        .eq("user_id", user.id)
        .gte("date", pastDate.toISOString().split('T')[0]);

    // Transform logs to Record<string, DailyLog> for checking O(1)
    const monthLogs: Record<string, DailyLog> = {};
    if (rawLogs) {
        rawLogs.forEach((log: any) => {
            monthLogs[log.date] = log;
        });
    }

    // 3. Calculate Smart Phase (Server Side Draft)
    // Note: Client should re-run this with local time for precision, 
    // but this gives us a good SSR state.
    const smartPhase = calculateSmartPhase(new Date(), settings, monthLogs);

    return {
        settings: {
            last_period_start: settings.last_period_start,
            cycle_length_days: settings.cycle_length_days || 28,
            period_length_days: settings.period_length_days || 5,
        },
        monthLogs,
        smartPhase,
        userId: user.id
    };
}
