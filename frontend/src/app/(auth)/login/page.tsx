"use client";

import { motion } from "framer-motion";

import { useState, useTransition } from "react";
import { login } from "../actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/schemas";
import confetti from "canvas-confetti";

type FieldErrors = {
  [key: string]: string | undefined;
};

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // 1. Client-Side Validation
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      const formattedErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0].toString()] = issue.message;
      });
      setFieldErrors(formattedErrors);
      return;
    }

    // 2. Server Action
    startTransition(async () => {
      const response = await login(formData);

      if (response?.error) {
        setFieldErrors({ server: response.error });
        toast.error(response.error);
      } else if (response?.ok) {

        // 🎉 FIXED: Confetti from Sides (Left and Right Cannons)
        const colors = ["#E68D85", "#FDFBF7", "#2D2A26"];
        const commonOptions = {
          spread: 50,
          colors: colors,
          ticks: 200,
          gravity: 0.8,
          scalar: 0.8,
          zIndex: 9999,
        };

        // Shoot from Left
        confetti({
          ...commonOptions,
          particleCount: 30,
          angle: 60,
          origin: { x: 0, y: 0.65 }, // Left side
        });

        // Shoot from Right
        confetti({
          ...commonOptions,
          particleCount: 30,
          angle: 120,
          origin: { x: 1, y: 0.65 }, // Right side
        });

        // ✅ Show Toast
        toast.success("Welcome back!", {
          description: "It's great to see you again."
        });

        router.push(response.nextRoute || "/cycle-sync");
      }
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-rove-cream px-4 py-8 overflow-hidden grain-overlay">

      {/* 🌸 BACKGROUND ANIMATION (Standardized) */}
      <div className="blob-glow-red" />
      <div className="blob-glow-peach" />

      {/* Decorative Orbs */}
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />

      {/* Glassmorphic Card */}
      <div className="w-full max-w-md glass-panel p-8 md:p-10 relative z-20 transition-all hover:shadow-[0_20px_40px_-12px_rgba(45,36,32,0.1)] hover:-translate-y-1">

        {/* Header & Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 md:w-20 md:h-20 opacity-90 transition-transform hover:scale-105 duration-500 drop-shadow-sm">
              <Image
                src="/images/rove_icon_transparent.png"
                alt="Rove Logo"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>

          <h1 className="text-4xl font-heading text-rove-charcoal mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-rove-stone font-medium tracking-wide">
            Log in to continue your cycle syncing
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6" noValidate>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[0.2em] pl-1">Email</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rove-stone/60">
                <Mail size={18} />
              </div>
              <input
                name="email"
                type="email"
                placeholder="hello@rove.com"
                className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-white/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                        ${fieldErrors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-white/50 focus:border-rove-charcoal/20 focus:bg-white/80 focus:ring-4 focus:ring-rove-charcoal/5"
                  }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-500 pl-1 font-medium mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pl-1 pr-1">
              <label className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[0.2em]">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-rove-charcoal/60 font-semibold hover:text-rove-red transition-colors opacity-60">Forgot?</Link>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rove-stone/60">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-white/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                        ${fieldErrors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-white/50 focus:border-rove-charcoal/20 focus:bg-white/80 focus:ring-4 focus:ring-rove-charcoal/5"
                  }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 pl-1 font-medium mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Server Error */}
          {fieldErrors.server && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-red-50/80 backdrop-blur-sm text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center text-center"
            >
              {fieldErrors.server}
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 h-auto rounded-full bg-rove-charcoal text-rove-cream font-semibold text-lg shadow-[0_10px_20px_-5px_rgba(45,36,32,0.2)] hover:bg-rove-charcoal/90 hover:shadow-[0_15px_25px_-5px_rgba(45,36,32,0.3)] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
              </span>
            ) : "Log In"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-rove-stone font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-rove-charcoal font-bold hover:underline underline-offset-4 decoration-rove-charcoal/30 transition-all">
              Sign up
            </Link>
          </p>
          <p className="text-rove-stone/60 text-xs text-center">
            View our <Link href="/privacy" className="underline hover:text-rove-charcoal transition-colors">Privacy Policy</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
