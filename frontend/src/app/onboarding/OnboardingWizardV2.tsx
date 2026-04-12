"use client";

import { useEffect, useMemo, useReducer, useState, useTransition } from "react";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ONBOARDING_FLOW_VERSION, ONBOARDING_STEPS } from "@/lib/onboarding/constants";
import { trackOnboardingEvent } from "@/lib/onboarding/telemetry";
import { formatLocalDate } from "@/lib/onboarding/date";
import { submitOnboardingV2 } from "@/app/onboarding/actions";
import {
  onboardingReducer,
  initialOnboardingState,
  calculateAutoStats,
  getCompletedRanges,
  type OnboardingState,
} from "@/app/onboarding/state";
import type { OnboardingDraftV2 } from "@/lib/onboarding/types";
import StepIntro from "@/app/onboarding/components/StepIntro";
import StepWelcome from "@/app/onboarding/components/StepWelcome";
import StepHistory from "@/app/onboarding/components/StepHistory";
import StepAboutYou from "@/app/onboarding/components/StepAboutYou";
import StepGoals from "@/app/onboarding/components/StepGoals";

type OnboardingWizardV2Props = {
  userId: string;
  initialStep?: number;
};

const STEP_LABELS = ["Intro", "Profile", "History", "About You", "Goals"];

function getStorageKey(userId: string): string {
  return `onboarding-draft:${ONBOARDING_FLOW_VERSION}:${userId}`;
}

function getMonthBoundaries(viewDate: Date): { monthStart: string; monthEnd: string } {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStart = formatLocalDate(new Date(year, month, 1));
  const monthEnd = formatLocalDate(new Date(year, month + 1, 0));
  return { monthStart, monthEnd };
}

