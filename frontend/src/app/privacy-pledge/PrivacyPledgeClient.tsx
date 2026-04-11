"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { recordPrivacyConsent } from "@/app/(auth)/actions";
import { PRIVACY_POLICY_VERSION } from "@/lib/onboarding/constants";
import { trackOnboardingEvent } from "@/lib/onboarding/telemetry";
import styles from "./PrivacyPledge.module.css";

const SECTIONS = [
  {
    id: "no-sale",
    title: "1. We Do Not Sell Your Data",
    content: "Rove Health has a fundamental commitment to your privacy: we do not, and will never, sell, trade, or rent your personal health information to third parties, advertisers, or data brokers. Your reproductive health data is yours.",
  },
  {
    id: "info-collected",
    title: "2. Information We Collect",
    content: "We only collect the information necessary. This includes Account Information (email), Health and Cycle Logs (dates, flow severity, symptoms), and Device Data (usage patterns for stability).",
  },
  {
    id: "identity-firewall",
    title: "3. Identity Firewall & Security",
    content: "We maintain a hard infrastructure boundary between your identity and your health data. Your health data is stored using anonymous identifiers, fully encrypted in transit and at rest.",
  },
  {
    id: "ai-privacy",
    title: "4. AI Privacy and Safeguards",
    content: "Before any internal or external AI processing occurs, your personal identifiers are stripped. Your individual health logs are isolated and are never used to train global generative AI models.",
  },
  {
    id: "sharing",
    title: "5. How We Share Information",
    content: "We strictly limit outside access. We only share information with trusted Service Providers bound by confidentiality, or when explicitly forced by Legal Compliance (subpoenas) which we actively challenge.",
  },
  {
    id: "user-control",
    title: "6. Your Rights & Controls",
    content: "You have absolute control over your profile. At any time, you can request a complete export of your health logs or request a full, permanent deletion of your account and data.",
  },
  {
    id: "children",
    title: "7. Children's Privacy",
    content: "Our Services are not designed or directed toward individuals under the age of 18. We do not knowingly collect personal information from individuals under 18 without parental consent.",
  },
  {
    id: "updates",
    title: "8. Updates to this Policy",
    content: "We may update this Privacy Policy periodically. If we make material changes, you will be notified within the App and asked to review the new terms.",
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: "For any privacy-related questions or data requests, you can contact our transparent pledge team directly at rovehealthofficial@gmail.com.",
  },
];

