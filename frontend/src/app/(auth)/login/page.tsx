"use client";

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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-8">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">

        {/* Header & Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1">
            <div className="relative w-56 h-40 mix-blend-multiply">
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500">
            Log in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block pl-1">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                </div>
                <input 
                    name="email" 
                    type="email" 
                    placeholder="hello@rove.com"
                    className={`w-full pl-12 pr-5 py-3.5 rounded-xl bg-gray-50 text-gray-900 border outline-none transition-all placeholder:text-gray-400
                        ${fieldErrors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                        }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 pl-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-rose-500 font-semibold hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                </div>
                <input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-5 py-3.5 rounded-xl bg-gray-50 text-gray-900 border outline-none transition-all placeholder:text-gray-400
                        ${fieldErrors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                        }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 pl-1 font-medium">{fieldErrors.password}</p>
              )}
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
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-300 via-rose-100 to-rose-400 text-gray-900 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-rose-500 font-semibold hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}