import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Note: I need to install class-variance-authority and @radix-ui/react-slot
// I'll add them to the install list or just install them now.
// Actually, for now I can implement a simpler button without CVA if I don't want extra deps,
// but CVA is standard for this stack. I'll stick to simple props for now to avoid more installs unless needed.
// Wait, the user didn't ask for shadcn/ui specifically, just "luxury components".
// I'll build a custom one using clsx/tailwind-merge.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    size?: "sm" | "md" | "lg" | "icon";
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rove-stone disabled:pointer-events-none disabled:opacity-50";

        const variants = {
            primary: "bg-rove-charcoal text-rove-cream hover:bg-rove-charcoal/90 shadow-sm",
            secondary: "bg-rove-cream text-rove-charcoal hover:bg-rove-cream/80 shadow-sm border border-rove-stone/20",
            outline: "border border-rove-stone/40 bg-transparent hover:bg-rove-stone/10 text-rove-charcoal",
            ghost: "hover:bg-rove-stone/10 text-rove-charcoal",
            link: "text-rove-charcoal underline-offset-4 hover:underline",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-6 py-2 text-sm",
            lg: "h-12 px-8 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
