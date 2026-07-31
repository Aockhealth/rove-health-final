"use server";

import { createCart, getQuantityQuote } from "@/lib/shopify/client";
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

/**
 * What Shopify will really charge for what's in the cart. Automatic discounts
 * (like the 3-bottle bundle) are applied to the cart, not the variant, so the
 * locally-summed subtotal can't see them — this asks Shopify instead.
 */
export async function quoteCart(
  lines: { handle: string; quantity: number }[]
): Promise<{ subtotal: number; total: number; discount: number } | null> {
  if (!lines.length) return null;

  const line = lines[0]; // Mirrors createShopifyCheckout: one primary product.
  const product = getLocalProduct(line.handle);
  if (!product?.shopifyVariantId) return null;

  return getQuantityQuote(product.shopifyVariantId, line.quantity);
}
