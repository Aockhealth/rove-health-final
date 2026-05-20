"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { CartProvider, useCart } from "./CartProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/shop", label: "Shop" },
  { href: "/science", label: "Science" },
  { href: "/ingredient-glossary", label: "Ingredients" },
  { href: "/story", label: "Story" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <MarketingFrame>{children}</MarketingFrame>
    </CartProvider>
  );
}

function MarketingFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { openCart, totalQuantity } = useCart();

  return (
    <div className="min-h-screen bg-paper text-rove-charcoal">
      <header className="sticky top-0 z-50 border-b border-rove-stone/10 bg-paper/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="relative h-10 w-28" aria-label="Rove home">
            <Image
              src="/images/rove_logo_final.png"
              alt="Rove Health"
              fill
              className="object-contain object-left"
              sizes="112px"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    active ? "text-rove-charcoal" : "text-rove-stone hover:text-rove-charcoal"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Open cart"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-rove-stone/20 bg-white/60 text-rove-charcoal transition hover:bg-white"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-phase-menstrual px-1 text-[10px] font-bold text-white">
                  {totalQuantity}
                </span>
              )}
            </button>
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-rove-stone/20 bg-white/60 text-rove-charcoal md:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-rove-stone/10 bg-paper px-4 py-4 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-rove-charcoal transition hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {children}

      <footer className="border-t border-rove-stone/10 bg-white-bone">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
          <div>
            <div className="relative h-10 w-28">
              <Image
                src="/images/rove_logo_final.png"
                alt="Rove Health"
                fill
                className="object-contain object-left"
                sizes="112px"
              />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-rove-stone">
              Cycle-aware care for women who want body literacy, daily rhythm, and thoughtful
              supplementation without fear-led wellness.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-rove-charcoal hover:text-phase-menstrual"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
