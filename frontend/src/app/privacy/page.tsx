import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Rove Health",
  description: "Read Rove Health's commitment to protecting your health and personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] text-rove-charcoal pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-neutral-200/60 transition-all p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/onboarding" className="inline-flex items-center gap-2 text-rove-stone hover:text-rove-charcoal transition-colors bg-white/50 px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
            <ChevronLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </Link>
          <div className="flex items-center gap-2 bg-phase-menstrual/10 text-phase-menstrual px-4 py-1.5 rounded-full border border-phase-menstrual/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Verified Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 mt-12 md:mt-20">
        <header className="mb-12 border-b border-neutral-200 pb-10">
          <h1 className="text-4xl md:text-5xl font-heading text-rove-charcoal mb-4">Privacy Policy</h1>
          <p className="text-sm font-medium text-rove-stone tracking-widest uppercase">Last Updated: March 2026</p>
        </header>

        <article className="prose prose-stone prose-lg max-w-none 
          prose-headings:font-heading prose-headings:font-normal prose-headings:tracking-tight 
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 
          prose-h3:text-xl prose-h3:mt-8 prose-h2:text-rove-charcoal
          prose-p:text-neutral-600 prose-p:leading-relaxed 
          prose-a:text-phase-menstrual prose-a:font-semibold hover:prose-a:text-phase-menstrual/80
          prose-li:marker:text-phase-menstrual/60"
        >
          <p className="lead text-xl text-neutral-500 font-medium">
            At Rove Health ("we", "our", or "us"), your privacy is our highest priority. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application, website, and related services (collectively, the "Services").
          </p>

          <h2>1. We Do Not Sell Your Data</h2>
          <p>
            Rove Health has a fundamental commitment to your privacy: <strong>we do not, and will never, sell, trade, or rent your personal health information</strong> to third parties, advertisers, or data brokers. Your reproductive health data is yours.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We only collect the information necessary to provide you with insights, cycle tracking, and holistic recommendations.</p>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and secure password credentials.</li>
            <li><strong>Health and Cycle Logs:</strong> We collect data you voluntarily input, such as cycle dates, flow severity, symptoms, moods, and biometric data (like basal body temperature or cervical fluid).</li>
            <li><strong>Device and Usage Data:</strong> We automatically collect standard diagnostic data, including device type, operating system, and app usage patterns to improve app stability and user experience.</li>
          </ul>

          <h2>3. Identity Firewall & Security</h2>
          <p>
            To radically reduce exposure, we maintain a hard infrastructure boundary between your identity and your health data. 
          </p>
          <p>
            Your personally identifiable information (like your email address) is stored in a highly secure, separate database from your daily cycle logs. Under normal operating bounds, your health data is stored using anonymous identifiers. All data is encrypted in transit using industry-standard TLS protocols and encrypted at rest.
          </p>

          <h2>4. AI Privacy and Safegaurds</h2>
          <p>
            Rove Health utilizes advanced Artificial Intelligence to generate bespoke insights and phase-based recommendations. To protect your privacy during this process:
          </p>
          <ul>
            <li><strong>Anonymized Processing:</strong> Before any internal or external AI processing occurs, your personal identifiers are stripped. The AI only analyzes raw cycle characteristics, never your identity.</li>
            <li><strong>No Model Training:</strong> Your individual health logs are isolated and are not used to train global generative AI models.</li>
          </ul>

          <h2>5. How We Share Information</h2>
          <p>We strictly limit an outside party&apos;s access to your data. We only share information in the following circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> We use trusted third-party cloud infrastructure (e.g., secure database hosting) to operate our Services. These providers are strictly bound by confidentiality agreements.</li>
            <li><strong>Legal Compliance:</strong> We will only disclose your information if required to do so by a legally binding subpoena, court order, or similar legal process. We actively challenge broad or overly invasive requests for user data.</li>
          </ul>

          <h2>6. Your Rights & Controls</h2>
          <p>You have absolute control over your profile. At any time, you can:</p>
          <ul>
            <li><strong>Access Your Data:</strong> Request a complete export of your health logs via your Profile Settings.</li>
            <li><strong>Delete Your Account:</strong> Request a full deletion of your account. Upon deletion, all associated health data is permanently wiped from our active operational servers.</li>
          </ul>

          <h2>7. Children's Privacy</h2>
          <p>
            Our Services are not designed or directed toward individuals under the age of 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h2>8. Updates to this Policy</h2>
          <p>
            We may update this Privacy Policy periodically. If we make material changes, we will notify you within the App or via email, and you will be asked to review and consent to the new terms at an onboarding checkpoint.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions, concerns, or data requests, please reach out directly to our privacy team at: <br/>
            <a href="mailto:rovehealthofficial@gmail.com">rovehealthofficial@gmail.com</a>
          </p>
        </article>
      </div>
    </main>
  );
}
