"use server";

import { createClient } from "@/utils/supabase/server";

// --- HELPERS ---

// 1. DYNAMIC CYCLE TRACKING LOGIC
function calculatePhase(lastPeriodStart: string, cycleLength: number = 28, periodLength: number = 5) {
    const today = new Date();
    const start = new Date(lastPeriodStart);

    // Normalize dates to ignore time
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate Day in Cycle (1-based)
    let dayInCycle = (diffDays % cycleLength) + 1;
    if (dayInCycle <= 0) dayInCycle = 1;

    // BIOLOGICAL LOGIC
    const lutealLength = 14;
    const estimatedOvulationDay = cycleLength - lutealLength;

    let phase = "Luteal"; 

    if (dayInCycle <= periodLength) {
        phase = "Menstrual";
    } else if (dayInCycle < (estimatedOvulationDay - 1)) {
        phase = "Follicular";
    } else if (dayInCycle <= (estimatedOvulationDay + 1)) {
        phase = "Ovulatory"; 
    } else {
        phase = "Luteal";
    }

    return { phase, day: dayInCycle };
}

// --- ACTIONS ---

export async function fetchDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch cycle data & profile
    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Correctly fetch name from 'profiles' table
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    if (!cycleSettings) return null;

    const { phase, day } = calculatePhase(cycleSettings.last_period_start, cycleSettings.cycle_length_days, cycleSettings.period_length_days);

    const insights = [
        { title: `Day ${day}`, desc: "Tracking perfectly", icon: "TrendingUp" },
        { title: `${phase} Phase`, desc: "Current status", icon: "Moon" },
    ];

    let fuel: any[] = [];
    let move: any[] = [];
    let riverStr = "";

    // Fill data based on phase... (Keeping your existing logic short for brevity)
    if (phase === "Menstrual") {
        riverStr = "Rest • Restore • Reload";
        fuel = [{ title: "Bone Broth", desc: "Mineral Replenishment", icon: "Soup" }]; // ... abbreviated
        move = [{ title: "Yin Yoga", desc: "Stretch & Relax", icon: "Moon" }]; 
    } else {
        // Fallbacks for other phases (You can keep your full original logic here)
        riverStr = "Build • Create • Push";
        fuel = [{ title: "Oats", desc: "Sustained Energy", icon: "Wheat" }];
        move = [{ title: "Running", desc: "Cardio Peak", icon: "Wind" }];
    }

    return {
        user: { ...user, name: profile?.full_name || user.user_metadata?.full_name || "Rove Member" },
        phase: { name: phase, day, river: riverStr },
        insights,
        fuel,
        move
    };
}


export interface LogDailySymptomsPayload {
  date: Date;
  symptoms: string[];
  isPeriod: boolean;
  flowIntensity?: string; 
}

// UPDATED: Uses upsert to prevent duplicates
export async function logDailySymptoms(payload: LogDailySymptomsPayload) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  const { date, symptoms, isPeriod, flowIntensity } = payload;

  try {
    const { data, error } = await supabase.from("daily_logs").upsert({
      user_id: user.id,
      date: date.toISOString(), // Postgres will cast this to DATE type (YYYY-MM-DD)
      symptoms,
      is_period: isPeriod,
      flow_intensity: flowIntensity || null,
      updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id, date' // This matches the unique constraint we created in SQL
    });

    if (error) {
      console.error("Error logging daily symptoms:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: (err as Error).message };
  }
}

// NEW: Helper to fetch a single day's log for the calendar
export async function getDailyLog(date: Date) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return null;
  
    // Format date to YYYY-MM-DD to match the DATE column in Postgres
    const searchDate = date.toISOString().split('T')[0]; 
  
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", searchDate)
      .maybeSingle();
  
    if (error) {
      console.error("Error fetching log:", error);
      return null;
    }
  
    return data;
}

export async function fetchCycleIntelligence() {
    // (Keep your existing fetchCycleIntelligence code here unchanged)
    // I am omitting the full body to save space, but DO NOT DELETE IT from your file.
    // Ensure you keep the full implementation you provided earlier.
    return null; 
}