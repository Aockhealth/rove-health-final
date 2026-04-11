import Link from "next/link";
import { ChevronLeft, ShieldCheck, Lock, EyeOff, Server, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Privacy Policy | Rove Health",
  description: "Read Rove Health's commitment to protecting your health and personal data.",
};

export default function PrivacyPolicyPage() {
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
          <Link href="/onboarding" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-rove-stone/10 text-rove-stone hover:text-rove-charcoal transition-all hover:scale-105 active:scale-95">
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </Link>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-phase-menstrual/20 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-phase-menstrual" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-phase-menstrual">Verified Secure</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 mt-12 md:mt-20">
        
        {/* Editorial Title */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-rove-stone/10 text-[10px] font-bold uppercase tracking-[0.2em] text-rove-stone">
            <Lock className="w-3 h-3" /> Transparency
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-rove-charcoal leading-tight tracking-tight mb-6">
            Your body.<br/>
            <span className="italic text-phase-menstrual">Your data.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-rove-stone leading-relaxed max-w-xl">
            At Rove Health, your privacy is our highest priority. We believe female health data demands radical protection.
          </p>
          <p className="text-xs font-bold text-rove-stone/60 tracking-widest uppercase mt-8">Last Updated: March 2026</p>
        </header>

        <div className="space-y-12">
          
          {/* Highlight Card: No Selling */}
          <div className="bg-white rounded-3xl p-8 border border-phase-menstrual/20 shadow-[0_8px_30px_rgba(175,107,107,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <EyeOff className="w-32 h-32 text-phase-menstrual" />
            </div>
            <h2 className="text-2xl font-serif text-rove-charcoal mb-4 relative z-10">1. We Do Not Sell Your Data</h2>
            <p className="text-rove-stone leading-relaxed relative z-10 font-medium">
              Rove Health has a fundamental commitment to your privacy: <strong>we do not, and will never, sell, trade, or rent your personal health information</strong> to third parties, advertisers, or data brokers. Your reproductive health data is yours.
            </p>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-phase-follicular" /> 2. Information We Collect
            </h2>
            <p className="text-rove-stone leading-relaxed">We only collect the information necessary to provide you with insights, cycle tracking, and holistic recommendations.</p>
            <div className="grid gap-4 mt-6">
              {[
                { title: "Account Information", desc: "When you create an account, we collect your name, email address, and secure password credentials." },
                { title: "Health and Cycle Logs", desc: "We collect data you voluntarily input, such as cycle dates, flow severity, symptoms, moods, and biometric data (like basal body temperature or cervical fluid)." },
                { title: "Device and Usage Data", desc: "We automatically collect standard diagnostic data, including device type, operating system, and app usage patterns to improve app stability and user experience." }
              ].map((item, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-rove-stone/10 flex flex-col gap-1">
                  <strong className="text-sm text-rove-charcoal tracking-wide">{item.title}</strong>
                  <span className="text-sm text-rove-stone leading-relaxed">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal flex items-center gap-3">
              <Server className="w-5 h-5 text-phase-ovulatory" /> 3. Identity Firewall & Security
            </h2>
            <p className="text-rove-stone leading-relaxed">
              To radically reduce exposure, we maintain a hard infrastructure boundary between your identity and your health data. 
            </p>
            <p className="text-rove-stone leading-relaxed">
              Your personally identifiable information (like your email address) is stored in a highly secure, separate database from your daily cycle logs. Under normal operating bounds, your health data is stored using anonymous identifiers. All data is encrypted in transit using industry-standard TLS protocols and encrypted at rest.
            </p>
          </section>

          <section className="space-y-6 bg-phase-luteal/5 p-8 rounded-3xl border border-phase-luteal/10">
            <h2 className="text-2xl font-serif text-rove-charcoal">4. AI Privacy and Safeguards</h2>
            <p className="text-rove-stone leading-relaxed font-medium">
              Rove Health utilizes advanced Artificial Intelligence to generate bespoke insights and phase-based recommendations. To protect your privacy during this process:
            </p>
            <ul className="space-y-4 mt-6">
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-phase-luteal mt-2 flex-shrink-0" />
                <p className="text-sm text-rove-stone leading-relaxed"><strong className="text-rove-charcoal">Anonymized Processing:</strong> Before any internal or external AI processing occurs, your personal identifiers are stripped. The AI only analyzes raw cycle characteristics, never your identity.</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-phase-luteal mt-2 flex-shrink-0" />
                <p className="text-sm text-rove-stone leading-relaxed"><strong className="text-rove-charcoal">No Model Training:</strong> Your individual health logs are isolated and are not used to train global generative AI models.</p>
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">5. How We Share Information</h2>
            <p className="text-rove-stone leading-relaxed">We strictly limit an outside party&apos;s access to your data. We only share information in the following circumstances:</p>
            <ul className="space-y-4">
              <li className="flex gap-4 p-4 bg-white rounded-2xl border border-rove-stone/10">
                <div className="font-semibold text-sm text-rove-charcoal min-w-[120px]">Service Providers</div>
                <div className="text-sm text-rove-stone leading-relaxed">We use trusted third-party cloud infrastructure to operate our Services. These providers are strictly bound by confidentiality agreements.</div>
              </li>
              <li className="flex gap-4 p-4 bg-white rounded-2xl border border-rove-stone/10">
                <div className="font-semibold text-sm text-rove-charcoal min-w-[120px]">Legal Compliance</div>
                <div className="text-sm text-rove-stone leading-relaxed">We will only disclose your information if required to do so by a legally binding subpoena. We actively challenge broad or overly invasive requests.</div>
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">6. Your Rights & Controls</h2>
            <p className="text-rove-stone leading-relaxed">You have absolute control over your profile. At any time, you can:</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="flex-1 bg-white p-6 rounded-2xl border border-rove-stone/10 text-center">
                <h4 className="font-bold text-rove-charcoal mb-2">Access Your Data</h4>
                <p className="text-xs text-rove-stone">Request a complete export of your health logs via your Profile Settings.</p>
              </div>
              <div className="flex-1 bg-phase-menstrual/5 p-6 rounded-2xl border border-phase-menstrual/10 text-center">
                <h4 className="font-bold text-rove-charcoal mb-2">Delete Your Account</h4>
                <p className="text-xs text-rove-stone/80">Request a full deletion of your account. All associated health data is permanently wiped.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">7. Children's Privacy</h2>
            <p className="text-rove-stone leading-relaxed">
              Our Services are not designed or directed toward individuals under the age of 18. We do not knowingly collect personal information from individuals under 18 without explicit parental consent.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-rove-charcoal">8. Updates to this Policy</h2>
            <p className="text-rove-stone leading-relaxed">
              We may update this Privacy Policy periodically. If we make material changes, we will notify you within the App or via email, and you will be asked to review and consent to the new terms at an onboarding checkpoint.
            </p>
          </section>

          <section className="space-y-6 border-t border-rove-stone/10 pt-12 text-center">
            <h2 className="text-2xl font-serif text-rove-charcoal mb-4">9. Contact Us</h2>
            <p className="text-rove-stone leading-relaxed mb-6">
              If you have any questions, concerns, or data requests, please reach out directly to our privacy team.
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
