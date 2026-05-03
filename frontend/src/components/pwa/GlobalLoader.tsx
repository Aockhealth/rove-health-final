"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function GlobalLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Trigger loader on route change
    setLoading(true);
    
    // Fast fade-out after navigation
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div
      id="global-loader"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FDFBF7] grain-overlay transition-opacity duration-[800ms]"
      style={{ opacity: loading ? 1 : 0 }}
    >
      <div className="relative flex flex-col items-center">
        {/* Soft rotating pulse ring */}
        <div className="absolute -inset-8 rounded-[3rem] border border-rove-charcoal/5 animate-[spin_6s_linear_infinite]" />
        
        {/* Center Logo */}
        <div className="h-16 w-40 sm:w-48 relative flex items-center justify-center bg-white/40 shadow-xl shadow-rove-charcoal/5 backdrop-blur-xl rounded-2xl p-4 animate-pulse">
            <div className="absolute inset-0 rounded-2xl border border-[#D35400]/20" />
            <div className="h-full w-full relative opacity-90 saturate-150">
              <Image
                  src="/images/rove_logo_final.png"
                  alt="Loading Rove"
                  fill
                  priority
                  className="object-contain"
                  unoptimized
              />
            </div>
        </div>
        
        <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.25em] text-rove-stone/70 animate-pulse">
            Syncing your rhythm
        </p>
      </div>
    </div>
  );
}
