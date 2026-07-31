"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

/** Matches Tailwind's `md` — the width at which the drawer stops covering the page. */
const DESKTOP = "(min-width: 768px)";

/**
 * One way to show someone their cart, resolved per screen: a slide-in drawer on
 * desktop, where the page stays visible behind it, and the full /cart page on a
 * phone, where a drawer would fill the screen anyway and lose the back button.
 */
export function useRevealCart() {
  const { openCart } = useCart();
  const router = useRouter();

  return useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia(DESKTOP).matches) {
      openCart();
      return;
    }
    router.push("/cart");
  }, [openCart, router]);
}
