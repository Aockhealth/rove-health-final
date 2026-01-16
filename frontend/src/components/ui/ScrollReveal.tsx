"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    variant?: "fade-up" | "scale" | "fade-in";
    delay?: number;
    duration?: number;
}

export function ScrollReveal({
    children,
    className,
    variant = "fade-up",
    delay = 0,
    duration = 0.6
}: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    const variants = {
        "fade-up": {
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 }
        },
        "scale": {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 }
        },
        "fade-in": {
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
        }
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}
