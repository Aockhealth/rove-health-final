import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // /shop is now the Balance product page itself — only one product is live.
  // These keep previously-shared links and search results out of a 404.
  async redirects() {
    return [
      { source: "/shop/cycle-sync-balance", destination: "/shop", permanent: true },
      { source: "/shop/cycle-sync", destination: "/shop", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  webpack: (config) => {
    // Ensure Webpack can resolve dependencies (like 'zod') from the frontend's node_modules
    // when compiling files outside the frontend directory (e.g. ../shared)
    const path = require('path');
    config.resolve.modules.push(path.resolve('./node_modules'));
    return config;
  },
};

export default withSerwist(nextConfig);
