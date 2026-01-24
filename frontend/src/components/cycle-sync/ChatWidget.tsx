"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInterface } from "./ChatInterface";
import { cn } from "@/lib/utils";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Action Button */}
            <motion.div
                className="fixed bottom-40 right-6 md:bottom-10 md:right-10 z-[75]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className={cn(
                        "w-14 h-14 rounded-full shadow-2xl transition-all duration-300 relative",
                        isOpen
                            ? "bg-rove-stone text-white rotate-90"
                            : "bg-gradient-to-tr from-rove-charcoal to-rove-stone text-white hover:scale-110"
                    )}
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <>
                            <MessageCircle className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rove-red rounded-full border-2 border-white" />
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for Mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] md:hidden"
                        />

                        {/* Chat Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "fixed z-[100] overflow-hidden shadow-2xl border border-rove-stone/10 bg-white",
                                // Mobile: Full screen drawer style (but leaving space for top)
                                "inset-x-0 bottom-0 top-20 rounded-t-[2rem]",
                                // Desktop: Popover style
                                "md:inset-auto md:bottom-28 md:right-10 md:w-[400px] md:h-[600px] md:rounded-2xl md:top-auto"
                            )}
                        >
                            <ChatInterface onClose={() => setIsOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
