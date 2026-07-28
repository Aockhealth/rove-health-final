import Link from "next/link";
import { FlaskConical, Leaf, ShieldCheck, Stethoscope } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const MARKS = [
  { icon: Stethoscope, label: "Doctor-Formulated" },
  { icon: FlaskConical, label: "Clinically-Backed" },
  { icon: ShieldCheck, label: "Third-Party Tested" },
  { icon: Leaf, label: "Made for Indian Cycles" },
];

export function TrustMarks() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {MARKS.map(({ icon: Icon, label }, i) => (
            <Reveal key={label} delay={i * 90} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-obsidian text-white-bone">
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-sans text-xs font-medium text-obsidian/70">{label}</span>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/story"
            className="font-sans text-sm font-medium text-obsidian underline underline-offset-4"
          >
            Read our story
          </Link>
        </p>
      </div>
    </section>
  );
}
