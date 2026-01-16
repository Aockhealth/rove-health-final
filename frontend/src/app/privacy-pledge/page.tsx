"use client";

import { acceptPrivacyPolicy } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Lock, EyeOff, HeartHandshake, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTransition } from "react";
import Image from "next/image";

export default function PrivacyPledge() {
  const [isPending, startTransition] = useTransition();

  const handleAgree = () => {
    startTransition(async () => {
      await acceptPrivacyPolicy();
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden flex justify-center items-center p-6">
      {/* 🌸 Background Elements */}
      <div className="blob-glow-peach" /> 
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-3" />

      {/* 🧊 Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel relative z-10 w-full max-w-lg p-8 md:p-12 text-center shadow-2xl border-rove-peach/30"
      >
        {/* Logo Header */}
        {/* Reduced margin-bottom from mb-6 to mb-2 for tighter spacing */}
        <div className="flex justify-center mb-2">
          <Image 
            src="/assets/Data-privacy.png" 
            alt="Rove Data Privacy"
            width={220} // Increased width for a wider logo
            height={220}
            className="object-contain"
            priority
            unoptimized
          />
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-4xl text-rove-charcoal mb-4">
          Your Body. <br/>
          <span className="text-rose-400">Your Data.</span>
        </h1>

        <p className="text-rove-stone text-base md:text-lg mb-8 leading-relaxed">
          Rove is designed to be a safe space. We believe your health data belongs to <b>you</b>, and only you.
        </p>

        {/* Key Points */}
        <div className="space-y-4 text-left mb-10">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-colors">
            <div className="p-2 bg-white rounded-full text-rove-charcoal shadow-sm">
                <Lock size={18} />
            </div>
            <div>
                <h3 className="font-heading font-bold text-rove-charcoal text-sm">Encrypted Storage</h3>
                <p className="text-xs text-rove-stone">Your cycle data is encrypted at rest and in transit.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-colors">
            <div className="p-2 bg-white rounded-full text-rove-charcoal shadow-sm">
                <EyeOff size={18} />
            </div>
            <div>
                <h3 className="font-heading font-bold text-rove-charcoal text-sm">No Selling Data</h3>
                <p className="text-xs text-rove-stone">We never sell your personal health info to advertisers.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-colors">
            <div className="p-2 bg-white rounded-full text-rove-charcoal shadow-sm">
                <HeartHandshake size={18} />
            </div>
            <div>
                <h3 className="font-heading font-bold text-rove-charcoal text-sm">You Are In Control</h3>
                <p className="text-xs text-rove-stone">Export or delete your account & data at any time.</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
            onClick={handleAgree}
            disabled={isPending}
            className="w-full h-14 rounded-2xl bg-rove-charcoal text-white hover:bg-black shadow-lg text-lg font-heading group transition-all hover:scale-[1.02]"
        >
            {isPending ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" /> Saving...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    I Understand <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
            )}
        </Button>

        {/* Disagree / Logout Option */}
        <form action="/auth/signout" method="post" className="mt-4">
             <button className="text-[10px] text-rove-stone/50 uppercase tracking-widest hover:text-rove-red transition-colors">
                I do not agree (Log out)
             </button>
        </form>

        <p className="text-[10px] text-rove-stone/50 mt-6 uppercase tracking-widest">
            Read our full <a href="#" className="underline hover:text-rove-charcoal">Privacy Policy</a>
        </p>

      </motion.div>
    </div>
  );
}