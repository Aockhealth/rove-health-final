"use client";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useRevealCart } from "@/hooks/useRevealCart";
import type { LocalProduct } from "@/data/products";

export function AddToCartButton({ product }: { product: LocalProduct }) {
  const { addItem } = useCart();
  const revealCart = useRevealCart();

  return (
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
        revealCart();
      }}
    >
      Add to Cart
    </Button>
  );
}
