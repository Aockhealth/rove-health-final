"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInterface } from "./ChatInterface";
import { cn } from "@/lib/utils";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDocked, setIsDocked] = useState(false);

    return (
        <>
            {/* Floating Action Button / Docked Handle */}
            <AnimatePresence mode="wait">
                {!isDocked ? (
                    <motion.div
                        key="active-widget"
                        className="fixed bottom-28 right-5 md:bottom-8 md:right-8 z-[75]"
                        initial={{ scale: 0, x: 100 }}
                        animate={{ scale: 1, x: 0 }}
                        exit={{ scale: 0, x: 100 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                            // If swiped right enough, dock it
                            if (info.offset.x > 50) {
                                setIsDocked(true);
                            }
                        }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                        <Button
                            onClick={() => setIsOpen(!isOpen)}
                            size="icon"
                            className={cn(
                                "w-12 h-12 rounded-full shadow-2xl transition-all duration-300 relative touch-none",
                                isOpen
                                    ? "bg-rove-stone text-white rotate-90"
                                    : "bg-gradient-to-tr from-rove-charcoal to-rove-stone text-white hover:scale-110 active:scale-95"
                            )}
                        >
                            {isOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <>
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-rove-red rounded-full border-2 border-white" />
                                </>
                            )}
                        </Button>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            <span className="text-[10px] text-gray-400">Swipe right to hide</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="docked-handle"
                        className="fixed bottom-28 -right-2 md:bottom-8 md:-right-2 z-[75] cursor-pointer group"
                        initial={{ x: 50 }}
                        animate={{ x: 0 }}
                        exit={{ x: 50 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                            // If swiped left enough, restore it
                            if (info.offset.x < -20) {
                                setIsDocked(false);
                            }
                        }}
                        onClick={() => setIsDocked(false)}
                    >
                        <div className="w-4 h-16 bg-rove-stone/20 backdrop-blur-md rounded-l-xl border-y border-l border-white/20 flex items-center justify-center group-hover:bg-rove-stone/40 transition-colors">
                            <div className="w-1 h-8 bg-white/40 rounded-full" />
                        </div>
                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                            <span className="bg-rove-stone text-white px-2 py-1 rounded-md text-[10px] shadow-lg">Swipe left to restore</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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

