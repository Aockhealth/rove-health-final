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
    title: "We do not sell your data",
    content:
      "Rove does not sell, trade, or rent your health information for advertising or third-party marketing.",
  },
  {
    id: "identity-firewall",
    title: "Identity and health data are separated",
    content:
      "We separate account identity from health logs to reduce exposure. Operational access is restricted and audited.",
  },
  {
    id: "ai-privacy",
    title: "AI requests are privacy-filtered",
    content:
      "Before AI processing, identifiable content is minimized. We keep sensitive fields out of prompts wherever possible.",
  },
  {
    id: "user-control",
    title: "You stay in control",
    content:
      "You can request access, export, or deletion of your data from account settings and support channels.",
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
    <main className="min-h-screen bg-gradient-to-b from-phase-menstrual/10 via-white to-phase-menstrual/20 px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-phase-menstrual/20 bg-white shadow-xl">
        <header className="border-b border-phase-menstrual/20 p-6 md:p-8">
          <div className={`mb-4 rounded-2xl bg-gradient-to-r from-phase-menstrual/20 via-phase-menstrual/10 to-amber-50 p-2 ${styles.gradientFrame}`}>
            <div className="relative mx-auto aspect-[4/2] w-full max-w-xl">
              <Image
                src="/assets/Data-privacy.png"
                alt="Rove privacy promise illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 text-phase-menstrual" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold text-rove-charcoal md:text-3xl">Privacy Promise</h1>
              <p className="mt-2 text-sm text-rove-stone md:text-base">
                Clear language, no hidden traps. Review the points below and consent to continue.
              </p>
            </div>
          </div>
        </header>

        <section className="p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-rove-stone">Summary</h2>
            <button
              type="button"
              onClick={toggleAll}
              className="rounded-full border border-phase-menstrual/30 px-3 py-1 text-xs font-semibold text-phase-menstrual hover:bg-phase-menstrual/10"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <div className="space-y-3">
            {SECTIONS.map((section) => {
              const isOpen = open.includes(section.id);
              return (
                <article key={section.id} className="rounded-2xl border border-gray-200 bg-white">
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      aria-expanded={isOpen}
                      aria-controls={`${section.id}-content`}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-rove-charcoal md:text-base">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-rove-stone transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={`${section.id}-content`} className="px-4 pb-4 text-sm leading-6 text-rove-stone">
                      {section.content}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50 p-6 md:p-8">
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-phase-menstrual focus:ring-phase-menstrual/30"
            />
            <span className="text-sm text-rove-charcoal">
              I understand and consent to Rove processing my data as described above (Policy version{" "}
              <strong>{PRIVACY_POLICY_VERSION}</strong>).
            </span>
          </label>

          <div className="mt-3 text-xs text-rove-stone">
            Read the full policy:{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-phase-menstrual underline decoration-phase-menstrual/40 underline-offset-2"
            >
              Privacy Policy
            </Link>
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="button"
            onClick={handleConsentSubmit}
            disabled={isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-rove-charcoal px-4 py-3 text-sm font-semibold text-white hover:bg-rove-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving consent...
              </>
            ) : (
              "I Understand & Agree"
            )}
          </button>

          <p className="mt-4 text-center text-xs text-rove-stone">
            Need help?{" "}
            <a href="mailto:rovehealthofficial@gmail.com" className="font-semibold text-phase-menstrual underline">
              rovehealthofficial@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
