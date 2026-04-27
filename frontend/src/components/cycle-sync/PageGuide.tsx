"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageGuideProps {
    pageKey: string;
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

export default function PageGuide({ pageKey, icon: Icon, title, description, className }: PageGuideProps) {
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if the user hasn't dismissed it
        const hasDismissed = localStorage.getItem(`rove-guide-dismissed-${pageKey}`);
        if (!hasDismissed) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
        setMounted(true);
    }, [pageKey]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(`rove-guide-dismissed-${pageKey}`, "true");
    };

    // Prevent hydration mismatch
    if (!mounted && !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={cn("mx-4 mt-4 mb-2 overflow-hidden", className)}
                >
                    <div className="relative rounded-2xl bg-white border border-gray-200/80 p-4 shadow-sm flex items-start gap-3.5">

                        {/* Icon Container */}
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-rove-charcoal/5 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-rove-charcoal" strokeWidth={1.8} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pr-6 pt-0.5">
                            <h4 className="text-sm font-bold text-rove-charcoal mb-0.5">
                                {title}
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        {/* Dismiss Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-rove-charcoal transition-colors group"
                            aria-label="Dismiss guide"
                        >
                            <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
