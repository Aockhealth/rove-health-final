"use server";

import { createClient } from "../../utils/supabase/server";
import { z } from "zod";
// Adjust this import path if you haven't moved data to backend/src/data yet
// If using aliases: import { PHASE_CONTENT } from "@/data/phase-content";
import { PHASE_CONTENT } from "@/data/phase-content";
import { getCyclePhase, type CyclePhaseResponse } from "../ai-actions/ai-actions";
import { calculatePhase as calculatePhaseCanonical, type CycleSettings } from "../../../../shared/cycle/phase";

// ============================================
// TYPES & SCHEMAS
// ============================================

export interface LogDailySymptomsPayload {
    date: string;
    symptoms: string[];
    isPeriod: boolean;
    flowIntensity?: string;
    moods?: string[];
    notes?: string;
    cervicalDischarge?: string;
    exerciseTypes?: string[];
    exerciseMinutes?: number | null;
    waterIntake?: number | null;
    selfLoveTags?: string[];
    selfLoveOther?: string;
    sleepQuality?: string[];
    sleepMinutes?: number | null;
    disruptors?: string[];
}

const DailyLogSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    symptoms: z.array(z.string()).default([]),
    isPeriod: z.boolean(),
    flowIntensity: z.string().optional().nullable(),
    moods: z.array(z.string()).optional().default([]),
    notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional().default(""),
    cervicalDischarge: z.string().optional().nullable(),
    exerciseTypes: z.array(z.string()).optional().default([]),
    exerciseMinutes: z.number().min(0).max(1440, "Exercise cannot exceed 24 hours").optional().nullable(),
    waterIntake: z.number().min(0).max(50, "Water intake value is too high").optional().nullable(),
    selfLoveTags: z.array(z.string()).optional().default([]),
    selfLoveOther: z.string().max(200, "Text too long").optional().default(""),
    sleepQuality: z.array(z.string()).optional().default([]),
    sleepMinutes: z.number().min(0).max(1440, "Sleep cannot exceed 24 hours").optional().nullable(),
    disruptors: z.array(z.string()).optional().default([]),
});

// ============================================
// HELPERS
// ============================================

function getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ============================================
// DASHBOARD ACTIONS
// ============================================

export async function fetchDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // --- MOCK DATA FALLBACK ---
    if (!user) {
        console.log("⚠️ Using Mock Data for Intelligence");
        const mockCycleSettings = { last_period_start: "2025-12-08", cycle_length_days: 28, period_length_days: 5 };

        const mockSettings: CycleSettings = {
            last_period_start: mockCycleSettings.last_period_start,
            cycle_length_days: mockCycleSettings.cycle_length_days,
            period_length_days: mockCycleSettings.period_length_days
        };
        const mockPhaseResult = calculatePhaseCanonical(new Date(), mockSettings, {});
        const phase = mockPhaseResult.phase || "Menstrual";
        const day = mockPhaseResult.day || 1;

        const content = PHASE_CONTENT["Follicular"];

        const nutrition = {
            macros: { protein: { g: 100, pct: 30 }, fats: { g: 60, pct: 25 }, carbs: { g: 200, pct: 45 } },
            calories: 1900
        };
        const biometrics = { reason: "Higher protein and fresh veggies to support rising estrogen and energy levels." };

        const blueprint = {
            color: "bg-rove-peach",
            hormones: {
                title: "Hormones Rising",
                summary: "Estrogen is rising, boosting energy.",
                desc: "Your 'inner spring'. Creativity and energy are increasing as follicles mature.",
                symptoms: ["Increasing Energy", "Better Mood", "Curiosity", "Lightness"]
            },
            rituals: {
                focus: "Inner Spring",
                practices: content.rituals || [],
                symptom_relief: []
            },
            diet: {
                core_needs: content.fuel?.map((f: any) => ({ ...f, id: f.title })) || [],
                ideal_meals: content.plan?.diet?.ideal_meals || [],
                cramp_relief: content.plan?.diet?.cramp_relief || [],
                avoid: content.plan?.diet?.avoid || []
            },
            exercise: {
                summary: content.plan?.exercise?.summary || "",
                best: content.move?.map((m: any) => ({ ...m, time: "20-30 mins" })) || [],
                avoid: content.plan?.exercise?.avoid || []
            },
            supplements: content.plan?.supplements || [],
            daily_flow: content.plan?.daily_flow || [],
            nutrition_guide: content.nutrition_guide
        };

        return {
            phase: "Follicular",
            day: 11,
            nutrition,
            biometrics,
            blueprint
        };
    }

    const { data: cycleSettings } = await supabase
        .from("user_cycle_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!cycleSettings) return null;

    const settings = {
        last_period_start: cycleSettings.last_period_start,
        cycle_length_days: cycleSettings.cycle_length_days || 28,
        period_length_days: cycleSettings.period_length_days || 5
    };

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("tracker_mode, dietary_preferences, metabolic_conditions")
        .eq("user_id", user.id)
        .single();

    // ✅ Use Edge Function for phase calculation via AI Actions
    let phaseData: CyclePhaseResponse | null = null;
    try {
        phaseData = await getCyclePhase();
    } catch (error) {
        console.log("Edge function failed, falling back to local calculation");
    }

    // Fallback to local if edge function fails
    const settingsForPhase: CycleSettings = {
        last_period_start: settings.last_period_start,
        cycle_length_days: settings.cycle_length_days,
        period_length_days: settings.period_length_days
    };
    const phaseCalcResult = calculatePhaseCanonical(new Date(), settingsForPhase, {});
    const phaseCalc = {
        phase: phaseCalcResult.phase || "Menstrual",
        day: phaseCalcResult.day || 1
    };

    const phase = phaseData?.phase || phaseCalc.phase;
    const day = phaseData?.dayInCycle || phaseCalc.day;

    const content = PHASE_CONTENT[phase] || PHASE_CONTENT["Menstrual"];
    const riverStr = getRandomItems(content.river, 1)[0] || "Rest • Restore • Reload";

    return {
        user: { ...user, name: profile?.full_name || "Rove Member" },
        phase: {
            name: phase,
            day,
            river: riverStr,
            superpower: "Resilience",
            // Add edge function data if available
            hormoneState: phaseData?.hormoneState,
            nextPeriodDate: phaseData?.nextPeriodDate,
            daysUntilNextPeriod: phaseData?.daysUntilNextPeriod,
            aiPowered: !!phaseData
        },
        fuel: getRandomItems(content.fuel, 2),
        move: getRandomItems(content.move, 2),
        rituals: getRandomItems(content.rituals, 2),
        snapshot: getRandomItems(content.snapshot, 1)[0],
        tracker_mode: onboarding?.tracker_mode || "menstruation"
    };
}

