"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartQuote } from "@/hooks/useCartQuote";
import { rupees } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { createShopifyCheckout } from "@/app/cart/actions";

export function CartDrawer() {
  const { lines, subtotal, updateQuantity, removeItem, isOpen, closeCart } = useCart();
  const quote = useCartQuote();
  const discount = quote?.discount ?? 0;
  const total = quote?.total ?? subtotal;
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

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-obsidian/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-white-bone shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-obsidian/12 px-6 py-5">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-obsidian">
            Your cart
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-obsidian/70 transition-colors hover:text-obsidian"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-sans text-base font-medium text-obsidian">Your cart is empty</p>
            <p className="mt-2 font-sans text-sm text-obsidian/70">Balance is waiting for you.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-rove-lime px-6 font-sans text-sm font-medium text-obsidian transition-colors hover:bg-rove-lime-deep"
            >
              Shop the System
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y divide-obsidian/12">
                {lines.map((line) => (
                  <div key={line.handle} className="flex gap-4 py-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                      <Image src={line.image} alt={line.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-sans text-sm font-semibold tracking-tight text-obsidian">
                          {line.title}
                        </h3>
                        <button
                          type="button"
                          aria-label={`Remove ${line.title}`}
                          onClick={() => removeItem(line.handle)}
                          className="shrink-0 text-obsidian/70 transition-colors hover:text-obsidian"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 font-sans text-sm text-obsidian/70">{rupees(line.price)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(line.handle, line.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-obsidian/25 text-obsidian transition-colors hover:bg-obsidian/5"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-sans text-sm tabular-nums">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(line.handle, line.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-obsidian/25 text-obsidian transition-colors hover:bg-obsidian/5"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-obsidian/12 px-6 py-5">
              {discount > 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-sans text-xs font-medium text-obsidian">
                    Bundle discount
                  </span>
                  <span className="font-sans text-sm font-medium tabular-nums text-obsidian">
                    −{rupees(discount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-obsidian/70">
                  Total
                </span>
                <span className="font-sans text-xl font-semibold tracking-tight tabular-nums text-obsidian">
                  {rupees(total)}
                </span>
              </div>

              <Button
                size="lg"
                className="mt-4 w-full"
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
                <p className="mt-3 text-center font-sans text-sm text-dusty-rose">{checkoutError}</p>
              )}

              <p className="mt-3 text-center font-sans text-xs text-obsidian/65">
                Secure checkout powered by Shopify.
              </p>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-3 block text-center font-sans text-xs text-obsidian/70 underline underline-offset-4 hover:text-obsidian"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
