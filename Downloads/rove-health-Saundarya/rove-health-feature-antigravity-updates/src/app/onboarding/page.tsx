"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitOnboarding } from "./actions";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { ArrowRight, Check, Activity, Calendar, Target, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: "basics", title: "The Basics", icon: Scale },
    { id: "health", title: "Health Profile", icon: Activity },
    { id: "cycle", title: "Cycle History", icon: Calendar },
    { id: "goals", title: "Your Goals", icon: Target },
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        height: "",
        weight: "",
        dob: "",
        activity: "moderate", // default
        conditions: [] as string[],
        diet: [] as string[],
        lastPeriod: "",
        cycleLength: 28,
        periodLength: 5,
        irregular: false,
        goal: ""
    });

    const totalSteps = STEPS.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleCondition = (condition: string) => {
        setFormData(prev => {
            const exists = prev.conditions.includes(condition);
            return {
                ...prev,
                conditions: exists
                    ? prev.conditions.filter(c => c !== condition)
                    : [...prev.conditions, condition]
            };
        });
    };

    const next = () => {
        if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
    };

    const back = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        startTransition(async () => {
            await submitOnboarding({
                ...formData,
                height: Number(formData.height),
                weight: Number(formData.weight),
            });
        });
    };

    return (
        <div className="min-h-screen bg-rove-cream/20 flex flex-col md:flex-row">
            {/* Left Panel - Progress */}
            <div className="w-full md:w-1/3 bg-white/60 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-between border-r border-white/50">
                <div>
                    <div className="w-10 h-10 rounded-full bg-rove-charcoal mb-8" />
                    <h1 className="font-heading text-3xl md:text-4xl text-rove-charcoal mb-4">Let's get to know you.</h1>
                    <p className="text-rove-stone">We'll use this data to curb your cravings and sync your life.</p>
                </div>

                <div className="space-y-6 hidden md:block">
                    {STEPS.map((step, i) => (
                        <div key={step.id} className={cn("flex items-center gap-4 transition-colors", i === currentStep ? "text-rove-charcoal" : "text-rove-stone/40")}>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                                i <= currentStep ? "border-rove-charcoal bg-rove-charcoal text-white" : "border-current"
                            )}>
                                {i < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className="font-heading text-lg">{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 p-6 md:p-12 flex items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-lg relative z-10">
                    <div className="mb-8">
                        <span className="text-xs font-bold uppercase tracking-widest text-rove-stone block md:hidden mb-2">Step {currentStep + 1} of {totalSteps}</span>
                        <div className="h-1 w-full bg-rove-stone/10 rounded-full overflow-hidden md:hidden">
                            <div className="h-full bg-rove-charcoal transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                            <motion.div key="basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-heading text-rove-charcoal">The Basics</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-rove-stone">Height (cm)</label>
                                            <input
                                                type="number"
                                                value={formData.height}
                                                onChange={(e) => updateField("height", e.target.value)}
                                                placeholder="165"
                                                className="w-full p-4 rounded-xl bg-white border border-transparent focus:border-rove-charcoal outline-none shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-rove-stone">Weight (kg)</label>
                                            <input
                                                type="number"
                                                value={formData.weight}
                                                onChange={(e) => updateField("weight", e.target.value)}
                                                placeholder="60"
                                                className="w-full p-4 rounded-xl bg-white border border-transparent focus:border-rove-charcoal outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-rove-stone">Date of Birth</label>
                                        <DatePicker
                                            value={formData.dob}
                                            onChange={(value) => updateField("dob", value)}
                                            placeholder="Select your date of birth"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div key="health" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-2xl font-heading text-rove-charcoal">Health Profile</h2>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-rove-stone">Metabolic Conditions</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['PCOS', 'Endometriosis', 'Thyroid Issues', 'Insulin Resistance', 'None'].map(c => {
                                            const isSelected = formData.conditions.includes(c);
                                            return (
                                                <div
                                                    key={c}
                                                    onClick={() => toggleCondition(c)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                                                        isSelected
                                                            ? "bg-rove-charcoal/5 border-rove-charcoal"
                                                            : "bg-white border-transparent hover:border-rove-charcoal/20"
                                                    )}
                                                >
                                                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center", isSelected ? "bg-rove-charcoal border-rove-charcoal" : "border-rove-stone/30")}>
                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-rove-charcoal">{c}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div key="cycle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-2xl font-heading text-rove-charcoal">Cycle History</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-rove-stone">When did your last period start?</label>
                                        <DatePicker
                                            value={formData.lastPeriod}
                                            onChange={(value) => updateField("lastPeriod", value)}
                                            placeholder="Select date"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-rove-stone">Cycle Length (Days)</label>
                                            <input
                                                type="number"
                                                value={formData.cycleLength}
                                                onChange={(e) => updateField("cycleLength", Number(e.target.value))}
                                                className="w-full p-4 rounded-xl bg-white border border-transparent focus:border-rove-charcoal outline-none shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-rove-stone">Period Duration</label>
                                            <input
                                                type="number"
                                                value={formData.periodLength}
                                                onChange={(e) => updateField("periodLength", Number(e.target.value))}
                                                className="w-full p-4 rounded-xl bg-white border border-transparent focus:border-rove-charcoal outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-2xl font-heading text-rove-charcoal">Primary Goal</h2>
                                <div className="space-y-3">
                                    {['Weight Loss', 'Maintenance', 'Energy Boost', 'Hormone Balance', 'Muscle Gain'].map(g => {
                                        const val = g.toLowerCase().replace(" ", "_");
                                        const isSelected = formData.goal === val;
                                        return (
                                            <div
                                                key={g}
                                                onClick={() => updateField("goal", val)}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                                                    isSelected
                                                        ? "bg-rove-green/5 border-rove-green"
                                                        : "bg-white border-transparent hover:border-rove-charcoal/20"
                                                )}
                                            >
                                                <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isSelected ? "border-rove-green" : "border-rove-stone/30")}>
                                                    {isSelected && <div className="w-3 h-3 rounded-full bg-rove-green" />}
                                                </div>
                                                <span className="text-1xl font-heading text-rove-charcoal">{g}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-10 pt-6 border-t border-rove-stone/10">
                        <Button variant="ghost" className={currentStep === 0 ? "invisible" : ""} onClick={back}>
                            Back
                        </Button>

                        {currentStep === totalSteps - 1 ? (
                            <Button onClick={handleSubmit} className="bg-rove-charcoal text-white rounded-full px-8 py-6" disabled={isPending}>
                                {isPending ? "Personalizing..." : "Complete Setup"} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={next} className="bg-white text-rove-charcoal hover:bg-white/80 rounded-full px-8 py-6 shadow-sm">
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
