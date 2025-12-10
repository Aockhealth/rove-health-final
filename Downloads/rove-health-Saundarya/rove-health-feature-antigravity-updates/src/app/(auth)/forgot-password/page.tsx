"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");
  const [localSuccess, setLocalSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL params for backward compatibility
  const success = searchParams.get("success") || localSuccess;
  const error = searchParams.get("error") || localError;

  // Use the SSR-compatible browser client
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setLocalError(null);

    try {
      // Call resetPasswordForEmail from the CLIENT side
      // This ensures the PKCE code_verifier is stored in the browser
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setLocalError(error.message);
      } else {
        setLocalSuccess(true);
        // Also update URL for consistency
        router.push("/forgot-password?success=true");
      }
    } catch (err) {
      setLocalError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rove-cream/20 p-4">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rove-charcoal text-white mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-3xl text-rove-charcoal mb-2">
            Reset Password
          </h1>
          <p className="text-rove-stone text-sm">
            Enter your email to receive a reset link
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-rove-green/10 border border-rove-green/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-rove-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rove-charcoal mb-1">
                  Check your email!
                </p>
                <p className="text-xs text-rove-stone">
                  We've sent you a password reset link. Click the link in the email to reset your password.
                </p>
                <p className="text-xs text-rove-stone mt-2 font-semibold">
                  ⚠️ Check your spam/junk folder if you don't see it.
                </p>
                <p className="text-xs text-rove-stone mt-2 font-semibold">
                  ⚠️ Important: Open the link in THIS browser (same window/tab).
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rove-red/10 border border-rove-red/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rove-red flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rove-charcoal">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-rove-stone pl-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@rove.com"
              className="w-full px-5 py-4 rounded-2xl bg-white border border-rove-stone/10 focus:border-rove-charcoal focus:ring-0 transition-all outline-none text-rove-charcoal placeholder:text-rove-stone/30"
            />
          </div>

          <Button className="w-full py-6 rounded-2xl shadow-xl" disabled={isPending}>
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-rove-stone">
            Remember your password?{" "}
            <a href="/login" className="text-rove-charcoal font-semibold hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}