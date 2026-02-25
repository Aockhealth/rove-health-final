"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- QUESTION BANKS ---
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

const OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

// --- CLINICAL SCORING LOGIC ---
function getResultDetails(score: number, isGAD7: boolean) {
  if (isGAD7) {
    if (score <= 4) return { label: "Minimal Anxiety", color: "text-[#4caf8a]", bg: "bg-[#4caf8a]/10" };
    if (score <= 9) return { label: "Mild Anxiety", color: "text-[#f5a623]", bg: "bg-[#f5a623]/10" };
    if (score <= 14) return { label: "Moderate Anxiety", color: "text-[#e8804a]", bg: "bg-[#e8804a]/10" };
    return { label: "Severe Anxiety", color: "text-[#d64545]", bg: "bg-[#d64545]/10" };
  } else {
    if (score <= 4) return { label: "Minimal Depression", color: "text-[#4caf8a]", bg: "bg-[#4caf8a]/10" };
    if (score <= 9) return { label: "Mild Depression", color: "text-[#f5a623]", bg: "bg-[#f5a623]/10" };
    if (score <= 14) return { label: "Moderate Depression", color: "text-[#e8804a]", bg: "bg-[#e8804a]/10" };
    if (score <= 19) return { label: "Moderately Severe", color: "text-[#d64545]", bg: "bg-[#d64545]/10" };
    return { label: "Severe Depression", color: "text-[#d64545]", bg: "bg-[#d64545]/10" };
  }
}

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const isGAD7 = type === "gad7";

  const currentQuestions = isGAD7 ? GAD7_QUESTIONS : PHQ9_QUESTIONS;
  const assessmentTitle = isGAD7 ? "GAD-7" : "PHQ-9";
  const assessmentSubtitle = isGAD7 ? "Anxiety Assessment" : "Patient Health Questionnaire";
  const maxScore = isGAD7 ? 21 : 27;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const isComplete = currentStep === currentQuestions.length;
  const progressPercentage = (currentStep / currentQuestions.length) * 100;
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const resultDetails = getResultDetails(totalScore, isGAD7);

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
    
    // Auto-advance after a 450ms delay
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 450);
  };

  const selectedValue = answers[currentStep];

  const variants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[520px]">

        {/* --- HEADER --- */}
        <div className="text-center mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-stone-400 mb-2">
            Self-Assessment
          </p>
          <h1 className="font-heading text-3xl font-bold text-rove-charcoal mb-1 leading-tight">
            {assessmentSubtitle}
          </h1>
          <p className="text-[13px] font-bold text-stone-500 tracking-widest">
            {assessmentTitle}
          </p>
        </div>

        {/* --- PROGRESS BAR --- */}
        {!isComplete && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-stone-400 font-semibold mb-2 px-1">
              <span>Question {currentStep + 1} of {currentQuestions.length}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-phase-menstrual rounded-full" // ✅ Using Phase Menstrual color
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* --- CARD --- */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-stone-200 overflow-hidden min-h-[440px] flex flex-col relative">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key={currentStep}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="p-6 sm:p-8 w-full"
              >
                {/* Prompt */}
                <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 mb-6 text-[13px] text-stone-500 leading-relaxed">
                  Over the last <strong>2 weeks</strong>, how often have you been bothered by this?
                </div>

                {/* Question */}
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-7 h-7 rounded-full bg-rove-charcoal text-white text-[13px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {currentStep + 1}
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-rove-charcoal m-0 leading-snug">
                    {currentQuestions[currentStep]}
                  </h2>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-3">
                  {OPTIONS.map((option) => {
                    const isSelected = selectedValue === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 outline-none",
                          isSelected 
                            ? "border-stone-300 bg-stone-50 shadow-sm" 
                            : "border-stone-100 bg-white hover:border-stone-300 hover:bg-stone-50"
                        )}
                      >
                        <span className={cn(
                          "text-sm font-semibold transition-colors",
                          isSelected ? "text-rove-charcoal" : "text-rove-charcoal/80"
                        )}>
                          {option.label}
                        </span>
                        
                        {/* Number Indicator - Turns Phase Menstrual when selected */}
                        <span className={cn(
                          "w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all duration-200",
                          isSelected 
                            ? "bg-phase-menstrual text-white shadow-sm scale-110" // ✅ Using Phase Menstrual color
                            : "bg-stone-100 text-stone-400"
                        )}>
                          {option.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // --- RESULTS SCREEN ---
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="p-10 text-center w-full my-auto"
              >
                <h2 className="font-heading text-2xl font-bold text-rove-charcoal mb-2">
                  Assessment Complete
                </h2>
                <p className="text-[13px] text-stone-400 mb-8 font-medium">
                  Based on your responses over the last 2 weeks
                </p>

                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="font-heading text-7xl font-bold text-rove-charcoal leading-none">
                    {totalScore}
                  </span>
                  <span className="text-xl text-stone-300 font-medium">
                    /{maxScore}
                  </span>
                </div>

                <div className={cn(
                  "inline-block px-5 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase mb-8",
                  resultDetails.color,
                  resultDetails.bg
                )}>
                  {resultDetails.label}
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 mb-8 text-left">
                  <p className="text-[13px] text-stone-500 leading-relaxed m-0">
                    This score is a starting point for self-reflection. If your results feel concerning or you are struggling, please consider sharing them with a qualified health professional.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/cycle-sync/insights")}
                  className="w-full py-4 rounded-full bg-rove-charcoal text-white text-sm font-bold tracking-wide hover:bg-black transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-rove-charcoal rounded-full animate-spin" />
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  );
}