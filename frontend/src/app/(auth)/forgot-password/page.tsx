"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/schemas";

type FieldErrors = {
    [key: string]: string | undefined;
};

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFieldErrors({});
        setServerError(null);
        setSuccess(false);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const result = forgotPasswordSchema.safeParse(data);

        if (!result.success) {
            const formattedErrors: FieldErrors = {};
            result.error.issues.forEach((issue) => {
                formattedErrors[issue.path[0].toString()] = issue.message;
            });
            setFieldErrors(formattedErrors);
            return;
        }

        const email = result.data.email;

        startTransition(async () => {
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
                });

                if (error) {
                    setServerError(error.message);
                } else {
                    setSuccess(true);
                }
            } catch (err) {
                setServerError("Something went wrong. Please try again.");
            }
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-1">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 opacity-90 drop-shadow-sm">
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

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Reset Password
                    </h1>
                    <p className="text-sm text-gray-500">
                        Enter your email to receive a reset link
                    </p>
                </div>

                {success ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-2">Check your email</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                We've sent a password reset link to your email address.
                            </p>
                            <Link href="/login">
                                <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                                    Back to Log in
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-5" noValidate>
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

                        {serverError && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center gap-2">
                                <AlertCircle size={16} />
                                {serverError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-300 via-rose-100 to-rose-400 text-gray-900 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Sending Link...
                                </span>
                            ) : "Send Reset Link"}
                        </Button>

                        <div className="text-center mt-6">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to Log in
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}