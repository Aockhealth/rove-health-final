"use client";

import { useState, useTransition } from "react";
import { signup } from "@backend/actions/auth/auth-actions";
import Link from "next/link";
import Image from "next/image"; 
import { Loader2, Mail, Calendar, Lock } from "lucide-react"; 
import { useRouter } from "next/navigation"; 
import { toast } from "sonner"; 
import { signupSchema } from "@/lib/schemas"; 

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
        } else if (response?.success) {
            toast.success("Account created successfully!");
            router.push("/privacy-pledge");
        }
      } catch (error) {
        setFieldErrors({ server: "Something went wrong. Please try again." });
        toast.error("Something went wrong.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-8">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">

        {/* Header & Logo */}
        <div className="text-center mb-8">
          {/* 👇 Reduced margin-bottom from mb-6 to mb-1 */}
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
          
          {/* 👇 Updated Text to "Join ROVE" */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join ROVE
          </h1>
          <p className="text-sm text-gray-500">
            Start your cycle-sync journey today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5" noValidate>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block pl-1">
              Email
            </label>
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
              <p className="text-xs text-red-500 pl-1 font-medium">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block pl-1">
              Age
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar size={18} />
                </div>
                <input
                  name="age"
                  type="number"
                  placeholder="25"
                  className={`w-full pl-12 pr-5 py-3.5 rounded-xl bg-gray-50 text-gray-900 border outline-none transition-all placeholder:text-gray-400
                    ${fieldErrors.age
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    }`}
                />
            </div>
            {fieldErrors.age ? (
              <p className="text-xs text-red-500 pl-1 font-medium">
                {fieldErrors.age}
              </p>
            ) : (
                <p className="text-xs text-gray-400 pl-1">Must be 13+</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block pl-1">
              Password
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  // 3. Controlled Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-5 py-3.5 rounded-xl bg-gray-50 text-gray-900 border outline-none transition-all placeholder:text-gray-400
                    ${fieldErrors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    }`}
                />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 pl-1 font-medium">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* 4. Conditional Rendering for Confirm Password */}
          {password.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-gray-700 block pl-1">
                Confirm Password
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                    </div>
                    <input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-5 py-3.5 rounded-xl bg-gray-50 text-gray-900 border outline-none transition-all placeholder:text-gray-400
                        ${fieldErrors.confirmPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                        }`}
                    />
                </div>
                {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 pl-1 font-medium">
                    {fieldErrors.confirmPassword}
                </p>
                )}
            </div>
          )}

          {/* Server Error Message */}
          {fieldErrors.server && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center">
              {fieldErrors.server}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-300 via-rose-100 to-rose-400 text-gray-900 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isPending ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                </span>
            ) : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-rose-500 font-semibold hover:underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}