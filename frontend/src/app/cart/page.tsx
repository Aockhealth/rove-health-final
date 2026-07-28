"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { createShopifyCheckout } from "./actions";

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const checkoutUrl = await createShopifyCheckout(
        lines.map((l) => ({ handle: l.handle, quantity: l.quantity }))
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      setCheckoutError("Failed to initiate checkout. Please try again or contact support.");
      setIsCheckingOut(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-sans font-semibold tracking-tight text-3xl text-obsidian">Your cart is empty</h1>
        <p className="mt-3 font-sans text-sm text-obsidian/70">
          Balance is waiting for you.
        </p>
        <div className="mt-8">
          <Button href="/shop">Shop the System</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="font-sans font-semibold tracking-tight text-4xl text-obsidian">Your Cart</h1>

      <div className="mt-10 divide-y divide-obsidian/20">
        {lines.map((line) => (
          <div key={line.handle} className="flex items-center gap-5 py-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
              <Image src={line.image} alt={line.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="font-sans font-semibold tracking-tight text-xl text-obsidian">{line.title}</h2>
              <p className="mt-1 font-sans text-sm text-obsidian/60">
                ₹{line.price} × {line.quantity}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(line.handle, line.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-obsidian/30 text-obsidian"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-label text-sm">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(line.handle, line.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-obsidian/30 text-obsidian"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Remove item"
              onClick={() => removeItem(line.handle)}
              className="text-obsidian/40 hover:text-obsidian"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-obsidian/20 pt-6">
        <span className="font-label text-sm uppercase tracking-wide text-obsidian/60">
          Subtotal
        </span>
        <span className="font-sans font-semibold tracking-tight text-2xl text-obsidian">₹{subtotal}</span>
      </div>

      <div className="mt-8">
        <Button 
          size="lg" 
          className="w-full" 
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            "Checkout"
          )}
        </Button>
        {checkoutError && (
          <p className="mt-3 text-center font-sans text-sm text-red-500">
            {checkoutError}
          </p>
        )}
        <p className="mt-3 text-center font-sans text-xs text-obsidian/50">
          Secure checkout powered by Shopify.
        </p>
      </div>
    </div>
  );
}
