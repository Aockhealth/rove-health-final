"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import ProfileAvatar from "@/components/cycle-sync/ProfileAvatar";
import PageGuide from "@/components/cycle-sync/PageGuide";
import LearnHero from "@/components/cycle-sync/learn/LearnHero";
import ContentRow from "@/components/cycle-sync/learn/ContentRow";
import LearnSkeleton from "@/components/cycle-sync/learn/LearnSkeleton";
import type { LearnArticle } from "@backend/actions/cycle-sync/learn/learn-actions";

const cleanTitle = (title: string) => {
    if (!title) return "";
    return title.replace(/^[A-Za-z][.\s-]*\d+[.\s-]*\s*/, "").replace(/\.[^/.]+$/, "").trim();
};

async function fetchArticles(): Promise<LearnArticle[]> {
    try {
        const res = await fetch('/api/learn');
        if (!res.ok) return [];

        const payload: unknown = await res.json().catch(() => []);
        return Array.isArray(payload) ? (payload as LearnArticle[]) : [];
    } catch (error) {
        console.error("Failed to load learn articles:", error);
        return [];
    }
}

export default function LearnPage() {
    const { data: articles = [], isPending: loading } = useQuery<LearnArticle[]>({
        queryKey: ['articles'],
        queryFn: fetchArticles
    });

    // Single-pass category grouping, preserving order of first appearance
    const grouped = useMemo(() => {
        const map = new Map<string, LearnArticle[]>();
        articles.forEach(a => {
            if (!map.has(a.category)) map.set(a.category, []);
            map.get(a.category)!.push(a);
        });
        return map;
    }, [articles]);

    const featured = articles.length > 0 ? articles[0] : null;

    if (loading) return <LearnSkeleton />;

    return (
        <div className="relative min-h-screen bg-white text-rove-charcoal pb-4">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-40 px-4 pb-4 pt-safe bg-gradient-to-b from-black/50 to-transparent pointer-events-none flex justify-between items-center">
                <Link href="/cycle-sync" className="pointer-events-auto inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    <ChevronLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                </Link>
                <div className="pointer-events-auto">
                    <ProfileAvatar />
                </div>
            </div>

            {/* Page Guide */}
            <div className="pt-20 px-4 md:px-8 mb-8 max-w-5xl mx-auto">
                <PageGuide
                    pageKey="learn"
                    icon={Bookmark}
                    title="Rove Library"
                    description="Deep-dive into holistic science, Ayurvedic practices, and body literacy."
                    className="mx-0 mt-0 mb-6"
                />
            </div>

            {/* Hero */}
            {featured ? (
                <LearnHero article={featured} cleanTitle={cleanTitle} />
            ) : (
                <div className="h-[50vh] flex items-center justify-center text-neutral-400">
                    No articles found.
                </div>
            )}

            {/* Category Rows */}
            <div className="relative z-10 -mt-10 md:-mt-20 space-y-6">
                {[...grouped.entries()].map(([category, items]) => (
                    <ContentRow
                        key={category}
                        title={category}
                        articles={items}
                        cleanTitle={cleanTitle}
                    />
                ))}
            </div>

            {/* Credits Footer */}
            <footer className="mt-20 pt-10 pb-4 px-8 border-t border-neutral-100">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Image Credits & Attributions
                    </p>
                    <p className="text-xs text-neutral-400">
                        Icons by{' '}
                        <a href="https://www.flaticon.com/authors/freepik" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 underline transition-colors">Freepik</a>
                        {' & '}
                        <a href="https://www.flaticon.com/authors/pixel-perfect" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 underline transition-colors">Pixel perfect</a>
                        {' from '}
                        <a href="https://www.flaticon.com/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 underline transition-colors">Flaticon</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
