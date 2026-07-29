"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/app", label: "App" },
  { href: "/story", label: "Our Story" },
  { href: "/library", label: "The Library" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { totalQuantity, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-obsidian/8 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image src="/brand/logo.png" alt="Rove" width={140} height={75} priority className="h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-sans text-sm font-medium text-obsidian/65 hover:text-obsidian transition-colors",
                pathname?.startsWith(link.href) && "text-obsidian"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="relative text-obsidian/80 hover:text-obsidian transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-obsidian text-[10px] font-medium text-white">
                {totalQuantity}
              </span>
            )}
          </button>
          <button
            type="button"
            className="md:hidden text-obsidian"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-obsidian/8 bg-paper px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-sans text-base font-medium text-obsidian/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
