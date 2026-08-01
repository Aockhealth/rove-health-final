import { Accordion, type AccordionItemData } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The homepage's compression valve. Anything a visitor might reasonably want
 * explained lives here, closed by default, instead of as another full-height
 * section they have to scroll past.
 */
const FAQS: AccordionItemData[] = [
  {
    question: "What is the Cycle Sync app?",
    answer:
      "An app that turns your cycle into a daily plan. You give it the date your last period started and roughly how long your cycle runs; it works out which phase you're in and tells you what to eat, how to move, and what's coming next. It's built by doctors, for Indian bodies and Indian kitchens.",
  },
  {
    question: "How is it different from a period tracker?",
    answer:
      "A tracker gives you a date and stops there. Cycle Sync starts where that ends: meal plans, movement, and predictive nudges for the phase you're actually in. You can flag PMOS, thyroid or insulin resistance once at onboarding and the whole plan adjusts.",
  },
  {
    question: "What does Cycle Sync cost?",
    answer:
      "Nothing. It's available on Android now, with iOS to follow. You don't need to buy a supplement to use it, and you don't have to log anything you don't want to.",
  },
  {
    question: "What about the supplements?",
    answer:
      "Balance is a separate, optional part of Rove. It's built for cycles that don't follow a predictable rhythm, including cycles affected by PMOS or insulin resistance, and it's on sale now. You don't need it to use the app.",
  },
  {
    question: "Are the supplements safe to take every day?",
    answer:
      "Balance is 1–2 tablets daily, for as long as it's useful — there's no course to finish. It's a supplement, not a medicine, and it isn't a replacement for treatment. If you're pregnant, breastfeeding, or on prescription medication, check with your doctor before starting.",
  },
];

export function HomeFaq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="bg-gradient-ovulatory px-6 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-obsidian md:text-3xl">
            Common questions.
          </h2>
        </Reveal>
        <Reveal delay={100} className="mt-6">
          <Accordion items={FAQS} defaultOpenIndex={null} variant="editorial" />
        </Reveal>
      </div>
    </section>
  );
}
