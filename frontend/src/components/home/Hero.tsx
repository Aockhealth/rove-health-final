"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { HormoneFlowBackground } from "@/components/HormoneFlowBackground";

export function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center px-6 overflow-hidden text-center">
            <HormoneFlowBackground />
            <div className="relative z-10 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Badge variant="luxury" className="mb-8 bg-white/50 backdrop-blur-sm text-rove-charcoal border-rove-charcoal/10 px-4 py-1.5 tracking-widest uppercase text-xs font-medium">
                        The New Standard
                    </Badge>
                    <h1 className="font-heading text-5xl md:text-7xl tracking-tight mb-8 leading-[1.1] text-rove-charcoal">
                        <span className="font-light block mb-2">You're not inconsistent.</span>
                        <span className="italic text-rove-red font-medium">You're cyclical.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-rove-charcoal/70 font-light leading-relaxed mb-10 max-w-xl mx-auto">
                        Stop forcing your 28-day biology into a 24-hour world.
                    </p>
                    <Button size="lg" className="w-auto rounded-full px-10 h-14 text-lg shadow-xl shadow-rove-red/5 hover:shadow-rove-red/10 bg-rove-charcoal text-white hover:bg-rove-charcoal/90 transition-all" asChild>
                        <Link href={isLoggedIn ? "/cycle-sync" : "/signup"}>
                            {isLoggedIn ? "Go to Dashboard" : "Get Started Now"}
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
