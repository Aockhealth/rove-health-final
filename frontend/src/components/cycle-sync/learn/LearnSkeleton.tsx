"use client";

export default function LearnSkeleton() {
    return (
        <div className="relative min-h-screen bg-white text-rove-charcoal pb-4 animate-pulse">
            {/* Hero Skeleton */}
            <div className="relative h-[70vh] w-full bg-neutral-200 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 md:p-16 pb-12 w-full md:w-2/3 space-y-4">
                    <div className="h-5 w-28 bg-white/30 rounded-md" />
                    <div className="h-12 w-72 bg-white/20 rounded-lg" />
                    <div className="h-4 w-56 bg-white/15 rounded-md" />
                    <div className="flex gap-3 pt-4">
                        <div className="h-12 w-36 bg-white/20 rounded-lg" />
                        <div className="h-12 w-28 bg-white/10 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Content Row Skeletons */}
            <div className="relative z-10 -mt-10 space-y-10 pt-4">
                {[1, 2, 3].map((row) => (
                    <div key={row} className="pl-4 md:pl-8">
                        <div className="h-6 w-40 bg-neutral-200 rounded-md mb-4" />
                        <div className="flex gap-4 overflow-hidden pb-4">
                            {[1, 2, 3, 4].map((card) => (
                                <div
                                    key={card}
                                    className="min-w-[200px] w-[200px] md:min-w-[260px] md:w-[260px] shrink-0"
                                >
                                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-200 mb-3">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
