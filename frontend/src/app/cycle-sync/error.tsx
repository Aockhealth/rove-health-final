"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function CycleSyncError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Cycle Sync error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] px-6 text-center">
            <div className="w-full max-w-md">
                <div className="text-6xl mb-6">🌸</div>
                <h2 className="text-2xl font-heading text-rove-charcoal mb-3">
                    Oops, something&apos;s off
                </h2>
                <p className="text-sm text-rove-stone mb-8 leading-relaxed">
                    Your tracker hit an unexpected issue. This could be a temporary glitch — try refreshing.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        onClick={reset}
                        className="rounded-full bg-rove-charcoal text-white px-8 py-3"
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => (window.location.href = "/cycle-sync")}
                        className="rounded-full px-8 py-3"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
