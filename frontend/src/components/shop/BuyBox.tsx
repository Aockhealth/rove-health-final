"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useRevealCart } from "@/hooks/useRevealCart";
import type { LocalProduct } from "@/data/products";
import { rupees } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface BuyOption {
  id: string;
  /** How many bottles this option puts in the cart. */
  quantity: number;
  label: string;
  /** Unit the price is quoted against, e.g. "3 months". */
  priceUnit?: string;
  perks: string[];
  recommended?: boolean;
}

export interface OptionPricing {
  /** List price × quantity, before any automatic cart discount. */
  subtotal: number;
  /** What Shopify will actually charge, bundle discount included. */
  total: number;
  /** MRP × quantity, when the variant has a compare-at price. */
  compareAtTotal: number | null;
}

export interface PricedBuyOption extends BuyOption {
  pricing: OptionPricing;
}

/**
 * Pack selector and add to cart. Every figure comes from Shopify — the live
 * variant price, its compare-at, and a quote of the real cart total for each
 * pack size. Nothing here is a hardcoded percentage, so a bundle discount can
 * change in Shopify without this page starting to lie about it.
 */
export function BuyBox({
  product,
  options,
}: {
  product: LocalProduct;
  options: PricedBuyOption[];
}) {
  const { addItem } = useCart();
  const revealCart = useRevealCart();
  const [selectedId, setSelectedId] = useState(
    options.find((o) => o.recommended)?.id ?? options[0]?.id
  );

  const selected = options.find((o) => o.id === selectedId) ?? options[0];
  if (!selected) return null;

  return (
    <div>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = option.id === selected.id;
          const { subtotal, total, compareAtTotal } = option.pricing;
          // Measure the saving against MRP when there is one, otherwise against
          // the undiscounted subtotal — never against a number we made up.
          const wasTotal = compareAtTotal ?? (subtotal > total ? subtotal : null);
          const savedPercent = wasTotal ? Math.round((1 - total / wasTotal) * 100) : null;
          const bundleDiscount = subtotal - total;

          return (
            <div
              key={option.id}
              className={cn(
                "overflow-hidden rounded-[18px] border transition-colors",
                isSelected ? "border-2 border-sage-teal" : "border-obsidian/15"
              )}
            >
              {option.recommended && (
                <p
                  className={cn(
                    "px-5 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    isSelected
                      ? "bg-sage-teal text-white-bone"
                      : "bg-obsidian/5 text-obsidian/55"
                  )}
                >
                  Recommended
                </p>
              )}

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3.5 p-5",
                  option.recommended && "pt-4"
                )}
              >
                <input
                  type="radio"
                  name="buy-option"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => setSelectedId(option.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected ? "border-sage-teal bg-sage-teal" : "border-obsidian/25"
                  )}
                >
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-sans text-[13px] font-semibold uppercase tracking-[0.08em] text-obsidian">
                      {option.label}
                    </span>
                    <span className="text-right">
                      <span className="font-sans text-base font-semibold tabular-nums text-obsidian">
                        {rupees(total)}
                      </span>
                      {option.priceUnit && (
                        <span className="font-sans text-xs uppercase tracking-[0.08em] text-obsidian/55">
                          {" "}
                          / {option.priceUnit}
                        </span>
                      )}
                      {wasTotal && wasTotal > total && (
                        <span className="block font-sans text-xs tabular-nums text-obsidian/45 line-through">
                          {rupees(wasTotal)}
                        </span>
                      )}
                    </span>
                  </span>

                  {(option.perks.length > 0 || bundleDiscount > 0) && (
                    <span className="mt-2.5 flex flex-col gap-1.5">
                      {bundleDiscount > 0 && (
                        <span className="flex items-start gap-2">
                          <Check
                            className="mt-[3px] h-3 w-3 shrink-0 text-sage-teal"
                            strokeWidth={3}
                            aria-hidden
                          />
                          <span className="font-sans text-xs font-semibold leading-[1.6] text-sage-teal">
                            Bundle discount of {rupees(bundleDiscount)} included
                          </span>
                        </span>
                      )}
                      {option.perks.map((perk) => (
                        <span key={perk} className="flex items-start gap-2">
                          <Check
                            className="mt-[3px] h-3 w-3 shrink-0 text-sage-teal"
                            strokeWidth={3}
                            aria-hidden
                          />
                          <span className="font-sans text-xs leading-[1.6] text-obsidian/65">
                            {perk}
                          </span>
                        </span>
                      ))}
                    </span>
                  )}

                  {savedPercent !== null && savedPercent > 0 && (
                    <span className="mt-2.5 inline-block rounded-full bg-sage-teal/15 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-sage-teal">
                      Save {savedPercent}%
                    </span>
                  )}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={() => {
          addItem(
            {
              handle: product.handle,
              title: product.title,
              price: product.price,
              currency: product.currency,
              image: product.image,
            },
            selected.quantity
          );
          revealCart();
        }}
      >
        Add to Cart — {rupees(selected.pricing.total)}
      </Button>
    </div>
  );
}
