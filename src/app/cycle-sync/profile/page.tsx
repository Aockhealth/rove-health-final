"use client";

import { useState, useTransition, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "./actions";
import { Button } from "@/components/ui/Button";
import { Sparkles, Target, Scale, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS_BY_STAGE: Record<string, string[]> = {
    menstruation: ['Weight Loss', 'Maintenance', 'Energy Boost', 'Hormone Balance', 'Muscle Gain', 'Reduce PMS'],
    ttc: ['Conceive Naturally', 'Track Ovulation', 'Improve Egg Quality', 'Hormone Balance', 'Reduce Stress'],
    menopause: ['Manage Hot Flashes', 'Weight Management', 'Sleep Better', 'Bone Health', 'Hormone Balance']
};

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        tracker_mode: "menstruation",
        goals: [] as string[],
        weight: 0,
        height: 0,
        activity_level: "moderate"
    });

    useEffect(() => {
        getUserProfile().then(data => {
            if (data) {
                setFormData({
                    tracker_mode: data.tracker_mode || "menstruation",
                    goals: data.goals || [],
                    weight: data.weight_kg || 0,
                    height: data.height_cm || 0,
                    activity_level: data.activity_level || "moderate",
                });
            }
            setLoading(false);
        });
    }, []);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleGoal = (goal: string) => {
        setFormData(prev => {
            const exists = prev.goals.includes(goal);
            return {
                ...prev,
                goals: exists
                    ? prev.goals.filter(g => g !== goal)
                    : [...prev.goals, goal]
            };
        });
    };

    const handleSave = () => {
        startTransition(async () => {
            const res = await updateUserProfile(formData);
            if (res.error) {
                alert("Error updating profile: " + res.error);
            } else {
                alert("Profile updated successfully!");
            }
        });
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rove-charcoal" /></div>;
    }

    return (
        <div className="p-6 md:p-12 space-y-8 pb-32">
            <div>
                <h1 className="text-3xl font-heading text-rove-charcoal">Your Profile</h1>
                <p className="text-rove-stone">Manage your journey and preferences.</p>
            </div>

            {/* Goals Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-rove-charcoal">
                    <Target className="w-5 h-5" />
                    <h2 className="text-xl font-heading">My Goals</h2>
                </div>
                <div className="grid gap-3">
                    {GOALS_BY_STAGE['menstruation']?.map(g => {
                        const isSelected = formData.goals.includes(g);
                        return (
                            <div
                                key={g}
                                onClick={() => toggleGoal(g)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all bg-white",
                                    isSelected
                                        ? "border-rove-green bg-rove-green/5"
                                        : "border-transparent hover:border-rove-charcoal/20"
                                )}
                            >
                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center", isSelected ? "bg-rove-green border-rove-green" : "border-rove-stone/30")}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="font-heading text-rove-charcoal">{g}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Basics Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-rove-charcoal">
                    <Scale className="w-5 h-5" />
                    <h2 className="text-xl font-heading">The Basics</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-rove-stone">Height (cm)</label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => updateField("height", Number(e.target.value))}
                            className="w-full p-3 rounded-xl bg-rove-cream/30 border border-transparent focus:border-rove-charcoal outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-rove-stone">Weight (kg)</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => updateField("weight", Number(e.target.value))}
                            className="w-full p-3 rounded-xl bg-rove-cream/30 border border-transparent focus:border-rove-charcoal outline-none"
                        />
                    </div>
                </div>
            </section>

            <div className="pt-4">
                <Button onClick={handleSave} className="w-full bg-rove-charcoal text-white py-6 rounded-xl" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
