import { Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Illustrative placeholder copy for layout purposes only — these are not real
 * customers. Every quote and name here is invented. Swap in real, verifiable
 * customer reviews before this section ever goes live; do not ship fabricated
 * testimonials as if they were genuine, that's misleading advertising.
 */
const PLACEHOLDER_TESTIMONIALS = [
  {
    quote:
      "The first cycle I didn't dread my period. Rise actually helped with the fatigue I've had since forever.",
    name: "Priya Sharma",
    location: "Mumbai",
  },
  {
    quote:
      "Restore took the edge off my PMS mood swings within two cycles. My husband noticed before I did.",
    name: "Ananya Iyer",
    location: "Bengaluru",
  },
  {
    quote:
      "Balance is the first PMOS supplement that hasn't felt like a shot in the dark. My cycles are finally showing up on time.",
    name: "Kavya Reddy",
    location: "Hyderabad",
  },
  {
    quote:
      "The app telling me exactly what phase I'm in changed how I plan my whole week, not just my workouts.",
    name: "Meera Nair",
    location: "Delhi",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-obsidian/50">
          In their words
        </span>
        <h2 className="mt-3 font-sans text-3xl font-semibold leading-tight tracking-tight text-obsidian md:text-4xl">
          Real stories from people living in sync.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PLACEHOLDER_TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.quote}
              delay={i * 140}
              className="rounded-[20px] bg-white border border-obsidian/8 p-8 text-left shadow-sm"
            >
              <div className="flex gap-1 text-rove-gold">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 font-serif text-lg italic leading-snug text-obsidian/90">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-4 font-sans text-xs uppercase tracking-wide text-obsidian/50">
                {t.name}, {t.location}
              </p>
              <p className="mt-1 font-sans text-[10px] uppercase tracking-wide text-obsidian/30">
                Illustrative placeholder, not a real customer
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
