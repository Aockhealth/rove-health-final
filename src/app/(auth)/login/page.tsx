"use client";

import { useState, useTransition } from "react";
import { login } from "../actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image"; 
import { Loader2 } from "lucide-react"; 

type FieldErrors = {
    email?: string;
    password?: string;
    server?: string;
};

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({}); // Clear previous errors

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const errors: FieldErrors = {};
    let hasError = false;

    // --- Validation Logic ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.trim()) {
        errors.email = "Email is required.";
        hasError = true;
    } else if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address.";
        hasError = true;
    }

    if (!password?.trim()) {
        errors.password = "Password is required.";
        hasError = true;
    } else if (password.length < 6) { // ✅ Added check (Supabase default minimum)
        errors.password = "Password must be at least 6 characters.";
        hasError = true;
    }

    if (hasError) {
        setFieldErrors(errors);
        return;
    }
    
    startTransition(async () => {
      try {
        await login(formData);
      } catch (err) {
        // Generic error for security, or extract message if needed
        setFieldErrors({ server: "Invalid email or password." });
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] relative overflow-hidden px-4">

      {/* Peach Blobs */}
      <div className="blob-glow-peach" />
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-3" />

      {/* Card */}
      <div className="glass-panel relative z-10 w-full max-w-md p-8 md:p-12 border-rove-peach/30 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image 
              src="/assets/rove_logo.png" 
              alt="Rove Logo"
              width={120} 
              height={120}
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          
          <h1 className="text-3xl font-heading text-rove-charcoal mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-rove-stone">
            Log in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-rove-stone pl-1">Email</label>
              <input 
                name="email" 
                type="email" 
                placeholder="hello@rove.com"
                className={`w-full px-5 py-4 rounded-2xl bg-white/60 text-rove-charcoal border outline-none transition-all
                    ${fieldErrors.email
                      ? "border-red-300 focus:border-red-400 shadow-sm"
                      : "border-white/60 focus:border-rove-peach"
                    }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 pl-2 font-medium">{fieldErrors.email}</p>
              )}
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-xs font-bold uppercase tracking-widest text-rove-stone">Password</label>
                <Link href="/forgot-password" className="text-xs text-rove-red hover:underline">Forgot?</Link>
              </div>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••"
                className={`w-full px-5 py-4 rounded-2xl bg-white/60 text-rove-charcoal border outline-none transition-all
                    ${fieldErrors.password
                      ? "border-red-300 focus:border-red-400 shadow-sm"
                      : "border-white/60 focus:border-rove-peach"
                    }`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500 pl-2 font-medium">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          {/* Server Error */}
          {fieldErrors.server && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center">
              {fieldErrors.server}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full py-6 rounded-2xl bg-rove-charcoal text-white text-base font-heading shadow-lg hover:scale-[1.02] hover:bg-black transition-all"
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
          <p className="text-sm text-rove-stone/70">
            Don't have an account?{" "}
            <Link href="/signup" className="text-rove-red font-semibold hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}