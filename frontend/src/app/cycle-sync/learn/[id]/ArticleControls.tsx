"use client";

import { useEffect, useState } from "react";
import { Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ArticleControls({ title }: { title: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      // Small optimization to avoid layout thrashing
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
          setScrollProgress(Number((currentScrollY / scrollHeight).toFixed(3)) * 100);
        } else {
          setScrollProgress(0);
        }
      });
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll(); // initial check
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[100] pointer-events-none">
        <div 
          className="h-full bg-phase-menstrual shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Share Button */}
      <AnimatePresence>
        {scrollProgress > 5 && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={handleShare}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-xl border border-phase-menstrual/10 px-5 py-3 rounded-full text-neutral-700 hover:text-phase-menstrual hover:border-phase-menstrual/30 transition-all font-bold text-sm group"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {copied ? "Copied!" : "Share"}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
