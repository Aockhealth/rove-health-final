"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Unhandled error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] px-6 text-center">
            <div className="w-full max-w-md">
                <div className="text-6xl mb-6">😔</div>
                <h2 className="text-2xl font-heading text-rove-charcoal mb-3">
                    Something went wrong
                </h2>
                <p className="text-sm text-rove-stone mb-8 leading-relaxed">
                    We hit a bump. This has been noted and we&apos;re looking into it.
                    Try refreshing or going back.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        onClick={reset}
                        className="rounded-full bg-rove-charcoal text-white px-8 py-3"
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => (window.location.href = "/")}
                        className="rounded-full px-8 py-3"
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
