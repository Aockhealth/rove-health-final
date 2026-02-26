"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Detect if the app is already installed/standalone
        const checkStandalone = () => {
            return (
                window.matchMedia("(display-mode: standalone)").matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes("android-app://")
            );
        };

        if (checkStandalone()) {
            setIsStandalone(true);
            return;
        }

        // Detect iOS for specific "Add to Home Screen" instructions
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Listen for the beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the custom install prompt
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Show prompt for iOS users after a delay if not installed
        if (isIosDevice && !checkStandalone()) {
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setShowPrompt(false);
        }

        // We no longer need the prompt. Clear it up.
        setDeferredPrompt(null);
    };

    if (isStandalone || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:w-96"
            >
                <div className="bg-white/95 backdrop-blur-xl border border-rove-stone/20 rounded-2xl p-4 shadow-2xl flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50">
                        <img src="/icons/icon-192x192.png" alt="Rove" className="w-8 h-8 rounded-lg" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-rove-charcoal tracking-tight mb-1">Install Rove Health</h3>

                        {isIOS ? (
                            <p className="text-xs text-rove-stone leading-relaxed mb-3">
                                Tap the <span className="font-bold">Share</span> icon below and select <span className="font-bold">Add to Home Screen</span> to install the app.
                            </p>
                        ) : (
                            <p className="text-xs text-rove-stone leading-relaxed mb-3">
                                Install Rove on your home screen for quick access and a full-screen experience.
                            </p>
                        )}

                        {!isIOS && (
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-rove-charcoal text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-black transition-colors"
                            >
                                Install App
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowPrompt(false)}
                        className="w-6 h-6 rounded-full bg-rove-stone/10 flex items-center justify-center text-rove-stone hover:bg-rove-stone/20 transition-colors absolute top-3 right-3 shrink-0"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
