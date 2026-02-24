"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { SymptomInput } from "@/lib/onboarding/types";

const MEDICAL_CONDITIONS = [
    "None",
    "PCOS / PCOD",
    "Recurrent UTI",
    "Bacterial Vaginosis",
    "Endometriosis",
    "Fibroids",
    "Diabetes",
    "Hypertension",
    "Thyroid",
];

const PHYSICAL_SYMPTOMS = ["Cramps", "Bloating", "Fatigue", "Headache", "Backache", "Acne", "Breast pain"];
const EMOTIONAL_SYMPTOMS = ["Mood swings", "Feeling low", "Irritability", "Anger", "Food cravings"];
const ALL_SYMPTOMS = [
    ...PHYSICAL_SYMPTOMS.map((s) => ({ name: s, category: "Physical" as const })),
    ...EMOTIONAL_SYMPTOMS.map((s) => ({ name: s, category: "Emotional" as const })),
];

const DIET_OPTIONS = [
    { id: "vegetarian", label: "Vegetarian" },
    { id: "non_vegetarian", label: "Non-Veg" },
    { id: "vegan", label: "Vegan" },
    { id: "jain", label: "Jain" },
    { id: "eggetarian", label: "Eggetarian" },
    { id: "pescatarian", label: "Pescatarian" },
];

type StepAboutYouProps = {
    conditions: string[];
    symptoms: SymptomInput[];
    heightCm: number | null;
    weightKg: number | null;
    dietPreference: string;
    onToggleCondition: (condition: string) => void;
    onToggleSymptom: (symptom: SymptomInput) => void;
    onHeightChange: (value: number | null) => void;
    onWeightChange: (value: number | null) => void;
    onDietChange: (value: string) => void;
    errors: Record<string, string>;
};

export default function StepAboutYou({
    conditions,
    symptoms,
    heightCm,
    weightKg,
    dietPreference,
    onToggleCondition,
    onToggleSymptom,
    onHeightChange,
    onWeightChange,
    onDietChange,
    errors,
}: StepAboutYouProps) {
    const [showSymptoms, setShowSymptoms] = useState(false);

    return (
        <section className="space-y-6 px-1">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="space-y-2"
            >
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-rove-charcoal sm:text-3xl">
                    About You
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-rove-stone">
                    A few details about your health and lifestyle to tailor your experience.
                </p>
            </motion.div>

            {/* Health Conditions */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone">
                    Health Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                    {MEDICAL_CONDITIONS.map((condition) => {
                        const isSelected = conditions.includes(condition);
                        return (
                            <button
                                key={condition}
                                type="button"
                                onClick={() => onToggleCondition(condition)}
                                aria-pressed={isSelected}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${isSelected
                                        ? "border-rove-charcoal bg-rove-charcoal text-rove-cream"
                                        : "border-rove-charcoal/10 bg-white/60 text-rove-charcoal backdrop-blur-sm hover:border-rove-charcoal/25"
                                    }`}
                            >
                                {condition}
                                {isSelected && <Check className="h-3.5 w-3.5" />}
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Symptoms (expandable) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
            >
                <button
                    type="button"
                    onClick={() => setShowSymptoms(!showSymptoms)}
                    className="flex w-full items-center justify-between rounded-2xl border border-rove-charcoal/8 bg-white/60 px-4 py-3.5 text-left shadow-sm backdrop-blur-xl transition hover:border-rove-charcoal/15"
                >
                    <div>
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone">
                            Typical Symptoms
                        </h3>
                        <p className="text-xs text-rove-stone/60">
                            {symptoms.length > 0
                                ? `${symptoms.length} selected`
                                : "Optional — helps personalize insights"}
                        </p>
                    </div>
                    <motion.div animate={{ rotate: showSymptoms ? 180 : 0 }}>
                        <ChevronDown className="h-4 w-4 text-rove-stone" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showSymptoms && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 pt-1">
                                {ALL_SYMPTOMS.map(({ name, category }) => {
                                    const isSelected = symptoms.some((s) => s.name === name);
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => onToggleSymptom({ name, category, severity: 5 })}
                                            aria-pressed={isSelected}
                                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all active:scale-95 ${isSelected
                                                    ? "border-rove-charcoal bg-rove-charcoal text-rove-cream"
                                                    : "border-rove-charcoal/10 bg-white/60 text-rove-charcoal hover:border-rove-charcoal/25"
                                                }`}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Lifestyle */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
            >
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone">
                    Lifestyle
                </h3>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1.5">
                        <span className="text-xs font-semibold text-rove-stone">Height (cm)</span>
                        <input
                            type="number"
                            min={100}
                            max={250}
                            value={heightCm ?? ""}
                            onChange={(e) => {
                                const v = e.target.value === "" ? null : Number(e.target.value);
                                onHeightChange(v);
                            }}
                            placeholder="165"
                            className="w-full rounded-2xl border border-rove-charcoal/10 bg-white/60 px-4 py-3 text-sm text-rove-charcoal shadow-sm backdrop-blur-sm outline-none transition placeholder:text-rove-stone/40 focus:border-rove-charcoal/30 focus:ring-2 focus:ring-rove-charcoal/10"
                        />
                    </label>
                    <label className="space-y-1.5">
                        <span className="text-xs font-semibold text-rove-stone">Weight (kg)</span>
                        <input
                            type="number"
                            min={20}
                            max={300}
                            value={weightKg ?? ""}
                            onChange={(e) => {
                                const v = e.target.value === "" ? null : Number(e.target.value);
                                onWeightChange(v);
                            }}
                            placeholder="60"
                            className="w-full rounded-2xl border border-rove-charcoal/10 bg-white/60 px-4 py-3 text-sm text-rove-charcoal shadow-sm backdrop-blur-sm outline-none transition placeholder:text-rove-stone/40 focus:border-rove-charcoal/30 focus:ring-2 focus:ring-rove-charcoal/10"
                        />
                    </label>
                </div>

                {/* Diet */}
                <div className="space-y-2">
                    <span className="text-xs font-semibold text-rove-stone">Diet preference</span>
                    <div className="grid grid-cols-3 gap-2">
                        {DIET_OPTIONS.map((diet) => {
                            const isSelected = dietPreference === diet.id;
                            return (
                                <button
                                    key={diet.id}
                                    type="button"
                                    onClick={() => onDietChange(isSelected ? "" : diet.id)}
                                    className={`rounded-2xl border px-3 py-3 text-center text-xs font-semibold transition-all active:scale-95 ${isSelected
                                            ? "border-rove-charcoal bg-rove-charcoal text-rove-cream"
                                            : "border-rove-charcoal/10 bg-white/60 text-rove-charcoal hover:border-rove-charcoal/25"
                                        }`}
                                >
                                    {diet.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {errors.form && <p className="text-center text-sm text-phase-menstrual">{errors.form}</p>}
        </section>
    );
}
