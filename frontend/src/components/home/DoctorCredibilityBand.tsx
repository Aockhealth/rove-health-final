import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function DoctorCredibilityBand() {
  return (
    <section className="px-6 py-16 md:py-20">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-[28px] border border-obsidian/12 bg-white-bone p-10 text-center shadow-[0_8px_24px_rgba(0,0,0,0.06)] md:p-14">
        <div className="flex -space-x-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white-bone bg-taupe-light text-obsidian/70 shadow-sm"
            >
              <Stethoscope className="h-6 w-6" />
            </div>
          ))}
        </div>

        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian/60">
          Trusted care
        </p>

        <h2 className="font-sans text-2xl font-semibold leading-snug tracking-tight text-obsidian md:text-3xl">
          Formulated by doctors.{" "}
          <span className="font-serif italic font-medium">Backed by research.</span>
        </h2>
        <p className="max-w-xl font-sans text-sm leading-relaxed text-obsidian/70">
          Rove was started by physicians who kept hearing the same thing from patients: that
          hormonal health was being managed, not understood. Every formula is built with that in mind.
        </p>
        <Link
          href="/advisors"
          className="font-sans text-sm font-medium text-obsidian underline underline-offset-4"
        >
          Meet the doctors
        </Link>
      </Reveal>
    </section>
  );
}
