import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rovehealth.in";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/login", "/signup", "/cycle-sync/learn"],
                disallow: ["/cycle-sync/tracker", "/cycle-sync/plan", "/cycle-sync/insights", "/onboarding/", "/api/", "/_next/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
