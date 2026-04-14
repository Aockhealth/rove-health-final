"use client";

import { useState, useTransition, useEffect } from "react";
import { fetchProfilePageData, updateUserProfile, deleteUserAccount } from "./actions";
import { updateCycleLength, updateLastPeriodDate } from "@/app/actions/cycle-sync";
import { requestPasswordReset, updateContactInfo } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import {
    ChevronLeft, Crown, Edit2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CycleSignature } from "./components/CycleSignature";
import { HealthPassport } from "./components/HealthPassport";
import { AccountSettings } from "./components/AccountSettings";

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
        is_irregular: false,
        phone_number: ""
    });

    // Cycle Settings State
    const [cycleData, setCycleData] = useState({
        last_period_start: "",
        cycle_length_days: 28,
        period_length_days: 5
    });

    const [unifiedPhase, setUnifiedPhase] = useState<string | null>("Menstrual");

    // ⚡ Phase 1: Single bundled data fetch (1 auth call, 5 parallel DB queries)
    useEffect(() => {
        const loadData = async () => {
            const data = await fetchProfilePageData();
            if (data) {
                setUser(data.user);
                setFormData(data.formData);
                setCycleData(data.cycleData);
                setUnifiedPhase(data.smartPhase);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    // Phase 3: All saves now use toast() instead of alert()
    const handleSaveProfile = () => {
        startTransition(async () => {
            const res = await updateUserProfile(formData);
            if (res.error) {
                toast.error("Failed to save profile", { description: res.error });
                return;
            }
            toast.success("Profile updated");
        });
    };

    const handleSaveCycle = () => {
        startTransition(async () => {
            await updateLastPeriodDate(cycleData.last_period_start);
            await updateCycleLength(cycleData.period_length_days, cycleData.cycle_length_days, formData.is_irregular);
            toast.success("Cycle settings updated");
        });
    };

    // Logic for updating Email and Phone
    const handleUpdateContact = async (newEmail: string, newPhone: string) => {
        startTransition(async () => {
            const res = await updateContactInfo(newEmail, newPhone);
            if (res.ok) {
                toast.success("Contact info updated", { description: res.message });
                setFormData(prev => ({ ...prev, phone_number: newPhone }));
            } else {
                toast.error("Update failed", { description: res.error });
            }
        });
    };

    // Logic for Password Reset Email
    const handleResetPassword = async () => {
        if (!user?.email) return;
        startTransition(async () => {
            const res = await requestPasswordReset(user.email);
            if (res.ok) {
                toast.success("Password reset email sent", { description: res.message });
            } else {
                toast.error("Failed to send reset email", { description: res.error });
            }
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    // Phase 4: Real account deletion
    const handleAccountDeletion = async () => {
        startTransition(async () => {
            const res = await deleteUserAccount();
            if (res.error) {
                toast.error("Failed to delete account", { description: res.error });
                return;
            }
            toast.success("Account deleted. Goodbye.");
            router.push("/login");
        });
    };

    // --- LUXURY THEMES ---
    const PROFILE_THEMES: Record<string, { bg: string, ring: string, accent: string, badge: string }> = {
        "Menstrual": { bg: "bg-gradient-to-br from-phase-menstrual/10 via-white to-phase-menstrual/10", ring: "ring-phase-menstrual/20", accent: "text-phase-menstrual", badge: "border-phase-menstrual/30 text-phase-menstrual bg-phase-menstrual/10" },
        "Follicular": { bg: "bg-gradient-to-br from-teal-50 via-white to-teal-50", ring: "ring-teal-100", accent: "text-teal-900", badge: "border-teal-200 text-teal-700 bg-teal-50" },
        "Ovulatory": { bg: "bg-gradient-to-br from-amber-50 via-white to-orange-50", ring: "ring-amber-100", accent: "text-amber-900", badge: "border-amber-200 text-amber-700 bg-amber-50" },
        "Luteal": { bg: "bg-gradient-to-br from-indigo-50 via-white to-violet-50", ring: "ring-indigo-100", accent: "text-indigo-900", badge: "border-indigo-200 text-indigo-700 bg-indigo-50" },
    };
    const theme = PROFILE_THEMES[unifiedPhase || "Menstrual"] || PROFILE_THEMES["Menstrual"];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xs text-stone-300 font-bold uppercase tracking-widest">Loading...</div>;
    }

    return (
        <div className={cn("min-h-screen pb-4 md:pb-32 transition-colors duration-700", theme.bg)}>
            <div className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-stone-400 hover:text-stone-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest opacity-80">Profile</span>
                <div className="w-9" />
            </div>

            <main className="max-w-xl mx-auto px-6 pt-8 space-y-12">
                {/* Identity Section */}
                <section className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className={cn("absolute inset-0 rounded-full animate-pulse opacity-50 blur-xl", theme.ring.replace("ring-", "bg-"))} />
                        <div className={cn("relative w-28 h-28 rounded-full flex items-center justify-center text-4xl font-heading text-stone-700 bg-white shadow-2xl ring-8 transition-all duration-700", theme.ring)}>
                            {formData.full_name?.[0] || user?.email?.[0] || "U"}
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
                            className="bg-transparent text-3xl md:text-4xl font-heading text-stone-800 mb-2 tracking-tight text-center focus:outline-none w-full"
                            placeholder="Your Name"
                        />
                        <Edit2 className="w-3 h-3 text-stone-300 absolute -right-4 top-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </section>

                <CycleSignature
                    cycleLength={cycleData.cycle_length_days}
                    periodLength={cycleData.period_length_days}
                    isIrregular={formData.is_irregular}
                    phaseName={unifiedPhase || "Menstrual"}
                    theme={theme}
                />

                <div className="space-y-6">
                    {/* Cycle Settings */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 p-8 shadow-sm">
                        <h3 className="font-heading text-xl text-stone-800 mb-6">Cycle Settings</h3>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {/* Cycle Length Slider */}
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
                                {/* Phase 4: Period Length Slider (NEW) */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Period Length</span>
                                        <span className="font-heading font-bold text-stone-800">{cycleData.period_length_days} Days</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="10"
                                        value={cycleData.period_length_days}
                                        onChange={(e) => setCycleData(p => ({ ...p, period_length_days: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-phase-menstrual"
                                    />
                                </div>
                                {/* Last Period Date */}
                                <div>
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Last Period Start</span>
                                    <input
                                        type="date"
                                        value={cycleData.last_period_start}
                                        onChange={(e) => setCycleData(p => ({ ...p, last_period_start: e.target.value }))}
                                        className="w-full p-3 bg-stone-50 border-none rounded-xl text-stone-700 font-medium"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveCycle} className="w-full py-6 rounded-xl bg-stone-900 text-white font-bold tracking-wide shadow-lg">
                                Update Cycle
                            </Button>
                        </div>
                    </div>

                    <HealthPassport
                        formData={formData}
                        setFormData={setFormData}
                        onSave={handleSaveProfile}
                        isPending={isPending}
                        theme={theme}
                    />

                    {/* Phase 2: HistoryView REMOVED (was 100% hardcoded fake data) */}

                    {/* Integrated Account Settings */}
                    <AccountSettings 
                        email={user?.email || ""} 
                        phone={formData.phone_number}
                        onLogout={handleLogout}
                        onResetPassword={handleResetPassword}
                        onUpdateContact={handleUpdateContact}
                        onDeleteAccount={handleAccountDeletion}
                        isPending={isPending}
                    />
                </div>
            </main>
        </div>
    );
}