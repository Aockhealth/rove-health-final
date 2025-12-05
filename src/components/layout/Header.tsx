"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rove-stone/10">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="font-heading text-2xl font-bold text-rove-charcoal tracking-tight">
                    ROVE HEALTH
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/our-science" className="text-sm font-medium text-rove-stone hover:text-rove-charcoal transition-colors">
                        Our Science
                    </Link>
                    <Link href="/ingredients" className="text-sm font-medium text-rove-stone hover:text-rove-charcoal transition-colors">
                        Ingredients
                    </Link>
                    <Link href="#" className="text-sm font-medium text-rove-stone hover:text-rove-charcoal transition-colors">
                        Shop
                    </Link>
                </nav>

                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        Sign In
                    </Button>
                    <Button size="sm" className="hidden sm:flex">
                        Get Started
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-rove-charcoal"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-rove-stone/10 overflow-hidden"
                    >
                        <nav className="flex flex-col p-6 space-y-4">
                            <Link
                                href="/our-science"
                                className="text-lg font-medium text-rove-charcoal py-2 border-b border-rove-stone/5"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Our Science
                            </Link>
                            <Link
                                href="/ingredients"
                                className="text-lg font-medium text-rove-charcoal py-2 border-b border-rove-stone/5"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Ingredients
                            </Link>
                            <Link
                                href="#"
                                className="text-lg font-medium text-rove-charcoal py-2 border-b border-rove-stone/5"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Shop
                            </Link>
                            <div className="pt-4 flex flex-col space-y-3">
                                <Button variant="outline" className="w-full justify-center">
                                    Sign In
                                </Button>
                                <Button className="w-full justify-center">
                                    Get Started
                                </Button>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
