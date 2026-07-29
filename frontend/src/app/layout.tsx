import type { Metadata } from "next";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/shop/CartDrawer";

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "Rove Health | Live in Sync",
  description:
    "Rove Health makes phase-aware supplements and the Cycle Sync app, formulated by doctors for how women's bodies actually move through the month.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-paper text-obsidian font-sans">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
