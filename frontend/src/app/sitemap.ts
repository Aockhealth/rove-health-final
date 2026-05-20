import type { MetadataRoute } from "next";
import { fetchLearnArticles } from "@/app/actions/learn-actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rovehealth.in";

    // Fetch all published articles for dynamic URLs
    let articleUrls: MetadataRoute.Sitemap = [];
    try {
        const articles = await fetchLearnArticles();
        articleUrls = articles.map((article) => ({
            url: `${baseUrl}/cycle-sync/learn/${article.id}`,
            lastModified: article.published_date
                ? new Date(article.published_date)
                : new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.85,
        }));
    } catch {
        // Fail silently — static pages still get indexed
    }

    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.95,
        },
        {
            url: `${baseUrl}/cycle-sync/learn`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/science`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ingredient-glossary`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/story`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy-pledge`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    return [...staticUrls, ...articleUrls];
}
