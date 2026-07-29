import type { LocalProduct, ProductHandle } from "@/data/commerce";

export type Money = {
  amount: string;
  currencyCode: string;
};

export type CommerceVariant = {
  id: string | null;
  title: string;
  availableForSale: boolean;
  price: Money | null;
};

export type CommerceImage = {
  url: string;
  altText: string | null;
};

export type CommerceProduct = LocalProduct & {
  productId: string | null;
  onlineStoreUrl: string | null;
  availableForSale: boolean;
  price: Money | null;
  variant: CommerceVariant | null;
  productImage: CommerceImage;
  shopifyConfigured: boolean;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    productTitle: string;
    image: CommerceImage | null;
    price: Money | null;
    handle?: ProductHandle | string;
  };
  cost: {
    totalAmount: Money;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
  };
  lines: CartLine[];
};

export type ShopifyUserError = {
  field?: string[] | null;
  message: string;
  code?: string;
};

export type ShopifyWarning = {
  code?: string;
  message: string;
};

export type CartResponse = {
  cart: Cart | null;
  userErrors: ShopifyUserError[];
  warnings: ShopifyWarning[];
};
