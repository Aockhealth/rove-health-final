import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Hero } from "@/components/home/Hero";
import { TheNarrative } from "@/components/home/TheNarrative";
import { ScrollyBenefits } from "@/components/home/ScrollyBenefits";
import { CycleSymptomVisualizer } from "@/components/CycleSymptomVisualizer";
import { HormoneFlowBackground } from "@/components/HormoneFlowBackground";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <main className="min-h-screen bg-white text-rove-charcoal font-sans selection:bg-rove-red/20">

      {/* 0. HERO: The Setup */}
      {/* Shortened scroll reveal for the hero since it's the first thing seen */}
      <ScrollReveal>
        <Hero isLoggedIn={isLoggedIn} />
      </ScrollReveal>

      {/* CHAPTER 1 & 2: THE NARRATIVE (Merged) */}
      <TheNarrative />

      {/* CHAPTER 3: THE DISCOVERY (Sticky Scrollytelling) */}
      <ScrollyBenefits />

      {/* CHAPTER 4: THE PROOF (Interactive) */}
      <ScrollReveal>
        <section className="py-16 md:py-24 bg-rove-cream/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-heading text-4xl md:text-5xl mb-4">Your symptoms are signals.</h2>
              <p className="text-lg md:text-xl text-rove-stone">
                Stop guessing. Start listening.
              </p>
            </div>
            <CycleSymptomVisualizer />
          </div>
        </section>
      </ScrollReveal>

      {/* 5. CTA */}
      <ScrollReveal>
        <section className="py-16 md:py-32 px-6 bg-rove-charcoal text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <HormoneFlowBackground variant="calm" />
          </div>
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-heading text-4xl md:text-6xl mb-8">Stop fighting your biology.</h2>
            <Button size="lg" className="w-full md:w-auto rounded-full px-12 h-16 text-lg bg-white text-rove-charcoal hover:bg-rove-cream" asChild>
              <Link href={isLoggedIn ? "/cycle-sync" : "/signup"}>
                {isLoggedIn ? "Go to Dashboard" : "Start Syncing Now"}
              </Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>

    </main>
  );
}
