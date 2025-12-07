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
                    <h1 className="font-heading text-4xl md:text-7xl tracking-tight mb-6 md:mb-8 leading-[1.05] text-rove-charcoal">
                        The world was built for <span className="italic text-rove-stone font-light">men.</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-rove-charcoal/70 font-light leading-relaxed mb-8 md:mb-10 max-w-xl mx-auto">
                        Medical research, diet plans, and work schedules all assume you are the same person every day. <br /><span className="font-medium text-rove-charcoal mt-2 block">But you're not.</span>
                    </p>
                    <Button size="lg" className="w-full md:w-auto rounded-full px-10 h-14 text-lg shadow-xl shadow-rove-red/5 hover:shadow-rove-red/10 bg-rove-charcoal text-white hover:bg-rove-charcoal/90 transition-all" asChild>
                        <Link href={isLoggedIn ? "/cycle-sync" : "/signup"}>
                            {isLoggedIn ? "Go to Dashboard" : "Get Started Now"}
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
