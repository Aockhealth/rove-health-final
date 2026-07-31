import Image from "next/image";
import Link from "next/link";
import { FlaskConical, Stethoscope } from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FOOTER_GROUPS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Balance" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/library", label: "The Library" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/story", label: "Our Story" },
      { href: "/app", label: "The App" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const TRUST_MARKS = [
  { icon: Stethoscope, label: "Doctor-Formulated" },
  { icon: FlaskConical, label: "Clinically-Backed" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-obsidian/8 bg-taupe-light">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Image src="/brand/logo.png" alt="Rove" width={140} height={75} className="h-8 w-auto" />
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-obsidian/70">
              Doctor-formulated support for every phase of your cycle, and the app that helps you
              live in sync with it.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.instagram.com/dr_rove/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-obsidian/60 hover:text-obsidian"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="font-label text-xs font-semibold uppercase tracking-wide text-obsidian/50">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-obsidian/75 hover:text-obsidian"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-obsidian/8 pt-8">
          {TRUST_MARKS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-obsidian/60">
              <Icon className="h-4 w-4" />
              <span className="font-label text-xs uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-4 border-t border-obsidian/8 pt-6 sm:flex-row sm:items-center">
          <div className="font-sans text-xs text-obsidian/50 flex flex-col gap-1">
            <p>© {new Date().getFullYear()} Aockhealth Ventures. All rights reserved.</p>
            <p>
              Email: <a href="mailto:team@rovehealth.in" className="hover:text-obsidian transition-colors">team@rovehealth.in</a> | Phone: <a href="tel:8169785654" className="hover:text-obsidian transition-colors">8169785654</a>
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="font-sans text-xs text-obsidian/50 hover:text-obsidian">
              Privacy
            </Link>
            <Link href="/terms" className="font-sans text-xs text-obsidian/50 hover:text-obsidian">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
