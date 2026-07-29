"use server";

import { createCart } from "@/lib/shopify/client";
import { getLocalProduct } from "@/data/products";

export async function createShopifyCheckout(
  lines: { handle: string; quantity: number }[]
): Promise<string> {
  if (!lines.length) throw new Error("No items in cart");
  const line = lines[0]; // Rove currently supports one primary product checkout
  
  const product = getLocalProduct(line.handle);
  if (!product || !product.shopifyVariantId) {
    throw new Error(`Product not found or missing Shopify Variant ID for ${line.handle}`);
  }

  const response = await createCart(product.shopifyVariantId, line.quantity);

  if (!response.cart?.checkoutUrl) {
    throw new Error("Failed to create checkout URL from Shopify");
  }

  return response.cart.checkoutUrl;
}
