"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  BarChart3,
  Scale,
  HeartPulse,
  Flower2,
  BookOpen,
  Check,
  Shield,
} from "lucide-react";

const GOALS = [
  { id: "syncing", label: "Cycle Syncing", description: "Align routines with your hormonal phases", Icon: Calendar },
  { id: "tracking", label: "Cycle Tracking", description: "Track period and symptom patterns", Icon: BarChart3 },
  { id: "weight_loss", label: "Weight Loss", description: "Build sustainable fat-loss habits", Icon: Scale },
  { id: "pcos", label: "PCOS Guidance", description: "Manage symptoms and energy better", Icon: HeartPulse },
  { id: "other", label: "General Wellness", description: "Improve mood, focus, and consistency", Icon: Flower2 },
  { id: "learn_body", label: "Learn My Body", description: "Understand your personal cycle trends", Icon: BookOpen },
];

type StepGoalsProps = {
  selectedGoals: string[];
  privacyConsented: boolean;
  onToggleGoal: (goalId: string) => void;
  onPrivacyConsentChange: (value: boolean) => void;
  errors: Record<string, string>;
};

export default function StepGoals({
  selectedGoals,
  privacyConsented,
  onToggleGoal,
  onPrivacyConsentChange,
  errors,
}: StepGoalsProps) {
  return (
    <section className="space-y-6 px-1">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-2"
      >
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-rove-charcoal sm:text-3xl">
          Your Goals
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-rove-stone">
          Pick what matters most — we&apos;ll tailor your daily plan from day one.
        </p>
      </motion.div>

      {/* Goal cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3 sm:grid-cols-2"
      >
        {GOALS.map((goal, i) => {
          const selected = selectedGoals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              type="button"
              onClick={() => onToggleGoal(goal.id)}
              aria-pressed={selected}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.97] ${selected
                  ? "border-rove-charcoal bg-rove-charcoal shadow-lg shadow-rove-charcoal/15"
                  : "border-rove-charcoal/10 bg-white/60 backdrop-blur-sm hover:border-rove-charcoal/25 hover:shadow-sm"
                }`}
            >
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 inline-flex rounded-full bg-rove-cream p-1 text-rove-charcoal"
                >
                  <Check className="h-3 w-3" />
                </motion.span>
              )}
              <div
                className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${selected ? "bg-white/15" : "bg-rove-charcoal/5"
                  }`}
              >
                <goal.Icon
                  className={`h-4.5 w-4.5 ${selected ? "text-rove-cream" : "text-rove-charcoal/60"
                    }`}
                />
              </div>
              <h3
                className={`text-sm font-semibold ${selected ? "text-rove-cream" : "text-rove-charcoal"
                  }`}
              >
                {goal.label}
              </h3>
              <p
                className={`mt-0.5 text-xs ${selected ? "text-rove-cream/60" : "text-rove-stone"
                  }`}
              >
                {goal.description}
              </p>
            </motion.button>
          );
        })}
      </motion.div>

      {errors.goals && (
        <p className="text-center text-sm text-phase-menstrual">{errors.goals}</p>
      )}

      {/* Privacy consent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl border border-rove-charcoal/8 bg-white/40 p-4 backdrop-blur-sm"
      >
        <label className="flex cursor-pointer items-start gap-3">
          <div className="pt-0.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={privacyConsented}
              onClick={() => onPrivacyConsentChange(!privacyConsented)}
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${privacyConsented
                  ? "border-rove-charcoal bg-rove-charcoal text-rove-cream"
                  : "border-rove-stone/40 bg-white"
                }`}
            >
              {privacyConsented && <Check className="h-3 w-3" />}
            </button>
          </div>
          <div
            className="flex-1 cursor-pointer text-xs leading-relaxed text-rove-stone"
            onClick={() => onPrivacyConsentChange(!privacyConsented)}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-rove-stone/50" />
              <span className="font-semibold text-rove-charcoal">Privacy & Data</span>
            </div>
            I agree that my health data is stored securely and used only to personalize my experience.
            My data is never sold to third parties.
          </div>
        </label>
        {errors.privacyConsented && (
          <p className="mt-2 text-xs text-phase-menstrual">{errors.privacyConsented}</p>
        )}
      </motion.div>
    </section>
  );
}
