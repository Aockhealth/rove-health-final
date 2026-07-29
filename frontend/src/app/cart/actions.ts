"use server";

import { shopifyFetch } from "@/lib/shopify/client";
import { createCartMutation } from "@/lib/shopify/mutations";
import { getLocalProduct } from "@/data/products";

export async function createShopifyCheckout(
  lines: { handle: string; quantity: number }[]
): Promise<string> {
  // 1. Map local cart items to Shopify variants
  const lineItems = lines.map((line) => {
    const product = getLocalProduct(line.handle);
    if (!product || !product.shopifyVariantId) {
      throw new Error(`Product not found or missing Shopify Variant ID for ${line.handle}`);
    }
    return {
      merchandiseId: product.shopifyVariantId,
      quantity: line.quantity,
    };
  });

  // 2. Send mutation to Shopify
  const { body } = await shopifyFetch<{
    data: {
      cartCreate: {
        cart: {
          checkoutUrl: string;
        };
      };
    };
  }>({
    query: createCartMutation,
    variables: {
      lineItems,
    },
    // Don't cache cart creation
    cache: "no-store",
  });

  if (!body?.data?.cartCreate?.cart?.checkoutUrl) {
    throw new Error("Failed to create checkout URL from Shopify");
  }

  // 3. Return the checkout URL
  return body.data.cartCreate.cart.checkoutUrl;
}
