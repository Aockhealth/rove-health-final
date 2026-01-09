import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Header from "@/components/layout/Header";
import { createClient } from "@/utils/supabase/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rove Health | Precision Women's Health",
  description: "Doctor-formulated supplements for women's health.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rove Health",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
