"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Play, ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProfileAvatar from "@/components/cycle-sync/ProfileAvatar";
import { cn, getStorageUrl } from "@/lib/utils";
import type { LearnArticle } from "@backend/actions/cycle-sync/learn/learn-actions";
import LoadingScreen from "@/components/ui/LoadingScreen";

const ContentRow = ({ title, articles }: { title: string, articles: LearnArticle[] }) => {
    if (!articles || articles.length === 0) return null;

    return (
        <div className="mb-10 pl-4 md:pl-8">
            <h3 className="text-lg md:text-xl font-heading text-rove-charcoal mb-4 flex items-center gap-2 group cursor-pointer hover:text-black">
                {title} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 -ml-4 pl-4 md:pl-8 pr-4 mask-fade-right">
                {articles.map((article) => {
                    const imageUrl = getStorageUrl("learn-images", article.image_path);

                    return (
                        <Link href={`/cycle-sync/learn/${article.id}`} key={article.id}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="min-w-[200px] w-[200px] md:min-w-[260px] md:w-[260px] cursor-pointer group/card relative"
                            >
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm mb-3 bg-neutral-100">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={article.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 200px, 260px"
                                            loading="lazy"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 block">
                                            {article.category}
                                        </span>
                                        <h4 className="font-bold leading-tight text-sm line-clamp-2 drop-shadow-md">
                                            {article.title}
                                        </h4>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default function LearnPage() {
    const [articles, setArticles] = useState<LearnArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await fetch('/api/learn')
            const data = await res.json().catch(() => [])
            setArticles(data || []);
            setLoading(false);
        }
        load();
    }, []);

    const cycleArticles = articles.filter(a => a.category === "Cycle Syncing");
    const pcosArticles = articles.filter(a => a.category === "PCOS");
    const sexualArticles = articles.filter(a => a.category === "Sexual Wellness");
    const pathologyArticles = articles.filter(a => a.category === "Common Pathologies");
    const skincareArticles = articles.filter(a => a.category === "Skincare");

    const featured = articles.length > 0 ? articles[0] : null;
    const featuredImage = featured ? getStorageUrl("learn-images", featured.image_path) : null;

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-white text-rove-charcoal pb-4">
            <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none flex justify-between items-center">
                <Link href="/cycle-sync" className="pointer-events-auto inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    <ChevronLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                </Link>
                
                {/* Wrapped in pointer-events-auto so it is clickable */}
                <div className="pointer-events-auto">
                    <ProfileAvatar />
                </div>
            </div>

            {featured ? (
                <div className="relative h-[70vh] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-900">
                        {featuredImage && (
                            <Image
                                src={featuredImage}
                                alt={featured.title}
                                fill
                                className="object-cover opacity-80"
                                priority
                                sizes="100vw"
                                unoptimized
                            />
                        )}
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-br from-purple-900 to-rose-900" />
                    </div>
                    {/* ... Rest of your hero content ... */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 pb-12 w-full md:w-2/3 lg:w-1/2 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-md text-white md:text-black md:bg-white text-[10px] font-bold uppercase tracking-[0.2em]"
                        >
                            Featured Series
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-heading text-white leading-[0.9] drop-shadow-lg"
                        >
                            {featured.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="text-white/90 text-sm md:text-base font-medium line-clamp-3 md:line-clamp-none drop-shadow-md max-w-lg"
                        >
                            {featured.excerpt}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="flex items-center gap-3 pt-4"
                        >
                            <Link href={`/cycle-sync/learn/${featured.id}`}>
                                <button className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-neutral-200 transition-colors shadow-lg">
                                    <Play className="w-5 h-5 fill-black" /> Read Now
                                </button>
                            </Link>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-lg font-bold hover:bg-white/30 transition-colors">
                                <Bookmark className="w-5 h-5" /> Save
                            </button>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="h-[50vh] flex items-center justify-center text-neutral-400">
                    No articles found.
                </div>
            )}

            <div className="relative z-10 -mt-10 md:-mt-20 space-y-6">
                <ContentRow title="Cycle Syncing" articles={cycleArticles} />
                <ContentRow title="PCOS" articles={pcosArticles} />
                <ContentRow title="Sexual Wellness" articles={sexualArticles} />
                <ContentRow title="Common Pathologies" articles={pathologyArticles} />
                <ContentRow title="Skincare" articles={skincareArticles} />
            </div>

            {/* --- CREDITS / ATTRIBUTION FOOTER --- */}
            <footer className="mt-20 pt-10 pb-4 px-8 border-t border-neutral-100">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Image Credits & Attributions
                    </p>
                    <div className="text-xs text-neutral-400 space-y-1">
                        <p>
                            Icons made by{' '}
                            <a
                                href="https://www.flaticon.com/authors/freepik"
                                title="Freepik"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-600 underline transition-colors"
                            >
                                Freepik
                            </a>{' '}
                            from{' '}
                            <a
                                href="https://www.flaticon.com/"
                                title="Flaticon"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-600 underline transition-colors"
                            >
                                www.flaticon.com
                            </a>
                        </p>
                        <p>
                            Icons made by{' '}
                            <a
                                href="https://www.flaticon.com/authors/pixel-perfect"
                                title="Pixel perfect"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-600 underline transition-colors"
                            >
                                Pixel perfect
                            </a>{' '}
                            from{' '}
                            <a
                                href="https://www.flaticon.com/"
                                title="Flaticon"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-600 underline transition-colors"
                            >
                                www.flaticon.com
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
