import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Rove Health",
  description: "The terms that govern your use of the Rove Health app, website, and shop.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By downloading the Cycle Sync app, browsing this website, or ordering Balance, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our app, site, or products. You must be at least 18 years old to create an account or place an order.",
    ],
  },
  {
    title: "2. Medical & Supplement Disclaimer",
    body: [],
    list: [
      {
        heading: "Not medical advice",
        text: "Rove is a wellness tracking and lifestyle system. All content, insights, and product recommendations are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.",
      },
      {
        heading: "Not intended to diagnose or treat",
        text: "Balance is a dietary supplement. It does not diagnose, cure, treat, or prevent any disease or medical condition, including but not limited to PMOS, endometriosis, or infertility.",
      },
      {
        heading: "Not for contraception",
        text: "Rove Health is not a form of birth control and should never be relied upon to prevent or achieve pregnancy.",
      },
      {
        heading: "Seek professional care",
        text: "Always consult a qualified healthcare professional before starting any new supplement, especially if you are pregnant, breastfeeding, on medication, or managing a diagnosed condition. In a medical emergency, contact emergency services immediately.",
      },
    ],
  },
  {
    title: "3. AI-Generated Content",
    body: [
      "The Cycle Sync app uses artificial intelligence to generate personalised insights, plans, and conversational responses. AI-generated content may occasionally be inaccurate or incomplete, reflects patterns in the information you provide, and is not reviewed by a medical professional before being shown to you. Use your own judgement and consult a healthcare provider before acting on any AI-generated insight.",
    ],
  },
  {
    title: "4. Your Account",
    body: [
      "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree to provide accurate information and to notify us promptly of any unauthorised use of your account.",
    ],
  },
  {
    title: "5. Orders, Pricing & Payment",
    body: [
      "All prices on this site are listed in Indian Rupees (INR) and are subject to change without notice. Payment is processed securely by our third-party payment partner at checkout; Rove Health does not store your full card details. We reserve the right to cancel or refuse any order, including in cases of pricing errors, suspected fraud, or stock unavailability, and will notify you if this happens.",
    ],
  },
  {
    title: "6. Shipping & Delivery",
    body: [
      "We currently ship across India only. Orders are processed within 1–2 business days of confirmation and typically delivered within 3–7 business days, depending on your location. You will receive tracking information by email once your order ships.",
    ],
  },
  {
    title: "7. Returns, Refunds & Cancellations",
    body: [
      "Because Balance is an ingestible supplement, opened products cannot be returned once delivered, except in the case of a manufacturing defect or damage in transit. Claims for defective or damaged products must be reported within 7 days of delivery, with photo evidence, to team@rovehealth.in. Approved claims will be resolved via a replacement or refund to your original payment method.",
    ],
  },
  {
    title: "8. Acceptable Use",
    body: ["You agree not to:"],
    bullets: [
      "Use the app or site for any unlawful purpose or in violation of these Terms.",
      "Attempt to reverse engineer, decompile, or extract the source code of the app or site.",
      "Interfere with or disrupt our infrastructure or security.",
      "Impersonate another person or misrepresent your identity.",
    ],
  },
  {
    title: "9. Intellectual Property",
    body: [
      "The app, this website, and their design, features, and content (excluding data you submit) are owned by Rove Health and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from them without our written permission.",
    ],
  },
  {
    title: "10. Termination",
    body: [
      "You may stop using the app or site and delete your account at any time. We may suspend or terminate your access if you violate these Terms or engage in conduct that harms the app, site, other users, or Rove Health.",
    ],
  },
  {
    title: "11. Disclaimer of Warranties & Limitation of Liability",
    body: [
      "The app, site, and products are provided \"as is\" without warranties of any kind, express or implied. To the fullest extent permitted by law, Rove Health is not liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the app, site, or products.",
    ],
  },
  {
    title: "12. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. If we make material changes, we will notify you within the app, on this page, or by email. Continued use after changes take effect constitutes acceptance of the revised Terms.",
    ],
  },
  {
    title: "13. Governing Law",
    body: [
      "These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes will be subject to the exclusive jurisdiction of the courts located in India.",
    ],
  },
  {
    title: "14. Contact Us",
    body: ["If you have any questions about these Terms, reach out to us at team@rovehealth.in."],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
      <span className="font-label text-xs font-semibold uppercase tracking-wide text-obsidian">
        Terms of Service
      </span>
      <h1 className="mt-4 font-sans font-semibold tracking-tight text-4xl leading-tight text-obsidian md:text-5xl">
        The fine print. Read with care.
      </h1>
      <p className="mt-4 font-sans text-base leading-relaxed text-obsidian/70">
        These Terms of Service govern your use of the Rove Health app, this website, and the Balance
        shop. By creating an account or placing an order, you agree to the terms below.
      </p>
      <p className="mt-3 font-sans text-xs font-semibold uppercase tracking-wide text-obsidian/40">
        Last updated: July 2026
      </p>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="font-sans text-xl font-semibold tracking-tight text-obsidian">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="font-sans text-sm leading-relaxed text-obsidian/75">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.list && (
              <ul className="mt-4 space-y-3">
                {section.list.map((item) => (
                  <li key={item.heading} className="rounded-[14px] bg-taupe-light/60 p-4">
                    <p className="font-sans text-sm font-semibold text-obsidian">{item.heading}</p>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-obsidian/70">{item.text}</p>
                  </li>
                ))}
              </ul>
            )}
            {section.bullets && (
              <ul className="mt-3 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="font-sans text-sm leading-relaxed text-obsidian/75">
                    • {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
