import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import { ADVISORS } from "@/data/advisors";

export const metadata: Metadata = {
  title: "Advisors | Rove Health",
  description: "Meet the doctors behind Rove's Cycle Sync formulas.",
};

export default function AdvisorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <div className="max-w-xl">
        <span className="font-label text-xs font-semibold uppercase tracking-wide text-obsidian">
          Advisors
        </span>
        <h1 className="mt-4 font-sans font-semibold tracking-tight text-4xl leading-tight text-obsidian md:text-5xl">
          Formulated by doctors who listened.
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-obsidian/70">
          Rove started with physicians who kept hearing the same thing in the clinic: hormonal
          health was being managed, rarely understood. Every formula carries their judgment.
        </p>
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-2">
        {ADVISORS.map((advisor) => (
          <div key={advisor.name} className="rounded-[20px] bg-white-bone border border-obsidian/12 p-8 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-obsidian text-white-bone">
              <Stethoscope className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-sans font-semibold tracking-tight text-2xl text-obsidian">{advisor.name}</h2>
            <p className="mt-1 font-label text-xs font-medium uppercase tracking-wide text-obsidian">
              {advisor.credentials}
            </p>
            <p className="mt-4 font-sans text-sm leading-relaxed text-obsidian/70">{advisor.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
