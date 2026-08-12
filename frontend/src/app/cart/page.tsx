"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Minus,
  Plus,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartQuote } from "@/hooks/useCartQuote";
import { rupees } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { createShopifyCheckout } from "./actions";

const REASSURANCES = [
  { icon: Truck, label: "Shipped across India" },
  { icon: Lock, label: "Secure Shopify checkout" },
];

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem } = useCart();
  // Automatic discounts live on the Shopify cart, so the real total has to come
  // from Shopify. Until it arrives, show the plain subtotal rather than a guess.
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

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center md:py-32">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-obsidian">
          Your cart is empty
        </h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-obsidian/65">
          Balance is available now. Sync is still in development.
        </p>
        <div className="mt-8">
          <Button size="lg" href="/shop">
            Browse the shop
          </Button>
        </div>
      </div>
    );
  }

  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 font-sans text-sm font-medium text-obsidian/70 transition-colors hover:text-obsidian"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Continue shopping
      </Link>

      <h1 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-obsidian md:text-4xl">
        Your cart{" "}
        <span className="font-sans text-lg font-normal tabular-nums text-obsidian/65">
          ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_20rem] md:gap-14">
        {/* Lines */}
        <div className="border-t border-obsidian/15">
          {lines.map((line) => (
            <div key={line.handle} className="flex gap-5 border-b border-obsidian/12 py-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-white-bone">
                <Image
                  src={line.image}
                  alt={line.title}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-sans text-lg font-semibold tracking-tight text-obsidian">
                      {line.title}
                    </h2>
                    <p className="mt-1 font-sans text-xs tabular-nums text-obsidian/70">
                      ₹{line.price} each
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${line.title}`}
                    onClick={() => removeItem(line.handle)}
                    className="shrink-0 text-obsidian/70 transition-colors hover:text-obsidian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="flex items-center gap-1 rounded-full border border-obsidian/20 p-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(line.handle, line.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-obsidian transition-colors hover:bg-obsidian/5"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[1.75rem] text-center font-sans text-sm font-medium tabular-nums text-obsidian">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(line.handle, line.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-obsidian transition-colors hover:bg-obsidian/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="font-sans text-base font-semibold tabular-nums text-obsidian">
                    ₹{line.price * line.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="md:sticky md:top-28 md:self-start">
          <div className="rounded-[18px] border border-obsidian/12 bg-white-bone p-6">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian/70">
              Order summary
            </h2>

            <dl className="mt-5 space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-sans text-sm text-obsidian/70">Subtotal</dt>
                <dd className="font-sans text-sm font-medium tabular-nums text-obsidian">
                  {rupees(subtotal)}
                </dd>
              </div>
              {discount > 0 && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-sans text-sm font-medium text-rove-plum">Bundle discount</dt>
                  <dd className="font-sans text-sm font-medium tabular-nums text-rove-plum">
                    −{rupees(discount)}
                  </dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-sans text-sm text-obsidian/70">Shipping</dt>
                <dd className="font-sans text-sm text-obsidian/70">Calculated at checkout</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-obsidian/15 pt-5">
              <span className="font-sans text-base font-semibold tracking-tight text-obsidian">
                Total
              </span>
              <span className="font-sans text-2xl font-semibold tabular-nums text-obsidian">
                {rupees(total)}
              </span>
            </div>

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                "Checkout"
              )}
            </Button>

            {checkoutError && (
              <p role="alert" className="mt-3 text-center font-sans text-sm text-phase-menstrual">
                {checkoutError}
              </p>
            )}

            <ul className="mt-6 space-y-2.5 border-t border-obsidian/12 pt-5">
              {REASSURANCES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-obsidian/65" strokeWidth={1.75} aria-hidden />
                  <span className="font-sans text-xs text-obsidian/65">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
