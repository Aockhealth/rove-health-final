export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  variants: { nodes: Array<{ id: string; title: string; availableForSale: boolean; price: ShopifyMoney }> };
}

export interface CommerceProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  image: { url: string; altText: string | null };
  price: ShopifyMoney;
  variantId: string;
  source: "shopify" | "local";
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  price: ShopifyMoney;
  image: string | null;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: ShopifyMoney;
  lines: CartLine[];
}
