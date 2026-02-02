"use client";

import { motion } from "framer-motion";

import { useState, useTransition } from "react";
import { login } from "@backend/actions/auth/auth-actions";
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
      } else if (response?.success) {

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

        // 🚀 Redirect to Dashboard
        router.push("/cycle-sync");
      }
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-8 overflow-hidden">

      {/* 🌸 BACKGROUND ANIMATION (Shared with IntroSequence) */}
      <motion.div
        className="absolute w-[800px] h-[800px] bg-gradient-to-br from-[#F4DCD6]/40 to-[#E68D85]/20 rounded-full blur-[80px] mix-blend-multiply pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%', left: '-10%' }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#FFF]/60 to-[#F9F9F5]/40 rounded-full blur-[60px] mix-blend-overlay pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -20, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        style={{ bottom: '20%', right: '-5%' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-[#DC4C3E]/5 rounded-full blur-[100px] pointer-events-none"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        style={{ top: '40%', left: '30%' }}
      />

      {/* Glassmorphic Card */}
      <div className="w-full max-w-md bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_-4px_rgba(45,36,32,0.05),_inset_0_0_0_1px_rgba(255,255,255,0.6)] p-8 md:p-10 relative z-10 transition-all hover:shadow-[0_20px_40px_-12px_rgba(45,36,32,0.1)] hover:-translate-y-1">

        {/* Header & Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-12 md:w-56 md:h-16 mix-blend-multiply opacity-90">
              <Image
                src="/assets/rove_logo.png"
                alt="Rove Logo"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>

          <h1 className="text-4xl font-serif text-rove-charcoal mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-rove-stone/90 font-medium tracking-wide">
            Log in to continue your cycle syncing
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6" noValidate>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-rove-charcoal/60 uppercase tracking-widest pl-1">Email</label>
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
              <label className="text-xs font-bold text-rove-charcoal/60 uppercase tracking-widest">Password</label>
              <Link href="/forgot-password" className="text-xs text-rove-charcoal/70 font-semibold hover:text-rove-red transition-colors">Forgot?</Link>
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
            <div className="p-4 rounded-2xl bg-red-50/80 backdrop-blur-sm text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center">
              {fieldErrors.server}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 h-auto rounded-full bg-rove-charcoal text-[#FDFBF7] font-medium text-lg shadow-[0_10px_20px_-5px_rgba(45,36,32,0.2)] hover:bg-rove-charcoal/90 hover:shadow-[0_15px_25px_-5px_rgba(45,36,32,0.3)] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
              </span>
            ) : "Log In"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-rove-stone">
            Don't have an account?{" "}
            <Link href="/signup" className="text-rove-charcoal font-semibold hover:underline underline-offset-4 decoration-rove-charcoal/30">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}