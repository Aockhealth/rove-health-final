"use client";

import { useState, useTransition } from "react";
import { signup } from "../actions";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signupSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

type FieldErrors = {
  [key: string]: string | undefined;
};

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // 1. Add state to track password input
  const [password, setPassword] = useState("");

  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // 1. Client-Side Validation (Zod)
    const result = signupSchema.safeParse(data);

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
      try {
        const response = await signup(formData);

        if (response?.error) {
          setFieldErrors({ server: response.error });
          toast.error(response.error);
        } else if (response?.ok) {
          toast.success("Account created successfully!");
          router.push(response.nextRoute || "/privacy-pledge");
        }
      } catch {
        setFieldErrors({ server: "Something went wrong. Please try again." });
        toast.error("Something went wrong.");
      }
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-rove-cream px-4 py-8 overflow-hidden grain-overlay">

      {/* 🌸 BACKGROUND ANIMATION (Standardized) */}
      <div className="blob-glow-red" />
      <div className="blob-glow-peach" />

      {/* Decorative Orbs */}
      <div className="glass-orb glass-orb-3 animate-reverse" />
      <div className="glass-orb glass-orb-2" />

      {/* Glassmorphic Card */}
      <div className="w-full max-w-md glass-panel p-8 md:p-10 relative z-20 transition-all hover:shadow-[0_20px_40px_-12px_rgba(45,36,32,0.1)] hover:-translate-y-1">

        {/* Header & Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1">
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

          <h1 className="text-3xl font-heading text-rove-charcoal mb-2 tracking-tight">
            Join ROVE
          </h1>
          <p className="text-sm text-rove-stone font-medium tracking-wide">
            Start your cycle-sync journey today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[0.2em] pl-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rove-stone/60">
                <Mail size={18} />
              </div>
              <input
                name="email"
                type="email"
                placeholder="hello@rove.com"
                className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                    ${fieldErrors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-white/50 focus:border-rove-charcoal/20 focus:bg-white/80 focus:ring-4 focus:ring-rove-charcoal/5"
                  }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-500 pl-1 font-medium mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[0.2em] pl-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rove-stone/60">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                    ${fieldErrors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-white/50 focus:border-rove-charcoal/20 focus:bg-white/80 focus:ring-4 focus:ring-rove-charcoal/5"
                  }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 pl-1 font-medium mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5 overflow-hidden"
            >
              <label className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[0.2em] pl-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rove-stone/60">
                  <Lock size={18} />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                        ${fieldErrors.confirmPassword
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                      : "border-white/50 focus:border-rove-charcoal/20 focus:bg-white/80 focus:ring-4 focus:ring-rove-charcoal/5"
                    }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 pl-1 font-medium mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </motion.div>
          )}

          {/* Server Error Message */}
          {fieldErrors.server && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-2xl bg-red-50/80 backdrop-blur-sm text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center text-center"
            >
              {fieldErrors.server}
            </motion.div>
          )}

          {/* Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 h-auto rounded-full bg-rove-charcoal text-rove-cream font-semibold text-lg shadow-[0_10px_20px_-5px_rgba(45,36,32,0.2)] hover:bg-rove-charcoal/90 hover:shadow-[0_15px_25px_-5px_rgba(45,36,32,0.3)] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
              </span>
            ) : "Create Account"}
          </Button>
        </form>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-rove-stone/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#FDFBF7] text-rove-stone font-medium rounded-full">Or continue with</span>
          </div>
        </div>

        <GoogleAuthButton label="Google" />

        {/* Footer */}
        <div className="mt-8 text-center text-sm space-y-4">
          <p className="text-rove-stone font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-rove-charcoal font-bold hover:underline underline-offset-4 decoration-rove-charcoal/30 transition-all"
            >
              Log in
            </Link>
          </p>
          <p className="text-rove-stone/60 text-xs">
            By joining, you agree to our <Link href="/privacy" className="underline hover:text-rove-charcoal transition-colors">Privacy Policy</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
