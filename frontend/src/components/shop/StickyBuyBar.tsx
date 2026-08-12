"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import type { LocalProduct } from "@/data/products";
import { cn } from "@/lib/utils";

export function StickyBuyBar({
  product,
  livePrice,
  compareAtPrice,
}: {
  product: LocalProduct;
  livePrice?: string | null;
  compareAtPrice?: string | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("shop-hero-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-obsidian/12 bg-paper/95 px-4 py-3 backdrop-blur-md transition-transform duration-[400ms] ease-out md:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian">
          {product.title}
        </p>
        <p className="font-sans text-[11px] tabular-nums text-obsidian/70">
          {product.unitCount ? `${product.unitCount} ${product.unitLabel} · ` : ""}
          {compareAtPrice ? (
            <>
              <span className="mr-1.5 line-through decoration-obsidian/70">₹{compareAtPrice}</span>
              ₹{livePrice}
            </>
          ) : (
            `₹${livePrice || product.price}`
          )}
        </p>
      </div>
      <AddToCartButton product={product} />
    </div>
  );
}
