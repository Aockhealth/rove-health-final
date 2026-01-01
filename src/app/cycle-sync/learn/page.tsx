"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, Play, Info, ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fetchInsightsData } from "@/app/actions/cycle-sync";
import { LEARN_ARTICLES, ArticleCategory, Article } from "@/data/learn-content";

// Component for a Horizontal Scroll Row
const ContentRow = ({ title, articles }: { title: string, articles: Article[] }) => {
    if (articles.length === 0) return null;
    return (
        <div className="mb-10 pl-4 md:pl-8">
            <h3 className="text-lg md:text-xl font-heading text-rove-charcoal mb-4 flex items-center gap-2 group cursor-pointer hover:text-black">
                {title} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 -ml-4 pl-4 md:pl-8 pr-4 mask-fade-right">
                {articles.map((article) => (
                    <motion.div
                        key={article.id}
                        whileHover={{ scale: 1.05 }}
                        className="min-w-[200px] w-[200px] md:min-w-[260px] md:w-[260px] cursor-pointer group/card relative"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm mb-3">
                            <div className="absolute inset-0 bg-slate-200 animate-pulse" /> {/* Placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                            {/* Mock Image using gradient if no URL, or text */}
                            {article.imageUrl ? (
                                <div className="absolute inset-0 bg-neutral-800" /> // In real app, use next/image here
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-300 font-bold text-4xl opacity-20 select-none">
                                {article.category[0]}
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 block">{article.category}</span>
                                <h4 className="font-bold leading-tight text-sm line-clamp-2 drop-shadow-md">{article.title}</h4>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default function LearnPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchInsightsData();
            setStats(data);
            setLoading(false);
        }
        load();
    }, []);

    // Featured Article (Billboard) -> Let's pick a random one for now or ID 1
    const featured = LEARN_ARTICLES[0];

    // Group Articles
    const pcosArticles = LEARN_ARTICLES.filter(a => a.category === "PCOS");
    const cycleArticles = LEARN_ARTICLES.filter(a => a.category === "Cycle Syncing");
    const pregArticles = LEARN_ARTICLES.filter(a => a.category === "Pregnancy");
    const sexArticles = LEARN_ARTICLES.filter(a => a.category === "Sexual Health");

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-rove-charcoal pb-20">

            {/* 1. NAVBAR (Transparent Overlay) */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <Link href="/cycle-sync" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    <ChevronLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                </Link>
            </div>

            {/* 2. BILLBOARD HERO */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                {/* Background Image Placeholder */}
                <div className="absolute inset-0 bg-neutral-900">
                    {/* In a real app, <Image /> goes here */}
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-br from-purple-900 to-rose-900" />
                </div>

                {/* Gradient Gradient Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

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
                        <button className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-neutral-200 transition-colors shadow-lg">
                            <Play className="w-5 h-5 fill-black" /> Read Now
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-lg font-bold hover:bg-white/30 transition-colors">
                            <Bookmark className="w-5 h-5" /> Save
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* 3. ROWS */}
            <div className="relative z-10 -mt-10 md:-mt-20 space-y-4">
                <ContentRow title="PCOS Essentials" articles={pcosArticles} />
                <ContentRow title="Cycle Syncing 101" articles={cycleArticles} />
                <ContentRow title="Pregnancy Zone" articles={pregArticles} />
                <ContentRow title="Sexual Wellness" articles={sexArticles} />
            </div>

        </div>
    );
}
