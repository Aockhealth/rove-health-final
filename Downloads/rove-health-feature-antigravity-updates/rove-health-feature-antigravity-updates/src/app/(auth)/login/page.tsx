"use client";

import { useTransition } from "react";
import { login } from "../actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();

    function onSubmit(formData: FormData) {
        startTransition(async () => {
            await login(formData);
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20 relative p-4">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-rove-green/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 -left-20 w-[300px] h-[300px] bg-rove-red/5 rounded-full blur-[80px]" />
            </div>

            <div className="w-full max-w-md bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-rove-stone/10 border border-white/50 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rove-charcoal text-white mb-4 shadow-lg shadow-rove-charcoal/20">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h1 className="font-heading text-3xl text-rove-charcoal mb-2">Welcome Back</h1>
                    <p className="text-rove-stone text-sm">Continue your cycle sync journey</p>
                </div>

                <form action={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-rove-stone pl-1">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-rove-stone/10 focus:border-rove-charcoal focus:ring-0 transition-all outline-none text-rove-charcoal placeholder:text-rove-stone/30"
                            placeholder="hello@rove.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-rove-stone pl-1">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-rove-stone/10 focus:border-rove-charcoal focus:ring-0 transition-all outline-none text-rove-charcoal placeholder:text-rove-stone/30"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-2xl py-6 text-base shadow-xl shadow-rove-charcoal/10 hover:shadow-rove-charcoal/20 transition-all"
                        disabled={isPending}
                    >
                        {isPending ? "Logging in..." : "Log In"}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-rove-stone/70">
                        New to Rove?{" "}
                        <Link href="/signup" className="text-rove-charcoal font-bold hover:underline decoration-rove-green decoration-2 underline-offset-4">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
