"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function StepIntro() {
    return (
        <section className="flex flex-col items-center justify-center space-y-8 px-1 text-center py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white/80 shadow-lg shadow-rove-charcoal/5 backdrop-blur-xl"
            >
                <div className="absolute inset-0 rounded-full border border-white/60" />
                <div className="absolute -inset-4 rounded-full border border-rove-charcoal/10" />
                <div className="relative h-16 w-16 opacity-90 drop-shadow-sm saturate-150 transition-transform duration-700 hover:scale-105">
                    <Image
                        src="/images/rove_icon_transparent.png"
                        alt="Rove Health"
                        fill
                        priority
                        className="object-contain"
                        unoptimized
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-4"
            >
                <h1 className="font-heading text-4xl font-semibold tracking-tight text-rove-charcoal sm:text-5xl">
                    Welcome to Rove
                </h1>
                <p className="mx-auto max-w-sm text-base leading-relaxed text-rove-charcoal/80">
                    Your personal health companion. We&apos;ll ask a few quick questions to tailor your experience to your unique biology.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full max-w-xs pt-4"
            >
                <div className="rounded-2xl border border-rove-charcoal/10 bg-white/60 p-4 text-xs font-semibold text-rove-charcoal/80 backdrop-blur-sm shadow-sm">
                    Takes about 2 minutes. All data is securely encrypted.
                </div>
            </motion.div>
        </section>
    );
}
