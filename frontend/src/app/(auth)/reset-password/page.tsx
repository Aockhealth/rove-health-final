"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function ResetPasswordPage() {
    const [status, setStatus] = useState("Verifying reset session...");
    const [newPassword, setNewPassword] = useState("");
    const [done, setDone] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const supabase = createClient();

    const getHashParams = () => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return {
            access_token: params.get("access_token"),
            refresh_token: params.get("refresh_token"),
            type: params.get("type"),
        };
    };

    useEffect(() => {
        const handleResetSession = async () => {
            try {
                const hashParams = getHashParams();
                const searchParams = new URLSearchParams(window.location.search);
                const code = searchParams.get('code');

                if (hashParams.type === "recovery" && hashParams.access_token) {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: hashParams.access_token,
                        refresh_token: hashParams.refresh_token || "",
                    });

                    if (error) {
                        setStatus("Invalid or expired reset link.");
                        return;
                    }

                    setStatus("Reset link verified. Enter your new password.");
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setStatus("No valid reset session found. Please request a new reset link.");
                    return;
                }

                setStatus("Reset link verified. Enter your new password.");
            } catch (err) {
                setStatus("An error occurred. Please try again.");
            }
        };

        handleResetSession();
    }, []);

    const handleReset = async () => {
        if (newPassword.length < 6) {
            setStatus("Password must be at least 6 characters.");
            return;
        }

        setIsUpdating(true);
        setStatus("Updating password...");

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            setStatus("Failed to update password. Try again.");
            setIsUpdating(false);
            return;
        }

        setDone(true);
        setStatus("Password reset successful! Redirecting to dashboard...");

        setTimeout(() => {
            router.push("/cycle-sync");
        }, 2000);
    };

    const isVerified = status.includes("Enter your new password");
    const isError = status.includes("Invalid") || status.includes("No valid") || status.includes("Failed");

    return (
        <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-rove-cream grain-overlay px-5">
            {/* Organic Ambient Blobs from globals.css */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="blob-glow-red opacity-20" />
                <div className="blob-glow-peach opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="glass-panel border-none shadow-2xl">
                    <CardHeader className="text-center pt-8">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rove-charcoal/5">
                            <Lock className="h-6 w-6 text-rove-charcoal" />
                        </div>
                        <CardTitle className="text-3xl">Secure Reset</CardTitle>
                        <CardDescription className="text-rove-stone mt-2">
                            {done ? "Security update complete" : "Update your account credentials"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pb-8">
                        {/* Status Message */}
                        <div className={`text-center py-2 px-4 rounded-xl text-sm font-medium transition-colors ${isError ? "bg-red-50 text-red-600 border border-red-100" :
                            done ? "bg-green-50 text-green-600 border border-green-100" : "text-rove-stone"
                            }`}>
                            {status}
                        </div>

                        <AnimatePresence mode="wait">
                            {!done && isVerified && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-4"
                                >
                                    <div className="group relative">
                                        <input
                                            type="password"
                                            placeholder="New password (min. 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full rounded-2xl border border-rove-stone/20 bg-white/50 px-5 py-4 text-rove-charcoal placeholder:text-rove-stone/50 focus:border-rove-charcoal focus:outline-none focus:ring-4 focus:ring-rove-charcoal/5 transition-all"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleReset}
                                        disabled={isUpdating || newPassword.length < 6}
                                        className="w-full py-7 text-base rounded-2xl shadow-xl shadow-rove-charcoal/20"
                                    >
                                        {isUpdating ? "Processing..." : "Update Password"}
                                        {!isUpdating && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>
                                </motion.div>
                            )}

                            {done && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-4"
                                >
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="text-rove-charcoal font-medium">Redirecting to dashboard...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Troubleshooting Section */}
                        {!done && (
                            <div className="pt-6 border-t border-rove-stone/10">
                                <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-widest text-rove-stone">
                                    <AlertCircle className="h-3 w-3" />
                                    Troubleshooting
                                </div>
                                <ul className="space-y-2">
                                    {["Click the link directly from your email", "Links expire after 24 hours", "Try a private/incognito window"].map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-rove-stone/80">
                                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rove-stone/40" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    );
}