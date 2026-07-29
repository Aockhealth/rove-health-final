"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import type { LocalProduct } from "@/data/products";

export function AddToCartButton({ product }: { product: LocalProduct }) {
  const { addItem } = useCart();
  const router = useRouter();

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
        router.push("/cart");
      }}
    >
      Add to Cart
    </Button>
  );
}
