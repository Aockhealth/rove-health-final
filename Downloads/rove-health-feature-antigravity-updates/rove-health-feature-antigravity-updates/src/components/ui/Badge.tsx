import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "luxury";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-rove-charcoal text-rove-cream hover:bg-rove-charcoal/80",
        secondary: "border-transparent bg-rove-cream text-rove-charcoal hover:bg-rove-cream/80",
        outline: "text-rove-charcoal border-rove-stone/40",
        luxury: "border-transparent bg-rove-red/10 text-rove-red hover:bg-rove-red/20",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-rove-stone focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
