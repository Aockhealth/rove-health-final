import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, CheckCircle2, Star, ShieldCheck, Zap, Clock, Activity, Brain, TrendingUp } from "lucide-react";
import { PlatformPreview } from "@/components/PlatformPreview";
import { MaleClockGraph, FemaleCycleGraph } from "@/components/CycleGraphs";
import { cn } from "@/lib/utils";
import { Hero } from "@/components/home/Hero";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <main className="min-h-screen bg-white text-rove-charcoal font-sans selection:bg-rove-red/20">

      {/* 1. THE HOOK: You are cyclical */}
      <Hero isLoggedIn={isLoggedIn} />

      {/* 2. THE PROBLEM: The 24-Hour Trap */}
      <section className="py-20 px-6 bg-rove-charcoal text-white">
        <div className="max-w-xl">
          <h2 className="font-heading text-4xl md:text-5xl mb-8">The 24-Hour Trap.</h2>
          <p className="text-xl text-white/70 leading-relaxed mb-12">
            Society expects you to be the same person every day. But your brain, metabolism, and energy shift every week.
          </p>

          <div className="grid gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">The Male Clock</h3>
              </div>
              <div className="h-24 w-full mb-4 border-b border-white/10 relative">
                <MaleClockGraph />
              </div>
              <p className="text-white/60 text-sm">Resets every 24 hours. Static.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white text-rove-charcoal border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rove-red/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-rove-red/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-rove-red" />
                </div>
                <h3 className="text-xl font-bold">Your Clock</h3>
              </div>
              <div className="h-24 w-full mb-4 border-b border-rove-stone/10 relative z-10">
                <FemaleCycleGraph color="#6A1B21" />
              </div>
              <p className="text-rove-stone text-sm relative z-10">Resets every 28 days. Dynamic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE SOLUTION: The Rove System */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-xl mx-auto md:mx-0">
          <Badge className="mb-6 bg-rove-green/10 text-rove-green border-rove-green/20">The Solution</Badge>
          <h2 className="font-heading text-4xl md:text-6xl mb-6 text-rove-charcoal">Sync with your system.</h2>
          <p className="text-xl text-rove-stone leading-relaxed mb-12">
            Rove is the first platform that adapts your nutrition and fitness to your real-time biology.
          </p>

          <div className="space-y-4">
            {[
              { title: "Follicular", desc: "Build energy.", color: "bg-rove-charcoal" },
              { title: "Ovulatory", desc: "Maximize power.", color: "bg-rove-green" },
              { title: "Luteal", desc: "Focus & stabilize.", color: "bg-rove-red" },
              { title: "Menstrual", desc: "Rest & reset.", color: "bg-rove-stone" },
            ].map((phase, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-rove-cream/30 border border-rove-stone/5">
                <div className={cn("w-3 h-3 rounded-full shrink-0", phase.color)} />
                <div>
                  <span className="font-bold text-rove-charcoal block">{phase.title}</span>
                  <span className="text-rove-stone text-sm">{phase.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE PROOF: Real-Time Sync */}
      <section className="py-20 bg-rove-cream/30 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mb-12">
            <h2 className="font-heading text-4xl md:text-5xl mb-4">It happens in real-time.</h2>
            <p className="text-xl text-rove-stone">
              Your daily plan updates automatically as your hormones shift.
            </p>
          </div>

          <div className="relative max-w-sm mx-auto md:max-w-2xl md:mx-0">
            <div className="absolute -inset-4 bg-gradient-to-r from-rove-red/20 to-rove-green/20 rounded-full blur-3xl opacity-50" />
            <PlatformPreview />
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-24 px-6 bg-rove-charcoal text-center text-white">
        <div className="max-w-xl mx-auto">
          <h2 className="font-heading text-5xl mb-6">Join the Sync.</h2>
          <p className="text-xl text-white/60 mb-10">
            Master your rhythm today.
          </p>
          <Button size="lg" className="w-full md:w-auto rounded-full px-12 h-16 text-xl bg-white text-rove-charcoal hover:bg-rove-cream" asChild>
            <Link href={isLoggedIn ? "/cycle-sync" : "/signup"}>
              {isLoggedIn ? "Go to Dashboard" : "Get Started"}
            </Link>
          </Button>
        </div>
      </section>

    </main>
  );
}
