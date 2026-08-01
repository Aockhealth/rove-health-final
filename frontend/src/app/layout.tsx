import type { Metadata } from "next";
import { Cormorant_Garamond, Raleway } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartProvider } from "@/context/CartContext";
import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("@/components/shop/CartDrawer").then((mod) => mod.CartDrawer));

const raleway = Raleway({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rovehealth.in"),
  title: {
    template: "%s | Rove Health",
    default: "Rove Health | PCOS, PMS & Irregular Cycle Support | Cycle Sync",
  },
  description:
    "Fix your cycle naturally. Rove Health makes phase-aware supplements and the Cycle Sync app to help manage PCOS, PMS, and irregular cycles. Formulated by doctors.",
  keywords: [
    "PCOS",
    "PMS",
    "irregular cycle",
    "fix cycle",
    "cycle sync",
    "hormonal balance",
    "phase-aware supplements",
    "women's health"
  ],
  openGraph: {
    title: "Rove Health | PCOS, PMS & Irregular Cycle Support",
    description: "Fix your cycle naturally with Rove Health. Phase-aware supplements and the Cycle Sync app to help manage PCOS, PMS, and irregular cycles.",
    url: "/",
    siteName: "Rove Health",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rove Health | Live in Sync",
    description: "Rove Health makes phase-aware supplements and the Cycle Sync app, formulated by doctors for how women's bodies actually move through the month.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${cormorant.variable} h-full scroll-smooth antialiased`}
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
