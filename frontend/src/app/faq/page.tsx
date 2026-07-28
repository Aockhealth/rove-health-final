import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "FAQ | Rove Health",
  description: "Common questions about Cycle Sync Balance and the Rove app.",
};

const FAQS = [
  {
    question: "Is Balance doctor-formulated?",
    answer:
      "Yes. Rove was started by physicians, and every formula is built around ingredients with clinical backing.",
  },
  {
    question: "Do I need the app to use the supplements?",
    answer:
      "No. Balance works on its own. The app simply helps you know exactly which phase you're in.",
  },
  {
    question: "Where do you ship?",
    answer: "[Placeholder: add shipping regions and timelines once checkout is live.]",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
      <span className="font-label text-xs font-semibold uppercase tracking-wide text-obsidian">FAQ</span>
      <h1 className="mt-4 font-sans font-semibold tracking-tight text-4xl leading-tight text-obsidian md:text-5xl">
        Questions, answered.
      </h1>

      <div className="mt-12">
        <Accordion items={FAQS} />
      </div>
    </div>
  );
}
