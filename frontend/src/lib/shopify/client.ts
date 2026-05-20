import { LOCAL_PRODUCTS } from "@/data/commerce";
import { mapProductsByHandle, mapShopifyCart } from "./mappers";
import type { Cart, CartResponse, CommerceProduct, ShopifyUserError, ShopifyWarning } from "./types";

const PRODUCT_FRAGMENT = `
  id
  handle
  title
  onlineStoreUrl
  availableForSale
  featuredImage {
    url
    altText
  }
  variants(first: 10) {
    nodes {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
    }
  }
`;

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
          product {
            title
            handle
          }
        }
      }
    }
  }
`;

type ShopifyGraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export function isShopifyConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN &&
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  );
}

function getStorefrontEndpoint(): string {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN is not configured");

  const normalizedDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-04";
  return `https://${normalizedDomain}/api/${version}/graphql.json`;
}

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured");

  const response = await fetch(getStorefrontEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await response.json()) as ShopifyGraphQlResponse<T>;

  if (!response.ok || json.errors?.length) {
    const message = json.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(message);
  }

  if (!json.data) throw new Error("Shopify returned no data");
  return json.data;
}

export async function getCommerceProducts(): Promise<CommerceProduct[]> {
  if (!isShopifyConfigured()) {
    return mapProductsByHandle([], false);
  }

  const aliases = LOCAL_PRODUCTS.map((product, index) => {
    const alias = `product${index}`;
    return `${alias}: product(handle: "${product.shopifyHandle}") { ${PRODUCT_FRAGMENT} }`;
  }).join("\n");

  const query = `query RoveProducts { ${aliases} }`;

  try {
    const data = await shopifyFetch<Record<string, unknown>>(query);
    return mapProductsByHandle(Object.values(data) as never[], true);
  } catch (error) {
    console.error("[Shopify] Failed to fetch products", error);
    return mapProductsByHandle([], true);
  }
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const query = `
    query RoveCart($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_FRAGMENT}
      }
    }
  `;

  const data = await shopifyFetch<{ cart: unknown }>(query, { cartId });
  return mapShopifyCart(data.cart as never);
}

function userErrorsFromPayload(payload: {
  userErrors?: ShopifyUserError[];
  warnings?: ShopifyWarning[];
}): Pick<CartResponse, "userErrors" | "warnings"> {
  return {
    userErrors: payload.userErrors ?? [],
    warnings: payload.warnings ?? [],
  };
}

export async function createCart(merchandiseId: string, quantity: number): Promise<CartResponse> {
  const mutation = `
    mutation RoveCartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
          code
        }
        warnings {
          code
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartCreate: { cart: unknown; userErrors: ShopifyUserError[]; warnings: ShopifyWarning[] };
  }>(mutation, {
    input: {
      lines: [{ merchandiseId, quantity }],
      attributes: [{ key: "source", value: "rove-shop" }],
    },
  });

  return {
    cart: mapShopifyCart(data.cartCreate.cart as never),
    ...userErrorsFromPayload(data.cartCreate),
  };
}

export async function addCartLine(
  cartId: string,
  merchandiseId: string,
  quantity: number
): Promise<CartResponse> {
  const mutation = `
    mutation RoveCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
          code
        }
        warnings {
          code
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartLinesAdd: { cart: unknown; userErrors: ShopifyUserError[]; warnings: ShopifyWarning[] };
  }>(mutation, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  });

  return {
    cart: mapShopifyCart(data.cartLinesAdd.cart as never),
    ...userErrorsFromPayload(data.cartLinesAdd),
  };
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<CartResponse> {
  const mutation = `
    mutation RoveCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
          code
        }
        warnings {
          code
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: unknown; userErrors: ShopifyUserError[]; warnings: ShopifyWarning[] };
  }>(mutation, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  return {
    cart: mapShopifyCart(data.cartLinesUpdate.cart as never),
    ...userErrorsFromPayload(data.cartLinesUpdate),
  };
}

export async function removeCartLine(cartId: string, lineId: string): Promise<CartResponse> {
  const mutation = `
    mutation RoveCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
          code
        }
        warnings {
          code
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartLinesRemove: { cart: unknown; userErrors: ShopifyUserError[]; warnings: ShopifyWarning[] };
  }>(mutation, {
    cartId,
    lineIds: [lineId],
  });

  return {
    cart: mapShopifyCart(data.cartLinesRemove.cart as never),
    ...userErrorsFromPayload(data.cartLinesRemove),
  };
}
