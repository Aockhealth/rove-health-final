"use client";

import { motion } from "framer-motion";

type StepWelcomeProps = {
    name: string;
    dateOfBirth: string;
    onNameChange: (value: string) => void;
    onDobChange: (value: string) => void;
    errors: Record<string, string>;
};

export default function StepWelcome({
    name,
    dateOfBirth,
    onNameChange,
    onDobChange,
    errors,
}: StepWelcomeProps) {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18); // 18+ years only (<= 2008)
    const maxDateStr = maxDate.toISOString().split("T")[0];
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    const minDateStr = minDate.toISOString().split("T")[0];

    return (
        <section className="flex flex-col space-y-8 px-1">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="space-y-3"
            >
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-rove-charcoal sm:text-4xl">
                    Welcome to Rove
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-rove-stone">
                    Let&apos;s set up your profile. This takes about 2 minutes.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="space-y-5"
            >
                {/* Name field */}
                <div className="space-y-2">
                    <label
                        htmlFor="onboarding-name"
                        className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone"
                    >
                        What should we call you?
                    </label>
                    <input
                        id="onboarding-name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                        className="w-full rounded-2xl border border-rove-charcoal/10 bg-white/60 px-5 py-3.5 text-base text-rove-charcoal shadow-sm backdrop-blur-sm outline-none transition-all placeholder:text-rove-stone/50 focus:border-rove-charcoal/30 focus:ring-2 focus:ring-rove-charcoal/10"
                    />
                    {errors.name && (
                        <p className="text-sm text-phase-menstrual">{errors.name}</p>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <label
                        htmlFor="onboarding-dob"
                        className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone"
                    >
                        Date of birth
                    </label>
                    <p className="text-xs text-rove-stone/70">
                        Used to personalize your nutrition and calorie recommendations.
                    </p>
                    <input
                        id="onboarding-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => onDobChange(e.target.value)}
                        min={minDateStr}
                        max={maxDateStr}
                        className="w-full rounded-2xl border border-rove-charcoal/10 bg-white/60 px-5 py-3.5 text-base text-rove-charcoal shadow-sm backdrop-blur-sm outline-none transition-all focus:border-rove-charcoal/30 focus:ring-2 focus:ring-rove-charcoal/10"
                    />
                    {errors.dateOfBirth && (
                        <p className="text-sm text-phase-menstrual">{errors.dateOfBirth}</p>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
