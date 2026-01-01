"use client";

import { useState, useTransition, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "./actions";
import { fetchUserCycleSettings, updateCycleLength, updateLastPeriodDate } from "@/app/actions/cycle-sync";
import { Button } from "@/components/ui/Button";
import {
    Calendar, LogOut, Bell, ChevronRight, Scale, Activity, Crown, Moon,
    Minus, Plus, HeartPulse, Sparkles, AlertCircle, Utensils, Zap, Trophy, Armchair, Pizza, Leaf, Beef, Egg, Flame, Fish, Wheat, Edit2, Check
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

    // Cycle Settings State
    const [cycleData, setCycleData] = useState({
        last_period_start: "",
        cycle_length_days: 28,
        period_length_days: 5
    });
    const [isEditingCycle, setIsEditingCycle] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            // Run all data fetches in parallel for faster loading
            const [profile, cycle, authUser] = await Promise.all([
                getUserProfile(),
                fetchUserCycleSettings(),
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

            // 2. Set Cycle Settings
            if (cycle) {
                setCycleData({
                    last_period_start: cycle.last_period_start || "",
                    cycle_length_days: cycle.cycle_length_days || 28,
                    period_length_days: cycle.period_length_days || 5
                });
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
            await updateLastPeriodDate(cycleData.last_period_start);
            await updateCycleLength(cycleData.period_length_days, cycleData.cycle_length_days, formData.is_irregular);
            alert("Cycle settings updated!");
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-sm text-stone-400 font-bold tracking-widest uppercase">Loading Profile...</div>;
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-32">
            {/* Header / Banner */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-stone-100">
                <div className="max-w-xl mx-auto px-6 py-5 flex items-center justify-between">
                    <h1 className="text-xl font-heading text-rove-charcoal tracking-tight">Profile</h1>
                    <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-rove-red transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 py-8 space-y-10">

                {/* 1. Identity Card */}
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-rove-cream flex items-center justify-center text-3xl font-heading text-rove-charcoal shadow-sm ring-4 ring-white">
                        {formData.full_name?.[0] || user?.email?.[0] || "R"}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-heading text-rove-charcoal">{formData.full_name || "Rove Member"}</h2>
                        <p className="text-sm text-stone-500 font-medium">{user?.email}</p>
                    </div>
                </div>

                {/* 2. Cycle Settings (The "Luxurious" Config) */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-rove-charcoal" />
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Cycle Architecture</h3>
                        </div>
                        <button
                            onClick={() => setIsEditingCycle(!isEditingCycle)}
                            className="text-xs font-medium text-rove-charcoal hover:text-stone-600 underline"
                        >
                            {isEditingCycle ? "Cancel" : "Edit"}
                        </button>
                    </div>

                    {!isEditingCycle ? (
                        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-heading text-rove-charcoal">{cycleData.period_length_days} / {cycleData.cycle_length_days}</p>
                                <p className="text-xs text-stone-400 font-medium tracking-wide mt-1">PERIOD / CYCLE DAYS</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-stone-900">{formData.is_irregular ? "Irregular" : "Regular"}</p>
                                <p className="text-xs text-stone-400 mt-1">Last: {new Date(cycleData.last_period_start || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm ring-1 ring-stone-100">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Period Length */}
                                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex flex-col items-center justify-center gap-2">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Period</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setCycleData(p => ({ ...p, period_length_days: Math.max(1, p.period_length_days - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 hover:text-rove-charcoal active:scale-90 transition-all">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xl font-heading text-rove-charcoal w-6 text-center">{cycleData.period_length_days}</span>
                                        <button onClick={() => setCycleData(p => ({ ...p, period_length_days: Math.min(10, p.period_length_days + 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 hover:text-rove-charcoal active:scale-90 transition-all">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Cycle Length */}
                                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex flex-col items-center justify-center gap-2">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cycle</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setCycleData(p => ({ ...p, cycle_length_days: Math.max(21, p.cycle_length_days - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 hover:text-rove-charcoal active:scale-90 transition-all">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xl font-heading text-rove-charcoal w-8 text-center">{cycleData.cycle_length_days}</span>
                                        <button onClick={() => setCycleData(p => ({ ...p, cycle_length_days: Math.min(45, p.cycle_length_days + 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 hover:text-rove-charcoal active:scale-90 transition-all">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Last Period Input */}
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Last Period</span>
                                    <input
                                        type="date"
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-3 pt-6 pb-2 text-sm font-medium text-rove-charcoal outline-none focus:ring-1 focus:ring-rove-charcoal/10 cursor-pointer"
                                        value={cycleData.last_period_start}
                                        onChange={(e) => setCycleData(p => ({ ...p, last_period_start: e.target.value }))}
                                    />
                                </div>

                                {/* Regularity Toggle */}
                                <button
                                    onClick={() => setFormData(p => ({ ...p, is_irregular: !p.is_irregular }))}
                                    className={cn(
                                        "flex-1 h-[60px] rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                                        formData.is_irregular
                                            ? "bg-amber-50 border-amber-100 text-amber-700"
                                            : "bg-white border-stone-100 text-stone-400 hover:border-stone-200"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Regularity</span>
                                    <span className="text-sm font-bold">{formData.is_irregular ? "Irregular" : "Regular"}</span>
                                </button>
                            </div>

                            <Button
                                onClick={() => {
                                    handleSaveCycle();
                                    setIsEditingCycle(false);
                                }}
                                disabled={isPending}
                                className="mt-4 w-full bg-rove-charcoal text-white py-4 rounded-xl hover:bg-black/90 transition-all font-medium text-sm font-heading shadow-xl shadow-rove-charcoal/10 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save Updates
                            </Button>
                        </div>
                    )}
                </section>

                {/* 3. Health & Biometrics */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <Scale className="w-4 h-4 text-rove-charcoal" />
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Health & Body</h3>
                    </div>

                    {/* Conditions Tags (New from Onboarding) */}
                    <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm mb-5">
                        <div className="flex items-center gap-2 mb-4">
                            <HeartPulse className="w-4 h-4 text-rove-red" />
                            <span className="text-sm font-bold text-stone-900">Conditions</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* Mock Editing for now - visualizing what they selected */}
                            {formData.conditions.length > 0 ? (
                                formData.conditions.map(c => (
                                    <span key={c} className="px-3 py-1.5 rounded-full bg-rove-red/5 text-rove-red text-xs font-medium border border-rove-red/10">
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-stone-400 italic">No conditions logged</span>
                            )}
                            <button onClick={() => alert("Condition editing coming soon")} className="px-3 py-1.5 rounded-full border border-dashed border-stone-200 text-stone-400 text-xs hover:border-stone-400 hover:text-stone-600 transition-colors">
                                + Edit
                            </button>
                        </div>
                    </div>

                    {/* Goals Tags (New from Onboarding) */}
                    <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm mb-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold text-stone-900">Focus Areas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.goals.length > 0 ? (
                                formData.goals.map(g => (
                                    <span key={g} className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                                        {g}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-stone-400 italic">No goals selected</span>
                            )}
                        </div>
                    </div>

                    {/* Diet Preference */}
                    <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm mb-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Utensils className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold text-stone-900">Diet Preference</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: "jain", label: "Jain (Sattvic)", icon: Leaf },
                                { id: "vegan", label: "Vegan", icon: Leaf },
                                { id: "vegetarian", label: "Vegetarian", icon: Pizza },
                                { id: "non_veg", label: "Non-Vegetarian", icon: Beef }
                            ].map((diet) => (
                                <button
                                    key={diet.id}
                                    onClick={() => setFormData(p => ({ ...p, diet_preference: diet.id }))}
                                    className={cn(
                                        "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                        formData.diet_preference === diet.id
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 ring-1 ring-emerald-200"
                                            : "bg-stone-50 border-transparent text-stone-500 hover:bg-stone-100"
                                    )}
                                >
                                    <diet.icon className="w-5 h-5" />
                                    <span className="text-xs font-semibold">{diet.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Level */}
                    <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm mb-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-bold text-stone-900">Activity Level</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: "sedentary", label: "Sedentary", desc: "Little to no formal exercise", icon: Armchair },
                                { id: "moderate", label: "Moderate", desc: "1-3 days/week", icon: Zap },
                                { id: "active", label: "Active", desc: "3-5 days/week", icon: Activity },
                                { id: "athlete", label: "Athlete", desc: "Daily intense training", icon: Trophy }
                            ].map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => setFormData(p => ({ ...p, activity_level: level.id }))}
                                    className={cn(
                                        "w-full p-4 rounded-xl border flex items-center justify-between transition-all group",
                                        formData.activity_level === level.id
                                            ? "bg-orange-50 border-orange-200 ring-1 ring-orange-200"
                                            : "bg-white border-stone-100 hover:border-stone-200 hover:bg-stone-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            formData.activity_level === level.id ? "bg-white text-orange-600" : "bg-stone-50 text-stone-400 group-hover:bg-white"
                                        )}>
                                            <level.icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className={cn("text-sm font-bold", formData.activity_level === level.id ? "text-orange-900" : "text-stone-700")}>
                                                {level.label}
                                            </p>
                                            <p className="text-xs text-stone-400">{level.desc}</p>
                                        </div>
                                    </div>
                                    {formData.activity_level === level.id && (
                                        <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white ring-1 ring-orange-200" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Height & Weight (Compact Row) */}
                    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex divide-x divide-stone-100 mb-5">
                        <div className="flex-1 pr-4 flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Height</label>
                            <div className="flex items-baseline gap-1">
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData(p => ({ ...p, height: Number(e.target.value) }))}
                                    className="text-xl font-heading text-rove-charcoal w-16 bg-transparent outline-none p-0 text-right"
                                />
                                <span className="text-xs text-stone-400 font-medium">cm</span>
                            </div>
                        </div>
                        <div className="flex-1 pl-4 flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Weight</label>
                            <div className="flex items-baseline gap-1">
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData(p => ({ ...p, weight: Number(e.target.value) }))}
                                    className="text-xl font-heading text-rove-charcoal w-16 bg-transparent outline-none p-0 text-right"
                                />
                                <span className="text-xs text-stone-400 font-medium">kg</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSaveProfile}
                        disabled={isPending}
                        className="mt-4 w-full bg-white border border-stone-200 text-stone-900 py-6 rounded-2xl hover:bg-stone-50 transition-all font-medium"
                    >
                        Save Health Data
                    </Button>
                </section>

                {/* 4. Settings Menu */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <Activity className="w-4 h-4 text-rove-charcoal" />
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Preferences</h3>
                    </div>
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100">
                        <div className="p-5 flex items-center justify-between border-b border-stone-50 hover:bg-stone-50/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                    <Bell className="w-5 h-5 text-stone-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-stone-900 font-heading">Notifications</p>
                                    <p className="text-xs text-stone-400">Daily reminders</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-stone-300" />
                        </div>

                        <div className="p-5 flex items-center justify-between hover:bg-stone-50/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                    <Moon className="w-5 h-5 text-stone-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-stone-900 font-heading">Appearance</p>
                                    <p className="text-xs text-stone-400">System Default</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-stone-300" />
                        </div>
                    </div>
                </section>

                <div className="pt-8 flex justify-center">
                    <p className="text-[10px] text-stone-300 font-medium uppercase tracking-widest">Rove Health v1.0.3</p>
                </div>
            </div >
        </div >
    );
}
