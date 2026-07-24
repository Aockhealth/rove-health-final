import Link from "next/link";
import { ChevronLeft, ScrollText, Bot, ShieldAlert, Gavel } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Rove Health",
  description: "The terms that govern your use of Rove Health.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-rove-charcoal pb-32 grain-overlay overflow-x-hidden relative">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-phase-menstrual/10 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[40%] -right-[20%] w-[600px] h-[600px] bg-phase-follicular/10 blur-[120px] rounded-full mix-blend-multiply" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-rove-charcoal/5 transition-all pt-[max(1rem,env(safe-area-inset-top))] px-4 pb-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center relative h-10">
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-rove-stone/10 text-rove-stone hover:text-rove-charcoal transition-all hover:scale-105 active:scale-95">
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </Link>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-phase-menstrual/20 shadow-sm">
            <ScrollText className="w-4 h-4 text-phase-menstrual" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-phase-menstrual">Agreement</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 mt-12 md:mt-20">

        {/* Editorial Title */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-rove-stone/10 text-[10px] font-bold uppercase tracking-[0.2em] text-rove-stone">
            <ScrollText className="w-3 h-3" /> Agreement
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-rove-charcoal leading-tight tracking-tight mb-6">
            The fine print.<br/>
            <span className="italic text-phase-menstrual">Read with care.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-rove-stone leading-relaxed max-w-xl">
            These Terms of Service govern your use of Rove Health. By creating an account, you agree to the terms below.
          </p>
          <p className="text-xs font-bold text-rove-stone/60 tracking-widest uppercase mt-8">Last Updated: March 2026</p>
        </header>

        <div className="space-y-12">

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">1. Acceptance of Terms</h2>
            <p className="text-rove-stone leading-relaxed">
              By downloading, accessing, or using the Rove Health application (the &quot;App&quot;), you agree to be bound by these Terms of Service and our{" "}
              <Link href="/privacy" className="underline text-rove-charcoal font-medium">Privacy Policy</Link>. If you do not agree, please do not use the App. You must be at least 18 years old to use Rove Health.
            </p>
          </section>

          {/* Highlight Card: Medical Disclaimer */}
          <div className="bg-white rounded-3xl p-8 border border-phase-menstrual/20 shadow-[0_8px_30px_rgba(175,107,107,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldAlert className="w-32 h-32 text-phase-menstrual" />
            </div>
            <h2 className="text-2xl font-serif text-rove-charcoal mb-4 relative z-10">2. Medical Disclaimer</h2>
            <div className="space-y-3 relative z-10">
              <p className="text-sm text-rove-stone leading-relaxed"><strong className="text-rove-charcoal">Not Medical Advice:</strong> Rove is a wellness tracking and lifestyle application. All content, insights, and recommendations are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.</p>
              <p className="text-sm text-rove-stone leading-relaxed"><strong className="text-rove-charcoal">No Diagnosis or Treatment:</strong> The App does not diagnose, cure, treat, or prevent any disease or medical condition, including but not limited to PCOS, endometriosis, or infertility.</p>
              <p className="text-sm text-rove-stone leading-relaxed"><strong className="text-rove-charcoal">Not for Contraception:</strong> Rove Health is not a form of birth control and should never be relied upon to prevent or achieve pregnancy.</p>
              <p className="text-sm text-rove-stone leading-relaxed"><strong className="text-rove-charcoal">Seek Professional Care:</strong> Always consult a qualified healthcare professional before making decisions about your health, and in the case of a medical emergency, contact emergency services immediately.</p>
            </div>
          </div>

          <section className="space-y-6 bg-phase-luteal/5 p-8 rounded-3xl border border-phase-luteal/10">
            <h2 className="text-2xl font-serif text-rove-charcoal flex items-center gap-3">
              <Bot className="w-5 h-5 text-phase-luteal" /> 3. AI-Generated Content
            </h2>
            <p className="text-sm text-rove-stone leading-relaxed">
              Rove Health uses artificial intelligence to generate personalized insights, plans, and conversational responses. AI-generated content may occasionally be inaccurate or incomplete. It reflects patterns in the information you provide and is not reviewed by a medical professional before being shown to you. Use your own judgment and consult a healthcare provider before acting on any AI-generated insight.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">4. Your Account</h2>
            <p className="text-rove-stone leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree to provide accurate information and to notify us promptly of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">5. Acceptable Use</h2>
            <p className="text-rove-stone leading-relaxed">You agree not to:</p>
            <ul className="space-y-2 text-sm text-rove-stone leading-relaxed list-disc list-inside">
              <li>Use the App for any unlawful purpose or in violation of these Terms.</li>
              <li>Attempt to reverse engineer, decompile, or extract the source code of the App.</li>
              <li>Interfere with or disrupt the App&apos;s infrastructure or security.</li>
              <li>Impersonate another person or misrepresent your identity.</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">6. Intellectual Property</h2>
            <p className="text-rove-stone leading-relaxed">
              The App, including its design, features, and content (excluding data you submit), is owned by Rove Health and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from the App without our written permission.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">7. Termination</h2>
            <p className="text-rove-stone leading-relaxed">
              You may stop using the App and delete your account at any time from Profile Settings. We may suspend or terminate your access if you violate these Terms or engage in conduct that harms the App, other users, or Rove Health.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal flex items-center gap-3">
              <Gavel className="w-5 h-5 text-phase-ovulatory" /> 8. Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
            <p className="text-rove-stone leading-relaxed">
              The App is provided &quot;as is&quot; without warranties of any kind, express or implied. To the fullest extent permitted by law, Rove Health is not liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the App.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">9. Changes to These Terms</h2>
            <p className="text-rove-stone leading-relaxed">
              We may update these Terms from time to time. If we make material changes, we will notify you within the App or via email. Continued use of the App after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">10. Governing Law</h2>
            <p className="text-rove-stone leading-relaxed">
              These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes will be subject to the exclusive jurisdiction of the courts located in India.
            </p>
          </section>

          <section className="space-y-6 border-t border-rove-stone/10 pt-12 text-center">
            <h2 className="text-2xl font-serif text-rove-charcoal mb-4">11. Contact Us</h2>
            <p className="text-rove-stone leading-relaxed mb-6">
              If you have any questions about these Terms, please reach out to us directly.
            </p>
            <a
              href="mailto:rovehealthofficial@gmail.com"
              className="inline-flex items-center justify-center px-8 py-3 bg-rove-charcoal text-white rounded-full font-semibold text-sm hover:bg-black transition-colors"
            >
              rovehealthofficial@gmail.com
            </a>
          </section>

        </div>
      </div>
    </main>
  );
}
