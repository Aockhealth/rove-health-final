"use client";

import { useState, useTransition, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "./actions";
import { updateCycleLength, updateLastPeriodDate } from "@/app/actions/cycle-sync";
import { fetchUnifiedCycleData } from "@/app/actions/unified-cycle";
import { Button } from "@/components/ui/Button";
import {
    Calendar, LogOut, ChevronLeft, Crown, Edit2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CycleSignature } from "./components/CycleSignature";
import { HealthPassport } from "./components/HealthPassport";
import { AccountSettings } from "./components/AccountSettings";
import { HistoryView } from "./components/HistoryView";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const supabase = createClient();

    // User Data State
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        tracker_mode: "menstruation",
        goals: [] as string[],
        conditions: [] as string[],
        weight: 0,
        height: 0,
        activity_level: "moderate",
        diet_preference: "non_veg",
        is_irregular: false
    });

    // Cycle Settings State (Unified)
    const [cycleData, setCycleData] = useState({
        last_period_start: "",
        cycle_length_days: 28,
        period_length_days: 5
    });

    // Unified Data for correct Phase Calculation
    const [unifiedPhase, setUnifiedPhase] = useState<string>("Menstrual");
    const [isEditingCycle, setIsEditingCycle] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            // Run all data fetches in parallel
            const [profile, unifiedRes, authUser] = await Promise.all([
                getUserProfile(),
                fetchUnifiedCycleData(),
                supabase.auth.getUser()
            ]);

            // 1. Set Profile Data
            if (profile) {
                setFormData({
                    full_name: profile.full_name || "",
                    tracker_mode: profile.tracker_mode || "menstruation",
                    goals: profile.goals || [],
                    conditions: profile.conditions || [],
                    weight: profile.weight_kg || 0,
                    height: profile.height_cm || 0,
                    activity_level: profile.activity_level || "moderate",
                    diet_preference: profile.diet_preference || "non_veg",
                    is_irregular: profile.is_irregular || false
                });
            }

            // 2. Set Cycle Settings & Phase from Unified Data
            if (unifiedRes) {
                setCycleData({
                    last_period_start: unifiedRes.settings.last_period_start || "",
                    cycle_length_days: unifiedRes.settings.cycle_length_days || 28,
                    period_length_days: unifiedRes.settings.period_length_days || 5
                });
                setUnifiedPhase(unifiedRes.smartPhase.phase);
            }

            // 3. Set Auth User
            setUser(authUser.data?.user);

            setLoading(false);
        };
        loadData();
    }, []);


    const handleSaveProfile = () => {
        startTransition(async () => {
            const res = await updateUserProfile(formData);
            if (res.error) {
                alert("Error calling update: " + res.error);
                return;
            }
            alert("Profile saved!");
        });
    };

    const handleSaveCycle = () => {
        startTransition(async () => {
            // Only update if changed
            await updateLastPeriodDate(cycleData.last_period_start);
            await updateCycleLength(cycleData.period_length_days, cycleData.cycle_length_days, formData.is_irregular);

            // Re-fetch to sync
            const unifiedRes = await fetchUnifiedCycleData();
            if (unifiedRes) setUnifiedPhase(unifiedRes.smartPhase.phase);

            alert("Cycle settings updated!");
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    // --- LUXURY THEMES ---
    const PROFILE_THEMES: Record<string, { bg: string, ring: string, accent: string, badge: string }> = {
        "Menstrual": { bg: "bg-gradient-to-br from-rose-50 via-white to-rose-50", ring: "ring-rose-100", accent: "text-rose-900", badge: "border-rose-200 text-rose-700 bg-rose-50" },
        "Follicular": { bg: "bg-gradient-to-br from-teal-50 via-white to-teal-50", ring: "ring-teal-100", accent: "text-teal-900", badge: "border-teal-200 text-teal-700 bg-teal-50" },
        "Ovulatory": { bg: "bg-gradient-to-br from-amber-50 via-white to-orange-50", ring: "ring-amber-100", accent: "text-amber-900", badge: "border-amber-200 text-amber-700 bg-amber-50" },
        "Luteal": { bg: "bg-gradient-to-br from-indigo-50 via-white to-violet-50", ring: "ring-indigo-100", accent: "text-indigo-900", badge: "border-indigo-200 text-indigo-700 bg-indigo-50" },
    };
    const theme = PROFILE_THEMES[unifiedPhase || "Menstrual"] || PROFILE_THEMES["Menstrual"];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xs text-stone-300 font-bold tracking-[0.2em] uppercase">Loading Profile...</div>;
    }

    return (
        <div className={cn("min-h-screen pb-32 transition-colors duration-700", theme.bg)}>
            {/* 1. Header with Glass Nav */}
            <div className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40 support-[backdrop-filter]:bg-white/40">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-stone-400 hover:text-stone-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest opacity-80">Profile</span>
                <div className="w-9" /> {/* Spacer */}
            </div>

            <main className="max-w-xl mx-auto px-6 pt-8 space-y-12">

                {/* 2. Identity Section */}
                <section className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        {/* Breathing Phase Ring */}
                        <div className={cn("absolute inset-0 rounded-full animate-pulse opacity-50 blur-xl", theme.ring.replace("ring-", "bg-"))} />
                        <div className={cn("relative w-28 h-28 rounded-full flex items-center justify-center text-4xl font-heading text-stone-700 bg-white shadow-2xl ring-8 transition-all duration-700", theme.ring)}>
                            {formData.full_name?.[0] || user?.email?.[0] || "R"}
                            {/* Edit Overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                <span className="text-[9px] font-bold text-white uppercase tracking-widest">Edit</span>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-stone-100">
                            <Crown className={cn("w-4 h-4", theme.accent)} />
                        </div>
                    </div>

                    <div className="group relative">
                        <input
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            onBlur={handleSaveProfile}
                            className="bg-transparent text-3xl md:text-4xl font-heading text-stone-800 mb-2 tracking-tight text-center focus:outline-none focus:border-b border-stone-300 w-full"
                            placeholder="Your Name"
                        />
                        <Edit2 className="w-3 h-3 text-stone-300 absolute -right-4 top-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </section>

                {/* 3. Cycle Signature */}
                <CycleSignature
                    cycleLength={cycleData.cycle_length_days}
                    periodLength={cycleData.period_length_days}
                    isIrregular={formData.is_irregular}
                    phaseName={unifiedPhase}
                    theme={theme}
                />

                {/* 5. Settings Section */}
                <div className="space-y-6">
                    {/* Cycle Settings Card */}
                    <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Calendar className="w-32 h-32" />
                        </div>

                        <div className="p-8 relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-heading text-xl text-stone-800">Cycle Settings</h3>
                                    <p className="text-xs text-stone-400 mt-1">Adjust cycle & period lengths</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Cycle Length</span>
                                            <span className="font-heading font-bold text-stone-800">{cycleData.cycle_length_days} Days</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="21"
                                            max="45"
                                            value={cycleData.cycle_length_days}
                                            onChange={(e) => setCycleData(p => ({ ...p, cycle_length_days: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-800"
                                        />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Last Period Start</span>
                                        <input
                                            type="date"
                                            value={cycleData.last_period_start}
                                            onChange={(e) => setCycleData(p => ({ ...p, last_period_start: e.target.value }))}
                                            className="w-full p-3 bg-stone-50 border-none rounded-xl text-stone-700 font-medium focus:ring-2 focus:ring-stone-200"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleSaveCycle} className="w-full py-6 rounded-xl bg-stone-900 text-white font-bold tracking-wide shadow-lg hover:shadow-xl transition-all">
                                    Update Cycle
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Health Passport Card */}
                    <HealthPassport
                        formData={formData}
                        setFormData={setFormData}
                        onSave={handleSaveProfile}
                        isPending={isPending}
                        theme={theme}
                    />

                    {/* History View */}
                    <HistoryView theme={theme} />

                    {/* Account Settings */}
                    <AccountSettings email={user?.email} onLogout={handleLogout} />

                </div>
            </main>
        </div >
    );
}
