"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [status, setStatus] = useState("Verifying reset session...");
    const [newPassword, setNewPassword] = useState("");
    const [done, setDone] = useState(false);
    const [debug, setDebug] = useState<string[]>([]);
    const router = useRouter();

    // Use the SSR-compatible browser client (cookie-based)
    const supabase = createClient();

    const log = (msg: string, data?: any) => {
        const line =
            new Date().toISOString() +
            " :: " +
            msg +
            (data ? " - " + JSON.stringify(data) : "");
        console.log(line);
        setDebug((prev) => [...prev, line]);
    };

    // Extract token from URL hash
    const getHashParams = () => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return {
            access_token: params.get("access_token"),
            refresh_token: params.get("refresh_token"),
            type: params.get("type"),
        };
    };

    // On mount: handle the password reset token from URL
    useEffect(() => {
        log("---- Reset Password Page Loaded ----");
        log("Current URL:", window.location.href);

        const handleResetSession = async () => {
            try {
                // Check if we're coming from a reset email (has hash parameters - implicit flow)
                const hashParams = getHashParams();
                log("Hash params:", hashParams);

                // Check for code in query parameters (PKCE flow)
                const searchParams = new URLSearchParams(window.location.search);
                const code = searchParams.get('code');
                log("Code from query params:", code);

                if (hashParams.type === "recovery" && hashParams.access_token) {
                    log("Recovery token found in URL hash (implicit flow)");

                    // Exchange the recovery token for a session
                    const { data, error } = await supabase.auth.setSession({
                        access_token: hashParams.access_token,
                        refresh_token: hashParams.refresh_token || "",
                    });

                    if (error) {
                        log("Error setting session from hash:", error);
                        setStatus("Invalid or expired reset link.");
                        return;
                    }

                    log("Session set successfully from hash");
                    setStatus("Reset link verified. Enter your new password.");
                    return;
                }

                if (code) {
                    log("Code found - exchanging for session (PKCE flow)");

                    // Exchange the PKCE code for a session using the browser client
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                    if (error) {
                        log("Error exchanging code:", error);
                        setStatus("Invalid or expired reset link. Please request a new one.");
                        return;
                    }

                    log("Code exchanged successfully:", data);

                    // Clean up the URL (remove the code parameter)
                    window.history.replaceState({}, '', '/reset-password');

                    setStatus("Reset link verified. Enter your new password.");
                    return;
                }

                // Check if user already has an active session
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                log("Current session:", session);

                if (!session) {
                    setStatus(
                        "No valid reset session found. Please request a new reset link."
                    );
                    return;
                }

                setStatus("Reset link verified. Enter your new password.");
            } catch (err) {
                log("Unexpected error:", err);
                setStatus("An error occurred. Please try again.");
            }
        };

        handleResetSession();
    }, []);

    // Handle password update
    const handleReset = async () => {
        if (newPassword.length < 6) {
            setStatus("Password must be at least 6 characters.");
            return;
        }

        setStatus("Updating password...");

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            log("Password update failed", error);
            setStatus("Failed to update password. Try again.");
            return;
        }

        log("Password update success", data);
        setDone(true);
        setStatus("Password reset successful! Redirecting...");

        // Optional: Sign out after password reset
        await supabase.auth.signOut();

        // Redirect to login page after a delay
        setTimeout(() => {
            router.push("/login");
        }, 2000);
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

            <p className="mb-4">{status}</p>

            {!done && status.includes("Enter your new password") && (
                <div className="flex flex-col gap-4 mb-4">
                    <input
                        type="password"
                        placeholder="New password (min. 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border px-3 py-2 rounded"
                    />
                    <button
                        onClick={handleReset}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Update Password
                    </button>
                </div>
            )}

            {done && (
                <div className="mt-4 text-green-600">
                    Password reset successful! Redirecting to login...
                </div>
            )}

            <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">
                    Troubleshooting tips:
                </p>
                <ul className="text-sm text-gray-600 list-disc pl-5 mb-4">
                    <li>Make sure you clicked the link from your email</li>
                    <li>The link expires after 24 hours</li>
                    <li>Try opening the link in a new browser window</li>
                </ul>
            </div>

            <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-400">
                    Debug Info
                </summary>
                <pre className="text-xs bg-black text-green-400 p-3 rounded mt-2 max-h-64 overflow-auto">
                    {debug.join("\n")}
                </pre>
            </details>
        </div>
    );
}