export default function PrivacyPledgeClient() {
  const router = useRouter();
  const [open, setOpen] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const allExpanded = useMemo(() => open.length === SECTIONS.length, [open.length]);

  function toggleSection(id: string) {
    setOpen((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      trackOnboardingEvent("privacy_section_toggled", { sectionId: id, expanded: next.includes(id) });
      return next;
    });
  }

  function toggleAll() {
    setOpen((prev) => {
      const next = prev.length === SECTIONS.length ? [] : SECTIONS.map((section) => section.id);
      trackOnboardingEvent("privacy_expand_all_clicked", { expanded: next.length === SECTIONS.length });
      return next;
    });
  }

  function handleConsentSubmit() {
    setError("");
    if (!agreed) {
      setError("Please confirm that you understand and agree before continuing.");
      return;
    }

    startTransition(async () => {
      await trackOnboardingEvent("privacy_consent_submitted", { policyVersion: PRIVACY_POLICY_VERSION });
      const result = await recordPrivacyConsent({
        agreed: true,
        policyVersion: PRIVACY_POLICY_VERSION,
      });

      if (!result.ok) {
        const message = result.error ?? result.message ?? "Could not save your consent.";
        setError(message);
        await trackOnboardingEvent("privacy_consent_failed", {
          policyVersion: PRIVACY_POLICY_VERSION,
          code: result.code ?? "unknown_error",
        });
        return;
      }

      await trackOnboardingEvent("privacy_consent_success", {
        policyVersion: PRIVACY_POLICY_VERSION,
      });
      router.push(result.nextRoute ?? "/onboarding");
    });
  }

  return (
    <main className="relative min-h-[100dvh] bg-[#FDFBF7] grain-overlay overflow-hidden py-12 px-4 md:py-20 z-0">
      
      {/* Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center">
        <div className="absolute w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full bg-phase-menstrual/10 blur-[100px] -top-[10%] -left-[10%] mix-blend-multiply" />
        <div className="absolute w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-phase-follicular/10 blur-[120px] top-[40%] right-[0%] mix-blend-multiply" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl rounded-[2.5rem] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_24px_80px_-40px_rgba(45,36,32,0.45)] p-2">
        <div className="bg-white/50 rounded-[2.25rem] overflow-hidden">
          
          <header className="px-6 pt-10 pb-6 md:px-10 md:pt-12 md:pb-8">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-phase-menstrual/10 text-phase-menstrual w-max">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Secure</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-rove-charcoal leading-[1.1] tracking-tight mb-2">
                Your body.<br/>
                <span className="italic text-phase-menstrual">Your data.</span>
              </h1>
              <p className="mt-4 text-[15px] font-medium leading-relaxed text-rove-stone md:text-base max-w-md">
                Clear language, no hidden traps. Review our core commitments and consent to continue.
              </p>
            </div>
          </header>

          <section className="px-6 pb-6 md:px-10 md:pb-8">
            <div className="mb-4 flex items-center justify-between border-b border-rove-stone/10 pb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-rove-stone">Executive Summary</h2>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[11px] font-bold uppercase tracking-wider text-phase-menstrual hover:text-phase-menstrual/70 transition-colors"
              >
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>

            <div className="space-y-3">
              {SECTIONS.map((section) => {
                const isOpen = open.includes(section.id);
                return (
                  <article key={section.id} className="rounded-2xl border border-white bg-white/60 hover:bg-white/80 transition-colors shadow-sm overflow-hidden">
                    <h3>
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={isOpen}
                        aria-controls={`${section.id}-content`}
                        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-semibold text-rove-charcoal">
                          {section.title}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-rove-stone/60 transition-transform duration-300 ${isOpen ? "-rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    <div 
                      id={`${section.id}-content`} 
                      className={`px-5 text-[13px] font-medium leading-relaxed text-rove-stone/90 transition-all duration-300 ${isOpen ? "pb-5 max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                    >
                      {section.content}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="bg-rove-cream/50 px-6 py-8 md:px-10 border-t border-rove-stone/5">
            <label className="flex items-start gap-4 rounded-2xl border border-phase-menstrual/20 bg-white p-5 cursor-pointer hover:border-phase-menstrual/40 transition-colors shadow-sm">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="peer h-5 w-5 appearance-none rounded-md border-2 border-rove-stone/30 bg-transparent checked:border-phase-menstrual checked:bg-phase-menstrual hover:border-phase-menstrual transition-all cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 text-[13px] font-medium text-rove-charcoal/90 leading-relaxed">
                I understand and consent to Rove processing my data as described above. All data is protected under <Link href="/privacy" target="_blank" className="font-bold text-phase-menstrual hover:underline">Policy {PRIVACY_POLICY_VERSION}</Link>.
              </div>
            </label>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200/50 bg-red-50/50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</p>
            )}

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                onClick={handleConsentSubmit}
                disabled={isPending}
                className="group relative flex w-full h-14 items-center justify-center overflow-hidden rounded-full bg-rove-charcoal text-[15px] font-bold tracking-wide text-white transition-all hover:bg-black hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-rove-charcoal/50 disabled:cursor-not-allowed shadow-xl shadow-rove-charcoal/10"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                    Saving...
                  </span>
                ) : (
                  "I Understand & Agree"
                )}
              </button>
              
              <div className="text-center">
                <p className="text-[11px] font-semibold text-rove-stone tracking-wide">
                  SECURED BY IDENTITY FIREWALL
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
