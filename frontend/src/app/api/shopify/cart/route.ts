import { NextResponse } from "next/server";
import {
  addCartLine,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLine,
  updateCartLine,
} from "@/lib/shopify/client";

type CartAction =
  | {
      action: "create";
      merchandiseId: string;
      quantity: number;
    }
  | {
      action: "add";
      cartId: string;
      merchandiseId: string;
      quantity: number;
    }
  | {
      action: "update";
      cartId: string;
      lineId: string;
      quantity: number;
    }
  | {
      action: "remove";
      cartId: string;
      lineId: string;
    };

function configError() {
  return NextResponse.json(
    {
      error: "SHOPIFY_CONFIG_MISSING",
      message: "Shopify checkout is not connected yet.",
    },
    { status: 503 }
  );
}

function asPositiveQuantity(value: unknown): number {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return 1;
  return quantity;
}

export async function GET(request: Request) {
  if (!isShopifyConfigured()) return configError();

  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json({ error: "MISSING_CART_ID" }, { status: 400 });
  }

  try {
    const cart = await getCart(cartId);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error("[Shopify Cart] GET failed", error);
    return NextResponse.json({ error: "CART_FETCH_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isShopifyConfigured()) return configError();

  try {
    const body = (await request.json()) as CartAction;

    if (body.action === "create") {
      if (!body.merchandiseId) {
        return NextResponse.json({ error: "MISSING_MERCHANDISE_ID" }, { status: 400 });
      }
      const response = await createCart(body.merchandiseId, asPositiveQuantity(body.quantity));
      return NextResponse.json(response);
    }

    if (body.action === "add") {
      if (!body.cartId || !body.merchandiseId) {
        return NextResponse.json({ error: "MISSING_CART_OR_MERCHANDISE" }, { status: 400 });
      }
      const response = await addCartLine(
        body.cartId,
        body.merchandiseId,
        asPositiveQuantity(body.quantity)
      );
      return NextResponse.json(response);
    }

    if (body.action === "update") {
      if (!body.cartId || !body.lineId) {
        return NextResponse.json({ error: "MISSING_CART_OR_LINE" }, { status: 400 });
      }
      const response = await updateCartLine(
        body.cartId,
        body.lineId,
        asPositiveQuantity(body.quantity)
      );
      return NextResponse.json(response);
    }

    if (body.action === "remove") {
      if (!body.cartId || !body.lineId) {
        return NextResponse.json({ error: "MISSING_CART_OR_LINE" }, { status: 400 });
      }
      const response = await removeCartLine(body.cartId, body.lineId);
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (error) {
    console.error("[Shopify Cart] POST failed", error);
    return NextResponse.json({ error: "CART_MUTATION_FAILED" }, { status: 500 });
  }
}
