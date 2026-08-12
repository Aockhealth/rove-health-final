import Link from "next/link";
import { FlaskConical, Leaf, Stethoscope } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const MARKS = [
  { icon: Stethoscope, label: "Doctor-formulated" },
  { icon: FlaskConical, label: "Clinically-backed" },
  { icon: Leaf, label: "Made for Indian cycles" },
];

export function TrustMarks() {
  return (
    <section className="bg-paper px-6 py-8">
      <Reveal className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-[20px] border border-obsidian/12 bg-white-bone px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:px-10">
        {MARKS.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-obsidian/70" strokeWidth={1.75} aria-hidden />
            <span className="font-sans text-xs font-medium text-obsidian/75">{label}</span>
          </span>
        ))}
        <Link
          href="/story"
          className="font-sans text-xs font-medium text-obsidian underline underline-offset-4"
        >
          Read our story
        </Link>
      </Reveal>
    </section>
  );
}
