"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProfileAvatar from "@/components/cycle-sync/ProfileAvatar";
import { cn, getStorageUrl } from "@/lib/utils";
import type { LearnArticle } from "@backend/actions/cycle-sync/learn/learn-actions";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageGuide from "@/components/cycle-sync/PageGuide";

const ContentRow = ({ title, articles }: { title: string, articles: LearnArticle[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    if (!articles || articles.length === 0) return null;

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0);
            // Add a small 5px buffer to account for rounding errors
            setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            // Scroll by 80% of container width
            const amount = direction === "left" ? -scrollRef.current.clientWidth * 0.8 : scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-12 relative group/row"
        >
            <h3 className="text-xl md:text-2xl font-heading text-neutral-900 mb-6 flex items-center gap-3 group px-4 md:px-8 cursor-pointer hover:text-phase-menstrual transition-colors">
                {title} <ArrowRight className="w-5 h-5 text-phase-menstrual/80 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 duration-300" />
            </h3>
            
            <div className="relative">
                {/* Desktop Navigation Arrows */}
                <AnimatePresence>
                    {showLeft && (
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => scroll("left")} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-neutral-100 hover:bg-white hover:text-phase-menstrual hover:scale-110 transition-all hidden md:block opacity-0 group-hover/row:opacity-100 -translate-x-4 group-hover/row:translate-x-2"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Scroll Container */}
                <div 
                    ref={scrollRef} 
                    onScroll={handleScroll} 
                    className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-8 px-4 md:px-8 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none" }}
                >
                    {articles.map((article) => {
                        const imageUrl = getStorageUrl("learn-images", article.image_path);

                        return (
                            <Link href={`/cycle-sync/learn/${article.id}`} key={article.id} className="snap-start shrink-0">
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    className="w-[240px] md:w-[280px] cursor-pointer group/card relative"
                                >
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm mb-4 bg-neutral-100 border border-neutral-100 transition-shadow duration-300 group-hover/card:shadow-xl group-hover/card:shadow-phase-menstrual/10">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={article.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                                                sizes="(max-width: 768px) 240px, 280px"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-neutral-50 flex items-center justify-center text-neutral-400 font-medium text-sm">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover/card:opacity-90" />
                                        
                                        {/* Play Icon Overlay on Hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/10">
                                           <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                                              <Play className="w-5 h-5 text-white ml-1 fill-white" />
                                           </div>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2 block text-phase-menstrual/40">
                                                {article.category}
                                            </span>
                                            <h4 className="font-heading text-lg leading-tight line-clamp-2 drop-shadow-md">
                                                {article.title}
                                            </h4>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {showRight && (
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => scroll("right")} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-neutral-100 hover:bg-white hover:text-phase-menstrual hover:scale-110 transition-all hidden md:block opacity-0 group-hover/row:opacity-100 translate-x-4 group-hover/row:-translate-x-2"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Fade edge mask for desktop */}
                <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-[#FAF9F6] to-transparent pointer-events-none hidden md:block" />
            </div>
        </motion.div>
    );
};

export default function LearnPage() {
    const [articles, setArticles] = useState<LearnArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

    const categories = ["All", "Cycle Syncing", "PCOS", "Sexual Wellness", "Common Pathologies", "Skincare"];

    const cycleArticles = articles.filter(a => a.category === "Cycle Syncing");
    const pcosArticles = articles.filter(a => a.category === "PCOS");
    const sexualArticles = articles.filter(a => a.category === "Sexual Wellness");
    const pathologyArticles = articles.filter(a => a.category === "Common Pathologies");
    const skincareArticles = articles.filter(a => a.category === "Skincare");

    const featured = articles.length > 0 ? articles[0] : null;
    const featuredImage = featured ? getStorageUrl("learn-images", featured.image_path) : null;

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-rove-charcoal pb-4">
            <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none flex justify-between items-center transition-all">
                <Link href="/cycle-sync" className="pointer-events-auto inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/20 shadow-sm">
                    <ChevronLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
                </Link>

                <div className="pointer-events-auto bg-white/10 backdrop-blur-md rounded-full shadow-sm border border-white/20 p-1">
                    <ProfileAvatar />
                </div>
            </div>

            {featured ? (
                <div className="relative h-[85vh] w-full overflow-hidden" >
                    <div className="absolute inset-0 bg-neutral-900">
                        {featuredImage && (
                            <Image
                                src={featuredImage}
                                alt={featured.title}
                                fill
                                className="object-cover opacity-80"
                                priority
                                sizes="100vw"
                            />
                        )}
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-br from-purple-900 to-phase-menstrual/80" />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/20 to-black/40" />
                    
                    <div className="absolute bottom-16 left-0 p-6 md:p-16 w-full md:w-2/3 lg:w-[60%] space-y-5 z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-phase-menstrual/80 animate-pulse" /> Featured Series
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-heading text-white leading-[1.05] drop-shadow-lg tracking-tight"
                        >
                            {featured.title}
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="text-white/90 text-sm md:text-lg font-medium line-clamp-3 md:line-clamp-none drop-shadow-md max-w-xl leading-relaxed"
                        >
                            {featured.excerpt}
                        </motion.p>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="flex items-center gap-3 md:gap-4 pt-6"
                        >
                            <Link href={`/cycle-sync/learn/${featured.id}`}>
                                <button className="flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-full font-bold hover:bg-neutral-100 hover:scale-[1.02] transition-all shadow-xl shadow-black/10">
                                    <Play className="w-5 h-5 fill-black" /> Start Reading
                                </button>
                            </Link>
                            <button className="flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-bold hover:bg-white/20 transition-all">
                                <Bookmark className="w-5 h-5 md:mr-2" /> <span className="hidden md:block">Save</span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="h-[70vh] flex flex-col items-center justify-center text-neutral-400 bg-neutral-100 mb-10">
                    <PageGuide pageKey="learn" icon={Bookmark} title="Rove Library" description="Loading content..." />
                </div>
            )}

            <div className="relative z-10 -mt-8 pt-4 pb-4">
                {/* Category Filters */}
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 md:px-8 mb-12">
                  {categories.map(cat => {
                    const isActive = activeCategory === cat || (cat === "All" && !activeCategory);
                    return (
                        <button 
                          key={cat} 
                          onClick={() => setActiveCategory(cat === "All" ? null : cat)}
                          className={cn(
                              "px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all duration-300", 
                              isActive 
                                ? "bg-phase-menstrual text-white border-rose-500 shadow-md shadow-rose-500/20 scale-105" 
                                : "bg-white text-neutral-500 border-neutral-200 hover:border-phase-menstrual/40 hover:bg-phase-menstrual/10 hover:text-phase-menstrual"
                          )}
                        >
                           {cat}
                        </button>
                    )
                  })}
                </div>

                <div className="space-y-4">
                    {(!activeCategory || activeCategory === "Cycle Syncing") && <ContentRow title="Cycle Syncing" articles={cycleArticles} />}
                    {(!activeCategory || activeCategory === "PCOS") && <ContentRow title="PCOS" articles={pcosArticles} />}
                    {(!activeCategory || activeCategory === "Sexual Wellness") && <ContentRow title="Sexual Wellness" articles={sexualArticles} />}
                    {(!activeCategory || activeCategory === "Common Pathologies") && <ContentRow title="Common Pathologies" articles={pathologyArticles} />}
                    {(!activeCategory || activeCategory === "Skincare") && <ContentRow title="Skincare" articles={skincareArticles} />}
                </div>
            </div>

            {/* --- CREDITS / ATTRIBUTION FOOTER --- */}
            <footer className="mt-24 pt-12 pb-8 px-8 border-t border-neutral-200/60 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Image Credits & Attributions
                    </p>
                    <div className="text-[10px] text-neutral-400 space-y-1.5 font-medium">
                        <p>
                            Icons made by{' '}
                            <a
                                href="https://www.flaticon.com/authors/freepik"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-900 underline underline-offset-2 transition-colors"
                            >
                                Freepik
                            </a>{' '}
                            from{' '}
                            <a
                                href="https://www.flaticon.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-900 underline underline-offset-2 transition-colors"
                            >
                                www.flaticon.com
                            </a>
                        </p>
                        <p>
                            Icons made by{' '}
                            <a
                                href="https://www.flaticon.com/authors/pixel-perfect"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-900 underline underline-offset-2 transition-colors"
                            >
                                Pixel perfect
                            </a>{' '}
                            from{' '}
                            <a
                                href="https://www.flaticon.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neutral-900 underline underline-offset-2 transition-colors"
                            >
                                www.flaticon.com
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div >
    );
}