// ============================================
// LOGGING ACTIONS
// ============================================

export async function logDailySymptoms(payload: LogDailySymptomsPayload) {
    // ✅ VALIDATION: Strict Zod check
    const validation = DailyLogSchema.safeParse(payload);

    // Check success FIRST
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const safeData = validation.data; // Use the validated data

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    try {
        const { data, error } = await supabase.from("daily_logs").upsert({
            user_id: user.id,
            date: safeData.date,
            symptoms: safeData.symptoms,
            is_period: safeData.isPeriod,
            flow_intensity: safeData.flowIntensity || null,
            moods: safeData.moods || [],
            notes: safeData.notes || "",
            cervical_discharge: safeData.cervicalDischarge || null,
            exercise_types: safeData.exerciseTypes || [],
            exercise_minutes: safeData.exerciseMinutes || null,
            water_intake: safeData.waterIntake || 0,
            self_love_tags: safeData.selfLoveTags || [],
            self_love_other: safeData.selfLoveOther || "",
            sleep_quality: safeData.sleepQuality || [],
            sleep_minutes: safeData.sleepMinutes || null,
            disruptors: safeData.disruptors || [],
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date'
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

// Alias for backwards compatibility if needed
export const logDailyLog = logDailySymptoms;

export async function getDailyLog(date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fallback if no user
    if (!user) return null;

    const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();
    return data;
}

export async function fetchMonthLogs(monthStr: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Parse YYYY-MM
    const [yearStr, monthNumStr] = monthStr.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthNumStr);

    // Calculate start and end range
    // Start: YYYY-MM-01
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    // End: Start of next month
    // Handle December wrap around
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = year + 1;
    }
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lt("date", endDate);

    if (error) {
        console.error("Error fetching month logs:", error);
        return [];
    }

    return data || [];
}

// ============================================
// SETTINGS ACTIONS
// ============================================

export async function updateLastPeriodDate(newDate: string) {
    // ✅ VALIDATION
    const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
    const result = dateSchema.safeParse(newDate);

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message };
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase
        .from("user_cycle_settings")
        .update({ last_period_start: newDate, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function updateCycleLength(periodLength?: number, cycleLength?: number, isIrregular?: boolean) {
    // ✅ VALIDATION: Cycle length logic
    if (periodLength && (periodLength < 1 || periodLength > 15)) {
        return { success: false, error: "Period length must be between 1 and 15 days" };
    }
    if (cycleLength && (cycleLength < 15 || cycleLength > 100)) {
        return { success: false, error: "Cycle length must be between 15 and 100 days" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const updates: any = { updated_at: new Date().toISOString() };
    if (periodLength) updates.period_length_days = periodLength;
    if (cycleLength) updates.cycle_length_days = cycleLength;
    if (isIrregular !== undefined) updates.is_irregular = isIrregular;

    const { error } = await supabase
        .from("user_cycle_settings")
        .update(updates)
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
