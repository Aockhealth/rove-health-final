import { LOCAL_PRODUCTS, type LocalProduct } from "@/data/commerce";
import type { Cart, CartLine, CommerceProduct, Money } from "./types";

type ShopifyProductNode = {
  id?: string | null;
  handle?: string | null;
  title?: string | null;
  onlineStoreUrl?: string | null;
  availableForSale?: boolean | null;
  featuredImage?: {
    url?: string | null;
    altText?: string | null;
  } | null;
  variants?: {
    nodes?: Array<{
      id?: string | null;
      title?: string | null;
      availableForSale?: boolean | null;
      price?: Money | null;
    } | null> | null;
  } | null;
};

type ShopifyCartNode = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
  };
  lines?: {
    nodes?: Array<{
      id: string;
      quantity: number;
      cost: {
        totalAmount: Money;
      };
      merchandise?: {
        id: string;
        title: string;
        price?: Money | null;
        image?: {
          url?: string | null;
          altText?: string | null;
        } | null;
        product?: {
          title?: string | null;
          handle?: string | null;
        } | null;
      } | null;
    } | null> | null;
  } | null;
};

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return "Coming soon";
  const amount = Number(money.amount);
  if (Number.isNaN(amount)) return `${money.amount} ${money.currencyCode}`;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function buildFallbackProduct(localProduct: LocalProduct): CommerceProduct {
  return {
    ...localProduct,
    productId: null,
    onlineStoreUrl: null,
    availableForSale: false,
    price: null,
    variant: null,
    productImage: {
      url: localProduct.image,
      altText: `${localProduct.title} product image`,
    },
    shopifyConfigured: false,
  };
}

export function mapShopifyProduct(
  localProduct: LocalProduct,
  node: ShopifyProductNode | null | undefined,
  shopifyConfigured: boolean
): CommerceProduct {
  if (!node) {
    return {
      ...buildFallbackProduct(localProduct),
      shopifyConfigured,
    };
  }

  const firstAvailable =
    node.variants?.nodes?.find((variant) => variant?.availableForSale) ??
    node.variants?.nodes?.find(Boolean) ??
    null;

  return {
    ...localProduct,
    productId: node.id ?? null,
    onlineStoreUrl: node.onlineStoreUrl ?? null,
    availableForSale: Boolean(node.availableForSale && firstAvailable?.availableForSale),
    price: firstAvailable?.price ?? null,
    variant: firstAvailable
      ? {
          id: firstAvailable.id ?? null,
          title: firstAvailable.title ?? "Default",
          availableForSale: Boolean(firstAvailable.availableForSale),
          price: firstAvailable.price ?? null,
        }
      : null,
    productImage: {
      url: node.featuredImage?.url || localProduct.image,
      altText: node.featuredImage?.altText || `${localProduct.title} product image`,
    },
    shopifyConfigured,
  };
}

export function mapProductsByHandle(
  nodes: Array<ShopifyProductNode | null | undefined>,
  shopifyConfigured: boolean
): CommerceProduct[] {
  return LOCAL_PRODUCTS.map((localProduct) => {
    const node = nodes.find((candidate) => candidate?.handle === localProduct.shopifyHandle);
    return mapShopifyProduct(localProduct, node, shopifyConfigured);
  });
}

export function mapShopifyCart(node: ShopifyCartNode | null | undefined): Cart | null {
  if (!node) return null;

  const lines: CartLine[] =
    node.lines?.nodes?.filter(Boolean).map((line) => ({
      id: line!.id,
      quantity: line!.quantity,
      cost: line!.cost,
      merchandise: {
        id: line!.merchandise?.id ?? "",
        title: line!.merchandise?.title ?? "Default",
        productTitle: line!.merchandise?.product?.title ?? "Rove product",
        handle: line!.merchandise?.product?.handle ?? undefined,
        image: line!.merchandise?.image?.url
          ? {
              url: line!.merchandise.image.url,
              altText: line!.merchandise.image.altText ?? null,
            }
          : null,
        price: line!.merchandise?.price ?? null,
      },
    })) ?? [];

  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    cost: node.cost,
    lines,
  };
}
