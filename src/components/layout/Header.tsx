"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/supabase-client";


import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Header({ user }: { user: any }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    /*    const handleSignOut = async () => {
           const supabase = createClient();
           await supabase.auth.signOut();
           router.refresh(); // Refresh server components
       }; */
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Sign out error:', error.message); // log if 401 happens
        } else {
            router.push('/login'); // redirect after sign-out
        }
    };
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rove-stone/10">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="font-heading text-lg font-bold text-rove-charcoal tracking-tight flex items-center gap-2">
                    <div className="relative w-10 h-10 mix-blend-multiply">
                        <Image
                            src="/images/rove_logo_updated.png"
                            alt="Rove Health Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span>ROVE HEALTH</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    {user && (
                        <Link href="/cycle-sync" className="text-sm font-medium text-rove-stone hover:text-rove-charcoal transition-colors">
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="flex items-center space-x-4">
                    {user ? (
                        // Logged In State
                        <div className="hidden sm:flex items-center gap-4">
                            <span className="text-sm text-rove-charcoal font-medium">
                                Hi, {user.user_metadata?.full_name?.split(" ")[0] || "there"}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        // Logged Out State
                        <>
                            <Link href="/login" className="hidden sm:flex">
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup" className="hidden sm:flex">
                                <Button size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}

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
                            {user && (
                                <Link
                                    href="/cycle-sync"
                                    className="text-lg font-medium text-rove-charcoal py-2 border-b border-rove-stone/5"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            )}

                            <div className="pt-4 flex flex-col space-y-3">
                                {user ? (
                                    <Button variant="outline" className="w-full justify-center" onClick={() => {
                                        handleSignOut();
                                        setIsMobileMenuOpen(false);
                                    }}>
                                        Sign Out
                                    </Button>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full justify-center">
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full justify-center">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
