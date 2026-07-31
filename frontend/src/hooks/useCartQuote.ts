"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { quoteCart } from "@/app/cart/actions";

export interface CartQuote {
  subtotal: number;
  total: number;
  discount: number;
}

/**
 * The cart's real total, straight from Shopify — the only place an automatic
 * discount like the 3-bottle bundle exists.
 *
 * Returns null until the quote for the *current* cart lands, and if it never
 * does, so callers fall back to the locally-summed subtotal instead of showing
 * a total of zero. The quote is stamped with the cart it was priced for, so
 * changing quantity can't briefly show the previous quantity's discount.
 */
export function useCartQuote(): CartQuote | null {
  const { lines } = useCart();
  const cartKey = lines.map((line) => `${line.handle}:${line.quantity}`).join(",");
  const [quoted, setQuoted] = useState<{ key: string; quote: CartQuote | null } | null>(null);

  useEffect(() => {
    if (!cartKey) return;

    let cancelled = false;
    quoteCart(lines.map((line) => ({ handle: line.handle, quantity: line.quantity })))
      .then((result) => {
        if (!cancelled) setQuoted({ key: cartKey, quote: result });
      })
      .catch(() => {
        if (!cancelled) setQuoted({ key: cartKey, quote: null });
      });

    return () => {
      cancelled = true;
    };
  }, [cartKey, lines]);

  return cartKey && quoted?.key === cartKey ? quoted.quote : null;
}
