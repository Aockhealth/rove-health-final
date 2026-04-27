"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function GlobalLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fast fade-out after the JS bundle hydrates
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      id="global-loader"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FDFBF7] grain-overlay transition-opacity duration-[800ms]"
      style={{ opacity: loading ? 1 : 0 }}
    >
      <div className="relative flex flex-col items-center">
        {/* Soft rotating pulse ring */}
        <div className="absolute -inset-4 rounded-full border border-rove-charcoal/10 animate-[spin_4s_linear_infinite]" />
        
        {/* Center Orb */}
        <div className="h-20 w-20 relative flex items-center justify-center rounded-full bg-white/80 shadow-lg shadow-rove-charcoal/5 backdrop-blur-xl animate-pulse">
            <div className="absolute inset-0 rounded-full border border-[#D35400]/30 animate-[spin_2s_linear_infinite]" style={{ borderTopColor: '#D35400' }}></div>
            <div className="h-10 w-10 relative opacity-90 saturate-150">
              <Image
                  src="/images/rove_icon_transparent.png"
                  alt="Loading Rove"
                  fill
                  priority
                  className="object-contain"
                  unoptimized
              />
            </div>
        </div>
        
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.25em] text-rove-stone/70 animate-pulse">
            Syncing your rhythm
        </p>
      </div>
    </div>
  );
}
