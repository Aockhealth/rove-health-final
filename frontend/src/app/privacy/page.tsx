import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Rove Health",
  description: "How Rove Health collects, uses, and protects your data across the app, website, and shop.",
};

const SECTIONS = [
  {
    title: "1. We Do Not Sell Your Data",
    body: [
      "Rove Health has a fundamental commitment to your privacy: we do not, and will never, sell, trade, or rent your personal or health information to third parties, advertisers, or data brokers. Your reproductive health data is yours.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "We only collect the information necessary to run your account, fulfil your orders, and provide cycle-tracking insights.",
    ],
    list: [
      {
        heading: "Account information",
        text: "When you create an account, we collect your name, email address, and secure password credentials.",
      },
      {
        heading: "Health and cycle logs",
        text: "Data you voluntarily input in the app, such as cycle dates, flow severity, symptoms, moods, and biometric data.",
      },
      {
        heading: "Order and shipping information",
        text: "When you buy Balance, we collect your shipping address, phone number, and order history to fulfil and track your delivery.",
      },
      {
        heading: "Payment information",
        text: "Card and UPI details are entered directly with our payment processor and are never stored on Rove Health's own servers.",
      },
      {
        heading: "Device and usage data",
        text: "Standard diagnostic data, collected automatically, to keep the app and site stable.",
      },
    ],
  },
  {
    title: "3. How Your Health Data Is Protected",
    body: [
      "To radically reduce exposure, we maintain a hard infrastructure boundary between your identity and your health data. Personally identifiable information is stored separately from your daily cycle logs, and health data is stored using anonymised identifiers wherever possible. All data is encrypted in transit and at rest.",
    ],
  },
  {
    title: "4. Medical & Supplement Disclaimer",
    body: [
      "Rove is a wellness tracking and lifestyle system. The insights, recommendations, and supplements provided are for informational and nutritional support purposes only, and are not intended to diagnose, treat, cure, or prevent any disease or medical condition, including but not limited to PMOS, endometriosis, or infertility.",
      "Always consult a qualified healthcare professional before making changes to your diet, supplement routine, or lifestyle, especially if you are pregnant, breastfeeding, or on medication.",
    ],
  },
  {
    title: "5. AI Privacy and Safeguards",
    body: [
      "Rove Health uses artificial intelligence to generate personalised insights and phase-based recommendations. Before any AI processing occurs, your personal identifiers are stripped, and the model only analyses raw cycle characteristics. Your individual health logs are isolated and are not used to train global generative AI models.",
    ],
  },
  {
    title: "6. How We Share Information",
    body: ["We strictly limit outside access to your data. We only share information in the following circumstances:"],
    list: [
      {
        heading: "Service providers",
        text: "Trusted cloud infrastructure partners who operate our app and site, bound by confidentiality agreements.",
      },
      {
        heading: "Fulfilment and logistics partners",
        text: "Courier and logistics partners receive only the shipping details needed to deliver your order.",
      },
      {
        heading: "Legal compliance",
        text: "We disclose information only if required by a legally binding request, and we challenge overly broad or invasive ones.",
      },
    ],
  },
  {
    title: "7. Your Rights & Controls",
    body: [
      "You can request a full export of your health and order data, or request permanent deletion of your account, at any time by writing to us below.",
    ],
  },
  {
    title: "8. Children's Privacy",
    body: [
      "Our app, website, and shop are not directed toward individuals under the age of 18. We do not knowingly collect personal information from, or sell supplements to, individuals under 18.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    body: [
      "We may update this Privacy Policy periodically. If we make material changes, we will notify you within the app, on this page, or by email.",
    ],
  },
  {
    title: "10. Contact Us",
    body: [
      "If you have any questions, concerns, or data requests, reach out directly to team@rovehealth.in.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
      <span className="font-label text-xs font-semibold uppercase tracking-wide text-obsidian">
        Privacy Policy
      </span>
      <h1 className="mt-4 font-sans font-semibold tracking-tight text-4xl leading-tight text-obsidian md:text-5xl">
        Your body. Your data.
      </h1>
      <p className="mt-4 font-sans text-base leading-relaxed text-obsidian/70">
        At Rove Health, your privacy is a foundational commitment. This policy covers how we handle
        your data across the Cycle Sync app, this website, and the Balance shop.
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
          </div>
        ))}
      </div>
    </div>
  );
}
