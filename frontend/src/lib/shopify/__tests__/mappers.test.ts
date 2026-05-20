import { LOCAL_PRODUCTS } from "@/data/commerce";
import { formatMoney, mapProductsByHandle, mapShopifyCart } from "@/lib/shopify/mappers";

describe("Shopify mappers", () => {
  it("formats INR without unnecessary decimals", () => {
    expect(formatMoney({ amount: "799.0", currencyCode: "INR" })).toBe("₹799");
  });

  it("falls back to local products when Shopify products are absent", () => {
    const products = mapProductsByHandle([], false);
    expect(products).toHaveLength(LOCAL_PRODUCTS.length);
    expect(products[0].shopifyConfigured).toBe(false);
    expect(products[0].availableForSale).toBe(false);
  });

  it("maps cart lines into a compact cart model", () => {
    const cart = mapShopifyCart({
      id: "gid://shopify/Cart/1",
      checkoutUrl: "https://checkout.example",
      totalQuantity: 2,
      cost: {
        subtotalAmount: { amount: "1598.0", currencyCode: "INR" },
      },
      lines: {
        nodes: [
          {
            id: "line-1",
            quantity: 2,
            cost: {
              totalAmount: { amount: "1598.0", currencyCode: "INR" },
            },
            merchandise: {
              id: "variant-1",
              title: "Default",
              price: { amount: "799.0", currencyCode: "INR" },
              image: { url: "https://cdn.shopify.com/test.png", altText: "Bottle" },
              product: { title: "Cycle Sync Rise", handle: "cycle-sync-rise" },
            },
          },
        ],
      },
    });

    expect(cart?.totalQuantity).toBe(2);
    expect(cart?.lines[0].merchandise.productTitle).toBe("Cycle Sync Rise");
  });
});
