"use client";

import { useState, useTransition } from "react";
import { login } from "../actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

type FieldErrors = {
  [key: string]: string | undefined;
};

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Lightweight Client-Side Validation
    const errors: FieldErrors = {};
    if (!email || !email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // 2. Server Action
    startTransition(async () => {
      const response = await login(formData);

      if (response?.error) {
        setFieldErrors({ server: response.error });
      } else if (response?.ok) {
        setSuccessMessage("Welcome back! Loading your dashboard...");
        router.replace(response.nextRoute || "/cycle-sync");
      }
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-rove-cream px-4 py-8 overflow-hidden grain-overlay">

      {/* Decorative Layer - Static for performance */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-64 h-64 bg-phase-menstrual/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-phase-follicular/20 rounded-full blur-[80px]" />
      </div>

      {/* Static Card - Removed backdrop-filter blur for mobile performance */}
      <div className="w-full max-w-md bg-white/90 p-8 md:p-10 relative z-20 rounded-[2rem] border border-rove-charcoal/5 shadow-xl transition-all">

        {/* Header & Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 md:w-20 md:h-20 opacity-90 drop-shadow-sm">
              <img
                src="/images/rove_logo_final.png"
                alt="Rove Logo"
                className="w-full h-full object-contain"
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
                className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-rove-cream/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                        \${fieldErrors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-transparent focus:border-rove-charcoal/20 focus:bg-white focus:ring-4 focus:ring-rove-charcoal/5"
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
                className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-rove-cream/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                        \${fieldErrors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-transparent focus:border-rove-charcoal/20 focus:bg-white focus:ring-4 focus:ring-rove-charcoal/5"
                  }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 pl-1 font-medium mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Inline Server Message */}
          {fieldErrors.server && (
            <div className="p-4 rounded-2xl bg-red-50/80 text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center text-center transition-opacity duration-300">
              {fieldErrors.server}
            </div>
          )}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-green-50/80 text-green-700 text-sm font-medium border border-green-100 flex items-center justify-center text-center transition-opacity duration-300">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || !!successMessage}
            className="w-full py-6 h-auto rounded-full bg-rove-charcoal text-rove-cream font-semibold text-lg shadow-lg hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
              </span>
            ) : "Log In"}
          </Button>
        </form>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-rove-stone/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-rove-stone font-medium rounded-full">Or continue with</span>
          </div>
        </div>

        <GoogleAuthButton label="Google" />

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
