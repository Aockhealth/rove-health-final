"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Target, TrendingDown, Scale, Flame } from "lucide-react";
import { savePlanSettings } from "@/app/cycle-sync/plan/actions";
import { cn } from "@/lib/utils";

interface PlanSetupWizardProps {
    open: boolean;
    currentWeight: number; // pass from existing profile if known
}

type FitnessGoal = "weight_loss" | "maintenance" | "muscle_gain";

export default function PlanSetupWizard({ open, currentWeight = 60 }: PlanSetupWizardProps) {
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();

    // Form State
    const [goal, setGoal] = useState<FitnessGoal>("weight_loss");
    const [weight, setWeight] = useState(currentWeight || 60);
    const [targetWeight, setTargetWeight] = useState(currentWeight ? currentWeight - 5 : 55);
    const [weeklyRate, setWeeklyRate] = useState(0.5); // kg per week

    const handleSubmit = () => {
        startTransition(async () => {
            const res = await savePlanSettings({
                fitnessGoal: goal,
                weight: weight,
                targetWeight: goal === "maintenance" ? weight : targetWeight,
                weeklyRate
            });
            if (res?.error) {
                alert("Error: " + res.error);
            } else {
                // Success - the page should revalidate and close this
                // But for good UX we can reload or just let server action revalidatePath handle it
                window.location.reload();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#FDFBF7] border-0 shadow-2xl rounded-3xl">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="w-12 h-12 bg-rove-charcoal text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rove-charcoal/20">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-rove-charcoal mb-2">
                            {step === 1 ? "Set Your Goal" : "Customize Plan"}
                        </h2>
                        <p className="text-rove-stone text-sm">
                            {step === 1
                                ? "To personalize your nutrition & workouts"
                                : "Let's set some realistic targets"
                            }
                        </p>
                    </div>

                    {/* Step 1: Goal Evaluation */}
                    {step === 1 && (
                        <div className="space-y-3">
                            <button
                                onClick={() => setGoal("weight_loss")}
                                className={cn(
                                    "w-full p-4 rounded-xl border flex items-center gap-4 transition-all group",
                                    goal === "weight_loss"
                                        ? "bg-white border-rove-charcoal shadow-md ring-1 ring-rove-charcoal/5"
                                        : "bg-white/50 border-transparent hover:bg-white"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", goal === "weight_loss" ? "bg-rove-charcoal text-white" : "bg-stone-100 text-stone-400 group-hover:text-stone-600")}>
                                    <TrendingDown className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-heading font-bold text-rove-charcoal">Weight Loss</p>
                                    <p className="text-xs text-rove-stone">Burn fat sustainably</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setGoal("maintenance")}
                                className={cn(
                                    "w-full p-4 rounded-xl border flex items-center gap-4 transition-all group",
                                    goal === "maintenance"
                                        ? "bg-white border-rove-charcoal shadow-md ring-1 ring-rove-charcoal/5"
                                        : "bg-white/50 border-transparent hover:bg-white"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", goal === "maintenance" ? "bg-rove-charcoal text-white" : "bg-stone-100 text-stone-400 group-hover:text-stone-600")}>
                                    <Scale className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-heading font-bold text-rove-charcoal">Maintenance</p>
                                    <p className="text-xs text-rove-stone">Stay healthy & balanced</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setGoal("muscle_gain")}
                                className={cn(
                                    "w-full p-4 rounded-xl border flex items-center gap-4 transition-all group",
                                    goal === "muscle_gain"
                                        ? "bg-white border-rove-charcoal shadow-md ring-1 ring-rove-charcoal/5"
                                        : "bg-white/50 border-transparent hover:bg-white"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", goal === "muscle_gain" ? "bg-rove-charcoal text-white" : "bg-stone-100 text-stone-400 group-hover:text-stone-600")}>
                                    <Flame className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-heading font-bold text-rove-charcoal">Muscle Gain</p>
                                    <p className="text-xs text-rove-stone">Build strength & tone</p>
                                </div>
                            </button>

                            <Button onClick={() => setStep(2)} className="w-full mt-6 py-6 rounded-xl bg-rove-charcoal text-white hover:bg-black font-heading font-bold text-lg shadow-lg shadow-rove-charcoal/20">
                                Continue
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Current Weight */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-rove-stone mb-2 block">Current Weight (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
                                    className="w-full bg-white border border-stone-100 rounded-xl p-4 text-2xl font-heading font-bold text-rove-charcoal focus:ring-2 focus:ring-rove-charcoal/10 outline-none transition-all"
                                />
                            </div>

                            {/* Target Weight (Hide for Maintenance) */}
                            {goal !== "maintenance" && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-rove-stone mb-2 block">Target Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={targetWeight}
                                        onChange={(e) => setTargetWeight(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-white border border-stone-100 rounded-xl p-4 text-2xl font-heading font-bold text-rove-charcoal focus:ring-2 focus:ring-rove-charcoal/10 outline-none transition-all"
                                    />
                                    {goal === "weight_loss" && targetWeight >= weight && (
                                        <p className="text-xs text-red-500 mt-2 font-medium">Target should be less than current weight.</p>
                                    )}
                                </div>
                            )}

                            {/* Weekly Rate (Only Weight Loss) */}
                            {goal === "weight_loss" && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-rove-stone mb-2 block">Pace: {weeklyRate} kg/week</label>
                                    <input
                                        type="range"
                                        min="0.25"
                                        max="1.0"
                                        step="0.05"
                                        value={weeklyRate}
                                        onChange={(e) => setWeeklyRate(Number(e.target.value))}
                                        className="w-full accent-rove-charcoal h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-rove-stone/40 mt-2">
                                        <span>Sustainable</span>
                                        <span>Aggressive</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 py-6 rounded-xl border-stone-200 hover:bg-stone-50">Back</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="flex-[2] py-6 rounded-xl bg-rove-charcoal text-white hover:bg-black font-heading font-bold text-lg shadow-lg shadow-rove-charcoal/20 flex items-center justify-center gap-2"
                                >
                                    {isPending ? "Saving..." : <>Confirm Plan <Check className="w-4 h-4" /></>}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
