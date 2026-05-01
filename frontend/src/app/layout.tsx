import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rovehealth.in";

export const metadata: Metadata = {
  title: {
    default: "Rove Health | AI-Powered Cycle Syncing & Period Tracker for Indian Women",
    template: "%s | Rove Health",
  },
  description:
    "Sync your diet, exercise, and lifestyle with your menstrual cycle. Rove Health is India's first AI-powered cycle-syncing app with personalized Ayurvedic meal plans, phase-based workouts, and holistic wellness coaching.",
  keywords: [
    "cycle syncing", "period tracker", "women's health India", "menstrual cycle app",
    "Ayurvedic diet plan", "phase-based workout", "seed cycling", "hormone health",
    "cycle sync diet", "period tracker India", "women's wellness app",
  ],
  authors: [{ name: "Rove Health" }],
  creator: "Rove Health",
  manifest: "/manifest.json",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Rove Health",
    title: "Rove Health | AI-Powered Cycle Syncing for Indian Women",
    description:
      "India's first cycle-syncing app. Get personalized diet, exercise, and lifestyle plans based on your menstrual phase.",
    images: [
      {
        url: `${siteUrl}/images/rove_logo_new.png`,
        width: 1200,
        height: 630,
        alt: "Rove Health - Cycle Syncing App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rove Health | AI-Powered Cycle Syncing",
    description:
      "Sync your diet, exercise & lifestyle with your cycle. Personalized plans powered by AI.",
    images: [`${siteUrl}/images/rove_logo_new.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rove Health",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#D35400",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Rove Health",
  url: siteUrl,
  description:
    "AI-powered cycle syncing app for Indian women. Personalized diet, exercise, and lifestyle plans based on your menstrual phase.",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA: Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PRB0J30QW5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PRB0J30QW5');
          `}
        </Script>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${cormorant.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
