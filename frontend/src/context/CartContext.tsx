"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLineItem {
  handle: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLineItem[];
  totalQuantity: number;
  subtotal: number;
  addItem: (item: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  updateQuantity: (handle: string, quantity: number) => void;
  removeItem: (handle: string) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "rove-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.handle === item.handle);
      if (existing) {
        return prev.map((line) =>
          line.handle === item.handle
            ? { ...line, quantity: line.quantity + quantity, price: item.price }
            : line
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (handle, quantity) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((line) => line.handle !== handle)
        : prev.map((line) => (line.handle === handle ? { ...line, quantity } : line))
    );
  };

  const removeItem: CartContextValue["removeItem"] = (handle) => {
    setLines((prev) => prev.filter((line) => line.handle !== handle));
  };

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Close on Escape, and stop the page behind the drawer from scrolling.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
    return {
      lines,
      totalQuantity,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      isOpen,
      openCart,
      closeCart,
    };
  }, [lines, isOpen, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
