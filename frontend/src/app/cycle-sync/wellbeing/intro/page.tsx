"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowLeft, ShieldAlert, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function IntroContent() {
  const searchParams = useSearchParams();
  // Get the type from the URL (defaults to phq9 if missing)
  const type = searchParams.get("type") || "phq9"; 

  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6 sm:p-10">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-phase-luteal/10 rounded-full flex items-center justify-center mx-auto mb-4 text-phase-luteal">
            <ShieldAlert size={24} />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl text-rove-charcoal font-bold mb-2">
            Before You Begin
          </h1>
          <p className="text-sm text-rove-stone">
            Please read this carefully before starting the check-in.
          </p>
        </div>

        {/* Content Body: Accordion Sections */}
        <div className="mb-6 border-t border-stone-100">
          
          {/* Section 1: What is this? */}
          <div className="border-b border-stone-100">
            <button
              onClick={() => toggleSection(0)}
              className="w-full py-5 flex items-center justify-between text-left group"
            >
              <span className="font-heading text-lg font-bold text-rove-charcoal group-hover:text-phase-luteal transition-colors">
                What is this check-in?
              </span>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-stone-400 transition-transform duration-300",
                  openSection === 0 ? "rotate-180 text-phase-luteal" : ""
                )} 
              />
            </button>
            <AnimatePresence>
              {openSection === 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 text-sm text-rove-charcoal/90 leading-relaxed bg-stone-50/50 p-4 rounded-2xl mb-4">
                    <p className="mb-3">
                      This self-check uses simple questionnaires called <strong>PHQ-9</strong> and <strong>GAD-7</strong>. They’re commonly used by doctors and therapists to screen for low mood and anxiety.
                    </p>
                    <ul className="space-y-2 list-disc list-inside ml-2 text-rove-stone">
                      <li>It takes about 5 minutes.</li>
                      <li>Looks at how you’ve been feeling over the last 2 weeks.</li>
                      <li className="font-bold text-rove-charcoal">This is not a medical diagnosis.</li>
                      <li>Results are informational only.</li>
                      <li>This does not replace professional care.</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Accuracy */}
          <div className="border-b border-stone-100">
            <button
              onClick={() => toggleSection(1)}
              className="w-full py-5 flex items-center justify-between text-left group"
            >
              <span className="font-heading text-lg font-bold text-rove-charcoal group-hover:text-phase-follicular transition-colors">
                How accurate is it?
              </span>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-stone-400 transition-transform duration-300",
                  openSection === 1 ? "rotate-180 text-phase-follicular" : ""
                )} 
              />
            </button>
            <AnimatePresence>
              {openSection === 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 space-y-4 text-sm text-rove-charcoal/90 leading-relaxed px-2">
                    <p className="text-rove-stone">PHQ-9 and GAD-7 are well-studied screening tools and work well for many people.</p>
                    <ul className="space-y-2 text-rove-stone">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-phase-follicular shrink-0 mt-0.5" />
                        <span><strong>PHQ-9</strong> correctly identifies depressive symptoms in about 85-90% of cases.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-phase-follicular shrink-0 mt-0.5" />
                        <span><strong>GAD-7</strong> correctly identifies anxiety symptoms in about 80-90% of cases.</span>
                      </li>
                    </ul>
                    
                    <div className="p-4 bg-phase-ovulatory/10 rounded-2xl border border-phase-ovulatory/30 text-rove-charcoal">
                      <p>
                        That said, no questionnaire is perfect. Stress, recent life events, physical health, sleep, hormones, or cultural factors can influence scores. <strong>Results should be seen as a starting point, not a final answer.</strong>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Section 3: Agreement & Warning */}
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold text-rove-charcoal mb-4">
            Your Agreement
          </h2>
          <div className="space-y-4 text-sm text-rove-charcoal/90 leading-relaxed px-2">
            <p className="font-bold text-rove-charcoal">By continuing, you agree that:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-rove-stone">
              <li>You understand this is a self-reflection tool, not medical advice.</li>
              <li>You’re taking it voluntarily.</li>
              <li>Any next steps should involve professional support when needed.</li>
            </ul>

            <div className="mt-4 font-semibold text-center text-phase-menstrual bg-phase-menstrual/10 border border-phase-menstrual/20 p-4 rounded-xl">
              If your results feel concerning or if you are struggling, please consider speaking with a qualified mental health professional.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* ✅ PASSING THE TYPE TO THE NEXT PAGE */}
          <Link 
            href={`/cycle-sync/wellbeing/assessment?type=${type}`} 
            className="w-full flex items-center justify-center gap-2 bg-rove-charcoal text-white py-4 rounded-full font-bold hover:bg-black transition-colors"
          >
            ✅ I understand & continue
          </Link>
          
          <button 
            onClick={() => window.close()} 
            className="w-full flex items-center justify-center gap-2 bg-white text-rove-charcoal border border-stone-200 py-4 rounded-full font-bold hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Not now
          </button>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6 font-medium tracking-wide uppercase">
          You’re not alone - checking in is a strong first step.
        </p>
      </div>
    </div>
  );
}

// Suspense wrapper required by Next.js when reading URL params
export default function BeforeYouBeginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <IntroContent />
    </Suspense>
  );
}