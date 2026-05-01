"use client";

import { useState, useTransition } from "react";
import { signup } from "../actions";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

type FieldErrors = {
  [key: string]: string | undefined;
};

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Add state to track password input
  const [password, setPassword] = useState("");

  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const pass = formData.get("password") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    // 1. Lightweight Client-Side Validation
    const errors: FieldErrors = {};
    if (!email || !email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (!pass || pass.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (pass !== confirmPass) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // 2. Server Action
    startTransition(async () => {
      try {
        const response = await signup(formData);

        if (response?.error) {
          setFieldErrors({ server: response.error });
        } else if (response?.ok) {
          setSuccessMessage("Account created successfully! Loading...");
          router.replace(response.nextRoute || "/privacy-pledge");
        }
      } catch {
        setFieldErrors({ server: "Something went wrong. Please try again." });
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

      {/* Static Card */}
      <div className="w-full max-w-md bg-white/90 p-8 md:p-10 relative z-20 rounded-[2rem] border border-rove-charcoal/5 shadow-xl transition-all">

        {/* Header & Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1">
            <div className="relative w-16 h-16 md:w-20 md:h-20 opacity-90 drop-shadow-sm">
              <img
                src="/images/rove_icon_transparent.png"
                alt="Rove Logo"
                className="w-full h-full object-contain"
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
                className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-rove-cream/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                    \${fieldErrors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-transparent focus:border-rove-charcoal/20 focus:bg-white focus:ring-4 focus:ring-rove-charcoal/5"
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
                className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-rove-cream/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                    \${fieldErrors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                    : "border-transparent focus:border-rove-charcoal/20 focus:bg-white focus:ring-4 focus:ring-rove-charcoal/5"
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
            <div className="space-y-1.5 overflow-hidden transition-all duration-300">
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
                  className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-rove-cream/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/40 font-medium
                        \${fieldErrors.confirmPassword
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                      : "border-transparent focus:border-rove-charcoal/20 focus:bg-white focus:ring-4 focus:ring-rove-charcoal/5"
                    }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 pl-1 font-medium mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Server Error Message */}
          {fieldErrors.server && (
            <div className="p-3 rounded-2xl bg-red-50/80 text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center text-center transition-opacity duration-300">
              {fieldErrors.server}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-green-50/80 text-green-700 text-sm font-medium border border-green-100 flex items-center justify-center text-center transition-opacity duration-300">
              {successMessage}
            </div>
          )}

          {/* Button */}
          <Button
            type="submit"
            disabled={isPending || !!successMessage}
            className="w-full py-6 h-auto rounded-full bg-rove-charcoal text-rove-cream font-semibold text-lg shadow-lg hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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
            <span className="px-4 bg-white text-rove-stone font-medium rounded-full">Or continue with</span>
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