function validateStep(state: OnboardingState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (state.step === 2) {
    if (!state.name.trim()) errors.name = "Name is required.";
    else if (state.name.trim().length < 2) errors.name = "Name should be at least 2 characters.";
    if (!state.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
  }

  if (state.step === 3) {
    if (state.periodHistory.some((range) => !range.endDate)) {
      errors.periodHistory = "Finish selecting the end date for your open range.";
    }
  }

  if (state.step === 5) {
    if (state.goals.length === 0) errors.goals = "Select at least one goal.";
    if (!state.privacyConsented) errors.privacyConsented = "Privacy consent is required to continue.";
  }

  return errors;
}

// Step transition variants
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

export default function OnboardingWizardV2({ userId, initialStep }: OnboardingWizardV2Props) {
  const router = useRouter();
  const [state, dispatch] = useReducer(onboardingReducer, {
    ...initialOnboardingState,
    step: initialStep || 1
  });
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isPending, startTransition] = useTransition();
  const [direction, setDirection] = useState(1);
  const [showComplete, setShowComplete] = useState(false);

  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
  const autoStats = useMemo(() => calculateAutoStats(state.periodHistory), [state.periodHistory]);
  const completedRanges = useMemo(() => getCompletedRanges(state.periodHistory), [state.periodHistory]);
  const hasOpenRange = state.periodHistory.some((range) => !range.endDate);

  // Hydrate from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<OnboardingDraftV2>;
      dispatch({ type: "hydrate", payload: parsed });
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Persist draft to localStorage
  useEffect(() => {
    const draft: OnboardingDraftV2 = {
      step: state.step,
      name: state.name,
      dateOfBirth: state.dateOfBirth,
      periodHistory: state.periodHistory,
      manualLastPeriodStart: state.manualLastPeriodStart,
      cycleLength: state.cycleLength,
      periodLength: state.periodLength,
      regularity: state.regularity,
      conditions: state.conditions,
      symptoms: state.symptoms,
      goals: state.goals,
      trackerMode: state.trackerMode,
      heightCm: state.heightCm,
      weightKg: state.weightKg,
      dietPreference: state.dietPreference,
      privacyConsented: state.privacyConsented,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [state, storageKey]);

  // Analytics
  useEffect(() => {
    trackOnboardingEvent("onboarding_step_viewed", { step: state.step });
  }, [state.step]);

  useEffect(() => {
    const handler = () => {
      trackOnboardingEvent("onboarding_step_abandon", { step: state.step });
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.step]);

  function goNextStep() {
    const errors = validateStep(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "set_errors", errors });
      return;
    }
    dispatch({ type: "clear_errors" });
    setDirection(1);
    dispatch({ type: "set_step", step: Math.min(state.step + 1, ONBOARDING_STEPS) });
  }

  function goBackStep() {
    setDirection(-1);
    dispatch({ type: "set_step", step: Math.max(state.step - 1, 1) });
  }

  function selectCalendarDay(dateString: string) {
    const today = formatLocalDate(new Date());
    if (dateString > today) return;

    if (hasOpenRange) {
      dispatch({ type: "complete_period_range", date: dateString });
      return;
    }
    dispatch({ type: "start_period_range", date: dateString });
  }

  function submit() {
    const stepErrors = validateStep(state);
    if (Object.keys(stepErrors).length > 0) {
      dispatch({ type: "set_errors", errors: stepErrors });
      return;
    }

    const latestRange = completedRanges
      .map((range) => range.startDate)
      .sort((a, b) => (a > b ? -1 : 1))[0];
    const lastPeriodStart = latestRange ?? state.manualLastPeriodStart;

    startTransition(async () => {
      await trackOnboardingEvent("onboarding_submit_attempted", { step: state.step });
      const result = await submitOnboardingV2({
        name: state.name.trim(),
        dateOfBirth: state.dateOfBirth,
        goals: state.goals,
        conditions: state.conditions.filter((item) => item !== "None"),
        symptoms: state.symptoms,
        periodHistory: completedRanges.map((range) => ({
          start_date: range.startDate,
          end_date: range.endDate!,
        })),
        lastPeriodStart,
        cycleLength: autoStats?.avgCycle ?? state.cycleLength,
        periodLength: autoStats?.avgBleed ?? state.periodLength,
        isIrregular: autoStats?.isIrregular ?? state.regularity === "Irregular",
        trackerMode: state.trackerMode,
        heightCm: state.heightCm,
        weightKg: state.weightKg,
        dietPreference: state.dietPreference,
        privacyConsented: state.privacyConsented,
      });

      if (!result.ok) {
        if (result.code === "UNAUTHENTICATED") {
          router.push("/login");
          return;
        }

        dispatch({
          type: "set_errors",
          errors: result.errors ?? { form: result.message ?? "Unable to continue." },
        });
        await trackOnboardingEvent("onboarding_submit_failed", {
          code: result.code ?? "unknown_error",
        });
        return;
      }

      setShowComplete(true);
      localStorage.removeItem(storageKey);
      await trackOnboardingEvent("onboarding_completed", {
        nextRoute: result.nextRoute ?? "/cycle-sync",
      });
    });
  }

  const { monthStart, monthEnd } = getMonthBoundaries(viewDate);
  const canClearMonth = completedRanges.some(
    (range) => !(range.startDate > monthEnd || range.endDate! < monthStart)
  );

  const isLastStep = state.step === ONBOARDING_STEPS;
  // Progress starts from 2nd step (Intro is step 1, where progress is 0)
  const progress = state.step > 1 ? ((state.step - 1) / (ONBOARDING_STEPS - 1)) * 100 : 0;
  const showHeader = state.step > 1;
  const isReturningUser = initialStep && initialStep > 1;

  const CUTE_HEADINGS = useMemo(() => [
    { pt1: "You are not inconsistent.", pt2: "You are cyclical.", desc: "Your biology isn't broken. Rove is translating your cycle into practical daily choices for meals, movement, and rest." },
    { pt1: "Your body isn't a machine.", pt2: "It's a garden.", desc: "Blooming in phases. Allow Rove to tune your daily choices to match your natural rhythm perfectly." },
    { pt1: "Stop fighting your biology.", pt2: "Start flowing with it.", desc: "Your energy naturally ebbs and flows. Rove is calibrating your personalized plan to honor your cycle." },
    { pt1: "No more guesswork.", pt2: "Just perfect timing.", desc: "Syncing your lifestyle to your cycle changes everything. Preparing your phase-aligned insights now..." },
    { pt1: "Your energy shifts?", pt2: "That's your superpower.", desc: "Every phase has a unique advantage. Rove helps you harness your shifts for peak performance and recovery." }
  ], []);

  // Use randomized copy for freshness
  const CURRENT_CUTE = useMemo(() => CUTE_HEADINGS[Math.floor(Math.random() * CUTE_HEADINGS.length)], [CUTE_HEADINGS]);

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-rove-cream grain-overlay">
      {/* Subtle ambient blobs — matching app's style */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-rove-charcoal/5 blur-[100px] animate-pulse will-change-[opacity]"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-phase-menstrual/8 blur-[80px] animate-pulse will-change-[opacity]"
          style={{ animationDuration: "15s" }}
        />
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-rove-cream grain-overlay"
          >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full bg-rove-peach/20 blur-[100px]"
              />
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center px-6 max-w-sm flex flex-col items-center"
            >
              {/* Rove Icon */}
              <div className="mb-10 w-12 h-12 relative opacity-80 mix-blend-multiply">
                 <img src="/images/rove_icon_transparent.png" alt="Rove" className="object-contain w-full h-full" />
              </div>

              {/* Pill Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-8 rounded-full border border-rove-charcoal/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-rove-stone/80"
              >
                Biology First
              </motion.div>

              {/* Headings */}
              <div className="space-y-2 mb-8">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="font-heading text-3xl sm:text-4xl font-medium text-rove-charcoal tracking-tight"
                >
                  {isReturningUser ? "Profile updated." : CURRENT_CUTE.pt1}
                </motion.h2>
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                  className="font-heading text-4xl sm:text-5xl italic text-rove-peach"
                >
                   {isReturningUser ? "We're in sync." : CURRENT_CUTE.pt2}
                </motion.h2>
              </div>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-sm font-medium leading-relaxed text-rove-stone/80 mb-12"
              >
                {CURRENT_CUTE.desc}
              </motion.p>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/cycle-sync")}
                className="w-full rounded-full bg-rove-charcoal py-4 text-base font-semibold text-rove-cream shadow-xl shadow-rove-charcoal/10 transition-all hover:bg-black"
              >
                Go to Dashboard
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-6 sm:px-8 sm:py-10">
        {/* Header - Hidden on Intro step */}
        {showHeader && (
          <header className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone">
                {STEP_LABELS[state.step - 1]}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rove-stone">
                {state.step - 1} of {ONBOARDING_STEPS - 1}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] overflow-hidden rounded-full bg-rove-charcoal/10">
              <motion.div
                className="h-full rounded-full bg-rove-charcoal"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </header>
        )}

        {/* Step content with transitions */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${showHeader ? "pb-28" : "pb-24 pt-12"}`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={state.step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {state.step === 1 && <StepIntro />}

              {state.step === 2 && (
                <StepWelcome
                  name={state.name}
                  dateOfBirth={state.dateOfBirth}
                  onNameChange={(value) => dispatch({ type: "set_name", name: value })}
                  onDobChange={(value) => dispatch({ type: "set_dob", dob: value })}
                  errors={state.errors}
                />
              )}

              {state.step === 3 && (
                <StepHistory
                  viewDate={viewDate}
                  periodHistory={state.periodHistory}
                  isSelectingRangeEnd={hasOpenRange}
                  autoStats={autoStats}
                  cycleLength={state.cycleLength}
                  periodLength={state.periodLength}
                  error={state.errors.periodHistory}
                  onPreviousMonth={() =>
                    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  onNextMonth={() =>
                    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                  onSelectDay={selectCalendarDay}
                  onClearMonth={() => dispatch({ type: "clear_month", monthStart, monthEnd })}
                  canClearMonth={canClearMonth}
                  onCycleLengthChange={(value) => dispatch({ type: "set_cycle_length", value })}
                  onPeriodLengthChange={(value) => dispatch({ type: "set_period_length", value })}
                />
              )}

              {state.step === 4 && (
                <StepAboutYou
                  conditions={state.conditions}
                  symptoms={state.symptoms}
                  heightCm={state.heightCm}
                  weightKg={state.weightKg}
                  dietPreference={state.dietPreference}
                  onToggleCondition={(condition) =>
                    dispatch({ type: "toggle_condition", condition })
                  }
                  onToggleSymptom={(symptom) => dispatch({ type: "toggle_symptom", symptom })}
                  onHeightChange={(value) => dispatch({ type: "set_height", value })}
                  onWeightChange={(value) => dispatch({ type: "set_weight", value })}
                  onDietChange={(value) => dispatch({ type: "set_diet", value })}
                  errors={state.errors}
                />
              )}

              {state.step === 5 && (
                <StepGoals
                  selectedGoals={state.goals}
                  privacyConsented={state.privacyConsented}
                  onToggleGoal={(goalId) => dispatch({ type: "toggle_goal", goalId })}
                  onPrivacyConsentChange={(value) =>
                    dispatch({ type: "set_privacy_consent", value })
                  }
                  errors={state.errors}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {state.errors.form && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.errors.form}
            </p>
          )}
        </div>

        {/* Footer — fixed to bottom */}
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-rove-charcoal/5 bg-rove-cream/90 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            {state.step > 1 ? (
              <button
                type="button"
                onClick={goBackStep}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-rove-stone transition hover:text-rove-charcoal active:scale-95 disabled:cursor-not-allowed disabled:opacity-0"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  const { createClient } = await import('@/utils/supabase/client');
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/login');
                  router.refresh();
                }}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-rove-stone transition hover:text-rove-charcoal active:scale-95 disabled:opacity-0"
              >
                Log Out
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                disabled={isPending || showComplete}
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-2xl bg-rove-charcoal px-8 py-3 text-sm font-semibold text-rove-cream shadow-xl shadow-rove-charcoal/20 transition-all hover:bg-black active:scale-[0.97] disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Finish Setup"}
                {!isPending && <Check className="h-4 w-4" />}
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={goNextStep}
                className="inline-flex items-center gap-2 rounded-2xl bg-rove-charcoal px-8 py-3 text-sm font-semibold text-rove-cream shadow-xl shadow-rove-charcoal/20 transition-all hover:bg-black active:scale-[0.97] disabled:opacity-50"
              >
                {state.step === 1 ? "Get Started" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
