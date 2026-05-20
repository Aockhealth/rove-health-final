"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/shopify/mappers";
import type { Cart, CartResponse } from "@/lib/shopify/types";

type CartContextValue = {
  cart: Cart | null;
  totalQuantity: number;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  addLine: (merchandiseId: string | null | undefined, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "rove-shopify-cart-id";

async function parseCartResponse(response: Response): Promise<CartResponse> {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || json.error || "Cart request failed");
  }
  if (json.userErrors?.length) {
    throw new Error(json.userErrors.map((error: { message: string }) => error.message).join(" "));
  }
  return json as CartResponse;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cartId = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!cartId) return;

    let cancelled = false;
    fetch(`/api/shopify/cart?cartId=${encodeURIComponent(cartId)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Saved cart is no longer available");
        return response.json();
      })
      .then((json) => {
        if (!cancelled) setCart(json.cart ?? null);
      })
      .catch(() => {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistCart = useCallback((nextCart: Cart | null) => {
    setCart(nextCart);
    if (nextCart?.id) {
      window.localStorage.setItem(CART_STORAGE_KEY, nextCart.id);
    } else {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const addLine = useCallback(
    async (merchandiseId: string | null | undefined, quantity = 1) => {
      if (!merchandiseId) {
        setError("Shopify product variants are not connected yet.");
        setIsOpen(true);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/shopify/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            cart?.id
              ? { action: "add", cartId: cart.id, merchandiseId, quantity }
              : { action: "create", merchandiseId, quantity }
          ),
        });
        const result = await parseCartResponse(response);
        persistCart(result.cart);
        setIsOpen(true);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to add item.");
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id, persistCart]
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      if (quantity < 1) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/shopify/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", cartId: cart.id, lineId, quantity }),
        });
        const result = await parseCartResponse(response);
        persistCart(result.cart);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to update item.");
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id, persistCart]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/shopify/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove", cartId: cart.id, lineId }),
        });
        const result = await parseCartResponse(response);
        persistCart(result.cart);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to remove item.");
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id, persistCart]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totalQuantity: cart?.totalQuantity ?? 0,
      isOpen,
      isLoading,
      error,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine,
      updateLine,
      removeLine,
    }),
    [addLine, cart, error, isLoading, isOpen, removeLine, updateLine]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

function CartDrawer() {
  const { cart, closeCart, error, isLoading, isOpen, removeLine, updateLine } = useCart();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="Close cart"
        className={cn(
          "absolute inset-0 bg-obsidian/25 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={closeCart}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white-bone shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-rove-stone/15 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rove-stone">
              Rove cart
            </p>
            <h2 className="font-serif text-2xl text-rove-charcoal">Your ritual</h2>
          </div>
          <button
            aria-label="Close cart"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rove-stone/20 text-rove-charcoal transition hover:bg-rove-stone/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-lg border border-phase-menstrual/25 bg-phase-menstrual/10 p-3 text-sm text-phase-menstrual">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!cart?.lines.length ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rove-peach/40 text-rove-charcoal">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-2xl text-rove-charcoal">No products yet</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-rove-stone">
                Add a formula from the shop and checkout securely through Shopify.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.lines.map((line) => (
                <div
                  key={line.id}
                  className="grid grid-cols-[72px_1fr] gap-4 border-b border-rove-stone/10 pb-4"
                >
                  <div className="relative h-[72px] overflow-hidden rounded-lg bg-rove-cream">
                    {line.merchandise.image?.url ? (
                      <Image
                        src={line.merchandise.image.url}
                        alt={line.merchandise.image.altText || line.merchandise.productTitle}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-rove-stone">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-rove-charcoal">
                          {line.merchandise.productTitle}
                        </p>
                        <p className="mt-1 text-xs text-rove-stone">
                          {formatMoney(line.merchandise.price)}
                        </p>
                      </div>
                      <button
                        aria-label={`Remove ${line.merchandise.productTitle}`}
                        onClick={() => removeLine(line.id)}
                        className="rounded-full p-2 text-rove-stone transition hover:bg-rove-stone/10 hover:text-rove-charcoal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-rove-stone/20 bg-white">
                        <button
                          aria-label="Decrease quantity"
                          disabled={isLoading || line.quantity <= 1}
                          onClick={() => updateLine(line.id, line.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-rove-charcoal disabled:opacity-40"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-rove-charcoal">
                          {line.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          disabled={isLoading}
                          onClick={() => updateLine(line.id, line.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-rove-charcoal disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-rove-charcoal">
                        {formatMoney(line.cost.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-rove-stone/15 p-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-rove-stone">Subtotal</span>
            <span className="font-semibold text-rove-charcoal">
              {formatMoney(cart?.cost.subtotalAmount)}
            </span>
          </div>
          <Button
            asChild
            className={cn(
              "h-12 w-full rounded-full bg-rove-charcoal text-white",
              (!cart?.checkoutUrl || isLoading) && "pointer-events-none opacity-50"
            )}
          >
            <a href={cart?.checkoutUrl || "#"}>Checkout securely</a>
          </Button>
          <p className="mt-3 text-center text-[11px] leading-5 text-rove-stone">
            Checkout, payment, shipping, and order confirmation are completed through Shopify.
          </p>
        </div>
      </aside>
    </div>
  );
}
