"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import type { LocalProduct } from "@/data/products";

export function AddToCartButton({ product }: { product: LocalProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <Button
        size="lg"
        onClick={() => {
          addItem({
            handle: product.handle,
            title: product.title,
            price: product.price,
            currency: product.currency,
            image: product.image,
          });
          setAdded(true);
        }}
      >
        Add to Cart
      </Button>
      {added && (
        <Link href="/cart" className="font-label text-xs font-medium uppercase tracking-wide underline">
          View Cart
        </Link>
      )}
    </div>
  );
}
