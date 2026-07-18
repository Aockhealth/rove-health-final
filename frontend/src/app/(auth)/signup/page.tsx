"use client";

import { useEffect, useState, useTransition } from "react";
import { signup, verifySignupOtp, resendSignupOtp } from "../actions";
import Link from "next/link";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

type FieldErrors = {
  [key: string]: string | undefined;
};

const RESEND_COOLDOWN_SECONDS = 30;

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationEmailSentTo, setVerificationEmailSentTo] = useState<string | null>(null);

  // 1. Add state to track password input
  const [password, setPassword] = useState("");

  // OTP verification state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, startVerifying] = useTransition();
  const [isResending, startResending] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function onVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOtpError(null);

    if (!verificationEmailSentTo) return;

    if (otp.length < 6 || otp.length > 8 || !/^\d+$/.test(otp)) {
      setOtpError("Please enter the verification code sent to your email.");
      return;
    }

    startVerifying(async () => {
      try {
        const response = await verifySignupOtp(verificationEmailSentTo, otp);

        if (response?.ok) {
          setSuccessMessage("Account verified! Loading...");
          router.replace(response.nextRoute || "/privacy-pledge");
        } else {
          setOtpError(response?.error || "Invalid or expired code. Please try again.");
        }
      } catch {
        setOtpError("Something went wrong. Please try again.");
      }
    });
  }

  function onResendOtp() {
    if (!verificationEmailSentTo || resendCooldown > 0) return;
    setResendMessage(null);
    setOtpError(null);

    startResending(async () => {
      try {
        const response = await resendSignupOtp(verificationEmailSentTo);
        if (response?.ok) {
          setResendMessage(response.message || "A new code has been sent to your email.");
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } else {
          setOtpError(response?.error || "Could not resend the code. Please try again.");
        }
      } catch {
        setOtpError("Something went wrong. Please try again.");
      }
    });
  }

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

        if (response?.code === "EMAIL_VERIFICATION_REQUIRED") {
          setVerificationEmailSentTo(email);
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } else if (response?.error) {
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

  if (verificationEmailSentTo) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-rove-cream px-4 py-8 overflow-hidden grain-overlay">
        {/* Decorative Layer - Static for performance */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-10 w-64 h-64 bg-phase-menstrual/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-phase-follicular/20 rounded-full blur-[80px]" />
        </div>

        {/* Static Card */}
        <div className="w-full max-w-md bg-white/90 p-8 md:p-10 relative z-20 rounded-[2rem] border border-rove-charcoal/5 shadow-xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-phase-follicular/10 rounded-full flex items-center justify-center text-phase-follicular border border-phase-follicular/20">
              <Mail size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-heading text-rove-charcoal mb-4 tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-rove-stone font-medium mb-6 leading-relaxed">
            We have sent a verification code to<br />
            <span className="font-bold text-rove-charcoal">{verificationEmailSentTo}</span>.<br />
            Enter it below to activate your account.
          </p>

          <form onSubmit={onVerifyOtp} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rove-stone/60">
                  <ShieldCheck size={18} />
                </div>
                <input
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="00000000"
                  className={`w-full pl-12 pr-5 py-3.5 rounded-2xl bg-rove-cream/50 text-rove-charcoal border outline-none transition-all placeholder:text-rove-stone/30 font-semibold text-center text-2xl tracking-[0.5em]
                      ${otpError
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                      : "border-transparent focus:border-rove-charcoal/20 focus:bg-white focus:ring-4 focus:ring-rove-charcoal/5"
                    }`}
                />
              </div>
              {otpError && (
                <p className="text-xs text-red-500 pl-1 font-medium mt-1">{otpError}</p>
              )}
            </div>

            {resendMessage && (
              <div className="p-3 rounded-2xl bg-green-50/80 text-green-700 text-sm font-medium border border-green-100 flex items-center justify-center text-center transition-opacity duration-300">
                {resendMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-2xl bg-green-50/80 text-green-700 text-sm font-medium border border-green-100 flex items-center justify-center text-center transition-opacity duration-300">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isVerifying || !!successMessage}
              className="w-full py-4 h-auto rounded-full bg-rove-charcoal text-rove-cream font-semibold text-base shadow-md hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                </span>
              ) : "Verify Email"}
            </Button>
          </form>

          <div className="space-y-3 mt-4">
            <button
              type="button"
              onClick={onResendOtp}
              disabled={isResending || resendCooldown > 0}
              className="w-full py-2 text-sm font-semibold text-rove-stone hover:text-rove-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend code"}
            </button>
            <Link
              href="/login"
              className="w-full block py-2 text-sm font-semibold text-rove-stone hover:text-rove-charcoal transition-all underline underline-offset-4 decoration-rove-stone/30"
            >
              Back to Log In
            </Link>
          </div>
        </div>
      </div>
    );
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
                src="/images/rove_logo_final.png"
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
