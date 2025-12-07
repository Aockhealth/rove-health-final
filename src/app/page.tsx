import { createClient } from "@/utils/supabase/server";
import { Hero } from "@/components/home/Hero";
import { TheNarrative } from "@/components/home/TheNarrative";
import { ScrollyBenefits } from "@/components/home/ScrollyBenefits";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <main className="min-h-screen bg-white text-rove-charcoal font-sans selection:bg-rove-red/20">
      {/* 1. Hero Section (Desktop Only - Mobile is merged into Narrative) */}
      <div className="hidden md:block">
        <Hero isLoggedIn={isLoggedIn} />
      </div>

      {/* 2. The Narrative (Mobile: Auto-Scroll Story / Desktop: Sticky) */}
      <TheNarrative />

      {/* 3. THE SOLUTION (The Discovery) - Scrollytelling Benefits */}
      <ScrollyBenefits />

      {/* 5. CTA */}
      <section className="py-24 px-6 relative z-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rove-cream/40 to-white -z-10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rove-charcoal/5 to-transparent" />

        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-heading text-5xl mb-6 text-rove-charcoal">Stop fighting your physiology.</h2>
          <p className="text-xl text-rove-stone mb-10">
            Sync your life to your cycle today.
          </p>
          <Button size="lg" className="w-full md:w-auto rounded-full px-12 h-16 text-xl bg-rove-charcoal text-white hover:bg-rove-charcoal/90 shadow-xl shadow-rove-charcoal/10" asChild>
            <Link href={isLoggedIn ? "/cycle-sync" : "/signup"}>
              {isLoggedIn ? "Go to Dashboard" : "Start Syncing"}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
