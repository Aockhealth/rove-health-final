"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export function InstallPrompt() {
  const [isReadyForInstall, setIsReadyForInstall] = useState(false);
  const [isIOSPrompt, setIsIOSPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    if (localStorage.getItem("pwa-install-dismissed") === "true") {
      setIsDismissed(true);
      return;
    }

    // Detect if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true;
                             
    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIOSDevice) {
      setIsIOSPrompt(true);
      setIsReadyForInstall(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsReadyForInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If app is installed, we don't need the prompt
    window.addEventListener("appinstalled", () => {
      setIsReadyForInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsReadyForInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!isReadyForInstall || isDismissed) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-white border border-rove-peach shadow-lg rounded-2xl p-4 z-50 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-rove-peach/20 p-2 rounded-xl text-rove-orange flex-shrink-0">
        <Download className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-rove-charcoal font-outfit">Install Rove Health</h3>
        
        {isIOSPrompt ? (
          <div className="text-xs text-rove-charcoal/80 mt-1 space-y-2">
            <p>Install this app on your iPhone or iPad for the best experience:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1 text-rove-charcoal/90 font-medium">
              <li className="flex items-center gap-1">Tap the <Share className="w-3.5 h-3.5 inline text-blue-500" /> Share button below</li>
              <li className="flex items-center gap-1">Select <PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen</li>
            </ol>
          </div>
        ) : (
          <>
            <p className="text-xs text-rove-charcoal/70 mt-1 mb-3">
              Get the full native app experience with offline access and easy access from your home screen.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full bg-rove-orange hover:bg-rove-orange/90 text-white text-sm font-medium py-2 rounded-xl transition-colors"
            >
              Install App
            </button>
          </>
        )}
      </div>
      <button 
        onClick={handleDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
