import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Rove Health",
  description: "Get in touch with the Rove Health team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center md:py-28">
      <span className="font-label text-xs font-semibold uppercase tracking-wide text-obsidian">
        Contact
      </span>
      <h1 className="mt-4 font-sans font-semibold tracking-tight text-4xl leading-tight text-obsidian md:text-5xl">
        Say hello.
      </h1>
      <p className="mt-4 font-sans text-base leading-relaxed text-obsidian/70">
        Questions about Balance or the app, or want to order before checkout is live?
        Reach out directly.
      </p>

      <a
        href="mailto:team@rovehealth.in"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-rove-lime px-6 py-3 font-label text-sm font-medium uppercase tracking-wide text-obsidian transition-colors hover:bg-rove-lime-deep"
      >
        <Mail className="h-4 w-4" />
        team@rovehealth.in
      </a>
    </div>
  );
}
